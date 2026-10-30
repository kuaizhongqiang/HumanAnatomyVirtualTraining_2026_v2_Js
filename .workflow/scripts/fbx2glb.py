# Blender 无头脚本：FBX -> GLB（供 .workflow/scripts/convert-models.mjs 调用）
# 用法：blender -b --python fbx2glb.py -- <src.fbx> <dst.glb> <material-map.json> [tex_dir ...]
#
# 三件事：
# 1. 清空默认场景，避免 Cube/Camera/Light 混进 GLB
# 2. 按 Unity 材质表（ShaderGraph 属性 + .mat 槽位）重建材质：
#    贴图语义来自 .mat 的槽位（_BaseMap / _BaseNormalMap / _MaskMap），不是靠猜文件名
# 3. 导出 GLB 内嵌贴图，并把每个 mesh 的材质槽数写进报告（多维子材质核对）
import bpy
import os
import sys
import json

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
if len(argv) < 3:
    print("USAGE: fbx2glb.py -- <src.fbx> <dst.glb> <material-map.json> [tex_dir ...]")
    sys.exit(2)

src, dst, matmap_path = argv[0], argv[1], argv[2]
tex_dirs = [p for p in argv[3:] if p and not p.startswith(("out=", "base=", "normal=", "cap="))]
tex_out = next((p[4:] for p in argv[3:] if p.startswith("out=")), "")
# 默认保原分辨率（上游贴图以 2048² 为主，另有 4096² / 8192² 各一张）；
# 只有显式给 base=/normal= 才降采样。cap= 用于单独压掉那张 8K。
base_max = int(next((p[6:] for p in argv[3:] if p.startswith("base=")), "0"))
normal_max = int(next((p[8:] for p in argv[3:] if p.startswith("normal=")), "0"))
cap_max = int(next((p[4:] for p in argv[3:] if p.startswith("cap=")), "0"))
report_path = dst + ".report.json"

with open(matmap_path, "r", encoding="utf-8") as fp:
    MATMAP = json.load(fp)
MATERIALS = MATMAP.get("materials", {})

bpy.ops.wm.read_factory_settings(use_empty=True)

# 单位口径来自 Unity 的 fbx.meta：MaleBody.fbx.meta 里 useFileUnits=1 / globalScale=1，
# 即"按文件自身单位、不再额外缩放"，所以这里 global_scale=1（不是默认的 0.01）。
# 之前按 0.01 导出的模型只有 2cm 高，靠这一步改正。
bpy.ops.import_scene.fbx(filepath=src, global_scale=1.0)

objects = [o for o in bpy.data.objects]
meshes = [o for o in objects if o.type == "MESH"]


def find_texture(path):
    """材质表里给的是上游绝对路径；优先用原路径，找不到再按文件名在 tex_dirs 里找"""
    if not path:
        return None
    path = path.replace("\\", "/")
    if os.path.exists(path):
        return path
    base = os.path.basename(path).lower()
    for d in tex_dirs:
        if not os.path.isdir(d):
            continue
        for root, _dirs, files in os.walk(d):
            for f in files:
                if f.lower() == base:
                    return os.path.join(root, f)
    return None


def shrink(path, max_side, tag):
    """按需重编码贴图。

    max_side = 0 表示保原分辨率、只转 WebP（无损地保住细节，体积比 PNG 小很多）；
    给了 max_side 才降采样；cap= 只用于压掉个别 8K。
    法线图不能走 JPEG（会引入色彩块、破坏法线方向），所以统一 WebP。
    """
    if not tex_out:
        return path
    os.makedirs(tex_out, exist_ok=True)
    img = bpy.data.images.load(path, check_existing=False)
    w, h = img.size
    limit = max_side or cap_max
    if limit and max(w, h) > limit:
        scale = float(limit) / max(w, h)
        img.scale(max(1, int(w * scale)), max(1, int(h * scale)))
        w, h = img.size
    name = "%s_%s_%dx%d.webp" % (os.path.splitext(os.path.basename(path))[0], tag, w, h)
    out = os.path.join(tex_out, name)
    if not os.path.exists(out):
        # Blender 4.0 用 image.file_format 写 WebP 不稳定，改用场景设置 + 另存
        img.filepath_raw = out
        img.file_format = "WEBP"
        try:
            img.save()
        except Exception:
            img.file_format = "PNG"
            out = out.replace(".webp", ".png")
            img.filepath_raw = out
            img.save()
    bpy.data.images.remove(img)
    return out


def build_material(mat, spec):
    """按 Unity 槽位重建：baseColor(sRGB) → Base Color；normal(Non-Color) → NormalMap"""
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    out = nodes.new("ShaderNodeOutputMaterial")
    out.location = (600, 0)
    bsdf = nodes.new("ShaderNodeBsdfPrincipled")
    bsdf.location = (280, 0)
    links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])

    base = find_texture(spec.get("baseColor", ""))
    if base:
        base = shrink(base, base_max, "base")
        img = nodes.new("ShaderNodeTexImage")
        img.location = (-260, 160)
        img.image = bpy.data.images.load(base, check_existing=True)
        img.image.colorspace_settings.name = "sRGB"
        links.new(img.outputs["Color"], bsdf.inputs["Base Color"])
    else:
        col = spec.get("colors", {}).get("_BaseColor") or spec.get("colors", {}).get("_Color")
        if col:
            bsdf.inputs["Base Color"].default_value = (col[0], col[1], col[2], 1.0)

    nrm = find_texture(spec.get("normal", ""))
    if nrm:
        nrm = shrink(nrm, normal_max, "normal")
        nimg = nodes.new("ShaderNodeTexImage")
        nimg.location = (-260, -120)
        nimg.image = bpy.data.images.load(nrm, check_existing=True)
        nimg.image.colorspace_settings.name = "Non-Color"
        nmap = nodes.new("ShaderNodeNormalMap")
        nmap.location = (20, -120)
        links.new(nimg.outputs["Color"], nmap.inputs["Color"])
        links.new(nmap.outputs["Normal"], bsdf.inputs["Normal"])

    # 掩码贴图：Unity 侧用于高亮/SSS 混合，glTF 无对应语义，只记录不接线
    return {
        "baseColor": bool(base),
        "normal": bool(nrm),
        "maskInMap": bool(spec.get("mask")),
    }


applied = {}
for mat in bpy.data.materials:
    if not mat:
        continue
    key = mat.name.split(".")[0] if mat.name.split(".")[-1].isdigit() else mat.name
    spec = MATERIALS.get(mat.name) or MATERIALS.get(key)
    if not spec:
        continue
    try:
        applied[mat.name] = build_material(mat, spec)
        applied[mat.name]["shader"] = spec.get("shader", "")
    except Exception as exc:  # 单个材质失败不拖垮整次导出
        print("WARN material %s: %s" % (mat.name, exc))

# 每个 mesh 的材质槽数（多维子材质核对）
slots = {o.name: len([s for s in o.material_slots if s.material]) for o in meshes}
multi = {k: v for k, v in slots.items() if v > 1}

bpy.ops.export_scene.gltf(
    filepath=dst,
    export_format="GLB",
    use_selection=False,
    export_apply=True,
    export_yup=True,
    export_materials="EXPORT",
    # 贴图不内嵌：多精度档位由 build-texture-tiers.mjs 生成、页面按档位替换，
    # 内嵌会把 GLB 顶到 100MB+，首屏没法看（见 D-20261030-13）
    export_image_format="NONE",
)

triangles = 0
for o in meshes:
    o.data.calc_loop_triangles()
    triangles += len(o.data.loop_triangles)

report = {
    "src": os.path.basename(src),
    "dst": os.path.basename(dst),
    "objects": len(objects),
    "meshes": len(meshes),
    "triangles": triangles,
    "nodes": sorted(o.name for o in objects),
    "materials": sorted(m.name for m in bpy.data.materials if m),
    "materialsWired": applied,
    "meshSlots": slots,
    "multiMaterialMeshes": multi,
    "bytes": os.path.getsize(dst) if os.path.exists(dst) else 0,
}
with open(report_path, "w", encoding="utf-8") as fp:
    json.dump(report, fp, ensure_ascii=False, indent=2)

print("OK %s -> %s | objects=%d meshes=%d tris=%d materialsWired=%d multiMat=%d bytes=%d" % (
    os.path.basename(src), os.path.basename(dst), report["objects"], report["meshes"],
    report["triangles"], len(applied), len(multi), report["bytes"]))

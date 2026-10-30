#!/usr/bin/env node
/**
 * 解析 Unity 侧材质真相，生成 fbx→glb 用的贴图映射表。
 *
 * 要解决两件事：
 * 1) ShaderGraph 的贴图属性名（_BaseMap / _BaseNormalMap / _MaskMap…）—— 材质里存的是这些槽位，
 *    不知道属性语义就没法把它们接成 glTF 的 baseColor / normal / metallic-roughness。
 * 2) 每个 mesh 是不是多维子材质（多个 material slot）—— 决定 GLB 里 primitives 的数量与贴图归属。
 *
 * 数据来源（全部只读）：
 *   Assets/Shader/Model/*.shadergraph   —— 属性声明（在第二个 JSON 文档的 m_Nodes 里）
 *   Assets/Model/Male/Materials/*.mat   —— 材质 → shader guid、槽位 → 贴图 guid、颜色/浮点
 *   Assets/**.meta                      —— guid → 资产路径
 *   Assets/Prefabs/Model/MaleBody.prefab —— 每个 MeshRenderer 的材质列表（多维子材质核对）
 *
 * 输出：public/media/models/material-map.json（生成物，不入库）
 */
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';

const UPSTREAM = resolve('../HumanAnatomyVirtualTraining_2026_v1.1/Assets');
const OUT = resolve('public/media/models/material-map.json');

/** ShaderGraph 文件是「多个 JSON 文档拼接 + 尾部内容」，逐个解析顶层对象 */
function splitJsonDocs(text) {
  const docs = [];
  let i = 0;
  while (i < text.length) {
    while (i < text.length && /\s/.test(text[i])) i++;
    if (text[i] !== '{') break;
    const start = i;
    let depth = 0;
    let inStr = false;
    let esc = false;
    for (; i < text.length; i++) {
      const ch = text[i];
      if (inStr) {
        if (esc) esc = false;
        else if (ch === '\\') esc = true;
        else if (ch === '"') inStr = false;
        continue;
      }
      if (ch === '"') inStr = true;
      else if (ch === '{') depth++;
      else if (ch === '}') {
        depth--;
        if (depth === 0) {
          i++;
          break;
        }
      }
    }
    try {
      docs.push(JSON.parse(text.slice(start, i)));
    } catch {
      break;
    }
  }
  return docs;
}

/** 从 graph 文档里取属性：节点里带 m_Property 的那种 */
function shaderProperties(graphDoc) {
  const out = new Map();
  for (const node of graphDoc.m_Nodes ?? []) {
    const prop = node.m_Property;
    if (!prop) continue;
    const name = prop.m_Name ?? '';
    const ref = prop.m_OverrideReferenceName || prop.m_DefaultReferenceName || name;
    if (!ref) continue;
    out.set(ref, { name, ref, type: prop.m_Type });
  }
  return out;
}

/** guid → 资产路径（只扫模型与着色器目录，够用且快） */
function buildGuidIndex(roots) {
  const index = new Map();
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const p = join(dir, name);
      const st = statSync(p);
      if (st.isDirectory()) {
        walk(p);
      } else if (name.endsWith('.meta')) {
        const head = readFileSync(p, 'utf8').slice(0, 200);
        const m = head.match(/guid:\s*([0-9a-f]{32})/);
        if (m) index.set(m[1], p.slice(0, -5));
      }
    }
  };
  for (const r of roots) if (existsSync(r)) walk(r);
  return index;
}

/** Unity .mat：单行式 YAML，按段落取 m_TexEnvs / m_Colors / m_Floats / m_Shader */
function parseMat(file) {
  const text = readFileSync(file, 'utf8');
  const shader = text.match(/m_Shader:\s*\{[^}]*guid:\s*([0-9a-f]{32})/)?.[1] ?? '';

  const textures = {};
  const texBlock = text.split('m_TexEnvs:')[1]?.split('m_Ints:')[0] ?? '';
  // 槽位形如 `- _BaseMap:` 换行后跟 m_Texture；中间可能还有 m_Scale/m_Offset
  const texRe = /-\s+(_[A-Za-z0-9_]+):\s*\n\s*m_Texture:\s*\{fileID:\s*(-?\d+)(?:,\s*guid:\s*([0-9a-f]{32}))?/g;
  for (const m of texBlock.matchAll(texRe)) {
    const [, key, fileId, guid] = m;
    if (guid && fileId !== '0') textures[key] = guid;
  }

  const colors = {};
  const colorBlock = text.split('m_Colors:')[1]?.split('m_Floats:')[0] ?? '';
  for (const m of colorBlock.matchAll(/-\s+(_[A-Za-z0-9_]+):\s*\{r:\s*([\d.eE-]+),\s*g:\s*([\d.eE-]+),\s*b:\s*([\d.eE-]+),\s*a:\s*([\d.eE-]+)\}/g)) {
    colors[m[1]] = [Number(m[2]), Number(m[3]), Number(m[4]), Number(m[5])];
  }

  const floats = {};
  const floatBlock = text.split('m_Floats:')[1]?.split('m_Ints:')[0] ?? '';
  for (const m of floatBlock.matchAll(/-\s+(_[A-Za-z0-9_]+):\s*([-\d.eE]+)/g)) {
    floats[m[1]] = Number(m[2]);
  }

  return { name: basename(file, '.mat'), shader, textures, colors, floats };
}

/** prefab：每个 MeshRenderer 的材质列表长度（多维子材质核对用） */
function prefabMaterialSlots(file) {
  const text = readFileSync(file, 'utf8');
  const slots = [];
  for (const m of text.matchAll(/m_Materials:\n((?:\s*-\s*\{[^}]*\}\n)+)/g)) {
    const count = (m[1].match(/- \{/g) ?? []).length;
    slots.push(count);
  }
  return slots;
}

/* ---------------- 主流程 ---------------- */

const shaderDir = join(UPSTREAM, 'Shader/Model');
const shaderProps = {};
for (const f of existsSync(shaderDir) ? readdirSync(shaderDir).filter((x) => x.endsWith('.shadergraph')) : []) {
  const docs = splitJsonDocs(readFileSync(join(shaderDir, f), 'utf8'));
  const graph = docs.find((d) => Array.isArray(d.m_Nodes));
  shaderProps[basename(f, '.shadergraph')] = graph ? Object.fromEntries(shaderProperties(graph)) : {};
}

// 全 Assets 扫 guid：1000 个 .meta，很快；只扫子目录会漏掉 URP 内置材质与项目着色器
const guidIndex = buildGuidIndex([UPSTREAM]);

const matDir = join(UPSTREAM, 'Model/Male/Materials');
const materials = {};
for (const f of existsSync(matDir) ? readdirSync(matDir).filter((x) => x.endsWith('.mat')) : []) {
  const mat = parseMat(join(matDir, f));
  const shaderPath = guidIndex.get(mat.shader) ?? '';
  const shaderName = basename(shaderPath, '.shadergraph');
  const props = shaderProps[shaderName] ?? {};

  // 语义归类：按槽位名 + shader 属性类型判断
  const pick = (keys) => keys.map((k) => mat.textures[k]).filter(Boolean)[0];
  const baseColorGuid = pick(['_BaseMap', '_BaseColorMap', '_MainTex', '_AlbedoMap']);
  const normalGuid = pick(['_BaseNormalMap', '_BumpMap', '_NormalMap']);
  const maskGuid = pick(['_MaskMap', '_MetallicGlossMap', '_HighlightMask']);

  const resolveTex = (guid) => (guid ? (guidIndex.get(guid) ?? `(未找到 ${guid})`) : '');

  materials[mat.name] = {
    shader: shaderName,
    shaderRefs: Object.keys(props),
    baseColor: resolveTex(baseColorGuid),
    normal: resolveTex(normalGuid),
    mask: resolveTex(maskGuid),
    allSlots: Object.entries(mat.textures).map(([k, g]) => ({ slot: k, file: resolveTex(g) })),
    colors: mat.colors,
    floats: mat.floats,
  };
}

const prefab = join(UPSTREAM, 'Prefabs/Model/MaleBody.prefab');
const slotHistogram = {};
if (existsSync(prefab)) {
  for (const n of prefabMaterialSlots(prefab)) slotHistogram[n] = (slotHistogram[n] ?? 0) + 1;
}

const payload = {
  generatedAt: new Date().toISOString(),
  sources: {
    shaders: Object.keys(shaderProps).length,
    materials: Object.keys(materials).length,
    prefab: existsSync(prefab) ? 'MaleBody.prefab' : '(missing)',
  },
  shaderProperties: shaderProps,
  materials,
  /** MeshRenderer 材质槽数直方图：>1 即多维子材质 */
  prefabMaterialSlotHistogram: slotHistogram,
};

writeFileSync(OUT, JSON.stringify(payload, null, 2), 'utf8');

console.log('== 材质映射 ==');
console.log(`shadergraph ${payload.sources.shaders} 个，材质 ${payload.sources.materials} 个`);
for (const [name, m] of Object.entries(materials)) {
  const tex = [m.baseColor && 'base', m.normal && 'normal', m.mask && 'mask'].filter(Boolean);
  console.log(`  ${name.padEnd(26)} shader=${m.shader || '?'} 贴图=${tex.length ? tex.join('+') : '无'}`);
}
console.log('\nprefab 材质槽直方图（槽数: 网格数）:', slotHistogram);
console.log(`\n输出：${OUT}`);

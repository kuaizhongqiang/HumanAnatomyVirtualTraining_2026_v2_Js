import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { Go } from '../app';

/**
 * 模型预览页（实验/评审用，`?screen=model` 直达）：
 * 左侧模型清单与核对结果，右侧 three.js 视口。
 *
 * 这一页只做"看得见、对得上"：加载 glb、列节点、把 Unity prefab 核对结果并排显示。
 * 它不参与正式界面，也不进 `content` 屏的交互链路。
 */

interface ManifestModel {
  id: string;
  label: string;
  file: string;
  bytes: number;
  nodes: number;
  meshes: number;
  triangles: number;
  note?: string;
}

interface VerifyEntry {
  model: string;
  baseline: string;
  glbNodes: number;
  glbMeshes: number;
  glbMaterials: number;
  glbEmbeddedImages: number;
  bytes: number;
  prefabNodes?: number;
  matched?: number;
  missingCount?: number;
  extraCount?: number;
  missingInGlb?: string[];
  extraInGlb?: string[];
  dataObjectIds?: number;
  nodeLevelPicking?: boolean;
}

const MODELS = 'media/models/';
const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const esc = (v: string): string => v.replace(/[&<>"']/g, (c) => ESCAPES[c] ?? c);
const mb = (bytes: number): string => `${(bytes / 1024 / 1024).toFixed(1)} MB`;

export function mountModelPreview(host: HTMLElement, go: Go): void {
  let renderer: THREE.WebGLRenderer | null = null;
  let current: THREE.Object3D | null = null;
  let raf = 0;
  let autoRotate = true;
  let wireframe = false;
  let manifest: ManifestModel[] = [];
  let verify: VerifyEntry[] = [];
  let activeId = '';

  host.innerHTML = `
    <section class="screen screen--model" data-theme="dark">
      <aside class="model-panel">
        <div class="model-panel__head">
          <h1>模型导入核对</h1>
          <button class="btn btn--icon" data-act="back" title="返回">↩</button>
        </div>
        <p class="model-panel__hint">FBX → GLB（Blender 4.0.1），导出后与 Unity prefab / 数据契约逐节点核对。</p>
        <ul class="model-list" data-role="list"></ul>
        <div class="model-check" data-role="check"></div>
      </aside>
      <div class="model-stage">
        <div class="model-stage__tools">
          <button class="btn btn--ghost" data-act="rotate">自动旋转：开</button>
          <button class="btn btn--ghost" data-act="wire">线框：关</button>
          <button class="btn btn--ghost" data-act="reset">复位视角</button>
        </div>
        <div class="model-stage__stats" data-role="stats">加载清单中…</div>
        <div class="model-stage__canvas" data-role="canvas"></div>
      </div>
    </section>`;

  const listEl = host.querySelector<HTMLElement>('[data-role="list"]')!;
  const checkEl = host.querySelector<HTMLElement>('[data-role="check"]')!;
  const statsEl = host.querySelector<HTMLElement>('[data-role="stats"]')!;
  const canvasHost = host.querySelector<HTMLElement>('[data-role="canvas"]')!;

  /* ---------- three.js 基础 ---------- */
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a1420);

  const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 100);
  camera.position.set(0, 1.1, 2.6);

  const controls = new OrbitControls(camera, canvasHost);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.target.set(0, 1, 0);

  scene.add(new THREE.HemisphereLight(0xdfeaff, 0x101820, 2.2));
  const key = new THREE.DirectionalLight(0xffffff, 2.4);
  key.position.set(2, 3, 2);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0x88bbff, 0.9);
  fill.position.set(-2, 1.5, -1.5);
  scene.add(fill);

  const grid = new THREE.GridHelper(4, 20, 0x2f4a63, 0x1b2b3a);
  (grid.material as THREE.Material).transparent = true;
  (grid.material as THREE.Material).opacity = 0.7;
  scene.add(grid);

  const loader = new GLTFLoader();

  /* ---------- 贴图档位（GLB 只带几何与材质名，贴图按 512→1024→2048→原图 逐级替换） ---------- */
  interface TierEntry {
    native: number;
    source: string;
    tiers: Record<string, string>;
  }
  interface TextureTable {
    tiers: number[];
    materials: Record<string, Partial<Record<'base' | 'normal' | 'mask', TierEntry>>>;
  }

  let texTable: TextureTable | null = null;
  let tierText = '';
  const texLoader = new THREE.TextureLoader();
  const tierTimers: number[] = [];

  /** 取不超过 want 的最大档位（不放大） */
  function pickTier(entry: TierEntry, want: number): string | undefined {
    const sizes = Object.keys(entry.tiers)
      .map(Number)
      .filter((n) => n <= want)
      .sort((a, b) => b - a);
    const hit = sizes[0];
    return hit ? entry.tiers[String(hit)] : undefined;
  }

  /** 同一张图多材质共用：按 URL 缓存，避免重复解码（也避免误 dispose 掉别人还在用的贴图） */
  const texCache = new Map<string, THREE.Texture>();
  /** 每个材质当前挂的档位 URL，用来跳过重复赋值 */
  const appliedTier = new Map<string, Record<string, string>>();

  function getTexture(url: string, slot: 'base' | 'normal'): THREE.Texture {
    const cached = texCache.get(url);
    if (cached) return cached;
    const tex = texLoader.load(url);
    tex.flipY = false; // glTF 约定：几何 UV 已按 glTF 翻过
    tex.colorSpace = slot === 'base' ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    tex.anisotropy = 4;
    texCache.set(url, tex);
    return tex;
  }

  function applyTier(want: number): void {
    if (!current || !texTable) return;
    let applied = 0;
    current.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const raw of mats) {
        const mat = raw as THREE.MeshStandardMaterial;
        const spec = texTable?.materials[mat.name];
        if (!spec) continue;
        const done = appliedTier.get(mat.uuid) ?? {};
        for (const slot of ['base', 'normal'] as const) {
          const entry = spec[slot];
          if (!entry) continue;
          const url = pickTier(entry, want);
          if (!url || done[slot] === url) continue; // 已经挂过这一档
          const tex = getTexture(url, slot);
          if (slot === 'base') {
            mat.map = tex;
            // Unity 材质里 _BaseColor 常是黑色（颜色全靠贴图），glTF 会把它当 baseColorFactor
            // 与贴图相乘 → 整片发黑。挂上贴图后把 factor 复位成白色。
            mat.color.setRGB(1, 1, 1);
          } else {
            mat.normalMap = tex;
            mat.normalScale.set(1, 1);
          }
          mat.needsUpdate = true;
          done[slot] = url;
          applied++;
        }
        appliedTier.set(mat.uuid, done);
      }
    });
    const realTier = texTable.tiers.filter((t) => t <= want).pop() ?? want;
    tierText = `贴图 ${realTier}²（本次替换 ${applied} 张）`;
    paintStats();
  }

  /** 先上最低档保首屏，再在空闲时逐级升到原图 */
  function scheduleTiers(): void {
    tierTimers.forEach((id) => window.clearTimeout(id));
    tierTimers.length = 0;
    const steps: Array<[number, number]> = [
      [512, 0],
      [1024, 400],
      [2048, 1200],
      [4096, 2600],
    ];
    for (const [want, delay] of steps) {
      tierTimers.push(window.setTimeout(() => applyTier(want), delay));
    }
  }

  function resize(): void {
    const w = canvasHost.clientWidth;
    const h = canvasHost.clientHeight;
    if (!w || !h) return;
    renderer?.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  function animate(): void {
    raf = requestAnimationFrame(animate);
    if (current && autoRotate) current.rotation.y += 0.004;
    controls.update();
    renderer?.render(scene, camera);
  }

  function applyWireframe(): void {
    current?.traverse((o) => {
      const mesh = o as THREE.Mesh;
      const mat = mesh.material as THREE.MeshStandardMaterial | undefined;
      if (mat && 'wireframe' in mat) mat.wireframe = wireframe;
    });
  }

  function frame(obj: THREE.Object3D): void {
    const box = new THREE.Box3().setFromObject(obj);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxAxis = Math.max(size.x, size.y, size.z) || 1;
    const dist = maxAxis * 1.6;
    controls.target.copy(center);
    camera.position.set(center.x + dist * 0.6, center.y + maxAxis * 0.12, center.z + dist);
    camera.near = maxAxis / 200;
    camera.far = maxAxis * 40;
    camera.updateProjectionMatrix();
    controls.update();
    return void size;
  }

  function statsOf(obj: THREE.Object3D): { nodes: number; meshes: number; tris: number; maps: Set<string> } {
    let meshes = 0;
    let tris = 0;
    const maps = new Set<string>();
    const nodes = obj.children.length;
    obj.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      meshes++;
      const geo = mesh.geometry as THREE.BufferGeometry;
      const index = geo.getIndex();
      const pos = geo.getAttribute('position');
      tris += index ? index.count / 3 : (pos?.count ?? 0) / 3;
      const mat = mesh.material as THREE.MeshStandardMaterial;
      for (const key of ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap'] as const) {
        const tex = mat?.[key] as THREE.Texture | null | undefined;
        if (tex) maps.add(tex.name || tex.uuid);
      }
    });
    return { nodes, meshes, tris: Math.round(tris), maps };
  }

  let lastStats: {
    model: ManifestModel;
    st: { nodes: number; meshes: number; tris: number; maps: Set<string> };
    size: THREE.Vector3;
    names: string[];
  } | null = null;

  function paintStats(): void {
    if (!lastStats) return;
    const { model, st, size, names } = lastStats;
    statsEl.innerHTML = `
      <b>${esc(model.label)}</b> · ${mb(model.bytes)} · 节点 ${st.nodes} · 网格 ${st.meshes} ·
      三角面 ${st.tris.toLocaleString()} · 贴图 ${st.maps.size} 张 ·
      尺寸 ${size.x.toFixed(2)} × ${size.y.toFixed(2)} × ${size.z.toFixed(2)}（米）
      ${tierText ? `<span class="model-stage__tier">${esc(tierText)}</span>` : ''}
      <span class="model-stage__sample">${esc(names.slice(0, 4).join(' · '))}${names.length > 4 ? ' …' : ''}</span>`;
  }

  function loadModel(model: ManifestModel): void {
    activeId = model.id;
    paintList();
    statsEl.textContent = `加载 ${model.file} …`;
    loader.load(
      `${MODELS}${model.file}`,
      (gltf) => {
        if (current) {
          scene.remove(current);
          current.traverse((o) => {
            const mesh = o as THREE.Mesh;
            if (mesh.isMesh) {
              mesh.geometry.dispose();
              const mat = mesh.material as THREE.Material | THREE.Material[];
              if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
              else mat?.dispose();
            }
          });
        }
        current = gltf.scene;
        current.rotation.y = 0;
        scene.add(current);
        applyWireframe();
        frame(current);

        const st = statsOf(current);
        const box = new THREE.Box3().setFromObject(current);
        const size = box.getSize(new THREE.Vector3());
        const names = current.children.map((c) => c.name).filter(Boolean);
        lastStats = { model, st, size, names };
        paintStats();
        scheduleTiers(); // 贴图：先 512²，再逐级升到原图
      },
      undefined,
      (err) => {
        statsEl.innerHTML = `<span style="color:#ef6a5f">加载失败：${esc(String(err))}</span>`;
      },
    );
  }

  /* ---------- 清单与核对结果 ---------- */
  function paintList(): void {
    listEl.innerHTML = manifest
      .map(
        (m) => `<li><button class="model-item${m.id === activeId ? ' model-item--active' : ''}" data-act="pick" data-id="${esc(m.id)}">
          <span class="model-item__name">${esc(m.label)}</span>
          <span class="model-item__meta">${mb(m.bytes)} · ${m.nodes} 节点 · ${m.triangles.toLocaleString()} 面</span>
        </button></li>`,
      )
      .join('');
  }

  function paintCheck(): void {
    if (!verify.length) {
      checkEl.innerHTML = '<p class="model-check__none">没有核对报告（先跑 verify-models.mjs）。</p>';
      return;
    }
    checkEl.innerHTML = verify
      .map((v) => {
        const ok = (v.missingCount ?? 0) === 0 && (v.extraCount ?? 0) === 0;
        const badge = v.prefabNodes
          ? `<span class="model-check__badge ${ok ? 'is-ok' : 'is-warn'}">${ok ? '一致' : '有差异'}</span>`
          : '<span class="model-check__badge">分段网格</span>';
        const lines: string[] = [];
        if (v.prefabNodes) {
          lines.push(`prefab 节点 ${v.prefabNodes} / GLB 节点 ${v.glbNodes}，命中 ${v.matched}`);
          if (v.missingInGlb?.length) lines.push(`GLB 缺：${v.missingInGlb.join('、')}`);
          if (v.extraInGlb?.length) lines.push(`GLB 多：${v.extraInGlb.join('、')}`);
        } else {
          lines.push(`材质 ${v.glbMaterials} · 内嵌图 ${v.glbEmbeddedImages} · 数据体素 ${v.dataObjectIds ?? 0}`);
          lines.push('分系统 fbx 是合并网格，体素级点选要靠整体人体模型');
        }
        return `<div class="model-check__row">
          <div class="model-check__title"><code>${esc(v.model)}</code>${badge}</div>
          <div class="model-check__body">基线：${esc(v.baseline)}<br>${lines.map(esc).join('<br>')}</div>
        </div>`;
      })
      .join('');
  }

  host.addEventListener('click', (event) => {
    const el = (event.target as HTMLElement).closest<HTMLElement>('[data-act]');
    if (!el) return;
    const act = el.dataset.act;
    if (act === 'back') {
      go('start');
      return;
    }
    if (act === 'pick') {
      const hit = manifest.find((m) => m.id === el.dataset.id);
      if (hit) loadModel(hit);
      return;
    }
    if (act === 'rotate') {
      autoRotate = !autoRotate;
      el.textContent = `自动旋转：${autoRotate ? '开' : '关'}`;
      return;
    }
    if (act === 'wire') {
      wireframe = !wireframe;
      el.textContent = `线框：${wireframe ? '开' : '关'}`;
      applyWireframe();
      return;
    }
    if (act === 'reset') {
      if (current) frame(current);
    }
  });

  /* ---------- 启动 ---------- */
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  canvasHost.appendChild(renderer.domElement);
  resize();
  window.addEventListener('resize', resize);
  animate();

  const cleanup = (): void => {
    if (!host.isConnected) {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      renderer?.dispose();
      window.clearInterval(guard);
    }
  };
  const guard = window.setInterval(cleanup, 500);

  Promise.all([
    fetch(`${MODELS}manifest.json`).then((r) => (r.ok ? r.json() : { models: [] })),
    fetch(`${MODELS}verify-report.json`).then((r) => (r.ok ? r.json() : { results: [] })),
    fetch(`${MODELS}textures.json`).then((r) => (r.ok ? r.json() : null)),
  ])
    .then(([m, v, t]) => {
      manifest = (m as { models: ManifestModel[] }).models ?? [];
      verify = (v as { results: VerifyEntry[] }).results ?? [];
      texTable = (t as TextureTable | null) ?? null;
      if (!manifest.length) {
        statsEl.innerHTML = '<span style="color:#ef6a5f">没有模型清单：先跑 convert-models.mjs</span>';
        return;
      }
      paintList();
      paintCheck();
      loadModel(manifest[0]);
    })
    .catch((err) => {
      statsEl.innerHTML = `<span style="color:#ef6a5f">清单读取失败：${esc(String(err))}</span>`;
    });
}

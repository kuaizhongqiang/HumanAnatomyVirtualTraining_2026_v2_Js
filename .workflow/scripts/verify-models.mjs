#!/usr/bin/env node
/**
 * 导出后的核对：FBX → GLB 产物 vs Unity 侧事实（prefab 节点 / 数据契约 id）。
 *
 * 为什么单独一步：Blender 只保证"几何导出来了"，而 Unity 场景里的对象名、层级、
 * 变换与体素 id 的对应关系在 prefab 与 HumanBodyData.json 里。导出后必须回来对一遍，
 * 否则模型在网页里"看着对、点不中"。
 *
 * 用法：
 *   node .workflow/scripts/verify-models.mjs
 *   node .workflow/scripts/verify-models.mjs --glb public/media/models/MaleBody.glb --prefab <MaleBody.prefab>
 *
 * 输出：public/media/models/verify-report.json（不入库），控制台打摘要。
 */
import { existsSync, readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';

const UPSTREAM = resolve('../HumanAnatomyVirtualTraining_2026_v1.1/Assets');
const MODELS_DIR = resolve('public/media/models');
const REPORT = join(MODELS_DIR, 'verify-report.json');

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
};

/** 读 glb 的 JSON chunk，拿到 nodes / meshes / materials 名字 */
function readGlbJson(file) {
  const buf = readFileSync(file);
  if (buf.readUInt32LE(0) !== 0x46546c67) throw new Error(`${file} 不是 GLB（magic 不符）`);
  const chunkLength = buf.readUInt32LE(12);
  const chunkType = buf.readUInt32LE(16);
  if (chunkType !== 0x4e4f534a) throw new Error(`${file} 第一个 chunk 不是 JSON`);
  const json = JSON.parse(buf.subarray(20, 20 + chunkLength).toString('utf8'));
  return {
    nodes: (json.nodes ?? []).map((n) => n.name ?? '(unnamed)'),
    meshes: (json.meshes ?? []).map((m) => m.name ?? '(unnamed)'),
    materials: (json.materials ?? []).map((m) => m.name ?? '(unnamed)'),
    images: (json.images ?? []).length,
    bytes: buf.length,
  };
}

/** Unity prefab 里的节点名（m_Name 非空即为一个 GameObject） */
function readPrefabNames(file) {
  const text = readFileSync(file, 'utf8');
  const names = [];
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*m_Name:\s*(\S.*)$/);
    if (m && m[1].trim()) names.push(m[1].trim());
  }
  return [...new Set(names)];
}

/** HumanBodyData.json 里某性别的体素 id 全集 */
function readDataIds(gender = 'male') {
  const file = join(UPSTREAM, 'StreamingAssets/HumanBodyData.json');
  const data = JSON.parse(readFileSync(file, 'utf8'));
  const key = gender === 'female' ? 'femaleData' : 'maleData';
  const ids = [];
  for (const system of data[key].bodySystemDataList) {
    for (const obj of system.bodyObjDataList) ids.push({ id: obj.id, system: system.name, name: obj.name });
  }
  return ids;
}

const diff = (a, b) => a.filter((x) => !b.includes(x));

const results = [];

/* ---- 1) 整体人体：GLB 节点 vs MaleBody.prefab 节点 ---- */
const bodyGlb = arg('glb', join(MODELS_DIR, 'MaleBody.glb'));
const bodyPrefab = arg('prefab', join(UPSTREAM, 'Prefabs/Model/MaleBody.prefab'));

if (existsSync(bodyGlb) && existsSync(bodyPrefab)) {
  const glb = readGlbJson(bodyGlb);
  const prefabNames = readPrefabNames(bodyPrefab);
  const glbNames = glb.nodes.filter((n) => n !== '(unnamed)');
  const missing = diff(prefabNames, glbNames);
  const extra = diff(glbNames, prefabNames);
  results.push({
    model: basename(bodyGlb),
    baseline: basename(bodyPrefab),
    glbNodes: glb.nodes.length,
    glbMeshes: glb.meshes.length,
    glbMaterials: glb.materials.length,
    glbEmbeddedImages: glb.images,
    bytes: glb.bytes,
    prefabNodes: prefabNames.length,
    matched: prefabNames.length - missing.length,
    missingInGlb: missing.slice(0, 40),
    missingCount: missing.length,
    extraInGlb: extra.slice(0, 40),
    extraCount: extra.length,
  });
}

/* ---- 2) 分系统 GLB：节点 / 材质 vs 数据契约里的系统名 ---- */
const data = readDataIds(arg('gender', 'male'));
const systemNames = [...new Set(data.map((d) => d.system))];

for (const file of existsSync(MODELS_DIR) ? readdirSync(MODELS_DIR).filter((f) => f.endsWith('.glb')) : []) {
  if (file === basename(bodyGlb)) continue;
  const glb = readGlbJson(join(MODELS_DIR, file));
  const id = basename(file, '.glb');
  const hitSystem = systemNames.find((s) => s.toLowerCase() === id.toLowerCase());
  const idPrefix = hitSystem ? data.filter((d) => d.system === hitSystem).map((d) => d.id) : [];
  results.push({
    model: file,
    baseline: hitSystem ? `HumanBodyData.json · ${hitSystem}` : '(未匹配到系统)',
    glbNodes: glb.nodes.length,
    glbMeshes: glb.meshes.length,
    glbMaterials: glb.materials.length,
    glbEmbeddedImages: glb.images,
    bytes: glb.bytes,
    dataObjectIds: idPrefix.length,
    // 分系统 fbx 是整块合并网格，节点数通常为 1；这里如实记录，不当成"通过"
    nodeLevelPicking: glb.nodes.length > 1,
  });
}

const payload = { generatedAt: new Date().toISOString(), results };
writeFileSync(REPORT, JSON.stringify(payload, null, 2), 'utf8');

console.log('== 模型导出核对 ==');
for (const r of results) {
  if (r.prefabNodes) {
    console.log(
      `${r.model}: GLB ${r.glbNodes} 节点 / prefab ${r.prefabNodes} 节点 → 命中 ${r.matched}` +
        `，GLB 缺 ${r.missingCount}，GLB 多 ${r.extraCount}`,
    );
  } else {
    console.log(
      `${r.model}: ${r.glbNodes} 节点 / ${r.glbMeshes} 网格 / ${r.glbMaterials} 材质 / 内嵌图 ${r.glbEmbeddedImages}` +
        `；基线 ${r.baseline}`,
    );
  }
}
console.log(`\n报告：${REPORT}`);

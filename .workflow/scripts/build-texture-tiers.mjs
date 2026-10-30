#!/usr/bin/env node
/**
 * 生成多精度贴图（LOD）并写出贴图表。
 *
 * 为什么不在 GLB 里内嵌贴图：上游以 2048² 为主，还有 4096²/8192² 各一张，全量内嵌 GLB 到 100MB+，
 * 首屏没法看。改成「GLB 只带几何与材质，贴图按档位外挂」，页面先上 512²，空闲后逐级升到原图。
 *
 * 档位：512 / 1024 / 2048 / 原图（8192 限到 4096）
 * 编码：WebP（base 90 / normal 92 / mask 90）；法线不能用 JPEG，会破坏方向
 *
 * 用法：
 *   node .workflow/scripts/build-texture-tiers.mjs
 *   node .workflow/scripts/build-texture-tiers.mjs --force      # 覆盖已存在的档位
 *   node .workflow/scripts/build-texture-tiers.mjs --only Muscular_System
 */
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { basename, extname, join, resolve } from 'node:path';
import sharp from 'sharp';

const MODELS = resolve('public/media/models');
const OUT_ROOT = resolve('public/media/textures');
const MATERIAL_MAP = join(MODELS, 'material-map.json');
const OUT_JSON = join(MODELS, 'textures.json');

const TIERS = [512, 1024, 2048, 4096];
const CAP = 4096; // 8K 原图上限
const QUALITY = { base: 90, normal: 92, mask: 90 };

const args = process.argv.slice(2);
const force = args.includes('--force');
const onlyIndex = args.indexOf('--only');
const only = onlyIndex >= 0 ? args[onlyIndex + 1] : '';

if (!existsSync(MATERIAL_MAP)) {
  console.error('缺少 material-map.json：先跑 build-material-map.mjs');
  process.exit(1);
}

const map = JSON.parse(readFileSync(MATERIAL_MAP, 'utf8'));
const result = { generatedAt: new Date().toISOString(), tiers: TIERS, materials: {} };
let generated = 0;
let reused = 0;
const tierBytes = Object.fromEntries(TIERS.map((t) => [t, 0]));

// 页面里要按 HTTP 路径取图：vite 的 publicDir=public，所以 public/media/x 对应 /media/x
const rel = (abs) =>
  abs.replace(resolve('.'), '').replaceAll('\\', '/').replace(/^\/+/, '').replace(/^public\//, '');

for (const [material, spec] of Object.entries(map.materials ?? {})) {
  if (only && material !== only) continue;
  const entry = {};
  // material-map.json 里的键是 baseColor / normal / mask，档位表里统一叫 base / normal / mask
  const SLOT_KEY = { base: 'baseColor', normal: 'normal', mask: 'mask' };
  for (const slot of ['base', 'normal', 'mask']) {
    const src = spec[SLOT_KEY[slot]];
    if (!src || !existsSync(src)) continue;
    const meta = await sharp(src).metadata();
    const native = Math.min(CAP, Math.max(meta.width, meta.height));
    const dir = join(OUT_ROOT, material);
    mkdirSync(dir, { recursive: true });

    const files = {};
    for (const tier of TIERS) {
      if (tier > native) continue; // 不放大
      const name = `${slot}_${tier}.webp`;
      const out = join(dir, name);
      if (!force && existsSync(out)) {
        files[tier] = rel(out);
        tierBytes[tier] += statSync(out).size;
        reused++;
        continue;
      }
      await sharp(src)
        .resize(tier, tier, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: QUALITY[slot], effort: 4 })
        .toFile(out);
      files[tier] = rel(out);
      tierBytes[tier] += statSync(out).size;
      generated++;
    }
    // 原图档位（未被 cap 截断时就是 native）
    entry[slot] = { native, source: basename(src, extname(src)), tiers: files };
  }
  if (Object.keys(entry).length) result.materials[material] = entry;
}

writeFileSync(OUT_JSON, JSON.stringify(result, null, 2), 'utf8');

const mb = (b) => `${(b / 1024 / 1024).toFixed(2)} MB`;
console.log(`== 贴图档位 ==  生成 ${generated} 个，复用 ${reused} 个`);
for (const tier of TIERS) console.log(`  ${String(tier).padStart(4)}²  ${mb(tierBytes[tier])}`);
console.log(`\n材质表：${OUT_JSON}（${Object.keys(result.materials).length} 个材质）`);

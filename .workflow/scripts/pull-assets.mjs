#!/usr/bin/env node
/**
 * 从上游 Unity 工程把媒体资产复制到 public/media/（视频 / 图片 / 模型 / 贴图）。
 *
 * 为什么要脚本：public/media/ 已在 .gitignore 中整体忽略（体积大、且是上游交付物），
 * 换机或换目录后本地是空的，用它一次性补齐，保证「一条命令恢复到可运行状态」。
 *
 * 用法：
 *   node .workflow/scripts/pull-assets.mjs
 *   node .workflow/scripts/pull-assets.mjs --from ../HumanAnatomyVirtualTraining_2026_v1.1/Assets
 *   node .workflow/scripts/pull-assets.mjs --dry
 */
import { copyFileSync, existsSync, mkdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const args = process.argv.slice(2);
const dry = args.includes('--dry');
const fromIndex = args.indexOf('--from');
const UPSTREAM = resolve(
  fromIndex >= 0 && args[fromIndex + 1] ? args[fromIndex + 1] : '../HumanAnatomyVirtualTraining_2026_v1.1/Assets',
);
const OUT = resolve('public/media');

/** [上游相对路径, 本工程相对路径] */
const FILES = [
  ['Sprites/StartBg.png', 'ui/start/StartBg.png'],
  ['Sprites/LoadingBg.png', 'ui/loading/LoadingBg.png'],
  ['Sprites/Public/BaseBG.png', 'ui/common/BaseBG.png'],
  ['Sprites/Public/BlackBG.png', 'ui/common/BlackBG.png'],
  ['Sprites/Public/LightBG.png', 'ui/common/LightBG.png'],
  ['Sprites/Public/Round.png', 'ui/common/Round.png'],
  ['Sprites/Public/RoundRect.png', 'ui/common/RoundRect.png'],
  ['Sprites/UI/ICO_Quit_Normal.png', 'ui/icon/ICO_Quit_Normal.png'],
  ['Sprites/UI/ICO_Quit_Pressed.png', 'ui/icon/ICO_Quit_Pressed.png'],
  ['Sprites/UI/ICO_Quit_Selected.png', 'ui/icon/ICO_Quit_Selected.png'],
  ['Sprites/UI/ICO_Quit_Highlight.png', 'ui/icon/ICO_Quit_Highlight.png'],
  ['Sprites/UI/Title.png', 'ui/title/Title.png'],
  ['StreamingAssets/Video/StartVideo.mp4', 'video/StartVideo.mp4'],
];

/** 目录先建好：模型与贴图本轮还没有文件，但路径要存在（供后续 GLB / 贴图落地） */
const DIRS = ['ui/start', 'ui/loading', 'ui/common', 'ui/icon', 'ui/title', 'video', 'models', 'textures'];

const mb = (bytes) => `${(bytes / 1024 / 1024).toFixed(2)} MB`;

if (!existsSync(UPSTREAM)) {
  console.error(`上游不存在：${UPSTREAM}`);
  console.error('用 --from <Assets 目录> 指定上游 Unity 工程路径。');
  process.exit(1);
}

console.log(`上游：${UPSTREAM}`);
console.log(`目标：${OUT}${dry ? '（dry-run，不写盘）' : ''}\n`);

if (!dry) {
  for (const dir of DIRS) mkdirSync(join(OUT, dir), { recursive: true });
}

let copied = 0;
let skipped = 0;

for (const [src, dest] of FILES) {
  const from = join(UPSTREAM, src);
  const to = join(OUT, dest);
  if (!existsSync(from)) {
    console.warn(`  跳过（上游缺文件） ${src}`);
    skipped++;
    continue;
  }
  const size = statSync(from).size;
  if (!dry) {
    mkdirSync(dirname(to), { recursive: true });
    copyFileSync(from, to);
  }
  console.log(`  复制 ${dest.padEnd(34)} ${mb(size)}`);
  copied++;
}

console.log(`\n完成：${copied} 个文件${dry ? '（dry-run）' : ''}，跳过 ${skipped} 个。`);
console.log('提示：public/media/ 不入库；模型（glb）与贴图落地后仍在同一根目录下按系统分目录。');

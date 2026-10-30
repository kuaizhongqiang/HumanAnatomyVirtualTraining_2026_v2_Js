// 安装本地门禁 hook：把 .workflow/hooks/ 复制到 .git/hooks/
import { chmodSync, copyFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from './lib/util.mjs';

const from = join(ROOT, '.workflow', 'hooks');
const to = join(ROOT, '.git', 'hooks');

if (!existsSync(join(ROOT, '.git'))) {
  console.error('当前目录不是 git 仓库根，已中止');
  process.exit(1);
}
if (!existsSync(from)) {
  console.error('缺 .workflow/hooks/，已中止');
  process.exit(1);
}

mkdirSync(to, { recursive: true });
for (const name of readdirSync(from)) {
  const src = join(from, name);
  const dst = join(to, name);
  copyFileSync(src, dst);
  try {
    chmodSync(dst, 0o755);
  } catch {
    // Windows 上无意义，忽略
  }
  console.log(`installed .git/hooks/${name}`);
}
console.log('门禁 hook 已安装：pre-commit（全门禁）、commit-msg（提交说明）');

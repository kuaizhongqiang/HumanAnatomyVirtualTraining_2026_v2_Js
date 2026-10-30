// 门禁总闸：本地 hook 与 CI 共用同一入口，避免两套判定
// 用法：
//   node .workflow/scripts/gate-all.mjs                       # 提交前（文档配对 / 资产 / 台账）
//   node .workflow/scripts/gate-all.mjs --commit-msg <文件>    # 额外校验提交说明
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { ROOT } from './lib/util.mjs';

const argv = process.argv.slice(2);
const msgFlag = argv.indexOf('--commit-msg');
const msgFile = msgFlag >= 0 ? argv[msgFlag + 1] : null;

const tasks = [
  ['gate-doc-paths', []],
  ['gate-assets', []],
  ['gate-ledgers', []],
];
if (msgFile) tasks.push(['gate-commit-msg', [msgFile]]);

let failed = 0;
for (const [name, extra] of tasks) {
  try {
    execFileSync(process.execPath, [join(ROOT, '.workflow', 'scripts', `${name}.mjs`), ...extra], {
      cwd: ROOT,
      stdio: 'inherit',
    });
  } catch {
    failed += 1;
  }
}

if (failed > 0) {
  console.error(`\n门禁未通过：${failed} / ${tasks.length} 项失败（细则见 .workflow/README.md）`);
  process.exit(1);
}
console.log(`\n门禁全部通过（${tasks.length} 项）`);

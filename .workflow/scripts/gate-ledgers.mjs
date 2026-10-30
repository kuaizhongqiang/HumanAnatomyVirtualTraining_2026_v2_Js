// 门禁④台账：四份文件在位、五行头齐全、编号不重复、每条 D 三段齐全
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, makeReporter, readText } from './lib/util.mjs';

const REQUIRED = ['AGENT.md', 'docs/TODO.md', 'docs/RECORD.md', 'docs/DECISION.md'];
const FIVE_LINES = ['读者：', '类型：', '权威：', '状态：', '依赖：'];
const DECISION_PARTS = ['决定：', '影响：', '落地：'];

const reporter = makeReporter('gate-ledgers');

for (const f of REQUIRED) {
  const abs = join(ROOT, f);
  if (!existsSync(abs)) {
    reporter.fail(`${f}：缺文件`);
    continue;
  }
  const head = readText(abs).split(/\r?\n/).slice(0, 12).join('\n');
  for (const key of FIVE_LINES) {
    if (!head.includes(key)) reporter.fail(`${f}：五行头缺 "${key}"`);
  }
}

function assertUnique(file, pattern) {
  const abs = join(ROOT, file);
  if (!existsSync(abs)) return;
  const seen = new Map();
  for (const m of readText(abs).matchAll(pattern)) {
    seen.set(m[1], (seen.get(m[1]) ?? 0) + 1);
  }
  for (const [id, count] of seen) {
    if (count > 1) reporter.fail(`${file}：编号 ${id} 重复 ${count} 次`);
  }
}

assertUnique('docs/DECISION.md', /^### (D-\d{8}-\d{2})\b/gm);
assertUnique('docs/RECORD.md', /^\|\s*(R-\d{8}-\d{2})\s*\|/gm);
assertUnique('docs/TODO.md', /^\|\s*(T-\d{1,3})\s*\|/gm);

const decision = join(ROOT, 'docs/DECISION.md');
if (existsSync(decision)) {
  for (const block of readText(decision).split(/^### /m).slice(1)) {
    const id = (block.match(/^(D-\d{8}-\d{2})/) ?? ['', '(未知编号)'])[1];
    for (const part of DECISION_PARTS) {
      if (!block.includes(part)) reporter.fail(`docs/DECISION.md ${id}：缺 "${part}"`);
    }
  }
}

reporter.done();

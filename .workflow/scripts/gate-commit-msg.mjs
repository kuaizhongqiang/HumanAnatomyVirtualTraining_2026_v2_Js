// 门禁②提交说明：UTF-8 无 BOM，首行 "type(scope): 摘要"，type 受控，摘要 ≤ 72 字且不带句号
import { existsSync, readFileSync } from 'node:fs';
import { makeReporter } from './lib/util.mjs';

const TYPES = ['feat', 'fix', 'docs', 'chore', 'refactor', 'test', 'build', 'ci', 'revert'];
const MAX_SUBJECT = 72;

const file = process.argv[2];
if (!file || !existsSync(file)) {
  console.log('SKIP gate-commit-msg（未指定说明文件）');
  process.exit(0);
}

const reporter = makeReporter('gate-commit-msg');
const bytes = readFileSync(file);
if (bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
  reporter.fail('提交说明文件带 BOM，须存为 UTF-8 无 BOM');
}

const lines = bytes.toString('utf8').replace(/^\uFEFF/, '').split(/\r?\n/);
const kept = lines.filter((l) => !l.trimStart().startsWith('#'));
const firstIdx = kept.findIndex((l) => l.trim().length > 0);
const subject = firstIdx >= 0 ? kept[firstIdx].trim() : '';

if (!subject) {
  reporter.fail('提交说明为空');
} else if (!/^(Merge |Revert ")/.test(subject)) {
  const m = subject.match(/^([a-z]+)(\(([a-z0-9\-./]+)\))?: (.+)$/);
  if (!m) {
    reporter.fail(`首行不合规：应为 "type(scope): 摘要"，实际 "${subject}"`);
  } else {
    const [, type, , scope, desc] = m;
    if (!TYPES.includes(type)) reporter.fail(`type "${type}" 不在白名单：${TYPES.join(' / ')}`);
    if (scope && !/^[a-z0-9\-./]+$/.test(scope)) reporter.fail(`scope "${scope}" 只允许小写字母、数字、- . /`);
    if ([...desc].length > MAX_SUBJECT) reporter.fail(`摘要 ${[...desc].length} 字，超过 ${MAX_SUBJECT} 字上限`);
    if (/[。.！!；;]$/.test(desc)) reporter.fail('摘要结尾不带句号/叹号/分号');
  }
}

reporter.done();

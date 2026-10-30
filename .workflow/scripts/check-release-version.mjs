// 发版版本校验（不是 pre-commit 门禁，由 release 流水线在打 tag 前调用）
// 用法：node .workflow/scripts/check-release-version.mjs v0.0.0 [--allow-existing] [--allow-skip-start]
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, readText } from './lib/util.mjs';

const SEMVER = /^v(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
const START = 'v0.0.0';

const argv = process.argv.slice(2);
const version = (argv[0] ?? '').trim();
const allowExisting = argv.includes('--allow-existing');
const allowSkipStart = argv.includes('--allow-skip-start');

const errors = [];
const notes = [];

if (!version) errors.push('缺版本号参数，用法：check-release-version.mjs v<major>.<minor>.<patch>');
if (version && !SEMVER.test(version)) errors.push(`"${version}" 不是合法 tag：须形如 v0.0.0（无前导零、无预发布后缀）`);

const tags = execFileSync('git', ['tag', '-l', 'v*'], { cwd: ROOT, encoding: 'utf8' })
  .split(/\r?\n/)
  .map((t) => t.trim())
  .filter((t) => SEMVER.test(t));

const parse = (v) => v.slice(1).split('.').map(Number);
const cmp = (a, b) => {
  const [a1, a2, a3] = parse(a);
  const [b1, b2, b3] = parse(b);
  return a1 - b1 || a2 - b2 || a3 - b3;
};

if (SEMVER.test(version)) {
  if (tags.includes(version) && !allowExisting) {
    errors.push(`tag ${version} 已存在（补发/重跑请加 --allow-existing）`);
  }
  if (tags.length === 0) {
    if (version !== START && !allowSkipStart) {
      errors.push(`本仓库首个 tag 规定为 ${START}，实际传入 ${version}（确需跳号加 --allow-skip-start）`);
    }
  } else {
    const max = tags.sort(cmp)[tags.length - 1];
    if (cmp(version, max) <= 0 && !allowExisting) {
      errors.push(`${version} 未大于当前最大 tag ${max}，tag 必须单调递增`);
    } else {
      notes.push(`当前最大 tag ${max}`);
    }
  }
}

const pkg = join(ROOT, 'package.json');
if (existsSync(pkg)) {
  try {
    const pkgVersion = JSON.parse(readText(pkg)).version;
    if (pkgVersion && `v${pkgVersion}` !== version) {
      errors.push(`package.json version=${pkgVersion} 与 tag ${version} 不一致（发版 PR 必须同批改 version）`);
    }
  } catch (e) {
    errors.push(`package.json 解析失败：${e.message}`);
  }
} else {
  notes.push('package.json 未建立，跳过版本一致性校验');
}

for (const n of notes) console.log(`NOTE ${n}`);

if (errors.length > 0) {
  console.error('FAIL check-release-version');
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(`PASS check-release-version（${version}）`);

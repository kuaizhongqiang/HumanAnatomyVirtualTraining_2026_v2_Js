// 门禁脚本共用工具（零依赖，node ≥ 18）
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

export const ROOT = process.cwd();

/** 仓库相对路径，统一用 / 分隔 */
export function rel(p) {
  return relative(ROOT, p).split(sep).join('/');
}

export function git(...args) {
  return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
}

/** 已入库文件清单（git 视角，含改动已暂存的文件） */
export function trackedFiles() {
  return git('ls-files', '-z').split('\0').filter(Boolean);
}

export function walkDirs(base) {
  const out = [base];
  for (const name of readdirSync(base)) {
    const p = join(base, name);
    if (statSync(p).isDirectory()) out.push(...walkDirs(p));
  }
  return out;
}

export function filesIn(dir) {
  return readdirSync(dir)
    .map((n) => join(dir, n))
    .filter((p) => statSync(p).isFile());
}

export function readText(p) {
  return readFileSync(p, 'utf8').replace(/^\uFEFF/, '');
}

/** 统一 PASS/FAIL 输出；有失败则置退出码 1 */
export function makeReporter(name) {
  const errors = [];
  return {
    fail(msg) {
      errors.push(msg);
    },
    done() {
      if (errors.length) {
        console.error(`FAIL ${name}`);
        for (const e of errors) console.error(`  - ${e}`);
        process.exitCode = 1;
        return false;
      }
      console.log(`PASS ${name}`);
      return true;
    },
  };
}

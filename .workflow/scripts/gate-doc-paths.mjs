// 门禁①路径文档：src/ 下每个含源码的目录必须有 README.md，且首行为 "# Contract: <相对路径>"
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, filesIn, makeReporter, readText, rel, walkDirs } from './lib/util.mjs';

const SRC = join(ROOT, 'src');
const SRC_EXT = /\.(ts|tsx|js|mjs|cjs|css|html)$/i;

if (!existsSync(SRC)) {
  console.log('SKIP gate-doc-paths（src/ 尚未建立）');
  process.exit(0);
}

const reporter = makeReporter('gate-doc-paths');

for (const dir of walkDirs(SRC)) {
  const sources = filesIn(dir).filter((f) => SRC_EXT.test(f));
  if (sources.length === 0) continue;

  const relDir = rel(dir);
  const md = join(dir, 'README.md');

  if (!existsSync(md)) {
    reporter.fail(`${relDir}/：目录含源码但缺 README.md（应写 ${relDir}/README.md）`);
    continue;
  }

  const first = readText(md).split(/\r?\n/)[0].trim();
  const want = `# Contract: ${relDir}`;
  if (first !== want) {
    reporter.fail(`${relDir}/README.md：首行应为 "${want}"，实际 "${first}"`);
  }
}

reporter.done();

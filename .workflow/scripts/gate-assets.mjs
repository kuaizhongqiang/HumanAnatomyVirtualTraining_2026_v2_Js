// 门禁③资产：原始工程/中间格式不入库、生成物目录不入库、单文件不超 git 硬限
import { existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, makeReporter, trackedFiles } from './lib/util.mjs';

const SOURCE_EXTS = /\.(blend|blend1|max|psd|psb|fbx|ztl|spp|sbsar|c4d|ma|mb)$/i;
const OUT_DIRS = [/^dist\//, /^release\//, /^node_modules\//, /^\.vite\//, /^coverage\//];
const HARD_LIMIT = 95 * 1024 * 1024;

const reporter = makeReporter('gate-assets');

for (const f of trackedFiles()) {
  if (SOURCE_EXTS.test(f)) {
    reporter.fail(`${f}：原始工程/中间格式不入库（入库的应是转换后的 glb）`);
  }
  if (OUT_DIRS.some((re) => re.test(f))) {
    reporter.fail(`${f}：生成物目录不入库（忽略链见 .gitignore）`);
  }
  const abs = join(ROOT, f);
  if (existsSync(abs)) {
    const size = statSync(abs).size;
    if (size > HARD_LIMIT) {
      reporter.fail(`${f}：${(size / 1024 / 1024).toFixed(1)}MB，超过 95MB，git 将拒收（需改用 Git LFS）`);
    }
  }
}

reporter.done();

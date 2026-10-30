# RECORD — 提交台账

读者：AI
类型：提交台账（只追加）
权威：已进入仓库的提交的唯一台账；待办见 `TODO.md`，拍板见 `DECISION.md`
状态：2026-10-30 建立，记 7 条
依赖：`AGENT.md` §4（提交纪律）、`docs/repo.md`（未建，仓库事实）

## 1 写法

- 只追加、不改旧条；**一条 = 一次逻辑变更**，不把无关改动并进同一条。
- 编号 `R-YYYYMMDD-NN` 递增，不复用、不回收；日期取提交日。
- 版本列写仓库与号：`cs:N`（Plastic）/ `rN`（SVN）/ 短 hash（git）；多仓同批成对写全。
- 只写"改了什么、落在哪个版本号、动了哪些路径"；不写待办、不写拍板理由（各归 `TODO.md` / `DECISION.md`）。
- 提交后先按 `AGENT.md` §4 回读原始字节复核，再落本表。

## 2 台账

| 编号 | 日期 | 版本 | 变更 | 涉及路径 |
|---|---|---|---|---|
| R-20261030-01 | 2026-10-30 | git `1067331`（main） | 建立唯一手册 `AGENT.md` 与指针 `CODEBUDDY.md`；建三份台账；录需求原件；落账 `D-20261030-01`～`07` | `AGENT.md`、`CODEBUDDY.md`、`docs/TODO.md`、`docs/RECORD.md`、`docs/DECISION.md`、`docs/requirement/raw/origin.md` |
| R-20261030-02 | 2026-10-30 | git `b29e27e`（main） | 建 `.workflow/`（四道门禁 ＋ hook ＋ 模板）、`.github/`（ci / release / 协作模板）、`.agent/`（4 技能）、`.gitignore`；落账 `D-20261030-08` | `.workflow/`、`.github/`、`.agent/`、`.gitignore`、`AGENT.md`、`docs/TODO.md`、`docs/DECISION.md` |
| R-20261030-03 | 2026-10-30 | 分支 `chore/release-lanes`：`5f88459`、`225b8f9`、`1bd48c9` ＋ 文档提交；经 `--no-ff` 合并入 `main`（合并提交见 `main` 顶端） | 两条通道（`release.yml` 自动打 tag、`ci.yml` PR 标题门禁、`check-release-version.mjs`）、禁止直接提交红线、根 `README`、七份内容文档全量落地；落账 `D-20261030-09`、`D-20261030-10` | `.github/`、`.workflow/`、`.agent/`、`docs/`、`AGENT.md`、`README.md` |
| R-20261030-04 | 2026-10-30 | git `c84159e`（main，合并提交） | 依「哈希补记另起一条」补记 `R-20261030-03` 的合并提交：`chore/release-lanes` 以 `--no-ff` 合入 `main`；当时 PR 通道因 GitHub MCP 凭据失效未能使用 | `docs/RECORD.md` |
| R-20261030-05 | 2026-10-30 | 分支 `chore/gh-lane`（哈希见本 PR 合并提交） | PR 通道改用 `gh`：`AGENT.md` §5 增 PR/GitHub 命令区、`.workflow/README.md` §3 与 §5.1 补 `gh pr create/checks/merge`、`repo-commit`／`gate-triage`／`release` 三个技能改为 `gh` 口径 | `AGENT.md`、`.workflow/README.md`、`.agent/skills/`、`docs/RECORD.md` |
| R-20261030-06 | 2026-10-30 | PR #1 `f713606`、PR #2 `3ce5901`；保护配置提交见本 PR | PR 通道实跑两例（`gh`）；仓库转 public 后开启 `main` 分支保护并把配置入库（`.workflow/branch-protection.json`），红线变硬约束；`T-12`、`T-14` 完成删条；补记 PR #2 的台账欠账 | `docs/repo.md`、`docs/TODO.md`、`docs/progress.md`、`.workflow/branch-protection.json`、`AGENT.md`、`.workflow/README.md` |
| R-20261030-07 | 2026-10-30 | 分支 `feat/scaffold-ui-mockup`（哈希见本 PR 合并提交） | 工程脚手架（`vite`＋`ts` strict＋`vitest`＋`eslint`，四个脚本全绿）与 UI mockup（外壳 ＋ 明暗双主题 ＋ 中英双语 ＋ 采样数据 ＋ 7 例测试）；`T-2`、`T-10` 完成，`T-9` 收口为 `T-16` | `package.json`、`tsconfig.json`、`vite.config.ts`、`vitest.config.ts`、`eslint.config.js`、`index.html`、`src/`、`AGENT.md`、`docs/` |

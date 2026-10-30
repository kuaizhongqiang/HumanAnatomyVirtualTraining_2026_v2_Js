# progress — 已完成能力索引

读者：AI
类型：进度索引（只读性质，事实以 `RECORD.md` 为准）
权威：已完成能力的一页索引；提交事实查 `RECORD.md`，未做的事查 `TODO.md`
状态：2026-10-30 建立；只有 M0 基建完成，业务源码未开始
依赖：`RECORD.md`、`TODO.md`、`overview.md` §5（阶段）

## 1 已完成（M0 基建）

| 能力 | 判据 / 证据 |
|---|---|
| 唯一纪律手册 `AGENT.md` | 三级分工、三份台账、红线、git 纪律齐备 |
| 指针文件 `CODEBUDDY.md` | 只有一行指向，无独立内容 |
| 三份台账 | `TODO.md`（含 §4 待拍板唯一清单）、`RECORD.md`、`DECISION.md` 均按「只追加 / 只记一件事」运行 |
| 需求落账 | `requirement/raw/origin.md` 原件入库，口径转 `D-20261030-03`～`07` |
| 四道门禁 | `gate-doc-paths` / `gate-commit-msg` / `gate-assets` / `gate-ledgers`，`gate-all` 总闸；正负向均已实跑 |
| 本地 hook | `install-hooks.mjs` 装 `pre-commit` / `commit-msg`，与 CI 同源 |
| CI | `.github/workflows/ci.yml`：门禁 ＋ 条件构建（PR 时还校验 PR 标题） | 已在 `main` 实跑两次成功（`41005680240`、`41006666261`，各 24s） |
| PR 通道 | 用 `gh` 开 PR / 看 checks / 合并（GitHub MCP 凭据失效，不作为通道） | `AGENT.md` §5、`.workflow/README.md` §5.1 |
| 分支保护 | `main` 只接受 PR、必须过 `门禁`＋`构建`、禁 force push；配置即代码 | `.workflow/branch-protection.json`、`docs/repo.md` §2 |
| 发版通道 | `.github/workflows/release.yml`：`release/v*` PR 合并 → 校验版本 → 自动打 tag → 构建 → publish；`check-release-version.mjs` 已自测四种输入 |
| 两条通道与 tag 规则 | `D-20261030-09`；tag 从 `v0.0.0` 起、严格递增、与 `package.json` 一致 |
| 禁止直接提交 | `D-20261030-10`；`AGENT.md` §4 红线 ＋ 根 `README.md` 明写 |
| Agent 技能 | `.agent/skills/`：`repo-commit` / `gate-triage` / `anatomy-migrate` / `release` |
| 文档齐备 | `docs/` 七份内容文档 ＋ 三份台账 ＋ 数据规模实算（`business.md` §3） |
| 工程脚手架 | `vite` ＋ `ts`（strict）＋ `vitest` ＋ `eslint`；`build` / `typecheck` / `lint` / `test` 四项本地全绿 | `package.json`、`tsconfig.json`、`vite.config.ts` |
| UI mockup | 全幅场景 ＋ **悬浮毛玻璃面板**（顶栏 / 系统树 / 详情 / AI 对话）：`blur+saturate+brightness` 基底、跟随指针的镜面高光、多层 `inset` 内发光与 ±1px 色散；明暗双主题 ＋ 中英切换（`?theme=` 可直看） | `src/ui/shell.css`、`docs/architecture.md` §2.5 |
| 数据采样 | 从上游抽取每系统 2 项、描述截断，含结构断言测试（3 例） | `src/data/sample/human-sample.json` |
| 媒体资产根 | 视频/图片/模型/贴图统一 `public/media/` 且**不入库**，`pull-assets.mjs` 一条命令从上游恢复（13 个文件 / 约 50MB） | `.workflow/scripts/pull-assets.mjs`、`docs/structure.md` §3 |
| 设计样张 | `docs/design/`：令牌规范页 ＋ 三屏 9 幕合屏 ＋ 8 个面板逐节解剖 ＋ 覆盖矩阵 ＋ 17 张 1920×1080 预览 ＋ 重渲脚本 | `docs/design/README.md` |

## 2 未完成（指针）

工程脚手架、数据层、渲染交互、UI 与双语、AI、首版发版——见 `TODO.md`（`T-2`～`T-12`）；待拍板见 `TODO.md` §4。

## 3 维护约定

- 新完成一项能力：从 `TODO.md` 删条 → 本表加一行（判据写可验证的） → `RECORD.md` 记提交。
- 本表只索引，不复述实现细节；细节在被指向的文档里。

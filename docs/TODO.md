# TODO — 人体解剖学知识仿真实训软件（2026 v2 / JS 版）

读者：AI
类型：待办清单（唯一清单）
权威：本工程「还没做 / 建议做」的唯一台账；已完成能力见 `progress.md`（未建），已拍板见 `DECISION.md`，已提交见 `RECORD.md`
状态：2026-10-30 建立；同日按需求原件 `requirement/raw/origin.md` 清空 §4（原 `P-1`～`P-5` 全部拍板，见 `DECISION.md` `D-20261030-03`～`07`）并重排待办；同日流程基建落地（`.workflow/` `.github/` `.agent/`），删除已完成的原 `T-3`（`.gitignore`）、`T-4`（`.workflow/`），新增 `T-12`、`T-13`
依赖：`AGENT.md`（纪律与索引）、`../HumanAnatomyVirtualTraining_2026_v1.1`（上游只读事实源）

## 1 写法

- 只记**还没做 / 建议做**的事；做完即在同一批提交里**删掉**该条，不保留"已完成"字样（已完成能力写 `progress.md`）。
- 不写缘由、不写提交号、不写拍板结论（拍板去 `DECISION.md`，提交去 `RECORD.md`）。
- 一条一行、动词开头、可验收；编号 `T-n` 递增，不复用、不回收。
- **§4 是待拍板唯一清单**；拍板后从 §4 删除该行，并在 `DECISION.md` 追加 `D-…`。

## 2 工程基线

| 编号 | 事项 | 判据 / 依赖 |
|---|---|---|
| T-1 | 按 `AGENT.md` §2 清单建 `docs/` 其余文档：`README.md`、`overview.md`、`structure.md`、`repo.md`、`architecture.md`、`business.md`、`progress.md` | 每份带五行头，只写自己那一层不复述 |
| T-2 | 建构建 / 开发 / 检查 / 测试入口（`package.json`、`vite.config.ts`、`tsconfig.json`、lint、测试），落盘后回写 `AGENT.md` §5 | `D-20261030-03` |
| T-5 | 补 `README.md` 项目说明（当前仅一行标题） | 与 `docs/overview.md` 不重复 |
| T-6 | 盘出上游 `StreamingAssets` 三份 JSON 的完整字段字典并落 `docs/business.md` | 现只有 `AGENT.md` §3 的口径摘要 |
| T-12 | 确认 GitHub Actions 首次运行通过（`ci` 的 `gates` job 绿） | 需先推送 `.github/workflows/ci.yml` |
| T-13 | 视需要在 `.codebuddy/skills/` 建自动发现入口（当前技能在 `.agent/skills/`，须显式指向） | `.agent/README.md` §3 |

## 3 开发待办（按域）

| 编号 | 事项 | 判据 / 依赖 |
|---|---|---|
| T-7 | 按 `AGENT.md` §3 映射表迁移上游七域到 `src/`（`api` `data` `control` `obj` `camera` `ui` `manager`），每目录一份 `README.md` | `D-20261030-06`、T-2 |
| T-8 | 调研 three.js 对次表面散射（SSS，皮肤/内脏材质）的支持与可行实现，结论落 `docs/architecture.md` | 需求原件「SSS 材质」条 |
| T-9 | UI 重设计：明暗双主题走一套 token | `D-20261030-06`、`AGENT.md` §3「表现层两条硬口径」 |
| T-10 | 中英双语字典与运行时切换 | 同上 |
| T-11 | AI 对话最小实现（单通道请求/响应 ＋ 会话历史） | `D-20261030-07` |

## 4 待拍板唯一清单（拍板后删行并记入 `DECISION.md`）

（空：原 `P-1`～`P-5` 已全部拍板，见 `DECISION.md` `D-20261030-03`～`07`）

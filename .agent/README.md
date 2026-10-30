# .agent — Agent 技能包

读者：AI
类型：技能索引
权威：本工程 agent 技能的索引与加载约定；纪律在 `AGENT.md`，流程与门禁判定在 `.workflow/README.md`
状态：2026-10-30 建立，4 个技能（`repo-commit` / `gate-triage` / `anatomy-migrate` / `release`）
依赖：`AGENT.md`、`.workflow/README.md`、`docs/TODO.md`（当前待办）

## 1 技能是什么、不是什么

- 技能只写**怎么做**（步骤、判据、坑）；**不做**纪律的二次表述——纪律只有 `AGENT.md` 一份。
- 技能不复制门禁判定表，只指向 `.workflow/scripts/gate-*.mjs`；判定改了不需要改技能。
- 一个技能一个目录：`.agent/skills/<name>/SKILL.md`（YAML frontmatter：`name` ＋ `description`）。

## 2 清单

| 技能 | 何时用 | 主要产出 |
|---|---|---|
| `repo-commit` | 一次任务做完要提交 / 推送时 | 门禁全绿 ＋ 台账三件收尾 ＋ 合规提交说明 |
| `gate-triage` | `gate-all.mjs` 报 FAIL、CI 门禁红了 | 定位是哪道门禁、按判据修，而不是绕 |
| `anatomy-migrate` | 把上游 Unity v1 的数据/功能/三维素材搬到 `src/` | 域对照表 ＋ 该路径 `README.md` ＋ 可运行模块 |
| `release` | 要出 web 包或 Windows 桌面版 | tag ＋ CI 产物（`dist/` / `release/`） |

## 3 加载约定

- 触发条件写在每个 `SKILL.md` 的 `description` 里，按需读单份，不预读全部。
- CodeBuddy 的自动发现路径是 `.codebuddy/skills/`；本仓库把技能放在 `.agent/skills/` 以便与 `.workflow/` 同构，因此**需在对话中显式指向**（`AGENT.md` §2 已登记该路径）。若后续要自动发现，另建 `.codebuddy/skills/` 软链或副本，并在 `AGENT.md` §2 同步登记——不要两边各写一份正文。

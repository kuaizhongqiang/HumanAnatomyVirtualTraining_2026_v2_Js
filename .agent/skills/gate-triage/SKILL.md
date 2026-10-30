---
name: gate-triage
description: This skill should be used when the repository gates fail - locally via .workflow/scripts/gate-all.mjs, in the pre-commit hook, or in the GitHub ci workflow - to locate which gate rejected the change and fix the cause instead of bypassing it.
---

# 门禁失败排查

## 何时用

`gate-all.mjs` 报 `FAIL`、pre-commit 拦截提交、或 `.github/workflows/ci.yml` 的 `gates` job 红。

## 四道门禁与修法

| 输出 | 判据 | 修法 |
|---|---|---|
| `FAIL gate-doc-paths` | `src/` 下含源码的目录缺 `README.md`，或首行不是 `# Contract: <相对路径>` | 在该目录补 `README.md`（`Role` / `Files` / `Exports` / `Notes` 四项），首行路径与目录一致 |
| `FAIL gate-commit-msg` | 首行不是 `type(scope): 摘要`、`type` 不在白名单、摘要 > 72 字、结尾带句号、文件带 BOM | 按 `.workflow/templates/commit-message.md` 重写说明文件 |
| `FAIL gate-assets` | 入库了 `*.blend/max/psd/fbx` 等原始工程、`dist/` `release/` `node_modules/` 被跟踪、单文件 > 95MB | 撤出暂存 `git rm --cached <路径>`；原始工程转 `glb` 再入库；产物加 `.gitignore` |
| `FAIL gate-ledgers` | 缺 `AGENT.md` 或三份台账、五行头缺项、`D-`/`R-`/`T-` 编号重复、某条 `D-` 缺 决定/影响/落地 | 补台账；编号顺延不复用；每条 `D-` 三段齐全 |

## 步骤

1. 单跑失败的那道门禁拿到完整清单：`node .workflow/scripts/gate-doc-paths.mjs`（替换为对应脚本）。
2. 按上表修**成因**，不改门禁脚本本身；确认脚本判据过严时，先改 `.workflow/README.md` 的判定表再改脚本（同批）。
3. 全量复跑：`node .workflow/scripts/gate-all.mjs --commit-msg .git/commit-msg.txt`。
4. CI 侧红了先看具体 job 与日志：`gh pr checks` → `gh run view <run-id> --log-failed`（GitHub MCP 不可用，用 `gh`）。

## 不要做

- 不要用 `--no-verify` 通过；不要在 CI 里加 `continue-on-error` 掩盖。
- 不要为了过 `gate-assets` 把大文件删库了事——先确认它是不是业务素材，是则走 `glb` 转换（`D-20261030-03`）。

---
name: repo-commit
description: This skill should be used when a task in this repository is finished and needs to be committed or pushed - it runs the gates, closes the three ledgers (TODO / RECORD / DECISION) and produces a compliant Chinese commit message file.
---

# 任务收尾提交

## 何时用

一次逻辑变更做完，准备 `git commit`；或用户说"提交 / 收尾 / 推上去"。

## 步骤

1. **清点改动**：`git status --short`。只提交本次逻辑变更涉及的路径，禁止 `git add -A`。
2. **补路径文档**：`src/` 内改动过的目录，同批更新其 `README.md` 的 `Files` / `Exports` / `Notes`（格式见 `AGENT.md` §3）。
3. **台账三件**（同批，缺一视为未完成）：
   - `docs/TODO.md`：删掉本次做完的条目（不保留"已完成"）；
   - `docs/RECORD.md`：追加 `R-YYYYMMDD-NN`，版本列写 `git <短哈希>`；
   - 有负责人新拍板 → `docs/DECISION.md` 追加 `D-YYYYMMDD-NN`（决定 / 影响 / 落地三段）。
4. **写说明文件**：按 `.workflow/templates/commit-message.md` 写到 `.git/commit-msg.txt`（UTF-8 **无 BOM**）。
5. **跑门禁**：`node .workflow/scripts/gate-all.mjs --commit-msg .git/commit-msg.txt`，必须全绿。
6. **提交推送（禁止落到 main）**：
   ```powershell
   git switch -c feat/<主题>            # 或 fix/ docs/ chore/ release/vX.Y.Z
   git add <具体路径>
   git commit -F .git/commit-msg.txt
   git push -u origin <分支>
   ```
7. **开 PR（用 `gh`，不用 GitHub MCP）**：
   ```powershell
   gh pr create --base main --head <分支> --title "<type>(<scope>): <摘要>" --body-file .github/pull_request_template.md
   gh pr checks --watch                 # 等 ci 的 gates job 绿
   gh pr merge <编号> --merge --delete-branch
   ```
   - 标题即 `type(scope): 摘要`（squash 合并时就是提交说明，`ci` 会校验）。
   - **GitHub MCP 凭据无效**，一律走 `gh`（本机已登录 `kuaizhongqiang`）。
8. **回读复核**：`git log -1 --format=%B`，确认中文未损坏；合并后把真实短哈希补进 `docs/RECORD.md` 的版本列。
   - 哈希只能事后知道，故补记行**另起一条 `R-…`**（台账只追加，不改旧条）；**纯台账补记提交不再为自己登行**（避免递归）。

## 坑

- **直接 `git push origin main` 是严重违规**（`AGENT.md` §4、`D-20261030-10`）：agent 的产出永远是「已推送的分支 + PR」，不是「已推到 main」。
- 中文直接进 `-m` 会编码损坏：说明一律走文件 + `-F`。
- 控制台回显不可信（本机 ACP=936）：以 `git log --format=%B` 的 UTF-8 结果为准。
- `gate-commit-msg` 会拦 BOM：用工具写文件时确认首字节不是 `EF BB BF`。
- 门禁失败就修，`--no-verify` 须先经负责人同意并在说明里写原因。

# .workflow — 流程、门禁与发布

读者：AI
类型：流程细则（本地操作层）
权威：本地流程 / 门禁 / 发布的唯一细则；纪律在 `AGENT.md`，远端流水线在 `.github/`，工程内容在 `docs/`
状态：2026-10-30 建立；门禁四道已可用，`vite` / `electron` 相关命令随工程脚手架（`docs/TODO.md` `T-2`）落地后补
依赖：`AGENT.md`（`§4` 提交纪律、`§5` 命令）、`.workflow/scripts/gate-all.mjs`（唯一门禁入口）

## 1 目录职责

| 路径 | 放什么 | 不许放什么 |
|---|---|---|
| `scripts/gate-*.mjs` | 可执行的判定逻辑（零依赖，node ≥ 18） | 业务代码、需要 `npm install` 的依赖 |
| `scripts/install-hooks.mjs` | 把 `hooks/` 装到 `.git/hooks/` | — |
| `scripts/pull-assets.mjs` | 从上游 Unity 工程把视频 / 图片 / 模型 / 贴图复制到 `public/media/`（该目录不入库） | 手工零散把素材塞进别的目录 |
| `hooks/` | `pre-commit`、`commit-msg` 两个 sh 包装，只调用 `scripts/` | 判定逻辑（逻辑只写一份） |
| `templates/` | 提交说明等模板 | 待办 / 拍板（归 `docs/`） |

## 2 门禁四道（本地与 CI 同源）

| # | 脚本 | 判据 | 失败怎么修 |
|---|---|---|---|
| ① | `gate-doc-paths.mjs` | `src/` 下每个含源码的目录必须有 `README.md`，首行 `# Contract: <相对路径>` | 补该目录 `README.md`，四项写全（`Role` / `Files` / `Exports` / `Notes`） |
| ② | `gate-commit-msg.mjs` | 首行 `type(scope): 摘要`；`type` 受控；摘要 ≤ 72 字、结尾不带句号；文件 UTF-8 无 BOM | 按 `.workflow/templates/commit-message.md` 重写说明文件 |
| ③ | `gate-assets.mjs` | `*.blend/max/psd/fbx/...` 不入库；`dist/ release/ node_modules/` 不入库；单文件 ≤ 95MB | 转成 `glb` 再入库；产物加进 `.gitignore` |
| ④ | `gate-ledgers.mjs` | `AGENT.md` ＋ 三份台账在位且五行头齐全；`D-` / `R-` / `T-` 编号不重复；每条 `D-` 有 决定/影响/落地 | 补台账，编号顺延不复用 |
| 发版 | `check-release-version.mjs` | 不是 pre-commit 门禁，由发版流水线在打 tag 前调用：`v<major>.<minor>.<patch>` 格式、首个 tag 必须是 `v0.0.0`、单调递增、与 `package.json` 的 `version` 一致 | 改 `release/vX.Y.Z` 分支上的 `package.json`，或换版本号 |

**一次跑全套**（hook 与 CI 都调这一条）：

```powershell
node .workflow/scripts/gate-all.mjs
node .workflow/scripts/gate-all.mjs --commit-msg .git/commit-msg.txt   # 提交前连说明一起校验
```

装的 hook：

```powershell
node .workflow/scripts/install-hooks.mjs    # 复制到 .git/hooks/，只需在克隆后跑一次
```

媒体资产（`public/media/`）不入库，克隆后**必须**补一次：

```powershell
node .workflow/scripts/pull-assets.mjs                  # 从 ../HumanAnatomyVirtualTraining_2026_v1.1 取
node .workflow/scripts/pull-assets.mjs --from <Assets>  # 上游在别处时指定
node .workflow/scripts/pull-assets.mjs --dry            # 只看清单不写盘
```

`--no-verify` 属于绕过门禁，须先经负责人同意，并在提交说明里写明原因。

## 3 一次任务的 SOP

1. 读 `AGENT.md` → `docs/README.md`（或对应单份文档）→ 目标路径 `README.md`（≤ 3 份，不通读）。
2. 改代码：`src/` 内同批改该路径 `README.md` 的 `Files` / `Exports` / `Notes`。
3. 收尾三份台账：`docs/TODO.md` 删做完的条目、`docs/RECORD.md` 追加、有拍板则 `docs/DECISION.md` 追加。
4. `node .workflow/scripts/gate-all.mjs --commit-msg .git/commit-msg.txt` 全绿。
5. `git add <具体路径>`（不用 `-A`）→ `git commit -F .git/commit-msg.txt` → `git push -u origin <分支>`。
   **不直接推 `main`**：走 PR（通道 A，见 §5.1）；发版走 `release/vX.Y.Z` 分支（通道 B，见 §5.2）。
6. 开 PR 与合并（`gh`，GitHub MCP 凭据失效不用）：
   ```powershell
   gh pr create --base main --head <分支> --title "<type>(<scope>): <摘要>" --body-file .github/pull_request_template.md
   gh pr checks --watch
   gh pr merge <编号> --merge --delete-branch
   ```
7. `git log -1 --format=%B` 回读复核中文；合并后 `docs/RECORD.md` **另起一条** `R-…` 补记哈希（台账只追加，不改旧条；纯补记提交不再登行）。

## 4 远端流水线（`.github/`）

| 文件 | 触发 | 干什么 |
|---|---|---|
| `.github/workflows/ci.yml` | push `main`、任意 PR | 跑 `gate-all.mjs`；push 时校验提交说明、PR 时校验 **PR 标题**（squash 后即提交说明）；有 `package.json` 时再跑 `npm ci` / `typecheck` / `build` / `test` 并上传 `dist` |
| `.github/workflows/release.yml` | ① `release/v*` 分支的 PR 被合并 ② 手动触发（可填版本号）③ 已存在 tag 的 push | 校验并**自动打 tag** → web 出 `dist`、desktop 在 `windows-latest` 出 `release/` → 挂到 GitHub Release |

流水线**不重写判定**，只调用 `scripts/`；`package.json` 尚未建立时构建类 job 自动跳过（不会红）。

## 5 两条提交通道

### 5.1 通道 A：普通改动（PR + merge，不出 tag）

1. 从 `main` 开分支：`feat/<主题>` / `fix/<主题>` / `docs/<主题>` / `chore/<主题>`。
2. 按 §3 的 SOP 提交到该分支（门禁在本地 hook 与 PR 的 `ci` 双重校验）。
3. 开 PR 到 `main`，**PR 标题必须写成 `type(scope): 摘要`**（squash 合并时它就是提交说明，`ci` 会校验）：
   `gh pr create --base main --head <分支> --title ... --body-file .github/pull_request_template.md`
4. 门禁绿（`gh pr checks --watch`）→ `gh pr merge <编号> --merge --delete-branch`。合并后 `ci` 在 `main` 上再跑一遍；**不打 tag、不发版**。

### 5.2 通道 B：发版（PR + merge + new tag + publish，全量）

1. 从 `main` 开分支 `release/v<major>.<minor>.<patch>`，同批改 `package.json` 的 `version`（与 tag 一致）。
2. 开 PR（标题：`chore(release): v<major>.<minor>.<patch>`），`ci` 全绿后 merge。
3. **合并动作本身触发** `release.yml`：
   - `tag` job：解析版本号（取自分支名）→ `check-release-version.mjs` 校验 → **tag 不存在则 `git tag` + push**；
   - `web` / `desktop` job：按该 tag 检出并构建；
   - `publish` job：把产物挂到 GitHub Release。
4. 补发 / 重跑：Actions 页手动触发 `release`，填版本号（留空取 `package.json` 的 `version`）；tag 已存在会跳过创建、只重建产物。
5. 产物目录只有 `dist/` 与 `release/`，两者都不入库（`AGENT.md` §3）。

### 5.3 tag 规则

| 规则 | 内容 |
|---|---|
| 起点 | 首个 tag 必须是 **`v0.0.0`**（`check-release-version.mjs` 强制，确需跳号加 `--allow-skip-start`） |
| 格式 | `v<major>.<minor>.<patch>`，无前导零、无预发布后缀（当前不接受 `-beta.1`） |
| 递增 | 必须严格大于现存最大 tag（只比数字段） |
| 来源 | 只由流水线创建；人手打 tag 仅在补发时用 `--allow-existing` 场景 |
| 一致性 | `package.json` 的 `version` 必须等于 tag 去掉 `v` 的部分 |

> 分支保护**已开启**（2026-10-30）：`main` 只接受 PR、必须过 `门禁`＋`构建`、禁 force push。配置即代码在 `.workflow/branch-protection.json`，应用/重放命令见 `docs/repo.md` §2。

## 6 技能索引

Agent 侧的操作技能在 `.agent/skills/`，索引见 `.agent/README.md`；技能只写"怎么做"，不复述本文件的判定表。

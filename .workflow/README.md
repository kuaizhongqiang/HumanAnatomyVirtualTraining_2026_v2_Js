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
| `hooks/` | `pre-commit`、`commit-msg` 两个 sh 包装，只调用 `scripts/` | 判定逻辑（逻辑只写一份） |
| `templates/` | 提交说明等模板 | 待办 / 拍板（归 `docs/`） |

## 2 门禁四道（本地与 CI 同源）

| # | 脚本 | 判据 | 失败怎么修 |
|---|---|---|---|
| ① | `gate-doc-paths.mjs` | `src/` 下每个含源码的目录必须有 `README.md`，首行 `# Contract: <相对路径>` | 补该目录 `README.md`，四项写全（`Role` / `Files` / `Exports` / `Notes`） |
| ② | `gate-commit-msg.mjs` | 首行 `type(scope): 摘要`；`type` 受控；摘要 ≤ 72 字、结尾不带句号；文件 UTF-8 无 BOM | 按 `.workflow/templates/commit-message.md` 重写说明文件 |
| ③ | `gate-assets.mjs` | `*.blend/max/psd/fbx/...` 不入库；`dist/ release/ node_modules/` 不入库；单文件 ≤ 95MB | 转成 `glb` 再入库；产物加进 `.gitignore` |
| ④ | `gate-ledgers.mjs` | `AGENT.md` ＋ 三份台账在位且五行头齐全；`D-` / `R-` / `T-` 编号不重复；每条 `D-` 有 决定/影响/落地 | 补台账，编号顺延不复用 |

**一次跑全套**（hook 与 CI 都调这一条）：

```powershell
node .workflow/scripts/gate-all.mjs
node .workflow/scripts/gate-all.mjs --commit-msg .git/commit-msg.txt   # 提交前连说明一起校验
```

装的 hook：

```powershell
node .workflow/scripts/install-hooks.mjs    # 复制到 .git/hooks/，只需在克隆后跑一次
```

`--no-verify` 属于绕过门禁，须先经负责人同意，并在提交说明里写明原因。

## 3 一次任务的 SOP

1. 读 `AGENT.md` → `docs/README.md`（或对应单份文档）→ 目标路径 `README.md`（≤ 3 份，不通读）。
2. 改代码：`src/` 内同批改该路径 `README.md` 的 `Files` / `Exports` / `Notes`。
3. 收尾三份台账：`docs/TODO.md` 删做完的条目、`docs/RECORD.md` 追加、有拍板则 `docs/DECISION.md` 追加。
4. `node .workflow/scripts/gate-all.mjs --commit-msg .git/commit-msg.txt` 全绿。
5. `git add <具体路径>`（不用 `-A`）→ `git commit -F .git/commit-msg.txt` → `git push origin main`。
6. `git log -1 --format=%B` 回读复核中文；`docs/RECORD.md` 补记版本号（补记提交本身不再单独登行）。

## 4 远端流水线（`.github/`）

| 文件 | 触发 | 干什么 |
|---|---|---|
| `.github/workflows/ci.yml` | push `main`、PR | 跑 `gate-all.mjs`；有 `package.json` 时再跑 `npm ci` / `typecheck` / `build` 并上传 `dist` |
| `.github/workflows/release.yml` | 手动触发（`web` / `desktop` / `all`）、tag `v*` | web 出 `dist` 产物；desktop 在 `windows-latest` 出 `release/` 安装包；tag 时挂到 GitHub Release |

流水线**不重写判定**，只调用 `scripts/`；`package.json` 尚未建立时构建类 job 自动跳过（不会红）。

## 5 发布流程

1. `node .workflow/scripts/gate-all.mjs` 全绿，工作区干净。
2. 打 tag：`git tag -a v0.1.0 -m "v0.1.0"` → `git push origin v0.1.0`。
3. `release.yml` 自动出 web `dist` ＋ Windows `release/`，并挂到 Release 页。
4. 产物目录只有 `dist/` 与 `release/`，两者都不入库（`AGENT.md` §3）。

## 6 技能索引

Agent 侧的操作技能在 `.agent/skills/`，索引见 `.agent/README.md`；技能只写"怎么做"，不复述本文件的判定表。

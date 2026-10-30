# repo — 仓库与协作事实

读者：AI
类型：仓库说明
权威：远端、分支、忽略链、克隆后步骤等仓库事实；两条通道的操作步骤在 `.workflow/README.md` §5，此处只留结论
状态：2026-10-30 建立；`main` 分支保护尚未开启（`TODO.md` `T-14`）
依赖：`AGENT.md` §4（禁止直接提交、提交说明、tag 规则）

## 1 远端与身份

| 项 | 值 |
|---|---|
| 远端 | `https://github.com/kuaizhongqiang/HumanAnatomyVirtualTraining_2026_v2_Js.git`（`origin`） |
| 长期分支 | `main`（跟踪 `origin/main`） |
| 提交身份 | `kuaizhongqiang <kuaizhongqiang@users.noreply.github.com>` |
| 换行 | `core.autocrlf=true`（工作副本 CRLF，库内 LF） |
| 版本控制 | 仅 git；无 SVN / Plastic |

## 2 分支与通道（结论）

- **禁止直接提交到 `main`**：一切改动走「主题分支 → PR → merge」（`AGENT.md` §4、`D-20261030-10`）。
- 通道 A（普通）：`feat/` `fix/` `docs/` `chore/` 分支 → PR → merge，不出 tag。
- 通道 B（发版）：`release/vX.Y.Z` → PR → merge，合并触发流水线打 tag 并 publish。
- 分支保护（要求 PR、要求 `ci` 通过、禁 force push）**尚未开启**，属仓库设置，见 `T-14`。

## 3 tag 规则（结论）

首个 tag 必须 `v0.0.0`；格式 `vX.Y.Z`；严格递增；只由流水线创建；与 `package.json` 的 `version` 一致。校验脚本 `.workflow/scripts/check-release-version.mjs`，细则见 `.workflow/README.md` §5.3。

## 4 克隆后步骤

```powershell
node .workflow/scripts/install-hooks.mjs      # 装 pre-commit / commit-msg（每份工作副本一次）
node .workflow/scripts/gate-all.mjs           # 自查
npm install                                   # 脚手架落地后（TODO.md T-2）
```

## 5 忽略链（`.gitignore` 与理由）

| 规则 | 理由 |
|---|---|
| `node_modules/`、`.vite/`、`coverage/` | 依赖与缓存，可复算 |
| `dist/`、`release/` | 构建产物，只由 CI 产出 |
| `*.tsbuildinfo` | 增量编译缓存 |
| `*.log`、`npm-debug.log*`、`tmp/`、`*.tmp` | 运行期噪声 |
| `.vscode/*`（保留 `extensions.json`）、`.idea/`、`.DS_Store`、`Thumbs.db` | 本地编辑器/系统文件 |

门禁 `gate-assets` 会**再查一遍**：生成物目录或原始工程文件一旦被跟踪即 FAIL——忽略链与门禁是两道独立保险，不要指望其中一道。

## 6 提交说明与复核

细则只有一处：`AGENT.md` §4（禁止直接提交、说明文件、回读复核、台账三件）；两条通道的步骤见 `.workflow/README.md` §5。此处不复述。

# AGENT.md — 人体解剖学知识仿真实训软件（2026 v2 / JS 版）

读者：AI
类型：纪律与索引
权威：本工程唯一纪律手册（"做什么 / 不许做什么 / 去哪查"）；工程内容事实源在 `docs/`，业务与数据事实源在上游 Unity 工程 `../HumanAnatomyVirtualTraining_2026_v1.1`（只读）
状态：2026-10-30 建立，同日完成**仓库检出**、**需求落账**与**流程基建**：远端 `github.com/kuaizhongqiang/HumanAnatomyVirtualTraining_2026_v2_Js`（`main` 跟踪 `origin/main`）；技术栈、交付形态、仓库协作、迁移口径、AI 实现路径已拍板（`docs/DECISION.md` `D-20261030-03`～`07`）；已建 `.workflow/`（四道门禁 ＋ SOP ＋ 发布）、`.github/`（CI / release / 协作模板）、`.agent/`（4 个技能）；`docs/` 仍只有三份台账与需求原件，其余内容文档未建；尚无源码与构建入口。同日修订 §3：文档单位定为「**一目录一份 `README.md`**（路径契约）」
依赖：`docs/README.md`（未建）、上游 `Assets/StreamingAssets/ConfigData.json`＋`HumanBodyData.json`（数据契约真源）、纪律范式参照 `F:\Project\VRFInstallationCommissioningTrainingSimulation\trunk\AGENT.md`

本文件只写**纪律与索引**。工程是什么、目录怎么排、仓库怎么管、框架怎么转、业务怎么分、还欠什么——一律查 `docs/`；本文件不复述，文档与代码冲突时以代码为准（见 §1）。

## 1 唯一手册与文档分工

- 本文件是本工程唯一"有纪律"的 agent 手册。其它 agent 工具手册（`CODEBUDDY.md` / `CLAUDE.md` / `AGENTS.md` / `.cursor/rules` 等，若出现）**只允许写一行指针**指向本文件，不得承载独立内容。
- **三级分工**：`AGENT.md`（纪律与索引）→ `docs/`（工程内容唯一事实源）→ 上游 Unity 工程（业务口径、数据契约、交互逻辑的真源，只读）。冲突时 **AGENT.md > docs/ > 上游代码**；发现冲突立即修正低层，同一次提交。
- **三份台账各管一件事**，不得互相搅和：
  | 台账 | 只记什么 | 判据 / 写法 |
  |---|---|---|
  | `docs/TODO.md` | **还没做 / 建议做**的事 | 做完即在同批提交里**删掉**该条；不写缘由与拍板，不写提交号；已完成能力写 `progress.md`；**待拍板项也记在本表 §4（唯一清单）**，拍板后删除并记入 `DECISION.md` |
  | `docs/RECORD.md` | **已进入仓库的提交** | 只追加、一条一次逻辑变更、编号 `R-…`；不写待办 |
  | `docs/DECISION.md` | **负责人拍板 + 我方应对要点** | 只追加、编号 `D-…`；不写提交号、不写待办；纯技术细节不进本文件，但**负责人指定的技术栈 / 交付口径属于口径，必须记**；**待确认项不进本文件** |
  口诀：**没做的 → todo，做了的 → RECORD，人定的口径 → DECISION**。
- **代码事实 > 文档**：文档与代码冲突以代码为准，就地补齐（只补不删缘由），与本次改动**同一次提交**。
- 读序：`AGENT.md` → `docs/README.md`（按需取**一份**内容文档）→ 该路径 `README.md`（**路径契约**，一个任务只取涉及的 1～2 个路径）→ 目标源码文件；**一个任务 ≤ 3 份，不通读**。
- 纪律变更必须回写本文件，并核对 `docs/` 是否需要同步（内容事实变了改 `docs/`，纪律变了改本文件）。

## 2 文档地图（明细只查被指向的文档）

| 要查什么 | 去哪里 |
|---|---|
| 内容文档总览、写作约定、权威层级 | `docs/README.md` |
| 工程概述：定位、目标终端、技术栈与版本、阶段 | `docs/overview.md` |
| 目录结构：现有布局、`src/` 目标布局、产物、新路径检查清单 | `docs/structure.md` |
| 仓库事实：远端、分支、忽略链、克隆后步骤 | `docs/repo.md` |
| 架构：上游复原 ＋ Web 目标（初始化顺序、分层、渲染拾取、状态、AI 通道） | `docs/architecture.md` |
| 业务域：九大系统、体素规模、字段字典、命名规则 | `docs/business.md` |
| 当前状态与待办（**唯一清单**） | `docs/TODO.md` |
| 已完成能力索引（事实以 `RECORD.md` 为准） | `docs/progress.md` |
| 用户拍板记录（只追加） | `docs/DECISION.md` |
| 提交台账（只追加） | `docs/RECORD.md` |
| **需求原件（只读输入）** | `docs/requirement/raw/origin.md`（技术栈、仓库组织、功能与发布口径的原始出处；只读，不在此处改口径） |
| 仓库首页 | `README.md` |
| **流程、门禁与发布细则** | `.workflow/README.md`（四道门禁判定表、任务 SOP、发布流程） |
| 门禁实现（唯一判定） | `.workflow/scripts/gate-*.mjs`、`install-hooks.mjs`、`hooks/` |
| 提交说明模板 | `.workflow/templates/commit-message.md` |
| 远端流水线与协作模板 | `.github/workflows/ci.yml`、`.github/workflows/release.yml`、`.github/pull_request_template.md`、`.github/ISSUE_TEMPLATE/`、`.github/CODEOWNERS` |
| Agent 技能 | `.agent/README.md` → `.agent/skills/<name>/SKILL.md`（`repo-commit` / `gate-triage` / `anatomy-migrate` / `release`） |
| **上游 Unity 工程（只读事实源）** | `../HumanAnatomyVirtualTraining_2026_v1.1`（Unity 2022.3.53f1c1 / URP 14.0.11；场景 `0_Setup` `1_Start` `2_Content` `Preview`） |
| 上游脚本与域划分（迁移对照） | `../HumanAnatomyVirtualTraining_2026_v1.1/Assets/Script`（`Api` / `Data` / `Control` / `InteractiveObj` / `UI` / `Manager` / `CamControl`） |
| **数据契约真源** | `../HumanAnatomyVirtualTraining_2026_v1.1/Assets/StreamingAssets/`：`ConfigData.json`、`HumanBodyData.json`、`HumanBodyData_Female.json` |
| 模型资产根 | `../HumanAnatomyAsset/Model` |
| 纪律范式来源（本文件模板） | `F:\Project\VRFInstallationCommissioningTrainingSimulation\trunk\AGENT.md` ＋ 其 `docs/` |
| 记忆服务（跨会话） | `../HumanAnatomyVirtualTraining_2026_v1/MCP-STARTUP.md`（agentmemory，`http://localhost:3111`） |

## 3 开发纪律（红线）

- **技术栈固定（`D-20261030-03`）**：`three.js` 负责三维表达、`vite` 负责构建与开发服务器、`electron` 只做桌面壳、`blender` 只做 fbx→glb 转换。禁引入与既定栈重复的替代物（第二套渲染框架、另起 webpack/rollup 配置）；确需新增框架级依赖时，先改本条并记 `D-…`。
- **语言与扩展名（`D-20261030-03`）**：新代码一律 `.ts`（类型即契约；`src/data` 的类型须与 `StreamingAssets` 字段一一对应）；`js` 仅用于上游直译或三方示例原样搬，且在该路径 `README.md` 的 `Files` 行注明原因。样式 `.css`、入口 `.html` 独立存放，不与脚本混放。
- **模块边界 = 目录路径**：ES Module 的 import 路径即职责边界，目录名与域一一对应，禁按"顺手"跨域引用。上游域 → 本工程目录的映射**只此一份**，迁移不得改名换域：
  | 上游命名空间 / 目录 | 本工程目录 | 职责 |
  |---|---|---|
  | `Anatomy.Api` / `Api` | `src/api` | 模型服务、响应解析、会话历史 |
  | `Anatomy.Data` / `Data` | `src/data` | 数据契约与查询工具（含近似搜索） |
  | `Anatomy.Control` / `BodyControl` | `src/control` | 人体整体控制（显示/拆分/透明度状态） |
  | `Anatomy.InteractiveObj` / `InteractiveObj` | `src/obj` | 体素对象、系统对象、高亮与拾取回调 |
  | `Anatomy.CamControl` / `CamControl` | `src/camera` | 相机轨道/聚焦/背景 |
  | `Anatomy.UI` / `UI` | `src/ui` | 画布/面板基类与各面板 |
  | `GlobalManagement` / `Manager` | `src/manager` | 全局单例：数据、交互、相机、AI 调度 |
  依赖方向单向：`ui → manager → control / obj / camera / data → api`；反向引用一律视为缺陷。
- **路径与文档一一对应（`src/` 强制；按目录）**：
  - 文档单位是**路径（目录）**。`src/` 下每个含源码的目录（含所有子目录）必须有**一份该路径的契约文档**，即该目录下的 `README.md`：**一个目录对应一份**。
  - **新增目录 / 目录内首次落源码**：同一次提交内建该目录 `README.md`，缺文档不得验收。
  - **改目录内任何源码（`.ts` / `.js` / `.mjs`）**：同一次提交内复核该路径 `README.md` 的 `Files` / `Exports` / `Notes` 是否已失真，失真必须跟改；单文件级细节写在该路径 `README.md` 的 `Files` 行或代码里一行注释。
  - **删 / 改名 / 移动目录**：`README.md` 同步删除、改名、移动，不留孤儿 `.md`，不留无文档的源码目录。
  - 提交前自查（应无输出：含源码却没有 `README.md` 的目录）：
    `Get-ChildItem src -Recurse -Directory | Where-Object { (Get-ChildItem $_.FullName -File | Where-Object Extension -in '.js','.mjs','.ts') -and -not (Test-Path (Join-Path $_.FullName 'README.md')) } | Select-Object -Expand FullName`
- **路径 `README.md` 写法**：开头 `# Contract: src/<相对路径>`，正文四项——`Role:`（该路径职责一句）/ `Files:`（逐文件一行：`文件名` — 一句话）/ `Exports:`（该路径对外可被谁 import，越界引用即缺陷）/ `Notes:`（该路径的坑，一句一条）。能一句说清就不两句；代码里每个类头、每个导出成员最多一行注释。
- **五行头**：`docs/` 文档第 3 行起固定 `读者 / 类型 / 权威 / 状态 / 依赖`（契约与机器索引除外）。
- **单一事实源**：字段口径、状态机、打包规约各自只写一处，别处引用不复述；审核稿/过程稿进 `.plans/`，不进 `docs/`，正式文档禁止引用过程稿。
- **数据契约只读消费**：字段名与结构以 `StreamingAssets` 的 JSON 为准，JS 侧不得自造同义字段。现状口径——顶层 `maleData` / `femaleData` 两套；每套 `bodySystemDataList[]`，系统名固定九项 `MuscularSystem` `SkeletalSystem` `CirculatorySystem` `RespiratorySystem` `DigestiveSystem` `LymphaticSystem` `NervousSystem` `ReproductiveSystem` `UrinarySystem`；系统下 `bodyObjDataList[]`，体素字段 `id` / `name` / `engName` / `morphology` / `posDesc` / `function`，`id` 前缀即系统名（如 `Muscular_Zygomaticus_Minor`，女性特有项另带 `Female_` 前缀）。要加字段：先改 `docs/` 契约、再对照上游、同批落地，禁单侧改。
- **配置与开关**：`ConfigData.json` 的 `softwareName` / `softwareEngName` / `isTrial` / `releaseKey` / `isAiActive` 是发布口径，不得硬编码到源码或 UI 文案。
- **表现层两条硬口径（`D-20261030-06`）**：① 可见文案一律走字典（中文 / English 双语可切换），源码与面板里禁写死中文；② 明暗主题走一套 token 变量（`data-theme` 或等价机制）切换，组件内禁写死色值。
- **禁改**：`node_modules/`、`dist/`、`.cache/` 等依赖与生成物；上游工程全部内容（`Library/` `Temp/` `Logs/` `obj/` `*.csproj` `*.sln` `*.meta` `ProjectSettings/` 一律不碰、不复制）。
- **产物目录只有两个**：`dist/`（web 构建产物）与 `release/`（electron 安装包），均由脚本生成、一律入忽略链、不入库；禁自造 `build/`、`out/` 之类第二套产物目录（历史教训：上游 Plastic 忽略规则无前导斜杠、任意深度匹配，`Build/` 会被静默排除，故沿用"不叫 build"的口径；忽略链细则见 `docs/repo.md`）。
- **资产**：**无大资产门禁**——模型 / 贴图 / 视频 / 音频照原样提交，不设单文件体积上限；原始工程文件（`.blend` / `.max` / `.psd` 等源工程）不入库。业务素材统一入资产根，不得散落到 `src/` 或构建产物目录。
- **门禁是硬闸**：提交前 `node .workflow/scripts/gate-all.mjs --commit-msg <说明文件>` 必须全绿；本地 hook 与 CI 调**同一脚本**，判定只写一份。新增门禁 = 在 `.workflow/scripts/` 加一个 `gate-*.mjs` ＋ 在 `.workflow/README.md` 判定表登记，两处同批。`--no-verify`、CI 里 `continue-on-error` 视同绕过门禁，须先经负责人同意并在提交说明写明原因。
- **MCP 是单实例资源**：agentmemory、上游 Unity MCP、CDP 浏览器同一时刻只允许一个 agent 使用；用前申请、用完即放，纯读操作同样排队，禁并发。
- **禁止**：删改他人未提交/未确认的改动；用 `--forced` / `--override` / `-y` 覆盖远端；在未提交状态下切分支或拉取；把中文直接写进命令行参数（说明文字一律走 UTF-8 文件）。

## 4 提交与仓库操作纪律（摘要；细则归 `docs/repo.md` 与 `.workflow/`）

- **禁止直接提交（红线）**：任何改动——代码、文档、台账、配置，无一例外——都必须走 **「主题分支 → PR → merge」**，禁止在 `main` 上直接 `git commit` 后 `git push origin main`，也禁止本地合并且不建 PR。唯一例外是流水线自身打 tag（`.github/workflows/release.yml` 的 `tag` job，由 `release/v*` 分支的 PR 合并触发，不是人工推送）。
- 一次逻辑变更 = 一次提交，提交说明与改动文件树一致；禁止把无关改动打包进同一次提交。
- **提交时同步收尾三份台账**（同批，不许留到下次）：① `docs/TODO.md` 删掉本次做完的条目；② `docs/RECORD.md` 追加一条；③ 含负责人新拍板则 `docs/DECISION.md` 追加 `D-…`。三项缺一视为本次提交未完成。
- 中文提交说明：**UTF-8 无 BOM 文件** ＋ `git commit -F <文件>`；**禁止** `-m "中文"` 直接传参（本机编码会损坏）。
- 提交后必须**回读原始字节复核**：`git log -1 --format=%B`（按 UTF-8 解码比对）；**控制台回显不可信**（本机 ACP=936 会把正确中文显示成乱码）。
- **两条通道（`D-20261030-09`）**：① **普通改动** = 开 `feat/…` / `fix/…` / `docs/…` / `chore/…` 分支 → PR（标题即 squash 后的提交说明）→ merge，**不打 tag**；② **发版** = 开 `release/vX.Y.Z` 分支（同批把 `package.json` 的 `version` 改成一致值）→ PR → merge，合并动作触发流水线**自动打 tag ＋ 构建 ＋ publish**，人不手打 tag。
- 分支模型：唯一长期分支 `main`，跟踪 `origin/main`；禁止 force push、禁止跳钩子。tag **从 `v0.0.0` 起**、格式 `vX.Y.Z`、严格递增、只由流水线创建；细则见 `.workflow/README.md` §5。`main` 已开分支保护（PR ＋ `门禁`/`构建` 检查），红线从此是硬拦，见 `docs/repo.md` §2。
- 拉取与推送：提交前 `git pull --rebase origin main`，`status` 必须干净；禁止在未提交状态下切分支或拉取；推送目标是**自己的主题分支**（`git push -u origin <分支>`），`main` 只接受 PR 合入。
- 克隆或换机后先装门禁 hook：`node .workflow/scripts/install-hooks.mjs`（`.git/hooks/` 不入库，每份工作副本装一次）。

## 5 常用命令

**仓库与门禁（已可用）**

```powershell
node .workflow/scripts/install-hooks.mjs                       # 克隆后装一次 pre-commit / commit-msg
node .workflow/scripts/gate-all.mjs                            # 全门禁：路径文档 / 资产 / 台账
node .workflow/scripts/gate-all.mjs --commit-msg .git/commit-msg.txt   # 提交前连说明一起校验
git status                                                     # 提交前必须清点
git pull --rebase origin main                                  # 拉取；有未提交改动先提交或 stash
git add <具体路径>                                              # 只加本次逻辑变更涉及的文件，禁 git add -A
git commit -F .git/commit-msg.txt                               # 中文说明走 UTF-8 无 BOM 文件
git push -u origin <分支>                                        # main 只接受 PR 合入，不直接推
git log -1 --format=%B                                          # 提交后回读复核
```

**PR 与 GitHub 侧（一律用 `gh`；GitHub MCP 凭据已失效，不作为通道）**

```powershell
gh pr create --base main --head <分支> --title "<type>(<scope>): <摘要>" --body-file .github/pull_request_template.md
gh pr checks --watch                    # 等 ci 的 gates job 绿
gh pr merge <编号> --merge --delete-branch
gh run list --workflow=ci.yml --limit 3
gh run view <run-id> --log-failed       # CI 红了看失败日志
```

**两条通道**

```powershell
# 通道 A：普通改动（PR + merge，不出 tag）
git switch -c feat/<主题>
git push -u origin feat/<主题>        # 开 PR 到 main，标题写成 type(scope): 摘要

# 通道 B：发版（tag 由流水线创建，人不手打）
git switch -c release/v0.0.0          # 同批改 package.json 的 version = 0.0.0
node .workflow/scripts/check-release-version.mjs v0.0.0   # 本地预检：格式 / 起点 / 递增 / 版本一致
git push -u origin release/v0.0.0     # PR 合并后 release.yml 自动打 tag + 构建 + publish
```

**工程（尚不可用）**

构建 / 开发 / 检查 / 测试入口未建（无 `package.json`、无 `vite.config.ts`），禁止臆造命令；入口落盘后本节随同一次提交补齐（见 `docs/TODO.md` `T-2`）。

**自查**：§3 的「路径 ↔ 目录 `README.md`」配对检查已并入 `gate-doc-paths`（`node .workflow/scripts/gate-doc-paths.mjs`）。

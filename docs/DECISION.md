# DECISION — 拍板台账

读者：AI
类型：拍板台账（只追加）
权威：负责人已拍板口径的唯一台账；待拍板项在 `TODO.md` §4
状态：2026-10-30 建立，记 12 条（01～02 协作口径，03～07 由需求原件 `requirement/raw/origin.md` 落账，08 流程目录与门禁，09 两条通道与 tag 规则，10 禁止直接提交，11 媒体资产单一根且不入库）
依赖：`AGENT.md` §1（唯一手册与文档分工）

## 1 写法

- 只追加、编号 `D-YYYYMMDD-NN`，不复用；旧条不改（口径被推翻时**新增**一条并注明 `替代 D-…`）。
- 只记**人定的口径**；纯技术选型、待确认项、提交号都不进本文件。
- 每条固定三段：`决定：` 一句话 / `影响：` 改动面 / `落地：` 对应文件或路径。

## 2 台账

### D-20261030-01 唯一 agent 手册与指针文件

决定：`AGENT.md` 是本工程唯一纪律手册；`CODEBUDDY.md` 只做一行指向，不承载任何内容。
影响：其它 agent 工具手册（`CLAUDE.md` / `AGENTS.md` / `.cursor/rules` 等）不得独立成文。
落地：`AGENT.md` §1、`CODEBUDDY.md`。

### D-20261030-02 文档单位＝一目录一份 README.md

决定：`src/` 的文档单位是**路径（目录）**，一个目录对应该目录下一份 `README.md`（路径契约：`Role` / `Files` / `Exports` / `Notes`）。
影响：新增目录即建该路径 `README.md`；改目录内脚本须同批复核该路径文档；`AGENT.md` 自查命令改为「含源码却无 `README.md` 的目录」。
落地：`AGENT.md` §3。

### D-20261030-03 技术栈与工具链

决定：`ts + js + css + html`；三维用 `three.js`；构建与开发服务器用 `vite`；桌面壳用 `electron`；模型 `fbx → glb` 转换用 `blender`。
影响：新代码默认 `.ts`，`js` 仅用于上游直译或三方示例；禁引入与既定栈重复的替代物（第二套渲染/构建框架）；资产链路以 glb 为准，fbx 只作转换输入。
落地：`AGENT.md` §3（技术栈、语言与扩展名、模块边界）。

### D-20261030-04 仓库与协作形态

决定：单一 GitHub 仓库 `github.com/kuaizhongqiang/HumanAnatomyVirtualTraining_2026_v2_Js`，长期分支 `main`；流程脚本集中在 `.workflow/`（CI ＋ 打包 ＋ 发布）。
影响：提交/拉取/推送全部走 git；`.workflow/` 承担流水线脚本与说明，成为工程内第二事实源（流程），不自建第二套发布方式。
落地：`AGENT.md` §4、§5；`.workflow/`（待建）。

### D-20261030-05 交付形态

决定：web 版发布 `dist`；Windows 桌面版用 `electron` 打包。
影响：产物目录只有 `dist/` 与 `release/`；构建脚本需产出两套目标，桌面壳只做容器不做业务。
落地：`AGENT.md` §3（产物目录）、§5（命令待 `T-2`）。

### D-20261030-06 迁移口径与表现层

决定：以 `../HumanAnatomyVirtualTraining_2026_v1` 的数据、功能、三维素材**照搬**为基线；UI **重新设计**，含明暗两种主题；文案中英双语。
影响：数据与交互逻辑以 v1 为准（口径真源 `StreamingAssets`）；表现层可重做但不得改变业务语义；文案入字典、主题入 token。
落地：`AGENT.md` §3（数据契约、表现层两条硬口径）、`docs/business.md`（待建）。

### D-20261030-07 AI 对话实现路径

决定：AI 对话功能**先按最简单方式实现**，后续再扩展（不照搬上游豆包＋DeepSeek 双模型 tool-call 全链路）。
影响：`src/api` 与 `src/manager` 初期只保留单通道请求/响应与会话历史；工具调用、多轮 function call 留待扩展时再记 `D-…`。
落地：`AGENT.md` §3（模块边界）、`src/api`（待建）。

### D-20261030-08 流程目录分工与门禁口径

决定：`.github/` 只管远端流水线与协作模板（CI / release / PR / issue / CODEOWNERS）；`.workflow/` 管本地流程、门禁脚本、hook 与模板；`.agent/` 管 agent 技能。门禁四道（路径文档 / 提交说明 / 资产 / 台账），判定逻辑只存在于 `.workflow/scripts/gate-*.mjs` 一份，本地 pre-commit 与 CI 调同一脚本。
影响：新增或调整门禁必须同时改脚本与 `.workflow/README.md` 判定表；技能只写"怎么做"不复制判定表；`--no-verify` 与 CI `continue-on-error` 视同绕过，须负责人同意。
落地：`AGENT.md` §3（门禁是硬闸）、§5；`.workflow/`、`.github/`、`.agent/`。

### D-20261030-09 两条通道：普通 PR 与发版

决定：改动分两条通道——① **普通通道** = 主题分支（`feat/` `fix/` `docs/` `chore/`）→ PR → merge，不出 tag；② **发版通道** = `release/vX.Y.Z` 分支 → PR → merge，合并动作触发流水线**自动打 tag ＋ 构建 ＋ publish**，人不再手打 tag。tag 从 **`v0.0.0`** 起，格式 `vX.Y.Z`，严格递增，必须与 `package.json` 的 `version` 一致。
影响：`main` 只接受 PR 合入；`release.yml` 增加 tag 解析/校验/创建 job（`check-release-version.mjs`）；`ci.yml` 增加 PR 标题校验（squash 即提交说明）；发版技能与 `.workflow/README.md` §5 同步改。
落地：`.github/workflows/release.yml`、`.github/workflows/ci.yml`、`.workflow/scripts/check-release-version.mjs`、`.workflow/README.md` §5、`AGENT.md` §4、`.agent/skills/release/`。

### D-20261030-10 禁止直接提交，一切改动必须 PR + merge

决定：任何改动（代码、文档、台账、配置）都必须经「主题分支 → PR → merge」进入 `main`；禁止在 `main` 上直接 `git commit` 后 `git push origin main`，也禁止本地合并且不建 PR。唯一例外是流水线自身打 tag（由 `release/v*` 分支的 PR 合并触发）。
影响：`main` 需开分支保护（`TODO.md` `T-14`）把纪律变成硬约束；agent 每次任务收尾的产出是「已推送的分支 + PR」，不是「已推到 main」；`README.md` 与 `.workflow/README.md` 同步写明。
落地：`AGENT.md` §4（禁止直接提交·红线）、`README.md`（协作流程）、`.workflow/README.md` §5。

### D-20261030-11 媒体资产单一根且不入库

决定：视频 / 图片 / 模型 / 贴图**只有一个根** `public/media/`（`ui/` `video/` `models/` `textures/`），整目录进 `.gitignore`、一律不提交；本地用 `.workflow/scripts/pull-assets.mjs` 从上游 Unity 工程恢复。
影响：仓库不含媒体二进制，clone 后必须先跑一次恢复脚本，否则开始/加载页无图、模型无 GLB；代码引用统一写相对路径 `media/...`；后续新增素材只改脚本的复制表，不再往仓库塞文件。
落地：`.gitignore`（`public/media/`）、`.workflow/scripts/pull-assets.mjs`、`AGENT.md` §3（媒体资产）、`docs/structure.md` §3、`docs/repo.md` §4/§5、`docs/design/README.md` §3.3。

### D-20261030-12 模型管线：ShaderGraph 解析 + 材质表驱动 + 导出后核对

决定：FBX→GLB 不由 Blender 自由导，而是**材质表驱动**——先解析 `Assets/Shader/Model/*.shadergraph` 的属性（贴图槽位语义）与 `Model/Male/Materials/*.mat` 的实际贴图引用（含 `_BaseMap` / `_BaseNormalMap` / `_MaskMap`），生成 `material-map.json`，再由 `fbx2glb.py` 按表重建材质（baseColor sRGB / normal Non-Color）并降采样贴图后导出；导出后用 `verify-models.mjs` 与 `Prefabs/Model/MaleBody.prefab` 的节点表、以及 `HumanBodyData.json` 的体素 id 逐项核对；**多维子材质**（prefab 材质槽数 > 1 的网格）单独统计，不得合并成单材质。
影响：贴图语义以 Unity 材质为准，禁止按文件名猜；GLB 必须内嵌贴图且体积受控（base 2048 / normal 1024 JPEG，整包约 22MB）；节点名与体素 id 的差异必须显式记录，不静默放过。
落地：`.workflow/scripts/build-material-map.mjs`、`fbx2glb.py`、`verify-models.mjs`；`src/ui/screens/model.ts`（`?screen=model` 预览页）。

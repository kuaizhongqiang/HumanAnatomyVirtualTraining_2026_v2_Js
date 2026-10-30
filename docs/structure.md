# structure — 目录结构与产物

读者：AI
类型：结构说明
权威：仓库布局、`src/` 目标布局、产物与禁改清单；架构关系见 `architecture.md`，忽略链见 `repo.md`
状态：2026-10-30 建立；`src/` 与工程脚手架尚未落地（`TODO.md` `T-2`、`T-7`）
依赖：`AGENT.md` §3（模块边界、路径文档契约）

## 1 现有布局（实际）

| 路径 | 职责 |
|---|---|
| `AGENT.md` | 唯一纪律手册（纪律 + 索引） |
| `CODEBUDDY.md` | 一行指针，指向 `AGENT.md` |
| `README.md` | 仓库首页：定位、两条通道、门禁、文档入口 |
| `docs/` | 内容事实源：七份内容文档 ＋ 三份台账 ＋ `requirement/raw/` ＋ `ui-spec.md` |
| `docs/design/` | 设计令牌规范页、三屏 9 幕样张、9 张 1920×1080 预览、重渲脚本（离线可开，复用 `src/styles`） |
| `.workflow/` | 流程与门禁：`scripts/`（判定）、`hooks/`（包装）、`templates/`、`README.md`（细则） |
| `.github/` | `workflows/{ci,release}.yml`、PR/Issue 模板、`CODEOWNERS` |
| `.agent/` | 技能索引与 `skills/<name>/SKILL.md` |
| `src/` | 业务源码：已落地 `main.ts`、`styles/`（令牌 + 组件）、`data`、`ui`（`app.ts` + `screens/`）；其余五域待迁移（§2） |
| `package.json` / `tsconfig.json` / `vite.config.ts` / `vitest.config.ts` / `eslint.config.js` / `index.html` | 工程脚手架与入口 |
| `src/data/sample/human-sample.json` | **采样数据**：上游每系统取 2 项、描述截断；完整数据待 `TODO.md` `P-6` |
| `dist/` `release/` | **生成物**：web 产物 / 桌面安装包，不入库 |

## 2 `src/` 布局（与上游七域一一对应；✅ 已有，其余待迁移）

| 目录 | 职责 | 上游来源 | 状态 |
|---|---|---|---|
| `src/api` | 模型服务调用、响应解析、会话历史 | `Assets/Script/Api` | 待建（`T-11`） |
| `src/data` | 数据契约类型、加载、校验、近似搜索 | `Assets/Script/Data` | ✅ 类型 ＋ 采样数据 |
| `src/control` | 人体整体状态（拆分 / 透明度 / 显隐） | `Assets/Script/BodyControl` | 待建（`T-7`） |
| `src/obj` | 体素与系统对象、拾取、高亮、交互回调 | `Assets/Script/InteractiveObj` | 待建（`T-7`） |
| `src/camera` | 轨道 / 聚焦 / 背景 | `Assets/Script/CamControl` | 待建（`T-7`） |
| `src/ui` | 屏幕编排（start / loading / content）、主题切换、双语字典 | `Assets/Script/UI` | ✅ 三屏 ＋ i18n/theme |
| `src/styles` | 设计令牌、复位基座、屏幕骨架、组件样式 | —（Web 新增） | ✅ 四层分层，class 清单见 `docs/ui-spec.md` |
| `src/manager` | 全局编排：数据、交互、相机、AI | `Assets/Script/Manager`＋`Setup.cs` | 待建（`T-7`） |

- 依赖方向单向：`ui → manager → control / obj / camera / data → api`（`AGENT.md` §3）。
- 每个含源码的目录必须有 `README.md` 作路径契约，首行 `# Contract: src/<相对路径>`；`gate-doc-paths` 强制。

## 3 资产

| 类型 | 位置 | 规则 |
|---|---|---|
> **媒体资产单一根：`public/media/`，整体不入库**（`.gitignore` 忽略，`D-20261030-11`）。换机或清空后跑 `node .workflow/scripts/pull-assets.mjs` 从上游恢复；代码引用写相对路径 `media/...`（vite 的 `publicDir` 默认 `public/`，构建时会拷进 `dist/`）。

| 路径（`public/media/` 下） | 内容 | 来源 |
|---|---|---|
| `ui/start/StartBg.png`、`ui/loading/LoadingBg.png` | 开始页 / 加载页背景（3840×2160） | 上游 `Assets/Sprites/` 原样 |
| `ui/common/{BaseBG,BlackBG,LightBG,Round,RoundRect}.png` | 通用底板 / 圆角底 | 上游 `Assets/Sprites/Public/` |
| `ui/icon/ICO_Quit_*.png` | 退出按钮四态 | 上游 `Assets/Sprites/UI/` |
| `ui/title/Title.png` | 标题图（2416×408） | 上游 `Assets/Sprites/UI/` |
| `video/StartVideo.mp4` | 开场视频（15s，约 39MB） | 上游 `Assets/StreamingAssets/Video/` |
| `models/` | 人体模型 `glb`（按系统分文件） | blender 由上游 fbx 转换（`P-5`、`T-15`） |
| `textures/` | 贴图（按系统分目录） | 上游 `../HumanAnatomyAsset` 或转换产物 |
| 上游模型源（只读） | `../HumanAnatomyAsset/Model` | 只读引用，不复制进本仓库 |

## 4 产物与禁改

- 产物只有两个：`dist/`（web）、`release/`（Windows 安装包）；均不入库。
- 禁改：`node_modules/`、`dist/`、`release/`、`.vite/`、`coverage/`、`*.tsbuildinfo`、`.git/`。
- 禁自造第二套产物目录（`build/`、`out/` 等）。
- 上游工程任何文件只读，不复制、不修改（见 `AGENT.md` §3「禁改」）。

## 5 新增路径的检查清单

1. 目录职责能用一句话说清，且能落进 §2 的某一域；不能则先在 `TODO.md` 立条。
2. 建该目录 `README.md`（`Role` / `Files` / `Exports` / `Notes`），首行路径与目录一致。
3. `node .workflow/scripts/gate-doc-paths.mjs` 通过后再提交。

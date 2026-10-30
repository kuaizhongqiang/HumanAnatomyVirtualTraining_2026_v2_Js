# design — 设计令牌与界面样张

读者：AI / 设计与前端
类型：功能文档（视觉规范与版面样张）
权威：视觉令牌的**唯一源**是 `src/styles/tokens.css`（本目录只做可视化核对）；界面 class 清单在 `docs/ui-spec.md`；实现以 `src/` 为准
状态：2026-10-30 建立 v0.2：令牌规范页 ＋ 三屏 9 幕合屏 ＋ **8 个面板逐节解剖（特写 + 状态矩阵 + 口径）** ＋ 面板 × class 覆盖矩阵 ＋ 17 张 1920×1080 预览 ＋ 一键重渲脚本；令牌与样张全部复用应用样式，不另起一套
依赖：`src/styles/`（令牌与组件）、`docs/ui-spec.md`（class 清单）、`src/ui/screens/`（屏幕实现）

本目录回答两个问题：**这套界面用什么颜色 / 字号 / 间距 / 玻璃光学**，以及**三屏各是什么版面**。两个页面都能离线双击打开（无 CDN、无构建）。

## 1 文件清单

| 文件 | 用途 |
|---|---|
| `tokens.html` | 可视化规范页：语义色 / 玻璃与光学 / 字号 / 间距 / 圆角 / 阴影 / 组件画廊 / 布局尺寸与层级；右上角切明暗，支持 `?theme=light\|dark` |
| `mockups.html` | 界面样张页：§1 三屏 9 幕 ＋ §2 八个面板逐节（特写 + 状态矩阵 + 口径）＋ §3 覆盖矩阵；`?shot=<id>` 出 1:1 单幕，`?only=<id>` 只看一节 |
| `design.css` | 页面外壳样式：页头、章节、色卡、表格、画廊、样张帧、解剖标注、`?shot=` 模式；**通过 `@import` 复用 `src/styles/` 的应用样式** |
| `preview/*.png` | 17 张 1920×1080 预览（9 合屏 + 8 面板特写，由 `tools/render-previews.ps1` 无头渲染，随代码一起提交） |
| `tools/render-previews.ps1` | 批量截图脚本：本机 Chrome/Edge 无头 ＋ `?shot=`；`-Only <id,...>` 只重渲指定幕，`-OutDir` 可换输出目录 |

## 2 设计令牌（结构，实值只在 `src/styles/tokens.css`）

| 层 | 内容 | 谁消费 |
|---|---|---|
| 基础层 | 字体族、字号 11–28、行高、字重、间距 4–40、圆角、动效时长与缓动、层级 | 所有组件 |
| 主题层 | `[data-theme='light'\|'dark']` 两组：语义色（底色/面/三级文字/线/品牌/危险）＋ 玻璃（底、强底、边框、斜面、模糊/饱和/亮度）＋ 光学（镜面、色散 A/B、边暗线、内发光）＋ 三级阴影 ＋ 场景光（冷/暖/网格/底色） | 组件与样张 |
| 运行期注入 | `--tint`：当前选中解剖系统的颜色，驱动场景第三团柔光、人体描边、树选中行、字段名、滑条 | `src/ui/screens/content.ts` 写入 |

> 为什么写成 `[data-theme]` 而不是 `:root[data-theme]`：样张页要在一张页面里并列明暗两帧，选择器必须能落在任意子树（见 `tokens.css` 顶部注释）。

## 3 样张结构

样张页分三段，缺一段就不算说完：

| 段 | 内容 | 为什么 |
|---|---|---|
| §1 合屏 | 9 幕整屏（下表） | 判断**版面与遮挡关系**：面板之间、面板与视口之间 |
| §2 面板逐节 | 8 节，每节 = 职责一句 ＋ 尺寸/锚点 ＋ 特写帧 ＋ **状态矩阵** ＋ 口径要点 | 判断**单个面板自己那一层**：状态怎么变、越界条件、坑在哪 |
| §3 覆盖矩阵 | 面板 × class 表 | 核对"每个 class 都有归属面板、每个面板都有状态口径" |

### 3.1 合屏（§1）

| 幕 id | 屏幕 | 状态 | 看什么 |
|---|---|---|---|
| `start-playing` | 开始 | 视频播放中 | 背景/视频/底部闪烁提示，整屏可点＝跳过（照搬 `1_Start`） |
| `start-revealed` | 开始 | 收尾 | 白遮罩 1s 淡入 → 0.5s 后出「进入软件」 |
| `loading` | 加载 | 46% | 背景图 + 随机提示 + 底部进度条（照搬 `LoadingPanel`） |
| `content-light` | 内容 | 默认 | 场景 + 四块悬浮玻璃面板的完整版面 |
| `content-dark` | 内容 | 深色 | 玻璃质感最强的形态 |
| `content-split` | 内容 | 拆分 / 60% 透明 | `--tint` 随系统变色、拆分与透明度联动 |
| `content-en` | 内容 | English | 文案全部走字典，版式不变 |
| `content-chat-chip` | 内容 | 对话收起 + 详情空态 | 收起不销毁、空态只给引导 |
| `content-anatomy` | 内容 | 版面解剖 | 尺寸/锚点标注（标注层只在样张页） |

### 3.2 面板逐节（§2）

| 幕 id | 面板 | 特写倍率 | 状态矩阵条数 | 该节要说清的 |
|---|---|---|---|---|
| `p-topbar` | `.panel--topbar` 顶栏 | 1.1× | 5 | 三个开关（性别/语言/主题）+ 返回 + 水印；省略策略 |
| `p-sidebar` | `.panel--sidebar` 系统树 | 1.35× | 7 | 系统行三态、体素行三态、展开收起、滑条与拆分 |
| `p-detail` | `.panel--detail` 详情 | 1.25× | 4 | 字段顺序、空态、长文滚动、问 AI 入口 |
| `p-chat` | `.panel--chat` 对话 | 1.25× | 5 | 展开/收起、两种气泡、空输入、窄屏回落 |
| `p-stage` | `.scene` / `.stage` 场景悬浮件 | — | 4 | 工具胶囊/徽标/提示/占位剪影、接入边界、指针事件 |
| `p-start` | `.start__*` 开始页（照搬） | 1× | 5 | 视频/遮罩/提示/按钮时序、白遮罩原因、自动播放兜底 |
| `p-loading` | `.loading__*` 加载页（照搬） | 1× | 3 | 两段进度、随机提示、为什么没有阶段清单 |
| `p-control` | `.btn` / `.seg` / `.tag` / `.field` / `.range` / `.toast` | 1.1× | 7 | 九个控件状态口径统一在此定义，面板内不重复定 |

## 3.3 素材来源（照搬上游）

| 素材 | 来源（Unity v1.1） | 落位（`public/media/`，不入库） |
|---|---|---|
| 开始页背景 | `Assets/Sprites/StartBg.png`（3840×2160） | `ui/start/StartBg.png` |
| 开场视频 | `Assets/StreamingAssets/Video/StartVideo.mp4`（约 39MB，15s） | `video/StartVideo.mp4` |
| 加载页背景 | `Assets/Sprites/LoadingBg.png`（3840×2160） | `ui/loading/LoadingBg.png` |
| 通用底板 | `Assets/Sprites/Public/{BaseBG,BlackBG,LightBG,Round,RoundRect}.png` | `ui/common/` |
| 退出图标四态 | `Assets/Sprites/UI/ICO_Quit_{Normal,Pressed,Selected,Highlight}.png` | `ui/icon/` |
| 标题图 | `Assets/Sprites/UI/Title.png`（2416×408） | `ui/title/Title.png` |

> `public/media/` 整体被 `.gitignore` 忽略，**新克隆的仓库里没有这些文件**：先跑 `node .workflow/scripts/pull-assets.mjs` 从上游恢复，样张页与应用才显示得出图。样张页（`mockups.html`）直接引用该目录，改路径请同批改其中的 `ASSETS` 常量。

## 4 版面口径（1920×1080）

| 项 | 值 | 令牌 |
|---|---|---|
| 屏幕四周留白 | 16 | `--pad` |
| 顶栏 | 高 56、左右贴 16、圆角 14 | `--topbar-h` / `--radius-lg` |
| 系统树 | 宽 288，顶 88、底 16 | `--sidebar-w` |
| 详情 | 宽 360，顶 88、底 16 | `--detail-w` |
| AI 对话 | 宽 342、最高 52vh，贴在详情左侧 | — |
| 场景内工具胶囊 | 顶部居中（偏左 36，避开系统树视觉重心） | — |
| 层级 | 场景 0 → 场景内悬浮件 1 → 面板 2 → 悬浮球 3 → 轻提示 20 | `--z-*` |

## 5 重渲预览

```powershell
powershell -ExecutionPolicy Bypass -File docs/design/tools/render-previews.ps1
# 只重渲指定幕
powershell -ExecutionPolicy Bypass -File docs/design/tools/render-previews.ps1 -Only content-dark,content-anatomy
```

脚本按 `CHROME_PATH` → Chrome → Edge 的顺序找浏览器；每幕独立 `--user-data-dir`，输出 1920×1080。

幕 id 全表：`start-light` `start-dark` `loading` `content-light` `content-dark` `content-split` `content-en` `content-chat-chip` `content-anatomy`（合屏）＋ `p-topbar` `p-sidebar` `p-detail` `p-chat` `p-stage` `p-start` `p-loading` `p-control`（面板特写）。评审单个面板时可开 `mockups.html?only=p-sidebar`，只显示那一节（含矩阵）。

## 6 已知限制

- 样张页**自带一份文案与假数据**（`mockups.html` 内的 `T` / `OBJ` / `SYSTEMS`），为了离线可开；真实文案与数据在 `src/ui/i18n.ts` 与 `src/data/`，两者不一致时以 `src/` 为准。
- 三维区是 SVG 占位；three.js 接入后样张的 `content-*` 幕需要重渲，占位剪影会换成真实截图。
- 浅色主题的玻璃质感天然弱于深色（背后无明暗差可模糊）；若后续调浅色参数，改 `tokens.css` 后重跑脚本即可同步预览。
- 解剖标注幕（`content-anatomy`）的标签会压在面板上——它是标注层，不参与实现。
- 状态矩阵写的是**设计口径**（该状态应该长什么样、由什么触发）；实现细节以 `src/` 为准，两边不一致时先改样张再改代码（同批）。
- 特写帧的背景网格是样张页的对照底，不属产品 UI。

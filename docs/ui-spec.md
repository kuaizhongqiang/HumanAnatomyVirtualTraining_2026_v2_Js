# ui-spec — UI 令牌与 class 清单

读者：AI / 设计与前端
类型：UI 规范（令牌 + class 清单）
权威：设计令牌与所有 class 的唯一清单；实现位置见各文件头注释，业务口径见 `business.md`
状态：2026-10-30 建立，覆盖三屏（start / loading / content）与全部组件；改 class 必须同批改本文
依赖：`src/styles/tokens.css`、`src/styles/components/*.css`、`AGENT.md` §3（表现层硬口径）

## 1 分层与规则

```
tokens.css   → 只有令牌允许写字面量（颜色/尺寸/阴影/时长）
base.css     → 标签级复位，无业务 class
layout.css   → 屏幕骨架 + 场景背景
components/  → 一组件一文件，类名见 §3
```

命名：块 `block`、元素 `block__element`、修饰符 `block--modifier`（状态/变体），最多两级。新增 class 三步走：① `tokens.css` 补变量（若需要）② 组件文件写样式 ③ 本文 §3 加一行。

## 2 设计令牌（`src/styles/tokens.css`）

| 组 | 变量 | 说明 |
|---|---|---|
| 字体 | `--font-sans` `--font-mono` `--fs-11…28` `--lh-*` `--fw-*` | 字号只有 11/12/13/14/16/20/28 六档（28 用于大标题） |
| 间距 | `--space-1…10` | 4 的倍数：4/8/12/16/20/24/32/40 |
| 圆角 | `--radius-xs…xl` `--radius-pill` | 面板用 `xl`(20)，控件用 `md`(10) |
| 动效 | `--dur-fast/base/slow` `--ease-out` | 交互 120ms，面板 220ms，切屏 360ms |
| 层级 | `--z-scene` `--z-scene-ui` `--z-panel` `--z-float` `--z-toast` `--z-overlay` | 场景 0 → 面板 2 → 悬浮 3 → 提示 20 |
| 布局 | `--pad` `--topbar-h` `--sidebar-w` `--detail-w` | 窄屏只改这三个尺寸，不改结构 |
| 颜色 | `--c-bg` `--c-bg-deep` `--c-surface` `--c-text-1/2/3` `--c-line` `--c-brand` `--c-brand-ink` `--c-brand-soft` `--c-danger` | 明暗各一套 |
| 玻璃 | `--glass` `--glass-strong` `--glass-border` `--glass-sheen` `--glass-blur` `--glass-sat` `--glass-brightness` | 玻璃质感四件套 |
| 光学 | `--specular` `--chroma-a` `--chroma-b` `--edge-dark` `--inner-glow` | 镜面高光 / 色散 / 边暗线 / 内发光 |
| 阴影 | `--shadow-1/2/3` | 三级抬升（静止 / hover / 对话框） |
| 场景光 | `--glow-a` `--glow-b` `--scene-grid` `--scene-bg` `--tint`（运行时注入） | `--tint` = 选中系统的颜色 |
| 其他 | `--track` | 进度条 / 滑条轨道 |

## 3 class 清单（按文件）

### 3.1 `layout.css`

| class | 作用 |
|---|---|
| `.app` | 应用根，定位上下文与屏幕容器 |
| `.screen` | 单屏铺满容器（`absolute inset:0`），带入场动画 |
| `.screen--start` | 开始页：居中 |
| `.screen--loading` | 加载页：居中 |
| `.screen--content` | 内容页：`display:block`，场景铺底 |
| `.scene` | 内容页全幅背景层（网格 + 三团柔光） |
| `.scene--dim` | 场景压暗（打开对话框等场景预留） |

### 3.2 `components/panel.css`

| class | 作用 |
|---|---|
| `.panel` | 毛玻璃面板基座（模糊 + 高光 + 内发光 + 色散 + 外投影） |
| `.panel--dialog` | 开始/加载页的居中对话框 |
| `.panel--topbar` | 内容页顶栏（横排、满宽） |
| `.panel--sidebar` | 左侧系统树面板 |
| `.panel--detail` | 右侧体素详情面板 |
| `.panel--chat` | 右下 AI 对话面板 |
| `.panel__head` | 面板标题栏（标题 + 右侧提示） |
| `.panel__title` | 面板标题（小号大写，弱层级） |
| `.panel__hint` | 标题栏右侧辅助说明 |
| `.panel__foot` | 面板底部操作区（在 `system-tree.css` 定义） |

### 3.3 `components/topbar.css`

| class | 作用 |
|---|---|
| `.topbar__brand` | 左品牌区容器 |
| `.topbar__mark` | 品牌图标方块（渐变 + 内高光） |
| `.topbar__text` | 品牌文字容器（可省略） |
| `.topbar__title` | 产品中文名单行 |
| `.topbar__subtitle` | 产品英文名单行弱化 |
| `.topbar__right` | 右侧控件组 |

### 3.4 `components/control.css`

| class | 作用 |
|---|---|
| `.btn` | 按钮基座（透明） |
| `.btn--primary` | 主行动（品牌实心） |
| `.btn--ghost` | 次行动（玻璃底 + 描边） |
| `.btn--active` | 开关型按钮的开启态 |
| `.btn--block` | 宽度拉满 |
| `.btn--icon` | 32×32 方形图标按钮 |
| `.btn--large` | 加大号（开始页主按钮） |
| `.seg` | 分段选择器容器 |
| `.seg__item` | 分段项 |
| `.seg__item--active` | 分段项选中态 |
| `.tag` | 小标签（体素 id 等，等宽字体） |
| `.watermark` | 顶栏试用/版本水印 |
| `.field` | 表单行（左标签右控件） |
| `.field__label` | 表单行标签 |
| `.range` | 滑条行（文字 / 滑轨 / 数值三列） |
| `.range__value` | 滑条数值（等宽数字） |
| `.range__input` | 原生 range（只重着色） |

### 3.5 `components/stage.css`

| class | 作用 |
|---|---|
| `.stage` | 场景内悬浮件容器（只放可交互件，其余穿透） |
| `.stage__tools` | 顶部居中工具胶囊容器 |
| `.stage__tool` | 单个工具按钮（旋转/复位/聚焦/全屏） |
| `.stage__badge` | 右上状态徽标（3D 视口待接入） |
| `.stage__hint` | 底部说明文案 |
| `.figure` | 人体占位剪影（SVG，虚线） |
| `.figure--split` | 拆分态：各段向外错开 |

### 3.6 `components/system-tree.css`

| class | 作用 |
|---|---|
| `.tree` | 系统列表滚动容器 |
| `.tree__section` | 一个系统（含体素列表） |
| `.tree__section--active` | 当前系统（整行染色） |
| `.tree__head` | 系统行按钮 |
| `.tree__dot` | 系统色点（带同色光晕） |
| `.tree__name` | 系统名（超长省略） |
| `.tree__count` | 体素数量 |
| `.tree__list` | 体素列表（缩进） |
| `.tree__leaf` | 体素行按钮 |
| `.tree__leaf--active` | 当前选中体素（左侧色条） |
| `.tree__leaf-name` | 体素名 |
| `.tree__leaf-id` | 体素 id（等宽弱化） |
| `.panel__foot` | 面板底部操作区 |

### 3.7 `components/detail.css`

| class | 作用 |
|---|---|
| `.detail__name` | 体素主名行 |
| `.detail__name-sub` | 名称的第二语言（小字） |
| `.detail__list` | 字段列表滚动区 |
| `.detail__row` | 单个字段块 |
| `.detail__term` | 字段名（大写小字 + 系统染色） |
| `.detail__desc` | 字段正文 |
| `.detail__empty` | 未选中空态 |

### 3.8 `components/chat.css`

| class | 作用 |
|---|---|
| `.chat__head` | 对话标题栏 |
| `.chat__messages` | 消息滚动区 |
| `.chat__msg` | 气泡基座 |
| `.chat__msg--bot` | 助手气泡（左，玻璃底） |
| `.chat__msg--user` | 用户气泡（右，品牌渐变） |
| `.chat__form` | 输入行 |
| `.chat__input` | 输入框 |
| `.chat__fab` | 收起的悬浮球 |

### 3.9 `components/toast.css`

| class | 作用 |
|---|---|
| `.toast` | 轻提示（默认透明不可见） |
| `.toast--visible` | 显示态（JS 加/去） |

### 3.10 `components/screen-start.css`（照搬上游 `1_Start` / `StartPanel`）

| class | 作用 |
|---|---|
| `.start` | 全屏舞台（视频/背景/遮罩都叠在它上面） |
| `.start__bg` | 开场背景图（`public/assets/ui/start/StartBg.png`） |
| `.start__video` | 开场视频（`public/assets/video/StartVideo.mp4`，淡入 0.5s） |
| `.start__cover` | 收尾遮罩，**纯白**（对齐上游 `CoverImage.m_Color`），1s 淡入 |
| `.start__cover.is-on` | 遮罩已淡入（视频结束/被跳过） |
| `.start__tips` | 底部提示「点击屏幕任意位置跳过视频...」，带闪烁动画 |
| `.start__tips.is-hidden` | 收尾时隐藏提示 |
| `.start__enter` | 「进入软件」按钮（160×30 居中，上游尺寸） |
| `.start__corner` | 右上角新增能力（语言 / 主题 / 版本水印） |

### 3.11 `components/screen-loading.css`（照搬上游 `LoadingPanel`）

| class | 作用 |
|---|---|
| `.loading` | 全屏舞台 |
| `.loading__bg` | 加载背景图（`public/assets/ui/loading/LoadingBg.png`） |
| `.loading__tip` | 提示块（419×225，中心下方 225） |
| `.loading__tip-text` | 提示正文（每次进入随机一条） |
| `.loading__slider` | 底部进度条轨道（500×20，距底 150） |
| `.loading__slider-fill` | 进度填充（宽度由 JS 写内联 style） |

## 4 三屏结构

| 屏幕 | 对应上游 | 主要 class |
|---|---|---|
| 开始 | `1_Start` / `StartPanel` | `.screen--start` → `.start` → `__bg` / `__video` / `__cover` / `__tips` / `__enter`（整屏可点＝跳过） |
| 加载 | `LoadingPanel` | `.screen--loading` → `.loading` → `__bg` / `__tip` / `__slider` |
| 内容 | `2_Content` | `.screen--content` → `.scene` + `.stage` + 四块 `.panel--*` |

## 5 约束（与 `AGENT.md` §3 对齐）

- 组件内**不写字面量**颜色/尺寸；明暗差异只在 `tokens.css` 的两组 `:root[data-theme]`。
- 文案不写进 CSS；可见文案一律来自 `src/ui/i18n.ts`。
- 玻璃面数量影响 GPU：当前每屏最多 4 大 + 3 小，降级策略见 `TODO.md` `T-17`。

# Contract: src/ui

Role: 表现层——应用外壳、主题 token 消费、双语字典；只发意图、不持有业务状态（状态归 `control`/`manager`）。

Files:
- `shell.ts` — 外壳渲染与交互分发：顶栏（性别 / 语言 / 主题）、系统树、视口占位、详情卡、悬浮 AI 对话；状态集中在 `State`，事件用根节点委托。
- `shell.css` — 外壳组件样式，只用 `src/style.css` 里的变量。
- `i18n.ts` — 中英字典与 `t()`，`setLocale()` 切换；缺词回退为键名便于发现漏词。
- `theme.ts` — `data-theme` 切换与 `localStorage` 记忆，首帧由 `index.html` 内联脚本兜底。
- `i18n.test.ts` — 字典与插值的单元测试。

Exports: `mountShell(root)`；`t` / `setLocale` / `getLocale` / `systemNameInEnglish`；`applyTheme` / `toggleTheme` / `currentTheme` / `ensureTheme`。

Notes:
- **mockup 阶段**：`shell.ts` 里所有业务数据来自 `../data/mockData`，三维区域是 SVG 占位；接 three.js 时只替换 `renderStage()` 与拾取回调，不改外层结构。
- 重绘策略是「整树重绘 + 根节点事件委托」，所以不要在外壳 DOM 上挂一次性监听；滑块拖动走局部更新（重绘会打断拖拽）。
- 文案一律走 `t()`，色值一律走 CSS 变量（`AGENT.md` §3 表现层两条硬口径）。

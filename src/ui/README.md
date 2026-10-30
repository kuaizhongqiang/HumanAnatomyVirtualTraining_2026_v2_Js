# Contract: src/ui

Role: 表现层——屏幕编排、主题 token 消费、双语字典；只发意图、不持有业务状态（业务状态归 `control`/`manager`）。

Files:
- `app.ts` — 屏幕状态机：`start` / `loading` / `content` 三屏切换，持有共享 `AppState`（性别、版本）。
- `screens/` — 三个屏幕模块，见该目录 `README.md`。
- `i18n.ts` — 中英字典与 `t()`，`setLocale()` 切换；缺词回退键名便于发现漏词。
- `theme.ts` — `data-theme` 切换与 `localStorage` 记忆，首帧由 `index.html` 内联脚本兜底。
- `i18n.test.ts` — 字典与插值的单元测试。

Exports: `mountApp(root)`；`t` / `setLocale` / `getLocale` / `systemNameInEnglish`；`applyTheme` / `toggleTheme` / `currentTheme` / `ensureTheme`；类型 `ScreenName` / `AppState` / `Go`。

Notes:
- **mockup 阶段**：屏幕里的业务数据来自 `../data/mockData`，三维区域是 SVG 占位；接 three.js 时只替换 `content.ts` 的 `stage()` 与拾取回调，不动外层结构。
- **样式不在本目录**：所有 class 定义在 `../styles/`，清单见 `docs/ui-spec.md`；本目录只产出 class 名与结构。
- 屏幕之间不互相引用，跨屏只走 `go(screen)`；切屏会重建 DOM，因此监听器都挂在屏幕根节点（事件委托）。
- 文案一律走 `t()`（`AGENT.md` §3 表现层硬口径）；玻璃/光照参数只引用 `styles/tokens.css` 的变量。

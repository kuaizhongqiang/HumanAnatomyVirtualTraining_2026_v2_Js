# Contract: src/styles

Role: 样式层。按「令牌 → 基座 → 骨架 → 组件」四层组织，只有 `tokens.css` 允许出现颜色/尺寸的字面量。

Files:
- `tokens.css` — 设计令牌：字号、间距、圆角、动效、层级、布局尺寸，以及明暗两套颜色/玻璃/阴影/场景光变量。
- `base.css` — 复位与标签级排版（`body` / `button` / 滚动条 / `prefers-reduced-motion`），不含业务 class。
- `layout.css` — 屏幕容器（`.app` / `.screen--*`）与场景背景（`.scene` 及其伪元素网格与全局光）。
- `components/*.css` — 每个组件一文件，类名见 `docs/ui-spec.md`。
- `index.css` — 汇总入口，按层顺序 `@import`。

Exports: 无（CSS 侧只被 `src/main.ts` 引入一次）。

Notes:
- 组件里出现新颜色/尺寸时，先在 `tokens.css` 加变量，再引用 `var(--*)`；禁止在组件文件里写字面量（`AGENT.md` §3 表现层硬口径）。
- 明暗差异只允许出现在 `tokens.css` 的 `:root[data-theme]` 两组里。
- 新增/改名 class 必须同批更新 `docs/ui-spec.md`。

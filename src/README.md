# Contract: src

Role: 业务源码根——只放实现，不放产物、文档、资产；每个子目录一份 `README.md` 作路径契约。

Files:
- `main.ts` — 应用入口：取 `#app` 并挂载 UI 外壳（后续在此串 data → obj → camera → ui 的显式初始化链）。
- `style.css` — 全局重置、明暗主题 token、基础控件；组件样式在 `src/ui/shell.css`，组件内禁止写死颜色。

Exports: 无（入口文件，不被 import）。

Notes:
- 依赖方向单向：`ui → manager → control / obj / camera / data → api`，反向引用视为缺陷。
- 当前只有 `data` 与 `ui` 两个域；其余五域（`api` `control` `obj` `camera` `manager`）随迁移落地，见 `docs/TODO.md` `T-7`。
- 三维视口在 `src/ui/shell.ts` 里只是占位，three.js 接入是后续任务（`T-7`/`T-8`）。

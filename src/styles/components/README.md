# Contract: src/styles/components

Role: 组件级样式，一个组件一个文件；类名一经确定即写入 `docs/ui-spec.md` 的清单，供里程碑评审与后续实现对照。

Files:
- `panel.css` — `.panel` 毛玻璃面板（含高光/色散/内发光）与四块内容页定位修饰符、`.panel__head`/`__title`/`__hint`。
- `topbar.css` — `.topbar__*` 顶栏内部元素。
- `control.css` — `.btn` / `.seg` / `.tag` / `.watermark` / `.field` / `.range` 等基础控件。
- `stage.css` — `.stage__*` 场景悬浮件与 `.figure` 人体占位（含 `--split` 拆分段位）。
- `system-tree.css` — `.tree__*` 系统树与 `.panel__foot` 底部操作区。
- `detail.css` — `.detail__*` 体素详情字段。
- `chat.css` — `.chat__*` AI 对话浮层。
- `toast.css` — `.toast` 轻提示。
- `screen-start.css` — `.start__*` 开始页。
- `screen-loading.css` — `.loading__*` 加载页。

Exports: 无（仅被 `../index.css` 引入）。

Notes:
- 组件样式只引用 `../tokens.css` 的变量，不跨组件直接改别人的类。
- 修饰符统一用 `--`（状态/变体），元素统一用 `__`；不要新增三级嵌套。

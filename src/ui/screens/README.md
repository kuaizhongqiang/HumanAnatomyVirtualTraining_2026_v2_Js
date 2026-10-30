# Contract: src/ui/screens

Role: 三个屏幕各一个模块，对应上游场景与面板：开始（`1_Start`）/ 加载（`LoadingPanel`）/ 内容（`2_Content`）。屏幕只负责自己那屏的 DOM 与交互，切屏由 `../app.ts` 统一调度。

Files:
- `start.ts` — 开始页：品牌、性别选择、语言/主题、进入（→ `loading`）。
- `loading.ts` — 加载页：进度条 + 四阶段清单；结构只渲染一次，之后原地改进度；完成自动进 `content`，可取消回 `start`。
- `content.ts` — 内容页：全幅场景 + 四块悬浮面板（顶栏/系统树/详情/对话），含选中态、拆分、透明度、镜面高光跟随。

Exports: 每个模块一个 `mountX(host, ...)`，签名由 `../app.ts` 调用约定。

Notes:
- 屏幕模块**不互相引用**；跨屏只通过 `go(screen)`。
- 共享业务状态（性别）在 `AppState` 里；屏幕内的临时状态（选中系统、对话消息）留在各自模块闭包里。
- 加载页目前是模拟进度（`setInterval`），真实加载接上后替换 `tick` 的推进来源。

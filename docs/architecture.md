# architecture — 架构：上游复原与 Web 目标

读者：AI
类型：架构说明
权威：上游框架怎么转、Web 侧目标架构与关键技术决策；目录见 `structure.md`，字段见 `business.md`
状态：2026-10-30 建立。§2 为**设计蓝图**（`src/` 尚未实现）；上游部分依据 v1.1 源码复原
依赖：`AGENT.md` §3（模块边界与依赖方向）、`DECISION.md` `D-20261030-03/06/07`

## 1 上游（Unity v1.1）复原

### 1.1 启动链

`0_Setup` → `Setup.DelayInit()` 轮询三个管理器的 `IsInit`（各最多 5 秒，超时仅告警不中止）→ `1_Start`（加载/入口）→ `2_Content`（主体）→ `Preview`（预览场景）。

**范式要点**：不依赖 `Awake/Start` 的隐式顺序，而是**显式等待依赖就绪**并暴露 `IsInit`。Web 侧必须保留这个性质（§2.1）。

### 1.2 管理器（`GlobalManagement`）

| 类 | 职责 |
|---|---|
| `GlobalDataMgr` | 读 `StreamingAssets/{ConfigData,HumanBodyData}.json`；持有 `maleData`/`femaleData`；性别切换（防重入 `isChangingSexual`）；授权判定 `ifConfirmKey()`；失败时回退 `new ConfigData()` |
| `GlobalInteractiveMgr` | 体素对象的注册、拾取分发、选中态 |
| `GlobalCameraMgr` / `CamControlMgr` | 相机状态、聚焦、背景 |
| `GlobalAiMgr` | AI 编排：`AiApi` ＋ `AiResponseParser` ＋ `HistoryManager` ＋ `commandQueue`；工具调用最多 `MAX_TOOL_CALL_ROUNDS = 3` 轮；双通道（豆包普通对话 / DeepSeek function call） |
| `Singleton<T>` | 单例基类，暴露 `IsInit` |

### 1.3 交互对象（`Anatomy.InteractiveObj`）

`InteractiveObjBase`（抽象）→ `BodyObj`（体素）/ `SystemObj`（系统）。

- 依赖 `Collider` ＋ `HighlightPlus` 的 `HighlightEffect` 做鼠标悬停/点击高亮。
- 材质成对：正常材质 + `Resources/Materials/<名>_Transition` 过渡材质（按**名字**运行时加载），材质字典 `Dictionary<材质索引, Material[正常, 透明]>` 用于拆分/透明。
- 回调三件：`MouseIn` / `MouseDown` / `MouseClick`。

### 1.4 表现层（`Anatomy.UI`）

`ContentCanvas`（内容画布）＋ 面板 12 个：`AiChatPanel`、`ControlClipPanel`、`ControlListPanel`、`DetailShowPanel`、`FunctionPanel`、`LoadingPanel`、`MessageBoxPanel`、`StartPanel`、`TipsPanel`、`TitlePanel`、`ViewControlPanel`、`WaterMarkPanel`（`UICanvasBase` / `UIPanelBase` 为基类）。

## 2 Web 目标架构（设计蓝图，待实现）

### 2.1 初始化顺序（对齐上游 `Setup` 语义）

```
data.init()      载入并校验 JSON、构建索引（失败即阻断，非静默）
  → obj.init()   加载 GLB、建立 体素 id → 节点 映射
  → camera.init()
  → ui.init()    字典与主题先就绪，再挂面板
  → app.ready    对外暴露 ready promise，禁止模块副作用抢跑
```

### 2.2 分层与依赖

```
src/ui  →  src/manager  →  src/{control,obj,camera,data}  →  src/api
```

- 跨域只走各域 `Exports`（路径 `README.md` 声明）；反向引用视为缺陷。
- `src/data` 的类型与 `business.md` §4 字段一一对应；JSON 只在此层解析一次，其它层只吃类型化对象。

### 2.3 渲染与拾取

| 环节 | 方案 | 状态 |
|---|---|---|
| 模型加载 | `GLTFLoader` 加载 `blender` 产出的 `glb`；一系统一文件（便于按需加载） | 待实现（`T-7`） |
| 节点匹配 | GLB 节点名 == 体素 `id`（`business.md` §5），不匹配即报错 | 待实现 |
| 拾取 | `Raycaster` + 对象 `userData.id`，替代上游 `Collider` | 待实现 |
| 高亮 | 候选：后处理描边 / 材质替换 / `OutlinePass`；需与 SSS 材质共存 | 待定（`T-7`） |
| 材质过渡 | 上游按名加载 `<名>_Transition` → 改为**显式材质注册表**，缺项即报错 | 待实现 |
| 皮肤/内脏材质 | `MeshPhysicalMaterial` 的 `transmission` / `thickness` / `clearcoat` 近似 SSS | 待调研（`T-8`） |

### 2.4 状态

显隐、拆分（结构件分解）、透明度三套状态挂在 `src/control`；状态枚举与上游同名同义，UI 只发意图、不改状态本身。切性别需防重入（上游 `isChangingSexual` 的语义保留）。

### 2.5 表现层

- **双语**：字典键 = 内容 `id` 或 UI 语义键；`name`/`engName` 直接来自数据，不再造一份。
- **主题**：`data-theme="light|dark"` + CSS 变量 token；组件内零硬编码色值（`AGENT.md` §3）。

### 2.6 AI 通道（`D-20261030-07`）

`src/api` 单通道 `fetch`：请求 → 响应解析 → 会话历史（内存 + 可选持久化）。工具调用/多轮 function call **本版不做**，扩展点在 `src/api` 内预留，不散到 UI。

## 3 迁移映射

域对照表只此一份，在 `AGENT.md` §3；迁移步骤与 Unity→Web 的坑在 `.agent/skills/anatomy-migrate/SKILL.md`。此处不复述。

## 4 关键技术待办

| 事项 | 影响 | 去向 |
|---|---|---|
| SSS 可行性（three.js `MeshPhysicalMaterial` vs 自定义 shader） | 皮肤/内脏真实感；与高亮叠加时的性能 | `T-8` → 结论回写本文 §2.3 |
| 高亮实现选型 | 与 SSS、透明材质冲突处理 | `T-7` |
| GLB 拆分粒度（整体 vs 按系统 vs 按体素） | 首屏时间与拾取精度权衡 | `T-7`、`T-5`（模型管线） |

## 5 未实现声明

`src/` 目前**不存在**。本文 §2 是设计约束而非现状；实现落地时必须同批更新本文与对应路径 `README.md`（`AGENT.md` §3）。

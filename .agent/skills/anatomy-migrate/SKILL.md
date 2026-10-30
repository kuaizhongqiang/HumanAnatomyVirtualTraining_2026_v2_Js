---
name: anatomy-migrate
description: This skill should be used when porting a module from the upstream Unity project (HumanAnatomyVirtualTraining_2026_v1.1) into src/ - it maps Unity domains to src directories, translates Unity runtime patterns to three.js/TypeScript, and enforces the per-directory README contract.
---

# 上游 Unity 模块迁移

## 何时用

把上游 `Assets/Script` 的某个域搬进 `src/`；或修迁移后"行为与 v1 不一致"的问题。

## 域对照（不得改名换域）

| 上游 | 目标 | 迁移要点 |
|---|---|---|
| `Api/`（AiApi / AiResponseParser / HistoryManager） | `src/api` | 协程 → `async/await`；请求失败要有重试上限；按 `D-20261030-07` 先做单通道 |
| `Data/`（HumanBodyData / ConfigData / Utility） | `src/data` | 类型与 `StreamingAssets` JSON 字段一一对应；`ApproximateSearch` 的匹配口径照搬 |
| `BodyControl/` | `src/control` | 人体拆分/透明度状态机照搬；状态枚举不新增 |
| `InteractiveObj/`（BodyObj / SystemObj / Base） | `src/obj` | `Collider` ＋ `HighlightPlus` → `Raycaster` ＋ 自建高亮/描边材质；`MouseIn/Down/Click` 回调语义保留 |
| `CamControl/`（CamControl / CamBg） | `src/camera` | Cinemachine → 自建轨道控制；相机状态字段同名 |
| `UI/`（Canvas / Panels / Utility） | `src/ui` | 面板栈（打开/关闭/互斥）行为照搬；文案入字典、色值入 token（`AGENT.md` §3） |
| `Manager/`（GlobalData/Interactive/Camera/Ai/…) | `src/manager` | Unity `Singleton<T>` → 显式 `init()` ＋ 模块导出实例；`IsInit` 语义保留 |

## 步骤

1. 读上游该域全部 `.cs`（`../HumanAnatomyVirtualTraining_2026_v1.1/Assets/Script/<域>`），列出：字段、对外方法、跨域调用点。
2. 在 `src/<域>/README.md` 写好契约：`Role` / `Files` / `Exports` / `Notes`（首行 `# Contract: src/<域>`）。
3. 逐文件迁移，**一次一个域**；跨域只走 `manager` 与 `data` 的公开出口（依赖方向 `ui → manager → control/obj/camera/data → api`）。
4. 用上游同一条数据做对照：同一体素 `id`、同一系统名、同一文案键。
5. 收尾：`node .workflow/scripts/gate-all.mjs` 全绿 → 按 `repo-commit` 提交。

## 坑

- Unity 生命周期（`Awake`/`Start`/`OnEnable`）在 Web 里不存在：初始化顺序必须显式（`init()` 链），不要依赖模块副作用碰运气。
- 上游 `Resources.Load<Material>("Materials/X_Transition")` 是运行时按名加载，迁移后这类隐式资源名要改成显式注册表，否则换了打包方式会静默丢材质。
- 体素 `id` 前缀即系统名（`Muscular_…`），女性特有项带 `Female_` 前缀；改名会导致点击/高亮找不到对象。
- 数据有男女两套（`maleData` / `femaleData`），迁移时不要只测一套。

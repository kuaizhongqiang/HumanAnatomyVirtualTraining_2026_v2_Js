# overview — 工程概述

读者：AI
类型：概述
权威：工程定位、技术栈、版本基线、范围与非目标；目录见 `structure.md`，架构见 `architecture.md`
状态：2026-10-30 建立；源码与脚手架尚未落地，阶段划分中带「待确认」的部分需负责人拍板
依赖：`requirement/raw/origin.md`（需求原件）、`DECISION.md`（`D-20261030-03`～`10`）

## 1 定位

人体解剖学知识仿真实训软件的 **Web 重写**（2026 v2）。以 Unity 版 v1 的**数据、功能、三维素材**为基线，用 `three.js` 重建三维表达，UI 重新设计（明暗双主题、中英双语），交付 web 与 Windows 桌面两种形态。

- 产品名（发布口径，来自 `ConfigData.json`）：`人体解剖学知识仿真实训软件` / `HUMAN ANATOMY KNOWLEDGE SIMULATION TRAINING SOFTWARE`
- 试用与 AI 开关：`isTrial`、`isAiActive`、`releaseKey` 见 `business.md` §4

## 2 技术栈（`D-20261030-03`）

| 层 | 选型 | 约束 |
|---|---|---|
| 语言 | `TypeScript`（主）＋ `JavaScript`（例外） | 新代码 `.ts`；`js` 仅上游直译/三方示例，须在该路径 `README.md` 注明 |
| 三维 | `three.js` | 唯一三维栈；不引第二套渲染框架 |
| 构建 | `vite` | 产物 `dist/` |
| 桌面壳 | `electron` | 只做容器，加载同一份 `dist/` |
| 模型 | `blender`（离线） | `fbx → glb`；原始工程不入库 |

## 3 版本基线

| 项 | 值 |
|---|---|
| 上游 Unity | `2022.3.53f1c1`（URP `14.0.11`） |
| 上游工程 | `../HumanAnatomyVirtualTraining_2026_v1.1`（只读） |
| 上游场景 | `0_Setup`（启动装配）、`1_Start`（入口/加载）、`2_Content`（主体）、`Preview` |
| 模型资产 | `../HumanAnatomyAsset/Model` |
| 本仓库 | `github.com/kuaizhongqiang/HumanAnatomyVirtualTraining_2026_v2_Js`，分支 `main` |

## 4 范围

**做**：① 三维人体（九大系统、体素点选与高亮）② 详情与系统说明（中文文案沿用，英文化）③ 视角控制 ④ AI 对话（最简实现）⑤ UI 重设计（明暗主题）⑥ 中英双语 ⑦ web ＋ Windows 交付。

**不做**（本版）：不新增解剖学内容（内容以 v1 为准）；不重做鉴权/授权后端（沿用 `releaseKey` 口径，见 `business.md` §4）；不做移动端适配；不做多人/联网。

## 5 阶段（建议排期，待负责人确认）

| 阶段 | 内容 | 判据 |
|---|---|---|
| M0 基建 | 手册、台账、门禁、CI、发版通道 | 已完成（见 `progress.md`） |
| M1 脚手架 | `package.json` / `vite` / `ts` / lint / 测试入口 | 已完成（typecheck / lint / test / build 全绿） |
| M2 数据层 | `src/data`：契约类型、加载、近似搜索 | 类型与采样已就绪；完整数据待 `P-6`，加载层待 `T-7` |
| M3 渲染与交互 | GLB 资产、相机、点选高亮、拆分/透明度状态 | `TODO.md` `T-7`、`T-8`、`T-15` |
| M4 UI 与双语 | 面板栈、明暗 token、双语字典 | mockup 完成（外壳 ＋ 双主题 ＋ 中英切换）；真实数据接入见 `T-9` |
| M5 AI | 单通道对话与会话历史 | `TODO.md` `T-11` |
| M6 发版 | `release/v0.0.0` 通道跑通 | `TODO.md` `T-12`、`repo.md` §4 |

## 6 相关文档

- 目录与产物：`structure.md`｜仓库与流程：`repo.md`｜架构与迁移：`architecture.md`｜业务与数据：`business.md`

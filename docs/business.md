# business — 业务域与数据契约

读者：AI
类型：业务与数据说明
权威：解剖内容的组织方式、数据字段字典、命名规则；字段类型实现见 `src/data`（待建），架构见 `architecture.md`
状态：2026-10-30 建立，规模数字来自上游 JSON 实算（命令见 §3）；授权口径是否沿用待负责人确认（`TODO.md` `P-6`）
依赖：上游 `Assets/StreamingAssets/{ConfigData,HumanBodyData}.json`（只读真源）

## 1 业务模型（三段）

```
HumanBodyData
└─ maleData / femaleData        两套性别数据
   └─ bodySystemDataList[]      九大系统
      └─ bodyObjDataList[]      体素（器官 / 肌肉 / 骨骼等具体对象）
```

- 用户视角：选性别 → 选系统（九项）→ 点选体素 → 看详情 → 可拆分 / 调透明度 / 切视角 → 可对 AI 提问。
- 体素是**内容与交互的最小单位**：`id` 唯一，三维模型节点与之一一对应。

## 2 九大系统

| `name` | 中文 | 说明 |
|---|---|---|
| `MuscularSystem` | 肌（运动）系统 | 体素最多，面部/躯干/四肢肌群 |
| `SkeletalSystem` | 骨骼系统 | 骨与骨连结 |
| `CirculatorySystem` | 循环系统 | 心与大血管 |
| `RespiratorySystem` | 呼吸系统 | 气道与肺 |
| `DigestiveSystem` | 消化系统 | 消化管与腺体 |
| `LymphaticSystem` | 淋巴系统 | 淋巴器官与管道 |
| `NervousSystem` | 神经系统 | 脑、脊髓、神经 |
| `ReproductiveSystem` | 生殖系统 | 男女差异最大 |
| `UrinarySystem` | 泌尿系统 | 肾、输尿管、膀胱 |

## 3 规模（实算数字）

来源命令：

```powershell
node -e "const j=require('../HumanAnatomyVirtualTraining_2026_v1.1/Assets/StreamingAssets/HumanBodyData.json');for(const g of ['maleData','femaleData'])console.log(g,j[g].bodySystemDataList.length,j[g].bodySystemDataList.reduce((a,s)=>a+s.bodyObjDataList.length,0))"
```

**`HumanBodyData.json`（上游实际读取的那份）**

| 系统 | 男 | 女 |
|---|---|---|
| Muscular | 141 | 140 |
| Skeletal | 27 | 29 |
| Circulatory | 3 | 3 |
| Respiratory | 6 | 6 |
| Digestive | 13 | 13 |
| Lymphatic | 4 | 4 |
| Nervous | 6 | 6 |
| Reproductive | 1 | 3 |
| Urinary | 5 | 5 |
| **合计** | **206** | **209** |

**`HumanBodyData_Female.json`（旁支文件）**：男 203 / 女 206，与上表差异集中在 `Digestive`（12）、`Nervous`（男 6 / 女 7）、`Urinary`（男 3 / 女 4）、`Respiratory`（女 4）。

> ⚠️ 上游 `GlobalDataMgr` 只读 `HumanBodyData.json`（`Application.streamingAssetsPath` 常量 `DataFileName`），`HumanBodyData_Female.json` **未被任何脚本引用**。迁移以 `HumanBodyData.json` 为准；该旁支文件的去留待拍板（`TODO.md` `P-6`）。

## 4 字段字典

**`ConfigData.json`**（发布口径，禁硬编码到源码）

| 字段 | 类型 | 含义 |
|---|---|---|
| `softwareName` | string | 中文产品名 |
| `softwareEngName` | string | 英文产品名 |
| `isTrial` | bool | 试用态 |
| `releaseKey` | string | 授权键；上游 `ifConfirmKey()` 取第 3 个字符 == `'3'` 判定通过 |
| `isAiActive` | bool | AI 功能总开关 |

**系统级 `bodySystemDataList[]`**

| 字段 | 类型 | 含义 |
|---|---|---|
| `name` | string | 系统键（九项固定，见 §2） |
| `description` | string | 系统长文案（数百字，用于系统说明面板 / AI 上下文） |
| `bodyObjDataList` | array | 该系统下的体素 |

**体素级 `bodyObjDataList[]`**

| 字段 | 类型 | 含义 | 展示位置 |
|---|---|---|---|
| `id` | string | 唯一键，`<系统>_<英文名>`，单词下划线连接 | 三维节点匹配、数据索引 |
| `name` | string | 中文名 | 列表、详情标题 |
| `engName` | string | 英文名（含空格） | 双语标题、AI 提示词 |
| `morphology` | string | 形态描述 | 详情面板 |
| `posDesc` | string | 位置描述 | 详情面板 |
| `function` | string | 功能描述 | 详情面板 |

## 5 命名规则（迁移不得改名）

- `id` = `<系统名去 System>_<英文名把空格换下划线>`，例：`Muscular_Zygomaticus_Minor`、`Skeletal_Femur`。
- 女性特有项带 `Female_` 前缀，例：`Female_ReproductiveSystem`。
- 系统键大小写与拼写固定（`MuscularSystem` 等九项）；`id` 大小写敏感。
- 三维模型节点名必须与 `id` 完全一致，否则点选与高亮会静默失效（迁移期最常见的坑）。

## 6 内容口径

- 中文文案**沿用 v1 原文**，不润色、不改专业术语；英文以 `engName` 为准，长文案英译在 `src/ui` 的字典里补齐（`TODO.md` `T-10`）。
- 描述字段是 AI 的知识来源之一：提问时按 `id` / `name` 检索对应字段拼接上下文。
- 上游存在 `Data/Utility/ApproximateSearch.cs`（名称近似匹配），具体用途待迁移时对照上游调用点（`TODO.md` `T-7`）。

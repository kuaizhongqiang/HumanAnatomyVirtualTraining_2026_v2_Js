# 人体解剖学知识仿真实训软件（2026 v2 / Web 版）

人体解剖学知识仿真实训软件的 Web 重写：以 Unity 版 `HumanAnatomyVirtualTraining_2026_v1` 的**数据、功能与三维素材**为基线，用 `three.js` 重建三维表达，UI 重新设计（明暗双主题、中英双语），并对外提供 web 与 Windows 桌面两种交付形态。

> 本仓库当前处于**基建阶段**：流程、门禁、协作规范已就绪，业务源码与构建脚手架尚未落地（进度见 `docs/TODO.md`）。

## 技术栈

| 项 | 选型 | 说明 |
|---|---|---|
| 语言 | `TypeScript`（主）+ `JavaScript` | 新代码一律 `.ts`；`js` 仅用于上游直译或三方示例 |
| 三维 | `three.js` | 人体/器官/系统渲染、拾取与高亮 |
| 构建 | `vite` | 开发服务器与产物 `dist/` |
| 桌面 | `electron` | 仅作容器，加载同一份 `dist/` |
| 模型 | `blender` | `fbx → glb` 转换（原始工程不入库） |

## 目录

| 路径 | 作用 |
|---|---|
| `AGENT.md` | **唯一纪律手册**（做法 / 禁止 / 去哪查）；AI 与人都先读它 |
| `docs/` | 工程内容事实源：`TODO.md`（待办）、`RECORD.md`（提交台账）、`DECISION.md`（拍板台账）、`requirement/raw/`（需求原件） |
| `.workflow/` | 流程与门禁：`scripts/gate-*.mjs`、hook、提交说明模板、SOP 与发布细则 |
| `.github/` | CI（`ci.yml`）、发版（`release.yml`）、PR/Issue 模板、`CODEOWNERS` |
| `.agent/` | Agent 技能包（`repo-commit` / `gate-triage` / `anatomy-migrate` / `release`） |
| `src/`（待建） | 业务源码，按域分目录；每个目录一份 `README.md` 作路径契约 |
| `dist/` `release/`（生成） | web 产物、桌面安装包；**不入库** |

## 本地起步

```powershell
node .workflow/scripts/install-hooks.mjs      # 装门禁 hook（pre-commit / commit-msg），每份工作副本装一次
node .workflow/scripts/gate-all.mjs           # 一次跑全套门禁
```

工程脚手架（`package.json` / `vite.config.ts` / `tsconfig.json`）尚未建立，`npm` 命令暂不可用，登记在 `docs/TODO.md` `T-2`。

## 协作流程：两条通道

**任何改动都不得直接提交到 `main`，必须走「主题分支 → PR → merge」。**

### 通道 A：普通改动（PR + merge，不出版本 tag）

1. 从 `main` 开分支：`feat/<主题>`、`fix/<主题>`、`docs/<主题>`、`chore/<主题>`
2. 提交并推送该分支（本地 `pre-commit` 先跑门禁）
3. 开 PR 到 `main`，**PR 标题写成 `type(scope): 摘要`**（squash 合并后它就是提交说明，`ci` 会校验）
4. 门禁绿 → merge

### 通道 B：发版（PR + merge + 自动 tag + publish）

1. 开 `release/v<major>.<minor>.<patch>` 分支，同批把 `package.json` 的 `version` 改成一致值
2. 开 PR（标题 `chore(release): v<major>.<minor>.<patch>`），`ci` 绿后 merge
3. **合并即触发** `release.yml`：校验版本 → 创建并推送 tag → 构建 web `dist` 与 Windows 安装包 → 挂到 GitHub Release

### tag 规则

首个 tag 必须是 **`v0.0.0`**；格式 `vX.Y.Z`；严格递增；只由流水线创建；与 `package.json` 的 `version` 一致。校验由 `.workflow/scripts/check-release-version.mjs` 执行。

## 门禁

| 门禁 | 拦什么 |
|---|---|
| `gate-doc-paths` | `src/` 下含源码的目录必须有一份 `README.md`（路径契约），首行 `# Contract: <相对路径>` |
| `gate-commit-msg` | 提交说明须为 `type(scope): 摘要`，`type` 受控，≤ 72 字，UTF-8 无 BOM |
| `gate-assets` | 原始工程文件（`blend/max/psd/fbx` 等）与 `dist/`、`release/`、`node_modules/` 不入库，单文件 ≤ 95MB |
| `gate-ledgers` | `AGENT.md` 与三份台账在位、五行头齐全、编号不重复、每条决策三段齐全 |

本地 hook 与 CI 调**同一个脚本**（`.workflow/scripts/gate-all.mjs`），判定只写一份。`--no-verify` 属于绕过门禁，须先经负责人同意。

## 上游（只读）

| 内容 | 位置 |
|---|---|
| Unity 参考工程（数据 / 功能 / 三维素材基线） | `../HumanAnatomyVirtualTraining_2026_v1.1`（Unity 2022.3.53f1c1 / URP 14.0.11） |
| 数据契约真源 | `../HumanAnatomyVirtualTraining_2026_v1.1/Assets/StreamingAssets/`（`ConfigData.json`、`HumanBodyData*.json`） |
| 模型资产 | `../HumanAnatomyAsset/Model` |

## 文档入口

- 纪律与索引：`AGENT.md`
- 待办 / 待拍板：`docs/TODO.md`
- 流程与门禁细则：`.workflow/README.md`
- Agent 技能：`.agent/README.md`

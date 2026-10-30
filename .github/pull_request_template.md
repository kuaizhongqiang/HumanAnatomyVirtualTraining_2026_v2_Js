## 通道

- [ ] **通道 A（普通）**：主题分支 → PR → merge，不出版本 tag
- [ ] **通道 B（发版）**：`release/vX.Y.Z` 分支，已同批改 `package.json` 的 `version`，merge 后由流水线打 tag 并 publish

> PR 标题必须是 `type(scope): 摘要`（squash 合并时即提交说明，`ci` 会校验）；发版 PR 用 `chore(release): vX.Y.Z`。

## 这次改了什么

<!-- 一句话说清逻辑变更；无关改动请拆开提 -->

## 涉及路径

- [ ] `src/` 代码：同批更新了该路径 `README.md`（`Files` / `Exports` / `Notes`）
- [ ] `docs/` 文档：与代码口径一致
- [ ] 资产：入库的是 `glb` 等产物，原始工程文件未入库

## 台账收尾（三件缺一即未完成）

- [ ] `docs/TODO.md`：删掉本次做完的条目
- [ ] `docs/RECORD.md`：追加 `R-…`
- [ ] `docs/DECISION.md`：有负责人新拍板则追加 `D-…`

## 门禁

- [ ] 本地 `node .workflow/scripts/gate-all.mjs --commit-msg <说明文件>` 全绿
- [ ] CI `gates` job 通过

## 备注

<!-- 风险、回滚方式、遗留问题（遗留项请落到 docs/TODO.md） -->

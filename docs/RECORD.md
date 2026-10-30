# RECORD — 提交台账

读者：AI
类型：提交台账（只追加）
权威：已进入仓库的提交的唯一台账；待办见 `TODO.md`，拍板见 `DECISION.md`
状态：2026-10-30 建立，记 1 条
依赖：`AGENT.md` §4（提交纪律）、`docs/repo.md`（未建，仓库事实）

## 1 写法

- 只追加、不改旧条；**一条 = 一次逻辑变更**，不把无关改动并进同一条。
- 编号 `R-YYYYMMDD-NN` 递增，不复用、不回收；日期取提交日。
- 版本列写仓库与号：`cs:N`（Plastic）/ `rN`（SVN）/ 短 hash（git）；多仓同批成对写全。
- 只写"改了什么、落在哪个版本号、动了哪些路径"；不写待办、不写拍板理由（各归 `TODO.md` / `DECISION.md`）。
- 提交后先按 `AGENT.md` §4 回读原始字节复核，再落本表。

## 2 台账

| 编号 | 日期 | 版本 | 变更 | 涉及路径 |
|---|---|---|---|---|
| R-20261030-01 | 2026-10-30 | git `1067331`（main） | 建立唯一手册 `AGENT.md` 与指针 `CODEBUDDY.md`；建三份台账；录需求原件；落账 `D-20261030-01`～`07` | `AGENT.md`、`CODEBUDDY.md`、`docs/TODO.md`、`docs/RECORD.md`、`docs/DECISION.md`、`docs/requirement/raw/origin.md` |

# 提交说明模板

用法：复制成 `.git/commit-msg.txt`（UTF-8 **无 BOM**），填好后 `git commit -F .git/commit-msg.txt`。

## 格式

```
<type>(<scope>): <摘要，≤ 72 字，不带句号>

- <改了什么>
- <为什么 / 影响面>
- <台账：TODO 删 T-x；RECORD 记 R-…；DECISION 记 D-…>
```

`type` 白名单：`feat` `fix` `docs` `chore` `refactor` `test` `build` `ci` `revert`
`scope` 取路径或域：`workflow` `ci` `docs` `agent` `src` `data` `ui` `api` `manager` `obj` `camera` `control` `release`

## 示例

```
feat(ui): 明暗双主题 token 与切换入口

- 新增 src/ui/theme：data-theme 切换与 token 变量表
- 面板色值全部改走 token，禁写死
- 台账：TODO 删 T-9；RECORD 记 R-20261031-01
```

## 硬性约束

- 中文说明**只能**走文件 + `-F`，禁止 `git commit -m "中文"`。
- 提交后用 `git log -1 --format=%B` 回读复核（控制台回显不可信）。
- 一次逻辑变更 = 一次提交；台账三件收尾同批完成（`AGENT.md` §4）。

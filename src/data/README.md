# Contract: src/data

Role: 数据契约与只读访问——类型定义、采样数据、后续的加载与校验（对齐 `docs/business.md` §4 字段字典）。

Files:
- `types.ts` — `HumanBodyData` / `GenderData` / `BodySystem` / `BodyObj` 类型，字段名与上游 JSON 严格一致。
- `mockData.ts` — mockup 用数据入口：读取 `sample/human-sample.json`，提供系统列表与按 id 查询。
- `sample/human-sample.json` — **真实性采样**：从上游 `HumanBodyData.json` 每个系统取前 2 个对象、描述截断 120 字；完整数据待 `TODO.md` `P-6` 拍板后替换。
- `mockData.test.ts` — 采样数据的结构断言（九系统、字段齐、id 唯一）。

Exports: `types.ts` 的类型；`mockData.ts` 的 `systems()` / `findBodyObj()` / `systemColor()`。其它域只准从这两处取数据。

Notes:
- 字段名 `function` 是数据里的既有键，不要改名为 `fn` 之类，否则与上游对不上。
- 本层是**唯一**解析 JSON 的地方；UI 只吃类型化对象。
- 采样数据不是最终数据源，禁止在此堆积业务逻辑。

# T057｜校园大使 / 推荐官与榜单状态组件

**原派卡编号：T045（因与既有核心大使任务链编号冲突，2026-09-02 纠正为 T057）**  
**类型：原型设计 / 施工卡**  
**状态：PASS**  
**范围：V1.0 正常需求**  
**前置：T055、T056、项目既有 design token / icon 体系**

## 背景

「校园大使」与「推荐官」均属于学习排行榜 V1.0 的正式身份展示能力，不是可延期装饰项。两种身份需要在课程首页 Top 3、排行榜 Top 10 和「我的排名」中稳定使用。

## 目标

完成两种身份 Badge 与排行榜关键状态的高保真组件表达，保证身份识别清楚，同时不抢过排名和学习时长。

## 原型实现点

### 身份 Badge

- 为「校园大使」提供专属 Badge。
- 为「推荐官」提供专属 Badge。
- 两种 Badge 使用不同轻量语义图标与既有语义色，快速区分但不抢占主信息。
- Badge 放置在昵称附近，并在课程首页 Top 3、普通榜单行、Top 1–3 与「我的排名」中复用同一组件。
- 不使用大面积色块、重阴影或夸张贴纸。
- 复用项目现有 design token。
- 当前仓库业务页面实际统一使用 `lucide-react` 图标体系；本卡沿用既有图标语言，不散落临时 SVG。

### 必须覆盖的状态组合

- 普通用户；
- 校园大使；
- 推荐官；
- 用户本人；
- Top 1；
- Top 2；
- Top 3；
- 普通 Top 10 榜单行；
- 非 Top 10 的「我的排名」。

当前身份数据仍以数组表达，布局使用可换行容器，不把结构写死为“只能放一个 Badge”。V1.0 不主动新增更多身份类型。

## 用户资料规则

- 用户名称使用公开昵称 / 网名。
- 用户头像使用公开头像。
- 不展示真实姓名。

## UI 参考

项目功能设计库中的校园大使 / 推荐官视觉稿与《学习排行榜_V1.0_UI参考.png》作为形态与完成度参考；最终样式由项目现有 token 和组件语言收口，不逐像素复刻参考稿。

## 验收

- [x] 校园大使与推荐官两类 Badge 均完成。
- [x] 两类 Badge 能一眼区分但不过度抢眼。
- [x] Badge 在课程首页 Top 3、排行榜普通行、Top 1–3 和「我的排名」中均无布局冲突。
- [x] 排名、课程学习时长、身份信息三者视觉主次明确。
- [x] 用户本人态与身份 Badge 可以同时存在。
- [x] 不展示真实姓名。
- [x] 完成度达到正式高保真原型，不使用开发占位标签。

## 实施证据

- 共享身份组件：`apps/mobile/src/features/learning-leaderboard/LeaderboardIdentity.tsx`
- 课程首页接入：`apps/mobile/src/features/learning-leaderboard/T055CourseHomePage.tsx`
- 排行榜详情接入：`apps/mobile/src/features/learning-leaderboard/T056LeaderboardPage.tsx`
- 专项回归：`apps/mobile/tests/t057-leaderboard-identity-states.spec.ts`
- Quality Gate run `33578621026`：`Verify mobile routes, types and build` = **success**；`Run learning leaderboard regressions` = **success**。
- 本校榜 Top 10 外「我的排名」使用“我 + 推荐官”组合验证本人态与身份态共存。
- 全国榜 Top 10 第 8 名同样使用“我 + 推荐官”组合，验证高密度榜单行状态稳定。
- 普通用户示例不渲染身份 Badge；校园大使 / 推荐官在 Top 1–3 与普通榜单行均有覆盖。

## 不在本卡范围

- 身份获取 / 审核后台；
- 身份对排名的加成（V1.0 明确不加成）；
- 身份作为学习奖励条件；
- 新增更多身份类型；
- 点赞状态机（T058）。

## 状态说明

**2026-09-02 人工验收通过，状态由 REVIEW 更新为 PASS。**

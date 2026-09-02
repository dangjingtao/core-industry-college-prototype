# T057｜校园大使 / 推荐官与榜单状态组件｜实施记录

**任务卡：** `docs/workbench/tasks/T057-leaderboard-role-badges-and-states.md`  
**分支：** `dev`  
**状态：** REVIEW  
**日期：** 2026-09-02

## 实施结论

T057 已完成排行榜身份 Badge 与关键状态组件的高保真原型施工。课程首页和排行榜详情页不再各维护一套身份标签，统一使用共享身份组件。

## 已实现

- 新增 `LeaderboardIdentity.tsx` 作为排行榜身份展示真相源；
- 「校园大使」使用 BadgeCheck 图标 + warning 语义色；
- 「推荐官」使用 Megaphone 图标 + info 语义色；
- Badge 形态保持轻量，不抢排名、昵称与学习时长；
- 身份列表使用数组和可换行容器，避免视觉结构写死为单身份；
- T055 课程首页 Top 3 已切换到共享 Badge；
- T056 排行榜 Top 10 与「我的排名」已切换到共享 Badge；
- 新增统一本人态 `LeaderboardSelfBadge`；
- 当前用户 mock 身份固定为「推荐官」，同时覆盖：
  - 本校榜 Top 10 外「我的排名」中的“我 + 推荐官”；
  - 全国榜 Top 10 第 8 名中的“我 + 推荐官”；
- 普通用户、校园大使、推荐官、Top 1–3、普通 Top 10、本人、Top 10 外本人状态均有原型样例；
- 不展示真实姓名，继续使用公开昵称与公开头像 fallback。

## 正式实现文件

- `apps/mobile/src/features/learning-leaderboard/LeaderboardIdentity.tsx`
- `apps/mobile/src/features/learning-leaderboard/T055CourseHomePage.tsx`
- `apps/mobile/src/features/learning-leaderboard/T056LeaderboardPage.tsx`
- `apps/mobile/tests/t057-leaderboard-identity-states.spec.ts`
- `.github/workflows/r-final-check.yml`

## 关键提交

- `59ddee4` — 新增共享排行榜身份组件
- `2467c8e` — 课程首页 Top 3 接入共享 Badge
- `de7ddc0` — 排行榜详情与本人态接入共享 Badge
- `e27589f` — 新增 T057 Playwright 回归
- `65282c5` — 将 T057 纳入 leaderboard regression suite

## 验证证据

Prototype Quality Gate run `33578621026`：

- `Verify mobile routes, types and build` = **success**；
- `Run learning leaderboard regressions (soft gate)` = **success**。

T057 专项回归实际验证：

1. 课程首页 Top 3 同时存在校园大使与推荐官正式 Badge；
2. 两种 Badge 均包含语义图标；
3. 排行榜普通行分别覆盖校园大使 / 推荐官 / 无身份用户；
4. 本校榜 Top 10 外「我的排名」能同时展示本人态与推荐官；
5. 全国榜 Top 10 内本人态同样可与推荐官共存，且学校与名次信息仍正常。

## 边界

本卡没有实现：

- 身份申请、审核、后台配置；
- 身份影响排名；
- 身份奖励；
- 新身份类型；
- 排行榜点赞状态机（T058）。

## Review 建议

人工 Review 重点看：

1. 两种 Badge 是否足够可区分，但没有变成运营贴纸；
2. “我 + 推荐官”在普通榜单行与独立「我的排名」中的视觉密度；
3. Top 1–3 中 Badge 是否仍保持排名优先；
4. 课程首页与详情页的 Badge 视觉是否真正一致。

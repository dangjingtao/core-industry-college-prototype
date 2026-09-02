# T056｜本校榜 / 全国榜排行榜详情页｜实施记录

**任务卡：** `docs/workbench/tasks/T056-learning-leaderboard-detail.md`  
**分支：** `dev`  
**状态：** REVIEW  
**日期：** 2026-09-02

## 实施结论

T056 已将 `/courses/leaderboard` 从 T055 的承接页升级为完整学习排行榜详情原型，并保持 T057 / T058 的职责边界。

## 已实现

- 「本校榜 / 全国榜」双 Tab 可真实切换，并具有明确选中态；
- 本校榜与全国榜均完整展示 Top 10；
- 排名唯一依据为本周课程学习时长；
- 页面展示周榜标识与本周日期范围；
- 本校榜保持紧凑信息密度；
- 全国榜额外展示所属学校，示例覆盖多所高校；
- Top 1–3 使用克制的排名层级，不做运营海报式重装饰；
- 本校榜场景中，当前用户排名第 12，未进入 Top 10，独立显示「我的排名」；
- 全国榜场景中，当前用户排名第 8，直接在 Top 10 内高亮本人态；
- 榜单项展示公开头像 fallback、公开昵称 / 网名、课程学习时长、身份 Badge、点赞数；
- 托管账户通过 mock 数据层动态混排表达，不在用户界面出现“托管”“模拟”等标签；
- 托管样本分散在不同名次，真实用户示例可位于其上方，避免形成固定霸榜表达；
- 新页面继续使用现有 Com Design / design token / Card / StatusTag / PageHeader 组件语言。

## 正式实现文件

- `apps/mobile/src/features/learning-leaderboard/T056LeaderboardPage.tsx`
- `apps/mobile/tests/t056-learning-leaderboard-detail.spec.ts`
- `.github/workflows/r-final-check.yml`

路由保持 `/courses/leaderboard` 不变，通过既有兼容出口：

- `apps/mobile/src/features/learning-leaderboard/T043CourseHomePage.tsx`

将旧的 `T043LeaderboardEntryPage` 兼容导出指向正式 `T056LeaderboardPage`，避免重新大范围重写 `App.tsx`。

## 关键提交

- `8910664` — `feat: implement T056 learning leaderboard detail`
- `1a2190c` — `feat: route leaderboard entry to T056 detail`
- `1aa6248` — `test: cover T056 leaderboard detail states`
- `f8e6818` — `test: add T056 to leaderboard regression suite`
- `42adaec` — `docs: move T056 leaderboard detail to review`

## 自动化验证

Prototype Quality Gate run `33577071577`：

- `Verify mobile routes, types and build` = **success**；
- `Run learning leaderboard regressions (soft gate)` = **success**。

排行榜专项回归当前同时执行：

- `tests/t055-course-home-leaderboard.spec.ts`
- `tests/t056-learning-leaderboard-detail.spec.ts`

T056 专项验证：

1. 本校榜默认激活；
2. 本校榜 Top 10 数量为 10；
3. 当前用户第 12 名时显示独立「我的排名」；
4. 切换全国榜后 Top 10 数量仍为 10；
5. 全国榜展示学校信息；
6. 当前用户第 8 名时在 Top 10 中显示本人态；
7. 用户界面不存在“托管”“模拟”标签；
8. 页面明确提示点赞不参与排名。

## 边界

T056 没有提前实现：

- 校园大使 / 推荐官 Badge 的完整状态体系与进一步视觉收口（T057）；
- 点赞、取消、重新点赞、自赞限制、周周期状态机（T058）；
- 学习时长奖励（V1.0 不做）；
- 日榜、月榜、历史榜、好友榜。

## Review 建议

人工 Review 重点看：

1. Top 10 列表密度是否适合真实手机阅读；
2. 本校榜与全国榜切换后的信息差异是否足够明确；
3. 「我的排名」独立卡片是否有足够存在感但不过度抢榜单；
4. Top 1–3 是否已经有层级，同时没有变成过重的“领奖台 UI”；
5. T057 接手 Badge 时是否需要进一步压缩身份信息占位。

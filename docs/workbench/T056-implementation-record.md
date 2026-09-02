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
- 页面展示周榜周期；
- 本校榜保持紧凑信息密度；
- 全国榜额外展示所属学校，示例覆盖多所高校；
- Top 1–3 使用独立领奖台式视觉层级；
- 本校榜场景中，当前用户排名第 12，未进入 Top 10，独立显示「我的排名」；
- 全国榜场景中，当前用户排名第 8，直接在 Top 10 内高亮本人态；
- 榜单项展示公开头像 fallback、公开昵称 / 网名、课程学习时长、身份 Badge、点赞数；
- 托管账户通过 mock 数据层动态混排表达，不在用户界面出现“托管”“模拟”等标签；
- 托管样本分散在不同名次，真实用户示例可位于其上方，避免形成固定霸榜表达；
- 页面继续使用现有 Com Design / design token / PageHeader / Card / Lucide 组件语言。

## 正式实现文件

- `apps/mobile/src/features/learning-leaderboard/T056LeaderboardPage.tsx`
- `apps/mobile/tests/t056-learning-leaderboard-detail.spec.ts`
- `apps/mobile/tests/t057-leaderboard-identity-states.spec.ts`
- `apps/mobile/tests/t058-leaderboard-like-interaction.spec.ts`
- `.github/workflows/r-final-check.yml`

路由保持 `/courses/leaderboard` 不变，通过既有兼容出口：

- `apps/mobile/src/features/learning-leaderboard/T043CourseHomePage.tsx`

将旧的 `T043LeaderboardEntryPage` 兼容导出指向正式 `T056LeaderboardPage`，避免重新大范围重写 `App.tsx`。

## 初始施工提交

- `8910664` — `feat: implement T056 learning leaderboard detail`
- `1a2190c` — `feat: route leaderboard entry to T056 detail`
- `1aa6248` — `test: cover T056 leaderboard detail states`
- `f8e6818` — `test: add T056 to leaderboard regression suite`
- `42adaec` — `docs: move T056 leaderboard detail to review`

## 2026-09-02 UI Review 退回与修正

人工 Review 指出：初版虽然功能点、Top 10、身份和点赞逻辑已经完成，但详情页仍是偏开发态的「说明卡 + Tab + 普通列表」，没有兑现派卡时明确引用的《学习排行榜_V1.0_UI参考.png》的构图与 UI 完成度，因此 **不可按视觉原型验收**。

该判断成立。随后将 UI 参考从“文字备注”提升为实际页面构图基线，并重新施工：

1. 顶栏保留居中「学习排行榜」，右侧增加「规则说明」入口；
2. 本校榜 / 全国榜改为参考稿中的线性 Tab + 品牌色下划线，不再使用开发态 segmented card；
3. 榜单顶部增加品牌渐变 Banner，分别表达「本校学习排行榜 / 全国学习排行榜」与「每周一 00:00 更新」；
4. Top 1–3 从普通列表中抽出，改为参考稿中的横向领奖台构图（2 / 1 / 3 排列）；
5. 第 4–10 名改为紧凑表格式榜单，保留排名、用户、学校（全国榜）、学习时长、点赞；
6. Top 10 外的「我的排名」改为独立品牌描边卡片；
7. 页尾增加未进入 Top 10 / 已进入 Top 10 的反馈文案；
8. T057 身份 Badge 和 T058 点赞状态机继续复用，没有因为视觉重做降级成功能占位。

同时，课程首页的 T055 排行榜模块也按同一张参考图重做为「排名/学习时长摘要 + Trophy 视觉 + 横向 Top 3 + 主 CTA」，避免详情页与入口页视觉断裂。

### UI 修正提交

- `e60a9b8` — `fix: align leaderboard detail with approved UI reference`
- `133e762` — `fix: align course home leaderboard with UI reference`
- `a28c3a3` — `test: align T055 regression with approved leaderboard UI`
- `12f96ee` — `test: align T056 regression with approved leaderboard UI`
- `f876c0b` — `test: keep T058 interaction coverage after UI-reference rebuild`

### 修正后验证

Prototype Quality Gate run `33580165062`：

- `Verify mobile routes, types and build` = **success**；
- `Run learning leaderboard regressions (soft gate)` = **success**，覆盖 T055–T058。

Deploy Mobile run `33580165085`：

- `Type-check and build mobile preview` = **success**；
- F00 cross-app browser regression = **success**；
- `Deploy mobile` = **success**。

本次 Review 修正后，后续人工验收应以 **当前 dev 部署版本 + UI 参考图 + 任务卡功能点** 三者共同判断，不再以“功能测试通过”替代视觉验收。

## 边界

仍不包含：

- 学习时长奖励（V1.0 不做）；
- 日榜、月榜、历史榜、好友榜；
- 生产级榜单后端与跨设备点赞同步。

## Review 建议

人工 Review 重点看：

1. 顶部 Banner、Top 3 领奖台、4–10 表格与「我的排名」是否已经达到参考稿的信息结构与视觉完成度；
2. 本校榜 / 全国榜在手机宽度下是否保持清晰密度；
3. T057 Badge 与 T058 点赞在新的紧凑布局中是否仍然舒适；
4. 若仍存在视觉差距，应继续按 UI 参考修正，不以自动化通过作为视觉 PASS 依据。

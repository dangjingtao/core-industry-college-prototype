# T056｜本校榜 / 全国榜排行榜详情页｜实施记录

**任务卡：** `docs/workbench/tasks/T056-learning-leaderboard-detail.md`  
**分支：** `dev`  
**状态：** REVIEW  
**日期：** 2026-09-02

## 实施结论

T056 已将 `/courses/leaderboard` 从 T055 的承接页升级为完整学习排行榜详情原型，并在两轮人工视觉 Review 后完成专属视觉重构。当前版本保留 T057 / T058 的身份与点赞能力，同时不再把全局 design token 作为排行榜详情页的视觉硬边界。

## 已实现

- 「本校榜 / 全国榜」双 Tab 可真实切换，并具有明确选中态；
- 本校榜与全国榜均完整展示 Top 10；
- 排名唯一依据为本周课程学习时长；
- 页面展示周榜周期与「每周一 00:00 更新」；
- 全国榜额外展示所属学校，示例覆盖多所高校；
- Top 1–3 使用 2 / 1 / 3 横向领奖台构图，Top 1 使用独立冠军视觉；
- 本校榜场景中，当前用户排名第 12，未进入 Top 10，独立显示「我的排名」；
- 全国榜场景中，当前用户排名第 8，直接在 Top 10 内高亮本人态；
- 榜单项展示公开头像 fallback、公开昵称 / 网名、课程学习时长、身份 Badge、点赞数；
- 托管账户通过 mock 数据层动态混排表达，不在用户界面出现“托管”“模拟”等标签；
- 托管样本分散在不同名次，真实用户示例可位于其上方，避免形成固定霸榜表达；
- T057 身份状态与 T058 点赞 / 取消 / 再点赞 / 自赞限制 / 周周期逻辑继续保留。

## 正式实现文件

- `apps/mobile/src/features/learning-leaderboard/T056LeaderboardPage.tsx`
- `apps/mobile/tests/t056-learning-leaderboard-detail.spec.ts`
- `apps/mobile/tests/t057-leaderboard-identity-states.spec.ts`
- `apps/mobile/tests/t058-leaderboard-like-interaction.spec.ts`
- `.github/workflows/r-final-check.yml`

路由保持 `/courses/leaderboard` 不变，通过既有兼容出口：

- `apps/mobile/src/features/learning-leaderboard/T043CourseHomePage.tsx`

## 初始施工提交

- `8910664` — `feat: implement T056 learning leaderboard detail`
- `1a2190c` — `feat: route leaderboard entry to T056 detail`
- `1aa6248` — `test: cover T056 leaderboard detail states`
- `f8e6818` — `test: add T056 to leaderboard regression suite`
- `42adaec` — `docs: move T056 leaderboard detail to review`

## 第一轮 UI Review：功能完整，但视觉不可验收

人工 Review 指出：初版虽然 Top 10、身份和点赞逻辑已经完成，但详情页仍是偏开发态的「说明卡 + Tab + 普通列表」，没有兑现 UI 参考构图，因此不可按视觉原型验收。

随后完成第一轮修正：

1. 顶栏保留居中「学习排行榜」，右侧增加「规则说明」入口；
2. 本校榜 / 全国榜改为线性 Tab + 品牌色下划线；
3. 榜单顶部增加品牌渐变 Banner；
4. Top 1–3 从普通列表中抽出，改为横向领奖台构图（2 / 1 / 3 排列）；
5. 第 4–10 名改为紧凑表格式榜单；
6. Top 10 外的「我的排名」改为独立品牌描边卡片；
7. 页尾增加排名反馈文案；
8. T057 身份 Badge 和 T058 点赞状态机继续保留。

第一轮 UI 修正提交：

- `e60a9b8` — `fix: align leaderboard detail with approved UI reference`
- `133e762` — `fix: align course home leaderboard with UI reference`
- `a28c3a3` — `test: align T055 regression with approved leaderboard UI`
- `12f96ee` — `test: align T056 regression with approved leaderboard UI`
- `f876c0b` — `test: keep T058 interaction coverage after UI-reference rebuild`

第一轮修正验证：

- Prototype Quality Gate run `33580165062`：mobile verify 与 T055–T058 leaderboard regression 均 **success**；
- Deploy Mobile run `33580165085`：preview build、F00 regression、Cloudflare dev deploy 均 **success**。

## 第二轮 UI Review：放开 token 硬限制，按高保真视觉重新实现

人工 Review 再次指出：第一轮虽然构图已经接近参考稿，但仍然被现有 design token 与普通业务组件语言压住，整体视觉仍显得保守，无法达到此前生成的高保真 UI 方向。

本轮明确调整约束：**排行榜详情页允许使用页面专属视觉值，不要求全部映射回全局 design token。**

最新实现重点：

1. Banner 使用排行榜专属紫蓝渐变、光效、轨道装饰和 Trophy / Orbit 视觉；
2. Top 1–3 变为完整领奖台卡片，而不只是头像排列；
3. Top 1 增加 Crown、金色 Avatar Ring、放射光、金色名次徽章和更强的垂直权重；
4. Top 2 / Top 3 分别采用银蓝 / 铜橙层级，形成明确的 1–2–3 差异；
5. 排行榜头像使用专属渐变与 Avatar Ring，不再依赖全局状态色头像；
6. 校园大使 / 推荐官在本页使用专属金色 / 紫色 Badge 表达，同时保留原有 `data-leaderboard-role` 语义与自动化可验证性；
7. 4–10 榜单改为更完整的浮层白卡、专属 header、柔和分隔和更高的行完成度；
8. 当前用户 Top 10 内本人态使用紫色描边、渐变底和专属阴影；
9. Top 10 外「我的排名」同样使用独立高亮卡；
10. Like 状态改为排行榜专属紫色交互反馈，但所有 T058 逻辑保持不变；
11. 页面背景、阴影、圆角和间距允许使用局部专属值，不要求回写为全局 token。

### 第二轮视觉重构提交

- `e571e0c` — `feat: rebuild leaderboard with freer premium visual system`
- `5dee97e` — `docs: allow dedicated visual language for T056 leaderboard`

### 第二轮验证

Prototype Quality Gate run `33581820080`：

- `Verify mobile routes, types and build` = **success**；
- `Run learning leaderboard regressions (soft gate)` = **success**，覆盖 T055–T058。

Deploy Mobile run `33581820083`：

- `Type-check and build mobile preview` = **success**；
- F00 cross-app browser regression = **success**；
- `Deploy mobile` = **success**。

## 当前视觉约束

排行榜详情页当前执行以下规则：

- 基础页面壳层、语义、可访问性与交互规则继续复用项目体系；
- 排行榜自身可以拥有独立色彩、渐变、光效、阴影、Avatar Ring、金银铜名次层级与自身高亮；
- 这些局部视觉值不要求晋升为全局 token；
- 其它页面不自动继承本页视觉语言；
- 自动化通过只证明功能和结构未回归，最终视觉 PASS 仍由人工 Review 决定。

## 边界

仍不包含：

- 学习时长奖励（V1.0 不做）；
- 日榜、月榜、历史榜、好友榜；
- 生产级榜单后端与跨设备点赞同步；
- 把本页专属视觉升级为整个项目的全局设计系统。

## Review 建议

人工 Review 重点看：

1. Banner 是否已经有足够的品牌感，而不是普通渐变卡；
2. Top 1 是否真正成为视觉中心，Top 2 / Top 3 是否有明确但不过度的银 / 铜层级；
3. 4–10 表格与 Top 3 是否属于同一个视觉世界；
4. 当前用户高亮是否明显但不破坏榜单阅读；
5. T057 Badge 与 T058 点赞在更强视觉下是否仍然清晰；
6. 若仍存在视觉差距，应继续按 UI 稿调整，不以 token 一致性或自动化通过作为视觉 PASS 依据。

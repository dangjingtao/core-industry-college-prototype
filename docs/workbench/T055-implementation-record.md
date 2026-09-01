# T055｜课程首页学习排行榜模块｜实施记录

**原派卡编号：T043（编号冲突后纠正为 T055）**  
**任务卡：** `docs/workbench/tasks/T055-course-home-learning-leaderboard.md`  
**分支：** `dev`  
**状态：** REVIEW  
**日期：** 2026-09-02

## 实施结论

T055 已完成课程首页排行榜摘要的中高保真原型施工，并保留 T056 的完整排行榜详情边界。

### 已实现

- `/courses` 课程首页接入「学习排行榜」正式模块；
- 排行榜放在「新手必修」之后、「高价值课程」之前，保持课程浏览仍为页面主任务；
- 展示周榜标识与本周日期范围；
- 展示「我的本校排名」；
- 展示「本周课程学习时长」；
- 展示本校 Top 3；
- Top 3 包含排名、公开头像 fallback、公开昵称、本周课程学习时长；
- Top 3 可承载「校园大使」「推荐官」Badge；
- 「查看完整排行榜」为真实可点击路由，进入 `/courses/leaderboard`；
- `/courses/leaderboard` 当前提供明确承接页，不伪造 T056 尚未完成的本校 / 全国 Top 10；
- 新增组件使用项目现有 Com Design / design token 语义类与既有 Card / StatusTag / PageHeader / Section 组件语言；
- 新增 Playwright 专项回归，并纳入 Quality Gate 的独立 `learning leaderboard regressions` 软门槛。

## 正式实现文件

- `apps/mobile/src/features/learning-leaderboard/T055CourseHomePage.tsx`
- `apps/mobile/tests/t055-course-home-leaderboard.spec.ts`
- `.github/workflows/r-final-check.yml`

`apps/mobile/src/features/learning-leaderboard/T043CourseHomePage.tsx` 仅保留为兼容导出，说明本批最初误派为 T043；真实历史 T043 仍属于核心大使任务链。

## 关键提交

### 初始施工阶段（当时误编号 T043）

- `530efd1` — `feat: add T043 course home leaderboard prototype`
- `a7896d1` — `feat: route T043 course leaderboard preview`
- `e6f4973` — `test: cover T043 course home leaderboard flow`
- `ab5fe18` — `fix: clean T043 leaderboard imports`
- `8c5172d` — `fix: repair T043 mobile route syntax`
- `ba7db45` — `test: isolate learning leaderboard regression suite`

### 编号纠正 / 规范化

- `c74e588` — 建立正式 T055 任务卡并进入 REVIEW
- `a93e6f2` — 实现文件迁移至 `T055CourseHomePage.tsx`
- `9bf28b0` — 旧 T043 实现文件收敛为兼容导出
- `a7dd194` — 专项回归重命名为 T055
- `54aa32f` — Quality Gate 改为运行 T055 专项回归
- `81e293b` — 排行榜任务总览纠正为 T055–T058

## 验证证据

### 已确认的施工验证

- Deploy Mobile run `33572422498`：`Type-check and build mobile preview` = **success**；部署 = **success**。
- Prototype Quality Gate run `33572893544`：`Verify mobile routes, types and build` = **success**。
- Prototype Quality Gate run `33572893544`：`Run learning leaderboard regressions (soft gate)` = **success**。

该次专项用例执行时文件尚使用误编号 `t043-course-home-leaderboard.spec.ts`；测试内容随后仅做任务编号迁移为 `t055-course-home-leaderboard.spec.ts`，功能断言保持一致。编号迁移后的 Quality Gate 结果应以最新 CI 为最终证据。

## 已发现并修复的问题

首次路由接入时，重写 `App.tsx` 造成 `/assets/experiences` 路由 JSX 少一个括号，CI 报：

`src/app/App.tsx(195,85): error TS1005: ',' expected.`

已在 `8c5172d` 修复；随后 mobile type-check/build 通过，部署成功。

## 边界

本卡没有提前实现：

- 本校榜 / 全国榜完整 Top 10（T056）；
- 完整身份组合状态（T057）；
- 排行榜点赞状态机（T058）；
- 学习时长奖励（V1.0 不做）。

## Review 建议

人工 Review 重点看：

1. 排行榜在课程首页的视觉权重是否合适；
2. 「新手必修 → 排行榜 → 高价值课程」的信息层级是否符合产品预期；
3. Top 3 行密度与 Badge 完成度是否达到后续 T056 / T057 可复用标准。

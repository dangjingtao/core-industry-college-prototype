# PC08｜赛事基础设施施工记录

> 基线：`dev@1ed12afb363747688ffc8f2347cd5584ccf92b73`  
> 目标：完成 PC08 的赛事档案增强、一级分类、阶段赛程、跨赛事报名投影；不建立第二套 Competition / Registration 真相源。

## 已施工

- 原 `/admin/competitions/objects/:competitionId` 仍是唯一赛事详情地址；路由改为 PC08 wrapper，内部继续完整复用 `PC02HumanCompetitionConsole`。
- 新增 `pc08-data.ts` 作为 Competition 的轻量基础设施 extension：只存 Category 关联、赛事展示时间与 CompetitionStage；不复制 Competition 主对象。
- 新增一级 `CompetitionCategory`：创新创业 / 产业实践 / 合作赛事；分类页支持排序与启停演示。
- 三创赛复用 4 个阶段：报名与赛项选择、校园赛、省赛、全国现场总决赛。
- 普通合作赛事 `innovation-cup-2026` 复用同一 CompetitionStage 模型，配置 3 个阶段。
- 阶段状态只由 `startAt/endAt` 与当前时间推导为未开始 / 进行中 / 已结束，没有额外人工状态字段。
- 赛事详情补齐一级分类、整体开始/结束时间、展示状态、来源/权威性，并显式说明 `Category ≠ Track`。
- 新增 `/admin/competitions/categories` 一级分类管理页。
- 新增 `/admin/competitions/registrations` 跨赛事报名记录页；行数据由现有 `competitionControlById()` 的 Team / qualification / registration 接入事实投影生成，不存在 Registration Store。
- 报名记录下钻回现有 Competition 详情与现有 registration portal，不复制详情页面。
- 当前既有 Team / registration 事实没有报名时间字段，因此统一视图明确展示“源报名事实未记录时间”，不伪造时间。
- 没有引入缴费、排名、评分、晋级、直播、视频或订单运营逻辑；三创赛垂直运营继续留给 PC09。

## Focused browser assertions

新增 `apps/pc/tests/pc08.spec.ts`，覆盖：

1. 三创赛原 Competition 详情出现 4 个阶段；
2. `Category ≠ Track` 与外部权威 API 边界可见；
3. 普通合作赛事复用同一阶段模型；
4. 一级分类可排序与启停；
5. 跨赛事报名投影可下钻回原 Competition 详情。

## 验证

施工提交推送后由既有 `Prototype Quality Gate` 执行 PC TypeScript/Vite hard gate，并由 PC browser regressions 运行 `pc08.spec.ts`；Cloudflare PC workflow 同时执行 development build/deploy。结果以对应 GitHub Actions run 为准。

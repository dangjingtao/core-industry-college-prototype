# PC08｜赛事基础设施施工记录

> 施工基线：`dev@e6454ef0ae61a33ad21bc519cf7822808a7d0900`  
> 主施工提交：`e36d30fa3f18f7ff4b9cf4431207af0f9e26645d`  
> 导航补齐：`56987ac2248837fb159591eb11960941f32ef538`  
> focused assertion 加固：`69687231b9021fcea0256019221317ad602f17a3`  
> 目标：完成 PC08 的赛事档案增强、一级分类、阶段赛程、跨赛事报名投影；不建立第二套 Competition / Registration 真相源。

## 已施工

- 原 `/admin/competitions/objects/:competitionId` 仍是唯一赛事详情地址；路由改为 PC08 wrapper，内部继续完整复用 `PC02HumanCompetitionConsole`。
- 新增 `pc08-data.ts` 作为 Competition 的轻量基础设施 extension：只存 Category 关联、赛事展示时间与 CompetitionStage；不复制 Competition 主对象。
- 新增一级 `CompetitionCategory`：创新创业 / 产业实践 / 合作赛事；分类页支持排序与启停演示。
- 三创赛复用 4 个阶段：报名与赛项选择、校园赛、省赛、全国现场总决赛。
- 普通合作赛事 `innovation-cup-2026` 复用同一 CompetitionStage 模型，配置 3 个阶段。
- 阶段状态只由 `startAt/endAt` 与当前时间推导为未开始 / 进行中 / 已结束，没有额外人工状态字段。
- 赛事详情补齐一级分类、整体开始/结束时间、展示状态、来源/权威性，并显式说明 `Category ≠ Track`。
- 新增 `/admin/competitions/categories` 一级分类管理页，并在赛事管理侧栏增加“比赛分类”入口。
- 新增 `/admin/competitions/registrations` 跨赛事报名记录页，并在赛事管理侧栏增加“报名记录”入口；行数据由现有 `competitionControlById()` 的 Team / qualification / registration 接入事实投影生成，不存在 Registration Store。
- 报名记录下钻回现有 Competition 详情与现有 registration portal，不复制详情页面。
- 当前既有 Team / registration 事实没有报名时间字段，因此统一视图明确展示“源报名事实未记录时间”，不伪造时间。
- 没有引入缴费、排名、评分、晋级、直播、视频或订单运营逻辑；三创赛垂直运营继续留给 PC09。
- 施工期间 `dev` 有 PC07 / T013C 并行提交；PC08 均采用 fast-forward / GitHub contents API 追加，没有 force update，也没有覆盖并行修改。

## Focused browser assertions

`apps/pc/tests/pc08.spec.ts` 覆盖：

1. 三创赛原 Competition 详情出现 4 个阶段；
2. `Category ≠ Track` 与外部权威 API 边界可见；
3. 普通合作赛事复用同一阶段模型；
4. 一级分类可排序与启停；
5. 跨赛事报名投影可下钻回原 Competition 详情。

断言收尾时将分类列表直接子元素选择器改为 `:scope > div`，并把普通赛事分类断言限定在 PC08 基础设施区域，降低页面其他文本造成的误命中。

## 静态复核

- `PlatformReviewStatus` / `OfficialQualificationStatus` 均来自既有 `competition-control-data.ts` 导出。
- 学校展示继续使用 PC03 既有 `pc03OrganizationById()`，没有新建 Organization 映射。
- `Category` 与 PC02 `tracks[]` 保持独立概念；PC08 没有修改 Track 数据结构。
- 报名投影每次从既有 Competition control record 读取 Team / qualification / registration，不持久化第二份报名对象。

## 自动验证说明

仓库既有 `Prototype Quality Gate` 会执行 PC TypeScript/Vite hard gate，PC browser regressions 会包含 `pc08.spec.ts`；Cloudflare PC workflow 会对 `dev` 执行 development build/deploy。

本次会话使用的 GitHub 连接器只能枚举 PR-triggered workflow runs，不能列出本次 `dev` push-triggered run，因此这里不伪造“CI 已绿”的结论。PC08 已完成代码、focused assertions、导航和施工记录，任务卡状态按项目惯例记为“已施工（待复审）”；最终自动化结果以 GitHub Actions 实际 run 为准。

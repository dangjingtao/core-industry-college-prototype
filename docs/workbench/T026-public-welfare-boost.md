# T026 公益助力功能卡

## 状态

已完成 / 已合并至 `dev`（奖励发放逻辑待 F04 Decision A）

## 完成清单

- [x] 公益项目数据模型与示例数据
- [x] 公益助力列表页 `/welfare`
- [x] 公益项目详情页 `/welfare/:welfareId`
- [x] 激励视频广告 handoff 页 `/welfare/:welfareId/ad`
- [x] `LongTermAssets` 接入助力记录与计数
- [x] 首页 banner 广告位（任务专区下方、热门赛事上方）
- [x] 应用中心「社会责任」分组入口
- [x] 新增路由注册
- [x] 相关设计文档链接整理
- [x] `typecheck` + `build` 验证通过

## 相关设计文档

- [T016 首页核心功能区重构](T016-首页核心功能区重构.md)：公益助力首页拼贴位的宿主位置与首页动线。
- [T018 应用中心](T018-应用中心.md)：「社会责任」分组的入口承载与宫格组织方式。
- [产品缺口与未决业务清单](../product/02-open-decisions-and-backlog.md)：F04 Decision A（学力值经济模型）等前置决策约束。

## 本次实施范围

1. 新增「公益助力」长期资产模块：
   - `apps/mobile/src/features/welfare/data.ts`：公益项目配置数据。
   - `apps/mobile/src/features/welfare/WelfarePages.tsx`：列表、详情、广告 handoff 页面。
2. 在 `LongTermAssets` 中接入助力记录：
   - `WelfareParticipationRecord` 作为长期资产存储，不复制到 profile。
   - `helpWelfare` 仅生成记录与更新项目计数，不自行发放奖励。
3. 首页新增「公益助力」拼贴位：
   - 位于「任务专区」下方、「热门赛事」上方。
   - 展示当前主推公益项目与助力进度，点击进详情。
4. 应用中心新增「社会责任」分组：
   - 入口「公益助力」跳转 `/welfare`。
5. 新增路由：
   - `/welfare` 列表
   - `/welfare/:welfareId` 详情
   - `/welfare/:welfareId/ad` 激励视频广告 handoff

## 明确占位与待决策项

- **奖励发放**：`rewardType` / `rewardValue` 仅作为配置占位；详情页展示「预计奖励 / 待 F04 决策确认」，不调用任何积分/成长分写入逻辑。
- **激励视频广告**：广告 SDK 未接入。`/welfare/:welfareId/ad` 页面提供「广告 SDK 待接入」禁用按钮，并保留「模拟广告回调」原型调试入口，用于演示助力流程。
- **反刷量**：不实现前端反刷量；真实流程需依赖广告 SDK 回调 + 后端幂等校验。
- **任务聚合**：公益助力当前不作为任务出现在 `/tasks`；等 F04 Decision C 明确任务关系后，可从 `WelfareParticipationRecord` 派生。

## 依赖约束

- 不得因公益助力引入第二份 session / identities / task 真相源。
- 不得自行定义学力值发放规则（F04 Decision A 未决）。
- 不得把公益助力写死为任何单一赛事专属。

## 验证

- `npm run typecheck` 通过。
- `npm run build`（mobile + pc）通过。
- 首页、应用中心、列表、详情、广告 handoff 页面浏览器可访问。

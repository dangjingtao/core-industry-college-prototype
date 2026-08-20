# T026 公益助力功能卡

## 状态

施工中 / 待 F04 Decision A（学力值经济模型）

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

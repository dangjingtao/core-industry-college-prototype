# T039｜广告位②：机会板块信息流（岗位/企业列表第二卡后）｜实现记录

> 状态：已完成（中保真原型）
> 日期：2026-08-24
> 台账卡片：`docs/workbench/00-work-ledger.md` 中的 T039

## 设计文档

- 广告组件：`apps/mobile/src/features/long-term-assets/Ads.tsx`（`ListFeedAdCard`、`useListFeedAd`）
- 接入页面：`apps/mobile/src/features/public-platform/PublicPlatform.tsx`
  - `OpportunitiesPage` positions tab（岗位列表）
  - `OpportunitiesPage` companies tab（企业列表）
  - `CompaniesPage`（企业列表页）

## 广告位定义

- 位置：岗位列表 / 企业列表的**第 2 张卡片之后**（`index === 1`）；
- 形式：信息流广告卡片，与列表卡片同宽同视觉规格；
- 高度：与岗位 / 企业列表卡片一致（复用 `Card p-3` + `space-y-3` 行结构 / 行高）；
- 滚动：随列表自然滚动，不做悬浮或贴片。

## 关键实现

- `ListFeedAdCard`：与 `OpportunityCard` / 企业卡片同构的广告卡片，带「广告」角标 + 广告主 + 品牌合作标识 + 查看详情（原型占位跳转 `example.com/demo-ad`）；
- `useListFeedAd(seed)`：按列表维度（`positions` / `companies`）确定性取示例广告物料；
- 插入逻辑：`filtered.map((item, index) => ... {index === 1 && <ListFeedAdCard ... />})`；
- 列表为空或只有 1 张卡片时，`index === 1` 不命中，不展示广告。

## 约束落实

- 广告与真实岗位/企业内容带「广告」标识明确区分；
- 不改变列表排序逻辑与真实内容优先级；
- 企业资源与品牌主体（F02）不受广告损害。

## 验收

- [x] typecheck（`tsc --noEmit`）
- [x] `npm run build:mobile`
- [ ] Playwright 浏览器回归（当前环境缺少浏览器运行时，已由 dev CI 承接）

## 待决策项（后续接入真实广告时）

- 是否每 N 条卡片循环插入；
- 是否按用户画像 / 岗位偏好定向；
- 广告曝光 / 点击埋点与归因；
- 真实广告 SDK / 物料接入。

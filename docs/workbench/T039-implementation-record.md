# T039｜广告位②：机会板块信息流（岗位/企业列表第二卡后）｜实现记录

> 状态：已完成（中保真原型）/ 产品评审后方案基本通过
> 日期：2026-08-24
> 产品评审更新：2026-08-26
> 台账卡片：`docs/workbench/00-work-ledger.md` 中的 T039
> 产品真相源：`docs/product/19-badge-ad-and-trusted-credential-prd.md`

## 1. 原型落地方案

机会板块保留自然信息流广告：

- 岗位列表；
- 企业列表；
- 广告随列表自然滚动；
- 不做悬浮、贴片或遮挡主内容。

当前原型采用“第 2 张真实卡片之后插入 1 张广告”作为首期布局验证，该位置可以继续保留为原型默认值。

## 2. 展示约束

广告卡片：

- 与岗位 / 企业列表卡片同宽；
- 视觉规格可接近内容卡，但必须明确标识「广告」；
- 不得伪装为真实岗位或真实企业；
- 不改变真实岗位 / 企业的排序事实；
- 列表为空或不足插入位置时不强行展示。

机会板块属于较高信任场景。平台不控制广告平台的具体素材，但后续如 SDK 支持行业 / 合规过滤，应优先启用，避免明显破坏求职与企业信息场景的广告内容。

## 3. 当前实现

- 广告组件：`apps/mobile/src/features/long-term-assets/Ads.tsx`
  - `ListFeedAdCard`
  - `useListFeedAd(seed)`
- 接入页面：`apps/mobile/src/features/public-platform/PublicPlatform.tsx`
  - `OpportunitiesPage` positions tab
  - `OpportunitiesPage` companies tab
  - `CompaniesPage`

当前插入逻辑使用 `index === 1`，用于中保真原型验证。

## 4. 后续真实接入边界

后续真实广告 SDK 接入时，只需要薄场景配置承接：

- 场景启停；
- 插入频率 / 位置；
- 简单频控；
- no-fill 时不展示；
- 曝光 / 点击归因（如业务需要）。

不在产业学院后台建设广告主、竞价、素材投放系统。

## 5. 验收

- [x] 信息流广告原型已落地
- [x] 广告与真实内容有明确标识区分
- [x] 不改变真实列表排序
- [x] typecheck（`tsc --noEmit`）
- [x] `npm run build:mobile`
- [ ] 真实 SDK / Provider 接入后补充频控、no-fill 与必要埋点
- [ ] Playwright 浏览器回归

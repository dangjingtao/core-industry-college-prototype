# T038｜广告位①：免费福利激励视频 + 权益详情页信息流｜实现记录

> 状态：已完成（中保真原型）
> 日期：2026-08-24
> 台账卡片：`docs/workbench/00-work-ledger.md` 中的 T038
> 产品真相源：`docs/product/19-badge-ad-and-trusted-credential-prd.md`
> 说明：本文件保留 2026-08-24 的原型实现记录；若实现语义与产品 PRD 冲突，以 PRD 已确认规则为准。

## 设计文档

- 组件实现：`apps/mobile/src/features/long-term-assets/Ads.tsx`
- 权益详情页接入：`apps/mobile/src/features/long-term-assets/BenefitsPages.tsx`
- 打车 / 外卖券 API 接入数据：`apps/mobile/src/features/long-term-assets/data.ts`

## 广告位定义

### 广告位 A：激励视频（领取前置）

- 位置：免费福利「领取」按钮点击后；
- 流程：点击「领取」→ 弹确认框「观看一段广告后领取成功」→ 确认后进入全屏激励视频 → 看完自动执行领取并显示「领取成功」；
- 交互：带「广告」标识、倒计时进度条、3 秒后可跳过（跳过即放弃本次领取）。

### 广告位 B：权益详情页信息流

- 位置：权益详情页底部；
- 形式：信息流广告卡片，带「广告」标签 + 广告主 + CTA（原型占位跳转）。

## 关键实现

- `RewardedVideoAd`：全屏激励视频覆盖层，模拟倒计时播放，到点触发 `onComplete`；
- `InfoFeedAdCard`：信息流广告卡片；
- `useInfoFeedAd(seed)`：按权益 ID 确定性取示例广告物料；
- 免费福利所有领取主按钮统一走「看广告 → 领取成功」动线；
- 非 API 接入的 H5 权益保留「直接去合作方页面领取」次级入口。

## 附：打车 / 外卖券 API 接入（随 T038 一并施工）

- 腾讯地图打车券、淘宝闪购外卖券从「外部 H5 跳转领取」升级为「API 接口直接发放」；
- `Benefit` 类型新增 `apiIssued` 与 `useInApp`；
- 删除「点击即可跳转 H5 领取」字样，领取详情与成功弹窗提示去对应 App 用相同手机号查看/使用。

## 验收

- [x] typecheck（`tsc --noEmit`）
- [x] `npm run build:mobile`
- [ ] Playwright 浏览器回归（当前环境缺少浏览器运行时，已由 dev CI 承接）

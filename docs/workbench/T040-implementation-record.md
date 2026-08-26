# T040｜广告位③：常规 APP 开屏广告｜实现记录

> 状态：已完成（中保真原型）
> 日期：2026-08-24
> 台账卡片：`docs/workbench/00-work-ledger.md` 中的 T040
> 产品真相源：`docs/product/19-badge-ad-and-trusted-credential-prd.md`
> 说明：本文件保留 2026-08-24 的原型实现记录；若实现语义与产品 PRD 冲突，以 PRD 已确认规则为准。

## 设计文档

- 组件实现：`apps/mobile/src/features/long-term-assets/SplashOverlay.tsx`
- 路由接入：`apps/mobile/src/app/App.tsx`

## 体现方式（用户确认）

- 触发方式：**欢迎页前置一次**（`/welcome` 之前）；
- 素材形式：**静态品牌全屏占位**（可替换为真实广告主物料）。

## 广告位定义

- 位置：App 首启 `/welcome` 前的全屏开屏覆盖层；
- 形式：全屏品牌渐变层，带「广告」标识 + 倒计时进度条 + 「跳过」按钮；
- 时长：5s 自动进入欢迎页，3s 后可手动跳过；
- 频控：`sessionStorage` 记录「本会话已看过」，会话内只出现一次，避免原型演示时刷新反复弹。

## 关键实现

- `SplashOverlay`：开屏广告层，倒计时结束或点「跳过」后调用 `onDone` 关闭；
- `useSplashGate(search)`：读取会话标记 + 关键动线判断，控制是否展示；
- `shouldSkipSplash(search)`：命中 `returnTo` / `handoff` / `competitionId` / `code` / `source` 任一参数即跳过开屏；
- `WelcomeSplashPage`：包裹 `WelcomePage`，在 `/welcome` 路由前置开屏层。

## 约束落实

- 可跳过、有时限，不强制无限制观看；
- 深链/回流动线（注册回流、赛事 handoff、邀请码认领）自动跳过，不打断关键动线；
- 广告带「广告」标识与明确的跳过入口。

## 验收

- [x] typecheck（`tsc --noEmit`）
- [x] `npm run build:mobile`
- [ ] Playwright 浏览器回归（当前环境缺少浏览器运行时，已由 dev CI 承接）

## 待决策项（后续接入真实广告时）

- 真实冷启动 / 切后台回前台触发；
- 每日开屏频次上限；
- 无广告填充时的兜底（直接进首页 vs 品牌默认图）；
- 点击广告落地页与外链协议白名单；
- 真实广告 SDK / 素材接入。

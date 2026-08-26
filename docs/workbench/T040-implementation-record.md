# T040｜广告位③：常规 APP 开屏广告｜实现记录

> 状态：已完成（中保真原型）/ 产品定义已修订
> 日期：2026-08-24
> 产品评审更新：2026-08-26
> 台账卡片：`docs/workbench/00-work-ledger.md` 中的 T040
> 产品真相源：`docs/product/19-badge-ad-and-trusted-credential-prd.md`

## 1. 正式产品定义

T040 的正式定义是：**App 冷启动场景的常规开屏广告**。

它不应永久绑定某个业务页面，也不应把 `/welcome` 当成开屏广告唯一触发点。

正式目标流程：

```text
App 冷启动
→ 判断是否命中开屏广告场景
→ 有广告且允许展示：展示开屏广告
→ 跳过 / 倒计时结束 / no-fill
→ 进入原本应进入的 App 目标页面
```

## 2. 当前中保真原型

当前技术实现仍采用 `/welcome` 前置全屏覆盖层来模拟开屏广告：

- 组件：`apps/mobile/src/features/long-term-assets/SplashOverlay.tsx`
- 接入：`apps/mobile/src/app/App.tsx`
- 当前 5 秒自动结束；
- 3 秒后可跳过；
- `sessionStorage` 模拟会话内只展示一次；
- deep link / 回流参数命中时跳过。

**该实现只作为“开屏广告体验模拟”，不能据此把正式业务定义改成欢迎页广告。**

## 3. 正式原型落地约束

- 正常冷启动允许展示；
- 必须可跳过；
- no-fill 时直接进入 App，不阻塞启动；
- 注册回跳、赛事 / 报名 / 邀请等有明确目标的 deep link 不应被广告破坏；
- 频次规则由薄广告场景配置承接，不在 `/welcome` 页面中永久写死；
- 广告素材、竞价和真实投放交给广告 Provider。

## 4. 当前实现中可以保留的部分

- `SplashOverlay` 的全屏广告视觉与倒计时交互；
- 明确「广告」标识；
- 跳过入口；
- `shouldSkipSplash` 的关键业务回流保护思路。

后续从 Web 原型迁移到真实 App 容器时，应把触发判断从 `/welcome` 页面层上移到真正的启动场景。

## 5. 原型修订验收

- [x] 开屏视觉原型已存在
- [x] deep link / 回流保护已有原型逻辑
- [x] typecheck（`tsc --noEmit`）
- [x] `npm run build:mobile`
- [ ] 在任务 / 产品表述中统一标注“当前 `/welcome` 前置 = 冷启动开屏模拟”
- [ ] 真正 App 容器接入时将触发点迁移到冷启动层
- [ ] 补 no-fill 与正式频控策略
- [ ] Playwright 浏览器回归

# R-Final｜功能级总回归独立评审

> 评审日期：2026-08-17  
> RF02 复审前 `dev`：`b31e6914e712e20ecab73d6852e6471dea3497cd`  
> RF01 实现基线：`352a6ab90a3fb4687d7e8a6b893ea13336af9bc8`  
> Full Regression：run `32024088172` / job `95369672518`  
> 当前结论：**PASS｜RF01 已关闭两处 Confirmed Guardrail blocker，完整 R-Final 在实现基线上重新全绿。**

---

## 1. RF02 最终结论

RF02 只复审 RF01 是否真正关闭 R-Final 的两个既有 blocker，并核对 RF01 后的完整 `R-Final Full Regression`，不重新打开 F00–F03 或 F004 的 Pending 产品议题。

最终判定：**R-Final = PASS。**

通过依据：

1. `/growth/score` 已停止把 GrowthScore 冒用为“学力值”；
2. `/me/accounts` 已停止把 Email / 微信 / 企业微信绑定统称为“第三方账号”；
3. 两条 RF01 focused browser assertion 均实际执行并通过；
4. RF01 实现基线上的 Mobile route / typecheck / production build、Mobile Chromium、真实 Mobile → PC → Mobile、PC typecheck / production build、PC Chromium 全部成功；
5. RF01 没有借语义修复恢复积分经济或旧业务渠道账号，也没有无必要重构 GrowthScore、路由或绑定能力。

---

## 2. RF01 施工集复审

RF01 的产品实现与测试由 3 个连续提交组成：

- `e2a3219ce516718255f093cf0dcb882670ca8ece`：页面语义收口；
- `e6804a0bed861e1b2faa1e3d34723f55d902b7cb`：route purpose 收口；
- `352a6ab90a3fb4687d7e8a6b893ea13336af9bc8`：补两条 focused browser assertion。

随后 `b31e6914e712e20ecab73d6852e6471dea3497cd` 只更新 RF01 施工记录与 CI 证据，没有改变被测产品代码。

从 RF02 派发点 `16dc938237d618634508ec704d953bdb0c2770e9` 到 RF01 实现基线，产品改动严格限定为：

- `apps/mobile/src/features/platform-support/SupportPages.tsx`
- `apps/mobile/src/routes/registry.ts`
- `apps/mobile/tests/r-final.spec.ts`

没有扩大到其它业务文件。

---

## 3. BLOCKER-01｜GrowthScore 语义：CLOSED

当前 `/growth/score`：

```text
PageHeader: 成长概览
汇总提示: 成长记录汇总
```

原有计算仍是：

```text
基础账号 + 已完成学习 + 真实投递
```

RF01 只改展示语义，没有修改计算公式、数据来源或 `/growth/score` 路由。

`growth.score` route purpose 当前为：

```text
成长概览
```

因此当前 GrowthScore 不再占用“学力值”积分语义。

同时确认 RF01 未新增：

- 积分余额；
- 收支流水；
- `LearningPointAccount` 或等价 Store；
- 旧兑换中心；
- 课程积分兑换逻辑。

**BLOCKER-01 = CLOSED。**

---

## 4. BLOCKER-02｜账号绑定语义：CLOSED

当前 `/me/accounts`：

```text
PageHeader: 账号绑定
```

页面仍保留并可见：

- 邮箱；
- 企业微信；
- 微信；
- 绑定 / 解除绑定原型行为。

`me.accounts` route purpose 当前为：

```text
账号绑定
```

RF01 没有新增：

- 抖音达人；
- 快团团；
- 三创好物；
- `BusinessChannelAccount` 或等价旧业务渠道账号模型。

因此登录 / 联系方式绑定与旧业务渠道账号语义已经拆开，而 Pending 业务选择继续冻结。

**BLOCKER-02 = CLOSED。**

---

## 5. Focused browser regression：PASS

RF01 新增的两条窄断言已在 `R-Final Full Regression` 中实际执行，不是只写未跑。

日志中：

```text
21  R-Final GrowthScore no longer reuses learning-point semantics       PASS
22  R-Final account bindings no longer masquerade as third-party business accounts  PASS
```

第二条同时验证邮箱 / 企业微信 / 微信仍然可见。

---

## 6. 完整 R-Final 证据：PASS

基线：`352a6ab90a3fb4687d7e8a6b893ea13336af9bc8`

Workflow：

```text
R-Final Full Regression
run 32024088172
job 95369672518
conclusion: success
```

### 6.1 Mobile route / type / build

```text
Registry routes: 66
App route declarations: 69
Missing registry routes: 0
RouteProbe in App: no
Explicit 404 route: yes
Route audit PASS
```

并且：

```text
Mobile typecheck PASS
Mobile production build PASS
```

### 6.2 Mobile Chromium

执行：

- `mother-flows.spec.ts`
- `f001-phone-verification.spec.ts`
- `f002-trust-status.spec.ts`
- `f003.spec.ts`
- `r-final.spec.ts`

实际结果：

```text
22 passed (9.6s)
```

数量相对旧 R-Final 的 20 条正好增加 RF01 的 2 条语义断言，没有其它测试被删除来制造绿灯。

覆盖继续包括：

- public platform；
- pending / rejected / approved；
- workshop；
- opportunity → company → resume → application；
- ended / revoked / permissionDenied；
- F01 phone verification；
- F02 trust gate；
- F03 logout / resume / team / handoff；
- enterprise trusted business layer；
- D08 blocked；
- 两条 RF01 semantic assertions。

### 6.3 Cross-app

真实双服务回流：

```text
Mobile → PC registration portal → Mobile
1 passed (5.3s)
```

不是只验证 query string；原 no-identity account snapshot 与回流事实继续通过浏览器测试。

### 6.4 PC

```text
PC typecheck PASS
PC production build PASS
PC Chromium: 6 passed (4.0s)
```

PC 管理骨架、数据责任边界、独立报名门户、desktop / mobile 响应式报名以及 Mobile handoff context 均继续通过。

---

## 7. F004 继续冻结项

RF02 不借最终 PASS 解冻以下产品选择：

- 学力值积分经济是否恢复；
- GrowthScore 是否未来保留；
- 旧业务渠道账号是否恢复；
- 通用任务对象 / 奖励模型；
- D08 学生端主体关系；
- 创域治理 / QR 首期；
- AI 简历润色 / 机会匹配；
- 能力雷达。

这些 Pending 选择继续由后续产品确认处理；当前只确认相关 Confirmed Guardrail 已落实。

---

## 8. 历史阻断项关闭说明

上一轮 R-Final 的 `CHANGES REQUIRED` 只由两处 Confirmed Guardrail 冲突造成：

1. GrowthScore 冒用“学力值”；
2. AccountBinding 冒用“第三方账号”。

RF01 已以最小范围关闭两项，RF02 独立复审未发现新的产品级 blocker，也未发现 RF01 对此前已通过的 F00–F03、PC 报名、企业工商、可信凭证、团队、长期资产等范围造成回归。

---

# 9. 最终判定

**R-Final = PASS。**

RF01 两个 blocker 均已关闭；focused assertions 实际通过；完整 R-Final 在 RF01 实现基线重新全绿；F004 Pending 项保持冻结，不影响最终通过。

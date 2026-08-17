# RF02｜R-Final 独立复审与最终判定

**类型：评审卡**  
**状态：等待 RF01**  
**前置：RF01 已合入 `dev` 并提供施工 SHA**

> 本卡不重新设计产品，也不重新审一遍 F00–F03。只验证 RF01 是否真正关闭两个 blocker，并执行完整 R-Final 复跑后给出最终 PASS / CHANGES REQUIRED。

## 必读

1. `docs/workbench/R-Final-review.md`
2. `docs/workbench/RF01-semantic-closeout.md`
3. `docs/workbench/F004-product-decisions.md`
4. RF01 实际施工 commit / diff
5. 当前 `dev` 代码与最新 `R-Final Full Regression`

## 复审重点

### 1｜BLOCKER-01 必须关闭

确认：

- `/growth/score` 当前页面不再使用“学力值”称呼；
- `growth.score` route purpose 不再使用“学力值”；
- 没有借修文案恢复积分余额、流水、兑换中心等 Pending 业务；
- 路由与现有 GrowthScore 计算没有被无必要重构。

### 2｜BLOCKER-02 必须关闭

确认：

- `/me/accounts` 当前页面不再把 Email / 微信 / 企业微信 binding 统称为“第三方账号”；
- `me.accounts` route purpose 同步收口；
- Email / 微信 / 企业微信绑定能力仍存在；
- 没有擅自恢复抖音达人 / 快团团 / 三创好物等 Pending 业务渠道账号。

### 3｜Focused regression

确认 RF01 新增的两条 browser assertion 实际执行并通过，不接受“测试已写但没跑”。

---

## 完整 R-Final 必跑证据

以 RF01 合入后的最新 `dev` SHA 为基线，必须确认 `R-Final Full Regression` 完整成功，至少包括：

### Mobile route / build

预期：

```text
Registry routes: 66
App route declarations: 69
Missing registry routes: 0
RouteProbe in App: no
Explicit 404 route: yes
Route audit PASS
```

并确认：

```text
Mobile typecheck PASS
Mobile production build PASS
```

### Mobile Chromium

原 R-Final 基线已有 20 条；RF01 要求再补 2 条 focused assertion。

若测试结构未发生合理调整，预期应看到 **22 passed**。若数量不同，必须解释实际增减原因，不能只看总绿灯。

母动线与专项至少仍覆盖：

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

### Cross-app

真实：

```text
Mobile → PC registration portal → Mobile
```

必须继续 PASS，不能只验证 query string。

### PC

确认：

```text
PC typecheck PASS
PC production build PASS
PC Chromium 6/6 PASS
```

---

## F004 处理口径

以下仍是**允许继续冻结**，不得因为 R-Final 复审要求施工：

- 学力值积分经济是否恢复；
- GrowthScore 是否未来保留；
- 旧业务渠道账号是否恢复；
- 通用任务对象 / 奖励模型；
- D08 学生端主体关系；
- 创域治理 / QR 首期；
- AI 简历润色 / 机会匹配；
- 能力雷达。

只要 Confirmed Guardrail 已经落实，这些 Pending 选择本身不阻断 R-Final。

## 禁止

- 不因看到旧 Mockplus 功能就重新开施工；
- 不以 route audit 替代功能级复审；
- 不把“workflow success”当成唯一证据，要看具体 steps / test counts；
- 不重开已经通过的企业工商、可信凭证、团队、报名门户等范围，除非 RF01 明确造成回归；
- 评审线程不得为了让测试通过而修改产品实现。若发现产品问题，给 `CHANGES REQUIRED`。

## 最终输出

### 如果全部满足

- 将 `docs/workbench/R-Final-review.md` 更新为最终 **PASS**；
- 记录最终 `dev` SHA；
- 记录 workflow run / job；
- 记录 Mobile / cross-app / PC 实际通过数量；
- 明确列出 F004 继续冻结项；
- 给出最终评审 commit SHA。

### 如果仍有问题

给 **CHANGES REQUIRED**，只列新的阻断项及证据，不扩大成新一轮大改。

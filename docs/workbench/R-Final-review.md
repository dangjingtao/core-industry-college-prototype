# R-Final｜功能级总回归独立评审

> 评审日期：2026-08-17  
> 自动化基线：`e2c2648a79f4a849fa2728a178e308c4332fb716`  
> Full Regression：run `32022948988` / job `95366261137`  
> 当前结论：**CHANGES REQUIRED｜自动化总回归全绿，但仍有 2 个已确认产品 Guardrail 与当前实现不一致。**

---

## 1. 结论先行

R-Final 不是普通 route audit。本轮同时执行了：

- route registry / explicit 404；
- Mobile TypeScript + Vite production build；
- 五条母动线及 F01/F02/F03 专项 Chromium；
- pending / rejected / ended / revoked / permissionDenied；
- 真实 Mobile → PC → Mobile 报名回流；
- PC TypeScript + Vite production build；
- PC 管理骨架与响应式报名门户 Chromium；
- Google Drive 140 页 Mockplus 高风险功能 spot check；
- F004 Confirmed Guardrail 对照；
- duplicate truth source 复核。

工程与交互层面的总回归已经完整通过。但最终语义审计发现：

1. `/growth/score` 仍把 GrowthScore 直接叫“学力值”；
2. `/me/accounts` 仍把登录 / 联系方式绑定统一叫“第三方账号”。

这两点都与 F004 已经明确 Confirmed 的 Guardrail 直接冲突，因此 R-Final 暂不能 PASS。

修复范围很窄，不需要重新讨论积分经济，也不需要恢复旧抖音 / 快团团账号。

---

# 2. 自动化总回归：PASS

## 2.1 Route / Build

Full Regression run `32022948988`：

```text
Registry routes: 66
App route declarations: 69
Missing registry routes: 0
RouteProbe in App: no
Explicit 404 route: yes
Route audit PASS
```

Mobile：

```text
tsc -b PASS
vite build PASS
```

PC：

```text
tsc -b PASS
vite build PASS
```

## 2.2 Mobile 功能回归

执行：

- `mother-flows.spec.ts`
- `f001-phone-verification.spec.ts`
- `f002-trust-status.spec.ts`
- `f003.spec.ts`
- `r-final.spec.ts`

结果：

```text
20 passed (7.9s)
```

覆盖：

- 新用户公共平台；
- 三创赛报名 callback pending / rejected / approved；
- 赛事陪跑；
- 就业 / 实习；
- 赛后长期资产；
- F01 手机号验证；
- F02 claimable → claimed 可信凭证 gate；
- F03 logout / resume / team request / download / external handoff；
- ended；
- revoked；
- permissionDenied；
- 企业工商可信层；
- D08 继续 blocked；
- explicit 404。

## 2.3 真实跨端报名回流

执行真实双服务：

```text
Mobile 5173
→ PC 5174
→ Mobile 5173
```

结果：

```text
1 passed (3.8s)
```

继续证明：

- 无赛事身份账号快照不被默认 seed 污染；
- callback 回流写回原 `identities[]`；
- 没有创建第二份赛事身份真相源。

## 2.4 PC 浏览器回归

结果：

```text
6 passed (3.2s)
```

包括：

- PC 管理数据控制面；
- resources / students 数据责任边界；
- 独立三创赛报名门户入口；
- 队长 desktop 报名；
- 队员 mobile 响应式报名；
- Mobile handoff context + return status。

本轮曾出现两条 PC test failure，最终确认是测试基准过时：

- `企业资源关系` 已在组合文本中表达，旧断言错误使用 `exact: true`；
- admin skeleton 是桌面控制面，旧测试却沿用全局 390px viewport，导致 `lg` sidebar 的报名门户入口不可见。

仅修正测试 viewport / 文本断言，没有修改 PC 产品实现。最终 full regression 已全绿。

---

# 3. 五条母动线：PASS

### A｜新用户公共平台

访客可发现赛事、进入登录 / 报名，不依赖 CompetitionIdentity。

### B｜三创赛报名

Mobile handoff、PC 响应式报名、pending / rejected / approved callback 与真实跨端回流均已覆盖。

### C｜赛事陪跑

赛事 workspace → 创赛工坊 → Task answer → review → progress → result 连续，Task identity 保持赛事 scoped。

### D｜就业 / 实习

机会 → 企业 → 长期简历 → `returnTo` → 投递连续；企业不是只有招聘卡，还保留资源关系与可信主体层。

### E｜赛后长期资产

ended / revoked 后赛事 workspace 权限关闭，但赛事经历、成绩、证书仍进入长期资产读取路径。

---

# 4. 生命周期 / 状态完整性：PASS

已明确覆盖：

- `pending`：报名已提交等待审核；
- `rejected`：报名审核未通过；
- `approved / active`：进入赛事工作区；
- `ended`：赛事结束，进入长期资产；
- `revoked`：赛事期权限回收，但保留参赛经历和成绩 / 证书出口；
- `permissionDenied`：账号仍有赛事身份，但当前赛事业务权限不足。

没有把 revoked 与 permissionDenied 混成同一状态。

---

# 5. Legacy Feature Audit｜140 页高风险 spot check

原始审计要求 P0 / P1 不能只靠“页面有去向”判覆盖。

## 已关闭的高风险缺口

### Onboarding / Profile / 问卷

F01 已建立唯一 `StudentProfile`，手机号验证与旧问卷主要字段均有明确去向。

**PASS。**

### 企业工商信息

企业详情 `?tab=business` 当前保留法定代表人、注册资本、经营状态、成立日期、企业类型、行业 / 地区、统一社会信用代码、注册地址、经营范围等，并明确为 Mock 数据。

R-Final browser spot check PASS。

### 可信凭证

验真码、QR mock、PDF/OFD 文件 mock、文件限制、官方 handoff、证书 / 成绩保存下载与生命周期 gate 已由 F02 完成。

**PASS。**

### 退出 / 团队 / 简历 / 外部 handoff

F03 已关闭 logout、结构化教育经历、赛事期团队变更申请、赛事资料下载/分享、公众号、企微客服、课程分享等缺口。

**PASS。**

### D03 任务

当前 `/tasks` 已按台账后续决策解冻为派生 aggregator，浏览器测试证明它读取现有 competition / learning / benefit 等 domain store，不拥有第二份业务进度。

旧日常 / 核心 / 企业任务和学力值奖励模型仍未决，未被偷偷恢复。

**PASS。**

### D08 主体

`/me/subjects` 仍明确显示 Decision Blocked，没有根据旧页面自行恢复主体创建 / 扫码绑定。

R-Final browser spot check PASS。

---

# 6. BLOCKER-01｜GrowthScore 仍冒用“学力值”语义

F004 已 Confirmed：

> 学力值与 GrowthScore 必须拆义，不能把积分余额和成长评分混成一个对象 / 同一个名字。

但当前 `GrowthScorePage` 仍然：

```text
PageHeader title = 学力值
当前学力值 = 基础账号 + 已完成学习 + 真实投递
```

Route registry 也仍写：

```text
/growth/score
purpose: 学力值支撑信息
```

这正是旧 Legacy Audit 已明确指出的语义替换：

```text
旧学力值 = 可收支 / 可消费积分
当前 GrowthScore = 基础账号 + 学习 + 投递的成长分
```

F004 没有决定是否恢复积分经济，但已经明确决定：**这两者不能继续混名。**

因此当前实现违反的是 Confirmed Guardrail，而不是某个 Pending 业务选择。

## Required Fix

窄修即可：

- `/growth/score` 当前这份计算型页面不得继续叫“学力值”；
- route registry 的 purpose 同步去掉“学力值”；
- 可以使用“成长记录 / 成长概览 / 成长进度”等不占用积分语义的表达，具体文案无需在 R-Final 决定积分经济；
- 不新增 LearningPointAccount；
- 不恢复旧兑换中心；
- 不删除现有 GrowthScore，除非另有产品决定。

修复后补一个 focused assertion：该 GrowthScore 页面不再出现“学力值”语义。

---

# 7. BLOCKER-02｜账号绑定仍统一命名为“第三方账号”

F004 已 Confirmed：

> 登录 / 联系方式绑定与业务渠道账号属于不同对象，不能继续混叫“第三方账号”。

当前 `/me/accounts` 实际只有：

- 邮箱；
- 企业微信；
- 微信；
- 绑定 / 解绑。

这本质上是 `AccountBinding / ContactBinding`。

但当前：

```text
PageHeader title = 第三方账号
route registry purpose = 第三方账号
```

这会继续让人误以为它已经覆盖旧 Mockplus 的：

- 抖音达人；
- 快团团；
- 三创好物；
- 平台账号 ID / 昵称 / 状态。

而这些业务渠道账号是否恢复，目前仍是 Pending。

## Required Fix

同样只需要窄修：

- `/me/accounts` 当前页面改成“账号绑定 / 联系方式与账号绑定”等明确语义；
- route registry purpose 同步修改；
- 不恢复 BusinessChannelAccount；
- 不删除现有邮箱 / 微信 / 企微绑定；
- 不替产品决定旧抖音 / 快团团账号是否继续存在。

修复后 focused browser 只需确认当前页面不再把这些绑定称为“第三方账号”。

---

# 8. F004 在 R-Final 中的处理

F004 的治理整改已经完成，不要求六个 Pending 议题全部做出建设决定才能跑 R-Final。

R-Final 按以下口径验收：

| 项 | 当前最终处理 |
| --- | --- |
| 学力值积分经济 | **继续冻结**；是否恢复未确认；已确认必须与 GrowthScore 拆义 |
| 旧业务渠道账号 | **继续冻结**；是否恢复未确认；已确认与 login/contact binding 拆模 |
| `/tasks` | **聚合层已解冻**；通用任务对象与奖励模型继续冻结 |
| D08 主体学生端 | **继续冻结**；Organization / Affiliation Guardrail 保留 |
| 创域治理 / QR 首期 | **继续冻结**；不升级一级导航、不造扫码真相源 |
| AI 润色 / 机会匹配 | **继续冻结**；AI 不改可信事实，不做黑盒人才总分，雷达 Deferred |

因此 F004 的 Pending 业务选择本身**不是 R-Final blocker**；当前两个 blocker 是代码违反了已经 Confirmed 的边界。

---

# 9. Duplicate truth source 复核：PASS

本轮没有发现新增：

- 第二份 session；
- 第二份 CompetitionIdentity[]；
- 第二份 competition lifecycle；
- 第二份 applications；
- `/tasks` 自有 WorkshopRuntime 进度；
- TeamChangeRequest 直接篡改 team members。

`TeamChangeRequest` 是独立申请事实，不是团队事实；F00 handoff snapshot 是一次性跨端恢复桥，不是第二长期 Store。

---

# 10. 最终判定

**R-Final = CHANGES REQUIRED。**

不是工程失败：当前 full regression 已经完整绿。

只需要关闭两个语义 blocker：

1. GrowthScore 页面 / route registry 停止冒用“学力值”；
2. 现有 Email / 微信 / 企微 binding 页面 / route registry 停止统一称为“第三方账号”。

然后：

- 补两条极窄 browser assertion；
- 重新跑 `R-Final Full Regression`；
- 其它 F00–F03、PC 报名、五条母动线、可信凭证、团队、工商信息等不再返工。

完成后可以快速复审并转 PASS。

# PC05｜二次独立复审

> 日期：2026-08-18  
> 复审基线：`48fc720566a13cf3e47450e1c2f03678d81f36a9`  
> 对应初审：`docs/workbench/PC05-review.md`  
> 返工记录：`docs/workbench/PC05-review-fix.md`  
> 当前判定：**代码 / 产品契约复审通过；PC05 最终 PASS 仍待真实 build / browser Gate B 证据。**

## 1. 结论

上轮独立评审的 **1 个 P0 + 3 个 P1 全部 CLOSED**，本轮静态独立复审没有发现新的 P0 / P1。

但 PC05 自己定义的最终门禁是：

```text
Gate A｜产品 / 数据 / 权限 / 跨端契约 PASS
+
Gate B｜视觉层级 / 操作可理解性 / 普通运营可用性 PASS
=
PC05 PASS
```

本轮可以确认 Gate A 与 Gate B 的**实现和测试契约**已经收口；由于当前独立执行环境无法取得真实 build / Playwright 执行结果，本复审不把“测试已写”冒充“browser 已跑”，因此暂不把 PC05 改成 PASS。

当前更准确状态：

> **四项 review findings 已关闭；代码 / 契约二次复审通过；等待真实 typecheck / build:pc / browser regression 作为最终 Gate B 执行证据。**

---

## 2. P0｜旧 AdminConsole fallback｜CLOSED

已确认：

- `App.tsx` 不再 import / route `AdminConsole`；
- `/admin/resources/objects/:resourceId` 使用明确 legacy redirect；
- opportunity / course / benefit 旧 object route 回到当前业务页；
- legacy Organization object route 回到当前 Organization 页；
- 未知 `/admin/*` 进入 `AdminControlPlaneShell` 下的人类化兼容页；
- 普通 `/admin/*` runtime 已不存在回到旧 Truth boundary / Pattern 展览页的路径。

`admin-skeleton.spec.ts` 与 `pc05.spec.ts` 都新增了真实 legacy route assertion，不再只检查新路由。

---

## 3. P1｜PC02 默认显示业务语言｜CLOSED

`PC02HumanCompetitionConsole` 继续读取原 `competitionControlById`，没有重写底层资格、赛事、学校或 Workshop 模型。

默认显示已映射为运营语言：

- `registrationOpen → 报名中`
- `upcoming → 即将开始`
- `pending(platformReview) → 待学校审核`
- `confirmed → 官方资格已确认`
- `notRequired → 本赛事无需外部资格确认`
- `Workspace → 赛事工作区`
- `CompetitionIdentity → 学生赛事身份`
- `SchoolScope → 学校授权与审核责任 / 当前授权学校`
- `CompetitionProject → 参赛项目`
- `Workshop → 创赛工坊`

raw enum / stable id / model 名只在 `data-pc05-technical` 技术层恢复。

平台审核与外部官方资格的原判断逻辑保持不变，赛事工作区仍同时受 lifecycle 与 qualification gate 控制。

---

## 4. P1｜PC04 默认显示业务语言｜CLOSED

新的人类化 PC04 显示层继续复用 `PC04State` 与 `pc04-data`，没有重新制造课程、权益、证书状态。

### 课程

默认显示：学习状态、学习进度、考试结果、课程完成条件、完成情况。

raw `Runtime / Course Completed / progress / assessment / Competition · id / Organization · id` 仅在技术模式出现。

### 权益

默认显示：履约方式、资格规则、当前学生权益状态，以及可领取 / 暂不可领取 / 已领取 / 已使用 / 已过期。

raw Benefit / Runtime / fact / reference id 退到技术层。

### 证书

默认显示：签发状态、学生领取状态、签发主体、签发规则、编号 / 文件 / 验真、申请 / 回流记录。

状态已映射：

```text
notTriggered → 未触发
requested → 已申请
processing → 签发中
issued → 已签发
failed → 签发失败
revoked → 已撤销

claimable → 待领取
claimed → 已领取
pending → 处理中
revoked → 已撤销
```

raw `issuanceStatus / claimStatus / triggerMode / triggerRule / channel` 仅在技术层出现。

---

## 5. P1｜human-gate Playwright 覆盖｜CLOSED

当前 focused regression 已明确覆盖：

1. legacy `/admin/resources/objects/opportunity-intern-1` 不能逃回旧 `AdminConsole`；
2. 未知 `/admin/*` 仍处于统一管理 Shell；
3. PC02 默认不可见 `registrationOpen / CompetitionIdentity / SchoolScope / notRequired`；
4. PC02 技术模式可恢复 raw status / model term；
5. PC04 默认不可见 `Runtime / Course Completed / assessment= / Organization · / Competition ·`；
6. PC04 技术模式可恢复这些原始契约；
7. 证书默认显示“已签发 / 待领取 / 未触发”等业务状态；
8. 技术模式再验证 `issuanceStatus=issued / claimStatus=claimable / issuanceStatus=notTriggered`；
9. PC05 全站 human gate 将 legacy fallback、PC02 和 PC04 一并纳入，而不是只审 `/students / assets / governance`。

旧测试对三创赛简称的错误匹配也已改为匹配 canonical 完整赛事名，没有为了测试改主数据。

---

## 6. 静态一致性检查

本轮额外检查：

- `PC02HumanCompetitionConsole` 引用的 `tracks.group` 等字段存在于 `CompetitionControlRecord`；
- 人类化显示层使用映射函数展示 raw status，没有改变底层 union / gate；
- PC04 仍使用既有 `courseCompleted()`、`PC04State` 与证书 `issuanceStatus / claimStatus` 数据；
- legacy redirect 保持 stable id 到当前业务路由的确定映射；
- 未发现新的第二真相源或新的 P0/P1 业务契约漂移。

---

## 7. 执行证据边界

GitHub connector 对当前 `dev` HEAD：

- combined commit status：空；
- commit workflow runs：空。

独立执行环境尝试 clone `dev`，但 `github.com` DNS 无法解析，因此无法在本轮真实执行：

```text
npm run typecheck
npm run build:pc
npm run verify:browser:pc
```

PC05 的视觉 / 操作门禁明确要求真实浏览器走查，因此本轮不把静态测试代码等同于真实 browser PASS。

---

## 8. 最终待办

无需新增返工卡。只需补执行证据：

1. `npm run typecheck`
2. `npm run build:pc`
3. `npm run verify:browser:pc`
4. 按 `PC05-visual-usability-gate.md` 实际走总览 → 赛事 → Organization → 机会编辑 → 课程 / 权益 / 证书 → 学生 → 长期资产 → 高风险审批 / Audit。

若以上无红灯，则 PC05 可直接改为 **PASS**；不应重新打开本轮已关闭的四项 Finding，除非真实执行产生新的明确失败证据。

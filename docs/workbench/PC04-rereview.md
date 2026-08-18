# PC04｜平台课程 + 权益 + 可信证书｜独立复审（二次）

> 复审状态：**CHANGES REQUIRED**  
> 日期：2026-08-18  
> 复审基线：`dev`，包含 PR #7 merge commit `e2c0704ce0c910fcbda1e668a6f5031c657f71a8`  
> 前序独立复审：`docs/workbench/PC04-review.md`  
> 修复记录：`docs/workbench/PC04-remediation.md`

---

## 1. 总结

前序独立复审指出的 5 个 P1 与 2 个 P2 均已实质关闭：

1. `benefit-cloud-lab` / `cert-course-brand-ecommerce` Stable relation 已闭环；
2. PC04 已接回 canonical `AdminControlPlaneShell`；
3. `Course Completed` 已统一为 `progress >= requiredProgress && assessment = passed`；
4. Certificate 已拆分 `issuanceStatus` / `claimStatus`；
5. Course / Benefit 编辑已使用共享 `PC04StateProvider`，保存后跨页面保持；
6. 当前 App 6 个 Benefit 均已进入 PC04；
7. `data-analytics` 章节文案已重新与 App 对齐。

但二次复审发现 1 个新的 P1，仍会导致“课程未完成却生成课程证书”，因此本轮不能判 PASS。

```text
PC04 = CHANGES REQUIRED
```

---

## 2. 新 Finding｜P1｜课程证书触发未真正受 Course Completed 门槛约束

### 已正确收口的部分

共享契约已经明确：

```text
progress >= requiredProgress
+ assessment = passed
→ Course Completed
```

Mobile 学习状态也已经改为基于 `isCourseCompleted()` 归一化：

- progress 未达标 → 即使 assessment passed，仍不是 completed；
- assessment failed → 即使 progress = 100，也仍是 inProgress；
- 两者同时满足才 completed。

### 当前缺口

`LongTermAssetsProvider.submitAssessment(courseId, passed)` 当前在 `passed === true` 时直接创建课程证书：

```text
if (passed) {
  ...
  setCertificates(... status: "claimable")
}
```

这里没有再次判断 `isCourseCompleted()`。

与此同时，`CourseAssessmentPage` 当前可以通过路由直接进入，并没有强制要求学习进度先达到 100%。

因此存在可复现语义：

```text
brand-ecommerce 当前 progress = 38%
→ 直接进入 /courses/brand-ecommerce/assessment
→ 答对
→ assessment = passed
→ LearningRecord 仍是 inProgress / Course Completed = false
→ 但 cert-course-brand-ecommerce 已被创建为 claimable
```

这违反已经确认的产品规则：

```text
Course Completed
→ 自动触发课程证书签发
```

而不是：

```text
assessment passed
→ 无条件产证
```

### 影响

- 学习完成事实与可信证书事实发生直接冲突；
- PC04 已建立的 `issuanceStatus = notTriggered` 语义可能与 Mobile Runtime 产生矛盾；
- 后续 Benefit 如果引用 `courseCompleted`，可能出现“权益判定未完成，但证书已经可领取”的不一致；
- 这是 PC05 跨端总审计明确应阻断的类型，因此不应留到 PC05 再处理。

### 最小修复要求

证书创建必须复用同一完成判定，不再单独以 `passed` 作为触发门槛。

建议在 `submitAssessment` 计算更新后的 record 后，只在：

```text
isCourseCompleted(updatedRecord)
```

为 true 时创建 / 触发课程证书。

不需要增加新的规则系统。

### 必补回归

新增一条 Mobile focused / R-Final assertion：

```text
课程进度未达标
→ 直接进入 assessment
→ 答对
→ assessment = passed
→ CourseLearning 仍不是 completed
→ 不产生 claimable Certificate
```

然后再验证：

```text
progress 达标
+ assessment passed
→ completed
→ 证书进入 claimable / 对应签发流程
```

---

## 3. 前序 Findings 复核结果

### Finding 01｜Stable relation 断链｜CLOSED

- `retail-project-lab → benefit-cloud-lab` 已存在真实 PC04 Benefit；
- `brand-ecommerce → cert-course-brand-ecommerce` 已存在真实 PC04 Certificate；
- focused assertion 已点击真实关系并确认不再进入 Missing。

### Finding 02｜PC04 独立后台壳｜CLOSED

`/admin/pc04/*` 当前由 `App.tsx` 包入 `AdminControlPlaneShell`，继续显示 7 域导航与 Role / Module Permission / Data Scope。

### Finding 03｜Course Completed 语义冲突｜主体问题 CLOSED

Mobile `LearningRecord.status` 已变为兼容派生字段，考试失败不再保持 completed；共享 `isCourseCompleted()` 已作为 PC / Mobile 公共契约。

本轮新 Finding 是该规则在“证书触发”处仍少了一次门槛复用，不推翻此项主体修复。

### Finding 04｜证书签发 / 领取状态混用｜CLOSED

PC04 已拆成：

```text
issuanceStatus
claimStatus
```

`issued + claimable` 与 `notTriggered + 尚未生成个人 claim state` 已能清楚表达。

### Finding 05｜Course / Benefit 假保存｜CLOSED

Course / Benefit 已通过共享 `PC04StateProvider` 写回；返回详情 / 列表仍能看到修改结果；Benefit 履约类型变更同步更新 detail。

### P2｜权益覆盖不足｜CLOSED

当前 App 6 个 Benefit 均已进入 PC04。

### P2｜章节文案漂移｜CLOSED

`data-analytics` 已对齐为 App 当前的 `练习与考试` / `成果确认`。

---

## 4. focused assertions 复核

现有 `apps/pc/tests/pc04.spec.ts` 已有效补齐前序复审要求，覆盖：

- canonical shell；
- Course Completed 派生；
- 两条 Stable relation；
- Course 保存；
- Benefit 保存与 detail 同步；
- 六个权益；
- issuance / claim 分离；
- 章节文案。

Mobile `r-final.spec.ts` 也已覆盖：

```text
progress 100 + assessment failed
→ 学习中
→ assessment passed
→ 已完成
```

但尚未覆盖本轮发现的：

```text
progress < requiredProgress + assessment passed
→ 不得生成证书
```

---

## 5. CI / browser 说明

PR #7 已被 GitHub 识别为 merged，merge commit 为 `e2c0704ce0c910fcbda1e668a6f5031c657f71a8`。

当前 connector 仍没有返回该 commit 对应的 workflow run，因此本轮不声明新的 CI / browser PASS。

本次结论来自代码契约复核与现有 focused assertions 审查；修复上述单点后可再次做快速独立复审。

---

## 6. 最终判定

```text
PC04 = CHANGES REQUIRED
```

范围已非常小：**只需把课程证书自动触发绑定到同一 `isCourseCompleted()` 契约，并补“低进度直接考试通过不得产证”的回归。**

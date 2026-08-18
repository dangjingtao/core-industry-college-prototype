# PC04｜平台课程 + 权益 + 可信证书｜独立复审

> 复审状态：**CHANGES REQUIRED**  
> 日期：2026-08-18  
> PC04 合入提交：`304a3805cb00ae7c6b08e6b0ef06e5f8764e6d41`  
> 复审时 `dev` 基线：`d73b404f9684d60b4d6c0acf5602a4937cac1774`  
> 范围：PC04 产品契约、PC01 控制面接入、App consumer 一致性、stable relation 与 focused assertions；不在本轮评价整体 PC 视觉质量。

---

## 1. 总结

PC04 的业务方向基本正确：

- 课程保持平台托管，首期只做视频 + 小测试完成模型；
- 个人 `CourseLearning` 没有被 PC 配置表单直接改写；
- 权益首期保持个人领取，只保留兑换码 / 外部领取链接 / 线下核销三类履约；
- 权益资格引用的是可解释事实，没有建设黑盒资格评分；
- 课程“必修”没有被错误绑定成官方赛事资格；
- 课程证书没有提供“逐张人工发证”作为主流程；
- 没有改写 Mobile 产品逻辑，也没有覆盖 PC02 / PC03 业务文件。

但当前仍存在多处跨端 / 跨卡契约断裂，不能判定 PASS。

**最终结论：`CHANGES REQUIRED`。**

---

## 2. Finding 01｜P1｜课程稳定关系指向不存在的 PC 权益 / 证书对象

PC04 课程数据中存在：

```text
retail-project-lab
→ unlockBenefitId = benefit-cloud-lab

brand-ecommerce
→ certificateId = cert-course-brand-ecommerce
```

这两个 ID 都来自 Mobile 当前真实数据。

但 `pc04Benefits` 没有 `benefit-cloud-lab`，`pc04Certificates` 也没有 `cert-course-brand-ecommerce`。

因此课程详情虽然展示 stable relation，实际点击后会进入 Missing。

### 修复要求

至少补齐：

- `benefit-cloud-lab`；
- `cert-course-brand-ecommerce`。

并增加 stable relation 完整性回归：PC04 所有 Course / Benefit / Certificate relation 都不得指向 Missing。

---

## 3. Finding 02｜P1｜PC04 自建 Frame，仍绕开 PC01 canonical 控制面

PC01 已固定 7 个管理域、Role、Module Permission、Data Scope 与统一导航；当前主线也已经出现 canonical `AdminControlPlaneShell`。

PC04 仍使用自己的 `Frame`，进入 `/admin/pc04/*` 后只看到课程 / 权益 / 可信证书二级导航以及返回资源 / 资产的链接，完整 PC01 控制面上下文消失。

这不是单纯视觉问题，而是 PC01 → PC04 的接入契约没有成立。

### 修复要求

PC04 应接入 canonical `AdminControlPlaneShell`（或完全等价的统一 Shell contract）：

- Course / Benefit 归属“资源运营”；
- Certificate 归属“资产与可信凭证”；
- `/admin/pc04/*` 最多作为二级业务路由，不形成独立顶层后台壳。

---

## 4. Finding 03｜P1｜`CourseLearning.status = completed` 与正式 Course Completed 语义冲突

已确认规则：

```text
视频学习进度达标
+ 小测试通过
→ Course Completed
```

但当前 Mobile `completeCourse(courseId)` 会在进入考试前直接把：

```text
status = completed
progress = 100
assessment = idle
```

如果考试失败，`assessment = failed`，`status` 仍可能保持 `completed`。

因此当前 `completed` 更像“学习内容进度完成”，不能直接等同正式 Course Completed。

### 修复要求

首期不需要复杂状态机，统一为：

```text
progressComplete = progress >= configured threshold
Course Completed = progressComplete && assessment = passed
```

后续权益 / 证书规则引用正式派生的 Course Completed，不直接引用单独的 `LearningRecord.status = completed`。

---

## 5. Finding 04｜P1｜证书“签发状态”与 App 的“领取状态”被混成同一个字段

已确认课程证书流程：

```text
满足课程完成条件
→ 系统自动触发签发
→ 外部签发结果回流
→ 学生长期资产
```

PC04 的 `CertificateAdminRecord.status` 却直接复用 App 当前：

```text
claimable / claimed / pending / revoked
```

这些更接近学生侧领取 / 展示状态，无法完整表达签发流程。

当前已经出现矛盾示例：

```text
cert-course-data-analytics
status = claimable
certificateNumber = 未签发
credential = 未签发
verification = COURSE-DA-26001
```

即同时表现为“可领取”“未签发”且已有验真码。

### 修复要求

不需要万能工作流，但至少拆开：

```text
issuanceStatus = 签发流程状态
claimStatus    = App / 学生领取状态（如仍需要）
```

或者首期只把 `issuanceStatus` 作为后台签发状态，把 App `claimable / claimed` 明确标成独立 Runtime，不再称为签发状态。

---

## 6. Finding 05｜P1｜课程 / 权益“保存配置”仍是假闭环

### Course

课程编辑的名称、视频完成比例、及格线都只存在当前组件 local state。点击保存只 `setSaved(true)`；离开页面后重新读取 `pc04Courses` 初始常量。

页面提示“课程配置已在本次原型会话中更新”，但实际上跨页面就丢失。

### Benefit

权益编辑也只在 local state 改 `fulfillment`。

而且把履约类型从 `manual` 改成 `code` 后，`fulfillmentDetail` 仍使用原始 manual 文案，会出现“兑换码 / 卡码 + 线下工作人员核销”这种内部冲突。

### 修复要求

Course / Benefit 的列表、详情、编辑至少共享同一份 PC04 原型 state；保存后返回详情必须看到新配置。真实 API 可以后替换，但当前不能用成功反馈掩盖数据已丢失。

---

## 7. Finding 06｜P2｜PC04 对 App 当前权益覆盖不完整

Mobile 当前已有 6 个权益：

- `benefit-campus-video`；
- `benefit-beauty-sample`；
- `benefit-cloud-lab`；
- `benefit-sanchuang-course`；
- `benefit-activity-ride`；
- `benefit-history`。

PC04 当前只配置 3 个。

首期不要求每个历史对象都有复杂编辑器，但作为 App 数据控制面，至少应该给当前 App 对象明确后台来源 / 只读归属。其中 `benefit-cloud-lab` 是课程直接解锁依赖，属于 P1 必补。

---

## 8. Finding 07｜P2｜同 courseId 的章节文案存在轻微双写漂移

例如 `data-analytics`：

Mobile：

```text
练习与考试
成果确认
```

PC04：

```text
练习与考试准备
成果确认测试
```

PC04 已被定义为课程内容控制面，同一个 `courseId` 不应在 PC / App 两端分别 hardcode 成略有差异的课程内容。

修复时应严格复用当前 App 文案，或收进共享 mock / 统一数据源。

---

## 9. 已确认通过的部分

以下方向可以保留：

1. Course / Benefit / Certificate 复用当前 Mobile stable id；
2. 课程全部平台托管；
3. 不建设万能学习 / 权益规则引擎；
4. CourseLearning 按个人记录，不团队共享；
5. “必修”不默认阻断赛事主流程；
6. 权益仍是个人领取；
7. 履约固定三类；
8. 权益资格没有黑盒评分；
9. 课程证书采用自动触发方向，不逐张人工发证；
10. 撤销证书不物理删除长期历史；
11. PC04 没有直接修改 Mobile Runtime 或报名门户。

---

## 10. focused assertions 复审

现有 `apps/pc/tests/pc04.spec.ts` 覆盖方向正确，但不足以支撑 PASS。

修复后至少补：

1. `retail-project-lab → benefit-cloud-lab` 可打开真实权益详情；
2. `brand-ecommerce → cert-course-brand-ecommerce` 可打开真实证书规则；
3. PC04 仍处于 PC01 canonical 全局控制面，Role / Module / Data Scope 不消失；
4. Course 编辑 → 保存 → 返回详情，新配置仍存在；
5. Benefit 切换履约 → 保存 → 返回详情，类型与 detail 一致；
6. Course Completed 必须由进度达标 + assessment passed 派生；
7. 课程证书分别断言 `issuanceStatus` 与 App claim state；
8. 所有 PC04 stable relation 均不进入 Missing。

---

## 11. CI / browser 证据

PR #6 已确认 merged，合入提交：

`304a3805cb00ae7c6b08e6b0ef06e5f8764e6d41`

本次复审能够确认 focused assertions 已提交，但 GitHub connector 对该 merge commit 没有返回可用的 combined status，因此不把“测试文件存在”或“PR merged”当成 CI / browser PASS。

---

## 12. 最终判定

```text
PC04 = CHANGES REQUIRED
```

主要原因不是产品方向错误，而是：

1. stable relation 有 Missing 断链；
2. 没有接回 PC01 canonical 控制面；
3. Course Completed 与 Mobile `completed` 语义冲突；
4. 证书签发状态与学生领取状态混用；
5. Course / Benefit 编辑仍是假保存闭环。

修复范围可以保持在 PC04 + 必要的共享状态语义收口，不需要推翻课程 / 权益 / 可信证书三块产品方向。

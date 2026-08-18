# PC04｜CHANGES REQUIRED 修复记录

> 来源：`docs/workbench/PC04-review.md`  
> 原复审提交：`c7ceeee848676a27e90bfb6dd7d4f58217e7f986`  
> 修复基线：`d14707b75ff5ff578c2bf48004310f7dc9bd0dbd`  
> 目标：只收复审指出的对象闭环、控制面接入、状态契约与原型持久化，不推翻 PC04 产品方向。

## 1. Stable relation 闭环

补齐 App 已存在但 PC04 缺失的对象：

- `benefit-cloud-lab`；
- `cert-course-brand-ecommerce`。

同时 PC04 权益列表补齐当前 App 六个权益，并修正 Course → Organization 为当前 PC03 canonical `/admin/organizations/:organizationId` 路由。

## 2. 接回 canonical AdminControlPlaneShell

`/admin/pc04/*` 不再自建独立后台 Frame，而是由 `App.tsx` 统一包进 `AdminControlPlaneShell`。

归属关系：

```text
Course / Benefit → 资源运营
Certificate      → 资产与可信凭证
```

`AdminControlPlaneShell` 同步识别 PC04 二级路由，继续显示：

- 7 域主导航；
- Role；
- Module Permission；
- Data Scope。

## 3. Course Completed 正式语义

新增共享 helper：

```text
progress >= requiredProgress
+ assessment = passed
→ Course Completed
```

Mobile `LearningRecord.status` 改为兼容派生字段：视频进度到 100% 但考试未通过时仍为 `inProgress`；只有通过 assessment 后才进入 `completed`。

PC04 资格 / 证书规则不再把单独的 `status=completed` 当正式完成事实。

## 4. 证书签发与领取拆分

PC04 Certificate 拆为：

```text
issuanceStatus
claimStatus
```

其中：

- `issuanceStatus` 描述签发流程：notTriggered / requested / processing / issued / failed / revoked；
- `claimStatus` 只映射学生 App 的 claimable / claimed / pending / revoked Runtime。

`cert-course-data-analytics` 已解释为 `issued + claimable`，不再出现“未签发 + 已有验真码”的矛盾组合；`cert-course-brand-ecommerce` 当前为 `notTriggered`，尚未生成个人 claim state。

## 5. Course / Benefit 真保存

新增 `PC04StateProvider`：

- Course 名称、视频进度阈值、考试及格线保存到 PC04 会话共享 state；
- Benefit 履约类型保存到同一 state；
- 切换履约类型时同步替换对应履约说明，避免 code 类型继续显示 manual 文案；
- 返回详情 / 列表后仍读取保存后的配置。

真实 API 后续只需要替换 provider 写入层，不需要重做页面契约。

## 6. P2 一并收口

- PC04 覆盖 Mobile 当前 6 个权益对象；
- `data-analytics` 章节标题重新严格对齐 App：`练习与考试`、`成果确认`。

## 7. focused regression

`apps/pc/tests/pc04.spec.ts` 更新为覆盖：

1. canonical shell + Role / Module / Data Scope；
2. Course Completed 正式派生；
3. 两条原 Missing stable relation；
4. Course 保存后跨页面保持；
5. Benefit 履约类型 + detail 同步持久化；
6. 六个 App 权益全部有 PC04 归属；
7. issuanceStatus / claimStatus 分离；
8. 章节文案不再双写漂移。

Mobile `r-final.spec.ts` 追加：视频进度完成但考试失败仍显示“学习中”，考试通过后才显示“已完成”。

## 8. 评审边界

本轮施工线程只把 PC04 修回“可复审”状态，不自行标记 PASS。独立复审应以真实 type-check / build / browser regression 与上述 8 条 focused assertions 为准。

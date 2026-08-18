# PC02｜赛事控制台 + 报名资格 + 学校审核 + Workshop

> 施工分支：`dev`  
> 开始时 branch HEAD：`f9cf199b4d1c5fddd39388f66fa542c2c4cd7baf`  
> 状态：实现完成，待独立评审  

## 1. 目标

PC02 把 PC01 的 `Competition` 对象详情提升为真正的赛事详情型控制台，但不新增第二套赛事真相源，也不在 `/admin` 重建现有响应式报名门户。

同一控制面同时承载：

1. 三创赛：外部权威赛事，官方 API 优先，平台承接部分报名；
2. 普通合作赛事：平台直接配置。

核心边界固定为：

```text
外部权威赛事事实
≠ 平台承接报名流程
≠ 核心产业学院叠加服务
```

## 2. 实现范围

### Competition 详情控制台

路由继续沿用 PC01 对象地址：

```text
/admin/competitions/objects/:competitionId
```

由 PC02 专用控制台接管 Competition 详情；赛事列表、PC01 总览、其它管理域继续使用既有控制面。

控制台覆盖：

- 赛事基础资料与赛道；
- 报名接入方式及四种通用模式：平台门户 / 外部 URL / API 或第三方 / 无线上报名；
- 官方同步状态、来源优先级与 API / 文件 / 人工修正冲突策略；
- 官方统一窗口与地方执行节点；
- 学校授权范围；
- Team / TeamMember / CompetitionProject；
- CompetitionIdentity 映射；
- 赛事资料；
- 赛事专属课程 / 权益 / 活动关联；
- Workshop 配置与赛事 scope；
- App consumer 与 stable relation。

### 报名资格双层状态 + Workspace Gate

三创赛控制台明确拆开：

```text
platformReview
officialQualification
```

原型交互支持：

```text
学校审核 pending
→ 学校审核 approved
→ officialQualification 仍 pending
→ 正式 Workspace 仍锁定
→ 模拟官方 API confirmed
→ 正式 Workspace 才开放
```

因此 PC02 不把 `platformApproved = officialConfirmed`。

Workspace 还必须同时满足赛事生命周期：

```text
lifecycleAllowsWorkspace
&& qualificationAllowsWorkspace
→ Workspace open
```

普通合作赛事可以是 `officialQualification = notRequired`，表示“不需要外部权威资格回流”，但如果赛事仍为 `upcoming`，Workspace 仍保持锁定，不能把 `notRequired` 误解成“立即开放”。

### CompetitionIdentity

PC02 不创建第二份赛事身份 Store。控制台明确提示：Mobile 现有 `identities[]` / CompetitionIdentity 继续作为长期账号赛事身份语义，当前 registration `approved` 属于平台报名层；需要外部权威资格的赛事由 PC 控制面单独表达 `officialQualification`。

### 学校审核与数据 Scope

- 跨校团队只由队长学校统一审核；
- 示例中队员可来自其它学校，但审核责任仍归队长学校；
- 学校老师只可读取当前授权赛事 + 当前授权学校直接相关的数据；
- 明确禁止读取其它赛事、长期画像、求职简历、投递、权益消费、Workshop 私人回答 / AI 内容等。

### CompetitionProject

PC02 只表达赛事期：

```text
Competition
  └─ CompetitionProject
```

不建立跨赛事长期 Project。赛事结束后 handoff 到长期资产的是项目摘要、参赛经历、团队角色、成绩、证书等。

### Workshop

PC 只管理：

- 是否启用；
- `competitionId` scope；
- lifecycle；
- 技能包 / 能力包。

不把学生私人回答与 AI 生成内容暴露给学校老师或普通赛事运营。

## 3. 两个验收场景

### A. 三创赛

```text
competitionId=sanchuang-16
source=API 同步
authority=externalAuthority
registration=平台承接门户
platformReview=pending
officialQualification=pending
status=registrationOpen
```

学校审核通过后官方资格仍保持 pending；只有模拟官方 API 回流 confirmed 后正式 Workspace 才开放。

### B. 普通合作赛事

```text
competitionId=innovation-cup-2026
source=平台配置
authority=platformConfigured
registration=平台承接报名
officialQualification=notRequired
status=upcoming
```

与三创赛共用同一个 Competition 控制台、SchoolScope、CompetitionProject、Workshop 与 stable id 语义，没有第二套后台。由于赛事仍为 upcoming，即使无需外部权威资格回流，正式 Workspace 仍锁定。

## 4. 修改范围

- `apps/pc/src/admin/competition-control-data.ts`
- `apps/pc/src/admin/CompetitionConsole.tsx`
- `apps/pc/src/App.tsx`
- `apps/pc/tests/admin-skeleton.spec.ts`
- `docs/workbench/PC02-competition-console.md`

未修改：

- `apps/pc/src/registration-portal/*` 的报名业务流程；
- Mobile `identities[]` 真相源；
- Mobile Workshop 私人运行内容；
- PC01 其它管理域。

## 5. Browser 回归断言

`apps/pc/tests/admin-skeleton.spec.ts` 已新增 PC02 focused browser assertions：

1. 三层事实边界同时可见；
2. CompetitionIdentity 映射明确存在；
3. 学校审核 approved 不会自动把 officialQualification 变为 confirmed；
4. 外部权威资格 confirmed 前 Workspace 保持锁定；
5. confirmed 且赛事生命周期允许后 Workspace 才开放；
6. 跨校团队由队长学校统一审核；
7. Workshop 私人回答 / AI 内容明确在学校 Scope 之外；
8. `innovation-cup-2026` 使用同一控制台且官方资格为 `notRequired`；
9. `innovation-cup-2026` 仍为 upcoming 时 Workspace 保持锁定；
10. 原 PC01 Competition stable id / relation 断言继续经过同一路由；
11. 现有 `/registration-portal/*` 继续作为独立业务入口。

## 6. 并行施工处理

施工过程中 PC03 已并行修改 `apps/pc/src/App.tsx`。PC02 写路由前重新读取最新 `dev`，只新增：

```text
/admin/competitions/objects/:competitionId
→ CompetitionConsole
```

没有覆盖 PC03 的 Organization / Opportunity / Content 路由。最终收口时再次读取 `dev`，PC04 路由也已并行存在，PC02 路由与 PC03 / PC04 均同时保留。

## 7. 实现提交

- Competition 控制面模型：`738f41cad4159d6b88a9e712e5d09c2cb94e48b8`
- Competition 详情控制台：`c3ae7f05b4901c5b4866a4d4b37aeb0377cd984f`
- 路由接入：`1a3ebf1a8efb3480e56f1e6e95e47467c3eaa717`
- 初版 PC02 browser assertions：`dc3f2a08c26f798a30fd3246bc6dd9e91cabde84`
- Workspace lifecycle + qualification 双门禁修正：`373410687558dc53f60f109f0a86ef5ac9780c55`
- lifecycle / CompetitionIdentity browser assertions：`d9b1709d2848d88b52ef8aadd95fdb2888e9e33d`

## 8. 验证与独立评审要求

施工线程只声明“实现完成，待独立评审”，不自行标记 PASS。

本轮已经完成代码级语义自检，并在收口时确认最新 `dev` 仍同时保留 PC02、PC03、PC04 路由。GitHub connector 对本次直接 push 的 `fetch_commit_workflow_runs` 与 combined status 未返回可用 run / status，因此不伪造 CI PASS。

独立评审仍至少需要：

- `apps/pc` 真实 type-check / Vite build；
- `apps/pc/tests/admin-skeleton.spec.ts` browser regression；
- 三创赛与普通合作赛事两个场景人工走查；
- 确认未把现有报名 Portal 搬进 `/admin`；
- 确认学校 Scope 不泄露 Workshop 私人回答 / AI 内容；
- 确认平台审核通过不会提前开放外部权威赛事 Workspace；
- 确认 upcoming 等生命周期状态不会因 `officialQualification=notRequired` 被错误放行。
# PC02｜赛事控制台 + 报名资格 + 学校审核 + Workshop

> 施工分支：`dev`  
> 开始时 branch HEAD：`f9cf199b4d1c5fddd39388f66fa542c2c4cd7baf`  
> 状态：实现完成，待独立评审  

## 1. 目标

PC02 把 PC01 的 `Competition` 对象详情提升为真正的赛事详情型控制台，但不新增第二套赛事真相源，也不在 `/admin` 重建现有响应式报名门户。

同一控制面必须同时承载两类赛事：

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

由 PC02 专用控制台接管 Competition 详情；赛事列表、PC01 总览、其它管理域继续使用 PC01 总壳。

控制台覆盖：

- 赛事基础资料与赛道；
- 报名接入方式；
- 官方同步状态与来源优先级；
- API / 文件 / 人工修正冲突策略；
- 官方统一窗口与地方执行节点；
- 学校授权范围；
- Team / TeamMember / CompetitionProject；
- 赛事资料；
- 赛事专属课程 / 权益 / 活动关联；
- Workshop 配置与赛事 scope；
- App consumer 与 stable relation。

### 报名资格双层状态

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

普通合作赛事使用同一组件，但 `officialQualification = notRequired`，不虚构一个不存在的外部权威状态。

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
官方资格=pending
```

学校审核通过后官方资格仍保持 pending；只有模拟官方 API 回流 confirmed 后正式 Workspace 才开放。

### B. 普通合作赛事

```text
competitionId=innovation-cup-2026
source=平台配置
authority=platformConfigured
registration=平台承接报名
officialQualification=notRequired
```

与三创赛共用同一个 Competition 控制台、SchoolScope、CompetitionProject、Workshop 与 stable id 语义，没有第二套后台。

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

`apps/pc/tests/admin-skeleton.spec.ts` 新增 PC02 focused browser assertions：

1. 三层事实边界同时可见；
2. 学校审核 approved 不会自动把 officialQualification 变为 confirmed；
3. 外部权威资格 confirmed 前 Workspace 保持锁定；
4. confirmed 后 Workspace 才开放；
5. 跨校团队由队长学校统一审核；
6. Workshop 私人回答 / AI 内容明确在学校 Scope 之外；
7. `innovation-cup-2026` 使用同一控制台且官方资格为 `notRequired`；
8. 原 PC01 Competition stable id / relation 断言继续经过同一路由；
9. 现有 `/registration-portal/*` 继续作为独立业务入口。

## 6. 并行施工处理

施工开始后发现 PC03 并行线程已经修改 `apps/pc/src/App.tsx`，新增：

- `PC03Console`；
- `PC03OpportunityRoute`；
- Organization / Opportunity / Content 路由。

PC02 在写入路由前重新读取最新 `dev`，只新增：

```text
/admin/competitions/objects/:competitionId
→ CompetitionConsole
```

没有覆盖 PC03 的并行改动。

## 7. 实现提交

- Competition 控制面模型：`738f41cad4159d6b88a9e712e5d09c2cb94e48b8`
- Competition 详情控制台：`c3ae7f05b4901c5b4866a4d4b37aeb0377cd984f`
- 路由接入并保留 PC03 并行改动：`1a3ebf1a8efb3480e56f1e6e95e47467c3eaa717`
- PC02 browser assertions：`dc3f2a08c26f798a30fd3246bc6dd9e91cabde84`

## 8. 独立评审要求

施工线程只声明“实现完成，待独立评审”，不自行标记 PASS。

独立评审至少需要：

- `apps/pc` type-check / Vite build；
- `apps/pc/tests/admin-skeleton.spec.ts` browser regression；
- 三创赛与普通合作赛事两个场景人工走查；
- 确认未把现有报名 Portal 搬进 `/admin`；
- 确认学校 Scope 不泄露 Workshop 私人回答 / AI 内容；
- 确认平台审核通过不会提前开放外部权威赛事 Workspace。

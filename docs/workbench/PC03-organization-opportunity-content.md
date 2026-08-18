# PC03｜Organization + 机会 + 内容运营

> 分支：`dev`  
> 类型：施工卡记录  
> 状态：**待评审**  
> 开始时 branch HEAD：`f9cf199b4d1c5fddd39388f66fa542c2c4cd7baf`

## 1. 施工依据

本卡按以下已确认边界施工：

- `docs/workbench/00-work-ledger.md` 的 PC03；
- `docs/product/05-pc-admin-product-decisions.md` 的 Organization、机会与投递、内容发布决策；
- Mobile 当前 `Company / Opportunity` stable value；
- Mobile 当前 `ApplicationStatus`：`notSubmitted / submitting / submitted / statusUnknown / failed`；
- PC01 已建立的统一来源、stable ID、Role + Module Permission + Data Scope 与跨域关系 Pattern。

不把企业扩成招聘 SaaS，不建立 Candidate CRM，不新增黑盒人才评分，也不把 Organization 与 Mobile D08 `/me/subjects` 混为一谈。

## 2. 实际修改范围

- `apps/pc/src/admin/PC03Console.tsx`
- `apps/pc/src/admin/PC03OpportunityRoute.tsx`
- `apps/pc/src/App.tsx`
- `apps/pc/tests/pc03.spec.ts`
- `docs/workbench/PC03-organization-opportunity-content.md`

为避免破坏 PC01 独立评审，原有 `/admin/organizations/objects/:id` Pattern 路由保持由 `AdminConsole` 承接；PC03 使用：

```text
/admin/organizations
/admin/organizations/:organizationId
/admin/opportunities/*
/admin/content
```

## 3. Organization

已形成统一 Organization 控制面：

- 企业；
- 学校；
- 赛事组织方；
- 合作机构 / 资源提供方。

当前 Mobile 企业 stable value 直接沿用为 `organizationId`，例如：

```text
companyId=northstar-beauty
→ organizationId=northstar-beauty
```

没有生成第二套企业 key。

Organization 详情展示与以下对象的稳定关系：

- Competition；
- Opportunity；
- Course；
- Benefit；
- Activity；
- SchoolScope。

学校、企业、合作方首期仍只有供稿 / 合作能力，没有平台直接发布权。

## 4. 机会管理

已实现中保真原型能力：

- 创建 Opportunity，创建时显式填写 `opportunityId`；
- 编辑标题、来源 Organization、地区、类型与摘要；
- `opportunityId` 编辑时保持只读；
- `open / closed` 上下架切换；
- 来源 `organizationId`；
- 可解释字段圈选：学校、专业、地区、赛事经历、课程完成、证书、比赛成绩；
- 规则命中后由运营确认发送范围；
- 发送范围允许人工增删；
- 临时范围不保存为 CandidateRecord，不形成候选人 CRM。

正式投递边界保持：

```text
App 内投递
→ Application Runtime
→ PC 运营维护
→ App 回流
```

当前 PC03 只使用 Mobile 已存在的 Application 对齐状态 `submitted / statusUnknown / failed` 做演示，不自行发明一套新的候选人流程状态。

编辑页当前保存到 PC03 原型内存态；正式后台接入时应替换为 Opportunity API 写入，不把前端原型态伪装成持久化成功。

## 5. 内容运营

首期内容类型：

- 首页 Banner；
- 资讯；
- 赛友内容；
- 活动。

已实现：

- 新建内容并显式填写 `contentId`；
- `draft / published / unpublished` 发布状态；
- 平台运营发布 / 下架；
- 定向范围：全平台 / 赛事 / 学校 / 地区；
- 供稿方与正式发布方分离。

学校、企业、合作方可以供稿，但正式发布动作仍属于核心产业学院运营。

## 6. 明确未做

- Candidate CRM；
- 企业招聘 SaaS；
- 企业登录后台直接处理投递；
- 黑盒人才评分；
- 个性化岗位偏好学习；
- 复杂用户标签推荐；
- 第二份 Application / Company / Organization 真相源；
- PC02 赛事控制台施工；
- PC04 课程 / 权益 / 证书施工。

## 7. 浏览器回归

新增 `apps/pc/tests/pc03.spec.ts`，focused assertions 覆盖：

1. Organization 统一主体与 Mobile company stable value 映射；
2. Organization → 赛事 / 机会 / 课程等跨域关系；
3. Opportunity 新建、编辑、上下架；
4. 编辑时 stable `opportunityId` 只读；
5. 可解释字段圈选、人工增删与运营确认；
6. Application 继续作为唯一投递事实；
7. 内容发布权限；
8. 赛事 / 学校 / 地区 Scope；
9. 内容新建、发布 / 下架。

仓库工作流定义表明，`apps/pc/**` 推送到 `dev` 会触发 PC TypeScript/Vite build，R-Final workflow 还会执行 PC 全量 Playwright。当前 GitHub connector 的 workflow 查询只返回 PR 触发 run，且该轮为直接 push，因此施工线程无法可靠读取对应 push run 的 run id / 最终状态；不据此伪造 CI PASS。

施工线程只提交实现与回归断言，不自行把 PC03 标记为 `PASS`；最终状态由独立评审确认。

## 8. 实现提交

本轮施工提交序列：

- `5e3da144dfba5bf02bcb50ade89bda7014bb7e63`：PC03 控制台主体；
- `cb6657f6f6596da23afa08dde3ce99c596a04a04`：接入 App 路由；
- `15eaba18d057fc804e71f3c2f9b5a62a60527fe4`：收窄路由，保留 PC01 Organization object Pattern；
- `b05fc67c5c7b2a3d5e95238c5eff5851e4bcda51`：首轮 focused browser assertions；
- `d9b7c1dc423557f26bb4530573e37e9e765f3271`：Opportunity 编辑交互；
- `d0096bf78bfec124a1e6326ef38d21946d036855`：接入 Opportunity 编辑路由；
- `1d34a308e25347f04235b8e59d296f672e5817d7`：补 Opportunity edit browser assertion。

后续以包含本文件的最新 `dev` HEAD 作为独立评审基线。

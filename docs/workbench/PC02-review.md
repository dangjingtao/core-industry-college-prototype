# PC02｜赛事控制台 + 报名资格 + 学校审核 + Workshop｜独立评审

> 评审状态：**CHANGES REQUIRED**  
> 日期：2026-08-18  
> 施工基线：`bad9b9877e3c054032a3cbd39132d5ede8c6e8e4`  
> 当前复核基线：`dev` 已包含 PC02，且后续 PC03 / PC04 收口提交叠加其上  
> 范围：Competition 主数据复用、资格双层状态、Workspace gate、学校审核、Organization 关系、Workshop 隐私、报名 Portal 边界、两类赛事同模。

---

## 1. 结论

PC02 的核心赛事模型方向成立，以下关键契约已经满足：

- 三创赛与普通合作赛事共用同一 `Competition` 控制模型；
- `platformReview !== officialQualification`；
- Workspace 同时受资格与赛事 lifecycle gate；
- `officialQualification=notRequired` 不会绕过 upcoming lifecycle；
- Competition 基础 name / status / source / relation 复用 PC01 `data.ts`，未再造第二份赛事主数据；
- `CompetitionProject` 保持赛事期对象；
- 跨校团队业务规则明确为队长学校统一审核；
- 学校 Scope 明确排除其它赛事、长期画像、简历/投递、权益消费、Workshop 私人回答 / AI 内容；
- `/registration-portal/*` 继续独立存在，没有在 `/admin` 重建报名系统。

但当前仍有 2 个 P1 一致性问题，因此：

```text
PC02 = CHANGES REQUIRED
```

---

## 2. Finding 01｜赛事详情仍自建 AdminShell｜P1

### 现状

`CompetitionConsole.tsx` 仍包含 PC02 自己的 `AdminShell`，并维护一份独立导航：

- 总览；
- 赛事中心；
- 主体与学校；
- 资源运营；
- 学生与赛事身份；
- 资产与可信凭证；
- 内容与活动；
- `Workshop`。

当前 `App.tsx` 的赛事对象路由仍直接渲染：

```tsx
<Route path="/admin/competitions/objects/:competitionId" element={<CompetitionConsole />} />
```

而 PC03 / PC04 已经统一接入 canonical `AdminControlPlaneShell`。

### 影响

进入赛事详情后会丢失 PC01 canonical Operator Context：

```text
Role
Module Permission
Data Scope
```

同时导航文案也会从 PC01 的“创赛工坊”漂成 PC02 自己的“Workshop”。这会形成同一个后台内两套壳和两套导航语义。

### 修复要求

- 删除 PC02 自建 `AdminShell`；
- `/admin/competitions/objects/:competitionId` 由 `AdminControlPlaneShell` 包裹；
- CompetitionConsole 只保留赛事域内内容；
- 新增 focused assertion：进入三创赛与普通合作赛事详情后，7 域导航、Role / Module Permission / Data Scope 均继续存在。

---

## 3. Finding 02｜学校审核 / 组织方仍使用展示名作为关系键｜P1

### 现状

PC02 赛事扩展当前存在：

```text
authorizedSchools: string[]
team.captainSchool: string
member.school: string
organizer: string
```

示例值直接是：

```text
华南商贸学院
岭南科技学院
青年品牌创新联盟
全国大学生电子商务“创新、创意及创业”挑战赛竞赛组织委员会
```

但当前确认模型已经要求：

```text
Organization = 学校 / 企业 / 赛事组织方 / 合作机构统一主体主数据
跨校审核责任跟随 Team.leaderSchoolId
Competition 等业务对象引用 stable organizationId
```

PC03 也已经存在 `org-sanchuang-committee` 等 Organization stable id。

### 影响

当前“队长学校审核”虽然业务文字正确，但机器关系仍靠学校中文名相等来表达，后续改名、别名、学校合并或 Scope 联查都会产生第二套学校关系。

赛事组织方同样没有真正接到 Organization 主数据。

### 修复要求

至少收口为：

```text
competition.organizerOrganizationId
schoolScope.authorizedSchoolOrganizationIds[]
team.leaderSchoolId
member.schoolOrganizationId
```

UI 继续显示中文名，但名称必须由 stable id 解析得到，不把展示名当关系键。

如当前 Organization 主数据缺少“华南商贸学院 / 岭南科技学院 / 青年品牌创新联盟”，应补入统一 Organization master，而不是继续在 PC02 内维护字符串学校表。

focused assertion 至少锁定：

1. 队长学校审核责任由 `leaderSchoolId` 指向 Organization；
2. 跨校成员使用另一 `schoolOrganizationId`，但不产生第二审批责任；
3. 三创赛 organizer 关系可追到 `org-sanchuang-committee`（或当前最终 canonical id）。

---

## 4. 已通过项

### Competition 主数据复用｜PASS

`competitionControlById()` 从 PC01 `adminDomains.competitions.sampleObjects` 读取：

- stable `competitionId`；
- name；
- businessState / status；
- source / sourceDetail；
- base relations。

PC02 只叠加赛事控制字段，未重新维护第二份 Competition 主数据。

### 资格双层状态与 Workspace gate｜PASS

外部权威赛事：

```text
platformReview=approved
+ officialQualification=confirmed
+ lifecycle allows
→ Workspace open
```

平台配置赛事：

```text
platformReview=approved
+ officialQualification=notRequired
+ lifecycle allows
→ Workspace open
```

因此学校审核通过不会冒充官方确认，普通合作赛事 upcoming 时也不会被提前开放。

### 学校数据边界与 Workshop 隐私｜PASS

当前 teacherScope 已明确区分 allowed / denied；Workshop 私人回答 / AI 内容没有被作为学校老师可读数据。

### 报名 Portal 边界｜PASS

仍复用 `/registration-portal/*`，PC02 没有重建第二套报名 UI / Registration truth source。

---

## 5. Browser / CI 说明

现有 `admin-skeleton.spec.ts` 已覆盖：

- platform review / official qualification 分离；
- Workspace gate；
- captain-school 审核业务文案；
- Workshop 私密内容排除；
- 普通合作赛事 `notRequired + upcoming`；
- 报名 Portal 独立入口。

但现有测试尚未覆盖本次两个 Finding：canonical Operator Context 与 Organization stable id 关系。

GitHub combined status 对施工提交未返回可用状态，因此本评审不声明新的 CI / browser PASS。修复后由二次独立复审重新判定。

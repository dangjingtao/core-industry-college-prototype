# PC03｜Organization + 机会 + 内容运营

> 分支：`dev`  
> 类型：施工卡记录  
> 状态：**待复审**  
> 开始时 branch HEAD：`f9cf199b4d1c5fddd39388f66fa542c2c4cd7baf`  
> 独立复审：`docs/workbench/PC03-review.md`，结论 `CHANGES REQUIRED`，复审提交 `3646bd81600afaac2b52cc46229259b613486ee7`

## 1. 产品边界保持不变

PC03 继续只承接：

- Organization 统一主体；
- Opportunity 分发与 App 内投递状态跟踪；
- 首页 Banner / 资讯 / 赛友内容 / 活动运营。

继续禁止：

- Candidate CRM；
- 企业招聘 SaaS；
- 黑盒人才评分；
- 企业首期直接发布；
- 第二份 Application / Company / Organization 真相源；
- 把后台 Organization 与 Mobile D08 `/me/subjects` 混用。

## 2. CHANGES REQUIRED 修复

### Finding 01｜Opportunity 编辑假保存

已修复。

新增 `PC03StateProvider`，Opportunity 列表、详情、编辑共用同一份 PC03 原型状态。编辑保存后返回详情继续读取同一对象，不再重新从 `initialOpportunities` 恢复。

原型状态仍明确是前端中保真状态；真实后台接入时替换为 Opportunity API，不冒充已经持久化到服务端。

### Finding 02｜Opportunity 缺少 App `skills[]`

已修复。

Opportunity 主数据现在包含：

```text
id
 title
 organizationId
 city
 mode
 summary
 skills[]
 status
```

初始对象与 Mobile 当前 skills 对齐；新建、详情、编辑都可以维护 / 展示 `skills[]`，首期采用逗号分隔 tags 输入，不建设复杂技能字典。

### Finding 03｜PC03 自建 Shell

已移除 PC03 专属 `PC03AdminFrame`。

PC03 当前通过通用 `AdminControlPlaneShell` 进入完整控制面，导航和 Operator Context 直接读取 PC01 已有：

- `adminDomains`；
- `currentOperatorContext`；
- 7 个管理域；
- Role；
- Module Permission；
- Data Scope；
- 报名门户出口。

PC03 只保留域内业务内容与二级入口，不再出现只含 Organization / 机会 / 内容的独立后台壳。

### Finding 04｜内容 Scope 使用展示名 / 自由文本

已修复为显式关系语义：

```text
赛事 Scope → competitionId
学校 Scope → organizationId
地区 Scope → region
全平台 → 无 relation id
```

UI 可以展示中文名称，但赛事与学校关系同时明确展示 stable id。新建内容时：

- 赛事使用赛事下拉选择；
- 学校只从 `Organization(type=学校)` 选择；
- 地区才使用地区值输入；
- 不再让赛事 / 学校共用自由文本 Scope 值。

### Finding 05｜Application `failed` 超出当前 consumer

已修复。

PC03 首期 Application 运营状态只允许：

```text
submitted
statusUnknown
```

`failed` 不再出现在 PC 下拉中。未来增加新的业务进展状态必须同步扩展 App consumer，不允许 PC 单边先写。

### Finding 06｜自由来源文案

已修复。

Organization 来源字段改为 `DataSource[]`，只允许 PC01 五类 canonical 来源：

```text
平台配置
API 同步
文件导入
人工修正
Runtime
```

多来源使用多个 canonical tag 表达，不再出现“可信数据源”等自造来源类型。

## 3. 当前路由

```text
/admin/organizations
/admin/organizations/:organizationId
/admin/opportunities
/admin/opportunities/:opportunityId
/admin/opportunities/:opportunityId/edit
/admin/content
/admin/content/operations
```

原有 `/admin/organizations/objects/:id` PC01 Pattern 路由仍保留，不被 PC03 通配路由吞掉。

## 4. focused browser assertions

`apps/pc/tests/pc03.spec.ts` 已按独立复审要求重写，至少锁定：

1. PC03 三个域进入后，7 域全局导航仍存在；
2. Role / Module / Data Scope 仍存在；
3. Opportunity 编辑 → 保存 → 返回详情 → 修改后的标题 / 地区 / skills 仍存在；
4. Opportunity 新建 / 编辑都包含 `skills[]`；
5. Application 下拉不存在 `failed`；
6. Organization 来源只出现 canonical source tags；
7. 内容赛事 Scope 显式保存 / 展示 `competitionId`；
8. 内容学校 Scope 显式保存 / 展示 `organizationId`；
9. 赛事 / 学校创建时使用关系选择器，不再使用自由文本 stable relation；
10. 可解释圈选与“不生成 CandidateRecord”边界继续存在。

## 5. 本轮修复范围

- `apps/pc/src/admin/PC03State.tsx`
- `apps/pc/src/admin/AdminControlPlaneShell.tsx`
- `apps/pc/src/admin/PC03Console.tsx`
- `apps/pc/src/admin/PC03OpportunityRoute.tsx`
- `apps/pc/src/App.tsx`
- 删除 `apps/pc/src/admin/PC03AdminFrame.tsx`
- `apps/pc/tests/pc03.spec.ts`
- 本施工记录

## 6. 修复提交序列

- `90bdbdd26d57dc44bfa7049cda2b0fef6abd4e73`：共享 Opportunity / Application 原型状态；
- `9b1133cd12d38de56540ca8282bf34c9d6aec128`：通用控制面 Shell；
- `89eaf4544019ec58a4eda268bc98721e566300c2`：skills / canonical source / stable content scope / Application 状态收口；
- `18a4c39123081f6edeacd91191809e40e0cdb887`：Opportunity 编辑写回共享状态；
- `c5e8d364bbb913ec5e1f2eaf38e367c9abbfc40e`：App 接入共享 provider 与控制面壳；
- `d73b404f9684d60b4d6c0acf5602a4937cac1774`：删除 PC03 专属 Frame；
- `486e155441c5e41bf40e405d651f7704218e043a`：focused browser assertions。

施工线程不自行把 PC03 标记为 PASS。当前状态为 **待复审**，以独立复审重新验证上述 6 个 Finding 为准。

# PC-BD01｜基础数据接入与旧后台能力归并

> 分支：`dev`  
> 类型：施工 / 归并卡  
> 状态：**待执行**  
> 优先级：P0  
> 执行时机：PC01–PC04 已形成稳定控制面后执行；**PC05 最终验收前必须完成并独立复审**  
> 目标：补齐评审人能理解的“基础数据维护”界面，但不重建一套与当前原型冲突的旧后台。

---

## 0. 先定性质：这不是“恢复旧后台”

本卡的输入之一是现有三创赛管理后台截图，其中可看到：

- 数据面板；
- 报名管理；
- 团队管理；
- 审核审批；
- 学校管理；
- 赛程管理；
- 系统设置。

这些截图只能作为**真实运营能力与交互形态的证据**，不能反过来成为核心产业学院 PC 后台的信息架构。

当前产品基线仍然优先：

1. `docs/product/00-product-master-context.md`
2. `docs/product/03-pc-admin-data-skeleton.md`
3. `docs/product/05-pc-admin-product-decisions.md`
4. `docs/workbench/00-work-ledger.md`
5. PC01–PC05 当前实际实现
6. 旧后台截图 / 历史页面证据

核心原则：

> **吸收旧后台的能力，不复制旧后台的菜单、状态和数据模型。**

本卡完成后，评审人应该能一眼看懂：平台后台“有哪些基础数据可以维护、这些数据属于谁、赛事运行数据在哪里处理”；同时不能因此出现第二套 School / Team / Registration / Competition 状态真相源。

---

## 1. 开工前必须阅读与实际检查

施工线程开始前必须检查：

- `docs/product/00-product-master-context.md`
- `docs/product/03-pc-admin-data-skeleton.md`
- `docs/product/05-pc-admin-product-decisions.md`
- `docs/workbench/00-work-ledger.md`
- `docs/workbench/PC01-admin-control-plane.md`
- `docs/workbench/PC02-competition-console.md`
- `docs/workbench/PC03-organization-opportunity-content.md`
- PC04 / PC05 当前施工与复审记录
- `apps/pc/src/App.tsx`
- `apps/pc/src/admin/AdminControlPlaneShell.tsx`
- `apps/pc/src/admin/data.ts`
- 当前 PC02 / PC03 / PC04 / PC05 人类可读控制台

禁止只看截图就开始新增菜单。

---

## 2. 不可破坏的硬边界

### 2.1 不新增一个平行的“基础数据”业务真相域

当前 `AdminControlPlaneShell` 与 `adminDomains` 已经形成平台控制面骨架。

本卡可以在 `/admin` 总览增加一个**“基础数据维护”快捷入口区**，帮助评审与运营快速进入已有域；但不能为了截图相似度新增一套与现有导航平行的：

```text
基础数据管理
├─ 学校表
├─ 企业表
├─ 团队表
├─ 报名表
└─ 赛程表
```

这样的第二信息架构。

### 2.2 School / Company 继续统一为 Organization

学校、企业、赛事组织方、合作机构继续使用统一 `Organization` 主数据。

允许在 UI 中按类型筛选并提供“学校视图 / 企业视图”，但禁止新增独立 `SchoolStore` / `CompanyStore` 与 Organization 互不相认。

### 2.3 Team / CompetitionProject 永远属于赛事上下文

```text
Competition
  └─ Team / TeamMember
       └─ CompetitionProject
```

旧后台“团队管理”可吸收为赛事详情中的运营能力，但禁止建设全平台长期 Team / Project 主数据中心。

### 2.4 报名、学校审核、官方资格、赛事身份必须继续分层

必须保持 PC02 已确认语义：

```text
平台承接报名流程
≠ 学校真实性审核
≠ 外部权威官方资格
≠ CompetitionIdentity 长期赛事身份
```

尤其禁止把旧后台一个“已通过”标签同时解释成：

- 学校审核通过；
- 官方参赛资格确认；
- CompetitionIdentity active。

### 2.5 “系统设置”不得吞掉业务配置

旧后台截图里的：

- 赛事名称；
- 报名开始 / 截止时间；
- 每队人数；

都属于具体 `Competition` / `CompetitionLifecycle` / 报名规则，不得继续作为平台全局“系统设置”。

真正的平台治理能力继续进入：

```text
/admin/governance/*
```

例如管理员、Role、Module Permission、Data Scope、Audit Log、高风险审批。

### 2.6 数据来源继续只有五类 canonical 语义

```text
平台配置
API 同步
文件导入
人工修正
Runtime
```

不得因为旧后台有 Excel / 人工维护界面就新增“后台数据”“可信数据”“运营录入”等第六种来源。

### 2.7 不趁机扩产品模型

本卡禁止自行新增：

- 全平台统一产业分类字典；
- 独立师资主数据中心；
- 学校认证状态机；
- 企业自运营后台；
- 学校独立门户；
- D08 手机“主体管理”；
- 万能审批中心；
- 万能规则引擎。

若未来业务确认需要，另开产品决策卡。

---

## 3. 旧后台能力 → 当前控制面归并表

| 旧后台截图能力 | 是否吸收 | 当前归属 | 正确业务语义 | 明确禁止 |
| --- | --- | --- | --- | --- |
| 数据面板 | 是 | `/admin` 运营总览 | 读取现有 Competition / Organization / Resource / Student / Asset 等对象做概览 | 新建一份 Dashboard 数据真相源；把某场赛事报名数字冒充全平台指标 |
| 报名管理 | 是 | 具体赛事控制台 | Registration + platformReview + officialQualification 的赛事范围查询 / 处理 | 新增全局“报名主数据”；复制 `/registration-portal/*` 完整报名表 |
| 团队管理 | 是 | 具体赛事控制台 | Team / TeamMember / CompetitionProject，必须带 `competitionId` | 全局 Team / Project 中心；赛后继续当长期项目管理系统 |
| 审核审批 | 拆分吸收 | 赛事控制台 + `/admin/governance/*` | 学校审核属于赛事流程；高风险治理审批属于治理域 | 把所有审批混成一个无 Scope 的万能队列 |
| 学校管理 | 是 | Organization | `Organization(type=School)` + 地区 + 联系人 + 赛事授权范围 + 老师审核 Scope | 独立 School 真相源；照搬“已认证 / 待认证”而没有 canonical 状态 |
| 赛程管理 | 是 | Competition | `CompetitionLifecycle`：官方统一窗口 + 地方执行节点 | 独立 Schedule 真相源；把地方节点写成官方统一时间 |
| 系统设置 | 拆分吸收 | Competition + Governance | 赛事参数回赛事；管理员 / 权限 / 审计回治理 | 用全局设置修改某一场赛事业务字段 |
| Excel / 人工维护 | 可吸收 | 各对象所属管理域 | 文件导入 / 人工修正，并保留来源、批次、原因、审计 | 导入后静默覆盖 API 权威事实；人工修正不留原因 |

---

## 4. 最低页面交付

### A. `/admin`｜增加“基础数据维护”快捷入口，但不增加新的一级业务域

在现有运营总览中增加一个清晰、业务人员可读的入口区，建议至少包含：

1. **学校与主体** → 当前 Organization 管理；
2. **赛事基础配置** → 当前 Competition 管理；
3. **资源主数据** → 当前 Opportunity / Course / Benefit / Activity；
4. **学生与赛事身份** → 当前 Student / CompetitionIdentity 查询；
5. **数据接入状态** → 只汇总现有对象的数据来源 / 同步情况，不新建数据真相源。

要求：

- 这是快捷入口 / 聚合入口，不是第 8 个业务域；
- 当前侧栏主导航保持既有骨架；
- 总览指标必须写清 Scope，例如“当前赛事”“全平台”“当前学校”；
- 某场赛事的“报名 1,256 / 已审核 892”不能在没有 Scope 标签时冒充平台总量。

### B. Organization｜补成评审可理解的学校 / 主体基础数据维护

继续使用现有：

```text
/admin/organizations
/admin/organizations/:organizationId
```

最低支持：

- 类型筛选：学校 / 企业 / 赛事组织方 / 合作机构；
- stable `organizationId`；
- 名称；
- 地区；
- 联系人 / 当前运营责任人；
- 数据来源；
- 与赛事 / 课程 / 权益 / 活动 / 机会 / 内容的关系；
- 学校类型对象额外展示：赛事授权范围、老师 / 审核角色 Scope。

#### 学校状态特别约束

旧截图中的“已认证 / 待认证”**不得直接照搬**。

如果当前产品没有学校认证 canonical 状态，默认展示：

- 数据来源；
- 当前赛事授权；
- 审核角色配置；

而不是为了界面丰满虚构认证状态机。

### C. Competition｜把旧报名 / 团队 / 审核 / 赛程能力收进同一个赛事详情

继续沿用：

```text
/admin/competitions/objects/:competitionId
```

在人类可读控制台中，应能清楚找到以下区块 / Tab（可以复用现有 section，不要求机械新增六条路由）：

1. 基础信息；
2. 赛道与学校范围；
3. 报名与资格；
4. 团队与参赛项目；
5. 赛程节点；
6. 赛事资料与平台叠加服务。

#### 报名与资格默认人话表达

评审默认视图优先显示：

```text
学校审核：待审核 / 已通过 / 已驳回
官方资格：待确认 / 已确认 / 不需要外部确认
赛事身份：待生效 / 有效 / 已拒绝 / 已撤销
```

技术模式中再显示 canonical 字段，例如：

```text
platformReview
officialQualification
CompetitionIdentity
```

必须能演示：

```text
学校审核 = 已通过
官方资格 = 待确认
→ 正式 Workspace 仍不可开放
```

#### 团队与项目

旧“团队管理”中的：

- 团队名称；
- 学校；
- 队长；
- 人数；
- 指导老师；

可以作为赛事范围内列表信息吸收。

但是列表状态要显示其真正来源：报名状态 / 学校审核 / 官方资格，不得把这些状态压成一个模糊“团队状态”。

### D. CompetitionLifecycle｜把旧赛程管理改成“官方窗口 + 地方节点”

至少表达：

- 官方统一时间窗口；
- 地方执行节点；
- 当前状态；
- 数据来源；
- 谁可以修改。

地方节点允许平台运营代录；后续成熟地区再按权限开放，不在本卡扩成学校独立赛事后台。

### E. Governance｜只承接平台治理

继续使用：

```text
/admin/governance/*
```

最低保持 / 补清：

- 管理员账号；
- Role；
- Module Permission；
- Data Scope；
- Audit Log；
- 高风险审批。

这里不得出现“赛事名称、报名起止、每队人数”等具体赛事业务字段。

---

## 5. 数据导入 / 人工维护的最小治理表达

若本卡施工时增加 Excel 导入、批量维护或人工修正入口，必须同时表达：

```text
source = 文件导入 / 人工修正
source detail
import batch / 来源说明（原型可中保真）
operator
reason（人工修正必填）
last updated
```

外部权威赛事发生：

```text
API 值 ≠ 人工覆盖值
```

时必须显式显示冲突；不得静默把人工值变成新的官方事实。

“导出 Excel”可以作为运营便利能力，但不是本卡 P0 核心验收点，不得为了做导出牺牲数据语义与页面归并。

---

## 6. 评审人可理解性要求

这是本卡与普通 CRUD 卡同等重要的验收目标。

### 默认视图

默认不要求评审人理解：

- stable id 细节；
- `platformReview` 等英文内部字段；
- store / source contract；
- APP → PC 技术映射。

默认页面应使用业务人员能理解的中文标题、Scope 和状态。

### 技术信息

现有“显示技术信息”能力继续保留，用于开发 / 独立复审查看：

- stable id；
- canonical state；
- DataSource；
- App consumer；
- relation id；
- 保留策略。

原则：

> **默认给评审人讲业务，技术模式给施工与验收看真相源。**

### 不允许出现的评审歧义

- 一个“已通过”不知道是谁通过；
- 一个“认证学校”不知道认证什么；
- 一个“团队状态”其实混了报名 / 审核 / 官方资格；
- “系统设置”里能改某场赛事字段；
- 总览数字看不出是全平台还是某场赛事；
- “三创赛后台”看起来像整个核心产业学院后台。

出现上述任一项，独立评审应直接 `CHANGES REQUIRED`。

---

## 7. 最小评审演示路径

独立评审至少按以下顺序走一遍：

```text
/admin
→ 基础数据维护快捷入口
→ 学校与主体
→ 打开一个 School Organization
→ 查看它的赛事授权 / 老师 Scope
→ 回到赛事中心
→ 打开 sanchuang-16
→ 报名与资格
→ 学校审核已通过，但官方资格仍待确认
→ 团队与参赛项目
→ 赛程节点（官方窗口 + 地方节点）
→ /admin/governance
→ 确认这里只处理管理员 / 权限 / 审计 / 高风险审批
```

然后再打开一个平台配置赛事（如 `innovation-cup-2026`），确认它与三创赛共用同一个 Competition 控制面，而不是回到旧“三创赛管理后台”结构。

---

## 8. Focused browser assertions

至少新增 / 更新断言覆盖：

1. `/admin` 保留当前主导航，同时出现“基础数据维护”快捷入口；
2. 快捷入口进入的是现有管理域，不存在新的平行基础数据业务域；
3. 学校视图来自 Organization，能看到稳定 `organizationId` / 赛事授权关系，未新增第二 School 真相源；
4. `sanchuang-16` 中“学校审核已通过 + 官方资格待确认”可以同时存在，且 Workspace Gate 语义不被破坏；
5. Team / CompetitionProject 只能在具体 `competitionId` 范围内查看，不出现全局长期 Project 管理；
6. 赛程同时表达官方窗口与地方节点；
7. `/admin/governance` 不出现具体赛事名称 / 报名起止 / 每队人数等赛事配置；
8. canonical DataSource 仍只使用五类；
9. 默认视图业务可读，技术模式仍可检查 stable id / canonical state；
10. PC02 / PC03 / PC04 / PC05 既有关键路由与语义回归不被本卡破坏；
11. `/registration-portal/*` 仍是独立报名业务入口，没有被复制进 `/admin`。

---

## 9. 禁止修改范围

本卡原则上不修改：

- Mobile 产品逻辑；
- Mobile route registry；
- `identities[]` / Application / CourseLearning / Benefit Runtime 真相源；
- `/registration-portal/*` 的完整报名交互；
- D08 `/me/subjects`；
- 企业 / 学校自运营权限模型；
- 尚未确认的分类字典 / 师资中心等新业务对象。

如施工发现现有 PC 页面本身违反已确认产品决策，应记录 Finding 并做最小必要修复；不得借本卡扩大为新一轮后台重构。

---

## 10. PASS 门槛

本卡只有同时满足以下条件才可由独立评审判定 `PASS`：

- 旧截图的高价值运营能力都有明确去向；
- 没有新增第二套业务真相源；
- 没有新增与当前控制面平行的一级业务架构；
- 学校 / 企业继续统一 Organization；
- 报名 / 学校审核 / 官方资格 / CompetitionIdentity 语义没有混淆；
- Team / CompetitionProject 保持赛事 Scope；
- CompetitionLifecycle 保持“官方窗口 + 地方节点”；
- Governance 与具体赛事业务配置边界清楚；
- 默认视图评审人能看懂，技术模式仍可验真；
- PC build / browser regression 通过；
- PC05 最终总回归将本卡纳入跨域一致性检查。

施工线程不得自行把本卡标记为 `PASS`。
# PC05｜学生 / 长期资产 + 权限治理 + PC 总回归

> 状态：施工完成 / 待独立评审  
> 功能开工基线：`a4dff9305187da97de15e8d8ad5c3ab9d08df002`  
> 全 PC 视觉 / 操作收口续施工基线：`33c1317ccf02429530f75964b2a4ad596a770f1a`  
> 本轮代码收口点：`c5ba28e3536e18e1e43911e975f2f101be642b8b`  
> 施工目标：`dev`  
> 前置：PC02、PC03、PC04 已进入可串联基线。

---

## 1. 本卡边界

PC05 不再新增一个孤立后台模块，而是把 PC01–PC04 已建立的控制面收口到“学生长期账号”与治理能力上，并执行整个 `/admin/*` 的视觉 / 操作门禁：

1. 学生账号 / StudentProfile / CompetitionIdentity[] / Registration / Team / Application 的统一查询与治理视图；
2. Experience / Result / Certificate / CourseAchievement / VerificationRecord 的长期资产视图；
3. 超级管理员与普通运营的 Role + Module Permission + Data Scope；
4. P0 Audit Log；
5. 高风险操作的“提交 → 审批 → 执行”；
6. PC ↔ App 状态与 stable relation 总审计；
7. 赛事、Organization、课程、权益、机会、学生、长期资产跨域串联；
8. PC01–PC04 既有页面从“工程控制面 / 施工现场”收成普通运营人员可理解、可操作的后台。

PC05 明确禁止为了补后台页面而新增：

- Participant；
- CandidateRecord；
- 跨赛事长期 Project；
- “培训通过”第二状态；
- 与 Mobile 不相认的账号 / 经历 / 学习成果 / 验真 stable id。

同时禁止为了“视觉简化”删除 stable ID、provenance、App consumer、truth boundary、Role / Module Permission / Data Scope 等既有契约；这些信息继续保留，但退到追溯 / 技术信息层。

---

## 2. Account / StudentProfile 的真实缺口

Mobile 当前 session 只有：

```text
loggedIn
profileComplete
```

没有显式 `accountId`。

因此 PC05 **没有虚构 `acct-xxx`**。学生控制台把 Account id 明确显示为：

```text
Mobile session 尚未显式接入
```

该缺口默认不再占据业务第一屏，只在“数据与关系”展开区中保留。

冻结 / 解冻流程在当前原型只针对“当前账号锚点”演示治理语义；未来账号系统接入后再替换成真实 stable `accountId`。

StudentProfile 直接沿用 Mobile seed：

- 林晓；
- 华南商贸学院；
- 电子商务；
- 广州。

个人资料仍以学生本人维护为主，运营只处理授权字段与治理事项。

---

## 3. CompetitionIdentity / Registration / Team / Application

学生控制台直接展示 Mobile `multiCompetitionAccount` 现有身份语义：

```text
sanchuang-16
- registrationOpen
- identityStatus=active
- registrationStatus=approved

innovation-cup-2026
- upcoming
- identityStatus=pending
- registrationStatus=pending

sanchuang-15
- ended
- identityStatus=revoked
- registrationStatus=approved
```

PC05 把以下边界写死在界面和一致性审计里：

```text
registrationStatus=approved
≠ identityStatus=active
≠ 外部官方最终参赛资格
```

外部官方资格必须作为独立事实处理，不能由平台 approved 偷换语义。

Application 继续使用 App `submitted / statusUnknown` 语义，不创建 CandidateRecord。

---

## 4. 学生账号冻结 / 解冻

新增可演示治理链：

```text
普通运营填写原因
→ 提交冻结 / 解冻申请
→ 账号状态保持不变
→ 超级管理员审批并执行
→ Account active / frozen 改变
→ 写入 Audit Log
```

冻结只限制当前访问，不删除：

- StudentProfile；
- CompetitionIdentity 历史；
- 赛事经历；
- Result；
- Certificate；
- CourseAchievement；
- Application；
- VerificationRecord。

高风险操作继续使用独立风险区，不和普通“保存”按钮混成同一视觉等级。

---

## 5. 长期资产

新增 `/admin/assets` 长期资产控制面，覆盖：

- Experience；
- Result；
- Certificate；
- CourseAchievement；
- VerificationRecord。

其中只复用当前 App 已存在的 key / relation：

- Experience：App 当前以 `competitionId` 作为 `/assets/experiences/:experienceId` 的查找键；独立 `experienceId` 尚未接入，PC05 不虚构补齐；
- Result：`competition-result-sanchuang-15` / `result-s5-score-precheck`；
- Certificate：`cert-sanchuang-15`；
- CourseAchievement：沿用 `CourseLearning(courseId=data-analytics, progress=100, assessment=passed)`；
- Verification：沿用 `SC15-TOMZ-24001`。

生命周期规则：

```text
赛事 ended / identity revoked
→ 赛事期能力关闭
→ 长期资产继续可读
```

可信对象异常使用 `archived / revoked / invalid` 等状态，不通过物理删除表达。

技术 key 与来源默认进入“数据来源与关系”展开层，不挤占资产业务信息。

---

## 6. 权限模型

新增 `/admin/governance`。

首期固定演示两类内部角色：

### 超级管理员

- 全平台 Data Scope；
- 后台管理员管理；
- 权限提升；
- 高风险治理执行。

### 普通运营

按：

```text
Role
+ Module Permission
+ Data Scope
```

授权。

当前页面用 `competitionId=sanchuang-16 + organizationId=northstar-beauty` 演示 scope；普通运营不能创建后台账号、扩大自身权限或直接执行高风险操作。

本轮将全局 Shell 中的 Role / Module / Data Scope 从常驻首屏收进“当前权限”展开区，权限事实保留但不抢业务第一眼。

---

## 7. Audit Log 与高风险审批

Audit Log 固定展示并记录：

- 谁；
- 时间；
- 对象；
- 修改前；
- 修改后；
- 原因；
- 关联审批。

高风险范围至少包含：

1. 批量证书签发 / 撤销；
2. 外部官方参赛状态人工修正；
3. 批量赛事身份修改；
4. 权限提升；
5. 学生账号冻结 / 解冻。

普通内容编辑不进入这条重型审批链。

---

## 8. PC ↔ App 一致性总审计

`/admin/governance` 内置 focused audit rows，明确检查：

- CompetitionIdentity：平台报名 approved 不替代 active / 外部官方资格；
- Application：保持 `statusUnknown`，不建 CandidateRecord；
- CourseAchievement：`completed = progress 100 + assessment passed`，不建“培训通过”；
- Certificate：PC / App 共用 `claimable / claimed / pending / revoked`；
- ended / revoked：关闭赛事期能力但保留长期资产。

同时提供一条真实跨域链：

```text
sanchuang-16
→ northstar-beauty
→ brand-ecommerce
→ benefit-beauty-sample
→ intern-1
→ 当前学生账号锚点
→ cert-sanchuang-15
```

Account id 尚未接入处保持显式缺口，不用假 id 强行补链。

---

## 9. 全 `/admin/*` 人类门禁收口

本轮按 `PC05-visual-usability-gate.md` 对 PC01–PC04 与 PC05 一起施工，而不是只调整 PC05 三张新页面。

### 9.1 全局 Shell

`AdminControlPlaneShell` 统一为运营后台壳：

- 首页 / Header / 导航使用业务语言；
- `Role / Module / Data Scope` 收入“当前权限”；
- 增加“显示技术信息 / 隐藏技术信息”显式开关；
- `.font-mono`、`code` 与 `data-pc05-technical` 默认隐藏；
- stable ID、来源、Runtime / truth-source 诊断信息仍可由技术模式恢复；
- 不删除契约，只改变默认信息层级。

### 9.2 PC01 总览 / 赛事 / 资源 / 工坊

新增业务优先视图：

- `/admin`：从 Truth Boundary / Stable ID / App consumer 架构板，改为“今天先处理这些业务”；
- `/admin/competitions`：先看赛事阶段、异常和待处理；
- `/admin/resources`：先看机会、课程、权益、可信证书；
- `/admin/workshop`：先看赛事上下文、开放状态与隐私边界；
- 技术说明退入 `<details>`。

### 9.3 PC02 赛事详情

保留平台报名、学生赛事身份、官方资格三层事实，但默认不再把“三层事实边界”说明板顶在首屏；技术模式可恢复查看。

学校审核、官方资格、workspace gate 等真实业务状态与动作继续常驻。

### 9.4 PC03 Organization

Organization 列表 / 详情改为业务视图：

```text
主体是谁
→ 当前合作状态
→ 可信信息边界
→ 当前合作资源
→ 数据来源与关联标识（展开）
```

`organizationId` 与 provenance 需要进入“数据来源与关联标识”展开区后才显示，避免稳定标识压过合作关系。

### 9.5 PC03 机会

机会列表 / 详情 / 新建 / 编辑均改为运营语言：

- 新建机会不再要求运营手工填写 `opportunityId`；
- 内部机会 ID 自动生成；
- 合作主体下拉显示人类名称；
- 技能、地区、机会类型、说明成为主要字段；
- 发送人群使用学校 / 专业 / 地区 / 赛事经历 / 课程完成 / 证书 / 比赛成绩等可解释条件；
- 人工确认发送范围不创建 CandidateRecord；
- 学生真实 Application 继续独立存在；
- `opportunityId`、`organizationId`、Application Runtime 等退入技术模式。

### 9.6 PC03 内容

内容创建从工程表单改成运营表单：

- 运营填写标题、内容类型；
- 定向选择全平台 / 赛事 / 学校 / 地区；
- 指定赛事和学校直接选人类名称；
- 不要求手填 `contentId` / stable ID；
- 内部 ID 自动生成；
- 合作方供稿、平台发布 / 下架的业务边界保持；
- `contentId / competitionId / organizationId / Placement` 仅在技术模式显示。

### 9.7 PC04 课程 / 权益 / 证书

PC04 核心功能与状态不重写；本轮主要调整默认信息层级：

- `canonical control plane`、`配置真相 ≠ Runtime` 等施工说明默认隐藏；
- “真相源边界”诊断块默认隐藏；
- 课程 / 权益 / 证书的业务标题、状态、完成规则、履约与操作继续常驻；
- 技术模式仍可恢复 ID 与 truth-source 说明。

---

## 10. 路由与修改范围

PC05 原有功能范围：

- `/admin/students/*`；
- `/admin/assets/*`；
- `/admin/governance/*`。

本轮全 PC 收口后，核心业务路由全部经过统一运营 Shell，主要新增 / 修改：

- `apps/pc/src/App.tsx`
- `apps/pc/src/admin/AdminControlPlaneShell.tsx`
- `apps/pc/src/admin/PC05AdminOverview.tsx`
- `apps/pc/src/admin/PC01OperationsConsole.tsx`
- `apps/pc/src/admin/PC03HumanOrganizationConsole.tsx`
- `apps/pc/src/admin/PC03HumanOpportunityConsole.tsx`
- `apps/pc/src/admin/PC03HumanContentConsole.tsx`
- `apps/pc/src/admin/PC03OpportunityRoute.tsx`
- `apps/pc/tests/admin-skeleton.spec.ts`
- `apps/pc/tests/pc03.spec.ts`
- `apps/pc/tests/pc04.spec.ts`
- `apps/pc/tests/pc05.spec.ts`

PC05 原有学生 / 资产 / 治理实现继续位于：

- `apps/pc/src/admin/pc05-data.ts`
- `apps/pc/src/admin/pc05-ui.tsx`
- `apps/pc/src/admin/PC05State.tsx`
- `apps/pc/src/admin/PC05StudentConsole.tsx`
- `apps/pc/src/admin/PC05AssetsConsole.tsx`
- `apps/pc/src/admin/PC05GovernanceConsole.tsx`
- `apps/pc/src/admin/PC05Console.tsx`

本轮没有修改 Mobile 产品逻辑；比较区间中的 Mobile / T008 变更来自并行线程，不计入 PC05 施工范围。

---

## 11. Browser assertions

PC05 不再只验证三张新增页面。

### 功能刀

现有 `pc05.spec.ts` 继续覆盖：

1. 学生控制台复用 Mobile 身份状态，并显式保留 accountId 缺口；
2. 冻结必须审批：普通运营提交不能直接冻结，超级管理员执行后才改变状态，同时长期资产继续存在；
3. 五类长期资产复用现有 App key / relation，不虚构 Experience / CourseAchievement / Verification 新 id；
4. 权限治理页检查 PC ↔ App 显式映射、PC01–PC05 总回归矩阵与跨域 stable relation。

### 人类刀

浏览器断言已经扩展到整个 `/admin/*` 核心路径：

- `/admin`；
- `/admin/competitions`；
- `/admin/competitions/objects/sanchuang-16`；
- `/admin/resources`；
- `/admin/organizations/:id`；
- `/admin/opportunities/:id` 与编辑 / 新建；
- `/admin/content/operations` 与新建；
- `/admin/pc04/courses/:id` 及 PC04 原功能回归；
- `/admin/students` / `/admin/assets` / `/admin/governance`。

断言重点从“工程字段必须可见”改为：

```text
默认业务信息可见
+ 工程信息默认不可见
+ 技术模式 / details 可追溯
+ 业务创建不要求运营手填内部 stable ID
```

施工线程只提交 assertion，不把“测试已写”冒充 browser PASS。

---

## 12. 当前验证记录

- `tsconfig.base.json` 当前 `strict: true`，但未开启 `noUncheckedIndexedAccess`；本轮新增 TSX 已按该配置做静态类型风险复查；
- GitHub `dev` 已写入全 PC 收口路由、业务视图和回归断言；
- 本轮从 `33c1317...` 到 `c5ba28e...` 的比较中，PC 侧涉及 12 个实现 / 测试文件；另有 Mobile 与 T008 并行线程改动，不归入 PC05；
- GitHub connector 当前无法给出 push 型 workflow run 的可信执行结果，commit combined status 也未提供可用 check，因此本施工线程**不宣称真实 CI / browser PASS**；
- 真实 Vite build、Playwright 全量回归、线上预览与“第一次使用后台的普通运营人员”独立走查，仍由独立评审线程执行并决定最终 PASS / CHANGES REQUIRED。

---

## 13. 当前结论

PC05 当前更准确的状态是：

> **功能主体完成 + 全 `/admin/*` 视觉 / 操作收口完成施工 → 待 CI / 独立浏览器与可用性复审**

施工线程不自行标记 PASS。

独立评审必须同时通过：

```text
Gate A｜产品 / 数据 / 权限 / 跨端契约
+
Gate B｜视觉层级 / 操作可理解性 / 普通运营可用性
=
PC05 PASS
```

任何核心页面仍出现“普通运营第一屏被 Stable ID / Truth Boundary / Runtime / App consumer / 模型关系压住”的施工现场感，都应判 `CHANGES REQUIRED`，而不是因为功能正确而放行。

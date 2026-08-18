# PC05｜学生 / 长期资产 + 权限治理 + PC 总回归

> 状态：施工完成 / 待独立评审  
> 开工基线：`a4dff9305187da97de15e8d8ad5c3ab9d08df002`  
> 施工目标：`dev`  
> 前置：PC02、PC03、PC04 已进入可串联基线。

---

## 1. 本卡边界

PC05 不再新增一个孤立后台模块，而是把 PC01–PC04 已建立的控制面收口到“学生长期账号”与治理能力上：

1. 学生账号 / StudentProfile / CompetitionIdentity[] / Registration / Team / Application 的统一查询与治理视图；
2. Experience / Result / Certificate / CourseAchievement / VerificationRecord 的长期资产视图；
3. 超级管理员与普通运营的 Role + Module Permission + Data Scope；
4. P0 Audit Log；
5. 高风险操作的“提交 → 审批 → 执行”；
6. PC ↔ App 状态与 stable relation 总审计；
7. 赛事、Organization、课程、权益、机会、学生、长期资产跨域串联。

PC05 明确禁止为了补后台页面而新增：

- Participant；
- CandidateRecord；
- 跨赛事长期 Project；
- “培训通过”第二状态；
- 与 Mobile 不相认的账号 / 经历 /学习成果 / 验真 stable id。

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

## 9. 路由与修改范围

新增：

- `/admin/students/*`；
- `/admin/assets/*`；
- `/admin/governance/*`。

代码范围：

- `apps/pc/src/admin/pc05-data.ts`
- `apps/pc/src/admin/pc05-ui.tsx`
- `apps/pc/src/admin/PC05State.tsx`
- `apps/pc/src/admin/PC05StudentConsole.tsx`
- `apps/pc/src/admin/PC05AssetsConsole.tsx`
- `apps/pc/src/admin/PC05GovernanceConsole.tsx`
- `apps/pc/src/admin/PC05Console.tsx`
- `apps/pc/src/admin/AdminControlPlaneShell.tsx`
- `apps/pc/src/App.tsx`
- `apps/pc/tests/pc05.spec.ts`

没有修改 Mobile 产品逻辑，也没有建立第二套 Runtime store。

---

## 10. Focused browser assertions

新增 `apps/pc/tests/pc05.spec.ts`，覆盖 4 组行为：

1. 学生控制台复用 Mobile 身份状态，并显式暴露 accountId 缺口；
2. 冻结必须审批：普通运营提交不能直接冻结，超级管理员执行后才改变状态，同时长期资产继续存在；
3. 五类长期资产复用现有 App key / relation，不虚构 Experience / CourseAchievement / Verification 新 id；
4. 权限治理页检查 PC ↔ App 显式映射、PC01–PC05 总回归矩阵与跨域 stable relation。

施工线程只提交 assertion，不把“测试已写”冒充 browser PASS。

---

## 11. 当前验证记录

- 新增 TS / TSX 文件已做 TypeScript transpile 语法检查，通过；
- GitHub `dev` 已写入 PC05 路由、控制面、测试；
- GitHub connector 当前无法返回 push 型 workflow run，commit combined status 也未暴露状态，因此本施工线程**不宣称真实 CI / browser PASS**；
- 真实 Vite build、Playwright 全量回归、线上预览由独立评审线程完成并决定最终 PASS / BLOCKED。

---

## 12. 当前结论

PC05 功能施工完成，状态保持：

> **待独立评审**

独立评审必须重点检查：

- accountId / experienceId 缺口是否仍被如实表达；
- 冻结 / 解冻是否只能经高风险审批执行；
- 冻结后长期资产是否仍存在；
- Role + Module Permission + Data Scope 是否清晰；
- Audit Log 是否覆盖必要字段；
- PC 与 App 是否出现重复 truth source 或状态偷换；
- PC01–PC04 原有路由与行为是否回归通过。

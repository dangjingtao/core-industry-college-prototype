# PC01｜PC 控制面总壳 + APP 数据接入地图

> 状态：施工完成 / 待独立评审  
> 开工基线：`9ac37b56dbe0d09e0ea4b53e55f0a37aea088886`  
> 目标：把 `/admin/*` 从概念 Skeleton 提升为可持续施工底座，不在 PC01 提前实现 PC02–PC05 的具体业务 CRUD。

---

## 1. 开工前检查

已按 `docs/workbench/00-work-ledger.md` 的 PC 统一开工门槛检查：

- `docs/README.md`
- `docs/product/00-product-master-context.md`
- `docs/product/03-pc-admin-data-skeleton.md`
- `docs/product/05-pc-admin-product-decisions.md`
- `docs/migrations/mobile-from-com-design.md`
- `docs/workbench/00-work-ledger.md`
- `apps/mobile/src/routes/registry.ts`
- `apps/mobile/src/state/model.ts`
- `apps/mobile/src/features/public-platform/PublicPlatform.tsx`
- `apps/mobile/src/features/public-platform/data.ts`
- `apps/mobile/src/features/long-term-assets/data.ts`
- `apps/mobile/src/features/long-term-assets/store.tsx`
- `apps/mobile/src/features/long-term-assets/CoursesPages.tsx`
- `apps/mobile/src/features/long-term-assets/BenefitsPages.tsx`
- `apps/mobile/src/features/long-term-assets/AssetsPages.tsx`
- `apps/mobile/src/mock/scenarios.ts`
- 当前 `apps/pc/src/admin/*` 与 PC Playwright 骨架用例。

确认的真相源边界：

```text
PublicPlatform
├─ session
├─ identities[]
├─ applications[]
└─ followedCompanies[]

LongTermAssets
├─ StudentProfile
├─ CourseLearning[]
├─ Benefit status
├─ Result / Certificate
└─ Resume presentation

Competition / Opportunity / Company / Course / Benefit
└─ 当前仍主要来自 mobile 静态 mock

Workshop
└─ 赛事 competitionId 范围内 Runtime
```

PC01 不复制上述状态，也不把它们搬成第二份 PC store。

---

## 2. 施工前 APP → PC 数据映射

| App route / 页面 | 当前消费对象与状态 | PC 业务对象 / 管理域 | 谁写 / 事实来源 | stable id / 关联 id | 结束或下架后 |
| --- | --- | --- | --- | --- | --- |
| `/home` | Competition、Opportunity、内容推荐；任务摘要来自既有状态 | Competition / Opportunity / Content Placement；赛事中心、资源运营、内容与活动 | 平台配置；外部赛事可 API 同步；当前 App 仍有静态 mock | `competitionId`、`opportunityId`、内容 id | 资源可下架/归档；历史事实不因此删除 |
| `/competitions`、`/competitions/:competitionId` | `upcoming / registrationOpen / inProgress / ended` | Competition；赛事中心 | 平台配置或外部权威 API；文件导入兜底；人工修正需留痕 | `competitionId`；关联 `organizationId` | Competition 归档；学生历史身份/成果长期保留 |
| `/opportunities`、详情、`/applications` | Opportunity `open / closed`；Application `submitted / statusUnknown` | Opportunity；资源运营。Application 归学生与赛事身份域查询，不另造 CandidateRecord | Opportunity 由平台运营配置；Application 由 App 学生提交，后续状态由平台运营/外部回流 | `opportunityId`、`organizationId`、未来 `accountId` | Opportunity close/archive；Application 长期保留 |
| `/courses`、学习、考试、成果 | Course；CourseLearning `notStarted / inProgress / completed`；assessment `idle / passed / failed` | Course；资源运营。CourseLearning 是 Runtime/长期学习事实 | Course 平台配置；学习 Runtime 写进度 | `courseId`、可关联 `competitionId / organizationId / benefitId / certificateId` | Course 可归档；学习成果长期保留 |
| `/benefits`、`/benefits/wallet` | Benefit；`eligible / ineligible / claimed / used / expired` | Benefit / EligibilityRule；资源运营 | 资格规则平台配置；领取/使用/核销由 Runtime 写 | `benefitId`；关联 `competitionId / organizationId / courseId` | Benefit expire/archive；领取与使用历史保留 |
| `/assets`、成绩、证书、验真 | Experience、Result `pending / trusted / archived`、Certificate `claimable / claimed / pending / revoked`、VerificationRecord | 资产与可信凭证 | 外部权威/API、文件导入、可信签发回流；人工修正必须审计；验真为 Runtime | `experienceId / resultId / certificateId`；关联 `competitionId / courseId / accountId` | 长期保留；使用 archived/revoked/invalid，不物理删除可信历史 |
| `/me`、`/me/profile`、`/me/resume` | session、StudentProfile、identities[]、resume presentation | Account / StudentProfile；学生与赛事身份 | session/账号来自账号层；StudentProfile 学生本人优先写；运营只改授权字段 | **当前 Mobile session 未显式建模 `accountId`**；profile 未来关联 `accountId` | 账号冻结不删除长期资料与资产 |
| `/tasks` | 从 identities、Application、CourseLearning、Benefit、WorkshopRun 等派生“下一步” | **无新的 Task 真相源**；跨赛事/资源/工坊域聚合 | 读取已有业务事实；不由 PC 新建万能任务记录 | 沿用来源对象 stable id；不生成平行 task business id | 来源事实按自身规则保留；聚合项可消失但不删除来源事实 |

### 2.1 stable ID 当前真实缺口

1. `Competition` 已有稳定 `competitionId`，例如 `sanchuang-16`。
2. 企业当前 App 使用 `companyId`，例如 `northstar-beauty`。PC 后续统一成 `Organization` 时应优先沿用同一稳定值做迁移基线，不再生成一套互不相认的企业 key。
3. **Account 当前 Mobile `session` 只有 `loggedIn / profileComplete`，没有显式 `accountId`。** PC01 只固定 `Account ID` 的展示 Pattern，并把“未接入 stable id”作为数据质量缺口展示；不得为了后台页面完整而生成第二份账号真相源。

---

## 3. PC01 底座 Pattern

PC01 只固定跨域共用 Pattern：

### 全局壳

- 7 个既有管理域保持不变；
- 总览继续表达“PC 是控制面，不是桌面版 App”；
- 顶部固定显示当前 Role、Module Permission、Data Scope；
- 报名门户继续保持独立业务入口；
- 桌面侧栏之外补窄屏横向全局导航，不让 `/admin/*` 在非桌面宽度失去入口。

### 数据来源标签

统一只使用以下五类：

```text
平台配置
API 同步
文件导入
人工修正
Runtime
```

其中“人工修正”必须带原因/审计语义；它不是与权威 API 等价的永久真相源。

### stable ID

统一使用“对象类型 + 字段名 + stable value”的只读展示，不用页面标题、数组 index 或中文名称承担关联键。

### 列表 Pattern

每个核心对象至少显示：

- stable ID；
- 当前业务状态（只展示已有语义，不在 PC01 造新状态）；
- 数据来源；
- 责任人 / 写入方；
- App 消费位置；
- 关联对象；
- 保留策略。

### 详情 Pattern

从列表进入后可追溯：

```text
来源
→ 状态
→ 关联主体 / 关联资源
→ App consumer
→ 写入责任
→ 生命周期保留策略
```

关联对象使用稳定业务关系跳转到其它管理域。

### 编辑 Pattern

PC01 只固定编辑布局和治理字段，不实现 PC02–PC05 的真实 CRUD：

- stable ID 只读；
- 业务字段编辑区；
- 数据来源统一枚举；
- 人工修正必须填写原因；
- 明确“保存后影响哪些 App consumer”；
- PC01 示例保存按钮明确禁用，不把 Pattern 演示误装成真实写入；
- 高风险能力留给 PC05 权限/审批收口。

---

## 4. APP → PC 全局接入地图的维护规则

后续 PC02–PC05 增加对象时必须同步更新映射，并回答：

1. App 哪个 route 消费；
2. PC 哪个管理域负责；
3. stable id 是什么；
4. 数据来源属于五类中的哪一种；
5. 当前业务状态是否与 App 同名同义，若不同是否有显式映射；
6. 谁创建、谁修改；
7. 与哪些 Organization / Competition / Account / Resource 关联；
8. 下架、赛事结束、账号冻结后哪些事实继续保留。

以下对象不得在后续卡片被平行复制：

- session
- identities[] / CompetitionIdentity
- lifecycle
- Application
- CourseLearning
- Benefit claim/use 状态
- WorkshopRun

---

## 5. PC01 明确不做

- 不实现赛事完整控制台；留给 PC02。
- 不实现 Organization / 机会 / 内容完整 CRUD；留给 PC03。
- 不实现课程 / 权益 / 证书完整 CRUD；留给 PC04。
- 不实现学生治理、RBAC、Audit Log、高风险审批；留给 PC05。
- 不修改 Mobile 产品逻辑。
- 不因为 Account ID 当前缺失而在 PC 自己生成第二账号源。

---

## 6. 验收目标

PC01 完成后，从 `/admin` 进入任一示例核心对象，应能看清：

```text
stable ID
+ 当前业务状态
+ 数据来源
+ 责任人
+ App consumer
+ 稳定业务关系
+ 生命周期保留策略
```

并能从关系链接跨到对应的既有 7 个管理域。

---

## 7. 实现与验证记录

### 提交

- APP → PC 施工前映射文档：`74521cda4c0df0ff0e926140a71c9b63f95f1744`；
- PC01 控制面实现：`46269896096eff98ba6ae599dd387ea058a6dbe6`；
- 浏览器断言对齐详情 Pattern：`3d5f59e031dce7d84383d01e01c1ce69fec6463f`。

### 实际修改范围

- `apps/pc/src/admin/data.ts`
- `apps/pc/src/admin/AdminConsole.tsx`
- `apps/pc/tests/admin-skeleton.spec.ts`
- `docs/workbench/PC01-admin-control-plane.md`
- `docs/workbench/00-work-ledger.md`（状态与施工记录）

没有修改 Mobile 产品逻辑，也没有修改报名门户业务实现。

### 已实现

- 7 个原有管理域继续作为唯一 PC IA 骨架；
- 全局总览、桌面 / 窄屏导航、Role + Module Permission + Data Scope；
- 五类统一数据来源标签；
- Competition / Organization / Account stable ID Pattern，其中 Account ID 缺口被明确暴露；
- APP → PC 8 组入口接入地图；
- 统一实体契约、对象列表、对象详情、编辑 Pattern；
- Competition → Organization → Opportunity / Course / Benefit 等跨域 stable relation 跳转；
- `/tasks` 明确保持派生层，不新增 Task 管理域或第二真相源；
- Content / Workshop 缺少足够当前 stable object 证据时展示“Pattern 已固定、对象待后续卡接入”，没有为页面丰满度虚构业务记录。

### 验证

- `apps/pc/src/admin/data.ts` 使用 TypeScript 5.8 严格解析通过；
- `AdminConsole.tsx + data.ts` 在与仓库 `strict / moduleResolution=Bundler / jsx=react-jsx` 对齐的隔离 TypeScript 检查中通过；隔离检查只为发现本卡自身语法 / 类型问题，不冒充真实依赖安装后的 Vite build；
- `apps/pc/tests/admin-skeleton.spec.ts` 已扩展 4 条 browser assertion：
  1. 总览 / 来源 / stable ID / APP → PC map；
  2. Competition 列表 → 详情 → Organization 跨域关系 → 编辑 Pattern；
  3. Resource / CompetitionIdentity 真相源边界；
  4. 现有三创赛报名门户继续保持独立入口。
- 仓库现有 `.github/workflows/deploy-pc.yml` 与 `.github/workflows/r-final-check.yml` 都会在 `apps/pc/**` 推送 `dev` 时执行真实 build / PC browser regression；当前 GitHub connector 只能按 commit 查询 PR 触发的 workflow runs，本卡为直接 push `dev`，因此施工线程无法可靠读取这次 push run 的 run id / 最终状态。**这里不伪造 CI PASS。**

### 当前结论

PC01 实现已完成并进入 `待评审`。施工线程不自行标记 `PASS`；独立评审应以仓库真实 build / browser / CI 结果补齐最终证据，如有红灯则回到 `CHANGES REQUIRED`。

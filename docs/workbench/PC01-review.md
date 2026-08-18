# PC01｜PC 控制面总壳 + APP 数据接入地图｜独立评审

> 评审状态：**PASS**  
> 日期：2026-08-18  
> 原施工记录：`docs/workbench/PC01-admin-control-plane.md`  
> 当前复核基线：`dev`（PC02 / PC03 / PC04 均已通过独立复审）

## 结论

PC01 最终结论：

```text
PC01 = PASS
```

本次不是只按 PC01 当时的 Skeleton 自证来判断，而是结合 PC02–PC04 已落地结果进行反向验证。PC01 作为底座要求固定的关键契约，已经被后续三张卡真实复用：

- 7 个既有管理域继续作为 PC 信息架构骨架；
- Role + Module Permission + Data Scope 语义被后续赛事、Organization / 机会 / 内容、课程 / 权益 / 证书控制面继续使用；
- 五类 canonical 数据来源保持为：平台配置 / API 同步 / 文件导入 / 人工修正 / Runtime；
- Competition / Organization / Course / Benefit / Certificate 等关系继续使用 stable id；
- Mobile 当前没有显式 `accountId` 的缺口仍被保留，没有为了 PC 页面完整而伪造第二账号 ID；
- `/tasks` 继续保持派生层，没有新增 Task 管理域或第二真相源；
- `/registration-portal/*` 继续保持独立报名业务入口；
- PC02–PC04 的独立复审已经验证 PC01 契约足以承接后续真实业务控制面。

## 验收项

### 7 域控制面与 Operator Context｜PASS

当前 PC01 仍保留赛事中心、主体与学校、资源运营、学生与赛事身份、资产与可信凭证、内容与活动、创赛工坊配置七个域；Role / Module Permission / Data Scope 继续作为后台统一权限表达。

### canonical 数据来源｜PASS

`DataSource` 仍严格限定为：

```text
平台配置
API 同步
文件导入
人工修正
Runtime
```

后续 PC03 / PC04 已按该枚举收口，没有继续出现自造来源类型。

### stable ID 与跨域关系｜PASS

- `competitionId` 直接沿用 Mobile；
- `companyId → organizationId` 沿用同一 stable value；
- Account 当前没有显式 stable id，PC01 继续将其表达为真实缺口；
- PC02 已进一步把学校、赛事组织方关系收口到 Organization stable id。

### 真相源边界｜PASS

PC01 未复制以下 Runtime / 长期事实：

- session
- `identities[] / CompetitionIdentity`
- lifecycle
- Application
- CourseLearning
- Benefit claim/use
- WorkshopRun

PC02–PC04 后续施工也没有推翻这一边界。

### APP → PC 数据接入地图｜PASS

`/home`、`/competitions`、`/opportunities`、`/courses`、`/benefits`、`/assets`、`/me`、`/tasks` 八组入口都已有负责域、来源、状态、stable id 与保留规则映射；后续三张业务卡已经证明该映射可以落到真实控制面，而不是仅停留在说明图。

## 非阻断维护项

以下两项不阻断 PC01 PASS，但必须在 PC05 总收口时处理：

1. `AdminConsole.tsx` 仍保留一份 PC01 时期的 Shell 实现，而 PC02–PC04 已使用抽出的 canonical `AdminControlPlaneShell`。当前视觉/权限语义未形成产品冲突，但应最终只保留一个 Shell，避免后续漂移。
2. PC01 早期示例对象详情仍存在 `/admin/organizations/objects/:id` 一类旧 Pattern 路径，而 PC03 的真实 Organization 控制面已使用 `/admin/organizations/:organizationId`。PC05 应把旧示例关系迁移/重定向到 canonical 业务详情，避免同一 stable id 出现两个入口。

这两项属于集成与可维护性债务，不改变 PC01 已验证的业务契约。

## Browser / CI 边界

当前 `admin-skeleton.spec.ts` 仍覆盖 PC01 总览、五类来源、stable id、APP→PC map、列表/详情/编辑 Pattern、CompetitionIdentity 真相源边界与报名门户独立入口；PC02 的后续 focused assertions 又进一步验证 canonical shell 与 stable Organization id。

GitHub connector 对当前 `dev` HEAD 的 combined status 仍返回空状态，因此本次 PASS 是**独立产品 / 代码契约复审 PASS**，不冒充新增 CI run PASS。完整 TypeScript / Vite build、PC browser regression 与跨端 R-Final 由 PC05 / R-Final 最终收口统一执行。

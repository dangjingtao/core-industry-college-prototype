# 核心产业学院原型｜文档入口

本目录是 `core-industry-college-prototype` 的产品、迁移、历史真相源和施工台账入口。

> 当前原则：**新仓库是后续唯一施工入口；旧仓库和 Google Drive 原型用于追溯产品与功能真相。**

---

## 1. 开工先读

任何涉及手机端、PC 管理端、PC 报名门户、功能补齐、产品结构或状态模型的线程，建议按这个顺序阅读：

1. [`workbench/00-work-ledger.md`](./workbench/00-work-ledger.md)  
   当前工作台账、F00–F04 任务卡、依赖关系和最终总回归要求。
2. [`product/00-product-master-context.md`](./product/00-product-master-context.md)  
   产品定位、业务访谈、账号 / 赛事 / 长期资产等不可破坏原则。
3. [`product/03-pc-admin-data-skeleton.md`](./product/03-pc-admin-data-skeleton.md)  
   PC 管理端作为数据控制面的骨架：主数据、关系、状态、长期资产、权限角色、写入责任和首期 CRUD 范围。
4. [`product/05-pc-admin-product-decisions.md`](./product/05-pc-admin-product-decisions.md)  
   PC 管理端已确认产品决策：平台定位、三创赛接入边界、赛事报名与官方状态、学校审核、Organization、课程、证书、权益、机会、权限、审计与高风险审批。
5. [`product/01-legacy-mockplus-audit.md`](./product/01-legacy-mockplus-audit.md)  
   直接检查 Google Drive 原始 Mockplus 后得到的功能级缺口；解决“路由有了但功能缩水”的问题。
6. [`product/02-open-decisions-and-backlog.md`](./product/02-open-decisions-and-backlog.md)  
   明确该补、待决策、继续冻结的 backlog。
7. [`product/05-pluggable-simulation-module-design.md`](./product/05-pluggable-simulation-module-design.md)
   运营沙盒等模拟小游戏作为赛事、课程或活动可选模块时的边界、接入协议和首期验收标准。
8. [`product/06-business-simulation-demo-confirmation.md`](./product/06-business-simulation-demo-confirmation.md)
   面向负责人的“经营决策体验”首期产品定位、范围、风险和确认项。
9. [`product/07-sandbox-v2-design-evaluation.md`](./product/07-sandbox-v2-design-evaluation.md)
   “运营沙盒 V2.0”完整方案的评估与分级：可并入长期愿景 / 需产品决策 / 暂缓，及决策门槛清单。
10. 与当前任务直接相关的 migration / reference 文档。

不要只看当前页面代码就自行推导产品模型，也不要只因为旧页面已经映射到新路由就认为旧功能完整覆盖。

如果任务涉及 PC 管理系统，新页面施工前还必须回答：**它管理什么业务对象、谁能写、手机哪里消费、与哪些对象关联、结束后哪些事实必须保留。**

---

## 2. 当前工作入口

### 工作台账

[`workbench/00-work-ledger.md`](./workbench/00-work-ledger.md)

当前已登记：

- **F00** 手机端接入现有三创赛响应式报名门户；
- **F01** 学生主档 + Onboarding / Profile / 问卷；
- **F02** 企业可信信息 + 可信凭证完整能力；
- **F03** 账号 / 简历 / 团队 / 外部 handoff 补齐；
- **F04** 学力值 / 第三方账号 / D03 / D08 / 创域 / AI 能力等产品决策；
- **R-Final** 基于 Google Drive 140 页原型的功能级总回归。

施工与评审状态以后以工作台账为准；施工线程不能自行把任务标记为 PASS。

### PC 管理端骨架

[`product/03-pc-admin-data-skeleton.md`](./product/03-pc-admin-data-skeleton.md)

当前已形成 `/admin/*` 数据责任骨架，用于承接手机端快速演进后逐步暴露的数据来源问题。

它不是一张“后台 UI 设计稿”，而是后续 PC 管理端施工的约束文档。

### PC 管理端已确认决策

[`product/05-pc-admin-product-decisions.md`](./product/05-pc-admin-product-decisions.md)

这份文档记录 PC 后台产品访谈后已经确认的业务边界，可作为 `03-pc-admin-data-skeleton.md` 的决策补充。

重点包括：

- 核心产业学院是平台控制面，三创赛重要但不是后台唯一中心；
- 外部权威赛事事实、平台报名流程、平台叠加服务必须分层；
- 三创赛 API 优先，文件导入兜底，人工覆盖必须审计；
- 学校审核、Organization、平台托管课程、可信证书、权益、机会与内容的已确认范围；
- 超级管理员 / 普通运营、模块 + 数据范围权限、审计日志、高风险审批与账号冻结。

---

## 3. Product｜产品真相源

### [`product/00-product-master-context.md`](./product/00-product-master-context.md)

当前产品总纲。核心结论包括：

- 产品不是单一“三创赛 App”；
- 学生侧主轴是“参赛 + 就业 / 实习”；
- App Account 长期存在，赛事身份是按赛事生命周期存在；
- 一个账号可以拥有多个赛事身份；
- 无赛事身份仍能使用公共平台；
- 创赛工坊属于具体赛事上下文；
- 赛事结束后经历 / 结果 / 证书 / 课程成果继续长期存在；
- 企业是资源 / 品牌 / 合作方，不只是职位发布者；
- 学校老师属于 Web / 运营后台用户；
- 不构造不透明的 AI 人才评分。

### [`product/03-pc-admin-data-skeleton.md`](./product/03-pc-admin-data-skeleton.md)

PC 管理端数据控制面骨架。

当前明确：

- `/admin/*` 是数据运营 / 管理控制面；
- `/registration-portal/*` 是学生响应式报名业务入口；
- PC 管“人、主体、资源、规则、关系、可信状态”，不复制手机端交互；
- 赛事、企业、课程、权益、机会、活动、学生赛事身份、成绩证书、工坊配置等都要有明确数据责任；
- Organization 是后台资源 / 权限 / 可信主体主数据，不等价于 D08 手机“主体管理”；
- `/tasks` 仍是聚合视图，不建立万能任务后台；
- 学力值模型未决前不得在后台先造余额 / 流水 / 奖励体系；
- 默认优先 archive / close / expire / revoke，而不是删除被长期事实引用的业务对象。

文档内包含当前对象关系图、数据流图、写入责任矩阵、权限角色和首期 CRUD 范围。

### [`product/05-pc-admin-product-decisions.md`](./product/05-pc-admin-product-decisions.md)

PC 管理端已确认产品决策纪要。

当前进一步确认：

- 核心产业学院后台是平台控制面，不能按三创赛官方后台设计；
- 三创赛分为外部权威事实、平台承接报名流程和平台叠加服务三层；
- 外部权威数据 API 优先，文件导入兜底，数据来源和人工覆盖必须可追溯；
- 对需官方确认资格的赛事，正式赛事工作区必须等待权威资格结果；
- 赛事项目是 `CompetitionProject`，赛后保留摘要和可信经历，不建设跨赛事长期 Project；
- 跨校团队由队长所在学校统一审核，学校老师只访问授权赛事必要数据；
- 学校、企业、赛事组织方、合作机构统一为 Organization；
- 课程全部平台托管，首期以视频进度 + 小测试作为主要完成方式；
- 课程可成为赛事专属任务，完成状态可被权益、证书和平台服务规则引用；
- 课程证书按运营预配置规则自动触发真实外部权威签发流程；
- 权益首期按个人领取，支持卡密、外部领取、线下核销三种方式；
- 机会由平台分发、App 内正式投递、运营维护状态，不演化为完整招聘平台；
- PC 后台需要超级管理员 / 普通运营、简单模块 + 数据范围授权、P0 审计、高风险审批和账号冻结。

### [`product/04-leadership-signoff-gate.md`](./product/04-leadership-signoff-gate.md)

正式原型版本的外部领导审批 Gate 设计。

当前方案明确：

- 领导不要求拥有 GitHub 账号；
- 审批通过第三方邮箱触达，正式决策发生在独立 Signoff Gateway；
- Signoff 精确绑定 Release PR 当前 commit SHA；
- 代码变化后旧批准不能继承；
- MVP 只卡 `dev → prod` 的正式 Release PR，不干扰日常功能 PR；
- R-Final 是工程验收，Leadership Signoff 是交付/业务验收，两者都通过才能进入 `prod`；
- Signoff 不侵入 `apps/mobile`、`apps/pc` 或产业学院业务后台。

文档内包含审批流程、状态机、邮箱 OTP、数据模型、API 边界、GitHub gate、异常处理、审计要求和 SG01–SG04 实施拆分。

### [`product/01-legacy-mockplus-audit.md`](./product/01-legacy-mockplus-audit.md)

原始 Mockplus 功能审计。

历史真相源：Google Drive `核心产业学院-mockplus-offline.zip`：

- 58,024,433 bytes；
- SHA-256 `28ac5a710283ec402a8d24822a1bea84ae6aaeee11fefdcd0a220db1557bf03b`；
- 470 files；
- 140 个 `data/pages/*.js` 页面。

这份文档重点记录旧页面内部真实存在但在重构中可能缩水的字段、按钮、外部 handoff 和业务语义。

### [`product/02-open-decisions-and-backlog.md`](./product/02-open-decisions-and-backlog.md)

按以下类型整理：

- 明确应补；
- 需要先统一数据模型；
- 必须产品确认；
- 已冻结；
- 后续探索。

工作台账是当前执行排序，Backlog 是问题库；两者不要互相替代。

---

## 4. Migrations｜迁移与当前实现基线

### [`migrations/mobile-from-com-design.md`](./migrations/mobile-from-com-design.md)

手机端从 `dangjingtao/com-design/core-industry-college-refactor` 迁入本仓库的记录，包括：

- 来源提交；
- 66 semantic routes；
- 公共平台 / workspace / workshop / assets / support；
- shared state 边界；
- route audit；
- build / Chromium 回归；
- 新仓库重新验收要求。

**旧来源仓库的 R05 PASS 只属于迁移来源证据，新仓库必须以自己的代码、build 和 browser evidence 为准。**

### [`migrations/pc-registration-portal-from-com-design.md`](./migrations/pc-registration-portal-from-com-design.md)

记录现有三创赛响应式报名门户的迁移来源、流程与验收证据。

注意：报名门户只是 PC 侧的一个业务入口，不代表 PC 管理端已经完成。

---

## 5. Reference｜追溯与评审证据

### [`reference/legacy-page-map.tsv`](./reference/legacy-page-map.tsv)

完整 140 页旧 Mockplus → 新结构映射。

用途：定位旧页去向。

注意：它只能证明页面有去向，不能证明页面内部所有功能均被保留。

### [`reference/history-and-review-evidence.md`](./reference/history-and-review-evidence.md)

记录旧重构 T01–T05 / R01–R05 的关键结论、修复原因、构建和浏览器证据。

### [`reference/source-index.md`](./reference/source-index.md)

Google Drive、旧 GitHub、产品访谈、正式评审、实现 HEAD、CI 等来源索引。

### [`reference/com-design-baseline.md`](./reference/com-design-baseline.md)

Com Design Core 的组件、token、视觉规则、触摸目标和已知 reduced-motion CSS 问题。

---

## 6. 当前两端事实边界

### Mobile

手机端当前已经迁入主要业务原型，包括：

- 公共平台；
- 赛事生命周期；
- 创赛工坊；
- 长期资产；
- 课程 / 权益；
- 机会 / 企业 / 投递；
- 支撑页面；
- explicit 404。

剩余功能完整性问题以 `workbench/00-work-ledger.md` 和 legacy audit 为准。

手机端当前仍存在部分静态 / mock 数据。后续不应继续把这些数据理解成“手机页面自己的数据”，而应逐步映射到 PC 管理端的数据域。

### PC Admin

当前已经有管理端骨架：

```text
/admin
/admin/competitions
/admin/organizations
/admin/resources
/admin/students
/admin/assets
/admin/content
/admin/workshop
```

当前骨架用于表达：

- 数据域；
- 对象关系；
- 写入责任；
- 手机消费位置；
- 首版最低管理动作。

**这只是可施工骨架，不等于真实 CRUD / 后端 / 权限体系已经完成。**

后续 PC 管理端施工应同时参考：

```text
03-pc-admin-data-skeleton.md
+ 05-pc-admin-product-decisions.md
```

其中 `03` 定义数据骨架，`05` 固化本轮已经确认的业务决策。

后续优先按 P0 小卡推进，不因为三创赛接入较深就把后台收缩成单一赛事系统。

### PC / Responsive Registration Portal

PC 端另有三创赛响应式报名门户：

```text
/registration-portal/*
```

它已经承担复杂报名流程，不应在手机端再造一套：

- 队长 / 队员；
- 账号注册；
- 答题；
- 团队与成员；
- 审核；
- 承诺书；
- 报名完成；
- 报告 / 证书等后续入口。

报名门户与 PC Admin 后续应共享赛事 ID、账号上下文和状态语义，但不为了“后台统一”强行合并页面。

---

## 7. 决策冻结

在明确产品决策前，不允许普通施工线程自行恢复：

- D03 全局任务体系；
- D08 手机主体管理；
- 学力值积分经济 vs 成长分；
- 第三方业务平台账号语义；
- 创域 / 本地运营 / 扫码体系的完整权限模型；
- AI 人才评分 / 能力雷达等不可解释能力。

PC 管理端同样受这些冻结约束，不能借“后台需要配置”提前替业务拍板。

详见工作台账 F04 与 product backlog。

---

## 8. 最终验收不能只数路由

后续总验收至少同时包括：

1. route audit；
2. TypeScript + Vite build；
3. 五条母动线真实浏览器回归；
4. mobile → 响应式报名 → mobile 状态回流；
5. pending / rejected / ended / revoked / permissionDenied；
6. Google Drive 140 页原型高风险页面 feature-level spot check；
7. P0 / P1 缺口逐项有明确状态；
8. 未决业务有决策或保持冻结；
9. 无 duplicate session / identities / lifecycle / applications 真相源；
10. PC 新增管理能力能够说明数据对象、写入责任、手机消费和长期保留边界。

**“66/66 routes”只能说明门都存在；最终还要检查屋里的东西有没有丢。**

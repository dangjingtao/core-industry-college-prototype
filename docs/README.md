# 核心产业学院原型｜文档入口

本目录是 `core-industry-college-prototype` 的产品、迁移、历史真相源和施工台账入口。

> 当前原则：**新仓库是后续唯一施工入口；旧仓库和 Google Drive 原型用于追溯产品与功能真相。**

---

## 1. 开工先读

任何涉及手机端、PC 报名门户、功能补齐、产品结构或状态模型的线程，建议按这个顺序阅读：

1. [`workbench/00-work-ledger.md`](./workbench/00-work-ledger.md)  
   当前工作台账、F00–F04 任务卡、依赖关系和最终总回归要求。
2. [`product/00-product-master-context.md`](./product/00-product-master-context.md)  
   产品定位、业务访谈、账号 / 赛事 / 长期资产等不可破坏原则。
3. [`product/01-legacy-mockplus-audit.md`](./product/01-legacy-mockplus-audit.md)  
   直接检查 Google Drive 原始 Mockplus 后得到的功能级缺口；解决“路由有了但功能缩水”的问题。
4. [`product/02-open-decisions-and-backlog.md`](./product/02-open-decisions-and-backlog.md)  
   明确该补、待决策、继续冻结的 backlog。
5. 与当前任务直接相关的 migration / reference 文档。

不要只看当前页面代码就自行推导产品模型，也不要只因为旧页面已经映射到新路由就认为旧功能完整覆盖。

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

### PC / Responsive Registration Portal

PC 端当前已有三创赛响应式报名门户：

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

当前最高优先事项不是重画 PC 报名，而是按 F00 把 mobile ↔ responsive portal 真正接通。

---

## 7. 决策冻结

在明确产品决策前，不允许普通施工线程自行恢复：

- D03 全局任务体系；
- D08 主体管理；
- 学力值积分经济 vs 成长分；
- 第三方业务平台账号语义；
- 创域 / 本地运营 / 扫码体系；
- AI 人才评分 / 能力雷达等不可解释能力。

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
9. 无 duplicate session / identities / lifecycle / applications 真相源。

**“66/66 routes”只能说明门都存在；最终还要检查屋里的东西有没有丢。**

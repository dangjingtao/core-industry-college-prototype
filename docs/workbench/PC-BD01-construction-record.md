# PC-BD01｜施工记录

> 分支：`dev`  
> 基线：`5952558372327616fb4e8e9e40f6cbd72eacc8cd`  
> 性质：施工记录，不是独立复审结论  
> 当前结论：**施工完成，待独立复审；本线程不自行判定 PASS。**

---

## 1. 施工范围

本轮只收敛 PC 基础数据工作台的数据归属、状态语义和跨域关系，不把 `/admin/basic-data/*` 升级成新的业务真相域。

核心施工文件：

- `apps/pc/src/admin/data.ts`
- `apps/pc/src/admin/BasicDataConsole.tsx`
- `apps/pc/tests/pc-basic-data.spec.ts`

在 PC 全量回归中发现的原型断言漂移，按“只修 PC 原型、不改既有业务状态模型”的边界同步收敛；Mobile 产品逻辑不属于本卡施工范围。

---

## 2. 保留的 UI 成果

以下基线成果继续保留：

- `BasicDataConsole`；
- `/admin/basic-data`、`/admin/basic-data/:sub`、`/admin/basic-data/:sub/:id`；
- 侧栏“基础数据管理”入口；
- 现有 5 个子页面：
  - 报名学生基础数据；
  - 参赛学校基础数据；
  - 赛事 / 赛道字典；
  - 证书 / 协议模板；
  - 导入与批处理；
- 现有 Header、表格、详情、卡片、stable-id 展示和导入批次形态；
- 原型操作入口继续存在，但真正维护动作指向所属业务域。

没有因为 `basicData` 不是独立业务域而删除页面、改掉路由或重画整套 IA。

---

## 3. 已归并的语义

### 3.1 学生

“报名学生基础数据”现在明确为 `Account / StudentProfile` 聚合视图：

- 不再使用 PC 自造 `student-*` 作为长期主键；
- 当前没有 canonical `accountId` 时显示“账号 ID 待真实账号层接入”；
- `StudentProfile` 不维护独立 `active / frozen / merged` 状态；
- 账号冻结继续属于 Account / Governance；
- 报名审核、官方资格、CompetitionIdentity 不被压成一个“学生状态”。

### 3.2 学校

“参赛学校基础数据”直接读取 PC03 的 `Organization(type=学校)`：

- `organizationId` 是稳定锚点；
- 不建立独立 School 主表；
- 不建立“已认证 / 待认证 / 冻结”学校状态机；
- 赛事授权和审核责任通过具体赛事 Scope / relation 表达。

### 3.3 赛事 / 赛道配置

保留“赛事 / 赛道字典”页面名称和 UI，但数据语义改为“跨域基础配置索引”：

- 赛道 → `CompetitionTrack`；
- 阶段 → `CompetitionLifecycle`；
- 均绑定具体 `competitionId`；
- 证书配置、协议配置分别回到其所属域；
- basic-data 不拥有全局万能 Dictionary 真相。

### 3.4 模板 / 规则

保留“证书 / 协议模板”页面作为索引：

- 证书 → PC04 `Certificate / 签发规则`；
- 协议 → Competition / Registration；
- Banner → Content `Placement / ContentItem`；
- 权益规则 → Benefit / EligibilityRule；
- 版本、发布状态跟随所属业务域，basic-data 不保存第二份发布状态。

### 3.5 导入与批处理

保留并补强数据接入治理视图：

- canonical `DataSource` 仍只有：`平台配置 / API 同步 / 文件导入 / 人工修正 / Runtime`；
- 批次状态只描述导入流程，不等于业务状态；
- 每个批次显示最终写回对象；
- 人工修正保留原因；
- API 与人工值冲突时显式提示，不静默覆盖权威事实。

---

## 4. 跨域关系保持

本轮没有改写以下既定关系：

- `/registration-portal/*` 继续是独立报名入口；
- PC02 的 `platformReview / officialQualification / Workspace Gate` 分层不变；
- PC03 的 Organization / Opportunity / Content 继续作为各自真相源；
- PC04 的 Course / Benefit / Certificate 状态不由 basic-data 接管；
- PC05 的 Account Governance、CompetitionIdentity、长期资产继续独立承担各自语义。

`sanchuang-16` 仍可表达：

```text
学校审核已通过
+ 官方资格待确认
=> 正式 Workspace 仍不可开放
```

---

## 5. Browser assertions

`apps/pc/tests/pc-basic-data.spec.ts` 已改为锁定正确归并语义，当前 focused 覆盖包括：

1. 基础数据入口与 5 个子页面继续存在；
2. 学生页显示 Account / StudentProfile，并禁止自造 `studentId` 真相；
3. 学校页显示 canonical `organizationId` 与 Organization(type=School)，不锁定学校认证状态机；
4. 配置索引能看到 CompetitionTrack / CompetitionLifecycle 及具体赛事 Scope；
5. 模板索引能看到 Certificate / Competition / Content / Benefit 的真实归属；
6. 导入页展示五类 canonical DataSource、写回对象、失败原因和冲突治理；
7. PC02 学校审核与官方资格分层仍成立；
8. `/registration-portal/*`、PC03、PC04、PC05 关键路由可达。

PC 全量回归此前暴露的 5 个失败均属于原型断言漂移，而不是 PC-BD01 新建第二真相导致的业务断链；当前 `dev` 已将这些断言收敛到用户可见业务文案 / 具体卡片 / 可见赛事名称，不再依赖默认隐藏的技术 ID 或唯一文案计数。

---

## 6. Build / Test 记录

已确认：

- PC type / build verify 成功；
- PC-BD01 focused assertions 在此前 PC 全量运行中未出现在失败清单；
- 此前 PC 全量 E2E 结果为 `31 passed / 5 failed`，失败项位于 PC02 / PC03 / PC05 的旧原型断言；
- 当前 `dev` 已修正上述断言漂移，包括：
  - PC02 隐私文案不再被空格级 exact copy 锁死；
  - PC03 技术模式跨路由持续状态与测试预期对齐；
  - PC03 内容创建不再因同名 Scope 文案多实例触发 strict locator；
  - PC05 学生身份行改用用户可见赛事名称定位，不再用默认隐藏 `competitionId`；
  - PC05 审批原因多处展示不再触发 strict locator 冲突。

本施工记录**不将这些修正自行解释为最终 PASS**。最终 PC build / browser regression 由独立复审线程重新执行并判定。

`.github/workflows/r-final-check.yml` 已恢复为原始 R-Final Full Regression；施工期临时 debug workflow 未留在最终树中。

---

## 7. Findings

### F1｜canonical accountId 尚未显式接入当前 PC 样例

当前 StudentProfile 聚合视图没有可确认的长期 `accountId`。本轮没有为填空而生成 `student-*` 或新的 PC 主键，而是明确展示：

> 账号 ID 待真实账号层接入

后续真实账号层接入时，只需要补 canonical Account 映射，不需要扩展新的 Student 主数据模型。

除此之外，本施工线程不新增产品模型 Finding。

---

## 8. 交接

PC-BD01 的施工目标已经收敛到“**基础数据管理 = 跨域维护工作台 / 聚合视图**”。

下一步应由独立复审线程：

1. 对照 `PC-BD01-basic-data-integration.md` 逐项检查；
2. 执行 PC build / browser regression；
3. 检查 5 个页面没有重新形成第二真相源；
4. 再决定是否将 PC-BD01 标记为 `PASS`。

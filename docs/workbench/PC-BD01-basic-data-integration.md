# PC-BD01｜基础数据接入与旧后台能力归并

> 分支：`dev`  
> 类型：施工 / 归并卡  
> 状态：**施工中 / 归并修正**  
> 优先级：P0  
> 当前实现基线：`5952558372327616fb4e8e9e40f6cbd72eacc8cd`  
> 执行时机：PC01–PC04 已形成稳定控制面后执行；**PC05 最终验收前必须完成并独立复审**  
> 目标：保留当前已经完成的基础数据工作台和页面成果，用最小改动把它收敛为**跨域维护入口 / 聚合视图**，避免形成第二套业务真相源，也避免为了重新对齐架构而把现有页面推倒重做。

---

## 0. 当前状态与本卡新结论

`dev` 已有一轮基础数据实现：

```text
commit 5952558
├─ BasicDataConsole
├─ /admin/basic-data/* 路由
├─ 侧栏“基础数据管理”入口 + 5 个子菜单
├─ 学生 / 学校 / 字典 / 模板 / 导入批次页面
├─ stable id 展示
└─ pc-basic-data.spec.ts 5 条 E2E
```

这轮实现**不是废稿，也不要求整体回滚**。

本卡相较初版做一个重要调整：

> **允许保留 `/admin/basic-data/*` 和侧栏“基础数据管理”作为 UI 层的跨域维护工作台，但它不能成为新的业务真相域。**

也就是说：

```text
UI / IA 层：可以有“基础数据管理”聚合入口
数据 / 业务层：仍然只有既有 Account / StudentProfile / Organization / Competition / Course / Benefit / Certificate / Content 等真相源
```

施工线程不要为了“不是第 8 个业务域”去删除 614 行页面、重画导航或把 `/admin/basic-data/*` 全部改回别的路由；本轮只需要把**数据归属和文案语义收正**。

---

## 1. 先定性质：这不是“恢复旧后台”

本卡的输入之一是现有三创赛管理后台截图，其中可看到：

- 数据面板；
- 报名管理；
- 团队管理；
- 审核审批；
- 学校管理；
- 赛程管理；
- 系统设置。

这些截图只能作为**真实运营能力与交互形态的证据**，不能反过来成为核心产业学院 PC 后台的数据模型。

当前产品基线仍然优先：

1. `docs/product/00-product-master-context.md`
2. `docs/product/03-pc-admin-data-skeleton.md`
3. `docs/product/05-pc-admin-product-decisions.md`
4. `docs/workbench/00-work-ledger.md`
5. PC01–PC05 当前实际实现
6. `5952558` 当前基础数据实现
7. 旧后台截图 / 历史页面证据

核心原则：

> **吸收旧后台的能力，保留已经做好的交互壳，但不复制旧后台的数据真相、状态机和权限模型。**

---

## 2. 本轮明确“不返工”的部分

以下内容原则上保留，不要求推倒重做：

- `apps/pc/src/admin/BasicDataConsole.tsx` 作为跨域聚合工作台；
- `/admin/basic-data`、`/admin/basic-data/:sub`、`/admin/basic-data/:sub/:id` 路由；
- 侧栏“基础数据管理”入口和现有 5 个子菜单结构；
- 当前表格、详情、卡片、Header、stable id 标签等 UI 结构；
- “导入与批处理”的批次展示形态；
- `pc-basic-data.spec.ts` 作为 focused E2E 文件；
- PC01OperationsConsole 中“基础数据”入口卡的视觉与布局。

允许重命名文案、调整数据来源、替换局部按钮和断言，但**不要因为本卡重新写一套 BasicDataConsole**。

---

## 3. 必须修正的四个语义问题

### 3.1 学生：不再创造独立 `studentId` 真相源

当前实现中存在：

```text
studentId = student-2024-chenyu
state = active / frozen / merged
trusted = true / false
+ 新建学生 Profile
```

需要收敛。

正确语义仍然是：

```text
Account
  └─ StudentProfile
```

要求：

- 页面可以继续叫“学生基础数据 / 学生主档”；
- 列表和详情可以继续保留当前 UI；
- stable id 优先展示 `accountId`；
- 当前 Mobile 若尚未有可用 `accountId`，要明确显示“账号 ID 待真实账号层接入”，**不要由 PC 自造 `student-*` 作为新的长期主键**；
- `StudentProfile` 没有独立 `active / frozen / merged` 业务状态；账号冻结属于 Account / Governance；
- “可信状态”如果没有已确认 canonical 语义，不做新的 `trusted` 状态机；
- 删除或改写“+ 新建学生 Profile”这类暗示 PC 是学生主档主要创建者的动作。可替换为“查看学生控制台”“导入补充数据”“数据修正”等现有职责。

不要求删除学生列表页面，只要求它变成**现有 StudentProfile / Account 的聚合视图**。

### 3.2 学校：继续是 `Organization(type=School)`

当前实现里 `SchoolMasterRow` 有：

```text
verified / unverified / frozen
已认证 / 待认证 / 已停招
```

这部分需要去掉或改写，因为当前产品没有确认学校认证状态机。

正确表达：

- `organizationId`；
- 学校名称；
- 地区；
- 联系人 / 运营责任人；
- 数据来源；
- 当前赛事授权范围；
- 老师 / 审核角色 Scope；
- 与赛事 / 课程 / 权益 / 活动 / 机会 / 内容的关系。

页面仍可保留 `/admin/basic-data/schools/*`，但它只是 `Organization(type=School)` 的**学校维护视图**。

推荐将现有“状态”列改成更不误导的：

```text
数据来源
赛事授权
审核角色配置
```

或使用已有 Organization 的 canonical 状态；不要继续显示“已认证 / 待认证”。

### 3.3 字典：保留页面，但降级为“基础配置索引”

当前实现把赛道、阶段、学段、证书类型、协议模板放进统一 `DictionaryRow`。

不要求删掉这个页面，但不能把它解释成一个新的全平台万能字典真相源。

页面改成**跨域基础配置索引 / 维护入口**：

```text
赛道           → CompetitionTrack / 具体赛事
赛事阶段       → CompetitionLifecycle / 具体赛事
证书类型       → PC04 Certificate 配置
协议模板       → Competition / 对应业务上下文
学段等通用枚举 → 只有在现有 StudentProfile 已有稳定语义时展示；没有就不扩
```

可以保留现有列表布局和示例行，但至少要增加“归属域 / 维护入口”，让评审人知道**真正在哪儿维护**。

禁止再声明“赛事 / 赛道字典是全平台长期字段引用基线”。

### 3.4 模板：保留模板页，但按业务归属拆清

当前模板页同时存在：

- 证书；
- 协议；
- Banner。

页面可以保留作为**模板与发布配置索引**，但不能宣称“统一从基础数据管理发布”。

正确归属：

```text
证书模板 / 签发规则 → PC04 可信证书
赛事协议 / 承诺材料   → 具体 Competition / 报名业务
Banner / 内容素材      → Content 运营
```

要求：

- 保留现有卡片 / 表格；
- 增加“归属模块 / 去维护”入口；
- 本页不持有第二份模板发布状态；
- 不把 Banner 变成基础主数据。

---

## 4. 导入与批处理：当前实现可以继续深化

`/admin/basic-data/imports` 是当前实现里最值得直接保留的能力。

它不是新的业务对象真相源，而是**数据接入治理记录**。

可以继续保留 / 补强：

```text
batchId
filename
对象类型
source = 文件导入 / API 同步 / 人工修正
operator
提交时间
校验结果
成功 / 失败数量
失败原因
是否已应用
冲突提示
```

但必须明确：

```text
导入学生   → 写入 / 补充 Account / StudentProfile 对应事实
导入学校   → 写入 / 补充 Organization(type=School)
导入赛道   → 写入具体 CompetitionTrack
导入证书   → 写入 Certificate / Result 体系
```

导入批次自身可以有 `pending / validated / rejected / applied` 这类**批处理状态**；这些状态只描述导入流程，不等于学生 / 学校 / 证书本身的业务状态。

外部权威数据发生：

```text
API 值 ≠ 人工覆盖值
```

时必须显式显示冲突；不得静默把人工值冒充官方事实。

---

## 5. “基础数据管理”现在如何定义

为避免评审人看不懂，也避免工程层出现第二宇宙，当前统一定义为：

> **基础数据管理 = 跨域维护工作台。它帮助运营快速找到长期主数据、基础配置和数据接入记录，但不拥有这些对象的第二份真相。**

因此允许保留当前侧栏入口，但页面上要能看懂“归属在哪里”。

建议 5 个子菜单收敛为以下语义：

| 当前菜单 | 保留 | 收敛后的业务语义 | 真正归属 |
| --- | --- | --- | --- |
| 报名学生基础数据 | 保留，可酌情改名“学生基础数据” | Account / StudentProfile 聚合视图 | 学生与赛事身份 |
| 参赛学校基础数据 | 保留，可酌情改名“学校基础数据” | Organization(type=School) 聚合视图 | 主体与学校 |
| 赛事 / 赛道字典 | 保留页面 | 基础配置索引，不是万能字典 | Competition / PC04 等所属域 |
| 证书 / 协议模板 | 保留页面 | 模板与发布配置索引 | Certificate / Competition / Content |
| 导入与批处理 | 保留并深化 | 数据接入治理记录 | 跨域治理元数据 |

注意：保留菜单不等于保留当前所有数据模型。

---

## 6. 旧后台能力 → 当前控制面归并表

| 旧后台截图能力 | 是否吸收 | 当前归属 | 正确业务语义 | 明确禁止 |
| --- | --- | --- | --- | --- |
| 数据面板 | 是 | `/admin` 运营总览 | 读取现有 Competition / Organization / Resource / Student / Asset 等对象做概览 | 新建 Dashboard 真相源；把某场赛事数字冒充全平台指标 |
| 报名管理 | 是 | 具体赛事控制台 | Registration + platformReview + officialQualification 的赛事范围查询 / 处理 | 新增全局报名主数据；复制 `/registration-portal/*` 完整报名表 |
| 团队管理 | 是 | 具体赛事控制台 | Team / TeamMember / CompetitionProject，必须带 `competitionId` | 全局 Team / Project 中心 |
| 审核审批 | 拆分吸收 | 赛事控制台 + `/admin/governance/*` | 学校审核属于赛事流程；高风险审批属于治理域 | 万能无 Scope 审批中心 |
| 学校管理 | 是 | Organization + BasicData 学校聚合视图 | `Organization(type=School)` + 地区 + 联系人 +赛事授权 + 老师 Scope | 独立 School 真相源；新学校认证状态机 |
| 赛程管理 | 是 | Competition | `CompetitionLifecycle`：官方统一窗口 + 地方执行节点 | 独立 Schedule 真相源 |
| 系统设置 | 拆分吸收 | Competition + Governance | 赛事参数回赛事；管理员 / 权限 / 审计回治理 | 用全局设置修改具体赛事业务字段 |
| Excel / 人工维护 | 是 | `/admin/basic-data/imports` 聚合查看，实际写回所属域 | 文件导入 / 人工修正 + 来源 / 批次 / 原因 / 审计 | 导入后静默覆盖 API 权威事实 |

---

## 7. 报名、审核、资格、赛事身份继续严格分层

无论基础数据页面怎么展示，都必须保持 PC02 已确认语义：

```text
平台承接报名流程
≠ 学校真实性审核
≠ 外部权威官方资格
≠ CompetitionIdentity 长期赛事身份
```

默认业务文案优先使用：

```text
学校审核：待审核 / 已通过 / 已驳回
官方资格：待确认 / 已确认 / 不需要外部确认
赛事身份：待生效 / 有效 / 已拒绝 / 已撤销
```

技术模式再显示：

```text
platformReview
officialQualification
CompetitionIdentity
```

必须继续能演示：

```text
学校审核 = 已通过
官方资格 = 待确认
→ 正式 Workspace 仍不可开放
```

基础数据工作台不得把这些压成一个“学生状态”“团队状态”或“审核通过”。

---

## 8. 数据来源继续只有五类 canonical 语义

```text
平台配置
API 同步
文件导入
人工修正
Runtime
```

页面中可以出现“运营录入”“赛事可信方”“批量导入”等**责任人 / 来源详情文案**，但它们不能变成新的 `DataSource` 枚举。

例如：

```text
source = 文件导入
sourceDetail = 运营张老师 · students-2026-fall.csv
```

而不是：

```text
source = 运营录入
```

---

## 9. 评审人可理解性要求

默认页面讲业务，技术模式讲真相源。

### 默认视图应让评审人看懂

- 这个数据是什么；
- 属于谁；
- 谁维护；
- 来自哪里；
- 与哪场赛事 / 哪个主体有关；
- 真正去哪里继续维护。

### 技术模式继续用于验收

- stable id；
- canonical state；
- DataSource；
- App consumer；
- relation id；
- 保留策略。

### 直接 `CHANGES REQUIRED` 的歧义

- `studentId` 被当成长账号主键，但与 Account 无映射；
- “已认证学校”无法说明认证语义；
- “赛道字典”看起来脱离具体 Competition 独立生效；
- “证书模板”在基础数据和 PC04 各有一份发布状态；
- “已通过”不知道是学校审核、官方资格还是赛事身份；
- 总览数字看不出 Scope；
- “基础数据管理”看起来像拥有第二套 Student / School / Competition 真相源。

---

## 10. 当前实现的最小修复顺序

施工线程按下面顺序修，**不要先重构组件**：

1. **先改 `data.ts` 的 basicData 语义**：明确它是 aggregate / workbench，不再声明自己拥有学生、学校、赛道、模板的独立真相；
2. **修学生页**：去自造 `studentId` / Profile 状态机 / “新建学生 Profile”；复用 Account / StudentProfile 语义；
3. **修学校页**：去 `verified / unverified` 认证状态，明确来自 Organization(type=School)；
4. **修字典页**：改成跨域基础配置索引，给每项补归属域 / 维护入口；
5. **修模板页**：改成模板索引，证书 / 协议 / Banner 分别指向既有业务域；
6. **保留并补强导入页**：批次只描述导入流程，写回对象仍归所属域；
7. **最后更新 `pc-basic-data.spec.ts`**，让测试锁定正确语义，而不是锁定第二套数据模型。

如果某一步只需改文案 / 数据映射，就不要顺手重写 UI。

---

## 11. Focused browser assertions（按现状更新）

现有 5 条 E2E 不删除文件，按以下目标改写 / 扩展：

1. `/admin/basic-data` 及现有 5 个子菜单可以继续存在，并明确显示它是“跨域维护工作台 / 聚合入口”；
2. 学生详情展示 Account / StudentProfile 语义；若 accountId 未接入，明确暴露缺口，不出现 PC 自造长期 `student-*` 主键；
3. 学校详情继续展示稳定 `organizationId`，同时明确来自 `Organization(type=School)`，不出现“已认证 / 待认证”新状态机；
4. 字典页至少能看出赛道 / 阶段属于 Competition，证书类型属于 PC04，而不是统一字典直接生效；
5. 模板页至少能看出证书 → PC04、协议 → Competition、Banner → Content 的归属；
6. 导入页继续展示批次、成功 / 失败与原因，并能说明导入最终写回哪个既有对象；
7. canonical DataSource 仍只有五类；
8. `sanchuang-16` 中“学校审核已通过 + 官方资格待确认”语义继续成立；
9. `/registration-portal/*` 仍是独立报名入口；
10. PC02 / PC03 / PC04 / PC05 既有关键路由不因 BasicDataConsole 改造而失效。

---

## 12. 禁止修改范围

本卡原则上不修改：

- Mobile 产品逻辑；
- Mobile route registry；
- `identities[]` / Application / CourseLearning / Benefit Runtime 真相源；
- `/registration-portal/*` 的完整报名交互；
- D08 `/me/subjects`；
- 企业 / 学校自运营权限模型；
- PC02 已确认的报名 / 官方资格 / Workspace Gate；
- PC04 已确认的课程 / 权益 / 证书业务状态。

也禁止为了“架构纯洁”做以下返工：

- 删除整个 `BasicDataConsole`；
- 删除 `/admin/basic-data/*` 所有路由；
- 把现有 5 个页面全部重画到其它组件；
- 因为 `basicData` 不是业务真相域就把当前 UI 成果整体撤回。

如果能通过**数据映射 + 文案 + 局部动作调整**解决，就不要做大重构。

---

## 13. PASS 门槛

本卡只有同时满足以下条件才可由独立评审判定 `PASS`：

- 当前 `5952558` 已有页面成果大部分保留，没有无必要返工；
- `/admin/basic-data/*` 清楚表达为跨域维护工作台，而不是第二业务真相域；
- 学生仍归 Account / StudentProfile，不产生独立 `studentId` 真相；
- 学校仍归 Organization(type=School)，不新增学校认证状态机；
- 赛道 / 阶段仍归具体 Competition；
- 证书 / 协议 / Banner 模板各自回到既有业务域；
- 导入批次只描述数据接入流程，不成为业务对象第二真相；
- 报名 / 学校审核 / 官方资格 / CompetitionIdentity 不混淆；
- canonical DataSource 仍只有五类；
- 默认视图评审人能看懂“数据归属与去哪里维护”；
- PC build / browser regression 通过；
- PC05 最终总回归将本卡纳入跨域一致性检查。

施工线程不得自行把本卡标记为 `PASS`；完成后进入独立复审。
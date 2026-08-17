# 03｜PC 管理端数据骨架

> 状态：Skeleton / 可继续演进  
> 分支：`dev`  
> 目的：定义 PC 管理系统如何为手机端提供主数据、关系、运营配置、业务状态和长期资产支持；不是后端数据库 Schema，也不是把手机端页面复制到桌面。

---

## 1. 核心定位

PC 管理端的职责不是“桌面版学生 App”，而是：

> **管理人、主体、资源、规则、关系与可信状态，为手机端提供稳定的数据真相源和运营控制面。**

现有 `/registration-portal/*` 继续作为三创赛响应式报名业务入口，它负责报名、团队、审核和报名状态回流，但它不等于整个 PC 管理系统。

本轮新增：

```text
/admin/*
```

作为 PC 管理端骨架入口。

---

## 2. 数据流原则

```text
运营后台 / 报名门户 / 业务运行
              ↓
      共享业务真相 / API 边界
              ↓
  主数据 → 关系与规则 → 运行状态 → 长期资产
              ↓
           手机端消费
```

### 主数据

- Account / StudentProfile
- Organization / School / Company
- Competition / Track
- Opportunity / Course / Benefit / Activity / Content

### 关系与规则

- Competition ↔ Track / School scope / ResourceProvider
- Organization ↔ Resource
- Resource ↔ Competition
- Benefit ↔ EligibilityRule
- Account ↔ CompetitionIdentity[]

### 运行状态

- Registration
- CompetitionIdentity
- Team / Team change
- Application
- Course learning
- Benefit claim / use
- WorkshopRun

### 长期资产

- Experience
- Result
- Certificate
- VerificationRecord

---

## 3. 第一阶段管理域

### A. 赛事中心

管理：

- Competition
- CompetitionTrack
- CompetitionLifecycle
- CompetitionResource
- 学校范围
- 赛事与课程 / 权益 / 活动 / 企业资源的关系

PC 决定“赛事是什么、什么时候发生、谁能参与”；报名门户负责“某个学生如何完成报名”。

### B. 主体与学校

管理统一 Organization ID：

- 企业
- 学校
- 合作机构 / 资源提供方
- 企业可信工商资料
- 学校在某赛事下的授权范围

企业不能只作为招聘公司存在，应可同时关联：

```text
赛事 / 课程 / 权益 / 活动 / 机会
```

### C. 资源运营

统一承接：

- Opportunity
- Course
- Benefit
- Activity
- ResourceRelation
- EligibilityRule

不同资源可以有不同字段，但来源主体、发布状态、有效期、适用范围和关联关系应保持一致语义。

### D. 学生与赛事身份

管理/查询：

- StudentProfile
- CompetitionIdentity[]
- CompetitionTeam
- Application

关键边界：

```text
StudentProfile = 长期的人
CompetitionIdentity = 某场赛事的身份
Team / Project = 赛事期对象
```

PC 不新建第二套学生账号，也不把“当前赛事”退化成单赛事账号模型。

### E. 资产与可信凭证

管理：

- Experience
- Result
- Certificate
- VerificationRecord

赛事结束可以回收赛事期权限，但不能删除经历、成绩、证书、课程成果等长期可信事实。

### F. 内容与活动

管理：

- 公告 / 资讯 / 赛友内容
- 活动
- 首页推荐位 / Banner
- 人工客服 handoff

为后续创域、本地活动、扫码签到/核销预留数据位置，但不在业务规则未定前创建新的学生一级主轴。

### G. 创赛工坊配置

管理：

- WorkshopSkillConfig
- WorkshopTaskConfig
- MaterialRequirement
- PromptVersion
- ComputePolicy
- 运行状态观察

PC 管模板和生效版本；实际 task run 必须保留 `competitionId`、team / project 上下文。

创赛工坊仍是赛事内能力，不升级为全局 AI 工具箱。

---

## 4. 明确不建的管理域

### 不建“万能任务后台”

手机 `/tasks` 已确认是聚合层，只从：

- CompetitionIdentity / lifecycle
- Workshop Runtime
- Course learning
- Benefit status
- Application status

推导下一步。

因此 PC 端不创建一份新的通用 `Task` 真相源。

如果以后确实存在独立运营任务，应先完成 D03 业务模型决策，再确定它与赛事任务、企业任务、权益任务和奖励模型的关系。

### 不把 `/me/subjects` 的旧主体管理直接搬进 PC

D08 的主体业务语义仍待确认。本文件中的 Organization 是 PC 运营主数据，不等价于旧手机“主体管理”功能。

### 不在本轮确定学力值经济模型

积分、成长分还是双对象仍属于 F04 / 产品决策，不让 PC 骨架提前锁死。

---

## 5. 写入责任

PC 管理端后续应该能明确每个对象的写入者：

| 类型 | 典型写入方 |
| --- | --- |
| 赛事、企业、资源、内容、规则 | 平台 / 赛事 / 资源运营 |
| 学生主档 | 学生本人 + 授权运营补充 |
| 报名、团队 | 学生 + 报名门户 |
| 学校审核 / 赛事身份 | 授权学校老师 / 赛事运营 |
| 投递 | 学生 + 外部招聘状态回流 |
| 学习 / 权益使用 | 业务运行状态 |
| 成绩 / 证书 | 赛事 / 课程可信签发方 |
| 工坊 Run | AI / Task Runtime |

后台页面设计必须围绕“谁能改、改什么、影响谁”，而不是单纯围绕数据库表做 CRUD。

---

## 6. 施工顺序建议

当前 `/admin/*` 只是可点击的数据责任骨架。后续不建议一次性做完整后台，优先顺序：

```text
P0 赛事中心
 + 主体与学校
 + 资源运营
 + 学生 / 赛事身份查询

P1 资产与可信凭证
 + 内容 / 活动

P2 创赛工坊配置台
```

报名门户继续独立演进，不为“后台统一”强行合并已有报名交互。

---

## 7. 验收底线

PC 管理端后续每新增一块真实管理能力，应至少回答：

1. 它管理的业务对象是什么；
2. 对象稳定 ID 是什么；
3. 谁是权威写入方；
4. 手机哪些页面 / 状态消费它；
5. 与其它实体通过什么关系连接；
6. 是否重复创建已有 session / identity / application / workshop truth source；
7. 删除 / 下架 / 赛事结束后，哪些事实必须长期保留。

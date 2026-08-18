# PC03｜Organization + 机会 + 内容运营｜独立复审

> 复审状态：**CHANGES REQUIRED**  
> 日期：2026-08-18  
> 复审基线：`dev` HEAD `d9b1709d2848d88b52ef8aadd95fdb2888e9e33d`  
> PC03 主要实现序列截至：`1d34a308e25347f04235b8e59d296f672e5817d7`  
> 范围：仅评审 PC03 业务契约、PC01 接入一致性、App consumer 一致性与 focused assertions；不在本轮评价整体 PC 视觉质量。

---

## 1. 总结

PC03 的业务方向基本正确：

- Organization 统一企业 / 学校 / 赛事组织方 / 合作机构；
- 沿用 Mobile `companyId` stable value 作为 `organizationId`；
- Opportunity 保持 App 内正式投递，不建设 Candidate CRM；
- 岗位圈选只使用可解释事实；
- 内容正式发布权留在核心产业学院运营；
- 未引入黑盒人才评分或企业招聘 SaaS。

但当前实现仍存在多处跨端 / 跨卡契约断裂，不能判定 PASS。

**最终结论：`CHANGES REQUIRED`。**

---

## 2. Finding 01｜P1｜Opportunity 编辑“保存”后返回详情即丢失

### 现象

`OpportunityEditor` 使用自己的局部 `saved` state。点击“保存编辑”只更新编辑页局部状态并展示成功提示；点击“返回机会详情”后，详情页重新挂载 `PC03Console`，再次从 `initialOpportunities` 初始化。

因此修改过的标题、地区、来源 Organization、类型、摘要不会在详情页体现。

### 原因

编辑页与详情页没有共享同一份 PC03 原型 Opportunity state；所谓“保存到 PC03 原型态”只存活于当前编辑组件生命周期。

### 影响

- 中保真“编辑”能力实际上不可验证；
- 页面给用户明确“已保存”反馈，但业务对象没有更新；
- 后续接真实 API 前无法验证正确的编辑 → 详情闭环。

### 当前测试缺口

`pc03.spec.ts` 只断言保存后的绿色提示文本，然后直接返回详情，没有断言详情页已经显示修改后的标题 / 地区，因此没有捕获该问题。

### 修复要求

至少在 PC 原型范围内让 Opportunity 列表 / 详情 / 编辑共享同一份状态；保存后返回详情必须看到修改结果。真实持久化仍可继续明确为“未来 API 接入”。

---

## 3. Finding 02｜P1｜PC Opportunity 丢失 App 已有 `skills` 字段

### 现状

Mobile `Opportunity` 已有并实际消费：

```text
id
 title
 companyId
 city
 mode
 summary
 skills[]
 status
```

App 机会卡会直接展示 `skills[]`。

PC03 的 `OpportunityRecord`、新建表单和编辑表单均没有 `skills`。

### 影响

如果 PC 是 Opportunity 的平台控制面，运营无法维护 App 当前正在展示的技能要求；后续替换 Mobile mock 时会出现字段缺失或继续依赖手机端 hardcode。

这违反 PC01 / PC03 的核心目标：**App 长期业务对象必须能回答“PC 从哪里维护”。**

### 修复要求

在 Opportunity 主数据、创建与编辑中补齐 `skills`，并保持和 Mobile 当前字段语义一致。首期不需要复杂技能字典，可使用简单 tags / token 输入原型。

---

## 4. Finding 03｜P1｜PC03 自建 Shell，绕开 PC01 全局控制面

### 现状

PC01 已固定：

- 7 个管理域的全局导航；
- 桌面侧栏 / 窄屏导航；
- Role；
- Module Permission；
- Data Scope；
- 统一控制面 Shell。

PC03 却新增独立 `Pc03Shell`，只保留：

```text
Organization
机会与投递
内容运营
```

`/admin/organizations`、`/admin/opportunities/*`、`/admin/content` 直接进入该独立 Shell，因此会离开 PC01 的全局导航和 OperatorContext。

### 影响

- PC 管理端从一个统一产品变成“模块各自有一套壳”；
- 用户进入 PC03 后看不到其它核心管理域；
- Role / Module Permission / Data Scope 上下文消失；
- 与 PC01 已冻结的控制面 Pattern 不一致。

这不是单纯视觉问题，而是 PC01 → PC03 的集成契约被绕开。

### 修复要求

PC03 应复用 PC01 全局 Shell / 导航 / OperatorContext，只提供域内内容与必要的二级导航；不要继续保留独立顶层控制面。

---

## 5. Finding 04｜P1｜内容定向 Scope 没有稳定引用主体

### 现状

PC01 明确要求跨域关系使用 stable business ID，不使用中文标题作为关联键。

PC03 内容定向却把 `scopeValue` 设计为自由文本：

- 赛事示例：`sanchuang-16`（stable id，正确）；
- 学校示例：`广州示范高校`（展示名，不是 `organizationId`）；
- 新建内容时赛事 / 学校 / 地区全部共用一个自由文本输入框。

### 影响

- 学校改名后内容定向关系无法稳定追踪；
- 用户可以输入不存在的赛事 / 学校；
- 无法可靠实现 `Content → Competition / Organization` 跨域关系；
- 与 PC01 stable ID 规则明显不一致。

### 修复要求

- `赛事` Scope：选择 `competitionId`；
- `学校` Scope：选择学校 `organizationId`；
- `地区` Scope：首期可保留明确地区值，但不要与主体 ID 混成同一种自由文本语义；
- UI 可显示中文名称，但数据关系应保留 stable id。

---

## 6. Finding 05｜P2｜PC Application 可选 `failed`，当前 App consumer 无法回流该状态

### 现状

PC03 的 Application 下拉支持：

```text
submitted
statusUnknown
failed
```

全局 `state/model.ts` 虽然存在 `ApplicationStatus = ... | failed`，但当前真实 `PublicPlatform` 的 Application record 已收窄为：

```text
submitted | statusUnknown
```

`/applications` 页面也只表达“已投递 / 状态待回流”，没有 `failed` consumer。

### 影响

PC 可以写出 App 当前无法消费的状态，和 PC03 自己声明的“PC 运营维护 → App 回流”不一致。

### 修复要求

首期最简单的处理：PC03 只允许当前 App 真正消费的 `submitted / statusUnknown`。如果后续确实要增加其它进展状态，应由产品决策后同时扩展 App 与 PC，不要 PC 单边先造状态。

---

## 7. Finding 06｜P2｜数据来源标签没有完全遵循 PC01 五类来源

PC01 已固定来源语义：

```text
平台配置
API 同步
文件导入
人工修正
Runtime
```

PC03 Organization 当前使用自由字符串，例如：

```text
平台配置 + 可信数据源
API 同步 / 平台配置
```

其中“可信数据源”不是 PC01 已定义来源类型。

如果一个对象存在多来源，应展示多个 canonical source tags，而不是重新拼一套自由文案来源类型。

---

## 8. 已确认通过的部分

以下部分本轮未发现需要推翻的业务方向：

1. Mobile `companyId` → PC `organizationId` 沿用 stable value；
2. Organization 没有与 Mobile D08 `/me/subjects` 混用；
3. Opportunity 没有建立 Candidate CRM；
4. 正式投递仍发生在 App，Application 语义没有被改成候选人档案；
5. 岗位圈选只使用学校、专业、地区、赛事经历、课程完成、证书、比赛成绩等可解释事实；
6. 内容正式发布权属于核心产业学院运营；
7. 内容定向范围没有扩成复杂人群标签系统；
8. Opportunity stable id 在编辑页保持只读；
9. 新建 Opportunity / Content 已避免 duplicate id。

---

## 9. focused assertions 复审

现有 `apps/pc/tests/pc03.spec.ts` 覆盖方向基本正确，但仍不足以支撑 PASS。

复修后至少补以下断言：

1. 编辑 Opportunity → 保存 → 返回详情 → 修改后的字段仍存在；
2. Opportunity 新建 / 编辑包含 `skills`，且详情能看到；
3. 进入 PC03 三个模块后 PC01 全局导航和 Role / Module / Data Scope 仍存在；
4. 内容学校 Scope 内部使用 `organizationId`，赛事 Scope 使用 `competitionId`；
5. PC Application 不出现 App 当前无法消费的状态；
6. 来源只使用 PC01 canonical 五类标签，可多选但不新增自由类型。

---

## 10. 最终判定

```text
PC03 = CHANGES REQUIRED
```

主要原因不是业务方向错误，而是**PC03 已经做出的业务页面没有完全遵守 PC01 底座契约，并且有两处直接的 App 数据不一致：Opportunity `skills` 缺失、Application 状态超出当前 App consumer；同时 Opportunity 编辑闭环并未真实成立。**

修复范围可以保持在 PC03，不需要推翻 Organization / 机会 / 内容三块产品方向。

# T059｜「我的」页面 Dashboard 化重构

**类型：原型设计 / 施工卡**  
**状态：REVIEW**  
**优先级：P1**  
**范围：Mobile `/me` 视觉与信息架构重构**  
**前置：T014、T055–T058**

## 2026-09-02 产品纠正

上一版 T059 被人工评审否决，原因不是视觉微调，而是产品事实错误：参考页面中的「阅读中心」被错误地当成核心学院功能实现。

**核心学院当前没有阅读功能。`/me` 禁止出现阅读中心、阅读功能接入中、假入口或任何阅读统计。**

本轮重新施工遵守两条硬约束：

1. 可以有较高设计自由度，但只能组织仓库中真实存在的业务能力；
2. 原 `/me` 已有入口一个都不能少，但“不能少”不等于全部做成同权重宫格，允许通过核心卡、宫格、动态卡和低权重直达链接分层承接。

上一版 `PASS` 结论已经作废。当前实现完成后只推进到 `REVIEW`，等待人工视觉验收，不由施工 Agent 再次自行标记 `PASS`。

## 当前结构

```text
个人身份区
→ 长期资产核心卡
→ 我的学习四宫格
→ 学习排行榜 Banner
→ 更多服务 4×2
→ 协议 / 隐私 / 授权低权重直达
→ 退出登录
```

页面参考成熟个人中心的布局节奏，但不复制参考图功能，也不复制黑金 / 橙色视觉。所有颜色、圆角、边框、文字与触摸尺寸继续使用核心学院现有 Com Design / design token。

## 1. 个人身份区

- 已移除独立 `PageHeader title="我的"`。
- 头像、姓名、学校 / 专业为主要身份信息；已有校园大使真实徽章继续显示。
- 学历、城市、参赛经历压缩为低权重辅助信息，不再堆大量标签。
- 身份区直接进入 `/me/profile`。
- 右上保留「扫一扫」与「设置」。
- 扫码模拟器原有学校招募码、团队招募码、推广码、福利兑换码链路全部保留。

## 2. 核心卡：长期资产

参考图中第一张强视觉业务卡只作为**版式槽位参考**，当前由核心学院真实 `/assets` 承接。

- 主入口：长期资产 → `/assets`。
- 卡内摘要直接读取 `useLongTermAssets()`：
  - 课程记录；
  - 已完成学习；
  - 证书数量；
  - 赛事成绩数量。
- 数值不硬编码、不伪造。
- 视觉使用 `primary → primary-pressed`、`on-primary`、`primary-container` 等项目 token。
- 页面中不再存在任何阅读相关 UI。

## 3. 我的学习

4 列快捷入口均对应真实 route：

- 我的课程 → `/courses/center`
- 学习记录 → `/assets/learning`
- 我的证书 → `/assets/certificates`
- 赛事成绩 → `/assets/results`

## 4. 学习排行榜

- Banner → `/courses/leaderboard`。
- 只承担入口，不在 `/me` 复制榜单详情或伪造当前排名。
- 层级低于长期资产核心卡。

## 5. 更多服务与入口完整性合同

### 主要服务 4×2

- 我的卡券 → `/benefits/wallet`
- 消息通知 → `/me/notifications`
- 比赛团队 → `/me/teams`
- 我的简历 → `/me/resume`
- 账号绑定 → `/me/accounts`
- 帮助客服 → `/support`
- 设置中心 → `/me/settings`
- 关于我们 → `/about`

### 动态校园推广团队

当前账号存在真实校园推广团队时，继续显示：

- 我的校园推广团队 / 往期推广记录 → `/ambassadors/team/:teamId?accountId=...`

动态入口不占固定 4×2 格位，避免不同角色造成布局错位。

### 低频但必须直达

以下能力在 `/me` 页面后段以低权重链接保留：

- 用户协议 → `/legal/user-agreement`
- 隐私政策 → `/legal/privacy`
- 授权管理 → `/me/authorization`

### 其它原入口承接

- 长期资产由核心卡承接，不重复占服务宫格。
- 设置既有右上快捷入口，也保留服务宫格入口。
- 个人资料由顶部身份区承接。
- 退出登录位于页面底部并保留二次确认。

## 6. 视觉要求

- mobile-first、compact-first、flat-first。
- 页面背景 / Surface / 主色 / 文本 / Border / Radius / Touch target 全部来自项目 token。
- 图标强调只使用项目现有 semantic token，不从外部参考图吸色。
- 普通模块不堆厚重阴影；靠留白、单层 Surface、图标节奏和字号建立层级。
- 参考图只提供：无顶部标题栏、身份区、强弱模块顺序、4 列快捷入口、低频功能后置等布局启发。

## 禁止

- 禁止再次出现「阅读中心」或任何阅读占位。
- 禁止把不存在的功能写到 UI 里解释“尚未接入”。
- 禁止为了凑 8 格删除真实入口，或为了“一个不能少”把全部低频入口做成同权重宫格。
- 禁止伪造学习、资产、角色、排名数据。
- 禁止修改 T055–T058 排行榜业务规则。
- 禁止改变扫码、账号、团队、长期资产等既有业务语义。

## 本轮实现提交

- `d883e923bba37c5d100c41f7f378a99dc7b63cc7` — 撤销错误 PASS，记录“无阅读功能”产品纠正
- `c669fd75d272f093af2d79b612565ef5d9ba4033` — 同步修订 T014 设计基线
- `fec9aef02ccd0fc22f6673b70284af2a3c189caf` — `/me` 按真实产品能力重新设计
- `6dd997e9c4efc8a5e1af0729b6135317850cbc00` — T059 专项回归改为验证真实入口与无阅读功能

## 自动验证证据

Deploy Mobile run `33631084779`：

- `Type-check and build mobile preview` = **success**
- `Run F00 cross-app browser regression (soft gate)` = **success**
- `Deploy mobile` = **success**

Prototype Quality Gate run `33631084781`：

- `Verify mobile routes, types and build` = **success**
- `Run learning leaderboard regressions (soft gate)` = **success**
- `Run mobile browser regressions (soft gate)` = **success**，其中包含 `tests/t059-my-page-dashboard.spec.ts`
- `Run real Mobile-PC-Mobile handoff (soft gate)` = **success**

T059 专项回归已验证：

- 页面不存在阅读功能 / 阅读占位；
- 个人资料、扫一扫、设置可达；
- 长期资产主卡进入 `/assets`；
- 4 个学习入口正确；
- 排行榜入口正确；
- 8 个主要服务入口正确；
- 用户协议、隐私政策、授权管理仍直接可达；
- 动态校园推广团队入口保留；
- 退出登录二次确认保留；
- 375 / 390 / 430px 均无横向滚动；
- 扫码模拟器仍可达。

## 专项验收

- [x] `/me` 无独立「我的」标题栏。
- [x] 页面不存在「阅读中心」及阅读占位代码。
- [x] 个人资料、扫一扫、设置均保留。
- [x] 长期资产核心卡进入 `/assets`，摘要来自真实 store。
- [x] 4 个学习入口均对应真实 route。
- [x] 排行榜进入 `/courses/leaderboard`。
- [x] 主要服务 8 个入口保留。
- [x] 动态校园推广团队入口继续按真实状态出现。
- [x] 用户协议、隐私政策、授权管理仍可从 `/me` 直接到达。
- [x] 退出登录二次确认保留。
- [x] mobile route audit / typecheck / build 通过。
- [x] dev mobile preview 已部署。
- [x] T059 所在 mobile browser regression suite 通过。
- [x] 375 / 390 / 430px 专项回归通过。
- [ ] 人工视觉验收。

## 被否决实现记录

2026-09-02 第一版曾错误加入「阅读中心」并将全部低频入口摊平成 12 格宫格。用户人工评审明确否决，相关 `PASS` 不再有效。历史提交保留用于追溯，不作为当前设计依据。

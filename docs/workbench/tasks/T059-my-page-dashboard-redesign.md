# T059｜「我的」页面 Dashboard 化重构

**类型：原型设计 / 施工卡**  
**状态：PASS**  
**优先级：P1**  
**范围：Mobile `/me` 视觉与信息架构重构**  
**前置：T014、T055–T058 已有学习排行榜能力**

## 背景

旧 `/me` 以「顶部资料大卡 + 服务入口纵向列表 + 关于 / 账号列表」为主，更像设置页而不是学生个人中心。

2026-09-02 确认新方向：参考成熟个人中心的**布局结构、信息节奏与分组方式**，把 `/me` 改成个人中心 Dashboard；只借鉴布局，不复制参考图的黑金 / 橙色视觉。颜色、圆角、文字、边框、状态和触摸尺寸全部使用核心学院现有 Com Design / design token。

### 最新入口约束

2026-09-02 施工前再次确认：**允许更高设计自由度，但原有入口一个都不能少。**

因此本卡不再把协议 / 隐私 / 关于等低频入口从 `/me` 隐藏到二级页；它们可以降视觉权重、放在页面后段，但必须继续可直接到达。该约束优先于本卡早期“低频内容可由设置 / 关于承接”的建议。

## 目标

```text
个人身份区
→ 核心业务大卡（阅读中心）
→ 我的学习四宫格
→ 学习排行榜 Banner
→ 更多服务宫格
→ 低频账号操作
```

页面更像学生自己的长期个人中心，同时不丢失旧 `/me` 的任何可达能力。

## 实现

主要实现：

- `apps/mobile/src/features/ambassador/AmbassadorAwareMyPage.tsx`
- `apps/mobile/tests/t059-my-page-dashboard.spec.ts`
- `.github/workflows/r-final-check.yml` 已把 T059 专项回归加入 mobile browser regression suite。

## 1. 顶部个人身份区

- `/me` 移除独立 `PageHeader title="我的"`。
- 头像、姓名、学校 / 专业组成紧凑横向身份区。
- 保留手机号已验证状态与真实校园大使徽章。
- 无头像字段时使用现有首字 fallback，不伪造真人头像。
- 身份区直接进入 `/me/profile`，不再额外占一行“编辑基础资料”。
- 扫一扫与设置位于右上轻操作区；扫一扫完整保留原有学校招募码、团队招募码、推广码、福利兑换码模拟链路。

## 2. 阅读中心核心卡

- 阅读中心作为身份区后的首个强视觉卡。
- 使用 `primary → primary-pressed` 与 `on-primary / surface / text-brand` 等现有 token。
- 不复制参考图黑色、橙金、黄色，不新增硬编码主题色。
- 当前 `dev` 尚无正式阅读中心 route，因此“进入阅读”明确显示为**功能接入中**并 disabled。
- 不拿 `/stories`、课程或其它页面冒充阅读中心。
- 不伪造连续阅读、已读本数、时长、书架数量等统计。

## 3. 我的学习四宫格

全部映射当前真实 route：

- 我的课程 → `/courses/center`
- 学习记录 → `/assets/learning`
- 我的证书 → `/assets/certificates`
- 赛事成绩 → `/assets/results`

不凭空新增“我的考试”等不存在的独立业务。

## 4. 学习排行榜 Banner

- 入口 → `/courses/leaderboard`
- 沿用 T055–T058 已确认榜单业务，不在 `/me` 复制排行榜详情。
- Banner 使用项目 token，不伪造当前用户排名数字。

## 5. 更多服务：入口完整性合同

### 原有常驻入口全部保留

- 长期资产 → `/assets`
- 我的卡券 → `/benefits/wallet`
- 消息通知 → `/me/notifications`
- 比赛团队 → `/me/teams`
- 账号绑定 → `/me/accounts`
- 设置中心 → `/me/settings`
- 帮助客服 → `/support`
- 用户协议 → `/legal/user-agreement`
- 隐私政策 → `/legal/privacy`
- 关于我们 → `/about`

### 原有动态入口保留

- 当前存在校园推广团队时，继续显示：
  - 我的校园推广团队 / 往期推广记录 → `/ambassadors/team/:teamId?accountId=...`

### 本轮补充的真实入口

- 我的简历 → `/me/resume`
- 授权管理 → `/me/authorization`

上述入口采用 4 列宫格 + 动态团队卡组织。低频入口可以排在页面后段，但**不得因为版式需要删除或隐藏**。

## 6. 退出登录

- 退出登录继续存在于 `/me` 页面底部低权重区域。
- 保留原二次确认与账号生命周期语义。

## 7. Token 与视觉纪律

必须复用项目现有 semantic token：

- `background / surface / surface-subtle / surface-pressed`
- `primary / primary-pressed / primary-container / on-primary`
- `text-primary / text-secondary / text-tertiary / text-brand`
- `border-subtle`
- `rounded-container / rounded-control / rounded-full`
- mobile touch target token

禁止：

- 从参考图吸色；
- 新增另一套页面主题色；
- 用大面积黑底、厚重阴影或玻璃拟态制造“高级感”；
- 为视觉填充伪造学习、阅读、角色数据；
- 为了凑整齐宫格删除已有入口。

## 最低可演示路径

```text
/me
→ 个人资料 → /me/profile
→ 设置 → /me/settings
→ 我的课程 → /courses/center
→ 学习记录 → /assets/learning
→ 我的证书 → /assets/certificates
→ 赛事成绩 → /assets/results
→ 学习排行榜 → /courses/leaderboard
→ 长期资产 / 卡券 / 消息 / 比赛团队 / 简历 / 账号绑定 / 客服
→ 设置 / 授权 / 用户协议 / 隐私政策 / 关于
→ 退出登录二次确认
```

阅读中心按当前 route 边界验收：显示入口设计，但不允许假链接。

## 验收

- [x] `/me` 已移除独立 PageHeader，身份区首屏不局促。
- [x] 头像、姓名、学校 / 专业、已有角色徽章层级清楚。
- [x] 扫一扫与设置位于右上轻量操作区，原扫码模拟链路保留。
- [x] 阅读中心成为首个核心业务大卡，且未复制参考图颜色。
- [x] 阅读中心没有正式 route 时未制造假链接 / 假阅读数据。
- [x] 我的学习使用四宫格，并全部映射真实已有能力。
- [x] 学习排行榜 Banner 正确进入 `/courses/leaderboard`。
- [x] 更多服务从纵向列表重构为宫格。
- [x] 原有常驻、动态、协议 / 隐私 / 关于入口均未丢失。
- [x] 退出登录能力保留且降级处理。
- [x] 页面主题颜色、圆角、文字、边框、触摸尺寸来自项目 token。
- [x] 未新增伪造业务状态、假角色或无意义 route。
- [x] 375px / 390px / 430px 横向溢出专项回归已覆盖并通过。
- [x] mobile type-check / build 通过。
- [x] T059 专项 browser 回归随 mobile browser regression suite 通过。
- [x] dev mobile preview 构建与 Cloudflare Pages 部署通过。

## 施工提交

- `76c35371d3c2a2adb25a4ee738a081b50f974b92` — Dashboard 主实现
- `9a11c8990f8ea75174857e55752691ada689cfbb` — T059 browser regression 初版
- `db9296c33709936729ae16f9399525b8d8f4f8cd` — 回归 selector 加固
- `de249ced554efde91c6578bbc68a5da04fb75138` — Quality Gate 纳入 T059 regression
- `0749dfcf0db81032d30c3e6dfe0d6793590fee60` — 阅读卡 token / 文案收口
- `f7a38cb7301119da0dc03f9cb1373dae0f91e3ae` — 退出确认回归断言修正

## 验收证据

Quality Gate run `33618152527`：

- `Verify mobile routes, types and build` = **success**
- `Run learning leaderboard regressions (soft gate)` = **success**
- `Run mobile browser regressions (soft gate)` = **success**，其中已包含 `tests/t059-my-page-dashboard.spec.ts`

Deploy Mobile run `33618152565`：

- `Type-check and build mobile preview` = **success**
- `Run F00 cross-app browser regression (soft gate)` = **success**
- `Deploy mobile` = **success**

T059 专项回归覆盖：

- 个人资料、扫一扫、设置入口；
- 阅读中心无正式 route 时 disabled；
- 4 个学习入口；
- 排行榜入口；
- 12 个常驻“更多服务”入口；
- 动态校园推广团队入口；
- 退出登录二次确认；
- 375 / 390 / 430 三档宽度无横向滚动；
- 扫码模拟器仍可到达。

**结论：T059 PASS。**

## 不在本卡范围

- 新建完整阅读器 / 书架业务；
- 新建考试中心；
- 重做课程、证书、资产、团队等二级页；
- 改动排行榜 T055–T058 已确认业务规则；
- 修改账号、主体、第三方绑定等未决业务模型。

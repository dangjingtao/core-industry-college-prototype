# T037｜智能客服：知识库分流 + AI 工单兜底｜实现记录

> 状态：已完成（中保真原型，手机端 + PC 端）
> 日期：2026-08-25
> 台账卡片：`docs/workbench/00-work-ledger.md` 中的 T037

## 设计文档

- 手机端会话与工单：`docs/product/16-customer-service-conversation-and-ticket.md`
- PC 端工单工作台：`docs/product/17-T037-pc-ticket-workbench.md`
- 相关缺口：`docs/product/02-open-decisions-and-backlog.md` GAP-10（人工请求不得成为死胡同）

## 代码位置

手机端：

- `apps/mobile/src/features/platform-support/SupportPages.tsx`：`SupportProvider`（工单唯一真相源）、`SupportHomePage`、`SupportChatPage`、通知中心联动
- `apps/mobile/src/features/platform-support/SupportTicketPages.tsx`：`SupportTicketsPage`、`SupportTicketDetailPage`
- `apps/mobile/src/features/platform-support/CustomerServiceBubble.tsx`：浮窗未读联动
- `apps/mobile/src/app/App.tsx`、`apps/mobile/src/routes/registry.ts`：路由与语义登记

PC 端：

- `apps/pc/src/admin/T037SupportTicketConsole.tsx`：客服工单工作台（列表 + 详情 + 回复 + 标记处理中 + 关闭）
- `apps/pc/src/App.tsx`、`apps/pc/src/admin/AdminControlPlaneShell.tsx`：路由与侧边导航入口

## 动线实现

台账定义的范围链逐段落地：

```text
客服浮窗            → CustomerServiceBubble（有未读回复直达工单列表，否则进会话）
知识库回答          → SupportChatPage 知识库问答，首条消息即声明「智能客服（AI）」身份
仍未解决            → 「仍未解决？转人工」提示条
选择赛道 / 问题类型 → 升级面板 step=context：赛事 → 赛道（含「不确定 / 无赛道」）→ 问题类型
在线人工 或 工单     → step=channel：企业微信 / 人工排队 / 提交工单
工单状态            → 待处理 / 处理中 / 已回复 / 已结束
人工回复            → PC 端工作台回复，写入手机端工单记录 + 个人中心消息
用户确认解决        → 工单详情页「问题已解决」
```

## 关键实现

- **状态归属**：工单只在 `SupportProvider` 一处维护（`tickets`、`unreadTicketCount`、`createTicket`、`markTicketRead`、`addTicketSupplement`、`confirmTicketResolved`），不新增第二份 session / identities。
- **不另建通知系统**：工单事件由 `SupportProvider` 内部 `pushNotice` 写入既有 `notifications` 列表，红点复用个人中心消息，符合台账约束第 3 条。
- **AI 身份不伪装**：会话欢迎语明示 AI 身份；工单记录区分 `user` / `agent`（人工客服）/ `ai`（智能客服），PC 端 `roleLabel()` 同样保留标注。
- **GAP-10 无死胡同**：人工排队步骤展示排队快照（等待人数 + 预计时长），并同时给出三条逃生出口——继续等待、转企业微信、改为提交工单，不存在只显示「已请求人工」后无法推进的终态。
- **赛道兜底**：平台无一等公民赛道模型，本卡在会话内自带 `supportTracks` 选项并允许「不确定 / 无赛道」，不为客服硬造赛道主数据。
- **工单入口收敛**：帮助中心新增「我的客服工单」卡片（带未读条数与红点），与浮窗未读跳转构成两处入口；原「客服消息」页升级为工单列表。

## 路由变更

手机端（`routes/registry.ts` 语义登记同步更新）：

- `support.chat` `/support/chat` 状态扩展为 `ai / unresolved / contextCollect / humanRequested / externalWeCom / ticketDraft`
- 新增 `support.tickets` `/support/tickets`
- 新增 `support.ticketDetail` `/support/tickets/:ticketId`

PC 端：

- 新增 `/admin/support`、`/admin/support/:ticketId`（置于 `/admin/*` 兜底之前），侧边导航新增「客服工单」

## 清理

删除两个无引用死文件（已 grep 确认零 importer）：

- `apps/mobile/src/features/platform-support/CustomerServiceMessagesPage.tsx`（被 `SupportTicketsPage` 取代）
- `apps/mobile/src/features/support/SupportPages.tsx`（重复空桩）

## 边界（不做）

真实 AI 客服系统、SLA 考核、客服绩效统计、多级客服组织、知识库后台管理、真实企业微信打通（保留真实产品出口，模拟 handoff）。

## 验收

- [x] `npm run typecheck`（mobile + pc，`tsc -b` 全绿）
- [x] `npm run build`（mobile 1870 modules / pc 1862 modules，均构建成功）
- [x] `npm run verify:mobile`：Registry routes 90 / App route declarations 100 / Missing 0 / Route audit PASS / explicit 404 保留
- [ ] Playwright 浏览器回归（当前环境缺少浏览器运行时，未新增 T037 spec，交由 dev CI 承接）

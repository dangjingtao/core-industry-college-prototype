# F00｜手机端 ↔ 响应式报名门户 Handoff 协议

> 对应工作台账：`docs/workbench/00-work-ledger.md` F00  
> 状态：已施工，待独立评审 / 浏览器总回归

## 1. 边界

F00 不复制 PC 报名 UI，也不新建第二份赛事身份 Store。

- PC `/registration-portal/*`：继续拥有队长 / 队员、账号注册、答题、团队、成员、审核、承诺书、完成等复杂报名流程。
- Mobile：只负责进入门户、接收回流状态，并写入已有 Public Platform `identities[]`。
- `@core/shared`：只维护 handoff / callback URL 协议，不维护业务状态。

后续真实后台接入时，应优先替换协议桥接层，而不是重画两端报名界面。

## 2. Mobile → PC

Mobile 从 `/competitions/:competitionId/registration` 生成：

```text
{VITE_REGISTRATION_PORTAL_URL}/registration-portal/start
  ?competitionId=<competitionId>
  &returnTo=<absolute mobile registration url>
  &source=mobile-app
  &accountContext=current-student-prototype-session
```

环境地址由 `apps/mobile/.env.*` 管理：

- development → `https://dev.core-industry-college-pc.pages.dev`
- production → `https://core-industry-college-pc.pages.dev`
- local example → `http://localhost:5174`

## 3. PC → Mobile

PC 入口捕获 handoff 上下文并在当前浏览器 session 内保留，页面跳转不丢失 `competitionId` / `returnTo`。

从 Mobile 进入时，PC 始终显示明确的：

```text
返回 App / 赛事
```

返回 URL：

```text
<returnTo>
  ?handoff=registration-portal
  &registrationCompetitionId=<competitionId>
  &registrationStatus=draft|pending|rejected|approved
  &registrationSource=pc-registration-portal
```

原型映射：

- 队长提交学校审核 → `pending`
- 队员完成注册、等待队长绑定 → `pending`
- 学校审核驳回 → `rejected`
- 学校审核通过 / 报名完成 → `approved`
- 尚未形成报名事实 → `draft`

PC sessionStorage 只保存回流所需的轻量状态与短期 handoff 上下文，不是长期赛事身份真相源。

## 4. Mobile callback

Mobile callback 只更新已有 Public Platform `identities[]`：

- `pending` → 当前赛事 `identityStatus=pending`
- `rejected` → 当前赛事 `identityStatus=rejected`
- `approved` → 当前赛事 `identityStatus=active`，并进入赛事进行期 runtime
- `draft` → 不创建赛事身份

处理完成后清理 callback query，避免刷新重复消费。

## 5. 回归覆盖

Mobile mother flow B 已改为检查：

1. handoff URL 确实包含 `competitionId` / `returnTo` / source / account context；
2. callback 可依次模拟 `pending → rejected → pending → approved`；
3. approved 后 workspace 读取同一个 `identities[]`。

PC Playwright 增加 Mobile handoff 场景：队员注册完成后点击“返回 App / 赛事”，验证 callback 保留原 `competitionId` 且返回 `pending`。

验证命令：

```bash
npm run verify:mobile
npm run verify:pc
npm run verify:browser:mobile
npm run verify:browser:pc
```

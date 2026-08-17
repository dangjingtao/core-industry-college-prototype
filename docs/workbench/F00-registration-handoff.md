# F00｜手机端 ↔ 响应式报名门户 Handoff 协议

> 对应工作台账：`docs/workbench/00-work-ledger.md` F00  
> 状态：已施工；首轮 `CHANGES REQUIRED` 的窄修已完成，待独立复审

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

### 离开 Mobile 前的一次性账号快照

真实 `window.location.assign(...)` 会卸载 Mobile React 应用，因此 F00 窄修增加了 Mobile-origin `sessionStorage` handoff snapshot：

```text
session
identities[]
identityMode
```

实现文件：

```text
apps/mobile/src/features/public-platform/registrationHandoffSnapshot.ts
```

约束：

- 只在真正打开报名门户前写入；
- 只存在于当前 Mobile origin / browser session；
- 带版本与短 TTL；
- 不是新的长期账号 Store；
- 无法写入 snapshot 时不执行跨端跳转，避免静默丢失账号状态。

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

Mobile 收到有效 callback 后按以下顺序处理：

1. 先读取离开前的 Mobile account snapshot；
2. 通过 Public Platform 已有 API 恢复 `session / identityMode / identities[]`；
3. 再消费本次报名 callback；
4. callback 仍只更新已有 Public Platform `identities[]`；
5. 完成后立即清理一次性 snapshot 与 callback query。

callback 映射保持首轮评审已通过的结构，不做返工：

- `pending` → 当前赛事 `identityStatus=pending`
- `rejected` → 当前赛事 `identityStatus=rejected`
- `approved` → 当前赛事 `identityStatus=active`，并进入赛事进行期 runtime
- `draft` → 不创建赛事身份

因此“无赛事身份 → PC → 返回 pending”不会再因为 Mobile Provider 重建而让默认 multi seed 的其它赛事身份复活。

## 5. 回归覆盖

### 单端已有回归

Mobile mother flow B 检查：

1. handoff URL 包含 `competitionId` / `returnTo` / source / account context；
2. callback 可依次模拟 `pending → rejected → pending → approved`；
3. approved 后 workspace 读取同一个 `identities[]`。

PC Playwright 检查 Mobile handoff 场景：队员注册完成后点击“返回 App / 赛事”，callback 保留原 `competitionId` 且返回 `pending`。

### F00 focused 双服务真实浏览器回归

新增：

```text
apps/mobile/playwright.handoff.config.ts
apps/mobile/tests/registration-handoff-cross-app.spec.ts
```

该配置同时启动：

```text
Mobile http://127.0.0.1:5173
PC     http://127.0.0.1:5174
```

真实浏览器路径：

```text
Mobile 多赛事 seed
→ 切换为无赛事身份
→ sanchuang-16 报名
→ 浏览器真实导航到 PC 5174
→ 完成队员注册 + 答题
→ 点击“返回 App / 赛事”
→ 浏览器真实回到 Mobile 5173
→ sanchuang-16 = pending
→ callback query 被清理
→ handoff snapshot 被清理
→ 进入“我的赛事”
→ innovation-cup-2026 / sanchuang-15 不会凭默认 seed 复活
```

GitHub Actions `Deploy Mobile to Cloudflare Pages` run `32017114188`：

- `Type-check and build mobile preview`：success；
- `Install Playwright Chromium`：success；
- `Run F00 cross-app browser regression`：success；
- 日志：`1 passed (6.1s)`；
- `Deploy mobile`：success。

对应修复提交：

```text
38245d9d6c20f7395ae81927a93637baa9e8cd46
```

验证命令：

```bash
npm run verify:mobile
npm run verify:pc
npm run verify:browser:mobile
npm run verify:browser:pc
npm run verify:browser:handoff --workspace @core/mobile
```

本线程不自行把 F00 标记为 `PASS`；首轮评审结论仍由 `docs/workbench/F00-review.md` 保留，等待独立复审确认。

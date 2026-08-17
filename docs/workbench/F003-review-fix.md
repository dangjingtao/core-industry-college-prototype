# F003｜CHANGES REQUIRED 窄修记录

> 基线：独立评审提交 `706682f67e6e8aef8d9b7dfe5e1a8e1325707ac1`  
> 修复分支：`workbench/f003-fix`  
> 修复 PR：`#4`  
> 合并提交：`5ff0e2203a197812c3111e431850350f48d7903a`  
> 状态：修复完成，等待快速复审；施工线程不自行标记 `PASS`

## 1. TeamChangeRequest 会话级状态

针对评审 BLOCKER-01，仅修团队变更申请状态，不改变团队成员真相。

- 在既有 `WorkshopRuntimeProvider` 增加独立 `TeamChangeRequest` 会话级状态，按 `competitionId` 保存；
- 字段包含：`competitionId / type / memberName / reason / materialName / status / submittedAt`；
- 提交时写入 `status: pending`；
- `CompetitionTeamPage` 重新 mount 后从 provider 读取 pending request，因此离开 team 再返回不会丢失；
- `workspaceData.team.members` 完全不由申请提交逻辑修改，审核前继续作为系统团队事实；
- 本轮不实现真实后台审批，也不增加 localStorage / 跨刷新持久化。

相关提交：

- `e7f1f40f1f82752436fa8c362b3f616e81bc3293`
- `41ef53bcf6db78bf480e40bd944d90dcb88cc718`

## 2. 公众号 handoff 文案

针对评审 Minor Finding：

- 保留当前可验证的 `https://mp.weixin.qq.com/` 公众号入口；
- CTA 从“阅读全文（公众号原文）”改为“打开公众号入口”；
- 明确显示“具体文章原文链接待运营内容配置”，不再把公众号根域名描述成具体原文。

相关提交：`f6c69b52f685741f935836fa6d8db4274c864031`。

## 3. Focused Chromium 回归

`apps/mobile/tests/f003.spec.ts` 已补评审要求的 route revisit：

```text
提交团队变更
→ pending
→ 返回赛事 workspace
→ 再进入 team
→ pending request 仍存在
→ 陈语仍在成员列表
```

同时保持原有 focused 覆盖：logout、结构化教育经历 + `returnTo`、资料真实 download、公众号 / 企微 / 课程分享 handoff。

测试提交：`0195ef04e541791d4f7c9d3f5cec42bd76b1bf38`。

### 真实 GitHub Actions 证据

为本次复审临时创建 focused workflow，执行后已从分支删除，不作为长期 CI 配置保留。

- Run：`32021118328`
- Job：`95360816998`（`F003 Chromium`）
- `npm ci`：success
- `npm run build:development --workspace @core/mobile`：success，Vite 输出 `built in 2.60s`
- Chromium 安装：success
- `playwright test tests/f003.spec.ts`：**5 passed (2.9s)**

五条真实通过用例：

1. logout requires confirmation and returns to public home；
2. resume keeps structured education and opportunity returnTo；
3. competition-period team change persists pending without mutating members；
4. resource local save creates a browser download；
5. external content support and course sharing expose real handoffs。

一次性 workflow 删除提交：`22112ef9c51cbb1007037b2baf3669719765b222`。

## 4. 本轮明确未改

按评审要求，不返工：

- logout 架构；
- StudentProfile / resume 字段归属；
- `returnTo`；
- trusted facts 只读边界；
- 报名期 PC portal 团队维护；
- 赛事资料 Blob download / Web Share / clipboard fallback；
- 企业微信福利官渠道；
- 课程分享；
- F02 证书 / 成绩；
- F04 决策项。

## 5. 快速复审范围

仅需复核独立评审指定的四点：

1. pending request 在 route revisit 后仍存在；
2. pending request 不修改 team member truth；
3. 公众号入口文案不再声称是具体原文；
4. focused Chromium 已获得真实 `5 passed (2.9s)` 证据。

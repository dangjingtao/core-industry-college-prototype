# F003｜账号 / 简历 / 团队 / 外部 handoff｜独立评审

> 初审日期：2026-08-17  
> 复审日期：2026-08-17  
> 初始实现：PR #1 / merge commit `677878362658359cbf740c9a1021fcfcf1cbe591`  
> 阻断修复：PR #4 / merge commit `5ff0e2203a197812c3111e431850350f48d7903a`  
> Focused browser：run `32021118328` / job `95360816998`  
> 合并后 Mobile CI：run `32021340204`  
> 最终结论：**PASS**

---

## 1. 复审结论

首轮评审只留下三个需要收口的点：

1. 团队变更申请提交后只存在 `CompetitionTeamPage` 组件本地 state，离开页面再返回会丢失；
2. 公众号根域名被按钮文案误称为“公众号原文”；
3. `apps/mobile/tests/f003.spec.ts` 虽已提交，但当时没有真实 Chromium PASS。

PR #4 已严格按该范围窄修，没有返工已通过的 logout、StudentProfile / resume、`returnTo`、可信事实只读、赛事资料下载、Web Share / clipboard、企微客服渠道、课程分享或 F02 可信凭证能力。

上述阻断现已全部关闭，F003 转为 **PASS**。

---

## 2. BLOCKER-01｜TeamChangeRequest 状态完整性：关闭

团队变更申请已从页面本地 `submitted` 状态提升为赛事会话级 `TeamChangeRequest`，存放在既有 `WorkshopRuntimeProvider`，按 `competitionId` 读取和提交。

申请字段包含：

- `competitionId`；
- `type`；
- `memberName`；
- `reason`；
- `materialName`；
- `status: pending`；
- `submittedAt`。

因此真实语义现在是：

```text
提交团队变更申请
→ 写入赛事会话级 pending request
→ 离开 team 页面
→ 返回赛事 workspace
→ 再进入 team
→ pending request 仍存在
```

同时申请状态与团队成员事实继续分离：

```text
TeamChangeRequest = 申请事实
workspaceData.team.members = 当前系统团队事实
```

提交申请不会修改 `workspaceData.team.members`；审核通过前，成员列表仍保持原值。

这满足首轮评审要求的“申请状态可持续，但审核前不篡改 team truth”。

> 本卡仍不要求真实后台审批，也不要求跨刷新 / localStorage 持久化；React provider 会话级状态足以满足当前中保真原型契约。

---

## 3. Minor Finding｜公众号 handoff 语义：关闭

CTA 已从：

```text
阅读全文（公众号原文）
```

改为：

```text
打开公众号入口
```

并明确显示：

> 具体文章原文链接待运营内容配置，不伪造不存在的文章 URL。

当前 `https://mp.weixin.qq.com/` 因此只表达公众号入口，不再被错误描述成具体文章原文。

该语义与现有原型能力一致。

---

## 4. BLOCKER-02｜真实 Browser 证据：关闭

Focused workflow：

- GitHub Actions run：`32021118328`；
- job：`95360816998`；
- job name：`F003 Chromium`；
- development build：success；
- Chromium install：success；
- focused F003 browser regression：success。

实际 Playwright 输出：

```text
Running 5 tests using 1 worker
5 passed (2.9s)
```

五条通过用例分别覆盖：

1. logout 二次确认并返回公共首页；
2. structured resume + opportunity `returnTo`；
3. 团队变更提交后 route revisit 仍为 pending，且成员未变化；
4. 赛事资料触发真实 browser download；
5. 公众号入口、人工客服和课程分享 handoff。

其中第 3 条正面覆盖了首轮 BLOCKER-01，不再只是当前页面内断言。

一次性 focused workflow 执行后删除是可接受的；正式测试文件 `apps/mobile/tests/f003.spec.ts` 保留。

---

## 5. 合并后回归

PR #4 已合并到 `dev`：

```text
5ff0e2203a197812c3111e431850350f48d7903a
```

合并后的 `Deploy Mobile to Cloudflare Pages` run `32021340204` checkout 的就是该 merge commit，并且：

- Type-check + Vite development build：success；
- Playwright Chromium install：success；
- 现有 F00 cross-app regression：success；
- Cloudflare Pages deploy：success。

因此 F003 修复没有破坏已经通过的 F00 跨端报名闭环。

---

## 6. 已通过范围

F003 最终接受以下能力：

- `/me` logout + 二次确认，只清当前 session，不删除长期资产；
- 长期简历复用 F01 `StudentProfile`，补结构化教育字段；
- 系统可信事实继续只读，resume presentation 可编辑；
- `returnTo` 保持机会投递回跳；
- 赛事进行期团队变更 / 减员申请进入 pending review；
- pending request 跨 route revisit 保留；
- 审核前不修改 team member truth；
- 赛事资料真实本地下载；
- Web Share / clipboard fallback；
- 公众号入口不伪装具体原文；
- 人工客服明确企业微信福利官为最终渠道，不伪造联系人 / QR；
- 课程详情分享；
- F02 证书 / 成绩下载复用，不重复造能力。

---

# 7. 最终结论

**F003：PASS。**

本卡无需继续返工，后续只参加 `R-Final` 功能级总回归。

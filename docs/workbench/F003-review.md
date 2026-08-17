# F003｜账号 / 简历 / 团队 / 外部 handoff｜独立评审

> 评审日期：2026-08-17  
> 评审对象：PR #1 / merge commit `677878362658359cbf740c9a1021fcfcf1cbe591`，并核对当前 `dev` 实现  
> 任务真相源：`docs/workbench/00-work-ledger.md` F03  
> 结论：**CHANGES REQUIRED｜一个状态完整性阻断 + 一个真实 Browser 证据缺口。**

---

## 1. 总体判断

F003 的施工边界总体正确，四块主体都已经落地：

- `/me` logout + 二次确认；
- 长期简历复用 F01 `StudentProfile`，补结构化教育字段；
- 赛事进行期团队减员 / 成员变更申请；
- 赛事资料、公众号、人工客服、课程分享等外部 handoff。

没有发现：

- 重造第二份 StudentProfile；
- 把报名期复杂团队表单重新搬回 Mobile；
- 提交团队变更后直接篡改系统团队成员；
- 重复实现 F02 证书 / 成绩下载；
- 偷做 F04 的学力值、业务渠道账号、主体或 AI 评分。

PR #1 已正常合入 `dev`，合并提交为 `677878362658359cbf740c9a1021fcfcf1cbe591`。对应 GitHub Actions run `32014523170` 的 Mobile type-check / Vite development build / Cloudflare deploy 均成功。

因此本轮不是返工 F003，而是补齐一个真实状态边界和浏览器证据。

---

# 2. 已通过部分

## 2.1 Logout：通过

当前 `/me`：

```text
退出登录
→ 二次确认
→ continueAsGuest()
→ /home
```

确认文案明确“只清当前 session，不删除长期账号资产”。实现没有主动清空 `LongTermAssetsProvider` 的 profile / resume / learning / certificates 等长期状态。

这符合 F03 要求。

> 注：原型 session 本身没有做完整持久化是全局架构问题，不在 F003 扩范围。

---

## 2.2 长期简历：通过

当前实现正确复用 F01 的 `StudentProfile`：

- 姓名；
- 手机号；
- 学校；
- 专业；
- 学历；
- 地区；
- 邮箱。

Resume presentation 只新增自身表达字段：

- `graduationTime`；
- `startDate`；
- `endDate`；
- `majorCourses`；
- `campusExperience`。

同时保持：

- 赛事 / 学习 / 证书系统事实只读；
- 简历只决定是否引用这些事实和如何表达；
- `returnTo` 可以从机会 → 简历 → 教育 / 优势 → 简历 → 返回原机会；
- 没有恢复能力雷达、AI 人才总分或 AI 就业评分。

这一部分不要求返工。

### 非阻断清理项

`ResumePages.tsx` 内还保留一份旧 `ProfilePage` 导出，但当前 `App.tsx` 的 `/me/profile` 已明确使用 `StudentProfilePages.tsx` 的 `ProfilePage`，所以它只是死代码，不形成第二真相源。

可以以后清理，本轮不阻断。

---

## 2.3 团队维护的业务边界：方向通过

当前逻辑满足两个重要约束：

1. 报名期成员录入继续在响应式报名门户；
2. 赛事 `inProgress` 才开放团队维护申请。

申请包含：

- 减员 / 成员变更；
- 涉及成员；
- 原因；
- 材料文件；
- “待老师 / 运营审核”。

提交后没有直接修改 `workspaceData.team.members`，这点是正确的：

> 申请事实 ≠ 已审核团队事实。

---

## 2.4 赛事资料 / 分享：通过代码审查

“保存到本地”不再只是 setState，而是真正构造 Blob 并触发浏览器下载。

分享：

```text
navigator.share
→ 不支持时 clipboard
→ 再退化为提示复制地址栏
```

符合中保真原型能力边界。

---

## 2.5 人工客服与课程分享：通过

人工客服当前没有伪造“已接通福利官”，而是明确：

- 最终渠道 = 企业微信福利官；
- 联系人 / QR 由运营配置；
- 当前只给企业微信官方入口。

这种表达比伪造联系人更可靠，可以接受。

课程详情也已经增加 Web Share / clipboard fallback，不要求进一步做原生客户端协议。

---

# 3. BLOCKER-01｜团队变更“待审核”状态离开页面就消失

这是本轮主要阻断项。

当前 `CompetitionTeamPage` 把完整申请状态都放在组件本地：

```ts
const [requestType, setRequestType] = useState(...)
const [memberName, setMemberName] = useState("")
const [reason, setReason] = useState("")
const [materialName, setMaterialName] = useState("")
const [submitted, setSubmitted] = useState(false)
```

提交只是：

```ts
setSubmitted(true)
```

因此当前真实路径是：

```text
团队页
→ 提交减员申请
→ 页面显示“待老师 / 运营审核”
→ 返回赛事工作区
→ 再进团队页
→ 组件重新 mount
→ 申请完全消失
```

但 F03 表达的是一条赛事期业务状态：

```text
已提交申请 → 待审核
```

它不应该只是一次 toast / 当前页面确认。

这会造成一个产品事实矛盾：系统刚告诉用户“已进入待审核”，离开再回来却像从未提交。

## 修复要求

只做窄修，不建立第二份团队成员真相源。

建议新增一个**团队维护申请状态**，例如：

```ts
TeamChangeRequest = {
  competitionId
  type
  memberName
  reason
  materialName
  status: "pending"
}
```

可以放在赛事 / workspace 现有 provider/runtime，或一个边界清晰的小 request store 中。

关键约束：

- request 是“申请事实”，不是 team truth；
- `workspaceData.team.members` 审核前仍不修改；
- 同一赛事重新进入团队页时能看到 pending request；
- 不要求这轮实现真实后台审批；
- 不要求 localStorage / 跨刷新持久化，React provider 会话级状态已足够中保真验收。

---

# 4. BLOCKER-02｜专项 Playwright 尚无真实执行证据

`apps/mobile/tests/f003.spec.ts` 的覆盖范围本身是合理的：

- logout；
- structured resume + `returnTo`；
- team change；
- resource download；
- public-account / WeCom / course share handoff。

但当前 `Deploy Mobile to Cloudflare Pages` workflow **不执行 Playwright**。

所以 run `32014523170` 只能证明：

```text
TypeScript / Vite build / deploy PASS
```

不能证明这些真实交互跑通过。

F003 恰好大量依赖浏览器行为：

- file input；
- browser download；
- Web Share mock；
- navigation / returnTo；
- logout；
- route revisit 后状态连续性。

因此最终 PASS 前必须有一条真实 focused Chromium 证据。

## 最低 Browser 回归

修复 BLOCKER-01 后，建议直接扩展现有 `f003.spec.ts`：

```text
1. logout：二次确认 → /home → 未登录
2. resume：编辑结构化教育 → 返回 resume → returnTo 仍存在
3. team：提交变更 → pending
   → 返回 workspace
   → 再进 team
   → pending request 仍存在
   → 原成员仍存在
4. resource：真实 download event + 文件名
5. story / human / course handoff：关键 href / share 分支成立
```

然后给出真实：

```text
n passed (...s)
```

CI / GitHub Actions 证据。

不接受仅“测试文件存在”作为 browser PASS。

---

# 5. Minor Finding｜“公众号原文”按钮目前并不指向原文

当前 story seed：

```text
externalUrl = https://mp.weixin.qq.com/
```

但按钮文案是：

```text
阅读全文（公众号原文）
```

这两个语义不一致：公众号根域名不是具体文章原文。

施工记录里主动说明“当前没有真实文章 URL，不伪造文章地址”，这个处理原则是对的；问题只在 UI 承诺过头。

## 处理方式二选一

- 如果能从旧原型 / 运营配置恢复真实文章 URL：直接配置真实原文；
- 如果当前拿不到：按钮改成类似“打开公众号入口 / 原文链接待运营配置”，不要声称它会打开具体原文。

这是 P2 handoff，不单独要求返工数据体系，但建议与本轮窄修一起处理。

---

# 6. 已接受项，不要借修复扩范围

以下本轮已经通过，不要重做：

- logout 架构；
- StudentProfile / resume 字段归属；
- `returnTo` 设计；
- trusted facts 只读边界；
- 报名期成员维护继续由 PC portal 承接；
- 团队申请不直接修改成员；
- 赛事资料 Blob download；
- Web Share / clipboard fallback；
- 企业微信福利官作为人工渠道的产品表达；
- 课程分享；
- F02 证书 / 成绩能力复用；
- F04 决策项继续独立。

---

# 7. 复审条件

F003 快速复审只看：

1. 团队变更 request 在 route revisit 后仍处于 pending；
2. pending request 不修改 team member truth；
3. 公众号原文语义不再误导；
4. focused `f003.spec.ts` 获得真实 Chromium PASS。

满足后即可转 **PASS**，无需重新评审 F003 全卡。

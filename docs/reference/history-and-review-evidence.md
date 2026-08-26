# 历史施工与评审证据：T01–T05 / R01–R05

> 作用：记录旧 `com-design/core-industry-college-refactor` 可交互原型是如何一步步形成的，哪些架构问题已经踩过坑并修掉，避免迁移后重复犯同样的问题。

---

## 1. 总体结论

旧重构最终达到：

```text
R01 PASS
→ R02 PASS
→ R03 PASS
→ R04 PASS
→ R05 PASS
```

最终判断不是“画了 150 页”，而是：

- 产品能跑、能点、能改；
- 旧页面有去向；
- 公共平台与赛事生命周期边界成立；
- 五条母动线连续；
- 多赛事身份和长期资产不串线；
- 关键状态可信；
- 代码具备继续维护的结构。

但 2026-08-17 对 Google Drive 原始 Mockplus 做 feature-level audit 后又发现：

> R05 的 route / flow / build PASS 不能被解释为“旧所有二级功能 100% 完整”。

因此这些历史 PASS 应作为**架构与交互来源证据**，而不是迁移后免检证明。

---

## 2. T01｜页面总图、旧→新映射、路由与状态基线

T01 的任务不是做页面，而是把旧 140 页变成可实施的产品蓝图。

关键产出：

- 旧 Mockplus 140/140 页面映射；
- 约 604 page transitions；
- 74 component actions；
- 发现 12 个 dangling target；
- 5 条母动线；
- 66 semantic routes；
- React + Tailwind route/state skeleton；
- Com Design Core 可复用组件与 Product Pattern 缺口；
- D01–D11 未决项记录。

### R01 第一次没有通过的原因

T01 最初状态模型只允许一个 competition：

```text
PrototypeState.competition.currentCompetitionId
PrototypeState.competition.identity
PrototypeState.competition.registration
```

这违反了已经明确的业务事实：一个长期账号可以同时参加多个赛事。

### R01 修复后稳定模型

拆成：

```text
CompetitionAccountState
  identities: CompetitionIdentityState[]

CompetitionContextState
  currentCompetitionId?
  teamId?
  permissions[]
```

并使用 3 场赛事 mock：

- 当前进行中 / active；
- upcoming / pending；
- ended / revoked。

### 迁移教训

**绝对不要重新把账号模型退化成 one-account-one-competition。**

---

## 3. T02｜公共平台：参赛 + 就业 / 实习

T02 建立：

- 首页；
- 赛事发现 / 详情；
- 我的赛事；
- 报名 handoff；
- opportunities；
- companies；
- application；
- applications。

首页第一层正式从“课程 / 学力值 / 工具”改为：

```text
参赛
就业 / 实习
```

### R02 第一次没有通过的三个问题

#### 1. 游客 session 不连续

最初 `?guest=1` 只在当前路由生效，一换页面就隐式变成登录用户。

修复：

- session 进入共享 Provider；
- query 只作为 debug 入口；
- guest 从首页走到赛事 / 机会 / 企业仍然是 guest。

#### 2. 报名 pending 没写回共享 identities[]

最初报名 handoff 结束后，`/competitions/mine` 看不到刚提交的赛事。

修复：

- upsert 当前赛事到唯一 identities[]；
- `identityStatus=pending`；
- `registrationStatus=pending`；
- pending 仍不能进入 workspace。

#### 3. 同一赛事生命周期 fixture 不一致

公共赛事显示“报名中”，账号 scenario 却是“进行中”。

修复：同一 competition 的公开报名窗口与生命周期 fixture 对齐。

### 迁移教训

- session 必须跨路由连续；
- 报名结果必须回流长期账号；
- pending ≠ active；
- 不允许详情页和 workspace 对同一赛事各说各话。

---

## 4. T03｜赛事生命周期与创赛工坊

T03 建立：

- workspace；
- team；
- resources；
- resource detail；
- workshop home / project / compute / skills / results；
- S1–S6；
- 数据驱动 Task Runtime；
- none / pending / rejected / active / revoked；
- notStarted / inProgress / ended / permissionDenied；
- locked / ready / queued / running / failed / completed；
- ended / revoked → 长期资产 handoff。

### 正确的工坊原则

工坊不是“六个 AI 按钮”。

首页先回答：

> **我现在最该做什么？**

S1–S6 共享：

```text
answer → review → queued/running/failed/completed → result → next task
```

### R03 第一次没有通过的两个问题

#### 1. Workshop 又建立第二套 identities[]

PublicPlatform 已有账号层 identities，但 WorkshopRuntime 又 seed 一套身份。

后果：

- T02 报名 pending 和 T03 workspace 互相看不见；
- guest / active 状态可能分叉。

修复：

- PublicPlatformProvider 继续是 session + identities[] 唯一真相源；
- WorkshopRuntime 删除自己的 identities[]；
- workshop 只保留赛事局部 runtime。

#### 2. competition.status 与 runtime.lifecycle 双真相源

赛事详情可能仍显示“报名中”，workspace 已变 ended。

修复：

- `competition.status` 只表达公开报名窗口；
- `competitionLifecycle` 统一来自 Workshop runtime；
- detail / mine / registration / workspace / workshop 共用 lifecycle。

### 迁移教训

**身份属于账号，lifecycle 属于赛事 runtime；两者不能互相复制。**

---

## 5. T04｜长期资产与支撑系统

T04 建立：

- `/me` 长期账号资产首页；
- `/assets/*`；
- courses 完整学习链；
- benefits 完整状态链；
- 长期 resume；
- 赛后经历 / 成绩 / 证书；
- 可信事实与简历 presentation 分层。

### R04 第一次没有通过的问题

#### 1. 长期账号路由缺统一 Account Guard

`/assets/*`、resume、wallet、course learn / assessment / achievement 等可以被 guest 直接访问甚至修改状态。

修复：统一 `AccountRequired`，并在写动作自身二次校验 session。

#### 2. 赛事权益资格用固定 seed，不读共享 identities[]

无赛事身份用户仍可能看到赛事专属权益 eligible。

修复：

- `benefitStatusFor()` 实时读取共享 identities[]；
- 无 active identity 时不能新领取赛事权益；
- 已领取 / 已使用 / 已过期记录作为长期历史继续保留。

#### 3. completed course CTA 去错页面

“查看学习成果”仍跳 learn。

修复：直接进入 achievement。

### 迁移教训

- 长期资产必须有统一账号 guard；
- 赛事资格要实时读共享身份；
- 历史事实可以保留，但不能因为历史领取重新激活赛事权限；
- 简历可以编辑表达，不能反写可信事实。

---

## 6. T05｜全量路由、交互回归与工程收口

T05 最终做到：

- 66/66 semantic routes 明确承接；
- `RouteProbe = 0`；
- unknown URL → explicit 404；
- 修正列表筛选/返回状态；
- 修正 opportunity → company → resume → application 的 `returnTo`；
- workspace → competition benefits → back workspace；
- permissionDenied 返回；
- 清理 T02 遗留 boundary dead code；
- 补 Support 路由；
- D03 `/tasks`、D08 `/me/subjects` 继续 blocked；
- README / verify / Playwright / CI 完成。

### 真正的 build 抓到真实 bug

第一次真实 build 抓到 T04 `CoursesPages.tsx` JSX 语法问题。

修复后才得到：

```text
tsc -b && vite build PASS
```

这说明最终验证不是“写了脚本就算通过”。

---

## 7. R05 最终真实证据

### 产品代码 HEAD

```text
c1ef3a8b0b1ef13d025cbf23dfd596a0bb5b00cd
```

### GitHub Actions

```text
Run: 31992490414
```

### Route audit

```text
Registry routes: 66
App route declarations: 69
Missing registry routes: 0
RouteProbe in App: no
Explicit 404 route: yes
Route audit PASS
```

### Chromium

390×844 viewport，单 worker：

```text
Running 7 tests
7 passed
```

覆盖：

1. guest → competition → login → return registration；
2. no identity → registration → pending → approved → workspace → competition benefit → back；
3. workspace → workshop → answer → review → progress → result；
4. opportunity → company → return → resume → edit → returnTo → apply → applications；
5. ended / revoked → long-term experience → trusted result；
6. competition filter detail-return state；
7. explicit dead-link / 404。

### R05 Review 提交

```text
31c7badbf3a890ad07d3fe8b1bbcefda92f50f47
```

---

## 8. R05 非阻断历史项

### Com Design reduced-motion CSS

旧 Core `design-source/colors_and_type.css` 有两处 selector 与 `@media (prefers-reduced-motion: reduce)` 的非法组合，Vite build 会报 CSS minifier warning。

R05 判定不阻断业务原型，但它是真实 Core defect。

### 旧 prototype 无 lockfile

R05 当时判为非阻断工程 follow-up。

新独立仓库根目录已存在 `package-lock.json`，因此这项在迁移后应视为已具备修复条件，CI 应使用确定性安装。

---

## 9. 迁移以后最值得保留的评审方法

### 先看总纲，再看局部页面

不要因为某个页面看起来漂亮就接受它。如果它破坏母动线、权限或长期状态，仍然是错的。

### 观察 / 推断 / 判断分开

- 观察：代码、原型、访谈里确实写了什么；
- 推断：从多份资料推导出的产品关系；
- 判断：是否应该保留、修改或废弃。

不要把推断包装成“用户已经决定”。

### 小修先修真相源，不重做 UI

R02/R03/R04 的问题都不是视觉问题，而是共享状态和业务真相源问题。修对底层以后，大量 UI 可以原样保留。

### 不伪造验证

- npm 不可用就说不可用；
- browser 没跑就说没跑；
- 只有真实 CI / browser evidence 才算对应层级 PASS。

### 路由审计之后仍要做功能审计

本次 Google Drive 复核新增教训：

> Route coverage 是必要条件，不是 legacy feature coverage 的充分条件。

---

## 10. 2026-08-17｜首页任务专区局部聚合

> 历史阶段记录：本节关于 `/tasks` 继续 blocked 的结论，已被同日后续“任务中心已有业务聚合”产品确认覆盖；见第 11 节。

### 施工边界

- 在手机端首页加入“任务专区”模块；
- 只聚合已有赛事工作区、赛事内创赛工坊、课程、投递与机会出口；
- 不创建统一 task 对象，不恢复旧日常/核心/企业任务和学力值奖励；
- `/tasks` 继续保持 D03 decision-blocked。

### 本地验证

基线分支 / HEAD：

```text
dev / b74bcf7
```

Route audit：

```text
Registry routes: 66
App route declarations: 69
Missing registry routes: 0
RouteProbe in App: no
Explicit 404 route: yes
Route audit PASS
```

TypeScript / Vite：

```text
tsc -b PASS
vite build PASS
```

Chromium，390×844 viewport，单 worker：

```text
Running 8 tests
8 passed
```

新增回归验证：首页任务专区的创赛工坊入口保留 `competitionId`，直接进入 `/competitions/sanchuang-16/workspace/workshop`，不经过全局 `/tasks`。

---

## 11. 2026-08-17｜任务中心已有业务聚合

### 后续产品确认

- 首页“任务专区”保留，并通过“查看全部”进入 `/tasks`；
- `/tasks` 只汇总已有赛事、创赛工坊、课程、权益和机会的下一步；
- 每一项继续使用原业务域的状态和真实详情页，不创建第二份任务状态；
- 旧日常任务、核心任务、企业任务，以及任务与学力值奖励的关系仍未恢复或自行定义。

### 实现与验证

施工基线分支 / HEAD：

```text
dev / 141f009
```

Route audit：

```text
Registry routes: 66
App route declarations: 69
Missing registry routes: 0
RouteProbe in App: no
Explicit 404 route: yes
Route audit PASS
```

TypeScript / Vite：

```text
tsc -b PASS
vite build PASS
```

Chromium，单 worker：

```text
Running 14 tests
14 passed
```

新增任务中心回归覆盖：首页入口、赛事上下文、工坊下一任务、课程进度、权益资格、分类筛选，以及从任务卡片返回原业务详情页。

视觉检查覆盖 `375x812` 与 `390x844`：页面无横向溢出，筛选栏、任务卡片和右侧操作均保持可读与可点击。

---

## 12. 2026-08-18｜手机端孤立入口接入

### 接入边界

- 首页消息通知按钮接入 `/me/notifications`，游客先登录并按 `returnTo` 返回通知中心；
- “我的”接入消息通知、账号绑定、帮助与客服、用户协议、隐私政策和关于；
- `/support` 与 `/support/chat` 不再形成只能手输 URL 进入的孤立页面组；
- `/me/subjects` 按 D08 继续冻结且不暴露入口；
- `/growth/score` 不新增入口，只按已确认 Guardrail 恢复“成长概览”语义，不恢复学力值积分经济。

### 本地验证

```text
Registry routes: 66
App route declarations: 69
Missing registry routes: 0
RouteProbe in App: no
Explicit 404 route: yes
Route audit PASS
tsc -b PASS
vite build PASS
```

Chromium `390x844` focused regression：

```text
tests/r-final.spec.ts
8 passed
```

新增回归覆盖登录态 / 游客通知入口、“我的”六个可见入口，以及客服首页到客服会话的连续跳转。

---

## 13. 2026-08-26｜T045 专属推广码与团队推广成果

### 实现边界

- 团队点亮后为所有当前有效成员签发独立推广码，后续加入成员立即补发；
- 模拟新用户注册时保留活动、团队和推广人员归因，并在同一期活动内按新账号去重；
- 已注册账号和团队现有成员不计入有效新增；
- 核心大使可查看团队成果与归因明细；推广伙伴不展示成员列表、成果数字或排名；
- 不包含真实应用商店安装归因、真实注册服务和财务结算。

### 本地验证

```text
Registry routes: 96
App route declarations: 109
Missing registry routes: 0
RouteProbe in App: no
Explicit 404 route: yes
Route audit PASS
tsc -b PASS
vite build PASS
```

Chromium `390x844`，单 worker：

```text
tests/t044-campus-ambassador.spec.ts
tests/t045-ambassador-promotion.spec.ts
6 passed
```

与同日合入的 T046 共享 seed 合并后，PC typecheck、production build 和 `tests/t046-ambassador.spec.ts` 1/1 PASS。

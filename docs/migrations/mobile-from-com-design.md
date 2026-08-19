# 手机端迁移基线：从 com-design 到独立原型仓库

> 目标仓库：`dangjingtao/core-industry-college-prototype`
> 目标分支：`dev`
> 目标目录：`apps/mobile`
> 来源仓库：`dangjingtao/com-design`
> 来源分支：`core-industry-college-refactor`

## 当前执行结果（2026-08-17）

- 实际迁移基线：`31c7badbf3a890ad07d3fe8b1bbcefda92f50f47`。
- `apps/mobile` 已迁入 66 条语义路由、公共平台、赛事工作区、创赛工坊、长期资产、支撑页面和显式 404。
- 设计令牌已收口为 `apps/mobile/src/design-tokens.css`，并修正来源 reduced-motion 的非法 CSS 选择器结构。
- 本仓库 route audit PASS：registry 66、缺失 0、显式 404 存在。
- TypeScript 与 Vite 生产构建 PASS。
- 390×844 Chromium 母动线与附加回归 7/7 PASS。
- Cloudflare SPA 回退文件保留并已验证深层路径返回 200。
- legacy Mockplus audit 中尚未关闭的 P0/P1 产品差异仍按 backlog 管理；代码迁入不等于这些差异已经验收完成。

验证命令：

```bash
npm run verify:mobile
npm run verify:browser:mobile
```

---

## 1. 为什么迁移

原型最初作为 `com-design` 的 consumer / 业务验证项目存在，但后续已经形成独立产品生命周期：

- 有自己的产品背景、业务访谈和原型总纲；
- 有约 140 页旧 Mockplus 功能来源；
- 有完整的 React + TypeScript + Tailwind 可交互重构；
- 有独立的路由、状态、mock、浏览器回归和部署需求；
- 未来还要维护手机端与 PC 端原型。

继续把业务原型长期挂在设计系统仓库里，会让产品代码、设计系统 Core 和业务评审相互污染。

因此新仓库应成为后续唯一施工入口。

---

## 2. 迁移来源必须明确区分三类真相源

### A. 原始功能真相源：Google Drive Mockplus

- `核心产业学院-mockplus-offline.zip`
- fileId：`1oLnDM4i4pWowoz5cXvV_hyxpyXXz587q`
- size：`58,024,433 bytes`
- SHA-256：`28ac5a710283ec402a8d24822a1bea84ae6aaeee11fefdcd0a220db1557bf03b`
- 470 files
- 140 page JS files

用途：判断旧功能、字段、按钮和页面是否真实存在。

### B. 产品骨架真相源：旧评审与总纲

来源包括：

- `report/product-reviews/2026-08-15-product-background-interview.md`
- `report/product-reviews/2026-08-15-commercial-loop-addendum.md`
- `report/product-reviews/2026-08-15-school-operations-addendum.md`
- `report/product-reviews/2026-08-17-formal-prototype-review.md`
- `report/core-industry-college-refactor/00-master-outline.md`

这些内容已经整理进本仓库 `docs/product/00-product-master-context.md`。

### C. 可交互实现基线：旧 React 原型

来源目录：

```text
prototype/core-industry-college/
```

旧终审验证的产品代码 HEAD：

```text
c1ef3a8b0b1ef13d025cbf23dfd596a0bb5b00cd
```

旧 R05 review 最终提交：

```text
31c7badbf3a890ad07d3fe8b1bbcefda92f50f47
```

旧 GitHub Actions：

```text
31992490414
```

用途：迁移已经验证过的架构、路由、交互和状态模型。

**注意：旧 R05 PASS 只证明旧来源仓库的代码通过，不自动证明新仓库迁移正确。**

---

## 3. 文档初次落库时的新仓库状态（历史快照）

2026-08-17 12:24（UTC+8）检查 `dev`：

- 已有 npm workspaces；
- 已有 `apps/pc`、`apps/mobile`、`packages/shared`；
- 已有根级 `package-lock.json`；
- 已有 Cloudflare Pages 配置和预览地址；
- 但 `apps/mobile/src/App.tsx` 仍是迁移占位页，明确写着“旧项目内容将在确认后逐步迁移”。

因此文档初次落库时：

> **手机端业务迁移尚不能视为完成。**

该结论描述的是迁移前历史快照；当前执行结果见本文开头。产品功能完整性仍受 legacy audit 未关闭项约束。

README / AGENTS 必须以实际代码为准，不能提前写“已完成迁移”。

---

## 4. 旧实现中应迁移的核心目录/能力

旧原型不是一个单文件页面，迁移时不要只复制 App.tsx。

### 路由与应用壳

- `src/app/App.tsx`
- `src/routes/registry.ts`
- `src/dev/RouteLab.tsx`（仅开发/审计用途）

### 公共平台

- `features/public-platform/`
- 首页
- 赛事发现
- 机会
- 企业
- 登录边界
- applications
- session / identities / followedCompanies 等共享状态

### 赛事工作区与创赛工坊

- `features/competition-workspace/`
- workspace
- team
- resources
- WorkshopRuntime
- S1–S6
- Task Runtime
- result

### 长期资产

- `features/long-term-assets/`
- assets
- courses
- benefits
- resume
- profile
- certificates / results / verification

### 支撑页面

- `features/platform-support/`
- onboarding
- notifications
- stories
- support
- legal
- about
- decision-blocked 页面

### 公共基础

- `components/ui`
- `state/model.ts`
- `mock/scenarios.ts`
- 业务 data 文件
- route audit scripts
- Playwright tests
- README 中的原型状态说明

---

## 5. 迁移时必须保持的数据真相源边界

这是旧 R01–R04 反复修出来的稳定契约。

### 长期账号层

唯一维护：

- session；
- identities[]；
- applications；
- followedCompanies。

不能在 workshop / assets 再建一套。

### 赛事 Runtime

唯一维护：

- lifecycle；
- permission；
- taskRuns；
- workshop results。

不能复制账号身份。

### 长期资产

维护：

- 学习记录；
- 权益长期记录；
- 证书 / 成绩；
- profile；
- resume presentation。

通过 ID 引用 competition / project / opportunity / company / result。

---

## 6. 必须保持的 66 semantic route 基线

旧 T05 最终 route audit：

```text
Registry routes: 66
App route declarations: 69
Missing registry routes: 0
RouteProbe in App: no
Explicit 404 route: yes
Route audit PASS
```

迁入新仓库后，应恢复同等语义的 route registry / audit；目录变化可以，语义覆盖不能因为迁移缩水。

特别注意：

- `/tasks` 在迁移时继续 decision-blocked（已被 2026-08-17 后续产品决策覆盖：允许派生聚合页）；
- `/me/subjects` 继续 decision-blocked；
- wildcard 必须显式 404，不静默吞回首页；
- 深层赛事路由必须保留 competitionId。

> 2026-08-19 决策更新：登录账号体系仅手机号，`/me/email-reminder` 语义路由随页面一并移除（见 backlog 已确认决策）。以 `audit-routes.mjs` 实测数量为准。

> 2026-08-19 T018：新增 `/apps` 应用中心（tabbar 第 5 入口 + 分组宫格聚合页），registry 同步 +1，以 `audit-routes.mjs` 实测数量为准。

> 2026-08-19 经营决策体验（可插拔模拟小游戏首期 Demo）：新增 `/modules/simulations/:assignmentId` 模拟模块宿主容器，应用中心「互动体验」分组入口加载 `public/modules/community-commerce` 独立 H5（demo 模式、postMessage 最小协议、不保存结果），registry 同步 +1，以 `audit-routes.mjs` 实测数量为准。

---

## 7. 必须重新跑的五条母动线

新仓库迁移完成后必须重新跑，不接受“旧仓库跑过”。

### A

游客 → 公共赛事 → 登录 → returnTo 回赛事报名。

### B

无赛事身份 → 响应式报名 handoff → pending → approved → workspace → 当前赛事权益 → 返回 workspace。

### C

workspace → 创赛工坊 → task answer → review → queued / running / completed → 正确 result。

### D

机会 → 企业 → 返回机会 → 长期简历 → 编辑 → returnTo → 投递 → applications。

### E

ended / revoked → 赛事期操作关闭 → 长期参赛经历 → 结果 / 证书。

额外：

- 筛选后进详情再返回，筛选保持；
- unknown URL → explicit 404；
- pending / rejected / permissionDenied / ended 等非 happy path。

---

## 8. 旧 R05 CI 只能作为来源证据

旧来源仓库真实验证过：

- Node 20.20.2 / npm 10.8.2；
- `npm install`；
- route audit；
- `tsc -b && vite build`；
- Vite preview；
- Playwright 390×844 Chromium；
- 7/7 tests PASS；
- production artifact + browser evidence。

迁移到本仓库后必须重新得到新的 build / browser evidence。

不能只对比文件数量或 TypeScript 编译通过就宣布迁移完成。

---

## 9. 新仓库已经解决的一个旧工程问题

旧原型目录当时没有 committed lockfile，R05 将其列为非阻断 follow-up。

新仓库根目录已经存在 `package-lock.json`。

因此迁移完成后应优先使用确定性安装，例如：

```bash
npm ci
```

并在 CI 中避免回退到无 lockfile 的安装方式。

---

## 10. Com Design 迁移策略

原型是 Com Design consumer，不是 Core 的副本。

原则：

- 保留 semantic token 和组件使用语义；
- 不为了独立仓库而复制一套新的“近似 Com Design”；
- 如果需要把 token snapshot 带入本仓库，必须记录来源版本 / SHA；
- 产品侧 Pattern 可以扩展，但不要修改 Core 语义；
- 旧 Core reduced-motion CSS 有已知非法 `@media` 组合，迁移时不要把 warning 当产品代码缺陷，但也不能把它遗忘。

详情见 `../reference/com-design-baseline.md`。

---

## 11. 迁移完成定义

只有全部满足以下条件，才可以把本文状态改成“手机端迁移完成”：

1. `apps/mobile` 不再是占位页；
2. 66 semantic route 等价覆盖；
3. 公共平台 / workspace / workshop / assets / support 真实页面都在；
4. shared state 边界未退化；
5. npm clean install / build PASS；
6. 五条母动线真实浏览器 PASS；
7. explicit 404 PASS；
8. `docs/product/01-legacy-mockplus-audit.md` 中的高风险缺口有明确状态；
9. README 与 AGENTS 的“当前状态”已经同步更新；
10. 新仓库 CI / 验证证据写回 `docs/reference/history-and-review-evidence.md`。

---

## 12. 迁移后不要做的事

- 不从旧原型直接复制 140 个静态页面；
- 不恢复旧“社区 / 学院”一级导航只是为了页面对齐；
- 不把三创赛硬编码成全平台唯一赛事；
- 不因为迁移方便重新合并 session / identity / lifecycle；
- 不在 migration commit 顺手决定 D03 / D08 / 学力值经济等未决业务；
- 不用“build PASS”代替 feature audit；
- 不因为旧 R05 PASS 而跳过新仓库真实浏览器验证。

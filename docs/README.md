# 项目文档索引

> 更新时间：2026-08-17 12:24（UTC+8）  
> 目标分支：`dev`  
> 作用：让后续产品、设计、研发与 AI 施工线程只依赖本仓库，也能理解原型为什么这样设计、旧原型有哪些功能、哪些能力仍缺失、哪些问题仍待决策。

## 先读什么

任何涉及产品结构、手机端迁移或补功能的线程，建议按以下顺序阅读：

1. [`product/00-product-master-context.md`](./product/00-product-master-context.md)  
   产品定位、业务角色、账号/赛事模型、五条母动线、长期资产、企业商业逻辑和不可破坏原则。
2. [`product/01-legacy-mockplus-audit.md`](./product/01-legacy-mockplus-audit.md)  
   直接核对 Google Drive 原始 Mockplus 包后的功能审计。这里特别说明“140/140 页面有去向”与“功能完全不缩水”不是一回事。
3. [`product/02-open-decisions-and-backlog.md`](./product/02-open-decisions-and-backlog.md)  
   当前需要补回、需要产品确认、明确冻结的事项，以及建议施工顺序。
4. [`migrations/mobile-from-com-design.md`](./migrations/mobile-from-com-design.md)  
   手机端从旧 `com-design` 原型迁入本仓库的来源、边界、目录与验收要求。
5. [`reference/history-and-review-evidence.md`](./reference/history-and-review-evidence.md)  
   T01–T05 / R01–R05 的关键修复、最终 CI 和浏览器证据，以及这些评审真正解决过什么问题。
6. [`reference/source-index.md`](./reference/source-index.md)  
   Google Drive 原包、旧 GitHub 仓库、业务访谈、评审稿、旧代码提交、CI Run、Com Design 真相源的索引。
7. [`reference/com-design-baseline.md`](./reference/com-design-baseline.md)  
   手机端视觉/组件基线和已知 Core 缺陷。
8. [`reference/legacy-page-map.tsv`](./reference/legacy-page-map.tsv)  
   旧 Mockplus 140 页逐页去向表，用于追溯页面来源；不能单独作为功能完整性证明。

## 当前迁移状态

文档落库时，本仓库 `dev` 已具备双端 monorepo 脚手架、根级 `package-lock.json` 与 Cloudflare Pages 预览配置，但 `apps/mobile/src/App.tsx` 仍是“旧项目内容将在确认后逐步迁移”的占位实现。

因此当前状态应理解为：

- **新仓库是后续唯一目标仓库；**
- **旧 `com-design/core-industry-college-refactor` 是手机端迁移来源与历史验收基线；**
- **Google Drive Mockplus ZIP 是旧功能/页面/字段的原始真相源；**
- 迁移是否完成，只能以本仓库重新执行 route audit、build、浏览器母动线和功能缺口复核为准；
- 不得因为旧仓库曾经 R05 PASS，就声称新仓库当前代码已经 R05 PASS。

## 真相源优先级

发生冲突时按以下顺序判断：

1. **本仓库中用户后续明确确认的新产品决策**；
2. **Google Drive 原始 Mockplus 包**：判断旧功能、字段、按钮和页面是否真实存在；
3. **业务访谈与正式产品评审**：判断功能应该放在哪里、为什么存在、哪些业务边界不能破坏；
4. **旧可交互重构代码与 R01–R05 记录**：判断已经验证过的路由、状态模型、交互动线和工程实现；
5. **Com Design Core**：判断视觉、组件、token、触控与交互基线；
6. `legacy-page-map.tsv`：作为页面追溯索引，不作为“功能一件没少”的充分证据。

## 一个必须记住的审计结论

旧重构曾做到：

- 140 个 Mockplus 页面全部建立旧→新去向；
- 66/66 semantic routes 明确承接；
- RouteProbe = 0；
- 真实 TypeScript/Vite build PASS；
- Chromium 7/7 回归 PASS，其中包含五条母动线。

但 2026-08-17 重新直接检查 Google Drive 原始 Mockplus 包后确认：

> **路由覆盖证明“门都在”，不能证明“屋里的功能一件没少”。**

目前已发现若干二级操作、字段和历史业务语义在页面合并时缩水或被替换。具体见 `product/01-legacy-mockplus-audit.md`。

## 文档维护规则

- 新确认的产品决定优先更新 `product/`，不要只写在聊天里。
- 新发现的旧功能漏项更新 `01-legacy-mockplus-audit.md` 和 `02-open-decisions-and-backlog.md`。
- 迁移状态、来源 SHA、验证结果更新 `migrations/mobile-from-com-design.md`。
- 新的真实 build / E2E / CI 证据更新 `reference/history-and-review-evidence.md`。
- 不删除历史来源记录；结论变化时标记“已被后续决策覆盖”，而不是改写历史。

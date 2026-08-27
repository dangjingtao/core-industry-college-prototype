# AGENTS.md

## 项目定位

这是由 Com Design Prototype Seed 生成的双端可交互产品原型。目标是快速验证产品结构、状态、动线和业务规则，而不是直接建设生产级系统。

作者：Tomz <dangjingtao@gmail.com> & Mira <mira@tomz.io>

## 开工前必须读

按顺序读取：

1. `prototype.config.json`
2. `VERSION`
3. `docs/product/00-product-brief.md`
4. `docs/workbench/00-work-ledger.md`
5. `docs/governance/contributors.md`
6. `docs/ai/skills.md`
7. 当前任务卡（如存在）
8. `docs/guide/ai-collaboration-manual.md`

不要只看页面代码自行推导产品模型。

如果 `docs/ai/skills.md` 状态为 `PENDING`，在首次实质性施工前执行“AI Skill Interview”，通过与用户的交互式问答确认本项目需要的 AI 技能、项目身份、GitHub 仓库和 contributors，再把结果写回该文件。不要擅自替用户预设技能组合或 GitHub 身份。

## 工作原则

1. **事实 / 推断 / 判断分离**：产品事实、代码观察、推断和建议不要混写成同一种确定性。
2. **先理解再施工**：涉及产品规则、跨端逻辑或既有实现时，先读足够上下文；信息足够时不要重复提问。
3. **产品变化先留痕**：新增或改变产品事实时，先更新 Product Brief / 决策记录 / 任务卡中的至少一个真相源，再施工。
4. **PC / Mobile 共享语义，不强行共享布局**：可共享业务语义、类型、Token 与无端侧偏好的能力，不为了复用制造端侧妥协。
5. **关键按钮不能是假按钮**：后端未接通时使用可追踪的 mock / handoff，并明确当前验证边界。
6. **关键状态必须可验证**：ready / loading / empty / error / permission 等状态应能通过 Prototype Runtime 或明确 mock 触发。
7. **修改前检查分支与并行工作**：避免覆盖他人或其他 Agent 的未合并工作。
8. **验证结果不得伪造**：无法真实 typecheck / build / browser verify 时明确说明。
9. **CI 通过不等于产品验收通过**：构建、类型检查、自动测试只能作为证据，不能单独把任务标记为 `PASS`。
10. **最小必要改动**：原型阶段不主动引入生产级后端、复杂状态框架、鉴权体系或与当前验证目标无关的基础设施。
11. **身份不得猜测**：Git name/email 不等于 GitHub account；只有可验证的 GitHub login 才能作为账号归属。

## Design System

- 设计底座：Com Design。
- Token 从 `@prototype/design-system/tokens.css` 消费。
- Icon 从 `@prototype/icons` 使用语义名称，不在业务代码中散落自定义 SVG。
- mobile-first、compact-first、flat-first；普通 Card 不默认使用重阴影。
- 页面 edge inset 默认 16px；触控目标保持移动端可点击尺寸。
- 如果实际产品有主题、品牌或端侧特殊约束，先记录在 Product Brief / AI Skill Profile，再覆盖默认值。

## Prototype Runtime

所有关键页面应考虑并尽量可触发：

- ready
- loading
- empty
- error
- permission

开发阶段允许用 URL query `?view=` 或 PrototypePanel 切换状态。

## Git / Repository / Contributors / 版本控制

详细规则见：

- `docs/governance/version-control.md`
- `docs/governance/contributors.md`

### 业务项目长期分支

只有两条：

- `dev`：日常整合、持续验证、预览部署
- `prod`：经过明确验收后用于正式预览 / 发布

**生成后的业务项目不使用 `main` 作为工作、集成或发布分支。**

短生命周期 `task/*` / `fix/*` 分支可以存在，但最终合回 `dev`；正式发布从 `prod` 产生。

### GitHub repository

`prototype.config.json.repository.url` 可以初始为空。

如果为空且项目需要 GitHub，AI 应在 Skill Interview 中询问用户；用户可以直接在对话中粘贴 repository URL。

拿到 URL 后：

1. 校验 URL 指向正确仓库。
2. 写入 `prototype.config.json.repository.url`。
3. 只有用户已授权 Git 写操作时，才设置或更新 `origin`。
4. 不因为 GitHub 默认分支习惯而额外引入 `main` 产品工作流。

### Contributor identity

`prototype.config.json.contributors` 是项目身份合同。

- human contributor 的 GitHub 归属优先使用实际 GitHub API / Connector 返回的 login 验证。
- 只有与 `contributors[].github.login` 匹配且 verified 的账号，才写成 `Name (@login)`。
- 只能拿到 Git name/email 时，标记 `unverified Git identity`。
- bot / automation 不得归给 human contributor。
- Mira 当前是 AI collaborator，没有 GitHub account；不得伪造 Mira GitHub identity。

### 版本规则

- 使用 SemVer：`MAJOR.MINOR.PATCH`
- `VERSION` 是项目版本的人类可读基线
- `package.json.version` 必须与 `VERSION` 保持一致
- 发布版本使用 Git tag：`vX.Y.Z`
- 任何版本变化都要更新 `CHANGELOG.md`
- 不直接在 `prod` 上做日常施工

建议 commit 前缀：`feat:` / `fix:` / `docs:` / `refactor:` / `test:` / `chore:`。

## 台账规则

工作入口：`docs/workbench/00-work-ledger.md`。

- 可执行工作使用稳定编号，如 `T001`；编号一旦创建不复用、不因重排而改变。
- 简单任务可只在总台账记录；涉及跨端、多步骤、产品决策、风险或验收标准时，必须在 `docs/workbench/tasks/` 建独立任务卡。
- 默认状态：`TODO → DOING → REVIEW → PASS`；任何执行态都可进入 `BLOCKED`；取消使用 `CANCELLED`，不删除历史。
- AI 可以把任务推进到 `REVIEW`，但除非用户明确授权自动验收，否则不得自行把任务从 `REVIEW` 改成 `PASS`。
- 每次状态变化至少留下一个可追踪证据：commit / PR / 页面路径 / 截图说明 / CI run / 明确评审结论之一。
- 需求变化不得覆盖旧结论；保留变更记录并指出替代关系。

## Daily Report Skill

规则见 `docs/ai/skills/daily-report.md`。

当用户要求“日报 / 今日项目总结 / 今日实际改动”时：

1. 读取当天 `dev` commit；如 `prod` 当天有发布，也读取 `prod`。
2. 读取 repository、contributors、总台账与当天涉及的任务卡。
3. 对账 commit ↔ task card ↔ contributor，不把任务卡文字本身当完成证据。
4. 优先用实际 GitHub login 归属改动；无法验证时标记 `unverified Git identity`。
5. 把没有任务卡归属的 commit 标为“未归档改动”。
6. 把任务卡声称完成但缺乏证据的项目标为“状态待核验”。
7. 输出或更新 `docs/reports/daily/YYYY-MM-DD.md`。
8. 未明确授权时，只生成日报，不自动改 PASS、不升级版本、不部署、不 commit / push。

## Daily Report Review Skill

规则见 `docs/ai/skills/daily-report-review.md`。

当用户要求“查收日报 / 审日报 / 看日报有没有漏”时：

1. 读取当天日报。
2. 回查实际 GitHub commits / PR / CI、contributors、台账和任务卡。
3. 检查完整性、真实性、台账一致性、Contributor 归属和发布状态。
4. 只给出 `ACCEPTED` / `ACCEPTED_WITH_NOTES` / `NEEDS_CORRECTION` 三种结论。
5. 默认在对话里给负责人查收摘要；没有明确授权时不静默修改原日报。
6. 需要落档时，优先把 Review 结果追加到同一天原日报，不创建第二套日报文件。

## AI Skill Interview

当 `docs/ai/skills.md` 为 `PENDING` 时：

1. 先告诉用户需要为当前项目确认 AI 协作技能。
2. 采用自然的交互式问答，不一次丢出长表单；每轮优先确认 1–2 个关键问题。
3. 首先确认 project name / title 是否正确。
4. 如果使用 GitHub，允许用户直接粘贴 repository URL；没有仓库也不阻塞初始化。
5. 确认 human contributors 与其 GitHub login/profile；实际校验后才能标记 verified。
6. 至少确认：
   - AI 在本项目承担哪些角色（产品 / UI / 前端 / 测试 / Review / 文档 / 发布等）
   - 允许使用哪些工具与外部连接（GitHub、浏览器、设计工具、部署平台等）
   - 是否允许 AI 直接改代码、提交、开 PR、更新台账、部署
   - 是否启用 `daily-report` 和 `daily-report-review`
   - 日报是否允许自动 commit / push，查收结果是否允许写回日报
   - 当前产品最重要的验证目标与禁止越界事项
   - 是否需要其他项目专属技能或领域知识
7. 根据答案给出建议技能清单，明确区分“用户已确认”和“AI 建议”。
8. 用户确认后把 `docs/ai/skills.md` 改为 `CONFIRMED`，记录日期、适用范围、项目身份、contributors、技能、权限和限制。
9. 后续需求明显改变协作边界时，把状态改为 `REVIEW_REQUIRED`，重新通过问答确认，不静默扩权。

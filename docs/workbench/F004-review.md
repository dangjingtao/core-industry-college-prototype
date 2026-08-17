# F004｜产品决策卡独立评审

> 初审日期：2026-08-17  
> 整改复审日期：2026-08-17  
> 初始评审对象：PR #2 `docs(F004): resolve product decision card`  
> 整改 PR：#3 `docs(F004): separate confirmed guardrails from pending choices`  
> 整改合并提交：`e480e700f734b4d020ddd21a20a0f02aa3c34fd1`  
> **整改结论：PASS**  
> **F004 任务状态：PROPOSED / PARTIALLY CONFIRMED｜仍待产品责任人逐项决策，不标整卡 PASS。**

---

## 1. 复审结论

首轮评审的唯一根问题是：施工 / 文档线程把合理的领域方案直接写成 `DECIDED`，从而越过产品责任人的决策权。

PR #3 已按要求完成产品治理型窄修：

- 移除整卡 `DECIDED`；
- 改为 `PROPOSED / PARTIALLY CONFIRMED`；
- 增加六项 Decision Status Matrix；
- 将已认可的架构边界单列为 `Confirmed Guardrail`；
- 将仍需业务拍板的选择保留为 `Recommended / Pending Confirmation`；
- `Deferred` 项继续冻结；
- 明确未确认内容不得作为施工许可。

因此，**首轮 CHANGES REQUIRED 的整改已经通过。**

但 F004 本质是产品决策卡。当前六项业务选择仍有 Pending，因此不能把“整改通过”误写成“整张产品决策卡已经 PASS”。

---

## 2. PR #3 范围确认

PR #3 已合并到 `dev`，merge commit：

`e480e700f734b4d020ddd21a20a0f02aa3c34fd1`

PR 只有 1 个 changed file：

- `docs/workbench/F004-product-decisions.md`

没有修改 UI、路由、Store、状态模型或其它业务代码，符合 F04“只做产品决策、不施工”的边界。

---

## 3. 六项状态复审

### A｜学力值

**通过整改。**

当前只确认：

- 学力值与 GrowthScore 不能继续混成同一对象 / 同一语义。

继续 Pending：

- 是否恢复积分经济；
- GrowthScore 废弃、改名还是独立保留；
- 是否兑换课程 / 权益 / 活动。

`LearningPointAccount` 现在只是推荐模型，不再被描述成已冻结真相。

### B｜第三方 / 业务渠道账号

**通过整改。**

已确认 Guardrail：

- 登录 / 联系方式绑定与业务渠道账号是两类对象，不能继续混义。

继续 Pending：

- 抖音达人 / 快团团 / 三创好物等旧业务渠道账号当前是否仍保留；
- 若保留，是长期资产还是赛事 / 项目 scoped。

### C｜D03 任务

**通过整改。**

已确认 Guardrail：

- 创赛工坊继续赛事 scoped runtime；
- 如果存在 `/tasks`，只能作为 aggregator / read model；
- 不复制 WorkshopRuntime 进度。

继续 Pending：

- 是否恢复平台长期任务；
- 是否恢复企业任务；
- 是否需要独立 `/tasks` 入口。

未确认前不能拿 aggregator 架构约束反推“任务产品已经决定要做”。

### D｜D08 主体

**通过整改。**

已确认 Guardrail：

- Organization 与 OrganizationAffiliation 分离；
- CompetitionIdentity 不与 affiliation 混用；
- 学生不能随手创建学校 / 企业；
- 不恢复万能主体二维码；
- 学校老师仍属于 Web / 后台角色。

继续 Pending：

- 学生侧是否需要组织关系能力；
- 企业项目关系是否长期化；
- `/me/subjects` 删除、改名还是换入口。

因此 `/me/subjects` 继续 blocked 是正确的。

### E｜创域 / 本地运营 / QR

**通过整改。**

已确认 Guardrail：

- 创域不是简单商城改名；
- 当前不抢一级导航；
- QR 是领域动作入口，最终事实写回 Benefit / Activity / Affiliation 等所属领域。

继续 Pending：

- 创域是否正式作为二级运营品牌；
- 平台治理 + 有限下放是否采用；
- 学校 / 社团权限；
- 发行 / 核销权限；
- 地域 scope；
- 首期 QR 动作范围。

### F｜AI 简历 / 人才能力

**通过整改。**

已确认 Guardrail：

- AI 不改可信事实；
- AI 生成层与可信事实层分离；
- 不做黑盒人才总分 / 高潜指数；
- 能力雷达在无证据模型时 Deferred；
- 若未来提供 AI 辅助编辑，应由用户主动触发并确认。

继续 Pending：

- AI 简历润色是否进入后续范围；
- 可解释机会匹配是否进入后续范围及优先级。

---

## 4. 当前可以执行的规则

后续施工线程现在只能直接使用 `Confirmed Guardrail`，不能拿 `Recommended / Pending Confirmation` 当需求。

特别是以下能力仍不能自行开工：

- 学力值积分经济；
- 旧业务渠道账号；
- 通用任务产品能力；
- 学生侧组织关系；
- 创域治理 / 权限 / QR 首期范围；
- AI 简历润色；
- AI 机会匹配。

如果产品责任人暂时回答“不确定”，对应项保持 Pending / Deferred 即可，不阻塞其它施工卡收口。

---

## 5. 最终判定

### 整改评审

**PASS。**

PR #3 已完整关闭首轮“越权把 Proposal 写成 Decision”的问题，不需要继续返工 F004 文档结构。

### F004 产品决策卡

**仍未完成，不标 PASS。**

当前正式状态应保持：

`PROPOSED / PARTIALLY CONFIRMED`

完成条件仍是产品责任人对六项业务选择逐项给出：

- `Confirmed`；或
- `Deferred / 继续冻结`。

在此之前，F004 是一份合格的**产品决策推荐稿与确认记录**，不是施工许可证。

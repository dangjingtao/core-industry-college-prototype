# PC-BD01｜二次独立复审

> 分支：`dev`  
> 复审快照：`1247147333856c987d8890c26c9e5c20b1f385f5`  
> 上轮独立复审：`docs/workbench/PC-BD01-review.md`  
> 结论：**静态复审通过；最终 PASS 仍等待运行态证据**  
> 当前状态建议：**待运行验收**

---

## 1. 结论

上轮 `CHANGES REQUIRED` 的 4 项 Finding，本轮静态复审均已关闭；没有发现新的产品语义或数据真相阻断。

但任务卡 PASS 门槛仍包含：

- PC verify / build；
- `pc-basic-data.spec.ts`；
- 完整 PC browser regression。

当前 GitHub commit status 没有可核验结果，本复审也没有拿到可信的 push-triggered Actions 运行证据，因此不能把“断言已修改”冒充“断言已跑绿”。

所以当前准确结论是：

```text
代码 / 静态语义：通过
运行态验收：待执行 / 待取证
最终 PASS：暂不判定
```

本轮不再要求继续改 PC-BD01 业务代码；除非运行态回归暴露真实失败，否则施工线程应停止继续扩改。

---

## 2. Finding 1 关闭｜学生对象切换歧义已消除

`BasicDataConsole` 已直接复用 PC05 的 `studentAccountSeed`，当前基础数据学生样例与 `/admin/students` 都是“林晓”。

学生详情明确提示当前 PC05 只提供同一位学生的治理样例，并将动作改为“进入学生与赛事身份控制台”，不再声称可以编辑任意列表学生。

对应 focused assertion 已覆盖：

```text
基础数据 / 林晓
→ 进入学生与赛事身份控制台
→ /admin/students
→ 仍为林晓
```

结论：**CLOSED**。

---

## 3. Finding 2 关闭｜默认业务视图 / 技术模式已分层

当前 `BasicDataConsole` 已把以下信息放入现有 `data-pc05-technical` 技术模式：

- accountId / organizationId / trackId / competitionId；
- canonical object；
- Scope；
- 原始 DataSource；
- `StudentProfile` / `CompetitionTrack` / `CompetitionLifecycle` 等技术追溯说明。

默认页面改为业务表达，例如：

- Runtime → “系统记录”；
- API 同步 → “接口同步”；
- 学校默认显示业务审核责任说明，不直接暴露技术关系字段；
- 配置 / 模板默认显示“归属模块 + 去维护”，技术模式再展示 canonical 对象与版本。

`pc-basic-data.spec.ts` 已同时锁定默认隐藏与技术模式展开两套行为。

结论：**CLOSED**。

---

## 4. Finding 3 关闭｜PC-BD01 已进入统一工作台账与后续前置

`docs/workbench/00-work-ledger.md` 当前已：

- 在总状态表登记 `PC-BD01`；
- 把 PC05 前置改为 `PC02、PC03、PC04、PC-BD01`；
- 在 PC 流程图中明确 `PC-BD01 独立复审 → PC05`；
- 在 R-Final 条件中要求 `PC01–PC04 与 PC-BD01 均完成独立复审`。

当前台账仍保留 `CHANGES REQUIRED（修正已施工，待独立复审）`，这是上轮状态遗留；本次二次复审尚未取得运行证据，因此建议下一次取得运行证据后，与最终 PASS 一并更新，避免在没有运行证据时提前写绿。

结论：**CLOSED（流程已接入；最终状态待运行验收后更新）**。

---

## 5. Finding 4 关闭｜PC01OperationsConsole 旧语义已收敛

不可达的 `section === "basicData"` 分支虽然仍保留，但其文案已经改为：

- 学生资料聚合入口；
- 学校主体聚合入口；
- 赛事配置索引；
- 跨模块模板索引；
- 数据接入治理；
- 真正业务状态回所属模块维护。

已不再出现上一轮“可信状态 / 长期万能字典 / 统一从这里发布”等过期语义。

结论：**CLOSED**。

---

## 6. 本轮再次确认的边界

静态复审未发现以下回归：

- 没有重新引入独立 `studentId` 长期真相；
- 学校仍来自 `Organization(type=School)`，没有学校认证状态机；
- 赛道 / 阶段仍绑定具体 Competition；
- 证书 / 协议 / Banner / 权益规则仍回所属业务域；
- 导入批次只描述数据接入流程；
- DataSource 仍是五类 canonical 枚举；
- PC02 的学校审核 / 官方资格 / Workspace Gate 分层断言仍保留；
- `/registration-portal/*` 与 PC03 / PC04 / PC05 关键路由回归断言仍保留。

---

## 7. 最终 PASS 所需唯一剩余证据

下一步只需要重新执行并保留可信结果：

```text
npm run verify --workspace @core/pc
npm run e2e --workspace @core/pc -- tests/pc-basic-data.spec.ts
npm run e2e --workspace @core/pc
```

如果三项全部通过，且运行态没有暴露新的业务矛盾，则 PC-BD01 可以在下一次独立复审直接判定：

```text
PASS
```

在拿到上述证据前，本文件不把 PC-BD01 写成 PASS。
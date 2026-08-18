# PC-BD01｜独立复审

> 分支：`dev`  
> 复审快照：`d061a39f350b39de70705e56adfefe86658b3678`  
> 施工收尾提交：`dc17197a4f705444ad6c88fdc3b47fc956b0c3d2`  
> 结论：**CHANGES REQUIRED**  
> 性质：独立复审，不修改施工线程的施工记录结论

---

## 1. 总结

PC-BD01 的核心方向已经被救回来：

- `BasicDataConsole`、5 个页面、侧栏和路由保留；
- 学校已经直接复用 `Organization(type=School)`；
- 赛道 / 阶段已经回到具体 `CompetitionTrack / CompetitionLifecycle`；
- 模板页已经改为跨域索引；
- 导入批次已经明确只是接入治理；
- `studentId`、学校认证状态机、统一模板发布状态等上一轮高风险第二真相已移除。

因此本轮**不是架构返工**。当前只剩少量收口问题，但其中有 3 项会直接影响“评审人能否看懂 / 后续 PC05 是否会漏验”，所以暂不判 PASS。

---

## 2. Finding 1｜学生聚合视图仍存在“选中 A，维护时跳到 B”的可见断链

**级别：P0 / 阻断 PASS**

`BasicDataConsole` 当前在本文件内维护独立 `studentProfiles` fixture，例如：

- 陈语；
- 林海；
- 张雨。

详情页上的“编辑 / 查看 StudentProfile”统一跳到：

```text
/admin/students
```

但 `/admin/students` 当前 PC05 学生控制台展示的是另一位固定样例：

```text
林晓
```

这会形成评审人真实可走到的矛盾路径：

```text
基础数据 → 陈语 → 编辑 / 查看 StudentProfile
→ 学生控制台 → 林晓
```

这不是数据模型概念问题，而是**当前原型可见对象发生了切人**。

### 最小修复原则

不要因此建设新的 per-student PC05 路由，也不要重做 BasicDataConsole。

二选一即可：

1. 让 basic-data 的当前可维护学生样例直接复用 PC05 已有 `studentAccountSeed`，从根上保持同一展示对象；或
2. 保留多学生聚合列表，但把详情页动作改成明确的“进入学生与赛事身份控制台 / 查看控制台样例”，不得再声称是在编辑当前这位学生。

如果保留多学生列表，最好同时在页面写清：当前 PC05 仅提供单学生中保真治理样例，未实现按 accountId 选择具体学生。

### 必补断言

新增一条 browser assertion，覆盖：

```text
基础数据学生详情
→ 维护入口
→ 不得无提示切换成另一位学生
```

---

## 3. Finding 2｜默认视图仍把大量技术验收信息直接暴露给业务评审

**级别：P1 / 阻断本卡“评审可理解性”验收**

任务卡已经明确：

```text
默认页面讲业务
技术模式讲 stable id / canonical state / DataSource / relation id
```

但当前 BasicDataConsole 默认视图仍直接展示或反复使用：

- `Account / StudentProfile`；
- `Organization(type=School)`；
- `CompetitionTrack`；
- `CompetitionLifecycle`；
- `canonical DataSource`；
- `organizationId / trackId / competitionId`；
- “真相对象 / Scope”等技术词。

而 `AdminControlPlaneShell` 的“显示技术信息”开关只隐藏 `.font-mono`、`code` 和 `[data-pc05-technical]` 等元素；BasicDataConsole 的 `StableId`、canonical 对象名和 DataSource 区块并未挂这些 technical 标记，因此默认模式不会被收起。

### 最小修复原则

不要求重画页面，只做展示分层：

- 默认保留中文业务名、归属模块、来源说明、去维护入口；
- stable id、canonical object、Scope、英文状态名放到 `data-pc05-technical` 或 `<details>`；
- `pc-basic-data.spec.ts` 中涉及 canonical 名称 / stable id 的断言，切到“显示技术信息”后再检查；
- 默认模式新增至少 1 条“业务人可读”的 assertion。

允许 `Organization` / `StudentProfile` 等少量对象名作为辅助说明，但不能让整页主要依赖开发术语才能理解。

---

## 4. Finding 3｜工作台账仍完全没有 PC-BD01，PC05 / R-Final 可以在流程上漏掉它

**级别：P1 / 阻断流程收口**

当前 `docs/workbench/00-work-ledger.md` 的总状态表仍只有：

```text
PC01
PC02
PC03
PC04
PC05
```

没有 `PC-BD01`。

同时 PC05 仍写：

```text
前置：PC02、PC03、PC04
```

PC 管理端流程图也仍然直接 `PC02–PC04 → PC05`。

这与 PC-BD01 任务卡自己的约束冲突：

```text
PC05 最终验收前必须完成并独立复审
```

如果不补台账，后续独立评审人只看统一工作入口时，完全可能不知道还有 PC-BD01。

### 最小修复原则

只更新台账，不改产品逻辑：

- 总状态表增加 `PC-BD01｜基础数据接入与旧后台能力归并`；
- 当前状态标为 `CHANGES REQUIRED`；
- PC05 前置增加 `PC-BD01`；
- PC 流程图把 `PC-BD01` 放在 PC02–PC04 与 PC05 最终收口之间；
- R-Final 的 PC 条件明确要求 PC-BD01 已完成独立复审。

---

## 5. Finding 4｜存在一段不可达但语义已经过期的 basicData 旧实现

**级别：P2 / 建议本轮顺手收口，不单独阻断**

`PC01OperationsConsole` 仍保留 `section === "basicData"` 分支，里面还是上一轮旧文案，例如：

- 学生“可信状态与来源归属”；
- “赛事 / 赛道字典”作为长期字段引用基线；
- 证书 / 协议 / Banner / 权益规则“统一从这里发布”；
- 基础数据层维护“主数据 + 字典 + 模板 + 权限”。

当前 `App.tsx` 已经不把 `/admin/basic-data/*` 路由到这个分支，因此它现在是不可达代码，不影响当前页面；但它会误导后续施工线程，也与 `BasicDataConsole / data.ts` 的新语义自相矛盾。

### 最小修复原则

不需要删除 `PC01OperationsConsole`：

- 要么移除未使用的 `basicData` section；
- 要么把这一个分支的文案改成“跨域维护工作台 / 索引 / 数据接入治理”新语义。

---

## 6. 已确认通过的静态语义

本轮静态复审确认以下高风险问题已经解决：

1. 学校列表 / 详情实际读取 `PC03State` 的 `Organization(type=学校)`，没有独立 SchoolStore；
2. 学校页不再出现 `verified / unverified` 学校认证状态机；
3. 赛道索引直接读取 `competitionControlById("sanchuang-16").tracks`，并绑定 `competitionId=sanchuang-16`；
4. 生命周期明确指向 `CompetitionLifecycle`；
5. 证书、赛事协议、Banner、权益规则分别指向 PC04 / Competition / Content / Benefit；
6. 导入批次的 `pending / validated / rejected / applied` 只描述批处理状态，并显式展示最终写回对象；
7. DataSource 枚举继续只有 `平台配置 / API 同步 / 文件导入 / 人工修正 / Runtime`；
8. PC02 focused assertion继续锁定“学校审核已通过 + 官方资格待确认 + Workspace 不开放”；
9. `/registration-portal/*` 没有被复制进 `/admin/basic-data`；
10. 当前 R-Final workflow 文件已经恢复为完整 mobile + handoff + PC verify / browser regression 结构。

---

## 7. Build / Browser 证据

施工记录声明此前 PC type / build 已成功，并记录过一次 `31 passed / 5 failed` 后对旧断言进行了修正；施工线程没有把这些自行解释为最终 PASS，这一点处理正确。

本次独立复审通过 GitHub 当前提交状态查询，没有拿到 `dc17197a` 或当前 `dev` 的独立 commit status / check 结果，因此**本复审不冒充已重新跑过最终 PC build 与 browser regression**。

由于当前已经存在上述静态阻断 Finding，本轮无需等运行态结果即可判定：

```text
CHANGES REQUIRED
```

修复后下一轮独立复审再执行 / 核对：

```text
PC verify
pc-basic-data.spec.ts
完整 PC browser regression
```

再决定 PASS。

---

## 8. 本轮结论

**CHANGES REQUIRED**。

但这不是“方向错了”。当前实现已经完成主要语义归并，不需要回滚或重做 5 个页面。

建议只开一张极小的修复卡，目标限定为：

```text
1. 修学生详情 → 学生控制台的对象切换歧义
2. 默认视图 / 技术视图分层
3. 把 PC-BD01 正式登记进 work ledger，并挂到 PC05 / R-Final 前置
4. 清掉 PC01OperationsConsole 中不可达的旧 basicData 文案
5. 更新 focused assertions
```

完成后再独立复审。
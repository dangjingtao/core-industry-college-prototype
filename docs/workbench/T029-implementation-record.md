# T029｜三创赛报名端职责 + 团队生命周期 / 减员闭环｜施工记录

> 状态：设计主干已收口 / 中保真规则已对齐 / 待实际回归证据  
> 分支：`dev`  
> 日期：2026-08-24  
> 正式设计：`docs/product/08-registration-channel-and-team-lifecycle.md`  
> 关联：T028、F00、T025、GAP-05、PC02

---

## 1. 本轮已收口的产品决策

### 1.1 报名端职责

最终采用：

```text
PC 响应式报名门户 = 主报名端
Mobile App = 入口 / 状态回流 / 无电脑场景兜底
```

依据：Owner 已在 T028 后续确认“队长在 PC 登录注册并完成团队资料”。因此会议中“整个报名流程全面迁移手机端”不再作为当前实现方向。

F00 的 Mobile → PC handoff 保留，但语义调整为“同一报名门户的手机兜底”，不是 Mobile 原生第二套报名系统。

### 1.2 团队生命周期

```text
Draft
→ SchoolReviewPending
→ rejected → Draft/Edit
→ approved → ApprovedLocked
→ 后续资格 / 赛事阶段
→ InProgress
→ Ended
```

学校审核通过后名单锁定：

- 禁止增员；
- 禁止替换成员；
- 禁止直接修改锁定成员事实；
- 后续人员变化只允许减员申请。

### 1.3 减员规则

继续采用 2026-08-19 GAP-05：

- 选择成员；
- 填写原因；
- 提交审核；
- 审核前不改成员事实；
- 不上传申请表；
- 不上传证明材料；
- 不提供泛化“成员变更”；
- 不提供增员 / 替换。

会议摘要中的“上传减员申请表”与既有明确决策冲突，本轮没有恢复材料上传。

---

## 2. 本轮发现并修复的关键语义错误

### 学校审核通过不能改变赛事生命周期

此前 Mobile 报名 callback 的 `approved` 分支同时执行：

```text
identity → active
lifecycle → inProgress
```

这把“学校审核结果”和“赛事是否已经开始”错误合并。

本轮已移除 `setLifecycle(..., "inProgress")`。

现在：

```text
school review approved
→ 更新报名 / 身份侧状态
→ 不改赛事 lifecycle
```

赛事仍由独立 `notStarted | inProgress | ended` 控制。

提交：

- `8c493d24d4f9cba7f6be25bcf6169f944b2611b7` — `fix(T029): separate registration review from competition lifecycle`

---

## 3. Mobile handoff 文案与职责修正

文件：

`apps/mobile/src/features/competition-workspace/RegistrationHandoffPage.tsx`

已明确：

- 队长 PC 主报名；
- Mobile 不再维护第二套原生报名长表单；
- 手机仍可打开同一响应式门户作为无电脑兜底；
- rejected 后回 PC 修正；
- approved 后名单锁定；
- 审核通过不自动启动赛事。

---

## 4. 跨端 F00 旧契约已修正

旧回归仍在测试：

```text
Mobile → PC
→ 队员单独注册
→ 等待队长绑定
```

该流程与 T028/T029 已确认方向冲突。

现已改为：

```text
Mobile 赛事入口
→ PC 响应式门户
→ 队长登录
→ 队长录入团队成员
→ 提交学校审核
→ pending callback 回 App
```

提交：

- `6cf2c974a71ca6be1763b3193f198e1c61614fb1` — `test(T029): align cross-app handoff with captain PC registration`

---

## 5. PC 团队锁定回归契约

现有 PC 报名门户已经具备正确结构，本轮不重画：

### Draft / rejected

- 可见“录入成员”；
- 可修改团队资料；
- rejected 可“修正后重新提交审核”。

### pending

- 团队冻结；
- 无“录入成员”；
- 无直接“移除”；
- 普通成员账号尚未创建。

### approved

- 团队继续锁定；
- 无增员入口；
- 无替换入口；
- 账号创建 / 绑定按 T028 触发。

新增回归：

- `submitted roster is frozen during school review`；
- `rejected roster returns to edit while approved roster stays locked`。

提交：

- `fc25052eba816d63b15611df60bbf4ff55015469` — `test(T029): cover roster lock and rejected edit recovery`

---

## 6. Mobile 减员回归契约

现有 `/competitions/:competitionId/workspace/team` 已经符合 GAP-05，不需要重做第二套页面。

本轮新增专项测试，锁定：

1. 只存在“减员申请”；
2. 没有增员 / 替换成员；
3. 没有文件上传；
4. pending 后成员事实不变；
5. 一笔 pending 时不重复展示新的提交表单；
6. ended 场景不开放新的减员提交。

提交：

- `9c3fdf78ad1930f86ecea65010e14af85175006c` — `test(T029): lock team lifecycle and reduction boundaries`

---

## 7. 当前不新增“官方确认”第三份前端真相源

PC02 已明确三层事实：

```text
外部权威赛事事实
平台承接报名流程
核心学院叠加服务
```

T029 正式设计文档已要求学校审核和外部赛事资格不能混为一谈。

但当前 Mobile 原型已有：

```text
CompetitionIdentity.identityStatus
WorkshopRuntime.lifecycle
```

并且 `active + notStarted` 已能表达：

- 已有赛事身份；
- 团队与资料可提前查看；
- 赛事执行动作尚未开放。

本轮不为了中保真再新增 `OfficialQualificationStore`，避免产生第三份重复真相源。

真实后台接入时，应由 PC02 的外部权威资格映射到现有赛事身份 / permission，而不是在 Mobile 自己维护一套“官方确认”状态。

---

## 8. 仍开放但不阻塞主设计的参数

1. 三创赛减员入口从“名单锁定后”哪个具体阶段开放；
2. 减员最终审核主体：学校老师 / 平台运营 / 分层审核；
3. 队长被减员时是否允许由现有成员接任；
4. 各赛道最低团队人数；
5. pending 减员是否允许队长主动撤回；
6. 外部三创赛官方资格在真实 API / 文件导入后的状态映射细节。

这些都属于赛事配置 / 后台接入参数，不应写死成通用 App 账号规则。

---

## 9. 当前结论

T029 产品主干已完成：

- PC / Mobile 职责明确；
- 队长 / 队员职责与 T028 对齐；
- 报名审核与赛事生命周期解耦；
- 审核前后团队编辑边界明确；
- GAP-05 冲突已按现行明确决策收口；
- PC / Mobile 回归契约已提交。

**暂不标 PASS。**

原因：当前 GitHub 直接 push 场景下仍需取得真实 build / Playwright 运行证据；另外 T032 教师审核工作台会决定减员审核入口最终落点。

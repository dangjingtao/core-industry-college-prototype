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
→ 外部资格确认（赛事需要时）
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

## 2. 本轮发现并修复的关键状态耦合

### 2.1 学校审核不能改变赛事 lifecycle

此前 Mobile 报名 callback 的 `approved` 分支同时执行：

```text
identity → active
lifecycle → inProgress
```

这把“学校审核结果”和“赛事是否已经开始”错误合并。

第一步已移除 `setLifecycle(..., "inProgress")`：

```text
school review approved
→ 更新报名 / 身份侧状态
→ 不改赛事 lifecycle
```

赛事继续独立使用：

```text
notStarted | inProgress | ended
```

提交：

- `8c493d24d4f9cba7f6be25bcf6169f944b2611b7` — `fix(T029): separate registration review from competition lifecycle`

### 2.2 学校审核通过也不能直接等于正式 CompetitionIdentity active

继续检查后发现：即使不修改 lifecycle，若学校审核通过仍直接写：

```text
identityStatus = active
```

当赛事本身已经处于 `inProgress` 时，仍可能提前开放正式 Workspace。

当前 `CompetitionIdentityState` 本来就有两个不同字段：

```text
registrationStatus
identityStatus
```

因此本轮没有新增第三份状态 Store，而是把两个既有字段真正拆开使用：

```text
团队提交
registrationStatus = pending
identityStatus = pending

学校审核通过
registrationStatus = approved
identityStatus = pending

外部官方资格确认（赛事需要时）
registrationStatus = approved
identityStatus = active
```

对于没有外部第二层资格确认的普通赛事，后台规则可以在学校审核通过后直接完成 `identityStatus = active`。

新增接口：

```text
setCompetitionSchoolApproved(competitionId)
```

它只把平台承接报名置为 `approved`，不会越权把正式赛事身份激活。

提交：

- `4bc75a4d5a6b8a84a52696413007251d8bc4360c` — `feat(T029): separate school approval from active competition identity`
- `0fdc26fb94f62e7383a481eb936e99642c2df140` — `feat(T029): keep school-approved registration pending official qualification`

### 2.3 Workspace 派生态补充 qualificationPending

Workspace 不新增业务真相源，只根据现有字段派生展示：

```text
registrationStatus = approved
+ identityStatus = pending
→ qualificationPending
```

对应提示：

> 学校审核已通过，等待赛事资格确认

正式 Workspace 继续受限。

提交：

- `f69fab928750b82ed51fdca5d9784dbbd764479a` — `feat(T029): distinguish official qualification pending workspace state`

---

## 3. Mobile handoff 文案与职责修正

文件：

`apps/mobile/src/features/competition-workspace/RegistrationHandoffPage.tsx`

已明确：

- 队长 PC 主报名；
- Mobile 不再维护第二套原生报名长表单；
- 手机仍可打开同一响应式门户作为无电脑兜底；
- rejected 后回 PC 修正；
- 学校 approved 后名单锁定；
- 学校审核通过不自动启动赛事；
- 需要外部官方资格确认时，保持正式 CompetitionIdentity pending；
- 原型可单独模拟外部官方资格确认，确认后才 active。

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

另外新增学校审核 / 官方资格分层回归：

```text
school approved callback
→ registrationStatus approved
→ identityStatus pending
→ Workspace qualificationPending
→ 正式 Workspace 仍受限
```

提交：

- `873c59af1ca77a8c1dc57b25ab8dfb3b31f5a928` — `test(T029): keep school-approved registration out of formal workspace`

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

## 7. 不新增“官方确认”第三份前端真相源

PC02 已明确三层事实：

```text
外部权威赛事事实
平台承接报名流程
核心学院叠加服务
```

T029 现在直接复用已有：

```text
CompetitionIdentity.registrationStatus
CompetitionIdentity.identityStatus
WorkshopRuntime.lifecycle
```

分别表达：

```text
平台承接报名是否通过
正式赛事身份是否生效
赛事当前是否开始 / 结束
```

Mobile 只派生 `qualificationPending` 用于 UI，不持有第四份事实。

真实后台接入时，由 PC02 / 外部权威来源更新正式赛事身份；Mobile 只消费最终状态。

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
- 学校审核、正式赛事身份、赛事 lifecycle 三层状态已经解耦；
- 审核前后团队编辑边界明确；
- GAP-05 冲突已按现行明确决策收口；
- PC / Mobile 回归契约已提交。

**暂不标 PASS。**

原因：当前 GitHub 直接 push 场景下仍需取得真实 build / Playwright 运行证据；另外 T032 教师审核工作台会决定减员审核入口最终落点。

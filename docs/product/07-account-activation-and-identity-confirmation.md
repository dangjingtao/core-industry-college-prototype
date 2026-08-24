# 07｜审核通过后的账号激活与赛事身份确认

> 状态：Current Design Draft / T028 子流程  
> 日期：2026-08-24  
> 上位设计：`06-account-lifecycle-and-phone-binding.md`  
> 适用：核心学院 App、PC 三创赛报名门户、账号服务、赛事服务、通知服务

---

## 1. 本文解决的问题

学校审核通过以后，系统需要同时处理两类完全不同的事情：

1. **赛事服务关系**：这个手机号对应的学生已经被审核通过为某团队成员；
2. **核心学院长期平台账号**：这个人是否已经主动激活并开始使用长期平台。

两者不能混成一个状态。

本轮确认后的原则是：

- 团队提交时只保存赛事报名成员记录，不创建队员长期账号；
- 学校审核通过后才执行账号解析；
- 手机号是账号解析的硬匹配字段；
- 姓名、学校、学号不是强制账号绑定条件，只能作为报名资料或可选辅助信号；
- 未注册手机号在审核通过后形成“待激活账号”；
- 已注册手机号复用原长期账号并自动增加赛事身份；
- 团队减员只改变赛事关系，不注销长期账号；
- 赛事时间之外允许自助换绑手机号，赛事中保留人工高风险换绑通道。

---

## 2. 核心状态模型

### 2.1 报名成员记录

队长录入成员后，先形成：

```text
RegistrationMember
  ├─ competitionId
  ├─ teamId
  ├─ phone
  ├─ name?          // 赛事资料，不是账号匹配硬条件
  ├─ school?        // 赛事资料，不是账号匹配硬条件
  ├─ studentId?     // 赛事资料，不是账号匹配硬条件
  └─ reviewStatus
```

在 `reviewStatus = pending` 时，不因为该成员尚未注册核心学院而创建长期账号。

### 2.2 审核通过后的账号解析

```text
school review approved
→ Account Resolution by phone
```

只有这一刻才产生账号侧写操作。

#### A. 手机号未命中长期账号

```text
AccountResolution = provisioned
AccountActivation = unclaimed
CompetitionBinding = bound
CompetitionAcknowledgement = unconfirmed
```

系统创建稳定 `userId`，但此时是**待激活账号**，不是“本人已经完成注册”的事实。

#### B. 手机号命中已有长期账号

```text
AccountResolution = registered
AccountActivation = active
CompetitionBinding = bound
CompetitionAcknowledgement = unconfirmed
```

不创建第二个账号。

#### C. 手机号解析本身异常

例如：

- 历史数据中一个手机号意外命中多个长期账号；
- 账号迁移留下无法唯一归属的数据异常；
- 新手机号正在另一笔高风险账号合并流程中。

进入：

```text
AccountResolution = conflict
CompetitionBinding = blocked
```

这里的 `conflict` 是**账号系统自身无法唯一解析手机号**，不是“姓名/学校/学号和已有账号不一致”。

---

## 3. 为什么姓名 / 学校 / 学号不做强绑定条件

本项目现实前提是：姓名、学校、学号并不保证全部存在，也不保证已经在长期账号内做过强实名绑定。

因此：

```text
手机号 = 登录与账号解析硬字段
姓名 / 学校 / 学号 = 赛事资料字段 / 可选辅助风险信号
```

系统不能因为长期账号里没有学号，就拒绝正常赛事身份绑定。

同样也不能假定“姓名不同一定是另一个人”，因为长期账号昵称、历史导入姓名、证件姓名可能不是同一数据源。

防止误绑的主要机制改为：

1. 学校审核通过后才执行绑定；
2. 绑定后状态先为 `unconfirmed`；
3. 短信 + 站内通知告诉手机号实际持有人；
4. 用户可以明确点击“这不是我的参赛信息”；
5. 被申诉的赛事身份进入 `disputed`，暂停高风险赛事操作并进入核验。

---

## 4. 未注册成员：待激活账号流程

学校审核通过：

```text
未命中手机号
→ 创建稳定 userId
→ 创建 provisioned_unclaimed 长期账号壳
→ 绑定本次 CompetitionIdentity
→ 写入账号来源 = competition_approved
→ 发送赛事服务短信
→ 等待本人首次进入
```

### 4.1 首次进入 App

推荐流程：

```text
手机号验证码
→ 命中 provisioned_unclaimed
→ 展示“赛事审核已通过”
→ 告知账号由哪场赛事 / 哪支团队触发
→ 展示必要的隐私与账号说明
→ 用户确认并激活长期账号
→ AccountActivation: unclaimed → active
→ CompetitionAcknowledgement: unconfirmed → confirmed
→ 补充可选长期资料
→ 进入 App
```

### 4.2 激活前的能力边界

待激活账号允许后台保存赛事服务所需的最小事实，但不应默认把它当作完整长期平台用户。

建议激活前：

- 可以保存赛事身份与必要报名资料；
- 可以发送审核结果、账号待激活等服务通知；
- 不默认订阅营销通知；
- 不默认建立课程 / 就业 / 广告兴趣画像；
- 不自动替用户领取长期平台权益；
- 不允许手机号自助换绑；
- 不允许修改高风险身份资料。

### 4.3 用户暂不激活

用户可以选择“稍后处理”。

此时：

```text
AccountActivation = unclaimed
CompetitionIdentity = 保留
```

不因为暂未使用 App 就否定已经审核通过的赛事成员事实。

正式系统是否提供“仅赛事服务、不激活长期平台”的 Web / H5 入口，由后续产品和法务确认；原型先保留状态，不强行假设。

---

## 5. 已注册成员：赛事身份自动关联

学校审核通过后：

```text
手机号命中 userId
→ 原账号增加 CompetitionIdentity
→ acknowledgement = unconfirmed
→ 尝试发送短信
→ 同时写入站内通知
```

用户不需要：

- 再注册一次；
- 再做 onboarding；
- 重新设置密码；
- 从 PC 主动领取赛事身份。

### 5.1 站内通知

通知建议：

> **你的账号已关联新的赛事身份**  
> 你已作为「成员」加入「第十六届三创赛 · XX 团队」。该身份来自学校已审核通过的团队报名资料。

主操作：

> 查看赛事

次操作：

> 这不是我的参赛信息

如果用户正常查看 / 确认：

```text
CompetitionAcknowledgement: unconfirmed → confirmed
```

---

## 6. “这不是我的参赛信息”纠错流程

用户点击后不能直接删除赛事身份，因为学校已经审核过团队事实。

建议：

```text
unconfirmed / confirmed
→ 用户发起异议
→ acknowledgement = disputed
→ 暂停该赛事身份的高风险操作
→ 创建赛事身份核验工单
→ 通知赛事运营 / 学校审核侧
```

### 6.1 disputed 时继续允许

- 登录核心学院；
- 使用与该赛事无关的课程 / 权益 / 其它赛事；
- 查看异议处理进度。

### 6.2 disputed 时暂停

建议暂停：

- 以该赛事身份提交新材料；
- 变更该赛事团队资料；
- 领取只属于该赛事身份的高价值权益；
- 生成新的可信赛事证明。

是否暂停普通只读赛事信息，可由赛事业务决定。

---

## 7. 减员后的账号状态

审核通过以后，成员已经可能拥有长期账号。

减员审核通过：

```text
TeamMembership → removed
CompetitionIdentity → revoked / removed
UserAccount → 不变
AccountActivation → 不变
phone binding → 不变
LongTermAssets → 按赛事规则保留
```

减员不是注销账号，也不是撤销这个人曾经存在过的报名事实。

---

## 8. 手机号换绑与赛事身份

### 8.1 赛外

用户无活跃赛事身份：

```text
验证旧手机号
→ 验证新手机号
→ 新手机号唯一性检查
→ 更新同一 userId 的 loginIdentifier.phone
→ 历史赛事身份和长期资产保持不变
→ 其它设备 session 失效
```

### 8.2 赛事中

普通自助换绑暂停。

但必须保留：

> 原手机号无法使用 / 紧急更换手机号

进入人工高风险换绑。

核验材料、冷却期仍属于后台实现前必须确认的风控参数。

---

## 9. 未认领账号的保留策略

这是后台必须具备但当前不拍死具体天数的能力。

配置建议：

```text
unclaimed_account_retention_days
unclaimed_account_reminder_schedule
unclaimed_account_cleanup_policy
```

清理时必须区分：

1. **账号激活状态**；
2. **赛事事实是否仍需要保留**。

不能简单执行：

```text
长期未登录 → 删除整个赛事成员历史
```

更合理的是：长期平台账号壳、通知记录、赛事法定 / 业务必要留存数据采用不同保留策略。

具体保存期限由业务、赛事规则与法务共同确认。

---

## 10. 通知矩阵

| 事件 | 短信 | 站内通知 | 是否要求用户动作 |
| --- | --- | --- | --- |
| 团队提交待学校审核 | 可不发给普通队员 | 可不创建 | 否 |
| 学校审核通过 + 未注册 | 服务短信：审核通过 / 待激活 | 激活后可见 | 首次使用需验证码与激活 |
| 学校审核通过 + 已注册 | 服务短信 | 必须创建 | 可确认 / 可申诉 |
| 赛事身份被申诉 | 可选 | 必须创建 | 等待处理 |
| 减员审核通过 | 服务短信可选 | 必须创建 | 否 |
| 手机号换绑成功 | 新旧手机号安全通知 | 必须创建 | 否 |

---

## 11. 后台接口语义建议

### 学校审核通过

```text
POST /registration/{teamId}/approve
→ persist review result
→ enqueue account-resolution jobs
```

账号解析应做成幂等：

```text
resolveAccount(registrationMemberId)
```

重复执行不能创建第二个 `userId` 或第二份赛事身份。

建议幂等键至少包含：

```text
competitionId + registrationMemberId
```

### 本人确认赛事身份

```text
POST /competition-identities/{id}/acknowledge
```

### 本人发起异议

```text
POST /competition-identities/{id}/dispute
```

### 激活待认领账号

```text
POST /accounts/{id}/activate
```

前置：手机号 OTP 已验证。

---

## 12. 当前仍开放的实现参数

不阻塞原型，但后台开发前要确认：

1. 待激活账号保留多久；
2. 提醒未激活用户几次、间隔多久；
3. 赛事中人工换绑的核验材料；
4. 换绑冷却期；
5. `disputed` 是否允许只读赛事工作区；
6. 学校审核撤回 / 误审后，已开户但未激活账号如何处置；
7. 如果审核通过后批量开户任务部分失败，PC 审核端如何显示重试与人工补偿。

---

## 13. T028 验收底线

- 团队提交不能创建普通队员长期账号；
- 只有学校审核通过后才执行账号创建 / 赛事身份绑定；
- 手机号是唯一硬账号匹配字段；
- 姓名 / 学校 / 学号不能成为长期账号强绑定前提；
- 未注册成员创建的是 `provisioned_unclaimed`，不是伪造“本人已注册”；
- 已注册成员自动绑定后必须有可见通知和“不是我的”纠错入口；
- 纠错不能影响用户其它 App 能力；
- 减员不能注销长期账号；
- 换绑手机号不能迁移 / 复制长期资产；
- 所有账号解析和开户操作必须幂等。
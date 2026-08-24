# T028｜跨端登录 / 注册 / 账号绑定统一流程｜施工记录

> 状态：设计主干已收口 / 中保真已施工 / 待实际测试证据  
> 分支：`dev`  
> 日期：2026-08-24  
> 正式设计：`docs/product/06-account-lifecycle-and-phone-binding.md`  
> 激活与身份确认子流程：`docs/product/07-account-activation-and-identity-confirmation.md`

---

## 1. Owner 已确认的账号原则

1. 队长在 PC 使用核心学院长期账号登录 / 注册并完成团队报名。
2. **团队提交时不创建普通队员长期账号，也不绑定赛事身份。**
3. 团队先进入学校审核；**学校审核通过后才执行普通队员账号创建 / 赛事身份绑定。**
4. 审核通过后：
   - 手机号未命中长期账号 → 创建 `provisioned_unclaimed` 待激活账号；
   - 手机号命中已有账号 → 复用同一 `userId`，自动增加本次赛事身份；
   - 账号系统无法唯一解析手机号 → `account_resolution = conflict`，转人工补偿。
5. 手机号是当前唯一硬账号匹配字段。
   - 姓名 / 学校 / 学号按赛事要求采集；
   - 不是长期账号强绑定前提；
   - 不因为缺失这些字段阻断正常账号绑定。
6. 自动关联赛事身份后先标记 `acknowledgementStatus = unconfirmed`，本人可选择“这不是我的参赛信息”进入 `disputed`。
7. 团队减员只影响本赛事团队关系和权限，不注销核心学院长期账号。
8. 赛事时间之外允许自助换绑手机号；赛事中普通自助换绑受限，但保留人工高风险换绑通道。
9. 新手机号已经属于另一个 `userId` 时，不自动合并账号、不自动迁移长期资产。

---

## 2. 核心数据语义

### 长期账号

```text
UserAccount
  userId                // 稳定主体
  loginIdentifiers.phone
  loginIdentifiers.wechat?
  StudentProfile
  CompetitionIdentity[]
  LongTermAssets
```

手机号是可更换登录凭证，不是不可变主键。

### 赛事身份

```text
CompetitionIdentity
  userId
  competitionId
  teamId
  role
  identityStatus
  assignmentSource = school_approved_team
  acknowledgementStatus = unconfirmed | confirmed | disputed
```

### 团队关系

```text
TeamMembership: active → removal_pending → removed
CompetitionIdentity: active → revoked / removed
UserAccount: 保持 active
```

---

## 3. 已施工｜PC 报名门户

### 数据模型

`apps/pc/src/registration-portal/model.tsx`

当前状态字段：

```text
AccountResolutionStatus
- registered
- provision
- provisioned
- conflict

CompetitionBindingStatus
- notBound
- bound
- blocked

CompetitionAcknowledgementStatus
- notApplicable
- unconfirmed
- confirmed
- disputed

AccountActivationStatus
- active
- pendingApproval
- unclaimed
- notApplicable
```

关键时序：

```text
submitReview()
→ 只把团队置为 pending
→ 不执行账号写操作

approveReview()
→ registered → bound + unconfirmed + active
→ provision → provisioned + bound + unconfirmed + unclaimed
→ conflict → 保持 blocked，后续人工处理
```

### PC 页面

`apps/pc/src/registration-portal/RegistrationPortal.tsx`

主流程已经调整为：

```text
队长账号
→ 赛事规则
→ 团队资料 / 成员录入
→ 学校审核
→ 审核通过后账号创建 / 绑定
→ 承诺书
→ 完成
```

页面明确显示：

- 审核前账号写操作为 0；
- 未注册成员“审核通过后创建”；
- 已注册成员“审核通过后绑定”；
- 账号解析异常不等同于学校审核失败；
- 学校可以先完成团队真实性审核，账号异常成员在审核通过后进入人工补偿；
- 减员不影响长期 App 账号。

---

## 4. 已施工｜Mobile 待激活账号与赛事身份确认

### 登录入口

`apps/mobile/src/features/auth/CompetitionAccountPage.tsx`

`CompetitionAwareLoginPage` 会把：

```text
/auth/login?accountCase=preaccount
```

导向待激活账号流程，而不是继续走普通登录页。

### 待激活账号

`/auth/competition-account?case=unclaimed`

表达：

- 学校审核已经通过；
- 系统已创建待激活账号；
- 激活前只保留赛事必要信息；
- 不默认开启课程推荐、就业画像、营销订阅；
- 用户阅读用户协议 / 隐私政策后主动激活长期平台能力；
- 激活后继续使用同一个 `userId`，不重新注册第二个账号。

### 已有账号新增赛事身份

`/auth/competition-account?case=existing`

表达：

- 系统已经复用原长期账号自动增加赛事身份；
- 默认 `acknowledgementStatus = unconfirmed`；
- 用户可确认“是我的参赛信息”；
- 用户也可点击“这不是我的参赛信息”。

### 身份异议

`/auth/competition-account?case=disputed`

异议只影响当前赛事身份：

- 暂停该赛事身份的高风险提交 / 高价值权益 / 新可信证明；
- 不影响其它赛事、课程、权益和长期账号；
- 进入人工核验。

---

## 5. 已施工｜账号安全与手机号换绑

### 账号中心

```text
/me/accounts
```

作为长期账号安全中心。

旧业务平台绑定保留到：

```text
/me/accounts/platforms
```

### 手机号换绑

```text
/me/accounts/phone
```

覆盖：

- 赛外：验证旧手机号 → 验证新手机号 → 更新同一 `userId` 的 phone identifier；
- 赛事中：普通自助换绑暂停；
- 原手机号失效：人工高风险恢复；
- 新手机号已经被其它账号占用：禁止自动合并。

---

## 6. 功能设计文档

### 主设计

`docs/product/06-account-lifecycle-and-phone-binding.md`

已记录：

- 稳定 `userId`；
- 审核通过后开户 / 绑定；
- 手机号唯一硬账号匹配；
- 待激活账号边界；
- 赛事身份纠错；
- 减员；
- 手机号换绑；
- 合规边界提示。

### 激活与身份确认

`docs/product/07-account-activation-and-identity-confirmation.md`

补齐：

- `RegistrationMember` 与长期账号分层；
- post-approval Account Resolution；
- `provisioned_unclaimed`；
- `acknowledgementStatus`；
- disputed 流程；
- 通知矩阵；
- 未认领账号保留策略配置；
- 后台接口与幂等建议；
- 批量开户失败后的补偿边界。

---

## 7. 测试契约已更新

### PC

`apps/pc/tests/registration-portal.spec.ts`

覆盖：

- 学校审核前 0 个账号创建 / 0 个赛事身份绑定；
- 审核通过后才创建待激活账号与绑定已有账号；
- 手机号账号解析异常不推翻学校审核结果；
- 减员不影响长期 App 账号。

### Mobile

`apps/mobile/tests/t028-account-lifecycle.spec.ts`

覆盖：

- `accountCase=preaccount` 进入激活流程；
- 待激活账号必须由本人显式激活长期平台；
- 已有账号可以确认新增赛事身份；
- “这不是我的参赛信息”进入 disputed，且其它 App 能力不受影响。

`apps/mobile/tests/t028-phone-rebinding.spec.ts`

覆盖手机号换绑主要状态。

**当前 GitHub `dev` 没有返回对应 commit 的 CI / status checks，因此本记录不标记 build / Playwright PASS。**

---

## 8. 当前仍开放的实现参数

这些不再改变 T028 主架构，但后台实现前需要产品 / 风控 / 法务确认：

1. `unclaimed_account_retention_days`：待激活账号保留多久；
2. 未激活账号提醒次数与间隔；
3. 赛事中人工手机号换绑需要哪些核验材料；
4. 手机号换绑冷却期；
5. `disputed` 是否允许当前赛事工作区只读；
6. 学校审核撤回 / 误审时，已创建但未激活账号怎么处置；
7. 审核通过后的批量账号任务部分失败时，审核端的重试 / 补偿 UI；
8. 同一学生在同一赛事是否存在允许跨团队 / 多赛道的特殊规则。

这些应该作为可配置规则或后续 Owner 决策，不应再让前端自己猜。

---

## 9. 当前判断

**T028 的产品设计主干可以视为已收口。**

尚未满足“工程 PASS”的唯一原因是缺少实际构建与 Playwright 运行证据；在得到测试证据之前，任务状态保持“设计完成 / 实现已提交 / 待验证”，不标记最终 PASS。

# T028｜跨端登录 / 注册 / 账号绑定统一流程｜施工记录

> 状态：施工中 / 本轮账号生命周期设计与中保真原型已落地  
> 分支：`dev`  
> 关联：T015、T015R1、F01、F03、T029、`2026-08-24-meeting-redesign-task-cards.md`  
> 正式功能设计：`docs/product/06-account-lifecycle-and-phone-binding.md`

---

## 1. 2026-08-24 新会议决策

本轮会议进一步确认：

1. 队长在 PC 登录 / 注册并提交团队资料；
2. 团队成员正式提交后：
   - 未注册队员自动获得核心学院 App 账号；
   - 已注册队员自动绑定本次赛事身份；
   - 通过短信提醒，或在后续登录时提示；
3. 团队减员不影响核心学院 App 长期账号；
4. 赛事时间之外允许手机号换绑，需要单独设计安全流程。

本轮施工以这四条为新基线，同时保留既有不可破坏原则：长期账号与赛事身份分离、一个账号支持多个赛事身份、不建立第二份 session / identities / Profile 真相源。

---

## 2. 本轮新增产品设计结论

### 2.1 稳定 userId + 可更换手机号

将长期账号定义为稳定 `userId`，手机号只是可验证、可更换的登录凭证。

因此：

- 换手机号不创建新账号；
- 换手机号不迁移证书 / 课程 / 简历 / 赛事身份；
- 减员不注销账号；
- 微信也只是登录 / 恢复凭证之一，不另建微信 Profile。

### 2.2 自动建号不是“已本人确认”

未注册成员被队长正式提交后进入：

```text
provisioned_unclaimed
```

含义：

- 系统已建立稳定 userId；
- 已挂本次赛事身份；
- 但本人尚未通过手机号验证码认领；
- 不使用统一默认密码；
- 首次进入 App 时验证手机号后认领同一个账号。

### 2.3 自动绑定必须允许冲突态

手机号命中已有账号，不代表一定属于同一个人。

当前产品建议：

- 手机号 + 姓名 / 学校 / 学号等字段一致 → 自动绑定；
- 明显冲突 → `account_resolution = conflict`；
- 冲突时不自动绑定赛事身份，不自动迁移资产。

### 2.4 通知建议采用“双保险”

会议原话是“短信提醒 / 或登录时弹窗提示”。本轮产品设计建议实际实现为：

```text
账号开通 / 新赛事身份事件
→ 尝试短信
→ 同时写持久化站内通知
→ 当前在线或下次登录展示
```

原因：短信可能失败、被拦截或号码临时不可达；站内通知应作为可追溯事实。

并应提供“这不是我的参赛信息 / 需要核对”申诉入口。

---

## 3. PC 报名门户已施工

### 数据模型

`apps/pc/src/registration-portal/model.tsx`

新增：

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
```

提交团队时：

- `registered` → 复用已有账号并绑定赛事身份；
- `provision` → 自动开通为 `provisioned` 并绑定赛事身份；
- `conflict` → 阻止静默提交 / 自动绑定。

同时对同一成员 ID / 同一手机号做重复拦截。

提交：

- `2c5e588c59ee171b00590730423e67c73912ea00` — `feat(T028): model automatic member account provisioning`

### PC 页面重设计

`apps/pc/src/registration-portal/RegistrationPortal.tsx`

已改为：

```text
队长 PC 登录 / 注册
→ 赛事规则
→ 团队资料
→ 直接录入成员
→ 成员账号解析
→ 正式提交
→ 学校审核
```

关键变化：

- 移除“队员必须先到 PC 注册”的主流程；
- 移除“只能通过已注册邮箱搜索队员”的依赖；
- 队长可直接录入姓名 / 学校 / 手机号 / 邮箱 / 学号；
- 页面直接展示：已有账号 / 未注册自动开通 / 身份冲突；
- 身份冲突时团队不能静默提交；
- 明确减员只改变本赛事团队关系与权限，不影响 App 长期账号。

提交：

- `3d313432156f92c46aa70a944ad64e4439d3898a` — `feat(T028): redesign leader registration and member provisioning flow`

---

## 4. Mobile 账号与手机号换绑已施工

### 4.1 账号识别 / 认领第一切片

`apps/mobile/src/features/auth/AuthPages.tsx`

此前已增加：

- 历史账号命中；
- 队长代录 / 自动开通待认领；
- 手机号账号冲突；
- 微信登录沿用同一账号识别语义。

提交：

- `fe84f40c284d6945b9e39295eea3a501755b284b` — `feat(T028): add account recognition and claim states`
- `738b6480f15acf699b9802295f0877de0524cc5f` — `test(T028): cover account recognition and claim states`

### 4.2 账号与安全中心

新增：

`apps/mobile/src/features/auth/AccountSecurityPage.tsx`

`/me/accounts` 由原先狭义的“第三方账号绑定”升级为长期账号安全入口：

- 登录手机号；
- 微信凭证；
- 业务平台账号；
- 长期账号 / 赛事身份 / 资产关系说明。

旧抖音 / 快团团 / 三创好物账号绑定保留在：

```text
/me/accounts/platforms
```

提交：

- `18eb591c4d4988d94b948bea29e70e51484d32ea` — `feat(T028): add account security hub`
- `2f7220b39dcb8b7ef31d1dc7323067ea7556cf7d` — `feat(T028): make account security the account hub`

### 4.3 手机号换绑

新增：

`apps/mobile/src/features/auth/PhoneBindingPage.tsx`

路由：

```text
/me/accounts/phone
```

覆盖四类关键状态：

1. **存在活跃赛事身份**
   - 普通自助换绑暂停；
   - App 其它功能正常；
   - 保留“原手机号不可用 / 紧急换绑”人工高风险通道。
2. **赛事时间之外**
   - 验证当前手机号；
   - 验证新手机号；
   - 更新同一长期账号的 phone identifier。
3. **新手机号已属于其它账号**
   - 明确禁止自动合并；
   - 当前资产 / 身份保持原状；
   - 转人工核验。
4. **原手机号无法使用**
   - 不绕过当前手机号验证直接换绑；
   - 转人工账号恢复；
   - 核验材料仍待最终业务确认。

提交：

- `1ea2512acc7c8cd00e3e9f5cb8a2a6e348de27c4` — `feat(T028): add phone rebinding lifecycle prototype`
- `42a6429404cb0737cd8d7ec1295f3307524fc812` — `feat(T028): route phone rebinding prototype`

### 4.4 路由登记

`apps/mobile/src/routes/registry.ts`

已登记：

- `/me/accounts`
- `/me/accounts/phone`
- `/me/accounts/platforms`

并补充登录页的历史账号 / 自动开通账号 / 冲突状态描述。

提交：

- `06964e4e512a64ee2e826b2f1ff2914fada7ff4e` — `docs(T028): register account lifecycle routes`

---

## 5. 回归测试

### PC

更新：

`apps/pc/tests/registration-portal.spec.ts`

覆盖：

- 队长 PC 登录与团队报名；
- 已注册成员自动绑定赛事身份；
- 未注册成员自动开通账号；
- 手机号 / 实名冲突阻止自动绑定；
- 减员不影响长期 App 账号；
- Mobile → PC 报名 handoff 仍保留 competition context。

提交：

- `92a71dd8bd28dcb2113f98a406563f18fb086886`
- `ef950053236d24ddc0307a8dd21fe37ca9cda45c`

### Mobile

新增：

`apps/mobile/tests/t028-phone-rebinding.spec.ts`

覆盖：

- 账号与安全中心；
- 活跃赛事期自助换绑阻止；
- 赛外自助换绑；
- 新手机号冲突不自动合并；
- 原手机号失效转人工恢复。

提交：

- `ae980fef708f1b0c49676f4213ec1dad16bfd37f` — `test(T028): cover phone rebinding lifecycle states`

当前只完成了代码与用例提交；本记录不伪造本地 Playwright / build 已通过。后续以 CI 或实际运行结果为准。

---

## 6. 仍需 Owner 最终确认

以下问题已经压缩到不会阻塞中保真施工，但真实后台实现前必须定：

### A. 自动开通的准确时点

选项：

1. 队长正式提交团队时；
2. 学校审核通过后。

当前设计建议：**团队正式提交时创建 `provisioned_unclaimed` + pending CompetitionIdentity，学校审核通过后才激活正式赛事权限。**

优点：成员能尽早收到通知、认领账号、看到待审核状态；同时不会提前获得赛事工作区权限。

代价：即使团队最终审核失败，也可能已经产生一个长期账号。该账号仍可作为公共平台账号正常使用。

### B. 自动绑定实名一致性规则

当前建议至少：

```text
手机号命中
+ 姓名一致
+ 学校 / 学号至少用于冲突检查
```

但最终哪些字段属于强校验、哪些只做提醒，需要 Owner / 业务确认。

### C. 活跃赛事期手机号换绑

当前设计建议：

- 普通自助换绑关闭；
- 紧急情况保留人工高风险换绑；
- 不建议彻底禁止，因为用户可能丢失 SIM / 被销号。

### D. 手机号换绑冷却期

建议做后台可配置，不写死在客户端。

具体 7 / 15 / 30 天尚未定。

### E. 原手机号失效时的人工身份核验材料

候选包括：

- 已绑定微信；
- 赛事实名字段；
- 学校 / 学号；
- 已验证邮箱；
- 人工客服审核。

具体组合与强度尚未确认。

### F. 同一赛事的多团队 / 多赛道例外

默认应阻止同一 `userId` 在互斥团队中重复绑定；若真实赛制允许一人多赛道，需要赛事规则显式配置，不能写死为平台通用规则。

---

## 7. 下一步

T028 还需要：

1. 把“新赛事身份自动关联”的站内通知 / 登录提示做成可演示状态；
2. 等 CI / 实际浏览器回归结果后修复潜在回归；
3. Owner 确认第 6 节关键业务规则后，把 Current Design Draft 升级为确认基线；
4. 与 T029 的报名阶段 / 团队生命周期进一步对齐，避免两个任务对“提交 / 审核 / 减员”的时点各自定义。

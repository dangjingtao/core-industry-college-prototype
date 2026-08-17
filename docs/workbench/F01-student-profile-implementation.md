# F01｜学生主档 + Onboarding / Profile / 问卷｜施工记录

> 日期：2026-08-17  
> 分支：`dev`  
> 状态：待评审  
> 起始 HEAD：`18528090ca70670563f7627982b79e267de3a88e`

## 1. 本卡结论

F01 不恢复第二套“问卷档案”，而是建立长期账号唯一学生主档 `StudentProfile`。

当前关系：

```text
onboarding/profile
       ↓
StudentProfile + field sources
       ↑
/me/profile
       ↑
registration callback / workshop questionnaire
```

赛事身份 `identities[]`、报名生命周期、长期简历 presentation 仍是各自原有真相源，不并入 StudentProfile。

## 2. StudentProfile 字段

| 字段 | 语义 | 默认入口 | 可回流来源 |
| --- | --- | --- | --- |
| `name` | 姓名 / 长期简历展示 | `/me/profile` | profile |
| `nickname` | 昵称 | onboarding 必填 | profile |
| `gender` | 性别 | profile 可选 | onboarding/profile |
| `phone` | 绑定手机号 | onboarding 必填 | registration/profile |
| `phoneVerified` | 手机号验证状态 | onboarding | registration/profile |
| `birthday` | 生日 | profile 可选 | onboarding/profile |
| `school` | 学校 | onboarding 必填 | registration/profile |
| `major` | 专业 | onboarding 必填 | registration/profile |
| `city` | 所在地区 | onboarding 必填 | registration/profile |
| `email` | 邮箱 | profile 可选 | profile |
| `identityType` | 用户身份类型 | 可跳过问卷 | registration/workshop/profile |
| `competitionExperience` | 三创赛经历 | 可跳过问卷 | registration/workshop/profile |
| `industryFields` | 所属 / 意向产业领域 | 可跳过问卷，多选 | workshop/profile |
| `educationLevel` | 最高学历 | 可跳过问卷 | registration/workshop/profile |
| `workYears` | 从业年限 | 可跳过问卷 | workshop/profile |
| `coreNeeds` | 核心使用需求 | 可跳过问卷，多选 | workshop/profile |
| `serviceInterests` | 关注服务类型 | 可跳过问卷，多选 | workshop/profile |

原型阶段多选值使用逗号分隔的稳定 id 存在 StudentProfile 内，目的是避免再产生 questionnaire answer store；真实后台接入时可替换为数组 / 关系表，不改变页面职责。

## 3. 旧 Mockplus 字段去向

| 旧字段 / 能力 | 处理 | 理由 |
| --- | --- | --- |
| 昵称 | 保留 | 长期账号基础展示字段 |
| 性别 | 保留，可选 | 不是完成 onboarding 的强制门槛 |
| 手机号 | 保留，onboarding 必填 | 联系与账号基础信息 |
| 11 位手机号校验 | 保留 | 中保真本地校验 |
| 短信验证码 | 保留为 mock | 原型验证码固定 `123456`，不接真实短信 |
| 生日 | 保留，可选 | 放入长期 profile，不强迫首次填写 |
| 用户身份类型 | 保留 | 可选问卷；统一枚举 |
| 是否参加过三创赛 | 保留并扩为 本届 / 往届 / 暂未参加 | 报名可回流，问卷只负责补缺 |
| 所属 / 意向产业领域 | 保留 | 可选多选 |
| 最高学历 | 保留 | 可由报名 / 问卷 / profile 共同补充 |
| 从业年限 | 保留 | 可选问卷 |
| 核心使用需求 | 保留 | 代替旧重构只有四个粗粒度偏好的做法 |
| 关注服务类型 | 保留 | 与核心需求分开，不再压成同一个标签组 |
| 所在地区 | 合并到 `city` | onboarding 已采集，不在问卷重复询问 |
| 旧四个关注项 | 合并 | 含义落入 `coreNeeds` / `serviceInterests`，不再保留第二套 focus state |
| 独立 questionnaire profile | 废弃 | 防止与长期 profile 脱节 |
| 不透明画像评分 | 不实现 | 没有可解释数据来源，不属于 F01 |

## 4. 入口职责

### onboarding 基础资料

首次资料只要求：

- 昵称；
- 已验证手机号；
- 学校；
- 专业；
- 所在地区。

手机号验证码为中保真 mock；修改手机号后必须重新验证。

### 可跳过问卷

问卷负责补充：

- 身份类型；
- 三创赛经历；
- 产业方向；
- 最高学历；
- 从业年限；
- 核心需求；
- 关注服务。

地区不再重复询问。

### `/me/profile`

与 onboarding 直接读写同一个 `StudentProfile`，并显示关键字段当前来源。用户可以长期维护基础资料，并从这里回到可选问卷更新需求信息。

### 赛事报名回流

`LongTermAssetsProvider` 暴露 `mergeProfileFromSource(patch, "registration", mode)`：

- 默认 `fill-empty`：只补主档空白字段，不用报名数据静默覆盖用户长期资料；
- 可显式使用 `replace`：若后续 F00 协议确认某个字段以报名为准，可由 callback 明确覆盖；
- 回流字段会记录 `registration` 来源；
- F00 尚未完成真实跨端 callback，本卡不伪造它已经接通。

因此 F00 后续只需把 callback 中可复用的 profile patch 喂进该接口，不再新建 Registration Profile。

### 创赛工坊问卷

复用同一个 `mergeProfileFromSource(patch, "workshop", ...)` 协议。工坊只补充它真实采集到的字段，不维护第二份“画像答案”。

## 5. 代码范围

新增：

- `apps/mobile/src/features/long-term-assets/studentProfile.ts`
- `apps/mobile/src/features/long-term-assets/StudentProfilePages.tsx`
- `docs/workbench/F01-student-profile-implementation.md`
- `apps/mobile/tests/f001-phone-verification.spec.ts`

修改：

- `apps/mobile/src/features/long-term-assets/store.tsx`
- `apps/mobile/src/app/App.tsx`

未修改：

- PC / 响应式报名门户；
- `identities[]` / registration lifecycle；
- F02 企业 / 验真；
- F03 简历结构化字段；
- F04 冻结业务；
- `SupportPages.tsx` 中已不再被 App 使用的旧 onboarding 死代码（本轮不扩大范围清理）。

## 6. 施工提交与验证

初始实现提交：

- `a7a57091037990161bc3a4d0879641a5995a9185` — StudentProfile 模型；
- `8e230b6f53ff7bf6d0f1c0592337994721aa4a06` — 长期主档 provider；
- `0994f12faf0f11eb7b00220b777b0efaa015b7fc` — onboarding / profile 页面；
- `ac2465d27918666c9cc79f445daf01c173aa9524` — 路由切换并合并并发 F02 改动。

初始 CI：

- GitHub Actions run `32013927360`
- Workflow：`Deploy Mobile to Cloudflare Pages`
- `dev` 阶段执行 `npm run build:development --workspace @core/mobile`，包含 TypeScript 检查与 Vite build；
- 结果：`success`。

## 7. 首轮独立评审与窄修复

正式评审：

- 评审文件：`docs/workbench/F01-review.md`；
- 评审提交：`22577671923803ddcb84ad333df965b9e7c8524e`；
- 结论：`CHANGES REQUIRED`；主体 StudentProfile / 问卷模型 / merge 接口通过，仅阻断手机号验证码的 UI / 父层状态不同步。

修复原则：

- 父层 `phoneVerified` 作为保存 gate 与 UI 的唯一验证状态；
- 输入正确验证码本身不再直接推导“手机号已验证”；
- 只有点击“验证”且验证码为 `123456` 时才调用 `onVerifiedChange(true)`；
- 修改手机号会清除本次验证码发送 / 输入状态；
- 改回原本已经 verified 的手机号时，同步恢复父层 `phoneVerified=true`，不再出现子组件与父层状态分裂。

修复与测试提交：

- `7da28be0b12e74db148b7149ae4f746dc523833a` — 修复 PhoneVerification 状态同步；
- `87b5e6d84524fdb37d8e4bde4b86f43b3d48c8b4` — 新增 focused Playwright；
- `8849cf7f896313d17506d99586a7def96bb57f1f` — Playwright 使用 exact 验证按钮 selector；
- `bb9ec432f2eb37f09cd97a66cc4c09bfb55ad1ca` — 通过 SPA 返回 `/me/profile` 验证 provider 中已保存的新手机号和 verified 状态；
- `b19a4cb4cf7bcd781b26158dd6889160220766bb` — browser PASS 后删除临时一次性 workflow，保留 focused test。

Focused Playwright 覆盖：

```text
/me/profile
→ 新手机号
→ 保存禁用
→ 错误验证码 654321
→ 仍不可保存、不可显示已验证
→ 正确验证码 123456
→ 点击验证
→ 保存开放
→ 保存返回 /me
→ SPA 再进入 /me/profile
→ 新手机号仍在且 verified
```

Browser 证据：

- GitHub Actions run `32019232067`；
- `Build mobile preview`：success；
- Chromium 安装：success；
- `Run focused F001 browser test`：success；
- run 总结论：`success`。

说明：第二次试跑曾使用 `page.goto("/me/profile")` 强制刷新，导致纯内存 prototype provider 重建 seed；这不属于 F01 的“保存后同一 App 会话状态”契约，因此最终测试改为 SPA 返回页面，不额外引入跨刷新持久化模型。

## 8. 待快速复审

当前实现已针对首轮 `CHANGES REQUIRED` 的唯一阻断项完成窄修复并取得 focused browser PASS。

复审重点：

1. 新手机号输入正确验证码前，父层保存 gate 始终为 false；
2. 输入 `123456` 不会自动显示 verified，点击“验证”后才同步为 true；
3. 错码不会开放保存；
4. 改回原本 verified 的手机号时父层同步恢复 verified；
5. 保存后通过 SPA 返回 `/me/profile`，手机号与 verified 状态仍读取同一 StudentProfile；
6. StudentProfile、问卷模型、`mergeProfileFromSource()` 未返工；
7. `SupportPages.tsx` 旧 onboarding 死代码未在本轮顺手扩大处理。

施工线程仍不自行标记 `PASS`，等待独立快速复审。

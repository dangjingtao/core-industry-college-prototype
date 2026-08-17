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

修改：

- `apps/mobile/src/features/long-term-assets/store.tsx`
- `apps/mobile/src/app/App.tsx`

未修改：

- PC / 响应式报名门户；
- `identities[]` / registration lifecycle；
- F02 企业 / 验真；
- F03 简历结构化字段；
- F04 冻结业务。

## 6. 施工提交与验证

实现提交：

- `a7a57091037990161bc3a4d0879641a5995a9185` — StudentProfile 模型；
- `8e230b6f53ff7bf6d0f1c0592337994721aa4a06` — 长期主档 provider；
- `0994f12faf0f11eb7b00220b777b0efaa015b7fc` — onboarding / profile 页面；
- `ac2465d27918666c9cc79f445daf01c173aa9524` — 路由切换并合并并发 F02 改动。

CI：

- GitHub Actions run `32013927360`
- Workflow：`Deploy Mobile to Cloudflare Pages`
- `dev` 阶段执行 `npm run build:development --workspace @core/mobile`，包含 TypeScript 检查与 Vite build；
- 结果：`success`。

## 7. 待独立评审

评审重点：

1. onboarding 与 `/me/profile` 修改后是否即时共享同一 profile；
2. 修改手机号后未验证时是否禁止保存；
3. 可选问卷跳过不会清空既有主档；
4. 地区不会在问卷重复追问；
5. `ResumePage` 继续读取同一 profile 的姓名 / 学校 / 专业 / 地区 / 邮箱；
6. `mergeProfileFromSource` 不新建 questionnaire / registration profile；
7. F00 未完成前不把“真实报名 callback 已接通”算作 F01 验收事实。

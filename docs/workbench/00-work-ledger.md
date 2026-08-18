# 核心产业学院原型｜工作台账

> 分支：`dev`  
> 用途：作为当前原型补漏、产品决策、施工与评审的统一工作入口。  
> 原则：**页面有路由不等于功能完整；能明确补的直接补，涉及业务模型替换的先决策。**

---

## 1. 当前基线

当前新仓库已经完成手机端主要可交互原型迁移，并独立存在 PC / 响应式三创赛报名门户。

本台账后续检查的主要依据：

1. `docs/product/00-product-master-context.md`：产品总纲与业务边界；
2. `docs/product/01-legacy-mockplus-audit.md`：Google Drive 原始 140 页 Mockplus 的功能级审计；
3. `docs/product/02-open-decisions-and-backlog.md`：已发现缺口与未决业务；
4. `docs/reference/legacy-page-map.tsv`：旧 140 页 → 新结构映射；
5. `docs/migrations/mobile-from-com-design.md`：手机端迁移、66 semantic routes、母动线与验收证据；
6. `apps/mobile/`：当前手机端实际实现；
7. `apps/pc/src/registration-portal/`：当前 PC / 响应式三创赛报名门户实际实现。

### 当前产品基线不可破坏

- App 账号长期存在；赛事身份按具体赛事生命周期存在；
- 一个账号可以有多个赛事身份；
- 公共平台不依赖赛事身份；
- 创赛工坊属于具体赛事上下文，不是全局 AI；
- 赛事结束后经历、项目、成绩、证书、学习成果继续归长期账号；
- 企业是赛事 / 权益 / 课程 / 活动 / 机会的资源与品牌主体，不只是招聘公司；
- 不重复建立 session / identities / lifecycle / applications 真相源；
- `/tasks`（D03）在聚合展示层已由 2026-08-17 后续决策解冻；`/me/subjects`（D08）继续冻结。

---

## 2. 总状态

| 卡片 | 主题 | 类型 | 状态 | 前置 |
| --- | --- | --- | --- | --- |
| F00 | 手机端接入现有响应式报名门户 | 施工 | 待评审 | 无 |
| F01 | 学生主档 + Onboarding / Profile / 问卷 | 施工 | 待评审 | F00 协议边界明确后可施工 |
| F02 | 企业可信信息 + 可信凭证完整能力 | 施工 | 待评审 | 可与 F01 并行 |
| F03 | 账号 / 简历 / 团队 / 外部 handoff 补齐 | 施工 | 待评审 | F01 部分数据模型 |
| F04 | 学力值 / 第三方账号 / 任务 / 主体 / 创域等 | 产品决策 | 待决策 | 可并行讨论，不允许施工线程自行拍板 |
| T006 | 创赛福利板块补充 | 施工 | 待执行 | F04 Decision A |
| T007 | 三创同学会（原赛友风采） | 施工 | 已完成 | 无 |
| T008 | 可信空间补充 | 施工 | 待执行 | F02 |
| T009 | 智能客服原型 | 施工 | 待执行 | 无 |
| T010 | 通知中心 | 施工 | 待执行 | 无 |
| T011 | 课程深度功能 | 施工 | 待执行 | F04 Decision A、T008 |
| T012 | 社区重构 | 施工 | 待执行 | F02、F04 Decision C |
| T013 | 创赛工坊完整功能 | 施工 | 待执行 | 赛事工作区上下文 |
| T014 | 我的页面设计语言总结 + 功能补齐 | 施工 | 待执行 | F03、T009、T010 |
| T015 | 登录注册流程 | 施工 | 待执行 | F01、F03 |

推荐主顺序：

```text
F00 → F01 → F02 → F03 → R-Final 功能级总回归
             ↘
              F04 产品决策可并行推进

T 系列补充任务（可与 F 系列并行，注意前置依赖）：

T015 登录注册 → T014 我的页面设计语言
                  ↘
                   T010 通知中心 → T009 智能客服
                  ↘
                   T008 可信空间 → T011 课程深度功能
                  ↘
                   T013 创赛工坊
                  ↘
                   T006 创赛福利（依赖 F04 A）
                  ↘
                   T007 三创同学会
                  ↘
                   T012 社区重构（依赖 F04 C）
```

---

# F00｜手机端接入现有三创赛响应式报名门户

**类型：施工卡**  
**状态：待评审**  
**优先级：P0**

## 背景

新仓库 PC 端已经存在完整的响应式三创赛报名门户：

```text
/registration-portal/*
```

已经承接：

- 队长 / 队员身份；
- 账号注册；
- 赛事规则答题；
- 团队报名；
- 添加 / 移除队员；
- 学校审核 pending / rejected / approved；
- 承诺书；
- 报名完成；
- 团队业绩报告；
- 证书入口。

**禁止再造第二套 PC 报名页。**

当前手机端 `/competitions/:competitionId/registration` 仍把“响应式报名”作为内部模拟状态，并没有真正进入现有门户。

## 目标

把：

```text
手机赛事详情
→ 现有响应式报名门户
→ 提交 / 状态变化
→ 返回手机端
→ identities[] 状态回流
```

真正接成一条原型母动线。

## 最低交付

1. 手机报名入口实际打开当前环境对应的响应式报名门户；
2. 至少传递：
   - `competitionId`
   - `returnTo`
   - 必要账号 / 来源上下文（原型协议即可）；
3. PC 报名门户提供明确“返回 App / 返回赛事”出口；
4. 报名提交后，手机端共享 `identities[]` 得到对应赛事的 `pending`；
5. approved / rejected 的回流协议有明确模拟方式；
6. 同一赛事不能在 PC 与 mobile 各自产生互不相认的报名事实；
7. dev / prod CF 地址通过环境配置管理，不把某个预览 URL 写死进业务组件；
8. 后续真实后台接入时应只替换 handoff / callback 层，不重画报名 UI。

## 禁止

- 不把 PC 报名表重新搬到手机端；
- 不新建第二个 Registration Store 作为长期账号身份真相源；
- 不把 `competitionId` 丢掉；
- 不因为原型跨域困难就退回纯文字“模拟进入响应式报名”。

## 验收动线

```text
无赛事身份
→ 手机赛事详情
→ 报名
→ 现有响应式门户
→ 队长或队员流程
→ 提交
→ 返回手机
→ pending
→ 模拟 approved / rejected
→ 我的赛事 / workspace 读取同一 identities[]
```

## 施工记录

- 开始时 branch HEAD：`19ad03d08eb38166fe6a95e0c1a137e2281c6321`；提交前发现 F01 / F02 并行推进，实际安全 rebase 到 `d5d2e211e771d242034beb1e3698c55f34189fea` 后再提交，没有覆盖并行改动；
- 实际修改范围：
  - `packages/shared/src/registration-handoff.ts`
  - `packages/shared/src/index.ts`
  - `apps/mobile/src/features/competition-workspace/RegistrationHandoffPage.tsx`
  - `apps/mobile/src/app/App.tsx`
  - `apps/mobile/.env.development`
  - `apps/mobile/.env.production`
  - `apps/mobile/.env.example`
  - `apps/mobile/src/vite-env.d.ts`
  - `apps/mobile/tests/mother-flows.spec.ts`
  - `apps/pc/src/App.tsx`
  - `apps/pc/src/registration-portal/model.tsx`
  - `apps/pc/tests/registration-portal.spec.ts`
  - `docs/workbench/F00-registration-handoff.md`
- 实现提交：`adbaedf8be2f4e60516ebccab21dee0e50b6a1fe`；
- Mobile 已不再走“进入响应式报名（模拟）”路由实现，而是按环境变量生成真实 PC portal handoff URL；协议传递 `competitionId`、绝对 `returnTo`、`source=mobile-app` 与原型账号来源上下文；
- PC portal 从 Mobile 进入时保留短期 handoff 上下文并提供显式“返回 App / 赛事”按钮；`pending / rejected / approved / draft` 通过 callback URL 返回；队员完成注册等待队长绑定按 `pending` 回流；
- Mobile callback 只写已有 Public Platform `identities[]`：`pending → pending`、`rejected → rejected`、`approved → active`；处理后清理 callback query，没有新增第二份长期赛事身份 Store；
- dev / prod 对应 PC Cloudflare 地址由 `VITE_REGISTRATION_PORTAL_URL` 管理，本地模板使用 `5173 → 5174`；业务组件不写死某次预览 URL；
- Build / CI：GitHub Actions `Deploy PC to Cloudflare Pages` run `32014377562` 与 `Deploy Mobile to Cloudflare Pages` run `32014377555` 均完成 dev type-check、Vite build 与 Cloudflare deploy，结论 `success`；
- Mobile mother flow B 与 PC portal Playwright 已补跨端协议 / callback 回归用例；当前部署 workflows 不执行 Playwright，因此浏览器用例属于已提交的评审证据，仍需独立评审实际执行，不把“测试已写”冒充 browser PASS；
- 协议与真相源边界详见 `docs/workbench/F00-registration-handoff.md`；
- 当前结论：实现完成，等待独立功能评审；施工线程不自行标记 `PASS`。

---

# F01｜学生主档 + Onboarding / Profile / 问卷

**类型：施工卡**  
**状态：待评审**  
**优先级：P0**

## 问题

当前手机 onboarding 主要只有：

- 学校；
- 专业；
- 城市；
- 参赛 / 实习就业 / 企业项目 / 课程成长四个偏好。

而且 onboarding 草稿与长期 `/me/profile` 仍未真正共用一份学生主档。

Google Drive 原始 Mockplus 中还存在大量真实采集维度：

- 昵称；
- 性别；
- 手机号 / 验证码；
- 生日；
- 用户身份类型；
- 是否参加过三创赛；
- 所属 / 意向产业领域；
- 最高学历；
- 从业年限；
- 核心使用需求；
- 关注服务类型；
- 所在地区。

## 目标

建立一份长期学生主档（可命名 `StudentProfile` 或等价模型），让：

```text
注册 / onboarding
赛事报名回流
可选问卷
/me/profile
长期简历
创赛工坊后续问卷
```

围绕同一学生数据模型协作，而不是各存一份孤岛。

## 最低交付

- 定义长期主档字段与来源；
- onboarding 与 `/me/profile` 使用同一真相源；
- 手机号 / 验证码可以中保真模拟；
- 明确注册必填、可跳过问卷、报名回流、工坊采集之间的职责；
- 已由三创报名得到的字段避免重复追问；
- 学校、专业、地区、学历、身份类型等尽量使用统一语义；
- 旧问卷每个仍有业务价值的维度都有明确去向：保留 / 合并 / 废弃及理由。

## 禁止

- 不把完整旧问卷 1:1 生搬回来；
- 不再新建一份独立 questionnaire profile 与长期 profile 脱节；
- 不用“画像”名义虚构不可解释的用户评分。

## 施工记录

- 开始时 branch HEAD：`18528090ca70670563f7627982b79e267de3a88e`；
- 实际修改范围：
  - `apps/mobile/src/features/long-term-assets/studentProfile.ts`
  - `apps/mobile/src/features/long-term-assets/StudentProfilePages.tsx`
  - `apps/mobile/src/features/long-term-assets/store.tsx`
  - `apps/mobile/src/app/App.tsx`
  - `docs/workbench/F01-student-profile-implementation.md`
- 实现提交：
  - `a7a57091037990161bc3a4d0879641a5995a9185`
  - `8e230b6f53ff7bf6d0f1c0592337994721aa4a06`
  - `0994f12faf0f11eb7b00220b777b0efaa015b7fc`
  - `ac2465d27918666c9cc79f445daf01c173aa9524`
- Onboarding 与 `/me/profile` 已改读写同一长期 `StudentProfile`；手机号 / 验证码使用中保真 mock；旧问卷中的身份、参赛经历、产业方向、学历、从业年限、核心需求、关注服务均有明确去向；
- `mergeProfileFromSource` 提供 registration / workshop → StudentProfile 的统一回流层，默认只补空白字段，避免施工线程自行决定报名覆盖长期资料；
- F00 尚未完成真实跨端 callback，本卡不把“真实报名回流已接通”伪装成完成事实；
- Build / CI：GitHub Actions `Deploy Mobile to Cloudflare Pages` run `32013927360`，mobile dev type-check、Vite build 与 deploy 为 `success`；
- 详细字段去向、入口职责与评审动线：`docs/workbench/F01-student-profile-implementation.md`；
- 评审提交 SHA：待独立评审；
- 当前结论：实现完成，等待独立功能评审；施工线程不自行标记 `PASS`。

---

# F02｜企业可信信息 + 可信凭证完整能力

**类型：施工卡**  
**状态：待评审**  
**优先级：P0**

## A. 企业工商 / 可信基础信息

当前企业详情已经有：

- 企业介绍；
- 关注；
- 赛事 / 权益 / 课程 / 活动 / 岗位资源关系；
- 当前机会。

旧 Mockplus 明确还有工商信息，应补回可信基础层，至少包含：

- 法定代表人；
- 注册资本；
- 经营状态；
- 成立日期；
- 企业类型；
- 所属行业 / 地区；
- 统一社会信用代码；
- 注册地址；
- 经营范围。

可以做 Section / Tab / 二级页，不恢复旧视觉布局。

**企业页主心智仍然是资源 / 品牌 / 合作方，不要做成工商查询产品。**

## B. 可信凭证 / 验真

当前 `/assets/verification` 主要是“输入验真码”。

原始原型明确还有：

1. 验真码；
2. 扫码验真；
3. PDF / OFD 文件验真；
4. 官方验真平台 handoff；
5. 证书保存 / 下载；
6. 成绩报告下载。

## 最低交付

- 三种验真入口都在原型中清楚表达；
- QR 和文件可以做 mock，不要求真实摄像头 / OFD 解析；
- 文件类型、大小、验证状态表达完整；
- 证书 / 成绩能表达保存和下载；
- 外部官方验证出口明确；
- 系统可信事实仍不可被简历编辑器修改。

## 施工记录

- 开始时 branch HEAD：`18528090ca70670563f7627982b79e267de3a88e`；
- 实际修改范围：
  - `apps/mobile/src/features/public-platform/data.ts`
  - `apps/mobile/src/features/trust/TrustPages.tsx`
  - `apps/mobile/src/app/App.tsx`
  - `docs/workbench/F002-implementation-record.md`
- 实现提交：
  - `89620ff637033c02269b1a7ee8a7c2e543af1bd6`
  - `081577f2437d4f40086222e06401db384e4fb115`
  - `2ff2631c8d6979c83041f9ac7bcdd72c03f82f46`
- Build / CI：GitHub Actions `Deploy Mobile to Cloudflare Pages` run `32013871701`，`Type-check and build mobile preview` 与 `Deploy mobile` 均为 `success`；该 run head `0994f12faf0f11eb7b00220b777b0efaa015b7fc` 直接包含 F002 全部实现；
- 详细施工与评审动线：`docs/workbench/F002-implementation-record.md`；
- 评审提交 SHA：待独立评审；
- 当前结论：实现完成，等待独立功能评审；施工线程不自行标记 `PASS`。

---

# F03｜账号 / 简历 / 团队 / 外部 handoff 补齐

**类型：施工卡**  
**状态：待评审**  
**优先级：P1 / P2**

这张卡只补业务已经清楚的小功能，不在此卡解决 F04 未决模型。

## A. 退出登录

补完整：

```text
/me
→ 退出登录
→ 二次确认
→ 清当前 session
→ 返回公共首页 / 登录
```

不要把退出等同于删除长期资产。

## B. 长期简历结构化字段

在 F01 学生主档基础上，高概率补回：

- 手机号；
- 毕业时间；
- 学历；
- 学校；
- 专业；
- 时间段；
- 在校经历 / 主修信息。

继续保持：

- 系统可信事实只读；
- resume presentation 可编辑；
- `returnTo` 返回原机会继续投递。

**本卡不自动恢复能力雷达、AI 就业评分、AI 推荐。**

## C. 赛事期团队维护

PC 报名门户已经支持报名期成员添加 / 移除。

需要确认并表达赛事进行期如果仍允许：

- 团队成员变更；
- 减员申请；
- 上传减员 / 变更材料；
- 等待老师 / 运营审核。

这属于赛事 workspace 的长期维护，不等于把复杂报名重新放回 App。

## D. 外部 handoff / 工具性能力

补回旧原型已经明确存在且不改变业务骨架的能力：

- 赛事资料：保存本地 / 分享或发送微信；
- 公众号来源赛友内容：“阅读全文”外部出口；
- 人工客服：明确最终渠道（如企微二维码 / 联系人，按当前业务为准）；
- 课程详情：分享入口；
- 证书 / 成绩的保存、下载若已在 F02 完成则不重复实现。

## 施工记录

- 正式施工基线：F01 合入后的 `0994f12faf0f11eb7b00220b777b0efaa015b7fc`；施工分支：`workbench/f003`；并行期间 F00 / F02 继续推进，合并前确认 F003 实现文件没有被并行线程覆盖；
- 实际修改范围：
  - `apps/mobile/src/features/long-term-assets/store.tsx`
  - `apps/mobile/src/features/long-term-assets/ResumePages.tsx`
  - `apps/mobile/src/features/long-term-assets/AssetsPages.tsx`
  - `apps/mobile/src/features/competition-workspace/WorkspacePages.tsx`
  - `apps/mobile/src/features/platform-support/SupportPages.tsx`
  - `apps/mobile/src/features/long-term-assets/CoursesPages.tsx`
  - `apps/mobile/tests/f003.spec.ts`
  - `docs/workbench/F003-implementation-record.md`
- 退出登录：`/me` 增加二次确认，只调用既有 `continueAsGuest()` 清 session 并返回公共首页，不清长期资产；
- 长期简历：手机号 / 学校 / 专业 / 学历直接复用 F01 `StudentProfile`，只在 resume presentation 新增毕业时间、时间段、主修课程、在校经历；可信事实继续只读，`returnTo` 保持回原机会；
- 团队维护：赛事 `inProgress` 时可提交减员 / 成员变更、原因与材料，提交后进入待老师 / 运营审核；审核前不直接修改团队成员事实；报名期复杂成员表单仍留在响应式报名门户；
- 外部 handoff：赛事资料支持真实浏览器下载、系统分享 / 复制链接降级；公众号来源内容增加“阅读全文”外跳；人工客服明确企业微信福利官为最终渠道但不伪造联系人 / 二维码；课程详情增加系统分享 / 复制链接降级；证书 / 成绩下载沿用 F02，不重复施工；
- 未处理 F04 的学力值、第三方业务账号、D03 任务、D08 主体、创域 / 扫码、AI 简历与人才评分决策；
- PR：`#1`；合并提交：`677878362658359cbf740c9a1021fcfcf1cbe591`；
- Build / CI：GitHub Actions `Deploy Mobile to Cloudflare Pages` run `32014523170`，`Type-check and build mobile preview` 与 `Deploy mobile` 均为 `success`；
- 浏览器专项回归已新增 `apps/mobile/tests/f003.spec.ts`，覆盖退出、结构化教育经历 + `returnTo`、赛事期团队变更申请、资料下载、公众号 / 企微 / 课程分享 handoff；当前部署 workflow 不执行 Playwright，因此“测试已写”不作为 browser PASS；
- 详细施工与验收边界：`docs/workbench/F003-implementation-record.md`；
- 评审提交 SHA：待独立评审；
- 当前结论：实现完成，等待独立功能评审；施工线程不自行标记 `PASS`。

---

# F04｜产品决策卡：禁止施工线程自行决定

**类型：产品决策卡**  
**状态：待决策**

本卡只产出业务决策与文档，不直接施工。

## Decision A｜学力值

必须确认：

- 可收入 / 消费 / 有余额的积分？
- 不可消费的成长分？
- 两者拆成两个对象？

并同步回答：

- 旧兑换中心怎么办；
- 课程是否仍可用积分兑换；
- 任务奖励的对象是什么。

## Decision B｜第三方账号

旧业务对象：

- 抖音达人；
- 快团团；
- 三创好物；
- 平台账号 ID / 昵称 / 状态。

当前实现对象：

- 邮箱；
- 企业微信；
- 微信绑定。

需要确认是：

- 两类能力都存在，应拆成“联系方式 / 登录绑定”与“业务渠道账号”；
- 还是旧电商 / 内容平台账号已经废弃。

## Decision C｜D03 任务体系

定义以下对象关系：

- 平台成长任务；
- 赛事任务；
- 企业任务；
- 权益任务；
- 创赛工坊 Task Runtime；
- 奖励 / 学力值。

2026-08-17 已确认 `/tasks` 可作为派生聚合页；上述对象关系和奖励模型仍未决，不得在聚合页创建第二真相源。

## Decision D｜D08 主体管理

明确：

- “主体”到底是什么；
- 学校 / 企业主体的认证关系；
- 谁创建、谁审核、谁绑定；
- 扫码绑定的真实场景；
- 与学校老师后台 / 企业后台的关系。

未决前 `/me/subjects` 继续 blocked。

## Decision E｜创域 / 本地运营 / 扫码

作为后续探索，确认：

- 本地化权益；
- 青年线下活动；
- 企业 / 学校 / 社团组织权；
- 扫码领取 / 核销 / 签到；
- 地域配置；
- 线上线下关系如何沉淀。

不要因为历史讨论过“创域”就直接恢复一级导航。

## Decision F｜AI 简历 / 人才能力表达

旧原型的：

- 能力雷达；
- AI 就业推荐；
- AI 润色

只有在数据来源、解释方式和真实业务目标明确后才恢复。

禁止构造不透明的 AI 人才总分。

---

# R-Final｜功能级总回归（所有施工卡完成后）

这不是普通 route audit。

最终总回归必须同时检查：

1. 新仓库当前 route registry / explicit 404；
2. TypeScript + Vite build；
3. 五条母动线浏览器回归；
4. 手机 → 现有响应式报名门户 → 手机状态回流；
5. pending / rejected / ended / revoked / permissionDenied；
6. Google Drive 140 页原始 Mockplus 的高风险页面 feature-level spot check；
7. 本台账 F00–F03 每项为：完成 / 明确废弃 / 有替代方案；
8. F04 每项为：已决策 / 继续冻结，并说明原因；
9. 无新的 duplicate session / identities / lifecycle / applications truth source；
10. 页面合并后没有再次出现“路由在，但关键字段 / 按钮 / handoff 消失”。

最终判断优先级：

```text
产品总纲一致性
> 五条母动线
> 功能覆盖
> 状态完整
> 跨端闭环
> 可维护性
> 视觉一致性
```

---

## 3. 台账维护规则

每张卡后续至少维护：

- 状态：待执行 / 施工中 / 待评审 / PASS / CHANGES REQUIRED / 冻结；
- 开始时的 branch HEAD；
- 实际修改范围；
- 实现提交 SHA；
- 评审提交 SHA；
- build / browser / CI 证据；
- 新发现的产品决策或功能缺口。

施工线程不得直接把自己的状态改成 `PASS`；`PASS` 由独立评审确认。

如果新发现与 Google Drive 原始 Mockplus 冲突：

1. 先记录原始功能证据；
2. 再判断是补回、替代还是明确废弃；
3. 不以当前代码“已经这样实现”为产品依据。

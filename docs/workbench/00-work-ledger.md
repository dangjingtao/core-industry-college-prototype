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
7. `apps/pc/src/registration-portal/`：当前 PC / 响应式三创赛报名门户实际实现；
8. `docs/product/03-pc-admin-data-skeleton.md`：PC 管理端数据控制面骨架；
9. `docs/product/05-pc-admin-product-decisions.md`：PC 管理端已确认产品决策，后续 PC 施工优先遵守。

### 当前产品基线不可破坏

- App 账号长期存在；赛事身份按具体赛事生命周期存在；
- 一个账号可以有多个赛事身份；
- 公共平台不依赖赛事身份；
- 创赛工坊属于具体赛事上下文，不是全局 AI；
- 赛事结束后经历、项目、成绩、证书、学习成果继续归长期账号；
- 企业是赛事 / 权益 / 课程 / 活动 / 机会的资源与品牌主体，不只是招聘公司；
- 不重复建立 session / identities / lifecycle / applications 真相源；
- `/tasks`（D03）在聚合展示层已由 2026-08-17 后续决策解冻；`/me/subjects`（D08）继续冻结；
- PC 管理端是平台控制面，不是学生 App 的桌面版，也不是某一赛事的官方后台；
- PC 新增对象 / 状态必须能明确映射到 App 真实消费位置，不得另造与 App 冲突的业务语义。

---

## 2. 总状态

| 卡片 | 主题 | 类型 | 状态 | 前置 |
| --- | --- | --- | --- | --- |
| F00 | 手机端接入现有响应式报名门户 | 施工 | PASS | 无 |
| F01 | 学生主档 + Onboarding / Profile / 问卷 | 施工 | PASS | F00 协议边界明确后可施工 |
| F02 | 企业可信信息 + 可信凭证完整能力 | 施工 | PASS | 可与 F01 并行 |
| F03 | 账号 / 简历 / 团队 / 外部 handoff 补齐 | 施工 | PASS | F01 部分数据模型 |
| F04 | 学力值 / 第三方账号 / 任务 / 主体 / 创域等 | 产品决策 | 待决策 | 可并行讨论，不允许施工线程自行拍板 |
| T006 | 创赛福利板块补充 | 施工 | 已完成（首页入口 + 页面结构，F04 经济模型占位） | F04 Decision A |
| T007 | 三创同学会（原赛友风采） | 施工 | 已完成 | 无 |
| T008 | 可信空间补充 | 施工 | 已完成（首页入口层） | F02 |
| T009 | 智能客服原型 | 施工 | 已完成 | 无 |
| T010 | 通知中心 | 施工 | 已完成（列表/详情/一键已读已实现；入口在首页与我的页） | 无 |
| T011 | 课程深度功能 | 施工 | 已完成（课程中心、详情页、学习-考试-证书闭环；学习排行榜除外） | F04 Decision A、T008 |
| T012 | 社区重构 | 施工 | 已完成（赛友主页/点赞/关注/投稿交互已重构；F04 Decision C 不影响页面结构） | F02、F04 Decision C |
| T013 | 创赛工坊完整功能 | 施工 | PASS（2026-08-19 独立总复审） | 赛事工作区上下文 |
| T014 | 我的页面设计语言总结 + 功能补齐 | 施工 | 已完成 | F03、T009、T010 |
| T015 | 登录注册流程 | 施工 | 已完成 | F01、F03 |
| T009R1 | 智能客服入口改为右下角悬浮蓝色窗口与交互优化 | 施工（修订） | 部分完成 | T009 |
| T011R1 | 课程中心列表化与分类标签精简 | 施工（修订） | 部分完成 | T011 |
| T015R1 | 微信登录首次绑定手机号强制完善资料 | 施工（修订） | 已完成 | T015 |
| T016 | 首页核心功能区重构 | 施工 | 已完成（通知入口、赛事/机会推荐、成长资源、任务区、智能客服浮窗已重构） | T009R1、T011R1、F02、F04 Decision C |
| T017 | 长期简历自动生成与个人成长档案 | 施工 | 部分完成 | F01、F03、T008、T011 |
| T018 | 应用中心（tabbar 第 5 入口 + 分组宫格聚合页） | 施工 | 已完成（分组宫格 + 工坊入口 + 模拟入口已实现） | 无 |
| T019 | 创赛福利“已绑定手机号”提示 + 打车券领取引导 | 施工 | 待执行 | T006、F01 |
| T020 | 应用中心定位收敛：常驻轻量入口 + 首页高频入口不写死 | 产品决策 / 施工 | 待决策 | T018 |
| T021 | 沙盒模拟经营玩法讨论（玩法 / 场景 / 时长 / 奖励 / 与任务课程关系） | 产品决策 / 讨论 | 待决策 | T018、T020、模拟模块 |
| T022 | 沙盒模拟经营轻量入口（承载活动/小游戏） | 产品决策 / 施工 | 待决策 | T018、T021、模拟模块 |
| T023 | 新手任务中心重构（入门课程引导 + 多元任务 + 营销化界面） | 产品决策 / 施工 | 待决策 | F04 Decision C、T024 |
| T024 | 课程体系优化：AI 系列作为官方入门课程并与新手任务结合 | 产品决策 / 施工 | 待决策 | T011、T023 |
| T025 | 赛事项目材料是否支持 APP 端编辑 | 产品决策 / 讨论 | 待决策 | PC02、赛事 Runtime、团队权限 |
| T026 | APP 内公益助力板块（首页拼贴广告位 + 应用中心常驻入口 + 看广告助力） | 产品决策 / 施工 | 已完成（首页拼贴位 + 应用中心入口 + 列表/详情/广告 handoff；奖励逻辑 F04 Decision A 占位） | F04 Decision A、T016、T018、广告接入 |
| PC01 | PC 控制面总壳 + APP 数据接入地图 | 施工 | PASS | 无 |
| PC02 | 赛事控制台 + 报名资格 + 学校审核 + Workshop | 施工 | PASS | PC01 |
| PC03 | Organization + 机会 + 内容运营 | 施工 | PASS | PC01 |
| PC04 | 平台课程 + 权益 + 可信证书 | 施工 | PASS | PC01 |
| PC-BD01 | 基础数据接入与旧后台能力归并 | 施工 / 归并 | 修正已施工 / build 通过 / browser 回归待环境补验 | PC02、PC03、PC04 |
| PC05 | 学生 / 长期资产 + 权限治理 + PC 总回归 | 施工 / 收口 | 待最终执行验收 | PC02、PC03、PC04、PC-BD01 |

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
                  ↘
                   T018 应用中心（无前置，可随时并行）

PC 管理端：

PC01 控制面底座
  → PC02 赛事控制台
  → PC03 Organization / 机会 / 内容 ┐
  → PC04 课程 / 权益 / 证书         ├→ PC-BD01 基础数据归并与独立复审 → PC05 学生 / 资产 / 权限 / 跨端总回归
                                   ┘

PC03 与 PC04 可在 PC01 完成后并行；PC-BD01 在 PC02–PC04 稳定后完成归并并接受独立复审；PC05 必须把 PC-BD01 作为前置后再做最终收口。
```

---

# F00｜手机端接入现有三创赛响应式报名门户

**类型：施工卡**  
**状态：PASS**  
**独立复审：`docs/workbench/F00-review.md`，结论 `PASS`**  
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
- 独立复审：`docs/workbench/F00-review.md`，结论 `PASS`；阻断修复提交 `38245d9d6c20f7395ae81927a93637baa9e8cd46`，真实双服务 cross-app browser 与 CI run `32017114188` 均 success；
- 当前结论：PASS，可关闭；后续只参加 `R-Final` 功能级总回归。

---

# F01｜学生主档 + Onboarding / Profile / 问卷

**类型：施工卡**  
**状态：PASS**  
**独立复审：`docs/workbench/F01-review.md`，结论 `PASS`**  
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
- 独立复审：`docs/workbench/F01-review.md`，结论 `PASS`；阻断修复提交 `7da28be0b12e74db148b7149ae4f746dc523833a`，focused browser run `32019232067` success；
- 当前结论：PASS，可关闭；后续只参加 `R-Final` 功能级总回归。

---

# F02｜企业可信信息 + 可信凭证完整能力

**类型：施工卡**  
**状态：PASS**  
**独立复审：`docs/workbench/F002-review.md`，结论 `PASS`**  
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
- 独立复审：`docs/workbench/F002-review.md`，结论 `PASS`；阻断修复提交 `6e79997c359860bf2a545b198f62391fb9b0b09f`，focused regression `1b0243500f576e28880f568d2435819216541d0f`，build/deploy run `32016438710` 与 focused run `32016602993` 均 success；
- 当前结论：PASS，可关闭；后续只参加 `R-Final` 功能级总回归。

---

# F03｜账号 / 简历 / 团队 / 外部 handoff 补齐

**类型：施工卡**  
**状态：PASS**  
**独立复审：`docs/workbench/F003-review.md`，结论 `PASS`**  
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

> 2026-08-19 已确认：赛事期团队维护只保留「减员申请」（选择涉及成员 + 填写原因），取消「成员变更」与「上传申请 / 证明材料」。提交后进入待老师 / 运营审核，审核前不直接修改成员事实。手机端 `/competitions/:competitionId/workspace/team` 已按此收敛并同步回归用例。

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
- 团队维护：赛事 `inProgress` 时可提交减员申请（涉及成员 + 原因），提交后进入待老师 / 运营审核；审核前不直接修改团队成员事实；2026-08-19 决策取消成员变更与材料上传；报名期复杂成员表单仍留在响应式报名门户；
- 外部 handoff：赛事资料支持真实浏览器下载、系统分享 / 复制链接降级；公众号来源内容增加“阅读全文”外跳；人工客服明确企业微信福利官为最终渠道但不伪造联系人 / 二维码；课程详情增加系统分享 / 复制链接降级；证书 / 成绩下载沿用 F02，不重复施工；
- 未处理 F04 的学力值、第三方业务账号、D03 任务、D08 主体、创域 / 扫码、AI 简历与人才评分决策；
- PR：`#1`；合并提交：`677878362658359cbf740c9a1021fcfcf1cbe591`；
- Build / CI：GitHub Actions `Deploy Mobile to Cloudflare Pages` run `32014523170`，`Type-check and build mobile preview` 与 `Deploy mobile` 均为 `success`；
- 浏览器专项回归已新增 `apps/mobile/tests/f003.spec.ts`，覆盖退出、结构化教育经历 + `returnTo`、赛事期团队变更申请、资料下载、公众号 / 企微 / 课程分享 handoff；当前部署 workflow 不执行 Playwright，因此“测试已写”不作为 browser PASS；
- 详细施工与验收边界：`docs/workbench/F003-implementation-record.md`；
- 独立复审：`docs/workbench/F003-review.md`，结论 `PASS`；阻断修复 PR #4 / `5ff0e2203a197812c3111e431850350f48d7903a`，focused Chromium run `32021118328`（5 passed）、合并后 Mobile CI run `32021340204` 均 success；
- 当前结论：PASS，可关闭；后续只参加 `R-Final` 功能级总回归。

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

# PC 原型施工卡｜统一开工门槛

以下规则适用于 PC01–PC05 以及 PC-BD01。任何 PC 施工线程未完成这些动作前，不得直接开始画后台页面或扩展业务对象。

## 开工前必须完成

1. 阅读：
   - `docs/README.md`
   - `docs/product/00-product-master-context.md`
   - `docs/product/03-pc-admin-data-skeleton.md`
   - `docs/product/05-pc-admin-product-decisions.md`
   - `docs/migrations/mobile-from-com-design.md`
   - `docs/workbench/00-work-ledger.md`
2. 阅读 `apps/mobile/src/routes/registry.ts`，并检查本卡对应的 `apps/mobile` 实际页面、state、mock，不允许只依据 PC 文档猜 App。
3. 实际走一遍本卡对应的 App 业务动线，确认页面、状态、入口、返回关系和异常状态。
4. 施工前在本卡施工记录中先写一份简短 **APP → PC 数据映射**，至少包含：
   - PC 业务对象；
   - 谁写；
   - App 哪个 route / 页面消费；
   - 当前状态名；
   - stable id / 关联 id；
   - 赛事结束或资源下架后是否长期保留。
5. PC 是控制面，不是桌面版 App；不得复制第二份 `session / identities / lifecycle / applications` 真相源。
6. 若产品文档、App 当前实现和旧 Mockplus 冲突，先判断是否为历史实现落后于已确认产品决策；不得自行折中创造第四种业务语义。
7. 不得顺手修改不属于本卡的 Mobile 产品逻辑；如确认 App 本身与已确认决策冲突，先记录问题再单独处理。
8. PC 可以提高信息密度，但必须沿用当前产品的品牌、状态语义和 Com Design / 现有 token，不另造明显不一致的视觉系统。

## 统一验收原则

每个新增 PC 对象至少都必须回答：

> 谁创建它？谁能修改？App 哪里消费？事实来源是什么？关联谁？结束后是否保留？

回答不了的对象不得进入原型主流程。

---

# PC01｜PC 控制面总壳 + APP 数据接入地图

**类型：施工卡**  
**状态：PASS**  
**独立复审：`docs/workbench/PC01-review.md`，结论 `PASS`，复审提交 `250e1fc868de720c86192b572da65955d3364a42`**  
**优先级：P0**  
**前置：无**

## 目标

把当前 `/admin/*` 从概念 Skeleton 提升为可持续施工的 PC 原型底座。

不是先堆完整 CRUD，而是先统一：

```text
App 有什么
→ PC 谁管理
→ 数据从哪里来
→ 状态和 stable id 如何跨端一致
```

## 必须理解的 App

重点检查：

- `/home`
- `/competitions`
- `/opportunities`
- `/courses`
- `/benefits`
- `/assets`
- `/me`
- `/tasks`

必须理解 Account、StudentProfile、CompetitionIdentity、Application、赛事 Runtime、长期资产之间的真相源边界。

## 最低交付

- 完善 PC 总览与全局导航；
- 形成统一列表 / 详情 / 编辑 Pattern；
- 统一数据来源标签：平台配置 / API 同步 / 文件导入 / 人工修正 / Runtime；
- Organization / Competition / Account 等 stable ID 的统一展示方式；
- 当前角色与数据 Scope 表达；
- 各管理域之间可通过稳定业务关系跳转；
- 当前 7 个管理域继续作为施工骨架，不因为页面方便随意增加平行业务真相源；
- 输出并维护全局 APP → PC 数据接入地图。

## 禁止

- 不按照旧 Mockplus 一级导航反推 PC IA；
- 不把手机端四个一级导航复制成 PC 菜单；
- 不在总览页创造新的业务状态；
- 不把 Skeleton 中的说明文字直接当作最终 CRUD 设计。

## 验收

任意从 PC 总览进入的核心对象，都能清楚看到或追溯：来源、状态、关联主体、App 消费位置和责任人。

## 施工记录

- 开始时 branch HEAD：`9ac37b56dbe0d09e0ea4b53e55f0a37aea088886`；
- 施工前已完成 APP → PC 数据映射，详见 `docs/workbench/PC01-admin-control-plane.md`；映射提交：`74521cda4c0df0ff0e926140a71c9b63f95f1744`；
- 实际修改范围：
  - `apps/pc/src/admin/data.ts`
  - `apps/pc/src/admin/AdminConsole.tsx`
  - `apps/pc/tests/admin-skeleton.spec.ts`
  - `docs/workbench/PC01-admin-control-plane.md`
  - `docs/workbench/00-work-ledger.md`
- 核心实现提交：`46269896096eff98ba6ae599dd387ea058a6dbe6`；浏览器断言对齐提交：`3d5f59e031dce7d84383d01e01c1ce69fec6463f`；施工记录提交：`52f99c650e153a5e44f03d30cf871c2bb7ecf637`；
- 已实现 7 个既有管理域的 PC01 控制面总壳、桌面 / 窄屏全局导航、Role + Module Permission + Data Scope、五类数据来源标签、stable ID Pattern、APP → PC 8 组入口接入地图、统一实体契约 / 列表 / 详情 / 编辑 Pattern 与跨域 stable relation；
- Competition / Opportunity / Course / Benefit / Certificate 等示例均沿用当前 App stable id / 状态语义；Content / Workshop 没有足够当前 stable object 证据时不硬造业务记录；
- `/tasks` 保持由 `identities[] / Application / CourseLearning / Benefit / WorkshopRun` 派生，不新增 Task 管理域或第二真相源；
- 发现并保留真实缺口：当前 Mobile `session` 只有 `loggedIn / profileComplete`，没有显式 `accountId`；PC01 只展示 `Account ID` 缺口，不自行生成第二账号真相源；
- 本卡没有修改 Mobile 产品逻辑，也没有修改现有三创赛报名门户业务实现；
- TypeScript 静态验证：`data.ts` 使用 TypeScript 5.8 严格解析通过；`AdminConsole.tsx + data.ts` 在与仓库 `strict / moduleResolution=Bundler / jsx=react-jsx` 对齐的隔离检查中通过。该隔离检查用于发现本卡自身语法 / 类型问题，不冒充真实依赖安装后的 Vite build；
- Browser regression 已扩展 `apps/pc/tests/admin-skeleton.spec.ts`：覆盖总览 / 数据来源 / stable ID / APP → PC map、Competition → Organization 跨域详情、统一编辑 Pattern、CompetitionIdentity 真相源边界、现有报名门户独立入口；
- 仓库 `deploy-pc.yml` 与 `r-final-check.yml` 都会在 `apps/pc/**` 推送 `dev` 时执行真实 build / PC browser regression；当前 GitHub connector 的 commit workflow 查询只返回 PR 触发 run，本卡为直接 push `dev`，施工线程无法可靠取得本次 push run 的 run id / 最终状态，因此**不伪造 CI PASS**；
- 独立复审已结合 PC02–PC04 的实际落地结果反向验证底座契约，结论 `PASS`；非阻断的 Shell 合并与旧示例详情路由收口留给 PC05 统一处理。

---

# PC02｜赛事控制台 + 报名资格 + 学校审核 + Workshop

**类型：施工卡**  
**状态：PASS**  
**独立复审：`docs/workbench/PC02-rereview.md`，结论 `PASS`，复审提交 `97c98d402e20efddfb73e9d0e8ff285668dc9dfb`**  
**优先级：P0**  
**前置：PC01**

## 必须理解的 App / PC 现有流程

完整走通：

```text
/competitions
→ /competitions/:competitionId
→ /registration
→ /registration-portal/*
→ pending / rejected / approved
→ official confirmed
→ /workspace
→ team / resources
→ workshop
```

必须检查现有响应式报名 Portal，不得再造第二套报名系统。

## 最低交付

形成真正的赛事详情型控制台，至少支持：

- 赛事基础资料与赛道；
- 报名接入方式：平台承接门户 / 外部 URL / API 或第三方 / 无线上报名；
- 官方数据同步状态；
- API / 文件 / 人工修正的数据来源；
- 官方资格确认；
- 官方统一窗口与地方赛节点；
- 学校授权范围；
- 团队 / TeamMember / `CompetitionProject` 查询；
- 跨校团队由队长学校承担统一审核；
- CompetitionIdentity；
- 赛事资料；
- 赛事专属课程 / 权益 / 活动关联；
- Workshop 配置与赛事 scope。

### 三层事实必须分清

```text
外部权威赛事事实
平台承接报名流程
核心产业学院叠加服务
```

三创赛是当前最重要的外部赛事接入案例，但整个后台不能被设计成“三创赛官方后台”。

## 禁止

- `platformApproved = officialConfirmed`；
- 外部权威资格未确认就让学生进入正式 Workspace；
- 跨校团队要求多个学校重复审批；
- 建立跨赛事长期 Project；
- 学校老师看到其它赛事、长期问卷 / 画像、求职简历、投递记录、权益消费、Workshop 私人回答 / AI 内容；
- 在 `/admin` 重建响应式报名表。

## 验收

至少用两个赛事场景验证同一个 Competition 模型：

1. 三创赛：外部权威 API 优先 + 平台承接部分报名；
2. 普通合作赛事：平台直接配置。

两者必须共用同一赛事控制面，而不是两套后台。

---

# PC03｜Organization + 机会 + 内容运营

**类型：施工卡**  
**状态：PASS**  
**独立复审：`docs/workbench/PC03-rereview.md`，结论 `PASS`，复审提交 `13977386167c4a2d2ff18001d38153862b5b2a75`**  
**优先级：P0**  
**前置：PC01**

## 必须理解的 App

完整检查：

- `/companies`
- `/companies/:companyId`
- `/opportunities`
- `/opportunities/:opportunityId`
- `/applications`
- `/home`
- `/news`
- `/stories`

必须确认 Opportunity 与 Application 的现有状态语义，Application 继续作为平台投递事实。

## Organization

统一主体主数据覆盖：

- 学校；
- 企业；
- 赛事组织方；
- 合作机构 / 资源提供方。

Organization 详情应真实表达它与：

```text
赛事 / 课程 / 权益 / 活动 / 机会 / 内容
```

的关系，不再分别维护互不相认的企业表 / 学校表 / 合作机构表。

## 机会管理

至少支持：

- 创建 / 编辑 / 上下架；
- 来源 Organization；
- 学校 / 专业 / 地区 / 赛事经历 / 课程完成 / 证书 / 比赛成绩等可解释字段圈选；
- 规则初筛后由运营确认最终发送范围，并允许手工增删；
- App 内正式投递；
- Application 后续状态由核心产业学院运营维护。

核心学院只做机会分发、App 内投递与状态跟踪，不建设招聘平台。

## 内容运营

首期由核心产业学院运营统一发布：

- 首页 Banner；
- 资讯；
- 赛友内容；
- 活动。

支持定向范围：

- 赛事；
- 学校；
- 地区。

学校 / 企业可以供稿，但首期没有直接发布权。

## 禁止

- 候选人 CRM；
- 黑盒人才评分；
- 个性化岗位偏好学习；
- 企业招聘 SaaS；
- 企业首期直接拥有平台发布权；
- 把 Organization 与手机 D08 `/me/subjects` 混为一谈。

---

# PC04｜平台课程 + 权益 + 可信证书

**类型：施工卡**  
**状态：PASS**  
**最终独立复审：`docs/workbench/PC04-final-rereview.md`，结论 `PASS`；单点修复 PR #8 / `b66a6579d988947cf8199eebfc29422a55d884ad`**  
**优先级：P0**  
**前置：PC01**

## 必须理解的 App

完整检查：

```text
/courses
→ /courses/:courseId
→ /courses/:courseId/learn
→ /courses/:courseId/assessment
→ /courses/:courseId/achievement

/benefits
→ /benefits/:benefitId
→ /benefits/wallet

/assets/certificates
→ /assets/certificates/:certificateId
→ /assets/verification
```

不得在 PC 侧另造与 App 冲突的课程完成、权益领取或证书有效状态。

## 课程

课程全部平台托管。PC 直接管理：

- 课程；
- 章节；
- 视频；
- 小测试；
- 视频学习完成要求；
- 测试及格线；
- Course Completed；
- 赛事专属关系；
- 权益关系；
- 证书规则。

首期主要完成模型：

```text
视频学习进度
+ 小测试通过
→ Course Completed
```

不建设万能学习规则引擎。

课程任务按个人完成；“必修”默认不直接阻断赛事报名或 Workspace，可由其它明确规则引用 Course Completed。

## 权益

首期按个人领取，平台运营配置资格。

固定支持三种履约：

1. 兑换码 / 卡码；
2. 外部领取链接；
3. 线下核销 / 人工履约。

资格规则可引用明确、可解释的已有事实，例如课程完成状态。

## 可信证书

PC 至少表达：

- 证书类型；
- 实际签发主体；
- 签发规则；
- 签发状态；
- 编号；
- 文件 / 凭证；
- 验真信息；
- 申请 / 回流记录。

课程满足预设条件后自动触发外部权威签发流程，不要求运营逐张点击发证。

其它赛事成果、项目实践、活动等可以由运营按实际业务发起签发。

## 禁止

- 把外部课程 URL 当正式课程主形态；
- 万能课程 / 权益规则引擎；
- 团队共享 Course Completed；
- 把所有证书写死成赛事获奖证书；
- 把平台自身记录伪装成外部权威机构签发；
- 因课程“必修”默认改变官方赛事资格。

---

# PC-BD01｜基础数据接入与旧后台能力归并

**类型：施工 / 归并卡**  
**状态：CHANGES REQUIRED（修正已施工，待独立复审）**  
**优先级：P0**  
**前置：PC02、PC03、PC04**  
**任务卡：`docs/workbench/PC-BD01-basic-data-integration.md`**  
**独立复审：`docs/workbench/PC-BD01-review.md`，当前结论 `CHANGES REQUIRED`**

## 收口职责

PC-BD01 必须在 PC05 最终验收前完成独立复审。它负责把现有“基础数据管理”收敛为跨域维护工作台 / 聚合入口，而不是第 8 个业务真相域。

至少保持：

- 学生基础数据 → Account / StudentProfile；
- 学校基础数据 → Organization(type=School)；
- 赛事 / 赛道配置 → 具体 Competition / CompetitionTrack / CompetitionLifecycle；
- 证书 / 协议 / Banner / 权益规则 → 各自所属业务域；
- 导入与批处理 → 数据接入治理记录；
- 默认视图讲业务，stable id / canonical object / DataSource / Scope 等放技术模式。

施工线程不得自行把本卡标记为 `PASS`；独立复审通过后才能解除 PC05 前置阻断。

---

# PC05｜学生 / 长期资产 + 权限治理 + PC 总回归

**类型：施工 / 收口卡**  
**状态：待最终执行验收**  
**优先级：P0**  
**前置：PC02、PC03、PC04、PC-BD01**

## 必须理解的 App

重点检查：

- `/me/profile`
- `/me/resume`
- `/competitions/mine`
- `/applications`
- `/assets`
- `/assets/experiences`
- `/assets/results`
- `/assets/certificates`

并完整验证：

```text
ended / revoked
→ 赛事期能力关闭
→ 经历 / 项目摘要 / 团队角色 / 成绩 / 证书 / 课程成果继续长期存在
```

## 学生控制台

至少支持查询 / 治理：

- Account；
- StudentProfile；
- CompetitionIdentity[]；
- Registration；
- Team / TeamMember；
- Application；
- 冻结 / 解冻。

学生长期资料优先由学生本人维护；运营只处理明确授权字段与治理事项。

冻结账号不删除长期资产、赛事历史、证书、投递等记录。

## 长期资产

统一管理 / 查询：

- Experience；
- Result；
- Certificate；
- CourseAchievement；
- VerificationRecord。

赛事下架、课程下架、企业退出合作都不得导致已产生的可信历史资产物理消失，应使用 archived / revoked / invalid 等明确状态。

## 后台权限治理

必须区分：

### 超级管理员

- 创建 / 禁用后台管理员；
- 分配 / 提升权限；
- 处理高风险治理动作。

### 普通运营

采用首期简单模型：

```text
Role
+ Module Permission
+ Data Scope
```

数据 Scope 可以限制到具体赛事 / Organization 等范围。

### Audit Log｜P0

记录：

- 谁；
- 什么时间；
- 对什么对象；
- 修改前 / 修改后；
- 原因；
- 关联审批（若有）。

### 高风险审批

至少覆盖：

- 批量证书签发 / 撤销；
- 官方参赛状态人工修正；
- 批量赛事身份修改；
- 权限提升；
- 学生账号冻结 / 解冻等治理动作。

普通内容编辑不进入重型审批链。

## PC ↔ APP 一致性总审计

PC05 合入前，逐项反查：

1. 每个 PC 长期业务对象都有 App consumer 或明确后台治理用途；
2. 每个 App 长期业务对象都有明确 PC / 外部 / Runtime 数据来源；
3. stable id 与关联 id 不出现语义重复；
4. 相同业务状态跨端名称、含义一致，或有显式映射；
5. 赛事结束 / revoked / certificate revoked 等非 happy path 跨端一致。

以下情况视为明显不一致，直接 `CHANGES REQUIRED`：

```text
APP active
PC 只有 approved，且二者被当成同一语义

APP CompetitionIdentity
PC 又造 Participant 作为第二真相源

APP Application
PC 又造 CandidateRecord 作为投递事实

APP CompetitionProject
PC 变成跨赛事长期 Project

APP Course Completed
PC 又有另一套“培训通过”状态

APP Certificate revoked
PC 仍显示有效
```

## 验收

PC05 不是只验 `/admin/students` 页面。它必须对 PC01–PC04 与 PC-BD01 做一次跨域、跨端收口，并提供：

- TypeScript / Vite build；
- PC 核心管理动线浏览器回归；
- 至少一个赛事、一个 Organization、一个课程、一个权益、一个机会、一个学生长期资产的串联验证；
- 权限 / scope / audit / 高风险审批的中保真演示；
- PC ↔ App 数据对象与状态一致性检查结果。

施工线程不得自行把 PC05 标记为 `PASS`，必须独立评审。

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
9. PC01–PC04 与 PC-BD01 均已完成独立复审，且 PC05 已进行 PC ↔ App 一致性独立复审；
10. 无新的 duplicate session / identities / lifecycle / applications truth source；
11. 页面合并后没有再次出现“路由在，但关键字段 / 按钮 / handoff 消失”；
12. PC 管理端没有出现与 App 明显冲突的对象、状态、权限与长期资产语义。

最终判断优先级：

```text
产品总纲一致性
> 五条母动线
> 功能覆盖
> 状态完整
> 跨端闭环
> PC ↔ App 数据语义一致性
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

---

# 会议纪要任务卡（2026-08-19）

> 来源：内部产品会议小结
> 记录人：TraeDesign
> 状态：已提取为任务卡，未 push，待产品 / 施工认领
> 原则：会议纪要只生成任务卡和待决策点，不直接替业务拍板；涉及 F04 未决模型、D03 任务体系、学力值经济模型的，必须先决策再施工。

---

# T019｜创赛福利“已绑定手机号”提示 + 打车券领取引导

**类型：施工卡**  
**状态：待执行**  
**优先级：P2**  
**前置：T006 创赛福利板块补充、F01 学生主档（手机号绑定）**

## 背景

创赛福利（`/benefits`）在领取部分权益时需要手机号。会议要求：

- 新增“已绑定手机号”的提示文案；
- 优化打车券领取的引导流程。

## 目标

1. 在创赛福利首页 / 权益详情页明确展示当前手机号绑定状态；
2. 若未绑定手机号，领取打车券等需要手机号的权益时，引导至 F01 学生主档完成手机号绑定；
3. 打车券领取流程减少断点，明确“领取 → 查看卡券 → 跳转使用”三步。

## 最低交付

- 福利页增加手机号绑定状态提示（已绑定 / 未绑定）；
- 打车券详情页增加领取引导，未绑定手机号时先提示绑定；
- 领取成功后给出明确出口（去卡券 / 去使用）；
- 手机号数据复用 F01 `StudentProfile`，不新建独立手机号 Store。

## 禁止

- 不因为打车券一个权益而创建新的手机号真相源；
- 不伪造真实打车平台 API 调用。

---

# T020｜应用中心定位收敛：常驻轻量入口 + 首页高频入口不写死

**类型：产品决策卡 / 施工卡**  
**状态：待决策**  
**优先级：P1**  
**前置：T018 应用中心已实现基础分组宫格**

## 背景

T018 已实现 `/apps` 分组宫格入口。会议要求进一步明确：

- 应用中心是“常驻功能的轻量级入口”；
- 首页是“高频功能的入口”，不应把全部功能写死在首页。

## 待决策

1. 哪些功能属于“常驻轻量入口”只留在应用中心，哪些属于“高频入口”需要上首页？
2. 首页功能区是否允许动态配置，还是由产品固定一个最小集合？
3. 应用中心的宫格分组是否需要按用户身份（guest / 有赛事身份 / 无赛事身份）动态变化？
4. 模拟经营玩法（T021）、模拟经营入口（T022）、新手任务（T023）、AI 入门课程（T024）等新增入口在首页 / 应用中心的分布策略。

## 建议验收

- 应用中心只放低频但必要的全量功能出口；
- 首页保留高频动线（赛事、机会、通知、当前赛事工作区、智能客服浮窗）；
- 新增功能入口必须先回答“上首页还是进应用中心”再施工。

---

# T021｜沙盒模拟经营玩法讨论（玩法 / 场景 / 时长 / 奖励 / 与任务课程关系）

**类型：产品决策卡 / 讨论卡**  
**状态：待决策**  
**优先级：P1**  
**前置：T018 应用中心、T020 应用中心定位收敛、模拟模块宿主**

## 背景

会议纪要提出“沙盒模拟经营”未来可作为轻量级入口承载各类活动或小游戏，但具体玩法形态、与赛事 / 课程 / 任务的结合方式尚未明确。本卡用于产品层面先讨论清楚玩法，再决定入口形态（T022）。

## 待决策

1. 核心玩法是什么？（经营决策、资源调配、市场竞争、供应链模拟、直播带货、社区团购等）
2. 一局时长多少？是单局体验还是持续多日的赛季制？
3. 用户以什么身份参与？（个人 / 团队 / 代表赛事项目）
4. 结果数据是否沉淀为长期资产？（成绩单、能力标签、证书、简历片段）
5. 与 F04 Decision A（学力值）的关系：是否给学力值、给多少、是成长分还是积分？
6. 与 D03 任务体系的关系：是否作为新手任务、赛事任务或企业任务的一种完成方式？
7. 与 AI 系列课程（T024）的关系：是否先学习再模拟、模拟失败后可回看课程？
8. 运营侧如何配置新玩法？（PC 端 DevModule 控制台、Content 运营、还是代码发版）

## 建议验收

- 输出一份《沙盒模拟经营玩法方案》或原型规格，明确上述 8 个问题；
- 方案通过后再进入 T022 入口与宿主实现；
- 不提前在 App 内预埋无法解释奖励来源的玩法入口。

## 禁止

- 不允许施工线程自行定义奖励模型或学力值关系；
- 不允许为“好看”而做完整游戏系统后再补产品定义。

---

# T022｜沙盒模拟经营轻量入口（承载活动/小游戏）

**类型：产品决策卡 / 施工卡**  
**状态：待决策**  
**优先级：P2**  
**前置：T018 应用中心、T021 玩法讨论、现有模拟模块宿主 `/modules/simulations/:assignmentId`**

## 背景

当前已有 `/modules/simulations/:assignmentId` 作为模拟模块宿主（经营决策体验 Demo）。会议要求：

- 沙盒模拟经营作为轻量级入口；
- 未来可承载各类活动或小游戏。

## 待决策

1. 沙盒模拟经营是否必须依赖具体赛事上下文，还是可以作为平台级轻量活动入口？
2. 活动 / 小游戏的结果（得分、完成状态）是否需要进入长期资产或任务体系？
3. 与 D03 任务体系、学力值经济模型（F04 Decision A）的关系是什么？
4. 运营侧如何配置新活动 / 小游戏？（PC 端入口、Content 运营、还是独立活动后台？）

## 建议方向

- 短期：在应用中心保留“互动体验”分组，仅展示已启用的 assignment；
- 中期：由 Content 运营或 PC02/PC04 配置活动开关，不另建活动真相源；
- 长期：模拟结果作为 CourseAchievement / Result 或 Task 聚合的输入，具体形态依赖 F04 / D03 决策。

---

# T023｜新手任务中心重构（入门课程引导 + 多元任务 + 营销化界面）

**类型：产品决策卡 / 施工卡**  
**状态：待决策**  
**优先级：P1**  
**前置：F04 Decision C（D03 任务体系）、T024 AI 系列入门课程**

## 背景

会议纪要指出当前新手任务设计不够清晰、引导性不足，要求重构：

- 新手流程应引导用户观看系列入门课程；
- 任务展示区需增加更多元化的任务类型；
- 任务中心界面需营销优化，例如加入日历、今日收益等动态元素以提升活跃度。

## 待决策

1. 新手任务是否属于 D03 任务体系的一部分，还是独立的 Onboarding 流程？
2. “今日收益”展示的是什么？（学力值成长分 / 积分余额 / 任务完成进度 / 其他）——依赖 F04 Decision A；
3. 日历动态元素用于展示什么？（任务截止日期 / 赛事节点 / 课程直播 / 活动日历）
4. 多元任务类型具体有哪些？（观看课程、完善资料、关注企业、报名赛事、分享内容、每日签到等）
5. 奖励对象和发放方式是什么？（学力值 / 权益 / 证书 / 无实物）

## 建议验收

- 新手任务与 `/tasks`（D03 聚合页）共享同一底层事实，不持有第二份 task 真相源；
- 营销化元素只展示已有 Runtime 数据（课程进度、今日任务完成数、学力值变动），不虚构动态；
- 必须先完成 F04 Decision C，再进入本卡施工。

## 禁止

- 不允许施工线程自行定义统一任务奖励或学力值关系；
- 不将新手任务改造成全局独立任务体系。

---

# T024｜课程体系优化：AI 系列作为官方入门课程并与新手任务结合

**类型：产品决策卡 / 施工卡**  
**状态：待决策**  
**优先级：P1**  
**前置：T011 课程深度功能、T023 新手任务中心重构**

## 背景

会议建议将“AI 系列”课程作为官方发布的入门课程，与新手任务相结合。

## 待决策

1. “AI 系列”具体包含哪些课程？（AI 基础、AI 工具应用、AI+创业等）
2. 官方入门课程与平台其他课程的关系：是固定置顶，还是一个可配置的“官方推荐”标签？
3. 完成 AI 系列课程是否作为新手任务的一部分？奖励是什么？
4. AI 系列课程是否产出官方证书？签发主体是谁？
5. 与 F04 Decision A（学力值）的关系：是否用 AI 系列课程激活学力值收入？

## 建议验收

- AI 系列课程在课程中心有独立筛选标签或官方推荐位；
- 课程完成条件、证书规则、与新手任务的关联在 PC04 有对应配置；
- 不因为“官方入门”而降低课程完成标准或伪造证书；
- 与 T023 新手任务结合时，只读取 CourseLearning 事实，不复制状态。

## 依赖关系

```text
T011 课程深度功能
  → T024 AI 系列官方入门课程配置
  → T023 新手任务中心重构

T021 沙盒模拟经营玩法
  → T022 沙盒模拟经营轻量入口

F04 Decision A / C
  → T023 / T024 奖励与任务关系
```

---

# T025｜赛事项目材料是否支持 APP 端编辑

**类型：产品决策卡 / 讨论卡**  
**状态：待决策**  
**优先级：P1**  
**前置：PC02 赛事控制台、赛事 Runtime、团队权限模型**

## 背景

赛事板块中存在“项目材料”（商业计划书、路演 PPT、视频、附件、报名表等）的提交与查看。当前这些材料主要面向 PC / Web 管理后台进行审核。会议提出需要讨论：项目材料能否在 APP 端直接进行修改或更新。

## 待决策

1. APP 端允许编辑哪些材料？（文本类计划书、PPT、视频、图片附件、报名表字段等）
2. 编辑权限如何分配？（仅队长 / 所有队员 / 按角色）
3. 编辑后的材料如何与 PC 端审核流程同步？是否需要重新提交审核？
4. 是否存在版本控制？APP 端编辑是否生成新版本，还是直接覆盖？
5. 离线编辑与自动保存策略是什么？
6. 文件大小、格式、安全扫描（敏感信息、侵权素材）如何处理？
7. 与创赛工坊任务（T013/T022）的关系：工坊产出是否也算“项目材料”？
8. 赛事结束后，这些材料是否沉淀为长期资产？沉淀规则是什么？
9. 学校 / 企业审核人员是否需要在 APP 内看到修改记录或审批入口？

## 建议验收

- 输出《APP 端项目材料编辑决策文档》，明确上述 9 个问题；
- 若决策支持 APP 端编辑，需给出字段级权限矩阵与数据同步方案；
- 若决策不支持，需明确替代路径（如引导至 Web / PC 端编辑）并保留 handoff；
- 不提前在 APP 内实现尚无审核闭环的编辑功能。

## 约束

- 项目材料归属赛事 Workspace Runtime，不得在学生 Profile 中形成第二份材料真相源；
- 赛事结束后的长期资产通过稳定 ID 引用项目与赛事，不复制对象；
- 编辑行为不得破坏 PC02 已建立的审核状态机（待审核 / 已通过 / 已驳回等）。

## 禁止

- 施工线程不得自行决定全部材料都可在 APP 端编辑；
- 不得为“支持编辑”而绕过学校 / 企业审核流程；
- 不得将项目材料下载到本地后作为独立副本再上传，造成版本分裂。

---

# T026｜APP 内公益助力板块（首页拼贴广告位 + 应用中心常驻入口 + 看广告助力）

**类型：产品决策卡 / 施工卡**  
**状态：待决策**  
**优先级：P1**  
**前置：F04 Decision A（学力值经济模型）、T016 首页核心功能区重构、T018 应用中心、广告接入方案**

## 背景

需要在 APP 内新增“公益助力”板块：

- 「首页」设置一个拼贴广告位，动态推送一个公益项目，点击直达该项目详情；
- 「应用中心」增加一个常驻入口，点击进入公益活动列表，再进入详情；
- 详情页包含活动介绍和助力入口；
- 用户通过观看一段广告完成助力，同时可获得一定数量的学力值。

## 待决策

1. 公益助力的学力值奖励类型与数额是什么？（成长分 / 积分？固定值还是浮动？每日上限？）
2. 广告来源与接入方式：是否使用第三方激励视频广告 SDK？播放时长、跳过规则、失败补偿是什么？
3. 公益项目由谁发布与审核？（平台运营 / 企业 / 学校 / 第三方公益机构）
4. 首页拼贴广告位的推送规则：人工运营配置、按时间轮播、还是按用户画像推荐？
5. 应用中心入口的固定位置与分组：是否放在“公益 / 社会责任”分组？是否支持运营开关？
6. 公益活动列表需要哪些状态与筛选？（进行中 / 已结束 / 即将开始 / 我助力的）
7. 活动详情页除了介绍和助力入口，是否需要展示进度、已助力人数、证书或感谢凭证？
8. 助力记录归属哪里？是否作为长期资产？是否生成证书或徽章？
9. 与 D03 任务体系的关系：公益助力是否同时是一种平台任务或每日任务？
10. 反刷量与风控：如何识别虚假观看、模拟器、重复助力？

## 建议验收

- 输出《公益助力板块产品方案》，明确上述 10 个问题；
- 若决策通过，给出首页广告位、应用中心入口、活动列表、详情页、广告播放页的页面流与字段；
- 广告 SDK 未接入时，保留真实的 handoff 出口（如“广告系统待接入”提示），不伪造已播放；
- 不提前实现奖励发放逻辑，直到 F04 Decision A 明确学力值模型。

## 约束

- 学力值奖励必须遵循 F04 Decision A，施工线程不得自行定义数值或类型；
- 公益项目与助力记录通过稳定 ID 引用，不在学生 Profile 中复制第二份助力真相源；
- 广告播放与助力完成状态由广告 SDK / 后端验证，不由前端自行标记；
- 不构造对学生不透明的“公益信用分”或隐藏评分。

## 禁止

- 不允许绕过 F04 自行拍板“看广告得学力值”的具体规则；
- 不允许在首页写死单一公益项目，必须支持运营动态配置；
- 不允许前端伪造广告播放完成状态并直接发放奖励；
- 不允许将公益板块做成全局任务系统以外的第二套奖励真相源。

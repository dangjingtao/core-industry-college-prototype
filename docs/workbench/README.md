# 工作台账

当前统一工作入口：[`00-work-ledger.md`](./00-work-ledger.md)

任务状态、施工提交、评审结论和最终功能级回归证据都在工作台持续维护。

## 核心大使计划 V1.1｜2026-08-27

产品规则：[`../product/18-campus-ambassador-prd.md`](../product/18-campus-ambassador-prd.md)

本轮 V1.1 修订已完成：

1. [`T050-校园大使V1.1展示名与团队名模型.md`](./T050-校园大使V1.1展示名与团队名模型.md)｜**PASS**｜共享地基：展示名统一、团队名模型与条款语义；
2. [`T051-PC校园大使申请问卷详情视角.md`](./T051-PC校园大使申请问卷详情视角.md)｜**PASS**｜PC：问卷详情视角、legacy snapshot 合同与 focused regressions 已完成并通过复验；
3. [`T052-PC校园大使周度团队运营与导出.md`](./T052-PC校园大使周度团队运营与导出.md)｜**PASS**｜PC：自然周团队运营分析 + 指定团队 / 全部团队导出；T054 统一 UTC+8 周边界并完成跨端复验；
4. [`T053-App校园大使团队经营视角.md`](./T053-App校园大使团队经营视角.md)｜**PASS**｜App：校园大使「我的团队」经营看板；
5. [`T054-校园大使V1.1联动与最终验收.md`](./T054-校园大使V1.1联动与最终验收.md)｜**PASS**｜跨端一致性、权限、生命周期、导出与最终 Quality Gate 全部通过。

完成顺序：`T050 → (T051 ∥ T052 ∥ T053) → T054`。

> T052 的“按周”是运营分析视角，不是财务周结算；自然周固定按 UTC+8（Asia/Shanghai）周一至周日计算。T050 只修改产品展示名，底层 `ambassador / partner` role 不迁移。

## 核心大使计划 V1.0｜2026-08-26

产品规则同上；V1.0 已完成并作为 V1.1 的稳定基线：

1. [`T043-核心大使计划共享业务模型.md`](./T043-核心大使计划共享业务模型.md)｜**PASS**｜共享业务模型与活动状态；
2. [`T044-核心大使申请组队与点亮.md`](./T044-核心大使申请组队与点亮.md)｜**PASS**｜App：申请、组队与点亮；
3. [`T045-专属推广码与团队推广成果.md`](./T045-专属推广码与团队推广成果.md)｜**PASS**｜App：专属推广码与团队推广成果；
4. [`T046-核心大使计划运营工作台.md`](./T046-核心大使计划运营工作台.md)｜**PASS**｜PC：接入现有运营控制面；
5. [`T047-核心大使计划联动与验收.md`](./T047-核心大使计划联动与验收.md)｜**PASS**｜PC 运营配置、表单设计器、活动条款与学校招募素材收口；
6. [`T048-核心大使扫码分流与团队体验.md`](./T048-核心大使扫码分流与团队体验.md)｜**PASS**｜App 扫码分流、身份入口、团队招募二维码与伙伴加入体验；
7. [`T049-核心大使联动生命周期与最终验收.md`](./T049-核心大使联动生命周期与最终验收.md)｜**PASS**｜前后台真相源、活动生命周期、边界问题与最终验收。

V1.0 完成顺序：`T043 → (T044 ∥ T046) → T045 → T047 → T048 → T049`。

## 当前 R-Final 收口

按顺序执行，不再拆更多卡：

1. [`RF01-semantic-closeout.md`](./RF01-semantic-closeout.md)｜施工：关闭“学力值 / GrowthScore”与“第三方账号 / 账号绑定”两个语义 blocker；
2. [`RF02-final-rereview.md`](./RF02-final-rereview.md)｜独立评审：复核 RF01，并重跑完整 R-Final 后给最终 PASS / CHANGES REQUIRED。

当前总评审依据：[`R-Final-review.md`](./R-Final-review.md)。

## PC 增量接入卡｜2026-08-19

本轮只做已确认的 PC 基建与三创赛垂直运营补强，不照搬旧后台：

1. [`PC07-system-settings.md`](./PC07-system-settings.md)｜系统设置：短信配置 / 发送记录 + 内容模板；
2. [`PC08-competition-infrastructure.md`](./PC08-competition-infrastructure.md)｜赛事基建：Competition 档案、阶段、报名记录投影、一级分类；
3. [`PC09-sanchuang-operations.md`](./PC09-sanchuang-operations.md)｜三创赛独立运营工作台 + 营销实绩聚合（订单 / 直播 / 视频）。

推荐顺序：`PC07` 可并行；`PC08 → PC09`。

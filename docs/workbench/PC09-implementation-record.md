# PC09｜三创赛运营工作台施工记录

> 施工目标：在 PC08 通用赛事基建之上增加三创赛垂直运营工作台；独立运营体验，不复制 Competition / Team / Registration 真相源。

## 已施工

- 新增一级导航「三创赛运营」，与通用「赛事管理」并列；路由为 `/admin/sanchuang`、`/admin/sanchuang/:competitionId`、`/admin/sanchuang/:competitionId/performance`。
- `/admin/sanchuang` 只负责跳转当前运营 profile；具体届次通过集中 `sanChuangProfiles` capability mapping 维护，业务组件不散落 `isSanChuang` 特判。
- 当前 profile 对齐既有 `sanchuang-16` Competition；届次选择器由 profile 列表生成，即使首版只有一个可用届次，也没有把“第十六届”写成永久固定路由逻辑。
- 三创赛 Hero / Header 使用现有 PC Design Tokens 做更强赛事识别，没有新建第二套设计系统。
- 运营概览继续读取现有 `competitionControlById()` 的 Competition / Team / qualification / CompetitionProject，以及 PC08 `CompetitionStage`。
- 排名 / 成绩首版明确显示“未接评分规则”，获奖结果显示等待官方回流；没有从营销实绩擅自计算比赛成绩。

## 营销实绩

- 新增 `/admin/sanchuang/:competitionId/performance` 聚合页；订单、直播、视频在同一工作台内通过指标卡 + evidence tabs 展示，不拆成三个一级菜单。
- 首版稳定 mock 来源包含「抖音」「三创好物」，并保留第三方导出文件 / API mock 两种数据链路语义。
- 支持团队、数据周期、来源平台筛选；赛事 / 届次和当前 Stage 同时显示在统计上下文中。
- GMV、退款后净额、订单量、直播场次 / 观看 / 成交、视频发布 / 播放 / 互动均由明细记录现场聚合，不维护另一份“魔法数字”。
- 导入 / 同步批次表达来源、批次 ID、数据周期、导入时间、成功 / 部分异常 / 失败状态、明细数量与异常说明。
- 聚合指标可点击切换到订单 / 直播 / 视频明细；明细保留来源平台和 batchId，形成「聚合指标 → 来源平台 → 批次 → 原始记录范围」证据链。
- 失败批次 detailCount=0，不进入聚合结果；部分异常批次保留原始记录语义，不用标准化字段反写第三方事实。
- 「导出当前筛选」会生成当前筛选证据 CSV，并在页面反馈导出范围。
- 页面明确声明「当前数据仅归集，不自动计入比赛评分」，并区分原始第三方数据、平台标准字段、聚合展示结果、未来评分结果。

## 数据边界

- `pc09-data.ts` 只维护三创赛 capability profile 与营销证据 mock；不复制 Competition、Team、Registration 或 Stage Store。
- Team 继续来自 PC02 `competition-control-data.ts`；Stage 继续来自 PC08 `pc08-data.ts`。
- 普通赛事 `innovation-cup-2026` 不存在三创赛 profile；即使直接访问 `/admin/sanchuang/innovation-cup-2026`，页面也会拒绝进入专属工作台而不是临时套用三创赛逻辑。
- 没有新增赛事缴费、自动评分、自动排名、晋级算法或三套订单 / 直播 / 视频菜单。

## Focused browser assertions

新增 `apps/pc/tests/pc09.spec.ts`，覆盖：

1. 一级「三创赛运营」入口与 `/admin/sanchuang` 当前届次跳转；
2. 届次选择上下文和当前 Team / Competition 复用；
3. 订单、直播、视频在同一营销实绩页面聚合；
4. 抖音、三创好物两个来源及导入 / 同步批次；
5. 聚合指标 → 对应 evidence tab → batchId / 原始明细范围；
6. 来源筛选仍在同一工作台生效；
7. 当前筛选 CSV 导出原型动作；
8. 普通赛事详情不出现 PC09 工作台内容，普通 Competition 直接进入 PC09 路由也会被 capability mapping 拒绝。

## 自动验证说明

仓库既有 `Prototype Quality Gate` 会执行 PC TypeScript / Vite hard gate，并由 PC browser regressions 运行 `pc09.spec.ts`；Cloudflare PC workflow 会对 `dev` 执行 development build / deploy。最终自动化结果以 GitHub Actions实际 run 为准。

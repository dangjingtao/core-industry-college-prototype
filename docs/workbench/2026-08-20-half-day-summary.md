# 2026-08-20｜上午半日报

**分支：** `dev`  
**提交人：** 前端施工线程  
**时段：** 2026-08-20 上午

---

## 一、总体进展

上午聚焦手机端三项主线工作：新手引导优化、创赛福利资源补充、T026 公益助力板块落地；随后按负责人要求将首页公益位简化为纯广告位样式，并补充任务卡设计文档链接与完成清单。所有改动均通过 mobile / pc 两端 `typecheck` / `build`，并已推送至 `dev` 分支。

---

## 二、已完成模块

| 任务卡 / 主题 | 模块 | 状态 | GitHub 提交 |
| --- | --- | --- | --- |
| 新手引导优化 | 首页保留任务框架并改为「新手任务」入口；新增 `/tasks/newbie` 页面；学院页合并为单一「创赛新手必修课」并展示学习进度 | 已完成 | [`0c4b4a3`](https://github.com/dangjingtao/core-industry-college-prototype/commit/0c4b4a3) |
| 创赛福利 | 在 `benefits` 数据中新增瑞幸咖啡券、库迪咖啡券，结构与现有出行/外卖券保持一致 | 已完成 | [`ba6d4fe`](https://github.com/dangjingtao/core-industry-college-prototype/commit/ba6d4fe) |
| T026 | 公益助力板块：数据模型、列表页、详情页、激励视频广告 handoff、`LongTermAssets` 助力记录、首页 banner、应用中心「社会责任」入口、路由注册 | 已完成 | [`c3d0dd8`](https://github.com/dangjingtao/core-industry-college-prototype/commit/c3d0dd8) |
| T026 文档 | 任务卡标记完成、补充 T016/T018/产品未决业务清单链接、新增完成清单 | 已完成 | [`10ab7c2`](https://github.com/dangjingtao/core-industry-college-prototype/commit/10ab7c2) |
| 首页公益 banner 优化 | 移除标题与「更多公益」入口，简化为广告位样式；在箭头上方增加「公益助力」小标签 | 已完成 | [`61cabab`](https://github.com/dangjingtao/core-industry-college-prototype/commit/61cabab) |

---

## 三、关键变更摘要

### 新手引导优化 [`0c4b4a3`](https://github.com/dangjingtao/core-industry-college-prototype/commit/0c4b4a3)

- 首页「任务专区」保留原有框架，将「继续赛事内任务」改为「新手任务」入口，点击跳转独立页面。
- 新增 `/tasks/newbie`：5 项新手任务（完善资料、每日打卡、学习新手课程、领取创赛福利、发现赛事），完成后显示完成状态并返回首页。
- 学院页「新手必修」合并为单一课程《创赛新手必修课》，原 3 门课程作为课程目录；分类筛选同步增加「新手必修」。

### 创赛福利资源补充 [`ba6d4fe`](https://github.com/dangjingtao/core-industry-college-prototype/commit/ba6d4fe)

- 新增「瑞幸咖啡饮品券」「库迪咖啡饮品券」领取数据。
- 字段沿用 `bindPhone`、`couponValidityDays`、`dailyClaimLimit`，与现有打车券/外卖券逻辑一致。

### T026 公益助力板块 [`c3d0dd8`](https://github.com/dangjingtao/core-industry-college-prototype/commit/c3d0dd8)

- 新增 `features/welfare` 模块：`data.ts` 配置 3 个公益项目，`WelfarePages.tsx` 实现列表 / 详情 / 广告 handoff。
- `LongTermAssets` 接入 `WelfareParticipationRecord`，`helpWelfare` 仅生成记录与更新计数，不自行发放奖励。
- 首页任务专区下方、热门赛事上方新增公益项目 banner。
- 应用中心新增「社会责任」分组与「公益助力」入口。
- 新增路由 `/welfare`、`/welfare/:welfareId`、`/welfare/:welfareId/ad`。

### 首页公益 banner 简化 [`61cabab`](https://github.com/dangjingtao/core-industry-college-prototype/commit/61cabab)

- 移除「公益助力」section 标题与「更多公益」action，改为纯广告位卡片。
- 右侧箭头上方增加「公益助力」半透明小标签，明确模块归属。

---

## 四、验证状态

| 检查项 | 结果 |
| --- | --- |
| `apps/mobile` TypeScript 类型检查 | 通过 |
| `apps/mobile` Vite 生产构建 | 通过 |
| `apps/pc` TypeScript 类型检查 | 通过 |
| `apps/pc` Vite 生产构建 | 通过 |
| `dev` 分支推送 | 已完成（当前远端 `10ab7c2`） |

---

## 五、遗留与下一步

| 任务卡 / 主题 | 模块 | 状态 | 说明 |
| --- | --- | --- | --- |
| T026 | 奖励发放逻辑 | 待 F04 Decision A | 学力值经济模型未决，当前仅作占位展示 |
| T026 | 激励视频广告 | 待 SDK 接入 | 当前为 handoff 页 + 原型调试入口 |
| 新手引导 | 真实后端对接 | 待后续 | 打卡、课程进度、福利领取状态目前依赖本地/现有 store |

---

## 六、审查建议关注点

1. **首页公益 banner 运营能力**：当前按「featured + 进行中」规则自动选取首个项目，是否需要后台配置轮播或关闭开关。
2. **新手任务完成判定**：「领取创赛福利」依赖固定 benefit ID 列表，后续新增福利类型需同步维护。
3. **T026 助力记录与任务聚合**：`WelfareParticipationRecord` 目前不进入 `/tasks`，待 F04 Decision C 明确任务关系后再决定是否派生。

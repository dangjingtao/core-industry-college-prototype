# T013C 施工记录｜S5 / S6 与六阶段总收口

**施工卡：** `T013C-S5S6与总收口.md`  
**施工状态：** 第三次独立复审已 **PASS（2026-08-19）**；T013C 子卡已完成收口。**本记录不替代 T013 总卡判定，总收口结论以 `docs/workbench/T013-review.md` 为准**。  
**目标分支：** `dev`

## 1. 证据边界

首轮施工时，当前 Google Drive 连接未能检索到 `核心产业学院-mockplus-offline.zip`，因此只按 T013C 卡中已锁定的页面要求施工。

独立复审随后重新打开原始 Mockplus 114–118、131–134，并指出首轮实现对 114、115、131 做了未经证据支持的“产品优化”。本轮返修以该独立复审重新核对的原始页面内容为准，目标是恢复原交互，而不是继续扩功能。

## 2. Mockplus 逐页对应

| Mockplus | T013C 当前落地 |
|---|---|
| 114｜S5 赛事评分预检 | 独立动态问答；项目阶段；比赛材料多选；AI 准备下一题；完善度。核心题完成后提供“还有什么要点补充（选填）”与可选材料上传，再进入第二段 PPT 问答。 |
| 115｜S5 PPT 动态答题 | 独立动态问答；路演时长恢复为 `3 分钟 / 5 分钟 / 8 分钟 / 10 分钟及以上`；PPT 风格恢复为 `商务风 / 极简风 / 设计风 / 轻奢风`。删除首轮自创的“PPT 最需要强化哪些要点”和必答“是否还有要点需要补充”；核心题完成后仅提供选填补充说明与可选上传。 |
| 116｜S5 PPT 生成确认 | 明确任务目标“基于用户方案生成可直接使用的路演 PPT”；汇总 114 + 115 两段核心问答，并保留两段选填补充 / 附件；AI 核心信息；算力预估 / 冻结原型提示；返回修改 / 确认生成；团队可见。 |
| 117｜S5 任务进度 | 复用 Task Runtime：参赛档案、问答材料、生成、质量检查；显示冻结算力；允许离页；站内消息文案；支持模拟运行 / 完成。 |
| 118｜S5 PPT 成果详情 | 9 页路演结构 mock；编辑、分享、队员提交 / 队长采纳；明确“不是真实 .pptx / 不代表官方提交”。独立复审明确该 mock 不作为本轮阻塞项。 |
| 131｜S6 公司推荐动态答题 | 只保留两组核心动态问题：期望行业 + 希望工作城市。行业恢复 `互联网/科技、金融科技、软件开发 SaaS、电子商务、AI/大数据、新媒体内容、物联网、物流/供应链、不限`；城市恢复 `北京、广州、杭州、上海、深圳、成都、南京、武汉、不限`。删除首轮自创的必答能力题；核心题完成后提供选填补充 / 上传。 |
| 132｜S6 生成确认 | 问答摘要、AI 提取信息、主观补充、算力预估 / 冻结；返回修改 / 确认；明确“生成结果仅自己可见”；确认页中的能力类信息只允许作为 AI 提取 / 建议，不反推成 131 的必答题。 |
| 133｜S6 任务进度 | 生成“公司推荐小报告”；复用 Task Runtime；允许离页；站内消息文案；模拟完成。 |
| 134｜S6 成果详情 | “公司推荐小报告”；企业推荐卡；直接链接现有 `/companies/:companyId` stable id；明确不写回 StudentProfile / 成绩 / 证书；不展示人才总分。 |

## 3. 首轮 REQUEST CHANGES 返修

### RC-1｜S5 114 / 115 偏离原 Mockplus

已修：

- 114 补回选填要点说明与选填材料上传；不计入核心问答完善度。
- 115 时长恢复为原四档。
- 115 恢复 PPT 风格题。
- 删除首轮自创的“PPT 最需要强化哪些要点”必答题。
- 删除首轮自创的“是否还有要点需要补充”必答题；补充内容回到选填区。

### RC-2｜S6 131 被重新设计

已修：

- 恢复原行业选项与城市选项。
- 删除“品牌零售 / 数据服务”等首轮自创行业项。
- 删除“更希望继续发挥哪类能力？”第三道必答题。
- 补回选填补充说明与选填材料上传。

### RC-3｜S5 PPT 材料锁与流程冲突

已修：

- `s5-pitch-ppt` 加入 `optionalMaterialTaskIds`。
- `pitchDraft: false` 仍真实表示当前项目没有现成路演稿，但不会再把 PPT 任务锁成“待补材料”。
- 技能页进入和“评分预检 → PPT 问答”续接现在使用同一可用性规则。

## 4. 代码落点

- `apps/mobile/src/features/competition-workspace/T013CTaskPages.tsx`
  - S5 114 / 115 按复审核对的原 Mockplus 恢复。
  - S6 131 恢复为行业 + 城市两组核心题。
  - 114 / 115 / 131 的补充说明与附件均为选填。
  - S5 PPT 确认页同时携带 114 / 115 两段的主观补充与附件。
  - 其它 S1–S4 继续回退 T013B / T013A 已有实现。
- `apps/mobile/src/features/competition-workspace/runtime.tsx`
  - `s5-pitch-ppt` 改为 optional-material task，消除 `pitchDraft` 硬锁。
- `apps/mobile/src/features/competition-workspace/T013CResultPage.tsx`
  - S5 PPT mock 成果与团队确认动作保持。
  - S6 私密公司推荐小报告保持。
- `apps/mobile/src/features/competition-workspace/T013CResultsPage.tsx`
  - S6 个人成果继续独立于团队“已生成 / 已采纳”分组。
- `apps/mobile/tests/t013c-s5s6.spec.ts`
  - 更新为原 Mockplus 的 S5 / S6 正向断言。
  - 新增反向断言，确保 `15 分钟`、`PPT 最需要强化哪些要点`、`数据服务`、`数据分析`必答等错误交互不再出现。
  - 新增 S5 技能页断言，确保缺少 `pitchDraft` 时 PPT 任务仍可开始。

## 5. 产品边界复核

- 未新增第二套 CompetitionIdentity / Team / CompetitionProject / StudentProfile。
- 所有运行态仍由现有 `WorkshopRuntimeProvider` 按 `competitionId` 隔离。
- S6 不写入长期可信事实，不生成黑盒人才评分。
- S6 推荐企业复用现有 Company 对象，不新增“推荐专用企业表”。
- S6 私密成果不进入团队“已生成 / 已采纳”列表，不提供队长采纳动作。
- S5 mock PPT 明确不是实际文件、不是官方比赛提交。
- `pitchDraft` 仍可作为项目材料存在，但不再成为 S5 PPT 的硬门槛。
- ended / revoked 仍由 `RequireCompetitionAccess` 阻断赛事期新操作。

## 6. 回归范围

本轮 focused browser assertions 覆盖：

1. `S5 114 → S5 115 → PPT 确认 → 进度 → PPT 成果`；
2. 114 / 115 的选填补充与上传入口存在；
3. 115 原始时长 + PPT 风格存在，首轮自创必答题不存在；
4. S5 技能页在 `pitchDraft: false` 时不显示“缺少：现有路演稿”，PPT 任务可开始；
5. S6 131 只有行业 + 城市两组核心问答，原始选项存在，自创能力必答题不存在；
6. S6 选填补充 / 上传、私密确认、stable company route、不生成“人才总分”；
7. S1–S6 六入口 smoke；
8. ended competition 隔离。

目标完整回归仍为：`mobile verify + T013 + T013A + T013B + T013C`。

## 7. 验证状态

- 返修代码与 focused test 已提交到 `dev`。
- 现有 `r-final-check.yml` 已包含 T013 / T013A / T013B / T013C browser suites，mobile `verify` 仍是硬门。
- 当前 GitHub connector 对 push-triggered Actions 的 run / conclusion 读取能力有限，因此本记录不伪造“完整回归已绿”。
- **T013C 已由第三次独立复审判定 PASS（2026-08-19）**；详细复审证据与 T013 总收口边界见 `docs/workbench/T013-review.md`。

施工记录只同步已确认事实；T013 总卡状态以独立总复审结论为准。
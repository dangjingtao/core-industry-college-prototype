# T013C 施工记录｜S5 / S6 与六阶段总收口

**施工卡：** `T013C-S5S6与总收口.md`  
**施工状态：** 已完成代码施工，待独立复审；**本记录不将 T013 总卡标记为 PASS**。  
**目标分支：** `dev`

## 1. 证据边界

T013C 卡已固化 Mockplus 114–118、131–134 的页面语义和 P0 交互要求，本次实现严格按该卡施工。

本线程尝试通过当前 Google Drive 连接检索 `核心产业学院-mockplus-offline.zip` / `核心产业学院`，未返回匹配文件。因此本次**不声明重新打开并独立核验了原始 Mockplus 离线包**；逐页对应证据以 T013C 卡中已经锁定的页面要求为施工真相源。后续独立复审若能访问原始包，应再次做页面级抽查。

## 2. Mockplus 逐页对应

| Mockplus | T013C 落地 |
|---|---|
| 114｜S5 赛事评分预检 | 独立动态问答；项目阶段；比赛材料多选；AI 准备下一题；完善度。完成后直接进入第二段 PPT 问答，不把两段合成一屏。 |
| 115｜S5 PPT 动态答题 | 独立动态问答；路演时长、强化要点、“是否还有要点补充”；补充说明；PDF / Excel / CSV / 图片入口；进入 PPT 生成确认。 |
| 116｜S5 PPT 生成确认 | 明确任务目标“基于用户方案生成可直接使用的路演 PPT”；汇总两段问答；AI 核心信息；主观补充；算力预估 / 冻结原型提示；返回修改 / 确认生成；团队可见。 |
| 117｜S5 任务进度 | 复用 Task Runtime：参赛档案、问答材料、生成、质量检查；显示冻结算力；允许离页；站内消息文案；支持模拟运行 / 完成。 |
| 118｜S5 PPT 成果详情 | 9 页路演结构 mock；编辑、分享、队员提交 / 队长采纳；明确“不是真实 .pptx / 不代表官方提交”；未把版本管理作为 P0。 |
| 131｜S6 公司推荐动态答题 | 标题“公司推荐”；行业、城市、能力偏好多选；逐题动态问答；AI 下一题；完善度；补充说明；可信档案只作为输入。 |
| 132｜S6 生成确认 | 问答摘要、AI 提取信息、主观补充、算力预估 / 冻结；返回修改 / 确认；明确“生成结果仅自己可见”；事实输入 / AI 建议分层。 |
| 133｜S6 任务进度 | 生成“公司推荐小报告”；复用 Task Runtime；允许离页；站内消息文案；模拟完成。 |
| 134｜S6 成果详情 | “公司推荐小报告”；企业推荐卡；直接链接现有 `/companies/:companyId` stable id；明确不写回 StudentProfile / 成绩 / 证书；不展示人才总分。 |

## 3. 代码落点

- `apps/mobile/src/features/competition-workspace/T013CTaskPages.tsx`
  - S5 两段动态问答。
  - S5 PPT / S6 公司推荐的确认与进度 Pattern。
  - 其它 S1–S4 继续回退 T013B / T013A 已有实现，避免复制既有逻辑。
- `apps/mobile/src/features/competition-workspace/T013CResultPage.tsx`
  - S5 PPT mock 成果与团队确认动作。
  - S6 私密公司推荐小报告。
  - 企业卡直接复用 `public-platform/data.ts` 中既有 Company stable id。
- `apps/mobile/src/features/competition-workspace/T013CResultsPage.tsx`
  - S6 个人成果独立于团队“已生成 / 已采纳”分组展示。
  - 团队成果列表不会把 S6 私密推荐混入队长采纳流程。
- `apps/mobile/src/app/App.tsx`
  - 工坊 task / review / progress / result detail 路由升级到 T013C wrapper；S1–S4 仍由 fallback 保持现有契约。
  - 工坊成果列表切到 T013C results wrapper，显式维护 S6 私密边界。
- `apps/mobile/tests/t013c-s5s6.spec.ts`
  - S5 完整浏览器动线。
  - S6 私密动线与 stable company route。
  - S1–S6 六入口 smoke。
  - ended competition 隔离 / 不继续创建赛事期事实。
- `.github/workflows/r-final-check.yml`
  - 将 `tests/t013c-s5s6.spec.ts` 纳入 mobile browser regressions；保留原型阶段 browser soft gate，不改变既有 hard gate。

## 4. 产品边界复核

- 未新增第二套 CompetitionIdentity / Team / CompetitionProject / StudentProfile。
- 所有运行态仍由现有 `WorkshopRuntimeProvider` 按 `competitionId` 隔离。
- S6 不写入长期可信事实，不生成黑盒人才评分。
- S6 推荐企业复用现有 Company 对象，不新增“推荐专用企业表”。
- S6 私密成果不进入团队“已生成 / 已采纳”列表，不提供队长采纳动作。
- S5 mock PPT 明确不是实际文件、不是官方比赛提交。
- 算力继续沿用原型冻结 / 预估表达，没有新增真实扣费模型。
- ended / revoked 仍由 `RequireCompetitionAccess` 阻断赛事期新操作。
- 未引入全局开放聊天、完整职业规划系统、能力雷达、真实 AI 异步服务或真实 PPT 生成。

## 5. 回归证据

新增 focused browser assertions 覆盖：

1. `S5 评分预检 → PPT 问答 → 生成确认 → 进度 → PPT 成果`；
2. `S6 公司推荐 → 生成确认（仅自己可见）→ 进度 → 公司推荐成果`；
3. S6 结果不存在团队采纳动作、不存在人才总分；
4. 推荐企业链接复用 `/companies/cloud-retail` 等既有 stable id；
5. S1–S6 六技能入口同时存在；
6. 历史 ended 赛事不会进入 S6 新任务，也不会渲染当前赛事的私密结果。

## 6. 本线程验证状态

- 新增 T013C TSX / Playwright 文件已做 TypeScript transpile 语法检查，未发现语法级错误。
- `r-final-check.yml` 已包含 T013C focused browser suite，并会对 `dev` 的 mobile 变更触发既有 quality gate。
- 当前连接器无法可靠读取这次 push-triggered GitHub Actions run 的最终 conclusion，因此本线程**不伪造 CI 已通过**；typecheck / build / T013A+B+C 浏览器回归的最终机器结论应以对应 Actions run 为准。

施工线程只记录事实，不提前判定 T013 总卡 PASS。

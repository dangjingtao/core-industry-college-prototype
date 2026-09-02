# T058｜排行榜点赞与周周期交互｜实施记录

**任务卡：** `docs/workbench/tasks/T058-leaderboard-like-interaction.md`  
**分支：** `dev`  
**状态：** REVIEW  
**日期：** 2026-09-02

## 实施结论

T058 已完成学习排行榜点赞状态机原型施工，并在现有 `/courses/leaderboard` 详情页中真实可演示。

## 已实现

- 本校榜 / 全国榜所有非本人条目提供真实点赞按钮；
- 未点赞 → 点赞 → 取消 → 再点赞完整切换；
- 点赞数随当前查看者的有效点赞状态同步 +1 / -1；
- 点赞操作不改变榜单排名、学习时长或排序；
- 本人条目点赞按钮 disabled，不能自赞；
- 同一公开用户通过稳定 `personKey` 在本校榜 / 全国榜共享当前周点赞状态；
- 当前用户在本校榜 Top 10 外与全国榜 Top 10 内的基础点赞数统一；
- 当前查看者的有效点赞集合按周保存到 prototype localStorage；
- storage key 使用当周周一日期：`core.learning-leaderboard.likes.YYYY-MM-DD`；
- 历史周点赞状态不会被当前周读取，新周自然进入新的互动周期；
- 榜单规则区明确说明点赞按周记录、可取消并重新点赞、点赞不影响排名。

## 正式实现文件

- `apps/mobile/src/features/learning-leaderboard/T056LeaderboardPage.tsx`
- `apps/mobile/tests/t058-leaderboard-like-interaction.spec.ts`
- `.github/workflows/r-final-check.yml`

## 关键提交

- `2857a02` — `feat: add T058 weekly like interactions`
- `1b3e18b` — `test: cover T058 leaderboard like interaction`
- `93a40e2` — `test: add T058 to leaderboard regression suite`
- `a200e39` — `docs: mark T058 leaderboard likes ready for review`

## 自动化验证

Prototype Quality Gate run `33579242077`：

- `Verify mobile routes, types and build` = **success**；
- `Run learning leaderboard regressions` = **success**。

T058 专项 Playwright 覆盖：

1. 林知夏本校榜第 1 名从 38 赞开始；
2. 点赞后变 39，排名仍为第 1；
3. 再点取消后恢复 38；
4. 再次点赞后恢复已点赞状态；
5. 切到全国榜，同一 `personKey` 的林知夏保持已点赞与 39 赞；
6. 全国榜“我”的点赞入口 disabled；
7. 当前周点赞写入当周 storage key；
8. 仅存在历史周点赞数据而当前周无状态时，页面保持未点赞，验证周隔离。

## 边界

本卡没有建设生产级点赞接口、服务端持久化、账号跨设备同步或点赞榜。这些不属于当前原型施工范围。

## Review 建议

人工 Review 重点看：

1. 已点赞态视觉是否足够明确但不过分社交化；
2. 44px 级触控区域在榜单高密度行中是否舒适；
3. 本人 disabled 状态是否自然；
4. 切换本校榜 / 全国榜时同一用户点赞状态是否符合直觉；
5. 点赞后的视觉变化是否完全不干扰排名主信息。

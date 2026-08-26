# T043 实施记录

日期：2026-08-26

## 交付

`@core/shared` 新增核心大使计划共享业务模型与状态 provider：

- `campus-ambassador.ts`：活动生命周期、学校招募码、团队/成员角色、团队状态、推广码、有效新增和激励状态；
- `campus-ambassador-state.tsx`：两端可复用的 `AmbassadorStateProvider`，提供核心大使申请、推广伙伴加入和激励状态更新；
- 活动结束、单活动单团队、1+3 自动点亮、点亮后继续加人、有效新增幂等均由共享函数约束。
- 学校大使招募码与大使个人团队招募码为两类独立实体；学校码只进入大使申请，伙伴加入只按唯一团队码定位。
- 点亮显式要求 `1` 位有效核心大使和至少 `3` 位有效推广伙伴，不以有效成员总数代替角色规则。

移动端 `App` 与 PC 端 `App` 均挂载该 provider。该模型不创建第二套 `session`、`user`、`school` 或 `CompetitionIdentity`。

## 验证

- `apps/mobile`: `npm run typecheck` 通过；
- `apps/pc`: `npm run typecheck` 通过；
- `packages/shared` 无独立 typecheck script，已由上述两端编译链路共同验证。

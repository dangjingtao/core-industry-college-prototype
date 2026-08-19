# PC-BD01｜独立复审（第二轮）

> 分支：`dev`
> 复审快照：当前 `dev` HEAD（施工线程已按首轮 `CHANGES REQUIRED` 完成修正）
> 复审日期：2026-08-19
> 结论：**修正已施工 / build 通过 / browser 回归待环境补验**
> 性质：独立复审，只确认首轮四个 Finding 是否已收口，不代替 PC05 最终验收

---

## 1. 本轮复审范围

针对 `docs/workbench/PC-BD01-review.md` 的四个 Finding，检查当前代码是否已按要求修正：

| Finding | 级别 | 首轮要求 | 当前实现 | 结论 |
| --- | --- | --- | --- | --- |
| 1 学生详情 → 学生控制台对象切换 | P0 | basic-data 学生样例与 PC05 复用同一人，或动作文案明确说明不切换 | `BasicDataConsole` 学生列表与详情均使用 `pc05-data.ts` 的 `studentAccountSeed`（林晓），详情页明确提示“当前 PC05 只提供这一位学生的治理样例”；`pc-basic-data.spec.ts` 已加断言验证进入 `/admin/students` 后仍显示“林晓” | 已收口 |
| 2 默认视图暴露技术验收信息 | P1 | stable id / canonical object / DataSource 等用 `data-pc05-technical` 标记，默认隐藏 | `BasicDataConsole` 中 `StableId`、`Organization(type=...)`、`CompetitionTrack`、`CompetitionLifecycle`、canonical DataSource 等均已加 `data-pc05-technical`；`AdminControlPlaneShell` 默认隐藏这些信息；测试先在默认模式断言业务文案，再切技术模式断言 canonical 信息 | 已收口 |
| 3 台账未登记 PC-BD01 | P1 | `00-work-ledger.md` 总状态表增加 PC-BD01，PC05 前置增加 PC-BD01，流程图同步 | 当前台账已包含 `PC-BD01` 行，PC05 前置已列 `PC02、PC03、PC04、PC-BD01`，PC 流程图已将 PC-BD01 放在 PC02–PC04 与 PC05 之间 | 已收口 |
| 4 `PC01OperationsConsole` 不可达旧文案 | P2 | 移除或改写 `section === "basicData"` 分支的旧语义 | `PC01OperationsConsole` 的 `basicData` 分支已改为“跨模块维护工作台 / 索引 / 数据接入治理”，不再出现“统一从这里发布”“主数据 + 字典 + 模板 + 权限”等旧表述 | 已收口 |

---

## 2. 静态验证结果

- `apps/pc/src/admin/BasicDataConsole.tsx` 未再出现 `studentId`、`verified / unverified` 学校认证状态机、“统一字典/模板发布”等第二真相语义。
- 学校数据直接读取 `PC03State` 的 `Organization(type=学校)`；赛道 / 阶段绑定 `competitionId=sanchuang-16` 并指向赛事控制台维护。
- 模板索引明确归属：证书 → PC04、协议 → Competition、Banner → Content、权益规则 → Benefit。
- 导入批次状态只描述数据接入流程，并展示最终写回对象。
- `data.ts` 中 `sourceMeta` 仍只含五类 canonical DataSource：平台配置 / API 同步 / 文件导入 / 人工修正 / Runtime。

---

## 3. Build 结果

```text
npm run verify:pc
> tsc -b 通过
> vite build 通过（dist/index.html + assets）
```

---

## 4. Browser 回归状态

`pc-basic-data.spec.ts` 已按修正后的语义重写，覆盖：

1. `/admin/basic-data` 入口与 5 个子页面存在，默认先讲业务；
2. 学生详情与 PC05 复用同一“林晓”样例，无提示切换问题；
3. 学校页业务 / 技术信息分层；
4. 字典页业务归属与技术模式分层；
5. 模板页业务归属与技术模式分层；
6. 导入页批次治理、五类 DataSource 与写回对象分层；
7. PC02 学校审核 / 官方资格 / Workspace Gate 继续分层；
8. `/registration-portal/*` 与 PC03 / PC04 / PC05 关键路由未被破坏。

本轮复审尝试执行 `npm run e2e -- pc-basic-data.spec.ts`，但当前环境缺少 Playwright Chromium 浏览器二进制（`chrome-headless-shell-mac-arm64` 不存在）。已启动 `npx playwright install chromium` 下载，因下载体积较大，本次会话尚未完成。**因此本轮不自行判定 `PASS`，browser 验证需待环境就绪后补做。**

---

## 5. 结论与下一步

- 首轮 `CHANGES REQUIRED` 的四个 Finding 在代码层面均已收口；
- TypeScript / Vite build 已通过；
- 待 browser 回归执行通过后，即可由独立评审判定 `PASS`；
- 通过后可解除 PC05 关于 PC-BD01 的前置阻断，进入 PC05 最终执行验收。

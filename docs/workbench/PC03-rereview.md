# PC03｜Organization + 机会 + 内容运营｜独立复审（二次）

> 复审状态：**PASS**  
> 日期：2026-08-18  
> 复审基线：`dev` HEAD `d14707b75ff5ff578c2bf48004310f7dc9bd0dbd`  
> 前序独立复审：`docs/workbench/PC03-review.md`，结论 `CHANGES REQUIRED`  
> 本轮范围：逐项复核前序 6 个 Finding，并重新对照当前 Mobile Opportunity / Application consumer、PC01 stable ID / DataSource / 全局控制面契约。

---

## 1. 最终结论

前序 6 个 Finding 均已实质关闭，没有发现新的 P0 / P1 业务契约阻断项。

```text
PC03 = PASS
```

本轮 PASS 指：PC03 的 Organization、Opportunity / Application、内容运营三块已经满足当前产品决策、PC01 控制面契约和 Mobile 当前 consumer 的一致性要求。

浏览器断言已补齐上一轮缺口；当前复审环境无法独立取得 direct-push workflow run，也无法在本地联网拉取仓库重新执行 Playwright，因此不伪造新的 CI / browser run 结果。后续 PC05 / R-Final 仍需按总台账执行完整 PC build 与跨端浏览器回归。

---

## 2. Finding 01｜Opportunity 编辑假保存｜CLOSED

已引入共享 `PC03StateProvider`，Opportunity 列表、详情、编辑通过同一份 provider state 工作。

编辑页调用 `updateOpportunity()` 写回共享对象；返回 `/admin/opportunities/:opportunityId` 后详情读取同一对象，不再从独立初始常量恢复。

新的 focused assertion 已覆盖：

```text
编辑标题 / 地区 / skills
→ 保存
→ 返回详情
→ 修改结果仍存在
```

因此上一轮“成功提示存在但业务对象没更新”的问题已关闭。

---

## 3. Finding 02｜Opportunity 缺少 App `skills[]`｜CLOSED

PC03 `OpportunityRecord` 当前包含：

```text
id
 title
 organizationId
 city
 mode
 summary
 skills[]
 status
```

并且：

- 初始 `intern-1 / intern-2 / intern-3 / closed-1` 的 `skills[]` 与 Mobile 当前 Opportunity 对齐；
- 新建支持 skills tags；
- 详情展示 skills；
- 编辑支持 skills；
- stable `opportunityId` 保持只读。

PC 已经能够维护 App 当前真实消费的 Opportunity 字段，不再依赖 Mobile 单边 hardcode。

---

## 4. Finding 03｜PC03 独立 Shell｜CLOSED

原 `PC03AdminFrame` 已删除。

当前 PC03 路由统一经过 `AdminControlPlaneShell`，并继续读取 PC01 的：

- `adminDomains`；
- `currentOperatorContext`；
- 7 个管理域；
- Role；
- Module Permission；
- Data Scope；
- 报名门户出口。

focused assertion 已分别进入 Organization、Opportunity、Content，确认完整管理端主导航与 Operator Context 都存在。

PC03 不再表现为脱离主后台的三个独立模块。

### 非阻断维护项

`AdminControlPlaneShell` 与 `AdminConsole.tsx` 当前仍存在部分 Shell / GlobalNavigation 重复实现。两者当前使用相同 `adminDomains` / `currentOperatorContext`，未形成 PC03 业务或可见语义冲突，因此本轮不作为 PASS 阻断项。

建议 PC05 做 PC 总收口时统一为单一 Shell 组件，避免后续导航与权限上下文漂移。

---

## 5. Finding 04｜内容 Scope 使用展示名 / 自由文本｜CLOSED

当前内容 Scope 已拆成明确联合类型：

```text
全平台
赛事 → competitionId
学校 → organizationId
地区 → region
```

创建时：

- 赛事从明确赛事关系选择器选择；
- 学校只从 `Organization(type=学校)` 选择；
- 地区才使用地区文本值；
- 展示名称只作为 label，不再充当主体关联键。

现有示例及新建 browser assertion 都直接验证 `competitionId=...` / `organizationId=...`。

---

## 6. Finding 05｜Application `failed` 超出当前 App consumer｜CLOSED

PC03 的 `ApplicationStatus` 已收窄为：

```text
submitted
statusUnknown
```

当前 Mobile `PublicPlatform` 的实际 `ApplicationRecord` 同样只消费：

```text
submitted | statusUnknown
```

PC 下拉不再提供 `failed`，focused assertion 也显式验证 `failed` option 不存在。

因此 PC 运营维护 → App 回流的当前状态集合重新一致。

---

## 7. Finding 06｜来源使用自由文案｜CLOSED

Organization 来源已改成 `DataSource[]`，类型直接引用 PC01 `data.ts`。

合法值只有：

```text
平台配置
API 同步
文件导入
人工修正
Runtime
```

多来源通过多个 canonical SourceTag 展示，不再创造“可信数据源”等额外来源类型。

---

## 8. 重新确认的产品边界

本轮未发现以下边界被破坏：

1. Mobile `companyId` 与 PC `organizationId` 沿用同一 stable value；
2. Organization 不等于 Mobile D08 `/me/subjects`；
3. Opportunity 没有扩成 Candidate CRM / 招聘 SaaS；
4. 正式投递仍发生在 App；`Application` 仍是唯一投递事实；
5. 机会圈选仍只使用学校、专业、地区、赛事经历、课程完成、证书、比赛成绩等可解释事实，并由运营确认；
6. 内容正式发布权仍属于核心产业学院运营；
7. 企业 / 学校 / 合作方首期没有直接发布权；
8. 内容定向没有扩成复杂用户标签 / 推荐系统；
9. Opportunity 关闭不会删除已经产生的 Application 历史；
10. PC03 没有修改 Mobile 产品逻辑来迁就后台实现。

---

## 9. Focused assertions 复核

当前 `apps/pc/tests/pc03.spec.ts` 已覆盖上一轮要求的关键回归点：

- 三个 PC03 域均保留完整 PC01 导航和 Role / Module / Data Scope；
- Organization stable id + canonical source；
- Opportunity 编辑保存后返回详情仍存在；
- 新建 / 编辑 `skills[]`；
- Application 无 `failed`；
- 机会圈选保持可解释且不生成 CandidateRecord；
- 内容赛事 Scope 存 `competitionId`；
- 内容学校 Scope 存 `organizationId`；
- 赛事 / 学校使用 stable relation selector。

这些断言已经针对上一轮真正漏掉的闭环重新设计，不再只检查成功提示或说明文案。

---

## 10. 后续交接

PC03 本卡可以从 `待复审` 收口为 `PASS`，进入 PC05 前置完成集合。

PC05 / R-Final 继续负责：

- 完整 TypeScript / Vite build；
- PC Playwright 全量回归；
- PC02 / PC03 / PC04 合入后的路由与 Shell 总一致性；
- 将重复 Shell 实现收敛为单一控制面组件；
- 最终 PC ↔ App 数据对象与状态一致性检查。

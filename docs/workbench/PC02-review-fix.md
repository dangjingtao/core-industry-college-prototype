# PC02｜CHANGES REQUIRED 修复回填

> 对应独立评审：`docs/workbench/PC02-review.md`  
> 评审提交：`a8184f2a8fd1493902fc09f6d892a68b23986aab`  
> 状态：**两项 P1 已施工，待二次独立复审**  
> 注意：施工线程不自行改 PASS。

---

## Finding 01｜赛事详情自建 AdminShell

### 修复

删除 PC02 自建后台壳职责，`CompetitionConsole` 现在只渲染赛事域内容。

赛事路由改为与 PC03 / PC04 一致：

```tsx
<Route
  path="/admin/competitions/objects/:competitionId"
  element={<AdminRoute><CompetitionConsole /></AdminRoute>}
/>
```

因此详情页统一继承 canonical `AdminControlPlaneShell`：

- 7 个 canonical 管理域导航；
- Role；
- Module Permission；
- Data Scope；
- canonical 创赛工坊导航文案；
- 报名 Portal 公共出口。

### 相关提交

- `235552f8960b23225a6989d2aa43b6564651e5d8`：移除 PC02 自建 Shell 职责并接 Organization 解析；
- `724c5e8ab5ef696842982fca256542f8b3a1001e`：赛事详情路由接入 `AdminRoute / AdminControlPlaneShell`。

---

## Finding 02｜学校 / 赛事组织方使用中文展示名作为关系键

### 修复后的字段

PC02 赛事控制扩展现在使用：

```text
organizerOrganizationId
schoolScope.authorizedSchoolOrganizationIds[]
team.leaderSchoolId
team.members[].schoolOrganizationId
windows.local[].scopeOrganizationId
```

中文名称只在 UI 中通过 PC03 canonical Organization 主数据解析，不再作为赛事关系键。

### 补入 canonical Organization 主数据

PC03 `pc03Organizations` 新增：

```text
org-sanchuang-committee      → 三创赛组委会（已存在，继续复用）
org-youth-brand-alliance     → 青年品牌创新联盟
org-huanan-commerce-college  → 华南商贸学院
org-lingnan-tech-college     → 岭南科技学院
```

其中三创赛继续引用已确认的：

```text
organizerOrganizationId=org-sanchuang-committee
leaderSchoolId=org-huanan-commerce-college
陈语.schoolOrganizationId=org-lingnan-tech-college
```

因此跨校成员属于另一 Organization，但整个 Team 的审核责任仍只跟随 `leaderSchoolId`，不会产生第二审批责任。

普通合作赛事同样使用：

```text
organizerOrganizationId=org-youth-brand-alliance
leaderSchoolId=org-lingnan-tech-college
```

### 相关提交

- `d6156c74f81e1fa16a82ac792500428788d4439c`：补齐学校 / 普通赛事组织方 canonical Organization；
- `963633a68f7da74822e990ae909dd82b8d86e7bf`：PC02 赛事关系改用 stable Organization ID；
- `235552f8960b23225a6989d2aa43b6564651e5d8`：UI 由 stable id 解析中文名称并展示 ID。

---

## Focused browser assertions

`apps/pc/tests/admin-skeleton.spec.ts` 新增两组锁定：

### canonical shell

三创赛与普通合作赛事详情均检查：

- 7 域管理导航仍存在；
- `Role / Module / Data Scope` Operator Context 可见；
- 不再由 PC02 自己维护后台导航。

### Organization stable id

至少检查：

- 三创赛 organizer → `org-sanchuang-committee`；
- leader school → `org-huanan-commerce-college`；
- 跨校成员陈语 → `org-lingnan-tech-college`；
- 陈语所在学校不同，但审核责任仍回到 `org-huanan-commerce-college`；
- 普通合作赛事 organizer → `org-youth-brand-alliance`；
- 普通赛事 leader school → `org-lingnan-tech-college`。

测试提交：

- `cc20035a058fac77f91ab19db9725c103bf0e031`

---

## 验证边界

本轮尝试从最新 `dev` 建立干净本地工作区执行真实 build / browser regression，但当前执行容器无法解析 `github.com`，clone 在网络层失败，未进入项目构建阶段。

GitHub connector 的 `fetch_commit_workflow_runs` 仅返回 PR 触发 run；本轮为直接 push `dev`，当前没有返回可用 workflow run。因此施工线程**不声明 type-check / build / browser / CI PASS**。

代码层已重新读取最新 `dev` 确认：

- Competition route 已由 canonical Shell 包裹；
- PC03 / PC04 路由仍保留；
- PC02 字段已切换 stable Organization ID；
- PC03 canonical Organization 已包含本卡引用的组织方与学校；
- 原 PC02 双层资格、Workspace 双门禁、CompetitionProject、teacher Scope、Workshop 隐私和报名 Portal 边界未被本轮改写。

最终状态继续为：

```text
PC02 = CHANGES REQUIRED（修复已提交，等待二次独立复审）
```

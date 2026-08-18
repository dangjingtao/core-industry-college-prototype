# PC05｜学生 / 长期资产 + 权限治理 + PC 总回归｜独立评审

> 评审状态：**CHANGES REQUIRED**  
> 日期：2026-08-18  
> 评审基线：`dev` HEAD `f743a254fea09893a39a5f5c4b44595951f68f78`  
> 门禁：`docs/workbench/PC05-visual-usability-gate.md`  
> 范围：整个 `/admin/*`，包括 PC01–PC05；重点不是视觉装饰，而是第一次使用后台的普通运营人员是否能直接理解当前业务、状态与下一步操作。

---

## 1. 结论

本轮全 PC 人类化施工是有效的，已经明显改善：

- `/admin` 从架构说明板改成“今天先处理这些业务”；
- canonical `AdminControlPlaneShell` 已把权限信息收进“当前权限”，并提供技术信息开关；
- PC01 赛事 / 资源 / 创赛工坊顶层入口已改成业务入口；
- PC03 Organization / Opportunity / Content 已基本形成业务优先的信息层级，新建机会 / 内容不再要求运营填写 stable id；
- PC05 学生、长期资产、审批、Audit 的默认页面已基本是人类可理解的业务语言，高风险操作与普通编辑也有明确视觉区分。

但 **Gate B（视觉层级 / 操作可理解性 / 普通运营可用性）仍未通过**。当前还有 1 个 P0 + 2 个 P1 阻断项，且现有 Playwright human-gate assertions 没有覆盖这些真实问题。

```text
PC05 = CHANGES REQUIRED
```

---

## 2. Finding 01｜`/admin/*` 仍存在旧 AdminConsole 逃生口｜P0

### 现状

`apps/pc/src/App.tsx` 虽然已经把主业务路由包进 `AdminControlPlaneShell`，但最后仍保留：

```tsx
<Route path="/admin/*" element={<AdminConsole />} />
```

这个 fallback 没有进入新的 canonical shell，而 `AdminConsole.tsx` 仍自带旧 `Shell`，并常驻：

- Role / Module / Data Scope；
- “平台控制面 · 人、主体、资源、规则、关系、可信状态”；
- Truth boundary；
- Stable ID；
- APP → PC 数据接入地图；
- “统一对象列表 Pattern”；
- “PC01 Pattern only / 统一编辑 Pattern”。

这意味着“整个 `/admin/*` 已经收成运营后台”并不成立。

### 可复现旧路径

PC01 旧资源样例仍有：

```text
/admin/resources/objects/opportunity-intern-1
```

该对象仍存在于 `adminDomains.resources.sampleObjects`，而 `App.tsx` 只对少量 course / benefit / certificate 旧路径做了显式 redirect。上述 opportunity 旧路径会直接掉进旧 `AdminConsole`，重新出现模型展览馆式页面和第二套 Shell。

### 影响

这是 Gate C / Gate G 的结构性失败，不是文案小问题：

> 同一个后台只要存在一条正常可访问的 `/admin/*` 路径能重新掉回旧施工控制面，就不能称为“全 PC 收口”。

### 修复要求

1. runtime 路由层不再让任何 `/admin/*` 进入旧 `AdminConsole` Shell；
2. 已有 legacy object routes 要么：
   - redirect 到当前业务页；
   - 要么进入 canonical shell 下的人类化 not-found / compatibility 页面；
3. `AdminConsole` 若仍需保留作为技术参考，只能作为明确技术入口，不得承担普通 `/admin/*` fallback；
4. focused browser assertion 至少覆盖：
   - `/admin/resources/objects/opportunity-intern-1` 不出现旧 Shell；
   - 不出现“统一对象列表 Pattern / PC01 Pattern only / Truth boundary”；
   - 能到达当前 `/admin/opportunities/intern-1` 或明确的人类化兼容页面。

---

## 3. Finding 02｜PC02 默认视图仍泄露模型名与 raw enum｜P1

### 已经做对的部分

- PC02 三层事实说明板默认被隐藏；
- stable id / code / font-mono 信息会随技术模式隐藏；
- 资格、学校审核、官方资格、Workspace gate 的业务动作仍保留。

### 仍然可见的工程语言

默认视图仍直接暴露：

- 赛事标题旁 raw `registrationOpen`；
- 资格状态 raw `pending / approved / confirmed / rejected / notRequired`；
- `CompetitionIdentity 映射`；
- “当前授权学校 Organization”；
- `Workspace`；
- 页面下方仍有“App 消费位置 / 稳定业务关系”外壳；
- 现有 regression 甚至要求普通合作赛事页面直接显示 `notRequired` 与 `SchoolScope` 文案。

技术开关目前主要靠：

```css
.font-mono
code
[data-pc05-technical]
[aria-label="PC02 三层事实边界"]
```

隐藏，因此没有被这些 selector 标记的模型词仍会漏出来。

### 修复要求

默认运营模式统一使用业务文案，例如：

```text
registrationOpen → 报名中
pending          → 待确认 / 待审核（按具体字段）
approved         → 学校审核已通过
confirmed        → 官方资格已确认
notRequired      → 本赛事无需外部资格确认
CompetitionIdentity → 学生赛事身份
Organization     → 合作主体 / 学校
Workspace        → 赛事工作区
```

`App consumer / stable relation / SchoolScope / raw enum` 进入“数据与关系 / 技术信息”层；运营默认页可以保留业务关系链接，但链接文案必须是“北辰美妆 / 品牌电商实战课 / 校赛路演训练营”等人类名称，不以模型类型 + ID 为主要表达。

---

## 4. Finding 03｜PC04 默认视图仍是半个工程控制台｜P1

PC04 的功能契约此前已经 PASS，本轮问题只针对 PC05 human gate。

### 默认仍可见

课程 / 权益 / 证书页面仍有大量工程表达没有进入技术层：

- `Course` / `Benefit` 标签；
- `Runtime · ...`；
- `App status`；
- `Course Completed`；
- `progress / assessment = passed`；
- `issuance / claim`；
- `issuanceStatus / claimStatus`；
- `issued / claimable / notTriggered`；
- “当前 App 学习快照”；
- “稳定关系”中的 `Competition · <id>` / `Organization · <id>` / `Benefit · <id>` / `Certificate · <id>`。

其中不少内容既没有 `data-pc05-technical`，也不是 `.font-mono / code`，因此技术模式关闭时仍然可见。

### 修复要求

功能状态不改，只改默认表达层：

- `Course Completed` → “课程完成条件 / 已完成”；
- `progress / assessment` → “学习进度 / 考试结果”；
- `Runtime` → 默认不出现；若业务确实需要展示个人状态，写“当前学生学习状态 / 当前领取状态”；
- `issuanceStatus` → “签发状态”；raw enum 映射为“未触发 / 处理中 / 已签发 / 签发失败 / 已撤销”；
- `claimStatus` → “学生领取状态”；raw enum 映射为“待领取 / 已领取 / 处理中 / 已撤销”；
- stable relation 默认只显示业务名称，如“第十六届三创赛 / 北辰美妆 / 北辰美妆校园体验权益”，ID 只在技术层出现；
- `Course / Benefit` 类型标签改成“课程 / 权益”，或直接移除无信息增益的英文 Tag。

PC04 可以继续保留所有真实 Runtime / stable relation / raw enum，但必须真正进入技术模式或折叠追溯层。

---

## 5. Finding 04｜现有 human-gate regression 没锁住真正的人类门禁｜P1

当前测试已经验证了部分正确方向：

- 首页不再出现 Truth boundary / Stable ID 大板；
- 代表性页面的某些 stable id 默认不可见；
- 技术模式可以恢复部分技术信息；
- PC03 新建与编辑功能仍然可用；
- PC05 冻结审批 / Audit / 长期资产仍然闭环。

但测试存在明显盲区：

1. 没有访问任何会落回旧 `AdminConsole` 的 `/admin/*` fallback 路径；
2. PC02 测试仍直接断言 `pending / approved / confirmed / notRequired`；
3. PC02 测试仍要求 `SchoolScope` 文案可见；
4. PC04 测试仍直接以 `issued / claimable / notTriggered` 等 raw enum 作为默认页面断言；
5. human gate 只检查“某一串技术文字没出现”，没有检查“默认首屏是否还有未标记的工程模型名”。

### 修复要求

补一组真正的默认运营模式 assertions：

```text
/admin/competitions/objects/sanchuang-16
- 看得到：报名中 / 学校审核 / 官方资格 / 赛事工作区
- 看不到：registrationOpen / CompetitionIdentity / SchoolScope / notRequired

/admin/pc04/courses/brand-ecommerce
- 看得到：课程完成条件 / 学习进度 / 考试结果
- 看不到：Course / Runtime / Course Completed / assessment

/admin/pc04/certificates/...
- 看得到：签发状态 / 学生领取状态 / 已签发 / 待领取
- 看不到：issuance / claim / issuanceStatus / claimStatus

/admin/resources/objects/opportunity-intern-1
- 不得进入旧 AdminConsole
```

技术模式打开后，再单独断言 raw enum / stable id / App consumer 可以恢复。

---

## 6. 已通过的人类门禁部分

以下不要求返工：

- `/admin` 运营总览方向；
- 全局“当前权限”折叠；
- PC01 顶层赛事 / 资源 / 创赛工坊业务入口；
- PC03 Organization 的“主体 → 可信边界 → 合作资源 → 数据与关系”；
- PC03 Opportunity 新建 / 编辑 / skills / 发送人群 / Application 分层；
- PC03 Content 人类化 scope selector 与内部 ID 自动生成；
- PC05 学生首页、长期资产、冻结 / 解冻审批；
- PC05 Audit Log 与高风险审批的视觉等级；
- PC05 跨端一致性检查收进折叠区，而不是抢普通运营首屏。

不要推翻这些已完成方向。

---

## 7. Browser / CI 边界

本次 connector 对 `f743a254fea09893a39a5f5c4b44595951f68f78` 的 combined status 与 commit workflow runs 均没有返回可用结果，因此本轮没有伪造 CI / Playwright PASS。

独立评审尝试访问 `dev.core-industry-college-pc.pages.dev` 做线上页面复核，但当前执行环境无法直接取得该动态站点页面。因此本轮判断基于：

- 当前 `dev` 实际路由与组件实现；
- 当前 Playwright regression 内容；
- PC05 human-gate 文档的硬门槛。

由于已经存在明确 P0/P1 静态可证的 human-gate 失败，本轮无需依赖浏览器运行结果即可判定 `CHANGES REQUIRED`。修复后最终复审仍应实际执行 PC browser regression / R-Final。

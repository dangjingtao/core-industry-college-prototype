# PC05｜独立评审返工记录

> 状态：**返工完成 / 待二次独立评审**  
> 对应评审：`docs/workbench/PC05-review.md`  
> 评审提交：`682c01145ce65064bfaa85dc9178e8ddb74bf3e9`  
> 返工 HEAD：`f02ad9e364a94316b137c05bc11e3a43b3deb411`  
> 判定权：本记录不把 PC05 改为 PASS，最终状态仍由二次独立评审决定。

---

## 1. P0｜旧 AdminConsole 普通 `/admin/*` fallback 已关闭

评审指出：

```text
/admin/* → AdminConsole
```

会让正常旧路径重新进入 Truth boundary / Stable ID / PC01 Pattern only 等施工后台。

本轮已处理：

- `App.tsx` 不再 import / route `AdminConsole`；
- `/admin/resources/objects/opportunity-intern-1` 显式兼容到 `/admin/opportunities/intern-1`；
- legacy course / benefit object route 统一映射到当前 PC04 业务页；
- legacy Organization object route 继续映射到当前主体页；
- 未识别的 `/admin/*` 进入 canonical `AdminControlPlaneShell` 下的人类化兼容页，不再出现第二套 Shell；
- 旧 `AdminConsole.tsx` 文件即使保留，也不再承担普通 `/admin/*` runtime fallback。

对应 focused assertion 已加入：

- 旧 opportunity route 必须 redirect；
- 不得出现 `统一对象列表 Pattern`；
- 不得出现 `PC01 Pattern only`；
- 不得出现 `Truth boundary`；
- 未知旧地址仍必须保留统一管理端主导航。

---

## 2. P1｜PC02 默认视图已完成业务文案映射

新增 `PC02HumanCompetitionConsole`，继续读取原 `competitionControlById`，不改变底层赛事 / 审核 / 官方资格数据模型。

默认运营视图改为：

```text
registrationOpen → 报名中
upcoming → 即将开始
inProgress → 进行中
ended → 已结束

pending（学校审核） → 待学校审核
approved → 学校审核已通过
rejected → 学校审核未通过

pending（官方资格） → 官方资格待确认
confirmed → 官方资格已确认
rejected → 官方资格未通过
notRequired → 本赛事无需外部资格确认
```

同时：

- `Workspace` 默认表达为“赛事工作区”；
- `CompetitionIdentity` 默认表达为“学生赛事身份”；
- `Organization` 默认表达为“合作主体 / 学校”；
- `SchoolScope` 默认不出现；
- 团队 / CompetitionProject 默认表达为“团队 / 参赛项目”；
- Workshop 默认表达为“创赛工坊”；
- stable id、raw enum、SchoolScope、CompetitionIdentity、App consumer 等保留在技术模式。

底层判断仍保持原语义：平台学校审核与外部官方资格互不偷换，赛事工作区只有在生命周期与资格条件同时满足时开放。

---

## 3. P1｜PC04 默认视图已完成业务文案映射

新增人类化 PC04 呈现层，继续复用原 `PC04State` / `pc04-data`，不重写课程完成、权益履约、证书签发与领取事实。

### 课程

默认展示：

- 学习状态；
- 学习进度；
- 考试结果；
- 课程完成条件；
- 完成情况。

raw `Course Completed / progress / assessment / CourseLearning.status` 只在技术模式显示。

课程关联默认使用业务名称：

- 第十六届三创赛；
- 北辰美妆；
- 对应权益名称；
- 对应证书名称。

`Competition · id / Organization · id / Benefit · id / Certificate · id` 只在技术模式显示。

### 权益

默认展示：

- 履约方式；
- 资格规则；
- 当前学生权益状态；
- 可领取 / 暂不可领取 / 已领取 / 已使用 / 已过期。

`Benefit / Runtime / raw fact / referenceId` 只在技术模式显示。

### 证书

证书页独立收口为：

- 签发状态；
- 学生领取状态；
- 签发主体；
- 签发规则；
- 编号 / 文件 / 验真；
- 申请 / 回流记录。

状态映射：

```text
notTriggered → 未触发
requested → 已申请
processing → 签发中
issued → 已签发
failed → 签发失败
revoked → 已撤销

claimable → 待领取
claimed → 已领取
pending → 处理中
revoked → 已撤销
```

raw `issuanceStatus / claimStatus / triggerMode / triggerRule / channel` 只在技术模式显示。

---

## 4. P1｜human-gate Playwright 已改成默认态 / 技术态双断言

### `admin-skeleton.spec.ts`

新增 / 调整：

- 访问 legacy fallback 路径并验证不能进入旧 AdminConsole；
- PC02 默认必须看到“报名中 / 待学校审核 / 官方资格待确认 / 赛事工作区”；
- 默认不得看到 `registrationOpen / CompetitionIdentity / SchoolScope / notRequired`；
- 打开技术模式后上述 raw 模型词与 raw status 可恢复；
- 普通合作赛事默认显示“本赛事无需外部资格确认”，不再直接断言 `notRequired`。

### `pc04.spec.ts`

新增 / 调整：

- 默认课程页断言“课程完成条件 / 学习进度 / 考试结果”；
- 默认不得出现 `Runtime / Course Completed / assessment= / Competition · / Organization ·`；
- 技术模式恢复这些 raw 信息；
- 证书默认断言“已签发 / 待领取 / 未触发 / 尚未生成领取记录”；
- 默认不得出现 `issuanceStatus / claimStatus / notTriggered`；
- 技术模式再断言 `issuanceStatus=issued / claimStatus=claimable / issuanceStatus=notTriggered`；
- 课程跨资源跳转改为按业务名称点击，不再依赖 `Benefit · id / Certificate · id`。

### `pc05.spec.ts`

全站 human gate 直接纳入：

- legacy fallback；
- PC02 raw model terms；
- PC04 Course Completed / assessment；
- PC04 issuanceStatus / claimStatus；
- 技术模式恢复 raw 信息。

因此 PC05 总门禁不再只是证明“某几串 ID 被 CSS 隐藏”。

---

## 5. 返工提交范围

从评审提交 `682c01145ce65064bfaa85dc9178e8ddb74bf3e9` 到返工 HEAD `f02ad9e364a94316b137c05bc11e3a43b3deb411`：

- `apps/pc/src/App.tsx`
- `apps/pc/src/admin/PC02HumanCompetitionConsole.tsx`
- `apps/pc/src/admin/PC04HumanConsole.tsx`
- `apps/pc/src/admin/PC04HumanCertificates.tsx`
- `apps/pc/tests/admin-skeleton.spec.ts`
- `apps/pc/tests/pc04.spec.ts`
- `apps/pc/tests/pc05.spec.ts`

未返工：

- PC03 已通过的人类化方向；
- `/admin` 首页；
- PC05 学生；
- PC05 长期资产；
- PC05 审批 / Audit 主体逻辑。

---

## 6. 验证边界

本施工线程没有把静态修复冒充 browser / CI PASS。

当前已确认：

- P0 fallback 在路由代码层已关闭；
- PC02 / PC04 default-vs-technical 双层断言已写入 Playwright；
- `dev` 当前 HEAD 为返工提交链；
- GitHub combined status 对当前 HEAD 返回空状态；
- commit workflow-run 查询没有返回可用 run；
- 当前执行环境无法解析 GitHub host，因此不能在本线程 clone 后执行真实 `npm` / Playwright。

二次独立评审仍应真实执行：

```text
npm run typecheck
npm run build:pc
npm run verify:browser:pc
```

并按 `PC05-visual-usability-gate.md` 从普通运营视角再次走完整 `/admin/*` 门禁。

---

## 7. 当前结论

本轮只声明：

> **PC05 review findings 已完成针对性返工，等待二次独立评审。**

不声明：

- PC05 PASS；
- Playwright PASS；
- CI PASS；
- R-Final PASS。

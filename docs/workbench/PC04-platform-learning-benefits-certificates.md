# PC04｜平台课程 + 权益 + 可信证书

> 状态：施工完成 / 待独立评审  
> 开工基线：`f9cf199b4d1c5fddd39388f66fa542c2c4cd7baf`  
> 施工分支：`pc04-platform-learning-benefits-certificates`  
> 前置：PC01 控制面底座已完成并进入独立评审。

---

## 1. 本卡边界

PC04 只把以下三类“平台配置真相”接进 PC：

1. 课程内容、章节、视频、小测试与完成条件；
2. 权益资格与固定三类履约配置；
3. 可信证书签发规则、真实签发主体、回流与验真信息。

以下个人运行事实继续沿用 App / Runtime 现有语义，不在 PC04 复制第二份状态：

```text
CourseLearning
- notStarted / inProgress / completed
- assessment idle / passed / failed

Benefit personal state
- eligible / ineligible / claimed / used / expired

Certificate
- claimable / claimed / pending / revoked
```

因此 PC04 页面允许修改“怎么配置”，但不会通过后台表单直接把某个学生的课程改成 completed、把权益改成 claimed，或把 revoked 证书改回有效。

---

## 2. 对齐的 App 消费链

完整按工作台账检查并映射：

```text
/courses
→ /courses/:courseId
→ /courses/:courseId/learn
→ /courses/:courseId/assessment
→ /courses/:courseId/achievement

/benefits
→ /benefits/:benefitId
→ /benefits/wallet

/assets/certificates
→ /assets/certificates/:certificateId
→ /assets/verification
```

PC04 示例继续复用 Mobile 已有 stable id：

- Course：`data-analytics`、`brand-ecommerce`、`retail-project-lab`；
- Benefit：`benefit-campus-video`、`benefit-beauty-sample`、`benefit-sanchuang-course`；
- Certificate：`cert-course-data-analytics`、`cert-sanchuang-15`。

没有新建一套与 App 不相认的 courseId / benefitId / certificateId。

---

## 3. 课程控制面

新增 `/admin/pc04/courses/*`。

首期固定课程完成模型：

```text
视频学习进度达到课程配置要求
+ 小测试达到及格线
→ Course Completed
```

当前原型提供：

- 平台托管章节；
- 视频与小测试类型；
- 视频完成百分比配置；
- 小测试及格线配置；
- Competition / Organization / Benefit / Certificate stable relation；
- CourseLearning Runtime 只读快照；
- `account × courseId` 的个人完成边界；
- 明确“必修”默认不阻断官方赛事报名或 Workspace。

从 PC01 现有 `品牌电商实战课` 对象进入时，会路由到 PC04 课程详情，不再停留在 PC01 的“编辑 Pattern”占位。

没有建设外部 URL 课程主形态，也没有建设万能学习规则引擎。

---

## 4. 权益控制面

新增 `/admin/pc04/benefits/*`。

首期固定且只展示三类履约：

1. 兑换码 / 卡码；
2. 外部领取链接；
3. 线下核销 / 人工履约。

资格规则只引用明确事实，例如：

- `profileComplete`；
- `CompetitionIdentity active + competitionId`；
- 数据模型预留 `Course Completed + courseId`。

个人 `eligible / claimed / used / expired` 继续作为 Runtime 只读事实展示。

从 PC01 现有 `北辰美妆校园体验权益` 对象进入时，会路由到 PC04 权益详情。

没有建设团队权益、黑盒资格评分或万能权益规则引擎。

---

## 5. 可信证书控制面

新增 `/admin/pc04/certificates/*`。

证书详情至少明确：

- 证书类型；
- 实际签发主体；
- 签发规则；
- 签发状态；
- 编号；
- 文件 / 凭证；
- 验真信息；
- 申请 / 回流记录。

两个 focused 场景：

### 课程证书

`cert-course-data-analytics`：

```text
个人 CourseLearning = completed
+ assessment = passed
→ 系统自动进入签发流程
```

不要求运营逐张点击发证。当前 App 原型中的实际 issuer 仍按已有数据展示为“核心产业学院”；未来接入外部权威签发渠道时，PC 必须记录真实 issuer 与回流结果，不允许用平台记录冒充外部权威。

### 赛事成果证书

`cert-sanchuang-15`：

- 实际签发主体：三创赛组委会；
- 当前 App 状态：`claimed`；
- 验真码：`SC15-TOMZ-24001`；
- App 当前没有独立“签发编号”和文件 URL，PC04 明确展示“未提供”，不虚构补齐；
- 撤销只进入 `revoked`，不物理删除长期可信历史。

从 PC01 现有证书对象进入时，会路由到 PC04 证书详情。

---

## 6. 路由兼容与并行施工

PC02 / PC03 / PC04 允许在 PC01 之后并行，但它们都会触及 PC 入口。

PC04 没有重写 `AdminConsole.tsx` / `data.ts`，而是新增独立 PC04 控制面，并只在 `App.tsx` 增加高优先级业务路由；这样可以降低与 PC02 / PC03 同时施工时整文件覆盖的风险。

现有 PC01 七域 IA 继续保留：

- Course / Benefit 仍属于 `资源运营`；
- Certificate 仍属于 `资产与可信凭证`；
- `/admin/pc04/*` 是 PC04 施工与业务详情视图，不新增第八个全局管理域。

---

## 7. 修改范围

- `apps/pc/src/admin/pc04-data.ts`
- `apps/pc/src/admin/PC04Console.tsx`
- `apps/pc/src/App.tsx`
- `apps/pc/tests/pc04.spec.ts`
- `docs/workbench/PC04-platform-learning-benefits-certificates.md`

没有修改 Mobile 产品逻辑，也没有改响应式报名门户业务实现。

---

## 8. 验证记录

### 静态验证

已使用 TypeScript 5.8、`strict + moduleResolution=Bundler + jsx=react-jsx` 对 PC04 新文件与路由结构做隔离检查，结果通过。

该检查用于发现 PC04 自身语法 / 类型结构问题，不冒充仓库安装真实依赖后的 Vite build。

### Focused browser assertions

新增 `apps/pc/tests/pc04.spec.ts`，覆盖：

1. 从 PC01 Course 对象进入 PC04，课程完成条件可配置，但 `CourseLearning` 只读；
2. 权益固定三类履约，资格规则引用明确事实，个人权益状态只读；
3. 证书真实 issuer、验真信息、申请 / 回流可追溯；课程证书自动触发，不要求逐张点击发证。

施工线程只提交 browser assertion，不把“测试已写”冒充 browser PASS。最终真实 build / browser / CI 结果由独立评审补齐。

---

## 9. 当前结论

PC04 功能施工已完成，进入 `待评审`。

独立评审重点检查：

- PC 与 App 是否继续共享同一 CourseLearning / Benefit / Certificate 状态语义；
- 课程“必修”是否错误改变官方赛事资格；
- 权益是否仍只支持首期三类履约与可解释资格；
- 证书是否如实记录实际签发主体，且没有伪造外部权威事实；
- PC02 / PC03 并行合入后路由是否仍无冲突。

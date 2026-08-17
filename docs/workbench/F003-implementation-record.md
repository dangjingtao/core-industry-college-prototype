# F003｜账号 / 简历 / 团队 / 外部 handoff｜施工记录

> 状态：施工完成，待 CI 与独立评审  
> 施工分支：`workbench/f003`  
> 任务真相源：`docs/workbench/00-work-ledger.md` 的 F03

## 1. 基线

- 最初创建施工分支时 `dev` HEAD：`18528090ca70670563f7627982b79e267de3a88e`。
- 正式写入前发现 F01 已合入 `dev`，因此在无 F003 修改的情况下把施工分支快进到：`0994f12faf0f11eb7b00220b777b0efaa015b7fc`。
- F003 的简历实现直接复用 F01 新增的统一 `StudentProfile`，没有再复制手机号、学校、专业、学历真相源。
- 施工过程中 F02 也已并入 `dev`；F02 已负责可信凭证的保存 / 下载 / 官方验证 handoff，F003 不重复实现。

## 2. 实际修改范围

### A. 退出登录

文件：`apps/mobile/src/features/long-term-assets/AssetsPages.tsx`

实现：

- `/me` 增加“退出登录”；
- 必须二次确认；
- 确认后只调用 Public Platform 已有 `continueAsGuest()` 清当前 session；
- 返回 `/home` 公共首页；
- 不清理 `LongTermAssetsProvider` 中的简历、课程、证书、赛事经历等长期资产。

### B. 长期简历结构化字段

文件：

- `apps/mobile/src/features/long-term-assets/store.tsx`
- `apps/mobile/src/features/long-term-assets/ResumePages.tsx`

实现：

- 手机号、学校、专业、学历直接读取 F01 的 `StudentProfile`；
- resume presentation 新增：
  - 毕业时间；
  - 入学 / 结束时间；
  - 主修课程；
  - 在校经历；
- 教育经历从单一自由文本升级为结构化编辑；
- 系统可信赛事 / 课程 / 证书事实仍保持只读，只允许选择是否进入简历；
- `returnTo` 继续贯穿 `/me/resume`、个人优势、教育经历，并可返回原机会继续投递；
- 未新增能力雷达、AI 就业评分、AI 推荐或 AI 润色。

### C. 赛事期团队维护

文件：`apps/mobile/src/features/competition-workspace/WorkspacePages.tsx`

实现：

- 报名期成员录入继续由响应式报名系统负责；
- 赛事 `inProgress` 时，团队页提供：
  - 减员申请；
  - 成员变更；
  - 选择涉及成员；
  - 填写原因；
  - 上传 PDF / DOC / DOCX / JPG / PNG 材料；
  - 提交后进入“待老师 / 运营审核”；
- 申请提交不会直接修改 `workspaceData.team.members`，避免把申请状态伪装成已审核系统事实；
- 赛事未开始时只说明何时可提交，不把报名期复杂表单搬回 App。

### D. 外部 handoff / 工具能力

文件：

- `apps/mobile/src/features/competition-workspace/WorkspacePages.tsx`
- `apps/mobile/src/features/platform-support/SupportPages.tsx`
- `apps/mobile/src/features/long-term-assets/CoursesPages.tsx`

实现：

1. 赛事资料
   - “保存到本地”真实生成浏览器下载文件；
   - “分享 / 发送微信”优先调用 Web Share API；
   - 不支持系统分享时退化为复制当前链接。
2. 公众号来源内容
   - 公众号内容详情补“阅读全文（公众号原文）”外部出口；
   - 当前没有真实文章 URL 数据，因此使用公众号域名验证外跳能力，并明确具体文章 URL 由运营内容配置，不伪造文章地址。
3. 人工客服
   - 明确最终人工渠道为旧业务中已有的“企业微信福利官”；
   - 联系人 / 二维码仍由运营配置；
   - 不伪造已加好友或已接通人工；
   - 提供企业微信外部入口。
4. 课程分享
   - 课程详情增加分享；
   - 优先 Web Share API，不支持时复制链接。
5. 证书 / 成绩
   - 已由 F02 承接，本卡没有重复实现。

## 3. 明确未动范围

F003 没有处理以下 F04 决策项：

- 第三方业务平台账号（抖音达人 / 快团团 / 三创好物）与当前联系方式绑定的关系；
- 学力值经济模型；
- D03 全局任务体系；
- D08 主体管理；
- 创域 / 本地运营 / 扫码；
- AI 简历 / 人才评分。

现有 `/me/accounts` 不作为 F003 的“已解决第三方账号”结论。

## 4. 回归用例

新增：`apps/mobile/tests/f003.spec.ts`

覆盖：

- logout 二次确认与返回公共首页；
- 结构化教育经历 + `returnTo`；
- 赛事期团队变更申请 + 材料上传 + 待审核且不直接改成员；
- 赛事资料真实浏览器下载；
- 公众号阅读全文外跳；
- 企业微信人工渠道；
- 课程系统分享。

## 5. 验证状态

- 当前 GitHub workflow 只在 `dev` / `prod` push 时运行，F003 施工分支本身不会自动获得 build 证据。
- 当前执行环境没有可联网的仓库 checkout，因此不能在本地伪造 `npm ci` / TypeScript / Chromium 结果。
- 合入 `dev` 后应以 `Deploy Mobile to Cloudflare Pages` 中的 `Type-check and build mobile preview` 为构建证据；如失败，必须按日志修复后再进入评审。
- 浏览器 F003 专项用例已写入仓库，但在获得真实 Playwright 执行证据前不标记 PASS。

## 6. 施工结论

F003 任务范围已按工作台账完成实现；施工线程只把卡片推进到“待评审”，不自行标记 `PASS`。

# F002｜企业可信信息 + 可信凭证完整能力｜施工记录

**状态：待复审**  
**施工日期：2026-08-17**  
**目标卡：`docs/workbench/00-work-ledger.md` → F002**

> 按工作台账规则，施工线程不自行标记 `PASS`。本记录表示初版实现已完成，并已按独立评审的 `CHANGES REQUIRED` 完成窄修与 focused browser regression，等待独立复审。

## 1. 实际修改范围

### A. 企业可信基础信息

修改：

- `apps/mobile/src/features/public-platform/data.ts`
- `apps/mobile/src/features/trust/TrustPages.tsx`
- `apps/mobile/src/app/App.tsx`

实现：

- `Company` 增加统一 `businessInfo` 可信基础信息对象；
- 企业详情保留“合作概览”为默认主心智；
- 新增“工商信息”Tab，并兼容旧映射语义：
  - `/companies/:companyId?tab=business`
- 补齐字段：
  - 法定代表人；
  - 注册资本；
  - 经营状态；
  - 成立日期；
  - 企业类型；
  - 所属行业；
  - 所属地区；
  - 统一社会信用代码；
  - 工商注册号；
  - 核准日期；
  - 登记机关；
  - 注册地址；
  - 经营范围。
- 工商数据明确标识为原型 Mock，不伪装为真实官方工商事实。

### B. 可信凭证 / 验真

新增统一 F002 页面实现：

- `apps/mobile/src/features/trust/TrustPages.tsx`

并在 `apps/mobile/src/app/App.tsx` 接管以下既有语义路由：

- `/assets/verification`
- `/assets/certificates/:certificateId`
- `/assets/results/:resultId`
- `/companies/:companyId`

实现：

1. 验真码：保留原有本地可信证书匹配；
2. 扫码验真：增加统一标准二维码入口，摄像头行为使用 Mock；
3. 文件验真：
   - 支持 PDF / OFD 语义；
   - 10MB 上限；
   - 展示文件名、类型、大小、待验证 / 验证通过 / 不可验证状态；
   - 不伪装真实 OFD / 签名解析，明确为中保真 Mock；
4. 官方平台 handoff：
   - 提供明确外部出口；
   - 原型打开 handoff 占位页；
   - 不编造第三方“官方验真网址”；
   - 生产协议明确为 `issuer.officialVerificationUrl + verificationCode / credentialId`；
5. 证书：
   - 保存动作；
   - 下载动作；
   - 快速进入统一验真；
   - 官方平台出口；
6. 成绩：
   - 下载成绩报告动作；
7. 下载文件当前使用中保真文本占位文件，真实服务接入后替换为正式 PDF / OFD / 图片，不改变页面交互；
8. 保留 `TrustNote`，继续明确系统可信事实不能由简历编辑器修改。

### C. 公共验真边界修正

`routeDefinitions` 原本已经把 `/assets/verification` 定义为 `public`，但实际 `App.tsx` 仍套了 `AccountRequired`。

F002 已修正实际路由：验真页不再要求登录，符合公开验真的产品语义；证书详情和成绩详情仍属于长期账号资产，需要登录。

## 2. 初版实现提交

F002 三个连续提交：

- `89620ff637033c02269b1a7ee8a7c2e543af1bd6` — `feat(F002): add trusted company business information`
- `081577f2437d4f40086222e06401db384e4fb115` — `feat(F002): add trusted company and credential verification pages`
- `2ff2631c8d6979c83041f9ac7bcdd72c03f82f46` — `feat(F002): wire trusted company and verification flows`

其后 F01 并行提交 `0994f12faf0f11eb7b00220b777b0efaa015b7fc` 以 F002 最后提交为 parent，未覆盖 F002 路由与实现。

## 3. 初版 Build / CI 证据

GitHub Actions：

- Workflow：`Deploy Mobile to Cloudflare Pages`
- Run ID：`32013871701`
- Head：`0994f12faf0f11eb7b00220b777b0efaa015b7fc`
- 结果：`success`

关键步骤：

- Install dependencies：success
- Type-check and build mobile preview：success
- Deploy mobile：success

由于该成功 run 的 head commit 直接以 F002 最后提交为祖先，因此构建包含本卡全部初版实现。

## 4. 初版独立评审

正式评审：`docs/workbench/F002-review.md`  
评审提交：`141f00965caa7d89ef6db88add64b58b0ef184b8`  
评审结论：**CHANGES REQUIRED（小修后复审）**。

评审接受企业工商信息部分，不允许返工；阻断点仅为可信凭证生命周期 gate：初版曾以 `status !== "revoked"` 判断验真有效，导致 `claimable / pending` 可能被提升为“验证通过”，同时非 `claimed` 证书与 `pending` 成绩开放了不应开放的可信动作。

## 5. CHANGES REQUIRED 窄修

修复提交：

- `6e79997c359860bf2a545b198f62391fb9b0b09f` — `fix(F002): gate trusted credential actions by lifecycle`
- `229a6048f99f4ffe3fac65882a7804e360a4432b` — `test(F002): regress credential trust status gates`
- `42a5960c34e5dafad4c3498296b1c7af33c363e2` — `ci(F002): run focused trust status browser regression`
- `1b0243500f576e28880f568d2435819216541d0f` — `test(F002): use stable verification selector`

本轮只处理评审指定范围，企业 overview / business 与工商数据没有返工。

### A. 证书可信状态 gate

当前规则收敛为：

- `claimed`：允许公开验真成功、保存、下载、进入统一验真和官方 handoff；
- `claimable`：只允许领取；验真明确显示“尚未签发”，领取前不展示可信动作；
- `pending`：显示“待发放 / 处理中”，不允许保存、下载或可信验真；
- `revoked`：明确“已撤销 / 已失效”，可信动作关闭。

因此 seed `cert-course-data-analytics` / `COURSE-DA-26001` 在 `claimable` 时不再能够验证通过；调用现有 `claimCertificate` 进入 `claimed` 后才开放可信动作。

### B. 成绩报告 gate

`pending` 赛事结果不再无条件下载正式成绩报告：

- 页面显示 disabled `成绩报告处理中`；
- 明确提示“不能下载为正式可信成绩报告”；
- 阶段成果继续引导回赛事工坊查看。

非 `pending` 既有结果下载行为保持不变，本轮不扩业务模型。

## 6. 修复后验证证据

### Mobile type-check / build / deploy

- Workflow：`Deploy Mobile to Cloudflare Pages`
- Run ID：`32016438710`
- Head：`229a6048f99f4ffe3fac65882a7804e360a4432b`
- `Type-check and build mobile preview`：success
- `Deploy mobile`：success
- Job conclusion：success

该 head 已包含 `6e79997...` 的状态门控修复。

### Focused browser regression

新增：

- `apps/mobile/tests/f002-trust-status.spec.ts`
- `.github/workflows/f002-trust-regression.yml`

只执行一条 F002 Playwright，用例覆盖：

```text
/assets/verification
→ COURSE-DA-26001
→ claimable：显示“尚未签发”，不得“验证通过”，官方 handoff disabled

/assets/certificates/cert-course-data-analytics
→ claimable：仅领取，无保存 / 下载 / 验真 / 官方 handoff
→ 领取
→ claimed：可信动作开放
→ 进入验真
→ 验证通过

/assets/results/competition-result-sanchuang-16
→ pending：正式成绩报告下载关闭
```

最终成功证据：

- Workflow：`F002 Trust Status Regression`
- Run ID：`32016602993`
- Head：`1b0243500f576e28880f568d2435819216541d0f`
- Build mobile preview：success
- Run focused F002 browser regression：success
- Job conclusion：success

首个 browser run `32016483021` 曾因测试使用 `getByLabel("证书验真码")` 而 timeout；现有 UI 的 `<label>` 未与 input 建立关联。这属于测试 selector 问题，不是可信状态门控失败。本轮不扩范围改造表单可访问性，仅把用例改为现有稳定 placeholder selector 后复跑通过。

## 7. 复审动线

```text
/assets/verification
→ SC15-TOMZ-24001
→ claimed：验证通过

/assets/verification
→ COURSE-DA-26001
→ claimable：显示“尚未签发”，不得验证通过

/assets/certificates/cert-course-data-analytics
→ claimable：只有领取
→ 领取
→ claimed：保存 / 下载 / 验真 / 官方 handoff 开放

/assets/results/competition-result-sanchuang-16
→ pending：不能下载正式可信成绩报告

/companies/northstar-beauty?tab=business
→ 企业工商部分保持原评审已接受实现
```

## 8. 当前结论

**F002 修复完成，状态：待复审。**

施工线程不自行标记 `PASS`；请按 `docs/workbench/F002-review.md` 的 blocking finding 与本记录第 7 节动线进行独立复审。

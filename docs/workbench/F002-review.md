# F002｜企业可信信息 + 可信凭证完整能力｜独立评审

**评审结论：CHANGES REQUIRED（小修后复审）**  
**评审日期：2026-08-17**  
**任务卡：`docs/workbench/00-work-ledger.md` → F02 / F002**  
**施工实现：`89620ff` → `081577f` → `2ff2631`**

## 1. 总体判断

F002 的主体方向成立，主要功能也已经真实落到当前 `dev`：

- 企业详情保留“合作概览”为默认主心智，并新增 `?tab=business` 工商可信基础信息；
- 工商字段覆盖任务卡要求，且明确标注原型 Mock，不冒充官方工商数据；
- `/assets/verification` 已提供验真码 / 扫码 / PDF-OFD 文件三种入口；
- 文件类型、10MB 上限、待验证/不可验证/验证通过状态均有表达；
- 证书保存、下载、官方平台 handoff 与成绩报告下载均有中保真交互；
- `/assets/verification` 已按 route registry 的 `public` 语义解除 `AccountRequired`；
- 证书 / 成绩详情仍属于长期账号资产；
- CI run `32013871701` 的 mobile type-check、Vite build 与 deploy 为 success。

因此本轮不是架构返工，也不要求重做 F002。阻断点集中在一个根问题：**可信凭证动作没有按凭证生命周期做严格 gate。**

---

## 2. Blocking Finding｜未签发凭证可以被“验证通过”并下载

### 现状

`CertificateRecord.status` 明确区分：

```text
claimable | claimed | pending | revoked
```

当前 seed 中：

- `cert-sanchuang-15` = `claimed`；
- `cert-course-data-analytics` = `claimable`，但已经预置 `verificationCode = COURSE-DA-26001`。

而 `VerificationTrustedPage` 的验真码匹配条件目前是：

```ts
item.verificationCode === code && item.status !== "revoked"
```

这意味着：

- `claimable` 会验证通过；
- `pending` 也会验证通过；
- 只有 `revoked` 被拒绝。

因此直接在公开 `/assets/verification` 输入 `COURSE-DA-26001`，会把一张“可领取、尚未领取/签发”的证书显示为“验证通过”。

这与可信凭证语义冲突：**有资格领取 ≠ 已签发可信凭证。**

### 同一根问题的其它表现

`CertificateDetailTrustedPage` 当前不区分状态，都会展示：

- 保存证书；
- 下载证书；
- 进入三种方式验真；
- 前往官方验真平台。

因此 `claimable / pending / revoked` 状态也可能得到本不应开放的可信凭证动作。

`ResultDetailTrustedPage` 也对 `pending` 结果无条件提供“下载成绩报告”。当前 seed 中 `competition-result-sanchuang-16` 就是 `pending`。如果这里表达的是正式可信成绩报告，则同样应按可信状态 gate；若业务想允许下载阶段结果，需要换成不冒充正式成绩报告的语义。

### 为什么阻断

F002 的目标不是普通文件工具，而是“可信信息 + 可信凭证”。如果生命周期 gate 错了，会把未签发/处理中事实错误提升为可验证可信事实，属于产品语义错误，不是视觉小瑕疵。

---

## 3. Required Fix

只做窄修，不扩范围。

### A. 证书验真状态

至少满足：

- `claimed` / 明确已签发状态：允许验真成功；
- `claimable`：不能显示“验证通过”，应提示尚未领取/签发；
- `pending`：不能显示“验证通过”，应提示待发放/处理中；
- `revoked`：明确无效/已撤销。

不要继续用 `status !== "revoked"` 作为可信凭证有效条件。

### B. 证书动作 gate

建议语义：

- `claimable`：只突出“领取证书”；领取完成后再开放保存/下载/验真/官方 handoff；
- `claimed`：开放保存、下载、三种验真、官方 handoff；
- `pending`：只显示等待发放状态；
- `revoked`：关闭保存/下载/官方验真，并明确撤销状态。

如果产品另有“未领取也已签发”的真实业务模型，需要先调整状态命名；当前状态名下不能这样解释。

### C. 成绩报告

至少保证 `pending` 不以“正式可信成绩报告”形式无条件下载。

可选：

- `trusted` 才开放“下载成绩报告”；
- `pending` 禁用并说明处理中；
- 若阶段成果确实允许下载，则按钮和文件内容明确写“阶段结果/非正式成绩报告”。

---

## 4. Re-review 最低验证

复审至少走：

```text
/assets/verification
→ 输入 SC15-TOMZ-24001
→ claimed：验证通过

/assets/verification
→ 输入 COURSE-DA-26001
→ claimable：不得验证通过

/assets/certificates/cert-course-data-analytics
→ claimable：不能直接保存/下载/官方验真
→ 领取
→ claimed：保存/下载/验真开放

/assets/results/competition-result-sanchuang-16
→ pending：不能下载“正式可信成绩报告”

/companies/northstar-beauty?tab=business
→ 工商字段仍完整
→ 合作概览仍为默认主心智
```

建议补一条 focused Playwright / browser regression 覆盖 `claimable → claimed → verification`，避免以后再次把状态 gate 放宽。

---

## 5. 已接受项，不要在修复线程返工

以下已通过本轮代码审查，不应借修复机会重做：

- 企业详情的 overview / business 双层结构；
- `?tab=business` 旧映射兼容；
- 工商 Mock 与官方真实数据的边界说明；
- `/assets/verification` 公开访问；
- PDF / OFD + 10MB 文件入口；
- QR 使用 Mock；
- 官方 URL 不伪造、使用 handoff 占位；
- 下载使用中保真占位文件；
- `TrustNote` 与“简历不可修改系统事实”的边界。

## 6. 当前状态

**F002 = CHANGES REQUIRED。**

修复范围应很小：围绕 certificate/result status gate + 对应回归测试即可。修复线程提交后停在“待复审”，不要自行标记 PASS。

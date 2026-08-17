# F002｜企业可信信息 + 可信凭证完整能力｜独立评审

**初审日期：2026-08-17**  
**复审日期：2026-08-17**  
**初始实现：`89620ff` → `081577f` → `2ff2631`**  
**阻断修复：`6e79997c359860bf2a545b198f62391fb9b0b09f`**  
**Focused regression：`229a6048f99f4ffe3fac65882a7804e360a4432b` → `42a5960c34e5dafad4c3498296b1c7af33c363e2` → `1b0243500f576e28880f568d2435819216541d0f`**  
**最终结论：PASS**

---

## 1. 复审结论

首轮评审只阻断一个根问题：

> `claimable / pending` 等尚未签发或仍在处理中的凭证，被错误提升成“可验真、可保存、可下载、可官方 handoff”的可信事实；同时 pending 成绩可下载成正式可信成绩报告。

修复提交 `6e79997c359860bf2a545b198f62391fb9b0b09f` 已严格按要求做窄修，没有返工已经通过的企业工商信息、企业详情结构、三种验真入口、文件限制或公开路由边界。

该阻断项现已关闭，F002 转为 **PASS**。

---

## 2. BLOCKER 修复确认

### 2.1 证书生命周期 gate 已收紧

当前语义：

- `claimed`：已签发可信凭证；允许保存、下载、三种方式验真与官方平台 handoff；
- `claimable`：仅表示具备领取资格；只开放领取，不允许可信动作；
- `pending`：待发放 / 处理中；不允许保存、下载或可信验真；
- `revoked`：已撤销 / 已失效；可信动作关闭。

证书详情不再对所有状态无条件展示保存、下载、验真和官方 handoff。

### 2.2 验真码不再用 `status !== revoked` 判有效

验真页先查找对应记录，再按状态表达：

```text
claimed   → 验证通过
claimable → 尚未签发
pending   → 待发放 / 处理中
revoked   → 凭证已撤销
其它      → 未找到有效记录
```

因此旧 seed 中 `COURSE-DA-26001` 在领取前不会再显示“验证通过”。只有领取转为 `claimed` 后才成为可验真的可信凭证。

QR 的 Mock 匹配也只从 `claimed` 凭证中选择，没有重新放宽可信状态边界。

### 2.3 pending 成绩不再冒充正式成绩报告

`competition-result-sanchuang-16` 等 `pending` 结果现在显示：

```text
成绩报告处理中
```

按钮禁用，并明确说明当前不能下载为正式可信成绩报告。只有非 pending 状态才开放现有中保真成绩报告下载。

---

## 3. Focused Browser Regression

新增：

```text
apps/mobile/tests/f002-trust-status.spec.ts
```

测试真实覆盖：

```text
/assets/verification
→ COURSE-DA-26001
→ claimable 显示“尚未签发”
→ 不出现“验证通过”
→ 官方验真动作不可用

/assets/certificates/cert-course-data-analytics
→ claimable 只允许领取
→ 保存 / 下载 / 三种验真 / 官方 handoff 均不存在
→ 点击领取
→ 状态转 claimed
→ 保存 / 下载 / 验真 / 官方 handoff 全部开放
→ 再进入验真页
→ 验证通过

/assets/results/competition-result-sanchuang-16
→ “成绩报告处理中”禁用
→ 不存在“下载成绩报告”
→ 明确不能下载正式可信成绩报告
```

首版测试曾因现有 label 未与 input 关联而使用 `getByLabel` 失败；施工线程没有借机扩大 F002 UI 范围，只在 `1b0243500f576e28880f568d2435819216541d0f` 将 selector 改为稳定 placeholder。该处理不改变产品实现。

---

## 4. CI / Browser 证据

### Mobile build / deploy

GitHub Actions run：`32016438710`

对应 HEAD：`229a6048f99f4ffe3fac65882a7804e360a4432b`

结论：**success**。

该 run 已完成 Mobile type-check / development build / Cloudflare deploy，证明修复后的业务代码和新增 regression source 可正常构建部署。

### Focused F002 browser regression

GitHub Actions run：`32016602993`

对应 HEAD：`1b0243500f576e28880f568d2435819216541d0f`

步骤：

- install dependencies：success；
- install Chromium：success；
- build mobile preview：success；
- focused F002 browser regression：success。

实际日志：

```text
Running 1 test using 1 worker
✓ F002 gates trust actions until a credential is claimed
1 passed (3.1s)
```

因此本次不是“测试代码已提交”意义上的通过，而是有真实 Chromium 执行证据。

---

## 5. 初审已通过部分继续有效

复审没有发现修复线程破坏以下已接受项：

- 企业详情默认仍以合作 / 资源 / 品牌关系为主心智；
- `?tab=business` 工商可信基础信息保留；
- 工商数据继续明确为 Prototype Mock，不冒充官方工商查询；
- `/assets/verification` 仍提供验真码 / 扫码 / PDF-OFD 文件三种入口；
- PDF / OFD 与 10MB 上限保持；
- `/assets/verification` 仍按公开路由语义访问；
- 证书 / 成绩详情仍属于长期账号资产；
- 官方验证平台继续使用明确的原型 handoff，不伪造真实第三方 URL；
- 下载仍明确是中保真占位文件；
- 系统可信事实与简历 presentation 的边界没有退化。

---

## 6. 最终结论

**F002 = PASS。**

原阻断问题已经通过代码 gate + focused Chromium regression 双重关闭。

F002 不需要继续返工；后续只在 R-Final 中参与母动线与 feature-level 总回归。
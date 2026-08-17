# F01｜学生主档 + Onboarding / Profile / 问卷｜独立评审

**初审日期：2026-08-17**  
**复审日期：2026-08-17**  
**初始实现：`a7a5709` → `8e230b6` → `0994f12` → `ac2465d`**  
**阻断修复：`7da28be0b12e74db148b7149ae4f746dc523833a`**  
**最终 focused test：`bb9ec432f2eb37f09cd97a66cc4c09bfb55ad1ca`**  
**Browser run：`32019232067`**  
**最终结论：PASS**

---

## 1. 复审结论

首轮评审只阻断一个根问题：手机号验证码 UI 与父层保存 gate 使用了两套 verified 判断，导致输入正确验证码后页面可能显示“手机号已验证”，但父层 `phoneVerified` 仍为 false，保存按钮继续禁用。

修复提交 `7da28be0b12e74db148b7149ae4f746dc523833a` 已按要求做窄修，没有返工已经通过的 `StudentProfile`、问卷模型、`profileSources` 或 `mergeProfileFromSource()`，也没有顺手清理 `SupportPages.tsx` 死代码。

该阻断项现已关闭，F01 转为 **PASS**。

---

## 2. BLOCKER-01 修复确认

### 2.1 父层 `phoneVerified` 成为唯一验证状态

当前 `PhoneVerification` 不再使用 `code === "123456"` 直接推导 verified。

实际语义变成：

```text
输入合法手机号
→ 发送验证码
→ 输入验证码
→ 只有点击“验证”且 code === 123456
→ onVerifiedChange(true)
→ 父层 phoneVerified=true
→ UI 显示“手机号已验证”
→ 保存 gate 开放
```

因此不会再出现“子组件显示已验证、父组件仍未验证”的状态分裂。

### 2.2 修改手机号与改回原号的同步成立

`changePhone()` 现在统一处理：

- 修改号码时清空本次发送 / 输入状态；
- 新号码立即使父层 verified 失效；
- 如果改回原本已经 verified 的号码，则父层同步恢复 `phoneVerified=true`。

这关闭了首轮评审指出的次级状态分裂。

### 2.3 错码不会开放保存

`verify()` 只有在：

```text
sent && code === "123456"
```

时才调用 `onVerifiedChange(true)`。

错误验证码不会改变父层 verified，也不会开放保存。

---

## 3. Focused Browser Regression：PASS

最终测试提交：

`bb9ec432f2eb37f09cd97a66cc4c09bfb55ad1ca`

测试真实覆盖：

```text
/me/profile
→ 输入新手机号
→ 保存 disabled
→ 改回原 verified 手机号
→ 保存重新 enabled
→ 再输入新手机号
→ 发送验证码
→ 错码 654321
→ 点击验证
→ 保存仍 disabled，且不显示“手机号已验证”
→ 输入 123456
→ 点击验证
→ 显示“手机号已验证”
→ 保存 enabled
→ 保存返回 /me
→ 通过 SPA 点击“编辑基础资料”重新进入 /me/profile
→ 新手机号仍存在
→ verified 状态仍存在
→ 保存仍 enabled
```

这里最终采用 SPA 返回而不是 `page.goto()` 强制刷新是正确的：本卡验收的是同一原型 App 会话中的 `StudentProfile` 单一真相源，不把“刷新后持久化”这个全局存储问题偷偷扩大进 F01。

---

## 4. GitHub Actions 证据

Run：`32019232067`  
Workflow：`F001 Phone Verification Browser Check`  
Head SHA：`bb9ec432f2eb37f09cd97a66cc4c09bfb55ad1ca`

实际步骤：

- Checkout：success；
- Install dependencies：success；
- Build mobile preview：success；
- Install Chromium：success；
- Run focused F001 browser test：success；
- 总结论：success。

Playwright 日志：

```text
Running 1 test using 1 worker
✓ F001 phone verification gates save and persists the verified number
1 passed (1.8s)
```

该 run 同时执行 `tsc -b && vite build --mode development`，构建成功。

---

## 5. 已通过并继续保持的 F01 主体

以下首轮已经通过，复审确认没有被本次窄修破坏：

- 唯一长期 `StudentProfile`；
- onboarding、可选问卷、`/me/profile` 共用同一 profile；
- `profileSources` 仅作为 provenance 元数据；
- `mergeProfileFromSource()` 为 registration / workshop 提供统一回流边界；
- 旧 Mockplus 有价值字段均有保留 / 合并 / 废弃去向；
- 不建立独立 questionnaire profile；
- 不构造黑盒画像评分；
- 已由报名 / 其它来源取得的字段可通过同一主档合并，而不是建立第二份资料。

---

## 6. 非阻断维护项

`SupportPages.tsx` 中未再被 App 使用的旧 onboarding 组件仍是死代码。本次按评审要求没有扩大范围清理。

它不构成 F01 阻断；后续可在普通代码清理中删除，避免未来误 import。

---

# 7. 最终结论

**F01 = PASS。**

F01 不再需要返工，后续只参加 `R-Final` 功能级总回归。

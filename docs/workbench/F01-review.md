# F01｜学生主档 + Onboarding / Profile / 问卷｜独立评审

**评审日期：2026-08-17**  
**评审对象：F01 / F001 实现提交 `a7a5709` → `8e230b6` → `0994f12` → `ac2465d`，并核对当前 `dev` 实现未被后续提交覆盖。**  
**结论：CHANGES REQUIRED（窄修后复审）**

---

## 1. 总体判断

F01 的数据架构方向成立，而且大部分任务卡已经完成：

- 建立长期唯一 `StudentProfile`；
- onboarding、可选问卷与 `/me/profile` 都读写 `LongTermAssetsProvider` 中同一份 `profile`；
- `profileSources` 记录字段来源，没有再建立 questionnaire profile；
- `mergeProfileFromSource()` 为 registration / workshop 提供统一回流入口；
- 旧 Mockplus 中昵称、性别、手机号、生日、身份、三创赛经历、产业方向、学历、从业年限、核心需求、服务关注、地区等都有明确去向；
- 地区已并入主档，不在可选问卷重复追问；
- 没有引入不透明画像评分；
- F02 并行修改没有被覆盖；
- CI run `32013927360` 的 TypeScript + Vite build + Cloudflare deploy 为 success。

因此本轮不要求重构 StudentProfile，也不要求重新设计问卷。阻断集中在一个明确的手机号验证码交互 bug。

---

# 2. BLOCKER-01｜正确验证码输入完成后，“验证”按钮会消失，但主档仍保持未验证

当前 `PhoneVerification` 中同时存在两层状态：

```ts
const [code, setCode] = useState("");
const verified = alreadyVerified || code === "123456";
const verify = () => {
  if (sent && code === "123456") onVerifiedChange(true);
};
```

验证码输入区的显示条件却是：

```tsx
{sent && !verified && (
  ...
  <button onClick={verify}>验证</button>
)}
```

这会产生以下真实交互：

```text
修改 / 输入新手机号
→ 点击发送验证码
→ 输入 1 2 3 4 5 6
→ code === "123456"
→ verified 立即变成 true
→ 输入框 + “验证”按钮立即消失
→ verify() 从未被点击
→ onVerifiedChange(true) 从未执行
→ 父组件 phoneVerified 仍为 false
→ “保存并继续 / 保存资料”仍 disabled
```

页面此时还会显示：

> 手机号已验证

因此出现了最糟糕的一种中保真状态：**UI 告诉用户已验证，但真实保存 gate 仍认为未验证，而且用户已经失去点击验证按钮的机会。**

这会直接阻断 F01 任务卡要求的手机号 / 验证码 onboarding 动线，所以不能判 PASS。

同一根状态分裂还有一个次级表现：若原手机号本来 verified，用户先改号码再改回原号码，`alreadyVerified` 会让 UI 显示已验证，但父层 `phoneVerified` 可能仍停留在 false，保存仍被禁用。

---

## 3. Required Fix

只做窄修，不动 StudentProfile 架构。

推荐任选一种清晰语义：

### 方案 A｜必须点击“验证”才算验证成功

```text
code 输入完成
→ “验证”按钮仍存在
→ 点击验证
→ onVerifiedChange(true)
→ UI 显示已验证
→ 保存 gate 开放
```

此时 `verified` 不应直接由 `code === "123456"` 推导，而应由真正的 verification state 决定。

### 方案 B｜正确验证码输入完成即自动验证

如果原型想省一次点击，也可以：

```text
code === 123456
→ 立即调用 onVerifiedChange(true)
→ UI 与父层保存 gate 同步
```

但不要继续保持“子组件自己认为 verified、父组件仍认为 unverified”的双状态。

同时保证：

- 修改为不同手机号后必须重新验证；
- 改回已验证的原手机号时，UI 与保存 gate 状态一致；
- 错误验证码不能保存；
- 不需要接真实短信。

---

# 4. 复审必须补的一条 focused browser regression

当前 CI 只有 typecheck/build/deploy，无法证明这个交互成立。

至少补一条浏览器测试：

```text
/onboarding/profile
→ 修改为一个新的合法 11 位手机号
→ 保存按钮 disabled
→ 发送验证码
→ 输入错误验证码：仍 disabled
→ 输入 / 验证 123456
→ 保存按钮 enabled
→ 保存进入 /onboarding/survey
→ 再进入 /me/profile
→ 新手机号仍存在且显示 verified
```

如果采用“自动验证”方案，测试相应省略点击验证，但必须验证最终保存 gate 已打开。

建议顺带覆盖：

```text
已验证原号码
→ 改成其它号码
→ 再改回原号码
→ UI 和保存 gate 对 verified 状态一致
```

---

# 5. 已通过项，不要返工

以下部分本轮已经接受：

## 5.1 StudentProfile 单一长期真相源

`LongTermAssetsProvider` 现在只维护一份长期 `profile: StudentProfile`，旧 `ProfileState` 只是兼容 type alias，不是第二份状态。

`updateProfile()` 与 `mergeProfileFromSource()` 最终都写同一个 profile。

## 5.2 字段来源设计

`profileSources` 用于表达 seed / onboarding / profile / registration / workshop 来源，属于 provenance 元数据，不是第二份个人资料。

## 5.3 问卷不再形成孤岛

可选问卷直接从 `profile` 初始化 draft，并保存回同一个 StudentProfile：

- identityType；
- competitionExperience；
- industryFields；
- educationLevel；
- workYears；
- coreNeeds；
- serviceInterests。

“暂时跳过”只导航，不会清空既有主档。

## 5.4 旧字段处理完整

施工记录对旧 Mockplus 字段逐项给出保留 / 合并 / 废弃理由，满足任务卡要求。

## 5.5 registration / workshop 回流边界

`mergeProfileFromSource()` 默认 `fill-empty`，不会让外部来源静默覆盖用户长期资料；若后续某字段被业务确认属于权威来源，可显式 `replace`。

F01 不需要为了本次复审扩大到重做 F00 callback 或创赛工坊。

---

# 6. 非阻断维护项

`apps/mobile/src/features/platform-support/SupportPages.tsx` 中仍保留旧的：

- `OnboardingProfilePage`
- `OnboardingSurveyPage`
- `OnboardingReadyPage`

App 当前已经切换到 `StudentProfilePages.tsx` 的新实现，所以这些旧组件现在属于未使用的死代码，不构成运行态第二真相源。

本轮不要求为了修验证码扩大改动；但建议后续清理，避免未来误 import 后把旧的本地 `draft/focus` onboarding 再带回来。

---

# 7. CI 说明

GitHub Actions run `32013927360`：

- head SHA：`ac2465d27918666c9cc79f445daf01c173aa9524`；
- workflow：Deploy Mobile to Cloudflare Pages；
- TypeScript / Vite development build：success；
- deploy：success。

该证据证明构建成立，但不能覆盖 BLOCKER-01 的验证码交互状态分裂。

---

# 8. 最终结论

**F01 = CHANGES REQUIRED。**

修复范围应保持很小：

1. 修正 `PhoneVerification` 的 verified 状态同步；
2. 补 focused browser regression；
3. 给出真实 browser PASS；
4. 不返工 StudentProfile / mergeProfileFromSource / 问卷字段模型；
5. 修复完成后停在待复审，不自行标 PASS。

完成这一个根问题后，F01 可以快速转 PASS。

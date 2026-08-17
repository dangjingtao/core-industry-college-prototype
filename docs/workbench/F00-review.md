# F00｜手机端 ↔ 响应式报名门户｜独立评审

**初审日期：2026-08-17**  
**复审日期：2026-08-17**  
**初始实现：`adbaedf8be2f4e60516ebccab21dee0e50b6a1fe`**  
**阻断修复：`38245d9d6c20f7395ae81927a93637baa9e8cd46`**  
**施工证据文档：`27a4f2ac6f15a59b28d964d5e0e4ad87e413b4c6`**  
**最终结论：PASS**

---

## 1. 复审结论

首轮评审只阻断一个根问题：

> 真实 `Mobile → PC → Mobile` 导航会卸载 Mobile React 应用，导致纯内存 `session / identities[] / identityMode` 返回时被默认 seed 重新初始化，从而破坏“同一个账号状态连续报名”的语义。

修复提交 `38245d9d6c20f7395ae81927a93637baa9e8cd46` 已按要求做窄修，没有返工已经通过的 PC 报名页、shared URL 协议、Cloudflare 地址与 callback 映射。

该阻断项现已关闭，F00 转为 **PASS**。

---

## 2. BLOCKER-01 修复确认

### 2.1 离开 Mobile 前保存一次性账号快照

新增：

```text
apps/mobile/src/features/public-platform/registrationHandoffSnapshot.ts
```

快照只保存 F00 handoff 连续性需要的：

```text
session
identities[]
identityMode
```

并满足：

- 位于 Mobile 自身 origin 的 `sessionStorage`；
- 仅在真实进入响应式报名门户前保存；
- 带 `version` 与 2 小时 TTL；
- 保存失败时阻止跨端跳转，不静默丢失账号状态；
- 不是新的长期账号 / 赛事身份 Store。

### 2.2 返回后恢复顺序正确

Mobile 收到合法报名 callback 后：

```text
读取 handoff snapshot
→ 恢复原 session / identityMode / identities[]
→ 消费当前赛事 callback
→ 写回既有 Public Platform identities[]
→ 清理 snapshot
→ 清理 callback query
```

这满足首轮要求的关键顺序：**先恢复离开前账号状态，再叠加本次报名结果。**

对于无赛事身份账号，返回后不会重新引入默认 `multiIdentitySeed` 中其它赛事身份。

### 2.3 callback 真相源边界没有退化

F00 仍然保持：

- `pending` → 当前赛事 `identityStatus=pending`；
- `rejected` → 当前赛事 `identityStatus=rejected`；
- `approved` → 当前赛事 `identityStatus=active`，并推进对应赛事 runtime；
- `draft` → 不创建新赛事身份。

最终赛事身份仍属于 Mobile 既有 Public Platform `identities[]`，没有迁入 PC Store，也没有建立第二份长期 identity 真相源。

---

## 3. 真实双服务 Browser PASS

新增 focused E2E：

```text
apps/mobile/playwright.handoff.config.ts
apps/mobile/tests/registration-handoff-cross-app.spec.ts
```

Playwright 同时启动：

```text
Mobile  http://127.0.0.1:5173
PC      http://127.0.0.1:5174
```

实际测试路径不是人工注入 callback，而是浏览器真实执行：

```text
Mobile 默认多赛事 seed
→ 切换为无赛事身份
→ 进入 sanchuang-16 报名
→ 真正导航到 PC 5174
→ 队员注册
→ 答题
→ 点击“返回 App / 赛事”
→ 真正返回 Mobile 5173
→ sanchuang-16 = pending
→ callback query 已清理
→ handoff snapshot 已清理
→ 进入“我的赛事”
→ innovation-cup-2026 不存在
→ sanchuang-15 不存在
```

该测试正面覆盖了首轮评审指出的 Provider 卸载 / 重建边界。

---

## 4. CI 证据

GitHub Actions：

```text
Run: 32017114188
Workflow: Deploy Mobile to Cloudflare Pages
HEAD: 38245d9d6c20f7395ae81927a93637baa9e8cd46
Conclusion: success
```

已核日志：

- `npm ci`：success；
- `Type-check and build mobile preview`：success；
- `Install Playwright Chromium`：success；
- `Run F00 cross-app browser regression`：success；
- Playwright：`1 passed (6.1s)`；
- Cloudflare Pages deploy：success。

因此本次 PASS 不是“测试源码存在”的推断，而是有真实 CI browser execution 证据。

---

## 5. 首轮已经通过、复审未发现回归的部分

以下继续判定通过：

- 不复制第二套 PC 报名 UI；
- Mobile 通过环境地址进入现有 `/registration-portal/*`；
- `@core/shared` 仅维护 handoff / callback URL 协议；
- PC 有明确“返回 App / 赛事”出口；
- `competitionId / returnTo / source` 上下文保持；
- dev / prod Cloudflare 地址环境化；
- PC 短期 sessionStorage 不是长期赛事身份真相源；
- 后续真实后台接入可替换 handoff / callback 层，而无需重画报名 UI。

---

## 6. 非阻断后续事项

以下仍是生产化注意事项，不影响本轮中保真原型 PASS：

1. 当前 callback query 是原型状态协议，真实生产赛事身份必须由服务端可信报名 / 审核结果授予；
2. `returnTo` 生产化时应增加允许 origin 校验，避免开放跳转；
3. 当前 handoff snapshot 只服务一次跨端浏览器会话，不应演变为长期账号持久化机制。

---

# 7. 最终判定

**F00：PASS。**

验收成立：

```text
无赛事身份
→ Mobile 赛事详情
→ 现有响应式报名门户
→ PC 队员报名 / 答题
→ 返回 Mobile
→ 当前赛事 pending
→ 默认其它赛事身份不复活
→ 我的赛事读取同一 identities[]
```

F00 可关闭，不需要继续返工报名 UI、shared 协议或 Cloudflare handoff。

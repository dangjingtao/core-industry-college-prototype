# F00｜手机端 ↔ 响应式报名门户｜独立评审

**评审日期：2026-08-17**  
**评审对象：`dev` 分支，F00 实现提交 `adbaedf8be2f4e60516ebccab21dee0e50b6a1fe`，并核对当前后续 HEAD 未改写 F00 核心文件。**  
**结论：CHANGES REQUIRED（窄修后复审）**

---

## 1. 结论摘要

F00 的整体架构方向正确：

- 没有复制第二套 PC 报名 UI；
- Mobile 使用环境变量进入现有 `/registration-portal/*`；
- `@core/shared` 只定义 handoff / callback URL 协议，不持有业务状态；
- PC 提供显式“返回 App / 赛事”；
- callback 最终写入 Mobile 已有 Public Platform `identities[]`；
- approved 同时推进对应赛事 runtime；
- dev / prod Cloudflare 地址没有硬编码在业务组件；
- PC / Mobile 的 type-check、build、deploy 均有成功 CI 证据。

但当前实现仍有一个阻断问题：

> **真实跨域导航会卸载 Mobile 应用，而 Mobile 的 `session / identities[] / identityMode` 仍是纯内存状态；返回 Mobile 时 Provider 会重新用 seed 初始化，因此回流并不是在“离开前同一个账号状态”上继续。**

因此当前不能判 F00 PASS。

---

## 2. 已通过部分

### 2.1 Handoff 协议边界正确

`packages/shared/src/registration-handoff.ts` 只负责：

- Mobile → PC URL；
- PC → Mobile callback URL；
- `competitionId`；
- `returnTo`；
- source marker；
- `draft / pending / rejected / approved` 状态解析。

没有把赛事身份或报名业务 Store 放入 shared package。

### 2.2 Mobile 没有复制复杂报名

Mobile `/competitions/:competitionId/registration` 已改为 `RegistrationHandoffPage`，复杂报名继续由 PC 响应式门户承接。

### 2.3 PC 返回协议成立

PC 从 Mobile 进入后保留短期 handoff context，并提供固定“返回 App / 赛事”按钮；返回时根据报名门户当前状态构造 callback。

### 2.4 Mobile callback 写既有 `identities[]`

- pending → pending；
- rejected → rejected；
- approved → active；
- draft → 不创建赛事身份。

没有新增第二份长期赛事身份 Store。

### 2.5 环境配置符合任务卡

Mobile：

- dev → `https://dev.core-industry-college-pc.pages.dev`
- prod → `https://core-industry-college-pc.pages.dev`
- local example → `http://localhost:5174`

业务组件本身不写死某次预览地址。

### 2.6 Build / deploy 证据成立

F00 提交对应：

- Mobile run `32014377555`：install / type-check + dev build / Cloudflare deploy success；
- PC run `32014377562`：install / type-check + dev build / Cloudflare deploy success。

---

## 3. 阻断问题

### BLOCKER-01｜真实跨端返回会丢失 Mobile 离开前的账号 / identity 状态

当前 Mobile 打开 PC 使用：

```ts
window.location.assign(portalUrl)
```

这会离开 Mobile origin，并卸载 React 应用。

而 `PublicPlatformProvider` 当前初始化仍是：

```ts
const [session, setSession] = useState(() => ...)
const [identities, setIdentities] = useState(multiIdentitySeed)
const [identityMode, setIdentityModeValue] = useState("multi")
```

没有 localStorage / sessionStorage hydration，也没有 F00 handoff snapshot restore。

因此工作台账要求的真实动线：

```text
无赛事身份
→ 手机赛事详情
→ 报名
→ PC 门户
→ 提交
→ 返回手机
→ pending
```

实际会变成：

```text
Mobile：用户先切到“无赛事身份” → identities=[]
→ 离开 Mobile
→ PC
→ 回到 Mobile
→ PublicPlatformProvider 重新 mount
→ identities 先恢复 multiIdentitySeed
→ callback 再把当前赛事改成 pending
```

结果是：离开前不存在的其它赛事身份会重新出现，回流并不是在原账号状态上继续。

这违反 F00 两个核心要求：

1. “同一赛事不能在 PC 与 mobile 各自产生互不相认的报名事实”；
2. “无赛事身份 → 报名 → pending”必须是同一个长账号上下文连续发生。

### 修复要求

只做窄修，不重构整个状态系统。可选实现方式：

- 在离开 Mobile 前把 handoff 所需账号快照写入 Mobile origin 的 `sessionStorage`，至少覆盖 `session / identities[] / identityMode`；
- 返回 Mobile 时先恢复该快照，再消费 callback；
- callback 消费完成后清理一次性 handoff snapshot；
- 或建立等价的、边界清晰的 Public Platform session hydration。

不要：

- 把长期赛事身份搬到 PC Store；
- 把完整业务状态塞进 URL；
- 新建第二份身份真相源。

---

## 4. 当前测试为什么没有抓到 BLOCKER-01

现有测试是两半：

### Mobile test

Mobile 测试验证 portal URL，然后直接在同一个 Mobile 页面里用 `history.pushState` 人工注入 callback。

它**没有真的执行 `window.location.assign` 离开 Mobile**，因此 Provider 从未卸载，也就不会触发状态重置。

### PC test

PC 测试独立验证 handoff context，并把 callback 发往 `https://mobile.example.test/...`。

它能证明 PC 构造 callback 正确，但没有回到真实 Mobile 应用验证原账号状态是否延续。

两边各自正确，不等于真实跨端母动线已经被浏览器走通。

---

## 5. 必须补的一条 focused browser regression

修复后至少增加一条真实双服务 E2E：

```text
启动 Mobile 5173 + PC 5174
→ Mobile 切到“无赛事身份”
→ 进入 sanchuang-16 报名
→ 点击真实 portal button，浏览器导航到 PC 5174
→ 完成队员流程或提交审核
→ 点击“返回 App / 赛事”
→ 浏览器真实回到 Mobile 5173
→ sanchuang-16 = pending
→ 其它赛事身份没有凭 seed 无故重新出现
→ 我的赛事读取同一 identities[]
```

这条测试的价值不是“多一条测试”，而是覆盖当前拆分测试无法发现的页面卸载 / 重建边界。

当前 deploy workflow 不执行 Playwright，因此修复线程应提供实际本地/CI browser run 结果；不能只提交 test source 就声称通过。

---

## 6. 非阻断说明

### 6.1 callback 目前是原型协议，不是生产鉴权

当前 marker / query 可以被手工构造，理论上不能作为真实生产赛事身份授予依据。但 F00 明确允许中保真模拟 approved / rejected，因此本次不把它作为阻断项。

真实后台接入时，身份结果必须来自服务端可信报名/审核状态，而不是客户端 query 自证。

### 6.2 `returnTo` 当前接受任意 http(s)

为了本地、测试和 CF 原型切换，当前 shared parser 只检查 http(s)。生产化时建议按允许的 Mobile origin 做 allowlist，避免形成开放跳转边界。本次原型评审不阻断。

---

## 7. 复审范围

修复线程只需要处理：

1. Mobile 跨页面 handoff 前后的账号 / `identities[]` 连续性；
2. 一条真正跨 Mobile ↔ PC 的 focused browser regression；
3. 给出真实 browser PASS 证据。

以下已经通过，不要返工：

- PC 报名 UI；
- shared URL 协议基本结构；
- dev / prod CF 环境配置；
- Mobile callback 的 pending / rejected / approved 映射；
- PC 固定返回入口；
- 不建立第二份赛事身份 Store。

**复审条件满足后，F00 可以快速转 PASS。**

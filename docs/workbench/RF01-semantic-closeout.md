# RF01｜R-Final 两处语义收口

**类型：施工卡**  
**状态：待评审**  
**优先级：P0 / R-Final blocker**  
**施工基线：`e9cb7643f730db2ece0ac225f5a3544af72bc1a4`**

> 只关闭 `docs/workbench/R-Final-review.md` 的 BLOCKER-01 / BLOCKER-02。不要扩大范围。

## 必读

1. `docs/workbench/R-Final-review.md`
2. `docs/workbench/F004-product-decisions.md`
3. `apps/mobile/src/features/platform-support/SupportPages.tsx`
4. `apps/mobile/src/routes/registry.ts`
5. `apps/mobile/tests/r-final.spec.ts`

## 目标

关闭两个已经确认的 Guardrail 冲突：

1. 当前 `/growth/score` 的 GrowthScore 页面不再冒用“学力值”语义；
2. 当前 `/me/accounts` 的 Email / 微信 / 企业微信绑定不再统一称为“第三方账号”。

这不是重新做产品决策，只是把已经 Confirmed 的边界落实到当前代码。

---

## A｜GrowthScore 语义收口

当前页面仍出现：

```text
学力值
当前学力值
```

而它实际只是基于当前账号 / 学习 / 投递计算出的 GrowthScore 展示。

### 必须修改

- `/growth/score` 页面标题和页面内文案去掉“学力值”；
- 建议使用不占用积分语义的中性表达，例如“成长概览 / 成长记录”；
- `routes/registry.ts` 中 `growth.score` 的 purpose 同步去掉“学力值”；
- 路由 `/growth/score` 本身保持不变，本卡不做 IA 重构；
- 现有计算逻辑不扩张、不删除，除非为了文案适配做最小调整。

### 禁止

- 不新增积分余额 / 流水；
- 不新增 `LearningPointAccount` 或等价积分 Store；
- 不恢复旧兑换中心；
- 不决定课程是否用积分兑换；
- 不把 Pending 的“GrowthScore 是否长期保留”擅自拍板。

---

## B｜账号绑定语义收口

当前 `/me/accounts` 实际对象只有：

- Email；
- 企业微信；
- 微信；
- 绑定 / 解绑。

### 必须修改

- 页面标题改成“账号绑定”或同等明确表达；
- `routes/registry.ts` 中 `me.accounts` 的 purpose 同步改成“账号绑定”语义；
- 现有 Email / 微信 / 企业微信 binding 行为保持不变。

### 禁止

- 不恢复抖音达人 / 快团团 / 三创好物；
- 不新增 `BusinessChannelAccount`；
- 不决定旧业务渠道账号是否继续存在；
- 不改 `/me/accounts` 路由。

---

## C｜Focused browser regression

在现有 `apps/mobile/tests/r-final.spec.ts` 中补 **2 条极窄断言**：

1. `/growth/score` 页面可正常打开，且当前页面不再出现“学力值”；
2. `/me/accounts` 页面可正常打开，且当前页面不再出现“第三方账号”，同时仍可看到 Email / 企业微信 / 微信绑定对象。

不要把这两条测试写成大而全的 UI 快照。

## 最低验证

至少执行：

```bash
npm run verify --workspace @core/mobile
npm run e2e --workspace @core/mobile -- tests/r-final.spec.ts
```

如果 push 后触发 `R-Final Full Regression`，记录 run / job，但施工线程**不得因为 CI 绿就自行宣布最终 PASS**。

## 允许修改范围

优先限定在：

- `apps/mobile/src/features/platform-support/SupportPages.tsx`
- `apps/mobile/src/routes/registry.ts`
- `apps/mobile/tests/r-final.spec.ts`
- 本卡施工记录或独立 implementation record

发现必须改其它业务文件时，先说明原因；不要顺手清理无关代码。

## 交付

施工完成后返回：

- 最终 commit SHA；
- 实际修改文件；
- focused browser 结果；
- build / CI 证据；
- 明确声明“未恢复积分经济、未恢复旧业务渠道账号”。

状态只改到：**待评审**。  
不要自行进入 RF02，不要自行宣布 R-Final PASS。

---

## 施工记录｜2026-08-17

### 实际修改

- `apps/mobile/src/features/platform-support/SupportPages.tsx`
  - `/growth/score`：页面标题改为“成长概览”，汇总提示改为“成长记录汇总”；原 GrowthScore 计算逻辑保持不变。
  - `/me/accounts`：页面标题改为“账号绑定”；Email / 企业微信 / 微信的绑定 / 解绑行为保持不变。
- `apps/mobile/src/routes/registry.ts`
  - `growth.score` purpose 改为“成长概览”；路由保持 `/growth/score`。
  - `me.accounts` purpose 改为“账号绑定”；路由保持 `/me/accounts`。
- `apps/mobile/tests/r-final.spec.ts`
  - 新增 GrowthScore 页面不得出现“学力值”的 focused assertion。
  - 新增账号绑定页面不得出现“第三方账号”，且邮箱 / 企业微信 / 微信仍可见的 focused assertion。

### 验证证据

实现提交 HEAD：`352a6ab90a3fb4687d7e8a6b893ea13336af9bc8`。

GitHub Actions `R-Final Full Regression`：

- run：`32024088172`
- job：`95369672518`
- conclusion：`success`

关键结果：

```text
Mobile route audit: PASS
Registry routes: 66
App route declarations: 69
Missing registry routes: 0
RouteProbe in App: no
Explicit 404 route: yes

Mobile typecheck + production build: PASS
Mobile browser regressions: 22 passed (9.6s)
  - RF01 GrowthScore semantic assertion: PASS
  - RF01 account binding semantic assertion: PASS

Real Mobile -> PC -> Mobile handoff: 1 passed
PC typecheck + production build: PASS
PC browser regressions: 6 passed
```

### 边界声明

- **未恢复积分经济**：未新增余额 / 流水、`LearningPointAccount`、旧兑换中心或课程积分兑换逻辑。
- **未恢复旧业务渠道账号**：未新增抖音达人 / 快团团 / 三创好物或 `BusinessChannelAccount`。
- 未修改 `/growth/score`、`/me/accounts` 路由。
- 未扩张或删除现有 GrowthScore 计算逻辑。
- 未进入 RF02，未宣布 R-Final PASS。

**当前状态：待评审。**

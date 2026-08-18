# RF01 / RF02｜独立复核

> 复核日期：2026-08-17  
> 当前 `dev`：`69811c0413b2d3ebaeb650d7cc1bc5daefcd880d`  
> RF01 实现基线：`352a6ab90a3fb4687d7e8a6b893ea13336af9bc8`  
> RF02 评审提交：`9b65d3b145d592798aba6952c14c68626021afcb`

## 结论

- **RF01：PASS。** 两个语义 blocker 已准确关闭，且当前 `dev` 上仍保持关闭。
- **RF02：评审执行本身 PASS；但其“R-Final 最终 PASS”只对当时的 RF01 基线成立。当前 `dev` 在 RF02 之后出现新的母动线回归，因此当前分支的 R-Final 状态必须重新打开为 `CHANGES REQUIRED`。**

这不是 RF01 返工，也不是重新打开 F00–F03 / F004。需要处理的是 RF02 之后新增提交造成的 post-PASS regression。

---

## 1. RF01｜PASS

### 施工范围符合卡片边界

从派卡点 `16dc938237d618634508ec704d953bdb0c2770e9` 到 RF01 实现基线 `352a6ab90a3fb4687d7e8a6b893ea13336af9bc8`，只修改：

- `apps/mobile/src/features/platform-support/SupportPages.tsx`
- `apps/mobile/src/routes/registry.ts`
- `apps/mobile/tests/r-final.spec.ts`

没有扩大到积分经济、旧业务渠道账号或其它业务文件。

### BLOCKER-01 已关闭

当前 `/growth/score`：

- 页面标题：`成长概览`
- 汇总语义：`成长记录汇总`
- route purpose：`成长概览`
- 路由仍为 `/growth/score`
- 原有 GrowthScore 计算仍是账号 / 学习 / 投递的聚合，没有新增余额、流水或兑换逻辑。

没有恢复：

- `LearningPointAccount`
- 学力值余额 / 收支流水
- 旧兑换中心
- 课程积分兑换

因此 GrowthScore 已停止冒用“学力值”积分语义。

### BLOCKER-02 已关闭

当前 `/me/accounts`：

- 页面标题：`账号绑定`
- route purpose：`账号绑定`
- Email / 企业微信 / 微信绑定能力继续存在。

没有恢复：

- 抖音达人
- 快团团
- 三创好物
- `BusinessChannelAccount`

因此当前 login/contact binding 已与旧业务渠道账号语义分离。

### Browser / CI 证据成立

`R-Final Full Regression`：

- run：`32024088172`
- job：`95369672518`
- checkout：`352a6ab90a3fb4687d7e8a6b893ea13336af9bc8`
- conclusion：`success`

实际结果：

```text
Route audit PASS
Mobile typecheck / production build PASS
Mobile Chromium: 22 passed (9.6s)
Cross-app Mobile -> PC -> Mobile: 1 passed
PC typecheck / production build PASS
PC Chromium: 6 passed
```

RF01 两条 focused assertion 分别为第 21 / 22 条，均 PASS。

**RF01 独立结论：PASS。**

---

## 2. RF02｜当时的独立复审有效

RF02 在 `b31e6914e712e20ecab73d6852e6471dea3497cd` 之后执行，实际核对了：

- RF01 三个施工提交；
- 两个 Guardrail blocker；
- 两条 focused browser assertion；
- 完整 R-Final run `32024088172`；
- Mobile 22/22；
- 跨端 1/1；
- PC 6/6；
- F004 Pending 项继续冻结。

RF02 的评审提交 `9b65d3b145d592798aba6952c14c68626021afcb` 只修改评审文档，没有为了拿 PASS 改产品实现。

因此：**RF02 的评审方法与当时结论没有问题。**

---

## 3. 当前 dev 已出现 post-PASS regression

RF02 评审提交之后，`dev` 又增加了一个产品提交：

```text
9b65d3b145d592798aba6952c14c68626021afcb
→ 69811c0413b2d3ebaeb650d7cc1bc5daefcd880d
```

该提交修改了：

- `apps/mobile/src/components/Carousel.tsx`
- `apps/mobile/src/components/MobileFilter.tsx`
- `apps/mobile/src/components/README.md`
- `apps/mobile/src/features/public-platform/PublicPlatform.tsx`
- `apps/mobile/src/main.tsx`

它没有改 RF01 的 `SupportPages.tsx` / `registry.ts` 语义收口内容。

### 当前 R-Final 真实结果

`R-Final Full Regression`：

- run：`32024583589`
- job：`95371188575`
- checkout：`69811c0413b2d3ebaeb650d7cc1bc5daefcd880d`
- conclusion：`failure`

Route audit、Mobile typecheck 与 production build 仍 PASS。

Mobile browser 实际：

```text
21 passed
1 failed
```

失败用例：

```text
B registration handoff carries context and callbacks share one competition identity
```

具体断点：

```text
pending callback 已显示成功
→ callback("rejected")
→ 预期“报名审核未通过”
→ 5s 内未出现
```

失败后 cross-app 与 PC 阶段被 workflow 跳过，因此当前 HEAD 没有一份完整全绿的 R-Final 证据。

### RF01 没有回归

同一个失败 run 中：

- `R-Final GrowthScore no longer reuses learning-point semantics`：PASS
- `R-Final account bindings no longer masquerade as third-party business accounts`：PASS

所以本问题**不得退回 RF01**。

---

## 4. 当前最终状态

### RF01

**PASS，可关闭。**

### RF02

RF02 作为一次独立复审已经正确完成；但最终验收是针对代码基线的，不是永久勋章。

因此应区分：

- `352a6ab...` / RF02 当时基线：**R-Final PASS**；
- 当前 `69811c0...`：**R-Final REOPENED / CHANGES REQUIRED**。

### 当前唯一需要处理的新阻断

只调查 RF02 之后 `69811c0...` 引入的报名母动线 B 回归：

```text
pending → rejected callback
```

先确认是产品状态更新回归还是 Router / 测试交互方式与新实现不兼容，再做窄修。

禁止顺手：

- 重做 F00 报名架构；
- 修改 RF01 两处语义；
- 重开 F01/F02/F03；
- 恢复任何 F004 Pending 业务。

修复后重新执行完整 `R-Final Full Regression`。只有当前最新 `dev` 的 Mobile + cross-app + PC 全部重新 success，才能再次把当前分支标为最终 PASS。

# Com Design Consumer Baseline

> 作用：为独立原型仓库保留旧重构时已经确认的 Com Design Core 使用基线。  
> 注意：这里是 consumer 摘要，不是 Com Design Core 的替代真相源。

---

## 1. 来源版本

旧来源仓库：

```text
dangjingtao/com-design
```

关键来源：

```text
design.md
design-source/README.md
design-source/components/index.json
design-source/colors_and_type.css
```

旧重构读取到：

```text
library: com-design
version: 1.0.0-rc.2
productType: company-mobile-core
kitType: mobile
```

如果独立仓库后续使用了新的 Com Design 版本，应更新本文并记录来源 SHA / tag。

---

## 2. 设计原则

旧 Core 的产品语气：

```text
Modern / Clear / Light / Efficient
```

核心原则：

- mobile first；
- compact-first；
- flat-first；
- 信息层级优先于装饰；
- ordinary Card 不默认使用重阴影；
- Section 优先于“所有东西都塞 Card”；
- Product extension 不修改 Core；
- Accent Cyan 用于局部强调 / 数据 / 进度，不默认代替 Brand Indigo 做主导航 active。

---

## 3. 核心颜色

### Brand

```text
Electric Indigo
#5B5EF7
```

### Accent

```text
Cyan
#16BFD3
```

用途建议：

- Brand：主动作、active navigation、品牌识别；
- Accent：局部数据、状态、进度、辅助强调；
- Neutral：主要页面结构与表面层级。

不要把“科技感”理解成全页面高饱和渐变。

---

## 4. Typography

旧 Core semantic typography 范围约：

```text
12 / 14 / 16 / 18 / 20 / 24 / 28 px
```

常用语义：

- caption；
- label-small；
- body-small；
- label；
- body；
- heading-small；
- heading；
- title；
- display。

避免旧原型式随手出现 8 / 10 / 15 / 17 px 等任意字号。

字体：系统字体栈，不为原型引入额外字体依赖。

---

## 5. Spacing

4px grid 为主：

```text
0 / 2 / 4 / 6 / 8 / 12 / 16 / 20 / 24 / 32
```

关键习惯：

- 页面 edge inset 16px；
- section gap 优先统一；
- 控件内部 padding 不随页面任意变化；
- 不为了“塞更多内容”把触控区域压得过小。

---

## 6. Radius

推荐语义：

```text
control: 8px
container: 12px
overlay: 16px
pill: full
```

不要每张业务卡自己发明 10 / 14 / 18 / 22px 等一次性 radius。

---

## 7. Touch target

视觉控件可以是 compact 40px，但触控目标需要尊重平台：

```text
iOS: ~44pt
Android: ~48dp
```

移动端图标按钮、列表动作、筛选标签都需要检查真实可点区域，而不只是图标尺寸。

---

## 8. Elevation

Core 只保留很克制的 elevation 层级：

- floating；
- modal。

普通 Card 默认 flat / border / surface hierarchy。

不要把旧 Mockplus 的大量阴影直接迁入。

---

## 9. Core 33 components

### Actions & Forms（8）

1. Button
2. Icon Button
3. Input
4. Textarea
5. Select
6. Checkbox
7. Radio
8. Switch

### Navigation & Information（11）

9. List Item
10. Tabs
11. Segmented Control
12. Top App Bar
13. Bottom Navigation
14. Section
15. Divider
16. Card
17. Tag
18. Badge
19. Avatar

### Feedback / Overlay / Progress（11）

20. Toast
21. Snackbar
22. Alert
23. Dialog
24. Bottom Sheet
25. Loading Indicator
26. Skeleton
27. Empty State
28. Progress Indicator
29. Stepper
30. Timeline

### Search & Menu（3）

31. Search Field
32. Menu
33. Menu Item

产品 Pattern 可以由这些 Core 组合出来，例如：

- Competition Card；
- Opportunity Card；
- Fact Card；
- Workspace Next Step；
- Account Required；
- Competition Access Gate；
- Benefit Source Line。

这些属于产品层，不应倒灌成 Core 组件。

---

## 10. 当前原型特别要守的视觉层级

### 首页

第一层必须让“参赛 + 就业 / 实习”比课程、权益、学力值、任务更强。

### 赛事 workspace

首页最强信息不是功能图标，而是：

- 当前赛事；
- 当前身份；
- 当前团队 / 项目；
- 下一步动作。

### 创赛工坊

“下一步任务”比技能矩阵视觉炫技更重要。

### 我的 / 长期资产

强调事实关系与来源，而不是做成九宫格工具仓库。

---

## 11. Product Extension 规则

允许：

- 赛事状态组合 Pattern；
- Opportunity / Enterprise resource relation；
- Task Runtime；
- Fact / Trust；
- Resume trusted fact selection；
- Benefit eligibility；
- DecisionBlocked。

禁止：

- 修改 Core token 只是为了某个业务页；
- 新建另一套近似 Button / Card / Input；
- 页面自己写 hard-coded 色值替代 semantic token；
- 为 140 页复制 140 套布局。

---

## 12. 已知 Core defect：reduced-motion CSS

旧来源 `design-source/colors_and_type.css` 存在两处非法 CSS 结构：selector 与：

```css
@media (prefers-reduced-motion: reduce)
```

组合错误。

旧真实 Vite build 会出现：

```text
Unexpected "@media" [css-syntax-error]
```

历史 R05 判断：

- 不阻断核心产业学院原型 build；
- 但 reduced-motion 规则可能不能按预期生效；
- 应由 Com Design Core 修复，而不是产品 consumer 静默篡改。

如果新仓库直接带入旧 CSS snapshot，必须保留这个已知问题，直到源版本更新。

---

## 13. 独立仓库的建议

长期可选两种方式：

### A. 固定 snapshot

把当前经过确认的 consumer token / CSS snapshot 放入新仓库，并记录：

- source repo；
- source branch / tag / SHA；
- snapshot date。

优点：原型稳定、无需依赖外部仓库。

### B. 生成式同步

从 Com Design source 生成 consumer artifact，再由新仓库更新。

优点：设计系统升级可追踪。

无论哪种，都不要让业务页面直接依赖“某个开发者机器上的 `/Users/tao/com-design/...` 路径”。

# 来源索引与可追溯性

> 目标：后续如果对某个产品判断有疑问，可以沿着本文件回到原始来源，而不是只相信二手总结。

---

## 1. 当前目标仓库

Repository:

```text
https://github.com/dangjingtao/core-industry-college-prototype
```

当前集成分支：

```text
dev
```

目录：

```text
apps/mobile   手机端
apps/pc       PC 端
packages/shared
```

当前仓库文档应逐步成为后续施工线程的第一入口。

---

## 2. 原始 Mockplus 真相源

Google Drive：

```text
https://drive.google.com/file/d/1oLnDM4i4pWowoz5cXvV_hyxpyXXz587q/view?usp=drivesdk
```

Metadata:

```text
name: 核心产业学院-mockplus-offline.zip
fileId: 1oLnDM4i4pWowoz5cXvV_hyxpyXXz587q
mime: application/zip
size: 58,024,433 bytes
sha256: 28ac5a710283ec402a8d24822a1bea84ae6aaeee11fefdcd0a220db1557bf03b
files: 470
page JS: 140
entry: index.html
```

用途：

- 判断旧页面 / 字段 / 按钮是否真实存在；
- 对页面合并后的 feature coverage 做最终追溯；
- 不用于直接复制旧 IA。

---

## 3. 旧 GitHub 来源仓库

Repository:

```text
https://github.com/dangjingtao/com-design
```

重构分支：

```text
core-industry-college-refactor
```

旧可交互原型目录：

```text
prototype/core-industry-college/
```

旧原包登记文件：

```text
design-source/core-industry-academy/README.md
```

登记原包的历史提交：

```text
6871847c579962926d9d978deddb789a065906d8
```

旧 refactor 分支同步原包信息提交：

```text
f9a0ef12f98743c150941c7d785ac124c18b597b
```

---

## 4. 业务背景与产品评审来源

旧仓库路径：

```text
report/product-reviews/2026-08-15-product-background-interview.md
report/product-reviews/2026-08-15-commercial-loop-addendum.md
report/product-reviews/2026-08-15-school-operations-addendum.md
report/product-reviews/2026-08-15-core-industry-college-prototype-review.md
report/product-reviews/2026-08-17-formal-prototype-review.md
```

这些资料分别回答：

- 产品到底是不是三创赛 App；
- 学生最重要的任务；
- 公共平台与赛事空间；
- 企业为什么投入资源；
- 企业如何自然发现人才；
- 学校老师和运营企业如何协作；
- 为什么老师不进入学生 App；
- 权益 / 课程 / 创赛工坊 / 画像的真实边界；
- 正式原型重构的 P0 / P1 / P2 问题。

本仓库 `docs/product/00-product-master-context.md` 已将其中仍有效的结论做了整合，但如果需要追溯措辞或上下文，应回原文查看。

---

## 5. 旧重构施工文档

关键路径：

```text
report/core-industry-college-refactor/00-master-outline.md
report/core-industry-college-refactor/T0-construction-preflight.md
report/core-industry-college-refactor/01-t01-page-map-routing-baseline.md
report/core-industry-college-refactor/01-t01-old-new-map.tsv
report/core-industry-college-refactor/02-r01-review.md
report/core-industry-college-refactor/03-t02-public-platform-implementation.md
report/core-industry-college-refactor/04-r02-review.md
report/core-industry-college-refactor/05-t03-competition-workshop-implementation.md
report/core-industry-college-refactor/06-r03-review.md
report/core-industry-college-refactor/07-t04-long-term-assets-implementation.md
report/core-industry-college-refactor/08-r04-review.md
report/core-industry-college-refactor/09-t04-r04-fixes.md
report/core-industry-college-refactor/10-task-cards.md
report/core-industry-college-refactor/20-review-cards.md
report/core-industry-college-refactor/11-t05-full-regression-implementation.md
report/core-industry-college-refactor/12-r05-review.md
```

本仓库保留了一份完整 140 页映射：

```text
docs/reference/legacy-page-map.tsv
```

---

## 6. 旧最终代码 / CI 证据

旧 T05 产品代码 HEAD：

```text
c1ef3a8b0b1ef13d025cbf23dfd596a0bb5b00cd
```

其中一个重要测试提交：

```text
c1ef3a8b0b1ef13d025cbf23dfd596a0bb5b00cd
test(t05): cover list return state and competition benefit context
```

旧 R05 review commit：

```text
31c7badbf3a890ad07d3fe8b1bbcefda92f50f47
```

GitHub Actions：

```text
31992490414
```

历史最终结果：

```text
Route registry: 66
App declarations: 69
Missing registry routes: 0
RouteProbe: no
Explicit 404: yes
Build: PASS
Chromium: 7/7 PASS
```

用途：验证迁移来源曾经真实工作过。

不能用它替代新仓库迁移后的重新验证。

---

## 7. Com Design 来源

旧设计系统来源仍在 `dangjingtao/com-design`。

关键文件：

```text
design.md
design-source/README.md
design-source/components/index.json
design-source/colors_and_type.css
```

旧重构时读取到的 Core：

```text
library: com-design
version: 1.0.0-rc.2
productType: company-mobile-core
kitType: mobile
core components: 33
```

本仓库参考摘要：

```text
docs/reference/com-design-baseline.md
```

---

## 8. 设计系统已知缺陷来源

旧 R05 真实 Vite build 会出现两条 CSS minifier warning：

```text
Unexpected "@media" [css-syntax-error]
```

定位在旧 Core `design-source/colors_and_type.css` reduced-motion 规则：selector 与：

```css
@media (prefers-reduced-motion: reduce)
```

被非法组合。

这是 Com Design Core 缺陷，不是核心产业学院产品线程应偷偷修的 consumer 逻辑。

迁入独立仓库时，如果带入该 CSS snapshot，应记录来源并单独处理，不要丢失这个已知问题。

---

## 9. 重要历史产品讨论（非正式 PRD，但可能帮助后续决策）

### 创域 / 本地活动

曾讨论把“商城/福利”扩展为更具品牌感和本地运营能力的“创域”，包含：

- 课程 / 打车 / 视频会员 / 外卖等权益；
- 青年线下活动；
- 学校 / 社团 / 企业参与运营；
- 扫码领取 / 核销；
- 本地化内容；
- App / 小程序同构。

未形成正式 IA，当前只作为后续线下运营能力参考。

### 赛友风采

方向：

- 不做论坛；
- 做精品模块；
- 历史内容可来自投稿 / 公众号；
- 明确内容来源和外部原文。

### 用户画像

业务愿望很大，但当前技术现实是：

- 注册；
- 报名；
- 问卷；
- 创赛工坊任务/问卷；

比“高级自动画像系统”更可靠。

### 企业人才发现

当前自然信号是比赛成绩和真实项目表现，不建议建立学生不可见的 AI 人才评分。

---

## 10. 使用来源时的规则

### 判断“旧功能有没有”

优先看 Google Drive Mockplus 原包。

### 判断“应该放哪、为什么”

优先看业务访谈 + 正式评审 + 本仓库 master context。

### 判断“旧实现怎么做过”

看旧 refactor 代码 + T/R review。

### 判断“当前新仓库是否已经完成”

只看新仓库实际代码和新仓库自己的 build / E2E 证据。

### 判断视觉 / 组件

看 Com Design，不从旧 Mockplus 的视觉细节反推今天的设计系统规则。

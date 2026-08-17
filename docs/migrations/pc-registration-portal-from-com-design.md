# 电脑端报名系统迁移记录

## 来源

- 来源仓库：`https://github.com/dangjingtao/com-design`
- 来源分支：`core-industry-college-registration-portal`
- 来源提交：`1bf3a38bcbd2c822d3248916ddbf8aeea903c547`
- 来源目录：`prototype/core-industry-college/src/registration-portal`
- 迁入目录：`apps/pc`
- 迁移日期：2026-08-17

## 已迁入范围

- PC 优先、窄屏兼容的独立报名门户 `/registration-portal/*`。
- 队长与队员注册分支、赛事规则答题、团队信息、成员绑定和学校审核。
- 承诺书、报名完成、团队业绩报告、证书下载和报名截止状态。
- 原型场景切换器，以及桌面队长流程和窄屏队员流程的 Playwright 回归。

## 规范化调整

- 根路径与未知路径统一进入 `/registration-portal/start`。
- 只迁入报名门户依赖的状态模型和三个基础 UI 组件，不复制手机端公共平台、赛事工作台或创赛工坊。
- 复用当前仓库内已修正的 Com Design Mobile 语义令牌，并在 `apps/pc` 内保持独立构建依赖。
- 将状态图标统一改为 `lucide-react`，保留文字品牌标识。
- Playwright 使用独立端口 `4174`，避免与手机端回归冲突。
- 保留 `apps/pc/public/_redirects`，支持 Cloudflare Pages 深层路由刷新。

## 未迁入范围

- `com-design` 同一原型中的手机端公共平台、赛事工作区、创赛工坊和长期资产页面。
- `com-design` 根目录的设计系统工具、Penpot 数据、报告和其他项目。
- 电脑端除三创赛报名系统以外的业务模块。

## 验证命令

```bash
npm run verify:pc
npm run verify:browser:pc
```

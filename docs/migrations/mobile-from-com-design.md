# 手机端原型迁移记录

## 来源

- 来源仓库：`https://github.com/dangjingtao/com-design`
- 来源分支：`core-industry-college-refactor`
- 来源提交：`31c7badbf3a890ad07d3fe8b1bbcefda92f50f47`
- 来源目录：`prototype/core-industry-college`
- 迁入目录：`apps/mobile`
- 迁移日期：2026-08-17

## 已迁入范围

- 66 条语义路由及显式 404 页面。
- 公共平台、赛事工作台、创赛工坊、长期资产和平台支撑页面。
- 页面状态、赛事身份、任务运行、课程、权益和简历等原型状态模型。
- 路由静态审计脚本与 Playwright 母动线回归。
- 原型使用的 Com Design Mobile 设计令牌。

## 规范化调整

- 保留 monorepo 的 `@core/mobile` workspace 包名及根级运行入口。
- 将来源仓库根目录的设计令牌复制为 `apps/mobile/src/design-tokens.css`，消除跨仓库相对路径依赖。
- 修正来源设计令牌中 reduced-motion 的非法 CSS 选择器结构。
- 保留 `apps/mobile/public/_redirects`，支持 Cloudflare Pages 的 SPA 深层路由回退。
- 将路由审计、类型检查、构建和浏览器回归接入 workspace 脚本。

## 未迁入范围

- `com-design` 根目录的设计系统生成工具、Penpot 数据、报告和其他产品原型。
- 电脑端参考原型；`apps/pc` 仍是独立脚手架。
- 来源仓库的 Git 历史；本文件记录可追溯基线。

## 验证命令

```bash
npm run verify:mobile
npm run verify:browser:mobile
```

浏览器回归使用 390×844 Chromium，覆盖五条母动线和未知路由 404。

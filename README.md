# 产业核心学院原型

本仓库用于维护“产业核心学院”的可交互产品原型，计划同时覆盖：

- 手机端原型
- 电脑端原型

## 当前状态

- 双端基础脚手架已经建立，具体业务页面与原型资产尚待迁入和整理。
- 电脑端已有原型可作为后续迁移与整合的参考：`/Users/tao/com-design/prototype/core-industry-college`。
- 手机端计划迁移到本仓库，但目前仍在旧 GitHub 项目中开发；在迁移完成并验证前，旧项目仍是手机端在建版本的事实来源。

## 参考实现

现有电脑端参考原型采用 React、TypeScript、Vite、React Router 和 Tailwind CSS，包含公共平台、赛事工作台等交互页面。

参考目录仅用于了解现有设计与实现，不代表其中内容已经迁入本仓库。

## 技术栈

- React 18
- TypeScript 5
- Vite 5
- React Router 6
- Tailwind CSS 3
- Lucide React
- npm workspaces

## 目录结构

```text
.
├── apps/
│   ├── pc/          # 电脑端原型
│   └── mobile/      # 手机端原型
├── packages/
│   └── shared/      # 两端共享的类型、常量与后续公共能力
├── AGENTS.md
└── package.json
```

## 本地运行

```bash
npm install
npm run dev:pc
npm run dev:mobile
```

分别构建或一次构建全部工作区：

```bash
npm run build:pc
npm run build:mobile
npm run build
```

## Cloudflare 部署预留

两个应用均可作为独立静态 SPA 部署到 Cloudflare Pages，并已通过 `_redirects` 为前端路由提供回退。

| 应用 | 构建命令 | 输出目录 |
| --- | --- | --- |
| 电脑端 | `npm run build:pc` | `apps/pc/dist` |
| 手机端 | `npm run build:mobile` | `apps/mobile/dist` |

正式接入 Cloudflare 时，建议分别创建 PC、手机两个 Pages 项目，独立设置域名、预览环境和发布节奏。当前仅完成部署兼容准备，尚未创建或发布任何 Cloudflare 项目。

详细配置与首次上线确认项见 [docs/cloudflare-deployment.md](./docs/cloudflare-deployment.md)。

## 后续迁移前需确认

- 手机端与电脑端是否独立构建、独立部署
- 两端可复用的设计令牌、组件、模拟数据和业务模型
- 旧项目迁移范围、迁移顺序及验收标准

## 协作说明

项目协作约定见 [AGENTS.md](./AGENTS.md)。

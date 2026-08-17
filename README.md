# 产业核心学院原型

本仓库用于维护“产业核心学院”的可交互产品原型，计划同时覆盖：

- 手机端原型
- 电脑端原型

## 当前状态

- 手机端已从 `dangjingtao/com-design` 的 `core-industry-college-refactor` 分支迁入可交互原型；电脑端仍为基础脚手架。
- 电脑端已有原型可作为后续迁移与整合的参考：`/Users/tao/com-design/prototype/core-industry-college`。
- 手机端迁移基线、范围与验证记录见 [`docs/migrations/mobile-from-com-design.md`](./docs/migrations/mobile-from-com-design.md)。

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
npm run verify:mobile
```

## Cloudflare 部署预留

两个应用均可作为独立静态 SPA 部署到 Cloudflare Pages，并已通过 `_redirects` 为前端路由提供回退。

| 应用 | 构建命令 | 输出目录 |
| --- | --- | --- |
| 电脑端 | `npm run build:pc` | `apps/pc/dist` |
| 手机端 | `npm run build:mobile` | `apps/mobile/dist` |

已分别创建 PC、手机两个 Cloudflare Pages 项目，当前稳定地址为：

- PC：<https://core-industry-college-pc.pages.dev>
- 手机：<https://core-industry-college-mobile.pages.dev>

`dev` 预览地址：

- PC：<https://dev.core-industry-college-pc.pages.dev>
- 手机：<https://dev.core-industry-college-mobile.pages.dev>

两个项目均以 `prod` 为生产分支。当前采用 Wrangler 直接部署，尚未连接 GitHub 自动构建。

详细配置与首次上线确认项见 [docs/cloudflare-deployment.md](./docs/cloudflare-deployment.md)。

## 后续工作

- 电脑端业务页面仍需从参考实现迁移并独立验收。
- 手机端后续变化需要明确来源分支和提交，持续维护迁移记录。
- 两端仅在确认语义和交互一致时再把能力提取到 `packages/shared`。

## 协作说明

项目协作约定见 [AGENTS.md](./AGENTS.md)。

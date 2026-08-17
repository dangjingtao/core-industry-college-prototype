# 产业核心学院原型

本仓库用于维护“产业核心学院”的可交互产品原型，计划同时覆盖：

- 手机端原型
- 电脑端原型

## 当前状态

- 本仓库已经建立双端 npm workspaces 脚手架、Cloudflare Pages 预览与根级 lockfile。
- 手机端正在从 `dangjingtao/com-design` 的 `core-industry-college-refactor` 分支迁入本仓库 `dev`；**文档落库时 `apps/mobile/src/App.tsx` 仍是迁移占位实现，不能把旧仓库 R05 PASS 自动视为本仓库已经迁移完成。**
- 电脑端目前仍以基础脚手架和参考实现为主，后续独立迁移、设计与验收。
- 手机端迁移来源、范围与完成标准见 [`docs/migrations/mobile-from-com-design.md`](./docs/migrations/mobile-from-com-design.md)。

## 先读项目文档

本项目的产品背景、旧原型审计、历史评审、未决事项与来源索引已经集中到 [`docs/README.md`](./docs/README.md)。

施工前建议至少阅读：

1. [`docs/product/00-product-master-context.md`](./docs/product/00-product-master-context.md) — 产品定位、业务角色、五条母动线、账号/赛事/长期资产边界。
2. [`docs/product/01-legacy-mockplus-audit.md`](./docs/product/01-legacy-mockplus-audit.md) — 直接检查 Google Drive 原始 Mockplus 后确认的功能缺口。
3. [`docs/product/02-open-decisions-and-backlog.md`](./docs/product/02-open-decisions-and-backlog.md) — 可直接补回、需产品确认、明确冻结的事项。
4. [`docs/reference/legacy-page-map.tsv`](./docs/reference/legacy-page-map.tsv) — 旧 140 页逐页去向表。

特别注意：

> **66/66 路由覆盖只能证明“门都在”，不能证明旧原型“屋里的功能一件没少”。**

Google Drive 原始包复核已经发现 onboarding/问卷、企业工商信息、扫码/文件验真、第三方账号语义、团队维护、退出登录等能力在旧重构中存在缩水或业务语义替换，详见审计文档。

## 产品主轴

当前产品不是单一“三创赛 App”，而是面向创新创业学生的长期平台。

学生侧第一层主轴：

- 参赛
- 就业 / 实习

赛事、课程、权益、企业、可信成果、创赛工坊等能力围绕这两条主线组织。

核心边界：

- App 账号长期存在；
- 一个账号可关联多个赛事身份；
- 赛事身份与权限随赛事生命周期变化；
- 赛事结束后，经历、成绩、证书和学习成果继续留在长期账号；
- 创赛工坊是具体赛事上下文中的陪跑能力，不是全局 AI 工具箱。

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
│   └── shared/      # 两端确认适合复用的类型、常量与公共能力
├── docs/            # 产品真相源、迁移、审计、历史证据与来源索引
├── AGENTS.md
└── package.json
```

## 本地运行

```bash
npm ci
npm run dev:pc
npm run dev:mobile
```

分别构建或一次构建全部工作区：

```bash
npm run build:pc
npm run build:mobile
npm run build
npm run typecheck
```

手机端完成业务迁移后，还需要恢复/补齐 route audit 与 Playwright 母动线验证；旧仓库的验证结果只作为迁移来源证据。

## Cloudflare 部署预留

两个应用均可作为独立静态 SPA 部署到 Cloudflare Pages，并已通过 `_redirects` 为前端路由提供回退。

| 应用 | 构建命令 | 输出目录 |
| --- | --- | --- |
| 电脑端 | `npm run build:pc` | `apps/pc/dist` |
| 手机端 | `npm run build:mobile` | `apps/mobile/dist` |

稳定地址：

- PC：<https://core-industry-college-pc.pages.dev>
- 手机：<https://core-industry-college-mobile.pages.dev>

`dev` 预览地址：

- PC：<https://dev.core-industry-college-pc.pages.dev>
- 手机：<https://dev.core-industry-college-mobile.pages.dev>

两个项目均以 `prod` 为生产分支。当前采用 Wrangler 直接部署，尚未连接 GitHub 自动构建。

详细配置见 [docs/cloudflare-deployment.md](./docs/cloudflare-deployment.md)。

## 迁移与验收原则

手机端迁移不能只看文件是否复制成功。

完成定义至少包括：

- 旧 66 semantic route 等价承接；
- 公共平台、赛事 workspace、创赛工坊、长期资产和 support 页面真实迁入；
- session / identities / lifecycle / applications 等共享状态不产生第二真相源；
- clean install + typecheck + build PASS；
- 五条母动线重新在本仓库真实浏览器验证；
- explicit 404 / dead-link；
- `docs/product/01-legacy-mockplus-audit.md` 的 P0/P1 缺口有明确状态。

## 协作说明

项目协作约定见 [AGENTS.md](./AGENTS.md)。

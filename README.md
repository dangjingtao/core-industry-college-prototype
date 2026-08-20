# 产业核心学院原型

本仓库用于维护“产业核心学院”的可交互产品原型，计划同时覆盖：

- 手机端原型
- 电脑端原型

## 当前状态

- 本仓库已建立双端 npm workspaces、Cloudflare Pages 预览与根级 lockfile。
- 手机端可交互原型已迁入 `apps/mobile`，并在本仓库重新通过路由审计、生产构建和 Chromium 7/7 回归。
- 电脑端保留独立三创赛响应式报名门户 `/registration-portal/*`，并新增 `/admin/*` 管理数据骨架；当前管理端先定义赛事、主体、资源、学生身份、资产、内容活动、创赛工坊等数据责任边界，不把骨架冒充完整后台。
- 手机端迁移记录见 [`docs/migrations/mobile-from-com-design.md`](./docs/migrations/mobile-from-com-design.md)。
- PC 报名系统迁移记录见 [`docs/migrations/pc-registration-portal-from-com-design.md`](./docs/migrations/pc-registration-portal-from-com-design.md)。
- PC 管理数据骨架见 [`docs/product/03-pc-admin-data-skeleton.md`](./docs/product/03-pc-admin-data-skeleton.md)。

## 先读项目文档

本项目的产品背景、旧原型审计、历史评审、未决事项与来源索引已经集中到 [`docs/README.md`](./docs/README.md)。

施工前建议至少阅读：

1. [`docs/product/00-product-master-context.md`](./docs/product/00-product-master-context.md) — 产品定位、业务角色、五条母动线、账号/赛事/长期资产边界。
2. [`docs/product/01-legacy-mockplus-audit.md`](./docs/product/01-legacy-mockplus-audit.md) — 直接检查 Google Drive 原始 Mockplus 后确认的功能缺口。
3. [`docs/product/02-open-decisions-and-backlog.md`](./docs/product/02-open-decisions-and-backlog.md) — 可直接补回、需产品确认、明确冻结的事项。
4. [`docs/product/03-pc-admin-data-skeleton.md`](./docs/product/03-pc-admin-data-skeleton.md) — PC 管理端的数据域、写入责任、关系与手机消费边界。
5. [`docs/reference/legacy-page-map.tsv`](./docs/reference/legacy-page-map.tsv) — 旧 140 页逐页去向表。

特别注意：

> **66/66 路由覆盖只能证明“门都在”，不能证明旧原型“屋里的功能一件没少”。**

Google Drive 原始包复核已经发现 onboarding/问卷、企业工商信息、扫码/文件验真、第三方账号语义、团队维护、退出登录等能力在旧重构中存在缩水或业务语义替换，详见审计文档。

## 产品主轴

当前产品不是单一“三创赛 App”，而是面向创新创业学生的长期平台。

学生侧第一层主轴：

- 参赛
- 就业 / 实习

赛事、课程、权益、企业、可信空间、创赛工坊等能力围绕这两条主线组织。

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

PC 本地入口：

- 管理数据骨架：`/admin`
- 三创赛报名门户：`/registration-portal/start`

## 环境变量

PC 与手机端分别使用各自目录下的 Vite 环境文件：

| 环境 | PC | 手机端 |
| --- | --- | --- |
| 本地开发 / `dev` 预览 | `apps/pc/.env.development` | `apps/mobile/.env.development` |
| `prod` 生产构建 | `apps/pc/.env.production` | `apps/mobile/.env.production` |
| 配置模板 | `apps/pc/.env.example` | `apps/mobile/.env.example` |

当前公开变量包括应用名称、端类型、环境、站点地址和预留的 API 地址。所有 `VITE_*` 变量都会进入浏览器构建产物，不能填写 Token、密码或私钥。本地私密覆盖使用 `.env.local` 或 `.env.*.local`，这类文件已被 Git 忽略；Cloudflare 凭据继续通过 GitHub Actions Secrets 管理。

分别构建或一次构建全部工作区：

```bash
npm run build:pc
npm run build:mobile
npm run build
npm run typecheck
npm run verify:mobile
npm run verify:browser:mobile
npm run verify:pc
npm run verify:browser:pc
```

路由、构建和浏览器回归已经恢复；旧 Mockplus 功能完整性与仍待产品确认的差异继续以审计和 backlog 为准。

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

两个项目均以 `prod` 为生产分支。当前采用 Wrangler Direct Upload，并由 GitHub Actions 自动构建和部署。

详细配置见 [docs/cloudflare-deployment.md](./docs/cloudflare-deployment.md)。

## 迁移与验收原则

手机端迁移不能只看文件是否复制成功。

当前代码、路由与母动线迁移已经完成，但 legacy audit 中未关闭的 P0/P1 差异仍需继续处理，不能因构建通过而视为产品功能全部验收。

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

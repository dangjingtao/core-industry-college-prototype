# Cloudflare Pages 部署

本仓库使用 Monorepo，电脑端和手机端应分别创建一个 Cloudflare Pages 项目，并连接同一个 GitHub 仓库。

## 分支策略

- `prod`：两个 Pages 项目的生产分支。
- `dev`：预览分支，用于集成验证。
- 其他功能分支：按需生成预览部署，不直接影响生产环境。

## 电脑端 Pages 项目

| 配置项 | 值 |
| --- | --- |
| Root directory | `/`（仓库根目录） |
| Build command | `npm run build:pc` |
| Build output directory | `apps/pc/dist` |
| Production branch | `prod` |

建议项目名：`core-industry-college-pc`。

## 手机端 Pages 项目

| 配置项 | 值 |
| --- | --- |
| Root directory | `/`（仓库根目录） |
| Build command | `npm run build:mobile` |
| Build output directory | `apps/mobile/dist` |
| Production branch | `prod` |

建议项目名：`core-industry-college-mobile`。

## Monorepo 构建监听

为了避免任一端修改都触发两个项目构建，可在 Cloudflare Pages 中设置构建监听路径：

- PC 包含：`apps/pc/*`、`packages/shared/*`、根目录依赖和配置文件。
- 手机端包含：`apps/mobile/*`、`packages/shared/*`、根目录依赖和配置文件。

具体监听规则在首次成功部署后再收紧，避免初期遗漏共享依赖变更。

## SPA 路由

两端的 `public/_redirects` 均包含：

```text
/* /index.html 200
```

Vite 构建时会将该文件复制到 `dist`，用于 Cloudflare Pages 的客户端路由回退。新增深层路由后，应验证直接访问和刷新不会返回 404。

## 首次部署前需要确认

1. 使用哪个 Cloudflare 账号或团队空间。
2. 是否采用建议的两个 Pages 项目名。
3. PC 和手机端各自绑定什么正式域名；没有域名时可先使用 `pages.dev` 地址。
4. 是否确认 `prod` 为生产分支、`dev` 为主要预览分支。
5. Cloudflare GitHub App 是否获准访问 `dangjingtao/core-industry-college-prototype`。

## 当前完成边界

已完成：

- 创建 `core-industry-college-pc` 与 `core-industry-college-mobile` 两个 Pages 项目。
- 两个项目均将 `prod` 设为生产分支。
- 从提交 `ca092ae` 完成首次生产部署。
- 验证稳定域名首页和深层路由均返回 HTTP 200。

线上地址：

- PC：<https://core-industry-college-pc.pages.dev>
- 手机：<https://core-industry-college-mobile.pages.dev>

当前采用 Wrangler Direct Upload，Git Provider 显示为 `No`。尚未配置 GitHub 自动构建或自定义域名；后续可以继续使用 Wrangler 手动部署，或另行配置 GitHub Actions。

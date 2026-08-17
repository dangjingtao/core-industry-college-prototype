# AGENTS.md

## 项目定位

本仓库是“产业核心学院”的双端可交互原型项目，目标范围包括手机端和电脑端。

产品不是单一“三创赛 App”，而是面向创新创业学生的长期平台；学生侧第一层主轴是：

1. 参赛；
2. 就业 / 实习。

## 开工前必须阅读

任何涉及产品结构、手机端迁移、功能补齐或状态模型的线程，先读：

1. `docs/README.md`
2. `docs/product/00-product-master-context.md`
3. `docs/product/01-legacy-mockplus-audit.md`
4. `docs/product/02-open-decisions-and-backlog.md`
5. 与任务直接相关的 migration / reference 文档

不要只看当前页面代码就自行推导产品模型。

## 当前事实边界

- `dev` 是日常整合与验证分支；`prod` 是已验收版本分支。
- 本仓库已经有双端 npm workspaces 脚手架、根级 `package-lock.json` 和 Cloudflare Pages 预览配置。
- 手机端来源项目是 `dangjingtao/com-design` 的 `core-industry-college-refactor` 分支，旧可交互原型目录为 `prototype/core-industry-college/`。
- 文档落库时，本仓库 `apps/mobile/src/App.tsx` 仍是迁移占位实现；旧来源仓库的 R05 PASS 不能自动视为本仓库已经迁移完成。
- Google Drive 原始 Mockplus ZIP 是旧功能、字段、按钮和页面是否真实存在的历史真相源。
- PC 端与手机端可以共享业务语义，但不能为了复用而强行共用不适合的交互布局。

## 产品不可破坏原则

1. App 账号长期存在；赛事身份按赛事生命周期存在。
2. 一个账号可关联多个赛事身份。
3. 无赛事身份用户仍可正常使用公共平台。
4. 当前赛事上下文不等于账号只有一场赛事。
5. 三创赛是首个强入口，不得把平台写死成三创赛专属。
6. 赛事结束后，经历、成绩、证书、课程成果等长期资产继续存在。
7. 创赛工坊属于具体赛事上下文，不是全局 AI 工具箱。
8. 企业首先是赛事 / 权益 / 课程 / 活动 / 机会的资源与品牌主体，不只是招聘公司。
9. 学校老师属于 Web / 运营后台角色，不塞进学生 App。
10. 不构造对学生不透明的 AI 人才评分。
11. 允许合并页面，但旧功能不能无理由缩水。
12. 路由覆盖不是功能完整性的充分证明；涉及旧功能时必须查 `legacy Mockplus audit`。

## 共享状态约束

手机端迁移时优先保持旧重构已经验证过的状态边界。

### 长期账号 / Public Platform

唯一维护：

- session；
- identities[]；
- applications；
- followedCompanies；
- 公共列表视图状态。

### Competition / Workshop Runtime

唯一维护：

- competition lifecycle；
- workspace permission；
- taskRuns；
- workshop results；
- 赛事局部材料和 runtime。

不得再持有第二份 session / identities[]。

### Long-term Assets

维护：

- course learning records；
- benefits long-term records；
- certificates / results；
- profile；
- resume presentation。

通过稳定 ID 引用 competition / project / opportunity / company / result，不复制对象形成第二真相源。

## 明确禁止自行决定的业务

### D03 任务体系

平台任务、赛事任务、企业任务、权益任务、创赛工坊 Task Runtime 与学力值奖励之间的关系未定义。

在产品确认前：

- `/tasks` 继续 blocked；
- 不把旧日常/核心/企业任务直接抄回；
- 不把工坊 task 误当全局任务中心。

### D08 主体管理

旧原型存在学校/企业主体、标准代码、地区和扫码绑定，但真实业务关系未确认。

在产品确认前 `/me/subjects` 继续 blocked。

### 学力值经济模型

旧 Mockplus 的学力值是有余额、收入/消耗、任务奖励和课程兑换的积分；旧重构后来把它改成成长分数。

这属于业务模型冲突，施工线程不得自行选择恢复哪一种。

## 工作原则

1. 修改前先检查目标端、当前 branch HEAD、相关文档和现有实现。
2. 需求未说明手机端还是 PC 端，且从上下文无法确定时再询问；不要把两端修改混在一起。
3. 涉及旧手机端能力时，先查 `docs/reference/legacy-page-map.tsv` 和 `docs/product/01-legacy-mockplus-audit.md`。
4. 发现“页面已有但功能缺失”时，先记录功能差异，不以“路由已覆盖”结束审查。
5. 不修改 Com Design Core 来迁就业务页面；产品侧只做必要 Pattern / consumer 适配。
6. 不为原型引入不必要的后端、鉴权或大型状态框架。
7. 中保真优先结构、层级、状态、动线、可维护性，不为装饰牺牲产品清晰度。
8. 关键按钮不能是假按钮；外部系统尚未接通时可模拟 handoff，但要保留真实产品出口。
9. 无法真实 build / browser verify 时必须明确说明，不伪造通过。

## 手机端迁移验收

旧来源仓库曾通过 route audit、build 和 Chromium 7/7，但新仓库必须重新验证。

迁移完成至少要求：

- `apps/mobile` 不再是占位页；
- 旧 66 semantic route 等价承接；
- explicit 404；
- clean install / typecheck / build；
- 五条母动线浏览器回归；
- pending / rejected / ended / revoked / permissionDenied 等关键状态；
- `docs/product/01-legacy-mockplus-audit.md` 中 P0/P1 缺口有明确状态；
- README、迁移文档、评审证据同步更新。

## Git 约定

- `dev`：日常整合与验证。
- `prod`：经过验收的版本。
- 不把未验证的迁移直接标为 prod-ready。
- 多线程施工时先看 branch HEAD，避免以旧 commit 覆盖别人已合入的修改。
- 文档和代码如果并行修改同一路径，优先解决冲突后再提交，不强推覆盖。

## 技术与目录约定

- 使用 npm workspaces。
- PC：`apps/pc`。
- 手机：`apps/mobile`。
- 跨端共享：`packages/shared`，只放真正无端侧偏好的类型、常量和能力。
- React + TypeScript + Vite + React Router + Tailwind CSS。
- 图标统一使用 `lucide-react`；优先直接导入具体图标。
- 两端保持独立构建产物，支持分别部署 Cloudflare Pages。
- 新增客户端路由必须保留 SPA fallback，并验证深层刷新不 404。

## 文档维护

- 新产品决策：更新 `docs/product/`。
- 新旧原型功能差异：更新 `01-legacy-mockplus-audit.md` 与 backlog。
- 迁移来源 / SHA / 验证：更新 `docs/migrations/mobile-from-com-design.md`。
- build / E2E / CI 证据：更新 `docs/reference/history-and-review-evidence.md`。
- 设计系统来源变化：更新 `docs/reference/com-design-baseline.md`。

历史结论若被新决策覆盖，标记“已被后续决策覆盖”，不要无痕改写历史。

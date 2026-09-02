第一轮修正验证：

- Prototype Quality Gate run `33580165062`：mobile verify 与 T055–T058 leaderboard regression 均 **success**；
- Deploy Mobile run `33580165085`：preview build、F00 regression、Cloudflare dev deploy 均 **success**。

## 第二轮 UI Review：放开 token 硬限制，按高保真视觉重新实现

人工 Review 再次指出：第一轮虽然构图已经接近参考稿，但仍然被现有 design token 与普通业务组件语言压住，整体视觉仍显得保守，无法达到此前生成的高保真 UI 方向。

本轮明确调整约束：**排行榜详情页允许使用页面专属视觉值，不要求全部映射回全局 design token。**

最新实现重点：

1. Banner 使用排行榜专属紫蓝渐变、光效、轨道装饰和 Trophy / Orbit 视觉；
2. Top 1–3 变为完整领奖台卡片，而不只是头像排列；
3. Top 1 增加 Crown、金色 Avatar Ring、放射光、金色名次徽章和更强的垂直权重；
4. Top 2 / Top 3 分别采用银蓝 / 铜橙层级，形成明确的 1–2–3 差异；
5. 排行榜头像使用专属渐变与 Avatar Ring，不再依赖全局状态色头像；
6. 校园大使 / 推荐官在本页使用专属金色 / 紫色 Badge 表达，同时保留原有 `data-leaderboard-role` 语义与自动化可验证性；
7. 4–10 榜单改为更完整的浮层白卡、专属 header、柔和分隔和更高的行完成度；
8. 当前用户 Top 10 内本人态使用紫色描边、渐变底和专属阴影；
9. Top 10 外「我的排名」同样使用独立高亮卡；
10. Like 状态改为排行榜专属紫色交互反馈，但所有 T058 逻辑保持不变；
11. 页面背景、阴影、圆角和间距允许使用局部专属值，不要求回写为全局 token。

### 第二轮视觉重构提交

- `e571e0c` — `feat: rebuild leaderboard with freer premium visual system`
- `5dee97e` — `docs: allow dedicated visual language for T056 leaderboard`

### 第二轮验证

Prototype Quality Gate run `33581820080`：

- `Verify mobile routes, types and build` = **success**；
- `Run learning leaderboard regressions (soft gate)` = **success**，覆盖 T055–T058。

Deploy Mobile run `33581820083`：

- `Type-check and build mobile preview` = **success**；
- F00 cross-app browser regression = **success**；
- `Deploy mobile` = **success**。

## 第三轮：接入正式 WebP 排行榜物料

在第二轮高保真方向基础上，不再通过 CSS 模拟徽章 / 奖牌，而是将已确认的视觉物料转换为 WebP 后直接接入页面组成：

- `campus-ambassador.webp`：校园大使徽章；
- `recommender.webp`：推荐官徽章；
- `rank-1.webp`：第一名金冠奖牌；
- `rank-2.webp`：第二名银蓝奖牌；
- `rank-3.webp`：第三名铜金奖牌；
- `weekly-banner.webp`：蓝金周榜小 Banner。

页面保持头像、昵称、学校、学习时长、点赞等信息为真实 DOM；仅装饰性/身份类物料使用 WebP，不将榜单截图化。Top 3 使用真实奖牌 WebP，身份 Badge 使用真实徽章 WebP，顶部 Hero 使用真实周榜 Banner WebP，同时继续保留 T057/T058 所需的可访问语义、`data-leaderboard-role`、点赞状态和周周期交互。

## 当前视觉约束

排行榜详情页当前执行以下规则：

- 基础页面壳层、语义、可访问性与交互规则继续复用项目体系；
- 排行榜自身可以拥有独立色彩、渐变、光效、阴影、Avatar Ring、金银铜名次层级与自身高亮；
- 这些局部视觉值不要求晋升为全局 token；
- 视觉物料统一使用 WebP，避免原始 PNG 直接进入页面；
- 其它页面不自动继承本页视觉语言；
- 自动化通过只证明功能和结构未回归，最终视觉 PASS 仍由人工 Review 决定。

## 边界

仍不包含：

- 学习时长奖励（V1.0 不做）；
- 日榜、月榜、历史榜、好友榜；
- 生产级榜单后端与跨设备点赞同步；
- 把本页专属视觉升级为整个项目的全局设计系统。

## Review 建议

人工 Review 重点看：

1. 周榜 Banner 是否在手机宽度下仍有足够呼吸感，文案不与奖杯物料冲突；
2. Top 1 奖牌应成为视觉中心，但不能遮挡头像 / 姓名；
3. Top 2 / 3 奖牌与第一名之间应有层级而非同等重量；
4. 校园大使 / 推荐官长条徽章在 Top 3 与 4–10 紧凑榜单中的缩放是否清晰且不过载；
5. 4–10 表格与 Top 3 是否仍属于同一个视觉世界；
6. 当前用户高亮、点赞反馈与 WebP 物料是否互不抢焦点；
7. 若仍存在视觉差距，应继续按实际截图调整，不以自动化通过作为视觉 PASS 依据。
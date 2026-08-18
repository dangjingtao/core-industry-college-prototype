# 05｜可插拔模拟小游戏模块设计

> 状态：Direction Confirmed / 首期边界已确认  
> 适用范围：手机端优先，PC 端可复用协议与运营配置，不复用移动端布局。  
> 目标：说明“运营沙盒”一类小游戏如何作为可选能力接入产业核心学院，而不改变平台主轴、账号模型和赛事状态模型。

## 1. 结论

运营沙盒不进入平台一级导航，不成为全局任务或全局成长体系。首期被定义为一个由独立活动启用的 **Simulation Module（模拟模块）**：

```text
赛事 / 课程 / 活动（宿主）
    ↓ 决定是否启用、谁能进入、结果是否有效
模拟模块容器
    ↓ 提供统一的启动、暂停、完成和结果回传能力
具体小游戏
    ├─ 社区团购经营模拟
    ├─ 本地生活券运营模拟
    └─ 后续其它案例
```

没有活动启用时，用户不应在主平台看到该模块。模块可以被替换或下线，且不得影响报名、赛事身份、课程、就业投递和长期资产等主流程。

### 1.1 已确认的首期决策

| 事项 | 首期决定 |
|---|---|
| 承载方 | 独立活动，不挂入正式赛事或课程 |
| 使用模式 | `demo` |
| 数据保存 | 暂不保存游戏过程、成绩或长期资产 |
| 技术形态 | 独立 H5 |
| 接入架构 | 轻量 Micro Frontend 容器 |
| 首期关系 | 主平台负责入口和退出，H5 负责完整游戏体验 |
| 正式计分 | 不支持 |
| 产品定位 | 一次轻量、可退出、不影响主流程的互动体验 |

这里的 H5 是交付形态，Micro Frontend 是接入方式。首期推荐使用受控 iframe 加载独立 H5，并通过少量 `postMessage` 事件通信；不引入 Module Federation、qiankun 等复杂运行时。

## 2. 设计原则

### 2.1 宿主决定业务含义

小游戏只负责“进行一次模拟并返回结果”。以下事项由宿主平台决定：

- 谁可以进入；
- 入口放在哪场赛事、哪门课程或哪次活动；
- 是练习、课程作业还是正式赛事；
- 是否记录结果、允许重玩或计入成绩；
- 结束后回到哪里。

小游戏不能自行创建赛事身份、课程身份或长期账号。

### 2.2 不建立第二真相源

模块不得重复维护 session、`identities[]`、赛事生命周期、正式团队关系、长期证书成绩、全局任务或全局积分余额。首期只接收 `activityId` 和展示语言，不接收用户、赛事、团队或课程数据。

### 2.3 默认低权限、可关闭

- 每个模块默认关闭，由宿主配置显式启用；
- 不允许小游戏直接写入主平台任意数据；
- 只允许通过约定事件回传结果；
- 模块异常时，主平台仍可正常使用。

### 2.4 产品气质先于技术接入

可插拔只解决工程隔离，不代表任何小游戏都适合上线。每个模块仍需确认：

- 是否有明确承载场景；
- 是否符合专业、可信、克制的产品表达；
- 是否避免廉价签到、彩带、虚构等级等无业务意义刺激；
- 是否能解释玩家的选择和结果；
- 如果进入正式赛事，规则是否透明且可复核。

## 3. 使用模式

| 模式 | 用途 | 保存内容 | 可重玩 | 结果用途 |
|---|---|---|---|---|
| `demo` | 宣讲、开放日体验 | 可不保存 | 是 | 不进入个人记录 |
| `practice` | 赛事或课程练习 | 完成状态、复盘摘要 | 是 | 学习记录 |
| `assessment` | 课程测验 | 尝试次数、结果 | 按课程配置 | 课程成绩 |
| `competition` | 正式赛事环节 | 全量过程、规则版本、结果 | 按赛制配置 | 比赛成绩候选数据 |

首期只支持 `demo`。`practice`、`assessment` 和 `competition` 均不进入本期范围。

## 4. 主平台架构

### 4.1 Module Manifest：模块身份证

每个小游戏提供一份清单，主平台根据清单决定如何展示和加载。

```ts
export type SimulationModuleManifest = {
  id: string;
  version: string;
  title: string;
  description: string;
  provider: string;
  entryKind: "native" | "iframe";
  entry: string;
  supportedModes: Array<"demo" | "practice" | "assessment" | "competition">;
  capabilities: Array<"pause" | "resume" | "result" | "processLog">;
  minHostProtocolVersion: string;
};
```

### 4.2 Host Assignment：宿主启用配置

模块清单说明“它是谁”，宿主配置说明“它在哪里、以什么规则运行”。

```ts
export type SimulationAssignment = {
  assignmentId: string;
  moduleId: string;
  host: {
    type: "competition" | "course" | "activity";
    id: string;
  };
  mode: "demo" | "practice" | "assessment" | "competition";
  enabled: boolean;
  availability: {
    startsAt?: string;
    endsAt?: string;
    requiredPermission?: string;
  };
  launchPolicy: {
    maxAttempts?: number;
    allowResume: boolean;
  };
  resultPolicy: {
    persist: boolean;
    countTowardHostResult: boolean;
  };
  returnTo: string;
};
```

同一个模块可以被多个赛事分别启用，但每次运行必须携带所属宿主 ID，不能生成脱离赛事或课程的全局结果。

### 4.3 Module Host：统一容器

主平台提供统一页面：

```text
/modules/simulations/:assignmentId
```

容器负责：

1. 检查登录状态、赛事身份和权限；
2. 读取模块清单与宿主配置；
3. 创建本次 `runId`；
4. 加载小游戏；
5. 接收进度和结果；
6. 处理退出、失败、重试和返回；
7. 收到完成事件后展示结束状态，不保存或回写结果。

小游戏不直接操作 React Router，也不自行决定返回平台的哪个页面。

## 5. 未来扩展协议（首期不实现）

本节只保留协议演进方向，避免以后从 Demo 升级到练习或赛事模式时推翻接入结构。首期实现直接采用 6.2 节的最小 Demo 协议，不实现 `runId`、检查点、成绩或结果保存。

### 5.1 启动上下文

主平台只传入完成本次游戏需要的最小数据：

```ts
export type SimulationLaunchContext = {
  protocolVersion: "1.0";
  assignmentId: string;
  moduleId: string;
  moduleVersion: string;
  runId: string;
  mode: "demo" | "practice" | "assessment" | "competition";
  actor: { userId: string; teamId?: string };
  host: {
    type: "competition" | "course" | "activity";
    id: string;
  };
  locale: "zh-CN";
  resumeSnapshot?: unknown;
};
```

不传手机号、简历、完整画像、全部赛事身份等与本次运行无关的数据。

### 5.2 模块向主平台发送的事件

```ts
export type SimulationModuleEvent =
  | { type: "MODULE_READY"; runId: string }
  | { type: "RUN_STARTED"; runId: string; startedAt: string }
  | { type: "RUN_CHECKPOINT"; runId: string; snapshot: unknown }
  | { type: "RUN_COMPLETED"; runId: string; result: SimulationResult }
  | { type: "RUN_ABORTED"; runId: string; reason: "userExit" | "timeout" | "moduleError" }
  | { type: "MODULE_ERROR"; runId: string; code: string; recoverable: boolean };

export type SimulationResult = {
  ruleVersion: string;
  completedAt: string;
  status: "completed" | "failed";
  score?: number;
  metrics: Record<string, number | string | boolean>;
  summary: string;
  replayRef?: string;
};
```

`score` 是可选字段。练习模式可以只保存是否完成和复盘摘要。正式比赛模式必须同时保存规则版本和可复核的过程引用，不能只接收一个最终分数。

### 5.3 主平台发送给模块的命令

```ts
export type SimulationHostCommand =
  | { type: "HOST_INIT"; context: SimulationLaunchContext }
  | { type: "HOST_PAUSE" }
  | { type: "HOST_RESUME"; snapshot?: unknown }
  | { type: "HOST_TERMINATE"; reason: string };
```

所有消息必须校验 `protocolVersion`、`moduleId`、`assignmentId` 和 `runId`，防止把赛事 A 的结果写入赛事 B。

## 6. 两种接入方式

### 6.1 同仓原生模块（保留能力，首期不采用）

```text
apps/mobile/src/features/simulations/
├── host/
│   ├── SimulationHostPage.tsx
│   └── registry.ts
└── modules/
    └── community-commerce/
        ├── manifest.ts
        ├── Module.tsx
        ├── rules.ts
        └── result.ts
```

优点：开发和调试简单，可以复用现有 UI，适合验证一个场景，不需要先建设独立发布平台。

限制：隔离性较弱，每次更新模块通常需要重新发布手机端，不适合直接加载不受信任的第三方代码。

如果未来改为原生组件，也必须通过统一容器和事件协议接入，不能让小游戏直接读写 Workshop Runtime。

### 6.2 独立 H5 + iframe 微前端容器（首期采用）

小游戏作为独立 H5 发布，主平台通过受控 iframe 加载，并用 `postMessage` 实现最小通信协议。H5 自己负责页面、游戏规则、临时运行状态和结束画面；主平台只负责活动入口、加载容器、关闭和返回。

优点：模块可独立开发和发布，故障、样式和依赖隔离更强，适合外部供应商或多个技术栈。

限制：需要处理移动端适配、加载失败、来源校验和全屏体验。首期不传登录凭证和用户隐私数据，因此不处理复杂登录共享。

iframe 方案必须：

- 使用固定域名白名单并校验 `event.origin`；
- 首期不传登录凭证；未来确需身份时再增加短期、一次性的启动凭证；
- 限制 `sandbox` 权限；
- 禁止模块访问顶层页面和主平台存储；
- 不把长期令牌、用户隐私数据放进 URL；
- 首期不接收正式成绩；完成事件只用于退出体验页或展示完成提示。

首期最小通信可以收缩为：

```ts
export type DemoHostCommand =
  | { type: "HOST_INIT"; activityId: string; locale: "zh-CN" }
  | { type: "HOST_TERMINATE" };

export type DemoModuleEvent =
  | { type: "MODULE_READY" }
  | { type: "DEMO_STARTED" }
  | { type: "DEMO_COMPLETED" }
  | { type: "DEMO_EXIT_REQUESTED" }
  | { type: "MODULE_ERROR"; code: string };
```

不回传分数、过程记录或用户数据。即使 H5 内部为了页面连续性使用临时状态，页面关闭后也不要求恢复。

### 6.3 不采用的方式

首期不建议动态执行任意远程 JavaScript、让模块直接导入主平台内部 store、通过 URL 传完整用户数据、每个游戏自定义回调格式，或为了“微前端”概念提前引入大型框架。

## 7. 与现有产品状态的关系

### 7.1 赛事接入

只有 assignment 已启用、处于有效期、当前账号具有相应赛事身份、赛事生命周期允许进入且权限满足时，才展示入口。

```text
/competitions/:competitionId/workspace
→ “经营模拟练习”卡片
→ /modules/simulations/:assignmentId
→ 完成
→ returnTo 返回原赛事工作区
```

比赛结束或权限回收后，模块入口根据宿主策略变成只读结果、关闭或不可用，不能靠小游戏自己判断赛事状态。

### 7.2 课程接入

```text
/courses/:courseId/learn
→ 模拟案例
→ /modules/simulations/:assignmentId
→ 返回完成状态
→ 课程继续
```

模块不自行颁发证书；课程系统根据学习规则决定是否形成课程成果。

### 7.3 长期资产

练习结果默认不直接进入长期资产。只有宿主确认它构成正式课程成果或赛事成果时，主平台才通过稳定的 `runId` 引用该结果。长期资产保存“结果引用与可信摘要”，不复制整个模拟运行对象形成第二份真相源。

### 7.4 与 D03 任务体系的边界

模拟运行中的轮次属于模块内部步骤，不等于平台任务。在 D03 未决前：

- 不将小游戏步骤同步到 `/tasks`；
- 不因为完成一轮就发放全局任务奖励；
- 不把 Workshop Task Runtime 改造成小游戏运行引擎；
- 只允许宿主记录一次模块“未开始 / 进行中 / 已完成”。

## 8. 失败与降级

| 状态 | 主平台处理 |
|---|---|
| 未启用 | 不展示入口 |
| 未到开放时间 | 展示开放时间，不加载模块 |
| 无权限 | 返回赛事或课程，并说明原因 |
| 加载失败 | 提供重试和返回，不影响宿主页面 |
| 运行中退出 | 关闭本次临时状态并返回活动页 |
| 模块版本不兼容 | 阻止启动并记录错误 |
| 完成回传失败 | 暂存结果，提示稍后重试同步 |
| 宿主已结束 | 禁止新开一局，按策略允许查看历史结果 |

模块失败不能让赛事工作区或课程页面白屏。

## 9. 首期最小实现

首期目标不是建设插件市场，也不是建设模拟训练平台，而是验证一个独立 H5 活动能否被主平台安全、自然地打开和退出。

### 主平台

- 增加模块清单 registry；
- 增加独立活动配置，包含活动 ID、H5 地址、开放状态和返回地址；
- 增加统一 `SimulationHostPage`；
- 只支持 `demo`；
- 支持 loading、ready、running、completed、error；
- 支持关闭和返回活动入口；
- 不保存运行结果。

### 独立 H5 模块

- 只做一个场景；
- 一局有明确结束；
- 使用自己的临时局部状态；
- 规则代码与 UI 分离；
- 页面关闭后无需恢复；
- 只回传开始、完成、退出请求和错误事件；
- 不接入全局学力值、算力、签到或排行榜。

### 暂不建设

- 第三方模块上传或插件市场；
- 远程动态代码；
- 正式比赛计分；
- 跨模块全局排名；
- 模块内支付或积分经济。

## 10. 产品名称与文案

### 10.1 推荐名称

首期推荐使用：

> **经营决策体验**

推荐理由：

- “经营”说明内容方向；
- “决策”说明用户不是只看内容，而是要做选择；
- “体验”准确表达 Demo 的轻量属性，不承诺专业训练、正式测评或比赛成绩；
- 相比“运营沙盒”“经营模拟器”，更克制，也更符合当前平台气质。

### 10.2 推荐入口文案

活动卡片：

```text
经营决策体验
如果你来经营一家社区团购店，会怎么做选择？
用几分钟完成一次模拟经营，看看不同决定会带来什么结果。

[开始体验]
```

进入前说明：

```text
这是一个轻量互动体验，不记录成绩，也不影响你的赛事、课程或个人档案。
```

结束页：

```text
体验完成
你已经完成了本次经营决策体验。结果仅供互动参考，不代表正式能力评价。

[再试一次]  [返回活动]
```

### 10.3 可选名称

- **社区团购经营体验**：首期只有一个固定场景时最直接；
- **经营模拟体验**：更突出模拟属性，但语气稍偏工具；
- **商业决策小实验**：更轻松，但“商业”范围可能显得过大。

不建议首期使用“AI 运营沙盒”“运营实战训练”“经营能力测评”等名称，避免对 AI、训练效果或评价能力作出尚未验证的承诺。

## 11. 验收标准

1. 未配置该模块的活动完全看不到入口；
2. H5 只能从配置的活动入口打开；
3. H5 不依赖赛事身份、课程状态或长期账号数据；
4. 模块刷新、退出和失败不会破坏主平台状态；
5. 完成后能够返回正确 `returnTo`；
6. 模块不能读取或修改账号、赛事身份或长期资产；
7. 关闭 assignment 后无需删除模块代码即可停止入口；
8. 模块不回传分数、个人数据或正式结果；
9. 手机端深层刷新不 404；
10. 产品评审确认模块没有把平台重新表达成游戏化培训产品。

## 12. 后续才需要确认的事项

1. 体验验证后是否需要升级为练习模式；
2. 是否需要登录身份、运行恢复或结果保存；
3. 是否需要挂入某场正式赛事或课程；
4. 是否需要引入外部小游戏供应商；
5. 是否需要从 iframe 升级到其它微前端方案。

这些问题不阻塞首期独立活动 Demo。只有真实需求出现时再扩展协议。

export type EnvironmentKey = "development" | "test";
export type HealthState = "healthy" | "warning" | "critical";
export type AlertState = "active" | "recovered";
export type AlertLevel = "warning" | "critical";
export type LogType = "system" | "sync" | "alert";
export type LogLevel = "info" | "warning" | "error";

export type ServiceHealth = {
  id: string;
  name: string;
  state: HealthState;
  lastChecked: string;
  latencyMs?: number;
  availability: string;
  summary: string;
};

export type RequestMetrics = {
  requestsPerMinute: number;
  successRate: string;
  http4xx: string;
  http5xx: string;
  averageMs: number;
  p95Ms: number;
};

export type ResourceMetric = {
  id: string;
  label: string;
  value: number;
  unit: string;
  state: HealthState;
  hint: string;
};

export type SyncMetrics = {
  lastSync: string;
  successCount: number;
  failedCount: number;
  backlog: number;
  activeFailure: string;
  externalSourceIssue: string;
};

export type AlertRecord = {
  id: string;
  level: AlertLevel;
  service: string;
  title: string;
  summary: string;
  firstSeen: string;
  lastSeen: string;
  state: AlertState;
  logId: string;
};

export type LogRecord = {
  id: string;
  type: LogType;
  level: LogLevel;
  time: string;
  service: string;
  title: string;
  humanDetail: string;
  technicalDetail: string;
  correlationId: string;
};

export type DeploymentRecord = {
  id: string;
  time: string;
  build: string;
  operator: string;
  result: "success" | "failed";
  note: string;
};

export type ObservabilitySnapshot = {
  key: EnvironmentKey;
  label: string;
  state: HealthState;
  stateLabel: string;
  build: string;
  lastDeploy: string;
  lastHealthCheck: string;
  uptime: string;
  abnormal1h: number;
  abnormal24h: number;
  unresolvedAlerts: number;
  services: ServiceHealth[];
  request: RequestMetrics;
  resources: ResourceMetric[];
  sync: SyncMetrics;
  alerts: AlertRecord[];
  logs: LogRecord[];
  deployments: DeploymentRecord[];
};

const developmentLogs: LogRecord[] = [
  {
    id: "dev-system-health-1108",
    type: "system",
    level: "info",
    time: "11:08",
    service: "API",
    title: "健康检查通过",
    humanDetail: "API、数据库与对象存储检查均通过，没有发现需要处理的运行异常。",
    technicalDetail: "GET /health -> 200 · db=ok · storage=ok · latency=96ms",
    correlationId: "health-dev-1108",
  },
  {
    id: "dev-sync-complete-1056",
    type: "sync",
    level: "info",
    time: "10:56",
    service: "数据同步",
    title: "赛事基础数据同步完成",
    humanDetail: "本轮同步完成 148 条，失败 0 条，仍有 1 条低优先级任务等待处理。",
    technicalDetail: "sync competition-base-data completed success=148 failed=0 backlog=1",
    correlationId: "sync-dev-1056",
  },
  {
    id: "dev-alert-recovered-0912",
    type: "alert",
    level: "info",
    time: "09:12",
    service: "第三方接口",
    title: "昨夜第三方接口抖动已恢复",
    humanDetail: "短时延迟升高已经恢复，当前不需要人工处理。",
    technicalDetail: "alert third-party-latency recovered p95=284ms",
    correlationId: "alert-dev-recovered-0912",
  },
];

const testLogs: LogRecord[] = [
  {
    id: "test-system-p95-1047",
    type: "system",
    level: "warning",
    time: "10:47",
    service: "API",
    title: "API 响应时间持续升高",
    humanDetail: "测试环境 API P95 已升至 1.25 秒，主要集中在报名与同步相关请求。",
    technicalDetail: "api latency p95=1250ms avg=390ms route_group=registration,sync",
    correlationId: "req-test-1047",
  },
  {
    id: "test-sync-timeout-1041",
    type: "sync",
    level: "error",
    time: "10:41",
    service: "三创赛数据同步",
    title: "三创赛数据同步连续失败",
    humanDetail: "外部报名数据源连续 4 次超时，当前有 17 条任务等待重试。",
    technicalDetail: "connection timeout after 10000ms · retry=4 · backlog=17 · source=sanchuang-registration",
    correlationId: "sync-test-1041",
  },
  {
    id: "test-alert-sync-1053",
    type: "alert",
    level: "error",
    time: "10:53",
    service: "数据同步",
    title: "同步失败告警仍未恢复",
    humanDetail: "三创赛数据同步失败已持续 12 分钟，建议优先查看同步日志与外部数据源可用性。",
    technicalDetail: "alert active duration=12m source_log=test-sync-timeout-1041",
    correlationId: "alert-test-sync-1053",
  },
  {
    id: "test-alert-api-1050",
    type: "alert",
    level: "warning",
    time: "10:50",
    service: "API",
    title: "API P95 超过测试环境观察阈值",
    humanDetail: "报名与同步接口响应明显变慢，但请求仍可完成。",
    technicalDetail: "alert threshold p95 > 1000ms current=1250ms",
    correlationId: "alert-test-api-1050",
  },
  {
    id: "test-system-storage-0830",
    type: "system",
    level: "info",
    time: "08:30",
    service: "对象存储",
    title: "对象存储短时失败已恢复",
    humanDetail: "早间出现过一次上传失败，08:34 后健康检查持续正常。",
    technicalDetail: "storage upload recovered error_rate=0 current=ok",
    correlationId: "storage-test-0830",
  },
];

export const observabilitySnapshots: Record<EnvironmentKey, ObservabilitySnapshot> = {
  development: {
    key: "development",
    label: "开发环境",
    state: "healthy",
    stateLabel: "正常",
    build: "dev-c652588",
    lastDeploy: "10:20",
    lastHealthCheck: "11:08",
    uptime: "6 小时 48 分",
    abnormal1h: 0,
    abnormal24h: 2,
    unresolvedAlerts: 0,
    services: [
      { id: "web", name: "Web / 前端", state: "healthy", lastChecked: "11:08", latencyMs: 42, availability: "99.99%", summary: "页面与静态资源正常" },
      { id: "api", name: "API", state: "healthy", lastChecked: "11:08", latencyMs: 96, availability: "99.98%", summary: "核心接口响应正常" },
      { id: "db", name: "数据库", state: "healthy", lastChecked: "11:08", latencyMs: 18, availability: "100%", summary: "连接池与查询正常" },
      { id: "storage", name: "对象存储", state: "healthy", lastChecked: "11:07", latencyMs: 73, availability: "99.99%", summary: "上传与读取正常" },
      { id: "third-party", name: "关键第三方接口", state: "healthy", lastChecked: "11:06", latencyMs: 184, availability: "99.94%", summary: "最近异常已恢复" },
    ],
    request: { requestsPerMinute: 486, successRate: "99.96%", http4xx: "0.7%", http5xx: "0.04%", averageMs: 142, p95Ms: 310 },
    resources: [
      { id: "cpu", label: "CPU", value: 34, unit: "%", state: "healthy", hint: "余量充足" },
      { id: "memory", label: "内存", value: 58, unit: "%", state: "healthy", hint: "稳定" },
      { id: "disk", label: "磁盘", value: 44, unit: "%", state: "healthy", hint: "空间充足" },
      { id: "connections", label: "连接占用", value: 23, unit: "%", state: "healthy", hint: "68 / 300" },
    ],
    sync: { lastSync: "10:56", successCount: 148, failedCount: 0, backlog: 1, activeFailure: "无", externalSourceIssue: "无未恢复异常" },
    alerts: [
      { id: "dev-third-party-recovered", level: "warning", service: "第三方接口", title: "第三方接口短时抖动", summary: "09:12 已恢复，当前无需处理。", firstSeen: "09:07", lastSeen: "09:12", state: "recovered", logId: "dev-alert-recovered-0912" },
    ],
    logs: developmentLogs,
    deployments: [
      { id: "dev-deploy-1020", time: "10:20", build: "dev-c652588", operator: "黄超", result: "success", note: "PC 后台资料与页面调整" },
      { id: "dev-deploy-0845", time: "08:45", build: "dev-5f38bb1", operator: "djtao", result: "success", note: "PC05 收口与可用性修正" },
    ],
  },
  test: {
    key: "test",
    label: "测试环境",
    state: "warning",
    stateLabel: "有警告",
    build: "test-5f38bb1",
    lastDeploy: "10:32",
    lastHealthCheck: "11:08",
    uptime: "3 小时 36 分",
    abnormal1h: 6,
    abnormal24h: 11,
    unresolvedAlerts: 2,
    services: [
      { id: "web", name: "Web / 前端", state: "healthy", lastChecked: "11:08", latencyMs: 61, availability: "99.96%", summary: "页面可访问" },
      { id: "api", name: "API", state: "warning", lastChecked: "11:08", latencyMs: 390, availability: "98.90%", summary: "P95 响应时间升高" },
      { id: "db", name: "数据库", state: "healthy", lastChecked: "11:08", latencyMs: 26, availability: "99.99%", summary: "查询正常" },
      { id: "storage", name: "对象存储", state: "healthy", lastChecked: "11:07", latencyMs: 88, availability: "99.92%", summary: "早间异常已恢复" },
      { id: "third-party", name: "关键第三方接口", state: "critical", lastChecked: "11:06", availability: "96.80%", summary: "三创赛报名数据源持续超时" },
    ],
    request: { requestsPerMinute: 214, successRate: "97.8%", http4xx: "1.6%", http5xx: "0.6%", averageMs: 390, p95Ms: 1250 },
    resources: [
      { id: "cpu", label: "CPU", value: 72, unit: "%", state: "warning", hint: "同步重试期间偏高" },
      { id: "memory", label: "内存", value: 81, unit: "%", state: "warning", hint: "接近观察阈值" },
      { id: "disk", label: "磁盘", value: 62, unit: "%", state: "healthy", hint: "可用" },
      { id: "connections", label: "连接占用", value: 75, unit: "%", state: "warning", hint: "224 / 300" },
    ],
    sync: { lastSync: "10:41", successCount: 93, failedCount: 4, backlog: 17, activeFailure: "三创赛报名数据同步", externalSourceIssue: "外部报名数据源 10:41 起连续超时" },
    alerts: [
      { id: "test-sync-alert", level: "critical", service: "数据同步", title: "三创赛数据同步失败 · 已持续 12 分钟", summary: "连续 4 次同步超时，17 条任务等待重试。", firstSeen: "10:41", lastSeen: "10:53", state: "active", logId: "test-sync-timeout-1041" },
      { id: "test-api-alert", level: "warning", service: "API", title: "API P95 响应升高", summary: "报名与同步相关请求 P95 达到 1.25 秒。", firstSeen: "10:43", lastSeen: "10:50", state: "active", logId: "test-system-p95-1047" },
      { id: "test-storage-recovered", level: "warning", service: "对象存储", title: "对象存储上传短时失败", summary: "08:34 已恢复，当前健康检查正常。", firstSeen: "08:30", lastSeen: "08:34", state: "recovered", logId: "test-system-storage-0830" },
    ],
    logs: testLogs,
    deployments: [
      { id: "test-deploy-1032", time: "10:32", build: "test-5f38bb1", operator: "黄超", result: "success", note: "同步接口字段映射调整；异常在部署后 9 分钟出现" },
      { id: "test-deploy-0920", time: "09:20", build: "test-4e91af0", operator: "djtao", result: "success", note: "PC 后台回归版本" },
    ],
  },
};

import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Database,
  Gauge,
  HardDrive,
  RefreshCw,
  Server,
  ShieldCheck,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { StatusTag } from "../components/ui";
import {
  observabilitySnapshots,
  type AlertLevel,
  type AlertRecord,
  type EnvironmentKey,
  type HealthState,
  type LogLevel,
  type LogType,
} from "./pc06-data";

function healthTone(state: HealthState): "success" | "warning" | "danger" {
  if (state === "critical") return "danger";
  if (state === "warning") return "warning";
  return "success";
}

function healthLabel(state: HealthState) {
  if (state === "critical") return "异常";
  if (state === "warning") return "有警告";
  return "正常";
}

function levelTone(level: AlertLevel | LogLevel): "info" | "warning" | "danger" {
  if (level === "critical" || level === "error") return "danger";
  if (level === "warning") return "warning";
  return "info";
}

const logLabels: Record<LogType, string> = {
  system: "系统日志",
  sync: "同步 / 导入日志",
  alert: "告警日志",
};

function MetricCard({ label, value, note }: { label: string; value: string; note?: string }) {
  return <div className="rounded-container border border-border-subtle bg-surface p-4"><p className="text-xs text-text-tertiary">{label}</p><p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>{note && <p className="mt-1 text-xs text-text-secondary">{note}</p>}</div>;
}

function ResourceBar({ label, value, unit, state, hint }: { label: string; value: number; unit: string; state: HealthState; hint: string }) {
  return <div className="rounded-control border border-border-subtle p-3">
    <div className="flex items-center justify-between gap-3"><div><p className="text-sm font-semibold">{label}</p><p className="mt-1 text-xs text-text-tertiary">{hint}</p></div><div className="text-right"><p className="text-lg font-semibold">{value}{unit}</p><StatusTag tone={healthTone(state)}>{healthLabel(state)}</StatusTag></div></div>
    <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-subtle" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}><div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(value, 100)}%` }} /></div>
  </div>;
}

export function PC06ObservabilityConsole() {
  const [environment, setEnvironment] = useState<EnvironmentKey>("development");
  const [logType, setLogType] = useState<LogType>("system");
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const snapshot = observabilitySnapshots[environment];
  const visibleLogs = useMemo(() => snapshot.logs.filter(log => log.type === logType), [snapshot, logType]);

  const openAlertLog = (alert: AlertRecord) => {
    const log = snapshot.logs.find(item => item.id === alert.logId);
    if (!log) return;
    setLogType(log.type);
    setSelectedLogId(log.id);
    requestAnimationFrame(() => document.getElementById("observability-logs")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  return <div className="space-y-6" data-testid="pc06-observability">
    <section className="rounded-container border border-border-subtle bg-surface p-5 lg:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div><div className="flex items-center gap-2 text-text-brand"><Gauge size={18} aria-hidden="true"/><p className="text-xs font-semibold">PC06 · 开发诊断层</p></div><h1 className="mt-2 text-2xl font-semibold tracking-tight">环境与日志</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">先判断当前环境是否健康，再定位异常大类；只有需要证据时才下钻日志。这里不承载老板业务大屏，也不复制操作审计。</p></div>
        <div className="flex rounded-control border border-border-subtle bg-surface-subtle p-1" aria-label="环境切换">
          {(["development", "test"] as const).map(key => <button key={key} type="button" data-testid={`environment-${key}`} aria-pressed={environment === key} onClick={() => { setEnvironment(key); setSelectedLogId(null); }} className={`min-h-10 rounded-control px-4 text-sm font-semibold ${environment === key ? "bg-surface text-text-brand shadow-sm" : "text-text-secondary"}`}>{observabilitySnapshots[key].label}</button>)}
        </div>
      </div>
    </section>

    <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4" aria-label="环境总览">
      <div data-testid="environment-health" className="rounded-container border border-border-subtle bg-surface p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-xs text-text-tertiary">环境状态</p><p className="mt-2 text-2xl font-semibold">{snapshot.stateLabel}</p></div>{snapshot.state === "healthy" ? <CheckCircle2 className="text-success-text"/> : <AlertTriangle className="text-warning-text"/>}</div><div className="mt-3"><StatusTag tone={healthTone(snapshot.state)}>{snapshot.label} · {snapshot.stateLabel}</StatusTag></div></div>
      <MetricCard label="当前版本 / Build" value={snapshot.build} note={`运行 ${snapshot.uptime}`} />
      <MetricCard label="最近部署" value={snapshot.lastDeploy} note={`最近健康检查 ${snapshot.lastHealthCheck}`} />
      <MetricCard label="未恢复告警" value={String(snapshot.unresolvedAlerts)} note={`1h 异常 ${snapshot.abnormal1h} · 24h 异常 ${snapshot.abnormal24h}`} />
    </section>

    <section className="rounded-container border border-border-subtle bg-surface">
      <div className="flex items-center gap-2 border-b border-border-subtle p-4"><Server size={18} className="text-text-brand"/><div><h2 className="font-semibold">服务健康</h2><p className="mt-1 text-xs text-text-tertiary">先看主要依赖是否可用，再决定是否下钻日志。</p></div></div>
      <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-5">{snapshot.services.map(service => <article key={service.id} data-testid={`service-${service.id}`} className="rounded-control border border-border-subtle p-3"><div className="flex items-start justify-between gap-2"><div><p className="text-sm font-semibold">{service.name}</p><p className="mt-1 text-xs text-text-tertiary">最近检测 {service.lastChecked}</p></div><StatusTag tone={healthTone(service.state)}>{healthLabel(service.state)}</StatusTag></div><dl className="mt-3 space-y-1 text-xs text-text-secondary"><div className="flex justify-between gap-2"><dt>可用性</dt><dd>{service.availability}</dd></div><div className="flex justify-between gap-2"><dt>延迟</dt><dd>{service.latencyMs ? `${service.latencyMs} ms` : "—"}</dd></div></dl><p className="mt-3 text-xs leading-5 text-text-secondary">{service.summary}</p></article>)}</div>
    </section>

    <section className="grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
      <div className="rounded-container border border-border-subtle bg-surface"><div className="flex items-center gap-2 border-b border-border-subtle p-4"><Activity size={18} className="text-text-brand"/><div><h2 className="font-semibold">请求指标</h2><p className="mt-1 text-xs text-text-tertiary">快速判断错误率和响应时间是否偏离正常状态。</p></div></div><div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3"><MetricCard label="请求速率" value={`${snapshot.request.requestsPerMinute} / min`} /><MetricCard label="请求成功率" value={snapshot.request.successRate} /><MetricCard label="4xx" value={snapshot.request.http4xx} /><MetricCard label="5xx" value={snapshot.request.http5xx} /><MetricCard label="平均响应" value={`${snapshot.request.averageMs} ms`} /><MetricCard label="P95 响应" value={`${snapshot.request.p95Ms} ms`} /></div></div>
      <div className="rounded-container border border-border-subtle bg-surface"><div className="flex items-center gap-2 border-b border-border-subtle p-4"><HardDrive size={18} className="text-text-brand"/><div><h2 className="font-semibold">资源指标</h2><p className="mt-1 text-xs text-text-tertiary">首版只回答“是否接近风险状态”。</p></div></div><div className="grid gap-3 p-4 sm:grid-cols-2">{snapshot.resources.map(resource => <ResourceBar key={resource.id} {...resource} />)}</div></div>
    </section>

    <section className="grid gap-6 xl:grid-cols-[.9fr_1.1fr]">
      <div className="rounded-container border border-border-subtle bg-surface"><div className="flex items-center gap-2 border-b border-border-subtle p-4"><RefreshCw size={18} className="text-text-brand"/><div><h2 className="font-semibold">任务与数据同步</h2><p className="mt-1 text-xs text-text-tertiary">与现有 API 同步、导入与批处理来源语义保持一致。</p></div></div><div className="grid gap-3 p-4 sm:grid-cols-2"><MetricCard label="最近一次同步" value={snapshot.sync.lastSync}/><MetricCard label="成功 / 失败" value={`${snapshot.sync.successCount} / ${snapshot.sync.failedCount}`}/><MetricCard label="待处理 / 积压" value={String(snapshot.sync.backlog)}/><MetricCard label="当前失败任务" value={snapshot.sync.activeFailure}/></div><div className="mx-4 mb-4 rounded-control bg-surface-subtle p-3 text-xs leading-5 text-text-secondary"><b className="text-text-primary">最近外部数据源异常：</b>{snapshot.sync.externalSourceIssue}</div></div>
      <div className="rounded-container border border-border-subtle bg-surface"><div className="flex items-center justify-between gap-3 border-b border-border-subtle p-4"><div className="flex items-center gap-2"><AlertTriangle size={18} className={snapshot.unresolvedAlerts ? "text-warning-text" : "text-success-text"}/><div><h2 className="font-semibold">最近异常与告警</h2><p className="mt-1 text-xs text-text-tertiary">人类可读结论优先；技术证据留到关联日志。</p></div></div><div className="text-right text-xs text-text-secondary">1h {snapshot.abnormal1h} · 24h {snapshot.abnormal24h}</div></div><div className="divide-y divide-border-subtle">{snapshot.alerts.map(alert => <article key={alert.id} data-testid={`alert-${alert.id}`} className="p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex flex-wrap items-center gap-2"><StatusTag tone={levelTone(alert.level)}>{alert.level === "critical" ? "严重" : "警告"}</StatusTag><StatusTag tone={alert.state === "active" ? "warning" : "success"}>{alert.state === "active" ? "未恢复" : "已恢复"}</StatusTag><span className="text-xs text-text-tertiary">{alert.service}</span></div><p className="mt-2 text-sm font-semibold">{alert.title}</p><p className="mt-1 text-xs leading-5 text-text-secondary">{alert.summary}</p><p className="mt-2 text-[11px] text-text-tertiary">首次 {alert.firstSeen} · 最近 {alert.lastSeen}</p></div><button type="button" onClick={() => openAlertLog(alert)} className="inline-flex min-h-10 shrink-0 items-center gap-1 rounded-control border border-border-subtle px-3 text-xs font-semibold text-text-brand hover:bg-surface-subtle">查看关联日志<ArrowRight size={13}/></button></div></article>)}</div></div>
    </section>

    <section className="rounded-container border border-border-subtle bg-surface"><div className="flex items-center gap-2 border-b border-border-subtle p-4"><Clock3 size={18} className="text-text-brand"/><div><h2 className="font-semibold">最近部署 / 变更</h2><p className="mt-1 text-xs text-text-tertiary">快速回答“异常前后是否刚有人改过东西”。</p></div></div><div className="overflow-x-auto"><table className="min-w-[760px] w-full text-left text-xs"><thead className="bg-surface-subtle"><tr>{["时间","环境","版本 / Build","执行人","结果","变更与异常线索"].map(label => <th key={label} className="p-3">{label}</th>)}</tr></thead><tbody>{snapshot.deployments.map(item => <tr key={item.id} className="border-t border-border-subtle"><td className="p-3">{item.time}</td><td className="p-3">{snapshot.label}</td><td className="p-3 font-mono">{item.build}</td><td className="p-3">{item.operator}</td><td className="p-3"><StatusTag tone={item.result === "success" ? "success" : "danger"}>{item.result === "success" ? "成功" : "失败"}</StatusTag></td><td className="p-3 text-text-secondary">{item.note}</td></tr>)}</tbody></table></div></section>

    <section id="observability-logs" className="scroll-mt-24 rounded-container border border-border-subtle bg-surface" aria-label="日志证据">
      <div className="border-b border-border-subtle p-4"><div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"><div><div className="flex items-center gap-2"><Database size={18} className="text-text-brand"/><h2 className="font-semibold">日志证据</h2></div><p className="mt-1 text-xs text-text-tertiary">日志按类型组织；主界面不直接用 raw log 代替异常判断。</p></div><div className="flex flex-wrap gap-2">{(["system", "sync", "alert"] as const).map(type => <button key={type} type="button" data-testid={`log-filter-${type}`} aria-pressed={logType === type} onClick={() => { setLogType(type); setSelectedLogId(null); }} className={`min-h-9 rounded-control px-3 text-xs font-semibold ${logType === type ? "bg-primary-container text-text-brand" : "border border-border-subtle text-text-secondary"}`}>{logLabels[type]}</button>)}</div></div></div>
      <div className="divide-y divide-border-subtle">{visibleLogs.map(log => <article key={log.id} data-testid={`log-${log.id}`} className={`p-4 ${selectedLogId === log.id ? "bg-primary-container/40" : ""}`}><div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex flex-wrap items-center gap-2"><StatusTag tone={levelTone(log.level)}>{log.level === "error" ? "错误" : log.level === "warning" ? "警告" : "信息"}</StatusTag><span className="text-xs text-text-tertiary">{log.time} · {log.service}</span></div><p className="mt-2 text-sm font-semibold">{log.title}</p><p className="mt-1 text-xs leading-5 text-text-secondary">{log.humanDetail}</p></div>{selectedLogId === log.id && <StatusTag tone="info">关联证据</StatusTag>}</div><details data-pc05-technical className="mt-3 rounded-control bg-surface-subtle p-3 text-xs text-text-secondary"><summary className="cursor-pointer font-semibold text-text-primary">查看技术原始信息</summary><code className="mt-2 block whitespace-pre-wrap break-words">{log.technicalDetail}</code><p className="mt-2 font-mono text-[11px]">correlationId={log.correlationId}</p></details></article>)}</div>
    </section>

    <section className="rounded-container border border-info bg-info-bg p-5"><div className="flex gap-3"><ShieldCheck className="mt-0.5 shrink-0 text-info-text"/><div><h2 className="font-semibold text-info-text">操作审计仍然只有一份</h2><p className="mt-1 text-sm leading-6 text-info-text">“谁在什么时候对什么对象做了什么”继续由既有权限与审计 / Audit Log 维护。PC06 只提供诊断线索，不建立第二套操作日志。</p><Link to="/admin/governance" className="mt-3 inline-flex min-h-10 items-center gap-1 rounded-control bg-surface px-3 text-xs font-semibold text-text-brand">前往权限与审计 / Audit Log<ArrowRight size={13}/></Link></div></div></section>
  </div>;
}

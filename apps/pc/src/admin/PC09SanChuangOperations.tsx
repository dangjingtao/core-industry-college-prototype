import {
  BarChart3,
  CalendarRange,
  ChevronRight,
  CircleDollarSign,
  Download,
  FileSpreadsheet,
  PackageCheck,
  Radio,
  RefreshCcw,
  Trophy,
  UsersRound,
  Video,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { competitionControlById } from "./competition-control-data";
import { competitionInfrastructureById, deriveCompetitionStageStatus } from "./pc08-data";
import {
  currentSanChuangCompetitionId,
  performanceBatchesFor,
  performanceEvidenceFor,
  performancePeriods,
  performanceSourceLabels,
  performanceSummaryFor,
  sanChuangCompetitionOptions,
  sanChuangProfileByCompetitionId,
  type PerformanceBatchStatus,
  type PerformanceEvidenceKind,
  type PerformanceFilter,
  type PerformanceSource,
} from "./pc09-data";

function money(value: number) {
  return new Intl.NumberFormat("zh-CN", { style: "currency", currency: "CNY", maximumFractionDigits: 0 }).format(value);
}

function number(value: number) {
  return new Intl.NumberFormat("zh-CN").format(value);
}

function competitionStatusLabel(status: string) {
  if (status === "registrationOpen") return "报名中";
  if (status === "inProgress") return "进行中";
  if (status === "ended") return "已结束";
  return "未开始";
}

function stageStatusLabel(status: ReturnType<typeof deriveCompetitionStageStatus>) {
  if (status === "inProgress") return "进行中";
  if (status === "ended") return "已结束";
  return "未开始";
}

function batchStatusLabel(status: PerformanceBatchStatus) {
  if (status === "success") return "成功";
  if (status === "partial") return "部分异常";
  return "失败";
}

function batchStatusClass(status: PerformanceBatchStatus) {
  if (status === "success") return "bg-success-bg text-success-text";
  if (status === "partial") return "bg-warning-bg text-warning-text";
  return "bg-danger-bg text-danger-text";
}

function SanChuangHero({ competitionId, view }: { competitionId: string; view: "overview" | "performance" }) {
  const navigate = useNavigate();
  const profile = sanChuangProfileByCompetitionId(competitionId);
  const record = competitionControlById(competitionId);
  const options = sanChuangCompetitionOptions();
  if (!profile || !record) return null;

  return (
    <section data-testid="pc09-hero" className="overflow-hidden rounded-container border border-border-subtle bg-primary text-on-primary">
      <div className="grid gap-6 p-6 lg:grid-cols-[1fr_auto] lg:items-end lg:p-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-on-primary"><Trophy size={16} />{profile.heroKicker}</div>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight lg:text-3xl">{profile.shortLabel}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-on-primary">独立的是长期赛事运营体验；Competition / Team / Registration 仍复用平台通用真相源。</p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-primary-pressed px-3 py-1.5">{competitionStatusLabel(record.status)}</span>
            <span className="rounded-full bg-primary-pressed px-3 py-1.5">{record.source}</span>
            <span className="rounded-full bg-primary-pressed px-3 py-1.5">competitionId={record.id}</span>
          </div>
        </div>
        <label className="text-xs font-semibold text-on-primary">运营届次
          <select
            data-testid="pc09-edition-select"
            aria-label="切换三创赛届次"
            value={competitionId}
            onChange={event => navigate(`/admin/sanchuang/${event.target.value}${view === "performance" ? "/performance" : ""}`)}
            className="mt-2 block min-h-11 min-w-64 rounded-control border border-primary-pressed bg-surface px-3 text-sm font-semibold text-text-primary"
          >
            {options.map(option => <option key={option.profile.competitionId} value={option.profile.competitionId}>{option.profile.shortLabel}</option>)}
          </select>
        </label>
      </div>
      <nav className="flex gap-1 border-t border-primary-pressed bg-primary-pressed px-5 py-3" aria-label="三创赛运营页签">
        <Link to={`/admin/sanchuang/${competitionId}`} className={`rounded-control px-4 py-2 text-sm font-semibold ${view === "overview" ? "bg-surface text-text-primary" : "text-on-primary hover:bg-primary-pressed"}`}>赛事概览</Link>
        <Link to={`/admin/sanchuang/${competitionId}/performance`} className={`rounded-control px-4 py-2 text-sm font-semibold ${view === "performance" ? "bg-surface text-text-primary" : "text-on-primary hover:bg-primary-pressed"}`}>营销实绩</Link>
      </nav>
    </section>
  );
}

function SanChuangOverview({ competitionId }: { competitionId: string }) {
  const record = competitionControlById(competitionId);
  const infrastructure = competitionInfrastructureById(competitionId);
  if (!record || !infrastructure) return null;
  const sortedStages = [...infrastructure.stages].sort((a, b) => a.sort - b.sort);
  const currentStage = sortedStages.find(stage => deriveCompetitionStageStatus(stage) === "inProgress") ?? sortedStages.find(stage => deriveCompetitionStageStatus(stage) === "notStarted") ?? sortedStages.at(-1);
  const filter: PerformanceFilter = { competitionId, teamId: record.team.id, source: "all", periodId: "2026-08-mid" };
  const summary = performanceSummaryFor(filter);

  const cards = [
    { label: "报名团队", value: "1 个稳定样本", detail: `${record.team.name} · 复用 PC02 Team`, icon: UsersRound },
    { label: "当前赛程", value: currentStage?.name ?? "暂无阶段", detail: currentStage ? `${stageStatusLabel(deriveCompetitionStageStatus(currentStage))} · 复用 PC08 Stage` : "等待赛程配置", icon: CalendarRange },
    { label: "营销实绩", value: money(summary.gmv), detail: `${summary.orderCount} 笔订单 · 当前筛选口径`, icon: BarChart3 },
    { label: "排名 / 成绩", value: "未接评分规则", detail: "只预留下钻位，不从营销数据擅自算分", icon: Trophy },
    { label: "获奖结果", value: "等待官方回流", detail: "外部权威结果到达后再进入可信结果链", icon: PackageCheck },
  ];

  return (
    <div className="space-y-6" data-testid="pc09-overview">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map(card => {
          const Icon = card.icon;
          return <article key={card.label} className="rounded-container border border-border-subtle bg-surface p-4"><div className="flex items-center gap-2 text-xs font-semibold text-text-tertiary"><Icon size={16} className="text-text-brand" />{card.label}</div><p className="mt-3 text-lg font-semibold">{card.value}</p><p className="mt-2 text-xs leading-5 text-text-secondary">{card.detail}</p></article>;
        })}
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.25fr_.75fr]">
        <article className="rounded-container border border-border-subtle bg-surface p-5">
          <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-semibold text-text-tertiary">当前运营对象</p><h2 className="mt-1 text-lg font-semibold">{record.name}</h2><p className="mt-2 text-sm text-text-secondary">{record.project.name} · {record.project.track}</p></div><Link to={`/admin/competitions/objects/${competitionId}`} className="inline-flex min-h-10 items-center gap-1 rounded-control bg-primary-container px-3 text-xs font-semibold text-text-brand">通用赛事详情<ChevronRight size={14} /></Link></div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-control bg-surface-subtle p-4"><p className="text-xs text-text-tertiary">团队</p><p className="mt-2 text-sm font-semibold">{record.team.name}</p><p className="mt-1 text-xs text-text-secondary">{record.team.members.length} 位成员 · teamId={record.team.id}</p></div>
            <div className="rounded-control bg-surface-subtle p-4"><p className="text-xs text-text-tertiary">资格状态</p><p className="mt-2 text-sm font-semibold">平台 {record.qualification.platformReview} / 官方 {record.qualification.officialQualification}</p><p className="mt-1 text-xs text-text-secondary">继续复用 PC02 双层资格模型</p></div>
          </div>
        </article>
        <article className="rounded-container border border-border-subtle bg-surface p-5">
          <p className="text-xs font-semibold text-text-tertiary">重点运营入口</p>
          <h2 className="mt-1 text-lg font-semibold">营销实绩</h2>
          <p className="mt-2 text-sm leading-6 text-text-secondary">把第三方订单、直播、视频放在同一统计上下文中，保留来源平台、同步批次和原始明细范围。</p>
          <Link to={`/admin/sanchuang/${competitionId}/performance`} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-control bg-primary px-4 text-sm font-semibold text-on-primary">进入营销实绩<ChevronRight size={16} /></Link>
        </article>
      </section>
    </div>
  );
}

function MetricCard({ testId, label, value, detail, icon: Icon, onClick }: { testId: string; label: string; value: string; detail: string; icon: typeof CircleDollarSign; onClick: () => void }) {
  return <button type="button" data-testid={testId} onClick={onClick} className="rounded-container border border-border-subtle bg-surface p-4 text-left transition hover:bg-surface-subtle"><div className="flex items-center gap-2 text-xs font-semibold text-text-tertiary"><Icon size={16} className="text-text-brand" />{label}</div><p className="mt-3 text-xl font-semibold">{value}</p><p className="mt-2 text-xs leading-5 text-text-secondary">{detail}</p></button>;
}

function EvidenceTabs({ kind, setKind }: { kind: PerformanceEvidenceKind; setKind: (kind: PerformanceEvidenceKind) => void }) {
  const tabs: { id: PerformanceEvidenceKind; label: string }[] = [
    { id: "orders", label: "订单明细" },
    { id: "live", label: "直播记录" },
    { id: "videos", label: "视频记录" },
  ];
  return <div className="flex flex-wrap gap-2">{tabs.map(tab => <button key={tab.id} type="button" data-testid={`pc09-evidence-tab-${tab.id}`} onClick={() => setKind(tab.id)} className={`min-h-10 rounded-control px-3 text-xs font-semibold ${kind === tab.id ? "bg-primary text-on-primary" : "bg-surface-subtle text-text-secondary"}`}>{tab.label}</button>)}</div>;
}

function SanChuangPerformance({ competitionId }: { competitionId: string }) {
  const record = competitionControlById(competitionId);
  const infrastructure = competitionInfrastructureById(competitionId);
  const [teamId, setTeamId] = useState(() => record?.team.id ?? "");
  const [source, setSource] = useState<PerformanceSource | "all">("all");
  const [periodId, setPeriodId] = useState("2026-08-mid");
  const [evidenceKind, setEvidenceKind] = useState<PerformanceEvidenceKind>("orders");
  const [exportMessage, setExportMessage] = useState("");
  if (!record || !infrastructure) return null;

  const filter: PerformanceFilter = { competitionId, teamId, source, periodId };
  const summary = performanceSummaryFor(filter);
  const evidence = performanceEvidenceFor(filter);
  const batches = performanceBatchesFor({ competitionId, source, periodId });
  const currentStage = [...infrastructure.stages].sort((a, b) => a.sort - b.sort).find(stage => deriveCompetitionStageStatus(stage) === "inProgress");
  const sourceCards = (["douyin", "sanchuangGoods"] as PerformanceSource[]).map(sourceId => ({
    sourceId,
    summary: performanceSummaryFor({ ...filter, source: sourceId }),
    batches: performanceBatchesFor({ competitionId, source: sourceId, periodId }),
  }));

  const exportCurrent = () => {
    const rows = [
      ["类型", "记录ID", "来源", "批次", "时间", "指标1", "指标2"],
      ...evidence.orders.map(item => ["订单", item.id, performanceSourceLabels[item.source], item.batchId, item.occurredAt, `GMV:${item.grossAmount}`, `净额:${item.netAmount}`]),
      ...evidence.live.map(item => ["直播", item.id, performanceSourceLabels[item.source], item.batchId, item.startedAt, `观看:${item.viewers}`, `直播GMV:${item.gmv}`]),
      ...evidence.videos.map(item => ["视频", item.id, performanceSourceLabels[item.source], item.batchId, item.publishedAt, `播放:${item.views}`, `互动:${item.interactions}`]),
    ];
    const csv = rows.map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${competitionId}-${teamId}-${periodId}-marketing-performance.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setExportMessage(`已导出当前筛选：${evidence.orders.length} 条订单、${evidence.live.length} 场直播、${evidence.videos.length} 条视频`);
  };

  return (
    <div className="space-y-6" data-testid="pc09-performance">
      <section className="rounded-container border border-border-subtle bg-surface p-5">
        <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-semibold text-text-tertiary">营销实绩 · 统计上下文</p><h2 className="mt-1 text-xl font-semibold">第三方营销数据归集</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">先锁定赛事 / 团队 / 数据周期 / 来源，再看聚合指标和原始明细证据。当前数据仅归集，不自动计入比赛评分。</p></div><button type="button" data-testid="pc09-export" onClick={exportCurrent} className="inline-flex min-h-11 items-center gap-2 rounded-control bg-primary px-4 text-sm font-semibold text-on-primary"><Download size={16} />导出当前筛选</button></div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-control bg-surface-subtle p-3"><p className="text-xs text-text-tertiary">赛事 / 届次</p><p className="mt-2 text-sm font-semibold">{sanChuangProfileByCompetitionId(competitionId)?.shortLabel}</p></div>
          <label className="rounded-control bg-surface-subtle p-3 text-xs font-semibold text-text-tertiary">团队<select data-testid="pc09-team-filter" aria-label="团队筛选" value={teamId} onChange={event => setTeamId(event.target.value)} className="mt-2 block min-h-10 w-full rounded-control border border-border-subtle bg-surface px-2 text-sm font-normal text-text-primary"><option value={record.team.id}>{record.team.name}</option></select></label>
          <div className="rounded-control bg-surface-subtle p-3"><p className="text-xs text-text-tertiary">当前阶段</p><p className="mt-2 text-sm font-semibold">{currentStage?.name ?? "无进行中阶段"}</p></div>
          <label className="rounded-control bg-surface-subtle p-3 text-xs font-semibold text-text-tertiary">数据周期<select data-testid="pc09-period-filter" aria-label="数据周期筛选" value={periodId} onChange={event => setPeriodId(event.target.value)} className="mt-2 block min-h-10 w-full rounded-control border border-border-subtle bg-surface px-2 text-sm font-normal text-text-primary">{performancePeriods.map(period => <option key={period.id} value={period.id}>{period.label}</option>)}</select></label>
          <label className="rounded-control bg-surface-subtle p-3 text-xs font-semibold text-text-tertiary">来源平台<select data-testid="pc09-source-filter" aria-label="来源平台筛选" value={source} onChange={event => setSource(event.target.value as PerformanceSource | "all")} className="mt-2 block min-h-10 w-full rounded-control border border-border-subtle bg-surface px-2 text-sm font-normal text-text-primary"><option value="all">全部来源</option><option value="douyin">抖音</option><option value="sanchuangGoods">三创好物</option></select></label>
        </div>
        {exportMessage && <p data-testid="pc09-export-message" className="mt-3 text-xs font-semibold text-success-text">{exportMessage}</p>}
      </section>

      <section data-testid="pc09-summary" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard testId="pc09-metric-gmv" label="GMV / 成交额" value={money(summary.gmv)} detail={`退款后净额 ${money(summary.netAmount)} · 点击追订单证据`} icon={CircleDollarSign} onClick={() => setEvidenceKind("orders")} />
        <MetricCard testId="pc09-metric-orders" label="订单量" value={`${number(summary.orderCount)} 笔`} detail="订单数量按归集明细计数，不等同有效支付用户数" icon={PackageCheck} onClick={() => setEvidenceKind("orders")} />
        <MetricCard testId="pc09-metric-live" label="直播" value={`${number(summary.liveCount)} 场`} detail={`${number(summary.liveViewers)} 观看 · 直播成交 ${money(summary.liveGmv)}`} icon={Radio} onClick={() => setEvidenceKind("live")} />
        <MetricCard testId="pc09-metric-video" label="视频" value={`${number(summary.videoCount)} 条`} detail={`${number(summary.videoViews)} 播放 · ${number(summary.videoInteractions)} 互动`} icon={Video} onClick={() => setEvidenceKind("videos")} />
      </section>

      <section className="grid gap-4 lg:grid-cols-2" data-testid="pc09-source-aggregation">
        {sourceCards.map(card => <article key={card.sourceId} data-testid={`pc09-source-${card.sourceId}`} className="rounded-container border border-border-subtle bg-surface p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold text-text-tertiary">来源平台</p><h3 className="mt-1 text-lg font-semibold">{performanceSourceLabels[card.sourceId]}</h3></div><button type="button" onClick={() => { setSource(card.sourceId); setEvidenceKind("orders"); }} className="text-xs font-semibold text-text-brand">查看该来源明细</button></div><div className="mt-4 grid grid-cols-3 gap-2"><div className="rounded-control bg-surface-subtle p-3"><p className="text-xs text-text-tertiary">GMV</p><p className="mt-1 text-sm font-semibold">{money(card.summary.gmv)}</p></div><div className="rounded-control bg-surface-subtle p-3"><p className="text-xs text-text-tertiary">直播</p><p className="mt-1 text-sm font-semibold">{card.summary.liveCount} 场</p></div><div className="rounded-control bg-surface-subtle p-3"><p className="text-xs text-text-tertiary">视频</p><p className="mt-1 text-sm font-semibold">{card.summary.videoCount} 条</p></div></div><p className="mt-4 text-xs leading-5 text-text-secondary">最近批次：{card.batches[0]?.importedAt ?? "当前周期无批次"} · 数据状态：{card.batches[0] ? batchStatusLabel(card.batches[0].status) : "无数据"}</p></article>)}
      </section>

      <section className="rounded-container border border-border-subtle bg-surface" data-testid="pc09-batches">
        <div className="flex items-center gap-2 border-b border-border-subtle px-5 py-4"><RefreshCcw size={17} className="text-text-brand" /><h2 className="font-semibold">导入 / 同步批次</h2></div>
        <div className="divide-y divide-border-subtle">{batches.length ? batches.map(batch => <article key={batch.batchId} data-testid={`pc09-batch-${batch.batchId}`} className="grid gap-3 px-5 py-4 lg:grid-cols-[1fr_130px_170px_120px_2fr]"><div><p className="text-sm font-semibold">{performanceSourceLabels[batch.source]}</p><p className="mt-1 font-mono text-[11px] text-text-tertiary">{batch.batchId}</p></div><div><p className="text-xs text-text-tertiary">链路</p><p className="mt-1 text-xs font-semibold">{batch.sourceType === "fileImport" ? "导出文件" : "API mock"}</p></div><div><p className="text-xs text-text-tertiary">导入 / 同步时间</p><p className="mt-1 text-xs font-semibold">{batch.importedAt}</p></div><div><span className={`rounded-full px-2 py-1 text-xs font-semibold ${batchStatusClass(batch.status)}`}>{batchStatusLabel(batch.status)}</span><p className="mt-2 text-xs text-text-secondary">{batch.detailCount} 条明细</p></div><p className="text-xs leading-5 text-text-secondary">{batch.note}</p></article>) : <p className="px-5 py-8 text-center text-sm text-text-secondary">当前筛选没有导入 / 同步批次。</p>}</div>
      </section>

      <section className="rounded-container border border-border-subtle bg-surface" data-testid="pc09-evidence">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle px-5 py-4"><div><div className="flex items-center gap-2"><FileSpreadsheet size={17} className="text-text-brand" /><h2 className="font-semibold">明细证据</h2></div><p className="mt-1 text-xs text-text-secondary">聚合指标 → 来源平台 → 批次 → 原始记录范围。标准字段归集不覆盖原始第三方事实。</p></div><EvidenceTabs kind={evidenceKind} setKind={setEvidenceKind} /></div>
        {evidenceKind === "orders" && <div data-testid="pc09-evidence-orders" className="overflow-x-auto"><table className="min-w-[900px] w-full text-left text-sm"><thead className="bg-surface-subtle text-xs text-text-tertiary"><tr><th className="px-4 py-3">订单</th><th className="px-4 py-3">来源</th><th className="px-4 py-3">批次</th><th className="px-4 py-3">时间</th><th className="px-4 py-3">GMV</th><th className="px-4 py-3">净额口径</th><th className="px-4 py-3">状态</th></tr></thead><tbody>{evidence.orders.map(item => <tr key={item.id} className="border-t border-border-subtle"><td className="px-4 py-3 font-mono text-xs">{item.id}</td><td className="px-4 py-3">{performanceSourceLabels[item.source]}</td><td className="px-4 py-3 font-mono text-xs">{item.batchId}</td><td className="px-4 py-3 text-xs">{item.occurredAt}</td><td className="px-4 py-3 font-semibold">{money(item.grossAmount)}</td><td className="px-4 py-3">{money(item.netAmount)}</td><td className="px-4 py-3 text-xs">{item.status === "paid" ? "已支付" : "部分退款"}</td></tr>)}</tbody></table></div>}
        {evidenceKind === "live" && <div data-testid="pc09-evidence-live" className="overflow-x-auto"><table className="min-w-[900px] w-full text-left text-sm"><thead className="bg-surface-subtle text-xs text-text-tertiary"><tr><th className="px-4 py-3">直播记录</th><th className="px-4 py-3">来源</th><th className="px-4 py-3">批次</th><th className="px-4 py-3">开播</th><th className="px-4 py-3">时长</th><th className="px-4 py-3">观看</th><th className="px-4 py-3">成交</th></tr></thead><tbody>{evidence.live.map(item => <tr key={item.id} className="border-t border-border-subtle"><td className="px-4 py-3 font-mono text-xs">{item.id}</td><td className="px-4 py-3">{performanceSourceLabels[item.source]}</td><td className="px-4 py-3 font-mono text-xs">{item.batchId}</td><td className="px-4 py-3 text-xs">{item.startedAt}</td><td className="px-4 py-3">{item.durationMinutes} 分钟</td><td className="px-4 py-3">{number(item.viewers)}</td><td className="px-4 py-3 font-semibold">{money(item.gmv)}</td></tr>)}</tbody></table></div>}
        {evidenceKind === "videos" && <div data-testid="pc09-evidence-videos" className="overflow-x-auto"><table className="min-w-[850px] w-full text-left text-sm"><thead className="bg-surface-subtle text-xs text-text-tertiary"><tr><th className="px-4 py-3">视频记录</th><th className="px-4 py-3">来源</th><th className="px-4 py-3">批次</th><th className="px-4 py-3">发布</th><th className="px-4 py-3">播放</th><th className="px-4 py-3">互动</th></tr></thead><tbody>{evidence.videos.map(item => <tr key={item.id} className="border-t border-border-subtle"><td className="px-4 py-3 font-mono text-xs">{item.id}</td><td className="px-4 py-3">{performanceSourceLabels[item.source]}</td><td className="px-4 py-3 font-mono text-xs">{item.batchId}</td><td className="px-4 py-3 text-xs">{item.publishedAt}</td><td className="px-4 py-3 font-semibold">{number(item.views)}</td><td className="px-4 py-3">{number(item.interactions)}</td></tr>)}</tbody></table></div>}
      </section>

      <section className="rounded-container border border-info-border bg-info-bg p-4 text-sm leading-6 text-info-text"><strong>评分边界：</strong>当前营销实绩只是第三方数据归集与证据链。原始第三方数据、平台标准字段、聚合展示结果、未来评分结果四层保持分离；在评分规则确认前，本页不会自动计算比赛成绩。</section>
    </div>
  );
}

export function PC09SanChuangOperations({ view }: { view: "overview" | "performance" }) {
  const { competitionId = currentSanChuangCompetitionId } = useParams();
  const profile = sanChuangProfileByCompetitionId(competitionId);
  if (!profile) {
    return <section className="rounded-container border border-border-subtle bg-surface p-8 text-center"><h1 className="text-xl font-semibold">这个 Competition 没有三创赛运营 Profile</h1><p className="mt-2 text-sm text-text-secondary">三创赛垂直能力由集中 capability mapping 决定，不对普通赛事做组件内硬编码特判。</p><Link to={`/admin/sanchuang/${currentSanChuangCompetitionId}`} className="mt-5 inline-flex min-h-11 items-center rounded-control bg-primary px-4 text-sm font-semibold text-on-primary">返回当前三创赛</Link></section>;
  }

  return <div className="space-y-6"><SanChuangHero competitionId={competitionId} view={view} />{view === "performance" ? <SanChuangPerformance competitionId={competitionId} /> : <SanChuangOverview competitionId={competitionId} />}</div>;
}

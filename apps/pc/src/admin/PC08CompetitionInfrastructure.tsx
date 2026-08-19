import { ArrowDown, ArrowUp, CalendarDays, ChevronRight, Database, Tags, Trophy, UsersRound } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PC02HumanCompetitionConsole } from "./PC02HumanCompetitionConsole";
import { competitionControlById } from "./competition-control-data";
import { pc03OrganizationById } from "./PC03State";
import {
  competitionCategories,
  competitionCategoryById,
  competitionInfrastructureById,
  competitionRegistrationProjections,
  deriveCompetitionStageStatus,
  type CompetitionCategory,
  type CompetitionStageStatus,
} from "./pc08-data";

function formatDateTime(value: string) {
  return value.replace("T", " ").replace("+08:00", "");
}

function stageStatusLabel(status: CompetitionStageStatus) {
  if (status === "notStarted") return "未开始";
  if (status === "inProgress") return "进行中";
  return "已结束";
}

function stageStatusClass(status: CompetitionStageStatus) {
  if (status === "inProgress") return "bg-success-bg text-success-text";
  if (status === "notStarted") return "bg-warning-bg text-warning-text";
  return "bg-surface-subtle text-text-secondary";
}

function platformReviewLabel(status: string) {
  if (status === "approved") return "平台审核通过";
  if (status === "rejected") return "平台审核未通过";
  return "平台审核待处理";
}

function officialQualificationLabel(status: string) {
  if (status === "confirmed") return "官方资格已确认";
  if (status === "rejected") return "官方资格未通过";
  if (status === "notRequired") return "无需外部资格确认";
  return "官方资格待确认";
}

function organizationName(organizationId: string) {
  return pc03OrganizationById(organizationId)?.name ?? organizationId;
}

function InfrastructureNav() {
  return (
    <section data-testid="pc08-infrastructure-nav" className="rounded-container border border-border-subtle bg-surface p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-text-tertiary">PC08 · 赛事基础设施</p>
          <p className="mt-1 text-sm text-text-secondary">沿用 Competition / Team / qualification 既有事实，只补分类、阶段和跨赛事查询。</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/admin/competitions/categories" className="inline-flex min-h-10 items-center gap-2 rounded-control bg-primary-container px-3 text-xs font-semibold text-text-brand"><Tags size={15} />比赛分类</Link>
          <Link to="/admin/competitions/registrations" className="inline-flex min-h-10 items-center gap-2 rounded-control bg-primary-container px-3 text-xs font-semibold text-text-brand"><UsersRound size={15} />报名记录</Link>
        </div>
      </div>
    </section>
  );
}

function CompetitionInfrastructurePanel({ competitionId }: { competitionId: string }) {
  const profile = competitionInfrastructureById(competitionId);
  const record = competitionControlById(competitionId);
  if (!profile || !record) return null;
  const category = competitionCategoryById(profile.categoryId);
  const stages = [...profile.stages].sort((a, b) => a.sort - b.sort);

  return (
    <div className="space-y-6" data-testid="pc08-competition-infrastructure">
      <section className="rounded-container border border-border-subtle bg-surface">
        <div className="flex items-center gap-2 border-b border-border-subtle px-5 py-4"><Database size={18} className="text-text-brand" /><h2 className="font-semibold">赛事基础档案增强</h2></div>
        <div className="grid gap-3 p-5 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-control bg-surface-subtle p-3"><p className="text-xs text-text-tertiary">比赛分类（一级）</p><p className="mt-2 text-sm font-semibold">{category?.name ?? "未分类"}</p><p className="mt-1 text-xs text-text-secondary">Category 只回答赛事属于哪一类。</p></div>
          <div className="rounded-control bg-surface-subtle p-3"><p className="text-xs text-text-tertiary">赛事时间</p><p className="mt-2 text-sm font-semibold">{formatDateTime(profile.startAt)}</p><p className="mt-1 text-xs text-text-secondary">至 {formatDateTime(profile.endAt)}</p></div>
          <div className="rounded-control bg-surface-subtle p-3"><p className="text-xs text-text-tertiary">展示状态</p><p className="mt-2 text-sm font-semibold">{profile.displayStatus === "visible" ? "展示中" : "已隐藏"}</p><p className="mt-1 text-xs text-text-secondary">不改变赛事生命周期事实。</p></div>
          <div className="rounded-control bg-surface-subtle p-3"><p className="text-xs text-text-tertiary">来源 / 权威性</p><p className="mt-2 text-sm font-semibold">{record.source}</p><p className="mt-1 text-xs leading-5 text-text-secondary">{profile.authorityNote}</p></div>
        </div>
        <div className="mx-5 mb-5 rounded-control border border-info-border bg-info-bg p-3 text-xs leading-5 text-info-text"><strong>Category ≠ Track / 赛道：</strong>一级分类用于跨赛事归类；赛道仍是某场赛事内部的 Track，不共用字典，也不承载报名规则。</div>
      </section>

      <section className="rounded-container border border-border-subtle bg-surface">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle px-5 py-4"><div className="flex items-center gap-2"><CalendarDays size={18} className="text-text-brand" /><h2 className="font-semibold">阶段 / 赛程</h2></div><span className="text-xs text-text-tertiary">状态由时间推导，不另造人工状态机</span></div>
        <div data-testid="pc08-stage-list" className="grid gap-3 p-5 lg:grid-cols-2">
          {stages.map(stage => {
            const status = deriveCompetitionStageStatus(stage);
            return <article key={stage.stageId} data-testid={`pc08-stage-${stage.stageId}`} className="rounded-container border border-border-subtle p-4">
              <div className="flex items-start justify-between gap-3"><div><p className="text-xs text-text-tertiary">阶段 {stage.sort}</p><h3 className="mt-1 text-sm font-semibold">{stage.name}</h3></div><span className={`rounded-full px-2 py-1 text-xs font-semibold ${stageStatusClass(status)}`}>{stageStatusLabel(status)}</span></div>
              <p className="mt-3 text-xs leading-5 text-text-secondary">{formatDateTime(stage.startAt)} → {formatDateTime(stage.endAt)}</p>
              <p className="mt-1 text-xs text-text-tertiary">地点：{stage.location ?? "线上 / 待赛事方确认"} · {stage.visible ? "前台展示" : "前台隐藏"}</p>
              <p data-pc05-technical className="mt-2 font-mono text-[11px] text-text-tertiary">stageId={stage.stageId} · competitionId={stage.competitionId}</p>
            </article>;
          })}
        </div>
      </section>
    </div>
  );
}

export function PC08CompetitionDetail() {
  const { competitionId } = useParams();
  return (
    <div className="space-y-6">
      <InfrastructureNav />
      <PC02HumanCompetitionConsole />
      {competitionId && <CompetitionInfrastructurePanel competitionId={competitionId} />}
    </div>
  );
}

function CategoryConsole() {
  const [categories, setCategories] = useState<CompetitionCategory[]>(() => [...competitionCategories].sort((a, b) => a.sort - b.sort));

  const moveCategory = (index: number, delta: number) => {
    setCategories(current => {
      const target = index + delta;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next.map((item, order) => ({ ...item, sort: (order + 1) * 10 }));
    });
  };

  const toggleCategory = (categoryId: string) => {
    setCategories(current => current.map(item => item.id === categoryId ? { ...item, enabled: !item.enabled } : item));
  };

  return (
    <div className="space-y-6">
      <section className="rounded-container border border-border-subtle bg-surface p-6">
        <Link to="/admin/competitions" className="text-sm font-semibold text-text-brand">返回赛事列表</Link>
        <h1 className="mt-4 text-2xl font-semibold">比赛分类</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">这里只维护一级 Category 的名称、排序与启停。赛事内部 Track / 赛道继续由赛事详情维护，分类不承担报名规则。</p>
      </section>
      <section className="rounded-container border border-border-subtle bg-surface">
        <div className="grid grid-cols-[80px_1fr_110px_180px] gap-3 border-b border-border-subtle px-5 py-3 text-xs font-semibold text-text-tertiary"><span>排序</span><span>分类</span><span>状态</span><span>操作</span></div>
        <div data-testid="pc08-category-list">
          {categories.map((category, index) => <div key={category.id} data-testid={`pc08-category-row-${category.id}`} className="grid grid-cols-[80px_1fr_110px_180px] items-center gap-3 border-b border-border-subtle px-5 py-4 last:border-b-0">
            <span className="text-sm font-semibold">{category.sort}</span>
            <div><p className="text-sm font-semibold">{category.name}</p><p data-pc05-technical className="mt-1 font-mono text-xs text-text-tertiary">categoryId={category.id}</p></div>
            <span className={`w-fit rounded-full px-2 py-1 text-xs font-semibold ${category.enabled ? "bg-success-bg text-success-text" : "bg-surface-subtle text-text-tertiary"}`}>{category.enabled ? "启用" : "停用"}</span>
            <div className="flex gap-1"><button type="button" aria-label={`上移 ${category.name}`} disabled={index === 0} onClick={() => moveCategory(index, -1)} className="rounded-control border border-border-subtle p-2 disabled:opacity-30"><ArrowUp size={15} /></button><button type="button" aria-label={`下移 ${category.name}`} disabled={index === categories.length - 1} onClick={() => moveCategory(index, 1)} className="rounded-control border border-border-subtle p-2 disabled:opacity-30"><ArrowDown size={15} /></button><button type="button" onClick={() => toggleCategory(category.id)} className="min-h-9 rounded-control bg-primary-container px-3 text-xs font-semibold text-text-brand">{category.enabled ? "停用" : "启用"}</button></div>
          </div>)}
        </div>
      </section>
    </div>
  );
}

function RegistrationConsole() {
  const records = useMemo(() => competitionRegistrationProjections(), []);
  const [competitionFilter, setCompetitionFilter] = useState("all");
  const visibleRecords = competitionFilter === "all" ? records : records.filter(record => record.competitionId === competitionFilter);

  return (
    <div className="space-y-6">
      <section className="rounded-container border border-border-subtle bg-surface p-6">
        <Link to="/admin/competitions" className="text-sm font-semibold text-text-brand">返回赛事列表</Link>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div><h1 className="text-2xl font-semibold">比赛报名记录</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">这是对现有 Team / 报名门户 / qualification 事实的跨赛事投影，不创建第二份 Registration Store，也不维护任何赛事缴费状态或支付字段。</p></div>
          <label className="text-xs font-semibold text-text-secondary">按赛事筛选<select aria-label="按赛事筛选" value={competitionFilter} onChange={event => setCompetitionFilter(event.target.value)} className="ml-2 min-h-10 rounded-control border border-border-subtle bg-surface px-3 text-sm font-normal"><option value="all">全部赛事</option>{records.map(record => <option key={record.competitionId} value={record.competitionId}>{record.competitionName}</option>)}</select></label>
        </div>
      </section>
      <section className="overflow-x-auto rounded-container border border-border-subtle bg-surface">
        <table className="min-w-[1120px] w-full text-left text-sm">
          <thead className="bg-surface-subtle text-xs text-text-tertiary"><tr><th className="px-4 py-3">团队 / 队长</th><th className="px-4 py-3">学校</th><th className="px-4 py-3">赛事</th><th className="px-4 py-3">平台审核</th><th className="px-4 py-3">官方资格</th><th className="px-4 py-3">报名时间</th><th className="px-4 py-3">数据来源</th><th className="px-4 py-3">下钻</th></tr></thead>
          <tbody>{visibleRecords.map(record => <tr key={record.projectionId} data-testid={`pc08-registration-${record.competitionId}`} className="border-t border-border-subtle align-top"><td className="px-4 py-4"><p className="font-semibold">{record.teamName}</p><p className="mt-1 text-xs text-text-secondary">{record.leaderName} · 队长</p><p data-pc05-technical className="mt-1 font-mono text-[11px] text-text-tertiary">teamId={record.teamId}</p></td><td className="px-4 py-4 text-xs leading-5">{organizationName(record.schoolOrganizationId)}</td><td className="px-4 py-4"><p className="max-w-64 font-medium leading-5">{record.competitionName}</p></td><td className="px-4 py-4 text-xs">{platformReviewLabel(record.platformReview)}</td><td className="px-4 py-4 text-xs">{officialQualificationLabel(record.officialQualification)}</td><td className="px-4 py-4 text-xs text-text-secondary">{record.registeredAt}</td><td className="px-4 py-4 text-xs leading-5 text-text-secondary">{record.dataSource}</td><td className="px-4 py-4"><div className="flex flex-col items-start gap-2"><Link to={`/admin/competitions/objects/${record.competitionId}`} className="inline-flex items-center gap-1 text-xs font-semibold text-text-brand">赛事详情<ChevronRight size={14} /></Link>{record.registrationPath ? <Link to={record.registrationPath} className="inline-flex items-center gap-1 text-xs font-semibold text-text-brand">现有报名门户<ChevronRight size={14} /></Link> : <span data-testid="pc08-registration-portal-unconfigured" className="text-xs text-text-tertiary">当前赛事尚未配置报名门户</span>}</div></td></tr>)}</tbody>
        </table>
      </section>
    </div>
  );
}

export function PC08CompetitionInfrastructureConsole({ view }: { view: "categories" | "registrations" }) {
  return view === "categories" ? <CategoryConsole /> : <RegistrationConsole />;
}

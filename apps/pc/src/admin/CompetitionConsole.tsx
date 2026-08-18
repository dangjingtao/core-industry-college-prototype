import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  CalendarDays,
  ChevronRight,
  CircleAlert,
  Database,
  FileText,
  GraduationCap,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Trophy,
  UsersRound,
  Workflow,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Link, NavLink, useParams } from "react-router-dom";
import { StatusTag } from "../components/ui";
import {
  competitionControlById,
  registrationModeLabels,
  type CompetitionControlRecord,
  type CompetitionControlSource,
  type OfficialQualificationStatus,
  type PlatformReviewStatus,
} from "./competition-control-data";

const sourceTone: Record<CompetitionControlSource, "info" | "success" | "warning" | "neutral"> = {
  平台配置: "info",
  "API 同步": "success",
  文件导入: "neutral",
  人工修正: "warning",
  Runtime: "neutral",
};

const platformReviewLabels: Record<PlatformReviewStatus, string> = {
  pending: "pending",
  approved: "approved",
  rejected: "rejected",
};

const officialQualificationLabels: Record<OfficialQualificationStatus, string> = {
  pending: "pending",
  confirmed: "confirmed",
  rejected: "rejected",
  notRequired: "notRequired",
};

function StableId({ field, value }: { field: string; value: string }) {
  return (
    <span className="inline-flex max-w-full items-center gap-1.5 rounded-control bg-surface-subtle px-2.5 py-1 font-mono text-xs text-text-primary">
      <span className="text-text-tertiary">{field}</span>
      <span className="truncate font-semibold">{value}</span>
    </span>
  );
}

function SourceTag({ source }: { source: CompetitionControlSource }) {
  return <StatusTag tone={sourceTone[source]}>{source}</StatusTag>;
}

function AdminShell({ children }: { children: ReactNode }) {
  const navigation = [
    ["总览", "/admin"],
    ["赛事中心", "/admin/competitions"],
    ["主体与学校", "/admin/organizations"],
    ["资源运营", "/admin/resources"],
    ["学生与赛事身份", "/admin/students"],
    ["资产与可信凭证", "/admin/assets"],
    ["内容与活动", "/admin/content"],
    ["Workshop", "/admin/workshop"],
  ] as const;
  const itemClass = ({ isActive }: { isActive: boolean }) =>
    `mb-1 flex min-h-11 items-center justify-between rounded-control px-3 text-sm font-medium transition ${isActive ? "bg-surface-subtle text-text-brand" : "text-text-secondary hover:bg-surface-subtle"}`;

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-border-subtle bg-surface lg:flex lg:flex-col">
        <div className="border-b border-border-subtle px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-control bg-primary text-on-primary"><Database size={20} aria-hidden="true" /></div>
            <div><p className="text-sm font-semibold">核心产业学院</p><p className="mt-0.5 text-xs text-text-tertiary">赛事控制面 · PC02</p></div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto p-3" aria-label="管理端主导航">
          {navigation.map(([label, to]) => <NavLink key={to} to={to} end={to === "/admin"} className={itemClass}>{label}<ChevronRight size={15} aria-hidden="true" /></NavLink>)}
        </nav>
        <div className="border-t border-border-subtle p-3">
          <Link to="/registration-portal/start" className="flex min-h-11 items-center justify-between rounded-control px-3 text-sm font-medium text-text-secondary hover:bg-surface-subtle">三创赛报名门户<ChevronRight size={15} aria-hidden="true" /></Link>
        </div>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-border-subtle bg-surface/95 backdrop-blur">
          <div className="mx-auto flex min-h-16 max-w-[1480px] items-center justify-between gap-4 px-5 lg:px-8">
            <div><p className="text-xs font-medium text-text-tertiary">PC 管理端 / 赛事中心</p><p className="text-sm font-semibold">外部赛事事实 · 平台报名流程 · 学院叠加服务</p></div>
            <StatusTag tone="info">PC02 赛事控制台</StatusTag>
          </div>
        </header>
        <main className="mx-auto max-w-[1480px] p-5 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

function TruthLayer({ eyebrow, title, detail, icon }: { eyebrow: string; title: string; detail: string; icon: ReactNode }) {
  return <div className="rounded-container border border-border-subtle bg-surface p-5"><div className="flex items-start gap-3"><div className="flex size-10 shrink-0 items-center justify-center rounded-control bg-surface-subtle text-text-brand">{icon}</div><div><p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-tertiary">{eyebrow}</p><h2 className="mt-1 font-semibold text-text-primary">{title}</h2><p className="mt-2 text-sm leading-6 text-text-secondary">{detail}</p></div></div></div>;
}

function SectionCard({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return <section className="rounded-container border border-border-subtle bg-surface"><div className="flex items-center gap-2 border-b border-border-subtle px-5 py-4"><span className="text-text-brand">{icon}</span><h2 className="font-semibold text-text-primary">{title}</h2></div><div className="p-5">{children}</div></section>;
}

function ValueCard({ label, children }: { label: string; children: ReactNode }) {
  return <div className="rounded-control bg-surface-subtle p-3"><p className="text-xs font-medium text-text-tertiary">{label}</p><div className="mt-2 text-sm font-medium leading-6 text-text-primary">{children}</div></div>;
}

function QualificationPanel({ record }: { record: CompetitionControlRecord }) {
  const [platformReview, setPlatformReview] = useState<PlatformReviewStatus>(record.qualification.platformReview);
  const [officialQualification, setOfficialQualification] = useState<OfficialQualificationStatus>(record.qualification.officialQualification);
  const workspaceOpen = record.authorityMode === "externalAuthority"
    ? platformReview === "approved" && officialQualification === "confirmed"
    : platformReview === "approved" && officialQualification === "notRequired";

  return (
    <SectionCard title="报名资格：平台流程与官方事实分层" icon={<BadgeCheck size={19} aria-hidden="true" />}>
      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-container border border-border-subtle p-4">
          <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-semibold text-text-tertiary">平台报名 / 学校审核</p><p className="mt-1 text-sm font-semibold">核心产业学院流程事实</p></div><StatusTag tone={platformReview === "approved" ? "success" : platformReview === "rejected" ? "danger" : "warning"}><span data-testid="platform-review-status">{platformReviewLabels[platformReview]}</span></StatusTag></div>
          <p className="mt-3 text-xs leading-5 text-text-secondary">学校老师只处理当前赛事与授权学校范围内的报名真实性。平台 approved 不写成 officialConfirmed。</p>
          {record.authorityMode === "externalAuthority" && <div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={() => setPlatformReview("approved")} className="min-h-10 rounded-control bg-primary-container px-3 text-xs font-semibold text-text-brand">学校审核通过</button><button type="button" onClick={() => setPlatformReview("rejected")} className="min-h-10 rounded-control bg-surface-subtle px-3 text-xs font-semibold text-text-secondary">学校驳回</button></div>}
        </div>
        <div className="rounded-container border border-border-subtle p-4">
          <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-semibold text-text-tertiary">官方参赛资格</p><p className="mt-1 text-sm font-semibold">{record.authorityMode === "externalAuthority" ? "外部权威赛事事实" : "本赛事无需外部权威回流"}</p></div><StatusTag tone={officialQualification === "confirmed" || officialQualification === "notRequired" ? "success" : officialQualification === "rejected" ? "danger" : "warning"}><span data-testid="official-qualification-status">{officialQualificationLabels[officialQualification]}</span></StatusTag></div>
          <p className="mt-3 text-xs leading-5 text-text-secondary">{record.qualification.workspaceRule}</p>
          {record.authorityMode === "externalAuthority" && <div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={() => setOfficialQualification("confirmed")} className="min-h-10 rounded-control bg-primary px-3 text-xs font-semibold text-on-primary">模拟 API 回流：官方确认</button><button type="button" onClick={() => setOfficialQualification("rejected")} className="min-h-10 rounded-control bg-surface-subtle px-3 text-xs font-semibold text-text-secondary">模拟官方拒绝</button></div>}
        </div>
      </div>
      <div className={`mt-4 rounded-control px-4 py-3 text-sm font-medium ${workspaceOpen ? "bg-success-bg text-success-text" : "bg-warning-bg text-warning-text"}`} data-testid="workspace-gate">
        {workspaceOpen ? "正式 Workspace：可进入" : "正式 Workspace：保持锁定"} · 平台审核通过不等于官方资格确认
      </div>
      {record.authorityMode === "externalAuthority" && <button type="button" onClick={() => { setPlatformReview(record.qualification.platformReview); setOfficialQualification(record.qualification.officialQualification); }} className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-control px-3 text-xs font-semibold text-text-secondary hover:bg-surface-subtle"><RefreshCw size={14} aria-hidden="true" />重置资格演示</button>}
    </SectionCard>
  );
}

function CompetitionConsolePage({ record }: { record: CompetitionControlRecord }) {
  return (
    <div className="space-y-6">
      <section className="rounded-container border border-border-subtle bg-surface p-6 lg:p-8">
        <Link to="/admin/competitions" className="inline-flex items-center gap-1 text-sm font-medium text-text-brand"><ArrowLeft size={15} aria-hidden="true" />返回赛事中心</Link>
        <div className="mt-5 flex flex-wrap items-start justify-between gap-5">
          <div className="max-w-4xl"><div className="flex flex-wrap items-center gap-2"><SourceTag source={record.source} /><StatusTag tone={record.status === "registrationOpen" ? "success" : record.status === "upcoming" ? "warning" : "info"}>{record.status}</StatusTag></div><h1 className="mt-3 text-2xl font-semibold leading-8 text-text-primary">{record.name}</h1><div className="mt-3"><StableId field="competitionId" value={record.id} /></div><p className="mt-4 text-sm leading-6 text-text-secondary">{record.sourceDetail}</p></div>
          {record.registration.portalPath && <Link to={record.registration.portalPath} className="inline-flex min-h-11 items-center gap-2 rounded-control bg-primary-container px-4 text-sm font-semibold text-text-brand">进入现有报名门户<ChevronRight size={16} aria-hidden="true" /></Link>}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-3" aria-label="PC02 三层事实边界">
        <TruthLayer eyebrow="Authority" title="外部权威赛事事实" detail={record.authorityMode === "externalAuthority" ? "赛事窗口、官方规则、最终参赛资格等以外部权威来源为准。" : "该合作赛事由平台直接配置，不虚构一个外部权威状态。"} icon={<ShieldCheck size={19} aria-hidden="true" />} />
        <TruthLayer eyebrow="Registration Runtime" title="平台承接报名流程" detail="平台可承接报名、队长 / 队员、学校审核与状态回流，但流程状态不能冒充官方最终资格。" icon={<Workflow size={19} aria-hidden="true" />} />
        <TruthLayer eyebrow="Platform Services" title="核心产业学院叠加服务" detail="赛事专属课程、权益、活动与 Workshop 属于学院平台能力，不描述成赛事官方服务。" icon={<Sparkles size={19} aria-hidden="true" />} />
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <SectionCard title="赛事基础资料与报名接入" icon={<Trophy size={19} aria-hidden="true" />}>
          <div className="grid gap-3 sm:grid-cols-2">
            <ValueCard label="主办 / 组织方">{record.organizer}</ValueCard>
            <ValueCard label="报名接入方式"><span className="block">{registrationModeLabels[record.registration.mode]}</span><span className="mt-1 block text-xs font-normal text-text-secondary">{record.registration.label} · {record.registration.detail}</span></ValueCard>
            <ValueCard label="赛道 / 组别">{record.tracks.map(track => <div key={track.id} className="mb-1 last:mb-0"><span>{track.name}</span><span className="ml-2 font-mono text-xs text-text-tertiary">{track.id}</span></div>)}</ValueCard>
            <ValueCard label="官方数据同步"><span>{record.sync.priority}</span><span className="mt-1 block text-xs font-normal text-text-secondary">最近同步：{record.sync.lastSync}</span></ValueCard>
          </div>
          <div className="mt-3 rounded-control bg-surface-subtle p-3 text-xs leading-5 text-text-secondary"><strong className="text-text-primary">冲突策略：</strong>{record.sync.conflictPolicy}<br /><strong className="text-text-primary">兜底：</strong>{record.sync.fallback}</div>
        </SectionCard>

        <SectionCard title="官方窗口与地方节点" icon={<CalendarDays size={19} aria-hidden="true" />}>
          <div className="space-y-3">{record.windows.official.map(item => <div key={item.label} className="rounded-control bg-surface-subtle p-3"><div className="flex flex-wrap items-center justify-between gap-2"><strong className="text-sm">{item.label}</strong><StatusTag tone="success">统一窗口</StatusTag></div><p className="mt-2 text-sm text-text-primary">{item.value}</p><p className="mt-1 text-xs text-text-tertiary">责任：{item.owner}</p></div>)}</div>
          <div className="mt-4 border-t border-border-subtle pt-4"><p className="text-xs font-semibold text-text-tertiary">地方执行节点</p>{record.windows.local.length ? <div className="mt-2 space-y-2">{record.windows.local.map(node => <div key={node.id} className="rounded-control border border-border-subtle p-3"><strong className="text-sm">{node.label}</strong><p className="mt-1 text-sm">{node.value}</p><p className="mt-1 text-xs text-text-tertiary">{node.scope} · {node.owner}</p></div>)}</div> : <p className="mt-2 text-sm text-text-secondary">当前无地方节点；不会为了页面完整度生成虚假节点。</p>}</div>
        </SectionCard>
      </div>

      <QualificationPanel record={record} />

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <SectionCard title="学校授权与审核责任" icon={<GraduationCap size={19} aria-hidden="true" />}>
          <div className="rounded-control bg-info-bg p-4 text-sm leading-6 text-info-text"><strong>{record.schoolScope.reviewOwnerRule}</strong><p className="mt-1 text-xs">{record.schoolScope.note}</p></div>
          <div className="mt-4"><p className="text-xs font-semibold text-text-tertiary">当前授权学校</p><div className="mt-2 flex flex-wrap gap-2">{record.schoolScope.authorizedSchools.map(school => <StatusTag key={school} tone="info">{school}</StatusTag>)}</div></div>
        </SectionCard>

        <SectionCard title="团队 / TeamMember / CompetitionProject" icon={<UsersRound size={19} aria-hidden="true" />}>
          <div className="grid gap-3 md:grid-cols-2"><ValueCard label="Team"><StableId field="teamId" value={record.team.id} /><p className="mt-2">{record.team.name}</p><p className="mt-1 text-xs font-normal text-text-secondary">队长学校：{record.team.captainSchool}</p></ValueCard><ValueCard label="CompetitionProject"><StableId field="projectId" value={record.project.id} /><p className="mt-2">{record.project.name}</p><p className="mt-1 text-xs font-normal text-text-secondary">{record.project.track} · {record.project.stage}</p></ValueCard></div>
          <p className="mt-3 rounded-control bg-warning-bg px-3 py-2 text-xs leading-5 text-warning-text">CompetitionProject 只属于当前赛事上下文；赛事结束后 handoff 摘要 / 经历 / 团队角色 / 成绩 / 证书，不建立跨赛事长期 Project。</p>
          <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[620px] text-left text-xs"><thead className="text-text-tertiary"><tr><th className="pb-2 pr-3">成员</th><th className="pb-2 pr-3">角色</th><th className="pb-2 pr-3">学校</th><th className="pb-2">审核责任</th></tr></thead><tbody className="divide-y divide-border-subtle">{record.team.members.map(member => <tr key={member.id}><td className="py-3 pr-3 font-medium">{member.name}</td><td className="py-3 pr-3 text-text-secondary">{member.role}</td><td className="py-3 pr-3 text-text-secondary">{member.school}</td><td className="py-3 text-text-secondary">统一归队长学校：{record.team.captainSchool}</td></tr>)}</tbody></table></div>
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="赛事资料" icon={<FileText size={19} aria-hidden="true" />}>
          <div className="space-y-2">{record.resources.map(resource => <div key={resource.id} className="flex flex-wrap items-center justify-between gap-3 rounded-control bg-surface-subtle p-3"><div><strong className="text-sm">{resource.title}</strong><p className="mt-1 font-mono text-xs text-text-tertiary">{resource.id} · {resource.category} · {resource.updatedAt}</p></div><SourceTag source={resource.source} /></div>)}</div>
        </SectionCard>

        <SectionCard title="赛事专属课程 / 权益 / 活动关联" icon={<Building2 size={19} aria-hidden="true" />}>
          <div className="space-y-4">{(["courses", "benefits", "activities"] as const).map(key => <div key={key}><p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-tertiary">{key === "courses" ? "Courses" : key === "benefits" ? "Benefits" : "Activities"}</p>{record.services[key].length ? <div className="mt-2 flex flex-wrap gap-2">{record.services[key].map(item => <span key={item.id} className="rounded-control bg-surface-subtle px-3 py-2 text-sm"><strong>{item.name}</strong><span className="ml-2 font-mono text-xs text-text-tertiary">{item.id}</span></span>)}</div> : <p className="mt-2 text-sm text-text-tertiary">未配置</p>}</div>)}</div>
        </SectionCard>
      </div>

      <SectionCard title="Workshop 配置与赛事 scope" icon={<Sparkles size={19} aria-hidden="true" />}>
        <div className="grid gap-4 xl:grid-cols-[0.75fr_1.25fr]"><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1"><ValueCard label="启用状态"><StatusTag tone={record.workshop.enabled ? "success" : "neutral"}>{record.workshop.enabled ? "enabled" : "disabled"}</StatusTag></ValueCard><ValueCard label="赛事 Scope"><span className="font-mono text-xs">{record.workshop.scope}</span></ValueCard><ValueCard label="Lifecycle">{record.workshop.lifecycle}</ValueCard></div><div><p className="text-xs font-semibold text-text-tertiary">能力包</p><div className="mt-2 flex flex-wrap gap-2">{record.workshop.skillPack.map(skill => <StatusTag key={skill} tone="info">{skill}</StatusTag>)}</div><div className="mt-4 rounded-control bg-warning-bg p-4 text-sm leading-6 text-warning-text"><strong>隐私边界：</strong>{record.workshop.privacy}</div></div></div>
      </SectionCard>

      <SectionCard title="学校老师数据可见范围" icon={<ShieldCheck size={19} aria-hidden="true" />}>
        <div className="grid gap-4 lg:grid-cols-2"><div className="rounded-container border border-border-subtle p-4"><div className="flex items-center gap-2"><BadgeCheck size={17} className="text-success-text" aria-hidden="true" /><strong className="text-sm">允许</strong></div><div className="mt-3 space-y-2">{record.teacherScope.allowed.map(item => <div key={item} className="rounded-control bg-success-bg px-3 py-2 text-xs text-success-text">{item}</div>)}</div></div><div className="rounded-container border border-border-subtle p-4"><div className="flex items-center gap-2"><CircleAlert size={17} className="text-danger-text" aria-hidden="true" /><strong className="text-sm">默认禁止</strong></div><div className="mt-3 space-y-2">{record.teacherScope.denied.map(item => <div key={item} className="rounded-control bg-danger-bg px-3 py-2 text-xs text-danger-text">{item}</div>)}</div></div></div>
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="App 消费位置" icon={<Workflow size={19} aria-hidden="true" />}><div className="flex flex-wrap gap-2">{record.appConsumers.map(route => <span key={route} className="rounded-control bg-surface-subtle px-3 py-2 font-mono text-xs text-text-primary">{route}</span>)}</div></SectionCard>
        <SectionCard title="稳定业务关系" icon={<Database size={19} aria-hidden="true" />}><div className="grid gap-2">{record.relations.map(relation => relation.to ? <Link key={relation.stableId} to={relation.to} className="flex items-center justify-between rounded-control border border-border-subtle p-3 hover:bg-surface-subtle"><div><strong className="text-sm">{relation.label}</strong><p className="mt-1 font-mono text-xs text-text-tertiary">{relation.stableId}</p></div><ChevronRight size={16} aria-hidden="true" /></Link> : <div key={relation.stableId} className="rounded-control border border-border-subtle p-3"><strong className="text-sm">{relation.label}</strong><p className="mt-1 font-mono text-xs text-text-tertiary">{relation.stableId}</p></div>)}</div></SectionCard>
      </div>
    </div>
  );
}

export function CompetitionConsole() {
  const { competitionId } = useParams();
  const record = competitionControlById(competitionId);
  if (!record) return <AdminShell><div className="rounded-container border border-border-subtle bg-surface p-8 text-center"><h1 className="text-xl font-semibold">赛事不存在</h1><p className="mt-2 text-sm text-text-secondary">PC02 不为未知 competitionId 临时生成业务事实。</p><Link to="/admin/competitions" className="mt-5 inline-flex min-h-11 items-center rounded-control bg-primary-container px-4 text-sm font-semibold text-text-brand">返回赛事中心</Link></div></AdminShell>;
  return <AdminShell><CompetitionConsolePage record={record} /></AdminShell>;
}

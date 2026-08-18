import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  CalendarDays,
  ChevronRight,
  FileText,
  GraduationCap,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Trophy,
  UsersRound,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { StatusTag } from "../components/ui";
import {
  competitionControlById,
  type CompetitionControlRecord,
  type OfficialQualificationStatus,
  type PlatformReviewStatus,
} from "./competition-control-data";
import { pc03OrganizationById } from "./PC03State";

function SectionCard({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-container border border-border-subtle bg-surface">
      <div className="flex items-center gap-2 border-b border-border-subtle px-5 py-4">
        <span className="text-text-brand">{icon}</span>
        <h2 className="font-semibold">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function ValueCard({ label, children }: { label: string; children: ReactNode }) {
  return <div className="rounded-control bg-surface-subtle p-3"><p className="text-xs text-text-tertiary">{label}</p><div className="mt-2 text-sm font-medium leading-6">{children}</div></div>;
}

function statusTone(status: string): "info" | "success" | "warning" | "danger" | "neutral" {
  if (["registrationOpen", "inProgress", "approved", "confirmed", "notRequired", "healthy", "enabled"].includes(status)) return "success";
  if (["pending", "upcoming", "attention"].includes(status)) return "warning";
  if (["rejected"].includes(status)) return "danger";
  return "neutral";
}

function competitionStatusLabel(status: CompetitionControlRecord["status"]) {
  return ({ upcoming: "即将开始", registrationOpen: "报名中", inProgress: "进行中", ended: "已结束" } as const)[status];
}

function platformReviewLabel(status: PlatformReviewStatus) {
  return ({ pending: "待学校审核", approved: "学校审核已通过", rejected: "学校审核未通过" } as const)[status];
}

function officialQualificationLabel(status: OfficialQualificationStatus) {
  return ({ pending: "官方资格待确认", confirmed: "官方资格已确认", rejected: "官方资格未通过", notRequired: "本赛事无需外部资格确认" } as const)[status];
}

function syncLabel(status: CompetitionControlRecord["sync"]["state"]) {
  return ({ healthy: "同步正常", attention: "需要关注", notRequired: "无需外部同步" } as const)[status];
}

function lifecycleLabel(value: string) {
  if (value === "notStarted") return "尚未开始";
  if (value === "inProgress") return "进行中";
  if (value === "ended") return "已结束";
  return value;
}

function humanizeText(value: string) {
  return value
    .replaceAll("CompetitionProject", "参赛项目")
    .replaceAll("Workshop", "创赛工坊")
    .replaceAll("SchoolScope", "学校授权范围")
    .replaceAll("Workspace", "赛事工作区")
    .replaceAll("Organization", "合作主体")
    .replaceAll("handoff", "沉淀")
    .replaceAll(" scope", "范围")
    .replaceAll("Scope", "范围");
}

function organizationName(organizationId: string) {
  return pc03OrganizationById(organizationId)?.name ?? "未识别主体";
}

function OrganizationLink({ organizationId }: { organizationId: string }) {
  return (
    <Link to={`/admin/organizations/${organizationId}`} className="inline-flex items-center gap-2 rounded-control bg-surface-subtle px-3 py-2 text-sm font-semibold text-text-brand hover:bg-surface-pressed">
      {organizationName(organizationId)}
      <span data-pc05-technical className="font-mono text-xs text-text-tertiary">organizationId={organizationId}</span>
    </Link>
  );
}

function normalizedRelationPath(to?: string) {
  if (!to) return undefined;
  const org = to.match(/^\/admin\/organizations\/objects\/(.+)$/);
  if (org) return `/admin/organizations/${org[1]}`;
  const opportunity = to.match(/^\/admin\/resources\/objects\/opportunity-(.+)$/);
  if (opportunity) return `/admin/opportunities/${opportunity[1]}`;
  const course = to.match(/^\/admin\/resources\/objects\/course-(.+)$/);
  if (course) return `/admin/pc04/courses/${course[1]}`;
  const benefit = to.match(/^\/admin\/resources\/objects\/(benefit-.+)$/);
  if (benefit) return `/admin/pc04/benefits/${benefit[1]}`;
  return to;
}

function QualificationPanel({ record }: { record: CompetitionControlRecord }) {
  const [platformReview, setPlatformReview] = useState<PlatformReviewStatus>(record.qualification.platformReview);
  const [officialQualification, setOfficialQualification] = useState<OfficialQualificationStatus>(record.qualification.officialQualification);
  const lifecycleAllowsWorkspace = record.status === "registrationOpen" || record.status === "inProgress";
  const qualificationAllowsWorkspace = record.authorityMode === "externalAuthority"
    ? platformReview === "approved" && officialQualification === "confirmed"
    : platformReview === "approved" && officialQualification === "notRequired";
  const workspaceOpen = lifecycleAllowsWorkspace && qualificationAllowsWorkspace;

  return (
    <SectionCard title="报名审核与官方资格" icon={<BadgeCheck size={19} />}>
      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-container border border-border-subtle p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><p className="text-xs text-text-tertiary">学校审核</p><p className="mt-1 text-sm font-semibold">平台报名流程</p></div>
            <StatusTag tone={statusTone(platformReview)}><span data-testid="platform-review-status">{platformReviewLabel(platformReview)}</span></StatusTag>
          </div>
          <p className="mt-3 text-xs leading-5 text-text-secondary">学校审核通过代表平台报名流程完成；外部赛事的最终参赛资格仍需等待官方确认。</p>
          {record.authorityMode === "externalAuthority" && <div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={() => setPlatformReview("approved")} className="min-h-10 rounded-control bg-primary-container px-3 text-xs font-semibold text-text-brand">学校审核通过</button><button type="button" onClick={() => setPlatformReview("rejected")} className="min-h-10 rounded-control bg-surface-subtle px-3 text-xs font-semibold">学校驳回</button></div>}
        </div>
        <div className="rounded-container border border-border-subtle p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><p className="text-xs text-text-tertiary">官方参赛资格</p><p className="mt-1 text-sm font-semibold">{record.authorityMode === "externalAuthority" ? "等待赛事官方回流" : "由本赛事平台规则确认"}</p></div>
            <StatusTag tone={statusTone(officialQualification)}><span data-testid="official-qualification-status">{officialQualificationLabel(officialQualification)}</span></StatusTag>
          </div>
          <p className="mt-3 text-xs leading-5 text-text-secondary">{record.authorityMode === "externalAuthority" ? "平台审核完成后仍需等官方资格确认，才能开放赛事工作区。" : "本赛事无需外部资格回流，满足平台审核与赛事时间条件后即可开放赛事工作区。"}</p>
          {record.authorityMode === "externalAuthority" && <div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={() => setOfficialQualification("confirmed")} className="min-h-10 rounded-control bg-primary px-3 text-xs font-semibold text-on-primary">模拟官方资格确认</button><button type="button" onClick={() => setOfficialQualification("rejected")} className="min-h-10 rounded-control bg-surface-subtle px-3 text-xs font-semibold">模拟官方资格未通过</button></div>}
        </div>
      </div>
      <div data-testid="workspace-gate" className={`mt-4 rounded-control px-4 py-3 text-sm font-medium ${workspaceOpen ? "bg-success-bg text-success-text" : "bg-warning-bg text-warning-text"}`}>
        {workspaceOpen ? "赛事工作区：可进入" : "赛事工作区：暂未开放"} · {lifecycleAllowsWorkspace ? "需同时满足学校审核与资格条件" : "赛事尚未进入开放阶段"}
      </div>
      {record.authorityMode === "externalAuthority" && <button type="button" onClick={() => { setPlatformReview(record.qualification.platformReview); setOfficialQualification(record.qualification.officialQualification); }} className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-control px-3 text-xs font-semibold hover:bg-surface-subtle"><RefreshCw size={14} />重置资格演示</button>}
      <div data-pc05-technical className="mt-4 rounded-control bg-surface-subtle p-3 font-mono text-xs text-text-tertiary">platformReview={platformReview} · officialQualification={officialQualification} · workspaceRule={record.qualification.workspaceRule}</div>
    </SectionCard>
  );
}

function CompetitionPage({ record }: { record: CompetitionControlRecord }) {
  const leaderSchoolName = organizationName(record.team.leaderSchoolId);
  const registrationMode = record.registration.mode === "platformPortal" ? "平台报名门户" : record.registration.mode === "externalUrl" ? "外部报名页面" : record.registration.mode === "thirdPartyApi" ? "第三方系统对接" : "线下报名";

  return (
    <div className="space-y-6">
      <section className="rounded-container border border-border-subtle bg-surface p-6 lg:p-8">
        <Link to="/admin/competitions" className="inline-flex items-center gap-1 text-sm font-medium text-text-brand"><ArrowLeft size={15} />返回赛事中心</Link>
        <div className="mt-5 flex flex-wrap items-start justify-between gap-5">
          <div className="max-w-4xl">
            <StatusTag tone={statusTone(record.status)}>{competitionStatusLabel(record.status)}</StatusTag>
            <h1 className="mt-3 text-2xl font-semibold leading-8">{record.name}</h1>
            <p className="mt-3 text-sm leading-6 text-text-secondary">查看赛事报名、审核、官方资格、学校责任与赛事服务配置。</p>
            <div data-pc05-technical className="mt-3 space-y-2 rounded-control bg-surface-subtle p-3 font-mono text-xs text-text-tertiary"><p>competitionId={record.id}</p><p>status={record.status} · source={record.source}</p><p>{record.sourceDetail}</p></div>
          </div>
          {record.registration.portalPath && <Link to={record.registration.portalPath} className="inline-flex min-h-11 items-center gap-2 rounded-control bg-primary-container px-4 text-sm font-semibold text-text-brand">进入报名门户<ChevronRight size={16} /></Link>}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <SectionCard title="赛事基础资料与报名" icon={<Trophy size={19} />}>
          <div className="grid gap-3 sm:grid-cols-2">
            <ValueCard label="主办 / 组织方"><OrganizationLink organizationId={record.organizerOrganizationId} /></ValueCard>
            <ValueCard label="报名方式"><span>{registrationMode}</span><p className="mt-1 text-xs font-normal text-text-secondary">{record.registration.label}</p></ValueCard>
            <ValueCard label="赛道 / 组别">{record.tracks.map(track => <p key={track.id}>{track.name} · {track.group}<span data-pc05-technical className="ml-2 font-mono text-xs text-text-tertiary">trackId={track.id}</span></p>)}</ValueCard>
            <ValueCard label="官方数据同步"><div className="flex flex-wrap items-center gap-2"><StatusTag tone={statusTone(record.sync.state)}>{syncLabel(record.sync.state)}</StatusTag><span>{record.sync.priority}</span></div><p className="mt-1 text-xs font-normal text-text-secondary">最近同步：{record.sync.lastSync}</p></ValueCard>
          </div>
          <details className="mt-4 rounded-control bg-surface-subtle p-3 text-xs leading-5 text-text-secondary"><summary className="cursor-pointer font-semibold">同步与兜底说明</summary><p className="mt-2">{record.sync.fallback}</p><p className="mt-1">{record.sync.conflictPolicy}</p><div data-pc05-technical className="mt-2 font-mono">sync.state={record.sync.state} · registration.mode={record.registration.mode}</div></details>
        </SectionCard>

        <SectionCard title="报名窗口与地方节点" icon={<CalendarDays size={19} />}>
          <div className="space-y-3">{record.windows.official.map(item => <div key={item.label} className="rounded-control bg-surface-subtle p-3"><strong className="text-sm">{item.label}</strong><p className="mt-2 text-sm">{item.value}</p><p className="mt-1 text-xs text-text-tertiary">责任：{item.owner}</p></div>)}</div>
          <div className="mt-4 border-t border-border-subtle pt-4"><p className="text-xs font-semibold text-text-tertiary">地方执行节点</p>{record.windows.local.length ? <div className="mt-2 space-y-2">{record.windows.local.map(node => <div key={node.id} className="rounded-control border border-border-subtle p-3"><strong className="text-sm">{node.label}</strong><p className="mt-1 text-sm">{node.value}</p><p className="mt-1 text-xs text-text-tertiary">{node.scopeOrganizationId ? organizationName(node.scopeOrganizationId) : "全赛事"} · {node.owner}</p><p data-pc05-technical className="mt-1 font-mono text-xs text-text-tertiary">nodeId={node.id} · organizationId={node.scopeOrganizationId ?? "all"}</p></div>)}</div> : <p className="mt-2 text-sm text-text-tertiary">当前没有地方执行节点。</p>}</div>
        </SectionCard>
      </div>

      <QualificationPanel record={record} />

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="学校授权与审核责任" icon={<GraduationCap size={19} />}>
          <div className="rounded-control bg-info-bg p-4 text-sm leading-6 text-info-text"><strong>{record.schoolScope.reviewOwnerRule}</strong><p className="mt-1 text-xs">学校老师只处理当前赛事中获授权学校的报名与审核数据，不扩张到学生其它长期资料。</p></div>
          <p className="mt-4 text-xs font-semibold text-text-tertiary">当前授权学校</p>
          <div className="mt-2 flex flex-wrap gap-2">{record.schoolScope.authorizedSchoolOrganizationIds.map(organizationId => <OrganizationLink key={organizationId} organizationId={organizationId} />)}</div>
          <p data-pc05-technical className="mt-3 font-mono text-xs text-text-tertiary">SchoolScope: {record.schoolScope.note}</p>
        </SectionCard>

        <SectionCard title="学生赛事身份" icon={<BadgeCheck size={19} />}>
          <p className="text-sm leading-6 text-text-secondary">学生在本赛事中的报名、审核和赛事权限与长期账号关联。学校审核通过不等于外部官方资格确认。</p>
          <p data-pc05-technical className="mt-3 rounded-control bg-surface-subtle p-3 font-mono text-xs text-text-tertiary">CompetitionIdentity · identities[] · competitionId={record.id} · registration approved remains platform fact</p>
        </SectionCard>
      </div>

      <SectionCard title="团队与参赛项目" icon={<UsersRound size={19} />}>
        <div className="grid gap-3 md:grid-cols-2"><ValueCard label="团队"><p className="font-semibold">{record.team.name}</p><p className="mt-1 text-xs font-normal text-text-secondary">队长学校：{leaderSchoolName}</p><p data-pc05-technical className="mt-2 font-mono text-xs text-text-tertiary">teamId={record.team.id} · leaderSchoolId={record.team.leaderSchoolId}</p></ValueCard><ValueCard label="参赛项目"><p className="font-semibold">{record.project.name}</p><p className="mt-1 text-xs font-normal text-text-secondary">{record.project.track} · {record.project.stage}</p><p data-pc05-technical className="mt-2 font-mono text-xs text-text-tertiary">projectId={record.project.id} · CompetitionProject</p></ValueCard></div>
        <p className="mt-3 rounded-control bg-warning-bg px-3 py-2 text-xs leading-5 text-warning-text">参赛项目只属于当前赛事；赛事结束后沉淀经历、团队角色、成绩与证书，不建立跨赛事长期项目主数据。</p>
        <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[680px] text-left text-xs"><thead className="text-text-tertiary"><tr><th className="pb-2">成员</th><th className="pb-2">角色</th><th className="pb-2">学校</th><th className="pb-2">审核责任</th></tr></thead><tbody className="divide-y divide-border-subtle">{record.team.members.map(member => <tr key={member.id} data-testid="team-member-row"><td className="py-3 font-medium">{member.name}</td><td className="py-3 text-text-secondary">{member.role}</td><td className="py-3 text-text-secondary">{organizationName(member.schoolOrganizationId)}</td><td className="py-3 text-text-secondary">统一归队长学校：{leaderSchoolName}<span data-pc05-technical className="ml-2 font-mono text-text-tertiary">organizationId={member.schoolOrganizationId}</span></td></tr>)}</tbody></table></div>
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="赛事资料" icon={<FileText size={19} />}><div className="space-y-2">{record.resources.map(resource => <div key={resource.id} className="rounded-control bg-surface-subtle p-3"><strong className="text-sm">{resource.title}</strong><p className="mt-1 text-xs text-text-tertiary">{resource.category} · 更新于 {resource.updatedAt}</p><p data-pc05-technical className="mt-1 font-mono text-xs text-text-tertiary">resourceId={resource.id} · source={resource.source}</p></div>)}</div></SectionCard>
        <SectionCard title="赛事服务" icon={<Building2 size={19} />}><div className="space-y-4">{(["courses", "benefits", "activities"] as const).map(key => <div key={key}><p className="text-xs font-semibold text-text-tertiary">{key === "courses" ? "课程" : key === "benefits" ? "权益" : "活动"}</p>{record.services[key].length ? <div className="mt-2 flex flex-wrap gap-2">{record.services[key].map(item => <span key={item.id} className="rounded-control bg-surface-subtle px-3 py-2 text-sm"><strong>{item.name}</strong><span data-pc05-technical className="ml-2 font-mono text-xs text-text-tertiary">{item.id}</span></span>)}</div> : <p className="mt-2 text-sm text-text-tertiary">未配置</p>}</div>)}</div></SectionCard>
      </div>

      <SectionCard title="创赛工坊配置" icon={<Sparkles size={19} />}>
        <div className="grid gap-4 xl:grid-cols-[0.75fr_1.25fr]"><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1"><ValueCard label="启用状态"><StatusTag tone={record.workshop.enabled ? "success" : "neutral"}>{record.workshop.enabled ? "已启用" : "未启用"}</StatusTag></ValueCard><ValueCard label="当前阶段">{lifecycleLabel(record.workshop.lifecycle)}</ValueCard></div><div><p className="text-xs font-semibold text-text-tertiary">能力包</p><div className="mt-2 flex flex-wrap gap-2">{record.workshop.skillPack.map(skill => <StatusTag key={skill} tone="info">{skill}</StatusTag>)}</div><div className="mt-4 rounded-control bg-warning-bg p-4 text-sm leading-6 text-warning-text"><strong>隐私边界：</strong>{humanizeText(record.workshop.privacy)}</div></div></div>
        <p data-pc05-technical className="mt-3 font-mono text-xs text-text-tertiary">Workshop · scope={record.workshop.scope} · lifecycle={record.workshop.lifecycle}</p>
      </SectionCard>

      <SectionCard title="学校老师数据可见范围" icon={<ShieldCheck size={19} />}>
        <div className="grid gap-4 lg:grid-cols-2"><div className="rounded-container border border-border-subtle p-4"><strong>允许查看</strong><div className="mt-3 space-y-2">{record.teacherScope.allowed.map(item => <div key={item} className="rounded-control bg-success-bg px-3 py-2 text-xs text-success-text">{humanizeText(item)}</div>)}</div></div><div className="rounded-container border border-border-subtle p-4"><strong>默认禁止</strong><div className="mt-3 space-y-2">{record.teacherScope.denied.map(item => <div key={item} className="rounded-control bg-danger-bg px-3 py-2 text-xs text-danger-text">{humanizeText(item)}</div>)}</div></div></div>
      </SectionCard>

      <SectionCard title="关联业务" icon={<Building2 size={19} />}>
        <div className="grid gap-2 md:grid-cols-2">{record.relations.map(relation => {
          const to = normalizedRelationPath(relation.to);
          const body = <><strong className="text-sm">{relation.label}</strong><span data-pc05-technical className="ml-2 font-mono text-xs text-text-tertiary">{relation.stableId}</span></>;
          return to ? <Link key={`${relation.stableId}:${to}`} to={to} className="flex items-center justify-between rounded-control border border-border-subtle p-3 hover:bg-surface-subtle"><span>{body}</span><ChevronRight size={16} /></Link> : <div key={relation.stableId} className="rounded-control border border-border-subtle p-3">{body}</div>;
        })}</div>
        <details data-pc05-technical className="mt-4 rounded-control bg-surface-subtle p-3 text-xs"><summary className="cursor-pointer font-semibold">App consumer / stable relation</summary><div className="mt-3 space-y-2 font-mono text-text-tertiary">{record.appConsumers.map(route => <p key={route}>{route}</p>)}</div></details>
      </SectionCard>
    </div>
  );
}

export function PC02HumanCompetitionConsole() {
  const { competitionId } = useParams();
  const record = competitionControlById(competitionId);
  if (!record) return <div className="rounded-container border border-border-subtle bg-surface p-8 text-center"><h1 className="text-xl font-semibold">赛事不存在</h1><p className="mt-2 text-sm text-text-secondary">没有找到对应赛事，请返回赛事中心重新选择。</p><Link to="/admin/competitions" className="mt-5 inline-flex min-h-11 items-center rounded-control bg-primary-container px-4 text-sm font-semibold text-text-brand">返回赛事中心</Link></div>;
  return <CompetitionPage record={record} />;
}

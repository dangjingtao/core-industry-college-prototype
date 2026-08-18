import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  CalendarDays,
  ChevronRight,
  CircleAlert,
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
import { Link, useParams } from "react-router-dom";
import { StatusTag } from "../components/ui";
import {
  competitionControlById,
  registrationModeLabels,
  type CompetitionControlRecord,
  type CompetitionControlSource,
  type OfficialQualificationStatus,
  type PlatformReviewStatus,
} from "./competition-control-data";
import { pc03OrganizationById } from "./PC03State";

const sourceTone: Record<CompetitionControlSource, "info" | "success" | "warning" | "neutral"> = {
  平台配置: "info",
  "API 同步": "success",
  文件导入: "neutral",
  人工修正: "warning",
  Runtime: "neutral",
};

function StableId({ field, value, testId }: { field: string; value: string; testId?: string }) {
  return (
    <span data-testid={testId} className="inline-flex max-w-full items-center gap-1.5 rounded-control bg-surface-subtle px-2.5 py-1 font-mono text-xs text-text-primary">
      <span className="text-text-tertiary">{field}</span>
      <span className="truncate font-semibold">{value}</span>
    </span>
  );
}

function SourceTag({ source }: { source: CompetitionControlSource }) {
  return <StatusTag tone={sourceTone[source]}>{source}</StatusTag>;
}

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

function TruthLayer({ title, detail, icon }: { title: string; detail: string; icon: ReactNode }) {
  return <div className="rounded-container border border-border-subtle bg-surface p-5"><div className="flex gap-3"><div className="flex size-10 shrink-0 items-center justify-center rounded-control bg-surface-subtle text-text-brand">{icon}</div><div><h2 className="font-semibold">{title}</h2><p className="mt-2 text-sm leading-6 text-text-secondary">{detail}</p></div></div></div>;
}

function OrganizationRef({ organizationId, testId }: { organizationId: string; testId?: string }) {
  const organization = pc03OrganizationById(organizationId);
  return (
    <Link data-testid={testId} to={`/admin/organizations/${organizationId}`} className="inline-flex flex-wrap items-center gap-2 rounded-control bg-surface-subtle px-3 py-2 text-sm hover:bg-surface-pressed">
      <strong>{organization?.name ?? "未知 Organization"}</strong>
      <span className="font-mono text-xs text-text-tertiary">{organizationId}</span>
    </Link>
  );
}

function organizationName(organizationId: string) {
  return pc03OrganizationById(organizationId)?.name ?? organizationId;
}

function QualificationPanel({ record }: { record: CompetitionControlRecord }) {
  const [platformReview, setPlatformReview] = useState<PlatformReviewStatus>(record.qualification.platformReview);
  const [officialQualification, setOfficialQualification] = useState<OfficialQualificationStatus>(record.qualification.officialQualification);
  const lifecycleAllowsWorkspace = record.status === "registrationOpen" || record.status === "inProgress";
  const qualificationAllowsWorkspace = record.authorityMode === "externalAuthority"
    ? platformReview === "approved" && officialQualification === "confirmed"
    : platformReview === "approved" && officialQualification === "notRequired";
  const workspaceOpen = lifecycleAllowsWorkspace && qualificationAllowsWorkspace;
  const reviewTone = platformReview === "approved" ? "success" : platformReview === "rejected" ? "danger" : "warning";
  const officialTone = officialQualification === "confirmed" || officialQualification === "notRequired" ? "success" : officialQualification === "rejected" ? "danger" : "warning";

  return (
    <SectionCard title="报名资格：平台流程与官方事实分层" icon={<BadgeCheck size={19} />}>
      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-container border border-border-subtle p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><p className="text-xs text-text-tertiary">平台报名 / 学校审核</p><p className="mt-1 text-sm font-semibold">核心产业学院流程事实</p></div>
            <StatusTag tone={reviewTone}><span data-testid="platform-review-status">{platformReview}</span></StatusTag>
          </div>
          <p className="mt-3 text-xs leading-5 text-text-secondary">学校审核通过只说明平台流程通过；`platformApproved` 不能写成 `officialConfirmed`。</p>
          {record.authorityMode === "externalAuthority" && (
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={() => setPlatformReview("approved")} className="min-h-10 rounded-control bg-primary-container px-3 text-xs font-semibold text-text-brand">学校审核通过</button>
              <button type="button" onClick={() => setPlatformReview("rejected")} className="min-h-10 rounded-control bg-surface-subtle px-3 text-xs font-semibold">学校驳回</button>
            </div>
          )}
        </div>
        <div className="rounded-container border border-border-subtle p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><p className="text-xs text-text-tertiary">官方参赛资格</p><p className="mt-1 text-sm font-semibold">{record.authorityMode === "externalAuthority" ? "外部权威赛事事实" : "本赛事无需外部权威回流"}</p></div>
            <StatusTag tone={officialTone}><span data-testid="official-qualification-status">{officialQualification}</span></StatusTag>
          </div>
          <p className="mt-3 text-xs leading-5 text-text-secondary">{record.qualification.workspaceRule}</p>
          {record.authorityMode === "externalAuthority" && (
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={() => setOfficialQualification("confirmed")} className="min-h-10 rounded-control bg-primary px-3 text-xs font-semibold text-on-primary">模拟 API 回流：官方确认</button>
              <button type="button" onClick={() => setOfficialQualification("rejected")} className="min-h-10 rounded-control bg-surface-subtle px-3 text-xs font-semibold">模拟官方拒绝</button>
            </div>
          )}
        </div>
      </div>
      <div data-testid="workspace-gate" className={`mt-4 rounded-control px-4 py-3 text-sm font-medium ${workspaceOpen ? "bg-success-bg text-success-text" : "bg-warning-bg text-warning-text"}`}>
        {workspaceOpen ? "正式 Workspace：可进入" : "正式 Workspace：保持锁定"} · {lifecycleAllowsWorkspace ? "平台审核通过不等于官方资格确认" : "赛事生命周期尚未开放"}
      </div>
      {record.authorityMode === "externalAuthority" && <button type="button" onClick={() => { setPlatformReview(record.qualification.platformReview); setOfficialQualification(record.qualification.officialQualification); }} className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-control px-3 text-xs font-semibold hover:bg-surface-subtle"><RefreshCw size={14} />重置资格演示</button>}
    </SectionCard>
  );
}

function CompetitionConsolePage({ record }: { record: CompetitionControlRecord }) {
  const organizer = pc03OrganizationById(record.organizerOrganizationId);
  const leaderSchoolName = organizationName(record.team.leaderSchoolId);

  return (
    <div className="space-y-6">
      <section className="rounded-container border border-border-subtle bg-surface p-6 lg:p-8">
        <Link to="/admin/competitions" className="inline-flex items-center gap-1 text-sm font-medium text-text-brand"><ArrowLeft size={15} />返回赛事中心</Link>
        <div className="mt-5 flex flex-wrap items-start justify-between gap-5">
          <div className="max-w-4xl">
            <div className="flex flex-wrap gap-2"><SourceTag source={record.source} /><StatusTag tone={record.status === "registrationOpen" ? "success" : record.status === "upcoming" ? "warning" : "info"}>{record.status}</StatusTag></div>
            <h1 className="mt-3 text-2xl font-semibold leading-8">{record.name}</h1>
            <div className="mt-3"><StableId field="competitionId" value={record.id} /></div>
            <p className="mt-4 text-sm leading-6 text-text-secondary">{record.sourceDetail}</p>
          </div>
          {record.registration.portalPath && <Link to={record.registration.portalPath} className="inline-flex min-h-11 items-center gap-2 rounded-control bg-primary-container px-4 text-sm font-semibold text-text-brand">进入现有报名门户<ChevronRight size={16} /></Link>}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-3" aria-label="PC02 三层事实边界">
        <TruthLayer title="外部权威赛事事实" detail={record.authorityMode === "externalAuthority" ? "官方窗口、规则与最终参赛资格由外部权威来源确认。" : "平台配置赛事不虚构外部权威状态。"} icon={<ShieldCheck size={19} />} />
        <TruthLayer title="平台承接报名流程" detail="承接报名、团队资料、学校审核与回流，但平台流程状态不冒充官方资格。" icon={<Workflow size={19} />} />
        <TruthLayer title="核心产业学院叠加服务" detail="课程、权益、活动与 Workshop 是平台服务，不描述成赛事官方能力。" icon={<Sparkles size={19} />} />
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <SectionCard title="赛事基础资料与报名接入" icon={<Trophy size={19} />}>
          <div className="grid gap-3 sm:grid-cols-2">
            <ValueCard label="主办 / 组织方">
              <OrganizationRef organizationId={record.organizerOrganizationId} testId="organizer-organization" />
              {!organizer && <p className="mt-2 text-xs text-danger-text">Organization 主数据缺失</p>}
            </ValueCard>
            <ValueCard label="报名接入方式"><span>{registrationModeLabels[record.registration.mode]}</span><p className="mt-1 text-xs font-normal text-text-secondary">{record.registration.label} · {record.registration.detail}</p></ValueCard>
            <ValueCard label="赛道 / 组别">{record.tracks.map(track => <p key={track.id}>{track.name}<span className="ml-2 font-mono text-xs text-text-tertiary">{track.id}</span></p>)}</ValueCard>
            <ValueCard label="官方数据同步"><div className="flex flex-wrap items-center gap-2"><StatusTag tone={record.sync.state === "healthy" ? "success" : record.sync.state === "attention" ? "warning" : "neutral"}>{record.sync.state}</StatusTag><span>{record.sync.priority}</span></div><p className="mt-1 text-xs font-normal text-text-secondary">最近同步：{record.sync.lastSync}</p></ValueCard>
          </div>
          <div className="mt-3 flex flex-wrap gap-2"><SourceTag source="API 同步" /><SourceTag source="文件导入" /><SourceTag source="人工修正" /></div>
          <p className="mt-3 rounded-control bg-surface-subtle p-3 text-xs leading-5 text-text-secondary"><strong>冲突策略：</strong>{record.sync.conflictPolicy}<br /><strong>兜底：</strong>{record.sync.fallback}<br /><strong>通用接入能力：</strong>平台承接门户 / 外部 URL / API 或第三方 / 无线上报名。</p>
        </SectionCard>

        <SectionCard title="官方窗口与地方节点" icon={<CalendarDays size={19} />}>
          <div className="space-y-3">{record.windows.official.map(item => <div key={item.label} className="rounded-control bg-surface-subtle p-3"><div className="flex items-center justify-between gap-2"><strong className="text-sm">{item.label}</strong><StatusTag tone="success">统一窗口</StatusTag></div><p className="mt-2 text-sm">{item.value}</p><p className="mt-1 text-xs text-text-tertiary">责任：{item.owner}</p></div>)}</div>
          <div className="mt-4 border-t border-border-subtle pt-4"><p className="text-xs font-semibold text-text-tertiary">地方执行节点</p>{record.windows.local.length ? <div className="mt-2 space-y-2">{record.windows.local.map(node => <div key={node.id} className="rounded-control border border-border-subtle p-3"><strong className="text-sm">{node.label}</strong><p className="mt-1 text-sm">{node.value}</p><p className="mt-1 text-xs text-text-tertiary">{node.scopeOrganizationId ? `${organizationName(node.scopeOrganizationId)} · ${node.scopeOrganizationId}` : "全赛事"} · {node.owner}</p></div>)}</div> : <p className="mt-2 text-sm text-text-tertiary">当前无地方节点，不生成虚假节点。</p>}</div>
        </SectionCard>
      </div>

      <QualificationPanel record={record} />

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="学校授权与审核责任" icon={<GraduationCap size={19} />}>
          <div className="rounded-control bg-info-bg p-4 text-sm leading-6 text-info-text"><strong>{record.schoolScope.reviewOwnerRule}</strong><p className="mt-1 text-xs">{record.schoolScope.note}</p></div>
          <p className="mt-4 text-xs font-semibold text-text-tertiary">当前授权学校 Organization</p>
          <div className="mt-2 flex flex-wrap gap-2">{record.schoolScope.authorizedSchoolOrganizationIds.map(organizationId => <OrganizationRef key={organizationId} organizationId={organizationId} testId="authorized-school-organization" />)}</div>
        </SectionCard>

        <SectionCard title="CompetitionIdentity 映射" icon={<BadgeCheck size={19} />}>
          <p className="text-sm leading-6 text-text-secondary">PC02 读取长期账号已有的 <code>identities[]</code> / CompetitionIdentity 语义，不新建第二份赛事身份 Store。Mobile 当前的 registration `approved` 仍属于平台报名层；外部赛事的官方资格在 PC 控制面单独表达。</p>
          <div className="mt-3"><StableId field="competitionId" value={record.id} /></div>
        </SectionCard>
      </div>

      <SectionCard title="团队 / TeamMember / CompetitionProject" icon={<UsersRound size={19} />}>
        <div className="grid gap-3 md:grid-cols-2">
          <ValueCard label="Team">
            <StableId field="teamId" value={record.team.id} />
            <p className="mt-2">{record.team.name}</p>
            <p className="mt-1 text-xs font-normal text-text-secondary">队长学校：{leaderSchoolName}</p>
            <div className="mt-2"><StableId field="leaderSchoolId" value={record.team.leaderSchoolId} testId="leader-school-id" /></div>
          </ValueCard>
          <ValueCard label="CompetitionProject"><StableId field="projectId" value={record.project.id} /><p className="mt-2">{record.project.name}</p><p className="text-xs font-normal text-text-secondary">{record.project.track} · {record.project.stage}</p></ValueCard>
        </div>
        <p className="mt-3 rounded-control bg-warning-bg px-3 py-2 text-xs leading-5 text-warning-text">CompetitionProject 只属于当前赛事；赛事结束后 handoff 摘要 / 经历 / 团队角色 / 成绩 / 证书，不建立跨赛事长期 Project。</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-xs">
            <thead className="text-text-tertiary"><tr><th className="pb-2">成员</th><th className="pb-2">角色</th><th className="pb-2">学校</th><th className="pb-2">Organization ID</th><th className="pb-2">审核责任</th></tr></thead>
            <tbody className="divide-y divide-border-subtle">{record.team.members.map(member => {
              const schoolName = organizationName(member.schoolOrganizationId);
              return <tr key={member.id} data-testid="team-member-row"><td className="py-3 font-medium">{member.name}</td><td className="py-3 text-text-secondary">{member.role}</td><td className="py-3 text-text-secondary">{schoolName}</td><td className="py-3 font-mono text-text-tertiary">{member.schoolOrganizationId}</td><td className="py-3 text-text-secondary">统一归队长学校：{leaderSchoolName}（{record.team.leaderSchoolId}）</td></tr>;
            })}</tbody>
          </table>
        </div>
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="赛事资料" icon={<FileText size={19} />}><div className="space-y-2">{record.resources.map(resource => <div key={resource.id} className="flex items-center justify-between gap-3 rounded-control bg-surface-subtle p-3"><div><strong className="text-sm">{resource.title}</strong><p className="mt-1 font-mono text-xs text-text-tertiary">{resource.id} · {resource.category} · {resource.updatedAt}</p></div><SourceTag source={resource.source} /></div>)}</div></SectionCard>
        <SectionCard title="赛事专属课程 / 权益 / 活动关联" icon={<Building2 size={19} />}><div className="space-y-4">{(["courses", "benefits", "activities"] as const).map(key => <div key={key}><p className="text-xs font-semibold uppercase text-text-tertiary">{key}</p>{record.services[key].length ? <div className="mt-2 flex flex-wrap gap-2">{record.services[key].map(item => <span key={item.id} className="rounded-control bg-surface-subtle px-3 py-2 text-sm"><strong>{item.name}</strong><span className="ml-2 font-mono text-xs text-text-tertiary">{item.id}</span></span>)}</div> : <p className="mt-2 text-sm text-text-tertiary">未配置</p>}</div>)}</div></SectionCard>
      </div>

      <SectionCard title="Workshop 配置与赛事 scope" icon={<Sparkles size={19} />}>
        <div className="grid gap-4 xl:grid-cols-[0.75fr_1.25fr]"><div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1"><ValueCard label="启用状态"><StatusTag tone={record.workshop.enabled ? "success" : "neutral"}>{record.workshop.enabled ? "enabled" : "disabled"}</StatusTag></ValueCard><ValueCard label="赛事 Scope"><span className="font-mono text-xs">{record.workshop.scope}</span></ValueCard><ValueCard label="Lifecycle">{record.workshop.lifecycle}</ValueCard></div><div><p className="text-xs font-semibold text-text-tertiary">能力包</p><div className="mt-2 flex flex-wrap gap-2">{record.workshop.skillPack.map(skill => <StatusTag key={skill} tone="info">{skill}</StatusTag>)}</div><div className="mt-4 rounded-control bg-warning-bg p-4 text-sm leading-6 text-warning-text"><strong>隐私边界：</strong>{record.workshop.privacy}</div></div></div>
      </SectionCard>

      <SectionCard title="学校老师数据可见范围" icon={<ShieldCheck size={19} />}>
        <div className="grid gap-4 lg:grid-cols-2"><div className="rounded-container border border-border-subtle p-4"><div className="flex items-center gap-2"><BadgeCheck size={17} className="text-success-text" /><strong>允许</strong></div><div className="mt-3 space-y-2">{record.teacherScope.allowed.map(item => <div key={item} className="rounded-control bg-success-bg px-3 py-2 text-xs text-success-text">{item}</div>)}</div></div><div className="rounded-container border border-border-subtle p-4"><div className="flex items-center gap-2"><CircleAlert size={17} className="text-danger-text" /><strong>默认禁止</strong></div><div className="mt-3 space-y-2">{record.teacherScope.denied.map(item => <div key={item} className="rounded-control bg-danger-bg px-3 py-2 text-xs text-danger-text">{item}</div>)}</div></div></div>
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="App 消费位置" icon={<Workflow size={19} />}><div className="flex flex-wrap gap-2">{record.appConsumers.map(route => <span key={route} className="rounded-control bg-surface-subtle px-3 py-2 font-mono text-xs">{route}</span>)}</div></SectionCard>
        <SectionCard title="稳定业务关系" icon={<Building2 size={19} />}><div className="grid gap-2">{record.relations.map(relation => relation.to ? <Link key={`${relation.stableId}:${relation.to}`} to={relation.to} className="flex items-center justify-between rounded-control border border-border-subtle p-3 hover:bg-surface-subtle"><div><strong className="text-sm">{relation.label}</strong><p className="mt-1 font-mono text-xs text-text-tertiary">{relation.stableId}</p></div><ChevronRight size={16} /></Link> : <div key={relation.stableId} className="rounded-control border border-border-subtle p-3"><strong className="text-sm">{relation.label}</strong><p className="mt-1 font-mono text-xs text-text-tertiary">{relation.stableId}</p></div>)}</div></SectionCard>
      </div>
    </div>
  );
}

export function CompetitionConsole() {
  const { competitionId } = useParams();
  const record = competitionControlById(competitionId);
  if (!record) {
    return (
      <div className="rounded-container border border-border-subtle bg-surface p-8 text-center">
        <h1 className="text-xl font-semibold">赛事不存在</h1>
        <p className="mt-2 text-sm text-text-secondary">PC02 不为未知 competitionId 临时生成业务事实。</p>
        <Link to="/admin/competitions" className="mt-5 inline-flex min-h-11 items-center rounded-control bg-primary-container px-4 text-sm font-semibold text-text-brand">返回赛事中心</Link>
      </div>
    );
  }
  return <CompetitionConsolePage record={record} />;
}

import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button, Card, PageHeader, PublicShell, SecondaryButton, Section, StatusTag } from "../../components/ui";
import { usePublicPlatform } from "../public-platform/PublicPlatform";
import { competitionById, type Competition } from "../public-platform/data";
import { resourceById, workshopTasks, workspaceData, type WorkshopLifecycle } from "./data";
import { nextReadyTask, taskAvailability, useWorkshopRuntime } from "./runtime";
import { CompetitionContextLine, RequireCompetitionAccess, useCompetitionAccess, WorkspaceBlocked, WorkspaceScenarioTools } from "./shared";
import { badgeCatalog } from "../badges/catalog";
import { useBadges } from "../badges/hooks";

const identityTone = (status: string) => status === "active" ? "success" as const : status === "pending" ? "warning" as const : status === "rejected" ? "danger" as const : "neutral" as const;
const registrationWindowLabel = (competition: Competition) => competition.status === "registrationOpen" ? "报名中" : competition.status === "upcoming" ? "尚未开放" : competition.status === "ended" ? "已关闭" : "报名已结束";
const lifecyclePresentation = (lifecycle: WorkshopLifecycle) => lifecycle === "ended" ? ["赛事已结束", "neutral"] as const : lifecycle === "notStarted" ? ["赛事未开始", "warning"] as const : ["赛事进行中", "info"] as const;
const compBadgeHint = (type: string) => type === "competition.registered" ? "报名成功后获得"
  : type === "competition.ended" ? "赛事结束后获得"
  : type === "competition.team" ? "组建团队后获得"
  : type === "competition.materialsReady" ? "备齐全部项目材料后获得"
  : type === "competition.workshopTasksCompleted" ? "完成工坊全部任务后获得"
  : type === "competition.resultsAccepted" ? "接受工坊成果后获得"
  : undefined;

export function CompetitionLifecycleDetailPage() {
  const navigate = useNavigate();
  const { competitionId } = useParams();
  const { session } = usePublicPlatform();
  const { identityFor, getRuntime } = useWorkshopRuntime();
  const { earned } = useBadges();
  if (!competitionId) return null;
  const competition = competitionById(competitionId);
  if (!competition) return <PublicShell showNavigation={false}><PageHeader title="赛事不存在" backTo="/competitions" /><div className="px-4 py-6"><Card><p className="text-text-secondary">未找到对应赛事。</p></Card></div></PublicShell>;
  const identity = identityFor(competitionId);
  const runtime = getRuntime(competitionId);
  const [lifecycleLabel, lifecycleTone] = lifecyclePresentation(runtime.lifecycle);
  const guest = !session.loggedIn;
  const canRegister = !guest && runtime.lifecycle !== "ended" && competition.status === "registrationOpen" && competition.eligibility !== "ineligible";
  const active = identity?.identityStatus === "active";
  const pendingOrRejected = identity?.identityStatus === "pending" || identity?.identityStatus === "rejected";
  const hasAssetHandoff = Boolean(identity) && (runtime.lifecycle === "ended" || identity?.identityStatus === "revoked");
  const compBadges = badgeCatalog.filter(b => b.sourceType === "competition" || b.sourceType === "progress");
  const earnedCompBadges = compBadges.filter(b => earned.some(e => e.entry.id === b.id));
  const lockedCompBadges = compBadges.filter(b => !earned.some(e => e.entry.id === b.id));
  return <PublicShell showNavigation={false}><PageHeader title="赛事详情" subtitle="报名窗口与赛事阶段分开表达" backTo="/competitions" /><div className="space-y-6 px-4 py-5">
    <div><StatusTag tone={lifecycleTone}>{lifecycleLabel}</StatusTag><h1 className="mt-3 text-2xl font-semibold leading-8 text-text-primary">{competition.name}</h1><p className="mt-2 text-sm text-text-secondary">{competition.organizer}</p><p className="mt-4 text-base leading-6 text-text-secondary">{competition.summary}</p></div>
    <Section title="当前账号与赛事"><Card><div className="space-y-3 text-sm"><div className="flex justify-between gap-4"><span className="text-text-secondary">报名窗口</span><span className="font-medium text-text-primary">{competition.registrationEnds ?? registrationWindowLabel(competition)}</span></div><div className="flex justify-between gap-4"><span className="text-text-secondary">赛事阶段</span><span className="font-medium text-text-primary">{lifecycleLabel}</span></div><div className="flex justify-between gap-4"><span className="text-text-secondary">赛事身份</span><span className="font-medium text-text-primary">{guest ? "登录后查看" : identity?.identityStatus ?? "暂无"}</span></div><div className="flex justify-between gap-4"><span className="text-text-secondary">报名状态</span><span className="font-medium text-text-primary">{guest ? "登录后查看" : identity?.registrationStatus ?? "未报名"}</span></div></div></Card></Section>
    {/* 赛事徽章 */}
    {!guest && <Section title="赛事徽章" subtitle={`${earnedCompBadges.length} / ${compBadges.length} 已获得`} action={<Link to="/me/badges" className="text-sm font-medium text-text-brand">徽章墙</Link>}>
      <div className="space-y-2">
        {earnedCompBadges.map(b => <div key={b.id} className="flex items-center gap-3 rounded-container border border-border-subtle bg-surface px-3 py-2.5">
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${b.iconColor}`}>{b.iconKey}</div>
          <div className="min-w-0 flex-1"><p className="text-sm font-medium text-text-primary">{b.name}</p><p className="truncate text-xs text-text-secondary">{b.description}</p></div>
          <StatusTag tone="success">已获得</StatusTag>
        </div>)}
        {lockedCompBadges.map(b => <div key={b.id} className="flex items-center gap-3 rounded-container border border-border-subtle bg-surface-subtle px-3 py-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-subtle text-sm font-semibold text-text-tertiary">{b.iconKey}</div>
          <div className="min-w-0 flex-1"><p className="text-sm font-medium text-text-secondary">{b.name}</p><p className="truncate text-xs text-text-tertiary">{compBadgeHint(b.rule.type) ?? b.description}</p></div>
          <StatusTag tone="neutral">未获得</StatusTag>
        </div>)}
      </div>
    </Section>}
    {competition.eligibility === "ineligible" && <Card className="border border-warning bg-warning-bg"><p className="font-medium text-warning-text">当前条件暂不满足报名资格</p><p className="mt-2 text-sm text-warning-text">平台只展示当前资格结果，不在这里自行推断完整资格规则。</p></Card>}
    {runtime.lifecycle === "ended" && <Card className="border border-border-subtle"><p className="font-medium text-text-primary">赛事期操作已经结束</p><p className="mt-2 text-sm text-text-secondary">赛事期权限关闭后，拥有历史赛事身份的账号仍可进入长期资产查看经历、成绩和证书。</p></Card>}
    <div className="space-y-2">{guest ? runtime.lifecycle === "ended" ? <Button className="w-full" disabled>赛事已结束</Button> : <Button className="w-full" onClick={() => navigate(`/auth/login?returnTo=/competitions/${competitionId}/registration`)}>登录后报名</Button> : runtime.lifecycle === "ended" ? hasAssetHandoff ? <Button className="w-full" onClick={() => navigate(`/competitions/${competitionId}/workspace`)}>查看赛后出口</Button> : <Button className="w-full" disabled>赛事已结束</Button> : active ? <Button className="w-full" onClick={() => navigate(`/competitions/${competitionId}/workspace`)}>进入赛事工作区</Button> : pendingOrRejected ? <Button className="w-full" onClick={() => navigate(`/competitions/${competitionId}/registration`)}>查看报名 / 审核状态</Button> : identity?.identityStatus === "revoked" ? <Button className="w-full" onClick={() => navigate(`/competitions/${competitionId}/workspace`)}>查看赛后出口</Button> : canRegister ? <Button className="w-full" onClick={() => navigate(`/competitions/${competitionId}/registration`)}>进入报名</Button> : <Button className="w-full" disabled>{competition.status === "upcoming" ? "报名尚未开始" : "暂不可报名"}</Button>}<SecondaryButton className="w-full" onClick={() => guest ? navigate("/auth/login?returnTo=/competitions/mine") : navigate("/competitions/mine")}>查看我的赛事</SecondaryButton></div>
    {!guest && <WorkspaceScenarioTools competitionId={competitionId} />}
  </div></PublicShell>;
}

export function MyCompetitionsLifecyclePage() {
  const navigate = useNavigate();
  const { session, identities } = usePublicPlatform();
  const { getRuntime } = useWorkshopRuntime();
  if (!session.loggedIn) return <PublicShell><PageHeader title="我的赛事" backTo="/competitions" /><div className="px-4 py-6"><Card className="py-8 text-center"><p className="font-semibold text-text-primary">登录后查看我的赛事</p><p className="mt-2 text-sm text-text-secondary">未登录时不读取账号赛事身份。</p><Button className="mt-4" onClick={() => navigate("/auth/login?returnTo=/competitions/mine")}>登录</Button></Card></div></PublicShell>;
  return <PublicShell><PageHeader title="我的赛事" subtitle="读取长期账号唯一赛事身份集合" backTo="/competitions" /><div className="space-y-3 px-4 py-5">
    {identities.length ? identities.map(identity => {
      const competition = competitionById(identity.competitionId);
      if (!competition) return null;
      const runtime = getRuntime(identity.competitionId);
      const [lifecycleLabel] = lifecyclePresentation(runtime.lifecycle);
      const ended = runtime.lifecycle === "ended";
      return <Card key={identity.competitionId} interactive>
        <div className="flex items-start justify-between gap-3"><div><h2 className="text-base font-semibold text-text-primary">{competition.name}</h2><p className="mt-1 text-sm text-text-secondary">报名 {identity.registrationStatus} · {lifecycleLabel}</p></div><StatusTag tone={identityTone(identity.identityStatus)}>{identity.identityStatus}</StatusTag></div>
        {ended && (identity.identityStatus === "active" || identity.identityStatus === "revoked") && <Button className="mt-4 w-full" onClick={() => navigate(`/competitions/${identity.competitionId}/workspace`)}>查看赛后出口</Button>}
        {ended && identity.identityStatus !== "active" && identity.identityStatus !== "revoked" && <SecondaryButton className="mt-4 w-full" onClick={() => navigate(`/competitions/${identity.competitionId}`)}>查看赛事详情</SecondaryButton>}
        {!ended && identity.identityStatus === "active" && <Button className="mt-4 w-full" onClick={() => navigate(`/competitions/${identity.competitionId}/workspace`)}>进入赛事工作区</Button>}
        {!ended && (identity.identityStatus === "pending" || identity.identityStatus === "rejected") && <SecondaryButton className="mt-4 w-full" onClick={() => navigate(`/competitions/${identity.competitionId}/registration`)}>查看报名状态</SecondaryButton>}
        {!ended && identity.identityStatus === "revoked" && <SecondaryButton className="mt-4 w-full" onClick={() => navigate(`/competitions/${identity.competitionId}/workspace`)}>查看赛后出口</SecondaryButton>}
      </Card>;
    }) : <Card className="py-8 text-center"><p className="font-semibold text-text-primary">你还没有赛事身份</p><p className="mt-2 text-sm text-text-secondary">公共赛事仍可正常浏览。</p><Button className="mt-4" onClick={() => navigate("/competitions")}>发现赛事</Button></Card>}
  </div></PublicShell>;
}

export function RegistrationLifecyclePage() {
  const navigate = useNavigate();
  const { competitionId } = useParams();
  const competition = competitionById(competitionId);
  const { session } = usePublicPlatform();
  const { identityFor, setIdentityScenario, getRuntime, setLifecycle } = useWorkshopRuntime();
  const identity = competitionId ? identityFor(competitionId) : undefined;
  const [external, setExternal] = useState(false);
  if (!competitionId || !competition) return null;
  if (!session.loggedIn) return <PublicShell showNavigation={false}><PageHeader title="赛事报名" backTo={`/competitions/${competitionId}`} /><div className="px-4 py-6"><Card className="py-8 text-center"><p className="font-semibold text-text-primary">登录后继续报名</p><p className="mt-2 text-sm text-text-secondary">报名与赛事身份属于长期账号状态，未登录时不会读取或创建赛事身份。</p><Button className="mt-4" onClick={() => navigate(`/auth/login?returnTo=/competitions/${competitionId}/registration`)}>登录</Button></Card></div></PublicShell>;
  const runtime = getRuntime(competitionId);
  if (runtime.lifecycle === "ended") return <PublicShell showNavigation={false}><PageHeader title="赛事报名" backTo={`/competitions/${competitionId}`} /><div className="space-y-4 px-4 py-6"><Card className="border border-border-subtle"><StatusTag tone="neutral">赛事已结束</StatusTag><h1 className="mt-3 text-lg font-semibold text-text-primary">报名与审核操作已关闭</h1><p className="mt-2 text-sm text-text-secondary">赛事详情、工作区和工坊共用同一赛事阶段状态。</p></Card><SecondaryButton className="w-full" onClick={() => navigate(`/competitions/${competitionId}`)}>返回赛事详情</SecondaryButton></div></PublicShell>;

  const submit = () => { setIdentityScenario(competitionId, "pending"); setExternal(false); };
  const approve = () => { setIdentityScenario(competitionId, "active"); setLifecycle(competitionId, "inProgress"); navigate(`/competitions/${competitionId}/workspace`); };
  const reject = () => { setIdentityScenario(competitionId, "rejected"); setExternal(false); };

  const state = identity?.identityStatus === "active" ? "approved" : identity?.identityStatus === "pending" ? "pending" : identity?.identityStatus === "rejected" ? "rejected" : external ? "external" : "ready";
  return <PublicShell showNavigation={false}><PageHeader title="赛事报名" subtitle="响应式报名与 App 状态回流" backTo={`/competitions/${competitionId}`} /><div className="space-y-5 px-4 py-6">
    <Card><StatusTag tone={state === "approved" ? "success" : state === "rejected" ? "danger" : state === "pending" ? "warning" : "info"}>{state}</StatusTag><h1 className="mt-3 text-lg font-semibold text-text-primary">{competition.name}</h1><p className="mt-2 text-sm leading-5 text-text-secondary">复杂报名表单继续由既有响应式报名层承接；App 负责跳入、回流、审核结果与赛事身份授予。</p></Card>
    {state === "ready" && <Button className="w-full" onClick={() => setExternal(true)}>进入响应式报名（模拟）</Button>}
    {state === "external" && <Card className="border border-info bg-info-bg"><p className="font-medium text-info-text">当前位于响应式报名层</p><p className="mt-2 text-sm leading-5 text-info-text">这里不重新实现队长/队员、团队成员与复杂报名表单。</p><Button className="mt-4 w-full" onClick={submit}>模拟提交并回流 App</Button></Card>}
    {state === "pending" && <><Card className="border border-warning bg-warning-bg"><p className="font-medium text-warning-text">报名已提交，等待学校审核真实性</p><p className="mt-2 text-sm text-warning-text">审核前不会获得赛事工作区权限。</p></Card><div className="grid grid-cols-2 gap-2"><SecondaryButton onClick={reject}>模拟审核未通过</SecondaryButton><Button onClick={approve}>模拟审核通过</Button></div><SecondaryButton className="w-full" onClick={() => navigate(`/competitions/${competitionId}/workspace`)}>验证工作区权限</SecondaryButton></>}
    {state === "rejected" && <><Card className="border border-danger bg-danger-bg"><p className="font-medium text-danger-text">报名审核未通过</p><p className="mt-2 text-sm text-danger-text">当前赛事身份未获得工作区权限。</p></Card><SecondaryButton className="w-full" onClick={() => navigate(`/competitions/${competitionId}/workspace`)}>验证工作区权限</SecondaryButton><Button className="w-full" onClick={() => { setIdentityScenario(competitionId, "none"); setExternal(false); }}>恢复未报名状态</Button></>}
    {state === "approved" && <><Card className="border border-success bg-success-bg"><p className="font-medium text-success-text">审核通过，已获得赛事身份</p><p className="mt-2 text-sm text-success-text">首页、我的赛事和工作区读取同一个赛事身份。</p></Card><Button className="w-full" onClick={() => navigate(`/competitions/${competitionId}/workspace`)}>进入赛事工作区</Button></>}
  </div></PublicShell>;
}

export function CompetitionWorkspacePage() {
  const navigate = useNavigate();
  const { competitionId } = useParams();
  if (!competitionId) return null;
  const competition = competitionById(competitionId);
  const data = workspaceData[competitionId];
  const access = useCompetitionAccess(competitionId);
  const { identityFor, getRuntime } = useWorkshopRuntime();
  const identity = identityFor(competitionId);
  const runtime = getRuntime(competitionId);

  if (access !== "active" && access !== "notStarted") return <PublicShell showNavigation={false}><PageHeader title="赛事工作区" subtitle="赛事身份与生命周期" backTo={`/competitions/${competitionId}`} /><WorkspaceBlocked competitionId={competitionId} state={access} /><div className="px-4 pb-6"><WorkspaceScenarioTools competitionId={competitionId} /></div></PublicShell>;
  if (!data) return <PublicShell showNavigation={false}><PageHeader title="赛事工作区" backTo={`/competitions/${competitionId}`} /><div className="px-4 py-6"><Card><p className="font-medium text-text-primary">该赛事尚未配置工作区数据。</p></Card></div></PublicShell>;

  const activeRunTask = workshopTasks.find(task => ["queued", "running", "failed"].includes(runtime.taskRuns[task.id]?.status ?? ""));
  const nextTask = activeRunTask ?? nextReadyTask(runtime);
  const nextTaskStatus = nextTask ? taskAvailability(runtime, nextTask.id) : undefined;
  const notStarted = access === "notStarted";
  return <PublicShell showNavigation={false}><PageHeader title="赛事工作区" subtitle="当前打开赛事，不代表账号全部赛事" backTo="/competitions/mine" /><div className="space-y-6 px-4 py-5">
    <div><CompetitionContextLine competitionId={competitionId} /><h1 className="mt-3 text-lg font-semibold text-text-primary">{competition?.name}</h1><p className="mt-2 text-sm text-text-secondary">身份：{identity?.identityStatus} · 团队：{data.team.name}</p></div>
    {notStarted && <Card className="border border-info bg-info-bg"><StatusTag tone="info">赛事未开始</StatusTag><h2 className="mt-3 font-semibold text-info-text">先确认团队和资料，赛事任务暂不执行</h2><p className="mt-2 text-sm text-info-text">团队与资料可以提前查看；工坊执行动作会在赛事开始后开放。</p></Card>}
    <Section title="当前最重要的下一步"><Card className="border border-border-subtle"><StatusTag tone={notStarted ? "info" : "warning"}>{notStarted ? "等待赛事开始" : "下一任务"}</StatusTag><h2 className="mt-3 text-lg font-semibold text-text-primary">{notStarted ? "确认团队与赛事资料已准备" : nextTask?.title ?? "当前没有待执行任务"}</h2><p className="mt-2 text-sm leading-5 text-text-secondary">{notStarted ? "团队与资料入口保持可用；创赛工坊执行动作将在赛事开始后开放。" : nextTask?.summary ?? "可以查看已经生成的成果。"}</p>{!notStarted && nextTask && <Button className="mt-4 w-full" onClick={() => navigate(nextTaskStatus === "queued" || nextTaskStatus === "running" || nextTaskStatus === "failed" ? `/competitions/${competitionId}/workspace/workshop/tasks/${nextTask.id}/progress` : `/competitions/${competitionId}/workspace/workshop/tasks/${nextTask.id}/answer`)}>{activeRunTask ? "继续当前任务" : "继续下一步"}</Button>}</Card></Section>
    <Section title="当前项目 / 团队"><div className="space-y-2"><button className="flex min-h-touch w-full items-center justify-between rounded-control bg-surface px-3 text-left" onClick={() => navigate(`/competitions/${competitionId}/workspace/workshop/project`)}><span><strong className="block text-sm text-text-primary">{data.project.name}</strong><span className="text-xs text-text-secondary">{data.project.currentStage}</span></span><span>›</span></button><button className="flex min-h-touch w-full items-center justify-between rounded-control bg-surface px-3 text-left" onClick={() => navigate(`/competitions/${competitionId}/workspace/team`)}><span><strong className="block text-sm text-text-primary">{data.team.name}</strong><span className="text-xs text-text-secondary">{data.team.members.length} 名成员 · 当前角色 {data.team.role}</span></span><span>›</span></button></div></Section>
    {/* 赛事徽章进度：赛中跟踪本场赛事的徽章目标 */}
    <Section title="赛事徽章进度" subtitle="本场赛事 · 达成后自动计入账号徽章" action={<Link to="/me/badges" className="text-sm font-medium text-text-brand">徽章墙</Link>}>
      <Card className="border border-border-subtle"><div className="space-y-3">{(() => {
        const materialsTotal = Object.keys(runtime.materials).length;
        const materialsDone = Object.values(runtime.materials).filter(Boolean).length;
        const tasksTotal = workshopTasks.length;
        const tasksDone = workshopTasks.filter(task => runtime.taskRuns[task.id]?.status === "completed").length;
        const resultsDone = runtime.acceptedResultIds.length;
        const rows: { id: string; label: string; current: number; total: number; doneText: string; pendingText: string }[] = [
          { id: "badge.competition.team", label: "并肩作战 · 组建团队", current: data.team.members.length > 0 ? 1 : 0, total: 1, doneText: `已组队 ${data.team.members.length} 人`, pendingText: "尚未组队" },
          { id: "badge.competition.materials", label: "兵马未动 · 备齐材料", current: materialsDone, total: materialsTotal, doneText: "材料已备齐", pendingText: `已备齐 ${materialsDone} / ${materialsTotal} 项` },
          { id: "badge.competition.workshop", label: "工坊全勤 · 完成任务", current: tasksDone, total: tasksTotal, doneText: "工坊任务全部完成", pendingText: `已完成 ${tasksDone} / ${tasksTotal} 个任务` },
          { id: "badge.competition.results", label: "成果沉淀 · 归档成果", current: Math.min(resultsDone, 1), total: 1, doneText: `已归档 ${resultsDone} 份成果`, pendingText: "尚未归档成果" },
        ];
        return rows.map(row => {
          const entry = badgeCatalog.find(b => b.id === row.id);
          const pct = row.total > 0 ? Math.min(100, Math.round((row.current / row.total) * 100)) : 0;
          const done = row.current >= row.total;
          return <div key={row.id} className="flex items-center gap-3">
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${done ? entry?.iconColor ?? "" : "bg-surface-subtle text-text-tertiary"}`}>{entry?.iconKey ?? "•"}</div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2"><p className={`text-sm font-medium ${done ? "text-text-primary" : "text-text-secondary"}`}>{row.label}</p><span className="shrink-0 text-xs text-text-tertiary">{done ? row.doneText : row.pendingText}</span></div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-subtle"><div className={`h-full rounded-full ${done ? "bg-success" : "bg-primary"}`} style={{ width: `${pct}%` }} /></div>
            </div>
          </div>;
        });
      })()}</div></Card>
    </Section>
    <Section title="赛事能力"><div className="space-y-2"><button disabled={notStarted} className="flex min-h-touch w-full items-center justify-between rounded-control bg-primary-container px-3 text-left disabled:opacity-50" onClick={() => navigate(`/competitions/${competitionId}/workspace/workshop`)}><span><strong className="block text-sm text-text-brand">创赛工坊</strong><span className="text-xs text-text-secondary">围绕当前参赛项目继续陪跑</span></span><span>›</span></button><button className="flex min-h-touch w-full items-center justify-between rounded-control bg-surface px-3 text-left" onClick={() => navigate(`/competitions/${competitionId}/workspace/resources`)}><span><strong className="block text-sm text-text-primary">赛事资料</strong><span className="text-xs text-text-secondary">规则、模板与赛道资料</span></span><span>›</span></button><button className="flex min-h-touch w-full items-center justify-between rounded-control bg-surface px-3 text-left" onClick={() => navigate(`/benefits?competition=${competitionId}`)}><span><strong className="block text-sm text-text-primary">赛事权益</strong><span className="text-xs text-text-secondary">查看当前赛事来源的可用权益</span></span><span>›</span></button></div></Section>
    <WorkspaceScenarioTools competitionId={competitionId} />
  </div></PublicShell>;
}

export function CompetitionTeamPage() {
  const { competitionId } = useParams();
  const { getRuntime, teamReductionRequestFor, submitTeamReductionRequest } = useWorkshopRuntime();
  const [memberName, setMemberName] = useState("");
  const [reason, setReason] = useState("");
  if (!competitionId) return null;
  const data = workspaceData[competitionId];
  const lifecycle = getRuntime(competitionId).lifecycle;
  const pendingRequest = teamReductionRequestFor(competitionId);
  const canRequestReduction = lifecycle === "inProgress";
  const submitReduction = () => {
    if (!memberName || !reason.trim()) return;
    submitTeamReductionRequest({ competitionId, memberName, reason: reason.trim() });
  };
  return <PublicShell showNavigation={false}><PageHeader title="我的团队" subtitle="当前赛事团队" backTo={`/competitions/${competitionId}/workspace`} /><RequireCompetitionAccess allowNotStarted><div className="space-y-6 px-4 py-5"><CompetitionContextLine competitionId={competitionId} />{data ? <><Card><h1 className="text-lg font-semibold text-text-primary">{data.team.name}</h1><p className="mt-2 text-sm text-text-secondary">团队 ID {data.team.id} · 我的角色 {data.team.role}</p></Card><Section title="成员"><div className="space-y-2">{data.team.members.map(member => <Card key={member.name}><div className="flex items-start justify-between gap-3"><div><p className="font-medium text-text-primary">{member.name}</p><p className="mt-1 text-sm text-text-secondary">{member.school}</p></div><StatusTag tone="neutral">{member.role}</StatusTag></div></Card>)}</div></Section>
      <Section title="赛事期团队维护">{!canRequestReduction ? <Card className="border border-border-subtle"><StatusTag tone="neutral">当前不可提交</StatusTag><p className="mt-3 text-sm leading-6 text-text-secondary">减员申请属于赛事进行期维护动作；报名期成员录入仍由响应式报名系统承接。赛事开始后，如规则允许，可在这里提交减员申请。</p></Card> : pendingRequest ? <Card className="border border-warning bg-warning-bg"><StatusTag tone="warning">待老师 / 运营审核</StatusTag><h2 className="mt-3 font-semibold text-warning-text">减员申请已提交</h2><p className="mt-2 text-sm leading-6 text-warning-text">涉及成员：{pendingRequest.memberName}</p><p className="mt-1 text-sm leading-6 text-warning-text">原因：{pendingRequest.reason}</p><p className="mt-3 text-xs leading-5 text-warning-text">当前成员列表仍是系统事实；审核通过前不会直接改动团队成员。该待审核状态会在本次 App 会话内跨页面保留。</p></Card> : <Card className="space-y-4"><label className="block"><span className="text-sm font-medium text-text-primary">涉及成员</span><select value={memberName} onChange={event => setMemberName(event.target.value)} className="mt-2 min-h-touch w-full rounded-control border border-border bg-surface px-3 text-sm outline-none focus:border-primary"><option value="">请选择成员</option>{data.team.members.map(member => <option key={member.name} value={member.name}>{member.name} · {member.role}</option>)}</select></label><label className="block"><span className="text-sm font-medium text-text-primary">申请原因</span><textarea rows={4} value={reason} onChange={event => setReason(event.target.value)} className="mt-2 w-full rounded-control border border-border bg-surface p-3 text-sm leading-6 outline-none focus:border-primary" placeholder="说明赛事期减员原因" /></label><Button className="w-full" disabled={!memberName || !reason.trim()} onClick={submitReduction}>提交减员申请</Button></Card>}</Section>
    </> : <Card><p className="text-text-secondary">暂无团队数据。</p></Card>}</div></RequireCompetitionAccess></PublicShell>;
}

export function CompetitionResourcesPage() {
  const { competitionId } = useParams();
  if (!competitionId) return null;
  const data = workspaceData[competitionId];
  const resources = data?.resources ?? [];
  return <PublicShell showNavigation={false}><PageHeader title="赛事资料" subtitle="只属于当前赛事上下文" backTo={`/competitions/${competitionId}/workspace`} /><RequireCompetitionAccess allowNotStarted><div className="space-y-5 px-4 py-5"><CompetitionContextLine competitionId={competitionId} />{resources.length ? resources.map(resource => <Link className="block" key={resource.id} to={`/competitions/${competitionId}/workspace/resources/${resource.id}`}><Card interactive><div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold text-text-primary">{resource.title}</h2><p className="mt-2 text-sm text-text-secondary">{resource.description}</p><p className="mt-2 text-xs text-text-tertiary">更新于 {resource.updatedAt}</p></div><StatusTag tone="neutral">{resource.category}</StatusTag></div></Card></Link>) : <Card><p className="text-sm text-text-secondary">当前赛事暂无可用资料。</p></Card>}</div></RequireCompetitionAccess></PublicShell>;
}

export function CompetitionResourceDetailPage() {
  const { competitionId, resourceId } = useParams();
  const [saved, setSaved] = useState(false);
  const [shareStatus, setShareStatus] = useState("");
  if (!competitionId) return null;
  const resource = resourceById(competitionId, resourceId);
  const saveLocal = () => {
    if (!resource) return;
    const blob = new Blob([`${resource.title}\n\n${resource.description}\n\n更新于 ${resource.updatedAt}\n`], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${resource.title}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
    setSaved(true);
  };
  const shareResource = async () => {
    if (!resource) return;
    try {
      if (navigator.share) {
        await navigator.share({ title: resource.title, text: resource.description, url: window.location.href });
        setShareStatus("已调起系统分享，可选择微信或其它应用。");
        return;
      }
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        setShareStatus("资料链接已复制，可发送到微信。");
        return;
      }
      setShareStatus("当前浏览器不支持系统分享，请复制地址栏链接发送到微信。");
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      setShareStatus("分享未完成，可复制当前页面链接发送到微信。");
    }
  };
  return <PublicShell showNavigation={false}><PageHeader title="资料详情" backTo={`/competitions/${competitionId}/workspace/resources`} /><RequireCompetitionAccess allowNotStarted><div className="space-y-5 px-4 py-5"><CompetitionContextLine competitionId={competitionId} />{resource ? <><Card><StatusTag tone="neutral">{resource.category}</StatusTag><h1 className="mt-3 text-lg font-semibold text-text-primary">{resource.title}</h1><p className="mt-3 text-sm leading-6 text-text-secondary">{resource.description}</p><p className="mt-4 text-xs text-text-tertiary">更新于 {resource.updatedAt}</p><div className="mt-5 grid grid-cols-2 gap-3"><Button disabled={saved} onClick={saveLocal}>{saved ? "已保存到本地" : "保存到本地"}</Button><SecondaryButton onClick={shareResource}>分享 / 发送微信</SecondaryButton></div></Card>{saved && <Card className="border border-success bg-success-bg"><p className="font-semibold text-success-text">本地文件已生成</p><p className="mt-1 text-sm text-success-text">浏览器已下载该资料的原型文本文件，不只记录会话状态。</p></Card>}{shareStatus && <Card className="border border-info bg-info-bg"><p className="text-sm text-info-text">{shareStatus}</p></Card>}</> : <Card className="border border-danger bg-danger-bg"><p className="font-medium text-danger-text">资料不存在或已失效。</p></Card>}</div></RequireCompetitionAccess></PublicShell>;
}

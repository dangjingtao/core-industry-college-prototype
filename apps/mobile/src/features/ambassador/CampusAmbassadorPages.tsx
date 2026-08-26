import { CheckCircle2, Clipboard, QrCode, ShieldCheck, UserPlus, UsersRound } from "lucide-react";
import { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import { useAmbassadorState } from "@core/shared";
import { Button, Card, PageHeader, PublicShell, Section, SecondaryButton, StatusTag } from "../../components/ui";
import { usePublicPlatform } from "../public-platform/state";

function accountIdFrom(search: string) {
  return new URLSearchParams(search).get("accountId") || "account-demo";
}

function loginTarget(returnTo: string) {
  return `/auth/login?returnTo=${encodeURIComponent(returnTo)}`;
}

export function CampusAmbassadorLandingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { session } = usePublicPlatform();
  const { campaigns, schoolRecruitmentCodes, teams } = useAmbassadorState();
  const [code, setCode] = useState(new URLSearchParams(location.search).get("code") || "");
  const [error, setError] = useState("");
  const accountId = accountIdFrom(location.search);
  const currentTeam = teams.find(team => team.members.some(member => member.accountId === accountId && member.status === "active"));

  const startApplication = () => {
    const recruitment = schoolRecruitmentCodes.find(item => item.code.toUpperCase() === code.trim().toUpperCase() && item.active);
    const campaign = recruitment ? campaigns.find(item => item.id === recruitment.campaignId) : undefined;
    if (!recruitment || !campaign) {
      setError("请填写有效的学校大使招募码");
      return;
    }
    const target = `/ambassadors/apply?campaignId=${encodeURIComponent(campaign.id)}&schoolId=${encodeURIComponent(recruitment.schoolId)}${accountId === "account-demo" ? "" : `&accountId=${encodeURIComponent(accountId)}`}`;
    navigate(session.loggedIn ? target : loginTarget(target));
  };

  return <PublicShell showNavigation={false}>
    <PageHeader title="核心大使计划" backTo="/home" />
    <div className="space-y-5 px-4 py-5">
      <Card className="border border-primary/20 bg-primary-container">
        <StatusTag tone="info">校园招募</StatusTag>
        <h1 className="mt-3 text-xl font-semibold text-text-primary">成为核心大使，和伙伴一起点亮团队</h1>
        <p className="mt-2 text-sm leading-6 text-text-secondary">团队由 1 位核心大使和至少 3 位推广伙伴组成，点亮后才进入推广阶段。</p>
      </Card>
      {currentTeam ? <Card className="border border-success/30 bg-success-bg">
        <div className="flex items-start gap-3"><CheckCircle2 size={20} className="mt-0.5 text-success-text" /><div><p className="font-semibold text-success-text">你已加入本期推广团队</p><p className="mt-1 text-sm text-success-text">活动期间不能退队或换队，请继续在当前团队内完成组队。</p></div></div>
        <Button className="mt-4 w-full" onClick={() => navigate(`/ambassadors/team/${currentTeam.id}${location.search}`)}>查看我的团队</Button>
      </Card> : <Section title="使用学校招募码" subtitle="学校码只用于进入大使申请，不会直接加入某个团队">
        <Card className="space-y-4">
          <label className="block text-sm font-medium text-text-primary">学校大使招募码<input value={code} onChange={event => { setCode(event.target.value.toUpperCase()); setError(""); }} placeholder="例如 CA-HN-2026" className="mt-2 min-h-11 w-full rounded-control border border-border bg-surface px-3 text-sm" /></label>
          {error && <p className="rounded-control bg-danger-bg px-3 py-2 text-sm text-danger-text">{error}</p>}
          <Button className="w-full" onClick={startApplication}><QrCode size={16} className="mr-2" />进入申请</Button>
        </Card>
      </Section>}
      <Section title="已有团队招募码" subtitle="推广伙伴使用大使分享的团队专属码加入">
        <Card className="flex items-center justify-between gap-3"><div className="flex items-start gap-3"><UsersRound size={20} className="mt-0.5 text-text-brand" /><div><p className="font-medium text-text-primary">我是推广伙伴</p><p className="mt-1 text-xs text-text-secondary">加入后不能退队或换队</p></div></div><SecondaryButton onClick={() => navigate(`/ambassadors/join${location.search}`)}>输入团队码</SecondaryButton></Card>
      </Section>
      <Card className="border border-border-subtle bg-surface-subtle"><div className="flex items-start gap-3"><ShieldCheck size={18} className="mt-0.5 text-text-brand" /><p className="text-xs leading-5 text-text-secondary">核心大使计划属于长期账号上的运营活动，不会创建新的赛事身份。</p></div></Card>
    </div>
  </PublicShell>;
}

export function CampusAmbassadorApplyPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { session } = usePublicPlatform();
  const { campaigns, schoolRecruitmentCodes, applyAsCoreAmbassador, teams } = useAmbassadorState();
  const params = new URLSearchParams(location.search);
  const campaignId = params.get("campaignId") || "";
  const schoolId = params.get("schoolId") || "";
  const accountId = accountIdFrom(location.search);
  const campaign = campaigns.find(item => item.id === campaignId);
  const recruitment = schoolRecruitmentCodes.find(item => item.campaignId === campaignId && item.schoolId === schoolId);
  const existingTeam = teams.find(team => team.campaignId === campaignId && team.members.some(member => member.accountId === accountId && member.status === "active"));
  const [intro, setIntro] = useState("");
  const [channel, setChannel] = useState("");
  const [motivation, setMotivation] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [submittedTeamId, setSubmittedTeamId] = useState<string>();
  const [error, setError] = useState("");

  useEffect(() => {
    if (!submittedTeamId) return;
    if (teams.some(team => team.id === submittedTeamId && team.coreAmbassadorAccountId === accountId)) navigate(`/ambassadors/team/${submittedTeamId}?accountId=${encodeURIComponent(accountId)}`);
  }, [accountId, navigate, submittedTeamId, teams]);

  if (!session.loggedIn) return <Navigate to={loginTarget(location.pathname + location.search)} replace />;
  if (!campaign || !recruitment) return <PublicShell showNavigation={false}><PageHeader title="核心大使申请" backTo="/ambassadors" /><div className="px-4 py-6"><Card className="text-center"><p className="font-semibold">招募入口无效</p><p className="mt-2 text-sm text-text-secondary">请使用有效的学校大使招募码。</p></Card></div></PublicShell>;
  if (existingTeam) return <PublicShell showNavigation={false}><PageHeader title="核心大使申请" backTo="/ambassadors" /><div className="space-y-4 px-4 py-6"><Card className="border border-warning/30 bg-warning-bg"><p className="font-semibold text-warning-text">你已绑定本期团队</p><p className="mt-2 text-sm text-warning-text">同一期活动只能属于一个团队，不能重复申请或换队。</p></Card><Button className="w-full" onClick={() => navigate(`/ambassadors/team/${existingTeam.id}?accountId=${encodeURIComponent(accountId)}`)}>查看当前团队</Button></div></PublicShell>;

  const submit = () => {
    if (!intro.trim() || !channel.trim() || !motivation.trim() || !accepted) {
      setError("请完整填写申请信息并同意活动条款");
      return;
    }
    const teamId = `amb-team-${campaignId}-${accountId}`;
    applyAsCoreAmbassador({ campaignId, schoolId, accountId, application: { intro: intro.trim(), channel: channel.trim(), motivation: motivation.trim(), termsVersion: campaign.termsVersion } });
    setSubmittedTeamId(teamId);
  };

  return <PublicShell showNavigation={false}><PageHeader title="申请核心大使" backTo="/ambassadors" /><div className="space-y-5 px-4 py-5">
    <Card><StatusTag tone="info">{campaign.name}</StatusTag><h1 className="mt-3 text-lg font-semibold">核心大使申请</h1><p className="mt-2 text-sm leading-6 text-text-secondary">提交后直接获得“核心大使 · 待点亮”身份，并生成你的团队招募码。</p></Card>
    <Section title="申请信息" subtitle="用于运营了解校园传播计划，不增加人工审核"><Card className="space-y-4">
      <label className="block text-sm font-medium">自我介绍<textarea value={intro} onChange={event => setIntro(event.target.value)} rows={3} className="mt-2 w-full rounded-control border border-border px-3 py-2 text-sm" /></label>
      <label className="block text-sm font-medium">校园传播渠道<textarea value={channel} onChange={event => setChannel(event.target.value)} rows={3} className="mt-2 w-full rounded-control border border-border px-3 py-2 text-sm" /></label>
      <label className="block text-sm font-medium">参与动机<textarea value={motivation} onChange={event => setMotivation(event.target.value)} rows={3} className="mt-2 w-full rounded-control border border-border px-3 py-2 text-sm" /></label>
    </Card></Section>
    <label className="flex items-start gap-3 rounded-control border border-border bg-surface p-4 text-sm leading-6 text-text-secondary"><input type="checkbox" checked={accepted} onChange={event => setAccepted(event.target.checked)} className="mt-1" /><span>我已阅读并同意本期核心大使计划条款（{campaign.termsVersion}）。</span></label>
    {error && <p className="rounded-control bg-danger-bg px-3 py-2 text-sm text-danger-text">{error}</p>}
    <Button className="w-full" disabled={Boolean(submittedTeamId)} onClick={submit}>{submittedTeamId ? "正在创建团队" : "提交申请，获得团队招募码"}</Button>
  </div></PublicShell>;
}

export function CampusAmbassadorJoinPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { session } = usePublicPlatform();
  const { campaigns, teamRecruitmentCodes, teams, joinAmbassadorTeam } = useAmbassadorState();
  const [code, setCode] = useState(new URLSearchParams(location.search).get("code") || "");
  const [error, setError] = useState("");
  const [pendingTeamId, setPendingTeamId] = useState<string>();
  const accountId = accountIdFrom(location.search);

  useEffect(() => {
    setPendingTeamId(undefined);
    setError("");
    setCode(new URLSearchParams(location.search).get("code") || "");
  }, [location.search]);

  useEffect(() => {
    if (!pendingTeamId) return;
    const joined = teams.some(team => team.id === pendingTeamId && team.members.some(member => member.accountId === accountId && member.status === "active"));
    if (joined) navigate(`/ambassadors/team/${pendingTeamId}?accountId=${encodeURIComponent(accountId)}`);
  }, [accountId, navigate, pendingTeamId, teams]);

  const join = () => {
    const recruitment = teamRecruitmentCodes.find(item => item.code.toUpperCase() === code.trim().toUpperCase() && item.active);
    const target = `/ambassadors/join?code=${encodeURIComponent(code)}${accountId === "account-demo" ? "" : `&accountId=${encodeURIComponent(accountId)}`}`;
    if (!session.loggedIn) {
      navigate(loginTarget(target));
      return;
    }
    if (!recruitment || !campaigns.some(item => item.id === recruitment.campaignId)) {
      setError("团队招募码无效或已失效");
      return;
    }
    if (teams.some(team => team.campaignId === recruitment.campaignId && team.members.some(member => member.accountId === accountId && member.status === "active"))) {
      setError("你已绑定本期其它团队，不能重复加入");
      return;
    }
    joinAmbassadorTeam({ campaignId: recruitment.campaignId, recruitmentCode: recruitment.code, accountId });
    setPendingTeamId(recruitment.teamId);
  };

  return <PublicShell showNavigation={false}><PageHeader title="加入推广团队" backTo="/ambassadors" /><div className="space-y-5 px-4 py-6">
    <Card><UserPlus size={24} className="text-text-brand" /><h1 className="mt-3 text-lg font-semibold">输入团队招募码</h1><p className="mt-2 text-sm leading-6 text-text-secondary">加入后成为推广伙伴，活动期间不能退队或换队。</p></Card>
    <Card className="space-y-4"><label className="block text-sm font-medium">团队招募码<input value={code} onChange={event => { setCode(event.target.value.toUpperCase()); setError(""); }} className="mt-2 min-h-11 w-full rounded-control border border-border px-3 text-sm" /></label>{error && <p className="rounded-control bg-danger-bg px-3 py-2 text-sm text-danger-text">{error}</p>}<Button className="w-full" disabled={Boolean(pendingTeamId)} onClick={join}>{pendingTeamId ? "正在加入" : "加入团队"}</Button></Card>
  </div></PublicShell>;
}

export function CampusAmbassadorTeamPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { teamId } = useParams<{ teamId: string }>();
  const { campaigns, teams, teamRecruitmentCodes } = useAmbassadorState();
  const accountId = accountIdFrom(location.search);
  const team = teams.find(item => item.id === teamId);
  const campaign = team ? campaigns.find(item => item.id === team.campaignId) : undefined;
  const currentMember = team?.members.find(member => member.accountId === accountId && member.status === "active");
  const recruitment = team ? teamRecruitmentCodes.find(item => item.id === team.recruitmentCodeId) : undefined;
  const [copied, setCopied] = useState(false);
  const activeMembers = team?.members.filter(member => member.status === "active") ?? [];
  const partners = activeMembers.filter(member => member.role === "partner");
  const isAmbassador = currentMember?.role === "ambassador";

  const copyCode = async () => {
    if (!recruitment) return;
    try { await navigator.clipboard.writeText(recruitment.code); } catch { /* Prototype fallback. */ }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  if (!team || !campaign || !currentMember) return <PublicShell showNavigation={false}><PageHeader title="我的推广团队" backTo="/ambassadors" /><div className="px-4 py-6"><Card className="text-center"><p className="font-semibold">团队不存在或你无权查看</p><p className="mt-2 text-sm text-text-secondary">请使用当前账号重新进入团队。</p></Card></div></PublicShell>;
  const statusLabel = team.status === "lit" ? "已点亮" : team.status === "ended" ? "已结束" : "待点亮";

  return <PublicShell showNavigation={false}><PageHeader title="我的推广团队" backTo="/ambassadors" /><div className="space-y-5 px-4 py-5">
    <Card className={team.status === "lit" ? "border border-success/30 bg-success-bg" : "border border-warning/30 bg-warning-bg"}><div className="flex items-start justify-between gap-3"><div><StatusTag tone={team.status === "lit" ? "success" : team.status === "ended" ? "neutral" : "warning"}>{statusLabel}</StatusTag><h1 className="mt-3 text-lg font-semibold">核心大使计划团队</h1><p className="mt-1 text-sm text-text-secondary">{campaign.name}</p></div><UsersRound size={24} className="text-text-brand" /></div></Card>
    <Card className="space-y-3"><div className="flex items-center justify-between"><span className="text-sm text-text-secondary">组队进度</span><strong>{activeMembers.length} 人</strong></div><div className="h-2 overflow-hidden rounded-full bg-surface-subtle"><div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, activeMembers.length / 4 * 100)}%` }} /></div><p className="text-xs text-text-secondary">点亮条件：1 位核心大使 + 至少 3 位推广伙伴。点亮后可继续加人。</p>{team.status !== "lit" && <p className="rounded-control bg-warning-bg px-3 py-2 text-sm text-warning-text">还需 {Math.max(0, 3 - partners.length)} 位推广伙伴</p>}</Card>
    {isAmbassador ? <Card className="space-y-3"><div className="flex items-center gap-2"><QrCode size={18} className="text-text-brand" /><h2 className="font-semibold">团队招募码</h2></div><p className="text-sm text-text-secondary">只用于邀请推广伙伴加入当前团队，不是学校招募码。</p><div className="flex items-center gap-2"><code className="min-w-0 flex-1 overflow-wrap-anywhere rounded-control bg-surface-subtle px-3 py-3 text-xs">{recruitment?.code}</code><SecondaryButton onClick={copyCode}><Clipboard size={16} />{copied ? "已复制" : "复制"}</SecondaryButton></div></Card> : <Card className="border border-info bg-info-bg"><p className="text-sm font-semibold text-info-text">你是推广伙伴</p><p className="mt-1 text-sm text-info-text">推广成果和专属推广码将在 T045 按权限开放。</p></Card>}
    <Section title="当前成员"><div className="space-y-2">{activeMembers.map(member => <Card key={member.id} data-testid="ambassador-member" className="flex items-center justify-between"><div><p className="font-medium">{member.role === "ambassador" ? "核心大使" : "推广伙伴"}</p><p className="mt-1 text-xs text-text-tertiary">账号 {member.accountId}</p></div><StatusTag tone={member.role === "ambassador" ? "info" : "neutral"}>{member.role === "ambassador" ? "负责人" : "成员"}</StatusTag></Card>)}</div></Section>
    <SecondaryButton className="w-full" onClick={() => navigate("/ambassadors")}>返回核心大使计划</SecondaryButton>
  </div></PublicShell>;
}

import { useMemo, useState } from "react";
import { Award, Bell, BriefcaseBusiness, ChevronRight, Download, FileText, GraduationCap, Headphones, HelpCircle, Info, Link2, Save, Settings, ShieldCheck, Users, Wallet } from "lucide-react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { Button, Card, GhostButton, PageHeader, PublicShell, SecondaryButton, Section, StatusTag } from "../../components/ui";
import { workspaceData, resultById } from "../competition-workspace/data";
import { completedResults, useWorkshopRuntime } from "../competition-workspace/runtime";
import { usePublicPlatform } from "../public-platform/PublicPlatform";
import { companyById, competitionById, opportunityById } from "../public-platform/data";
import { courses } from "./data";
import { FactCard, ProgressBar, TrustNote } from "./shared";
import { useLongTermAssets } from "./store";

function useExperienceFacts() {
  const { session, identities } = usePublicPlatform();
  const runtime = useWorkshopRuntime();
  if (!session.loggedIn) return [];
  return identities.map(identity => {
    const competition = competitionById(identity.competitionId);
    const workspace = workspaceData[identity.competitionId];
    const lifecycle = runtime.getRuntime(identity.competitionId).lifecycle;
    return { identity, competition, workspace, lifecycle };
  }).filter(item => item.competition && item.workspace);
}

function lifecycleLabel(lifecycle: "notStarted" | "inProgress" | "ended", identityStatus: string) {
  if (identityStatus === "revoked") return "赛事权限已回收";
  return lifecycle === "ended" ? "赛事已结束" : lifecycle === "inProgress" ? "赛事进行中" : "赛事未开始";
}

export function MyPage() {
  const navigate = useNavigate();
  const { applications, followedCompanies, session, continueAsGuest } = usePublicPlatform();
  const { certificates, profile } = useLongTermAssets();
  const [confirmLogout, setConfirmLogout] = useState(false);
  const experiences = useExperienceFacts();
  const activeCertificates = certificates.filter(item => item.status !== "revoked").length;
  const logout = () => {
    continueAsGuest();
    navigate("/auth/login", { replace: true });
  };
  if (!session.loggedIn) return <PublicShell><PageHeader title="我的" /><div className="space-y-4 px-4 py-6"><Card><h2 className="font-semibold text-text-primary">登录后查看长期账号资产</h2><p className="mt-2 text-sm text-text-secondary">赛事经历、课程成果、证书、投递和简历都归长期账号保存。</p></Card><Button className="w-full" onClick={() => navigate("/auth/login?returnTo=/me")}>登录</Button></div></PublicShell>;
  const serviceEntries = [
    { label: "长期资产", to: "/assets", icon: BriefcaseBusiness },
    { label: "我的卡包", to: "/benefits/wallet", icon: Wallet },
    { label: "消息通知", to: "/me/notifications", icon: Bell },
    { label: "比赛团队", to: "/me/teams", icon: Users },
    { label: "账号绑定", to: "/me/accounts", icon: Link2 },
    { label: "设置中心", to: "/me/settings", icon: Settings },
    { label: "帮助与客服", to: "/support", icon: Headphones },
  ];
  const aboutEntries = [
    { label: "用户协议", to: "/legal/user-agreement", icon: FileText },
    { label: "隐私政策", to: "/legal/privacy", icon: ShieldCheck },
    { label: "关于", to: "/about", icon: Info },
  ];
  const summaryLine = `${experiences.length} 段经历 · ${activeCertificates} 张证书 · ${applications.length} 份投递 · 关注 ${followedCompanies.length} 家企业`;
  return <PublicShell><PageHeader title="我的" subtitle="长期账号资产，不随单场赛事结束" /><div className="space-y-7 px-4 py-5"><Card className="space-y-3"><div><p className="text-xs text-text-secondary">{profile.school} · {profile.major}</p><h1 className="mt-1 text-xl font-semibold text-text-primary">{profile.name}</h1><p className="mt-2 text-sm text-text-secondary">{profile.city} · {profile.email}</p></div><GhostButton className="w-full" onClick={() => navigate("/me/profile")}>编辑基础资料</GhostButton></Card>
    <Link to="/assets" className="block"><Card interactive className="flex items-center justify-between gap-3"><div><p className="text-sm font-medium text-text-primary">{summaryLine}</p><p className="mt-1 text-xs text-text-secondary">查看长期资产</p></div><ChevronRight size={18} className="shrink-0 text-text-tertiary" aria-hidden="true" /></Card></Link>
    <Section title="服务入口"><div className="overflow-hidden rounded-container bg-surface">{serviceEntries.map(({ label, to, icon: Icon }, index) => <Link key={to} to={to} className={`flex min-h-16 items-center gap-3 px-4 py-3 active:bg-surface-pressed ${index ? "border-t border-border-subtle" : ""}`}><span className="flex size-9 shrink-0 items-center justify-center rounded-control bg-primary-container text-text-brand"><Icon size={18} aria-hidden="true" /></span><span className="min-w-0 flex-1"><strong className="block text-sm font-medium text-text-primary">{label}</strong></span><ChevronRight size={18} className="shrink-0 text-text-tertiary" aria-hidden="true" /></Link>)}</div></Section>
    <Section title="关于与协议"><div className="overflow-hidden rounded-container bg-surface">{aboutEntries.map(({ label, to, icon: Icon }, index) => <Link key={to} to={to} className={`flex min-h-touch items-center gap-3 px-4 active:bg-surface-pressed ${index ? "border-t border-border-subtle" : ""}`}><Icon size={18} className="shrink-0 text-text-secondary" aria-hidden="true" /><span className="flex-1 text-sm font-medium text-text-primary">{label}</span><ChevronRight size={18} className="shrink-0 text-text-tertiary" aria-hidden="true" /></Link>)}</div></Section>
    <Section title="账号"><Card>{confirmLogout ? <div><h2 className="font-semibold text-text-primary">确定退出登录吗？</h2><p className="mt-2 text-sm leading-6 text-text-secondary">只会清除当前登录 session。简历、赛事经历、课程、证书和其它长期账号资产不会被删除。</p><div className="mt-4 grid grid-cols-2 gap-3"><GhostButton onClick={() => setConfirmLogout(false)}>取消</GhostButton><Button onClick={logout}>确认退出</Button></div></div> : <div><h2 className="font-semibold text-text-primary">当前登录会话</h2><p className="mt-2 text-sm text-text-secondary">退出后仍可浏览公共平台，重新登录后继续使用长期资产。</p><SecondaryButton className="mt-4 w-full" onClick={() => setConfirmLogout(true)}>退出登录</SecondaryButton></div>}</Card></Section>
  </div></PublicShell>;
}

export function AssetsHomePage() {
  const navigate = useNavigate();
  const experiences = useExperienceFacts();
  const { learning, certificates, competitionResults, educationIdentity } = useLongTermAssets();
  const claimableCertificates = certificates.filter(item => item.status === "claimable");
  const identityClaimable = educationIdentity?.status === "claimable";
  return <PublicShell><PageHeader title="长期资产" subtitle="比赛会结束，账号和学生资产不会结束" backTo="/me" /><div className="space-y-6 px-4 py-5"><TrustNote />
    {identityClaimable && <Card className="border border-primary bg-primary-container"><div className="flex items-start gap-3"><span className="flex size-12 shrink-0 items-center justify-center rounded-[16px] bg-primary text-on-primary"><GraduationCap size={26} aria-hidden="true" /></span><div className="min-w-0 flex-1"><h3 className="text-base font-semibold text-text-primary">领取你的可信数字教育身份</h3><p className="mt-1 text-xs leading-5 text-text-secondary">由 {educationIdentity!.verifiedBy} 认证，是你在平台的核心可信凭证，可用于简历、报名等场景的可信背书。</p><Button className="mt-3" onClick={() => navigate("/assets/education-identity")}>立即领取</Button></div></div></Card>}
    {(claimableCertificates.length > 0 || identityClaimable) && <Section title="待领取"><div className="space-y-3">{identityClaimable && <Link to="/assets/education-identity" className="block"><Card interactive className="flex items-start gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-[14px] bg-primary-container text-text-brand"><GraduationCap size={20} aria-hidden="true" /></span><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-3"><h3 className="text-sm font-semibold text-text-primary">可信数字教育身份</h3><StatusTag tone="info">待领取</StatusTag></div><p className="mt-1 text-xs text-text-secondary">{educationIdentity!.verifiedBy} 认证 · {educationIdentity!.school}</p></div><ChevronRight size={18} className="shrink-0 text-text-tertiary" aria-hidden="true" /></Card></Link>}{claimableCertificates.map(item => {
      const sourceTitle = item.sourceType === "competition" ? competitionById(item.competitionId)?.name : courses.find(course => course.id === item.courseId)?.title;
      return <Link key={item.id} to={`/assets/certificates/${item.id}`} className="block"><Card interactive className="flex items-start gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-[14px] bg-[#fff2e8] text-[#c45b1b]"><Award size={20} aria-hidden="true" /></span><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-3"><h3 className="text-sm font-semibold text-text-primary">{item.title}</h3><StatusTag tone="info">可领取</StatusTag></div><p className="mt-1 text-xs text-text-secondary">{item.issuer}{sourceTitle ? ` · ${sourceTitle}` : ""}</p></div><ChevronRight size={18} className="shrink-0 text-text-tertiary" aria-hidden="true" /></Card></Link>;
    })}</div></Section>}
    <Section title="资产概览"><div className="grid grid-cols-2 gap-3"><Link to="/assets/experiences"><Card interactive><strong className="text-2xl text-text-primary">{experiences.length}</strong><p className="mt-1 text-sm text-text-secondary">赛事 / 项目经历</p></Card></Link><Link to="/assets/results"><Card interactive><strong className="text-2xl text-text-primary">{competitionResults.length}</strong><p className="mt-1 text-sm text-text-secondary">成绩 / 可信成果</p></Card></Link><Link to="/assets/learning"><Card interactive><strong className="text-2xl text-text-primary">{learning.filter(item => item.status !== "notStarted").length}</strong><p className="mt-1 text-sm text-text-secondary">学习成果</p></Card></Link><Link to="/assets/certificates"><Card interactive><strong className="text-2xl text-text-primary">{certificates.length}</strong><p className="mt-1 text-sm text-text-secondary">证书记录</p></Card></Link></div></Section><Section title="可信空间服务"><div className="grid grid-cols-3 gap-3"><Link to="/assets/education-identity" className="block"><Card interactive className="flex min-h-[92px] flex-col items-center justify-center gap-2 text-center"><span className="flex size-10 items-center justify-center rounded-[14px] bg-primary-container text-text-brand"><GraduationCap size={20} aria-hidden="true" /></span><span className="text-xs font-medium text-text-primary">教育身份</span></Card></Link><Link to="/assets/verification" className="block"><Card interactive className="flex min-h-[92px] flex-col items-center justify-center gap-2 text-center"><span className="flex size-10 items-center justify-center rounded-[14px] bg-primary-container text-text-brand"><ShieldCheck size={20} aria-hidden="true" /></span><span className="text-xs font-medium text-text-primary">快速验真</span></Card></Link><Link to="/support" className="block"><Card interactive className="flex min-h-[92px] flex-col items-center justify-center gap-2 text-center"><span className="flex size-10 items-center justify-center rounded-[14px] bg-primary-container text-text-brand"><HelpCircle size={20} aria-hidden="true" /></span><span className="text-xs font-medium text-text-primary">帮助中心</span></Card></Link></div></Section>
    <Section title="下一步"><Card><h2 className="font-semibold text-text-primary">把可信事实整理成自己的履历表达</h2><p className="mt-2 text-sm leading-5 text-text-secondary">系统事实保持只读；你可以选择哪些经历进入长期简历，并编辑面向岗位的表达。</p><SecondaryButton className="mt-4 w-full" onClick={() => navigate("/me/resume")}>整理长期简历</SecondaryButton></Card></Section></div></PublicShell>;
}

export function ExperiencesPage() {
  const experiences = useExperienceFacts();
  return <PublicShell showNavigation={false}><PageHeader title="赛事经历" backTo="/assets" /><div className="space-y-4 px-4 py-5">{experiences.length ? experiences.map(({ identity, competition, workspace, lifecycle }) => <Link key={identity.competitionId} to={`/assets/experiences/${identity.competitionId}`} className="block"><FactCard title={competition!.name} meta={`${workspace!.team.role} · ${workspace!.project.name}`} action={<StatusTag tone={lifecycle === "ended" || identity.identityStatus === "revoked" ? "neutral" : "info"}>{lifecycleLabel(lifecycle, identity.identityStatus)}</StatusTag>}><p className="text-sm leading-5 text-text-secondary">{workspace!.project.summary}</p></FactCard></Link>) : <Card><p className="text-sm text-text-secondary">当前账号还没有赛事经历。</p></Card>}</div></PublicShell>;
}

export function ExperienceDetailPage() {
  const { experienceId } = useParams();
  const experience = useExperienceFacts().find(item => item.identity.competitionId === experienceId);
  const { learningFor } = useLongTermAssets();
  if (!experience) return <PublicShell showNavigation={false}><PageHeader title="经历不存在" backTo="/assets/experiences" /></PublicShell>;
  const { identity, competition, workspace, lifecycle } = experience;
  const relatedCourses = courses.filter(course => course.source.type === "competition" && course.source.competitionId === experienceId);
  return <PublicShell showNavigation={false}><PageHeader title="参赛经历" backTo="/assets/experiences" /><div className="space-y-6 px-4 py-5"><div><StatusTag tone={lifecycle === "ended" || identity.identityStatus === "revoked" ? "neutral" : "info"}>{lifecycleLabel(lifecycle, identity.identityStatus)}</StatusTag><h1 className="mt-3 text-xl font-semibold leading-7 text-text-primary">{competition?.name}</h1></div><Card className="space-y-3"><div><p className="text-xs text-text-secondary">项目</p><p className="mt-1 font-semibold text-text-primary">{workspace?.project.name}</p><p className="mt-2 text-sm leading-5 text-text-secondary">{workspace?.project.summary}</p></div><div className="grid grid-cols-2 gap-3 border-t border-border-subtle pt-3 text-sm"><div><p className="text-text-tertiary">团队角色</p><p className="mt-1 font-medium text-text-primary">{workspace?.team.role}</p></div><div><p className="text-text-tertiary">赛道</p><p className="mt-1 font-medium text-text-primary">{workspace?.project.track}</p></div></div></Card><Section title="比赛结果与证书"><div className="grid grid-cols-2 gap-3"><Link to="/assets/results"><Card interactive><p className="font-medium text-text-primary">成绩 / 成果</p><p className="mt-1 text-xs text-text-secondary">查看系统结果事实</p></Card></Link><Link to="/assets/certificates"><Card interactive><p className="font-medium text-text-primary">证书</p><p className="mt-1 text-xs text-text-secondary">查看统一证书记录</p></Card></Link></div></Section>{relatedCourses.length > 0 && <Section title="赛事关联学习成果"><div className="space-y-3">{relatedCourses.map(course => { const record = learningFor(course.id); return <Link key={course.id} to={`/courses/${course.id}/achievement`} className="block"><Card interactive><div className="flex items-center justify-between gap-3"><div><p className="font-medium text-text-primary">{course.title}</p><p className="mt-1 text-xs text-text-secondary">进度 {record.progress}%</p></div><StatusTag tone={record.status === "completed" ? "success" : "info"}>{record.status === "completed" ? "已完成" : "学习中"}</StatusTag></div></Card></Link>; })}</div></Section>}{(lifecycle === "ended" || identity.identityStatus === "revoked") && <Card className="border border-border-subtle"><p className="font-semibold text-text-primary">赛事期权限保持关闭</p><p className="mt-2 text-sm leading-5 text-text-secondary">这里仅查看长期资产，不会因为打开历史经历重新激活该赛事 workspace。</p></Card>}</div></PublicShell>;
}

export function LearningAssetsPage() {
  const { learning, learningFor } = useLongTermAssets();
  const active = courses.filter(course => learningFor(course.id).status !== "notStarted");
  return <PublicShell showNavigation={false}><PageHeader title="学习成果" backTo="/assets" /><div className="space-y-4 px-4 py-5">{active.map(course => { const record = learningFor(course.id); return <Link key={course.id} to={`/courses/${course.id}/achievement`} className="block"><FactCard title={course.title} meta={course.source.label} action={<StatusTag tone={record.status === "completed" ? "success" : "info"}>{record.status === "completed" ? "已完成" : "学习中"}</StatusTag>}><ProgressBar value={record.progress} /><p className="text-xs text-text-secondary">考试：{record.assessment === "passed" ? "已通过" : record.assessment === "failed" ? "未通过" : "未参加"}</p></FactCard></Link>; })}{learning.length === 0 && <Card><p className="text-sm text-text-secondary">还没有学习记录。</p></Card>}</div></PublicShell>;
}

export function ResultsPage() {
  const experiences = useExperienceFacts();
  const { competitionResults } = useLongTermAssets();
  const runtime = useWorkshopRuntime();
  const workshopFacts = useMemo(() => experiences.flatMap(experience => completedResults(runtime.getRuntime(experience.identity.competitionId)).map(result => ({ competitionId: experience.identity.competitionId, result }))), [experiences, runtime]);
  return <PublicShell showNavigation={false}><PageHeader title="成绩与可信成果" backTo="/assets" /><div className="space-y-6 px-4 py-5"><TrustNote /><Section title="赛事结果事实"><div className="space-y-3">{competitionResults.map(record => { const competition = competitionById(record.competitionId); const template = resultById(record.resultId); return <Link key={record.id} to={`/assets/results/${record.id}`} className="block"><FactCard title={record.grade} meta={`${competition?.name ?? record.competitionId}${template ? ` · ${template.title}` : ""}`} action={<StatusTag tone={record.status === "trusted" ? "success" : record.status === "pending" ? "warning" : "neutral"}>{record.status === "trusted" ? "可信" : record.status === "pending" ? "处理中" : "已归档"}</StatusTag>} /></Link>; })}</div></Section><Section title="赛事工坊项目成果"><div className="space-y-3">{workshopFacts.slice(0,8).map(({ competitionId, result }) => <Card key={`${competitionId}:${result.id}`}><p className="text-xs text-text-secondary">{competitionById(competitionId)?.name}</p><h3 className="mt-1 font-semibold text-text-primary">{result.title}</h3><p className="mt-2 text-sm leading-5 text-text-secondary">{result.summary}</p><p className="mt-3 text-xs text-text-brand">来源 ID：{result.id}</p></Card>)}</div></Section></div></PublicShell>;
}

export function ResultDetailPage() {
  const { resultId } = useParams();
  const { competitionResults } = useLongTermAssets();
  const record = competitionResults.find(item => item.id === resultId);
  if (!record) return <PublicShell showNavigation={false}><PageHeader title="结果不存在" backTo="/assets/results" /></PublicShell>;
  const competition = competitionById(record.competitionId);
  const template = resultById(record.resultId);
  return <PublicShell showNavigation={false}><PageHeader title="结果详情" backTo="/assets/results" /><div className="space-y-5 px-4 py-5"><Card className="space-y-3"><div className="flex items-start justify-between gap-3"><div><p className="text-xs text-text-secondary">{competition?.name}</p><h1 className="mt-1 text-xl font-semibold text-text-primary">{record.grade}</h1></div><StatusTag tone={record.status === "trusted" ? "success" : "warning"}>{record.status === "trusted" ? "系统可信事实" : "处理中"}</StatusTag></div>{template && <><p className="text-sm leading-5 text-text-secondary">关联项目成果：{template.title}</p><p className="text-sm leading-5 text-text-secondary">{template.summary}</p></>}</Card>{record.certificateId && <Link to={`/assets/certificates/${record.certificateId}`} className="block"><Card interactive><p className="font-medium text-text-primary">查看关联证书 →</p></Card></Link>}<TrustNote /></div></PublicShell>;
}

export function CertificatesPage() {
  const { certificates } = useLongTermAssets();
  return <PublicShell showNavigation={false}><PageHeader title="我的证书" backTo="/assets" /><div className="space-y-4 px-4 py-5">{certificates.map(item => <Link key={item.id} to={`/assets/certificates/${item.id}`} className="block"><FactCard title={item.title} meta={`${item.issuer} · ${item.sourceType === "competition" ? "赛事" : "课程"}来源`} action={<StatusTag tone={item.status === "claimed" ? "success" : item.status === "claimable" ? "info" : item.status === "pending" ? "warning" : "danger"}>{item.status === "claimed" ? "已领取" : item.status === "claimable" ? "可领取" : item.status === "pending" ? "待发放" : "已撤销"}</StatusTag>} /></Link>)}</div></PublicShell>;
}

export function CertificateDetailPage() {
  const { certificateId } = useParams();
  const navigate = useNavigate();
  const { certificates, claimCertificate } = useLongTermAssets();
  const item = certificates.find(value => value.id === certificateId);
  if (!item) return <PublicShell showNavigation={false}><PageHeader title="证书不存在" backTo="/assets/certificates" /></PublicShell>;
  const sourceTitle = item.sourceType === "competition" ? competitionById(item.competitionId)?.name : courses.find(course => course.id === item.courseId)?.title;
  return <PublicShell showNavigation={false}><PageHeader title="证书详情" backTo="/assets/certificates" /><div className="space-y-5 px-4 py-5"><Card className="space-y-4"><div><p className="text-xs text-text-secondary">{item.issuer}</p><h1 className="mt-1 text-xl font-semibold leading-7 text-text-primary">{item.title}</h1></div><div className="grid grid-cols-2 gap-3 text-sm"><div><p className="text-text-tertiary">来源</p><p className="mt-1 text-text-primary">{sourceTitle ?? "—"}</p></div><div><p className="text-text-tertiary">状态</p><p className="mt-1 text-text-primary">{item.status}</p></div></div><div className="border-t border-border-subtle pt-3"><p className="text-xs text-text-tertiary">验真码</p><p className="mt-1 font-mono text-sm text-text-primary">{item.verificationCode}</p></div></Card>{item.status === "claimable" && <Button className="w-full" onClick={() => claimCertificate(item.id)}>领取证书</Button>}<SecondaryButton className="w-full" onClick={() => navigate(`/assets/verification?code=${encodeURIComponent(item.verificationCode)}`)}>快速验真</SecondaryButton><TrustNote /></div></PublicShell>;
}

export function VerificationPage() {
  const { certificates } = useLongTermAssets();
  const routeLocation = useLocation();
  const params = new URLSearchParams(routeLocation.search);
  const [code, setCode] = useState(params.get("code") ?? "");
  const [checked, setChecked] = useState(false);
  const match = checked ? certificates.find(item => item.verificationCode.toLowerCase() === code.trim().toLowerCase() && item.status !== "revoked") : undefined;
  return <PublicShell showNavigation={false}><PageHeader title="快速验真" backTo="/assets" /><div className="space-y-5 px-4 py-5"><Card><label className="text-sm font-medium text-text-primary">证书验真码</label><input value={code} onChange={event => { setCode(event.target.value); setChecked(false); }} className="mt-3 min-h-touch w-full rounded-control border border-border bg-surface px-3 text-sm outline-none focus:border-primary" placeholder="输入证书验真码" /><Button className="mt-3 w-full" disabled={!code.trim()} onClick={() => setChecked(true)}>验证</Button></Card>{checked && (match ? <Card className="border border-success bg-success-bg"><p className="font-semibold text-success-text">验证通过</p><p className="mt-2 text-sm text-success-text">{match.title} · {match.issuer}</p></Card> : <Card className="border border-danger bg-danger-bg"><p className="font-semibold text-danger-text">未找到有效记录</p><p className="mt-2 text-sm text-danger-text">请检查验真码，或确认该证书是否已撤销。</p></Card>)}</div></PublicShell>;
}

export function ApplicationsAssetSummary() {
  const { applications } = usePublicPlatform();
  return <div className="space-y-3">{applications.map(record => <Card key={record.opportunityId}><p className="font-medium text-text-primary">{opportunityById(record.opportunityId)?.title ?? record.opportunityId}</p><p className="mt-1 text-xs text-text-secondary">共享状态：{record.status}</p></Card>)}</div>;
}

function downloadPrototypeArtifact(filename: string, lines: string[]) {
  const body = [
    "核心产业学院｜中保真原型下载占位",
    "",
    ...lines,
    "",
    "说明：真实环境应由可信凭证服务返回正式文件；本原型仅验证下载交互与信息边界。",
  ].join("\n");
  const blob = new Blob([body], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function EducationIdentityPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { educationIdentity, claimEducationIdentity } = useLongTermAssets();
  const [saved, setSaved] = useState(false);
  const justClaimed = new URLSearchParams(location.search).get("claimed") === "1";
  if (!educationIdentity) return <PublicShell showNavigation={false}><PageHeader title="可信数字教育身份" backTo="/assets" /><div className="space-y-5 px-4 py-5"><Card><p className="text-sm text-text-secondary">当前账号暂无教育身份数据。</p></Card></div></PublicShell>;
  const statusLabel = educationIdentity.status === "claimed" ? "已领取" : educationIdentity.status === "claimable" ? "待领取" : educationIdentity.status === "revoked" ? "已撤销" : "未绑定";
  const isClaimed = educationIdentity.status === "claimed";
  const claim = () => {
    claimEducationIdentity();
    navigate(`${location.pathname}?claimed=1`, { replace: true });
  };
  return <PublicShell showNavigation={false}><PageHeader title="可信数字教育身份" backTo="/assets" /><div className="space-y-5 px-4 py-5">
    {justClaimed && isClaimed && <Card className="border border-success bg-success-bg"><p className="font-semibold text-success-text">领取成功</p><p className="mt-2 text-sm leading-5 text-success-text">可信数字教育身份已领取，可作为学历背景的可信凭证使用。</p></Card>}
    <Card className="space-y-4"><div className="flex items-start gap-3"><span className="flex size-12 shrink-0 items-center justify-center rounded-[16px] bg-primary-container text-text-brand"><GraduationCap size={26} aria-hidden="true" /></span><div><p className="text-xs text-text-secondary">{educationIdentity.verifiedBy} 认证</p><h1 className="mt-1 text-xl font-semibold leading-7 text-text-primary">可信数字教育身份</h1></div></div><div className="grid grid-cols-2 gap-3 text-sm"><div><p className="text-text-tertiary">姓名</p><p className="mt-1 text-text-primary">{educationIdentity.name}</p></div><div><p className="text-text-tertiary">状态</p><p className="mt-1 text-text-primary">{statusLabel}</p></div><div><p className="text-text-tertiary">学校</p><p className="mt-1 text-text-primary">{educationIdentity.school}</p></div><div><p className="text-text-tertiary">专业</p><p className="mt-1 text-text-primary">{educationIdentity.major}</p></div><div className="col-span-2"><p className="text-text-tertiary">学籍号</p><p className="mt-1 text-text-primary">{educationIdentity.studentId}</p></div></div><div className="border-t border-border-subtle pt-3"><p className="text-xs text-text-tertiary">{isClaimed ? "身份核验码" : "凭证编号（尚未生效）"}</p><p className="mt-1 font-mono text-sm text-text-primary">{educationIdentity.verificationCode}</p></div></Card>
    {educationIdentity.status === "claimable" && <><Button className="w-full" onClick={claim}>领取教育身份</Button><Card className="border border-info bg-info-bg"><p className="font-semibold text-info-text">领取后成为可信教育身份凭证</p><p className="mt-2 text-sm leading-5 text-info-text">当前仅表示教育信息已核验；领取后可用于简历、报名等场景的可信背书。</p></Card></>}
    {isClaimed && <>
      <div className="grid grid-cols-2 gap-3"><SecondaryButton className="w-full" onClick={() => setSaved(true)}><Save size={16} aria-hidden="true" />{saved ? "已保存" : "保存凭证"}</SecondaryButton><SecondaryButton className="w-full" onClick={() => downloadPrototypeArtifact(`${educationIdentity.id}-education-identity.txt`, [`可信数字教育身份`, `姓名：${educationIdentity.name}`, `学校：${educationIdentity.school}`, `专业：${educationIdentity.major}`, `学籍号：${educationIdentity.studentId}`, `认证方：${educationIdentity.verifiedBy}`, `核验码：${educationIdentity.verificationCode}`])}><Download size={16} aria-hidden="true" />下载凭证</SecondaryButton></div>
      {saved && <Card className="border border-success bg-success-bg"><p className="text-sm font-medium text-success-text">凭证已保存到本地资产动作（Mock）</p><p className="mt-1 text-xs text-success-text">真实客户端应保存正式图片 / PDF，并处理系统相册或文件权限。</p></Card>}
    </>}
    <TrustNote />
  </div></PublicShell>;
}

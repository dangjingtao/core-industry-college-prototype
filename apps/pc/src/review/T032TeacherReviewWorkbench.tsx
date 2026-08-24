import { useState, type ReactNode } from "react";
import { ArrowLeft, CheckCircle2, ChevronRight, ClipboardCheck, LockKeyhole, School, XCircle } from "lucide-react";
import { Link, Navigate, Route, Routes, useNavigate, useParams } from "react-router-dom";
import { Button, SecondaryButton, StatusTag } from "../components/ui";
import { ReviewProvider, useReview, type ReviewTeam, type SchoolReviewStatus } from "./model";

const reviewBase = "/review";

const statusTone: Record<SchoolReviewStatus, "success" | "warning" | "danger"> = {
  approved: "success",
  pending: "warning",
  rejected: "danger",
};

const statusLabel: Record<SchoolReviewStatus, string> = {
  approved: "已通过",
  pending: "待审核",
  rejected: "已驳回",
};

function Shell({ title, children, back }: { title: string; children: ReactNode; back?: string }) {
  const { teacher } = useReview();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border-subtle bg-surface">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-4 py-4 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-container bg-primary-container text-text-brand"><ClipboardCheck size={20} aria-hidden="true" /></span>
            <div>
              <p className="font-semibold text-text-primary">学校审核工作台</p>
              <p className="text-xs text-text-tertiary">第十六届全国大学生三创赛</p>
            </div>
          </div>
          {teacher && <div className="text-right"><p className="text-sm font-medium text-text-primary">{teacher.name}</p><p className="text-xs text-text-tertiary">{teacher.school}</p></div>}
        </div>
      </header>

      {teacher && <div className="border-b border-border-subtle bg-surface-subtle/70"><div className="mx-auto flex max-w-[1280px] items-center gap-2 px-4 py-3 text-sm lg:px-8"><School size={16} className="text-text-brand" aria-hidden="true" /><span className="text-text-secondary">当前审核范围：</span><b className="text-text-primary">{teacher.school}</b><span className="text-text-tertiary">· 仅显示本校报名团队</span></div></div>}

      <main className="mx-auto max-w-[1280px] px-4 py-6 lg:px-8">
        <div className="mb-5">
          {back && <Link to={back} className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-text-brand"><ArrowLeft size={15} aria-hidden="true" />返回审核列表</Link>}
          <h1 className="text-2xl font-semibold text-text-primary">{title}</h1>
        </div>
        {children}
      </main>
    </div>
  );
}

function Panel({ title, children, action }: { title?: string; children: ReactNode; action?: ReactNode }) {
  return <section className="overflow-hidden rounded-container border border-border-subtle bg-surface">{(title || action) && <div className="flex min-h-14 items-center justify-between gap-3 border-b border-border-subtle px-5 py-3"><h2 className="font-semibold text-text-primary">{title}</h2>{action}</div>}<div className="p-5">{children}</div></section>;
}

function LoginPage() {
  const navigate = useNavigate();
  const { selectTeacher } = useReview();
  const [account, setAccount] = useState("teacher.gpnu");
  const [password, setPassword] = useState("prototype123");
  const login = () => {
    if (!account.trim() || !password.trim()) return;
    selectTeacher({ name: "王老师", school: "广东技术师范大学", competitionId: "sanchuang-16", competitionName: "第十六届全国大学生三创赛" });
    navigate(`${reviewBase}/overview`);
  };
  return <Shell title="教师登录"><div className="mx-auto max-w-xl"><Panel><div className="space-y-4"><div className="rounded-control bg-primary-container/40 p-4 text-sm leading-6 text-text-secondary"><div className="flex items-center gap-2 font-medium text-text-primary"><LockKeyhole size={16} aria-hidden="true" />账号由系统统一分配</div><p className="mt-1">教师无需自主注册。登录后自动进入本人授权学校的审核范围。</p></div><label className="block"><span className="text-sm text-text-secondary">账号</span><input value={account} onChange={event => setAccount(event.target.value)} className="mt-2 h-11 w-full rounded-control border border-border bg-surface px-3 text-sm" /></label><label className="block"><span className="text-sm text-text-secondary">密码</span><input type="password" value={password} onChange={event => setPassword(event.target.value)} className="mt-2 h-11 w-full rounded-control border border-border bg-surface px-3 text-sm" /></label><Button className="w-full" onClick={login}>登录审核工作台</Button></div></Panel></div></Shell>;
}

function TeamRow({ team }: { team: ReviewTeam }) {
  const navigate = useNavigate();
  return <tr className="border-b border-border-subtle"><td className="px-4 py-4"><p className="font-medium text-text-primary">{team.teamName}</p><p className="mt-1 text-xs text-text-tertiary">团队 ID {team.teamId}</p></td><td className="px-4 py-4 text-sm text-text-secondary">{team.leaderName}</td><td className="px-4 py-4 text-sm text-text-secondary">{team.category}</td><td className="px-4 py-4 text-sm text-text-secondary">{team.members.length} 人</td><td className="px-4 py-4 text-sm text-text-secondary">{team.submittedAt}</td><td className="px-4 py-4"><StatusTag tone={statusTone[team.status]}>{statusLabel[team.status]}</StatusTag></td><td className="px-4 py-4"><button onClick={() => navigate(`${reviewBase}/teams/${team.id}`)} className="inline-flex items-center gap-1 text-sm font-medium text-text-brand">{team.status === "pending" ? "审核" : "查看"}<ChevronRight size={14} aria-hidden="true" /></button></td></tr>;
}

function OverviewPage() {
  const { teacher, teams } = useReview();
  const [filter, setFilter] = useState<"all" | SchoolReviewStatus>("pending");
  if (!teacher) return <Navigate to={`${reviewBase}/login`} replace />;
  const scopedTeams = teams.filter(team => team.school === teacher.school);
  const visible = filter === "all" ? scopedTeams : scopedTeams.filter(team => team.status === filter);
  const filters: Array<{ value: "all" | SchoolReviewStatus; label: string }> = [
    { value: "pending", label: "待审核" },
    { value: "approved", label: "已通过" },
    { value: "rejected", label: "已驳回" },
    { value: "all", label: "全部" },
  ];
  return <Shell title="报名审核"><div className="space-y-5"><div className="grid gap-3 sm:grid-cols-3"><Panel><p className="text-3xl font-semibold text-text-primary">{scopedTeams.filter(team => team.status === "pending").length}</p><p className="mt-1 text-sm text-text-secondary">待审核</p></Panel><Panel><p className="text-3xl font-semibold text-text-primary">{scopedTeams.filter(team => team.status === "approved").length}</p><p className="mt-1 text-sm text-text-secondary">已通过</p></Panel><Panel><p className="text-3xl font-semibold text-text-primary">{scopedTeams.filter(team => team.status === "rejected").length}</p><p className="mt-1 text-sm text-text-secondary">已驳回</p></Panel></div><Panel title="本校报名团队" action={<div className="flex flex-wrap gap-2">{filters.map(item => <button key={item.value} onClick={() => setFilter(item.value)} className={`rounded-full px-3 py-2 text-sm font-medium ${filter === item.value ? "bg-primary-container text-text-brand" : "bg-surface-subtle text-text-secondary"}`}>{item.label}</button>)}</div>}><div className="overflow-x-auto"><table className="min-w-[900px] w-full text-left"><thead><tr className="border-b border-border-subtle text-xs text-text-tertiary">{["团队","队长","赛道","成员","提交时间","状态","操作"].map(item => <th key={item} className="px-4 py-3 font-medium">{item}</th>)}</tr></thead><tbody>{visible.map(team => <TeamRow key={team.id} team={team} />)}</tbody></table>{!visible.length && <div className="py-14 text-center text-sm text-text-tertiary">当前没有对应的审核任务</div>}</div></Panel></div></Shell>;
}

function DetailPage() {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const { teacher, teams, approveTeam, rejectTeam } = useReview();
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  if (!teacher) return <Navigate to={`${reviewBase}/login`} replace />;
  const team = teams.find(item => item.id === teamId && item.school === teacher.school);
  if (!team) return <Shell title="无法查看该团队" back={`${reviewBase}/overview`}><Panel><p className="text-sm text-text-secondary">该团队不在当前教师的授权学校范围内。</p></Panel></Shell>;
  const approve = () => { approveTeam(team.id); navigate(`${reviewBase}/overview`); };
  const reject = () => { if (!reason.trim()) return; rejectTeam(team.id, reason.trim()); navigate(`${reviewBase}/overview`); };
  return <Shell title={team.teamName} back={`${reviewBase}/overview`}><div className="space-y-5"><Panel title="团队信息" action={<StatusTag tone={statusTone[team.status]}>{statusLabel[team.status]}</StatusTag>}><div className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4"><div><span className="text-text-tertiary">队长</span><p className="mt-1 font-medium text-text-primary">{team.leaderName}</p></div><div><span className="text-text-tertiary">联系电话</span><p className="mt-1 font-medium text-text-primary">{team.leaderPhone}</p></div><div><span className="text-text-tertiary">赛道</span><p className="mt-1 font-medium text-text-primary">{team.category}</p></div><div><span className="text-text-tertiary">成员人数</span><p className="mt-1 font-medium text-text-primary">{team.members.length} 人</p></div></div></Panel><Panel title="项目基础信息"><p className="text-sm leading-6 text-text-secondary">{team.projectSummary || "暂无项目摘要"}</p></Panel><Panel title="团队成员"><div className="divide-y divide-border-subtle">{team.members.map(member => <div key={`${member.name}-${member.studentId}`} className="grid gap-2 py-3 text-sm sm:grid-cols-[1fr_1fr_1fr]"><span className="font-medium text-text-primary">{member.name}</span><span className="text-text-secondary">学号 {member.studentId}</span><span className="text-text-secondary">{member.phone}</span></div>)}</div></Panel>{team.status === "pending" ? <Panel title="审核结论"><div className="space-y-4">{rejecting && <label className="block"><span className="text-sm text-text-secondary">驳回原因</span><textarea value={reason} onChange={event => setReason(event.target.value)} rows={4} placeholder="请说明需要学生修正的内容" className="mt-2 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm" /></label>}<div className="flex flex-wrap justify-end gap-3">{rejecting ? <><SecondaryButton onClick={() => { setRejecting(false); setReason(""); }}>取消</SecondaryButton><Button disabled={!reason.trim()} onClick={reject}><XCircle className="mr-2 h-4 w-4" aria-hidden="true" />确认驳回</Button></> : <><SecondaryButton onClick={() => setRejecting(true)}>驳回</SecondaryButton><Button onClick={approve}><CheckCircle2 className="mr-2 h-4 w-4" aria-hidden="true" />审核通过</Button></>}</div></div></Panel> : <Panel title="审核记录"><p className="text-sm text-text-secondary">审核时间：{team.reviewedAt || "—"}</p>{team.status === "rejected" && <p className="mt-2 text-sm leading-6 text-danger-text">驳回原因：{team.rejectionReason}</p>}</Panel>}</div></Shell>;
}

function WorkbenchRoutes() {
  return <Routes><Route index element={<Navigate to="login" replace />} /><Route path="login" element={<LoginPage />} /><Route path="overview" element={<OverviewPage />} /><Route path="teams/:teamId" element={<DetailPage />} /><Route path="*" element={<Navigate to="login" replace />} /></Routes>;
}

export function T032TeacherReviewWorkbench() {
  return <ReviewProvider><WorkbenchRoutes /></ReviewProvider>;
}

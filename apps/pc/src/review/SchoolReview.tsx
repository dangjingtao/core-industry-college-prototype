import { useState, type ReactNode } from "react";
import { ArrowLeft, Check, ChevronRight, ClipboardCheck, GraduationCap, ShieldCheck, X } from "lucide-react";
import { Link, Navigate, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import { Button, SecondaryButton, StatusTag } from "../components/ui";
import { ReviewProvider, useReview, type ReviewTeam, type SchoolReviewStatus, type SchoolReviewScenario } from "./model";

const reviewBase = "/review";

const mockTeachers = ["王老师（电子商务学院）", "张老师（教务处）"] as const;

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

function ReviewShell({ title, children, actions, back }: { title: string; children: ReactNode; actions?: ReactNode; back?: { to: string; label: string } }) {
  const { teacher } = useReview();
  return <div className="min-h-screen bg-background text-foreground">
    <div className="flex items-center justify-center gap-2 border-b border-warning/20 bg-warning-bg px-4 py-2 text-center text-sm font-medium text-warning-text">
      <ShieldCheck aria-hidden="true" className="h-4 w-4 shrink-0" />
      <span>学校报名审核 · 老师只查看授权赛事 + 授权学校 · 中保真流程原型</span>
    </div>
    <header className="border-b border-border-subtle bg-surface">
      <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-4 px-4 py-4 lg:px-8">
        <Link to={`${reviewBase}/overview`} className="flex min-w-0 items-center gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-container bg-primary-container text-xl font-bold text-text-brand"><ClipboardCheck aria-hidden="true" /></div>
          <div className="min-w-0"><p className="truncate text-sm font-semibold text-text-primary sm:text-base">核心产业学院 · 学校报名审核</p><p className="mt-0.5 text-xs text-text-secondary">三创赛第十六届 · 报名真实性审核</p></div>
        </Link>
        <div className="hidden items-center gap-2 md:flex">
          <Link to={`${reviewBase}/overview`} className="rounded-control px-3 py-2 text-sm text-text-secondary hover:bg-surface-subtle">审核总览</Link>
          <Link to={`${reviewBase}/login`} className="rounded-control px-3 py-2 text-sm text-text-secondary hover:bg-surface-subtle">切换身份</Link>
          <span className="text-xs text-text-tertiary">独立原型路由</span>
        </div>
      </div>
    </header>
    {teacher && <div className="border-b border-border-subtle bg-surface-subtle/60">
      <div className="mx-auto flex w-full max-w-[1440px] flex-wrap items-center gap-3 px-4 py-3 text-sm lg:px-8">
        <GraduationCap size={17} aria-hidden="true" className="text-text-brand" />
        <span className="font-semibold text-text-primary">{teacher.name}</span>
        <span className="text-text-tertiary">·</span>
        <span className="text-text-secondary">授权学校：<b className="text-text-primary">{teacher.school}</b></span>
        <span className="text-text-tertiary">·</span>
        <span className="text-text-secondary">授权赛事：<b className="text-text-primary">{teacher.competitionName}</b></span>
      </div>
    </div>}
    <div className="mx-auto grid w-full max-w-[1440px] gap-6 px-4 py-6 lg:px-8">
      <main className="min-w-0">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>{back && <Link to={back.to} className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-text-brand"><ArrowLeft size={15} aria-hidden="true" />{back.label}</Link>}<h1 className="text-2xl font-semibold text-text-primary sm:text-[28px]">{title}</h1><p className="mt-1 text-sm text-text-secondary">独立于平台运营后台的老师审核视角，只读本授权学校的报名团队。</p></div>
          {actions}
        </div>
        {children}
      </main>
    </div>
    <ScenarioDock />
  </div>;
}

function Panel({ title, children, action, className = "" }: { title?: string; children: ReactNode; action?: ReactNode; className?: string }) {
  return <section className={`overflow-hidden rounded-container border border-border-subtle bg-surface ${className}`}>
    {(title || action) && <div className="flex min-h-14 items-center justify-between gap-3 border-b border-border-subtle px-4 py-3 sm:px-6"><h2 className="text-base font-semibold text-text-primary sm:text-lg">{title}</h2>{action}</div>}
    <div className="p-4 sm:p-6">{children}</div>
  </section>;
}

function LoginPage() {
  const navigate = useNavigate();
  const { teacher, selectTeacher } = useReview();
  const [teacherName, setTeacherName] = useState<string>(teacher?.name ?? mockTeachers[0]);
  const enter = () => {
    selectTeacher({ name: teacherName, school: "广东技术师范大学", competitionId: "sanchuang-16", competitionName: "第十六届全国大学生三创赛" });
    navigate(`${reviewBase}/overview`);
  };
  return <ReviewShell title="学校报名审核 · 身份入口"><div className="mx-auto max-w-2xl space-y-5">
    <Panel title="选择审核身份">
      <div className="space-y-5">
        <label className="grid gap-2 sm:grid-cols-[132px_minmax(0,1fr)] sm:items-center"><span className="text-sm text-text-secondary">所属学校</span><select className="h-11 w-full rounded-control border border-border bg-surface px-3 text-sm text-text-primary outline-none focus:border-primary"><option>广东技术师范大学</option></select></label>
        <label className="grid gap-2 sm:grid-cols-[132px_minmax(0,1fr)] sm:items-center"><span className="text-sm text-text-secondary">审核老师</span><select value={teacherName} onChange={event => setTeacherName(event.target.value)} className="h-11 w-full rounded-control border border-border bg-surface px-3 text-sm text-text-primary outline-none focus:border-primary">{mockTeachers.map(name => <option key={name}>{name}</option>)}</select></label>
        <div className="rounded-control bg-surface-subtle p-4 text-sm leading-6 text-text-secondary"><p className="font-semibold text-text-primary">授权范围</p><p className="mt-1">授权赛事：第十六届全国大学生三创赛 · 报名真实性审核</p><p className="mt-1">数据范围：广东技术师范大学（跨校团队由队长所在学校统一审核）</p><p className="mt-1">不可访问：学生其它赛事、简历、投递、权益消费、工坊个人内容</p></div>
        <div className="flex justify-end"><Button onClick={enter}>进入审核控制台</Button></div>
      </div>
    </Panel>
    <Panel title="审核原则"><ol className="space-y-3 text-sm leading-6 text-text-secondary"><li><b className="text-text-primary">1. 审核对象</b><p className="mt-1">队长所在学校为授权学校的报名团队，跨校团队由队长学校统一审核整个团队。</p></li><li><b className="text-text-primary">2. 审核内容</b><p className="mt-1">报名资料、团队与成员信息、参赛项目材料与必要联系方式。</p></li><li><b className="text-text-primary">3. 审核动作</b><p className="mt-1">通过后团队继续填写承诺书；驳回时需说明原因，团队修正后可重新提交。</p></li><li><b className="text-text-primary">4. 边界</b><p className="mt-1">平台审核通过不等于官方参赛资格；官方资格由外部权威来源确认。</p></li></ol></Panel>
  </div></ReviewShell>;
}

function StatCard({ label, value, tone }: { label: string; value: number; tone: "warning" | "success" | "danger" | "neutral" }) {
  return <div className="rounded-container border border-border-subtle bg-surface p-5"><p className="text-3xl font-semibold text-text-primary">{value}</p><p className="mt-1 text-sm text-text-secondary">{label}</p><div className="mt-3"><StatusTag tone={tone}>{label}</StatusTag></div></div>;
}

function OverviewPage() {
  const navigate = useNavigate();
  const { teacher, teams } = useReview();
  const [filter, setFilter] = useState<"all" | SchoolReviewStatus>("all");
  if (!teacher) return <Navigate to={`${reviewBase}/login`} replace />;
  const counts = { pending: teams.filter(team => team.status === "pending").length, approved: teams.filter(team => team.status === "approved").length, rejected: teams.filter(team => team.status === "rejected").length };
  const visible = filter === "all" ? teams : teams.filter(team => team.status === filter);
  const filters: Array<{ value: "all" | SchoolReviewStatus; label: string }> = [["all", "全部"], ["pending", "待审核"], ["approved", "已通过"], ["rejected", "已驳回"]].map(([value, label]) => ({ value: value as "all" | SchoolReviewStatus, label }));
  return <ReviewShell title="审核总览"><div className="space-y-5">
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="待审核" value={counts.pending} tone="warning" />
      <StatCard label="已通过" value={counts.approved} tone="success" />
      <StatCard label="已驳回" value={counts.rejected} tone="danger" />
      <StatCard label="全部团队" value={teams.length} tone="neutral" />
    </section>
    <Panel title="报名团队审核列表" action={<div className="flex gap-2">{filters.map(item => <button key={item.value} data-testid={`review-filter-${item.value}`} onClick={() => setFilter(item.value)} className={`min-h-9 rounded-full px-3 text-sm font-medium ${filter === item.value ? "bg-primary-container text-text-brand" : "bg-surface-subtle text-text-secondary hover:bg-surface-pressed"}`}>{item.label}</button>)}</div>}>
      <div className="overflow-x-auto">
        <table className="min-w-[980px] w-full border-collapse text-sm">
          <thead><tr className="bg-surface-subtle text-left text-xs text-text-tertiary">{["团队 / 队长","学校","成员","赛道","提交时间","状态","操作"].map(item => <th key={item} className="border border-border-subtle px-3 py-3 font-medium">{item}</th>)}</tr></thead>
          <tbody>{visible.map(team => <tr key={team.id} data-testid={`review-team-row-${team.id}`} className="border-b border-border-subtle align-top"><td className="border border-border-subtle px-3 py-3"><p className="font-semibold text-text-primary">{team.teamName}</p><p className="mt-1 text-xs text-text-secondary">{team.leaderName} · 队长</p><p className="mt-1 font-mono text-[11px] text-text-tertiary">teamId={team.teamId}</p></td><td className="border border-border-subtle px-3 py-3 text-xs leading-5">{team.school}{team.crossSchool && <span className="ml-1.5 rounded-full bg-info-bg px-2 py-0.5 text-[11px] text-info-text">跨校</span>}</td><td className="border border-border-subtle px-3 py-3 text-xs text-text-secondary">{team.members.length} 人</td><td className="border border-border-subtle px-3 py-3 text-xs text-text-secondary">{team.category}</td><td className="border border-border-subtle px-3 py-3 text-xs text-text-secondary">{team.submittedAt}</td><td className="border border-border-subtle px-3 py-3"><StatusTag tone={statusTone[team.status]}>{statusLabel[team.status]}</StatusTag></td><td className="border border-border-subtle px-3 py-3"><button data-testid={`review-open-${team.id}`} onClick={() => navigate(`${reviewBase}/teams/${team.id}`)} className="inline-flex items-center gap-1 text-xs font-semibold text-text-brand">{team.status === "pending" ? "去审核" : "查看"}<ChevronRight size={14} aria-hidden="true" /></button></td></tr>)}</tbody>
        </table>
        {!visible.length && <div className="py-14 text-center text-sm text-text-tertiary">当前筛选条件下没有报名团队</div>}
      </div>
    </Panel>
  </div></ReviewShell>;
}

function TeamDetailPage() {
  const navigate = useNavigate();
  const { teamId } = useParams();
  const { teacher, teams, approveTeam, rejectTeam, reopenTeam } = useReview();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");
  if (!teacher) return <Navigate to={`${reviewBase}/login`} replace />;
  const team = teams.find(item => item.id === teamId);
  if (!team) return <ReviewShell title="团队不存在" back={{ to: `${reviewBase}/overview`, label: "返回审核总览" }}><Panel><div className="py-10 text-center text-sm text-text-secondary">没有找到这个报名团队，可能已不在当前授权范围内。</div></Panel></ReviewShell>;
  const reject = () => { if (!reason.trim()) return; rejectTeam(team.id, reason.trim()); setRejectOpen(false); setReason(""); };
  return <ReviewShell title={team.teamName} back={{ to: `${reviewBase}/overview`, label: "返回审核总览" }} actions={<StatusTag tone={statusTone[team.status]}>{statusLabel[team.status]}</StatusTag>}>
    <div className="space-y-5">
      <Panel title="团队基本信息"><div className="grid gap-5 md:grid-cols-2"><div className="rounded-container bg-surface-subtle p-4"><p className="text-xs text-text-tertiary">学校 / 地区</p><p className="mt-1 text-base font-semibold text-text-primary">{team.school}</p><p className="mt-1 text-sm text-text-secondary">{team.province}{team.crossSchool ? " · 跨校团队" : " · 校内团队"}</p></div><div className="rounded-container bg-surface-subtle p-4"><p className="text-xs text-text-tertiary">队长联系方式</p><p className="mt-1 text-base font-semibold text-text-primary">{team.leaderName}</p><p className="mt-1 text-sm text-text-secondary">{team.leaderPhone} · {team.leaderEmail}</p></div></div><div className="mt-4 grid gap-3 text-sm sm:grid-cols-3"><div className="rounded-control bg-surface-subtle px-3 py-2.5"><span className="text-xs text-text-tertiary">团队ID</span><p className="mt-0.5 font-mono text-text-primary">{team.teamId}</p></div><div className="rounded-control bg-surface-subtle px-3 py-2.5"><span className="text-xs text-text-tertiary">赛道 / 类别</span><p className="mt-0.5 text-text-primary">{team.category}</p></div><div className="rounded-control bg-surface-subtle px-3 py-2.5"><span className="text-xs text-text-tertiary">首次参赛</span><p className="mt-0.5 text-text-primary">{team.firstParticipation ? "是" : "否"}</p></div></div></Panel>
      <Panel title="团队成员信息" action={<StatusTag tone="neutral">{team.members.length} 人</StatusTag>}><div className="overflow-x-auto"><table className="min-w-[760px] w-full border-collapse text-sm"><thead><tr className="bg-surface-subtle text-left text-xs text-text-tertiary">{["姓名","学校 / 公司","手机号码","邮箱","学号"].map(item => <th key={item} className="border border-border-subtle px-3 py-3 font-medium">{item}</th>)}</tr></thead><tbody>{team.members.map((member, index) => <tr key={member.email} className="align-top"><td className="border border-border-subtle px-3 py-3 font-medium text-text-primary">{member.name}</td><td className="border border-border-subtle px-3 py-3 text-xs">{member.school}</td><td className="border border-border-subtle px-3 py-3 text-xs text-text-secondary">{member.phone}</td><td className="border border-border-subtle px-3 py-3 text-xs text-text-secondary">{member.email}</td><td className="border border-border-subtle px-3 py-3 font-mono text-xs text-text-secondary">{member.studentId}</td></tr>)}</tbody></table></div></Panel>
      <Panel title="报名材料"><div className="rounded-container bg-surface-subtle p-4"><p className="text-xs text-text-tertiary">项目摘要</p><p className="mt-2 text-sm leading-6 text-text-primary">{team.projectSummary}</p></div><div className="mt-4 flex flex-wrap gap-3 text-sm text-text-secondary"><span className="rounded-control bg-surface-subtle px-3 py-2">团队信息表单</span><span className="rounded-control bg-surface-subtle px-3 py-2">成员绑定记录</span><span className="rounded-control bg-surface-subtle px-3 py-2">提交时间 {team.submittedAt}</span></div></Panel>
      <Panel title="审核操作">
        {team.status === "pending" && <div>
          <div className="rounded-control bg-warning-bg px-4 py-3 text-sm text-warning-text">该团队已提交报名材料，等待学校审核真实性。核对团队与成员信息后作出审核决定。</div>
          <div className="mt-5 flex flex-wrap items-center gap-3"><Button data-testid="review-approve" onClick={() => approveTeam(team.id)}>审核通过</Button><SecondaryButton data-testid="review-reject-toggle" onClick={() => setRejectOpen(open => !open)}>驳回</SecondaryButton></div>
          {rejectOpen && <div className="mt-4 rounded-container border border-border-subtle p-4"><label className="block text-sm text-text-secondary">驳回原因<span className="ml-1 text-danger">*</span><textarea data-testid="review-reject-reason" value={reason} onChange={event => setReason(event.target.value)} rows={3} placeholder="说明驳回原因，团队将据此修正后重新提交" className="mt-2 w-full rounded-control border border-border px-3 py-2 text-sm text-text-primary outline-none focus:border-primary" /></label><div className="mt-3 flex justify-end gap-2"><SecondaryButton onClick={() => { setRejectOpen(false); setReason(""); }}>取消</SecondaryButton><Button data-testid="review-reject-submit" disabled={!reason.trim()} onClick={reject} className="bg-danger text-on-primary">确认驳回</Button></div></div>}
        </div>}
        {team.status === "approved" && <div><div className="rounded-control bg-success-bg px-4 py-3 text-sm text-success-text">该团队已审核通过，可继续填写承诺书并完成报名材料。审核时间：{team.reviewedAt}。</div><div className="mt-5 flex flex-wrap items-center gap-3"><SecondaryButton data-testid="review-reopen" onClick={() => reopenTeam(team.id)}>恢复为待审核</SecondaryButton></div></div>}
        {team.status === "rejected" && <div><div className="rounded-control bg-danger-bg px-4 py-3 text-sm text-danger-text">该团队已驳回：{team.rejectionReason}</div><div className="mt-5 flex flex-wrap items-center gap-3"><SecondaryButton data-testid="review-reopen" onClick={() => reopenTeam(team.id)}>恢复为待审核</SecondaryButton></div></div>}
      </Panel>
    </div>
  </ReviewShell>;
}

function ScenarioDock() {
  const navigate = useNavigate();
  const { loadScenario } = useReview();
  const scenarios: Array<[SchoolReviewScenario, string, string]> = [
    ["all", "混合样例", `${reviewBase}/overview`],
    ["pending", "仅待审核", `${reviewBase}/overview`],
    ["approved", "仅已通过", `${reviewBase}/overview`],
    ["rejected", "仅已驳回", `${reviewBase}/overview`],
  ];
  return <details className="fixed bottom-3 right-3 z-50 max-w-[calc(100vw-24px)] rounded-container border border-border-subtle bg-surface p-2 text-xs shadow-floating"><summary className="cursor-pointer px-2 py-1 font-medium text-text-secondary">审核原型状态</summary><div className="mt-2 grid grid-cols-2 gap-1 sm:grid-cols-4">{scenarios.map(([scenario, label, to]) => <button key={scenario} className="min-h-8 rounded-control px-2 text-text-brand hover:bg-primary-container" onClick={() => { loadScenario(scenario); navigate(to); }}>{label}</button>)}</div></details>;
}

export function SchoolReview() {
  return <ReviewProvider><Routes>
    <Route index element={<Navigate to="login" replace />} />
    <Route path="login" element={<LoginPage />} />
    <Route path="overview" element={<OverviewPage />} />
    <Route path="teams/:teamId" element={<TeamDetailPage />} />
    <Route path="*" element={<Navigate to="login" replace />} />
  </Routes></ReviewProvider>;
}

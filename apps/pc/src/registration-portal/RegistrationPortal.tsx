import { useState, type ReactNode } from "react";
import { Bell, Check } from "lucide-react";
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { Button, SecondaryButton, StatusTag } from "../components/ui";
import {
  demoConflictMember,
  demoMember,
  demoUnregisteredMember,
  RegistrationPortalProvider,
  resolveMemberAccount,
  useRegistrationPortal,
  type ReviewStatus,
  type TeamMember,
} from "./model";

const portalBase = "/registration-portal";

function Shell({ title, children, step, showNav = false }: { title: string; children: ReactNode; step?: number; showNav?: boolean }) {
  const location = useLocation();
  const nav = [
    ["团队信息", `${portalBase}/team`],
    ["承诺书", `${portalBase}/commitment`],
    ["团队业绩报告", `${portalBase}/report`],
    ["证书下载", `${portalBase}/certificates`],
  ] as const;
  return <div className="min-h-screen bg-background text-foreground">
    <div className="flex items-center justify-center gap-2 border-b border-warning/20 bg-warning-bg px-4 py-2 text-center text-sm font-medium text-warning-text"><Bell className="h-4 w-4" aria-hidden="true" />团队注册报名时间：2025年10月20日—2026年1月20日 · T028 账号流程修正版</div>
    <header className="border-b border-border-subtle bg-surface"><div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-4 lg:px-8"><Link to={`${portalBase}/start`} className="font-semibold text-text-primary">全国大学生电子商务“创新、创意及创业”挑战赛</Link><span className="text-xs text-text-tertiary">队长 PC 报名入口</span></div></header>
    <div className={`mx-auto grid max-w-[1440px] gap-6 px-4 py-6 lg:px-8 ${showNav ? "lg:grid-cols-[220px_minmax(0,1fr)]" : ""}`}>
      {showNav && <aside className="hidden lg:block"><div className="overflow-hidden rounded-container border border-border-subtle bg-surface">{nav.map(([label, to]) => <Link key={to} to={to} className={`block border-b border-border-subtle px-5 py-4 text-sm font-medium last:border-0 ${location.pathname.startsWith(to) ? "bg-primary-container text-text-brand" : "text-text-secondary"}`}>{label}</Link>)}</div></aside>}
      <main className="min-w-0"><div className="mb-5"><h1 className="text-2xl font-semibold text-text-primary">{title}</h1><p className="mt-1 text-sm text-text-secondary">队员账号只在学校审核通过后创建 / 绑定；团队提交阶段只保存赛事报名资料。</p></div>{step !== undefined && <Steps current={step} />}{children}</main>
    </div>
    <ScenarioDock />
  </div>;
}

function Panel({ title, children, action }: { title?: string; children: ReactNode; action?: ReactNode }) {
  return <section className="overflow-hidden rounded-container border border-border-subtle bg-surface">{(title || action) && <div className="flex min-h-14 items-center justify-between border-b border-border-subtle px-5 py-3"><h2 className="font-semibold text-text-primary">{title}</h2>{action}</div>}<div className="p-5">{children}</div></section>;
}

function Field({ label, value, onChange, required = false, disabled = false }: { label: string; value: string; onChange: (value: string) => void; required?: boolean; disabled?: boolean }) {
  return <label className="grid gap-2 sm:grid-cols-[120px_1fr] sm:items-center"><span className="text-sm text-text-secondary">{required && <span className="mr-1 text-danger">*</span>}{label}</span><input value={value} disabled={disabled} onChange={event => onChange(event.target.value)} className="h-11 rounded-control border border-border bg-surface px-3 text-sm disabled:bg-surface-subtle" /></label>;
}

function Steps({ current }: { current: number }) {
  const labels = ["队长账号", "赛事规则", "团队资料", "学校审核", "账号创建", "承诺书", "完成"];
  return <div className="mb-6 overflow-x-auto rounded-container border border-border-subtle bg-surface p-3"><div className="flex min-w-[720px] items-center">{labels.map((label, index) => <div key={label} className="flex flex-1 items-center gap-2"><span className={`grid h-7 w-7 place-items-center rounded-full text-xs font-semibold ${index < current ? "bg-success text-white" : index === current ? "bg-primary text-on-primary" : "bg-surface-subtle text-text-tertiary"}`}>{index < current ? <Check className="h-4 w-4" /> : index + 1}</span><span className="text-xs font-medium text-text-primary">{label}</span>{index < labels.length - 1 && <span className="h-px flex-1 bg-border-subtle" />}</div>)}</div></div>;
}

function statusTone(status: ReviewStatus) {
  return status === "approved" || status === "completed" ? "success" as const : status === "pending" ? "warning" as const : status === "rejected" ? "danger" as const : "neutral" as const;
}

function accountLabel(member: TeamMember) {
  if (member.accountResolution === "conflict") return "手机号账号解析异常";
  if (member.accountResolution === "provision") return "未注册 · 审核通过后创建";
  if (member.accountResolution === "provisioned") return "待激活账号已创建";
  if (member.competitionBinding === "bound") return "赛事身份已绑定 · 待本人确认";
  return "已有账号 · 审核通过后绑定";
}

function accountTone(member: TeamMember) {
  if (member.accountResolution === "conflict") return "danger" as const;
  if (member.accountResolution === "provision" || member.accountResolution === "provisioned") return "warning" as const;
  return member.competitionBinding === "bound" ? "success" as const : "info" as const;
}

function StartPage() {
  const navigate = useNavigate();
  const { reset, setRole } = useRegistrationPortal();
  return <Shell title="三创赛报名" step={0}><div className="grid gap-5 lg:grid-cols-2"><Panel><StatusTag tone="info">第十六届全国大学生三创赛</StatusTag><h2 className="mt-4 text-xl font-semibold text-text-primary">由队长在 PC 发起团队报名</h2><p className="mt-3 text-sm leading-6 text-text-secondary">队员无需提前注册核心学院。队长录入赛事要求的成员资料，学校审核通过后系统才处理 App 账号。</p><Button className="mt-6" onClick={() => { reset(); setRole("leader"); navigate(`${portalBase}/account`); }}>我是队长，开始报名</Button></Panel><Panel title="账号处理时序"><ol className="space-y-3 text-sm leading-6 text-text-secondary"><li>1. 队长提交团队 → 只进入学校审核。</li><li>2. 审核通过 → 按手机号查询长期账号。</li><li>3. 未注册 → 创建待激活账号。</li><li>4. 已注册 → 复用原账号并增加赛事身份。</li><li>5. 减员 → 只回收本赛事关系，不注销 App。</li></ol></Panel></div></Shell>;
}

function AccountPage() {
  const navigate = useNavigate();
  const { role, account, updateAccount } = useRegistrationPortal();
  const [mode, setMode] = useState<"login" | "register">("login");
  if (role !== "leader") return <Navigate to={`${portalBase}/start`} replace />;
  return <Shell title="队长账号" step={0}><Panel title="使用核心学院长期账号"><div className="mx-auto max-w-3xl space-y-4"><div className="grid grid-cols-2 gap-2 rounded-control bg-surface-subtle p-1"><button className={`h-11 rounded-control text-sm font-medium ${mode === "login" ? "bg-surface text-text-brand" : "text-text-secondary"}`} onClick={() => setMode("login")}>已有账号登录</button><button className={`h-11 rounded-control text-sm font-medium ${mode === "register" ? "bg-surface text-text-brand" : "text-text-secondary"}`} onClick={() => setMode("register")}>新队长注册</button></div><Field label="手机号" value={account.phone} required onChange={phone => updateAccount({ phone })} />{mode === "register" && <><Field label="学校" value={account.school} required onChange={school => updateAccount({ school })} /><Field label="赛道" value={account.track} required onChange={track => updateAccount({ track })} /><Field label="团队名称" value={account.teamName} required onChange={teamName => updateAccount({ teamName })} /><Field label="邮箱" value={account.email} required onChange={email => updateAccount({ email })} /></>}<div className="rounded-control bg-primary-container/40 p-3 text-sm leading-6 text-text-secondary">手机号是当前登录与账号解析凭证；长期资产归属于稳定 userId，未来换绑手机号不会迁移成新账号。</div><div className="flex justify-end"><Button onClick={() => navigate(`${portalBase}/quiz`)}>{mode === "login" ? "登录并继续报名" : "注册并继续报名"}</Button></div></div></Panel></Shell>;
}

function QuizPage() {
  const navigate = useNavigate();
  const { role, passQuiz } = useRegistrationPortal();
  const [answer, setAnswer] = useState("");
  if (role !== "leader") return <Navigate to={`${portalBase}/start`} replace />;
  return <Shell title="赛事规则确认" step={1}><Panel><h2 className="font-semibold text-text-primary">普通队员的核心学院账号在什么时候创建 / 绑定？</h2><div className="mt-4 grid gap-3">{["队长保存草稿时", "学校审核团队通过后", "队员必须提前自己注册"].map((item, index) => <button key={item} onClick={() => setAnswer(String(index))} className={`rounded-control border p-3 text-left text-sm ${answer === String(index) ? "border-primary bg-primary-container" : "border-border"}`}>{String.fromCharCode(65 + index)}. {item}</button>)}</div><div className="mt-5 flex justify-end"><Button disabled={!answer} onClick={() => { passQuiz(); navigate(`${portalBase}/registration-success`); }}>提交答题</Button></div></Panel></Shell>;
}

function RegistrationSuccessPage() {
  const navigate = useNavigate();
  return <Shell title="队长账号已就绪" step={2}><Panel><div className="py-6 text-center"><h2 className="text-xl font-semibold text-text-primary">继续填写团队与成员资料</h2><p className="mt-2 text-sm text-text-secondary">团队提交只进入学校审核；审核通过后才统一处理普通队员账号。</p><Button className="mt-5" onClick={() => navigate(`${portalBase}/team`)}>进入团队报名</Button></div></Panel></Shell>;
}

function MemberWaitingPage() {
  return <Shell title="队员无需 PC 注册"><Panel><p className="text-sm leading-6 text-text-secondary">队员账号在学校审核通过后处理：未注册手机号创建待激活账号；已有账号自动增加赛事身份。</p></Panel></Shell>;
}

function TeamPage() {
  const navigate = useNavigate();
  const { team, updateTeam, members, reviewStatus, submitReview, removeMember } = useRegistrationPortal();
  if (reviewStatus === "closed") return <Navigate to={`${portalBase}/closed`} replace />;
  const readOnly = reviewStatus !== "draft" && reviewStatus !== "rejected";
  const resolutionRisk = members.some(member => member.accountResolution === "conflict");
  const currentStep = reviewStatus === "draft" || reviewStatus === "rejected" ? 2 : reviewStatus === "pending" ? 3 : 4;
  return <Shell title="团队信息" step={currentStep} showNav><div className="space-y-5">{readOnly && <div className="rounded-control bg-warning-bg p-3 text-sm text-warning-text">团队已进入学校审核；普通队员账号尚未因此自动创建。审核通过后才执行账号写操作。</div>}{resolutionRisk && <div className="rounded-control bg-danger-bg p-3 text-sm text-danger-text">存在手机号账号解析异常样例。它不阻塞学校判断团队报名真实性；若学校审核通过，该成员的账号处理进入人工补偿。</div>}<Panel title="团队基本信息" action={<StatusTag tone={statusTone(reviewStatus)}>{reviewStatus === "pending" ? "等待学校审核" : reviewStatus === "approved" ? "审核通过" : reviewStatus === "rejected" ? "审核未通过" : "待提交"}</StatusTag>}><div className="space-y-4"><Field label="比赛类别" value={team.category} required disabled={readOnly} onChange={category => updateTeam({ category })} /><Field label="团队名称" value={team.teamName} required disabled={readOnly} onChange={teamName => updateTeam({ teamName })} /><Field label="联系电话" value={team.phone} required disabled={readOnly} onChange={phone => updateTeam({ phone })} /><Field label="邮箱" value={team.email} required disabled={readOnly} onChange={email => updateTeam({ email })} /></div></Panel><Panel title="成员账号规则"><div className="grid gap-3 md:grid-cols-3"><div className="rounded-control bg-info-bg p-4"><StatusTag tone="info">已有账号</StatusTag><p className="mt-2 text-sm leading-5 text-info-text">审核通过后按手机号复用原 userId。姓名、学校、学号不作为长期账号强匹配条件。</p></div><div className="rounded-control bg-warning-bg p-4"><StatusTag tone="warning">未注册</StatusTag><p className="mt-2 text-sm leading-5 text-warning-text">审核通过后创建待激活账号；本人首次验证码登录后再激活长期平台能力。</p></div><div className="rounded-control bg-danger-bg p-4"><StatusTag tone="danger">解析异常</StatusTag><p className="mt-2 text-sm leading-5 text-danger-text">仅指手机号无法唯一解析到长期账号的系统级异常；审核通过后转人工处理。</p></div></div></Panel><Panel title="团队成员" action={!readOnly && <Button onClick={() => navigate(`${portalBase}/members`)}>录入成员</Button>}><div className="space-y-3">{members.length ? members.map(member => <div key={member.id} className="flex flex-col gap-3 rounded-control border border-border-subtle p-4 sm:flex-row sm:items-center"><div className="min-w-0 flex-1"><p className="font-medium text-text-primary">{member.name} · {member.phone}</p><p className="mt-1 text-xs text-text-secondary">{member.school} · {member.studentId}</p></div><StatusTag tone={accountTone(member)}>{accountLabel(member)}</StatusTag>{!readOnly && <button onClick={() => removeMember(member.id)} className="text-sm text-danger">移除</button>}</div>) : <p className="py-6 text-center text-sm text-text-tertiary">暂无成员。直接录入赛事要求资料，不要求队员先注册。</p>}</div></Panel><Panel title="赛事期减员与 App 账号"><p className="text-sm leading-6 text-text-secondary">减员审核通过后只回收本赛事团队 / 工作区权限；长期账号、手机号绑定、其它赛事身份与长期资产继续保留。</p></Panel><div className="flex justify-end gap-3">{reviewStatus === "draft" || reviewStatus === "rejected" ? <Button disabled={!members.length} onClick={() => { submitReview(); navigate(`${portalBase}/review`); }}>{reviewStatus === "rejected" ? "修正后重新提交审核" : "提交团队进入学校审核"}</Button> : <Button onClick={() => navigate(`${portalBase}/review`)}>查看审核状态</Button>}</div></div></Shell>;
}

function AddMembersPage() {
  const navigate = useNavigate();
  const { members, addMember, removeMember } = useRegistrationPortal();
  const [draft, setDraft] = useState({ name: "", school: "", phone: "", email: "", studentId: "" });
  const valid = draft.name.trim() && draft.school.trim() && /^1\d{10}$/.test(draft.phone) && draft.email.trim() && draft.studentId.trim();
  const add = () => { if (!valid) return; addMember({ id: `member-${draft.phone}`, ...draft, ...resolveMemberAccount(draft.phone) }); setDraft({ name: "", school: "", phone: "", email: "", studentId: "" }); };
  return <Shell title="录入团队成员" step={2} showNav><div className="space-y-5"><Panel title="赛事成员资料"><div className="space-y-4"><div className="rounded-control bg-primary-container/40 p-3 text-sm leading-6 text-text-secondary">手机号用于审核通过后的账号解析；姓名、学校、学号按赛事报名要求填写，但不作为长期账号强绑定条件。</div><Field label="姓名" value={draft.name} required onChange={name => setDraft(current => ({ ...current, name }))} /><Field label="学校" value={draft.school} required onChange={school => setDraft(current => ({ ...current, school }))} /><Field label="手机号" value={draft.phone} required onChange={phone => setDraft(current => ({ ...current, phone: phone.replace(/\D/g, "").slice(0, 11) }))} /><Field label="邮箱" value={draft.email} required onChange={email => setDraft(current => ({ ...current, email }))} /><Field label="学号" value={draft.studentId} required onChange={studentId => setDraft(current => ({ ...current, studentId }))} /><Button disabled={!valid} onClick={add}>加入团队名单</Button></div></Panel><Panel title="原型状态样例"><div className="grid gap-3 md:grid-cols-3">{[demoMember, demoUnregisteredMember, demoConflictMember].map(member => <div key={member.id} className="rounded-control border border-border-subtle p-4"><StatusTag tone={accountTone(member)}>{accountLabel(member)}</StatusTag><p className="mt-3 font-medium text-text-primary">{member.name}</p><p className="mt-1 text-xs text-text-secondary">{member.phone}</p>{members.some(item => item.id === member.id) ? <SecondaryButton className="mt-3 w-full" onClick={() => removeMember(member.id)}>移除样例</SecondaryButton> : <Button className="mt-3 w-full" onClick={() => addMember(member)}>加入此状态样例</Button>}</div>)}</div></Panel><div className="flex justify-end"><Button onClick={() => navigate(`${portalBase}/team`)}>保存成员并返回</Button></div></div></Shell>;
}

function ReviewPage() {
  const navigate = useNavigate();
  const { reviewStatus, rejectReview, approveReview, members, rejectionReason } = useRegistrationPortal();
  if (reviewStatus === "draft") return <Navigate to={`${portalBase}/team`} replace />;
  const pendingNew = members.filter(m => m.accountResolution === "provision").length;
  const pendingExisting = members.filter(m => m.accountResolution === "registered" && m.competitionBinding === "notBound").length;
  const risks = members.filter(m => m.accountResolution === "conflict").length;
  const provisioned = members.filter(m => m.accountResolution === "provisioned").length;
  const bound = members.filter(m => m.accountResolution === "registered" && m.competitionBinding === "bound").length;
  return <Shell title="报名审核状态" step={reviewStatus === "approved" || reviewStatus === "completed" ? 4 : 3} showNav><Panel><div className="mx-auto max-w-2xl py-4 text-center"><StatusTag tone={statusTone(reviewStatus)}>{reviewStatus === "pending" ? "等待学校审核" : reviewStatus === "rejected" ? "审核未通过" : "审核通过"}</StatusTag>{reviewStatus === "pending" && <><h2 className="mt-4 text-xl font-semibold text-text-primary">团队已提交，等待学校审核真实性</h2><p className="mt-2 text-sm leading-6 text-text-secondary">预计审核通过后创建 {pendingNew} 个待激活账号、绑定 {pendingExisting} 个已有账号{risks ? `；另有 ${risks} 个手机号账号解析异常需要人工处理` : ""}。</p><div className="mt-4 rounded-control bg-surface-subtle p-3 text-sm text-text-secondary">当前账号写操作：0 个新账号、0 个赛事身份绑定。</div><div className="mt-5 grid gap-3 sm:grid-cols-2"><SecondaryButton onClick={rejectReview}>模拟审核未通过</SecondaryButton><Button onClick={approveReview}>模拟审核通过</Button></div></>}{reviewStatus === "rejected" && <><h2 className="mt-4 text-xl font-semibold text-danger-text">团队审核未通过</h2><p className="mt-2 text-sm text-text-secondary">{rejectionReason}</p><p className="mt-3 text-sm text-text-secondary">普通队员不会因此创建账号或绑定赛事身份。</p><Button className="mt-5" onClick={() => navigate(`${portalBase}/team`)}>返回修正</Button></>}{(reviewStatus === "approved" || reviewStatus === "completed") && <><h2 className="mt-4 text-xl font-semibold text-success-text">审核通过，成员账号处理已触发</h2><p className="mt-2 text-sm leading-6 text-text-secondary">已创建 {provisioned} 个待激活账号；已为 {bound} 个已有账号绑定本次赛事身份。自动绑定先标记为“待本人确认”。</p>{risks > 0 && <div className="mt-4 rounded-control bg-danger-bg p-3 text-sm text-danger-text">{risks} 名成员进入人工账号补偿；团队审核结论不因此失效。</div>}<Button className="mt-5" onClick={() => navigate(`${portalBase}/commitment`)}>填写承诺书</Button></>}</div></Panel></Shell>;
}

function CommitmentPage() {
  const navigate = useNavigate();
  const { reviewStatus, commitment, generateCommitment, completeRegistration } = useRegistrationPortal();
  if (reviewStatus !== "approved" && reviewStatus !== "completed") return <Shell title="承诺书" showNav><Panel><p className="text-sm text-text-secondary">团队审核通过后开放。</p></Panel></Shell>;
  return <Shell title="承诺书" step={5} showNav><Panel title="参赛团队承诺与说明书"><p className="text-sm leading-6 text-text-secondary">项目：{commitment.projectTitle}</p><div className="mt-4 flex flex-wrap gap-3"><Button onClick={generateCommitment}>生成承诺书</Button><SecondaryButton disabled={!commitment.generated}>下载团队承诺书</SecondaryButton><SecondaryButton>下载指导老师承诺书模板</SecondaryButton></div>{commitment.generated && <Button className="mt-5" onClick={() => { completeRegistration(); navigate(`${portalBase}/complete`); }}>确认承诺书并完成报名</Button>}</Panel></Shell>;
}

function CompletePage() {
  const navigate = useNavigate();
  return <Shell title="报名完成" step={6} showNav><Panel><div className="py-6 text-center"><h2 className="text-xl font-semibold text-text-primary">完整报名流程已完成</h2><p className="mt-2 text-sm text-text-secondary">队员长期账号不随本赛事团队生命周期结束。</p><div className="mt-5 flex justify-center gap-3"><Button onClick={() => navigate(`${portalBase}/team`)}>查看团队</Button><SecondaryButton onClick={() => navigate(`${portalBase}/report`)}>团队业绩报告</SecondaryButton></div></div></Panel></Shell>;
}

function ReportPage() {
  return <Shell title="团队业绩报告" showNav><Panel><p className="text-sm leading-6 text-text-secondary">业绩报告属于赛事后续能力，不参与账号创建与绑定时序。</p></Panel></Shell>;
}

function CertificatesPage() {
  const { certificateReady, reviewStatus } = useRegistrationPortal();
  return <Shell title="证书下载" showNav><Panel><p className="text-sm text-text-secondary">{certificateReady && reviewStatus === "completed" ? "校赛参赛证书已具备下载条件。" : "当前阶段暂无可下载证书。"}</p></Panel></Shell>;
}

function ClosedPage() {
  return <Shell title="报名已截止"><Panel><p className="text-sm text-text-secondary">已提交团队仍可查看资料与审核结果，但不能继续新增成员或修改核心信息。</p></Panel></Shell>;
}

function ScenarioDock() {
  const navigate = useNavigate();
  const { loadScenario } = useRegistrationPortal();
  const items = [
    ["leaderDraft", "队长草稿", `${portalBase}/team`],
    ["pending", "待审核", `${portalBase}/review`],
    ["rejected", "审核驳回", `${portalBase}/review`],
    ["approved", "审核通过", `${portalBase}/review`],
    ["completed", "报名完成", `${portalBase}/complete`],
  ] as const;
  return <details className="fixed bottom-3 right-3 z-50 rounded-container border border-border-subtle bg-surface p-2 text-xs shadow-floating"><summary className="cursor-pointer px-2 py-1 font-medium text-text-secondary">报名原型状态</summary><div className="mt-2 grid grid-cols-2 gap-1">{items.map(([scenario, label, to]) => <button key={scenario} className="rounded-control px-2 py-2 text-text-brand" onClick={() => { loadScenario(scenario); navigate(to); }}>{label}</button>)}</div></details>;
}

export function RegistrationPortal() {
  return <RegistrationPortalProvider><Routes>
    <Route index element={<Navigate to="start" replace />} />
    <Route path="start" element={<StartPage />} />
    <Route path="account" element={<AccountPage />} />
    <Route path="quiz" element={<QuizPage />} />
    <Route path="registration-success" element={<RegistrationSuccessPage />} />
    <Route path="member-waiting" element={<MemberWaitingPage />} />
    <Route path="team" element={<TeamPage />} />
    <Route path="members" element={<AddMembersPage />} />
    <Route path="review" element={<ReviewPage />} />
    <Route path="commitment" element={<CommitmentPage />} />
    <Route path="complete" element={<CompletePage />} />
    <Route path="report" element={<ReportPage />} />
    <Route path="certificates" element={<CertificatesPage />} />
    <Route path="closed" element={<ClosedPage />} />
    <Route path="*" element={<Navigate to="start" replace />} />
  </Routes></RegistrationPortalProvider>;
}

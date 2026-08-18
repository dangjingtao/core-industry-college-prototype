import {
  ArrowLeft,
  BadgeCheck,
  BookOpenCheck,
  ChevronRight,
  CircleDollarSign,
  FileBadge2,
  KeyRound,
  Link2,
  Save,
  ShieldCheck,
  Video,
} from "lucide-react";
import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { StatusTag } from "../components/ui";
import {
  certificateTypeLabels,
  courseCompleted,
  fulfillmentLabels,
  type AssessmentStatus,
  type BenefitAdminRecord,
  type BenefitRuntimeStatus,
  type CertificateAdminRecord,
  type CertificateClaimStatus,
  type CourseAdminRecord,
  type CourseRuntimeStatus,
  type FulfillmentType,
  type IssuanceStatus,
} from "./pc04-data";
import { usePC04State } from "./PC04State";
import { pc03OrganizationById } from "./PC03State";

type Section = "courses" | "benefits" | "certificates";

const sectionMeta: Record<Section, { label: string; description: string; parent: string }> = {
  courses: { label: "平台课程", description: "维护课程内容、学习要求和课程关联，学生个人学习结果只读展示。", parent: "资源运营" },
  benefits: { label: "权益", description: "维护领取资格、有效期和履约方式，并查看当前学生权益状态。", parent: "资源运营" },
  certificates: { label: "可信证书", description: "查看签发规则、真实签发主体、签发进度和学生领取状态。", parent: "资产与可信凭证" },
};

function StableId({ field, value }: { field: string; value: string }) {
  return <span className="inline-flex items-center gap-1.5 rounded-control bg-surface-subtle px-2.5 py-1 font-mono text-xs"><KeyRound size={13} aria-hidden="true" /><span className="text-text-tertiary">{field}</span><strong>{value}</strong></span>;
}

function courseStatusLabel(status: CourseRuntimeStatus) {
  return ({ notStarted: "未开始", inProgress: "学习中", completed: "已完成" } as const)[status];
}

function assessmentLabel(status: AssessmentStatus) {
  return ({ idle: "尚未完成考试", passed: "已通过", failed: "未通过" } as const)[status];
}

function benefitStatusLabel(status: BenefitRuntimeStatus) {
  return ({ eligible: "可领取", ineligible: "暂不可领取", claimed: "已领取", used: "已使用", expired: "已过期" } as const)[status];
}

function issuanceLabel(status: IssuanceStatus) {
  return ({ notTriggered: "未触发", requested: "已申请", processing: "签发中", issued: "已签发", failed: "签发失败", revoked: "已撤销" } as const)[status];
}

function claimLabel(status?: CertificateClaimStatus) {
  if (!status) return "尚未生成领取记录";
  return ({ claimable: "待领取", claimed: "已领取", pending: "处理中", revoked: "已撤销" } as const)[status];
}

function statusTone(status: string): "info" | "success" | "warning" | "danger" | "neutral" {
  if (["completed", "passed", "eligible", "claimed", "used", "issued", "claimable"].includes(status)) return "success";
  if (["inProgress", "idle", "notTriggered", "requested", "processing", "pending"].includes(status)) return "warning";
  if (["failed", "ineligible", "revoked"].includes(status)) return "danger";
  return "neutral";
}

function PC04Layout({ section, children }: { section?: Section; children: ReactNode }) {
  return (
    <div className="space-y-6">
      <section className="rounded-container border border-border-subtle bg-surface p-5 lg:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-brand">学习与学生服务</p><h1 className="mt-1 text-2xl font-semibold text-text-primary">平台课程 / 权益 / 可信证书</h1><p className="mt-2 text-sm leading-6 text-text-secondary">配置业务规则，同时查看学生已经产生的学习、领取与证书结果。</p></div>
          <div data-pc05-technical className="rounded-control bg-surface-subtle px-3 py-2 font-mono text-xs text-text-tertiary">PC04 · config truth ≠ personal Runtime</div>
        </div>
        <nav className="mt-5 flex flex-wrap gap-2" aria-label="学习与学生服务二级导航">{(Object.keys(sectionMeta) as Section[]).map(key => <NavLink key={key} to={`/admin/pc04/${key}`} className={({ isActive }) => `rounded-control px-3 py-2 text-sm font-medium ${isActive || section === key ? "bg-primary-container text-text-brand" : "bg-surface-subtle text-text-secondary"}`}>{sectionMeta[key].parent} · {sectionMeta[key].label}</NavLink>)}</nav>
      </section>
      {children}
    </div>
  );
}

function ReadOnlyStudentState({ title, children, technical }: { title: string; children: ReactNode; technical?: ReactNode }) {
  return <div className="rounded-container border border-border-subtle bg-surface p-5"><p className="text-xs font-semibold text-text-tertiary">学生当前状态 · 只读</p><h3 className="mt-1 font-semibold">{title}</h3><div className="mt-3 text-sm leading-6 text-text-secondary">{children}</div>{technical && <div data-pc05-technical className="mt-3 rounded-control bg-surface-subtle p-3 font-mono text-xs text-text-tertiary">{technical}</div>}</div>;
}

function Overview() {
  return <PC04Layout><section className="rounded-container bg-primary p-6 text-on-primary lg:p-8"><p className="text-sm opacity-80">学习与学生服务</p><h2 className="mt-2 text-3xl font-semibold">配置课程、权益与证书规则，学生个人结果保持只读。</h2><p className="mt-4 max-w-4xl text-sm leading-6 opacity-85">课程完成、权益领取和证书签发各自有明确业务状态，不因为后台配置而伪造学生已经完成的事实。</p></section><section className="grid gap-4 lg:grid-cols-3">{(Object.keys(sectionMeta) as Section[]).map(key => { const Icon = key === "courses" ? BookOpenCheck : key === "benefits" ? CircleDollarSign : FileBadge2; return <Link key={key} to={`/admin/pc04/${key}`} className="group rounded-container border border-border-subtle bg-surface p-5 hover:shadow-floating"><Icon size={22} className="text-text-brand" aria-hidden="true" /><h3 className="mt-3 font-semibold">{sectionMeta[key].label}</h3><p className="mt-2 text-sm leading-6 text-text-secondary">{sectionMeta[key].description}</p><span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-text-brand">进入管理<ChevronRight size={15} /></span></Link>; })}</section><details data-pc05-technical className="rounded-container border border-border-subtle bg-surface p-5"><summary className="cursor-pointer font-semibold">数据与消费链</summary><div className="mt-3 space-y-2 font-mono text-xs text-text-tertiary"><p>/courses → /learn → /assessment → /achievement</p><p>/benefits → /benefits/wallet</p><p>/assets/certificates → /assets/verification</p></div></details></PC04Layout>;
}

function CoursesList() {
  const { courses } = usePC04State();
  return <PC04Layout section="courses"><section className="rounded-container border border-border-subtle bg-surface p-5"><h2 className="text-2xl font-semibold">平台课程</h2><p className="mt-2 text-sm text-text-secondary">查看课程结构、学生学习进度与是否满足完成条件。</p></section><div className="grid gap-4 xl:grid-cols-2">{courses.map(course => <Link key={course.id} to={`/admin/pc04/courses/${course.id}`} className="rounded-container border border-border-subtle bg-surface p-5 hover:shadow-floating"><div className="flex items-start justify-between gap-4"><div><StatusTag tone="info">课程</StatusTag><h3 className="mt-2 text-lg font-semibold">{course.title}</h3><p className="mt-2 text-sm leading-6 text-text-secondary">{course.summary}</p></div><ChevronRight size={18} className="text-text-tertiary" /></div><div className="mt-4"><StableId field="courseId" value={course.id} /></div><div className="mt-4 grid grid-cols-3 gap-2 text-xs"><div className="rounded-control bg-surface-subtle p-3"><span className="text-text-tertiary">章节</span><p className="mt-1 font-semibold">{course.chapters.length}</p></div><div className="rounded-control bg-surface-subtle p-3"><span className="text-text-tertiary">学习状态</span><p className="mt-1 font-semibold">{courseStatusLabel(course.runtime.status)}</p></div><div className="rounded-control bg-surface-subtle p-3"><span className="text-text-tertiary">完成情况</span><p className="mt-1 font-semibold">{courseCompleted(course) ? "已完成" : "未完成"}</p></div></div><p data-pc05-technical className="mt-3 font-mono text-xs text-text-tertiary">status={course.runtime.status} · progress={course.runtime.progress} · assessment={course.runtime.assessment} · Course Completed={String(courseCompleted(course))}</p></Link>)}</div></PC04Layout>;
}

function relationName(type: "competition" | "organization", id: string) {
  if (type === "organization") return pc03OrganizationById(id)?.name ?? id;
  if (id === "sanchuang-16") return "第十六届三创赛";
  if (id === "sanchuang-15") return "第十五届三创赛";
  if (id === "innovation-cup-2026") return "2026 青年品牌创新挑战赛";
  return id;
}

function CourseRelations({ course }: { course: CourseAdminRecord }) {
  const { benefits, certificates } = usePC04State();
  const benefit = benefits.find(item => item.id === course.unlockBenefitId);
  const certificate = certificates.find(item => item.id === course.certificateId);
  const links = [
    course.competitionId ? { label: relationName("competition", course.competitionId), to: `/admin/competitions/objects/${course.competitionId}`, technical: `Competition · ${course.competitionId}` } : undefined,
    course.organizationId ? { label: relationName("organization", course.organizationId), to: `/admin/organizations/${course.organizationId}`, technical: `Organization · ${course.organizationId}` } : undefined,
    benefit ? { label: benefit.title, to: `/admin/pc04/benefits/${benefit.id}`, technical: `Benefit · ${benefit.id}` } : undefined,
    certificate ? { label: certificate.title, to: `/admin/pc04/certificates/${certificate.id}`, technical: `Certificate · ${certificate.id}` } : undefined,
  ].filter(Boolean) as { label: string; to: string; technical: string }[];
  if (!links.length) return null;
  return <section className="rounded-container border border-border-subtle bg-surface p-5"><h3 className="font-semibold">关联业务</h3><div className="mt-4 flex flex-wrap gap-2">{links.map(link => <Link key={link.to} to={link.to} className="rounded-control bg-surface-subtle px-3 py-2 text-sm font-medium text-text-brand">{link.label}<span data-pc05-technical className="ml-2 font-mono text-xs text-text-tertiary">{link.technical}</span></Link>)}</div></section>;
}

function CourseDetail({ course, edit }: { course: CourseAdminRecord; edit: boolean }) {
  const { updateCourse } = usePC04State();
  const [title, setTitle] = useState(course.title);
  const [videoPercent, setVideoPercent] = useState(course.videoCompletionPercent);
  const [passScore, setPassScore] = useState(course.quizPassScore);
  const [saved, setSaved] = useState(false);
  const save = (event: FormEvent) => { event.preventDefault(); updateCourse(course.id, { title, videoCompletionPercent: videoPercent, quizPassScore: passScore }); setSaved(true); };

  return <PC04Layout section="courses"><section className="rounded-container border border-border-subtle bg-surface p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><Link to="/admin/pc04/courses" className="inline-flex items-center gap-1 text-sm font-medium text-text-brand"><ArrowLeft size={15} />课程列表</Link><h2 className="mt-4 text-2xl font-semibold">{course.title}</h2><div className="mt-3"><StableId field="courseId" value={course.id} /></div></div>{!edit && <Link to={`/admin/pc04/courses/${course.id}/edit`} className="inline-flex min-h-11 items-center rounded-control bg-primary-container px-4 text-sm font-semibold text-text-brand">编辑课程配置</Link>}</div></section>
  {edit ? <form onSubmit={save} className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]"><section className="rounded-container border border-border-subtle bg-surface p-5"><h3 className="font-semibold">课程配置</h3><label className="mt-4 block text-xs font-medium text-text-secondary">课程名称<input data-testid="course-title" value={title} onChange={e => setTitle(e.target.value)} className="mt-2 min-h-11 w-full rounded-control border border-border px-3 text-sm" /></label><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="text-xs font-medium text-text-secondary">视频学习完成要求（%）<input data-testid="video-completion" type="number" min={1} max={100} value={videoPercent} onChange={e => setVideoPercent(Number(e.target.value))} className="mt-2 min-h-11 w-full rounded-control border border-border px-3 text-sm" /></label><label className="text-xs font-medium text-text-secondary">小测试及格线<input data-testid="quiz-pass-score" type="number" min={1} max={100} value={passScore} onChange={e => setPassScore(Number(e.target.value))} className="mt-2 min-h-11 w-full rounded-control border border-border px-3 text-sm" /></label></div><div className="mt-4 rounded-control bg-surface-subtle p-4 text-sm"><strong>课程完成条件</strong><p className="mt-1 text-text-secondary">学习进度达到 {videoPercent}% 且考试通过，即视为课程完成。考试及格线为 {passScore} 分。</p><p data-pc05-technical className="mt-2 font-mono text-xs text-text-tertiary">progress ≥ {videoPercent}% + assessment=passed → Course Completed · passScore={passScore}</p></div><button className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-control bg-primary px-4 text-sm font-semibold text-on-primary"><Save size={16} />保存课程配置</button>{saved && <div className="mt-3 flex flex-wrap items-center gap-3"><p data-testid="course-saved" className="text-sm font-medium text-success-text">课程配置已保存；学生已有学习进度和考试结果没有被改写。</p><Link to={`/admin/pc04/courses/${course.id}`} className="text-sm font-medium text-text-brand">返回课程详情</Link></div>}</section><ReadOnlyStudentState title="当前学习状态" technical={<><p>CourseLearning.status={course.runtime.status}</p><p>progress={course.runtime.progress}% · assessment={course.runtime.assessment}</p><p>Course Completed={String(courseCompleted(course))}</p></>}><p>学习进度：<strong>{course.runtime.progress}%</strong></p><p>考试结果：<strong>{assessmentLabel(course.runtime.assessment)}</strong></p><p data-testid="course-completed-derived">完成情况：<strong>{courseCompleted(course) ? "已完成" : "未完成"}</strong></p></ReadOnlyStudentState></form> : <><section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]"><div className="rounded-container border border-border-subtle bg-surface p-5"><div className="flex items-center gap-2"><Video size={18} className="text-text-brand" /><h3 className="font-semibold">章节 / 视频 / 小测试</h3></div><div className="mt-4 divide-y divide-border-subtle">{course.chapters.map((chapter, index) => <div key={chapter.id} className="flex items-start gap-3 py-3"><span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-surface-subtle text-xs font-semibold">{index + 1}</span><div><p className="font-medium">{chapter.title}</p><p className="mt-1 text-xs text-text-secondary">{chapter.type === "video" ? "视频" : "小测试"}</p><p data-pc05-technical className="mt-1 font-mono text-xs text-text-tertiary">chapterId={chapter.id} · {chapter.requirement}</p></div></div>)}</div></div><div className="space-y-4"><div className="rounded-container border border-border-subtle bg-surface p-5"><h3 className="font-semibold">课程完成条件</h3><p className="mt-3 text-sm leading-6 text-text-secondary">学习进度达到 {course.videoCompletionPercent}%<br />且考试通过<br /><strong>即可完成课程</strong></p><p className="mt-3 text-xs text-text-secondary">小测试配置及格线：{course.quizPassScore} 分。</p><p className="mt-3 rounded-control bg-info-bg p-3 text-xs leading-5 text-info-text">课程“必修”只影响平台学习安排，不会自动改变官方赛事报名资格或赛事工作区权限。</p><p data-pc05-technical className="mt-3 font-mono text-xs text-text-tertiary">progress ≥ {course.videoCompletionPercent}% + assessment=passed → Course Completed</p></div><ReadOnlyStudentState title="当前学生学习状态" technical={<><p>status={course.runtime.status}</p><p>progress={course.runtime.progress}%</p><p>assessment={course.runtime.assessment}</p><p>Course Completed={String(courseCompleted(course))}</p></>}><p>学习状态：<strong>{courseStatusLabel(course.runtime.status)}</strong></p><p>学习进度：<strong>{course.runtime.progress}%</strong></p><p>考试结果：<strong>{assessmentLabel(course.runtime.assessment)}</strong></p><p data-testid="course-completed-derived">完成情况：<strong>{courseCompleted(course) ? "已完成" : "未完成"}</strong></p></ReadOnlyStudentState></div></section><CourseRelations course={course} /></>}</PC04Layout>;
}

function BenefitsList() {
  const { benefits } = usePC04State();
  return <PC04Layout section="benefits"><section className="rounded-container border border-border-subtle bg-surface p-5"><h2 className="text-2xl font-semibold">权益</h2><p className="mt-2 text-sm text-text-secondary">查看权益资格、履约方式和当前领取状态。</p><div className="mt-4 flex flex-wrap gap-2">{Object.values(fulfillmentLabels).map(label => <StatusTag key={label} tone="neutral">{label}</StatusTag>)}</div></section><div className="grid gap-4 xl:grid-cols-2">{benefits.map(benefit => <Link key={benefit.id} to={`/admin/pc04/benefits/${benefit.id}`} className="rounded-container border border-border-subtle bg-surface p-5 hover:shadow-floating"><div className="flex items-start justify-between gap-4"><div><StatusTag tone="success">权益</StatusTag><h3 className="mt-2 text-lg font-semibold">{benefit.title}</h3><p className="mt-2 text-sm leading-6 text-text-secondary">{benefit.summary}</p></div><ChevronRight size={18} className="text-text-tertiary" /></div><div className="mt-4"><StableId field="benefitId" value={benefit.id} /></div><div className="mt-4 flex flex-wrap gap-2"><StatusTag tone="neutral">{fulfillmentLabels[benefit.fulfillment]}</StatusTag><StatusTag tone={statusTone(benefit.runtimeStatus)}>{benefitStatusLabel(benefit.runtimeStatus)}</StatusTag></div><p data-pc05-technical className="mt-3 font-mono text-xs text-text-tertiary">Benefit · Runtime={benefit.runtimeStatus}</p></Link>)}</div></PC04Layout>;
}

function eligibilityLabel(rule: BenefitAdminRecord["eligibility"][number]) {
  if (rule.fact === "profileComplete") return "账号资料已完成";
  if (rule.fact === "competitionIdentityActive") return `${rule.label.replace("active", "有效")}`;
  if (rule.fact === "courseCompleted") return "指定课程已完成";
  if (rule.fact === "partnerGrant") return "合作项目已授权";
  if (rule.fact === "activityAttendance") return "指定活动已签到";
  return "存在有效历史记录";
}

function BenefitDetail({ benefit, edit }: { benefit: BenefitAdminRecord; edit: boolean }) {
  const { updateBenefitFulfillment } = usePC04State();
  const [fulfillment, setFulfillment] = useState<FulfillmentType>(benefit.fulfillment);
  const [saved, setSaved] = useState(false);
  return <PC04Layout section="benefits"><section className="rounded-container border border-border-subtle bg-surface p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><Link to="/admin/pc04/benefits" className="inline-flex items-center gap-1 text-sm font-medium text-text-brand"><ArrowLeft size={15} />权益列表</Link><h2 className="mt-4 text-2xl font-semibold">{benefit.title}</h2><div className="mt-3"><StableId field="benefitId" value={benefit.id} /></div></div>{!edit && <Link to={`/admin/pc04/benefits/${benefit.id}/edit`} className="inline-flex min-h-11 items-center rounded-control bg-primary-container px-4 text-sm font-semibold text-text-brand">编辑权益配置</Link>}</div></section>{edit ? <form onSubmit={(event: FormEvent) => { event.preventDefault(); updateBenefitFulfillment(benefit.id, fulfillment); setSaved(true); }} className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]"><section className="rounded-container border border-border-subtle bg-surface p-5"><h3 className="font-semibold">履约配置</h3><label className="mt-4 block text-xs font-medium text-text-secondary">固定履约类型<select data-testid="fulfillment-select" value={fulfillment} onChange={e => setFulfillment(e.target.value as FulfillmentType)} className="mt-2 min-h-11 w-full rounded-control border border-border bg-surface px-3 text-sm">{(Object.entries(fulfillmentLabels) as [FulfillmentType, string][]).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><p className="mt-4 text-xs leading-5 text-text-secondary">保存后更新履约方式和对应说明，不会改变学生已经产生的领取、使用和核销事实。</p><button className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-control bg-primary px-4 text-sm font-semibold text-on-primary"><Save size={16} />保存权益配置</button>{saved && <div className="mt-3 flex flex-wrap items-center gap-3"><p data-testid="benefit-saved" className="text-sm font-medium text-success-text">权益配置已保存；学生个人领取和核销状态没有被改写。</p><Link to={`/admin/pc04/benefits/${benefit.id}`} className="text-sm font-medium text-text-brand">返回权益详情</Link></div>}</section><ReadOnlyStudentState title="当前权益状态" technical={<p>Benefit Runtime status={benefit.runtimeStatus}</p>}><p>学生状态：<strong>{benefitStatusLabel(benefit.runtimeStatus)}</strong></p></ReadOnlyStudentState></form> : <section className="grid gap-4 xl:grid-cols-3"><div className="rounded-container border border-border-subtle bg-surface p-5"><CircleDollarSign size={19} className="text-text-brand" /><h3 className="mt-3 font-semibold">履约方式</h3><p data-testid="benefit-fulfillment-label" className="mt-2 text-sm font-semibold">{fulfillmentLabels[benefit.fulfillment]}</p><p data-testid="benefit-fulfillment-detail" className="mt-2 text-xs leading-5 text-text-secondary">{benefit.fulfillmentDetail.replaceAll("claimed / used", "已领取 / 已使用").replaceAll("Runtime", "状态记录")}</p></div><div className="rounded-container border border-border-subtle bg-surface p-5"><ShieldCheck size={19} className="text-text-brand" /><h3 className="mt-3 font-semibold">资格规则</h3><div className="mt-3 space-y-2">{benefit.eligibility.map(rule => <div key={rule.label} className="rounded-control bg-surface-subtle p-3 text-sm"><strong>{eligibilityLabel(rule)}</strong><p data-pc05-technical className="mt-1 font-mono text-xs text-text-tertiary">fact={rule.fact}{rule.referenceId ? ` · referenceId=${rule.referenceId}` : ""}</p></div>)}</div></div><ReadOnlyStudentState title="当前学生权益状态" technical={<p>Runtime status={benefit.runtimeStatus}</p>}><p>当前状态：<strong>{benefitStatusLabel(benefit.runtimeStatus)}</strong></p><p className="mt-2 text-xs">这个状态来自学生实际领取与使用行为，后台配置页只读查看。</p></ReadOnlyStudentState></section>}</PC04Layout>;
}

function CertificatesList() {
  const { certificates } = usePC04State();
  return <PC04Layout section="certificates"><section className="rounded-container border border-border-subtle bg-surface p-5"><h2 className="text-2xl font-semibold">可信证书</h2><p className="mt-2 text-sm text-text-secondary">分别查看证书是否已经签发，以及学生是否已经领取。</p></section><div className="grid gap-4 xl:grid-cols-2">{certificates.map(certificate => <Link key={certificate.id} to={`/admin/pc04/certificates/${certificate.id}`} className="rounded-container border border-border-subtle bg-surface p-5 hover:shadow-floating"><div className="flex items-start justify-between gap-4"><div><StatusTag tone="success">{certificateTypeLabels[certificate.certificateType]}</StatusTag><h3 className="mt-2 text-lg font-semibold">{certificate.title}</h3><p className="mt-2 text-sm text-text-secondary">实际签发主体：{certificate.actualIssuer}</p></div><ChevronRight size={18} className="text-text-tertiary" /></div><div className="mt-4"><StableId field="certificateId" value={certificate.id} /></div><div className="mt-4 grid gap-2 sm:grid-cols-2"><div className="rounded-control bg-surface-subtle p-3 text-xs"><span className="text-text-tertiary">签发状态</span><p className="mt-1 font-semibold">{issuanceLabel(certificate.issuanceStatus)}</p></div><div className="rounded-control bg-surface-subtle p-3 text-xs"><span className="text-text-tertiary">学生领取状态</span><p className="mt-1 font-semibold">{claimLabel(certificate.claimStatus)}</p></div></div><p data-pc05-technical className="mt-3 font-mono text-xs text-text-tertiary">issuanceStatus={certificate.issuanceStatus} · claimStatus={certificate.claimStatus ?? "undefined"}</p></Link>)}</div></PC04Layout>;
}

function humanizeTrail(value: string) {
  return value
    .replaceAll("Course Completed", "课程完成条件")
    .replaceAll("assessment = passed", "考试结果为通过")
    .replaceAll("assessment = idle", "考试尚未完成")
    .replaceAll("App Runtime", "学生端状态")
    .replaceAll("Certificate Runtime", "证书记录")
    .replaceAll("claimable", "待领取")
    .replaceAll("issuanceStatus：issued", "签发状态：已签发")
    .replaceAll("claimStatus：claimed", "学生领取状态：已领取")
    .replaceAll("revoked", "已撤销");
}

function CertificateDetail({ certificate }: { certificate: CertificateAdminRecord }) {
  return <PC04Layout section="certificates"><section className="rounded-container border border-border-subtle bg-surface p-6"><Link to="/admin/pc04/certificates" className="inline-flex items-center gap-1 text-sm font-medium text-text-brand"><ArrowLeft size={15} />证书列表</Link><h2 className="mt-4 text-2xl font-semibold">{certificate.title}</h2><div className="mt-4 grid gap-2 sm:max-w-xl sm:grid-cols-2"><div className="rounded-control bg-surface-subtle p-3"><p className="text-xs text-text-tertiary">签发状态</p><p data-testid="issuance-status" className="mt-1 text-sm font-semibold">{issuanceLabel(certificate.issuanceStatus)}</p></div><div className="rounded-control bg-surface-subtle p-3"><p className="text-xs text-text-tertiary">学生领取状态</p><p data-testid="claim-status" className="mt-1 text-sm font-semibold">{claimLabel(certificate.claimStatus)}</p></div></div><div className="mt-3"><StableId field="certificateId" value={certificate.id} /></div><p data-pc05-technical data-testid="certificate-status-raw" className="mt-3 font-mono text-xs text-text-tertiary">issuanceStatus={certificate.issuanceStatus} · claimStatus={certificate.claimStatus ?? "undefined"}</p></section><section className="grid gap-4 xl:grid-cols-3"><div className="rounded-container border border-border-subtle bg-surface p-5"><BadgeCheck size={19} className="text-text-brand" /><h3 className="mt-3 font-semibold">签发身份</h3><dl className="mt-4 space-y-3 text-sm"><div><dt className="text-xs text-text-tertiary">证书类型</dt><dd className="mt-1 font-semibold">{certificateTypeLabels[certificate.certificateType]}</dd></div><div><dt className="text-xs text-text-tertiary">实际签发主体</dt><dd className="mt-1 font-semibold">{certificate.actualIssuer}</dd></div><div><dt className="text-xs text-text-tertiary">签发渠道</dt><dd className="mt-1 leading-6 text-text-secondary">{certificate.channel.replaceAll("App", "学生端").replaceAll("issuer", "签发主体").replaceAll("Runtime", "记录")}</dd></div></dl></div><div className="rounded-container border border-border-subtle bg-surface p-5"><Link2 size={19} className="text-text-brand" /><h3 className="mt-3 font-semibold">签发规则</h3><p className="mt-3 text-sm leading-6 text-text-secondary">{certificate.certificateType === "course" ? "学习进度达到课程要求且考试通过后，进入证书签发流程。" : "根据真实赛事结果与签发回流确认。"}</p><StatusTag tone="neutral">{certificate.triggerMode === "automatic" ? "条件满足后自动触发" : "运营按真实业务发起"}</StatusTag><p data-pc05-technical className="mt-3 font-mono text-xs text-text-tertiary">triggerRule={certificate.triggerRule} · triggerMode={certificate.triggerMode}</p></div><ReadOnlyStudentState title="签发与领取分别记录" technical={<><p>issuanceStatus={certificate.issuanceStatus}</p><p>claimStatus={certificate.claimStatus ?? "undefined"}</p></>}><p>签发状态：<strong>{issuanceLabel(certificate.issuanceStatus)}</strong></p><p>学生领取状态：<strong>{claimLabel(certificate.claimStatus)}</strong></p><p className="mt-2 text-xs">撤销后保留历史记录，不会把平台记录冒充外部权威签发。</p></ReadOnlyStudentState></section><section className="grid gap-4 lg:grid-cols-2"><div className="rounded-container border border-border-subtle bg-surface p-5"><h3 className="font-semibold">编号 / 文件 / 验真</h3><div className="mt-4 space-y-3 text-sm"><div className="rounded-control bg-surface-subtle p-3"><span className="text-xs text-text-tertiary">编号</span><p className="mt-1 font-medium">{certificate.certificateNumber.replace("App 当前", "当前")}</p></div><div className="rounded-control bg-surface-subtle p-3"><span className="text-xs text-text-tertiary">文件 / 凭证</span><p className="mt-1 font-medium">{certificate.credential.replace("App 当前", "当前")}</p></div><div className="rounded-control bg-surface-subtle p-3"><span className="text-xs text-text-tertiary">验真信息</span><p className="mt-1 font-mono text-xs">{certificate.verification}</p></div></div></div><div className="rounded-container border border-border-subtle bg-surface p-5"><h3 className="font-semibold">申请 / 回流记录</h3><div className="mt-4 space-y-3">{certificate.requestTrail.map((item, index) => <div key={`${item}-${index}`} className="flex gap-3"><span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-surface-subtle text-xs font-semibold">{index + 1}</span><p className="pt-0.5 text-sm leading-6 text-text-secondary">{humanizeTrail(item)}</p></div>)}</div></div></section></PC04Layout>;
}

function Missing({ label }: { label: string }) {
  return <PC04Layout><div className="rounded-container border border-border-subtle bg-surface p-8 text-center"><h2 className="text-xl font-semibold">{label} 不存在</h2><Link to="/admin/pc04" className="mt-4 inline-flex min-h-11 items-center rounded-control bg-primary-container px-4 text-sm font-semibold text-text-brand">返回学习与学生服务</Link></div></PC04Layout>;
}

export function PC04HumanConsole() {
  const { courses, benefits, certificates } = usePC04State();
  const location = useLocation();
  const parts = useMemo(() => location.pathname.split("/").filter(Boolean), [location.pathname]);
  const pc04Index = parts.indexOf("pc04");
  if (pc04Index < 0 || !parts[pc04Index + 1]) return <Overview />;
  const section = parts[pc04Index + 1] as Section;
  const id = parts[pc04Index + 2];
  const edit = parts[pc04Index + 3] === "edit";
  if (section === "courses") { if (!id) return <CoursesList />; const course = courses.find(item => item.id === id); return course ? <CourseDetail course={course} edit={edit} /> : <Missing label="课程" />; }
  if (section === "benefits") { if (!id) return <BenefitsList />; const benefit = benefits.find(item => item.id === id); return benefit ? <BenefitDetail benefit={benefit} edit={edit} /> : <Missing label="权益" />; }
  if (section === "certificates") { if (!id) return <CertificatesList />; const certificate = certificates.find(item => item.id === id); return certificate ? <CertificateDetail certificate={certificate} /> : <Missing label="证书" />; }
  return <Overview />;
}

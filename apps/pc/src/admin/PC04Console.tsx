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
  type BenefitAdminRecord,
  type CertificateAdminRecord,
  type CourseAdminRecord,
  type FulfillmentType,
} from "./pc04-data";
import { usePC04State } from "./PC04State";

type Section = "courses" | "benefits" | "certificates";

const sectionMeta: Record<Section, { label: string; description: string; parent: string }> = {
  courses: { label: "平台课程", description: "平台托管课程内容、完成条件和跨资源关系；个人学习状态仍由 Runtime 写。", parent: "资源运营" },
  benefits: { label: "权益", description: "平台配置个人资格与三类履约；领取、使用、核销状态仍是个人 Runtime。", parent: "资源运营" },
  certificates: { label: "可信证书", description: "管理签发规则、真实签发主体、回流与验真；学生领取状态与签发状态分开。", parent: "资产与可信凭证" },
};

function StableId({ field, value }: { field: string; value: string }) {
  return <span className="inline-flex items-center gap-1.5 rounded-control bg-surface-subtle px-2.5 py-1 font-mono text-xs"><KeyRound size={13} aria-hidden="true" /><span className="text-text-tertiary">{field}</span><strong>{value}</strong></span>;
}

function PC04Layout({ section, children }: { section?: Section; children: ReactNode }) {
  return (
    <div className="space-y-6">
      <section className="rounded-container border border-border-subtle bg-surface p-5 lg:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-brand">PC04 · canonical control plane</p>
            <h1 className="mt-1 text-2xl font-semibold text-text-primary">平台课程 / 权益 / 可信证书</h1>
            <p className="mt-2 text-sm leading-6 text-text-secondary">PC04 是 PC01 七域控制面里的二级业务能力，不形成独立后台壳。</p>
          </div>
          <StatusTag tone="info">配置真相 ≠ 个人 Runtime</StatusTag>
        </div>
        <nav className="mt-5 flex flex-wrap gap-2" aria-label="PC04 二级导航">
          {(Object.keys(sectionMeta) as Section[]).map(key => (
            <NavLink key={key} to={`/admin/pc04/${key}`} className={({ isActive }) => `rounded-control px-3 py-2 text-sm font-medium ${isActive || section === key ? "bg-primary-container text-text-brand" : "bg-surface-subtle text-text-secondary"}`}>
              {sectionMeta[key].parent} · {sectionMeta[key].label}
            </NavLink>
          ))}
        </nav>
      </section>
      {children}
    </div>
  );
}

function BoundaryNotice() {
  return (
    <section className="rounded-container border border-info bg-info-bg p-4 text-sm leading-6 text-info-text">
      <strong>真相源边界：</strong>PC04 可以改课程内容/完成条件、权益资格/履约配置、证书签发规则；不能直接改个人 CourseLearning、权益领取/核销状态或学生 Certificate claim state 来制造第二套事实。
    </section>
  );
}

function RuntimeCard({ title, children }: { title: string; children: ReactNode }) {
  return <div className="rounded-container border border-warning bg-warning-bg p-5"><p className="text-xs font-semibold uppercase tracking-[0.08em] text-warning-text">Runtime · read only</p><h3 className="mt-1 font-semibold text-warning-text">{title}</h3><div className="mt-3 text-sm leading-6 text-warning-text">{children}</div></div>;
}

function Overview() {
  const appRoutes = [
    "/courses → /courses/:courseId → /learn → /assessment → /achievement",
    "/benefits → /benefits/:benefitId → /benefits/wallet",
    "/assets/certificates → /assets/certificates/:certificateId → /assets/verification",
  ];
  return <PC04Layout><section className="rounded-container bg-primary p-6 text-on-primary lg:p-8"><p className="text-sm opacity-80">PC04 Control Plane</p><h2 className="mt-2 text-3xl font-semibold">配置规则留在 PC，学生实际完成结果留在同一份 Runtime。</h2><p className="mt-4 max-w-4xl text-sm leading-6 opacity-85">课程、权益、证书共享 stable id 与可解释关系；不建设万能规则引擎，也不让课程“必修”默认改变官方赛事资格。</p></section><BoundaryNotice /><section className="grid gap-4 lg:grid-cols-3">{(Object.keys(sectionMeta) as Section[]).map(key => { const Icon = key === "courses" ? BookOpenCheck : key === "benefits" ? CircleDollarSign : FileBadge2; return <Link key={key} to={`/admin/pc04/${key}`} className="group rounded-container border border-border-subtle bg-surface p-5 hover:shadow-floating"><Icon size={22} className="text-text-brand" aria-hidden="true" /><p className="mt-3 text-xs text-text-tertiary">归属：{sectionMeta[key].parent}</p><h3 className="mt-1 font-semibold">{sectionMeta[key].label}</h3><p className="mt-2 text-sm leading-6 text-text-secondary">{sectionMeta[key].description}</p><span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-text-brand">进入控制面<ChevronRight size={15} /></span></Link>; })}</section><section className="rounded-container border border-border-subtle bg-surface p-5"><h3 className="font-semibold">必须对齐的 App 消费链</h3><div className="mt-4 grid gap-3">{appRoutes.map(route => <code key={route} className="rounded-control bg-surface-subtle px-3 py-2 text-xs text-text-secondary">{route}</code>)}</div></section></PC04Layout>;
}

function CoursesList() {
  const { courses } = usePC04State();
  return <PC04Layout section="courses"><BoundaryNotice /><section className="rounded-container border border-border-subtle bg-surface p-5"><h2 className="text-2xl font-semibold">平台课程</h2><p className="mt-2 text-sm text-text-secondary">正式课程以平台托管章节、视频和小测试为主形态；外部 URL 不能替代课程主体。</p></section><div className="grid gap-4 xl:grid-cols-2">{courses.map(course => <Link key={course.id} to={`/admin/pc04/courses/${course.id}`} className="rounded-container border border-border-subtle bg-surface p-5 hover:shadow-floating"><div className="flex items-start justify-between gap-4"><div><StatusTag tone="info">Course</StatusTag><h3 className="mt-2 text-lg font-semibold">{course.title}</h3><p className="mt-2 text-sm leading-6 text-text-secondary">{course.summary}</p></div><ChevronRight size={18} className="text-text-tertiary" /></div><div className="mt-4"><StableId field="courseId" value={course.id} /></div><div className="mt-4 grid grid-cols-3 gap-2 text-xs"><div className="rounded-control bg-surface-subtle p-3"><span className="text-text-tertiary">章节</span><p className="mt-1 font-semibold">{course.chapters.length}</p></div><div className="rounded-control bg-surface-subtle p-3"><span className="text-text-tertiary">App status</span><p className="mt-1 font-semibold">{course.runtime.status}</p></div><div className="rounded-control bg-surface-subtle p-3"><span className="text-text-tertiary">正式完成</span><p className="mt-1 font-semibold">{courseCompleted(course) ? "yes" : "no"}</p></div></div></Link>)}</div></PC04Layout>;
}

function CourseDetail({ course, edit }: { course: CourseAdminRecord; edit: boolean }) {
  const { updateCourse } = usePC04State();
  const [title, setTitle] = useState(course.title);
  const [videoPercent, setVideoPercent] = useState(course.videoCompletionPercent);
  const [passScore, setPassScore] = useState(course.quizPassScore);
  const [saved, setSaved] = useState(false);
  const save = (event: FormEvent) => { event.preventDefault(); updateCourse(course.id, { title, videoCompletionPercent: videoPercent, quizPassScore: passScore }); setSaved(true); };
  return <PC04Layout section="courses"><section className="rounded-container border border-border-subtle bg-surface p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><Link to="/admin/pc04/courses" className="inline-flex items-center gap-1 text-sm font-medium text-text-brand"><ArrowLeft size={15} />课程列表</Link><h2 className="mt-4 text-2xl font-semibold">{course.title}</h2><div className="mt-3"><StableId field="courseId" value={course.id} /></div></div>{!edit && <Link to={`/admin/pc04/courses/${course.id}/edit`} className="inline-flex min-h-11 items-center rounded-control bg-primary-container px-4 text-sm font-semibold text-text-brand">编辑课程配置</Link>}</div></section><BoundaryNotice />{edit ? <form onSubmit={save} className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]"><section className="rounded-container border border-border-subtle bg-surface p-5"><h3 className="font-semibold">课程配置</h3><label className="mt-4 block text-xs font-medium text-text-secondary">课程名称<input data-testid="course-title" value={title} onChange={e => setTitle(e.target.value)} className="mt-2 min-h-11 w-full rounded-control border border-border px-3 text-sm" /></label><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="text-xs font-medium text-text-secondary">视频学习完成要求（%）<input data-testid="video-completion" type="number" min={1} max={100} value={videoPercent} onChange={e => setVideoPercent(Number(e.target.value))} className="mt-2 min-h-11 w-full rounded-control border border-border px-3 text-sm" /></label><label className="text-xs font-medium text-text-secondary">小测试及格线<input data-testid="quiz-pass-score" type="number" min={1} max={100} value={passScore} onChange={e => setPassScore(Number(e.target.value))} className="mt-2 min-h-11 w-full rounded-control border border-border px-3 text-sm" /></label></div><div className="mt-4 rounded-control bg-surface-subtle p-4 text-sm"><strong>固定首期模型</strong><p className="mt-1 text-text-secondary">学习进度达到 {videoPercent}% + assessment = passed → Course Completed。及格线 {passScore} 分由考试侧产生 passed / failed。</p></div><button className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-control bg-primary px-4 text-sm font-semibold text-on-primary"><Save size={16} />保存课程配置</button>{saved && <div className="mt-3 flex flex-wrap items-center gap-3"><p data-testid="course-saved" className="text-sm font-medium text-success-text">课程配置已写入 PC04 会话状态；没有改写个人 CourseLearning。</p><Link to={`/admin/pc04/courses/${course.id}`} className="text-sm font-medium text-text-brand">返回课程详情</Link></div>}</section><RuntimeCard title="个人 CourseLearning 不由这个表单写"><p>兼容 status: <strong>{course.runtime.status}</strong></p><p>progress: <strong>{course.runtime.progress}%</strong></p><p>assessment: <strong>{course.runtime.assessment}</strong></p><p data-testid="course-completed-derived" className="mt-2">Course Completed（派生）: <strong>{courseCompleted(course) ? "true" : "false"}</strong></p></RuntimeCard></form> : <><section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]"><div className="rounded-container border border-border-subtle bg-surface p-5"><div className="flex items-center gap-2"><Video size={18} className="text-text-brand" /><h3 className="font-semibold">章节 / 视频 / 小测试</h3></div><div className="mt-4 divide-y divide-border-subtle">{course.chapters.map((chapter, index) => <div key={chapter.id} className="flex items-start gap-3 py-3"><span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-surface-subtle text-xs font-semibold">{index + 1}</span><div><p className="font-medium">{chapter.title}</p><p className="mt-1 text-xs text-text-secondary">{chapter.type === "video" ? "视频" : "小测试"} · {chapter.requirement}</p></div></div>)}</div></div><div className="space-y-4"><div className="rounded-container border border-border-subtle bg-surface p-5"><h3 className="font-semibold">Course Completed 规则</h3><p className="mt-3 text-sm leading-6 text-text-secondary">progress ≥ {course.videoCompletionPercent}%<br />+ assessment = passed<br /><strong>→ Course Completed</strong></p><p className="mt-3 text-xs text-text-secondary">小测试配置及格线：{course.quizPassScore} 分。</p><p className="mt-3 rounded-control bg-info-bg p-3 text-xs leading-5 text-info-text">“必修”只是一种平台配置语义，默认不阻断官方赛事报名或 Workspace。</p></div><RuntimeCard title="当前 App 学习快照"><p>兼容 status: <strong>{course.runtime.status}</strong></p><p>progress: <strong>{course.runtime.progress}%</strong></p><p>assessment: <strong>{course.runtime.assessment}</strong></p><p data-testid="course-completed-derived" className="mt-2">Course Completed（派生）: <strong>{courseCompleted(course) ? "true" : "false"}</strong></p></RuntimeCard></div></section><section className="rounded-container border border-border-subtle bg-surface p-5"><h3 className="font-semibold">稳定关系</h3><div className="mt-4 flex flex-wrap gap-2">{course.competitionId && <Link to={`/admin/competitions/objects/${course.competitionId}`} className="rounded-control bg-surface-subtle px-3 py-2 text-sm text-text-brand">Competition · {course.competitionId}</Link>}{course.organizationId && <Link to={`/admin/organizations/${course.organizationId}`} className="rounded-control bg-surface-subtle px-3 py-2 text-sm text-text-brand">Organization · {course.organizationId}</Link>}{course.unlockBenefitId && <Link to={`/admin/pc04/benefits/${course.unlockBenefitId}`} className="rounded-control bg-surface-subtle px-3 py-2 text-sm text-text-brand">Benefit · {course.unlockBenefitId}</Link>}{course.certificateId && <Link to={`/admin/pc04/certificates/${course.certificateId}`} className="rounded-control bg-surface-subtle px-3 py-2 text-sm text-text-brand">Certificate · {course.certificateId}</Link>}</div></section></>}</PC04Layout>;
}

function BenefitsList() {
  const { benefits } = usePC04State();
  return <PC04Layout section="benefits"><BoundaryNotice /><section className="rounded-container border border-border-subtle bg-surface p-5"><h2 className="text-2xl font-semibold">权益</h2><p className="mt-2 text-sm text-text-secondary">当前 App 六个权益全部有 PC04 归属；首期仍只支持三类履约。</p><div className="mt-4 flex flex-wrap gap-2">{Object.values(fulfillmentLabels).map(label => <StatusTag key={label} tone="neutral">{label}</StatusTag>)}</div></section><div className="grid gap-4 xl:grid-cols-2">{benefits.map(benefit => <Link key={benefit.id} to={`/admin/pc04/benefits/${benefit.id}`} className="rounded-container border border-border-subtle bg-surface p-5 hover:shadow-floating"><div className="flex items-start justify-between gap-4"><div><StatusTag tone="success">Benefit</StatusTag><h3 className="mt-2 text-lg font-semibold">{benefit.title}</h3><p className="mt-2 text-sm leading-6 text-text-secondary">{benefit.summary}</p></div><ChevronRight size={18} className="text-text-tertiary" /></div><div className="mt-4"><StableId field="benefitId" value={benefit.id} /></div><div className="mt-4 flex flex-wrap gap-2"><StatusTag tone="neutral">{fulfillmentLabels[benefit.fulfillment]}</StatusTag><StatusTag tone="warning">Runtime · {benefit.runtimeStatus}</StatusTag></div></Link>)}</div></PC04Layout>;
}

function BenefitDetail({ benefit, edit }: { benefit: BenefitAdminRecord; edit: boolean }) {
  const { updateBenefitFulfillment } = usePC04State();
  const [fulfillment, setFulfillment] = useState<FulfillmentType>(benefit.fulfillment);
  const [saved, setSaved] = useState(false);
  return <PC04Layout section="benefits"><section className="rounded-container border border-border-subtle bg-surface p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><Link to="/admin/pc04/benefits" className="inline-flex items-center gap-1 text-sm font-medium text-text-brand"><ArrowLeft size={15} />权益列表</Link><h2 className="mt-4 text-2xl font-semibold">{benefit.title}</h2><div className="mt-3"><StableId field="benefitId" value={benefit.id} /></div></div>{!edit && <Link to={`/admin/pc04/benefits/${benefit.id}/edit`} className="inline-flex min-h-11 items-center rounded-control bg-primary-container px-4 text-sm font-semibold text-text-brand">编辑权益配置</Link>}</div></section><BoundaryNotice />{edit ? <form onSubmit={(event: FormEvent) => { event.preventDefault(); updateBenefitFulfillment(benefit.id, fulfillment); setSaved(true); }} className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]"><section className="rounded-container border border-border-subtle bg-surface p-5"><h3 className="font-semibold">履约配置</h3><label className="mt-4 block text-xs font-medium text-text-secondary">固定履约类型<select data-testid="fulfillment-select" value={fulfillment} onChange={e => setFulfillment(e.target.value as FulfillmentType)} className="mt-2 min-h-11 w-full rounded-control border border-border bg-surface px-3 text-sm">{(Object.entries(fulfillmentLabels) as [FulfillmentType, string][]).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><p className="mt-4 text-xs leading-5 text-text-secondary">保存时会同时更新履约类型与对应说明，不保留上一种履约方式的旧文案。</p><button className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-control bg-primary px-4 text-sm font-semibold text-on-primary"><Save size={16} />保存权益配置</button>{saved && <div className="mt-3 flex flex-wrap items-center gap-3"><p data-testid="benefit-saved" className="text-sm font-medium text-success-text">权益配置已写入 PC04 会话状态；个人领取/核销状态没有被改写。</p><Link to={`/admin/pc04/benefits/${benefit.id}`} className="text-sm font-medium text-text-brand">返回权益详情</Link></div>}</section><RuntimeCard title="个人权益状态只读"><p>status: <strong>{benefit.runtimeStatus}</strong></p><p className="mt-3">领取、使用、过期和核销由业务 Runtime 写，不由配置表单直接切换。</p></RuntimeCard></form> : <section className="grid gap-4 xl:grid-cols-3"><div className="rounded-container border border-border-subtle bg-surface p-5"><CircleDollarSign size={19} className="text-text-brand" /><h3 className="mt-3 font-semibold">履约</h3><p data-testid="benefit-fulfillment-label" className="mt-2 text-sm font-semibold">{fulfillmentLabels[benefit.fulfillment]}</p><p data-testid="benefit-fulfillment-detail" className="mt-2 text-xs leading-5 text-text-secondary">{benefit.fulfillmentDetail}</p></div><div className="rounded-container border border-border-subtle bg-surface p-5"><ShieldCheck size={19} className="text-text-brand" /><h3 className="mt-3 font-semibold">资格规则</h3><div className="mt-3 space-y-2">{benefit.eligibility.map(rule => <div key={rule.label} className="rounded-control bg-surface-subtle p-3 text-sm"><strong>{rule.label}</strong><p className="mt-1 font-mono text-xs text-text-tertiary">{rule.fact}{rule.referenceId ? ` · ${rule.referenceId}` : ""}</p></div>)}</div></div><RuntimeCard title="当前个人权益状态"><p>status: <strong>{benefit.runtimeStatus}</strong></p><p className="mt-3">这是 App / Runtime 事实；PC04 只解释为什么有资格、怎么履约。</p></RuntimeCard></section>}</PC04Layout>;
}

function CertificatesList() {
  const { certificates } = usePC04State();
  return <PC04Layout section="certificates"><BoundaryNotice /><section className="rounded-container border border-border-subtle bg-surface p-5"><h2 className="text-2xl font-semibold">可信证书</h2><p className="mt-2 text-sm text-text-secondary">后台签发流程状态与学生 App claim state 分开表达，外部签发失败、回流和撤销不会再挤进一个字段。</p></section><div className="grid gap-4 xl:grid-cols-2">{certificates.map(certificate => <Link key={certificate.id} to={`/admin/pc04/certificates/${certificate.id}`} className="rounded-container border border-border-subtle bg-surface p-5 hover:shadow-floating"><div className="flex items-start justify-between gap-4"><div><StatusTag tone="success">{certificateTypeLabels[certificate.certificateType]}</StatusTag><h3 className="mt-2 text-lg font-semibold">{certificate.title}</h3><p className="mt-2 text-sm text-text-secondary">实际签发主体：{certificate.actualIssuer}</p></div><ChevronRight size={18} className="text-text-tertiary" /></div><div className="mt-4"><StableId field="certificateId" value={certificate.id} /></div><div className="mt-4 flex flex-wrap gap-2"><StatusTag tone="warning">issuance · {certificate.issuanceStatus}</StatusTag><StatusTag tone="neutral">claim · {certificate.claimStatus ?? "尚未生成"}</StatusTag></div></Link>)}</div></PC04Layout>;
}

function CertificateDetail({ certificate }: { certificate: CertificateAdminRecord }) {
  return <PC04Layout section="certificates"><section className="rounded-container border border-border-subtle bg-surface p-6"><Link to="/admin/pc04/certificates" className="inline-flex items-center gap-1 text-sm font-medium text-text-brand"><ArrowLeft size={15} />证书列表</Link><h2 className="mt-4 text-2xl font-semibold">{certificate.title}</h2><div className="mt-3 flex flex-wrap gap-2"><StableId field="certificateId" value={certificate.id} /><StatusTag tone="warning">issuance · {certificate.issuanceStatus}</StatusTag><StatusTag tone="neutral">claim · {certificate.claimStatus ?? "尚未生成"}</StatusTag></div></section><BoundaryNotice /><section className="grid gap-4 xl:grid-cols-3"><div className="rounded-container border border-border-subtle bg-surface p-5"><BadgeCheck size={19} className="text-text-brand" /><h3 className="mt-3 font-semibold">签发身份</h3><dl className="mt-4 space-y-3 text-sm"><div><dt className="text-xs text-text-tertiary">证书类型</dt><dd className="mt-1 font-semibold">{certificateTypeLabels[certificate.certificateType]}</dd></div><div><dt className="text-xs text-text-tertiary">实际签发主体</dt><dd className="mt-1 font-semibold">{certificate.actualIssuer}</dd></div><div><dt className="text-xs text-text-tertiary">签发渠道</dt><dd className="mt-1 leading-6 text-text-secondary">{certificate.channel}</dd></div></dl></div><div className="rounded-container border border-border-subtle bg-surface p-5"><Link2 size={19} className="text-text-brand" /><h3 className="mt-3 font-semibold">签发规则</h3><p className="mt-3 text-sm leading-6 text-text-secondary">{certificate.triggerRule}</p><StatusTag tone="neutral">{certificate.triggerMode === "automatic" ? "条件满足后自动触发" : "运营按真实业务发起"}</StatusTag><p className="mt-3 text-xs leading-5 text-text-tertiary">课程证书不要求运营逐张点击发证；批量签发 / 撤销的高风险审批留给 PC05。</p></div><RuntimeCard title="学生领取状态与签发状态分离"><p data-testid="issuance-status">issuanceStatus: <strong>{certificate.issuanceStatus}</strong></p><p data-testid="claim-status">claimStatus: <strong>{certificate.claimStatus ?? "尚未生成个人记录"}</strong></p><p className="mt-3">PC04 不通过配置表单把 revoked 改回有效，也不会把平台自有记录包装成外部权威签发。</p></RuntimeCard></section><section className="grid gap-4 lg:grid-cols-2"><div className="rounded-container border border-border-subtle bg-surface p-5"><h3 className="font-semibold">编号 / 文件 / 验真</h3><div className="mt-4 space-y-3 text-sm"><div className="rounded-control bg-surface-subtle p-3"><span className="text-xs text-text-tertiary">编号</span><p className="mt-1 font-medium">{certificate.certificateNumber}</p></div><div className="rounded-control bg-surface-subtle p-3"><span className="text-xs text-text-tertiary">文件 / 凭证</span><p className="mt-1 font-medium">{certificate.credential}</p></div><div className="rounded-control bg-surface-subtle p-3"><span className="text-xs text-text-tertiary">验真信息</span><p className="mt-1 font-mono text-xs">{certificate.verification}</p></div></div></div><div className="rounded-container border border-border-subtle bg-surface p-5"><h3 className="font-semibold">申请 / 回流记录</h3><div className="mt-4 space-y-3">{certificate.requestTrail.map((item, index) => <div key={item} className="flex gap-3"><span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-surface-subtle text-xs font-semibold">{index + 1}</span><p className="pt-0.5 text-sm leading-6 text-text-secondary">{item}</p></div>)}</div></div></section></PC04Layout>;
}

function Missing({ label }: { label: string }) {
  return <PC04Layout><div className="rounded-container border border-border-subtle bg-surface p-8 text-center"><h2 className="text-xl font-semibold">{label} 不存在</h2><Link to="/admin/pc04" className="mt-4 inline-flex min-h-11 items-center rounded-control bg-primary-container px-4 text-sm font-semibold text-text-brand">返回 PC04</Link></div></PC04Layout>;
}

export function PC04Console() {
  const { courses, benefits, certificates } = usePC04State();
  const location = useLocation();
  const parts = useMemo(() => location.pathname.split("/").filter(Boolean), [location.pathname]);
  const pc04Index = parts.indexOf("pc04");
  if (pc04Index < 0 || !parts[pc04Index + 1]) return <Overview />;
  const section = parts[pc04Index + 1] as Section;
  const id = parts[pc04Index + 2];
  const edit = parts[pc04Index + 3] === "edit";
  if (section === "courses") {
    if (!id) return <CoursesList />;
    const course = courses.find(item => item.id === id);
    return course ? <CourseDetail course={course} edit={edit} /> : <Missing label="课程" />;
  }
  if (section === "benefits") {
    if (!id) return <BenefitsList />;
    const benefit = benefits.find(item => item.id === id);
    return benefit ? <BenefitDetail benefit={benefit} edit={edit} /> : <Missing label="权益" />;
  }
  if (section === "certificates") {
    if (!id) return <CertificatesList />;
    const certificate = certificates.find(item => item.id === id);
    return certificate ? <CertificateDetail certificate={certificate} /> : <Missing label="证书" />;
  }
  return <Overview />;
}

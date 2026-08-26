import { useMemo, useState } from "react";
import { Award, BookOpen, CheckCircle2, Clock, Coins, GraduationCap, PlayCircle, ShieldCheck, Sparkles, Video } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button, Card, GhostButton, PageHeader, PublicShell, SecondaryButton, Section, StatusTag } from "../../components/ui";
import { CertificateDetailTrustedPage } from "../trust/TrustPages";
import { courseById, courses, type Course } from "./data";
import { ProgressBar, SourceLine, useAccountLoggedIn } from "./shared";
import { useLongTermAssets } from "./store";
import { useBadges } from "../badges/hooks";

type CredentialTier = "none" | "standard" | "trusted";

const trustedCourseIds = new Set(["ai-ecommerce-agent", "data-analytics", "newbie-essential"]);

function credentialTier(course: Course): CredentialTier {
  if (trustedCourseIds.has(course.id)) return "trusted";
  if (!course.certificateId) return "none";
  return "standard";
}

function credentialLabel(tier: CredentialTier) {
  if (tier === "trusted") return "可信证书";
  if (tier === "standard") return "普通电子证书";
  return "仅学习记录";
}

function tierDescription(tier: CredentialTier) {
  if (tier === "trusted") return "高价值课程才配置可信证书，可进入可信空间并提供验真能力。";
  if (tier === "standard") return "通过课程考核后发普通电子结业证书，不提供可信验真。";
  return "完成后只保留学习记录，不额外发证。";
}

function CourseCover({ course, className = "" }: { course: Course; className?: string }) {
  return <div className={`relative overflow-hidden rounded-container bg-gradient-to-br ${course.cover} ${className}`}>
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.25),transparent_52%)]" />
    <div className="absolute bottom-2 left-2 rounded-full bg-black/30 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-sm">{course.duration}</div>
  </div>;
}

function CredentialTag({ course }: { course: Course }) {
  const tier = credentialTier(course);
  if (tier === "trusted") return <span className="inline-flex items-center gap-1 rounded-full bg-warning-bg px-2 py-1 text-xs font-semibold text-warning-text"><ShieldCheck size={12} aria-hidden="true" />可信证书</span>;
  if (tier === "standard") return <StatusTag tone="neutral">普通电子证书</StatusTag>;
  return <StatusTag tone="neutral">不发证</StatusTag>;
}

function PriceTag({ course }: { course: Course }) {
  if (course.entitlement === "free") return <StatusTag tone="success">免费</StatusTag>;
  if (course.entitlement === "creditRequired") {
    const trusted = credentialTier(course) === "trusted";
    return <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${trusted ? "bg-warning-bg text-warning-text" : "bg-primary-container text-text-brand"}`}><Coins size={12} aria-hidden="true" />{trusted ? "高学力值 · " : ""}{course.cost}</span>;
  }
  return <StatusTag tone="info">权益解锁</StatusTag>;
}

function CourseRow({ course }: { course: Course }) {
  return <Link to={`/courses/${course.id}`} className="block">
    <Card interactive className="flex gap-4 p-3">
      <CourseCover course={course} className="h-[88px] w-[88px] shrink-0" />
      <div className="min-w-0 flex-1">
        <h3 className="line-clamp-1 text-sm font-semibold text-text-primary">{course.title}</h3>
        <p className="mt-1 line-clamp-2 text-xs leading-5 text-text-secondary">{course.summary}</p>
        <div className="mt-2 flex flex-wrap gap-2"><PriceTag course={course} /><CredentialTag course={course} /></div>
      </div>
    </Card>
  </Link>;
}

export function T034CoursesPage() {
  const trustedCourses = courses.filter(course => credentialTier(course) === "trusted");
  const onboarding = courses.filter(course => course.category === "onboarding");
  const others = courses.filter(course => credentialTier(course) !== "trusted" && course.category !== "onboarding");
  return <PublicShell showNavigation={false}>
    <PageHeader title="学院" backTo="/home" />
    <div className="space-y-7 px-4 py-5">
      <Section title="新手必修" subtitle="先把平台和参赛流程搞明白，不用把每件小事都包装成可信证书">
        <div className="space-y-3">{onboarding.map(course => <CourseRow key={course.id} course={course} />)}</div>
      </Section>

      {trustedCourses.length > 0 && <Section title="高价值课程" subtitle="高学力值兑换 · 通过考核后可获得可信证书">
        <div className="space-y-3">{trustedCourses.map(course => <Link key={course.id} to={`/courses/${course.id}`} className="block"><Card interactive className="overflow-hidden border border-warning/25 bg-warning-bg/40 p-0">
          <div className="flex gap-4 p-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-[16px] bg-warning-bg text-warning-text"><ShieldCheck size={24} aria-hidden="true" /></span>
            <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-text-primary">{course.title}</h3><CredentialTag course={course} /></div><p className="mt-1 text-sm leading-5 text-text-secondary">{course.summary}</p><div className="mt-3 flex items-center gap-2"><PriceTag course={course} /><StatusTag tone="info">支持试看</StatusTag></div></div>
          </div>
        </Card></Link>)}</div>
      </Section>}

      <Section title="其它课程" action={<Link to="/courses/center" className="text-sm font-medium text-text-brand">查看全部</Link>}>
        <div className="space-y-3">{others.slice(0, 4).map(course => <CourseRow key={course.id} course={course} />)}</div>
      </Section>
    </div>
  </PublicShell>;
}

export function T034CourseCenterPage() {
  return <PublicShell showNavigation={false}>
    <PageHeader title="全部课程" backTo="/courses" />
    <div className="space-y-4 px-4 py-5">
      <Card className="border border-border-subtle"><p className="text-sm leading-6 text-text-secondary"><b className="text-text-primary">证书不是课程默认赠品。</b> 普通课程可发普通电子证书；只有少量高价值课程才配置可信证书，并以更高学力值门槛明确区分。</p></Card>
      {courses.map(course => <CourseRow key={course.id} course={course} />)}
    </div>
  </PublicShell>;
}

export function T034CourseDetailPage() {
  const { courseId } = useParams();
  const course = courseById(courseId);
  const navigate = useNavigate();
  const loggedIn = useAccountLoggedIn();
  const { learningFor, enrolledFor, enrollCourse, creditBalance } = useLongTermAssets();
  const [previewing, setPreviewing] = useState(false);
  const [enrollError, setEnrollError] = useState("");
  if (!course) return <PublicShell showNavigation={false}><PageHeader title="课程不存在" backTo="/courses" /></PublicShell>;

  const tier = credentialTier(course);
  const record = learningFor(course.id);
  const enrolled = enrolledFor(course.id);
  const canPreview = course.entitlement === "creditRequired" && !enrolled;

  const enroll = () => {
    if (!loggedIn) { navigate(`/auth/login?returnTo=${encodeURIComponent(`/courses/${course.id}`)}`); return; }
    const result = enrollCourse(course.id);
    if (!result.success) { setEnrollError(result.reason); return; }
    setEnrollError("");
  };

  const primary = () => {
    if (!enrolled) { enroll(); return; }
    if (record.progress >= 100) {
      navigate(tier === "none" ? `/courses/${course.id}/achievement` : `/courses/${course.id}/assessment`);
      return;
    }
    navigate(`/courses/${course.id}/learn`);
  };

  return <PublicShell showNavigation={false}>
    <PageHeader title="课程详情" backTo="/courses" />
    <div className="space-y-5 px-4 py-5">
      <div className="relative aspect-video overflow-hidden rounded-container">
        <div className={`absolute inset-0 bg-gradient-to-br ${course.cover}`} />
        <div className="absolute inset-0 bg-black/15" />
        <button type="button" onClick={() => canPreview && setPreviewing(true)} className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <span className="grid size-16 place-items-center rounded-full bg-white/25 backdrop-blur"><PlayCircle size={32} aria-hidden="true" /></span>
          <span className="mt-2 text-xs font-medium">{canPreview ? "试看第 1 节" : enrolled ? "继续学习" : "课程介绍"}</span>
        </button>
      </div>

      <div><div className="flex flex-wrap gap-2"><PriceTag course={course} /><CredentialTag course={course} /><SourceLine source={course.source} /></div><h1 className="mt-3 text-xl font-semibold leading-7 text-text-primary">{course.title}</h1><p className="mt-2 text-sm leading-6 text-text-secondary">{course.summary}</p><div className="mt-3 flex gap-4 text-xs text-text-tertiary"><span className="flex items-center gap-1"><BookOpen size={13} aria-hidden="true" />{course.chapterCount} 节</span><span className="flex items-center gap-1"><Clock size={13} aria-hidden="true" />{course.duration}</span></div></div>

      {canPreview && <Card className="border border-info bg-info-bg"><div className="flex items-start gap-3"><Video size={20} className="mt-0.5 shrink-0 text-info-text" aria-hidden="true" /><div><h2 className="text-sm font-semibold text-info-text">付费课先试看，再决定要不要换</h2><p className="mt-1 text-xs leading-5 text-info-text">试看第 1 节「{course.lessons[0]}」，试看不扣学力值。</p></div></div><SecondaryButton className="mt-3 w-full" onClick={() => setPreviewing(true)}>开始试看</SecondaryButton></Card>}

      {previewing && <Card className="border border-primary/20 bg-primary-container/40"><div className="flex items-center gap-2"><PlayCircle size={20} className="text-text-brand" aria-hidden="true" /><h2 className="font-semibold text-text-primary">试看：{course.lessons[0]}</h2></div><p className="mt-2 text-sm leading-6 text-text-secondary">这里模拟付费课程的视频试看。真实视频接入后保留同一入口，不要求用户先兑换才能判断课程是否适合自己。</p><div className="mt-4 flex gap-3"><SecondaryButton className="flex-1" onClick={() => setPreviewing(false)}>结束试看</SecondaryButton><Button className="flex-1" onClick={() => { setPreviewing(false); enroll(); }}>兑换完整课程</Button></div></Card>}

      <Card className={tier === "trusted" ? "border border-warning/30 bg-warning-bg/50" : "border border-border-subtle"}>
        <div className="flex items-start gap-3"><span className={`grid size-10 shrink-0 place-items-center rounded-[14px] ${tier === "trusted" ? "bg-warning-bg text-warning-text" : "bg-surface-subtle text-text-secondary"}`}>{tier === "trusted" ? <ShieldCheck size={20} aria-hidden="true" /> : tier === "standard" ? <Award size={20} aria-hidden="true" /> : <GraduationCap size={20} aria-hidden="true" />}</span><div><div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold text-text-primary">{credentialLabel(tier)}</h2>{tier === "trusted" && <StatusTag tone="warning">有签发成本</StatusTag>}</div><p className="mt-1 text-sm leading-5 text-text-secondary">{tierDescription(tier)}</p>{tier === "trusted" && <p className="mt-2 text-xs font-medium text-warning-text">本课采用当前课程目录中的最高学力值档：{course.cost} 学力值。</p>}</div></div>
      </Card>

      {enrolled && <Card><div className="flex items-center justify-between text-sm"><span className="text-text-secondary">学习进度</span><b className="text-text-brand">{record.progress}%</b></div><div className="mt-3"><ProgressBar value={record.progress} /></div></Card>}
      {enrollError && <Card className="border border-danger bg-danger-bg"><p className="text-sm text-danger-text">{enrollError}</p></Card>}
      {!enrolled && course.entitlement === "creditRequired" && <p className="text-center text-xs text-text-tertiary">当前学力值余额 {creditBalance}</p>}
      <Button className="w-full" onClick={primary}>{!loggedIn ? "登录后学习" : !enrolled ? course.entitlement === "creditRequired" ? `使用 ${course.cost} 学力值兑换` : course.entitlement === "free" ? "免费加入学习" : "解锁后学习" : record.progress >= 100 ? tier === "none" ? "查看学习成果" : "参加课程考试" : record.progress > 0 ? "继续学习" : "开始学习"}</Button>
    </div>
  </PublicShell>;
}

function attemptStorageKey(courseId: string) {
  const month = new Date().toISOString().slice(0, 7);
  return `t034-course-attempts:${month}:${courseId}`;
}

function initialAttemptCount(courseId: string) {
  if (typeof window === "undefined") return 0;
  const value = Number(window.sessionStorage.getItem(attemptStorageKey(courseId)) ?? "0");
  return Number.isFinite(value) ? Math.max(0, Math.min(2, value)) : 0;
}

export function T034CourseAssessmentPage() {
  const { courseId } = useParams();
  const course = courseById(courseId);
  const navigate = useNavigate();
  const { learningFor, enrolledFor, submitAssessment, completeCourse } = useLongTermAssets();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null);
  const [usedAttempts, setUsedAttempts] = useState(() => initialAttemptCount(courseId ?? ""));

  if (!course) return <PublicShell showNavigation={false}><PageHeader title="课程不存在" backTo="/courses" /></PublicShell>;

  const tier = credentialTier(course);
  const record = learningFor(course.id);
  const enrolled = enrolledFor(course.id);
  const remaining = Math.max(0, 2 - usedAttempts);
  const exam = course.finalExam;
  const hasRealExam = exam && exam.status === "open" && exam.questions && exam.questions.length > 0;

  if (tier === "none") return <PublicShell showNavigation={false}><PageHeader title="课程成果" backTo={`/courses/${course.id}`} /><div className="space-y-4 px-4 py-5"><Card><h2 className="font-semibold text-text-primary">这门课不需要为了发证再考一次</h2><p className="mt-2 text-sm leading-6 text-text-secondary">完成课程内容即可形成学习记录，不发电子证书，也不消耗可信证书签发成本。</p><Button className="mt-4 w-full" onClick={() => navigate(`/courses/${course.id}/achievement`)}>查看学习成果</Button></Card></div></PublicShell>;

  // 未配置真实题库：显示占位
  if (!hasRealExam) {
    return (
      <PublicShell showNavigation={false}>
        <PageHeader title="课程结业小考" backTo={`/courses/${course.id}`} />
        <div className="space-y-5 px-4 py-5">
          <Card className="border border-border-subtle bg-surface-subtle/40">
            <div className="flex items-start gap-3">
              <Sparkles size={20} className="mt-0.5 shrink-0 text-text-tertiary" aria-hidden="true" />
              <div>
                <h2 className="font-semibold text-text-primary">结业小考筹备中</h2>
                <p className="mt-1 text-sm leading-5 text-text-secondary">
                  本课程结业小考已规划 {exam?.totalQuestions ?? 0} 道题 / 及格 {exam?.passingScore ?? 0} 分，将在后续版本开放。
                </p>
              </div>
            </div>
          </Card>
          <SecondaryButton className="w-full" onClick={() => navigate(`/courses/${course.id}/achievement`)}>返回学习成果</SecondaryButton>
        </div>
      </PublicShell>
    );
  }

  const questions = exam!.questions!;
  const total = questions.length;
  const passing = exam!.passingScore;
  const allAnswered = questions.every(q => answers[q.id] !== undefined);

  const handleSubmit = () => {
    if (!allAnswered || !enrolled || remaining <= 0 || record.assessment === "passed") return;
    const score = questions.reduce((sum, q) => sum + (answers[q.id] === q.answer ? 1 : 0), 0);
    const passed = score >= passing;
    const nextUsed = Math.min(2, usedAttempts + 1);
    setUsedAttempts(nextUsed);
    window.sessionStorage.setItem(attemptStorageKey(course.id), String(nextUsed));
    if (passed) completeCourse(course.id);
    submitAssessment(course.id, passed);
    setResult({ score, passed });
    setSubmitted(true);
  };

  const handleRetake = () => {
    setAnswers({});
    setResult(null);
    setSubmitted(false);
  };

  return <PublicShell showNavigation={false}>
    <PageHeader title="课程结业小考" subtitle={`${course.title} · ${credentialLabel(tier)}`} backTo={`/courses/${course.id}`} />
    <div className="space-y-5 px-4 py-5">
      <Card className="border border-info bg-info-bg">
        <div className="flex items-start gap-3">
          <Clock size={20} className="mt-0.5 shrink-0 text-info-text" aria-hidden="true" />
          <div>
            <h2 className="font-semibold text-info-text">考试前先把次数说清楚</h2>
            <p className="mt-1 text-sm leading-5 text-info-text">当前原型采用会议示例：每门课程每月 2 次考试机会。你本月还剩 <b>{remaining}</b> 次。</p>
          </div>
        </div>
      </Card>

      <Card className="flex items-center justify-between text-sm">
        <span className="text-text-secondary">共 {total} 题 · 及格 {passing} 分</span>
        {submitted && result ? (
          <span className={`font-semibold ${result.passed ? "text-success-text" : "text-danger-text"}`}>得分 {result.score} / {total}</span>
        ) : (
          <span className="text-text-tertiary">已答 {Object.keys(answers).length}/{total}</span>
        )}
      </Card>

      {questions.map((q, index) => {
        const userAnswer = answers[q.id];
        const isCorrect = submitted ? userAnswer === q.answer : null;
        return (
          <Card key={q.id} className="space-y-3">
            <p className="text-sm font-semibold text-text-primary">
              <span className="mr-2 text-text-brand">{String(index + 1).padStart(2, "0")}</span>
              {q.prompt}
            </p>
            <div className="space-y-2">
              {q.options.map((opt, optIndex) => {
                const selected = userAnswer === optIndex;
                const correctOption = submitted ? optIndex === q.answer : null;
                return (
                  <button
                    key={optIndex}
                    type="button"
                    disabled={submitted || !enrolled || remaining <= 0}
                    onClick={() => setAnswers(current => ({ ...current, [q.id]: optIndex }))}
                    className={`flex w-full items-center gap-2 rounded-control border px-3 py-2 text-left text-sm transition active:scale-[0.99] ${
                      submitted
                        ? correctOption
                          ? "border-success/40 bg-success-bg text-success-text"
                          : selected
                            ? "border-danger/40 bg-danger-bg text-danger-text"
                            : "border-border-subtle text-text-secondary"
                        : selected
                          ? "border-primary bg-primary-container text-text-brand"
                          : "border-border-subtle text-text-primary"
                    }`}
                  >
                    <span className="text-xs text-text-tertiary">{String.fromCharCode(65 + optIndex)}.</span>
                    <span className="flex-1">{opt}</span>
                  </button>
                );
              })}
            </div>
            {submitted && isCorrect === false && (
              <p className="text-xs text-text-tertiary">正确答案：{String.fromCharCode(65 + q.answer)}</p>
            )}
          </Card>
        );
      })}

      {submitted && result && (
        <Card className={result.passed ? "border border-success bg-success-bg" : "border border-danger bg-danger-bg"}>
          <p className={`text-sm font-semibold ${result.passed ? "text-success-text" : "text-danger-text"}`}>
            {result.passed ? "考试通过" : remaining > 0 ? `本次未通过，本月还可再考 ${remaining} 次` : "本月考试次数已用完"}
          </p>
          {result.passed && <p className="mt-1 text-sm text-text-secondary">恭喜通过！{credentialLabel(tier)}已可领取，对应证书类徽章已发放。</p>}
        </Card>
      )}

      {!submitted && record.assessment !== "idle" && (
        <Card className={record.assessment === "passed" ? "border border-success bg-success-bg" : "border border-warning bg-warning-bg"}>
          <p className={record.assessment === "passed" ? "text-sm font-semibold text-success-text" : "text-sm font-semibold text-warning-text"}>
            {record.assessment === "passed" ? "你已通过本课程考试" : "上次考试未通过，可重新作答"}
          </p>
        </Card>
      )}

      {record.assessment === "passed" ? (
        <Button className="w-full" onClick={() => navigate(`/courses/${course.id}/achievement`)}>查看{credentialLabel(tier)}</Button>
      ) : submitted && result && !result.passed && remaining > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          <SecondaryButton onClick={handleRetake}>重新考试</SecondaryButton>
          <Button onClick={() => navigate(`/courses/${course.id}/achievement`)}>查看学习成果</Button>
        </div>
      ) : (
        <Button className="w-full" disabled={!allAnswered || !enrolled || remaining <= 0} onClick={handleSubmit}>
          {remaining > 0 ? `提交答卷 · 剩余 ${remaining} 次` : "本月暂无考试机会"}
        </Button>
      )}
    </div>
  </PublicShell>;
}

export function T034CourseAchievementPage() {
  const { courseId } = useParams();
  const course = courseById(courseId);
  const navigate = useNavigate();
  const { learningFor, certificates, claimCertificate } = useLongTermAssets();
  const { earned } = useBadges();
  const [savedStandard, setSavedStandard] = useState(false);
  if (!course) return <PublicShell showNavigation={false}><PageHeader title="课程不存在" backTo="/courses" /></PublicShell>;

  const tier = credentialTier(course);
  const record = learningFor(course.id);
  const certificate = certificates.find(item => item.courseId === course.id);
  const passed = record.assessment === "passed";

  // 统计各 tier 已获得徽章数量
  const earnedHighCount = earned.filter(v => v.entry.tier === "high").length;
  const earnedLowCount = earned.filter(v => v.entry.tier === "low").length;

  // 可信证书兑换门槛
  const certReq = course.certBadgeRequirement;
  const canClaimTrusted = certReq
    ? earnedHighCount >= certReq.highBadgeCount && earnedLowCount >= certReq.lowBadgeCount
    : passed;

  return <PublicShell showNavigation={false}>
    <PageHeader title="课程成果" backTo={`/courses/${course.id}`} />
    <div className="space-y-5 px-4 py-5">
      <Card><div className="flex items-center justify-between"><h2 className="font-semibold text-text-primary">学习结果</h2><StatusTag tone={record.progress >= 100 ? "success" : "warning"}>{record.progress >= 100 ? "已学完" : "学习中"}</StatusTag></div><p className="mt-2 text-sm text-text-secondary">课程进度 {record.progress}%{tier !== "none" ? ` · 考试${passed ? "已通过" : record.assessment === "failed" ? "未通过" : "未参加"}` : ""}</p><div className="mt-3"><ProgressBar value={record.progress} /></div></Card>

      {tier === "none" && <Card className="border border-border-subtle"><div className="flex items-start gap-3"><GraduationCap size={20} className="shrink-0 text-text-secondary" aria-hidden="true" /><div><h2 className="font-semibold text-text-primary">学习记录已保留</h2><p className="mt-1 text-sm leading-5 text-text-secondary">本课程不发证。完成记录仍可进入学习成果，但不会被包装成可信凭证。</p></div></div></Card>}

      {tier === "standard" && <Card className="border border-border-subtle"><div className="flex items-start gap-3"><Award size={20} className="shrink-0 text-text-secondary" aria-hidden="true" /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold text-text-primary">普通电子结业证书</h2><StatusTag tone={passed ? "success" : "neutral"}>{passed ? "可保存" : "通过考试后生成"}</StatusTag></div><p className="mt-1 text-sm leading-5 text-text-secondary">这是课程结业证明，不提供可信验真，也不使用可信证书的强视觉与签发流程。</p>{passed && <SecondaryButton className="mt-3 w-full" onClick={() => setSavedStandard(true)}>{savedStandard ? "已保存普通电子证书" : "保存普通电子证书"}</SecondaryButton>}</div></div></Card>}

      {tier === "trusted" && certReq && (
        <Card className="border border-warning/30 bg-warning-bg/50">
          <div className="flex items-start gap-3">
            <ShieldCheck size={22} className="shrink-0 text-warning-text" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-semibold text-text-primary">可信证书</h2>
                <StatusTag tone="warning">徽章兑换</StatusTag>
              </div>
              <p className="mt-1 text-sm leading-5 text-text-secondary">
                累计获得足够数量的徽章后，即可兑换本课程的可信证书。高级徽章来自课程学习节点，低级徽章可来自日常打卡、公益助力等任意方面。
              </p>

              {/* 兑换门槛进度 */}
              <div className="mt-3 space-y-3 rounded-control bg-white/60 p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">
                    高级徽章 <span className="text-xs text-text-tertiary">（课程节点 / 结业等）</span>
                  </span>
                  <span className={`font-semibold ${earnedHighCount >= certReq.highBadgeCount ? "text-success-text" : "text-text-primary"}`}>
                    {earnedHighCount} / {certReq.highBadgeCount}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-subtle">
                  <div
                    className="h-full rounded-full bg-success"
                    style={{ width: `${Math.min(100, (earnedHighCount / certReq.highBadgeCount) * 100)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">
                    低级徽章 <span className="text-xs text-text-tertiary">（打卡 / 公益 / 广告等）</span>
                  </span>
                  <span className={`font-semibold ${earnedLowCount >= certReq.lowBadgeCount ? "text-success-text" : "text-text-primary"}`}>
                    {earnedLowCount} / {certReq.lowBadgeCount}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-subtle">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${Math.min(100, (earnedLowCount / certReq.lowBadgeCount) * 100)}%` }}
                  />
                </div>
              </div>

              {canClaimTrusted && certificate?.status === "claimable" && (
                <Button className="mt-3 w-full" onClick={() => claimCertificate(certificate.id)}>
                  领取可信证书
                </Button>
              )}
              {canClaimTrusted && certificate?.status === "claimed" && (
                <Button className="mt-3 w-full" onClick={() => navigate(`/assets/certificates/${certificate.id}`)}>
                  查看可信证书与验真
                </Button>
              )}
              {!canClaimTrusted && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <SecondaryButton onClick={() => navigate("/me/badges")}>去徽章墙看看</SecondaryButton>
                  <Button onClick={() => navigate(`/courses/${course.id}/assessment`)} disabled={!passed && record.progress < 100}>
                    {passed ? "继续攒徽章" : "先通过考试"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {tier !== "none" && !passed && <Button className="w-full" onClick={() => navigate(`/courses/${course.id}/assessment`)}>去参加考试</Button>}
      <SecondaryButton className="w-full" onClick={() => navigate("/assets/learning")}>查看我的学习成果</SecondaryButton>
    </div>
  </PublicShell>;
}

function StandardCourseCertificatePage({ certificateId }: { certificateId: string }) {
  const { certificates, claimCertificate } = useLongTermAssets();
  const item = certificates.find(value => value.id === certificateId);
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  if (!item) return <PublicShell showNavigation={false}><PageHeader title="证书不存在" backTo="/assets/certificates" /></PublicShell>;
  const course = courseById(item.courseId);
  return <PublicShell showNavigation={false}><PageHeader title="普通电子证书" backTo="/assets/certificates" /><div className="space-y-5 px-4 py-5"><Card><StatusTag tone="neutral">普通课程证书</StatusTag><h1 className="mt-3 text-xl font-semibold text-text-primary">{item.title}</h1><p className="mt-2 text-sm text-text-secondary">{item.issuer}{course ? ` · ${course.title}` : ""}</p><p className="mt-4 text-sm leading-6 text-text-secondary">用于证明完成课程与通过考核。它不是可信凭证，因此不展示验真码、官方验真入口或可信证书标识。</p></Card>{item.status === "claimable" && <Button className="w-full" onClick={() => claimCertificate(item.id)}>领取普通电子证书</Button>}{item.status === "claimed" && <><SecondaryButton className="w-full" onClick={() => setSaved(true)}>{saved ? "已保存" : "保存电子证书"}</SecondaryButton><GhostButton className="w-full" onClick={() => navigate("/assets/learning")}>查看学习成果</GhostButton></>}</div></PublicShell>;
}

export function T034CertificateDetailRoute() {
  const { certificateId = "" } = useParams();
  const { certificates } = useLongTermAssets();
  const item = certificates.find(value => value.id === certificateId);
  const course = item?.sourceType === "course" ? courseById(item.courseId) : undefined;
  if (item && course && credentialTier(course) === "standard") return <StandardCourseCertificatePage certificateId={certificateId} />;
  return <CertificateDetailTrustedPage />;
}

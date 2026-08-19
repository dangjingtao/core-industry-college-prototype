import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Award, BookOpen, Check, Clock, Coins, GraduationCap, Lock, PlayCircle, Share2, Star, Trophy } from "lucide-react";
import { Dialog } from "@core/shared";
import { Carousel } from "../../components/Carousel";
import { MobileFilter } from "../../components/MobileFilter";
import { Button, Card, GhostButton, PageHeader, PublicShell, SecondaryButton, Section, StatusTag } from "../../components/ui";
import { courseById, courses, type Course, type CourseCategory } from "./data";
import { ProgressBar, SourceLine, useAccountAction, useAccountLoggedIn } from "./shared";
import { useLongTermAssets } from "./store";

const statusLabel = (status: "notStarted" | "inProgress" | "completed") => status === "completed" ? "已完成" : status === "inProgress" ? "学习中" : "未开始";

const categoryTabs = [
  { value: "all" as const, label: "全部" },
  { value: "opc" as const, label: "OPC" },
  { value: "beauty-retail" as const, label: "美妆新零售" },
  { value: "rural-revitalization" as const, label: "乡村振兴" },
  { value: "ai-ecommerce" as const, label: "AI电商" },
  { value: "data-analytics" as const, label: "商业分析" },
  { value: "business-project" as const, label: "企业项目" },
] as const;

const valueTabs = [
  { value: "all" as const, label: "全部" },
  { value: "free" as const, label: "免费" },
  { value: "credit" as const, label: "需学力值" },
] as const;



function CourseCover({ course, className = "" }: { course: Course; className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-container bg-gradient-to-br ${course.cover} ${className}`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.22),transparent_50%)]" />
      <div className="absolute bottom-3 left-3 right-3">
        <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-white/90 px-2 py-1 text-xs font-medium text-text-primary backdrop-blur-sm">
          <PlayCircle size={12} aria-hidden="true" />
          {course.duration}
        </span>
      </div>
    </div>
  );
}

function CourseValueTag({ course, compact = false }: { course: Course; compact?: boolean }) {
  if (course.entitlement === "free") return <StatusTag tone="success">{compact ? "免费" : "免费学习"}</StatusTag>;
  if (course.entitlement === "creditRequired") return <span className="inline-flex items-center gap-1 rounded-full bg-primary-container px-2 py-1 text-xs font-semibold text-text-brand"><Coins size={12} aria-hidden="true" />{course.cost}</span>;
  return <StatusTag tone="info">{compact ? "权益" : "权益解锁"}</StatusTag>;
}

function CategoryTag({ category }: { category: Exclude<CourseCategory, "all"> }) {
  const label = categoryTabs.find(item => item.value === category)?.label ?? category;
  return <span className="rounded-full bg-surface px-2 py-1 text-xs text-text-secondary">{label}</span>;
}

export function CoursesPage() {
  const loggedIn = useAccountLoggedIn();
  const navigate = useNavigate();
  const { learningFor, enrolledFor, courseCompletedFor } = useLongTermAssets();
  const [tab, setTab] = useState<"learning" | "completed">("learning");

  const featured = useMemo(() => courses.filter(course => ["brand-ecommerce", "ai-ecommerce-agent", "opc-methodology"].includes(course.id)), []);

  const visible = useMemo(() => {
    if (!loggedIn) return courses.slice(0, 4);
    return courses.filter(course => {
      const completed = courseCompletedFor(course.id);
      return tab === "completed" ? completed : !completed;
    });
  }, [loggedIn, tab, courseCompletedFor]);

  const carouselItems = featured.map((course, index) => ({
    id: `featured-${course.id}`,
    ariaLabel: `推荐课程 ${index + 1}: ${course.title}`,
    content: (
      <Link to={`/courses/${course.id}`} className="flex h-full w-full items-end rounded-container p-5 text-white">
        <div className={`absolute inset-0 rounded-container bg-gradient-to-br ${course.cover}`} />
        <div className="absolute inset-0 rounded-container bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.22),transparent_50%)]" />
        <div className="relative z-10 w-full">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-1 text-xs font-medium backdrop-blur-sm">
            <Star size={12} aria-hidden="true" />推荐课程
          </span>
          <h3 className="mt-2 text-xl font-bold">{course.title}</h3>
          <p className="mt-1 line-clamp-1 text-sm text-white/85">{course.summary}</p>
          <div className="mt-3 flex items-center gap-3 text-xs text-white/80">
            <span className="flex items-center gap-1"><PlayCircle size={12} aria-hidden="true" />{course.duration}</span>
            <span className="flex items-center gap-1"><BookOpen size={12} aria-hidden="true" />{course.chapterCount} 节</span>
          </div>
        </div>
      </Link>
    ),
  }));

  return (
    <PublicShell>
      <PageHeader title="学院" subtitle="系统学习电商与创新创业能力，成果长期沉淀" backTo="/home" />
      <div className="space-y-5 px-4 py-5">
        <Carousel items={carouselItems} autoPlay interval={5000} size="lg" />

        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary">课程中心</h2>
          <Link to="/courses/center" className="text-sm font-medium text-text-brand">查看全部</Link>
        </div>

        {loggedIn ? (
          <>
            <div className="flex gap-2">
              {(["learning", "completed"] as const).map(value => (
                <button
                  key={value}
                  onClick={() => setTab(value)}
                  className={`min-h-touch rounded-control px-4 text-sm font-medium ${tab === value ? "bg-primary-container text-text-brand" : "bg-surface text-text-secondary"}`}
                >
                  {value === "learning" ? "在学课程" : "已学完课程"}
                </button>
              ))}
            </div>
            <div className="space-y-3">
              {visible.map(course => {
                const record = learningFor(course.id);
                const enrolled = enrolledFor(course.id);
                return (
                  <Link key={course.id} to={`/courses/${course.id}`} className="block">
                    <Card interactive className="flex gap-4">
                      <CourseCover course={course} className="h-[88px] w-[88px] shrink-0" />
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="line-clamp-1 text-base font-semibold text-text-primary">{course.title}</h3>
                          {enrolled && <StatusTag tone={record.status === "completed" ? "success" : "info"}>{statusLabel(record.status)}</StatusTag>}
                        </div>
                        <p className="line-clamp-2 text-xs leading-5 text-text-secondary">{course.summary}</p>
                        <div className="flex items-center gap-2">
                          <CourseValueTag course={course} compact />
                          <span className="text-xs text-text-tertiary">{course.duration}</span>
                        </div>
                        {enrolled && <ProgressBar value={record.progress} />}
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
            {visible.length === 0 && (
              <Card>
                <p className="py-4 text-center text-sm text-text-secondary">
                  {tab === "learning" ? "当前没有在学课程，去课程中心看看吧。" : "还没有已学完课程，继续加油学习。"}
                </p>
                <Button className="mt-3 w-full" onClick={() => navigate("/courses/center")}>去课程中心</Button>
              </Card>
            )}
          </>
        ) : (
          <Card>
            <p className="text-sm text-text-secondary">登录后可查看学习进度、保存学习记录并领取课程证书。</p>
            <Button className="mt-4 w-full" onClick={() => navigate("/auth/login")}>登录后查看课程</Button>
          </Card>
        )}
      </div>
    </PublicShell>
  );
}

const matchesKeywords = (haystack: string, keywords: readonly string[]) => keywords.every(term => haystack.includes(term));

export function CourseCenterPage() {
  const navigate = useNavigate();
  const loggedIn = useAccountLoggedIn();
  const { enrolledFor, learningFor, benefitStatusFor } = useLongTermAssets();
  const [category, setCategory] = useState<typeof categoryTabs[number]["value"]>("all");
  const [valueFilter, setValueFilter] = useState<typeof valueTabs[number]["value"]>("all");
  const [keywords, setKeywords] = useState<string[]>([]);

  const filtered = useMemo(() => {
    let list = courses.filter(course => category === "all" || course.category === category);
    if (valueFilter === "free") list = list.filter(course => course.entitlement === "free");
    if (valueFilter === "credit") list = list.filter(course => course.entitlement === "creditRequired");
    if (keywords.length) {
      list = list.filter(course => {
        const haystack = `${course.title}${course.summary}`.toLowerCase();
        return matchesKeywords(haystack, keywords.map(k => k.toLowerCase()));
      });
    }
    return list;
  }, [category, valueFilter, keywords]);

  const resetFilters = () => { setCategory("all"); setValueFilter("all"); setKeywords([]); };

  return (
    <PublicShell>
      <PageHeader title="全部课程" subtitle="按专业方向与价值维度浏览" backTo="/courses" />
      <div className="flex h-[calc(100dvh-104px)] flex-col">
        <div className="shrink-0 border-b border-border-subtle bg-surface px-4 py-3">
          <MobileFilter
            keywords={keywords}
            onKeywordsChange={next => setKeywords([...next])}
            inputPlaceholder="搜索课程名称或简介"
            filterAriaLabel="课程筛选"
            groups={[
              { key: "category", label: "专业方向", options: categoryTabs.map(tab => ({ value: tab.value, label: tab.label })), value: category, onChange: value => setCategory(value as typeof category) },
              { key: "value", label: "价值维度", options: valueTabs.map(tab => ({ value: tab.value, label: tab.label })), value: valueFilter, onChange: value => setValueFilter(value as typeof valueFilter) },
            ]}
            resultCount={filtered.length}
            resultLabel="门课程"
          />
        </div>
        <div className="min-w-0 flex-1 overflow-y-auto bg-background px-4 py-4">
          <div className="space-y-4">
            {filtered.map(course => {
              const enrolled = loggedIn && enrolledFor(course.id);
              const record = learningFor(course.id);
              const locked = course.entitlement === "benefitRequired" && (!course.unlockBenefitId || !["claimed", "used"].includes(benefitStatusFor(course.unlockBenefitId)));
              return (
                <Link key={course.id} to={`/courses/${course.id}`} className="block">
                  <Card interactive className="flex gap-4 p-3">
                    <CourseCover course={course} className="h-[104px] w-[104px] shrink-0" />
                    <div className="min-w-0 flex-1 py-0.5">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="line-clamp-2 text-base font-semibold leading-6 text-text-primary">{course.title}</h3>
                        {locked && <Lock size={14} className="mt-1 shrink-0 text-text-tertiary" aria-hidden="true" />}
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-text-secondary">{course.summary}</p>
                      <div className="mt-2 flex items-center gap-2 text-xs text-text-tertiary">
                        <span className="flex items-center gap-1"><BookOpen size={12} aria-hidden="true" />{course.chapterCount} 节</span>
                        <span className="flex items-center gap-1"><Clock size={12} aria-hidden="true" />{course.duration}</span>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <CourseValueTag course={course} compact />
                        <CategoryTag category={course.category} />
                        {enrolled && record.status !== "notStarted" && <StatusTag tone={record.status === "completed" ? "success" : "info"}>{statusLabel(record.status)}</StatusTag>}
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
          {filtered.length === 0 && (
            <Card>
              <p className="py-4 text-center text-sm text-text-secondary">当前筛选条件下没有课程</p>
              <Button className="mt-3 w-full" onClick={resetFilters}>重置筛选</Button>
            </Card>
          )}
          <p className="mt-5 text-center text-xs text-text-tertiary">课程兑换与学力值消耗规则为原型占位，待 F04 产品决策。</p>
        </div>
      </div>
    </PublicShell>
  );
}

const courseDemoStates = [
  { value: "notEnrolledFree", label: "未报名（免费）" },
  { value: "notEnrolledCredit", label: "未报名（需学力值）" },
  { value: "enrolled", label: "已报名" },
  { value: "completed", label: "已学完" },
  { value: "passed", label: "已通过考试" },
] as const;

type CourseDemoState = typeof courseDemoStates[number]["value"] | null;

function CoursePrototypeTools() {
  const [searchParams, setSearchParams] = useSearchParams();
  const current = searchParams.get("courseState") as CourseDemoState;
  const set = (value?: CourseDemoState) => {
    const next = new URLSearchParams(searchParams);
    value ? next.set("courseState", value) : next.delete("courseState");
    setSearchParams(next, { replace: true });
  };
  return (
    <details className="absolute bottom-4 right-4 z-40 rounded-control border border-border-subtle bg-surface p-2 text-xs shadow-floating">
      <summary className="cursor-pointer list-none font-medium text-text-secondary">原型状态</summary>
      <div className="absolute bottom-full right-0 mb-2 w-48 rounded-control border border-border-subtle bg-surface p-2 shadow-floating">
        <div className="grid grid-cols-1 gap-1">
          {[undefined, ...courseDemoStates.map(s => s.value)].map(value => (
            <button
              key={value ?? "ready"}
              className={`min-h-8 rounded-control px-2 text-left text-text-brand active:bg-surface-pressed ${current === value ? "bg-primary-container font-semibold" : ""}`}
              onClick={() => set(value)}
            >
              {value ? courseDemoStates.find(s => s.value === value)?.label : "真实状态"}
            </button>
          ))}
        </div>
      </div>
    </details>
  );
}

export function CourseDetailPage() {
  const navigate = useNavigate();
  const loggedIn = useAccountLoggedIn();
  const accountAction = useAccountAction();
  const { courseId } = useParams();
  const course = courseById(courseId);
  const { learningFor, enrolledFor, enrollCourse, benefitStatusFor, startCourse, certificates, claimCertificate, submitAssessment, completeCourse } = useLongTermAssets();
  const [searchParams, setSearchParams] = useSearchParams();
  const demoState = searchParams.get("courseState") as CourseDemoState;
  const [activeTab, setActiveTab] = useState<"intro" | "catalog" | "achievement">("intro");
  const [enrollError, setEnrollError] = useState("");
  const [showCreditDialog, setShowCreditDialog] = useState(false);
  const [showClaimSuccessDialog, setShowClaimSuccessDialog] = useState(false);
  const [shareStatus, setShareStatus] = useState("");

  if (!course) return <PublicShell showNavigation={false}><PageHeader title="课程不存在" backTo="/courses" /></PublicShell>;

  const baseRecord = learningFor(course.id);
  const baseEnrolled = enrolledFor(course.id);

  const record = useMemo(() => {
    if (!demoState) return baseRecord;
    switch (demoState) {
      case "notEnrolledFree":
      case "notEnrolledCredit":
        return { ...baseRecord, progress: 0, status: "notStarted" as const, assessment: "idle" as const };
      case "enrolled":
        return { ...baseRecord, progress: 0, status: "notStarted" as const, assessment: "idle" as const };
      case "completed":
        return { ...baseRecord, progress: 100, status: "inProgress" as const, assessment: "idle" as const };
      case "passed":
        return { ...baseRecord, progress: 100, status: "completed" as const, assessment: "passed" as const };
    }
  }, [demoState, baseRecord]);

  const enrolled = demoState ? demoState !== "notEnrolledFree" && demoState !== "notEnrolledCredit" : baseEnrolled;
  const locked = course.entitlement === "benefitRequired" && (!course.unlockBenefitId || !["claimed", "used"].includes(benefitStatusFor(course.unlockBenefitId)));
  const certificate = certificates.find(item => item.courseId === course.id);

  useEffect(() => {
    if (demoState === "enrolled" || demoState === "completed" || demoState === "passed") {
      setActiveTab("catalog");
    }
  }, [demoState]);

  const enrollInDemo = (next: typeof courseDemoStates[number]["value"]) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("courseState", next);
    setSearchParams(nextParams, { replace: true });
    setActiveTab("catalog");
  };

  const handleEnroll = () => {
    if (!loggedIn) { accountAction(() => undefined); return; }
    if (demoState === "notEnrolledCredit" || course.entitlement === "creditRequired") {
      setShowCreditDialog(true);
      return;
    }
    if (demoState) {
      enrollInDemo("enrolled");
      return;
    }
    const result = enrollCourse(course.id);
    if (!result.success) { setEnrollError(result.reason); return; }
    setEnrollError("");
    setActiveTab("catalog");
  };

  const confirmCreditEnroll = () => {
    setShowCreditDialog(false);
    if (demoState) {
      enrollInDemo("enrolled");
      return;
    }
    const result = enrollCourse(course.id);
    if (!result.success) { setEnrollError(result.reason); return; }
    setEnrollError("");
    setActiveTab("catalog");
  };

  const beginLearning = () => {
    startCourse(course.id);
    navigate(`/courses/${course.id}/learn`);
  };

  const primaryAction = () => {
    if (!loggedIn) { accountAction(() => undefined); return; }
    if (!enrolled) { handleEnroll(); return; }
    if (record.status === "completed") { navigate(`/courses/${course.id}/achievement`); return; }
    beginLearning();
  };

  const shareCourse = async () => {
    try {
      if (!navigator.share) {
        setShareStatus("当前浏览器不支持系统分享，请复制地址栏链接发送到微信。");
        return;
      }
      await navigator.share({ title: course.title, text: course.summary, url: window.location.href });
      setShareStatus("已调起系统分享，可选择微信或其它应用。");
    } catch {
      setShareStatus("分享未完成，可复制当前页面链接发送到微信。");
    }
  };

  const actionText = !loggedIn
    ? "登录后学习"
    : !enrolled
      ? (demoState === "notEnrolledCredit" || course.entitlement === "creditRequired")
        ? `需${course.cost ?? 200}学力值兑换`
        : demoState === "notEnrolledFree" || course.entitlement === "free"
          ? "点击报名学习"
          : "权益解锁学习"
      : record.status === "completed"
        ? "查看学习成果"
        : record.status === "inProgress"
          ? "继续学习"
          : "开始学习";

  const claimCertificateAndShowDialog = () => {
    if (course.certificateId) {
      if (!certificates.some(item => item.id === course.certificateId)) {
        submitAssessment(course.id, true);
        completeCourse(course.id);
      }
      if (course.certificateId) claimCertificate(course.certificateId);
    }
    setShowClaimSuccessDialog(true);
  };

  const certificateDetailUrl = certificate?.id ? `/assets/certificates/${certificate.id}` : (course.certificateId ? `/assets/certificates/${course.certificateId}` : "/assets/certificates");

  return (
    <PublicShell showNavigation={false}>
      <PageHeader title="课程详情" backTo="/courses" right={<button aria-label="分享" onClick={shareCourse} className="flex size-9 items-center justify-center rounded-control text-text-brand active:bg-surface-pressed"><Share2 size={19} aria-hidden="true" /></button>} />
      <div className="relative space-y-5 px-4 py-5 pb-20">
        <div className="relative aspect-video w-full overflow-hidden rounded-container">
          <div className={`absolute inset-0 bg-gradient-to-br ${course.cover}`} />
          <div className="absolute inset-0 bg-black/15" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-white/25 text-white backdrop-blur-sm">
              <PlayCircle size={32} aria-hidden="true" />
            </span>
          </div>
          <div className="absolute bottom-3 right-3">
            <span className="whitespace-nowrap rounded-full bg-black/40 px-2 py-1 text-xs text-white backdrop-blur-sm">{course.duration}</span>
          </div>
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <CategoryTag category={course.category} />
            <CourseValueTag course={course} compact />
            <SourceLine source={course.source} />
          </div>
          <h1 className="mt-2 text-xl font-semibold leading-7 text-text-primary">{course.title}</h1>
          <p className="mt-2 text-sm leading-6 text-text-secondary">{course.summary}</p>
          <div className="mt-3 flex items-center gap-4 text-xs text-text-tertiary">
            <span className="flex items-center gap-1"><BookOpen size={14} aria-hidden="true" />{course.chapterCount} 节</span>
            <span className="flex items-center gap-1"><Clock size={14} aria-hidden="true" />{course.duration}</span>
            <span className="flex items-center gap-1"><GraduationCap size={14} aria-hidden="true" />{course.lessons.length} 个知识点</span>
          </div>
        </div>

        {enrollError && <Card className="border border-danger bg-danger-bg"><p className="text-sm text-danger-text">{enrollError}</p></Card>}
        {shareStatus && <Card className="border border-info bg-info-bg"><p className="text-sm text-info-text">{shareStatus}</p></Card>}

        <div className="flex border-b border-border-subtle">
          {(["intro", "catalog", "achievement"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative min-h-touch flex-1 px-2 text-sm font-medium transition ${activeTab === tab ? "text-text-brand" : "text-text-secondary"}`}
            >
              {tab === "intro" ? "简介" : tab === "catalog" ? "目录" : "成就"}
              {activeTab === tab && <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-primary" />}
            </button>
          ))}
        </div>

        {activeTab === "intro" && (
          <div className="space-y-5">
            <Card>
              <h2 className="font-semibold text-text-primary">课程简介</h2>
              <p className="mt-2 text-sm leading-6 text-text-secondary">{course.description}</p>
            </Card>
            {!enrolled && (
              <Card className="border border-info bg-info-bg">
                <p className="text-sm leading-5 text-info-text">
                  {course.entitlement === "free" ? "本课程为平台公共免费课程，报名后即可开始学习。" : course.entitlement === "creditRequired" ? `本课程需要消耗 ${course.cost} 学力值兑换，兑换后即可解锁全部目录。` : "本课程需要对应权益解锁，领取权益后可直接报名学习。"}
                </p>
              </Card>
            )}
            {locked && course.unlockBenefitId && (
              <SecondaryButton className="w-full" onClick={() => navigate(`/benefits/${course.unlockBenefitId}`)}>查看解锁权益</SecondaryButton>
            )}
            {!enrolled && <Button className="w-full" disabled={locked} onClick={primaryAction}>{actionText}</Button>}
          </div>
        )}

        {activeTab === "catalog" && (
          <div className="space-y-5">
            <Section title="课程目录">
              <Card>
                {course.lessons.map((lesson, index) => {
                  const reached = enrolled && (record.progress >= ((index + 1) / course.lessons.length) * 100 || record.progress === 100);
                  return (
                    <div key={lesson} className="flex min-h-touch items-center gap-3 border-b border-border-subtle last:border-0">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-surface text-xs text-text-tertiary">{String(index + 1).padStart(2, "0")}</span>
                      <span className="flex-1 text-sm text-text-primary">{lesson}</span>
                      {reached && <Check size={16} className="shrink-0 text-success-text" aria-hidden="true" />}
                    </div>
                  );
                })}
              </Card>
            </Section>
            {enrolled && record.status !== "completed" && (
              <Button className="w-full" onClick={() => record.status === "inProgress" ? beginLearning() : beginLearning()}>
                {record.status === "inProgress" ? "继续学习" : "开始学习"}
              </Button>
            )}
            {!enrolled && <Button className="w-full" disabled={locked} onClick={primaryAction}>{actionText}</Button>}
          </div>
        )}

        {activeTab === "achievement" && (
          <div className="space-y-5">
            <Card className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-text-primary">学习进度</h2>
                <span className="text-sm font-semibold text-text-brand">{record.progress}%</span>
              </div>
              <ProgressBar value={record.progress} />
              <p className="text-xs text-text-secondary">
                {record.progress === 100 ? "已完成全部课程内容" : record.progress > 0 ? `已完成 ${Math.round(record.progress)}%，继续学习解锁考试` : "尚未开始学习"}
              </p>
            </Card>

            {record.progress === 100 && record.assessment !== "passed" && (
              <Card className="border border-info bg-info-bg">
                <div className="flex items-center gap-2">
                  <Trophy size={20} className="text-info-text" aria-hidden="true" />
                  <h2 className="font-semibold text-text-primary">课程考试</h2>
                </div>
                <p className="mt-2 text-sm leading-5 text-text-secondary">
                  {record.assessment === "failed" ? "本次考试未通过，可重新作答。" : "学完所有内容后，可参加线上考试，通过即可领取电子证书。"}
                </p>
                <Button className="mt-4 w-full" onClick={() => navigate(`/courses/${course.id}/assessment`)}>可参加考试</Button>
              </Card>
            )}

            {record.assessment === "passed" && (
              <Card className="border border-success bg-success-bg">
                <div className="flex items-center gap-2">
                  <Award size={20} className="text-success-text" aria-hidden="true" />
                  <h2 className="font-semibold text-text-primary">电子证书</h2>
                </div>
                <p className="text-sm leading-5 text-text-secondary">你已通过课程考试，可以领取可信教育认证电子证书。</p>
                <Button className="w-full" onClick={claimCertificateAndShowDialog}>可领取可信教育认证电子证书</Button>
              </Card>
            )}

            {!enrolled && <Button className="w-full" disabled={locked} onClick={primaryAction}>{actionText}</Button>}
          </div>
        )}

        <CoursePrototypeTools />
      </div>

      <Dialog
        open={showCreditDialog}
        onOpenChange={setShowCreditDialog}
        title="确认兑换课程"
        description={`使用 ${course.cost ?? 200} 学力值兑换「${course.title}」，兑换后即可开始学习。`}
        size="sm"
        footer={
          <div className="flex w-full gap-3">
            <SecondaryButton className="flex-1" onClick={() => setShowCreditDialog(false)}>取消</SecondaryButton>
            <Button className="flex-1" onClick={confirmCreditEnroll}>确认兑换</Button>
          </div>
        }
      />

      <Dialog
        open={showClaimSuccessDialog}
        onOpenChange={setShowClaimSuccessDialog}
        title="领取成功"
        description="恭喜你领取成功，电子证书已加入你的可信成果。"
        size="sm"
        footer={
          <div className="flex w-full flex-col gap-3">
            <Button className="w-full" onClick={() => { setShowClaimSuccessDialog(false); navigate(certificateDetailUrl); }}>点击查看</Button>
            <SecondaryButton className="w-full" onClick={() => setShowClaimSuccessDialog(false)}>关闭</SecondaryButton>
          </div>
        }
      />
    </PublicShell>
  );
}

export function CourseLearnPage() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const course = courseById(courseId);
  const { learningFor, enrolledFor, advanceCourse, completeCourse } = useLongTermAssets();
  if (!course) return null;
  const record = learningFor(course.id);
  const enrolled = enrolledFor(course.id);
  const nextIndex = Math.min(course.lessons.length - 1, Math.floor((record.progress / 100) * course.lessons.length));
  return (
    <PublicShell showNavigation={false}>
      <PageHeader title="课程学习" backTo={`/courses/${course.id}`} />
      <div className="space-y-6 px-4 py-5">
        <div>
          <SourceLine source={course.source} />
          <h1 className="mt-3 text-lg font-semibold text-text-primary">{course.title}</h1>
        </div>
        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-text-primary">学习进度</span>
            <span className="text-sm text-text-brand">{record.progress}%</span>
          </div>
          <ProgressBar value={record.progress} />
          <p className="text-xs text-text-secondary">当前：{course.lessons[nextIndex]}</p>
        </Card>
        <Section title="本节内容">
          <Card>
            <h2 className="font-semibold text-text-primary">{course.lessons[nextIndex]}</h2>
            <p className="mt-2 text-sm leading-6 text-text-secondary">完成一节后，进度写回同一份长期学习记录。</p>
          </Card>
        </Section>
        {!enrolled && (
          <Card className="border border-warning bg-warning-bg">
            <p className="text-sm text-warning-text">你尚未报名本课程，请先完成报名或兑换。</p>
          </Card>
        )}
        <div className="grid grid-cols-2 gap-3">
          {record.progress < 100 ? (
            <>
              <SecondaryButton onClick={() => advanceCourse(course.id)} disabled={!enrolled}>完成本节</SecondaryButton>
              <Button onClick={() => { completeCourse(course.id); navigate(`/courses/${course.id}/assessment`); }} disabled={!enrolled}>完成课程并考试</Button>
            </>
          ) : (
            <Button className="col-span-2" onClick={() => navigate(`/courses/${course.id}/assessment`)}>进入课程考试</Button>
          )}
        </div>
      </div>
    </PublicShell>
  );
}

export function CourseAssessmentPage() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const course = courseById(courseId);
  const { learningFor, submitAssessment, enrolledFor } = useLongTermAssets();
  const [answer, setAnswer] = useState<"" | "a" | "b">("");
  if (!course) return null;
  const record = learningFor(course.id);
  const enrolled = enrolledFor(course.id);
  const submit = () => { const passed = answer === "b"; submitAssessment(course.id, passed); };
  return (
    <PublicShell showNavigation={false}>
      <PageHeader title="课程考试" backTo={`/courses/${course.id}`} />
      <div className="space-y-5 px-4 py-5">
        {!enrolled && <Card className="border border-warning bg-warning-bg"><p className="text-sm text-warning-text">你尚未报名本课程，考试成绩不会保存。</p></Card>}
        <Card>
          <p className="text-sm font-medium text-text-primary">示例题：一次业务复盘最先应该确认什么？</p>
          <div className="mt-4 space-y-2">
            {[["a", "先扩大投放"], ["b", "先确认目标、口径与真实数据"]].map(([value, label]) => (
              <button
                key={value}
                onClick={() => setAnswer(value as "a" | "b")}
                className={`min-h-touch w-full rounded-control border px-3 text-left text-sm ${answer === value ? "border-primary bg-primary-container text-text-brand" : "border-border bg-surface text-text-primary"}`}
              >
                {label}
              </button>
            ))}
          </div>
        </Card>
        {record.assessment !== "idle" && (
          <Card className={record.assessment === "passed" ? "border border-success bg-success-bg" : "border border-danger bg-danger-bg"}>
            <p className={record.assessment === "passed" ? "font-semibold text-success-text" : "font-semibold text-danger-text"}>
              {record.assessment === "passed" ? "考试通过，课程成果已写入长期学习记录" : "本次未通过，可重新作答"}
            </p>
          </Card>
        )}
        {record.assessment === "passed" ? (
          <Button className="w-full" onClick={() => navigate(`/courses/${course.id}/achievement`)}>查看成绩与证书</Button>
        ) : (
          <Button className="w-full" disabled={!answer || !enrolled} onClick={submit}>提交答案</Button>
        )}
      </div>
    </PublicShell>
  );
}

export function CourseAchievementPage() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const course = courseById(courseId);
  const { learningFor, certificates, claimCertificate, enrolledFor } = useLongTermAssets();
  if (!course) return null;
  const record = learningFor(course.id);
  const certificate = certificates.find(item => item.courseId === course.id);
  return (
    <PublicShell showNavigation={false}>
      <PageHeader title="课程成果" backTo={`/courses/${course.id}`} />
      <div className="space-y-5 px-4 py-5">
        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-text-primary">学习结果</h2>
            <StatusTag tone={record.assessment === "passed" ? "success" : "warning"}>{record.assessment === "passed" ? "已通过" : "待完成"}</StatusTag>
          </div>
          <p className="text-sm text-text-secondary">课程进度 {record.progress}% · 考试 {record.assessment === "passed" ? "通过" : record.assessment === "failed" ? "未通过" : "未参加"}</p>
          <ProgressBar value={record.progress} />
        </Card>
        {!enrolledFor(course.id) && (
          <Card className="border border-warning bg-warning-bg">
            <p className="text-sm text-warning-text">当前为公开浏览模式，报名课程后学习成果会长期保存。</p>
          </Card>
        )}
        {certificate ? (
          <Card className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-text-secondary">课程证书</p>
                <h2 className="mt-1 font-semibold text-text-primary">{certificate.title}</h2>
              </div>
              <StatusTag tone={certificate.status === "claimed" ? "success" : "info"}>{certificate.status === "claimed" ? "已领取" : "可领取"}</StatusTag>
            </div>
            {certificate.status === "claimable" && <Button className="w-full" onClick={() => claimCertificate(certificate.id)}>领取证书</Button>}
            <GhostButton className="w-full" onClick={() => navigate(`/assets/certificates/${certificate.id}`)}>查看长期证书记录</GhostButton>
          </Card>
        ) : (
          <Card>
            <p className="text-sm text-text-secondary">完成课程并通过考试后，证书会进入统一证书记录。</p>
          </Card>
        )}
        <SecondaryButton className="w-full" onClick={() => navigate("/assets/learning")}>查看我的学习成果</SecondaryButton>
      </div>
    </PublicShell>
  );
}

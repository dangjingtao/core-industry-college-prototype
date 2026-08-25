import { Fragment, useEffect, useMemo, useState, type ReactNode } from "react";
import { Award, Bell, BookOpen, BriefcaseBusiness, Building2, CalendarCheck, Check, ChevronRight, ClipboardList, Gift, HeartHandshake, Sparkles, Trophy, UserCheck, Users } from "lucide-react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { Carousel } from "../../components/Carousel";
import { MobileFilter } from "../../components/MobileFilter";
import { Button, Card, GhostButton, PageHeader, PrototypeStateTools, PublicShell, SecondaryButton, Section, StateBlock, StatusTag } from "../../components/ui";
import { useLongTermAssets } from "../long-term-assets/store";
import { ListFeedAdCard, useListFeedAd } from "../long-term-assets/Ads";
import { welfareProjects } from "../welfare/data";
import { companies, companyById, competitions, competitionById, opportunities, opportunityById, type Competition, type Opportunity } from "./data";
import { PublicPlatformProvider, usePublicPlatform, type IdentityScenario, type ListKey } from "./state";

export { PublicPlatformProvider, usePublicPlatform };
export type { IdentityScenario };

const matchesKeywords = (haystack: string, keywords: readonly string[]) => keywords.every(term => haystack.includes(term));
const companyIndustries = Array.from(new Set(companies.map(item => item.industry)));

const NEWBIE_COURSE_IDS = ["newbie-essential"];
const NEWBIE_BENEFIT_IDS = ["benefit-tencent-map-ride", "benefit-taobao-flash-takeout", "benefit-luckin-coffee", "benefit-cotti-coffee", "benefit-campus-video"];

function todayKey() {
  return new Date().toLocaleDateString("zh-CN");
}

function useTodayCheckIn() {
  const [state, setState] = useState(() => {
    try {
      const raw = typeof localStorage !== "undefined" ? localStorage.getItem("task-center-checkin") : null;
      const saved = raw ? JSON.parse(raw) as { date: string; streak: number } : null;
      return { checkedIn: saved?.date === todayKey(), streak: saved?.streak ?? 0 };
    } catch {
      return { checkedIn: false, streak: 0 };
    }
  });
  const checkIn = () => {
    const next = { date: todayKey(), streak: state.checkedIn ? state.streak : state.streak + 1 };
    try {
      localStorage.setItem("task-center-checkin", JSON.stringify(next));
    } catch {
      // ignore
    }
    setState({ checkedIn: true, streak: next.streak });
  };
  return { ...state, checkIn };
}

type NewbieRewards = {
  taskClaims: Record<string, boolean>;
  allCompletedClaimed: boolean;
};

function useNewbieRewards() {
  const [rewards, setRewards] = useState<NewbieRewards>(() => {
    try {
      const raw = typeof localStorage !== "undefined" ? localStorage.getItem("newbie-task-rewards") : null;
      const saved = raw ? JSON.parse(raw) as NewbieRewards : null;
      return saved ?? { taskClaims: {}, allCompletedClaimed: false };
    } catch {
      return { taskClaims: {}, allCompletedClaimed: false };
    }
  });

  const persist = (next: NewbieRewards) => {
    try {
      localStorage.setItem("newbie-task-rewards", JSON.stringify(next));
    } catch {
      // ignore
    }
    setRewards(next);
  };

  const claimTask = (taskId: string) => {
    persist({ ...rewards, taskClaims: { ...rewards.taskClaims, [taskId]: true } });
  };

  const claimAllCompleted = () => {
    persist({ ...rewards, allCompletedClaimed: true });
  };

  const resetRewards = () => {
    try {
      localStorage.removeItem("newbie-task-rewards");
    } catch {
      // ignore
    }
    setRewards({ taskClaims: {}, allCompletedClaimed: false });
  };

  return { rewards, claimTask, claimAllCompleted, resetRewards };
}

type NewbieTask = {
  id: string;
  label: string;
  description: string;
  icon: ReactNode;
  iconClass: string;
  to: string;
  action: string;
  completed: boolean;
  onAction?: () => void;
};

function useNewbieTasks(demoMode?: "empty" | "complete") {
  const { session, identities } = usePublicPlatform();
  const { learning, benefitStatusFor } = useLongTermAssets();
  const { checkedIn } = useTodayCheckIn();

  const tasks = useMemo<NewbieTask[]>(() => {
    const loggedIn = session.loggedIn;
    const base = [
      {
        id: "profile",
        label: "完善学生资料",
        description: "填写学校、专业等基础信息，解锁更多能力",
        icon: <UserCheck size={18} aria-hidden="true" />,
        iconClass: "bg-[#fff2e8] text-[#c45b1b]",
        to: "/me/profile",
        action: "去完善",
        completed: loggedIn && session.profileComplete,
      },
      {
        id: "checkin",
        label: "每日打卡",
        description: "去任务中心完成今日打卡，养成参赛学习习惯",
        icon: <CalendarCheck size={18} aria-hidden="true" />,
        iconClass: "bg-[#e9f6f1] text-[#247456]",
        to: "/tasks",
        action: "去打卡",
        completed: checkedIn,
      },
      {
        id: "newbie-course",
        label: "学习新手课程",
        description: "5 分钟了解 App 使用、AI 工具与创赛报名",
        icon: <BookOpen size={18} aria-hidden="true" />,
        iconClass: "bg-[#eaf5ff] text-[#2879d0]",
        to: "/courses",
        action: "去学习",
        completed: loggedIn && NEWBIE_COURSE_IDS.some(id => {
          const record = learning.find(item => item.courseId === id);
          return record ? record.progress > 0 : false;
        }),
      },
      {
        id: "benefit",
        label: "领取创赛福利",
        description: "领取咖啡券、出行券等学生专属福利",
        icon: <Gift size={18} aria-hidden="true" />,
        iconClass: "bg-[#fff7df] text-[#946218]",
        to: "/benefits",
        action: "去领取",
        completed: loggedIn && NEWBIE_BENEFIT_IDS.some(id => ["claimed", "used"].includes(benefitStatusFor(id))),
      },
      {
        id: "competition",
        label: "发现一场赛事",
        description: "浏览正在报名的赛事，开启你的创赛之旅",
        icon: <Trophy size={18} aria-hidden="true" />,
        iconClass: "bg-[#f3efff] text-[#6f4bc2]",
        to: "/competitions",
        action: "去发现",
        completed: loggedIn && identities.length > 0,
      },
    ];
    if (demoMode === "empty") return base.map(task => ({ ...task, completed: false }));
    if (demoMode === "complete") return base.map(task => ({ ...task, completed: true }));
    return base;
  }, [session, identities, learning, benefitStatusFor, checkedIn, demoMode]);

  const allCompleted = useMemo(() => tasks.every(task => task.completed), [tasks]);
  return { tasks, allCompleted };
}

function NewbieTaskItem({ task, claimed, onClaim }: { task: NewbieTask; claimed: boolean; onClaim: () => void }) {
  const navigate = useNavigate();
  const handleClaim = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClaim();
  };

  return (
    <button
      key={task.id}
      type="button"
      onClick={() => (task.onAction ? task.onAction() : navigate(task.to))}
      className="flex w-full items-center gap-3 rounded-container border border-border-subtle bg-surface p-3 text-left transition active:bg-surface-pressed"
    >
      <span className={`flex size-9 shrink-0 items-center justify-center rounded-control ${task.iconClass}`}>{task.icon}</span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <strong className={`text-sm font-semibold ${task.completed ? "text-text-secondary line-through" : "text-text-primary"}`}>{task.label}</strong>
          {task.completed && <Check size={14} className="text-success-text" aria-hidden="true" />}
        </span>
        <span className="mt-0.5 block text-xs leading-5 text-text-secondary">{task.description}</span>
      </span>
      {task.completed ? (
        claimed ? (
          <span className="shrink-0 text-xs font-medium text-text-tertiary">已领取</span>
        ) : (
          <span className="shrink-0 rounded-control bg-primary px-3 py-1.5 text-xs font-medium text-on-primary active:bg-primary-pressed" onClick={handleClaim}>点击领取</span>
        )
      ) : (
        <span className="shrink-0 text-xs font-medium text-text-tertiary">未完成</span>
      )}
    </button>
  );
}

function NewbieDemoTools({ value, onChange }: { value?: "empty" | "complete"; onChange: (value?: "empty" | "complete") => void }) {
  return (
    <details className="ml-auto mt-2 w-fit rounded-control border border-border-subtle bg-surface p-2 text-xs shadow-floating">
      <summary className="cursor-pointer font-medium text-text-secondary">原型状态</summary>
      <div className="mt-2 grid grid-cols-1 gap-1">
        {[
          { key: undefined, label: "一般状态" },
          { key: "empty" as const, label: "未完成任何任务" },
          { key: "complete" as const, label: "完成所有任务" },
        ].map(option => (
          <button
            key={option.label}
            type="button"
            className={`min-h-8 whitespace-nowrap rounded-control px-2 text-left active:bg-surface-pressed ${value === option.key ? "bg-primary-container text-text-brand" : "text-text-brand"}`}
            onClick={() => onChange(option.key)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </details>
  );
}

export function NewbieTasksPage() {
  const [demoMode, setDemoMode] = useState<"empty" | "complete" | undefined>(undefined);
  const { tasks, allCompleted } = useNewbieTasks(demoMode);
  const { rewards, claimTask, claimAllCompleted, resetRewards } = useNewbieRewards();
  const completedCount = tasks.filter(t => t.completed).length;
  const progressPercent = Math.round((completedCount / tasks.length) * 100);

  return (
    <PublicShell showNavigation={false}>
      <PageHeader title="新手任务" subtitle="完成 5 项引导，快速熟悉平台核心能力" backTo="/home" />
      <div className="space-y-4 px-4 py-5">
        <Card className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-text-primary">任务进度</span>
            <span className="font-semibold text-text-brand">{completedCount}/{tasks.length}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-surface-subtle">
            <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${progressPercent}%` }} />
          </div>
          <p className="text-xs text-text-secondary">完成全部新手任务可额外获得 20 学力值（暂定）。</p>
        </Card>

        <div className="space-y-2">
          {tasks.map(task => (
            <NewbieTaskItem
              key={task.id}
              task={task}
              claimed={!!rewards.taskClaims[task.id]}
              onClaim={() => claimTask(task.id)}
            />
          ))}
        </div>

        {allCompleted && (
          <Card className="space-y-3 border border-primary-container bg-primary-container">
            <div className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary">
                <Award size={20} aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <strong className="block text-sm font-semibold text-text-primary">新手任务全部完成</strong>
                <span className="mt-0.5 block text-xs text-text-secondary">恭喜！可领取额外学力值奖励。</span>
              </span>
            </div>
            {rewards.allCompletedClaimed ? (
              <span className="block text-center text-xs font-medium text-text-tertiary">额外奖励已领取</span>
            ) : (
              <Button className="w-full" onClick={claimAllCompleted}>领取 20 学力值（暂定）</Button>
            )}
          </Card>
        )}

        <div className="flex items-center justify-between gap-3">
          <button type="button" onClick={resetRewards} className="text-xs text-text-tertiary underline active:text-text-secondary">重置奖励状态（演示用）</button>
          <NewbieDemoTools value={demoMode} onChange={setDemoMode} />
        </div>
      </div>
    </PublicShell>
  );
}

function usePrototypeView() {
  const view = new URLSearchParams(useLocation().search).get("view");
  return view === "loading" || view === "empty" || view === "error" ? view : "ready";
}

function useListScroll(key: ListKey) {
  const { listScroll, setListScroll } = usePublicPlatform();
  const savedScroll = listScroll[key];
  useEffect(() => {
    const frame = requestAnimationFrame(() => window.scrollTo({ top: savedScroll, behavior: "auto" }));
    return () => { cancelAnimationFrame(frame); setListScroll(key, window.scrollY); };
  }, [key, savedScroll, setListScroll]);
}

function useGuest() {
  return !usePublicPlatform().session.loggedIn;
}

const competitionStatus = (item: Competition) => item.status === "registrationOpen" ? ["报名中", "success"] as const : item.status === "inProgress" ? ["进行中", "info"] as const : item.status === "ended" ? ["已结束", "neutral"] as const : ["即将开放", "warning"] as const;

function CompetitionCard({ item }: { item: Competition }) {
  const [label, tone] = competitionStatus(item);
  return <Link to={`/competitions/${item.id}`} className="block"><Card interactive className="space-y-3"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="text-base font-semibold leading-6 text-text-primary">{item.name}</h3><p className="mt-1 text-sm text-text-secondary">{item.organizer}</p></div><StatusTag tone={tone}>{label}</StatusTag></div><p className="line-clamp-2 text-sm leading-5 text-text-secondary">{item.summary}</p><div className="flex flex-wrap gap-2">{item.tags.map(tag => <StatusTag key={tag} tone="neutral">{tag}</StatusTag>)}</div>{item.registrationEnds && <p className="text-xs text-text-tertiary">{item.registrationEnds}</p>}</Card></Link>;
}

function OpportunityCard({ item }: { item: Opportunity }) {
  const company = companyById(item.companyId);
  return <Link to={`/opportunities/${item.id}`} className="block"><Card interactive className="space-y-3"><div className="flex items-start justify-between gap-3"><div><h3 className="text-base font-semibold text-text-primary">{item.title}</h3><p className="mt-1 text-sm text-text-secondary">{company?.name} · {item.city}</p></div><StatusTag tone={item.status === "open" ? "success" : "neutral"}>{item.status === "open" ? item.mode : "已结束"}</StatusTag></div><p className="line-clamp-2 text-sm leading-5 text-text-secondary">{item.summary}</p><div className="flex flex-wrap gap-2">{item.skills.map(skill => <StatusTag key={skill} tone="neutral">{skill}</StatusTag>)}</div></Card></Link>;
}

const competitionBannerStyles = [
  "from-[#5B5EF7] to-[#7B7EF8]",
  "from-[#147A4C] to-[#21B66F]",
  "from-[#9A6110] to-[#F3A21B]",
];

function CompetitionCarousel() {
  const featured = competitions.filter(item => item.status !== "ended").slice(0, 3);
  return <Carousel size="sm" ariaLabel="精选赛事" autoPlay interval={5000} items={featured.map((item, index) => {
    const [statusLabel] = competitionStatus(item);
    return {
      id: item.id,
      ariaLabel: `${item.name}，${statusLabel}`,
      content: <Link to={`/competitions/${item.id}`} aria-label={`查看第 ${index + 1} 个精选赛事`} className={`flex h-full flex-col justify-between bg-gradient-to-br p-4 pr-12 text-on-primary ${competitionBannerStyles[index % competitionBannerStyles.length]}`}><span className="text-xs font-medium opacity-85">精选赛事 · {statusLabel}</span><span><strong className="line-clamp-2 block text-base font-semibold leading-6">{item.name}</strong><span className="mt-1 block truncate text-xs opacity-80">{item.organizer}</span></span></Link>,
    };
  })} />;
}

function ViewGate({ children }: { children: ReactNode }) {
  const view = usePrototypeView();
  if (view !== "ready") return <div className="px-4 py-6"><StateBlock state={view} /></div>;
  return <>{children}</>;
}

function AccountScenarioSwitch() {
  const { identityMode, setIdentityMode } = usePublicPlatform();
  const label = identityMode === "multi" ? "多赛事身份" : identityMode === "none" ? "无赛事身份" : "报名回流身份";
  return <button className="min-h-touch rounded-control bg-surface-subtle px-3 text-xs font-medium text-text-secondary" onClick={() => setIdentityMode(identityMode === "none" ? "multi" : "none")}>原型账号：{label}</button>;
}

type HomeTaskEntry = {
  id: string;
  source: string;
  title: string;
  detail: string;
  status: string;
  tone: "info" | "success" | "warning" | "danger" | "neutral";
  to: string;
  icon: ReactNode;
  iconClass: string;
};

function HomeTaskZone({ entries }: { entries: HomeTaskEntry[] }) {
  const navigate = useNavigate();
  const [featured, ...shortcuts] = entries;
  if (!featured) return null;
  return <section aria-labelledby="home-task-zone-title" className="space-y-3">
    <div className="flex min-h-6 items-center justify-between gap-3"><h2 id="home-task-zone-title" className="text-base font-semibold text-text-primary">任务专区</h2><Link to="/tasks" className="text-sm font-medium text-text-brand">查看全部</Link></div>
    <div className="overflow-hidden rounded-container border border-border-subtle bg-surface">
      <button type="button" aria-label={`${featured.source}：${featured.title}，${featured.status}`} className="block min-h-[136px] w-full bg-[linear-gradient(135deg,#f3f5ff_0%,#ffffff_72%)] p-4 text-left transition active:bg-surface-pressed" onClick={() => navigate(featured.to)}>
        <span className="flex items-start justify-between gap-3"><span className="flex items-center gap-3"><span className={`flex size-10 shrink-0 items-center justify-center rounded-control ${featured.iconClass}`}>{featured.icon}</span><span><span className="flex items-center gap-2"><span className="text-xs font-medium text-text-secondary">当前优先 · {featured.source}</span><StatusTag tone={featured.tone}>{featured.status}</StatusTag></span><strong className="mt-2 block text-base font-semibold text-text-primary">{featured.title}</strong></span></span><ClipboardList className="shrink-0 text-text-tertiary" size={20} aria-hidden="true" /></span>
        <span className="mt-2 block truncate text-xs text-text-tertiary">{featured.detail}</span>
        <span className="mt-3 flex items-center justify-between border-t border-border-subtle pt-3 text-sm font-medium text-text-brand"><span>继续处理</span><ChevronRight size={18} aria-hidden="true" /></span>
      </button>
      <div className="grid grid-cols-3 divide-x divide-border-subtle border-t border-border-subtle">{shortcuts.map(entry => <button key={entry.id} type="button" aria-label={`${entry.source}：${entry.title}，${entry.status}`} className="flex min-h-[92px] min-w-0 flex-col items-center justify-center px-2 py-2 text-center transition active:bg-surface-pressed" onClick={() => navigate(entry.to)}>
        <span className={`flex size-9 shrink-0 items-center justify-center rounded-control ${entry.iconClass}`}>{entry.icon}</span>
        <strong className="mt-1 block w-full truncate text-sm font-semibold text-text-primary">{entry.title}</strong>
        <span className="mt-1 text-xs text-text-tertiary">{entry.status}</span>
      </button>)}</div>
    </div>
  </section>;
}

export function HomePage() {
  const navigate = useNavigate();
  const guest = useGuest();
  const view = usePrototypeView();
  const { identities, applications, learningPoints } = usePublicPlatform();
  const activeIdentity = identities.find(identity => identity.identityStatus === "active");
  const activeCompetition = guest ? undefined : competitionById(activeIdentity?.competitionId);
  const openOpportunityCount = opportunities.filter(item => item.status === "open").length;
  const openCompetitionCount = competitions.filter(item => item.status === "registrationOpen").length;
  const { tasks: newbieTasks } = useNewbieTasks();
  const newbieRemaining = newbieTasks.filter(t => !t.completed).length;
  const featuredWelfare = useMemo(() => {
    return welfareProjects.find(p => p.featured && p.status === "active") ?? welfareProjects.find(p => p.status === "active") ?? welfareProjects.find(p => p.status !== "ended");
  }, []);
  const taskEntries: HomeTaskEntry[] = [
    {
      id: "newbie",
      source: "新人",
      title: "新手任务",
      detail: "完成 5 项引导，快速上手平台",
      status: newbieRemaining > 0 ? `${newbieRemaining} 项待完成` : "已完成",
      tone: newbieRemaining > 0 ? "info" : "success",
      to: "/tasks/newbie",
      icon: <Sparkles size={19} aria-hidden="true" />,
      iconClass: "bg-[#e9f6f1] text-[#247456]",
    },
    {
      id: "competition",
      source: "赛事",
      title: activeCompetition ? "赛事进度" : guest ? "发现正在报名的赛事" : "选择赛事并完成报名",
      detail: activeCompetition?.name ?? "从公开赛事开始",
      status: activeCompetition ? "进行中" : "可开始",
      tone: activeCompetition ? "info" : "neutral",
      to: activeCompetition ? `/competitions/${activeCompetition.id}/workspace` : "/competitions",
      icon: <Trophy size={19} aria-hidden="true" />,
      iconClass: "bg-[#fff2e8] text-[#c45b1b]",
    },
    {
      id: "course",
      source: "课程",
      title: "课程学习",
      detail: "课程、考试与学习成果",
      status: "待安排",
      tone: "neutral",
      to: "/courses",
      icon: <BookOpen size={19} aria-hidden="true" />,
      iconClass: "bg-[#eaf5ff] text-[#2879d0]",
    },
    {
      id: "opportunity",
      source: "机会",
      title: applications.length ? "投递进展" : "实习与项目",
      detail: applications.length ? `${applications.length} 条投递记录` : `${openOpportunityCount} 个开放机会`,
      status: applications.length ? "进行中" : "可开始",
      tone: applications.length ? "info" : "success",
      to: applications.length ? "/applications" : "/opportunities",
      icon: <BriefcaseBusiness size={19} aria-hidden="true" />,
      iconClass: "bg-[#f3efff] text-[#6f4bc2]",
    },
  ];
  const growthResources = [
    { label: "课程", description: "提升参赛与职业能力", to: "/courses", icon: BookOpen },
    { label: "创赛福利", description: "学力值、权益与兑换", to: "/benefits", icon: Gift },
    { label: "可信空间", description: "沉淀证书与成绩", to: "/assets", icon: Award },
    { label: "合作企业", description: "发现品牌与机会", to: "/companies", icon: Building2 },
    { label: "三创同学会", description: "赛友风采与项目资源", to: "/stories", icon: Users },
  ];
  return <PublicShell showNavigation={true}><header className="flex items-center justify-between px-4 pb-4 pt-6"><div><div className="flex items-center gap-2"><p className="text-xs font-medium text-text-brand">核心产业学院</p>{guest && <span className="text-xs text-text-tertiary">未登录</span>}</div><h1 className="mt-1 text-xl font-semibold text-text-primary">{guest ? "你好，欢迎来看看" : "嗨，今天也一起向前"}</h1></div><div className="flex items-center gap-2">{!guest && <button type="button" aria-label="查看学力值与创赛福利" title="奖励规则待产品确认，当前为演示值" onClick={() => navigate("/benefits")} className="flex h-11 items-center gap-1.5 rounded-full bg-surface px-3 text-sm font-medium text-text-primary transition active:bg-surface-pressed"><Sparkles size={16} className="text-text-brand" aria-hidden="true" /><span>学力值 {learningPoints.toLocaleString("zh-CN")}</span></button>}<button aria-label="消息通知" onClick={() => {
          if (guest) {
            const returnTo = encodeURIComponent("/me/notifications?from=/home");
            navigate(`/auth/login?returnTo=${returnTo}`);
          } else {
            navigate("/me/notifications", { state: { from: "/home" } });
          }
        }} className="relative flex size-11 items-center justify-center rounded-full bg-surface text-text-primary"><Bell size={21} aria-hidden="true" /><span className="absolute right-2 top-2 size-2 rounded-full bg-danger" /></button></div></header>
    {view !== "ready" ? <div className="px-4"><StateBlock state={view} /></div> : <div className="space-y-7 px-4">
      <section className="overflow-hidden rounded-[20px] bg-gradient-to-br from-primary to-[#7569ff] p-5 text-on-primary shadow-floating"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-xs font-medium opacity-80">{activeCompetition ? "我的赛事" : "正在报名"}</p><h2 className="mt-2 text-xl font-semibold leading-7">{activeCompetition?.name ?? competitions[0].name}</h2><p className="mt-2 text-sm opacity-85">{activeCompetition ? "赛事身份有效，继续推进你的参赛项目" : "发现适合你的赛事，开启一段新经历"}</p></div><span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white/15"><Trophy size={22} aria-hidden="true" /></span></div><div className="mt-5 flex gap-2">{activeCompetition ? <button className="min-h-touch flex-1 rounded-control bg-white px-4 text-sm font-semibold text-text-brand" onClick={() => navigate(`/competitions/${activeCompetition.id}/workspace`)}>进入当前赛事</button> : <button className="min-h-touch flex-1 rounded-control bg-white px-4 text-sm font-semibold text-text-brand" onClick={() => navigate("/competitions")}>发现比赛</button>}<button className="flex min-h-touch items-center justify-center rounded-control bg-white/15 px-4 text-sm font-medium" onClick={() => navigate("/competitions")}>全部赛事<ChevronRight size={16} aria-hidden="true" /></button></div></section>

      <section aria-labelledby="home-explore-title" className="space-y-3">
        <div className="flex min-h-6 items-center justify-between gap-3"><h2 id="home-explore-title" className="text-base font-semibold text-text-primary">探索你的下一站</h2><span className="text-xs font-medium text-text-tertiary">参赛 · 就业</span></div>
        <div className="overflow-hidden rounded-container border border-border-subtle bg-surface">
          <div className="grid grid-cols-2 gap-3 p-4">
            <button type="button" onClick={() => navigate("/competitions")} aria-label={`赛事推荐：正在报名的赛事，${openCompetitionCount} 场报名中`} className="flex min-h-[132px] flex-col justify-between rounded-container bg-[linear-gradient(135deg,#fff0e2_0%,#fff7ef_72%)] p-4 text-left transition active:scale-95"><span className="flex items-start justify-between gap-2"><span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-[#e66d20] shadow-sm"><Trophy size={18} aria-hidden="true" /></span><span className="rounded-full bg-white/85 px-2 py-1 text-xs font-medium text-[#c45b1b]">{openCompetitionCount} 场 · 报名中</span></span><span className="mt-3"><strong className="block text-base font-semibold leading-6 text-text-primary">赛事推荐</strong><span className="mt-1 block text-xs text-text-secondary">正在报名的赛事</span></span></button>
            <button type="button" onClick={() => navigate("/opportunities")} aria-label={`实习与项目：找到真实实践机会，${openOpportunityCount} 个开放中`} className="flex min-h-[132px] flex-col justify-between rounded-container bg-[linear-gradient(135deg,#e6f3ff_0%,#f1f8ff_72%)] p-4 text-left transition active:scale-95"><span className="flex items-start justify-between gap-2"><span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-[#2879d0] shadow-sm"><BriefcaseBusiness size={18} aria-hidden="true" /></span><span className="rounded-full bg-white/85 px-2 py-1 text-xs font-medium text-[#1f5fa8]">{openOpportunityCount} 个 · 开放中</span></span><span className="mt-3"><strong className="block text-base font-semibold leading-6 text-text-primary">实习与项目</strong><span className="mt-1 block text-xs text-text-secondary">找到真实实践机会</span></span></button>
          </div>
          <div className="grid grid-cols-5 gap-1.5 border-t border-border-subtle bg-surface-subtle p-3">{growthResources.map(({ label, to, icon: Icon }) => <button key={to} type="button" onClick={() => navigate(to)} aria-label={label} className="flex min-h-[76px] flex-col items-center justify-center gap-1 rounded-control bg-surface p-1 text-center transition active:bg-surface-pressed"><span className="flex size-8 items-center justify-center rounded-[10px] bg-primary-container text-text-brand"><Icon size={16} aria-hidden="true" /></span><span className="text-[11px] font-medium leading-4 text-text-primary">{label}</span></button>)}</div>
        </div>
      </section>

      <HomeTaskZone entries={taskEntries} />

      {!guest && !activeCompetition && <Card className="border border-border-subtle"><h2 className="text-base font-semibold text-text-primary">还没有可用赛事工作区</h2><p className="mt-2 text-sm leading-5 text-text-secondary">公共赛事、机会和成长资源仍可正常使用。</p></Card>}
      {guest && <Card className="flex items-center justify-between gap-3 border border-border-subtle"><div><h2 className="text-sm font-semibold text-text-primary">登录后保存你的进度</h2><p className="mt-1 text-xs text-text-secondary">报名、投递与长期成果持续沉淀</p></div><SecondaryButton className="shrink-0" onClick={() => navigate("/auth/login?returnTo=/home")}>登录 / 注册</SecondaryButton></Card>}

      {featuredWelfare && (
        <Link to={`/welfare/${featuredWelfare.id}?returnTo=/home`} className="block">
          <Card interactive className={`relative overflow-hidden bg-gradient-to-br ${featuredWelfare.cover} p-4 text-on-primary`}>
            <div className="flex items-center gap-3">
              <HeartHandshake size={22} className="shrink-0 opacity-90" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-semibold">{featuredWelfare.title}</h3>
                <p className="mt-0.5 line-clamp-1 text-xs opacity-85">{featuredWelfare.summary}</p>
              </div>
              <span className="flex shrink-0 flex-col items-center gap-1">
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-medium leading-3 backdrop-blur-sm">公益助力</span>
                <ChevronRight size={18} className="opacity-80" aria-hidden="true" />
              </span>
            </div>
          </Card>
        </Link>
      )}

      <Section title="热门赛事" action={<Link to="/competitions" className="text-sm font-medium text-text-brand">查看全部</Link>}><div className="flex snap-x gap-3 overflow-x-auto pb-1">{competitions.slice(0,2).map(item => { const [label, tone] = competitionStatus(item); return <Link to={`/competitions/${item.id}`} key={item.id} className="w-[82%] shrink-0 snap-start"><Card interactive className="h-full p-4"><StatusTag tone={tone}>{label}</StatusTag><h3 className="mt-3 line-clamp-2 text-base font-semibold leading-6 text-text-primary">{item.name}</h3><p className="mt-2 line-clamp-2 text-xs leading-5 text-text-secondary">{item.summary}</p></Card></Link>; })}</div></Section>

      <Section title="精选机会" action={<Link to="/opportunities" className="text-sm font-medium text-text-brand">查看全部</Link>}><div className="space-y-3">{opportunities.filter(item => item.status === "open").slice(0,2).map(item => <OpportunityCard item={item} key={item.id} />)}</div></Section>
      {!guest && <div className="flex justify-center pb-2"><AccountScenarioSwitch /></div>}
    </div>}<PrototypeStateTools />
  </PublicShell>;
}

export function CompetitionsPage() {
  useListScroll("competitions");
  const { listView, updateListView } = usePublicPlatform();
  const view = usePrototypeView();
  const filtered = useMemo(() => competitions.filter(item => {
    const matchesStatus = listView.competitionStatus === "all" || item.status === listView.competitionStatus;
    const haystack = `${item.name}${item.organizer}${item.tags.join("")}`.toLowerCase();
    return matchesStatus && matchesKeywords(haystack, listView.competitionKeywords);
  }), [listView.competitionKeywords, listView.competitionStatus]);
  return <PublicShell showNavigation={true}><PageHeader title="赛事" subtitle="公开赛事发现，不要求先拥有赛事身份" /><div className="space-y-6 px-4 py-5"><CompetitionCarousel /><MobileFilter keywords={listView.competitionKeywords} onKeywordsChange={competitionKeywords => updateListView({ competitionKeywords: [...competitionKeywords] })} inputPlaceholder="搜索赛事名称、主办方或关键词" groups={[{ key: "competitionStatus", label: "赛事状态", options: [{ value: "all", label: "不限" }, { value: "registrationOpen", label: "报名中" }, { value: "inProgress", label: "进行中" }, { value: "upcoming", label: "即将开放" }, { value: "ended", label: "已结束" }], value: listView.competitionStatus, onChange: competitionStatus => updateListView({ competitionStatus }) }]} filterAriaLabel="赛事筛选" resultCount={view === "ready" ? filtered.length : undefined} resultLabel="场赛事" />{view !== "ready" ? <StateBlock state={view} /> : filtered.length ? <div className="space-y-3">{filtered.map(item => <CompetitionCard key={item.id} item={item} />)}</div> : <StateBlock state="empty" />}</div><PrototypeStateTools /></PublicShell>;
}

const opportunityTabs = [
  { key: "positions", label: "岗位" },
  { key: "applications", label: "我的投递" },
  { key: "companies", label: "合作企业" },
] as const;

type OpportunityTab = (typeof opportunityTabs)[number]["key"];

export function OpportunitiesPage() {
  useListScroll("opportunities");
  const navigate = useNavigate();
  const { listView, updateListView, applications, session, setApplicationStatus } = usePublicPlatform();
  const view = usePrototypeView();
  const positionsAd = useListFeedAd("positions");
  const companiesAd = useListFeedAd("companies");
  const [activeTab, setActiveTab] = useState<OpportunityTab>("positions");
  const filtered = useMemo(() => opportunities.filter(item => {
    const matchesMode = listView.opportunityMode === "all" || item.mode === listView.opportunityMode;
    const haystack = `${item.title}${companyById(item.companyId)?.name}${item.city}`.toLowerCase();
    return matchesMode && matchesKeywords(haystack, listView.opportunityKeywords);
  }), [listView.opportunityKeywords, listView.opportunityMode]);
  const filteredCompanies = companies.filter(item => {
    const matchesIndustry = listView.companyIndustry === "all" || item.industry === listView.companyIndustry;
    const haystack = `${item.name}${item.industry}${item.summary}`.toLowerCase();
    return matchesIndustry && matchesKeywords(haystack, listView.companyKeywords);
  });
  return <PublicShell showNavigation={true}><PageHeader title="机会" subtitle="实习、校招与企业项目实践" /><div className="flex border-b border-border-subtle bg-surface px-4" role="tablist" aria-label="机会页内容切换">{opportunityTabs.map(tab => { const active = activeTab === tab.key; return <button key={tab.key} type="button" role="tab" aria-selected={active} onClick={() => setActiveTab(tab.key)} className={`relative min-h-touch flex-1 transition-all duration-300 ease-out ${active ? "scale-[1.08] text-text-primary" : "scale-95 text-text-tertiary hover:text-text-secondary active:scale-90"}`}><span className={`block text-sm ${active ? "font-semibold" : "font-medium"}`}>{tab.label}</span><span aria-hidden="true" className={`absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-text-brand transition-all duration-300 ${active ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"}`} /></button>; })}</div>{activeTab === "positions" ? <div className="space-y-5 px-4 py-5"><MobileFilter keywords={listView.opportunityKeywords} onKeywordsChange={opportunityKeywords => updateListView({ opportunityKeywords: [...opportunityKeywords] })} inputPlaceholder="搜索岗位、企业或城市" groups={[{ key: "opportunityMode", label: "机会类型", options: [{ value: "all", label: "不限" }, { value: "实习", label: "实习" }, { value: "校招", label: "校招" }, { value: "项目实践", label: "项目实践" }], value: listView.opportunityMode, onChange: opportunityMode => updateListView({ opportunityMode }) }]} filterAriaLabel="机会筛选" resultCount={view === "ready" ? filtered.length : undefined} resultLabel="个机会" />{view !== "ready" ? <StateBlock state={view} /> : filtered.length ? <div className="space-y-3">{filtered.map((item, index) => <Fragment key={item.id}><OpportunityCard item={item} />{index === 1 && <ListFeedAdCard ad={positionsAd} seed="positions" />}</Fragment>)}</div> : <StateBlock state="empty" />}</div> : activeTab === "applications" ? <div className="space-y-3 px-4 py-5">{view !== "ready" ? <StateBlock state={view} /> : !session.loggedIn ? <Card className="py-8 text-center"><p className="font-semibold text-text-primary">登录后查看投递记录</p><Button className="mt-4" onClick={() => navigate(`/auth/login?returnTo=${encodeURIComponent("/opportunities")}`)}>登录</Button></Card> : applications.length ? <div className="space-y-3">{applications.map(record => { const item = opportunityById(record.opportunityId); const company = companyById(item?.companyId); if (!item) return null; return <Card key={record.opportunityId}><Link to={`/opportunities/${record.opportunityId}`} className="block"><div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold text-text-primary">{item.title}</h2><p className="mt-1 text-sm text-text-secondary">{company?.name}</p></div><StatusTag tone={record.status === "submitted" ? "success" : "warning"}>{record.status === "submitted" ? "已投递" : "状态待回流"}</StatusTag></div></Link><details className="mt-3 border-t border-border-subtle pt-3 text-xs text-text-secondary"><summary className="cursor-pointer">原型投递状态</summary><div className="mt-2 flex gap-2"><button className="min-h-touch rounded-control px-2 text-text-brand" onClick={() => setApplicationStatus(record.opportunityId, "submitted")}>submitted</button><button className="min-h-touch rounded-control px-2 text-text-brand" onClick={() => setApplicationStatus(record.opportunityId, "statusUnknown")}>statusUnknown</button></div></details></Card>; })}</div> : <Card className="py-8 text-center"><p className="font-semibold text-text-primary">还没有投递记录</p><p className="mt-2 text-sm text-text-secondary">先去看看适合你的实习与项目机会。</p><Button className="mt-4" onClick={() => setActiveTab("positions")}>去找机会</Button></Card>}</div> : <div className="space-y-4 px-4 py-5"><MobileFilter keywords={listView.companyKeywords} onKeywordsChange={companyKeywords => updateListView({ companyKeywords: [...companyKeywords] })} inputPlaceholder="搜索企业或行业" groups={[{ key: "companyIndustry", label: "所属行业", options: [{ value: "all", label: "不限" }, ...companyIndustries.map(industry => ({ value: industry, label: industry }))], value: listView.companyIndustry, onChange: companyIndustry => updateListView({ companyIndustry }) }]} filterAriaLabel="企业筛选" resultCount={view === "ready" ? filteredCompanies.length : undefined} resultLabel="家企业" />{view !== "ready" ? <StateBlock state={view} /> : filteredCompanies.length ? filteredCompanies.map((item, index) => <Fragment key={item.id}><Link to={`/companies/${item.id}`} className="block"><Card interactive><h2 className="text-base font-semibold text-text-primary">{item.name}</h2><p className="mt-1 text-sm text-text-brand">{item.industry}</p><p className="mt-3 text-sm leading-5 text-text-secondary">{item.summary}</p><p className="mt-3 text-xs text-text-tertiary">关联 {item.resourceRelations.length} 项赛事 / 权益 / 课程 / 活动 / 岗位资源</p></Card></Link>{index === 1 && <ListFeedAdCard ad={companiesAd} seed="companies" />}</Fragment>) : <StateBlock state="empty" />}</div>}<PrototypeStateTools /></PublicShell>;
}

const applicationFeedbackSteps = [
  { label: "简历已送达", hint: "简历已通过平台送达企业" },
  { label: "企业已查看", hint: "HR 已查看你的简历" },
  { label: "进入筛选", hint: "简历进入岗位筛选流程" },
  { label: "邀约面试", hint: "企业已发出面试邀约" },
];

export function OpportunityDetailPage() {
  const navigate = useNavigate();
  const guest = useGuest();
  const { opportunityId } = useParams();
  const item = opportunityById(opportunityId);
  const { applications, submitApplication } = usePublicPlatform();
  const [resumeCheck, setResumeCheck] = useState(false);
  const [feedbackStage, setFeedbackStage] = useState(0);
  if (!item) return <PublicShell showNavigation={false}><PageHeader title="机会不存在" backTo="/opportunities" /><div className="px-4 py-6"><StateBlock state="error" /></div></PublicShell>;
  const company = companyById(item.companyId);
  const applied = applications.some(record => record.opportunityId === item.id);
  const apply = () => { submitApplication(item.id); navigate("/applications"); };
  const feedback = applicationFeedbackSteps[feedbackStage];
  const feedbackTone: "info" | "success" | "warning" | "danger" | "neutral" = feedbackStage >= 3 ? "success" : feedbackStage >= 2 ? "warning" : "info";
  return <PublicShell showNavigation={false}><PageHeader title="机会详情" backTo="/opportunities" /><ViewGate><div className="space-y-6 px-4 py-5"><div><StatusTag tone={item.status === "open" ? "success" : "neutral"}>{item.status === "open" ? item.mode : "已结束"}</StatusTag><h1 className="mt-3 text-2xl font-semibold text-text-primary">{item.title}</h1><button className="mt-2 min-h-touch text-left text-sm font-medium text-text-brand" onClick={() => navigate(`/companies/${item.companyId}?from=${encodeURIComponent(`/opportunities/${item.id}`)}`)}>{company?.name} · 查看企业</button><p className="mt-3 text-base leading-6 text-text-secondary">{item.summary}</p></div><Section title="岗位信息"><Card><p className="text-sm text-text-secondary">工作地点</p><p className="mt-1 font-medium text-text-primary">{item.city}</p><div className="mt-4 flex flex-wrap gap-2">{item.skills.map(skill => <StatusTag key={skill} tone="neutral">{skill}</StatusTag>)}</div></Card></Section>{applied && <Section title="投递记录" action={<Link to="/applications" className="text-sm font-medium text-text-brand">查看全部</Link>}><Card className="p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold text-text-primary">{item.title}</p><p className="mt-1 text-xs text-text-secondary">{company?.name} · 简历投递回馈</p></div><StatusTag tone={feedbackTone}>{feedback.label}</StatusTag></div><ol className="mt-4 space-y-3">{applicationFeedbackSteps.map((step, index) => { const done = index <= feedbackStage; return <li key={step.label} className="flex gap-3"><span className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full ${done ? "bg-primary-container text-text-brand" : "bg-surface-subtle text-text-tertiary"}`}>{done ? <Check size={12} aria-hidden="true" /> : <span className="size-1.5 rounded-full bg-current" />}</span><div className="min-w-0"><p className={`text-sm font-medium ${done ? "text-text-primary" : "text-text-tertiary"}`}>{step.label}</p><p className="mt-0.5 text-xs text-text-secondary">{step.hint}</p></div></li>; })}</ol><details className="mt-4 border-t border-border-subtle pt-3 text-xs text-text-secondary"><summary className="cursor-pointer">原型回馈状态</summary><div className="mt-2 flex flex-wrap gap-2">{applicationFeedbackSteps.map((step, index) => <button key={step.label} className="min-h-touch rounded-control px-2 text-text-brand" onClick={() => setFeedbackStage(index)}>{step.label}</button>)}</div></details></Card></Section>}{resumeCheck && item.status === "open" && !applied && <Card className="border border-info bg-info-bg"><h2 className="font-semibold text-info-text">投递前检查长期简历</h2><p className="mt-2 text-sm leading-5 text-info-text">使用长期账号中的可信经历与学生自己维护的简历表达。</p><div className="mt-4 flex gap-2"><SecondaryButton className="flex-1" onClick={() => navigate(`/me/resume?returnTo=${encodeURIComponent(`/opportunities/${item.id}`)}`)}>查看长期简历</SecondaryButton><Button className="flex-1" onClick={apply}>确认投递</Button></div></Card>}<div>{item.status === "closed" ? <Button className="w-full" disabled>机会已结束</Button> : applied ? <Button className="w-full" disabled>已投递</Button> : guest ? <Button className="w-full" onClick={() => navigate(`/auth/login?returnTo=${encodeURIComponent(`/opportunities/${item.id}`)}`)}>登录后投递</Button> : <Button className="w-full" onClick={() => setResumeCheck(true)}>使用长期简历投递</Button>}</div></div></ViewGate><PrototypeStateTools /></PublicShell>;
}

export function CompaniesPage() {
  useListScroll("companies");
  const { listView, updateListView } = usePublicPlatform();
  const view = usePrototypeView();
  const companiesAd = useListFeedAd("companies");
  const filtered = companies.filter(item => {
    const matchesIndustry = listView.companyIndustry === "all" || item.industry === listView.companyIndustry;
    const haystack = `${item.name}${item.industry}${item.summary}`.toLowerCase();
    return matchesIndustry && matchesKeywords(haystack, listView.companyKeywords);
  });
  return <PublicShell><PageHeader title="企业" subtitle="资源、品牌与机会合作方" backTo="/opportunities" /><div className="space-y-4 px-4 py-5"><MobileFilter keywords={listView.companyKeywords} onKeywordsChange={companyKeywords => updateListView({ companyKeywords: [...companyKeywords] })} inputPlaceholder="搜索企业或行业" groups={[{ key: "companyIndustry", label: "所属行业", options: [{ value: "all", label: "不限" }, ...companyIndustries.map(industry => ({ value: industry, label: industry }))], value: listView.companyIndustry, onChange: companyIndustry => updateListView({ companyIndustry }) }]} filterAriaLabel="企业筛选" resultCount={view === "ready" ? filtered.length : undefined} resultLabel="家企业" />{view !== "ready" ? <StateBlock state={view} /> : filtered.length ? filtered.map((item, index) => <Fragment key={item.id}><Link to={`/companies/${item.id}`} className="block"><Card interactive><h2 className="text-base font-semibold text-text-primary">{item.name}</h2><p className="mt-1 text-sm text-text-brand">{item.industry}</p><p className="mt-3 text-sm leading-5 text-text-secondary">{item.summary}</p><p className="mt-3 text-xs text-text-tertiary">关联 {item.resourceRelations.length} 项赛事 / 权益 / 课程 / 活动 / 岗位资源</p></Card></Link>{index === 1 && <ListFeedAdCard ad={companiesAd} seed="companies" />}</Fragment>) : <StateBlock state="empty" />}</div><PrototypeStateTools /></PublicShell>;
}

export function CompanyDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { companyId } = useParams();
  const item = companyById(companyId);
  const { session, followedCompanies, toggleFollow } = usePublicPlatform();
  if (!item) return <PublicShell showNavigation={false}><PageHeader title="企业不存在" backTo="/companies" /><div className="px-4 py-6"><StateBlock state="error" /></div></PublicShell>;
  const followed = followedCompanies.includes(item.id);
  const from = new URLSearchParams(location.search).get("from");
  const follow = () => session.loggedIn ? toggleFollow(item.id) : navigate(`/auth/login?returnTo=${encodeURIComponent(`/companies/${item.id}${location.search}`)}`);
  return <PublicShell showNavigation={false}><PageHeader title="企业详情" backTo={from || "/companies"} /><ViewGate><div className="space-y-6 px-4 py-5"><div><StatusTag tone="info">合作企业</StatusTag><h1 className="mt-3 text-2xl font-semibold text-text-primary">{item.name}</h1><p className="mt-1 text-sm text-text-brand">{item.industry}</p><p className="mt-4 text-base leading-6 text-text-secondary">{item.summary}</p><SecondaryButton className="mt-4" onClick={follow}>{session.loggedIn ? followed ? "已关注" : "关注企业" : "登录后关注"}</SecondaryButton></div><Section title="与平台的资源关系"><div className="space-y-2">{item.resourceRelations.map((relation,index) => relation.to ? <button key={`${relation.type}-${index}`} className="flex min-h-touch w-full items-center justify-between rounded-control bg-surface px-3 py-2 text-left active:bg-surface-pressed" onClick={() => navigate(relation.to!)}><span><StatusTag tone="neutral">{relation.type}</StatusTag><span className="ml-2 text-sm font-medium text-text-primary">{relation.title}</span></span><span className="text-text-tertiary">›</span></button> : <div key={`${relation.type}-${index}`} className="flex min-h-touch w-full items-center justify-between rounded-control bg-surface px-3 py-2"><span><StatusTag tone="neutral">{relation.type}</StatusTag><span className="ml-2 text-sm font-medium text-text-primary">{relation.title}</span></span><span className="text-xs text-text-tertiary">线下 / 待接入</span></div>)}</div></Section><Section title="当前机会"><div className="space-y-3">{opportunities.filter(opportunity => opportunity.companyId === item.id).map(opportunity => <OpportunityCard key={opportunity.id} item={opportunity} />)}</div></Section></div></ViewGate><PrototypeStateTools /></PublicShell>;
}

export function ApplicationsPage() {
  const navigate = useNavigate();
  const view = usePrototypeView();
  const { session, applications, setApplicationStatus } = usePublicPlatform();
  if (!session.loggedIn) return <PublicShell><PageHeader title="投递记录" backTo="/opportunities" /><div className="px-4 py-6"><Card className="py-8 text-center"><p className="font-semibold text-text-primary">登录后查看投递记录</p><Button className="mt-4" onClick={() => navigate("/auth/login?returnTo=%2Fapplications")}>登录</Button></Card></div></PublicShell>;
  return <PublicShell><PageHeader title="投递记录" backTo="/opportunities" /><div className="space-y-3 px-4 py-5">{view !== "ready" ? <StateBlock state={view} /> : applications.length ? applications.map(record => { const item = opportunityById(record.opportunityId); const company = companyById(item?.companyId); if (!item) return null; return <Card key={record.opportunityId}><Link to={`/opportunities/${record.opportunityId}`} className="block"><div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold text-text-primary">{item.title}</h2><p className="mt-1 text-sm text-text-secondary">{company?.name}</p></div><StatusTag tone={record.status === "submitted" ? "success" : "warning"}>{record.status === "submitted" ? "已投递" : "状态待回流"}</StatusTag></div></Link><details className="mt-3 border-t border-border-subtle pt-3 text-xs text-text-secondary"><summary className="cursor-pointer">原型投递状态</summary><div className="mt-2 flex gap-2"><button className="min-h-touch rounded-control px-2 text-text-brand" onClick={() => setApplicationStatus(record.opportunityId,"submitted")}>submitted</button><button className="min-h-touch rounded-control px-2 text-text-brand" onClick={() => setApplicationStatus(record.opportunityId,"statusUnknown")}>statusUnknown</button></div></details></Card>; }) : <Card className="py-8 text-center"><p className="font-semibold text-text-primary">还没有投递记录</p><p className="mt-2 text-sm text-text-secondary">先去看看适合你的实习与项目机会。</p><Button className="mt-4" onClick={() => navigate("/opportunities")}>去找机会</Button></Card>}</div><PrototypeStateTools /></PublicShell>;
}

export function LoginBoundaryPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, continueAsGuest } = usePublicPlatform();
  const returnTo = new URLSearchParams(location.search).get("returnTo") || "/home";
  const signIn = () => { login(); navigate(returnTo); };
  const browseAsGuest = () => { continueAsGuest(); navigate("/home"); };
  return <PublicShell showNavigation={false}><PageHeader title="登录" /><div className="space-y-5 px-4 py-8"><Card><h1 className="text-lg font-semibold text-text-primary">登录后继续</h1><p className="mt-2 text-sm leading-5 text-text-secondary">公开赛事、机会和企业可以直接浏览；报名、投递及长期账号内容需要登录。</p></Card><Button className="w-full" onClick={signIn}>使用原型账号登录</Button><GhostButton className="w-full" onClick={browseAsGuest}>以游客身份继续浏览</GhostButton></div></PublicShell>;
}

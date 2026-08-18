import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Award, Bell, BookOpen, BriefcaseBusiness, Building2, ChevronRight, ClipboardList, Gift, MessageCircle, Sparkles, Trophy, Users } from "lucide-react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { Carousel } from "../../components/Carousel";
import { MobileFilter } from "../../components/MobileFilter";
import { Button, Card, GhostButton, PageHeader, PrototypeStateTools, PublicShell, SecondaryButton, Section, StateBlock, StatusTag } from "../../components/ui";
import { scenarios } from "../../mock/scenarios";
import type { CompetitionIdentityState } from "../../state/model";
import { companies, companyById, competitions, competitionById, opportunities, opportunityById, type Competition, type Opportunity } from "./data";

type ApplicationRecord = { opportunityId: string; status: "submitted" | "statusUnknown" };
type IdentityMode = "multi" | "none" | "runtime";
type SessionState = { loggedIn: boolean; profileComplete: boolean };
type ListViewState = {
  competitionKeyword: string;
  competitionStatus: string;
  opportunityKeyword: string;
  opportunityMode: string;
  companyKeyword: string;
};
type ListKey = "competitions" | "opportunities" | "companies";
export type IdentityScenario = "none" | "pending" | "rejected" | "active" | "revoked";

type PublicPlatformState = {
  session: SessionState;
  applications: ApplicationRecord[];
  followedCompanies: string[];
  identities: CompetitionIdentityState[];
  identityMode: IdentityMode;
  listView: ListViewState;
  listScroll: Record<ListKey, number>;
  setIdentityMode: (mode: "multi" | "none") => void;
  login: () => void;
  continueAsGuest: () => void;
  setCompetitionIdentityScenario: (competitionId: string, scenario: IdentityScenario) => void;
  upsertRegistrationPending: (competitionId: string) => void;
  submitApplication: (opportunityId: string) => void;
  setApplicationStatus: (opportunityId: string, status: ApplicationRecord["status"]) => void;
  toggleFollow: (companyId: string) => void;
  updateListView: (patch: Partial<ListViewState>) => void;
  setListScroll: (key: ListKey, value: number) => void;
};

const PublicPlatformContext = createContext<PublicPlatformState | null>(null);

function syncCompetitionStatus(identity: CompetitionIdentityState): CompetitionIdentityState {
  const competition = competitionById(identity.competitionId);
  return competition ? { ...identity, competitionStatus: competition.status } : identity;
}

function multiIdentitySeed() {
  return scenarios.multiCompetitionAccount.competitions.identities.map(syncCompetitionStatus);
}

const initialListView: ListViewState = {
  competitionKeyword: "",
  competitionStatus: "all",
  opportunityKeyword: "",
  opportunityMode: "all",
  companyKeyword: "",
};

export function PublicPlatformProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const enteredAsGuest = new URLSearchParams(location.search).get("guest") === "1";
  const [session, setSession] = useState<SessionState>(() => ({ loggedIn: !enteredAsGuest, profileComplete: !enteredAsGuest }));
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [followedCompanies, setFollowedCompanies] = useState<string[]>(["northstar-beauty"]);
  const [identities, setIdentities] = useState<CompetitionIdentityState[]>(multiIdentitySeed);
  const [identityMode, setIdentityModeValue] = useState<IdentityMode>("multi");
  const [listView, setListView] = useState(initialListView);
  const [listScroll, setListScrollState] = useState<Record<ListKey, number>>({ competitions: 0, opportunities: 0, companies: 0 });

  useEffect(() => {
    if (new URLSearchParams(location.search).get("guest") === "1") setSession({ loggedIn: false, profileComplete: false });
  }, [location.search]);

  const setIdentityMode = useCallback((mode: "multi" | "none") => {
    setIdentityModeValue(mode);
    setIdentities(mode === "multi" ? multiIdentitySeed() : []);
  }, []);
  const login = useCallback(() => setSession({ loggedIn: true, profileComplete: true }), []);
  const continueAsGuest = useCallback(() => setSession({ loggedIn: false, profileComplete: false }), []);
  const setCompetitionIdentityScenario = useCallback((competitionId: string, scenario: IdentityScenario) => {
    setIdentities(current => {
      if (scenario === "none") return current.filter(identity => identity.competitionId !== competitionId);
      const competition = competitionById(competitionId);
      const existing = current.find(identity => identity.competitionId === competitionId);
      const next: CompetitionIdentityState = {
        competitionId,
        competitionStatus: competition?.status ?? existing?.competitionStatus ?? "registrationOpen",
        identityStatus: scenario === "active" ? "active" : scenario === "pending" ? "pending" : scenario === "rejected" ? "rejected" : "revoked",
        registrationStatus: scenario === "active" ? "approved" : scenario === "pending" ? "pending" : scenario === "rejected" ? "rejected" : "approved",
      };
      return existing ? current.map(identity => identity.competitionId === competitionId ? next : identity) : [...current, next];
    });
    setIdentityModeValue("runtime");
  }, []);
  const upsertRegistrationPending = useCallback((competitionId: string) => setCompetitionIdentityScenario(competitionId, "pending"), [setCompetitionIdentityScenario]);
  const submitApplication = useCallback((opportunityId: string) => {
    setApplications(records => records.some(record => record.opportunityId === opportunityId) ? records : [...records, { opportunityId, status: "submitted" }]);
  }, []);
  const setApplicationStatus = useCallback((opportunityId: string, status: ApplicationRecord["status"]) => setApplications(records => records.map(record => record.opportunityId === opportunityId ? { ...record, status } : record)), []);
  const toggleFollow = useCallback((companyId: string) => setFollowedCompanies(ids => ids.includes(companyId) ? ids.filter(id => id !== companyId) : [...ids, companyId]), []);
  const updateListView = useCallback((patch: Partial<ListViewState>) => setListView(current => ({ ...current, ...patch })), []);
  const setListScroll = useCallback((key: ListKey, value: number) => setListScrollState(current => current[key] === value ? current : { ...current, [key]: value }), []);

  const guardedSubmitApplication = useCallback((opportunityId: string) => { if (session.loggedIn) submitApplication(opportunityId); }, [session.loggedIn, submitApplication]);
  const guardedToggleFollow = useCallback((companyId: string) => { if (session.loggedIn) toggleFollow(companyId); }, [session.loggedIn, toggleFollow]);
  const guardedIdentityScenario = useCallback((competitionId: string, scenario: IdentityScenario) => { if (session.loggedIn) setCompetitionIdentityScenario(competitionId, scenario); }, [session.loggedIn, setCompetitionIdentityScenario]);

  const value = useMemo<PublicPlatformState>(() => ({
    session, applications, followedCompanies, identities, identityMode, listView, listScroll,
    setIdentityMode, login, continueAsGuest,
    setCompetitionIdentityScenario: guardedIdentityScenario,
    upsertRegistrationPending,
    submitApplication: guardedSubmitApplication,
    setApplicationStatus,
    toggleFollow: guardedToggleFollow,
    updateListView,
    setListScroll,
  }), [session, applications, followedCompanies, identities, identityMode, listView, listScroll, setIdentityMode, login, continueAsGuest, guardedIdentityScenario, upsertRegistrationPending, guardedSubmitApplication, setApplicationStatus, guardedToggleFollow, updateListView, setListScroll]);

  return <PublicPlatformContext.Provider value={value}>{children}</PublicPlatformContext.Provider>;
}

export function usePublicPlatform() {
  const value = useContext(PublicPlatformContext);
  if (!value) throw new Error("PublicPlatformProvider missing");
  return value;
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

const opportunityBannerStyles = [
  "from-[#2879D0] to-[#5AA6E8]",
  "from-[#6F4BC2] to-[#9A7DDB]",
  "from-[#147A4C] to-[#36A573]",
];

function OpportunityCarousel() {
  const featured = opportunities.filter(item => item.status === "open").slice(0, 3);
  return <Carousel size="sm" ariaLabel="精选机会" autoPlay interval={5000} items={featured.map((item, index) => {
    const company = companyById(item.companyId);
    return {
      id: item.id,
      ariaLabel: `${item.title}，${company?.name ?? "合作企业"}`,
      content: <Link to={`/opportunities/${item.id}`} aria-label={`查看第 ${index + 1} 个精选机会`} className={`flex h-full flex-col justify-between bg-gradient-to-br p-4 pr-12 text-on-primary ${opportunityBannerStyles[index % opportunityBannerStyles.length]}`}><span className="text-xs font-medium opacity-85">{item.mode} · {item.city}</span><span><strong className="line-clamp-2 block text-base font-semibold leading-6">{item.title}</strong><span className="mt-1 block truncate text-xs opacity-80">{company?.name}</span></span></Link>,
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
  const { identities, applications } = usePublicPlatform();
  const activeIdentity = identities.find(identity => identity.identityStatus === "active");
  const activeCompetition = guest ? undefined : competitionById(activeIdentity?.competitionId);
  const openOpportunityCount = opportunities.filter(item => item.status === "open").length;
  const taskEntries: HomeTaskEntry[] = [
    ...(activeCompetition ? [{
      id: "workshop",
      source: "创赛工坊",
      title: "继续赛事内任务",
      detail: `${activeCompetition.name} · 创赛工坊`,
      status: "赛事内",
      tone: "neutral" as const,
      to: `/competitions/${activeCompetition.id}/workspace/workshop`,
      icon: <Sparkles size={19} aria-hidden="true" />,
      iconClass: "bg-[#e9f6f1] text-[#247456]",
    }] : []),
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
    { label: "权益", description: "查看可领取的支持", to: "/benefits", icon: Gift },
    { label: "可信成果", description: "沉淀证书与成绩", to: "/assets", icon: Award },
    { label: "合作企业", description: "发现品牌与机会", to: "/companies", icon: Building2 },
  ];
  return <PublicShell><header className="flex items-center justify-between px-4 pb-4 pt-6"><div><div className="flex items-center gap-2"><p className="text-xs font-medium text-text-brand">核心产业学院</p>{guest && <span className="text-xs text-text-tertiary">未登录</span>}</div><h1 className="mt-1 text-xl font-semibold text-text-primary">{guest ? "你好，欢迎来看看" : "嗨，今天也一起向前"}</h1></div><button aria-label="消息通知" onClick={() => navigate(guest ? "/auth/login?returnTo=/me/notifications" : "/me/notifications")} className="relative flex size-11 items-center justify-center rounded-full bg-surface text-text-primary"><Bell size={21} aria-hidden="true" /><span className="absolute right-2 top-2 size-2 rounded-full bg-danger" /></button></header>
    {view !== "ready" ? <div className="px-4"><StateBlock state={view} /></div> : <div className="space-y-7 px-4">
      <section className="overflow-hidden rounded-[20px] bg-gradient-to-br from-primary to-[#7569ff] p-5 text-on-primary shadow-floating"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-xs font-medium opacity-80">{activeCompetition ? "我的赛事" : "正在报名"}</p><h2 className="mt-2 text-xl font-semibold leading-7">{activeCompetition?.name ?? competitions[0].name}</h2><p className="mt-2 text-sm opacity-85">{activeCompetition ? "赛事身份有效，继续推进你的参赛项目" : "发现适合你的赛事，开启一段新经历"}</p></div><span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white/15"><Trophy size={22} aria-hidden="true" /></span></div><div className="mt-5 flex gap-2">{activeCompetition ? <button className="min-h-touch flex-1 rounded-control bg-white px-4 text-sm font-semibold text-text-brand" onClick={() => navigate(`/competitions/${activeCompetition.id}/workspace`)}>进入当前赛事</button> : <button className="min-h-touch flex-1 rounded-control bg-white px-4 text-sm font-semibold text-text-brand" onClick={() => navigate("/competitions")}>发现比赛</button>}<button className="flex min-h-touch items-center justify-center rounded-control bg-white/15 px-4 text-sm font-medium" onClick={() => navigate("/competitions")}>全部赛事<ChevronRight size={16} aria-hidden="true" /></button></div></section>

      <section><div className="grid grid-cols-4 gap-2">{growthResources.map(({ label, to, icon: Icon }) => <button key={to} onClick={() => navigate(to)} className="flex min-h-20 flex-col items-center justify-center gap-2 rounded-container bg-surface text-center active:bg-surface-pressed"><span className="flex size-10 items-center justify-center rounded-[14px] bg-primary-container text-text-brand"><Icon size={20} aria-hidden="true" /></span><span className="text-xs font-medium text-text-primary">{label}</span></button>)}</div></section>

      <HomeTaskZone entries={taskEntries} />

      <Section title="为你推荐"><div className="grid grid-cols-2 gap-3"><button className="rounded-container bg-[#fff2e8] p-4 text-left" onClick={() => navigate("/competitions")}><span className="flex size-9 items-center justify-center rounded-full bg-white text-[#e66d20]"><Trophy size={18} aria-hidden="true" /></span><strong className="mt-4 block text-base text-text-primary">赛事推荐</strong><span className="mt-1 block text-xs text-text-secondary">正在报名的赛事</span></button><button className="rounded-container bg-[#eaf5ff] p-4 text-left" onClick={() => navigate("/opportunities")}><span className="flex size-9 items-center justify-center rounded-full bg-white text-[#2879d0]"><BriefcaseBusiness size={18} aria-hidden="true" /></span><strong className="mt-4 block text-base text-text-primary">实习与项目</strong><span className="mt-1 block text-xs text-text-secondary">找到真实实践机会</span></button></div></Section>

      <Section title="三创同学会" action={<Link to="/stories" className="text-sm font-medium text-text-brand">查看全部</Link>}>
        <Link to="/stories" className="block">
          <Card interactive className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-[14px] bg-[#fff2e8] text-[#c45b1b]"><Users size={20} aria-hidden="true" /></span>
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-text-primary">赛友风采与项目资源</h3>
              <p className="mt-1 text-sm leading-5 text-text-secondary">优秀团队、历届赛友、项目合作与赛事助力。</p>
              <div className="mt-3 flex flex-wrap gap-2"><StatusTag tone="neutral">赛友风采</StatusTag><StatusTag tone="info">创·项目</StatusTag><StatusTag tone="success">赛事助力</StatusTag></div>
            </div>
          </Card>
        </Link>
      </Section>

      {!guest && !activeCompetition && <Card className="border border-border-subtle"><h2 className="text-base font-semibold text-text-primary">还没有可用赛事工作区</h2><p className="mt-2 text-sm leading-5 text-text-secondary">公共赛事、机会和成长资源仍可正常使用。</p></Card>}
      {guest && <Card className="flex items-center justify-between gap-3 border border-border-subtle"><div><h2 className="text-sm font-semibold text-text-primary">登录后保存你的进度</h2><p className="mt-1 text-xs text-text-secondary">报名、投递与长期成果持续沉淀</p></div><SecondaryButton className="shrink-0" onClick={() => navigate("/auth/login?returnTo=/home")}>登录 / 注册</SecondaryButton></Card>}

      <Section title="热门赛事" action={<Link to="/competitions" className="text-sm font-medium text-text-brand">查看全部</Link>}><div className="flex snap-x gap-3 overflow-x-auto pb-1">{competitions.slice(0,2).map(item => { const [label, tone] = competitionStatus(item); return <Link to={`/competitions/${item.id}`} key={item.id} className="w-[82%] shrink-0 snap-start"><Card interactive className="h-full p-4"><StatusTag tone={tone}>{label}</StatusTag><h3 className="mt-3 line-clamp-2 text-base font-semibold leading-6 text-text-primary">{item.name}</h3><p className="mt-2 line-clamp-2 text-xs leading-5 text-text-secondary">{item.summary}</p></Card></Link>; })}</div></Section>

      <Section title="精选机会" action={<Link to="/opportunities" className="text-sm font-medium text-text-brand">查看全部</Link>}><div className="space-y-3">{opportunities.filter(item => item.status === "open").slice(0,2).map(item => <OpportunityCard item={item} key={item.id} />)}</div></Section>
      {!guest && <div className="flex justify-center pb-2"><AccountScenarioSwitch /></div>}
    </div>}<PrototypeStateTools />
    <Link to="/support/chat" aria-label="智能客服" className="fixed bottom-20 right-4 z-40 flex size-14 items-center justify-center rounded-full bg-primary text-on-primary shadow-floating transition active:scale-95"><MessageCircle size={26} aria-hidden="true" /></Link>
  </PublicShell>;
}

export function CompetitionsPage() {
  useListScroll("competitions");
  const { listView, updateListView } = usePublicPlatform();
  const view = usePrototypeView();
  const filtered = useMemo(() => competitions.filter(item => (listView.competitionStatus === "all" || item.status === listView.competitionStatus) && `${item.name}${item.organizer}${item.tags.join("")}`.toLowerCase().includes(listView.competitionKeyword.toLowerCase())), [listView.competitionKeyword, listView.competitionStatus]);
  return <PublicShell><PageHeader title="赛事" subtitle="公开赛事发现，不要求先拥有赛事身份" /><div className="space-y-6 px-4 py-5"><CompetitionCarousel /><MobileFilter query={listView.competitionKeyword} onQueryChange={competitionKeyword => updateListView({ competitionKeyword })} searchPlaceholder="搜索赛事名称、主办方或关键词" options={[{ value: "all", label: "全部" }, { value: "registrationOpen", label: "报名中" }, { value: "inProgress", label: "进行中" }, { value: "upcoming", label: "即将开放" }, { value: "ended", label: "已结束" }]} value={listView.competitionStatus} onValueChange={competitionStatus => updateListView({ competitionStatus })} defaultValue="all" filterAriaLabel="赛事筛选" resultCount={view === "ready" ? filtered.length : undefined} resultLabel="场赛事" />{view !== "ready" ? <StateBlock state={view} /> : filtered.length ? <div className="space-y-3">{filtered.map(item => <CompetitionCard key={item.id} item={item} />)}</div> : <StateBlock state="empty" />}</div><PrototypeStateTools /></PublicShell>;
}

export function OpportunitiesPage() {
  useListScroll("opportunities");
  const { listView, updateListView } = usePublicPlatform();
  const view = usePrototypeView();
  const filtered = useMemo(() => opportunities.filter(item => (listView.opportunityMode === "all" || item.mode === listView.opportunityMode) && `${item.title}${companyById(item.companyId)?.name}${item.city}`.toLowerCase().includes(listView.opportunityKeyword.toLowerCase())), [listView.opportunityKeyword, listView.opportunityMode]);
  return <PublicShell><PageHeader title="机会" subtitle="实习、校招与企业项目实践" /><div className="space-y-5 px-4 py-5"><OpportunityCarousel /><MobileFilter query={listView.opportunityKeyword} onQueryChange={opportunityKeyword => updateListView({ opportunityKeyword })} searchPlaceholder="搜索岗位、企业或城市" options={[{ value: "all", label: "全部" }, { value: "实习", label: "实习" }, { value: "校招", label: "校招" }, { value: "项目实践", label: "项目实践" }]} value={listView.opportunityMode} onValueChange={opportunityMode => updateListView({ opportunityMode })} defaultValue="all" filterAriaLabel="机会筛选" resultCount={view === "ready" ? filtered.length : undefined} resultLabel="个机会" />{view !== "ready" ? <StateBlock state={view} /> : filtered.length ? <div className="space-y-3">{filtered.map(item => <OpportunityCard key={item.id} item={item} />)}</div> : <StateBlock state="empty" />}<Link to="/companies" className="block min-h-touch rounded-control bg-surface px-4 py-3 text-center text-sm font-medium text-text-brand">浏览合作企业</Link></div><PrototypeStateTools /></PublicShell>;
}

export function OpportunityDetailPage() {
  const navigate = useNavigate();
  const guest = useGuest();
  const { opportunityId } = useParams();
  const item = opportunityById(opportunityId);
  const { applications, submitApplication } = usePublicPlatform();
  const [resumeCheck, setResumeCheck] = useState(false);
  if (!item) return <PublicShell showNavigation={false}><PageHeader title="机会不存在" backTo="/opportunities" /><div className="px-4 py-6"><StateBlock state="error" /></div></PublicShell>;
  const company = companyById(item.companyId);
  const applied = applications.some(record => record.opportunityId === item.id);
  const apply = () => { submitApplication(item.id); navigate("/applications"); };
  return <PublicShell showNavigation={false}><PageHeader title="机会详情" backTo="/opportunities" /><ViewGate><div className="space-y-6 px-4 py-5"><div><StatusTag tone={item.status === "open" ? "success" : "neutral"}>{item.status === "open" ? item.mode : "已结束"}</StatusTag><h1 className="mt-3 text-2xl font-semibold text-text-primary">{item.title}</h1><button className="mt-2 min-h-touch text-left text-sm font-medium text-text-brand" onClick={() => navigate(`/companies/${item.companyId}?from=${encodeURIComponent(`/opportunities/${item.id}`)}`)}>{company?.name} · 查看企业</button><p className="mt-3 text-base leading-6 text-text-secondary">{item.summary}</p></div><Section title="岗位信息"><Card><p className="text-sm text-text-secondary">工作地点</p><p className="mt-1 font-medium text-text-primary">{item.city}</p><div className="mt-4 flex flex-wrap gap-2">{item.skills.map(skill => <StatusTag key={skill} tone="neutral">{skill}</StatusTag>)}</div></Card></Section>{resumeCheck && item.status === "open" && !applied && <Card className="border border-info bg-info-bg"><h2 className="font-semibold text-info-text">投递前检查长期简历</h2><p className="mt-2 text-sm leading-5 text-info-text">使用长期账号中的可信经历与学生自己维护的简历表达。</p><div className="mt-4 flex gap-2"><SecondaryButton className="flex-1" onClick={() => navigate(`/me/resume?returnTo=${encodeURIComponent(`/opportunities/${item.id}`)}`)}>查看长期简历</SecondaryButton><Button className="flex-1" onClick={apply}>确认投递</Button></div></Card>}<div>{item.status === "closed" ? <Button className="w-full" disabled>机会已结束</Button> : applied ? <Button className="w-full" disabled>已投递</Button> : guest ? <Button className="w-full" onClick={() => navigate(`/auth/login?returnTo=${encodeURIComponent(`/opportunities/${item.id}`)}`)}>登录后投递</Button> : <Button className="w-full" onClick={() => setResumeCheck(true)}>使用长期简历投递</Button>}</div></div></ViewGate><PrototypeStateTools /></PublicShell>;
}

export function CompaniesPage() {
  useListScroll("companies");
  const { listView, updateListView } = usePublicPlatform();
  const view = usePrototypeView();
  const filtered = companies.filter(item => `${item.name}${item.industry}${item.summary}`.toLowerCase().includes(listView.companyKeyword.toLowerCase()));
  return <PublicShell><PageHeader title="企业" subtitle="资源、品牌与机会合作方" backTo="/opportunities" /><div className="space-y-4 px-4 py-5"><input value={listView.companyKeyword} onChange={event => updateListView({ companyKeyword: event.target.value })} placeholder="搜索企业或行业" className="min-h-touch w-full rounded-control border border-border bg-surface px-3 text-sm outline-none focus:border-primary" />{view !== "ready" ? <StateBlock state={view} /> : filtered.length ? filtered.map(item => <Link key={item.id} to={`/companies/${item.id}`} className="block"><Card interactive><h2 className="text-base font-semibold text-text-primary">{item.name}</h2><p className="mt-1 text-sm text-text-brand">{item.industry}</p><p className="mt-3 text-sm leading-5 text-text-secondary">{item.summary}</p><p className="mt-3 text-xs text-text-tertiary">关联 {item.resourceRelations.length} 项赛事 / 权益 / 课程 / 活动 / 岗位资源</p></Card></Link>) : <StateBlock state="empty" />}</div><PrototypeStateTools /></PublicShell>;
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

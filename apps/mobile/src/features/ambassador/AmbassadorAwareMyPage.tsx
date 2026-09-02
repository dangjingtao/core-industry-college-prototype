import { useMemo, useState } from "react";
import {
  Award,
  Bell,
  BookOpen,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  FileText,
  GraduationCap,
  Headphones,
  Info,
  KeyRound,
  Link2,
  LogOut,
  QrCode,
  ScanLine,
  Settings,
  ShieldCheck,
  Trophy,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ambassadorCampaignStatus, isAmbassadorCodeActive, useAmbassadorState } from "@core/shared";
import { Button, ConfirmDialog, Dialog, PublicShell } from "../../components/ui";
import { useLongTermAssets } from "../long-term-assets/store";
import { competitionExperienceOptions, educationLevelOptions, labelFor } from "../long-term-assets/studentProfile";
import { usePublicPlatform } from "../public-platform/PublicPlatform";

const SCHOOL_LABELS: Record<string, string> = {
  "org-huanan-commerce-college": "华南商贸职业学院",
  "org-gdtc": "广东技术职业学院",
};

const SIMULATION_ACCOUNTS = [
  { id: "account-demo", label: "当前账号" },
  { id: "partner-1", label: "模拟校园推荐官 1" },
  { id: "partner-2", label: "模拟校园推荐官 2" },
  { id: "partner-3", label: "模拟校园推荐官 3" },
  { id: "partner-4", label: "模拟校园推荐官 4" },
];

type DashboardEntry = {
  label: string;
  to: string;
  icon: LucideIcon;
  state?: Record<string, string>;
};

function schoolLabel(id: string) {
  return SCHOOL_LABELS[id] ?? "参与学校";
}

function ShortcutGrid({ entries, testId, emphasized = false }: { entries: DashboardEntry[]; testId: string; emphasized?: boolean }) {
  return <div data-testid={testId} className="grid grid-cols-4 gap-x-2 gap-y-4">
    {entries.map(({ label, to, icon: Icon, state }) => <Link
      key={`${label}-${to}`}
      to={to}
      state={state}
      className="group flex min-w-0 flex-col items-center gap-2 rounded-control px-1 py-2 text-center transition active:bg-surface-pressed"
    >
      <span className={`grid size-11 shrink-0 place-items-center rounded-control ${emphasized ? "bg-primary-container text-text-brand" : "bg-surface-subtle text-text-primary"}`}>
        <Icon size={22} strokeWidth={1.8} aria-hidden="true" />
      </span>
      <span className="w-full text-xs font-medium leading-5 text-text-primary">{label}</span>
    </Link>)}
  </div>;
}

export function AmbassadorAwareMyPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { session, continueAsGuest } = usePublicPlatform();
  const { profile, simulateScanRedeem } = useLongTermAssets();
  const ambassador = useAmbassadorState();
  const accountId = new URLSearchParams(location.search).get("accountId") || "account-demo";
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanAccountId, setScanAccountId] = useState(accountId);
  const competitionTag = profile.competitionExperience ? labelFor(competitionExperienceOptions, profile.competitionExperience) : "";
  const educationTag = profile.educationLevel ? labelFor(educationLevelOptions, profile.educationLevel) : "";

  const memberTeams = useMemo(() => ambassador.teams.filter(team => team.members.some(member => member.accountId === accountId && member.status === "active")), [ambassador.teams, accountId]);
  const currentTeam = useMemo(() => {
    const active = memberTeams.find(team => {
      const campaign = ambassador.campaigns.find(item => item.id === team.campaignId);
      return campaign && ambassadorCampaignStatus(campaign) === "active";
    });
    if (active) return active;
    const upcoming = memberTeams.find(team => {
      const campaign = ambassador.campaigns.find(item => item.id === team.campaignId);
      return campaign && ambassadorCampaignStatus(campaign) === "upcoming";
    });
    if (upcoming) return upcoming;
    return [...memberTeams].sort((left, right) => {
      const leftCampaign = ambassador.campaigns.find(item => item.id === left.campaignId);
      const rightCampaign = ambassador.campaigns.find(item => item.id === right.campaignId);
      return Date.parse(rightCampaign?.endsAt || "") - Date.parse(leftCampaign?.endsAt || "");
    })[0];
  }, [ambassador.campaigns, memberTeams]);
  const currentCampaign = currentTeam && ambassador.campaigns.find(item => item.id === currentTeam.campaignId);
  const currentCampaignStatus = currentCampaign ? ambassadorCampaignStatus(currentCampaign) : undefined;
  const currentMember = currentTeam?.members.find(member => member.accountId === accountId && member.status === "active");
  const schoolScans = ambassador.schoolRecruitmentCodes.filter(code => {
    const campaign = ambassador.campaigns.find(item => item.id === code.campaignId);
    return campaign && isAmbassadorCodeActive(code, campaign);
  });
  const teamScans = ambassador.teamRecruitmentCodes.filter(code => {
    const campaign = ambassador.campaigns.find(item => item.id === code.campaignId);
    return campaign && isAmbassadorCodeActive(code, campaign);
  });
  const promotionScans = ambassador.promotionCodes.filter(code => {
    const campaign = ambassador.campaigns.find(item => item.id === code.campaignId);
    return campaign && isAmbassadorCodeActive(code, campaign);
  });

  if (!session.loggedIn) return <PublicShell showNavigation={true}>
    <div className="px-4 pb-8 pt-8">
      <div className="rounded-container border border-border-subtle bg-surface px-5 py-8 text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-primary-container text-text-brand"><BriefcaseBusiness size={26} aria-hidden="true" /></span>
        <h1 className="mt-4 text-lg font-semibold text-text-primary">登录后查看我的长期账号</h1>
        <p className="mt-2 text-sm leading-6 text-text-secondary">赛事经历、课程成果、证书、投递和简历都会归到同一个账号。</p>
        <Button className="mt-5 w-full" onClick={() => navigate("/auth/login?returnTo=/me")}>登录后继续</Button>
      </div>
    </div>
  </PublicShell>;

  const logout = () => {
    continueAsGuest();
    navigate("/auth/login", { replace: true });
  };

  const learningEntries: DashboardEntry[] = [
    { label: "我的课程", to: "/courses/center", icon: BookOpen },
    { label: "学习记录", to: "/assets/learning", icon: GraduationCap },
    { label: "我的证书", to: "/assets/certificates", icon: Award },
    { label: "赛事成绩", to: "/assets/results", icon: Trophy },
  ];

  const serviceEntries: DashboardEntry[] = [
    { label: "长期资产", to: "/assets", icon: BriefcaseBusiness },
    { label: "我的卡券", to: "/benefits/wallet", icon: Wallet },
    { label: "消息通知", to: "/me/notifications", icon: Bell, state: { from: "/me" } },
    { label: "比赛团队", to: "/me/teams", icon: Users },
    { label: "我的简历", to: "/me/resume", icon: FileText },
    { label: "账号绑定", to: "/me/accounts", icon: Link2 },
    { label: "帮助客服", to: "/support", icon: Headphones },
    { label: "设置中心", to: "/me/settings", icon: Settings },
    { label: "授权管理", to: "/me/authorization", icon: KeyRound },
    { label: "用户协议", to: "/legal/user-agreement", icon: FileText },
    { label: "隐私政策", to: "/legal/privacy", icon: ShieldCheck },
    { label: "关于我们", to: "/about", icon: Info },
  ];

  const scanSchool = (campaignId: string, schoolId: string) => {
    setScannerOpen(false);
    navigate(`/ambassadors/apply?campaignId=${encodeURIComponent(campaignId)}&schoolId=${encodeURIComponent(schoolId)}&accountId=${encodeURIComponent(scanAccountId)}`);
  };
  const scanTeam = (code: string) => {
    setScannerOpen(false);
    navigate(`/ambassadors/join?code=${encodeURIComponent(code)}&accountId=${encodeURIComponent(scanAccountId)}`);
  };
  const scanPromotion = (code: string) => {
    setScannerOpen(false);
    navigate(`/ambassadors/promote/${encodeURIComponent(code)}?accountId=${encodeURIComponent(scanAccountId)}`);
  };
  const scanWelfare = () => {
    const result = simulateScanRedeem();
    if (!result) return;
    setScannerOpen(false);
    navigate(`/redeem/result?code=${encodeURIComponent(result.code)}`);
  };

  return <PublicShell showNavigation={true}>
    <main className="space-y-5 px-4 pb-8 pt-6" data-testid="t059-my-dashboard">
      <section className="relative min-h-[112px]" aria-label="个人资料">
        <div className="absolute right-0 top-0 z-10 flex items-center gap-1">
          <button
            type="button"
            aria-label="扫一扫"
            onClick={() => { setScanAccountId(accountId); setScannerOpen(true); }}
            className="grid min-h-touch min-w-11 place-items-center rounded-control text-text-primary transition active:bg-surface-pressed"
          >
            <ScanLine size={23} aria-hidden="true" />
          </button>
          <Link
            to="/me/settings"
            aria-label="设置"
            className="grid min-h-touch min-w-11 place-items-center rounded-control text-text-primary transition active:bg-surface-pressed"
          >
            <Settings size={23} aria-hidden="true" />
          </Link>
        </div>

        <Link to="/me/profile" className="flex min-w-0 items-start gap-3 pr-[92px]">
          <span className="grid size-[72px] shrink-0 place-items-center rounded-full bg-primary-container text-2xl font-semibold text-text-brand">
            {profile.nickname.slice(0, 1) || profile.name.slice(0, 1)}
          </span>
          <span className="min-w-0 flex-1 pt-1">
            <span className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1">
              <strong className="truncate text-2xl font-semibold tracking-tight text-text-primary">{profile.name}</strong>
              {profile.phoneVerified === "verified" && <Check size={17} className="shrink-0 text-text-brand" aria-label="手机号已验证" />}
              {currentCampaignStatus !== "ended" && currentMember?.role === "ambassador" && <span data-testid="core-ambassador-badge" className="inline-flex min-h-6 items-center gap-1 rounded-full bg-primary-container px-2 text-xs font-medium text-text-brand"><ShieldCheck size={13} aria-hidden="true" />校园大使</span>}
              <ChevronRight size={18} className="shrink-0 text-text-tertiary" aria-hidden="true" />
            </span>
            <span className="mt-2 block truncate text-sm text-text-secondary">{profile.school} · {profile.major}</span>
          </span>
        </Link>

        <div className="mt-3 flex flex-wrap items-center gap-2 pl-[84px]">
          {educationTag && <span className="rounded-full bg-surface-subtle px-2.5 py-1 text-xs text-text-secondary">{educationTag}</span>}
          {competitionTag && <span className="rounded-full bg-surface-subtle px-2.5 py-1 text-xs text-text-secondary">{competitionTag}</span>}
          {profile.city && <span className="rounded-full bg-surface-subtle px-2.5 py-1 text-xs text-text-secondary">{profile.city}</span>}
        </div>
      </section>

      <section data-testid="reading-center-entry" className="overflow-hidden rounded-container bg-gradient-to-br from-primary to-primary-pressed p-5 text-on-primary">
        <div className="flex items-center gap-4">
          <span className="grid size-14 shrink-0 place-items-center rounded-full bg-surface text-text-brand">
            <BookOpen size={28} strokeWidth={1.8} aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-semibold">阅读中心</h2>
            <p className="mt-1 text-sm leading-5">读万卷书，行万里路</p>
            <span className="mt-2 inline-flex rounded-full border border-surface px-2 py-0.5 text-xs font-medium">功能接入中</span>
          </div>
          <button
            type="button"
            disabled
            aria-label="进入阅读，阅读功能待接入"
            className="inline-flex min-h-touch shrink-0 items-center gap-1 rounded-full bg-surface px-3 text-sm font-semibold text-text-brand disabled:cursor-not-allowed"
          >
            进入阅读 <ChevronRight size={17} aria-hidden="true" />
          </button>
        </div>
      </section>

      <section className="rounded-container border border-border-subtle bg-surface p-4" aria-labelledby="my-learning-title">
        <h2 id="my-learning-title" className="text-lg font-semibold text-text-primary">我的学习</h2>
        <div className="mt-3">
          <ShortcutGrid entries={learningEntries} testId="my-learning-grid" emphasized />
        </div>

        <Link
          to="/courses/leaderboard"
          data-testid="learning-leaderboard-entry"
          className="mt-4 flex min-h-[96px] items-center gap-4 rounded-container bg-primary-container px-4 py-3 transition active:bg-surface-pressed"
        >
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-semibold text-text-primary">学习排行榜</h3>
              <span className="rounded-full bg-surface px-2 py-1 text-xs font-medium text-text-brand">周榜</span>
            </div>
            <p className="mt-1 text-sm leading-5 text-text-secondary">看看你在校园学习榜上排第几</p>
            <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-text-brand">查看榜单 <ChevronRight size={16} aria-hidden="true" /></span>
          </div>
          <span className="grid size-14 shrink-0 place-items-center rounded-full bg-surface text-text-brand"><Trophy size={28} aria-hidden="true" /></span>
        </Link>
      </section>

      <section className="rounded-container border border-border-subtle bg-surface p-4" aria-labelledby="more-services-title">
        <h2 id="more-services-title" className="text-lg font-semibold text-text-primary">更多服务</h2>

        {currentTeam && <Link
          to={`/ambassadors/team/${encodeURIComponent(currentTeam.id)}?accountId=${encodeURIComponent(accountId)}`}
          data-testid="ambassador-team-entry"
          className="mt-3 flex min-h-touch items-center gap-3 rounded-container bg-primary-container px-3 py-3 transition active:bg-surface-pressed"
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-surface text-text-brand"><Users size={20} aria-hidden="true" /></span>
          <span className="min-w-0 flex-1">
            <strong className="block truncate text-sm font-semibold text-text-primary">{currentCampaignStatus === "ended" ? "往期推广记录" : "我的校园推广团队"}</strong>
            <span className="mt-0.5 block truncate text-xs text-text-secondary">{currentCampaign?.name ?? "校园大使活动"}</span>
          </span>
          <ChevronRight size={18} className="shrink-0 text-text-brand" aria-hidden="true" />
        </Link>}

        <div className="mt-3">
          <ShortcutGrid entries={serviceEntries} testId="more-services-grid" />
        </div>
      </section>

      <section className="rounded-container border border-border-subtle bg-surface px-4 py-4" aria-label="账号操作">
        <p className="text-xs leading-5 text-text-tertiary">退出后仍可浏览公共平台；简历、赛事经历、课程、证书和其它长期账号资产不会删除。</p>
        <button
          type="button"
          onClick={() => setConfirmLogout(true)}
          className="mt-2 inline-flex min-h-touch items-center gap-2 rounded-control px-2 text-sm font-medium text-text-secondary transition active:bg-surface-pressed"
        >
          <LogOut size={17} aria-hidden="true" />退出登录
        </button>
      </section>
    </main>

    <Dialog open={scannerOpen} onOpenChange={setScannerOpen} title="扫一扫 · 原型模拟" description="正式 App 由摄像头识别码型；这里用于连续验收不同学生扫码。" size="sm">
      <div className="space-y-5" data-testid="ambassador-scan-simulator">
        <div><label className="text-sm font-medium text-text-primary" htmlFor="scan-account">模拟扫码身份</label><select id="scan-account" aria-label="模拟扫码身份" value={scanAccountId} onChange={event => setScanAccountId(event.target.value)} className="mt-2 min-h-touch w-full rounded-control border border-border bg-surface px-3 text-sm">{SIMULATION_ACCOUNTS.map(item => <option key={item.id} value={item.id}>{item.label}{item.id === "account-demo" ? ` · ${profile.name}` : ""}</option>)}</select><p className="mt-1 text-xs text-text-tertiary">仅用于中保真验收，不是正式用户功能。</p></div>
        <div><h3 className="text-sm font-semibold text-text-primary">学校招募码</h3><div className="mt-2 space-y-2">{schoolScans.map(code => { const campaign = ambassador.campaigns.find(item => item.id === code.campaignId)!; return <button key={code.id} type="button" onClick={() => scanSchool(code.campaignId, code.schoolId)} className="flex min-h-touch w-full items-center gap-3 rounded-control bg-surface-subtle px-3 text-left active:bg-surface-pressed"><QrCode size={18} className="shrink-0 text-text-brand" /><span className="min-w-0"><strong className="block truncate text-sm text-text-primary">{schoolLabel(code.schoolId)}</strong><span className="block truncate text-xs text-text-secondary">{campaign.name} · 申请校园大使</span></span></button>; })}</div></div>
        <div><h3 className="text-sm font-semibold text-text-primary">团队招募码</h3><div className="mt-2 space-y-2">{teamScans.length ? teamScans.map(code => { const campaign = ambassador.campaigns.find(item => item.id === code.campaignId)!; const team = ambassador.teams.find(item => item.id === code.teamId); const inviter = team?.members.find(member => member.role === "ambassador")?.application?.__applicantName || "校园大使"; return <button key={code.id} type="button" onClick={() => scanTeam(code.code)} className="flex min-h-touch w-full items-center gap-3 rounded-control bg-surface-subtle px-3 text-left active:bg-surface-pressed"><Users size={18} className="shrink-0 text-text-brand" /><span className="min-w-0"><strong className="block truncate text-sm text-text-primary">{inviter} 的推广团队</strong><span className="block truncate text-xs text-text-secondary">{campaign.name} · 加入校园推荐官</span></span></button>; }) : <p className="text-xs text-text-tertiary">当前没有可用团队招募码。</p>}</div></div>
        {promotionScans.length > 0 && <div><h3 className="text-sm font-semibold text-text-primary">专属推广码</h3><div className="mt-2 space-y-2">{promotionScans.slice(0, 4).map(code => <button key={code.id} type="button" onClick={() => scanPromotion(code.code)} className="flex min-h-touch w-full items-center gap-3 rounded-control bg-surface-subtle px-3 text-left active:bg-surface-pressed"><QrCode size={18} className="shrink-0 text-text-brand" /><span className="text-sm text-text-primary">模拟扫码进入新用户推广链路</span></button>)}</div></div>}
        <div><h3 className="text-sm font-semibold text-text-primary">福利 / 兑换码</h3><button type="button" onClick={scanWelfare} className="mt-2 flex min-h-touch w-full items-center gap-3 rounded-control bg-surface-subtle px-3 text-left active:bg-surface-pressed"><ScanLine size={18} className="shrink-0 text-text-brand" /><span className="min-w-0"><strong className="block text-sm text-text-primary">模拟扫描福利兑换码</strong><span className="block text-xs text-text-secondary">保留原有兑换码扫码链路</span></span></button></div>
      </div>
    </Dialog>
    <ConfirmDialog open={confirmLogout} title="退出登录" description="只会清除当前登录 session。简历、赛事经历、课程、证书和其它长期账号资产不会删除。退出后仍可浏览公共平台。" cancelText="取消" confirmText="确认退出" onCancel={() => setConfirmLogout(false)} onConfirm={logout} />
  </PublicShell>;
}

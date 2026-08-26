import { useMemo, useState } from "react";
import { Bell, BriefcaseBusiness, Check, ChevronRight, FileText, Headphones, Info, Link2, PenLine, QrCode, ScanLine, Settings, ShieldCheck, Users, Wallet } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ambassadorCampaignStatus, isAmbassadorCodeActive, useAmbassadorState } from "@core/shared";
import { Button, Card, ConfirmDialog, Dialog, PageHeader, PublicShell, SecondaryButton, Section } from "../../components/ui";
import { useLongTermAssets } from "../long-term-assets/store";
import { competitionExperienceOptions, educationLevelOptions, labelFor } from "../long-term-assets/studentProfile";
import { usePublicPlatform } from "../public-platform/PublicPlatform";

const SCHOOL_LABELS: Record<string, string> = {
  "org-huanan-commerce-college": "华南商贸职业学院",
  "org-gdtc": "广东技术职业学院",
};

const SIMULATION_ACCOUNTS = [
  { id: "account-demo", label: "当前账号" },
  { id: "partner-1", label: "模拟推广伙伴 1" },
  { id: "partner-2", label: "模拟推广伙伴 2" },
  { id: "partner-3", label: "模拟推广伙伴 3" },
  { id: "partner-4", label: "模拟推广伙伴 4" },
];

function schoolLabel(id: string) {
  return SCHOOL_LABELS[id] ?? "参与学校";
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

  if (!session.loggedIn) return <PublicShell showNavigation={true}><PageHeader title="我的" /><div className="space-y-4 px-4 py-6"><Card><h2 className="font-semibold text-text-primary">登录后查看长期账号资产</h2><p className="mt-2 text-sm text-text-secondary">赛事经历、课程成果、证书、投递和简历都归长期账号保存。</p></Card><Button className="w-full" onClick={() => navigate("/auth/login?returnTo=/me")}>登录</Button></div></PublicShell>;

  const logout = () => {
    continueAsGuest();
    navigate("/auth/login", { replace: true });
  };
  const serviceEntries = [
    { label: "长期资产", to: "/assets", icon: BriefcaseBusiness },
    { label: "我的卡券", to: "/benefits/wallet", icon: Wallet },
    { label: "消息通知", to: "/me/notifications", icon: Bell, state: { from: "/me" } },
    ...(currentTeam ? [{ label: currentCampaignStatus === "ended" ? "往期推广记录" : "我的团队", to: `/ambassadors/team/${encodeURIComponent(currentTeam.id)}?accountId=${encodeURIComponent(accountId)}`, icon: Users }] : []),
    { label: "比赛团队", to: "/me/teams", icon: Users },
    { label: "账号绑定", to: "/me/accounts", icon: Link2 },
    { label: "设置中心", to: "/me/settings", icon: Settings },
    { label: "帮助与客服", to: "/support", icon: Headphones },
  ];
  const aboutEntries = [
    { label: "用户协议", to: "/legal/user-agreement", icon: FileText },
    { label: "隐私政策", to: "/legal/privacy", icon: ShieldCheck },
    { label: "关于", to: "/about", icon: Info },
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

  return <PublicShell showNavigation={true}><PageHeader title="我的" subtitle="长期账号资产，不随单场赛事结束" /><div className="space-y-7 px-4 py-5">
    <Card className="overflow-hidden"><div aria-hidden="true" className="h-20 bg-gradient-to-br from-primary to-primary-pressed" /><div className="-mt-10 px-4 pb-4"><div className="flex items-end justify-between"><span className="flex size-20 items-center justify-center rounded-full bg-primary-container text-2xl font-semibold text-text-brand ring-4 ring-surface">{profile.nickname.slice(0, 1) || profile.name.slice(0, 1)}</span><div className="flex flex-col items-end gap-2">{competitionTag && <span className="rounded-full bg-surface-subtle px-2.5 py-1 text-xs font-medium text-text-secondary">{competitionTag}</span>}<button type="button" aria-label="扫一扫" onClick={() => { setScanAccountId(accountId); setScannerOpen(true); }} className="flex min-h-touch min-w-11 items-center justify-center rounded-control text-text-primary transition active:bg-surface-pressed"><ScanLine size={22} aria-hidden="true" /></button></div></div><div className="mt-3 flex flex-wrap items-center gap-1.5"><h1 className="text-xl font-semibold text-text-primary">{profile.name}</h1>{profile.phoneVerified === "verified" && <Check size={16} className="shrink-0 text-text-brand" aria-hidden="true" />}{currentCampaignStatus !== "ended" && currentMember?.role === "ambassador" && <span data-testid="core-ambassador-badge" className="ml-1 inline-flex min-h-6 items-center gap-1 rounded-full bg-surface-subtle px-2 text-xs font-medium text-text-secondary"><ShieldCheck size={13} />核心大使</span>}</div><p className="mt-1 text-sm text-text-secondary">{profile.school} · {profile.major}</p><div className="mt-3 flex flex-wrap gap-2">{profile.city && <span className="rounded-full bg-surface-subtle px-2.5 py-1 text-xs text-text-secondary">{profile.city}</span>}{educationTag && <span className="rounded-full bg-surface-subtle px-2.5 py-1 text-xs text-text-secondary">{educationTag}</span>}</div><p className="mt-3 text-xs text-text-tertiary">{profile.email}</p></div><Link to="/me/profile" className="flex min-h-touch items-center gap-3 border-t border-border-subtle px-4 active:bg-surface-pressed"><PenLine size={16} className="shrink-0 text-text-secondary" aria-hidden="true" /><span className="flex-1 text-sm font-medium text-text-primary">编辑基础资料</span><ChevronRight size={18} className="shrink-0 text-text-tertiary" aria-hidden="true" /></Link></Card>
    <Section title="服务入口"><div className="overflow-hidden rounded-container bg-surface">{serviceEntries.map(({ label, to, icon: Icon, state }, index) => <Link key={`${label}-${to}`} to={to} state={state} className={`flex min-h-16 items-center gap-3 px-4 py-3 active:bg-surface-pressed ${index ? "border-t border-border-subtle" : ""}`}><span className="flex size-9 shrink-0 items-center justify-center rounded-control bg-primary-container text-text-brand"><Icon size={18} aria-hidden="true" /></span><span className="min-w-0 flex-1"><strong className="block text-sm font-medium text-text-primary">{label}</strong></span><ChevronRight size={18} className="shrink-0 text-text-tertiary" aria-hidden="true" /></Link>)}</div></Section>
    <Section title="关于与协议"><div className="overflow-hidden rounded-container bg-surface">{aboutEntries.map(({ label, to, icon: Icon }, index) => <Link key={to} to={to} className={`flex min-h-touch items-center gap-3 px-4 active:bg-surface-pressed ${index ? "border-t border-border-subtle" : ""}`}><Icon size={18} className="shrink-0 text-text-secondary" aria-hidden="true" /><span className="flex-1 text-sm font-medium text-text-primary">{label}</span><ChevronRight size={18} className="shrink-0 text-text-tertiary" aria-hidden="true" /></Link>)}</div></Section>
    <Section title="账号"><Card><h2 className="font-semibold text-text-primary">当前登录会话</h2><p className="mt-2 text-sm text-text-secondary">退出后仍可浏览公共平台；本地 session 会被清除，简历、赛事经历、课程和证书等长期资产不会删除。</p><SecondaryButton className="mt-4 w-full" onClick={() => setConfirmLogout(true)}>退出登录</SecondaryButton></Card></Section>
  </div>
  <Dialog open={scannerOpen} onOpenChange={setScannerOpen} title="扫一扫 · 原型模拟" description="正式 App 由摄像头识别码型；这里用于连续验收不同学生扫码。" size="sm">
    <div className="space-y-5" data-testid="ambassador-scan-simulator">
      <div><label className="text-sm font-medium text-text-primary" htmlFor="scan-account">模拟扫码身份</label><select id="scan-account" aria-label="模拟扫码身份" value={scanAccountId} onChange={event => setScanAccountId(event.target.value)} className="mt-2 min-h-touch w-full rounded-control border border-border bg-surface px-3 text-sm">{SIMULATION_ACCOUNTS.map(item => <option key={item.id} value={item.id}>{item.label}{item.id === "account-demo" ? ` · ${profile.name}` : ""}</option>)}</select><p className="mt-1 text-xs text-text-tertiary">仅用于中保真验收，不是正式用户功能。</p></div>
      <div><h3 className="text-sm font-semibold text-text-primary">学校招募码</h3><div className="mt-2 space-y-2">{schoolScans.map(code => { const campaign = ambassador.campaigns.find(item => item.id === code.campaignId)!; return <button key={code.id} type="button" onClick={() => scanSchool(code.campaignId, code.schoolId)} className="flex min-h-touch w-full items-center gap-3 rounded-control bg-surface-subtle px-3 text-left active:bg-surface-pressed"><QrCode size={18} className="shrink-0 text-text-brand" /><span className="min-w-0"><strong className="block truncate text-sm text-text-primary">{schoolLabel(code.schoolId)}</strong><span className="block truncate text-xs text-text-secondary">{campaign.name} · 申请核心大使</span></span></button>; })}</div></div>
      <div><h3 className="text-sm font-semibold text-text-primary">团队招募码</h3><div className="mt-2 space-y-2">{teamScans.length ? teamScans.map(code => { const campaign = ambassador.campaigns.find(item => item.id === code.campaignId)!; const team = ambassador.teams.find(item => item.id === code.teamId); const inviter = team?.members.find(member => member.role === "ambassador")?.application?.__applicantName || "核心大使"; return <button key={code.id} type="button" onClick={() => scanTeam(code.code)} className="flex min-h-touch w-full items-center gap-3 rounded-control bg-surface-subtle px-3 text-left active:bg-surface-pressed"><Users size={18} className="shrink-0 text-text-brand" /><span className="min-w-0"><strong className="block truncate text-sm text-text-primary">{inviter} 的推广团队</strong><span className="block truncate text-xs text-text-secondary">{campaign.name} · 加入推广伙伴</span></span></button>; }) : <p className="text-xs text-text-tertiary">当前没有可用团队招募码。</p>}</div></div>
      {promotionScans.length > 0 && <div><h3 className="text-sm font-semibold text-text-primary">专属推广码</h3><div className="mt-2 space-y-2">{promotionScans.slice(0, 4).map(code => <button key={code.id} type="button" onClick={() => scanPromotion(code.code)} className="flex min-h-touch w-full items-center gap-3 rounded-control bg-surface-subtle px-3 text-left active:bg-surface-pressed"><QrCode size={18} className="shrink-0 text-text-brand" /><span className="text-sm text-text-primary">模拟扫码进入新用户推广链路</span></button>)}</div></div>}
      <div><h3 className="text-sm font-semibold text-text-primary">福利 / 兑换码</h3><button type="button" onClick={scanWelfare} className="mt-2 flex min-h-touch w-full items-center gap-3 rounded-control bg-surface-subtle px-3 text-left active:bg-surface-pressed"><ScanLine size={18} className="shrink-0 text-text-brand" /><span className="min-w-0"><strong className="block text-sm text-text-primary">模拟扫描福利兑换码</strong><span className="block text-xs text-text-secondary">保留原有兑换码扫码链路</span></span></button></div>
    </div>
  </Dialog>
  <ConfirmDialog open={confirmLogout} title="退出登录" description="只会清除当前登录 session。简历、赛事经历、课程、证书和其它长期账号资产不会删除。退出后仍可浏览公共平台。" cancelText="取消" confirmText="确认退出" onCancel={() => setConfirmLogout(false)} onConfirm={logout} /></PublicShell>;
}

import { useMemo } from "react";
import { Award, Bell, BookOpen, BriefcaseBusiness, Building2, ClipboardList, Coins, FileUser, Flag, FolderCheck, Gift, Headphones, HeartHandshake, Link2, Newspaper, QrCode, RefreshCw, ShieldCheck, Sparkles, Store, Users, Wallet, type LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, PageHeader, PublicShell, Section, StatusTag } from "../../components/ui";
import { competitionById } from "../public-platform/data";
import { usePublicPlatform } from "../public-platform/PublicPlatform";

type AppEntry = {
  label: string;
  to: string;
  icon: LucideIcon;
  description: string;
  accent?: string;
  badge?: string;
};

type AppGroup = {
  title: string;
  subtitle: string;
  accent: string;
  entries: AppEntry[];
};

const groups: AppGroup[] = [
  {
    title: "学习成长",
    subtitle: "课程、学力值与可信空间",
    accent: "bg-[#eaf5ff] text-[#2879d0]",
    entries: [
      { label: "课程学习", to: "/courses", icon: BookOpen, description: "平台课程与学习记录" },
      { label: "学力值", to: "/growth/score", icon: Coins, description: "学力值余额与明细" },
      { label: "徽章墙", to: "/me/badges", icon: Award, description: "长期成就与可信能力证据" },
      { label: "可信空间", to: "/assets", icon: FolderCheck, description: "经历、成绩与证书" },
      { label: "个人成长档案", to: "/me/resume", icon: FileUser, description: "长期简历与可信经历" },
    ],
  },
  {
    title: "福利权益",
    subtitle: "福利、卡券与兑换",
    accent: "bg-[#fff7df] text-[#946218]",
    entries: [
      { label: "创赛福利", to: "/benefits", icon: Gift, description: "平台与赛事专属福利" },
      { label: "我的卡券", to: "/benefits/wallet", icon: Wallet, description: "已领取的卡券与权益" },
      { label: "兑换码", to: "/redeem", icon: QrCode, description: "填写邀请码或福利码" },
      { label: "兑换中心", to: "/benefits/exchange", icon: RefreshCw, description: "用学力值兑换好物" },
    ],
  },
  {
    title: "工具与服务",
    subtitle: "赛事、投递、验真与内容",
    accent: "bg-[#f3efff] text-[#6f4bc2]",
    entries: [
      { label: "任务中心", to: "/tasks", icon: ClipboardList, description: "已有事项的下一步聚合" },
      { label: "投递记录", to: "/applications", icon: BriefcaseBusiness, description: "实习与项目投递进展" },
      { label: "快速验真", to: "/assets/verification", icon: ShieldCheck, description: "证书与成果验真" },
      { label: "公告资讯", to: "/news", icon: Newspaper, description: "平台公告与资讯" },
      { label: "三创同学会", to: "/stories", icon: Users, description: "赛友风采与项目资源" },
      { label: "合作企业", to: "/companies", icon: Building2, description: "企业资源与品牌" },
      { label: "帮助与客服", to: "/support", icon: Headphones, description: "帮助文档与客服" },
    ],
  },
  {
    title: "社会责任",
    subtitle: "公益与青年行动",
    accent: "bg-[#e9f6f1] text-[#247456]",
    entries: [
      { label: "公益助力", to: "/welfare?returnTo=/apps", icon: HeartHandshake, description: "观看公益视频，助力社会议题" },
    ],
  },
  {
    title: "消息与我的",
    subtitle: "团队、账号与通知",
    accent: "bg-[#e9f6f1] text-[#247456]",
    entries: [
      { label: "我的比赛团队", to: "/me/teams", icon: Flag, description: "各赛事团队与成员" },
      { label: "账号绑定", to: "/me/accounts", icon: Link2, description: "绑定常用电商与内容账号" },
      { label: "消息通知", to: "/me/notifications", icon: Bell, description: "通知与提醒" },
    ],
  },
];

function AppGrid({ group }: { group: AppGroup }) {
  return <div className="grid grid-cols-3 gap-3">{group.entries.map(entry => {
    const Icon = entry.icon;
    return <Link key={entry.to} to={entry.to} className="block" aria-label={`${entry.label}：${entry.description}`}><Card interactive className="flex min-h-[96px] flex-col items-center justify-center gap-2 p-2 text-center"><span className={`relative flex size-10 shrink-0 items-center justify-center rounded-[14px] ${entry.accent ?? group.accent}`}><Icon size={20} aria-hidden="true" />{entry.badge && <span className="absolute -right-2 -top-2 -skew-x-12 rounded-[4px] bg-[#f04438] px-1 py-px text-[8px] font-medium leading-3 text-white shadow-sm" aria-hidden="true">{entry.badge}</span>}</span><span className="text-xs font-medium text-text-primary">{entry.label}</span></Card></Link>;
  })}</div>;
}

function FeaturedInteraction() {
  return <Section title="我的创业小店" subtitle="把今天在 App 里做的事，变成店里看得见的变化">
    <Link to="/apps/startup-shop" className="block">
      <Card interactive className="overflow-hidden p-0">
        <div className="flex items-start gap-4 p-4">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-[18px] bg-[#fff3dd] text-[#a96816]"><Store size={28} aria-hidden="true" /></span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-text-primary">我的创业小店</h3><StatusTag tone="info">概念试玩</StatusTag></div>
            <p className="mt-1 text-sm leading-5 text-text-secondary">签到去进货，学习补货架，喊朋友带客流。先进去把今天的小店盘活。</p>
            <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-text-secondary"><span className="rounded-full bg-surface-subtle px-2.5 py-1">进货</span><span className="rounded-full bg-surface-subtle px-2.5 py-1">客流</span><span className="rounded-full bg-surface-subtle px-2.5 py-1">升级</span><span className="rounded-full bg-surface-subtle px-2.5 py-1">权益</span></div>
          </div>
          <span className="pt-4 text-lg text-text-tertiary" aria-hidden="true">›</span>
        </div>
      </Card>
    </Link>
  </Section>;
}

export function AppCenterPage() {
  const { identities } = usePublicPlatform();
  const activeCompetition = useMemo(() => {
    const activeIdentity = identities.find(identity => identity.identityStatus === "active");
    return activeIdentity ? competitionById(activeIdentity.competitionId) : undefined;
  }, [identities]);
  const workshopEntry: AppEntry = {
    label: "创赛工坊",
    to: activeCompetition ? `/competitions/${activeCompetition.id}/workspace/workshop` : "/competitions",
    icon: Sparkles,
    description: activeCompetition ? `赛事陪跑 · ${activeCompetition.name}` : "赛事 AI 陪跑 · 需先获得赛事身份",
    accent: "bg-[#e9f6f1] text-[#247456]",
    badge: "三创赛专属",
  };
  const renderGroups = groups.map(group => group.title === "工具与服务" ? { ...group, entries: [workshopEntry, ...group.entries] } : group);
  return <PublicShell showNavigation={true}><PageHeader title="应用中心" subtitle="平台功能与互动入口" /><div className="space-y-7 px-4 py-5">
    <FeaturedInteraction />
    {renderGroups.map(group => <Section key={group.title} title={group.title} subtitle={group.subtitle}><AppGrid group={group} /></Section>)}
  </div></PublicShell>;
}

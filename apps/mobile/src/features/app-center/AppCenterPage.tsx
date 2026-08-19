import { Award, Bell, BookOpen, BriefcaseBusiness, Building2, ClipboardList, Flag, Gift, Headphones, Newspaper, RefreshCw, ShieldCheck, TrendingUp, Users, Wallet, type LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, PageHeader, PublicShell, Section } from "../../components/ui";

type AppEntry = {
  label: string;
  to: string;
  icon: LucideIcon;
  description: string;
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
    subtitle: "课程、成长与可信成果",
    accent: "bg-[#eaf5ff] text-[#2879d0]",
    entries: [
      { label: "课程学习", to: "/courses", icon: BookOpen, description: "平台课程与学习记录" },
      { label: "成长概览", to: "/growth/score", icon: TrendingUp, description: "学习与参与成长画像" },
      { label: "可信成果", to: "/assets", icon: Award, description: "经历、成绩与证书" },
    ],
  },
  {
    title: "福利权益",
    subtitle: "福利、卡券与兑换",
    accent: "bg-[#fff7df] text-[#946218]",
    entries: [
      { label: "创赛福利", to: "/benefits", icon: Gift, description: "平台与赛事专属福利" },
      { label: "我的卡券", to: "/benefits/wallet", icon: Wallet, description: "已领取的卡券与权益" },
      { label: "兑换中心", to: "/benefits/exchange", icon: RefreshCw, description: "用成长值兑换好物" },
    ],
  },
  {
    title: "工具与服务",
    subtitle: "任务、投递、验真与内容",
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
    title: "消息与我的",
    subtitle: "团队与通知",
    accent: "bg-[#e9f6f1] text-[#247456]",
    entries: [
      { label: "我的比赛团队", to: "/me/teams", icon: Flag, description: "各赛事团队与成员" },
      { label: "消息通知", to: "/me/notifications", icon: Bell, description: "通知与提醒" },
    ],
  },
];

function AppGrid({ group }: { group: AppGroup }) {
  return <div className="grid grid-cols-3 gap-3">{group.entries.map(entry => {
    const Icon = entry.icon;
    return <Link key={entry.to} to={entry.to} className="block" aria-label={`${entry.label}：${entry.description}`}><Card interactive className="flex min-h-[96px] flex-col items-center justify-center gap-2 p-2 text-center"><span className={`flex size-10 shrink-0 items-center justify-center rounded-[14px] ${group.accent}`}><Icon size={20} aria-hidden="true" /></span><span className="text-xs font-medium text-text-primary">{entry.label}</span></Card></Link>;
  })}</div>;
}

export function AppCenterPage() {
  return <PublicShell showNavigation={true}><PageHeader title="应用中心" subtitle="平台功能与工具总入口" /><div className="space-y-7 px-4 py-5">
    {groups.map(group => <Section key={group.title} title={group.title} subtitle={group.subtitle}><AppGrid group={group} /></Section>)}
  </div></PublicShell>;
}

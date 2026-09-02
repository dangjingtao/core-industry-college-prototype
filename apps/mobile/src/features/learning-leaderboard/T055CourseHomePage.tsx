import { ChevronRight, Clock3, Coins, ShieldCheck, Sparkles, Wheat } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, PageHeader, PublicShell, Section, StatusTag } from "../../components/ui";
import { courses, type Course } from "../long-term-assets/data";
import { LeaderboardRoleBadges, type LeaderboardRole } from "./LeaderboardIdentity";

type CredentialTier = "none" | "standard" | "trusted";

type LearnerPreview = {
  rank: 1 | 2 | 3;
  name: string;
  minutes: number;
  roles: LeaderboardRole[];
  avatarTone: string;
};

const ASSET_BASE = "/assets/learning-leaderboard";
const TROPHY_MATERIAL = `${ASSET_BASE}/user-materials/crops/trophy-simple-gold.svg`;
const WREATH_MATERIAL = `${ASSET_BASE}/user-materials/crops/wreath-gold.svg`;

const trustedCourseIds = new Set(["ai-ecommerce-agent", "data-analytics", "newbie-essential"]);

const topLearners: LearnerPreview[] = [
  { rank: 1, name: "林知夏", minutes: 512, roles: ["校园大使"], avatarTone: "bg-[linear-gradient(145deg,#FFE8BE_0%,#FFBE62_100%)] text-[#8C4B00]" },
  { rank: 2, name: "周可昕", minutes: 476, roles: ["推荐官"], avatarTone: "bg-[linear-gradient(145deg,#DFE5FF_0%,#8798FF_100%)] text-[#2837A8]" },
  { rank: 3, name: "陈一舟", minutes: 441, roles: [], avatarTone: "bg-[linear-gradient(145deg,#E8DEFF_0%,#A68DFF_100%)] text-[#5332C7]" },
];

const myWeeklyMinutes = 222;
const mySchoolRank = 12;

function credentialTier(course: Course): CredentialTier {
  if (trustedCourseIds.has(course.id)) return "trusted";
  if (!course.certificateId) return "none";
  return "standard";
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

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (!hours) return `${rest}分钟`;
  return rest ? `${hours}时${String(rest).padStart(2, "0")}分` : `${hours}小时`;
}

function LearnerAvatar({ learner, champion = false }: { learner: LearnerPreview; champion?: boolean }) {
  return <span
    aria-label={`${learner.name}公开头像`}
    role="img"
    className={`relative grid shrink-0 place-items-center overflow-hidden rounded-full border-2 border-white font-bold ${champion ? "size-[80px] text-[28px] shadow-[0_10px_28px_rgba(231,168,31,.28)] ring-2 ring-[#FFE8A9]" : "size-[68px] text-[24px] shadow-[0_8px_20px_rgba(74,77,157,.15)]"} ${learner.avatarTone}`}
  >
    <span className="absolute inset-x-2 top-1 h-5 rounded-full bg-white/25 blur-sm" />
    <span className="relative z-10">{learner.name.slice(0, 1)}</span>
  </span>;
}

function TrophyMaterial() {
  return <div aria-hidden="true" className="relative grid h-full min-h-[112px] place-items-center overflow-hidden bg-[linear-gradient(145deg,#FFFDF9_0%,#FFF4D8_100%)]">
    <span className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,206,91,.28),transparent_68%)]" />
    <Sparkles size={13} className="absolute left-2.5 top-4 text-[#F6C64F]" />
    <Sparkles size={10} className="absolute right-2 top-5 text-[#F9D97E]" />
    <img src={WREATH_MATERIAL} alt="" className="absolute bottom-1.5 left-1/2 w-[96px] -translate-x-1/2 opacity-65" />
    <img src={TROPHY_MATERIAL} alt="" className="relative z-10 h-[84px] w-auto object-contain drop-shadow-[0_8px_12px_rgba(191,124,0,.22)]" />
  </div>;
}

function RankLabel({ rank }: { rank: 1 | 2 | 3 }) {
  const first = rank === 1;
  return <div className="relative flex h-8 items-center justify-center">
    {first && <>
      <span className="absolute -top-2 left-1/2 h-[44px] w-[82px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,213,109,.34),transparent_72%)]" />
      <img src={WREATH_MATERIAL} alt="" aria-hidden="true" className="absolute -top-2 left-1/2 w-[62px] -translate-x-1/2 opacity-80" />
    </>}
    <span className={`relative z-10 text-[17px] font-extrabold tracking-wide ${first ? "text-[#B86600]" : rank === 2 ? "text-[#3549D5]" : "text-[#6B35CE]"}`}>NO.{rank}</span>
  </div>;
}

export function LearningLeaderboardPreview() {
  const podium = [topLearners[1], topLearners[0], topLearners[2]];

  return <section aria-labelledby="learning-leaderboard-title" className="-mx-4 overflow-hidden rounded-[30px] bg-[linear-gradient(135deg,#F7F9FF_0%,#EEF2FF_58%,#F7F4FF_100%)] px-4 py-5">
    <div className="flex items-start justify-between gap-3 px-1">
      <div className="flex min-w-0 items-start gap-2.5">
        <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-[#EEF0FF] text-[#8A95E8]"><Wheat size={20} aria-hidden="true" /></span>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h2 id="learning-leaderboard-title" className="text-[23px] font-extrabold tracking-tight text-[#101A42]">学习排行榜</h2>
            <Sparkles size={17} className="shrink-0 text-[#FFD36A]" aria-hidden="true" />
          </div>
          <p className="mt-1 inline-flex items-center gap-1.5 whitespace-nowrap text-[13px] text-[#66708F]"><Clock3 size={16} className="text-[#3F42DB]" aria-hidden="true" />本周课程学习时长，每周一更新</p>
        </div>
      </div>
      <Link to="/courses/leaderboard" aria-label="查看完整排行榜" className="inline-flex min-h-touch shrink-0 items-center gap-0.5 pt-1 text-[14px] font-bold text-[#2736C7]">查看完整榜单 <ChevronRight size={18} aria-hidden="true" /></Link>
    </div>

    <Card className="mt-4 overflow-hidden rounded-[28px] border border-[#DCE3F4] bg-white p-0 shadow-[0_16px_42px_rgba(57,71,132,.14)]">
      <div className="grid min-h-[112px] grid-cols-[1fr_1fr_104px] border-b border-[#DDE4F2]">
        <div className="min-w-0 px-4 py-5">
          <p className="text-[14px] font-medium text-[#59627F]">我的本校排名</p>
          <p className="mt-2.5 text-[35px] font-extrabold leading-none tracking-tight text-[#101A42]">{mySchoolRank}<span className="ml-1 text-[17px] font-semibold">名</span></p>
        </div>
        <div className="min-w-0 border-l border-[#DDE4F2] px-4 py-5">
          <p className="text-[14px] font-medium text-[#59627F]">本周学习时长</p>
          <p className="mt-2.5 whitespace-nowrap text-[27px] font-extrabold leading-none tracking-tight text-[#101A42]">{formatDuration(myWeeklyMinutes)}</p>
        </div>
        <div className="border-l border-[#DDE4F2]"><TrophyMaterial /></div>
      </div>

      <div className="relative -mt-px rounded-t-[22px] border-t border-[#D9E1F1] bg-white px-4 pb-4 pt-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[20px] font-extrabold text-[#101A42]">本校 Top 3</h3>
          <span className="text-[15px] font-medium text-[#59627F]">周榜</span>
        </div>

        <div className="mt-6 grid grid-cols-3">
          {podium.map(learner => {
            const first = learner.rank === 1;
            const separated = learner.rank !== 2;

            return <div key={learner.rank} className={`relative min-w-0 px-2 text-center ${separated ? "border-l border-[#E0E5F1]" : ""} ${first ? "-translate-y-2" : ""}`}>
              <RankLabel rank={learner.rank} />
              {first && <span className="pointer-events-none absolute left-1/2 top-7 h-[122px] w-[122px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,218,128,.3),transparent_70%)]" />}
              <div className={`relative z-10 flex justify-center ${first ? "mt-3" : "mt-4"}`}><LearnerAvatar learner={learner} champion={first} /></div>
              <div className="relative z-10 mt-3 flex min-w-0 flex-col items-center gap-1.5">
                <span className="max-w-full truncate text-[16px] font-bold text-[#101A42]">{learner.name}</span>
                <span className="flex min-h-7 items-center justify-center"><LeaderboardRoleBadges roles={learner.roles} compact /></span>
                <span className="text-[15px] font-medium text-[#59627F]">{formatDuration(learner.minutes)}</span>
              </div>
            </div>;
          })}
        </div>

        <Link to="/courses/leaderboard" className="mt-6 flex min-h-[52px] items-center justify-center gap-1 rounded-[16px] border border-[#AAB1FF] bg-[linear-gradient(100deg,#7185FF_0%,#7952F4_100%)] text-[17px] font-bold text-white shadow-[0_10px_22px_rgba(100,86,234,.22)]">进入完整排行榜 <ChevronRight size={20} aria-hidden="true" /></Link>
      </div>
    </Card>
  </section>;
}

export function T055CourseHomePage() {
  const trustedCourses = courses.filter(course => credentialTier(course) === "trusted" && course.category !== "onboarding");
  const onboarding = courses.filter(course => course.category === "onboarding");
  const others = courses.filter(course => credentialTier(course) !== "trusted" && course.category !== "onboarding");

  return <PublicShell showNavigation={false}>
    <PageHeader title="学院" backTo="/home" />
    <div className="space-y-7 px-4 py-5">
      <Section title="新手必修" subtitle="先把平台和参赛流程搞明白，不用把每件小事都包装成可信证书">
        <div className="space-y-3">{onboarding.map(course => <CourseRow key={course.id} course={course} />)}</div>
      </Section>

      <LearningLeaderboardPreview />

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

export function T055LeaderboardEntryPage() {
  return <PublicShell showNavigation={false}>
    <PageHeader title="学习排行榜" backTo="/courses" />
    <div className="space-y-4 px-4 py-5">
      <LearningLeaderboardPreview />
    </div>
  </PublicShell>;
}

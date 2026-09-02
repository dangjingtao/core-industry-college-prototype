import { ChevronRight, Clock3, Coins, ShieldCheck } from "lucide-react";
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
    className={`relative grid shrink-0 place-items-center overflow-hidden rounded-full border-2 border-white font-bold shadow-[0_8px_20px_rgba(74,77,157,.14)] ${champion ? "size-[78px] text-2xl" : "size-[66px] text-xl"} ${learner.avatarTone}`}
  >
    <span className="absolute inset-x-2 top-1 h-5 rounded-full bg-white/25 blur-sm" />
    <span className="relative z-10">{learner.name.slice(0, 1)}</span>
  </span>;
}

function RankMaterial({ rank }: { rank: 1 | 2 | 3 }) {
  return <img src={`${ASSET_BASE}/rank-${rank}.webp`} alt={`第${rank}名奖牌`} className="absolute left-1/2 top-0 z-10 h-[52px] w-[52px] -translate-x-1/2 -translate-y-1/2 object-contain drop-shadow-[0_6px_10px_rgba(36,49,124,.2)]" />;
}

function TrophyMaterial() {
  return <span aria-hidden="true" className="absolute inset-0 z-0 bg-[url('/assets/learning-leaderboard/user-materials/trophies-source.png')] bg-[length:300%_200%] bg-[position:0%_0%] bg-no-repeat opacity-95" />;
}

export function LearningLeaderboardPreview() {
  const podium = [topLearners[1], topLearners[0], topLearners[2]];
  return <section aria-labelledby="learning-leaderboard-title" className="space-y-3">
    <div className="flex items-start justify-between gap-3 px-1">
      <div className="min-w-0">
        <h2 id="learning-leaderboard-title" className="text-[22px] font-extrabold tracking-tight text-[#101A42]">学习排行榜</h2>
        <p className="mt-1.5 inline-flex items-center gap-2 text-sm text-[#59627F]"><Clock3 size={17} className="text-[#3F42DB]" aria-hidden="true" />本周课程学习时长 · 每周一更新</p>
      </div>
      <Link to="/courses/leaderboard" aria-label="查看完整排行榜" className="inline-flex min-h-touch shrink-0 items-center gap-0.5 pt-2 text-[15px] font-bold text-[#2736C7]">查看完整榜单 <ChevronRight size={19} aria-hidden="true" /></Link>
    </div>

    <Card className="overflow-hidden rounded-[22px] border border-[#E3E6F3] bg-white p-0 shadow-[0_18px_42px_rgba(67,74,124,.14)]">
      <div className="grid grid-cols-[1fr_1fr_88px] border-b border-[#E3E6F3]">
        <div className="min-w-0 px-5 py-5">
          <p className="text-[15px] text-[#59627F]">我的本校排名</p>
          <p className="mt-2 text-[36px] font-extrabold leading-none tracking-tight text-[#101A42]">{mySchoolRank}<span className="ml-1 text-lg font-medium">名</span></p>
        </div>
        <div className="min-w-0 border-l border-[#E3E6F3] px-5 py-5">
          <p className="text-[15px] text-[#59627F]">本周学习时长</p>
          <p className="mt-2 whitespace-nowrap text-[29px] font-extrabold leading-none tracking-tight text-[#101A42]">{formatDuration(myWeeklyMinutes)}</p>
        </div>
        <div className="relative overflow-hidden border-l border-[#E3E6F3] bg-[#FFF8E8]"><TrophyMaterial /></div>
      </div>

      <div className="px-5 pb-5 pt-5">
        <div className="flex items-center justify-between">
          <h3 className="text-[21px] font-extrabold text-[#101A42]">本校 Top 3</h3>
          <span className="text-[17px] font-medium text-[#59627F]">周榜</span>
        </div>

        <div className="mt-7 grid grid-cols-3">
          {podium.map(learner => {
            const first = learner.rank === 1;
            return <div key={learner.rank} className={`relative min-w-0 px-2 text-center ${learner.rank !== 2 ? "border-l border-[#E3E6F3]" : ""} ${first ? "-translate-y-2" : ""}`}>
              <span className={`text-[18px] font-extrabold ${first ? "text-[#B86600]" : "text-[#3236C8]"}`}>NO.{learner.rank}</span>
              {first && <span className="pointer-events-none absolute -top-3 left-1/2 h-[110px] w-[110px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,210,101,.28),transparent_68%)]" />}
              <div className="relative mt-5 flex justify-center"><RankMaterial rank={learner.rank} /><LearnerAvatar learner={learner} champion={first} /></div>
              <div className="relative z-10 mt-4 flex min-w-0 flex-col items-center gap-1.5">
                <span className="max-w-full truncate text-[16px] font-bold text-[#101A42]">{learner.name}</span>
                <LeaderboardRoleBadges roles={learner.roles} compact />
                <span className="text-[16px] text-[#59627F]">{formatDuration(learner.minutes)}</span>
              </div>
            </div>;
          })}
        </div>

        <Link to="/courses/leaderboard" className="mt-7 flex min-h-[52px] items-center justify-center gap-1 rounded-[16px] border border-[#AAB1FF] bg-[linear-gradient(100deg,#7887FF_0%,#7650F2_100%)] text-[18px] font-bold text-white shadow-[0_10px_20px_rgba(100,86,234,.22)]">进入完整排行榜 <ChevronRight size={20} aria-hidden="true" /></Link>
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

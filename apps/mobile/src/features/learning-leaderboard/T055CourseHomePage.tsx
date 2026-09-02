import { ChevronRight, Clock3, Coins, ShieldCheck, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, PageHeader, PublicShell, Section, StatusTag } from "../../components/ui";
import { courses, type Course } from "../long-term-assets/data";
import type { LeaderboardRole } from "./LeaderboardIdentity";

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
    className={`relative grid shrink-0 place-items-center overflow-hidden rounded-full font-bold ${champion ? "size-[58px] text-lg" : "size-[50px] text-base"} ${learner.avatarTone}`}
    style={{ boxShadow: champion ? "0 0 0 3px #fff,0 0 0 6px #F5C84E,0 10px 24px rgba(185,126,0,.18)" : "0 0 0 3px #fff,0 0 0 5px rgba(91,94,247,.13),0 8px 18px rgba(70,73,110,.12)" }}
  >
    <span className="absolute inset-x-2 top-1 h-4 rounded-full bg-white/25 blur-sm" />
    <span className="relative z-10">{learner.name.slice(0, 1)}</span>
  </span>;
}

function RankMaterial({ rank, champion = false }: { rank: 1 | 2 | 3; champion?: boolean }) {
  return <img
    src={`${ASSET_BASE}/rank-${rank}.webp`}
    alt={`第${rank}名奖牌`}
    data-testid={`home-rank-material-${rank}`}
    className={`${champion ? "h-[48px] w-[48px]" : "h-[42px] w-[42px]"} object-contain drop-shadow-[0_7px_10px_rgba(36,49,124,.18)]`}
  />;
}

function MaterialRoleBadges({ roles }: { roles: LeaderboardRole[] }) {
  if (!roles.length) return <span className="h-[18px]" aria-hidden="true" />;
  return <span className="inline-flex min-h-[18px] items-center justify-center" aria-label={`身份：${roles.join("、")}`}>
    {roles.map(role => {
      const file = role === "校园大使" ? "campus-ambassador.webp" : "recommender.webp";
      return <img key={role} src={`${ASSET_BASE}/${file}`} alt={role} data-testid={`home-role-material-${role}`} className="h-[18px] w-[54px] object-contain drop-shadow-[0_3px_5px_rgba(31,67,162,.12)]" />;
    })}
  </span>;
}

function podiumTone(rank: 1 | 2 | 3) {
  if (rank === 1) return "border-warning/25 bg-[linear-gradient(180deg,#FFFDF7_0%,#FFF7E7_100%)]";
  if (rank === 2) return "border-[#D9DFFF] bg-[linear-gradient(180deg,#FFFFFF_0%,#F6F7FF_100%)]";
  return "border-[#E4DDFB] bg-[linear-gradient(180deg,#FFFFFF_0%,#F9F6FF_100%)]";
}

export function LearningLeaderboardPreview() {
  const podium = [topLearners[1], topLearners[0], topLearners[2]];
  return <section aria-labelledby="learning-leaderboard-title" className="space-y-3">
    <div className="flex items-end justify-between gap-3 px-1">
      <div className="min-w-0">
        <h2 id="learning-leaderboard-title" className="text-base font-semibold text-text-primary">学习排行榜</h2>
        <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-text-tertiary"><Clock3 size={12} aria-hidden="true" />本周课程学习时长 · 每周一更新</p>
      </div>
      <Link to="/courses/leaderboard" aria-label="查看完整排行榜" className="inline-flex min-h-touch shrink-0 items-center gap-0.5 text-xs font-medium text-text-secondary">查看完整榜单 <ChevronRight size={14} aria-hidden="true" /></Link>
    </div>

    <Card className="overflow-hidden border border-border-subtle p-0 shadow-sm">
      <div className="relative overflow-hidden border-b border-warning/15 bg-[linear-gradient(135deg,#FFFDF7_0%,#FFF4D9_56%,#F2F3FF_100%)] px-4 py-4">
        <div className="absolute -right-6 -top-8 size-24 rounded-full bg-white/40" />
        <div className="absolute right-10 top-8 size-10 rounded-full bg-warning/10" />
        <div className="relative z-10 flex items-center justify-between gap-3">
          <div className="grid min-w-0 flex-1 grid-cols-2 gap-3">
            <div className="rounded-[12px] border border-white/70 bg-white/65 px-3 py-2.5 backdrop-blur-sm">
              <p className="text-[11px] font-medium text-text-secondary">我的本校排名</p>
              <p className="mt-1 text-[24px] font-extrabold leading-none text-text-primary">{mySchoolRank}<span className="ml-1 text-xs font-semibold text-text-secondary">名</span></p>
            </div>
            <div className="rounded-[12px] border border-white/70 bg-white/65 px-3 py-2.5 backdrop-blur-sm">
              <p className="text-[11px] font-medium text-text-secondary">本周学习时长</p>
              <p className="mt-1 whitespace-nowrap text-[19px] font-extrabold leading-[24px] text-text-primary">{formatDuration(myWeeklyMinutes)}</p>
            </div>
          </div>
          <div className="relative grid size-[62px] shrink-0 place-items-center rounded-[20px] border border-warning/20 bg-[linear-gradient(145deg,#FFF7D7_0%,#FFD67A_100%)] shadow-[0_10px_24px_rgba(188,126,0,.14)]">
            <span className="absolute inset-2 rounded-[15px] bg-white/30" />
            <Trophy className="relative text-warning-text" size={34} strokeWidth={1.9} aria-hidden="true" />
          </div>
        </div>
      </div>

      <div className="px-4 pb-4 pt-3.5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-text-primary">本校 Top 3</h3>
          <span className="rounded-full bg-primary-container px-2 py-1 text-[10px] font-semibold text-text-brand">本周榜单</span>
        </div>

        <div className="mt-3 grid grid-cols-3 items-end gap-2 pt-6">
          {podium.map(learner => {
            const first = learner.rank === 1;
            return <div key={learner.rank} className={`relative flex min-w-0 flex-col items-center rounded-[16px] border px-1.5 pb-2.5 pt-7 text-center ${podiumTone(learner.rank)} ${first ? "-translate-y-2 shadow-[0_10px_22px_rgba(185,126,0,.10)]" : "shadow-[0_7px_18px_rgba(70,73,110,.07)]"}`}>
              <div className={`absolute left-1/2 z-20 -translate-x-1/2 ${first ? "-top-6" : "-top-5"}`}><RankMaterial rank={learner.rank} champion={first} /></div>
              <LearnerAvatar learner={learner} champion={first} />
              <div className="mt-2.5 flex min-w-0 flex-col items-center gap-1">
                <span className="max-w-[84px] truncate text-xs font-bold text-text-primary">{learner.name}</span>
                <MaterialRoleBadges roles={learner.roles} />
                <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${first ? "bg-warning-bg text-warning-text" : "bg-surface-subtle text-text-secondary"}`}>{formatDuration(learner.minutes)}</span>
              </div>
            </div>;
          })}
        </div>

        <Link to="/courses/leaderboard" className="mt-2.5 flex min-h-touch items-center justify-center rounded-control bg-primary text-sm font-semibold text-on-primary shadow-[0_8px_18px_rgba(91,94,247,.18)] active:bg-primary-pressed">进入完整排行榜</Link>
      </div>
    </Card>
  </section>;
}

export function T055CourseHomePage() {
  const trustedCourses = courses.filter(course => credentialTier(course) === "trusted");
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

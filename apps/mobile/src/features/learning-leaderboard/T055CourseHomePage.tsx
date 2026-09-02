import { ChevronRight, Coins, ShieldCheck, Trophy } from "lucide-react";
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

const trustedCourseIds = new Set(["ai-ecommerce-agent", "data-analytics", "newbie-essential"]);

const topLearners: LearnerPreview[] = [
  { rank: 1, name: "林知夏", minutes: 512, roles: ["校园大使"], avatarTone: "bg-warning-bg text-warning-text" },
  { rank: 2, name: "周可昕", minutes: 476, roles: ["推荐官"], avatarTone: "bg-info-bg text-info-text" },
  { rank: 3, name: "陈一舟", minutes: 441, roles: [], avatarTone: "bg-primary-container text-text-brand" },
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

function LearnerAvatar({ learner, featured = false }: { learner: LearnerPreview; featured?: boolean }) {
  return <span aria-label={`${learner.name}公开头像`} role="img" className={`grid shrink-0 place-items-center rounded-full border-2 border-surface font-semibold shadow-sm ${featured ? "size-14 text-base" : "size-10 text-sm"} ${learner.avatarTone}`}>
    {learner.name.slice(0, 1)}
  </span>;
}

function RankMedal({ rank }: { rank: 1 | 2 | 3 }) {
  const tone = rank === 1 ? "bg-warning text-white" : rank === 2 ? "border border-border bg-surface-subtle text-text-secondary" : "border border-warning/30 bg-warning-bg text-warning-text";
  return <span className={`grid size-6 place-items-center rounded-full text-[11px] font-bold shadow-sm ${tone}`}>{rank}</span>;
}

export function LearningLeaderboardPreview() {
  const podium = [topLearners[1], topLearners[0], topLearners[2]];
  return <section aria-labelledby="learning-leaderboard-title" className="space-y-3">
    <div className="flex items-center justify-between gap-3 px-1">
      <h2 id="learning-leaderboard-title" className="text-base font-semibold text-text-primary">学习排行榜</h2>
      <Link to="/courses/leaderboard" aria-label="查看完整排行榜" className="inline-flex min-h-touch items-center gap-0.5 text-xs font-medium text-text-secondary">查看完整榜单 <ChevronRight size={14} aria-hidden="true" /></Link>
    </div>

    <Card className="overflow-hidden border border-border-subtle p-0 shadow-sm">
      <div className="relative overflow-hidden bg-warning-bg/60 px-4 py-4">
        <div className="relative z-10 grid grid-cols-[1fr_1px_1.25fr] items-end gap-4 pr-16">
          <div>
            <p className="text-[11px] text-text-secondary">我的本校排名</p>
            <p className="mt-1 text-2xl font-bold text-text-primary">{mySchoolRank}<span className="ml-1 text-xs font-medium text-text-secondary">名</span></p>
          </div>
          <span className="h-9 bg-warning/30" />
          <div>
            <p className="text-[11px] text-text-secondary">本周课程学习时长</p>
            <p className="mt-1 text-xl font-bold text-text-primary">{formatDuration(myWeeklyMinutes)}</p>
          </div>
        </div>
        <Trophy className="absolute -bottom-2 right-3 text-warning/80" size={68} strokeWidth={1.5} aria-hidden="true" />
        <div className="absolute -right-5 -top-7 size-20 rounded-full bg-white/30" />
      </div>

      <div className="p-4">
        <h3 className="text-sm font-semibold text-text-primary">本校 Top 3</h3>
        <div className="mt-3 grid grid-cols-3 items-end gap-1">
          {podium.map(learner => {
            const first = learner.rank === 1;
            return <div key={learner.rank} className={`flex min-w-0 flex-col items-center text-center ${first ? "pb-1" : "pt-4"}`}>
              <div className="relative">
                <LearnerAvatar learner={learner} featured />
                <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2"><RankMedal rank={learner.rank} /></span>
              </div>
              <div className="mt-4 flex min-w-0 flex-col items-center gap-1">
                <span className="max-w-[88px] truncate text-xs font-semibold text-text-primary">{learner.name}</span>
                <LeaderboardRoleBadges roles={learner.roles} />
                <span className="text-[11px] text-text-secondary">{formatDuration(learner.minutes)}</span>
              </div>
            </div>;
          })}
        </div>
        <Link to="/courses/leaderboard" className="mt-4 flex min-h-touch items-center justify-center rounded-control bg-primary text-sm font-semibold text-on-primary active:bg-primary-pressed">进入完整排行榜</Link>
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

import { Award, BookOpen, ChevronRight, Clock, Coins, GraduationCap, ShieldCheck, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, PageHeader, PublicShell, Section, StatusTag } from "../../components/ui";
import { courses, type Course } from "../long-term-assets/data";

type CredentialTier = "none" | "standard" | "trusted";
type LeaderboardRole = "校园大使" | "推荐官";

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
  if (!hours) return `${rest} 分钟`;
  return rest ? `${hours} 小时 ${rest} 分` : `${hours} 小时`;
}

function weekRangeLabel(now = new Date()) {
  const start = new Date(now);
  const weekday = (start.getDay() + 6) % 7;
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - weekday);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const format = (date: Date) => `${date.getMonth() + 1}月${date.getDate()}日`;
  return `${format(start)}–${format(end)}`;
}

function RoleBadge({ role }: { role: LeaderboardRole }) {
  return <StatusTag tone={role === "校园大使" ? "warning" : "info"}>{role}</StatusTag>;
}

function RankMark({ rank }: { rank: 1 | 2 | 3 }) {
  const tone = rank === 1 ? "bg-warning-bg text-warning-text" : rank === 2 ? "bg-info-bg text-info-text" : "bg-surface-subtle text-text-secondary";
  return <span className={`grid size-8 shrink-0 place-items-center rounded-full text-xs font-bold ${tone}`}>{rank}</span>;
}

function LearnerAvatar({ learner }: { learner: LearnerPreview }) {
  return <span aria-label={`${learner.name}公开头像`} role="img" className={`grid size-10 shrink-0 place-items-center rounded-full text-sm font-semibold ${learner.avatarTone}`}>
    {learner.name.slice(0, 1)}
  </span>;
}

export function LearningLeaderboardPreview() {
  const weekRange = weekRangeLabel();
  return <section aria-labelledby="learning-leaderboard-title" className="space-y-3">
    <Card className="overflow-hidden border border-border-subtle p-0">
      <div className="flex items-start justify-between gap-3 border-b border-border-subtle p-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-[14px] bg-primary-container text-text-brand"><Trophy size={20} aria-hidden="true" /></span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 id="learning-leaderboard-title" className="text-base font-semibold text-text-primary">学习排行榜</h2>
              <StatusTag tone="info">周榜</StatusTag>
            </div>
            <p className="mt-1 text-xs text-text-tertiary">本周 · {weekRange}</p>
          </div>
        </div>
        <Link to="/courses/leaderboard" aria-label="查看完整排行榜" className="inline-flex min-h-touch shrink-0 items-center gap-0.5 rounded-control px-1 text-xs font-medium text-text-brand active:bg-surface-pressed">
          查看完整排行榜 <ChevronRight size={15} aria-hidden="true" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 border-b border-border-subtle p-4">
        <div className="rounded-control bg-surface-subtle p-3">
          <p className="text-xs text-text-tertiary">我的本校排名</p>
          <p className="mt-1 text-xl font-semibold text-text-primary">#{mySchoolRank}</p>
          <p className="mt-1 text-[11px] text-text-tertiary">继续学习即可向前追赶</p>
        </div>
        <div className="rounded-control bg-surface-subtle p-3">
          <p className="text-xs text-text-tertiary">本周课程学习时长</p>
          <p className="mt-1 text-base font-semibold leading-7 text-text-primary">{formatDuration(myWeeklyMinutes)}</p>
          <p className="mt-1 text-[11px] text-text-tertiary">仅统计课程学习</p>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-text-primary">本校 Top 3</h3>
            <p className="mt-0.5 text-xs text-text-tertiary">按本周课程学习时长排序</p>
          </div>
          <span className="text-[11px] text-text-tertiary">每周更新</span>
        </div>
        <div className="mt-3 divide-y divide-border-subtle">
          {topLearners.map(learner => <div key={learner.rank} className="flex min-h-[64px] items-center gap-3 py-2.5">
            <RankMark rank={learner.rank} />
            <LearnerAvatar learner={learner} />
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                <span className="truncate text-sm font-medium text-text-primary">{learner.name}</span>
                {learner.roles.map(role => <RoleBadge key={role} role={role} />)}
              </div>
              <p className="mt-1 text-xs text-text-tertiary">本周 {formatDuration(learner.minutes)}</p>
            </div>
          </div>)}
        </div>
      </div>
    </Card>
  </section>;
}

export function T043CourseHomePage() {
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

export function T043LeaderboardEntryPage() {
  return <PublicShell showNavigation={false}>
    <PageHeader title="学习排行榜" backTo="/courses" />
    <div className="space-y-4 px-4 py-5">
      <Card className="border border-border-subtle">
        <div className="flex items-start gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-[16px] bg-primary-container text-text-brand"><Trophy size={22} aria-hidden="true" /></span>
          <div>
            <div className="flex flex-wrap items-center gap-2"><h1 className="text-base font-semibold text-text-primary">本周学习排行榜</h1><StatusTag tone="info">周榜</StatusTag></div>
            <p className="mt-1 text-sm leading-6 text-text-secondary">详情入口已接通。本校榜与全国榜的完整 Top 10、我的排名和榜单切换由排行榜详情功能继续承接。</p>
          </div>
        </div>
      </Card>
      <LearningLeaderboardPreview />
    </div>
  </PublicShell>;
}

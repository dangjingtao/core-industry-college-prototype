import { Clock3, Heart, Orbit, School } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Card, PageHeader, PublicShell } from "../../components/ui";
import { LeaderboardRoleBadges, LeaderboardSelfBadge, type LeaderboardRole } from "./LeaderboardIdentity";

type BoardScope = "school" | "national";

type LeaderboardEntry = {
  id: string;
  personKey: string;
  rank: number;
  name: string;
  school: string;
  minutes: number;
  likes: number;
  roles: LeaderboardRole[];
  avatarTone: string;
  isSelf?: boolean;
  managed?: boolean;
};

const mySchool = "广东财经大学";
const myPublicName = "新芽同学";
const myRoles: LeaderboardRole[] = ["推荐官"];
const weeklyLikeStoragePrefix = "core.learning-leaderboard.likes.";

const schoolBoard: LeaderboardEntry[] = [
  { id: "s1", personKey: "lin-zhixia", rank: 1, name: "林知夏", school: mySchool, minutes: 512, likes: 38, roles: ["校园大使"], avatarTone: "bg-warning-bg text-warning-text" },
  { id: "s2", personKey: "school-zhou-kexin", rank: 2, name: "周可昕", school: mySchool, minutes: 476, likes: 31, roles: ["推荐官"], avatarTone: "bg-info-bg text-info-text", managed: true },
  { id: "s3", personKey: "chen-yizhou", rank: 3, name: "陈一舟", school: mySchool, minutes: 441, likes: 27, roles: [], avatarTone: "bg-primary-container text-text-brand" },
  { id: "s4", personKey: "nanfeng", rank: 4, name: "南风同学", school: mySchool, minutes: 407, likes: 22, roles: [], avatarTone: "bg-success-bg text-success-text" },
  { id: "s5", personKey: "ajian", rank: 5, name: "阿简", school: mySchool, minutes: 382, likes: 19, roles: ["校园大使"], avatarTone: "bg-warning-bg text-warning-text", managed: true },
  { id: "s6", personKey: "mumian", rank: 6, name: "木棉", school: mySchool, minutes: 354, likes: 17, roles: [], avatarTone: "bg-info-bg text-info-text" },
  { id: "s7", personKey: "xiaoman", rank: 7, name: "小满", school: mySchool, minutes: 329, likes: 15, roles: ["推荐官"], avatarTone: "bg-primary-container text-text-brand" },
  { id: "s8", personKey: "xingyu", rank: 8, name: "星屿", school: mySchool, minutes: 301, likes: 14, roles: [], avatarTone: "bg-success-bg text-success-text" },
  { id: "s9", personKey: "chichuan", rank: 9, name: "迟川", school: mySchool, minutes: 276, likes: 12, roles: [], avatarTone: "bg-warning-bg text-warning-text", managed: true },
  { id: "s10", personKey: "xiazhi", rank: 10, name: "夏栀", school: mySchool, minutes: 248, likes: 11, roles: [], avatarTone: "bg-info-bg text-info-text" },
];

const nationalBoard: LeaderboardEntry[] = [
  { id: "n1", personKey: "guyan", rank: 1, name: "顾言", school: "华南理工大学", minutes: 588, likes: 45, roles: ["校园大使"], avatarTone: "bg-warning-bg text-warning-text" },
  { id: "n2", personKey: "xuyou", rank: 2, name: "许柚", school: "深圳大学", minutes: 561, likes: 41, roles: [], avatarTone: "bg-info-bg text-info-text" },
  { id: "n3", personKey: "lin-zhixia", rank: 3, name: "林知夏", school: mySchool, minutes: 512, likes: 38, roles: ["校园大使"], avatarTone: "bg-primary-container text-text-brand", managed: true },
  { id: "n4", personKey: "national-zhou-kexin", rank: 4, name: "周可昕", school: "暨南大学", minutes: 476, likes: 31, roles: ["推荐官"], avatarTone: "bg-success-bg text-success-text" },
  { id: "n5", personKey: "baiyu", rank: 5, name: "白榆", school: "广东工业大学", minutes: 451, likes: 29, roles: [], avatarTone: "bg-warning-bg text-warning-text" },
  { id: "n6", personKey: "jiangcheng", rank: 6, name: "江澄", school: "华南师范大学", minutes: 428, likes: 25, roles: ["推荐官"], avatarTone: "bg-info-bg text-info-text", managed: true },
  { id: "n7", personKey: "beiye", rank: 7, name: "北野", school: "广州大学", minutes: 402, likes: 23, roles: [], avatarTone: "bg-primary-container text-text-brand" },
  { id: "me", personKey: "me", rank: 8, name: myPublicName, school: mySchool, minutes: 390, likes: 21, roles: myRoles, avatarTone: "bg-success-bg text-success-text", isSelf: true },
  { id: "n9", personKey: "qinghe", rank: 9, name: "青禾", school: "广东金融学院", minutes: 367, likes: 20, roles: [], avatarTone: "bg-warning-bg text-warning-text" },
  { id: "n10", personKey: "shiguang", rank: 10, name: "拾光", school: "广州商学院", minutes: 349, likes: 18, roles: [], avatarTone: "bg-info-bg text-info-text", managed: true },
];

const schoolSelfStanding: LeaderboardEntry = {
  id: "me-school",
  personKey: "me",
  rank: 12,
  name: myPublicName,
  school: mySchool,
  minutes: 222,
  likes: 21,
  roles: myRoles,
  avatarTone: "bg-success-bg text-success-text",
  isSelf: true,
};

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (!hours) return `${rest}分钟`;
  return rest ? `${hours}时${String(rest).padStart(2, "0")}分` : `${hours}小时`;
}

function weekStart(now = new Date()) {
  const start = new Date(now);
  const weekday = (start.getDay() + 6) % 7;
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - weekday);
  return start;
}

function localDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function weekKey(now = new Date()) {
  return localDateKey(weekStart(now));
}

function readWeeklyLikes(storageKey: string) {
  if (typeof window === "undefined") return new Set<string>();
  try {
    const raw = window.localStorage.getItem(storageKey);
    const parsed = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(parsed) ? parsed.filter(item => typeof item === "string") : []);
  } catch {
    return new Set<string>();
  }
}

function LearnerAvatar({ entry, featured = false }: { entry: LeaderboardEntry; featured?: boolean }) {
  return (
    <span
      aria-label={`${entry.name}公开头像`}
      role="img"
      className={`grid shrink-0 place-items-center rounded-full border-2 border-surface font-semibold shadow-sm ${featured ? "size-[68px] text-lg" : "size-9 text-xs"} ${entry.avatarTone}`}
    >
      {entry.name.slice(0, 1)}
    </span>
  );
}

function LikeButton({ entry, liked, onToggle, compact = false }: { entry: LeaderboardEntry; liked: boolean; onToggle: () => void; compact?: boolean }) {
  const likes = entry.likes + (liked ? 1 : 0);
  const label = entry.isSelf
    ? `不能给自己点赞，本周 ${likes} 个赞`
    : liked
      ? `取消给${entry.name}的点赞，本周 ${likes} 个赞`
      : `给${entry.name}点赞，本周 ${likes} 个赞`;

  return (
    <button
      type="button"
      disabled={entry.isSelf}
      aria-label={label}
      aria-pressed={entry.isSelf ? undefined : liked}
      data-testid="leaderboard-like"
      data-person-key={entry.personKey}
      onClick={entry.isSelf ? undefined : onToggle}
      className={`inline-flex shrink-0 items-center justify-center gap-1 rounded-full transition ${compact ? "min-h-7 px-2 text-[11px]" : "min-h-9 px-2 text-xs"} ${entry.isSelf ? "cursor-not-allowed bg-surface-subtle text-text-disabled" : liked ? "bg-primary-container text-text-brand" : "text-text-secondary active:bg-surface-pressed"}`}
    >
      <Heart size={compact ? 13 : 15} aria-hidden="true" className={liked ? "fill-current" : ""} />
      <span data-testid="like-count">{likes}</span>
    </button>
  );
}

function RankMedal({ rank }: { rank: number }) {
  const className = rank === 1
    ? "bg-warning text-white"
    : rank === 2
      ? "border border-border bg-surface-subtle text-text-secondary"
      : "border border-warning/30 bg-warning-bg text-warning-text";
  return <span className={`grid size-7 place-items-center rounded-full text-xs font-bold shadow-sm ${className}`}>{rank}</span>;
}

function BoardTabs({ scope, onChange }: { scope: BoardScope; onChange: (scope: BoardScope) => void }) {
  return (
    <div className="grid grid-cols-2 border-b border-border-subtle bg-surface" aria-label="排行榜范围">
      {(["school", "national"] as const).map(value => {
        const active = scope === value;
        return (
          <button
            key={value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(value)}
            className={`relative min-h-12 text-sm font-semibold transition ${active ? "text-text-brand" : "text-text-primary"}`}
          >
            {value === "school" ? "本校榜" : "全国榜"}
            {active && <span className="absolute bottom-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-primary" />}
          </button>
        );
      })}
    </div>
  );
}

function BoardHero({ scope }: { scope: BoardScope }) {
  const Icon = scope === "school" ? School : Orbit;
  return (
    <div
      className="relative overflow-hidden rounded-container px-5 py-4 text-on-primary shadow-sm"
      style={{ background: "linear-gradient(135deg, var(--com-brand-500) 0%, var(--com-brand-400) 62%, var(--com-accent-500) 145%)" }}
    >
      <div className="relative z-10">
        <h2 className="text-lg font-bold">{scope === "school" ? "本校学习排行榜" : "全国学习排行榜"}</h2>
        <p className="mt-1 text-xs text-white/80">每周一 00:00 更新</p>
      </div>
      <div className="absolute -right-5 -top-8 size-28 rounded-full border border-white/20 bg-white/10" />
      <div className="absolute right-8 top-2 size-16 rounded-full border border-white/20 bg-white/10" />
      <Icon className="absolute right-5 top-1/2 -translate-y-1/2 text-white/85" size={62} strokeWidth={1.35} aria-hidden="true" />
    </div>
  );
}

function PodiumEntry({ entry, liked, onToggleLike }: { entry: LeaderboardEntry; liked: boolean; onToggleLike: () => void }) {
  const first = entry.rank === 1;
  return (
    <div
      data-testid="leaderboard-row"
      data-entry-id={entry.id}
      data-person-key={entry.personKey}
      data-self={entry.isSelf ? "true" : "false"}
      className={`flex min-w-0 flex-col items-center text-center ${first ? "pb-1" : "pt-5"}`}
    >
      <div className="relative">
        <LearnerAvatar entry={entry} featured />
        <span className="absolute -bottom-3 left-1/2 -translate-x-1/2"><RankMedal rank={entry.rank} /></span>
      </div>
      <div className="mt-5 flex min-w-0 flex-col items-center gap-1">
        <div className="flex min-w-0 flex-wrap items-center justify-center gap-1">
          <span className="max-w-[92px] truncate text-sm font-semibold text-text-primary">{entry.name}</span>
          {entry.isSelf && <LeaderboardSelfBadge />}
        </div>
        <LeaderboardRoleBadges roles={entry.roles} />
        {entry.school && <span className={`max-w-[108px] truncate text-[11px] text-text-tertiary ${entry.rank === 1 ? "block" : "hidden"}`}>{entry.school}</span>}
        <span className="text-xs font-medium text-text-primary">{formatDuration(entry.minutes)}</span>
        <LikeButton entry={entry} liked={liked} onToggle={onToggleLike} compact />
      </div>
    </div>
  );
}

function CompactLeaderboardRow({ entry, scope, liked, onToggleLike }: { entry: LeaderboardEntry; scope: BoardScope; liked: boolean; onToggleLike: () => void }) {
  const national = scope === "national";
  return (
    <div
      data-testid="leaderboard-row"
      data-entry-id={entry.id}
      data-person-key={entry.personKey}
      data-self={entry.isSelf ? "true" : "false"}
      className={`grid min-h-[58px] items-center gap-2 border-t border-border-subtle px-3 py-2 ${national ? "grid-cols-[24px_minmax(0,1fr)_68px_64px_50px]" : "grid-cols-[24px_minmax(0,1fr)_72px_52px]"} ${entry.isSelf ? "bg-primary-container/55" : "bg-surface"}`}
    >
      <span className="text-center text-xs font-semibold text-text-primary">{entry.rank}</span>
      <div className="flex min-w-0 items-center gap-2">
        <LearnerAvatar entry={entry} />
        <div className="min-w-0">
          <div className="flex min-w-0 flex-wrap items-center gap-1">
            <span className="truncate text-xs font-medium text-text-primary">{entry.name}</span>
            {entry.isSelf && <LeaderboardSelfBadge />}
            <LeaderboardRoleBadges roles={entry.roles} />
          </div>
        </div>
      </div>
      {national && <span className="line-clamp-2 text-[10px] leading-4 text-text-tertiary">{entry.school}</span>}
      <span className="whitespace-nowrap text-[11px] font-medium text-text-primary">{formatDuration(entry.minutes)}</span>
      <LikeButton entry={entry} liked={liked} onToggle={onToggleLike} compact />
    </div>
  );
}

function TableHeader({ scope }: { scope: BoardScope }) {
  const national = scope === "national";
  return (
    <div className={`grid items-center gap-2 bg-surface-subtle px-3 py-2 text-[10px] text-text-tertiary ${national ? "grid-cols-[24px_minmax(0,1fr)_68px_64px_50px]" : "grid-cols-[24px_minmax(0,1fr)_72px_52px]"}`}>
      <span className="text-center">排名</span>
      <span>用户</span>
      {national && <span>学校</span>}
      <span>本周学习时长</span>
      <span className="text-center">点赞</span>
    </div>
  );
}

function SelfRankingCard({ entry, scope }: { entry: LeaderboardEntry; scope: BoardScope }) {
  return (
    <section aria-labelledby="my-ranking-title" className="space-y-1.5">
      <h2 id="my-ranking-title" className="px-1 text-xs font-semibold text-text-brand">我的排名</h2>
      <div className={`grid min-h-[60px] items-center gap-2 rounded-container border border-primary/45 bg-surface px-3 py-2 shadow-sm ${scope === "national" ? "grid-cols-[26px_minmax(0,1fr)_70px_66px_52px]" : "grid-cols-[26px_minmax(0,1fr)_74px_54px]"}`}>
        <span className="text-center text-sm font-bold text-text-primary">{entry.rank}</span>
        <div className="flex min-w-0 items-center gap-2">
          <LearnerAvatar entry={entry} />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1">
              <span className="truncate text-xs font-semibold text-text-primary">{entry.name}</span>
              <LeaderboardSelfBadge />
              <LeaderboardRoleBadges roles={entry.roles} />
            </div>
          </div>
        </div>
        {scope === "national" && <span className="text-[10px] leading-4 text-text-tertiary">{entry.school}</span>}
        <span className="whitespace-nowrap text-[11px] font-semibold text-text-primary">{formatDuration(entry.minutes)}</span>
        <span className="inline-flex items-center justify-center gap-1 text-xs font-semibold text-text-brand"><Heart size={14} className="fill-current" aria-hidden="true" />{entry.likes}</span>
      </div>
    </section>
  );
}

export function T056LeaderboardPage() {
  const [scope, setScope] = useState<BoardScope>("school");
  const [showRules, setShowRules] = useState(false);
  const currentWeekKey = weekKey();
  const storageKey = `${weeklyLikeStoragePrefix}${currentWeekKey}`;
  const [likedPeople, setLikedPeople] = useState<Set<string>>(() => readWeeklyLikes(storageKey));
  const entries = useMemo(() => scope === "school" ? schoolBoard : nationalBoard, [scope]);
  const selfInTopTen = entries.some(entry => entry.isSelf);
  const topThree = useMemo(() => [entries[1], entries[0], entries[2]].filter(Boolean), [entries]);
  const remaining = entries.slice(3);

  useEffect(() => {
    setLikedPeople(readWeeklyLikes(storageKey));
  }, [storageKey]);

  const toggleLike = (personKey: string) => {
    setLikedPeople(previous => {
      const next = new Set(previous);
      if (next.has(personKey)) next.delete(personKey);
      else next.add(personKey);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(storageKey, JSON.stringify([...next]));
      }
      return next;
    });
  };

  return (
    <PublicShell showNavigation={false}>
      <PageHeader
        title="学习排行榜"
        backTo="/courses"
        right={
          <button type="button" onClick={() => setShowRules(value => !value)} className="min-h-touch px-2 text-xs font-medium text-text-secondary">
            规则说明
          </button>
        }
      />
      <h2 className="sr-only">本周学习排行榜</h2>
      <BoardTabs scope={scope} onChange={setScope} />

      <div className="space-y-4 px-4 py-4">
        <BoardHero scope={scope} />

        {showRules && (
          <Card className="border border-border-subtle bg-surface-subtle px-4 py-3">
            <h3 className="text-sm font-semibold text-text-primary">排行榜规则</h3>
            <div className="mt-2 space-y-1 text-xs leading-5 text-text-secondary">
              <p>· 仅按本周课程学习时长排名，每周一进入新周期。</p>
              <p>· 点赞按周记录，可取消后重新点赞，但不参与排名。</p>
              <p>· 全国榜展示学校；校园大使 / 推荐官仅作身份识别。</p>
            </div>
          </Card>
        )}

        <section data-testid="leaderboard-list" className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-semibold text-text-primary">本周课程学习时长排名</h3>
            <span className="inline-flex items-center gap-1 text-[11px] text-text-tertiary"><Clock3 size={13} aria-hidden="true" />周榜</span>
          </div>

          <div className="grid grid-cols-3 items-end gap-1 px-1 pb-1">
            {topThree.map(entry => (
              <PodiumEntry
                key={entry.id}
                entry={entry}
                liked={likedPeople.has(entry.personKey)}
                onToggleLike={() => toggleLike(entry.personKey)}
              />
            ))}
          </div>

          <Card className="overflow-hidden border border-border-subtle p-0 shadow-sm">
            <TableHeader scope={scope} />
            {remaining.map(entry => (
              <CompactLeaderboardRow
                key={entry.id}
                entry={entry}
                scope={scope}
                liked={likedPeople.has(entry.personKey)}
                onToggleLike={() => toggleLike(entry.personKey)}
              />
            ))}
          </Card>
        </section>

        {!selfInTopTen && <SelfRankingCard entry={schoolSelfStanding} scope="school" />}

        <p className="pb-2 pt-1 text-center text-xs text-text-tertiary">
          {selfInTopTen ? "已经进入 Top10，继续保持本周学习节奏。" : "未进入 Top10？别着急，你的排名也在不断上升中。"}
        </p>
      </div>
    </PublicShell>
  );
}

// Prototype-only data note:
// `managed` is deliberately never rendered. It represents dynamically supplemented accounts from promoted schools.
// Managed examples are mixed across ranks instead of occupying fixed top positions, and real-user examples can rank above them.

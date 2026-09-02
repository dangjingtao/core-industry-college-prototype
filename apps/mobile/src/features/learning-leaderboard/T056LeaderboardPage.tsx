import { Clock3, Heart, School, Trophy } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Card, PageHeader, PublicShell, StatusTag } from "../../components/ui";
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
  if (!hours) return `${rest} 分钟`;
  return rest ? `${hours} 小时 ${rest} 分` : `${hours} 小时`;
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

function weekRangeLabel(now = new Date()) {
  const start = weekStart(now);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const format = (date: Date) => `${date.getMonth() + 1}月${date.getDate()}日`;
  return `${format(start)}–${format(end)}`;
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

function RankMark({ rank }: { rank: number }) {
  const tone = rank === 1
    ? "bg-warning-bg text-warning-text"
    : rank === 2
      ? "bg-info-bg text-info-text"
      : rank === 3
        ? "bg-primary-container text-text-brand"
        : "bg-surface-subtle text-text-secondary";
  return <span className={`grid size-8 shrink-0 place-items-center rounded-full text-xs font-bold ${tone}`}>{rank}</span>;
}

function LearnerAvatar({ entry }: { entry: LeaderboardEntry }) {
  return <span aria-label={`${entry.name}公开头像`} role="img" className={`grid size-10 shrink-0 place-items-center rounded-full text-sm font-semibold ${entry.avatarTone}`}>
    {entry.name.slice(0, 1)}
  </span>;
}

function LikeButton({ entry, liked, onToggle }: { entry: LeaderboardEntry; liked: boolean; onToggle: () => void }) {
  const likes = entry.likes + (liked ? 1 : 0);
  const label = entry.isSelf
    ? `不能给自己点赞，本周 ${likes} 个赞`
    : liked
      ? `取消给${entry.name}的点赞，本周 ${likes} 个赞`
      : `给${entry.name}点赞，本周 ${likes} 个赞`;

  return <button
    type="button"
    disabled={entry.isSelf}
    aria-label={label}
    aria-pressed={entry.isSelf ? undefined : liked}
    data-testid="leaderboard-like"
    data-person-key={entry.personKey}
    onClick={entry.isSelf ? undefined : onToggle}
    className={`inline-flex min-h-touch shrink-0 items-center gap-1 rounded-control px-2 text-xs font-semibold transition ${entry.isSelf ? "cursor-not-allowed text-text-disabled" : liked ? "bg-primary-container text-text-brand" : "text-text-secondary active:bg-surface-pressed"}`}
  >
    <Heart size={15} aria-hidden="true" className={liked ? "fill-current" : ""} />
    <span data-testid="like-count">{likes}</span>
  </button>;
}

function LeaderboardRow({ entry, scope, liked, onToggleLike }: { entry: LeaderboardEntry; scope: BoardScope; liked: boolean; onToggleLike: () => void }) {
  return <div
    data-testid="leaderboard-row"
    data-entry-id={entry.id}
    data-person-key={entry.personKey}
    data-self={entry.isSelf ? "true" : "false"}
    className={`flex min-h-[76px] items-center gap-3 px-3 py-3 ${entry.isSelf ? "bg-primary-container/45" : "bg-surface"}`}
  >
    <RankMark rank={entry.rank} />
    <LearnerAvatar entry={entry} />
    <div className="min-w-0 flex-1">
      <div className="flex min-w-0 flex-wrap items-center gap-1.5">
        <span className="truncate text-sm font-semibold text-text-primary">{entry.name}</span>
        {entry.isSelf && <LeaderboardSelfBadge />}
        <LeaderboardRoleBadges roles={entry.roles} />
      </div>
      {scope === "national" && <p className="mt-1 flex items-center gap-1 text-xs text-text-tertiary"><School size={12} aria-hidden="true" />{entry.school}</p>}
      <p className="mt-1 flex items-center gap-1 text-xs text-text-secondary"><Clock3 size={12} aria-hidden="true" />本周 {formatDuration(entry.minutes)}</p>
    </div>
    <LikeButton entry={entry} liked={liked} onToggle={onToggleLike} />
  </div>;
}

function BoardTabs({ scope, onChange }: { scope: BoardScope; onChange: (scope: BoardScope) => void }) {
  return <div className="grid grid-cols-2 gap-1 rounded-container bg-surface-subtle p-1" aria-label="排行榜范围">
    {(["school", "national"] as const).map(value => {
      const active = scope === value;
      return <button
        key={value}
        type="button"
        aria-pressed={active}
        onClick={() => onChange(value)}
        className={`min-h-touch rounded-control px-3 text-sm font-semibold transition ${active ? "bg-surface text-text-primary shadow-sm" : "text-text-secondary"}`}
      >
        {value === "school" ? "本校榜" : "全国榜"}
      </button>;
    })}
  </div>;
}

export function T056LeaderboardPage() {
  const [scope, setScope] = useState<BoardScope>("school");
  const currentWeekKey = weekKey();
  const storageKey = `${weeklyLikeStoragePrefix}${currentWeekKey}`;
  const [likedPeople, setLikedPeople] = useState<Set<string>>(() => readWeeklyLikes(storageKey));
  const entries = useMemo(() => scope === "school" ? schoolBoard : nationalBoard, [scope]);
  const selfInTopTen = entries.some(entry => entry.isSelf);
  const weekRange = weekRangeLabel();

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

  return <PublicShell showNavigation={false}>
    <PageHeader title="学习排行榜" backTo="/courses" />
    <div className="space-y-4 px-4 py-5">
      <Card className="overflow-hidden border border-border-subtle p-0">
        <div className="flex items-start gap-3 p-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-[16px] bg-primary-container text-text-brand"><Trophy size={22} aria-hidden="true" /></span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-base font-semibold text-text-primary">本周学习排行榜</h1>
              <StatusTag tone="info">周榜</StatusTag>
            </div>
            <p className="mt-1 text-xs text-text-tertiary">{weekRange} · 每周进入新的榜单周期</p>
            <p className="mt-2 text-sm leading-6 text-text-secondary">仅按本周课程学习时长排名，点赞不参与排名。</p>
          </div>
        </div>
        <div className="border-t border-border-subtle p-3">
          <BoardTabs scope={scope} onChange={setScope} />
        </div>
      </Card>

      <Card className="overflow-hidden border border-border-subtle p-0">
        <div className="flex items-end justify-between gap-3 border-b border-border-subtle px-4 py-3">
          <div>
            <h2 className="text-sm font-semibold text-text-primary">{scope === "school" ? "本校 Top 10" : "全国 Top 10"}</h2>
            <p className="mt-1 text-xs text-text-tertiary">{scope === "school" ? mySchool : "全国高校"} · 本周课程学习时长</p>
          </div>
          <span className="text-xs text-text-tertiary">Top 10</span>
        </div>
        <div data-testid="leaderboard-list" data-week-key={currentWeekKey} className="divide-y divide-border-subtle">
          {entries.map(entry => <LeaderboardRow
            key={entry.id}
            entry={entry}
            scope={scope}
            liked={likedPeople.has(entry.personKey)}
            onToggleLike={() => toggleLike(entry.personKey)}
          />)}
        </div>
      </Card>

      {!selfInTopTen && <section aria-labelledby="my-ranking-title" className="space-y-2">
        <div className="flex items-end justify-between gap-3 px-1">
          <h2 id="my-ranking-title" className="text-sm font-semibold text-text-primary">我的排名</h2>
          <span className="text-xs text-text-tertiary">未进入 Top 10 也会保留</span>
        </div>
        <Card className="overflow-hidden border border-primary/20 bg-primary-container/30 p-0">
          <LeaderboardRow
            entry={schoolSelfStanding}
            scope="school"
            liked={false}
            onToggleLike={() => undefined}
          />
        </Card>
      </section>}

      <Card className="border border-border-subtle bg-surface-subtle">
        <h2 className="text-sm font-semibold text-text-primary">榜单规则</h2>
        <div className="mt-2 space-y-1.5 text-xs leading-5 text-text-secondary">
          <p>· 本校榜与全国榜均只按本周课程学习时长排序。</p>
          <p>· 全国榜额外展示所属学校；本校榜保持更紧凑的信息密度。</p>
          <p>· 点赞按周记录；取消后可以重新点赞，新一周会进入新的点赞周期。</p>
          <p>· 点赞只表达互动，不改变当前排名；用户不能给自己点赞。</p>
        </div>
      </Card>
    </div>
  </PublicShell>;
}

// Prototype-only data note for T056/T058:
// `managed` is deliberately never rendered. It represents dynamically supplemented accounts from promoted schools.
// Managed examples are mixed across ranks instead of occupying fixed top positions, and real-user examples can rank above them.
// T058 stores only the current viewer's active likes, namespaced by Monday week key, so a new week naturally starts a new interaction cycle.

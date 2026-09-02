import { Clock3, Crown, Heart, Megaphone, Orbit, School, ShieldCheck, Sparkles, Trophy } from "lucide-react";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { Card, PageHeader, PublicShell } from "../../components/ui";
import type { LeaderboardRole } from "./LeaderboardIdentity";

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
  isSelf?: boolean;
  managed?: boolean;
};

const mySchool = "广东财经大学";
const myPublicName = "新芽同学";
const myRoles: LeaderboardRole[] = ["推荐官"];
const weeklyLikeStoragePrefix = "core.learning-leaderboard.likes.";

const schoolBoard: LeaderboardEntry[] = [
  { id: "s1", personKey: "lin-zhixia", rank: 1, name: "林知夏", school: mySchool, minutes: 512, likes: 38, roles: ["校园大使"] },
  { id: "s2", personKey: "school-zhou-kexin", rank: 2, name: "周可昕", school: mySchool, minutes: 476, likes: 31, roles: ["推荐官"], managed: true },
  { id: "s3", personKey: "chen-yizhou", rank: 3, name: "陈一舟", school: mySchool, minutes: 441, likes: 27, roles: [] },
  { id: "s4", personKey: "nanfeng", rank: 4, name: "南风同学", school: mySchool, minutes: 407, likes: 22, roles: [] },
  { id: "s5", personKey: "ajian", rank: 5, name: "阿简", school: mySchool, minutes: 382, likes: 19, roles: ["校园大使"], managed: true },
  { id: "s6", personKey: "mumian", rank: 6, name: "木棉", school: mySchool, minutes: 354, likes: 17, roles: [] },
  { id: "s7", personKey: "xiaoman", rank: 7, name: "小满", school: mySchool, minutes: 329, likes: 15, roles: ["推荐官"] },
  { id: "s8", personKey: "xingyu", rank: 8, name: "星屿", school: mySchool, minutes: 301, likes: 14, roles: [] },
  { id: "s9", personKey: "chichuan", rank: 9, name: "迟川", school: mySchool, minutes: 276, likes: 12, roles: [], managed: true },
  { id: "s10", personKey: "xiazhi", rank: 10, name: "夏栀", school: mySchool, minutes: 248, likes: 11, roles: [] },
];

const nationalBoard: LeaderboardEntry[] = [
  { id: "n1", personKey: "guyan", rank: 1, name: "顾言", school: "华南理工大学", minutes: 588, likes: 45, roles: ["校园大使"] },
  { id: "n2", personKey: "xuyou", rank: 2, name: "许柚", school: "深圳大学", minutes: 561, likes: 41, roles: [] },
  { id: "n3", personKey: "lin-zhixia", rank: 3, name: "林知夏", school: mySchool, minutes: 512, likes: 38, roles: ["校园大使"], managed: true },
  { id: "n4", personKey: "national-zhou-kexin", rank: 4, name: "周可昕", school: "暨南大学", minutes: 476, likes: 31, roles: ["推荐官"] },
  { id: "n5", personKey: "baiyu", rank: 5, name: "白榆", school: "广东工业大学", minutes: 451, likes: 29, roles: [] },
  { id: "n6", personKey: "jiangcheng", rank: 6, name: "江澄", school: "华南师范大学", minutes: 428, likes: 25, roles: ["推荐官"], managed: true },
  { id: "n7", personKey: "beiye", rank: 7, name: "北野", school: "广州大学", minutes: 402, likes: 23, roles: [] },
  { id: "me", personKey: "me", rank: 8, name: myPublicName, school: mySchool, minutes: 390, likes: 21, roles: myRoles, isSelf: true },
  { id: "n9", personKey: "qinghe", rank: 9, name: "青禾", school: "广东金融学院", minutes: 367, likes: 20, roles: [] },
  { id: "n10", personKey: "shiguang", rank: 10, name: "拾光", school: "广州商学院", minutes: 349, likes: 18, roles: [], managed: true },
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
  isSelf: true,
};

const avatarPalettes: CSSProperties[] = [
  { background: "linear-gradient(145deg,#DFE5FF 0%,#8798FF 100%)", color: "#2837A8" },
  { background: "linear-gradient(145deg,#FFE8BE 0%,#FFBE62 100%)", color: "#8C4B00" },
  { background: "linear-gradient(145deg,#E8DEFF 0%,#A68DFF 100%)", color: "#5332C7" },
  { background: "linear-gradient(145deg,#DDF8EE 0%,#82DDB7 100%)", color: "#147251" },
  { background: "linear-gradient(145deg,#FFE4E8 0%,#F59AA7 100%)", color: "#9B3243" },
  { background: "linear-gradient(145deg,#DDF3FF 0%,#7DCBFF 100%)", color: "#176A9D" },
];

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

function avatarStyle(entry: LeaderboardEntry) {
  const hash = [...entry.personKey].reduce((total, char) => total + char.charCodeAt(0), 0);
  return avatarPalettes[hash % avatarPalettes.length];
}

function LearnerAvatar({ entry, featured = false, champion = false }: { entry: LeaderboardEntry; featured?: boolean; champion?: boolean }) {
  const size = featured ? (champion ? "size-[78px] text-[25px]" : "size-[66px] text-xl") : "size-9 text-sm";
  return (
    <span
      aria-label={`${entry.name}公开头像`}
      role="img"
      className={`relative grid shrink-0 place-items-center overflow-hidden rounded-full font-bold ${size}`}
      style={{
        ...avatarStyle(entry),
        boxShadow: champion
          ? "0 0 0 4px #FFFFFF, 0 0 0 7px #F6C54C, 0 12px 30px rgba(209,145,0,.28)"
          : featured
            ? "0 0 0 3px #FFFFFF, 0 0 0 5px rgba(112,91,255,.18), 0 10px 24px rgba(78,68,160,.14)"
            : "0 0 0 2px #FFFFFF, 0 4px 12px rgba(70,73,110,.12)",
      }}
    >
      <span className="absolute inset-x-2 top-1 h-5 rounded-full bg-white/25 blur-sm" />
      <span className="relative z-10">{entry.name.slice(0, 1)}</span>
    </span>
  );
}

function PremiumRoleBadges({ roles }: { roles: LeaderboardRole[] }) {
  if (!roles.length) return null;
  return (
    <span className="inline-flex min-w-0 flex-wrap items-center gap-1" aria-label={`身份：${roles.join("、")}`}>
      {roles.map(role => {
        const ambassador = role === "校园大使";
        const Icon = ambassador ? ShieldCheck : Megaphone;
        return (
          <span
            key={role}
            data-leaderboard-role={role}
            className={`inline-flex min-h-6 items-center gap-1 whitespace-nowrap rounded-full border px-2 text-[10px] font-bold leading-none ${ambassador ? "border-[#F6D58A] bg-[#FFF3D6] text-[#B56700]" : "border-[#D9D0FF] bg-[#F1EDFF] text-[#6247E8]"}`}
          >
            <Icon size={11} strokeWidth={2.2} aria-hidden="true" />
            {role}
          </span>
        );
      })}
    </span>
  );
}

function PremiumSelfBadge() {
  return (
    <span
      data-leaderboard-state="self"
      className="inline-flex min-h-5 items-center rounded-full bg-[#6854F7] px-1.5 text-[10px] font-bold leading-none text-white shadow-[0_4px_10px_rgba(104,84,247,.22)]"
    >
      我
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
      className={`inline-flex shrink-0 items-center justify-center gap-1 rounded-full border transition active:scale-[.97] ${compact ? "min-h-7 px-2 text-[11px]" : "min-h-9 px-2.5 text-xs"} ${entry.isSelf ? "cursor-not-allowed border-[#ECEEF5] bg-[#F5F6FA] text-[#9AA1B3]" : liked ? "border-[#D7CDFF] bg-[#F1EDFF] text-[#6247E8] shadow-[0_4px_12px_rgba(98,71,232,.10)]" : "border-transparent bg-transparent text-[#68718A] hover:bg-[#F6F4FF]"}`}
    >
      <Heart size={compact ? 13 : 15} aria-hidden="true" className={liked ? "fill-current" : ""} />
      <span data-testid="like-count">{likes}</span>
    </button>
  );
}

function BoardTabs({ scope, onChange }: { scope: BoardScope; onChange: (scope: BoardScope) => void }) {
  return (
    <div className="grid grid-cols-2 border-b border-[#E7E9F1] bg-white" aria-label="排行榜范围">
      {(["school", "national"] as const).map(value => {
        const active = scope === value;
        return (
          <button
            key={value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(value)}
            className={`relative min-h-[52px] text-[15px] font-bold transition ${active ? "text-[#5D43F3]" : "text-[#252B3D]"}`}
          >
            {value === "school" ? "本校榜" : "全国榜"}
            {active && <span className="absolute bottom-0 left-1/2 h-[3px] w-10 -translate-x-1/2 rounded-full bg-[#6548FF] shadow-[0_0_10px_rgba(101,72,255,.45)]" />}
          </button>
        );
      })}
    </div>
  );
}

function BoardHero({ scope }: { scope: BoardScope }) {
  const Icon = scope === "school" ? School : Orbit;
  return (
    <div className="relative overflow-hidden rounded-[20px] px-5 py-5 text-white shadow-[0_18px_38px_rgba(70,61,190,.22)]" style={{ background: "linear-gradient(120deg,#5841F4 0%,#735CF8 52%,#50A7F4 100%)" }}>
      <div className="absolute inset-0 opacity-70" style={{ background: "radial-gradient(circle at 38% 0%,rgba(255,255,255,.20),transparent 38%),radial-gradient(circle at 100% 100%,rgba(63,210,255,.35),transparent 40%)" }} />
      <Sparkles className="absolute left-[58%] top-6 text-white/70" size={17} aria-hidden="true" />
      <div className="relative z-10 max-w-[62%]">
        <h2 className="text-[20px] font-extrabold tracking-[.01em]">{scope === "school" ? "本校学习排行榜" : "全国学习排行榜"}</h2>
        <p className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-medium text-white/85"><Clock3 size={14} aria-hidden="true" />每周一 00:00 更新</p>
      </div>

      <div className="absolute -right-1 top-1/2 h-[104px] w-[150px] -translate-y-1/2">
        <div className="absolute right-1 top-1/2 size-[88px] -translate-y-1/2 rounded-full bg-white/12 shadow-[inset_0_0_28px_rgba(255,255,255,.16)] backdrop-blur-[2px]" />
        <div className="absolute right-[4px] top-[50px] h-[52px] w-[132px] -rotate-[12deg] rounded-[50%] border border-white/35" />
        <div className="absolute right-[12px] top-[39px] h-[46px] w-[114px] rotate-[18deg] rounded-[50%] border border-cyan-200/55" />
        <span className="absolute right-[117px] top-[48px] size-2.5 rounded-full bg-[#FFB544] shadow-[0_0_12px_rgba(255,181,68,.85)]" />
        <span className="absolute right-[7px] top-[66px] size-2 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,.9)]" />
        <div className="absolute right-[22px] top-1/2 grid size-[62px] -translate-y-1/2 place-items-center rounded-full border border-white/30 bg-white/12 backdrop-blur-[3px]">
          {scope === "national" ? <Trophy size={38} strokeWidth={1.7} aria-hidden="true" /> : <Icon size={38} strokeWidth={1.7} aria-hidden="true" />}
        </div>
      </div>
    </div>
  );
}

function podiumTheme(rank: number) {
  if (rank === 1) {
    return {
      card: "border-[#F4CF76] bg-[linear-gradient(180deg,#FFFDF6_0%,#FFF8E6_100%)] shadow-[0_16px_34px_rgba(204,147,31,.16)]",
      rank: "bg-[linear-gradient(135deg,#FFCA45,#F0A100)] text-white shadow-[0_6px_15px_rgba(240,161,0,.28)]",
      time: "border-[#F7E2A8] bg-[#FFF1C9] text-[#9A5A00]",
    };
  }
  if (rank === 2) {
    return {
      card: "border-[#CED7FF] bg-[linear-gradient(180deg,#FFFFFF_0%,#F4F7FF_100%)] shadow-[0_12px_28px_rgba(80,97,176,.12)]",
      rank: "bg-[linear-gradient(135deg,#AEB8D5,#6F7B9D)] text-white shadow-[0_5px_12px_rgba(78,91,132,.2)]",
      time: "border-[#DDE4FF] bg-[#EEF2FF] text-[#3E56C5]",
    };
  }
  return {
    card: "border-[#FFD8C9] bg-[linear-gradient(180deg,#FFFFFF_0%,#FFF6F2_100%)] shadow-[0_12px_28px_rgba(180,93,63,.10)]",
    rank: "bg-[linear-gradient(135deg,#F0A47B,#C56745)] text-white shadow-[0_5px_12px_rgba(197,103,69,.2)]",
    time: "border-[#FFE1D5] bg-[#FFF0EA] text-[#B64E2E]",
  };
}

function PodiumEntry({ entry, liked, onToggleLike }: { entry: LeaderboardEntry; liked: boolean; onToggleLike: () => void }) {
  const champion = entry.rank === 1;
  const theme = podiumTheme(entry.rank);
  return (
    <div
      data-testid="leaderboard-row"
      data-entry-id={entry.id}
      data-person-key={entry.personKey}
      data-self={entry.isSelf ? "true" : "false"}
      className={`relative flex min-w-0 flex-col items-center rounded-[20px] border px-2 pb-3 text-center ${champion ? "min-h-[260px] pt-8" : "min-h-[234px] pt-7"} ${theme.card}`}
    >
      {champion && (
        <>
          <div className="pointer-events-none absolute -top-10 left-1/2 h-36 w-36 -translate-x-1/2 rounded-full opacity-50" style={{ background: "repeating-conic-gradient(from 0deg,rgba(255,211,94,.20) 0 7deg,transparent 7deg 18deg)" }} />
          <Crown className="absolute -top-3 left-1/2 z-20 -translate-x-1/2 text-[#F4B315] drop-shadow-[0_4px_8px_rgba(244,179,21,.22)]" size={28} fill="#FFD65C" aria-hidden="true" />
        </>
      )}

      <div className="relative z-10">
        <LearnerAvatar entry={entry} featured champion={champion} />
        <span className={`absolute -bottom-4 left-1/2 grid size-8 -translate-x-1/2 place-items-center rounded-full text-xs font-extrabold ${theme.rank}`}>{entry.rank}</span>
      </div>

      <div className="relative z-10 mt-6 flex min-w-0 flex-1 flex-col items-center">
        <div className="flex min-w-0 flex-wrap items-center justify-center gap-1">
          <span className="max-w-[94px] truncate text-[15px] font-extrabold text-[#171B2A]">{entry.name}</span>
          {entry.isSelf && <PremiumSelfBadge />}
        </div>
        <div className="mt-1.5 min-h-6"><PremiumRoleBadges roles={entry.roles} /></div>
        <span className="mt-1 max-w-[112px] truncate text-[11px] font-medium text-[#747D94]">{entry.school}</span>
        <span className={`mt-2 rounded-full border px-2.5 py-1 text-xs font-extrabold ${theme.time}`}>{formatDuration(entry.minutes)}</span>
        <div className="mt-auto pt-2"><LikeButton entry={entry} liked={liked} onToggle={onToggleLike} compact /></div>
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
      className={`relative grid min-h-[70px] items-center gap-1.5 border-t border-[#ECEEF5] px-3 py-2.5 ${national ? "grid-cols-[24px_minmax(0,1fr)_82px_66px_44px]" : "grid-cols-[24px_minmax(0,1fr)_72px_44px]"} ${entry.isSelf ? "z-[1] mx-1 my-1 rounded-[14px] border border-[#B9ABFF] bg-[linear-gradient(90deg,#F6F2FF_0%,#F2F5FF_100%)] px-2 shadow-[0_8px_20px_rgba(89,67,223,.11)]" : "bg-white"}`}
    >
      <span className={`text-center text-sm font-extrabold ${entry.isSelf ? "text-[#6247E8]" : "text-[#20263A]"}`}>{entry.rank}</span>
      <div className="flex min-w-0 items-center gap-2">
        <LearnerAvatar entry={entry} />
        <div className="min-w-0">
          <div className="flex min-w-0 flex-wrap items-center gap-1">
            <span className="truncate text-[12px] font-bold text-[#1E2437]">{entry.name}</span>
            {entry.isSelf && <PremiumSelfBadge />}
          </div>
          <div className="mt-0.5"><PremiumRoleBadges roles={entry.roles} /></div>
        </div>
      </div>
      {national && <span className="line-clamp-2 text-[10px] font-medium leading-4 text-[#737C94]">{entry.school}</span>}
      <span className={`whitespace-nowrap text-[11px] font-bold ${entry.isSelf ? "text-[#6247E8]" : "text-[#2C3348]"}`}>{formatDuration(entry.minutes)}</span>
      <LikeButton entry={entry} liked={liked} onToggle={onToggleLike} compact />
    </div>
  );
}

function TableHeader({ scope }: { scope: BoardScope }) {
  const national = scope === "national";
  return (
    <div className={`grid items-center gap-1.5 bg-[#F1F3F8] px-3 py-2.5 text-[10px] font-semibold text-[#737C94] ${national ? "grid-cols-[24px_minmax(0,1fr)_82px_66px_44px]" : "grid-cols-[24px_minmax(0,1fr)_72px_44px]"}`}>
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
    <section aria-labelledby="my-ranking-title" className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <h2 id="my-ranking-title" className="text-[13px] font-extrabold text-[#5D43F3]">我的排名</h2>
        <span className="text-[11px] text-[#8A91A5]">未进入 Top10 也会保留</span>
      </div>
      <div className={`grid min-h-[70px] items-center gap-1.5 rounded-[18px] border border-[#A99AFF] bg-[linear-gradient(100deg,#FBF9FF_0%,#F2F4FF_100%)] px-3 py-2.5 shadow-[0_12px_28px_rgba(91,67,216,.13)] ${scope === "national" ? "grid-cols-[26px_minmax(0,1fr)_82px_66px_48px]" : "grid-cols-[26px_minmax(0,1fr)_72px_48px]"}`}>
        <span className="text-center text-base font-extrabold text-[#6247E8]">{entry.rank}</span>
        <div className="flex min-w-0 items-center gap-2">
          <LearnerAvatar entry={entry} />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1">
              <span className="truncate text-[12px] font-extrabold text-[#1D2336]">{entry.name}</span>
              <PremiumSelfBadge />
            </div>
            <div className="mt-0.5"><PremiumRoleBadges roles={entry.roles} /></div>
          </div>
        </div>
        {scope === "national" && <span className="text-[10px] font-medium leading-4 text-[#737C94]">{entry.school}</span>}
        <span className="whitespace-nowrap text-[11px] font-extrabold text-[#6247E8]">{formatDuration(entry.minutes)}</span>
        <span className="inline-flex items-center justify-center gap-1 text-xs font-bold text-[#6247E8]"><Heart size={14} className="fill-current" aria-hidden="true" />{entry.likes}</span>
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
      <div className="min-h-screen bg-[linear-gradient(180deg,#F8F9FF_0%,#F4F6FB_46%,#F7F8FC_100%)]">
        <PageHeader
          title="学习排行榜"
          backTo="/courses"
          right={
            <button type="button" onClick={() => setShowRules(value => !value)} className="min-h-touch px-2 text-xs font-semibold text-[#4C5368]">
              规则说明
            </button>
          }
        />
        <h2 className="sr-only">本周学习排行榜</h2>
        <BoardTabs scope={scope} onChange={setScope} />

        <div className="space-y-5 px-4 py-4">
          <BoardHero scope={scope} />

          {showRules && (
            <Card className="border border-[#E2E5EF] bg-white/90 px-4 py-3 shadow-[0_10px_30px_rgba(45,52,94,.07)] backdrop-blur-sm">
              <h3 className="text-sm font-extrabold text-[#20263A]">排行榜规则</h3>
              <div className="mt-2 space-y-1 text-xs leading-5 text-[#656E85]">
                <p>· 仅按本周课程学习时长排名，每周一进入新周期。</p>
                <p>· 点赞按周记录，可取消后重新点赞，但不参与排名。</p>
                <p>· 全国榜展示学校；校园大使 / 推荐官仅作身份识别。</p>
              </div>
            </Card>
          )}

          <section data-testid="leaderboard-list" className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-[15px] font-extrabold text-[#20263A]">本周课程学习时长排名</h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/70 px-2 py-1 text-[11px] font-medium text-[#737C94]"><Clock3 size={13} aria-hidden="true" />周榜</span>
            </div>

            <div className="grid grid-cols-[1fr_1.14fr_1fr] items-end gap-2 pb-1">
              {topThree.map(entry => (
                <PodiumEntry
                  key={entry.id}
                  entry={entry}
                  liked={likedPeople.has(entry.personKey)}
                  onToggleLike={() => toggleLike(entry.personKey)}
                />
              ))}
            </div>

            <div className="overflow-hidden rounded-[22px] border border-[#E4E7F0] bg-white shadow-[0_16px_42px_rgba(49,56,104,.09)]">
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
            </div>
          </section>

          {!selfInTopTen && <SelfRankingCard entry={schoolSelfStanding} scope="school" />}

          <div className="pb-3 pt-1 text-center">
            <p className="inline-flex items-center gap-1.5 text-xs font-medium text-[#8A91A5]">
              <Sparkles size={13} className="text-[#8E78FF]" aria-hidden="true" />
              {selfInTopTen ? "已经进入 Top10，继续保持本周学习节奏。" : "未进入 Top10？别着急，你的排名也在不断上升中。"}
            </p>
          </div>
        </div>
      </div>
    </PublicShell>
  );
}

// Prototype-only data note:
// `managed` is deliberately never rendered. It represents dynamically supplemented accounts from promoted schools.
// Managed examples are mixed across ranks instead of occupying fixed top positions, and real-user examples can rank above them.

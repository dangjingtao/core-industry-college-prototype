import { Clock3, Heart } from "lucide-react";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { PageHeader, PublicShell } from "../../components/ui";
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

const ASSET_BASE = "/assets/learning-leaderboard";
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
  const size = featured ? (champion ? "size-[76px] text-2xl" : "size-[64px] text-xl") : "size-9 text-sm";
  return (
    <span
      aria-label={`${entry.name}公开头像`}
      role="img"
      className={`relative grid shrink-0 place-items-center overflow-hidden rounded-full font-bold ${size}`}
      style={{
        ...avatarStyle(entry),
        boxShadow: champion
          ? "0 0 0 4px #fff,0 0 0 7px #F5C84E,0 14px 30px rgba(185,126,0,.22)"
          : featured
            ? "0 0 0 3px #fff,0 0 0 5px rgba(91,84,222,.16),0 10px 22px rgba(70,64,145,.13)"
            : "0 0 0 2px #fff,0 4px 12px rgba(70,73,110,.12)",
      }}
    >
      <span className="absolute inset-x-2 top-1 h-5 rounded-full bg-white/25 blur-sm" />
      <span className="relative z-10">{entry.name.slice(0, 1)}</span>
    </span>
  );
}

function RankMaterial({ rank, champion = false }: { rank: number; champion?: boolean }) {
  if (rank < 1 || rank > 3) return null;
  return (
    <img
      src={`${ASSET_BASE}/rank-${rank}.webp`}
      alt={`第${rank}名奖牌`}
      data-testid={`rank-material-${rank}`}
      className={`${champion ? "h-[64px] w-[64px]" : "h-[52px] w-[52px]"} object-contain drop-shadow-[0_8px_12px_rgba(36,49,124,.20)]`}
    />
  );
}

function MaterialRoleBadges({ roles, compact = false }: { roles: LeaderboardRole[]; compact?: boolean }) {
  if (!roles.length) return null;
  return (
    <span className={`inline-flex min-w-0 flex-wrap items-center ${compact ? "gap-0.5" : "gap-1"}`} aria-label={`身份：${roles.join("、")}`}>
      {roles.map(role => {
        const file = role === "校园大使" ? "campus-ambassador.webp" : "recommender.webp";
        return (
          <span key={role} data-leaderboard-role={role} className="inline-flex items-center">
            <img
              src={`${ASSET_BASE}/${file}`}
              alt={role}
              data-testid={`role-material-${role}`}
              className={`${compact ? "h-[18px] w-[54px]" : "h-[27px] w-[82px]"} object-contain drop-shadow-[0_3px_5px_rgba(31,67,162,.14)]`}
            />
          </span>
        );
      })}
    </span>
  );
}

function SelfBadge() {
  return <span data-leaderboard-state="self" className="inline-flex min-h-5 items-center rounded-full bg-[#6854F7] px-1.5 text-[10px] font-bold leading-none text-white">我</span>;
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
      className={`inline-flex shrink-0 items-center justify-center gap-1 rounded-full border transition active:scale-[.97] ${compact ? "min-h-7 px-2 text-[11px]" : "min-h-9 px-2.5 text-xs"} ${entry.isSelf ? "cursor-not-allowed border-[#ECEEF5] bg-[#F5F6FA] text-[#9AA1B3]" : liked ? "border-[#D7CDFF] bg-[#F1EDFF] text-[#6247E8]" : "border-transparent text-[#68718A] hover:bg-[#F6F4FF]"}`}
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
          <button key={value} type="button" aria-pressed={active} onClick={() => onChange(value)} className={`relative min-h-[52px] text-[15px] font-bold transition ${active ? "text-[#5D43F3]" : "text-[#252B3D]"}`}>
            {value === "school" ? "本校榜" : "全国榜"}
            {active && <span className="absolute bottom-0 left-1/2 h-[3px] w-10 -translate-x-1/2 rounded-full bg-[#6548FF] shadow-[0_0_10px_rgba(101,72,255,.40)]" />}
          </button>
        );
      })}
    </div>
  );
}

function BoardHero({ scope }: { scope: BoardScope }) {
  return (
    <div className="relative h-[122px] overflow-hidden rounded-[20px] shadow-[0_18px_38px_rgba(46,70,170,.18)]" data-testid="weekly-material-banner">
      <img src={`${ASSET_BASE}/weekly-banner.webp`} alt="周榜荣耀横幅" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(17,71,207,.08),rgba(16,53,177,.10))]" />
      <div className="absolute left-[112px] top-1/2 z-10 -translate-y-1/2 text-white drop-shadow-[0_2px_4px_rgba(0,39,126,.35)]">
        <h2 className="text-[19px] font-extrabold tracking-[.01em]">{scope === "school" ? "本校学习排行榜" : "全国学习排行榜"}</h2>
        <p className="mt-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-white/90"><Clock3 size={13} aria-hidden="true" />每周一 00:00 更新</p>
      </div>
    </div>
  );
}

function podiumTone(rank: number) {
  if (rank === 1) return { border: "#F1C65C", bg: "linear-gradient(180deg,#FFFDF6 0%,#FFF8E8 100%)", shadow: "0 18px 36px rgba(184,129,8,.16)" };
  if (rank === 2) return { border: "#BBC8F8", bg: "linear-gradient(180deg,#FFFFFF 0%,#F5F7FF 100%)", shadow: "0 12px 28px rgba(74,92,174,.11)" };
  return { border: "#F1C2A8", bg: "linear-gradient(180deg,#FFFFFF 0%,#FFF5F0 100%)", shadow: "0 12px 28px rgba(181,99,52,.10)" };
}

function PodiumEntry({ entry, liked, onToggleLike }: { entry: LeaderboardEntry; liked: boolean; onToggleLike: () => void }) {
  const champion = entry.rank === 1;
  const tone = podiumTone(entry.rank);
  return (
    <div
      data-testid="leaderboard-row"
      data-entry-id={entry.id}
      data-person-key={entry.personKey}
      data-self={entry.isSelf ? "true" : "false"}
      className={`relative flex min-w-0 flex-col items-center rounded-[20px] border px-1.5 pb-3 text-center ${champion ? "min-h-[235px] pt-[46px]" : "min-h-[210px] pt-[40px]"}`}
      style={{ borderColor: tone.border, background: tone.bg, boxShadow: tone.shadow }}
    >
      <div className={`absolute left-1/2 z-20 -translate-x-1/2 ${champion ? "-top-8" : "-top-6"}`}><RankMaterial rank={entry.rank} champion={champion} /></div>
      {champion && <div className="pointer-events-none absolute -top-6 left-1/2 h-[120px] w-[120px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,213,94,.25),transparent_68%)]" />}
      <LearnerAvatar entry={entry} featured champion={champion} />
      <div className="mt-3 flex min-w-0 flex-col items-center gap-1">
        <div className="flex min-w-0 flex-wrap items-center justify-center gap-1">
          <span className="max-w-[92px] truncate text-[14px] font-extrabold text-[#171B2A]">{entry.name}</span>
          {entry.isSelf && <SelfBadge />}
        </div>
        <MaterialRoleBadges roles={entry.roles} />
        <span className="max-w-[108px] truncate text-[10px] text-[#788197]">{entry.school}</span>
        <span className={`mt-0.5 rounded-full px-2 py-1 text-xs font-extrabold ${champion ? "bg-[#FFF0C6] text-[#A85B00]" : entry.rank === 2 ? "bg-[#EEF1FF] text-[#3853BC]" : "bg-[#FFF0E8] text-[#B55324]"}`}>{formatDuration(entry.minutes)}</span>
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
      className={`grid min-h-[66px] items-center gap-2 border-t border-[#ECEEF5] px-3 py-2.5 ${national ? "grid-cols-[24px_minmax(0,1fr)_66px_62px_44px]" : "grid-cols-[24px_minmax(0,1fr)_66px_44px]"}`}
      style={entry.isSelf ? { background: "linear-gradient(90deg,#F4F0FF 0%,#FBFAFF 100%)", boxShadow: "inset 3px 0 #7257FF" } : undefined}
    >
      <span className={`text-center text-xs font-extrabold ${entry.isSelf ? "text-[#6247E8]" : "text-[#252B3D]"}`}>{entry.rank}</span>
      <div className="flex min-w-0 items-center gap-2">
        <LearnerAvatar entry={entry} />
        <div className="min-w-0">
          <div className="flex min-w-0 flex-wrap items-center gap-1">
            <span className="truncate text-xs font-bold text-[#252B3D]">{entry.name}</span>
            {entry.isSelf && <SelfBadge />}
          </div>
          <div className="mt-0.5"><MaterialRoleBadges roles={entry.roles} compact /></div>
        </div>
      </div>
      {national && <span className="line-clamp-2 text-[9px] leading-3.5 text-[#737C91]">{entry.school}</span>}
      <span className={`whitespace-nowrap text-[10px] font-bold ${entry.isSelf ? "text-[#6247E8]" : "text-[#252B3D]"}`}>{formatDuration(entry.minutes)}</span>
      <LikeButton entry={entry} liked={liked} onToggle={onToggleLike} compact />
    </div>
  );
}

function TableHeader({ scope }: { scope: BoardScope }) {
  const national = scope === "national";
  return (
    <div className={`grid items-center gap-2 bg-[linear-gradient(90deg,#F5F6FC,#F0F2FA)] px-3 py-2.5 text-[9px] font-semibold text-[#687288] ${national ? "grid-cols-[24px_minmax(0,1fr)_66px_62px_44px]" : "grid-cols-[24px_minmax(0,1fr)_66px_44px]"}`}>
      <span className="text-center">排名</span><span>用户</span>{national && <span>学校</span>}<span>本周学习时长</span><span className="text-center">点赞</span>
    </div>
  );
}

function SelfRankingCard({ entry }: { entry: LeaderboardEntry }) {
  return (
    <section aria-labelledby="my-ranking-title" className="space-y-2">
      <h2 id="my-ranking-title" className="px-1 text-xs font-extrabold text-[#6247E8]">我的排名</h2>
      <div className="grid min-h-[70px] grid-cols-[30px_minmax(0,1fr)_68px_48px] items-center gap-2 rounded-[18px] border border-[#846FFF] bg-[linear-gradient(90deg,#F2EEFF,#FCFBFF)] px-3 py-2.5 shadow-[0_10px_24px_rgba(103,78,232,.12)]">
        <span className="text-center text-base font-black text-[#6247E8]">{entry.rank}</span>
        <div className="flex min-w-0 items-center gap-2">
          <LearnerAvatar entry={entry} />
          <div className="min-w-0"><div className="flex items-center gap-1"><span className="truncate text-xs font-extrabold text-[#252B3D]">{entry.name}</span><SelfBadge /></div><div className="mt-0.5"><MaterialRoleBadges roles={entry.roles} compact /></div></div>
        </div>
        <span className="whitespace-nowrap text-[10px] font-extrabold text-[#6247E8]">{formatDuration(entry.minutes)}</span>
        <span className="inline-flex items-center justify-center gap-1 text-xs font-bold text-[#6247E8]"><Heart size={13} className="fill-current" aria-hidden="true" />{entry.likes}</span>
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

  useEffect(() => setLikedPeople(readWeeklyLikes(storageKey)), [storageKey]);

  const toggleLike = (personKey: string) => {
    setLikedPeople(previous => {
      const next = new Set(previous);
      if (next.has(personKey)) next.delete(personKey); else next.add(personKey);
      if (typeof window !== "undefined") window.localStorage.setItem(storageKey, JSON.stringify([...next]));
      return next;
    });
  };

  return (
    <PublicShell showNavigation={false}>
      <PageHeader title="学习排行榜" backTo="/courses" right={<button type="button" onClick={() => setShowRules(value => !value)} className="min-h-touch px-2 text-xs font-medium text-[#4F5870]">规则说明</button>} />
      <h2 className="sr-only">本周学习排行榜</h2>
      <BoardTabs scope={scope} onChange={setScope} />

      <div className="space-y-5 bg-[#F7F8FC] px-4 py-4">
        <BoardHero scope={scope} />

        {showRules && <div className="rounded-[16px] border border-[#E3E5EE] bg-white px-4 py-3 shadow-[0_8px_20px_rgba(41,49,86,.06)]"><h3 className="text-sm font-extrabold text-[#252B3D]">排行榜规则</h3><div className="mt-2 space-y-1 text-xs leading-5 text-[#596278]"><p>· 仅按本周课程学习时长排名，每周一进入新周期。</p><p>· 点赞按周记录，可取消后重新点赞，但不参与排名。</p><p>· 全国榜展示学校；校园大使 / 推荐官仅作身份识别。</p></div></div>}

        <section data-testid="leaderboard-list" className="space-y-3">
          <div className="flex items-center justify-between px-1"><h3 className="text-[15px] font-extrabold text-[#252B3D]">本周课程学习时长排名</h3><span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#737C91]"><Clock3 size={13} aria-hidden="true" />周榜</span></div>

          <div className="grid grid-cols-3 items-end gap-2 px-0.5 pt-7">
            {topThree.map(entry => <PodiumEntry key={entry.id} entry={entry} liked={likedPeople.has(entry.personKey)} onToggleLike={() => toggleLike(entry.personKey)} />)}
          </div>

          <div className="overflow-hidden rounded-[18px] border border-[#E4E7F0] bg-white shadow-[0_14px_34px_rgba(50,57,94,.09)]">
            <TableHeader scope={scope} />
            {remaining.map(entry => <CompactLeaderboardRow key={entry.id} entry={entry} scope={scope} liked={likedPeople.has(entry.personKey)} onToggleLike={() => toggleLike(entry.personKey)} />)}
          </div>
        </section>

        {!selfInTopTen && <SelfRankingCard entry={schoolSelfStanding} />}
        <p className="pb-3 pt-1 text-center text-xs text-[#858DA0]">{selfInTopTen ? "已经进入 Top10，继续保持本周学习节奏。" : "未进入 Top10？别着急，你的排名也在不断上升中。"}</p>
      </div>
    </PublicShell>
  );
}

// Prototype-only data note: `managed` is deliberately never rendered.
// Managed examples are mixed across ranks instead of occupying fixed top positions.

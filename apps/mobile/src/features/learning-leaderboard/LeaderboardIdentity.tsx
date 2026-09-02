import { BadgeCheck, Megaphone } from "lucide-react";

export type LeaderboardRole = "校园大使" | "推荐官";

const roleSpec = {
  校园大使: {
    Icon: BadgeCheck,
    className: "bg-warning-bg text-warning-text",
  },
  推荐官: {
    Icon: Megaphone,
    className: "bg-info-bg text-info-text",
  },
} satisfies Record<LeaderboardRole, { Icon: typeof BadgeCheck; className: string }>;

export function LeaderboardRoleBadge({ role, compact = false }: { role: LeaderboardRole; compact?: boolean }) {
  const { Icon, className } = roleSpec[role];
  return (
    <span
      data-leaderboard-role={role}
      aria-label={role}
      title={compact ? role : undefined}
      className={`inline-flex min-h-6 items-center gap-1 rounded-full text-[11px] font-semibold leading-none ${compact ? "w-6 justify-center px-0" : "px-2"} ${className}`}
    >
      <Icon size={12} strokeWidth={2} aria-hidden="true" />
      {!compact && role}
    </span>
  );
}

export function LeaderboardRoleBadges({ roles, compact = false }: { roles: LeaderboardRole[]; compact?: boolean }) {
  if (!roles.length) return null;
  return (
    <span className="inline-flex min-w-0 flex-wrap items-center gap-1" aria-label={`身份：${roles.join("、")}`}>
      {roles.map(role => <LeaderboardRoleBadge key={role} role={role} compact={compact} />)}
    </span>
  );
}

export function LeaderboardSelfBadge() {
  return (
    <span
      data-leaderboard-state="self"
      className="inline-flex min-h-6 items-center rounded-full bg-primary-container px-2 text-[11px] font-semibold leading-none text-text-brand"
    >
      我
    </span>
  );
}

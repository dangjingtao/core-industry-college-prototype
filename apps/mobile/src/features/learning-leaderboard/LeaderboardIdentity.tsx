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

export function LeaderboardRoleBadge({ role }: { role: LeaderboardRole }) {
  const { Icon, className } = roleSpec[role];
  return (
    <span
      data-leaderboard-role={role}
      className={`inline-flex min-h-6 items-center gap-1 rounded-full px-2 text-[11px] font-semibold leading-none ${className}`}
    >
      <Icon size={12} strokeWidth={2} aria-hidden="true" />
      {role}
    </span>
  );
}

export function LeaderboardRoleBadges({ roles }: { roles: LeaderboardRole[] }) {
  if (!roles.length) return null;
  return (
    <span className="inline-flex min-w-0 flex-wrap items-center gap-1" aria-label={`身份：${roles.join("、")}`}>
      {roles.map(role => <LeaderboardRoleBadge key={role} role={role} />)}
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

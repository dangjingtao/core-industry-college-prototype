export type LeaderboardRole = "校园大使" | "推荐官";

const ASSET_BASE = "/assets/learning-leaderboard";

const roleSpec = {
  校园大使: {
    asset: `${ASSET_BASE}/campus-ambassador.webp`,
    className: "bg-warning-bg text-warning-text",
  },
  推荐官: {
    asset: `${ASSET_BASE}/recommender.webp`,
    className: "bg-info-bg text-info-text",
  },
} satisfies Record<LeaderboardRole, { asset: string; className: string }>;

export function LeaderboardRoleBadge({ role, compact = false }: { role: LeaderboardRole; compact?: boolean }) {
  const { asset, className } = roleSpec[role];
  return (
    <span
      data-leaderboard-role={role}
      aria-label={role}
      title={compact ? role : undefined}
      className={`inline-flex items-center gap-1 rounded-full text-[11px] font-semibold leading-none ${compact ? "min-h-7  justify-center overflow-hidden p-0" : "min-h-6 px-1.5 pr-2"} ${compact ? "bg-transparent" : className}`}
    >
      <img
        src={asset}
        alt=""
        aria-hidden="true"
        className={`h-7 shrink-0 object-contain`}
      />
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

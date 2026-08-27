export const productName = "产业核心学院";

export type ClientKind = "pc" | "mobile";

export const clientLabels: Record<ClientKind, string> = {
  pc: "电脑端",
  mobile: "手机端",
};

export * from "./course-learning";
export * from "./registration-handoff";
export * from "./Dialog";
export * from "./campus-ambassador";
export * from "./campus-ambassador-week";
export * from "./campus-ambassador-state";

// T054: keep the original T052 public function names, but explicitly resolve
// them to the same UTC+8 natural-week implementation used by Mobile T053.
// Explicit exports take precedence over the legacy star-exported helpers.
export {
  weekStartOf,
  weekEndOf,
  formatWeekLabel,
  previousWeek,
  nextWeek,
  deriveCampaignWeekMetrics,
  deriveTeamWeekContributions,
  getTeamWeekAcquisitions,
} from "./campus-ambassador-week-ops";

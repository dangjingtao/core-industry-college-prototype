import { competitionControlById } from "./competition-control-data";

export type SanChuangProfile = {
  competitionId: string;
  editionLabel: string;
  shortLabel: string;
  heroKicker: string;
  performanceEnabled: boolean;
  defaultPerformancePeriodId: string;
};

export type PerformanceSource = "douyin" | "sanchuangGoods";
export type PerformanceEvidenceKind = "orders" | "live" | "videos";
export type PerformanceBatchStatus = "success" | "partial" | "failed";

export type PerformancePeriod = {
  id: string;
  competitionId: string;
  label: string;
  startAt: string;
  endAt: string;
};

export type PerformanceBatch = {
  batchId: string;
  competitionId: string;
  source: PerformanceSource;
  sourceType: "fileImport" | "apiMock";
  periodId: string;
  importedAt: string;
  status: PerformanceBatchStatus;
  detailCount: number;
  note: string;
};

export type OrderEvidence = {
  id: string;
  competitionId: string;
  teamId: string;
  source: PerformanceSource;
  batchId: string;
  occurredAt: string;
  grossAmount: number;
  netAmount: number;
  status: "paid" | "partiallyRefunded";
};

export type LiveEvidence = {
  id: string;
  competitionId: string;
  teamId: string;
  source: PerformanceSource;
  batchId: string;
  startedAt: string;
  durationMinutes: number;
  viewers: number;
  orders: number;
  gmv: number;
};

export type VideoEvidence = {
  id: string;
  competitionId: string;
  teamId: string;
  source: PerformanceSource;
  batchId: string;
  publishedAt: string;
  views: number;
  interactions: number;
};

export type PerformanceFilter = {
  competitionId: string;
  teamId: string;
  source: PerformanceSource | "all";
  periodId: string;
};

export type PerformanceSummary = {
  gmv: number;
  netAmount: number;
  orderCount: number;
  liveCount: number;
  liveGmv: number;
  liveViewers: number;
  videoCount: number;
  videoViews: number;
  videoInteractions: number;
};

export const sanChuangProfiles: SanChuangProfile[] = [
  {
    competitionId: "sanchuang-16",
    editionLabel: "第十六届全国大学生电子商务“创新、创意及创业”挑战赛",
    shortLabel: "第十六届三创赛",
    heroKicker: "旗舰赛事 · 三创赛运营",
    performanceEnabled: true,
    defaultPerformancePeriodId: "2026-08-mid",
  },
];

export const currentSanChuangCompetitionId = "sanchuang-16";

export function sanChuangProfileByCompetitionId(competitionId: string | undefined) {
  return sanChuangProfiles.find(profile => profile.competitionId === competitionId);
}

export function sanChuangCompetitionOptions() {
  return sanChuangProfiles
    .map(profile => ({ profile, competition: competitionControlById(profile.competitionId) }))
    .filter((item): item is { profile: SanChuangProfile; competition: NonNullable<ReturnType<typeof competitionControlById>> } => Boolean(item.competition));
}

export const performancePeriods: PerformancePeriod[] = [
  { id: "2026-08", competitionId: "sanchuang-16", label: "2026-08-01 → 2026-08-31", startAt: "2026-08-01T00:00:00+08:00", endAt: "2026-08-31T23:59:59+08:00" },
  { id: "2026-08-mid", competitionId: "sanchuang-16", label: "2026-08-12 → 2026-08-18", startAt: "2026-08-12T00:00:00+08:00", endAt: "2026-08-18T23:59:59+08:00" },
];

export function performancePeriodsForCompetition(competitionId: string) {
  return performancePeriods.filter(period => period.competitionId === competitionId);
}

export function defaultPerformancePeriodIdFor(competitionId: string) {
  const periods = performancePeriodsForCompetition(competitionId);
  const configured = sanChuangProfileByCompetitionId(competitionId)?.defaultPerformancePeriodId;
  if (configured && periods.some(period => period.id === configured)) return configured;
  return periods[0]?.id ?? "";
}

export const performanceSourceLabels: Record<PerformanceSource, string> = {
  douyin: "抖音",
  sanchuangGoods: "三创好物",
};

export const performanceBatches: PerformanceBatch[] = [
  {
    batchId: "batch-dy-20260818-a",
    competitionId: "sanchuang-16",
    source: "douyin",
    sourceType: "fileImport",
    periodId: "2026-08-mid",
    importedAt: "2026-08-18 10:18",
    status: "success",
    detailCount: 7,
    note: "抖音订单 / 直播 / 视频导出文件归集；原始文件保留批次边界。",
  },
  {
    batchId: "batch-scgoods-20260818-a",
    competitionId: "sanchuang-16",
    source: "sanchuangGoods",
    sourceType: "apiMock",
    periodId: "2026-08-mid",
    importedAt: "2026-08-18 10:24",
    status: "partial",
    detailCount: 4,
    note: "三创好物 API mock；1 个字段缺失已按标准字段空值归集，不修改原始记录。",
  },
  {
    batchId: "batch-dy-20260812-failed",
    competitionId: "sanchuang-16",
    source: "douyin",
    sourceType: "fileImport",
    periodId: "2026-08-mid",
    importedAt: "2026-08-12 21:03",
    status: "failed",
    detailCount: 0,
    note: "历史失败批次示例：文件列头不匹配，未进入聚合口径。",
  },
];

export const orderEvidence: OrderEvidence[] = [
  { id: "dy-order-1001", competitionId: "sanchuang-16", teamId: "team-1", source: "douyin", batchId: "batch-dy-20260818-a", occurredAt: "2026-08-16 11:22", grossAmount: 498, netAmount: 498, status: "paid" },
  { id: "dy-order-1002", competitionId: "sanchuang-16", teamId: "team-1", source: "douyin", batchId: "batch-dy-20260818-a", occurredAt: "2026-08-16 15:08", grossAmount: 329, netAmount: 309, status: "partiallyRefunded" },
  { id: "dy-order-1003", competitionId: "sanchuang-16", teamId: "team-1", source: "douyin", batchId: "batch-dy-20260818-a", occurredAt: "2026-08-17 20:41", grossAmount: 699, netAmount: 699, status: "paid" },
  { id: "sc-order-2001", competitionId: "sanchuang-16", teamId: "team-1", source: "sanchuangGoods", batchId: "batch-scgoods-20260818-a", occurredAt: "2026-08-17 10:12", grossAmount: 268, netAmount: 268, status: "paid" },
  { id: "sc-order-2002", competitionId: "sanchuang-16", teamId: "team-1", source: "sanchuangGoods", batchId: "batch-scgoods-20260818-a", occurredAt: "2026-08-18 09:36", grossAmount: 398, netAmount: 398, status: "paid" },
];

export const liveEvidence: LiveEvidence[] = [
  { id: "dy-live-3001", competitionId: "sanchuang-16", teamId: "team-1", source: "douyin", batchId: "batch-dy-20260818-a", startedAt: "2026-08-16 19:30", durationMinutes: 86, viewers: 12640, orders: 29, gmv: 6240 },
  { id: "dy-live-3002", competitionId: "sanchuang-16", teamId: "team-1", source: "douyin", batchId: "batch-dy-20260818-a", startedAt: "2026-08-17 20:00", durationMinutes: 74, viewers: 9320, orders: 21, gmv: 4380 },
  { id: "sc-live-4001", competitionId: "sanchuang-16", teamId: "team-1", source: "sanchuangGoods", batchId: "batch-scgoods-20260818-a", startedAt: "2026-08-18 14:00", durationMinutes: 52, viewers: 3180, orders: 12, gmv: 1960 },
];

export const videoEvidence: VideoEvidence[] = [
  { id: "dy-video-5001", competitionId: "sanchuang-16", teamId: "team-1", source: "douyin", batchId: "batch-dy-20260818-a", publishedAt: "2026-08-15 12:10", views: 48600, interactions: 3820 },
  { id: "dy-video-5002", competitionId: "sanchuang-16", teamId: "team-1", source: "douyin", batchId: "batch-dy-20260818-a", publishedAt: "2026-08-17 09:20", views: 32700, interactions: 2410 },
  { id: "sc-video-6001", competitionId: "sanchuang-16", teamId: "team-1", source: "sanchuangGoods", batchId: "batch-scgoods-20260818-a", publishedAt: "2026-08-17 16:45", views: 12800, interactions: 960 },
];

function periodFor(competitionId: string, periodId: string) {
  return performancePeriods.find(period => period.competitionId === competitionId && period.id === periodId);
}

function inPeriod(value: string, competitionId: string, periodId: string) {
  const period = periodFor(competitionId, periodId);
  if (!period) return false;
  const timestamp = Date.parse(value.includes("T") ? value : value.replace(" ", "T") + "+08:00");
  return timestamp >= Date.parse(period.startAt) && timestamp <= Date.parse(period.endAt);
}

function periodContainsPeriod(competitionId: string, containerPeriodId: string, childPeriodId: string) {
  const container = periodFor(competitionId, containerPeriodId);
  const child = periodFor(competitionId, childPeriodId);
  if (!container || !child) return containerPeriodId === childPeriodId;
  return Date.parse(child.startAt) >= Date.parse(container.startAt) && Date.parse(child.endAt) <= Date.parse(container.endAt);
}

function matchesSource(source: PerformanceSource, filter: PerformanceSource | "all") {
  return filter === "all" || source === filter;
}

export function performanceEvidenceFor(filter: PerformanceFilter) {
  const orders = orderEvidence.filter(item => item.competitionId === filter.competitionId && item.teamId === filter.teamId && matchesSource(item.source, filter.source) && inPeriod(item.occurredAt, filter.competitionId, filter.periodId));
  const live = liveEvidence.filter(item => item.competitionId === filter.competitionId && item.teamId === filter.teamId && matchesSource(item.source, filter.source) && inPeriod(item.startedAt, filter.competitionId, filter.periodId));
  const videos = videoEvidence.filter(item => item.competitionId === filter.competitionId && item.teamId === filter.teamId && matchesSource(item.source, filter.source) && inPeriod(item.publishedAt, filter.competitionId, filter.periodId));
  return { orders, live, videos };
}

export function performanceBatchesFor(filter: Pick<PerformanceFilter, "competitionId" | "source" | "periodId">) {
  return performanceBatches.filter(batch => batch.competitionId === filter.competitionId && matchesSource(batch.source, filter.source) && periodContainsPeriod(filter.competitionId, filter.periodId, batch.periodId));
}

export function performanceSummaryFor(filter: PerformanceFilter): PerformanceSummary {
  const evidence = performanceEvidenceFor(filter);
  return {
    gmv: evidence.orders.reduce((sum, item) => sum + item.grossAmount, 0),
    netAmount: evidence.orders.reduce((sum, item) => sum + item.netAmount, 0),
    orderCount: evidence.orders.length,
    liveCount: evidence.live.length,
    liveGmv: evidence.live.reduce((sum, item) => sum + item.gmv, 0),
    liveViewers: evidence.live.reduce((sum, item) => sum + item.viewers, 0),
    videoCount: evidence.videos.length,
    videoViews: evidence.videos.reduce((sum, item) => sum + item.views, 0),
    videoInteractions: evidence.videos.reduce((sum, item) => sum + item.interactions, 0),
  };
}

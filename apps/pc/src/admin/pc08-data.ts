import {
  competitionControlById,
  type OfficialQualificationStatus,
  type PlatformReviewStatus,
} from "./competition-control-data";

export type CompetitionCategory = {
  id: string;
  name: string;
  sort: number;
  enabled: boolean;
};

export type CompetitionStage = {
  stageId: string;
  competitionId: string;
  name: string;
  startAt: string;
  endAt: string;
  location?: string;
  sort: number;
  visible: boolean;
};

export type CompetitionStageStatus = "notStarted" | "inProgress" | "ended";

export type CompetitionInfrastructureProfile = {
  competitionId: string;
  categoryId: string;
  startAt: string;
  endAt: string;
  displayStatus: "visible" | "hidden";
  authorityNote: string;
  stages: CompetitionStage[];
};

export type CompetitionRegistrationProjection = {
  projectionId: string;
  competitionId: string;
  competitionName: string;
  teamId: string;
  teamName: string;
  leaderName: string;
  schoolOrganizationId: string;
  platformReview: PlatformReviewStatus;
  officialQualification: OfficialQualificationStatus;
  registeredAt: string;
  dataSource: string;
  registrationPath: string;
};

export const competitionCategories: CompetitionCategory[] = [
  { id: "category-innovation", name: "创新创业", sort: 10, enabled: true },
  { id: "category-industry", name: "产业实践", sort: 20, enabled: true },
  { id: "category-partner", name: "合作赛事", sort: 30, enabled: true },
];

const competitionInfrastructure: Record<string, CompetitionInfrastructureProfile> = {
  "sanchuang-16": {
    competitionId: "sanchuang-16",
    categoryId: "category-innovation",
    startAt: "2026-08-01T00:00:00+08:00",
    endAt: "2027-03-10T23:59:59+08:00",
    displayStatus: "visible",
    authorityNote: "外部权威赛事：官方 API / 官方数据优先；文件导入仅作兜底，人工覆盖必须留痕。",
    stages: [
      { stageId: "stage-s16-registration", competitionId: "sanchuang-16", name: "报名与赛项选择", startAt: "2026-08-01T00:00:00+08:00", endAt: "2026-09-30T23:59:59+08:00", sort: 10, visible: true },
      { stageId: "stage-s16-campus", competitionId: "sanchuang-16", name: "校园赛", startAt: "2026-10-10T09:00:00+08:00", endAt: "2026-10-30T18:00:00+08:00", location: "各参赛学校", sort: 20, visible: true },
      { stageId: "stage-s16-province", competitionId: "sanchuang-16", name: "省赛", startAt: "2026-11-15T09:00:00+08:00", endAt: "2026-11-30T18:00:00+08:00", location: "省级赛区", sort: 30, visible: true },
      { stageId: "stage-s16-national", competitionId: "sanchuang-16", name: "全国现场总决赛", startAt: "2027-03-01T09:00:00+08:00", endAt: "2027-03-10T18:00:00+08:00", location: "官方总决赛场地", sort: 40, visible: true },
    ],
  },
  "innovation-cup-2026": {
    competitionId: "innovation-cup-2026",
    categoryId: "category-partner",
    startAt: "2026-09-01T00:00:00+08:00",
    endAt: "2026-11-18T23:59:59+08:00",
    displayStatus: "visible",
    authorityNote: "平台配置赛事：由平台赛事运营维护；不伪装成外部权威同步来源。",
    stages: [
      { stageId: "stage-brand-registration", competitionId: "innovation-cup-2026", name: "报名与材料准备", startAt: "2026-09-01T00:00:00+08:00", endAt: "2026-10-15T23:59:59+08:00", sort: 10, visible: true },
      { stageId: "stage-brand-selection", competitionId: "innovation-cup-2026", name: "品牌方案初选", startAt: "2026-10-20T09:00:00+08:00", endAt: "2026-10-31T18:00:00+08:00", location: "线上评审", sort: 20, visible: true },
      { stageId: "stage-brand-final", competitionId: "innovation-cup-2026", name: "合作赛事总决赛", startAt: "2026-11-15T09:00:00+08:00", endAt: "2026-11-18T18:00:00+08:00", location: "广州", sort: 30, visible: true },
    ],
  },
};

export function competitionInfrastructureById(competitionId: string | undefined) {
  return competitionId ? competitionInfrastructure[competitionId] : undefined;
}

export function competitionCategoryById(categoryId: string | undefined) {
  return competitionCategories.find(category => category.id === categoryId);
}

export function deriveCompetitionStageStatus(stage: CompetitionStage, now = Date.now()): CompetitionStageStatus {
  const start = Date.parse(stage.startAt);
  const end = Date.parse(stage.endAt);
  if (now < start) return "notStarted";
  if (now > end) return "ended";
  return "inProgress";
}

const competitionIds = ["sanchuang-16", "innovation-cup-2026"] as const;

export function competitionRegistrationProjections(): CompetitionRegistrationProjection[] {
  return competitionIds.flatMap(competitionId => {
    const record = competitionControlById(competitionId);
    if (!record) return [];
    const leader = record.team.members.find(member => member.role.includes("队长")) ?? record.team.members[0];
    if (!leader) return [];

    return [{
      projectionId: `projection:${record.id}:${record.team.id}`,
      competitionId: record.id,
      competitionName: record.name,
      teamId: record.team.id,
      teamName: record.team.name,
      leaderName: leader.name,
      schoolOrganizationId: record.team.leaderSchoolId,
      platformReview: record.qualification.platformReview,
      officialQualification: record.qualification.officialQualification,
      registeredAt: "源报名事实未记录时间",
      dataSource: `${record.registration.label} · Team / qualification 既有事实投影`,
      registrationPath: record.registration.portalPath ?? "/registration-portal/start",
    }];
  });
}

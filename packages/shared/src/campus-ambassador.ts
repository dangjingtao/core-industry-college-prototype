/**
 * Shared business model for the Campus Ambassador campaign.
 *
 * This is an operations campaign, not a CompetitionIdentity.  Apps should
 * reference accountId / organizationId and stable campaign IDs here rather
 * than copying session, school or competition state into a second model.
 */

export const AMBASSADOR_TEAM_MIN_MEMBERS = 4;
export const AMBASSADOR_PARTNER_MIN_MEMBERS = 3;

export type AmbassadorCampaignStatus = "draft" | "upcoming" | "active" | "ended";
export type AmbassadorTeamStatus = "forming" | "lit" | "ended";
export type AmbassadorMemberRole = "ambassador" | "partner";
export type AmbassadorMemberStatus = "active" | "historical";
export type AmbassadorIncentiveStatus = "unprocessed" | "processed";

export type AmbassadorCampaign = {
  id: string;
  name: string;
  startsAt: string;
  endsAt: string;
  schoolIds: string[];
  applicationFields: string[];
  termsVersion: string;
  status: AmbassadorCampaignStatus;
};

export type AmbassadorSchoolRecruitmentCode = {
  id: string;
  campaignId: string;
  schoolId: string;
  code: string;
  active: boolean;
};

export type AmbassadorTeamRecruitmentCode = {
  id: string;
  campaignId: string;
  teamId: string;
  code: string;
  active: boolean;
};

export type AmbassadorTeamMember = {
  id: string;
  teamId: string;
  accountId: string;
  role: AmbassadorMemberRole;
  status: AmbassadorMemberStatus;
  joinedAt: string;
  application?: Record<string, string>;
  promotionCodeId?: string;
};

export type AmbassadorTeam = {
  id: string;
  campaignId: string;
  schoolId: string;
  coreAmbassadorAccountId: string;
  status: AmbassadorTeamStatus;
  recruitmentCodeId: string;
  members: AmbassadorTeamMember[];
  incentiveStatus: AmbassadorIncentiveStatus;
};

export type AmbassadorPromotionCode = {
  id: string;
  campaignId: string;
  teamId: string;
  accountId: string;
  code: string;
  active: boolean;
};

export type AmbassadorValidAcquisition = {
  id: string;
  campaignId: string;
  teamId: string;
  promotionCodeId: string;
  promoterAccountId: string;
  newAccountId: string;
  registeredAt: string;
};

export type AmbassadorCampaignState = {
  campaigns: AmbassadorCampaign[];
  schoolRecruitmentCodes: AmbassadorSchoolRecruitmentCode[];
  teamRecruitmentCodes: AmbassadorTeamRecruitmentCode[];
  teams: AmbassadorTeam[];
  promotionCodes: AmbassadorPromotionCode[];
  validAcquisitions: AmbassadorValidAcquisition[];
};

export const campusAmbassadorSeed: AmbassadorCampaignState = {
  campaigns: [{
    id: "campus-ambassador-2026-一期",
    name: "2026 核心大使计划 · 一期",
    startsAt: "2026-09-01T00:00:00+08:00",
    endsAt: "2026-10-31T23:59:59+08:00",
    schoolIds: ["org-huanan-commerce-college", "org-gdtc"],
    applicationFields: ["自我介绍", "校园传播渠道", "参与动机"],
    termsVersion: "campus-ambassador-terms-v1",
    status: "upcoming",
  }],
  schoolRecruitmentCodes: [
    { id: "amb-recruit-huanan-2026", campaignId: "campus-ambassador-2026-一期", schoolId: "org-huanan-commerce-college", code: "CA-HN-2026", active: true },
    { id: "amb-recruit-gdtc-2026", campaignId: "campus-ambassador-2026-一期", schoolId: "org-gdtc", code: "CA-GDTC-2026", active: true },
  ],
  teamRecruitmentCodes: [],
  teams: [],
  promotionCodes: [],
  validAcquisitions: [],
};

export function ambassadorCampaignStatus(campaign: AmbassadorCampaign, now = new Date()): AmbassadorCampaignStatus {
  if (campaign.status === "draft") return "draft";
  const timestamp = now.getTime();
  if (timestamp < Date.parse(campaign.startsAt)) return "upcoming";
  if (timestamp > Date.parse(campaign.endsAt)) return "ended";
  return "active";
}

export function isAmbassadorCampaignOpen(campaign: AmbassadorCampaign, now = new Date()): boolean {
  return ambassadorCampaignStatus(campaign, now) === "active";
}

export function isAmbassadorCodeActive(code: Pick<AmbassadorSchoolRecruitmentCode | AmbassadorTeamRecruitmentCode | AmbassadorPromotionCode, "active">, campaign: AmbassadorCampaign, now = new Date()): boolean {
  return code.active && isAmbassadorCampaignOpen(campaign, now);
}

export function ambassadorTeamIsLit(team: Pick<AmbassadorTeam, "members" | "status">): boolean {
  const activeAmbassadors = team.members.filter(member => member.status === "active" && member.role === "ambassador").length;
  const activePartners = team.members.filter(member => member.status === "active" && member.role === "partner").length;
  return activeAmbassadors === 1 && activePartners >= AMBASSADOR_PARTNER_MIN_MEMBERS;
}

export function ambassadorTeamMemberCount(team: Pick<AmbassadorTeam, "members">): number {
  return team.members.filter(member => member.status === "active").length;
}

export function ambassadorTeamPartnerCount(team: Pick<AmbassadorTeam, "members">): number {
  return team.members.filter(member => member.status === "active" && member.role === "partner").length;
}

export function canJoinAmbassadorTeam(state: AmbassadorCampaignState, campaignId: string, accountId: string): boolean {
  return !state.teams.some(team => team.campaignId === campaignId && team.members.some(member => member.accountId === accountId && member.status === "active"));
}

export function canRecruitPartner(campaign: AmbassadorCampaign, team: AmbassadorTeam, now = new Date()): boolean {
  return isAmbassadorCampaignOpen(campaign, now) && team.status !== "ended";
}

export function deriveAmbassadorTeamStatus(team: AmbassadorTeam, campaign: AmbassadorCampaign, now = new Date()): AmbassadorTeamStatus {
  if (ambassadorCampaignStatus(campaign, now) === "ended") return "ended";
  return ambassadorTeamIsLit(team) ? "lit" : "forming";
}

export function deriveAmbassadorMetrics(state: AmbassadorCampaignState, campaignId: string) {
  const teams = state.teams.filter(team => team.campaignId === campaignId);
  const teamIds = new Set(teams.map(team => team.id));
  const acquisitions = state.validAcquisitions.filter(item => item.campaignId === campaignId && teamIds.has(item.teamId));
  return {
    schoolCount: new Set(teams.map(team => team.schoolId)).size,
    coreAmbassadorCount: teams.length,
    litTeamCount: teams.filter(team => team.status === "lit").length,
    partnerCount: teams.reduce((total, team) => total + ambassadorTeamPartnerCount(team), 0),
    validAcquisitionCount: acquisitions.length,
  };
}

export function recordValidAcquisition(state: AmbassadorCampaignState, acquisition: AmbassadorValidAcquisition): AmbassadorCampaignState {
  if (state.validAcquisitions.some(item => item.newAccountId === acquisition.newAccountId && item.campaignId === acquisition.campaignId)) return state;
  return { ...state, validAcquisitions: [...state.validAcquisitions, acquisition] };
}

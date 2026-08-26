/**
 * Shared business model for the Campus Ambassador campaign.
 *
 * This is an operations campaign, not a CompetitionIdentity. Apps should
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
export type AmbassadorApplicationFieldType = "text" | "textarea" | "single-choice" | "multi-choice";
export type AmbassadorTermsStatus = "draft" | "published";

export type AmbassadorApplicationField = {
  id: string;
  label: string;
  type: AmbassadorApplicationFieldType;
  required: boolean;
  options?: string[];
};

export type AmbassadorTermsVersion = {
  id: string;
  title: string;
  version: string;
  status: AmbassadorTermsStatus;
  contentHtml: string;
  createdAt: string;
  publishedAt?: string;
  basedOnId?: string;
};

export type AmbassadorCampaign = {
  id: string;
  name: string;
  startsAt: string;
  endsAt: string;
  schoolIds: string[];
  /** Legacy readable labels retained for old prototype consumers. */
  applicationFields: string[];
  /** Structured form definition used by the PC designer and App renderer. */
  applicationForm?: AmbassadorApplicationField[];
  /** Stable terms version id. UI should resolve this to title + readable version. */
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
  termsVersions: AmbassadorTermsVersion[];
  schoolRecruitmentCodes: AmbassadorSchoolRecruitmentCode[];
  teamRecruitmentCodes: AmbassadorTeamRecruitmentCode[];
  teams: AmbassadorTeam[];
  promotionCodes: AmbassadorPromotionCode[];
  validAcquisitions: AmbassadorValidAcquisition[];
};

export const defaultAmbassadorApplicationForm: AmbassadorApplicationField[] = [
  { id: "intro", label: "自我介绍", type: "textarea", required: true },
  { id: "channel", label: "校园传播渠道", type: "textarea", required: true },
  { id: "motivation", label: "参与动机", type: "textarea", required: true },
];

export const coreAmbassadorTermsV1Html = `
<h3>一、参与资格与身份</h3>
<p>核心大使计划面向活动指定学校的学生开放。用户通过学校招募二维码提交申请并同意本条款后，获得“核心大使 · 待点亮”身份；通过团队招募二维码加入的成员为“推广伙伴”。</p>
<h3>二、团队与活动规则</h3>
<p>同一账号在同一期活动中只能加入一个团队。活动期间不支持退出团队或更换团队。团队由 1 位核心大使和至少 3 位推广伙伴组成，达到条件后自动点亮；点亮后仍可继续邀请推广伙伴。</p>
<h3>三、推广码与有效新增</h3>
<p>团队点亮后，核心大使及推广伙伴获得各自的专属推广码。当前活动口径下，仅从未注册过平台的新账号完成注册时计为 1 个有效新增；同一新账号在同一期活动中不重复计算。</p>
<h3>四、推广成果与活动激励</h3>
<p>推广伙伴仅可查看自己的活动身份与专属推广码，不展示个人或团队推广成果数字。核心大使可查看团队推广成果。平台按照活动规则向核心大使处理团队激励，不负责团队成员内部的分配或结算。</p>
<h3>五、活动结束与历史记录</h3>
<p>活动到期后，团队招募码及专属推广码停止生效，不再产生新的推广成果。团队关系和既有推广成果作为活动历史保留；用户可在后续新的活动中再次参与。</p>
<h3>六、必要信息使用</h3>
<p>为完成申请、组队、推广归因、结果统计及活动激励，平台会在本活动范围内使用必要的账号、学校、申请信息、团队关系和推广归因信息，并按平台隐私政策进行管理。</p>`;

export function readableAmbassadorTerms(terms: AmbassadorTermsVersion) {
  return `${terms.title} · ${terms.version}`;
}

export function ambassadorApplicationForm(campaign: Pick<AmbassadorCampaign, "applicationForm" | "applicationFields">): AmbassadorApplicationField[] {
  if (campaign.applicationForm?.length) return campaign.applicationForm;
  return campaign.applicationFields.map((label, index) => ({ id: `legacy-${index}`, label, type: "textarea" as const, required: true }));
}

export const campusAmbassadorSeed: AmbassadorCampaignState = {
  campaigns: [{
    id: "campus-ambassador-2026-一期",
    name: "2026 核心大使计划 · 一期",
    startsAt: "2026-08-26T00:00:00+08:00",
    endsAt: "2026-10-31T23:59:59+08:00",
    schoolIds: ["org-huanan-commerce-college", "org-gdtc"],
    applicationFields: defaultAmbassadorApplicationForm.map(field => field.label),
    applicationForm: defaultAmbassadorApplicationForm.map(field => ({ ...field })),
    termsVersion: "campus-ambassador-terms-v1",
    status: "upcoming",
  }, {
    id: "campus-ambassador-demo-active",
    name: "核心大使计划 · 演示活动",
    startsAt: "2026-08-01T00:00:00+08:00",
    endsAt: "2026-12-31T23:59:59+08:00",
    schoolIds: ["org-huanan-commerce-college", "org-gdtc"],
    applicationFields: defaultAmbassadorApplicationForm.map(field => field.label),
    applicationForm: defaultAmbassadorApplicationForm.map(field => ({ ...field })),
    termsVersion: "campus-ambassador-terms-v1",
    status: "active",
  }],
  termsVersions: [{
    id: "campus-ambassador-terms-v1",
    title: "核心大使计划活动条款",
    version: "v1.0",
    status: "published",
    contentHtml: coreAmbassadorTermsV1Html,
    createdAt: "2026-08-26T00:00:00+08:00",
    publishedAt: "2026-08-26T00:00:00+08:00",
  }],
  schoolRecruitmentCodes: [
    { id: "amb-recruit-huanan-2026", campaignId: "campus-ambassador-2026-一期", schoolId: "org-huanan-commerce-college", code: "CA-HN-2026", active: true },
    { id: "amb-recruit-gdtc-2026", campaignId: "campus-ambassador-2026-一期", schoolId: "org-gdtc", code: "CA-GDTC-2026", active: true },
    { id: "amb-demo-recruit-huanan", campaignId: "campus-ambassador-demo-active", schoolId: "org-huanan-commerce-college", code: "CA-DEMO-HN-2026", active: true },
    { id: "amb-demo-recruit-gdtc", campaignId: "campus-ambassador-demo-active", schoolId: "org-gdtc", code: "CA-DEMO-GDTC-2026", active: true },
  ],
  teamRecruitmentCodes: [{ id: "amb-demo-team-code", campaignId: "campus-ambassador-demo-active", teamId: "amb-demo-team", code: "TEAM-DEMO-2026", active: true }],
  teams: [{
    id: "amb-demo-team", campaignId: "campus-ambassador-demo-active", schoolId: "org-huanan-commerce-college", coreAmbassadorAccountId: "account-demo-ambassador", status: "lit", recruitmentCodeId: "amb-demo-team-code", incentiveStatus: "unprocessed",
    members: [
      { id: "amb-demo-ambassador", teamId: "amb-demo-team", accountId: "account-demo-ambassador", role: "ambassador", status: "active", joinedAt: "2026-08-03T09:00:00+08:00", promotionCodeId: "amb-demo-promo-1", application: { intro: "负责校园创新社团传播", channel: "校创业协会公众号", motivation: "连接更多同学参与实践", termsVersion: "campus-ambassador-terms-v1" } },
      { id: "amb-demo-partner-1", teamId: "amb-demo-team", accountId: "account-demo-partner-1", role: "partner", status: "active", joinedAt: "2026-08-04T09:00:00+08:00", promotionCodeId: "amb-demo-promo-2" },
      { id: "amb-demo-partner-2", teamId: "amb-demo-team", accountId: "account-demo-partner-2", role: "partner", status: "active", joinedAt: "2026-08-05T09:00:00+08:00", promotionCodeId: "amb-demo-promo-3" },
      { id: "amb-demo-partner-3", teamId: "amb-demo-team", accountId: "account-demo-partner-3", role: "partner", status: "active", joinedAt: "2026-08-06T09:00:00+08:00", promotionCodeId: "amb-demo-promo-4" },
    ],
  }],
  promotionCodes: [
    { id: "amb-demo-promo-1", campaignId: "campus-ambassador-demo-active", teamId: "amb-demo-team", accountId: "account-demo-ambassador", code: "PROMO-DEMO-AMBASSADOR", active: true },
    { id: "amb-demo-promo-2", campaignId: "campus-ambassador-demo-active", teamId: "amb-demo-team", accountId: "account-demo-partner-1", code: "PROMO-DEMO-PARTNER-1", active: true },
    { id: "amb-demo-promo-3", campaignId: "campus-ambassador-demo-active", teamId: "amb-demo-team", accountId: "account-demo-partner-2", code: "PROMO-DEMO-PARTNER-2", active: true },
    { id: "amb-demo-promo-4", campaignId: "campus-ambassador-demo-active", teamId: "amb-demo-team", accountId: "account-demo-partner-3", code: "PROMO-DEMO-PARTNER-3", active: true },
  ],
  validAcquisitions: [
    { id: "amb-demo-acq-1", campaignId: "campus-ambassador-demo-active", teamId: "amb-demo-team", promotionCodeId: "amb-demo-promo-1", promoterAccountId: "account-demo-ambassador", newAccountId: "account-demo-new-1", registeredAt: "2026-08-10T12:00:00+08:00" },
    { id: "amb-demo-acq-2", campaignId: "campus-ambassador-demo-active", teamId: "amb-demo-team", promotionCodeId: "amb-demo-promo-2", promoterAccountId: "account-demo-partner-1", newAccountId: "account-demo-new-2", registeredAt: "2026-08-11T12:00:00+08:00" },
  ],
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

export function issueAmbassadorPromotionCodes(team: AmbassadorTeam, existingCodes: AmbassadorPromotionCode[]) {
  if (team.status !== "lit") return { team, promotionCodes: existingCodes };
  const codes = [...existingCodes];
  const members = team.members.map(member => {
    if (member.status !== "active" || member.promotionCodeId) return member;
    const existingCode = codes.find(code => code.teamId === team.id && code.accountId === member.accountId);
    if (existingCode) return { ...member, promotionCodeId: existingCode.id };
    const promotionCode: AmbassadorPromotionCode = {
      id: `${team.id}-promotion-${member.accountId}`,
      campaignId: team.campaignId,
      teamId: team.id,
      accountId: member.accountId,
      code: `PROMO-${member.accountId}-${team.id}`,
      active: true,
    };
    codes.push(promotionCode);
    return { ...member, promotionCodeId: promotionCode.id };
  });
  return { team: { ...team, members }, promotionCodes: codes };
}

export function ambassadorAcquisitionCount(state: AmbassadorCampaignState, teamId: string, promoterAccountId?: string) {
  return state.validAcquisitions.filter(item => item.teamId === teamId && (!promoterAccountId || item.promoterAccountId === promoterAccountId)).length;
}

export function deriveAmbassadorMetrics(state: AmbassadorCampaignState, campaignId: string) {
  const teams = state.teams.filter(team => team.campaignId === campaignId);
  const teamIds = new Set(teams.map(team => team.id));
  const acquisitions = state.validAcquisitions.filter(item => item.campaignId === campaignId && teamIds.has(item.teamId));
  return {
    schoolCount: state.campaigns.find(campaign => campaign.id === campaignId)?.schoolIds.length ?? new Set(teams.map(team => team.schoolId)).size,
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

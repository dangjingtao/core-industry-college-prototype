import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import {
  ambassadorCampaignStatus,
  canJoinAmbassadorTeam,
  canRecruitPartner,
  campusAmbassadorSeed,
  deriveAmbassadorTeamStatus,
  issueAmbassadorPromotionCodes,
  isAmbassadorCodeActive,
  recordValidAcquisition,
  type AmbassadorCampaignState,
  type AmbassadorIncentiveStatus,
} from "./campus-ambassador";

type AmbassadorStateValue = AmbassadorCampaignState & {
  createAmbassadorCampaign: (input: Pick<AmbassadorCampaignState["campaigns"][number], "name" | "startsAt" | "endsAt" | "schoolIds" | "applicationFields" | "termsVersion">) => void;
  updateAmbassadorCampaign: (campaignId: string, input: Partial<Pick<AmbassadorCampaignState["campaigns"][number], "name" | "startsAt" | "endsAt" | "schoolIds" | "applicationFields" | "termsVersion">>) => void;
  applyAsCoreAmbassador: (input: { campaignId: string; schoolId: string; accountId: string; application: Record<string, string> }) => void;
  joinAmbassadorTeam: (input: { campaignId: string; recruitmentCode: string; accountId: string }) => void;
  recordPromotionRegistration: (input: { promotionCode: string; newAccountId: string; wasRegistered: boolean }) => void;
  setTeamIncentiveStatus: (teamId: string, status: AmbassadorIncentiveStatus) => void;
};

const AmbassadorStateContext = createContext<AmbassadorStateValue | null>(null);

function freshSeed(): AmbassadorCampaignState {
  return {
    campaigns: campusAmbassadorSeed.campaigns.map(item => ({ ...item, schoolIds: [...item.schoolIds], applicationFields: [...item.applicationFields] })),
    schoolRecruitmentCodes: campusAmbassadorSeed.schoolRecruitmentCodes.map(item => ({ ...item })),
    teamRecruitmentCodes: campusAmbassadorSeed.teamRecruitmentCodes.map(item => ({ ...item })),
    teams: campusAmbassadorSeed.teams.map(item => ({ ...item, members: item.members.map(member => ({ ...member, application: member.application ? { ...member.application } : undefined })) })),
    promotionCodes: campusAmbassadorSeed.promotionCodes.map(item => ({ ...item })),
    validAcquisitions: campusAmbassadorSeed.validAcquisitions.map(item => ({ ...item })),
  };
}

export function AmbassadorStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AmbassadorCampaignState>(freshSeed);
  const applyAsCoreAmbassador = useCallback<AmbassadorStateValue["applyAsCoreAmbassador"]>((input) => {
    setState(current => {
      const campaign = current.campaigns.find(item => item.id === input.campaignId);
      const recruitment = current.schoolRecruitmentCodes.find(item => item.campaignId === input.campaignId && item.schoolId === input.schoolId && item.active);
      if (!campaign || !recruitment || !isAmbassadorCodeActive(recruitment, campaign) || ambassadorCampaignStatus(campaign) !== "active" || !canJoinAmbassadorTeam(current, input.campaignId, input.accountId)) return current;
      const createdTeamId = `amb-team-${input.campaignId}-${input.accountId}`;
      const memberId = `${createdTeamId}-ambassador`;
      const teamRecruitmentCode = {
        id: `${createdTeamId}-recruitment-code`,
        campaignId: input.campaignId,
        teamId: createdTeamId,
        code: `TEAM-${input.accountId}-${createdTeamId}`,
        active: true,
      };
      const team = {
        id: createdTeamId,
        campaignId: input.campaignId,
        schoolId: input.schoolId,
        coreAmbassadorAccountId: input.accountId,
        status: "forming" as const,
        recruitmentCodeId: teamRecruitmentCode.id,
        members: [{ id: memberId, teamId: createdTeamId, accountId: input.accountId, role: "ambassador" as const, status: "active" as const, joinedAt: new Date().toISOString(), application: input.application }],
        incentiveStatus: "unprocessed" as const,
      };
      return { ...current, teamRecruitmentCodes: [...current.teamRecruitmentCodes, teamRecruitmentCode], teams: [...current.teams, team] };
    });
  }, []);
  const createAmbassadorCampaign = useCallback<AmbassadorStateValue["createAmbassadorCampaign"]>((input) => {
    setState(current => {
      const id = `campus-ambassador-${Date.now()}`;
      const campaign = { ...input, id, status: "upcoming" as const };
      const schoolRecruitmentCodes = input.schoolIds.map(schoolId => ({ id: `${id}-${schoolId}-code`, campaignId: id, schoolId, code: `CA-${schoolId}-${Date.now().toString(36).toUpperCase()}`, active: true }));
      return { ...current, campaigns: [...current.campaigns, campaign], schoolRecruitmentCodes: [...current.schoolRecruitmentCodes, ...schoolRecruitmentCodes] };
    });
  }, []);
  const updateAmbassadorCampaign = useCallback<AmbassadorStateValue["updateAmbassadorCampaign"]>((campaignId, input) => {
    setState(current => {
      const campaign = current.campaigns.find(item => item.id === campaignId);
      if (!campaign) return current;
      const next = { ...campaign, ...input };
      const nextSchoolIds = new Set(next.schoolIds);
      const existingCodes = current.schoolRecruitmentCodes.filter(code => code.campaignId === campaignId);
      const retained = existingCodes.filter(code => nextSchoolIds.has(code.schoolId)).map(code => ({ ...code, active: true }));
      const added = next.schoolIds.filter(schoolId => !existingCodes.some(code => code.schoolId === schoolId)).map(schoolId => ({ id: `${campaignId}-${schoolId}-code`, campaignId, schoolId, code: `CA-${schoolId}-${Date.now().toString(36).toUpperCase()}`, active: true }));
      const others = current.schoolRecruitmentCodes.filter(code => code.campaignId !== campaignId);
      return { ...current, campaigns: current.campaigns.map(item => item.id === campaignId ? next : item), schoolRecruitmentCodes: [...others, ...retained, ...added] };
    });
  }, []);
  const joinAmbassadorTeam = useCallback<AmbassadorStateValue["joinAmbassadorTeam"]>((input) => {
    setState(current => {
      const campaign = current.campaigns.find(item => item.id === input.campaignId);
      const recruitment = current.teamRecruitmentCodes.find(item => item.campaignId === input.campaignId && item.code === input.recruitmentCode && item.active);
      const team = recruitment && current.teams.find(item => item.id === recruitment.teamId && item.recruitmentCodeId === recruitment.id);
      if (!campaign || !recruitment || !isAmbassadorCodeActive(recruitment, campaign) || !team || !canRecruitPartner(campaign, team) || !canJoinAmbassadorTeam(current, input.campaignId, input.accountId)) return current;
      const member = { id: `${team.id}-partner-${team.members.length}`, teamId: team.id, accountId: input.accountId, role: "partner" as const, status: "active" as const, joinedAt: new Date().toISOString() };
      const nextTeam = { ...team, members: [...team.members, member] };
      nextTeam.status = deriveAmbassadorTeamStatus(nextTeam, campaign);
      const issued = issueAmbassadorPromotionCodes(nextTeam, current.promotionCodes);
      return { ...current, teams: current.teams.map(item => item.id === team.id ? issued.team : item), promotionCodes: issued.promotionCodes };
    });
  }, []);
  const recordPromotionRegistration = useCallback<AmbassadorStateValue["recordPromotionRegistration"]>((input) => {
    setState(current => {
      const newAccountId = input.newAccountId.trim();
      const promotionCode = current.promotionCodes.find(item => item.code.toUpperCase() === input.promotionCode.trim().toUpperCase() && item.active);
      const campaign = promotionCode ? current.campaigns.find(item => item.id === promotionCode.campaignId) : undefined;
      const team = promotionCode ? current.teams.find(item => item.id === promotionCode.teamId) : undefined;
      const knownAccount = current.teams.some(item => item.campaignId === promotionCode?.campaignId && item.members.some(member => member.accountId === newAccountId));
      if (!newAccountId || !promotionCode || !campaign || !team || team.status !== "lit" || !isAmbassadorCodeActive(promotionCode, campaign) || input.wasRegistered || knownAccount) return current;
      return recordValidAcquisition(current, {
        id: `${promotionCode.campaignId}-${newAccountId}`,
        campaignId: promotionCode.campaignId,
        teamId: promotionCode.teamId,
        promotionCodeId: promotionCode.id,
        promoterAccountId: promotionCode.accountId,
        newAccountId,
        registeredAt: new Date().toISOString(),
      });
    });
  }, []);
  const setTeamIncentiveStatus = useCallback((teamId: string, status: AmbassadorIncentiveStatus) => {
    setState(current => ({ ...current, teams: current.teams.map(team => team.id === teamId ? { ...team, incentiveStatus: status } : team) }));
  }, []);
  const value = useMemo<AmbassadorStateValue>(() => ({ ...state, createAmbassadorCampaign, updateAmbassadorCampaign, applyAsCoreAmbassador, joinAmbassadorTeam, recordPromotionRegistration, setTeamIncentiveStatus }), [state, createAmbassadorCampaign, updateAmbassadorCampaign, applyAsCoreAmbassador, joinAmbassadorTeam, recordPromotionRegistration, setTeamIncentiveStatus]);
  return <AmbassadorStateContext.Provider value={value}>{children}</AmbassadorStateContext.Provider>;
}

export function useAmbassadorState() {
  const value = useContext(AmbassadorStateContext);
  if (!value) throw new Error("useAmbassadorState must be used within AmbassadorStateProvider");
  return value;
}

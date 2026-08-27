import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  ambassadorCampaignStatus,
  ambassadorTeamDisplayName,
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

type CampaignInput = Pick<AmbassadorCampaignState["campaigns"][number], "name" | "startsAt" | "endsAt" | "schoolIds" | "applicationFields" | "applicationForm" | "termsVersion">;
export type AmbassadorPromotionRegistrationResult = "recorded" | "duplicate" | "already-registered" | "campaign-member" | "inactive";
export type AmbassadorDemoBridgeConfig = { role: "host" | "client"; peerOrigin: string };

type AmbassadorStateValue = AmbassadorCampaignState & {
  demoBridgeConnected: boolean;
  createAmbassadorCampaign: (input: CampaignInput) => void;
  updateAmbassadorCampaign: (campaignId: string, input: Partial<CampaignInput>) => void;
  createAmbassadorTermsDraft: (input: { title: string; contentHtml: string; basedOnId?: string }) => void;
  updateAmbassadorTermsDraft: (termsId: string, input: { title?: string; contentHtml?: string }) => void;
  publishAmbassadorTermsVersion: (termsId: string) => void;
  applyAsCoreAmbassador: (input: { campaignId: string; schoolId: string; accountId: string; application: Record<string, string> }) => void;
  joinAmbassadorTeam: (input: { campaignId: string; recruitmentCode: string; accountId: string }) => void;
  recordPromotionRegistration: (input: { promotionCode: string; newAccountId: string; wasRegistered: boolean }) => AmbassadorPromotionRegistrationResult;
  setAmbassadorTeamName: (teamId: string, teamName: string) => void;
  setTeamIncentiveStatus: (teamId: string, status: AmbassadorIncentiveStatus) => void;
};

type AmbassadorStateProviderProps = {
  children: ReactNode;
  storageKey?: string;
  bridge?: AmbassadorDemoBridgeConfig;
};

type AmbassadorBridgeMessage = {
  source: "core-ambassador-demo";
  type: "ready" | "state";
  state?: AmbassadorCampaignState;
};

const AmbassadorStateContext = createContext<AmbassadorStateValue | null>(null);

function cloneState(source: AmbassadorCampaignState): AmbassadorCampaignState {
  return {
    campaigns: source.campaigns.map(item => ({
      ...item,
      schoolIds: [...item.schoolIds],
      applicationFields: [...item.applicationFields],
      applicationForm: item.applicationForm?.map(field => ({ ...field, options: field.options ? [...field.options] : undefined })),
    })),
    termsVersions: source.termsVersions.map(item => ({ ...item })),
    schoolRecruitmentCodes: source.schoolRecruitmentCodes.map(item => ({ ...item })),
    teamRecruitmentCodes: source.teamRecruitmentCodes.map(item => ({ ...item })),
    teams: source.teams.map(item => {
      const team = { ...item, members: item.members.map(member => ({ ...member, application: member.application ? { ...member.application } : undefined })) };
      return { ...team, teamName: ambassadorTeamDisplayName(team) };
    }),
    promotionCodes: source.promotionCodes.map(item => ({ ...item })),
    validAcquisitions: source.validAcquisitions.map(item => ({ ...item })),
  };
}

function freshSeed() {
  return cloneState(campusAmbassadorSeed);
}

function looksLikeState(value: unknown): value is AmbassadorCampaignState {
  if (!value || typeof value !== "object") return false;
  const state = value as Partial<AmbassadorCampaignState>;
  return [state.campaigns, state.termsVersions, state.schoolRecruitmentCodes, state.teamRecruitmentCodes, state.teams, state.promotionCodes, state.validAcquisitions].every(Array.isArray);
}

function readPersistedState(storageKey?: string): AmbassadorCampaignState {
  if (!storageKey || typeof window === "undefined") return freshSeed();
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return freshSeed();
    const parsed = JSON.parse(raw) as unknown;
    return looksLikeState(parsed) ? cloneState(parsed) : freshSeed();
  } catch {
    return freshSeed();
  }
}

function stateFingerprint(state: AmbassadorCampaignState) {
  return JSON.stringify(state);
}

function effectiveState(state: AmbassadorCampaignState): AmbassadorCampaignState {
  const campaignsById = new Map(state.campaigns.map(campaign => [campaign.id, campaign]));
  return {
    ...state,
    teams: state.teams.map(team => {
      const campaign = campaignsById.get(team.campaignId);
      const withName = { ...team, teamName: ambassadorTeamDisplayName(team) };
      return campaign ? { ...withName, status: deriveAmbassadorTeamStatus(withName, campaign) } : withName;
    }),
  };
}

export function AmbassadorStateProvider({ children, storageKey, bridge }: AmbassadorStateProviderProps) {
  const [state, setState] = useState<AmbassadorCampaignState>(() => readPersistedState(storageKey));
  const [demoBridgeConnected, setDemoBridgeConnected] = useState(false);
  const stateRef = useRef(state);
  const peerWindowRef = useRef<Window | null>(null);
  const clientHydratedRef = useRef(bridge?.role !== "client");

  useEffect(() => {
    stateRef.current = state;
    if (!storageKey || typeof window === "undefined") return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {
      // Persistence is a demo convenience; the feature remains usable in memory.
    }
  }, [state, storageKey]);

  useEffect(() => {
    if (!bridge || typeof window === "undefined") return;
    const receive = (event: MessageEvent<AmbassadorBridgeMessage>) => {
      if (event.origin !== bridge.peerOrigin || !event.data || event.data.source !== "core-ambassador-demo") return;
      if (event.data.type === "ready" && bridge.role === "host") {
        peerWindowRef.current = event.source as Window | null;
        setDemoBridgeConnected(Boolean(peerWindowRef.current));
        peerWindowRef.current?.postMessage({ source: "core-ambassador-demo", type: "state", state: stateRef.current } satisfies AmbassadorBridgeMessage, bridge.peerOrigin);
        return;
      }
      if (event.data.type !== "state" || !looksLikeState(event.data.state)) return;
      peerWindowRef.current = event.source as Window | null;
      clientHydratedRef.current = true;
      setDemoBridgeConnected(Boolean(peerWindowRef.current));
      const incoming = cloneState(event.data.state);
      if (stateFingerprint(incoming) !== stateFingerprint(stateRef.current)) {
        stateRef.current = incoming;
        setState(incoming);
      }
    };
    window.addEventListener("message", receive);

    if (bridge.role === "client" && new URLSearchParams(window.location.search).get("ambassadorBridge") === "1" && window.opener) {
      peerWindowRef.current = window.opener;
      window.opener.postMessage({ source: "core-ambassador-demo", type: "ready" } satisfies AmbassadorBridgeMessage, bridge.peerOrigin);
    }
    return () => window.removeEventListener("message", receive);
  }, [bridge]);

  useEffect(() => {
    if (!bridge || !peerWindowRef.current || !clientHydratedRef.current) return;
    try {
      peerWindowRef.current.postMessage({ source: "core-ambassador-demo", type: "state", state } satisfies AmbassadorBridgeMessage, bridge.peerOrigin);
    } catch {
      setDemoBridgeConnected(false);
      peerWindowRef.current = null;
    }
  }, [bridge, state]);

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
      const submittedAt = new Date().toISOString();
      const formSnapshot = campaign.applicationForm?.map(field => ({ ...field, options: field.options ? [...field.options] : undefined }));
      const members = [{ id: memberId, teamId: createdTeamId, accountId: input.accountId, role: "ambassador" as const, status: "active" as const, joinedAt: submittedAt, applicationSubmittedAt: submittedAt, application: input.application, applicationFormSnapshot: formSnapshot }];
      const team = {
        id: createdTeamId,
        campaignId: input.campaignId,
        schoolId: input.schoolId,
        coreAmbassadorAccountId: input.accountId,
        status: "forming" as const,
        recruitmentCodeId: teamRecruitmentCode.id,
        members,
        incentiveStatus: "unprocessed" as const,
      };
      const namedTeam = { ...team, teamName: ambassadorTeamDisplayName(team) };
      return { ...current, teamRecruitmentCodes: [...current.teamRecruitmentCodes, teamRecruitmentCode], teams: [...current.teams, namedTeam] };
    });
  }, []);

  const createAmbassadorCampaign = useCallback<AmbassadorStateValue["createAmbassadorCampaign"]>((input) => {
    setState(current => {
      const selectedTerms = current.termsVersions.find(item => item.id === input.termsVersion && item.status === "published");
      if (!selectedTerms || !input.name.trim() || input.schoolIds.length === 0) return current;
      const id = `campus-ambassador-${Date.now()}`;
      const applicationForm = input.applicationForm?.map(field => ({ ...field, options: field.options ? [...field.options] : undefined }));
      const campaign = { ...input, applicationForm, id, status: "upcoming" as const };
      const schoolRecruitmentCodes = input.schoolIds.map(schoolId => ({ id: `${id}-${schoolId}-code`, campaignId: id, schoolId, code: `CA-${schoolId}-${Date.now().toString(36).toUpperCase()}`, active: true }));
      return { ...current, campaigns: [...current.campaigns, campaign], schoolRecruitmentCodes: [...current.schoolRecruitmentCodes, ...schoolRecruitmentCodes] };
    });
  }, []);

  const updateAmbassadorCampaign = useCallback<AmbassadorStateValue["updateAmbassadorCampaign"]>((campaignId, input) => {
    setState(current => {
      const campaign = current.campaigns.find(item => item.id === campaignId);
      if (!campaign) return current;
      const requestedTerms = input.termsVersion;
      const termsIsPublished = !requestedTerms || current.termsVersions.some(item => item.id === requestedTerms && item.status === "published");
      if (!termsIsPublished) return current;
      const termsLocked = ambassadorCampaignStatus(campaign) === "active" || ambassadorCampaignStatus(campaign) === "ended";
      const safeInput = termsLocked && requestedTerms && requestedTerms !== campaign.termsVersion ? { ...input, termsVersion: campaign.termsVersion } : input;
      const next = {
        ...campaign,
        ...safeInput,
        applicationForm: safeInput.applicationForm
          ? safeInput.applicationForm.map(field => ({ ...field, options: field.options ? [...field.options] : undefined }))
          : campaign.applicationForm,
      };
      const nextSchoolIds = new Set(next.schoolIds);
      const existingCodes = current.schoolRecruitmentCodes.filter(code => code.campaignId === campaignId);
      const retained = existingCodes.filter(code => nextSchoolIds.has(code.schoolId)).map(code => ({ ...code, active: true }));
      const added = next.schoolIds.filter(schoolId => !existingCodes.some(code => code.schoolId === schoolId)).map(schoolId => ({ id: `${campaignId}-${schoolId}-code`, campaignId, schoolId, code: `CA-${schoolId}-${Date.now().toString(36).toUpperCase()}`, active: true }));
      const others = current.schoolRecruitmentCodes.filter(code => code.campaignId !== campaignId);
      return { ...current, campaigns: current.campaigns.map(item => item.id === campaignId ? next : item), schoolRecruitmentCodes: [...others, ...retained, ...added] };
    });
  }, []);

  const createAmbassadorTermsDraft = useCallback<AmbassadorStateValue["createAmbassadorTermsDraft"]>((input) => {
    setState(current => {
      const serial = current.termsVersions.length + 1;
      const id = `campus-ambassador-terms-${Date.now()}`;
      return {
        ...current,
        termsVersions: [...current.termsVersions, {
          id,
          title: input.title.trim() || "核心大使计划活动条款",
          version: `v${serial}.0`,
          status: "draft",
          contentHtml: input.contentHtml,
          createdAt: new Date().toISOString(),
          basedOnId: input.basedOnId,
        }],
      };
    });
  }, []);

  const updateAmbassadorTermsDraft = useCallback<AmbassadorStateValue["updateAmbassadorTermsDraft"]>((termsId, input) => {
    setState(current => ({
      ...current,
      termsVersions: current.termsVersions.map(item => item.id === termsId && item.status === "draft" ? { ...item, ...input } : item),
    }));
  }, []);

  const publishAmbassadorTermsVersion = useCallback<AmbassadorStateValue["publishAmbassadorTermsVersion"]>((termsId) => {
    setState(current => ({
      ...current,
      termsVersions: current.termsVersions.map(item => item.id === termsId && item.status === "draft" ? { ...item, status: "published" as const, publishedAt: new Date().toISOString() } : item),
    }));
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
    const current = stateRef.current;
    const newAccountId = input.newAccountId.trim();
    const promotionCode = current.promotionCodes.find(item => item.code.toUpperCase() === input.promotionCode.trim().toUpperCase() && item.active);
    const campaign = promotionCode ? current.campaigns.find(item => item.id === promotionCode.campaignId) : undefined;
    const team = promotionCode ? current.teams.find(item => item.id === promotionCode.teamId) : undefined;
    if (!newAccountId || !promotionCode || !campaign || !team || !isAmbassadorCodeActive(promotionCode, campaign) || deriveAmbassadorTeamStatus(team, campaign) !== "lit") return "inactive";
    if (input.wasRegistered) return "already-registered";
    if (current.validAcquisitions.some(item => item.campaignId === campaign.id && item.newAccountId === newAccountId)) return "duplicate";
    if (current.teams.some(item => item.campaignId === campaign.id && item.members.some(member => member.accountId === newAccountId))) return "campaign-member";
    const next = recordValidAcquisition(current, {
      id: `${promotionCode.campaignId}-${newAccountId}`,
      campaignId: promotionCode.campaignId,
      teamId: promotionCode.teamId,
      promotionCodeId: promotionCode.id,
      promoterAccountId: promotionCode.accountId,
      newAccountId,
      registeredAt: new Date().toISOString(),
    });
    stateRef.current = next;
    setState(next);
    return "recorded";
  }, []);

  const setAmbassadorTeamName = useCallback<AmbassadorStateValue["setAmbassadorTeamName"]>((teamId, teamName) => {
    setState(current => ({
      ...current,
      teams: current.teams.map(team => {
        if (team.id !== teamId) return team;
        const nextTeam = { ...team, teamName: teamName.trim() || undefined };
        return { ...nextTeam, teamName: ambassadorTeamDisplayName(nextTeam) };
      }),
    }));
  }, []);

  const setTeamIncentiveStatus = useCallback((teamId: string, status: AmbassadorIncentiveStatus) => {
    setState(current => ({ ...current, teams: current.teams.map(team => team.id === teamId ? { ...team, incentiveStatus: status } : team) }));
  }, []);

  const visibleState = useMemo(() => effectiveState(state), [state]);
  const value = useMemo<AmbassadorStateValue>(() => ({
    ...visibleState,
    demoBridgeConnected,
    createAmbassadorCampaign,
    updateAmbassadorCampaign,
    createAmbassadorTermsDraft,
    updateAmbassadorTermsDraft,
    publishAmbassadorTermsVersion,
    applyAsCoreAmbassador,
    joinAmbassadorTeam,
    recordPromotionRegistration,
    setAmbassadorTeamName,
    setTeamIncentiveStatus,
  }), [visibleState, demoBridgeConnected, createAmbassadorCampaign, updateAmbassadorCampaign, createAmbassadorTermsDraft, updateAmbassadorTermsDraft, publishAmbassadorTermsVersion, applyAsCoreAmbassador, joinAmbassadorTeam, recordPromotionRegistration, setAmbassadorTeamName, setTeamIncentiveStatus]);

  return <AmbassadorStateContext.Provider value={value}>{children}</AmbassadorStateContext.Provider>;
}

export function useAmbassadorState() {
  const value = useContext(AmbassadorStateContext);
  if (!value) throw new Error("useAmbassadorState must be used within AmbassadorStateProvider");
  return value;
}
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import type { CompetitionIdentityState } from "../../state/model";
import { scenarios } from "../../mock/scenarios";
import { competitionById } from "./data";

type ApplicationRecord = { opportunityId: string; status: "submitted" | "statusUnknown" };
type IdentityMode = "multi" | "none" | "runtime";
type SessionState = { loggedIn: boolean; profileComplete: boolean };
type ListViewState = {
  competitionKeywords: string[];
  competitionStatus: string;
  opportunityKeywords: string[];
  opportunityMode: string;
  companyKeywords: string[];
  companyIndustry: string;
};

export type IdentityScenario = "none" | "pending" | "rejected" | "active" | "revoked";

export type ListKey = "competitions" | "opportunities" | "companies";

export type PublicPlatformState = {
  session: SessionState;
  applications: ApplicationRecord[];
  followedCompanies: string[];
  identities: CompetitionIdentityState[];
  identityMode: IdentityMode;
  listView: ListViewState;
  listScroll: Record<ListKey, number>;
  /** 学力值数值：F04 Decision A 占位展示，待经济模型确认后替换为真实来源 */
  learningPoints: number;
  setIdentityMode: (mode: "multi" | "none") => void;
  login: () => void;
  registerAccount: () => void;
  completeProfile: () => void;
  logout: () => void;
  continueAsGuest: () => void;
  setCompetitionIdentityScenario: (competitionId: string, scenario: IdentityScenario) => void;
  upsertRegistrationPending: (competitionId: string) => void;
  submitApplication: (opportunityId: string) => void;
  setApplicationStatus: (opportunityId: string, status: ApplicationRecord["status"]) => void;
  toggleFollow: (companyId: string) => void;
  updateListView: (patch: Partial<ListViewState>) => void;
  setListScroll: (key: ListKey, value: number) => void;
};

const PublicPlatformContext = createContext<PublicPlatformState | null>(null);

function syncCompetitionStatus(identity: CompetitionIdentityState): CompetitionIdentityState {
  const competition = competitionById(identity.competitionId);
  return competition ? { ...identity, competitionStatus: competition.status } : identity;
}

function multiIdentitySeed() {
  return scenarios.multiCompetitionAccount.competitions.identities.map(syncCompetitionStatus);
}

const initialListView: ListViewState = {
  competitionKeywords: [],
  competitionStatus: "all",
  opportunityKeywords: [],
  opportunityMode: "all",
  companyKeywords: [],
  companyIndustry: "all",
};

export function PublicPlatformProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const enteredAsGuest = new URLSearchParams(location.search).get("guest") === "1";
  const [session, setSession] = useState<SessionState>(() => ({ loggedIn: !enteredAsGuest, profileComplete: !enteredAsGuest }));
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [followedCompanies, setFollowedCompanies] = useState<string[]>(["northstar-beauty"]);
  const [identities, setIdentities] = useState<CompetitionIdentityState[]>(multiIdentitySeed);
  const [identityMode, setIdentityModeValue] = useState<IdentityMode>("multi");
  const [listView, setListView] = useState(initialListView);
  const [listScroll, setListScrollState] = useState<Record<ListKey, number>>({ competitions: 0, opportunities: 0, companies: 0 });
  // 学力值数值为 F04 Decision A 占位展示，待经济模型确认后替换为真实来源
  const [learningPoints] = useState<number>(1250);

  useEffect(() => {
    if (new URLSearchParams(location.search).get("guest") === "1") setSession({ loggedIn: false, profileComplete: false });
  }, [location.search]);

  const setIdentityMode = useCallback((mode: "multi" | "none") => {
    setIdentityModeValue(mode);
    setIdentities(mode === "multi" ? multiIdentitySeed() : []);
  }, []);
  const login = useCallback(() => setSession({ loggedIn: true, profileComplete: true }), []);
  const registerAccount = useCallback(() => {
    setSession({ loggedIn: true, profileComplete: false });
    setApplications([]);
    setFollowedCompanies([]);
    setIdentities([]);
    setIdentityModeValue("runtime");
  }, []);
  const completeProfile = useCallback(() => setSession(current => current.loggedIn ? { ...current, profileComplete: true } : current), []);
  const logout = useCallback(() => setSession({ loggedIn: false, profileComplete: false }), []);
  const continueAsGuest = useCallback(() => setSession({ loggedIn: false, profileComplete: false }), []);
  const setCompetitionIdentityScenario = useCallback((competitionId: string, scenario: IdentityScenario) => {
    setIdentities(current => {
      if (scenario === "none") return current.filter(identity => identity.competitionId !== competitionId);
      const competition = competitionById(competitionId);
      const existing = current.find(identity => identity.competitionId === competitionId);
      const next: CompetitionIdentityState = {
        competitionId,
        competitionStatus: competition?.status ?? existing?.competitionStatus ?? "registrationOpen",
        identityStatus: scenario === "active" ? "active" : scenario === "pending" ? "pending" : scenario === "rejected" ? "rejected" : "revoked",
        registrationStatus: scenario === "active" ? "approved" : scenario === "pending" ? "pending" : scenario === "rejected" ? "rejected" : "approved",
      };
      return existing ? current.map(identity => identity.competitionId === competitionId ? next : identity) : [...current, next];
    });
    setIdentityModeValue("runtime");
  }, []);
  const upsertRegistrationPending = useCallback((competitionId: string) => setCompetitionIdentityScenario(competitionId, "pending"), [setCompetitionIdentityScenario]);
  const submitApplication = useCallback((opportunityId: string) => {
    setApplications(records => records.some(record => record.opportunityId === opportunityId) ? records : [...records, { opportunityId, status: "submitted" }]);
  }, []);
  const setApplicationStatus = useCallback((opportunityId: string, status: ApplicationRecord["status"]) => setApplications(records => records.map(record => record.opportunityId === opportunityId ? { ...record, status } : record)), []);
  const toggleFollow = useCallback((companyId: string) => setFollowedCompanies(ids => ids.includes(companyId) ? ids.filter(id => id !== companyId) : [...ids, companyId]), []);
  const updateListView = useCallback((patch: Partial<ListViewState>) => setListView(current => ({ ...current, ...patch })), []);
  const setListScroll = useCallback((key: ListKey, value: number) => setListScrollState(current => current[key] === value ? current : { ...current, [key]: value }), []);

  const guardedSubmitApplication = useCallback((opportunityId: string) => { if (session.loggedIn) submitApplication(opportunityId); }, [session.loggedIn, submitApplication]);
  const guardedToggleFollow = useCallback((companyId: string) => { if (session.loggedIn) toggleFollow(companyId); }, [session.loggedIn, toggleFollow]);
  const guardedIdentityScenario = useCallback((competitionId: string, scenario: IdentityScenario) => { if (session.loggedIn) setCompetitionIdentityScenario(competitionId, scenario); }, [session.loggedIn, setCompetitionIdentityScenario]);

  const value = useMemo<PublicPlatformState>(() => ({
    session, applications, followedCompanies, identities, identityMode, listView, listScroll, learningPoints,
    setIdentityMode, login, registerAccount, completeProfile, logout, continueAsGuest,
    setCompetitionIdentityScenario: guardedIdentityScenario,
    upsertRegistrationPending,
    submitApplication: guardedSubmitApplication,
    setApplicationStatus,
    toggleFollow: guardedToggleFollow,
    updateListView,
    setListScroll,
  }), [session, applications, followedCompanies, identities, identityMode, listView, listScroll, learningPoints, setIdentityMode, login, continueAsGuest, guardedIdentityScenario, upsertRegistrationPending, guardedSubmitApplication, setApplicationStatus, guardedToggleFollow, updateListView, setListScroll]);

  return <PublicPlatformContext.Provider value={value}>{children}</PublicPlatformContext.Provider>;
}

export function usePublicPlatform() {
  const value = useContext(PublicPlatformContext);
  if (!value) throw new Error("PublicPlatformProvider missing");
  return value;
}

import type { CompetitionIdentityState } from "../../state/model";

export type RegistrationHandoffIdentityMode = "multi" | "none" | "runtime";

export type RegistrationHandoffSession = {
  loggedIn: boolean;
  profileComplete: boolean;
};

export type RegistrationHandoffAccountSnapshot = {
  version: 1;
  savedAt: number;
  session: RegistrationHandoffSession;
  identities: CompetitionIdentityState[];
  identityMode: RegistrationHandoffIdentityMode;
};

export const REGISTRATION_HANDOFF_ACCOUNT_SNAPSHOT_KEY = "core.mobile.registration-handoff.account-snapshot";
const snapshotTtlMs = 2 * 60 * 60 * 1000;

function isIdentityMode(value: unknown): value is RegistrationHandoffIdentityMode {
  return value === "multi" || value === "none" || value === "runtime";
}

function isSession(value: unknown): value is RegistrationHandoffSession {
  if (!value || typeof value !== "object") return false;
  const session = value as Partial<RegistrationHandoffSession>;
  return typeof session.loggedIn === "boolean" && typeof session.profileComplete === "boolean";
}

function isIdentity(value: unknown): value is CompetitionIdentityState {
  if (!value || typeof value !== "object") return false;
  const identity = value as Partial<CompetitionIdentityState>;
  return typeof identity.competitionId === "string"
    && typeof identity.competitionStatus === "string"
    && typeof identity.identityStatus === "string"
    && typeof identity.registrationStatus === "string";
}

export function saveRegistrationHandoffAccountSnapshot(input: {
  session: RegistrationHandoffSession;
  identities: CompetitionIdentityState[];
  identityMode: RegistrationHandoffIdentityMode;
}) {
  if (typeof window === "undefined") return false;
  try {
    const snapshot: RegistrationHandoffAccountSnapshot = {
      version: 1,
      savedAt: Date.now(),
      session: { ...input.session },
      identities: input.identities.map(identity => ({ ...identity })),
      identityMode: input.identityMode,
    };
    window.sessionStorage.setItem(REGISTRATION_HANDOFF_ACCOUNT_SNAPSHOT_KEY, JSON.stringify(snapshot));
    return true;
  } catch {
    return false;
  }
}

export function readRegistrationHandoffAccountSnapshot() {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = window.sessionStorage.getItem(REGISTRATION_HANDOFF_ACCOUNT_SNAPSHOT_KEY);
    if (!raw) return undefined;
    const snapshot = JSON.parse(raw) as Partial<RegistrationHandoffAccountSnapshot>;
    const valid = snapshot.version === 1
      && typeof snapshot.savedAt === "number"
      && Date.now() - snapshot.savedAt <= snapshotTtlMs
      && isSession(snapshot.session)
      && isIdentityMode(snapshot.identityMode)
      && Array.isArray(snapshot.identities)
      && snapshot.identities.every(isIdentity);
    if (!valid) {
      clearRegistrationHandoffAccountSnapshot();
      return undefined;
    }
    return snapshot as RegistrationHandoffAccountSnapshot;
  } catch {
    clearRegistrationHandoffAccountSnapshot();
    return undefined;
  }
}

export function clearRegistrationHandoffAccountSnapshot() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(REGISTRATION_HANDOFF_ACCOUNT_SNAPSHOT_KEY);
  } catch {
    // The bridge is intentionally best-effort and remains scoped to this browser tab.
  }
}

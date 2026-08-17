export const REGISTRATION_HANDOFF_SOURCE = "mobile-app";
export const REGISTRATION_CALLBACK_MARKER = "registration-portal";
export const REGISTRATION_CALLBACK_SOURCE = "pc-registration-portal";

export type RegistrationCallbackStatus = "draft" | "pending" | "rejected" | "approved";

export type RegistrationHandoffContext = {
  competitionId: string;
  returnTo: string;
  source: string;
  accountContext?: string;
};

export type RegistrationCallback = {
  competitionId: string;
  status: RegistrationCallbackStatus;
};

const callbackStatuses = new Set<RegistrationCallbackStatus>(["draft", "pending", "rejected", "approved"]);

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function buildRegistrationPortalUrl(portalBaseUrl: string, context: RegistrationHandoffContext) {
  const url = new URL("/registration-portal/start", portalBaseUrl);
  url.searchParams.set("competitionId", context.competitionId);
  url.searchParams.set("returnTo", context.returnTo);
  url.searchParams.set("source", context.source);
  if (context.accountContext) url.searchParams.set("accountContext", context.accountContext);
  return url.toString();
}

export function parseRegistrationHandoff(search: string): RegistrationHandoffContext | undefined {
  const params = new URLSearchParams(search);
  const competitionId = params.get("competitionId")?.trim();
  const returnTo = params.get("returnTo")?.trim();
  const source = params.get("source")?.trim();
  const accountContext = params.get("accountContext")?.trim() || undefined;
  if (!competitionId || !returnTo || source !== REGISTRATION_HANDOFF_SOURCE || !isHttpUrl(returnTo)) return undefined;
  return { competitionId, returnTo, source, accountContext };
}

export function buildRegistrationReturnUrl(context: RegistrationHandoffContext, status: RegistrationCallbackStatus) {
  const url = new URL(context.returnTo);
  url.searchParams.set("handoff", REGISTRATION_CALLBACK_MARKER);
  url.searchParams.set("registrationCompetitionId", context.competitionId);
  url.searchParams.set("registrationStatus", status);
  url.searchParams.set("registrationSource", REGISTRATION_CALLBACK_SOURCE);
  return url.toString();
}

export function parseRegistrationCallback(search: string): RegistrationCallback | undefined {
  const params = new URLSearchParams(search);
  if (params.get("handoff") !== REGISTRATION_CALLBACK_MARKER || params.get("registrationSource") !== REGISTRATION_CALLBACK_SOURCE) return undefined;
  const competitionId = params.get("registrationCompetitionId")?.trim();
  const rawStatus = params.get("registrationStatus")?.trim() as RegistrationCallbackStatus | undefined;
  if (!competitionId || !rawStatus || !callbackStatuses.has(rawStatus)) return undefined;
  return { competitionId, status: rawStatus };
}

import { useEffect, useState } from "react";
import { buildRegistrationReturnUrl, parseRegistrationHandoff, type RegistrationHandoffContext } from "@core/shared";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AdminConsole } from "./admin/AdminConsole";
import { RegistrationPortal } from "./registration-portal/RegistrationPortal";
import { readRegistrationPortalCallbackStatus } from "./registration-portal/model";

const handoffStorageKey = "core.registration-portal.handoff";
const handoffTtlMs = 60 * 60 * 1000;

type StoredHandoff = {
  context: RegistrationHandoffContext;
  expiresAt: number;
};

function readStoredHandoff() {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = window.sessionStorage.getItem(handoffStorageKey);
    if (!raw) return undefined;
    const stored = JSON.parse(raw) as StoredHandoff;
    if (!stored?.context?.competitionId || !stored.context.returnTo || !stored.context.source || stored.expiresAt < Date.now()) {
      window.sessionStorage.removeItem(handoffStorageKey);
      return undefined;
    }
    return stored.context;
  } catch {
    return undefined;
  }
}

function storeHandoff(context: RegistrationHandoffContext) {
  try {
    const stored: StoredHandoff = { context, expiresAt: Date.now() + handoffTtlMs };
    window.sessionStorage.setItem(handoffStorageKey, JSON.stringify(stored));
  } catch {
    // The portal remains fully standalone if session storage is unavailable.
  }
}

function RegistrationPortalRoute() {
  const location = useLocation();
  const [handoff, setHandoff] = useState<RegistrationHandoffContext | undefined>(() => parseRegistrationHandoff(location.search) ?? readStoredHandoff());

  useEffect(() => {
    const incoming = parseRegistrationHandoff(location.search);
    if (!incoming) return;
    setHandoff(incoming);
    storeHandoff(incoming);
  }, [location.search]);

  const returnToApp = () => {
    if (!handoff) return;
    const callbackUrl = buildRegistrationReturnUrl(handoff, readRegistrationPortalCallbackStatus());
    try {
      window.sessionStorage.removeItem(handoffStorageKey);
    } catch {
      // Optional bridge cleanup only.
    }
    window.location.assign(callbackUrl);
  };

  return <>
    <RegistrationPortal />
    {handoff && <button type="button" data-testid="return-to-app" className="fixed bottom-3 left-3 z-[60] min-h-11 rounded-control bg-primary px-4 text-sm font-semibold text-on-primary shadow-floating" onClick={returnToApp}>返回 App / 赛事</button>}
  </>;
}

export function App() {
  return (
    <Routes>
      <Route path="/admin/*" element={<AdminConsole />} />
      <Route path="/registration-portal/*" element={<RegistrationPortalRoute />} />
      <Route path="/" element={<Navigate to="/admin" replace />} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}

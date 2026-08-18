import { useEffect, useState, type ReactNode } from "react";
import { buildRegistrationReturnUrl, parseRegistrationHandoff, type RegistrationHandoffContext } from "@core/shared";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AdminConsole } from "./admin/AdminConsole";
import { AdminControlPlaneShell } from "./admin/AdminControlPlaneShell";
import { CompetitionConsole } from "./admin/CompetitionConsole";
import { PC01OperationsConsole } from "./admin/PC01OperationsConsole";
import { PC03Console } from "./admin/PC03Console";
import { PC03OpportunityRoute } from "./admin/PC03OpportunityRoute";
import { PC03StateProvider } from "./admin/PC03State";
import { PC04Console } from "./admin/PC04Console";
import { PC04StateProvider } from "./admin/PC04State";
import { PC05AdminOverview } from "./admin/PC05AdminOverview";
import { PC05Console } from "./admin/PC05Console";
import { PC05StateProvider } from "./admin/PC05State";
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

function AdminRoute({ children }: { children: ReactNode }) {
  return <AdminControlPlaneShell>{children}</AdminControlPlaneShell>;
}

export function App() {
  return (
    <PC03StateProvider>
      <PC04StateProvider>
        <PC05StateProvider>
          <Routes>
            <Route path="/admin" element={<AdminRoute><PC05AdminOverview /></AdminRoute>} />
            <Route path="/admin/competitions" element={<AdminRoute><PC01OperationsConsole section="competitions" /></AdminRoute>} />
            <Route path="/admin/resources" element={<AdminRoute><PC01OperationsConsole section="resources" /></AdminRoute>} />
            <Route path="/admin/workshop" element={<AdminRoute><PC01OperationsConsole section="workshop" /></AdminRoute>} />
            <Route path="/admin/competitions/objects/:competitionId" element={<AdminRoute><CompetitionConsole /></AdminRoute>} />
            <Route path="/admin/organizations" element={<AdminRoute><PC03Console /></AdminRoute>} />
            <Route path="/admin/organizations/:organizationId" element={<AdminRoute><PC03Console /></AdminRoute>} />
            <Route path="/admin/organizations/objects/:organizationId" element={<Navigate to="/admin/organizations" replace />} />
            <Route path="/admin/opportunities/*" element={<AdminRoute><PC03OpportunityRoute /></AdminRoute>} />
            <Route path="/admin/content/*" element={<AdminRoute><PC03Console /></AdminRoute>} />
            <Route path="/admin/pc04/*" element={<AdminRoute><PC04Console /></AdminRoute>} />
            <Route path="/admin/resources/objects/course-brand-ecommerce" element={<Navigate to="/admin/pc04/courses/brand-ecommerce" replace />} />
            <Route path="/admin/resources/objects/course-brand-ecommerce/edit" element={<Navigate to="/admin/pc04/courses/brand-ecommerce/edit" replace />} />
            <Route path="/admin/resources/objects/benefit-beauty-sample" element={<Navigate to="/admin/pc04/benefits/benefit-beauty-sample" replace />} />
            <Route path="/admin/resources/objects/benefit-beauty-sample/edit" element={<Navigate to="/admin/pc04/benefits/benefit-beauty-sample/edit" replace />} />
            <Route path="/admin/assets/objects/certificate-sanchuang-15" element={<Navigate to="/admin/pc04/certificates/cert-sanchuang-15" replace />} />
            <Route path="/admin/assets/objects/certificate-sanchuang-15/edit" element={<Navigate to="/admin/pc04/certificates/cert-sanchuang-15" replace />} />
            <Route path="/admin/students/*" element={<AdminRoute><PC05Console /></AdminRoute>} />
            <Route path="/admin/assets/*" element={<AdminRoute><PC05Console /></AdminRoute>} />
            <Route path="/admin/governance/*" element={<AdminRoute><PC05Console /></AdminRoute>} />
            <Route path="/admin/*" element={<AdminConsole />} />
            <Route path="/registration-portal/*" element={<RegistrationPortalRoute />} />
            <Route path="/" element={<Navigate to="/admin" replace />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </PC05StateProvider>
      </PC04StateProvider>
    </PC03StateProvider>
  );
}

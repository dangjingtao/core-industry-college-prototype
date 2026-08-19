import { useEffect, useState, type ReactNode } from "react";
import { buildRegistrationReturnUrl, parseRegistrationHandoff, type RegistrationHandoffContext } from "@core/shared";
import { Link, Navigate, Route, Routes, useLocation, useParams } from "react-router-dom";
import { AdminControlPlaneShell } from "./admin/AdminControlPlaneShell";
import { BasicDataConsole } from "./admin/BasicDataConsole";
import { PC01OperationsConsole } from "./admin/PC01OperationsConsole";
import { PC03HumanContentConsole } from "./admin/PC03HumanContentConsole";
import { PC03HumanOrganizationConsole } from "./admin/PC03HumanOrganizationConsole";
import { PC03OpportunityRoute } from "./admin/PC03OpportunityRoute";
import { PC03StateProvider } from "./admin/PC03State";
import { PC04HumanCertificates } from "./admin/PC04HumanCertificates";
import { PC04HumanConsole } from "./admin/PC04HumanConsole";
import { PC04StateProvider } from "./admin/PC04State";
import { PC05AdminOverview } from "./admin/PC05AdminOverview";
import { PC05Console } from "./admin/PC05Console";
import { PC05StateProvider } from "./admin/PC05State";
import { PC06ObservabilityConsole } from "./admin/PC06ObservabilityConsole";
import { PC07SettingsConsole } from "./admin/PC07SettingsConsole";
import { PC08CompetitionDetail, PC08CompetitionInfrastructureConsole } from "./admin/PC08CompetitionInfrastructure";
import { PC09SanChuangOperations } from "./admin/PC09SanChuangOperations";
import { PC10AIBeautyCup } from "./admin/PC10AIBeautyCup";
import { currentSanChuangCompetitionId } from "./admin/pc09-data";
import { PCPublicLanding } from "./PCPublicLanding";
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

function LegacyOrganizationRedirect() {
  const { organizationId } = useParams();
  return <Navigate to={organizationId ? `/admin/organizations/${organizationId}` : "/admin/organizations"} replace />;
}

function LegacyResourceRedirect({ edit = false }: { edit?: boolean }) {
  const { resourceId } = useParams();
  if (!resourceId) return <Navigate to="/admin/resources" replace />;
  if (resourceId.startsWith("opportunity-")) return <Navigate to={`/admin/opportunities/${resourceId.slice("opportunity-".length)}`} replace />;
  if (resourceId.startsWith("course-")) return <Navigate to={`/admin/pc04/courses/${resourceId.slice("course-".length)}${edit ? "/edit" : ""}`} replace />;
  if (resourceId.startsWith("benefit-")) return <Navigate to={`/admin/pc04/benefits/${resourceId}${edit ? "/edit" : ""}`} replace />;
  return <Navigate to="/admin/resources" replace />;
}

function AdminNotFound() {
  return (
    <section className="rounded-container border border-border-subtle bg-surface p-8 text-center">
      <h1 className="text-xl font-semibold">没有找到这个后台页面</h1>
      <p className="mt-2 text-sm text-text-secondary">这个地址可能来自旧版后台。请选择当前业务入口继续处理。</p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <Link to="/admin" className="inline-flex min-h-11 items-center rounded-control bg-primary px-4 text-sm font-semibold text-on-primary">返回运营总览</Link>
        <Link to="/admin/resources" className="inline-flex min-h-11 items-center rounded-control bg-primary-container px-4 text-sm font-semibold text-text-brand">查看资源与服务</Link>
      </div>
    </section>
  );
}

export function App() {
  return (
    <PC03StateProvider>
      <PC04StateProvider>
        <PC05StateProvider>
          <Routes>
            <Route path="/" element={<PCPublicLanding />} />
            <Route path="/admin" element={<AdminRoute><PC05AdminOverview /></AdminRoute>} />
            <Route path="/admin/competitions" element={<AdminRoute><PC01OperationsConsole section="competitions" /></AdminRoute>} />
            <Route path="/admin/competitions/categories" element={<AdminRoute><PC08CompetitionInfrastructureConsole view="categories" /></AdminRoute>} />
            <Route path="/admin/competitions/registrations" element={<AdminRoute><PC08CompetitionInfrastructureConsole view="registrations" /></AdminRoute>} />
            <Route path="/admin/ai-beauty-cup" element={<AdminRoute><PC10AIBeautyCup /></AdminRoute>} />
            <Route path="/admin/sanchuang" element={<Navigate to={`/admin/sanchuang/${currentSanChuangCompetitionId}`} replace />} />
            <Route path="/admin/sanchuang/:competitionId" element={<AdminRoute><PC09SanChuangOperations view="overview" /></AdminRoute>} />
            <Route path="/admin/sanchuang/:competitionId/performance" element={<AdminRoute><PC09SanChuangOperations view="performance" /></AdminRoute>} />
            <Route path="/admin/resources" element={<AdminRoute><PC01OperationsConsole section="resources" /></AdminRoute>} />
            <Route path="/admin/workshop" element={<AdminRoute><PC01OperationsConsole section="workshop" /></AdminRoute>} />
            <Route path="/admin/competitions/objects/:competitionId" element={<AdminRoute><PC08CompetitionDetail /></AdminRoute>} />
            <Route path="/admin/organizations" element={<AdminRoute><PC03HumanOrganizationConsole /></AdminRoute>} />
            <Route path="/admin/organizations/:organizationId" element={<AdminRoute><PC03HumanOrganizationConsole /></AdminRoute>} />
            <Route path="/admin/organizations/objects/:organizationId" element={<LegacyOrganizationRedirect />} />
            <Route path="/admin/opportunities/*" element={<AdminRoute><PC03OpportunityRoute /></AdminRoute>} />
            <Route path="/admin/content/*" element={<AdminRoute><PC03HumanContentConsole /></AdminRoute>} />
            <Route path="/admin/pc04/certificates" element={<AdminRoute><PC04HumanCertificates /></AdminRoute>} />
            <Route path="/admin/pc04/certificates/:certificateId" element={<AdminRoute><PC04HumanCertificates /></AdminRoute>} />
            <Route path="/admin/pc04/*" element={<AdminRoute><PC04HumanConsole /></AdminRoute>} />
            <Route path="/admin/basic-data" element={<AdminRoute><BasicDataConsole /></AdminRoute>} />
            <Route path="/admin/basic-data/:sub" element={<AdminRoute><BasicDataConsole /></AdminRoute>} />
            <Route path="/admin/basic-data/:sub/:id" element={<AdminRoute><BasicDataConsole /></AdminRoute>} />
            <Route path="/admin/resources/objects/:resourceId/edit" element={<LegacyResourceRedirect edit />} />
            <Route path="/admin/resources/objects/:resourceId" element={<LegacyResourceRedirect />} />
            <Route path="/admin/assets/objects/certificate-sanchuang-15" element={<Navigate to="/admin/pc04/certificates/cert-sanchuang-15" replace />} />
            <Route path="/admin/assets/objects/certificate-sanchuang-15/edit" element={<Navigate to="/admin/pc04/certificates/cert-sanchuang-15" replace />} />
            <Route path="/admin/students/*" element={<AdminRoute><PC05Console /></AdminRoute>} />
            <Route path="/admin/assets/*" element={<AdminRoute><PC05Console /></AdminRoute>} />
            <Route path="/admin/observability" element={<AdminRoute><PC06ObservabilityConsole /></AdminRoute>} />
            <Route path="/admin/settings/*" element={<AdminRoute><PC07SettingsConsole /></AdminRoute>} />
            <Route path="/admin/governance/*" element={<AdminRoute><PC05Console /></AdminRoute>} />
            <Route path="/admin/*" element={<AdminRoute><AdminNotFound /></AdminRoute>} />
            <Route path="/registration-portal/*" element={<RegistrationPortalRoute />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </PC05StateProvider>
      </PC04StateProvider>
    </PC03StateProvider>
  );
}

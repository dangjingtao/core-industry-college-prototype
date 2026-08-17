import { useEffect, useMemo, useState } from "react";
import { buildRegistrationPortalUrl, parseRegistrationCallback, REGISTRATION_HANDOFF_SOURCE } from "@core/shared";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button, Card, PageHeader, PublicShell, SecondaryButton, StatusTag } from "../../components/ui";
import { usePublicPlatform, type IdentityScenario } from "../public-platform/PublicPlatform";
import { competitionById } from "../public-platform/data";
import {
  clearRegistrationHandoffAccountSnapshot,
  readRegistrationHandoffAccountSnapshot,
  saveRegistrationHandoffAccountSnapshot,
} from "../public-platform/registrationHandoffSnapshot";
import { useWorkshopRuntime } from "./runtime";

const callbackKeys = ["handoff", "registrationCompetitionId", "registrationStatus", "registrationSource"] as const;

function makePortalUrl(competitionId: string) {
  const portalBaseUrl = import.meta.env.VITE_REGISTRATION_PORTAL_URL?.trim();
  const publicSiteUrl = import.meta.env.VITE_PUBLIC_SITE_URL?.trim() || window.location.origin;
  if (!portalBaseUrl) return undefined;
  try {
    const returnTo = new URL(`/competitions/${competitionId}/registration`, publicSiteUrl).toString();
    return buildRegistrationPortalUrl(portalBaseUrl, {
      competitionId,
      returnTo,
      source: REGISTRATION_HANDOFF_SOURCE,
      accountContext: "current-student-prototype-session",
    });
  } catch {
    return undefined;
  }
}

function snapshotIdentityScenario(status: string): IdentityScenario | undefined {
  if (status === "active") return "active";
  if (status === "pending") return "pending";
  if (status === "rejected") return "rejected";
  if (status === "revoked") return "revoked";
  return undefined;
}

export function RegistrationHandoffPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { competitionId } = useParams();
  const {
    session,
    identities,
    identityMode,
    setIdentityMode,
    login,
    continueAsGuest,
    setCompetitionIdentityScenario,
  } = usePublicPlatform();
  const { getRuntime, setLifecycle } = useWorkshopRuntime();
  const [callbackNotice, setCallbackNotice] = useState<string>();
  const competition = competitionById(competitionId);
  const callback = useMemo(() => parseRegistrationCallback(location.search), [location.search]);
  const portalUrl = useMemo(() => competitionId ? makePortalUrl(competitionId) : undefined, [competitionId]);
  const identity = competitionId ? identities.find(item => item.competitionId === competitionId) : undefined;

  useEffect(() => {
    if (!competitionId || !callback || callback.competitionId !== competitionId) return;

    const snapshot = readRegistrationHandoffAccountSnapshot();
    const effectiveLoggedIn = snapshot?.session.loggedIn ?? session.loggedIn;
    if (!effectiveLoggedIn) return;

    if (snapshot) {
      if (snapshot.session.loggedIn) login();
      else continueAsGuest();

      if (snapshot.identityMode === "multi") {
        setIdentityMode("multi");
      } else {
        setIdentityMode("none");
        if (snapshot.identityMode === "runtime") {
          if (snapshot.identities.length === 0) {
            setCompetitionIdentityScenario(competitionId, "none");
          } else {
            for (const savedIdentity of snapshot.identities) {
              const scenario = snapshotIdentityScenario(savedIdentity.identityStatus);
              if (scenario) setCompetitionIdentityScenario(savedIdentity.competitionId, scenario);
            }
          }
        }
      }
    }

    if (callback.status === "pending") {
      setCompetitionIdentityScenario(competitionId, "pending");
      setCallbackNotice("报名门户已回流：报名已提交，等待学校审核。 ");
    } else if (callback.status === "rejected") {
      setCompetitionIdentityScenario(competitionId, "rejected");
      setCallbackNotice("报名门户已回流：学校审核未通过。 ");
    } else if (callback.status === "approved") {
      setCompetitionIdentityScenario(competitionId, "active");
      setLifecycle(competitionId, "inProgress");
      setCallbackNotice("报名门户已回流：学校审核通过，赛事身份已生效。 ");
    } else {
      setCallbackNotice("已从报名门户返回，当前尚未形成新的赛事身份。 ");
    }

    clearRegistrationHandoffAccountSnapshot();
    const params = new URLSearchParams(location.search);
    callbackKeys.forEach(key => params.delete(key));
    navigate({ pathname: location.pathname, search: params.toString() ? `?${params.toString()}` : "" }, { replace: true });
  }, [
    callback,
    competitionId,
    continueAsGuest,
    location.pathname,
    location.search,
    login,
    navigate,
    session.loggedIn,
    setCompetitionIdentityScenario,
    setIdentityMode,
    setLifecycle,
  ]);

  if (!competitionId || !competition) return null;
  if (!session.loggedIn) return <PublicShell showNavigation={false}><PageHeader title="赛事报名" backTo={`/competitions/${competitionId}`} /><div className="px-4 py-6"><Card className="py-8 text-center"><p className="font-semibold text-text-primary">登录后继续报名</p><p className="mt-2 text-sm text-text-secondary">报名与赛事身份属于长期账号状态，游客不会读取或创建赛事身份。</p><Button className="mt-4" onClick={() => navigate(`/auth/login?returnTo=/competitions/${competitionId}/registration`)}>登录</Button></Card></div></PublicShell>;

  const runtime = getRuntime(competitionId);
  if (runtime.lifecycle === "ended") return <PublicShell showNavigation={false}><PageHeader title="赛事报名" backTo={`/competitions/${competitionId}`} /><div className="space-y-4 px-4 py-6"><Card className="border border-border-subtle"><StatusTag tone="neutral">赛事已结束</StatusTag><h1 className="mt-3 text-lg font-semibold text-text-primary">报名与审核操作已关闭</h1><p className="mt-2 text-sm text-text-secondary">赛事详情、工作区和报名门户共用同一赛事阶段边界。</p></Card><SecondaryButton className="w-full" onClick={() => navigate(`/competitions/${competitionId}`)}>返回赛事详情</SecondaryButton></div></PublicShell>;

  const state = identity?.identityStatus === "active" ? "approved" : identity?.identityStatus === "pending" ? "pending" : identity?.identityStatus === "rejected" ? "rejected" : "ready";
  const openPortal = () => {
    if (!portalUrl) return;
    const snapshotSaved = saveRegistrationHandoffAccountSnapshot({ session, identities, identityMode });
    if (!snapshotSaved) {
      setCallbackNotice("当前浏览器无法保存报名回流所需的账号快照，请保持在 App 内并稍后重试。 ");
      return;
    }
    window.location.assign(portalUrl);
  };
  const simulateApproved = () => { setCompetitionIdentityScenario(competitionId, "active"); setLifecycle(competitionId, "inProgress"); };

  return <PublicShell showNavigation={false}><PageHeader title="赛事报名" subtitle="响应式报名门户 handoff / callback" backTo={`/competitions/${competitionId}`} /><div className="space-y-5 px-4 py-6">
    <Card><StatusTag tone={state === "approved" ? "success" : state === "rejected" ? "danger" : state === "pending" ? "warning" : "info"}>{state}</StatusTag><h1 className="mt-3 text-lg font-semibold text-text-primary">{competition.name}</h1><p className="mt-2 text-sm leading-5 text-text-secondary">复杂队长 / 队员注册、团队成员、审核与承诺书继续由既有响应式报名门户承接；App 只负责进入、返回与共享赛事身份回流。</p></Card>
    {callbackNotice && <Card className="border border-info bg-info-bg"><p className="text-sm text-info-text">{callbackNotice}</p></Card>}
    {state === "ready" && <><Card className="border border-border-subtle"><p className="font-medium text-text-primary">进入既有报名门户</p><p className="mt-2 text-sm leading-5 text-text-secondary">将携带 competitionId、返回地址与原型账号来源上下文。离开前只在当前 Mobile origin 的 sessionStorage 保存一次性账号快照，返回消费 callback 后立即清理。</p></Card><Button data-testid="registration-portal-link" data-portal-url={portalUrl ?? ""} className="w-full" disabled={!portalUrl} onClick={openPortal}>{portalUrl ? "打开响应式报名门户" : "报名门户地址未配置"}</Button></>}
    {state === "pending" && <><Card className="border border-warning bg-warning-bg"><p className="font-medium text-warning-text">报名已提交，等待学校审核真实性</p><p className="mt-2 text-sm text-warning-text">当前 `identities[]` 已写入本赛事 pending；审核前不会获得赛事工作区权限。</p></Card><div className="grid grid-cols-2 gap-2"><SecondaryButton onClick={() => setCompetitionIdentityScenario(competitionId, "rejected")}>模拟审核未通过</SecondaryButton><Button onClick={simulateApproved}>模拟审核通过</Button></div></>}
    {state === "rejected" && <><Card className="border border-danger bg-danger-bg"><p className="font-medium text-danger-text">报名审核未通过</p><p className="mt-2 text-sm text-danger-text">回流状态与我的赛事、赛事详情和工作区读取同一份赛事身份。</p></Card><Button data-testid="registration-portal-link" data-portal-url={portalUrl ?? ""} className="w-full" disabled={!portalUrl} onClick={openPortal}>重新打开响应式报名门户</Button></>}
    {state === "approved" && <><Card className="border border-success bg-success-bg"><p className="font-medium text-success-text">审核通过，已获得赛事身份</p><p className="mt-2 text-sm text-success-text">首页、我的赛事与赛事工作区继续读取同一个 `identities[]`。</p></Card><Button className="w-full" onClick={() => navigate(`/competitions/${competitionId}/workspace`)}>进入赛事工作区</Button></>}
    <SecondaryButton className="w-full" onClick={() => navigate(`/competitions/${competitionId}`)}>返回赛事详情</SecondaryButton>
  </div></PublicShell>;
}

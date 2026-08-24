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
    logout,
    setCompetitionIdentityScenario,
  } = usePublicPlatform();
  const { getRuntime } = useWorkshopRuntime();
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
      else logout();

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
      setCallbackNotice("报名门户已回流：团队已提交，等待学校审核。 ");
    } else if (callback.status === "rejected") {
      setCompetitionIdentityScenario(competitionId, "rejected");
      setCallbackNotice("报名门户已回流：学校审核未通过，可回 PC 报名门户修正后重新提交。 ");
    } else if (callback.status === "approved") {
      setCompetitionIdentityScenario(competitionId, "active");
      setCallbackNotice("报名门户已回流：学校审核通过，团队名单已锁定。赛事生命周期不会因此自动切换为进行中。 ");
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
    logout,
    location.pathname,
    location.search,
    login,
    navigate,
    session.loggedIn,
    setCompetitionIdentityScenario,
    setIdentityMode,
  ]);

  if (!competitionId || !competition) return null;
  if (!session.loggedIn) return <PublicShell showNavigation={false}><PageHeader title="赛事报名" backTo={`/competitions/${competitionId}`} /><div className="px-4 py-6"><Card className="py-8 text-center"><p className="font-semibold text-text-primary">登录后继续报名</p><p className="mt-2 text-sm text-text-secondary">报名与赛事身份属于长期账号状态，未登录时不会读取或创建赛事身份。</p><Button className="mt-4" onClick={() => navigate(`/auth/login?returnTo=/competitions/${competitionId}/registration`)}>登录</Button></Card></div></PublicShell>;

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
  const simulateApproved = () => setCompetitionIdentityScenario(competitionId, "active");

  return <PublicShell showNavigation={false}><PageHeader title="赛事报名" subtitle="PC 主报名 · Mobile handoff 兜底" backTo={`/competitions/${competitionId}`} /><div className="space-y-5 px-4 py-6">
    <Card><StatusTag tone={state === "approved" ? "success" : state === "rejected" ? "danger" : state === "pending" ? "warning" : "info"}>{state}</StatusTag><h1 className="mt-3 text-lg font-semibold text-text-primary">{competition.name}</h1><p className="mt-2 text-sm leading-5 text-text-secondary">队长以 PC 响应式报名门户作为主报名端；App 负责赛事入口、登录、状态回流与无电脑场景兜底，不再维护第二套原生报名长表单。</p></Card>
    {callbackNotice && <Card className="border border-info bg-info-bg"><p className="text-sm text-info-text">{callbackNotice}</p></Card>}
    {state === "ready" && <><Card className="border border-border-subtle"><p className="font-medium text-text-primary">打开同一套 PC 响应式报名门户</p><p className="mt-2 text-sm leading-5 text-text-secondary">复杂团队资料推荐在电脑完成；手机也可以继续打开同一响应式页面作为兜底。系统会携带 competitionId、返回地址与账号上下文，不会产生第二份报名事实。</p></Card><Button data-testid="registration-portal-link" data-portal-url={portalUrl ?? ""} className="w-full" disabled={!portalUrl} onClick={openPortal}>{portalUrl ? "打开响应式报名门户" : "报名门户地址未配置"}</Button></>}
    {state === "pending" && <><Card className="border border-warning bg-warning-bg"><p className="font-medium text-warning-text">团队已提交，等待学校审核真实性</p><p className="mt-2 text-sm text-warning-text">审核期间团队名单冻结；普通队员账号尚不创建，正式赛事工作区权限也不会因为提交而提前开放。</p></Card><div className="grid grid-cols-2 gap-2"><SecondaryButton onClick={() => setCompetitionIdentityScenario(competitionId, "rejected")}>模拟审核未通过</SecondaryButton><Button onClick={simulateApproved}>模拟审核通过</Button></div></>}
    {state === "rejected" && <><Card className="border border-danger bg-danger-bg"><p className="font-medium text-danger-text">报名审核未通过</p><p className="mt-2 text-sm text-danger-text">团队返回可修正状态；普通队员账号此前没有创建，因此不存在账号回滚。</p></Card><Button data-testid="registration-portal-link" data-portal-url={portalUrl ?? ""} className="w-full" disabled={!portalUrl} onClick={openPortal}>回 PC 报名门户修正</Button></>}
    {state === "approved" && <><Card className="border border-success bg-success-bg"><p className="font-medium text-success-text">学校审核通过，团队名单已锁定</p><p className="mt-2 text-sm text-success-text">后续不再增员或替换成员；成员账号按 T028 处理。赛事阶段与外部官方资格仍按各自状态推进，不由学校审核结果自动改成“进行中”。</p></Card><Button className="w-full" onClick={() => navigate(`/competitions/${competitionId}/workspace`)}>查看赛事工作区状态</Button></>}
    <SecondaryButton className="w-full" onClick={() => navigate(`/competitions/${competitionId}`)}>返回赛事详情</SecondaryButton>
  </div></PublicShell>;
}

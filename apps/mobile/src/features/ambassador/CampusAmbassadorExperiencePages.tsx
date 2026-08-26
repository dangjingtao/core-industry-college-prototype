import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { CheckCircle2, Copy, Download, QrCode, ShieldCheck, Users } from "lucide-react";
import { Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ambassadorApplicationForm,
  ambassadorCampaignStatus,
  ambassadorTeamMemberCount,
  ambassadorTeamPartnerCount,
  isAmbassadorCodeActive,
  readableAmbassadorTerms,
  useAmbassadorState,
} from "@core/shared";
import { Button, Card, Dialog, PageHeader, PublicShell, SecondaryButton, StatusTag } from "../../components/ui";
import { useLongTermAssets } from "../long-term-assets/store";
import { usePublicPlatform } from "../public-platform/PublicPlatform";

const SCHOOL_LABELS: Record<string, string> = {
  "org-huanan-commerce-college": "华南商贸职业学院",
  "org-gdtc": "广东技术职业学院",
};

function schoolLabel(schoolId: string) {
  return SCHOOL_LABELS[schoolId] ?? "参与学校";
}

function useAccountId() {
  const location = useLocation();
  return new URLSearchParams(location.search).get("accountId") || "account-demo";
}

function qrPayload(path: string) {
  const base = (import.meta.env.VITE_PUBLIC_SITE_URL || window.location.origin).replace(/\/$/, "");
  return `${base}${path}`;
}

function svgDataUrl(svg: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function TeamRecruitmentQr({ code, teamId }: { code: string; teamId: string }) {
  const [svg, setSvg] = useState("");
  const [open, setOpen] = useState(false);
  const payload = useMemo(() => qrPayload(`/ambassadors/join?code=${encodeURIComponent(code)}`), [code]);

  useEffect(() => {
    let active = true;
    QRCode.toString(payload, { type: "svg", margin: 2, width: 280 }).then(value => {
      if (active) setSvg(value);
    });
    return () => { active = false; };
  }, [payload]);

  const dataUrl = svg ? svgDataUrl(svg) : "";
  return <>
    <Card data-testid="team-recruitment-code" className="overflow-hidden">
      <div className="flex items-start gap-4">
        <button
          type="button"
          data-testid="team-recruitment-qr"
          data-payload={payload}
          aria-label="查看团队招募二维码"
          onClick={() => setOpen(true)}
          className="flex size-28 shrink-0 items-center justify-center overflow-hidden rounded-container bg-white p-2 ring-1 ring-border-subtle"
        >
          {svg ? <span className="block size-full [&_svg]:size-full" dangerouslySetInnerHTML={{ __html: svg }} /> : <QrCode size={44} className="text-text-tertiary" />}
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2"><QrCode size={18} className="text-text-brand" /><h2 className="font-semibold text-text-primary">团队招募码</h2></div>
          <p className="mt-2 text-sm leading-5 text-text-secondary">分享给推广伙伴扫码加入当前团队。点击二维码可放大，手机端可长按保存。</p>
          <button type="button" onClick={() => navigator.clipboard?.writeText(payload)} className="mt-3 inline-flex min-h-touch items-center gap-1.5 text-sm font-medium text-text-brand"><Copy size={16} />复制邀请链接</button>
        </div>
      </div>
    </Card>
    <Dialog open={open} onOpenChange={setOpen} title="团队招募二维码" description="推广伙伴扫码后会直接看到加入确认，不需要输入任何编码。" size="sm">
      <div className="space-y-4 text-center">
        <div className="mx-auto w-full max-w-[320px] rounded-container bg-primary-container p-5">
          {dataUrl && <img data-testid="team-recruitment-qr-large" data-payload={payload} src={dataUrl} alt="团队招募二维码" className="mx-auto w-full rounded-control bg-white p-3" />}
          <p className="mt-3 text-xs text-text-secondary">长按二维码可保存到手机</p>
        </div>
        {dataUrl && <a href={dataUrl} download={`team-${teamId}-recruitment.svg`} className="inline-flex min-h-touch items-center justify-center gap-2 rounded-control bg-primary px-4 text-sm font-medium text-on-primary"><Download size={17} />下载二维码</a>}
      </div>
    </Dialog>
  </>;
}

function PersonalPromotionQr({ code }: { code: string }) {
  const [svg, setSvg] = useState("");
  const payload = useMemo(() => qrPayload(`/ambassadors/promote/${encodeURIComponent(code)}`), [code]);
  useEffect(() => {
    let active = true;
    QRCode.toString(payload, { type: "svg", margin: 2, width: 220 }).then(value => { if (active) setSvg(value); });
    return () => { active = false; };
  }, [payload]);
  return <Card data-testid="personal-promotion-code" className="border border-primary bg-primary-container">
    <div className="flex items-center gap-2"><QrCode size={18} className="text-text-brand" /><h2 className="font-semibold text-text-primary">我的专属推广码</h2></div>
    <p className="mt-2 text-sm leading-5 text-text-secondary">分享给尚未注册的新用户。扫码进入注册链路，完成新账号注册后归因到你。</p>
    <div className="mt-4 flex items-center gap-4">
      <div data-testid="personal-promotion-qr" data-payload={payload} className="size-28 shrink-0 rounded-control bg-white p-2 [&_svg]:size-full" dangerouslySetInnerHTML={{ __html: svg }} />
      <div className="min-w-0"><p className="text-xs text-text-tertiary">个人推广码</p><code className="mt-1 block break-all text-xs text-text-primary">{code}</code></div>
    </div>
  </Card>;
}

function invalidCodeMessage(status?: ReturnType<typeof ambassadorCampaignStatus>) {
  if (status === "ended") return { title: "活动已结束", detail: "本期招募已经停止，历史团队与成果会继续保留。" };
  if (status === "upcoming") return { title: "活动尚未开始", detail: "请在活动开始后重新扫码进入。" };
  return { title: "二维码无效或已失效", detail: "请重新扫描运营方提供的有效活动二维码。" };
}

export function CampusAmbassadorLandingPage() {
  const location = useLocation();
  const state = useAmbassadorState();
  const accountId = useAccountId();
  const code = new URLSearchParams(location.search).get("code")?.trim() || "";
  if (code) {
    const schoolCode = state.schoolRecruitmentCodes.find(item => item.code.toUpperCase() === code.toUpperCase());
    const schoolCampaign = schoolCode && state.campaigns.find(item => item.id === schoolCode.campaignId);
    if (schoolCode && schoolCampaign && isAmbassadorCodeActive(schoolCode, schoolCampaign)) {
      return <Navigate replace to={`/ambassadors/apply?campaignId=${encodeURIComponent(schoolCode.campaignId)}&schoolId=${encodeURIComponent(schoolCode.schoolId)}&accountId=${encodeURIComponent(accountId)}`} />;
    }
    const teamCode = state.teamRecruitmentCodes.find(item => item.code.toUpperCase() === code.toUpperCase());
    const teamCampaign = teamCode && state.campaigns.find(item => item.id === teamCode.campaignId);
    if (teamCode && teamCampaign && isAmbassadorCodeActive(teamCode, teamCampaign)) {
      return <Navigate replace to={`/ambassadors/join?code=${encodeURIComponent(teamCode.code)}&accountId=${encodeURIComponent(accountId)}`} />;
    }
    const matchedCampaign = schoolCampaign || teamCampaign;
    const message = invalidCodeMessage(matchedCampaign ? ambassadorCampaignStatus(matchedCampaign) : undefined);
    return <PublicShell showNavigation={false}><PageHeader title="核心大使计划" backTo="/me" /><div className="px-4 py-6"><Card><h2 className="font-semibold text-text-primary">{message.title}</h2><p className="mt-2 text-sm text-text-secondary">{message.detail}</p></Card></div></PublicShell>;
  }
  return <PublicShell showNavigation={false}><PageHeader title="核心大使计划" backTo="/me" /><div className="px-4 py-6"><Card><div className="flex items-start gap-3"><QrCode className="mt-0.5 text-text-brand" /><div><h2 className="font-semibold text-text-primary">请通过二维码进入</h2><p className="mt-2 text-sm leading-5 text-text-secondary">学校招募码、团队招募码会由扫码器自动识别并进入对应流程，无需手动输入编码。</p></div></div></Card></div></PublicShell>;
}

export function CampusAmbassadorApplyPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { session } = usePublicPlatform();
  const { profile } = useLongTermAssets();
  const state = useAmbassadorState();
  const accountId = useAccountId();
  const params = new URLSearchParams(location.search);
  const campaignId = params.get("campaignId") || "";
  const schoolId = params.get("schoolId") || "";
  const campaign = state.campaigns.find(item => item.id === campaignId);
  const schoolCode = state.schoolRecruitmentCodes.find(item => item.campaignId === campaignId && item.schoolId === schoolId);
  const existingTeam = campaign && state.teams.find(item => item.campaignId === campaign.id && item.members.some(member => member.accountId === accountId && member.status === "active"));
  const fields = campaign ? ambassadorApplicationForm(campaign) : [];
  const terms = campaign && state.termsVersions.find(item => item.id === campaign.termsVersion && item.status === "published");
  const [values, setValues] = useState<Record<string, string>>({});
  const [agreed, setAgreed] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [message, setMessage] = useState("");

  if (!campaign || !schoolCode || !isAmbassadorCodeActive(schoolCode, campaign)) {
    const invalid = invalidCodeMessage(campaign ? ambassadorCampaignStatus(campaign) : undefined);
    return <PublicShell showNavigation={false}><PageHeader title="核心大使申请" backTo="/me" /><div className="px-4 py-6"><Card><h2 className="font-semibold text-text-primary">{invalid.title}</h2><p className="mt-2 text-sm text-text-secondary">{invalid.detail}</p></Card></div></PublicShell>;
  }
  if (!session.loggedIn) return <Navigate replace to={`/auth/login?returnTo=${encodeURIComponent(location.pathname + location.search)}`} />;
  if (existingTeam) return <PublicShell showNavigation={false}><PageHeader title="核心大使申请" backTo="/me" /><div className="space-y-4 px-4 py-6"><Card><CheckCircle2 className="text-text-brand" /><h2 className="mt-3 font-semibold text-text-primary">你已加入本期推广团队</h2><p className="mt-2 text-sm text-text-secondary">同一期活动只能属于一个推广团队，不能重复申请核心大使或换队。</p></Card><Button className="w-full" onClick={() => navigate(`/ambassadors/team/${encodeURIComponent(existingTeam.id)}?accountId=${encodeURIComponent(accountId)}`)}>查看我的团队</Button></div></PublicShell>;

  const missing = fields.some(field => field.required && !(values[field.id] || "").trim());
  const submit = () => {
    if (missing || !agreed || !terms) { setMessage("请完成必填项并阅读同意活动条款"); return; }
    state.applyAsCoreAmbassador({ campaignId, schoolId, accountId, application: { ...values, termsVersion: campaign.termsVersion, __applicantName: profile.name } });
    const teamId = `amb-team-${campaignId}-${accountId}`;
    navigate(`/ambassadors/team/${encodeURIComponent(teamId)}?accountId=${encodeURIComponent(accountId)}`, { replace: true });
  };

  return <PublicShell showNavigation={false}><PageHeader title="核心大使申请" backTo="/me" /><div className="space-y-4 px-4 py-5">
    <Card className="border border-primary bg-primary-container"><StatusTag tone="info">校园招募</StatusTag><h1 className="mt-3 text-lg font-semibold text-text-primary">申请成为核心大使</h1><p className="mt-2 text-sm text-text-secondary">{campaign.name} · {schoolLabel(schoolId)}</p></Card>
    <Card><div className="space-y-4">{fields.map(field => <label key={field.id} className="block"><span className="mb-1.5 block text-sm font-medium text-text-primary">{field.label}{field.required && <span className="ml-1 text-danger">*</span>}</span>{field.type === "textarea" ? <textarea aria-label={field.label} rows={4} value={values[field.id] || ""} onChange={event => setValues(current => ({ ...current, [field.id]: event.target.value }))} className="w-full rounded-control border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary" /> : field.type === "single-choice" ? <select aria-label={field.label} value={values[field.id] || ""} onChange={event => setValues(current => ({ ...current, [field.id]: event.target.value }))} className="min-h-touch w-full rounded-control border border-border bg-surface px-3 text-sm"><option value="">请选择</option>{field.options?.map(option => <option key={option}>{option}</option>)}</select> : field.type === "multi-choice" ? <div className="space-y-2">{field.options?.map(option => { const selected = (values[field.id] || "").split("、").filter(Boolean); return <label key={option} className="flex items-center gap-2 text-sm text-text-primary"><input type="checkbox" checked={selected.includes(option)} onChange={event => { const next = event.target.checked ? [...selected, option] : selected.filter(item => item !== option); setValues(current => ({ ...current, [field.id]: next.join("、") })); }} />{option}</label>; })}</div> : <input aria-label={field.label} value={values[field.id] || ""} onChange={event => setValues(current => ({ ...current, [field.id]: event.target.value }))} className="min-h-touch w-full rounded-control border border-border bg-surface px-3 text-sm outline-none focus:border-primary" />}</label>)}</div></Card>
    <Card><label className="flex items-start gap-3"><input aria-label="同意活动条款" type="checkbox" checked={agreed} onChange={event => setAgreed(event.target.checked)} className="mt-1" /><span className="text-sm leading-6 text-text-secondary">我已阅读并同意 <button type="button" onClick={() => setTermsOpen(true)} className="font-medium text-text-brand underline underline-offset-2">{terms?.title || "核心大使计划活动条款"}</button></span></label></Card>
    {message && <p className="rounded-control bg-danger-bg px-3 py-2 text-sm text-danger-text">{message}</p>}
    <Button className="w-full" onClick={submit}>提交申请，获得团队招募码</Button>
  </div><Dialog open={termsOpen} onOpenChange={setTermsOpen} title={terms ? readableAmbassadorTerms(terms) : "核心大使计划活动条款"} description="请确认理解本期活动的组队、推广与激励规则。" size="sm">{terms ? <div data-testid="ambassador-terms-content" className="max-h-[60vh] space-y-3 overflow-y-auto text-sm leading-6 text-text-secondary [&_h3]:mt-4 [&_h3]:font-semibold [&_h3]:text-text-primary" dangerouslySetInnerHTML={{ __html: terms.contentHtml }} /> : <p className="text-sm text-text-secondary">条款暂不可用。</p>}</Dialog></PublicShell>;
}

export function CampusAmbassadorJoinPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { session } = usePublicPlatform();
  const state = useAmbassadorState();
  const accountId = useAccountId();
  const code = new URLSearchParams(location.search).get("code")?.trim() || "";
  const recruitment = state.teamRecruitmentCodes.find(item => item.code.toUpperCase() === code.toUpperCase());
  const campaign = recruitment && state.campaigns.find(item => item.id === recruitment.campaignId);
  const team = recruitment && state.teams.find(item => item.id === recruitment.teamId);
  const ambassador = team?.members.find(member => member.role === "ambassador" && member.status === "active");
  const inviter = ambassador?.application?.__applicantName || "核心大使";
  const existingTeam = campaign && state.teams.find(item => item.campaignId === campaign.id && item.members.some(member => member.accountId === accountId && member.status === "active"));

  if (!recruitment || !campaign || !team || !isAmbassadorCodeActive(recruitment, campaign)) {
    const invalid = invalidCodeMessage(campaign ? ambassadorCampaignStatus(campaign) : undefined);
    return <PublicShell showNavigation={false}><PageHeader title="加入推广团队" backTo="/me" /><div className="px-4 py-6"><Card><h2 className="font-semibold text-text-primary">{invalid.title}</h2><p className="mt-2 text-sm text-text-secondary">{invalid.detail}</p></Card></div></PublicShell>;
  }
  if (!session.loggedIn) return <Navigate replace to={`/auth/login?returnTo=${encodeURIComponent(location.pathname + location.search)}`} />;

  if (existingTeam) return <PublicShell showNavigation={false}><PageHeader title="加入推广团队" backTo="/me" /><div className="space-y-4 px-4 py-6"><Card><CheckCircle2 className="text-text-brand" /><h2 className="mt-3 font-semibold text-text-primary">你已加入本期推广团队</h2><p className="mt-2 text-sm text-text-secondary">同一期活动只能加入一个团队，活动期间不可退出或换队。</p></Card><Button className="w-full" onClick={() => navigate(`/ambassadors/team/${encodeURIComponent(existingTeam.id)}?accountId=${encodeURIComponent(accountId)}`)}>查看我的团队</Button></div></PublicShell>;

  const confirm = () => {
    state.joinAmbassadorTeam({ campaignId: campaign.id, recruitmentCode: recruitment.code, accountId });
    navigate(`/ambassadors/team/${encodeURIComponent(team.id)}?accountId=${encodeURIComponent(accountId)}`, { replace: true });
  };
  return <PublicShell showNavigation={false}><PageHeader title="加入推广团队" backTo="/me" /><div className="space-y-4 px-4 py-5">
    <Card className="border border-primary bg-primary-container"><Users className="text-text-brand" /><h1 className="mt-3 text-lg font-semibold text-text-primary">{inviter} 邀请你加入推广团队</h1><p className="mt-2 text-sm text-text-secondary">{campaign.name} · {schoolLabel(team.schoolId)}</p></Card>
    <Card><div className="space-y-3 text-sm"><div><p className="text-text-tertiary">加入后的身份</p><p className="mt-1 font-medium text-text-primary">推广伙伴</p></div><div><p className="text-text-tertiary">团队规则</p><p className="mt-1 leading-5 text-text-secondary">活动期间不可主动退出或更换团队；团队点亮后你会获得自己的专属推广码。</p></div></div></Card>
    <div className="grid grid-cols-2 gap-3"><SecondaryButton onClick={() => navigate(`/me?accountId=${encodeURIComponent(accountId)}`)}>取消</SecondaryButton><Button onClick={confirm}>确认加入</Button></div>
  </div></PublicShell>;
}

export function CampusAmbassadorTeamPage() {
  const location = useLocation();
  const { teamId = "" } = useParams();
  const navigate = useNavigate();
  const { session } = usePublicPlatform();
  const accountId = useAccountId();
  const state = useAmbassadorState();
  const team = state.teams.find(item => item.id === teamId);
  const campaign = team && state.campaigns.find(item => item.id === team.campaignId);
  const member = team?.members.find(item => item.accountId === accountId && item.status === "active");
  const recruitment = team && state.teamRecruitmentCodes.find(item => item.id === team.recruitmentCodeId);
  const promotionCode = team && member?.promotionCodeId ? state.promotionCodes.find(item => item.id === member.promotionCodeId && item.teamId === team.id) : undefined;

  if (!session.loggedIn) return <Navigate replace to={`/auth/login?returnTo=${encodeURIComponent(location.pathname + location.search)}`} />;
  if (!team || !campaign || !member) return <PublicShell showNavigation={false}><PageHeader title="我的推广团队" backTo="/me" /><div className="px-4 py-6"><Card><h2 className="font-semibold text-text-primary">无法查看该团队</h2><p className="mt-2 text-sm text-text-secondary">只有当前团队成员可以查看团队页面。</p></Card></div></PublicShell>;

  const isAmbassador = member.role === "ambassador";
  const memberCount = ambassadorTeamMemberCount(team);
  const partnerCount = ambassadorTeamPartnerCount(team);
  const remaining = Math.max(0, 3 - partnerCount);
  const ended = team.status === "ended";
  const recruitmentActive = Boolean(recruitment && isAmbassadorCodeActive(recruitment, campaign));
  const promotionActive = Boolean(promotionCode && isAmbassadorCodeActive(promotionCode, campaign));
  const statusTone = team.status === "lit" ? "success" : ended ? "neutral" : "warning";
  const statusText = team.status === "lit" ? "已点亮" : ended ? "已结束" : "待点亮";

  return <PublicShell showNavigation={false}><PageHeader title="我的推广团队" backTo={`/me?accountId=${encodeURIComponent(accountId)}`} /><div className="space-y-4 px-4 py-5">
    <Card className={team.status === "lit" ? "border border-primary bg-primary-container" : ended ? "border border-border-subtle bg-surface-subtle" : "border border-warning-border bg-warning-bg"}><div className="flex items-start justify-between gap-3"><div><StatusTag tone={statusTone}>{statusText}</StatusTag><h1 className="mt-3 text-lg font-semibold text-text-primary">核心大使计划团队</h1><p className="mt-1 text-sm text-text-secondary">{campaign.name}</p></div><Users className="text-text-brand" /></div></Card>
    <Card><div className="flex items-center justify-between"><span className="text-sm text-text-secondary">团队人数</span><strong className="text-text-primary">{memberCount} 人</strong></div>{!ended && <><div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-subtle"><div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, memberCount / 4 * 100)}%` }} /></div><p className="mt-3 text-xs leading-5 text-text-secondary">点亮条件：1 位核心大使 + 至少 3 位推广伙伴。点亮后仍可继续加入。</p>{remaining > 0 && <p className="mt-2 rounded-control bg-warning-bg px-3 py-2 text-sm text-warning-text">还需 {remaining} 位推广伙伴</p>}</>}</Card>
    {ended && <Card data-testid="ambassador-history-state" className="border border-border-subtle bg-surface-subtle"><h2 className="font-semibold text-text-primary">本期活动已结束</h2><p className="mt-2 text-sm leading-5 text-text-secondary">团队关系与既有推广成果作为往期记录保留；团队招募码和专属推广码均已停止生效。</p></Card>}
    {!ended && isAmbassador && recruitment && recruitmentActive && <TeamRecruitmentQr code={recruitment.code} teamId={team.id} />}
    {team.status === "forming" && <Card className="bg-warning-bg"><h2 className="font-semibold text-warning-text">团队点亮后开放专属推广码</h2><p className="mt-1 text-xs text-text-secondary">当前阶段继续邀请推广伙伴，不会提前产生推广归因。</p></Card>}
    {team.status === "lit" && promotionCode && promotionActive && <PersonalPromotionQr code={promotionCode.code} />}
    {isAmbassador && <Card><div className="flex items-center justify-between"><h2 className="font-semibold text-text-primary">{ended ? "往期成员" : "当前成员"}</h2><span className="text-sm text-text-secondary">{memberCount} 人</span></div><div className="mt-3 divide-y divide-border-subtle">{team.members.filter(item => item.status === "active").map((item, index) => <div key={item.id} data-testid="ambassador-member" className="flex min-h-14 items-center justify-between gap-3"><div><p className="text-sm font-medium text-text-primary">{item.role === "ambassador" ? (item.application?.__applicantName || "核心大使") : `推广伙伴 ${index}`}</p><p className="mt-0.5 text-xs text-text-tertiary">{item.role === "ambassador" ? "核心大使" : "推广伙伴"}</p></div>{item.role === "ambassador" && <StatusTag tone="info">负责人</StatusTag>}</div>)}</div></Card>}
    {isAmbassador && (team.status === "lit" || ended) && <Button className="w-full" onClick={() => navigate(`/ambassadors/team/${encodeURIComponent(team.id)}/results?accountId=${encodeURIComponent(accountId)}`)}>查看团队推广成果</Button>}
    {!isAmbassador && <Card><div className="flex items-start gap-2"><ShieldCheck size={18} className="mt-0.5 text-text-brand" /><p className="text-sm leading-5 text-text-secondary">推广伙伴只查看团队状态{ended ? "和往期参与记录" : "和自己的专属推广码"}，不展示个人、成员或团队推广成果数字。</p></div></Card>}
  </div></PublicShell>;
}

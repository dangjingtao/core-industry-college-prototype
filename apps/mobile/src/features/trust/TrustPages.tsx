import { useRef, useState } from "react";
import { Download, ExternalLink, FileCheck2, QrCode, Save, ShieldCheck, Upload } from "lucide-react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { Button, Card, GhostButton, PageHeader, PublicShell, SecondaryButton, Section, StatusTag } from "../../components/ui";
import { resultById } from "../competition-workspace/data";
import { courses } from "../long-term-assets/data";
import { TrustNote } from "../long-term-assets/shared";
import { useLongTermAssets } from "../long-term-assets/store";
import { companyById, competitionById, opportunities } from "../public-platform/data";
import { usePublicPlatform } from "../public-platform/PublicPlatform";

type CompanyTab = "overview" | "business";
type VerificationMode = "code" | "qr" | "file";
type UploadedFileState = {
  name: string;
  size: number;
  typeLabel: "PDF" | "OFD" | "不支持";
  status: "ready" | "valid" | "invalid";
  reason?: string;
};

const MAX_CREDENTIAL_FILE_SIZE = 10 * 1024 * 1024;

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function downloadPrototypeArtifact(filename: string, lines: string[]) {
  const body = [
    "核心产业学院｜中保真原型下载占位",
    "",
    ...lines,
    "",
    "说明：真实环境应由可信凭证/成绩服务返回正式 PDF、OFD 或图片文件；本原型仅验证下载交互与信息边界。",
  ].join("\n");
  const blob = new Blob([body], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function openOfficialVerificationHandoff(context?: string) {
  const popup = window.open("about:blank", "_blank");
  if (!popup) return false;
  popup.opener = null;
  popup.document.title = "官方验真平台 handoff（原型）";
  popup.document.body.style.fontFamily = "system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
  popup.document.body.style.maxWidth = "680px";
  popup.document.body.style.margin = "48px auto";
  popup.document.body.style.padding = "0 24px";
  const title = popup.document.createElement("h1");
  title.textContent = "官方验真平台 handoff（原型）";
  const description = popup.document.createElement("p");
  description.textContent = "真实环境将在这里打开证书签发方配置的官方验真地址，而不是由核心产业学院伪造一个官方站点。";
  const payload = popup.document.createElement("pre");
  payload.textContent = `handoff payload: ${context || "credential source context"}`;
  payload.style.whiteSpace = "pre-wrap";
  payload.style.padding = "16px";
  payload.style.background = "#f5f5f5";
  payload.style.borderRadius = "12px";
  const note = popup.document.createElement("p");
  note.textContent = "生产接入：issuer.officialVerificationUrl + verificationCode / credentialId。";
  popup.document.body.append(title, description, payload, note);
  return true;
}

function BusinessField({ label, value, wide = false }: { label: string; value: string; wide?: boolean }) {
  return <div className={wide ? "col-span-2" : ""}><dt className="text-xs text-text-tertiary">{label}</dt><dd className="mt-1 text-sm leading-5 text-text-primary">{value}</dd></div>;
}

export function CompanyDetailTrustedPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { companyId } = useParams();
  const item = companyById(companyId);
  const { session, followedCompanies, toggleFollow } = usePublicPlatform();
  if (!item) return <PublicShell showNavigation={false}><PageHeader title="企业不存在" backTo="/companies" /></PublicShell>;

  const params = new URLSearchParams(location.search);
  const tab: CompanyTab = params.get("tab") === "business" ? "business" : "overview";
  const from = params.get("from");
  const followed = followedCompanies.includes(item.id);
  const follow = () => session.loggedIn
    ? toggleFollow(item.id)
    : navigate(`/auth/login?returnTo=${encodeURIComponent(`${location.pathname}${location.search}`)}`);
  const setTab = (next: CompanyTab) => {
    const nextParams = new URLSearchParams(location.search);
    if (next === "business") nextParams.set("tab", "business");
    else nextParams.delete("tab");
    const search = nextParams.toString();
    navigate({ pathname: location.pathname, search: search ? `?${search}` : "" }, { replace: true });
  };
  const companyOpportunities = opportunities.filter(opportunity => opportunity.companyId === item.id);

  return <PublicShell showNavigation={false}><PageHeader title="企业详情" backTo={from || "/companies"} /><div className="space-y-6 px-4 py-5">
    <div><div className="flex items-center gap-2"><StatusTag tone="info">合作企业</StatusTag><StatusTag tone="success">主体信息已入库</StatusTag></div><h1 className="mt-3 text-2xl font-semibold text-text-primary">{item.name}</h1><p className="mt-1 text-sm text-text-brand">{item.industry}</p><p className="mt-4 text-base leading-6 text-text-secondary">{item.summary}</p><SecondaryButton className="mt-4" onClick={follow}>{session.loggedIn ? followed ? "已关注" : "关注企业" : "登录后关注"}</SecondaryButton></div>

    <div className="grid grid-cols-2 gap-2 rounded-container bg-surface-subtle p-1"><button className={`min-h-touch rounded-control px-3 text-sm font-medium ${tab === "overview" ? "bg-surface text-text-primary shadow-card" : "text-text-secondary"}`} onClick={() => setTab("overview")}>合作概览</button><button className={`min-h-touch rounded-control px-3 text-sm font-medium ${tab === "business" ? "bg-surface text-text-primary shadow-card" : "text-text-secondary"}`} onClick={() => setTab("business")}>工商信息</button></div>

    {tab === "overview" ? <>
      <Section title="与平台的资源关系"><div className="space-y-2">{item.resourceRelations.map((relation, index) => relation.to ? <button key={`${relation.type}-${index}`} className="flex min-h-touch w-full items-center justify-between rounded-control bg-surface px-3 py-2 text-left active:bg-surface-pressed" onClick={() => navigate(relation.to!)}><span><StatusTag tone="neutral">{relation.type}</StatusTag><span className="ml-2 text-sm font-medium text-text-primary">{relation.title}</span></span><span className="text-text-tertiary">›</span></button> : <div key={`${relation.type}-${index}`} className="flex min-h-touch w-full items-center justify-between rounded-control bg-surface px-3 py-2"><span><StatusTag tone="neutral">{relation.type}</StatusTag><span className="ml-2 text-sm font-medium text-text-primary">{relation.title}</span></span><span className="text-xs text-text-tertiary">线下 / 待接入</span></div>)}</div></Section>
      <Section title="当前机会"><div className="space-y-3">{companyOpportunities.map(opportunity => <Link key={opportunity.id} to={`/opportunities/${opportunity.id}`} className="block"><Card interactive><div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold text-text-primary">{opportunity.title}</h3><p className="mt-1 text-sm text-text-secondary">{opportunity.city} · {opportunity.mode}</p></div><StatusTag tone={opportunity.status === "open" ? "success" : "neutral"}>{opportunity.status === "open" ? "开放中" : "已结束"}</StatusTag></div><p className="mt-3 text-sm leading-5 text-text-secondary">{opportunity.summary}</p></Card></Link>)}</div></Section>
      <button className="min-h-touch w-full rounded-control bg-surface px-4 text-sm font-medium text-text-brand" onClick={() => setTab("business")}>查看可信工商基础信息 →</button>
    </> : <>
      <Card className="border border-border-subtle"><div className="flex items-start gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-success-bg text-success-text"><ShieldCheck size={20} aria-hidden="true" /></span><div><h2 className="font-semibold text-text-primary">可信基础层</h2><p className="mt-1 text-sm leading-5 text-text-secondary">用于确认合作主体是谁，不替代赛事、课程、权益、活动和机会这些企业页的主心智；生产环境应由企业认证或工商数据源回流。</p></div></div></Card>
      <Section title="工商登记信息"><Card><dl className="grid grid-cols-2 gap-x-4 gap-y-5"><BusinessField label="法定代表人" value={item.businessInfo.legalRepresentative} /><BusinessField label="注册资本" value={item.businessInfo.registeredCapital} /><BusinessField label="经营状态" value={item.businessInfo.operatingStatus} /><BusinessField label="成立日期" value={item.businessInfo.establishedDate} /><BusinessField label="企业类型" value={item.businessInfo.companyType} wide /><BusinessField label="所属行业" value={item.businessInfo.industry} /><BusinessField label="所属地区" value={item.businessInfo.region} /><BusinessField label="统一社会信用代码" value={item.businessInfo.unifiedSocialCreditCode} wide /><BusinessField label="工商注册号" value={item.businessInfo.registrationNumber} /><BusinessField label="核准日期" value={item.businessInfo.approvalDate} /><BusinessField label="登记机关" value={item.businessInfo.registrationAuthority} wide /><BusinessField label="注册地址" value={item.businessInfo.registeredAddress} wide /><BusinessField label="经营范围" value={item.businessInfo.businessScope} wide /></dl></Card></Section>
      <p className="text-xs leading-5 text-text-tertiary">当前内容为原型 Mock 数据，用于验证字段、信息层级与交互。真实产品不得把原型数据当作官方工商事实。</p>
    </>}
  </div></PublicShell>;
}

export function CertificateDetailTrustedPage() {
  const { certificateId } = useParams();
  const navigate = useNavigate();
  const { certificates, claimCertificate } = useLongTermAssets();
  const [saved, setSaved] = useState(false);
  const [handoffOpened, setHandoffOpened] = useState(false);
  const item = certificates.find(value => value.id === certificateId);
  if (!item) return <PublicShell showNavigation={false}><PageHeader title="证书不存在" backTo="/assets/certificates" /></PublicShell>;
  const sourceTitle = item.sourceType === "competition" ? competitionById(item.competitionId)?.name : courses.find(course => course.id === item.courseId)?.title;
  const statusLabel = item.status === "claimed" ? "已领取" : item.status === "claimable" ? "可领取" : item.status === "pending" ? "待发放" : "已撤销";

  return <PublicShell showNavigation={false}><PageHeader title="证书详情" backTo="/assets/certificates" /><div className="space-y-5 px-4 py-5">
    <Card className="space-y-4"><div><p className="text-xs text-text-secondary">{item.issuer}</p><h1 className="mt-1 text-xl font-semibold leading-7 text-text-primary">{item.title}</h1></div><div className="grid grid-cols-2 gap-3 text-sm"><div><p className="text-text-tertiary">来源</p><p className="mt-1 text-text-primary">{sourceTitle ?? "—"}</p></div><div><p className="text-text-tertiary">状态</p><p className="mt-1 text-text-primary">{statusLabel}</p></div></div><div className="border-t border-border-subtle pt-3"><p className="text-xs text-text-tertiary">验真码</p><p className="mt-1 font-mono text-sm text-text-primary">{item.verificationCode}</p></div></Card>
    {item.status === "claimable" && <Button className="w-full" onClick={() => claimCertificate(item.id)}>领取证书</Button>}
    <div className="grid grid-cols-2 gap-3"><SecondaryButton className="w-full" onClick={() => setSaved(true)}><Save size={16} aria-hidden="true" />{saved ? "已保存" : "保存证书"}</SecondaryButton><SecondaryButton className="w-full" onClick={() => downloadPrototypeArtifact(`${item.id}-certificate.txt`, [`证书：${item.title}`, `签发方：${item.issuer}`, `验真码：${item.verificationCode}`, `状态：${statusLabel}`])}><Download size={16} aria-hidden="true" />下载证书</SecondaryButton></div>
    {saved && <Card className="border border-success bg-success-bg"><p className="text-sm font-medium text-success-text">证书已保存到本地资产动作（Mock）</p><p className="mt-1 text-xs text-success-text">真实客户端应保存正式图片 / PDF，并处理系统相册或文件权限。</p></Card>}
    <SecondaryButton className="w-full" onClick={() => navigate(`/assets/verification?code=${encodeURIComponent(item.verificationCode)}`)}>进入三种方式验真</SecondaryButton>
    <Section title="官方平台验真"><Card><p className="text-sm leading-5 text-text-secondary">领取后可前往签发方配置的官方平台继续验真。原型不会伪造一个第三方官方地址。</p><Button className="mt-4 w-full" onClick={() => setHandoffOpened(openOfficialVerificationHandoff(`verificationCode=${item.verificationCode}`))}><ExternalLink size={16} aria-hidden="true" />前往官方验真平台</Button>{handoffOpened && <p className="mt-2 text-xs text-text-tertiary">已打开 handoff 原型页；生产环境替换为签发方真实 URL。</p>}</Card></Section>
    <TrustNote />
  </div></PublicShell>;
}

export function ResultDetailTrustedPage() {
  const { resultId } = useParams();
  const { competitionResults } = useLongTermAssets();
  const record = competitionResults.find(item => item.id === resultId);
  if (!record) return <PublicShell showNavigation={false}><PageHeader title="结果不存在" backTo="/assets/results" /></PublicShell>;
  const competition = competitionById(record.competitionId);
  const template = resultById(record.resultId);
  const statusLabel = record.status === "trusted" ? "系统可信事实" : record.status === "pending" ? "处理中" : "已归档";
  const statusTone = record.status === "trusted" ? "success" : record.status === "pending" ? "warning" : "neutral";

  return <PublicShell showNavigation={false}><PageHeader title="结果详情" backTo="/assets/results" /><div className="space-y-5 px-4 py-5"><Card className="space-y-3"><div className="flex items-start justify-between gap-3"><div><p className="text-xs text-text-secondary">{competition?.name}</p><h1 className="mt-1 text-xl font-semibold text-text-primary">{record.grade}</h1></div><StatusTag tone={statusTone}>{statusLabel}</StatusTag></div>{template && <><p className="text-sm leading-5 text-text-secondary">关联项目成果：{template.title}</p><p className="text-sm leading-5 text-text-secondary">{template.summary}</p></>}</Card>
    <Button className="w-full" onClick={() => downloadPrototypeArtifact(`${record.id}-score-report.txt`, [`赛事：${competition?.name ?? record.competitionId}`, `成绩：${record.grade}`, `可信状态：${statusLabel}`, `结果 ID：${record.id}`])}><Download size={16} aria-hidden="true" />下载成绩报告</Button>
    <p className="text-xs leading-5 text-text-tertiary">当前下载为中保真占位文件；真实成绩服务接入后替换为正式报告文件，不改变本页交互。</p>
    {record.certificateId && <Link to={`/assets/certificates/${record.certificateId}`} className="block"><Card interactive><p className="font-medium text-text-primary">查看关联证书 →</p></Card></Link>}<TrustNote /></div></PublicShell>;
}

export function VerificationTrustedPage() {
  const { certificates } = useLongTermAssets();
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const params = new URLSearchParams(location.search);
  const [mode, setMode] = useState<VerificationMode>("code");
  const [code, setCode] = useState(params.get("code") ?? "");
  const [codeChecked, setCodeChecked] = useState(false);
  const [qrState, setQrState] = useState<"idle" | "valid">("idle");
  const [fileState, setFileState] = useState<UploadedFileState | null>(null);
  const [handoffOpened, setHandoffOpened] = useState(false);
  const codeMatch = codeChecked ? certificates.find(item => item.verificationCode.toLowerCase() === code.trim().toLowerCase() && item.status !== "revoked") : undefined;
  const qrMatch = qrState === "valid" ? certificates.find(item => item.status === "claimed") : undefined;

  const chooseFile = (file?: File) => {
    if (!file) return;
    const extension = file.name.split(".").pop()?.toLowerCase();
    const typeLabel: UploadedFileState["typeLabel"] = extension === "pdf" ? "PDF" : extension === "ofd" ? "OFD" : "不支持";
    if (typeLabel === "不支持") {
      setFileState({ name: file.name, size: file.size, typeLabel, status: "invalid", reason: "仅支持 PDF / OFD 可信电子凭证文件。" });
      return;
    }
    if (file.size > MAX_CREDENTIAL_FILE_SIZE) {
      setFileState({ name: file.name, size: file.size, typeLabel, status: "invalid", reason: "文件超过 10MB 上限。" });
      return;
    }
    setFileState({ name: file.name, size: file.size, typeLabel, status: "ready" });
  };

  const modeOptions: { key: VerificationMode; label: string; note: string }[] = [
    { key: "code", label: "验真码", note: "输入凭证上的验证码" },
    { key: "qr", label: "扫码验真", note: "扫描统一标准二维码" },
    { key: "file", label: "文件验真", note: "上传 PDF / OFD" },
  ];

  return <PublicShell showNavigation={false}><PageHeader title="可信凭证验真" backTo="/assets" /><div className="space-y-5 px-4 py-5">
    <Card className="border border-border-subtle"><div className="flex items-start gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-container text-text-brand"><ShieldCheck size={20} aria-hidden="true" /></span><div><h1 className="font-semibold text-text-primary">三种验真入口</h1><p className="mt-1 text-sm leading-5 text-text-secondary">验真码、统一标准二维码、PDF / OFD 文件都进入同一可信凭证服务；当前摄像头与文件解析使用 Mock。</p></div></div></Card>

    <div className="grid grid-cols-3 gap-2">{modeOptions.map(option => <button key={option.key} onClick={() => setMode(option.key)} className={`min-h-touch rounded-control px-2 py-2 text-center ${mode === option.key ? "bg-primary-container text-text-brand" : "bg-surface text-text-secondary"}`}><span className="block text-sm font-semibold">{option.label}</span><span className="mt-1 block text-[11px] leading-4 opacity-80">{option.note}</span></button>)}</div>

    {mode === "code" && <Card><label className="text-sm font-medium text-text-primary">证书验真码</label><input value={code} onChange={event => { setCode(event.target.value); setCodeChecked(false); }} className="mt-3 min-h-touch w-full rounded-control border border-border bg-surface px-3 text-sm outline-none focus:border-primary" placeholder="输入证书验真码" /><Button className="mt-3 w-full" disabled={!code.trim()} onClick={() => setCodeChecked(true)}>验证</Button>{codeChecked && (codeMatch ? <div className="mt-4 rounded-control border border-success bg-success-bg p-3"><p className="font-semibold text-success-text">验证通过</p><p className="mt-1 text-sm text-success-text">{codeMatch.title} · {codeMatch.issuer}</p><p className="mt-2 text-xs text-success-text">可信事实来自系统证书记录，简历编辑器不可修改。</p></div> : <div className="mt-4 rounded-control border border-danger bg-danger-bg p-3"><p className="font-semibold text-danger-text">未找到有效记录</p><p className="mt-1 text-sm text-danger-text">请检查验真码，或确认凭证是否已撤销。</p></div>)}</Card>}

    {mode === "qr" && <Card className="text-center"><span className="mx-auto flex size-20 items-center justify-center rounded-[20px] bg-surface-subtle text-text-brand"><QrCode size={42} aria-hidden="true" /></span><h2 className="mt-4 font-semibold text-text-primary">扫描统一标准验证二维码</h2><p className="mt-2 text-sm leading-5 text-text-secondary">真实客户端调用摄像头；中保真原型直接模拟扫描入库凭证二维码。</p><Button className="mt-4 w-full" onClick={() => setQrState("valid")}>启动扫码（Mock）</Button>{qrState === "valid" && qrMatch && <div className="mt-4 rounded-control border border-success bg-success-bg p-3 text-left"><p className="font-semibold text-success-text">二维码有效</p><p className="mt-1 text-sm text-success-text">{qrMatch.title} · {qrMatch.issuer}</p><p className="mt-2 text-xs text-success-text">已获取入库凭证数据与文件索引（Mock）。</p></div>}</Card>}

    {mode === "file" && <Card><div className="flex items-start gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface-subtle text-text-brand"><FileCheck2 size={20} aria-hidden="true" /></span><div><h2 className="font-semibold text-text-primary">上传教育可信电子凭证</h2><p className="mt-1 text-sm leading-5 text-text-secondary">支持 PDF / OFD，单文件不超过 10MB。可点击选择；真实产品可同时支持拖拽。</p></div></div><input ref={fileInputRef} type="file" accept=".pdf,.ofd,application/pdf" className="hidden" onChange={event => chooseFile(event.target.files?.[0])} /><SecondaryButton className="mt-4 w-full" onClick={() => fileInputRef.current?.click()}><Upload size={16} aria-hidden="true" />选择 PDF / OFD 文件</SecondaryButton>{fileState && <div className="mt-4 rounded-control border border-border-subtle bg-surface-subtle p-3"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-medium text-text-primary">{fileState.name}</p><p className="mt-1 text-xs text-text-secondary">{fileState.typeLabel} · {formatBytes(fileState.size)} · 上限 10MB</p></div><StatusTag tone={fileState.status === "valid" ? "success" : fileState.status === "invalid" ? "danger" : "info"}>{fileState.status === "valid" ? "验证通过" : fileState.status === "invalid" ? "不可验证" : "待验证"}</StatusTag></div>{fileState.reason && <p className="mt-2 text-xs text-danger-text">{fileState.reason}</p>}{fileState.status === "ready" && <Button className="mt-3 w-full" onClick={() => setFileState(current => current ? { ...current, status: "valid" } : current)}>开始文件验真（Mock）</Button>}{fileState.status === "valid" && <p className="mt-3 text-sm leading-5 text-success-text">文件格式、大小与入库摘要验证通过（Mock）；真实服务在这里执行签名 / 摘要 / 状态校验。</p>}</div>}</Card>}

    <Section title="官方验证出口"><Card><div className="flex items-start gap-3"><ExternalLink size={20} className="mt-0.5 shrink-0 text-text-brand" aria-hidden="true" /><div><h2 className="font-semibold text-text-primary">前往签发方官方验真平台</h2><p className="mt-1 text-sm leading-5 text-text-secondary">外部 handoff 是独立出口。生产环境读取签发方配置的官方 URL，并携带必要的 verificationCode / credentialId。</p></div></div><Button className="mt-4 w-full" onClick={() => setHandoffOpened(openOfficialVerificationHandoff(codeMatch?.verificationCode || qrMatch?.verificationCode || code.trim()))}><ExternalLink size={16} aria-hidden="true" />打开官方验真平台（原型）</Button>{handoffOpened && <p className="mt-2 text-xs text-text-tertiary">已打开 handoff 原型页；没有使用虚假的第三方“官方”地址。</p>}</Card></Section>
    <TrustNote />
  </div></PublicShell>;
}

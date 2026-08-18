import { ArrowLeft, BadgeCheck, ChevronRight, FileBadge2, KeyRound, Link2 } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { StatusTag } from "../components/ui";
import { certificateTypeLabels, type CertificateAdminRecord, type CertificateClaimStatus, type IssuanceStatus } from "./pc04-data";
import { usePC04State } from "./PC04State";

function issuanceLabel(status: IssuanceStatus) {
  return ({ notTriggered: "未触发", requested: "已申请", processing: "签发中", issued: "已签发", failed: "签发失败", revoked: "已撤销" } as const)[status];
}

function claimLabel(status?: CertificateClaimStatus) {
  if (!status) return "尚未生成领取记录";
  return ({ claimable: "待领取", claimed: "已领取", pending: "处理中", revoked: "已撤销" } as const)[status];
}

function StableId({ value }: { value: string }) {
  return <span className="inline-flex items-center gap-1.5 rounded-control bg-surface-subtle px-2.5 py-1 font-mono text-xs"><KeyRound size={13} /><span className="text-text-tertiary">certificateId</span><strong>{value}</strong></span>;
}

function Header() {
  return <section className="rounded-container border border-border-subtle bg-surface p-5 lg:p-6"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-brand">可信证书</p><h1 className="mt-1 text-2xl font-semibold">证书签发与领取</h1><p className="mt-2 text-sm leading-6 text-text-secondary">签发状态和学生领取状态分开查看；后台配置不会伪造签发或领取事实。</p><p data-pc05-technical className="mt-3 font-mono text-xs text-text-tertiary">PC04 Certificate · issuance / claim split</p></section>;
}

function sanitizeTrail(value: string) {
  return value
    .replaceAll("Course Completed", "课程完成条件")
    .replaceAll("assessment = passed", "考试结果为通过")
    .replaceAll("assessment = idle", "考试尚未完成")
    .replaceAll("Certificate Runtime", "证书记录")
    .replaceAll("App Runtime", "学生端状态")
    .replaceAll("App claimStatus：claimed", "学生领取状态：已领取")
    .replaceAll("claimStatus：claimed", "学生领取状态：已领取")
    .replaceAll("issuanceStatus：issued", "签发状态：已签发")
    .replaceAll("claim state", "领取状态")
    .replaceAll("claimable", "待领取")
    .replaceAll("claimed", "已领取")
    .replaceAll("issued", "已签发")
    .replaceAll("revoked", "已撤销");
}

function channelDescription(certificate: CertificateAdminRecord) {
  if (certificate.certificateType === "course") {
    return certificate.issuanceStatus === "notTriggered"
      ? "课程完成后自动进入签发流程；当前学生尚未满足课程完成条件。"
      : "课程完成后自动进入签发流程，并记录真实签发主体与结果。";
  }
  return "依据真实赛事结果与外部签发回流确认，不把平台记录包装成官方签发。";
}

function CertificateList() {
  const { certificates } = usePC04State();
  return <div className="space-y-6"><Header /><section className="grid gap-4 xl:grid-cols-2">{certificates.map(certificate => <Link key={certificate.id} to={`/admin/pc04/certificates/${certificate.id}`} className="rounded-container border border-border-subtle bg-surface p-5 hover:shadow-floating"><div className="flex items-start justify-between gap-4"><div><StatusTag tone="success">{certificateTypeLabels[certificate.certificateType]}</StatusTag><h2 className="mt-2 text-lg font-semibold">{certificate.title}</h2><p className="mt-2 text-sm text-text-secondary">实际签发主体：{certificate.actualIssuer}</p></div><ChevronRight size={18} className="text-text-tertiary" /></div><div className="mt-4 grid gap-2 sm:grid-cols-2"><div className="rounded-control bg-surface-subtle p-3 text-xs"><span className="text-text-tertiary">签发状态</span><p className="mt-1 font-semibold">{issuanceLabel(certificate.issuanceStatus)}</p></div><div className="rounded-control bg-surface-subtle p-3 text-xs"><span className="text-text-tertiary">学生领取状态</span><p className="mt-1 font-semibold">{claimLabel(certificate.claimStatus)}</p></div></div><div className="mt-3"><StableId value={certificate.id} /></div><p data-pc05-technical className="mt-3 font-mono text-xs text-text-tertiary">issuanceStatus={certificate.issuanceStatus} · claimStatus={certificate.claimStatus ?? "undefined"}</p></Link>)}</section></div>;
}

function CertificateDetail({ certificate }: { certificate: CertificateAdminRecord }) {
  return <div className="space-y-6"><Header /><section className="rounded-container border border-border-subtle bg-surface p-6"><Link to="/admin/pc04/certificates" className="inline-flex items-center gap-1 text-sm font-medium text-text-brand"><ArrowLeft size={15} />证书列表</Link><h2 className="mt-4 text-2xl font-semibold">{certificate.title}</h2><div className="mt-4 grid gap-2 sm:max-w-xl sm:grid-cols-2"><div className="rounded-control bg-surface-subtle p-3"><p className="text-xs text-text-tertiary">签发状态</p><p data-testid="issuance-status" className="mt-1 text-sm font-semibold">{issuanceLabel(certificate.issuanceStatus)}</p></div><div className="rounded-control bg-surface-subtle p-3"><p className="text-xs text-text-tertiary">学生领取状态</p><p data-testid="claim-status" className="mt-1 text-sm font-semibold">{claimLabel(certificate.claimStatus)}</p></div></div><div className="mt-3"><StableId value={certificate.id} /></div><p data-pc05-technical data-testid="certificate-status-raw" className="mt-3 font-mono text-xs text-text-tertiary">issuanceStatus={certificate.issuanceStatus} · claimStatus={certificate.claimStatus ?? "undefined"}</p></section>
  <section className="grid gap-4 xl:grid-cols-3"><div className="rounded-container border border-border-subtle bg-surface p-5"><BadgeCheck size={19} className="text-text-brand" /><h3 className="mt-3 font-semibold">签发身份</h3><dl className="mt-4 space-y-3 text-sm"><div><dt className="text-xs text-text-tertiary">证书类型</dt><dd className="mt-1 font-semibold">{certificateTypeLabels[certificate.certificateType]}</dd></div><div><dt className="text-xs text-text-tertiary">实际签发主体</dt><dd className="mt-1 font-semibold">{certificate.actualIssuer}</dd></div><div><dt className="text-xs text-text-tertiary">签发渠道</dt><dd className="mt-1 leading-6 text-text-secondary">{channelDescription(certificate)}</dd></div></dl></div><div className="rounded-container border border-border-subtle bg-surface p-5"><Link2 size={19} className="text-text-brand" /><h3 className="mt-3 font-semibold">签发规则</h3><p className="mt-3 text-sm leading-6 text-text-secondary">{certificate.certificateType === "course" ? "学习进度达到课程要求且考试通过后，进入证书签发流程。" : "根据真实赛事结果与签发回流确认。"}</p><StatusTag tone="neutral">{certificate.triggerMode === "automatic" ? "条件满足后自动触发" : "运营按真实业务发起"}</StatusTag><div data-pc05-technical className="mt-3 rounded-control bg-surface-subtle p-3 font-mono text-xs text-text-tertiary"><p>triggerRule={certificate.triggerRule}</p><p>triggerMode={certificate.triggerMode}</p><p>channel={certificate.channel}</p></div></div><div className="rounded-container border border-border-subtle bg-surface p-5"><FileBadge2 size={19} className="text-text-brand" /><h3 className="mt-3 font-semibold">当前结果</h3><p className="mt-3 text-sm">签发状态：<strong>{issuanceLabel(certificate.issuanceStatus)}</strong></p><p className="mt-2 text-sm">学生领取状态：<strong>{claimLabel(certificate.claimStatus)}</strong></p><p className="mt-3 text-xs leading-5 text-text-secondary">撤销后保留历史记录；签发与领取分别追溯。</p></div></section>
  <section className="grid gap-4 lg:grid-cols-2"><div className="rounded-container border border-border-subtle bg-surface p-5"><h3 className="font-semibold">编号 / 文件 / 验真</h3><div className="mt-4 space-y-3 text-sm"><div className="rounded-control bg-surface-subtle p-3"><span className="text-xs text-text-tertiary">编号</span><p className="mt-1 font-medium">{certificate.certificateNumber.replace("App 当前", "当前")}</p></div><div className="rounded-control bg-surface-subtle p-3"><span className="text-xs text-text-tertiary">文件 / 凭证</span><p className="mt-1 font-medium">{certificate.credential.replace("App 当前", "当前")}</p></div><div className="rounded-control bg-surface-subtle p-3"><span className="text-xs text-text-tertiary">验真信息</span><p className="mt-1 font-mono text-xs">{certificate.verification}</p></div></div></div><div className="rounded-container border border-border-subtle bg-surface p-5"><h3 className="font-semibold">申请 / 回流记录</h3><div className="mt-4 space-y-3">{certificate.requestTrail.map((item, index) => <div key={`${item}-${index}`} className="flex gap-3"><span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-surface-subtle text-xs font-semibold">{index + 1}</span><p className="pt-0.5 text-sm leading-6 text-text-secondary">{sanitizeTrail(item)}</p></div>)}</div></div></section></div>;
}

export function PC04HumanCertificates() {
  const { certificates } = usePC04State();
  const { certificateId } = useParams();
  if (!certificateId) return <CertificateList />;
  const certificate = certificates.find(item => item.id === certificateId);
  if (!certificate) return <div className="space-y-6"><Header /><section className="rounded-container border border-border-subtle bg-surface p-8 text-center"><h2 className="text-xl font-semibold">证书不存在</h2><Link to="/admin/pc04/certificates" className="mt-4 inline-flex min-h-11 items-center rounded-control bg-primary-container px-4 text-sm font-semibold text-text-brand">返回证书列表</Link></section></div>;
  return <CertificateDetail certificate={certificate} />;
}

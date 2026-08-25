import { ArrowRight, History, LockKeyhole, UnlockKeyhole, UserRound } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button, Dialog, SecondaryButton, StatusTag } from "../components/ui";
import { competitionControlById } from "./competition-control-data";
import { longTermAssetsSeed, studentAccountSeed } from "./pc05-data";
import { usePC05State } from "./PC05State";
import { PC05Fact, PC05StateTag, pc05StateLabel } from "./pc05-ui";

const competitionName = (competitionId: string) => competitionControlById(competitionId)?.name ?? (competitionId === "sanchuang-15" ? "第十五届三创赛" : competitionId);

function nextAction(competitionId: string, identityStatus: string) {
  const control = competitionControlById(competitionId);
  if (control?.qualification.officialQualification === "pending") return "等待官方资格回流";
  if (control?.status === "upcoming") return "等待赛事开放";
  if (identityStatus === "revoked") return "历史记录只读";
  return "无需处理";
}

export function PC05StudentConsole() {
  const { accountStatus, approvals, requestAccountAction } = usePC05State();
  const [reason, setReason] = useState("");
  const [notice, setNotice] = useState("");
  const [governanceOpen, setGovernanceOpen] = useState(false);
  const action = accountStatus === "active" ? "freeze" : "unfreeze";
  const pending = approvals.find(item => (item.kind === "accountFreeze" || item.kind === "accountUnfreeze") && item.status === "pending");
  const currentCompetition = competitionControlById("sanchuang-16");
  const submit = () => {
    const ok = requestAccountAction(action, reason);
    setNotice(ok ? "已进入高风险审批队列；账号状态不会在普通运营提交时直接改变。" : "请填写原因，或先处理已有同类审批。");
    if (ok) { setReason(""); setGovernanceOpen(false); }
  };

  return <div className="space-y-6">
    <section className="grid gap-4 xl:grid-cols-[1.3fr_.7fr]">
      <div className="rounded-container border border-border-subtle bg-surface p-5">
        <div className="flex items-start justify-between gap-3"><div className="flex gap-3"><UserRound className="text-text-brand" /><div><p className="text-xs text-text-tertiary">学生档案</p><h2 className="mt-1 text-xl font-semibold">{studentAccountSeed.name}</h2><p className="mt-1 text-sm text-text-secondary">{studentAccountSeed.school} · {studentAccountSeed.major} · {studentAccountSeed.city}</p></div></div><div data-testid="account-status"><PC05StateTag state={accountStatus} /></div></div>
        <div className="mt-4 grid gap-3 md:grid-cols-4"><PC05Fact label="资料维护">学生本人</PC05Fact><PC05Fact label="联系方式">{studentAccountSeed.phone}</PC05Fact><PC05Fact label="赛事经历">{studentAccountSeed.identities.length} 场</PC05Fact><PC05Fact label="长期成果">{longTermAssetsSeed.length} 类记录</PC05Fact></div>
        <details className="mt-4 rounded-control border border-border-subtle px-3 py-2 text-xs text-text-secondary"><summary className="cursor-pointer font-medium text-text-primary">数据与关系</summary><div className="mt-3 space-y-1"><p>账号标识：{studentAccountSeed.accountId}</p><p>个人资料来源：StudentProfile，由学生本人优先维护。</p><p>赛事身份来源：Mobile CompetitionIdentity[]。</p></div></details>
      </div>
      <div className="rounded-container border border-warning bg-warning-bg p-5"><div className="flex gap-3">{accountStatus === "active" ? <LockKeyhole className="text-warning-text" /> : <UnlockKeyhole className="text-warning-text" />}<div className="flex-1"><h2 className="font-semibold text-warning-text">{accountStatus === "active" ? "申请冻结账号" : "申请解冻账号"}</h2><p className="mt-1 text-xs leading-5 text-warning-text">这是高风险操作。冻结只限制当前访问，不删除资料、赛事历史、成绩、证书或投递。</p><Button className="mt-3 w-full" disabled={Boolean(pending)} onClick={() => { setNotice(""); setGovernanceOpen(true); }}>{accountStatus === "active" ? "提交冻结审批" : "提交解冻审批"}</Button>{pending && <p className="mt-2 text-xs text-warning-text">当前已有一项账号治理申请待审批。</p>}{notice && <p data-testid="governance-notice" className="mt-2 text-xs text-warning-text">{notice}</p>}</div></div></div>
    </section>

    <section className="rounded-container border border-border-subtle bg-surface">
      <div className="border-b border-border-subtle p-4"><h2 className="font-semibold">学生赛事身份</h2><p className="mt-1 text-xs text-text-tertiary">报名审核、学生身份和官方资格分开显示，避免把平台审核通过误当成官方参赛确认。</p></div>
      <div className="overflow-x-auto"><table className="min-w-[900px] w-full text-left text-xs"><thead className="bg-surface-subtle"><tr>{["赛事","赛事状态","学生身份","报名流程","官方资格","当前处理"].map(x => <th key={x} className="p-3">{x}</th>)}</tr></thead><tbody>{studentAccountSeed.identities.map(i => { const control = competitionControlById(i.competitionId); const official = control?.qualification.officialQualification; return <tr key={i.competitionId} className="border-t border-border-subtle"><td className="p-3"><p className="font-medium text-text-primary">{competitionName(i.competitionId)}</p><p className="mt-1 font-mono text-[11px] text-text-tertiary">{i.competitionId}</p></td><td className="p-3"><PC05StateTag state={i.competitionStatus}/></td><td className="p-3"><PC05StateTag state={i.identityStatus}/></td><td className="p-3"><PC05StateTag state={i.registrationStatus}/></td><td className="p-3">{official ? <PC05StateTag state={official}/> : <StatusTag tone="neutral">历史记录</StatusTag>}</td><td className="p-3 font-medium text-text-secondary">{nextAction(i.competitionId, i.identityStatus)}</td></tr>; })}</tbody></table></div>
      <details className="border-t border-border-subtle p-4 text-xs text-text-secondary"><summary className="cursor-pointer font-medium text-text-primary">查看状态语义与数据来源</summary><div className="mt-3 space-y-2"><p>平台报名 `approved` 只代表平台流程完成，不等于学生赛事身份 `active`，也不等于官方资格 `confirmed`。</p><p>第十六届三创赛官方资格：{currentCompetition?.qualification.officialQualification ?? "未接入"}；来源于 PC02 赛事控制面，不在 PC05 复制第二份状态。</p><p>学生赛事身份来源：Mobile shared identities[]。</p></div></details>
    </section>

    <section className="grid gap-4 md:grid-cols-3">
      <div className="rounded-container border border-border-subtle bg-surface p-4"><p className="text-xs text-text-tertiary">报名审核</p><h3 className="mt-1 font-semibold">第十六届三创赛</h3><p className="mt-2 text-sm text-text-secondary">学校审核：{pc05StateLabel(studentAccountSeed.registration.status)}；官方资格仍需单独确认。</p></div>
      <div className="rounded-container border border-border-subtle bg-surface p-4"><p className="text-xs text-text-tertiary">当前团队</p><h3 className="mt-1 font-semibold">{currentCompetition?.team.name ?? "赛事团队"}</h3><p className="mt-2 text-sm text-text-secondary">{currentCompetition?.team.members.length ?? 0} 名成员 · 当前赛事范围内协作。</p></div>
      <div className="rounded-container border border-border-subtle bg-surface p-4"><p className="text-xs text-text-tertiary">机会投递</p><h3 className="mt-1 font-semibold">北辰美妆实习机会</h3><p className="mt-2 text-sm text-text-secondary">{pc05StateLabel(studentAccountSeed.application.status)}；等待合作方状态回流。</p></div>
    </section>

    <section data-testid="retention-proof" className="rounded-container border border-border-subtle bg-surface p-5"><div className="flex gap-3"><History className="text-text-brand" /><div><h2 className="font-semibold">历史赛事结束后，成果仍然保留</h2><p className="mt-2 text-sm leading-6 text-text-secondary">第十五届三创赛已经结束，学生赛事身份也已撤销，因此赛事工作区保持关闭；参赛经历、比赛成绩、证书、课程成果和验真记录仍可长期查询。</p><Link to="/admin/assets" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-text-brand">查看长期资产 <ArrowRight size={15}/></Link><details className="mt-4 text-xs text-text-secondary"><summary className="cursor-pointer font-medium text-text-primary">技术追溯信息</summary><p className="mt-2">赛事期状态：competitionId=sanchuang-15 · ended · identityStatus=revoked。Experience 当前沿用 competitionId 作为 App 路由键，独立 experienceId 尚未接入。</p></details></div></div></section>
    <Dialog
      open={governanceOpen}
      onOpenChange={setGovernanceOpen}
      title={accountStatus === "active" ? "申请冻结学生账号" : "申请解冻学生账号"}
      description="申请将进入高风险审批队列，普通运营提交后不会直接改变账号状态。"
      size="sm"
      footer={<><SecondaryButton type="button" onClick={() => setGovernanceOpen(false)}>取消</SecondaryButton><Button type="button" disabled={!reason.trim()} onClick={submit}>{accountStatus === "active" ? "提交冻结审批" : "提交解冻审批"}</Button></>}
    >
      <label className="block text-sm font-medium text-text-secondary">治理原因<span className="ml-1 text-danger">*</span><textarea data-testid="account-governance-reason" value={reason} onChange={e => setReason(e.target.value)} className="mt-2 min-h-24 w-full rounded-control border border-border bg-surface p-3 text-sm" placeholder="填写治理原因（必填）" /></label>
      <p className="mt-3 rounded-control bg-warning-bg p-3 text-xs leading-5 text-warning-text">冻结或解冻都不会删除长期资料、赛事历史、成绩、证书或投递记录。</p>
    </Dialog>
  </div>;
}

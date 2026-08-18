import { ArrowRight, History, LockKeyhole, UnlockKeyhole, UserRound } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui";
import { longTermAssetsSeed, studentAccountSeed } from "./pc05-data";
import { usePC05State } from "./PC05State";
import { PC05Fact, PC05StateTag } from "./pc05-ui";

export function PC05StudentConsole() {
  const { accountStatus, approvals, requestAccountAction } = usePC05State();
  const [reason, setReason] = useState("");
  const [notice, setNotice] = useState("");
  const action = accountStatus === "active" ? "freeze" : "unfreeze";
  const pending = approvals.find(item => (item.kind === "accountFreeze" || item.kind === "accountUnfreeze") && item.status === "pending");
  const submit = () => {
    const ok = requestAccountAction(action, reason);
    setNotice(ok ? "已进入高风险审批队列；账号状态不会在普通运营提交时直接改变。" : "请填写原因，或先处理已有同类审批。");
    if (ok) setReason("");
  };

  return <div className="space-y-6">
    <section className="grid gap-4 xl:grid-cols-[1.3fr_.7fr]">
      <div className="rounded-container border border-border-subtle bg-surface p-5">
        <div className="flex items-start justify-between gap-3"><div className="flex gap-3"><UserRound className="text-text-brand" /><div><p className="text-xs text-text-tertiary">Account · {studentAccountSeed.accountId}</p><h2 className="mt-1 text-xl font-semibold">{studentAccountSeed.name}</h2><p className="mt-1 text-sm text-text-secondary">{studentAccountSeed.school} · {studentAccountSeed.major} · {studentAccountSeed.city}</p></div></div><div data-testid="account-status"><PC05StateTag state={accountStatus} /></div></div>
        <div className="mt-4 grid gap-3 md:grid-cols-4"><PC05Fact label="StudentProfile owner">学生本人</PC05Fact><PC05Fact label="手机号">{studentAccountSeed.phone}</PC05Fact><PC05Fact label="赛事身份">{studentAccountSeed.identities.length} 条</PC05Fact><PC05Fact label="长期资产">{longTermAssetsSeed.length} 类</PC05Fact></div>
      </div>
      <div className="rounded-container border border-warning bg-warning-bg p-5"><div className="flex gap-3">{accountStatus === "active" ? <LockKeyhole className="text-warning-text" /> : <UnlockKeyhole className="text-warning-text" />}<div className="flex-1"><h2 className="font-semibold text-warning-text">{accountStatus === "active" ? "申请冻结账号" : "申请解冻账号"}</h2><p className="mt-1 text-xs leading-5 text-warning-text">冻结只限制当前访问，不删除资料、赛事历史、成绩、证书或投递。</p><textarea data-testid="account-governance-reason" value={reason} onChange={e => setReason(e.target.value)} className="mt-3 min-h-20 w-full rounded-control border border-warning bg-surface p-2 text-sm" placeholder="填写治理原因（必填）"/><Button className="mt-3 w-full" onClick={submit}>{accountStatus === "active" ? "提交冻结审批" : "提交解冻审批"}</Button>{pending && <p className="mt-2 text-xs text-warning-text">待审批：{pending.id}</p>}{notice && <p data-testid="governance-notice" className="mt-2 text-xs text-warning-text">{notice}</p>}</div></div></div>
    </section>

    <section className="rounded-container border border-border-subtle bg-surface">
      <div className="border-b border-border-subtle p-4"><h2 className="font-semibold">CompetitionIdentity[] · Registration · Team · Application</h2><p className="mt-1 text-xs text-text-tertiary">registrationStatus=approved 与 identityStatus=active 是不同语义；PC 不把平台 approved 冒充外部官方资格。</p></div>
      <div className="overflow-x-auto"><table className="min-w-[920px] w-full text-left text-xs"><thead className="bg-surface-subtle"><tr>{["competitionId","competitionStatus","identityStatus","registrationStatus","官方资格","来源"].map(x => <th key={x} className="p-3">{x}</th>)}</tr></thead><tbody>{studentAccountSeed.identities.map(i => <tr key={i.competitionId} className="border-t border-border-subtle"><td className="p-3 font-mono text-text-brand">{i.competitionId}</td><td className="p-3">{i.competitionStatus}</td><td className="p-3"><PC05StateTag state={i.identityStatus}/></td><td className="p-3">{i.registrationStatus}</td><td className="p-3">{i.officialQualification}</td><td className="p-3 text-text-secondary">{i.source}</td></tr>)}</tbody></table></div>
      <div className="grid gap-3 border-t border-border-subtle p-4 md:grid-cols-3"><PC05Fact label="Registration">{studentAccountSeed.registration.registrationId} · {studentAccountSeed.registration.status}</PC05Fact><PC05Fact label="Team / TeamMember">{studentAccountSeed.team.teamId} · {studentAccountSeed.team.role}</PC05Fact><PC05Fact label="Application">{studentAccountSeed.application.opportunityId} · {studentAccountSeed.application.status}</PC05Fact></div>
    </section>

    <section data-testid="retention-proof" className="rounded-container border border-border-subtle bg-surface p-5"><div className="flex gap-3"><History className="text-text-brand" /><div><h2 className="font-semibold">ended / revoked 不等于删除历史</h2><p className="mt-2 text-sm leading-6 text-text-secondary">sanchuang-15 已 ended，身份 revoked；赛事期能力关闭，但 Experience、Result、Certificate、CourseAchievement、VerificationRecord 继续长期存在。Experience 当前沿用 competitionId 作为 App 路由键，独立 experienceId 尚未接入，PC 不虚构补齐。</p><Link to="/admin/assets" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-text-brand">查看长期资产 <ArrowRight size={15}/></Link></div></div></section>
  </div>;
}

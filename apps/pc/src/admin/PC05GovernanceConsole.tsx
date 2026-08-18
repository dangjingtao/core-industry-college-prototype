import { AlertTriangle, ArrowRight, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { SecondaryButton } from "../components/ui";
import { consistencyAuditRows, crossDomainChain, highRiskCategories, pcRegressionMatrix, permissionRoles, type OperatorRoleKey } from "./pc05-data";
import { usePC05State } from "./PC05State";
import { PC05Fact, PC05StateTag } from "./pc05-ui";

export function PC05GovernanceConsole() {
  const { operatorRole, setOperatorRole, approvals, auditLog, executeApproval } = usePC05State();
  const role = permissionRoles.find(r => r.key === operatorRole) ?? permissionRoles[1];
  const [notice, setNotice] = useState("");
  const pendingCount = approvals.filter(item => item.status === "pending").length;
  const execute = (id: string) => {
    const ok = executeApproval(id);
    setNotice(ok ? "审批已执行，并写入操作审计。" : "当前角色没有高风险执行权限。");
  };

  return <div className="space-y-6">
    <section className="grid gap-4 xl:grid-cols-[.8fr_1.2fr]">
      <div className="rounded-container border border-border-subtle bg-surface p-5"><div className="flex gap-2"><ShieldCheck className="text-text-brand"/><div><p className="text-xs text-text-tertiary">当前操作身份</p><h2 className="font-semibold">{role.label}</h2></div></div><select data-testid="operator-role" value={operatorRole} onChange={e => setOperatorRole(e.target.value as OperatorRoleKey)} className="mt-4 min-h-11 w-full rounded-control border border-border-subtle bg-surface px-3">{permissionRoles.map(r => <option key={r.key} value={r.key}>{r.label}</option>)}</select><div className="mt-3 grid gap-3"><PC05Fact label="可操作模块">{role.modulePermissions.join(" · ")}</PC05Fact><PC05Fact label="可查看 / 管理范围">{role.dataScope}</PC05Fact></div><p className="mt-3 text-xs text-text-secondary">普通运营不能创建后台账号、扩大自身权限或直接执行高风险治理。</p><details className="mt-4 text-xs text-text-secondary"><summary className="cursor-pointer font-medium text-text-primary">查看权限技术范围</summary><p className="mt-2">Role={role.key} · Data Scope={role.scopeDetail}</p></details></div>
      <div className="rounded-container border border-warning bg-warning-bg p-5"><div className="flex items-start justify-between gap-3"><div className="flex gap-2"><AlertTriangle className="text-warning-text"/><div><h2 className="font-semibold text-warning-text">高风险操作需要审批</h2><p className="mt-1 text-sm text-warning-text">当前有 {pendingCount} 项待处理。普通编辑不会进入这条审批链。</p></div></div><PC05StateTag state={pendingCount ? "pending" : "completed"}/></div><div className="mt-4 grid gap-2 sm:grid-cols-2">{highRiskCategories.map(x => <div key={x} className="rounded-control bg-surface/70 p-3 text-sm text-warning-text">{x}</div>)}</div></div>
    </section>

    <section className="rounded-container border border-border-subtle bg-surface"><div className="border-b border-border-subtle p-4"><h2 className="font-semibold">待审批事项</h2><p className="mt-1 text-xs text-text-tertiary">先确认对象、影响范围和原因，再由有权限的管理员执行。</p></div>{approvals.map(a => <div key={a.id} className="grid gap-3 border-b border-border-subtle p-4 lg:grid-cols-[1fr_auto] lg:items-center"><div><div className="flex flex-wrap items-center gap-2"><b>{a.title}</b><PC05StateTag state={a.status}/></div><p className="mt-2 text-sm text-text-secondary">{a.reason}</p><p className="mt-1 text-xs text-text-tertiary">申请人：{a.applicant} · 审批人：{a.approver}</p><details className="mt-2 text-xs text-text-secondary"><summary className="cursor-pointer">对象与审批编号</summary><p className="mt-1 font-mono">{a.object} · {a.id}</p></details></div>{a.status === "pending" ? <SecondaryButton data-testid={`execute-${a.kind}`} disabled={!role.canExecuteHighRisk} onClick={() => execute(a.id)}>{role.canExecuteHighRisk ? "批准并执行" : "需超级管理员"}</SecondaryButton> : <PC05StateTag state="executed"/>}</div>)}{notice && <p data-testid="approval-action-notice" className="p-4 text-xs text-text-brand">{notice}</p>}</section>

    <section className="rounded-container border border-border-subtle bg-surface"><div className="border-b border-border-subtle p-4"><h2 className="font-semibold">操作审计</h2><p className="mt-1 text-xs text-text-tertiary">高风险治理与关键状态变更必须留下谁、何时、改了什么、为什么改的记录。</p></div><div className="overflow-x-auto"><table className="min-w-[1000px] w-full text-left text-xs"><thead className="bg-surface-subtle"><tr>{["操作人","时间","对象","修改前","修改后","原因","关联审批"].map(x => <th key={x} className="p-3">{x}</th>)}</tr></thead><tbody>{auditLog.map(a => <tr key={a.id} className="border-t border-border-subtle"><td className="p-3">{a.operator}</td><td className="p-3">{a.time}</td><td className="p-3">{a.object}</td><td className="p-3">{a.before}</td><td className="p-3">{a.after}</td><td className="p-3">{a.reason}</td><td className="p-3 font-mono">{a.approvalId ?? "—"}</td></tr>)}</tbody></table></div></section>

    <section className="rounded-container border border-border-subtle bg-surface p-5"><h2 className="font-semibold">跨模块业务链</h2><p className="mt-1 text-xs text-text-tertiary">从赛事一路检查合作主体、课程、权益、机会、学生和长期资产是否能互相找到。</p><div className="mt-4 flex flex-wrap items-center gap-2">{crossDomainChain.map((x, i) => <span key={x.id} className="inline-flex items-center gap-2"><Link aria-label={`${x.label} · ${x.id}`} to={x.to} className="rounded-control bg-surface-subtle px-3 py-2 text-xs font-semibold text-text-brand"><span className="text-text-tertiary">{x.label}</span> · {x.name}</Link>{i < crossDomainChain.length - 1 && <ArrowRight size={14}/>}</span>)}</div></section>

    <details data-testid="pc-app-consistency" className="rounded-container border border-border-subtle bg-surface p-5"><summary className="cursor-pointer font-semibold">跨端数据一致性检查</summary><p className="mt-2 text-xs text-text-tertiary">用于评审与治理诊断；普通运营无需先理解数据模型才能完成工作。</p><div className="mt-4">{consistencyAuditRows.map(r => <div key={r.object} className="grid gap-3 border-t border-border-subtle py-4 lg:grid-cols-4"><PC05Fact label="业务对象">{r.object}</PC05Fact><PC05Fact label="学生端">{r.app}</PC05Fact><PC05Fact label="管理端">{r.pc}</PC05Fact><PC05Fact label="一致性边界">{r.mapping}</PC05Fact></div>)}</div></details>

    <details className="rounded-container border border-border-subtle bg-surface p-5"><summary className="cursor-pointer font-semibold">PC01–PC05 回归状态</summary><div className="mt-4 grid gap-3 md:grid-cols-5">{pcRegressionMatrix.map(x => <div key={x.card} className="rounded-control bg-surface-subtle p-3"><div className="flex justify-between gap-2"><b>{x.card}</b><PC05StateTag state={x.state}/></div><p className="mt-2 text-xs text-text-secondary">{x.scope}</p></div>)}</div></details>
  </div>;
}

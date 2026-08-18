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
  const execute = (id: string) => {
    const ok = executeApproval(id);
    setNotice(ok ? "审批已执行，并写入 Audit Log。" : "当前角色没有高风险执行权限。");
  };

  return <div className="space-y-6">
    <section className="grid gap-4 xl:grid-cols-2">
      <div className="rounded-container border border-border-subtle bg-surface p-5"><div className="flex gap-2"><ShieldCheck className="text-text-brand"/><h2 className="font-semibold">Role + Module Permission + Data Scope</h2></div><select data-testid="operator-role" value={operatorRole} onChange={e => setOperatorRole(e.target.value as OperatorRoleKey)} className="mt-4 min-h-11 w-full rounded-control border border-border-subtle bg-surface px-3">{permissionRoles.map(r => <option key={r.key} value={r.key}>{r.label}</option>)}</select><div className="mt-3 grid gap-3"><PC05Fact label="Role">{role.label}</PC05Fact><PC05Fact label="Module Permission">{role.modulePermissions.join(" · ")}</PC05Fact><PC05Fact label="Data Scope">{role.dataScope}</PC05Fact></div><p className="mt-3 text-xs text-text-secondary">普通运营不能创建后台账号、扩大自身权限或直接执行高风险治理。</p></div>
      <div className="rounded-container border border-border-subtle bg-surface p-5"><div className="flex gap-2"><AlertTriangle className="text-warning-text"/><h2 className="font-semibold">高风险审批范围</h2></div><div className="mt-4 grid gap-2 sm:grid-cols-2">{highRiskCategories.map(x => <div key={x} className="rounded-control bg-warning-bg p-3 text-sm text-warning-text">{x}</div>)}</div></div>
    </section>

    <section className="rounded-container border border-border-subtle bg-surface"><div className="border-b border-border-subtle p-4"><h2 className="font-semibold">审批队列</h2><p className="mt-1 text-xs text-text-tertiary">提交 → 审批 → 执行；申请原因、审批人、最终执行都保留。</p></div>{approvals.map(a => <div key={a.id} className="grid gap-3 border-b border-border-subtle p-4 lg:grid-cols-[1fr_auto] lg:items-center"><div><div className="flex gap-2"><b>{a.title}</b><PC05StateTag state={a.status}/></div><p className="mt-1 font-mono text-xs text-text-tertiary">{a.id} · {a.object}</p><p className="mt-2 text-sm text-text-secondary">{a.reason}</p><p className="mt-1 text-xs text-text-tertiary">申请人 {a.applicant} · 审批人 {a.approver}</p></div>{a.status === "pending" ? <SecondaryButton data-testid={`execute-${a.kind}`} disabled={!role.canExecuteHighRisk} onClick={() => execute(a.id)}>{role.canExecuteHighRisk ? "批准并执行" : "需超级管理员"}</SecondaryButton> : <PC05StateTag state="executed"/>}</div>)}{notice && <p data-testid="approval-action-notice" className="p-4 text-xs text-text-brand">{notice}</p>}</section>

    <section className="rounded-container border border-border-subtle bg-surface"><div className="border-b border-border-subtle p-4"><h2 className="font-semibold">Audit Log · P0</h2><p className="mt-1 text-xs text-text-tertiary">谁 / 时间 / 对象 / 修改前 / 修改后 / 原因 / 关联审批。</p></div><div className="overflow-x-auto"><table className="min-w-[1000px] w-full text-left text-xs"><thead className="bg-surface-subtle"><tr>{["谁","时间","对象","修改前","修改后","原因","关联审批"].map(x => <th key={x} className="p-3">{x}</th>)}</tr></thead><tbody>{auditLog.map(a => <tr key={a.id} className="border-t border-border-subtle"><td className="p-3">{a.operator}</td><td className="p-3">{a.time}</td><td className="p-3">{a.object}</td><td className="p-3">{a.before}</td><td className="p-3">{a.after}</td><td className="p-3">{a.reason}</td><td className="p-3 font-mono">{a.approvalId ?? "—"}</td></tr>)}</tbody></table></div></section>

    <section data-testid="pc-app-consistency" className="rounded-container border border-border-subtle bg-surface"><div className="border-b border-border-subtle p-4"><h2 className="font-semibold">PC ↔ APP 一致性总审计</h2></div>{consistencyAuditRows.map(r => <div key={r.object} className="grid gap-3 border-t border-border-subtle p-4 lg:grid-cols-4"><PC05Fact label="对象">{r.object}</PC05Fact><PC05Fact label="App">{r.app}</PC05Fact><PC05Fact label="PC">{r.pc}</PC05Fact><PC05Fact label="显式映射 / 边界">{r.mapping}</PC05Fact></div>)}</section>

    <section className="rounded-container border border-border-subtle bg-surface p-5"><h2 className="font-semibold">跨域串联验证</h2><div className="mt-4 flex flex-wrap items-center gap-2">{crossDomainChain.map((x, i) => <span key={x.id} className="inline-flex items-center gap-2"><Link to={x.to} className="rounded-control bg-surface-subtle px-3 py-2 text-xs font-semibold text-text-brand">{x.label} · {x.id}</Link>{i < crossDomainChain.length - 1 && <ArrowRight size={14}/>}</span>)}</div></section>

    <section className="rounded-container border border-border-subtle bg-surface p-5"><h2 className="font-semibold">PC01–PC05 总回归矩阵</h2><div className="mt-4 grid gap-3 md:grid-cols-5">{pcRegressionMatrix.map(x => <div key={x.card} className="rounded-control bg-surface-subtle p-3"><div className="flex justify-between gap-2"><b>{x.card}</b><PC05StateTag state={x.state}/></div><p className="mt-2 text-xs text-text-secondary">{x.scope}</p></div>)}</div></section>
  </div>;
}

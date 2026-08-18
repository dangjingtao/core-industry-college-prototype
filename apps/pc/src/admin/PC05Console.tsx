import { NavLink, useLocation } from "react-router-dom";
import { StatusTag } from "../components/ui";
import { PC05AssetsConsole } from "./PC05AssetsConsole";
import { PC05GovernanceConsole } from "./PC05GovernanceConsole";
import { PC05StudentConsole } from "./PC05StudentConsole";

function Header() {
  const items = [["/admin/students", "学生"], ["/admin/assets", "长期资产"], ["/admin/governance", "权限与审批"]] as const;
  return <section className="rounded-container border border-border-subtle bg-surface p-5 lg:p-6">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-brand">学生与治理</p><h1 className="mt-1 text-2xl font-semibold text-text-primary">学生长期服务与平台治理</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">查询学生赛事身份与长期成果，处理账号风险，并完成需要审批的治理操作。</p></div>
      <StatusTag tone="warning">待独立评审</StatusTag>
    </div>
    <nav className="mt-5 flex flex-wrap gap-2" aria-label="PC05 子导航">{items.map(([to, label]) => <NavLink key={to} to={to} className={({isActive}) => `rounded-control px-3 py-2 text-sm font-medium ${isActive ? "bg-primary text-on-primary" : "bg-surface-subtle text-text-secondary"}`}>{label}</NavLink>)}</nav>
  </section>;
}

export function PC05Console() {
  const path = useLocation().pathname;
  return <div className="space-y-6"><Header />{path.startsWith("/admin/assets") ? <PC05AssetsConsole /> : path.startsWith("/admin/governance") ? <PC05GovernanceConsole /> : <PC05StudentConsole />}</div>;
}

import { NavLink, useLocation } from "react-router-dom";
import { StatusTag } from "../components/ui";
import { PC05AssetsConsole } from "./PC05AssetsConsole";
import { PC05GovernanceConsole } from "./PC05GovernanceConsole";
import { PC05StudentConsole } from "./PC05StudentConsole";

function Header() {
  const items = [["/admin/students", "学生控制台"], ["/admin/assets", "长期资产"], ["/admin/governance", "权限 / 审计 / 审批"]] as const;
  return <section className="rounded-container border border-border-subtle bg-surface p-5 lg:p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-brand">PC05 · closeout</p><h1 className="mt-1 text-2xl font-semibold text-text-primary">学生 / 长期资产 + 权限治理 + PC 总回归</h1><p className="mt-2 max-w-4xl text-sm leading-6 text-text-secondary">不新建 Participant、CandidateRecord 或第二套长期资产；PC 只治理 App 已有事实，并显式保留尚未接入的 stable id 缺口。</p></div><StatusTag tone="warning">施工完成 · 待独立评审</StatusTag></div><nav className="mt-5 flex flex-wrap gap-2" aria-label="PC05 子导航">{items.map(([to, label]) => <NavLink key={to} to={to} className={({isActive}) => `rounded-control px-3 py-2 text-sm font-medium ${isActive ? "bg-primary text-on-primary" : "bg-surface-subtle text-text-secondary"}`}>{label}</NavLink>)}</nav></section>;
}

export function PC05Console() {
  const path = useLocation().pathname;
  return <div className="space-y-6"><Header />{path.startsWith("/admin/assets") ? <PC05AssetsConsole /> : path.startsWith("/admin/governance") ? <PC05GovernanceConsole /> : <PC05StudentConsole />}</div>;
}

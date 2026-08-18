import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Boxes,
  Building2,
  ChevronRight,
  Database,
  FileBadge,
  GraduationCap,
  Gift,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  UsersRound,
} from "lucide-react";
import type { ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { StatusTag } from "../components/ui";
import { adminDomains, currentOperatorContext } from "./data";

const domainIcons: Record<string, LucideIcon> = {
  competitions: Trophy,
  organizations: Building2,
  resources: Boxes,
  students: UsersRound,
  assets: FileBadge,
  content: Activity,
  workshop: Sparkles,
};

function OperatorContext() {
  return (
    <div className="hidden items-center gap-2 xl:flex" aria-label="当前管理角色与数据范围">
      <div className="rounded-control bg-surface-subtle px-3 py-2"><p className="text-[10px] font-medium uppercase tracking-[0.08em] text-text-tertiary">Role</p><p className="mt-0.5 text-xs font-semibold text-text-primary">{currentOperatorContext.role}</p></div>
      <div className="rounded-control bg-surface-subtle px-3 py-2"><p className="text-[10px] font-medium uppercase tracking-[0.08em] text-text-tertiary">Module</p><p className="mt-0.5 text-xs font-semibold text-text-primary">{currentOperatorContext.modulePermission}</p></div>
      <div className="rounded-control bg-surface-subtle px-3 py-2"><p className="text-[10px] font-medium uppercase tracking-[0.08em] text-text-tertiary">Data Scope</p><p className="mt-0.5 text-xs font-semibold text-text-primary">{currentOperatorContext.dataScope}</p></div>
    </div>
  );
}

function subItemClass(active: boolean) {
  return `mb-1 ml-8 flex min-h-9 items-center gap-2 rounded-control px-3 text-xs font-medium ${active ? "bg-primary-container text-text-brand" : "text-text-tertiary hover:bg-surface-subtle hover:text-text-secondary"}`;
}

function GlobalNavigation({ mobile = false }: { mobile?: boolean }) {
  const location = useLocation();
  const itemClass = (active: boolean) => `${mobile ? "shrink-0" : "mb-1"} flex min-h-11 items-center gap-3 rounded-control px-3 text-sm font-medium transition ${active ? "bg-surface-subtle text-text-brand" : "text-text-secondary hover:bg-surface-subtle"}`;
  return <>
    <NavLink to="/admin" end className={({ isActive }) => itemClass(isActive)}><LayoutDashboard size={18} aria-hidden="true" />总览</NavLink>
    {adminDomains.map(domain => {
      const Icon = domainIcons[domain.id] ?? Database;
      const basePath = `/admin/${domain.id}`;
      const pc04Resource = location.pathname.startsWith("/admin/pc04/courses") || location.pathname.startsWith("/admin/pc04/benefits");
      const pc04Assets = location.pathname.startsWith("/admin/pc04/certificates");
      const active = domain.id === "resources" ? location.pathname.startsWith(basePath) || location.pathname.startsWith("/admin/opportunities") || pc04Resource : domain.id === "assets" ? location.pathname.startsWith(basePath) || pc04Assets : location.pathname.startsWith(basePath);
      return <div key={domain.id}>
        <NavLink to={basePath} className={() => itemClass(active)}><Icon size={18} aria-hidden="true" />{domain.label}</NavLink>
        {!mobile && domain.id === "organizations" && <NavLink to="/admin/organizations" end className={({ isActive }) => subItemClass(isActive)}><ChevronRight size={13} />Organization 主数据</NavLink>}
        {!mobile && domain.id === "resources" && <><NavLink to="/admin/opportunities" className={({ isActive }) => subItemClass(isActive)}><Target size={13} />机会与投递</NavLink><NavLink to="/admin/pc04/courses" className={() => subItemClass(location.pathname.startsWith("/admin/pc04/courses"))}><GraduationCap size={13} />平台课程</NavLink><NavLink to="/admin/pc04/benefits" className={() => subItemClass(location.pathname.startsWith("/admin/pc04/benefits"))}><Gift size={13} />权益</NavLink></>}
        {!mobile && domain.id === "students" && <NavLink to="/admin/students" end className={({ isActive }) => subItemClass(isActive)}><ChevronRight size={13} />学生控制台</NavLink>}
        {!mobile && domain.id === "assets" && <NavLink to="/admin/pc04/certificates" className={() => subItemClass(location.pathname.startsWith("/admin/pc04/certificates"))}><FileBadge size={13} />可信证书</NavLink>}
        {!mobile && domain.id === "content" && <NavLink to="/admin/content/operations" className={({ isActive }) => subItemClass(isActive)}><ChevronRight size={13} />内容运营</NavLink>}
      </div>;
    })}
    <NavLink to="/admin/governance" className={({ isActive }) => itemClass(isActive)}><ShieldCheck size={18} aria-hidden="true" />权限与审计</NavLink>
  </>;
}

export function AdminControlPlaneShell({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-background text-text-primary">
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-border-subtle bg-surface lg:flex lg:flex-col">
      <div className="border-b border-border-subtle px-5 py-5"><div className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-control bg-primary text-on-primary"><Database size={20} aria-hidden="true" /></div><div><p className="text-sm font-semibold text-text-primary">核心产业学院</p><p className="mt-0.5 text-xs text-text-tertiary">运营数据控制面 · PC01</p></div></div></div>
      <nav className="flex-1 overflow-y-auto p-3" aria-label="管理端主导航"><GlobalNavigation /></nav>
      <div className="border-t border-border-subtle p-3"><Link to="/registration-portal/start" className="flex min-h-11 items-center justify-between rounded-control px-3 text-sm font-medium text-text-secondary hover:bg-surface-subtle"><span>三创赛报名门户</span><ChevronRight size={16} aria-hidden="true" /></Link></div>
    </aside>
    <div className="lg:pl-64">
      <header className="sticky top-0 z-20 border-b border-border-subtle bg-surface/95 backdrop-blur"><div className="mx-auto flex min-h-16 max-w-[1480px] items-center justify-between gap-4 px-5 lg:px-8"><div><p className="text-xs font-medium text-text-tertiary">PC 管理端 / dev</p><p className="text-sm font-semibold text-text-primary">平台控制面 · 人、主体、资源、规则、关系、可信状态</p></div><div className="flex items-center gap-3"><OperatorContext /><StatusTag tone="info">PC01 控制面底座</StatusTag></div></div><nav className="flex gap-1 overflow-x-auto border-t border-border-subtle px-3 py-2 lg:hidden" aria-label="移动宽度管理端导航"><GlobalNavigation mobile /></nav></header>
      <main className="mx-auto max-w-[1480px] p-5 lg:p-8">{children}</main>
    </div>
  </div>;
}

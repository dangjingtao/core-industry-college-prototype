import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Boxes,
  Building2,
  ChevronRight,
  Database,
  FileBadge,
  Gauge,
  GraduationCap,
  Gift,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  UsersRound,
} from "lucide-react";
import { useState, type ReactNode } from "react";
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
  basicData: Database,
};

function routeLabel(pathname: string) {
  if (pathname === "/admin") return "运营总览";
  if (pathname.startsWith("/admin/competitions")) return "赛事运营";
  if (pathname.startsWith("/admin/organizations")) return "主体与学校";
  if (pathname.startsWith("/admin/opportunities")) return "机会与投递";
  if (pathname.startsWith("/admin/pc04/courses")) return "平台课程";
  if (pathname.startsWith("/admin/pc04/benefits")) return "权益运营";
  if (pathname.startsWith("/admin/pc04/certificates")) return "可信证书";
  if (pathname.startsWith("/admin/students")) return "学生";
  if (pathname.startsWith("/admin/assets")) return "长期资产";
  if (pathname.startsWith("/admin/observability")) return "环境与日志";
  if (pathname.startsWith("/admin/settings")) return "系统设置";
  if (pathname.startsWith("/admin/governance")) return "权限与审计";
  if (pathname.startsWith("/admin/content")) return "内容运营";
  if (pathname.startsWith("/admin/workshop")) return "创赛工坊";
  if (pathname.startsWith("/admin/basic-data")) return "基础数据管理";
  return "运营后台";
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
      const basePath = domain.id === "basicData" ? "/admin/basic-data" : `/admin/${domain.id}`;
      const pc04Resource = location.pathname.startsWith("/admin/pc04/courses") || location.pathname.startsWith("/admin/pc04/benefits");
      const pc04Assets = location.pathname.startsWith("/admin/pc04/certificates");
      const active = domain.id === "resources" ? location.pathname.startsWith(basePath) || location.pathname.startsWith("/admin/opportunities") || pc04Resource : domain.id === "assets" ? location.pathname.startsWith(basePath) || pc04Assets : location.pathname.startsWith(basePath);
      return <div key={domain.id}>
        <NavLink to={basePath} className={() => itemClass(active)}><Icon size={18} aria-hidden="true" />{domain.label}</NavLink>
        {!mobile && domain.id === "organizations" && <NavLink to="/admin/organizations" end className={({ isActive }) => subItemClass(isActive)}><ChevronRight size={13} />主体主数据</NavLink>}
        {!mobile && domain.id === "resources" && <><NavLink to="/admin/opportunities" className={({ isActive }) => subItemClass(isActive)}><Target size={13} />机会与投递</NavLink><NavLink to="/admin/pc04/courses" className={() => subItemClass(location.pathname.startsWith("/admin/pc04/courses"))}><GraduationCap size={13} />平台课程</NavLink><NavLink to="/admin/pc04/benefits" className={() => subItemClass(location.pathname.startsWith("/admin/pc04/benefits"))}><Gift size={13} />权益</NavLink></>}
        {!mobile && domain.id === "students" && <NavLink to="/admin/students" end className={({ isActive }) => subItemClass(isActive)}><ChevronRight size={13} />学生控制台</NavLink>}
        {!mobile && domain.id === "assets" && <NavLink to="/admin/pc04/certificates" className={() => subItemClass(location.pathname.startsWith("/admin/pc04/certificates"))}><FileBadge size={13} />可信证书</NavLink>}
        {!mobile && domain.id === "content" && <NavLink to="/admin/content/operations" className={({ isActive }) => subItemClass(isActive)}><ChevronRight size={13} />内容运营</NavLink>}
        {!mobile && domain.id === "basicData" && <><NavLink to="/admin/basic-data/students" className={() => subItemClass(location.pathname.startsWith("/admin/basic-data/students"))}><ChevronRight size={13} />报名学生基础数据</NavLink><NavLink to="/admin/basic-data/schools" className={() => subItemClass(location.pathname.startsWith("/admin/basic-data/schools"))}><Building2 size={13} />参赛学校基础数据</NavLink><NavLink to="/admin/basic-data/dictionaries" className={() => subItemClass(location.pathname.startsWith("/admin/basic-data/dictionaries"))}><ChevronRight size={13} />赛事 / 赛道字典</NavLink><NavLink to="/admin/basic-data/templates" className={() => subItemClass(location.pathname.startsWith("/admin/basic-data/templates"))}><FileBadge size={13} />证书 / 协议模板</NavLink><NavLink to="/admin/basic-data/imports" className={() => subItemClass(location.pathname.startsWith("/admin/basic-data/imports"))}><ChevronRight size={13} />导入与批处理</NavLink></>}
      </div>;
    })}
    <NavLink to="/admin/observability" className={({ isActive }) => itemClass(isActive)}><Gauge size={18} aria-hidden="true" />环境与日志</NavLink>
    <div>
      <NavLink to="/admin/settings" className={() => itemClass(location.pathname.startsWith("/admin/settings"))}><Settings size={18} aria-hidden="true" />系统设置</NavLink>
      {!mobile && <><NavLink to="/admin/settings/sms" className={() => subItemClass(location.pathname.startsWith("/admin/settings/sms"))}><ChevronRight size={13} />短信管理</NavLink><NavLink to="/admin/settings/content-templates" className={() => subItemClass(location.pathname.startsWith("/admin/settings/content-templates"))}><ChevronRight size={13} />内容模板</NavLink></>}
    </div>
    <NavLink to="/admin/governance" className={({ isActive }) => itemClass(isActive)}><ShieldCheck size={18} aria-hidden="true" />权限与审计</NavLink>
  </>;
}

function PermissionDetails() {
  return (
    <details className="relative" aria-label="当前管理角色与数据范围">
      <summary className="cursor-pointer list-none rounded-control border border-border-subtle bg-surface-subtle px-3 py-2 text-xs font-semibold text-text-secondary hover:bg-surface-pressed">当前权限</summary>
      <div className="absolute right-0 top-11 z-40 w-72 rounded-container border border-border-subtle bg-surface p-4 shadow-floating">
        <p className="text-xs font-semibold text-text-primary">当前账号权限</p>
        <div className="mt-3 space-y-2 text-xs text-text-secondary">
          <p><span className="text-text-tertiary">Role</span> · {currentOperatorContext.role}</p>
          <p><span className="text-text-tertiary">Module</span> · {currentOperatorContext.modulePermission}</p>
          <p><span className="text-text-tertiary">Data Scope</span> · {currentOperatorContext.dataScope}</p>
        </div>
        <p className="mt-3 text-[11px] leading-5 text-text-tertiary">{currentOperatorContext.note}</p>
      </div>
    </details>
  );
}

function adminViewClass(pathname: string) {
  if (pathname.startsWith("/admin/pc04/")) return "pc05-pc04-view";
  if (pathname.startsWith("/admin/competitions/objects/")) return "pc05-pc02-view";
  if (pathname.startsWith("/admin/settings")) return "pc07-settings-view";
  return "";
}

export function AdminControlPlaneShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [showTechnical, setShowTechnical] = useState(false);
  const label = routeLabel(location.pathname);
  const viewClass = adminViewClass(location.pathname);
  return <div className="min-h-screen bg-background text-text-primary">
    <style>{`
      .pc05-tech-hidden .font-mono,.pc05-tech-hidden code,.pc05-tech-hidden [data-pc05-technical]{display:none!important}
      .pc05-tech-hidden.pc07-settings-view .font-mono{display:revert!important}
      .pc05-tech-hidden [aria-label="PC02 三层事实边界"]{display:none!important}
      .pc05-tech-hidden.pc05-pc04-view>div>section:first-child>div:first-child>div:first-child>p{display:none!important}
      .pc05-tech-hidden.pc05-pc04-view>div>section:first-child>div:first-child>span{display:none!important}
      .pc05-tech-hidden.pc05-pc04-view section.border-info.bg-info-bg{display:none!important}
    `}</style>
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-border-subtle bg-surface lg:flex lg:flex-col">
      <div className="border-b border-border-subtle px-5 py-5"><div className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-control bg-primary text-on-primary"><Database size={20} aria-hidden="true" /></div><div><p className="text-sm font-semibold text-text-primary">核心产业学院</p><p className="mt-0.5 text-xs text-text-tertiary">运营后台</p></div></div></div>
      <nav className="flex-1 overflow-y-auto p-3" aria-label="管理端主导航"><GlobalNavigation /></nav>
      <div className="border-t border-border-subtle p-3"><Link to="/registration-portal/start" className="flex min-h-11 items-center justify-between rounded-control px-3 text-sm font-medium text-text-secondary hover:bg-surface-subtle"><span>三创赛报名门户</span><ChevronRight size={16} aria-hidden="true" /></Link></div>
    </aside>
    <div className="lg:pl-64">
      <header className="sticky top-0 z-20 border-b border-border-subtle bg-surface/95 backdrop-blur">
        <div className="mx-auto flex min-h-16 max-w-[1480px] items-center justify-between gap-4 px-5 lg:px-8">
          <div><p className="text-xs font-medium text-text-tertiary">核心产业学院 · 运营后台</p><p className="text-sm font-semibold text-text-primary">{label}</p></div>
          <div className="flex items-center gap-2">
            <button type="button" data-testid="technical-mode-toggle" onClick={() => setShowTechnical(value => !value)} className="rounded-control border border-border-subtle px-3 py-2 text-xs font-semibold text-text-secondary hover:bg-surface-subtle">{showTechnical ? "隐藏技术信息" : "显示技术信息"}</button>
            <PermissionDetails />
            <StatusTag tone="info">演示环境</StatusTag>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto border-t border-border-subtle px-3 py-2 lg:hidden" aria-label="移动宽度管理端导航"><GlobalNavigation mobile /></nav>
      </header>
      <main className={`mx-auto max-w-[1480px] p-5 lg:p-8 ${showTechnical ? "" : "pc05-tech-hidden"} ${viewClass}`}>{children}</main>
    </div>
  </div>;
}

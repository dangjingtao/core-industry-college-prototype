import {
  Activity,
  Boxes,
  Building2,
  ChevronRight,
  Database,
  FileBadge,
  LayoutDashboard,
  Sparkles,
  Target,
  Trophy,
  UsersRound,
} from "lucide-react";
import type { ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

const topLevelItems = [
  { to: "/admin", label: "总览", icon: LayoutDashboard, end: true },
  { to: "/admin/competitions", label: "赛事中心", icon: Trophy, end: false },
  { to: "/admin/organizations", label: "主体与学校", icon: Building2, end: false },
  { to: "/admin/resources", label: "资源运营", icon: Boxes, end: false },
  { to: "/admin/students", label: "学生与赛事身份", icon: UsersRound, end: false },
  { to: "/admin/assets", label: "资产与可信凭证", icon: FileBadge, end: false },
  { to: "/admin/content", label: "内容与活动", icon: Activity, end: false },
  { to: "/admin/workshop", label: "创赛工坊", icon: Sparkles, end: false },
] as const;

function SidebarNavigation({ mobile = false }: { mobile?: boolean }) {
  const location = useLocation();
  const itemClass = ({ isActive }: { isActive: boolean }) =>
    `${mobile ? "shrink-0" : "mb-1"} flex min-h-11 items-center gap-3 rounded-control px-3 text-sm font-medium transition ${isActive ? "bg-surface-subtle text-text-brand" : "text-text-secondary hover:bg-surface-subtle"}`;

  return (
    <>
      {topLevelItems.map(item => {
        const Icon = item.icon;
        const active = item.to === "/admin/organizations"
          ? location.pathname.startsWith("/admin/organizations")
          : item.to === "/admin/resources"
            ? location.pathname.startsWith("/admin/resources") || location.pathname.startsWith("/admin/opportunities")
            : item.to === "/admin/content"
              ? location.pathname.startsWith("/admin/content")
              : undefined;

        return (
          <div key={item.to} className={mobile ? "contents" : undefined}>
            <NavLink
              to={item.to}
              end={item.end}
              className={active === undefined ? itemClass : () => itemClass({ isActive: active })}
            >
              <Icon size={18} aria-hidden="true" />
              {item.label}
            </NavLink>

            {!mobile && item.to === "/admin/organizations" && (
              <NavLink to="/admin/organizations" end className={({ isActive }) => `mb-1 ml-8 flex min-h-9 items-center gap-2 rounded-control px-3 text-xs font-medium ${isActive ? "bg-primary-container text-text-brand" : "text-text-tertiary hover:bg-surface-subtle hover:text-text-secondary"}`}>
                <ChevronRight size={13} />Organization 主数据
              </NavLink>
            )}

            {!mobile && item.to === "/admin/resources" && (
              <NavLink to="/admin/opportunities" className={({ isActive }) => `mb-1 ml-8 flex min-h-9 items-center gap-2 rounded-control px-3 text-xs font-medium ${isActive ? "bg-primary-container text-text-brand" : "text-text-tertiary hover:bg-surface-subtle hover:text-text-secondary"}`}>
                <Target size={13} />机会与投递
              </NavLink>
            )}

            {!mobile && item.to === "/admin/content" && (
              <NavLink to="/admin/content/operations" className={({ isActive }) => `mb-1 ml-8 flex min-h-9 items-center gap-2 rounded-control px-3 text-xs font-medium ${isActive ? "bg-primary-container text-text-brand" : "text-text-tertiary hover:bg-surface-subtle hover:text-text-secondary"}`}>
                <ChevronRight size={13} />内容运营
              </NavLink>
            )}
          </div>
        );
      })}
    </>
  );
}

export function PC03AdminFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-text-primary">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-border-subtle bg-surface lg:flex lg:flex-col">
        <div className="border-b border-border-subtle px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-control bg-primary text-on-primary">
              <Database size={20} aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">核心产业学院</p>
              <p className="mt-0.5 text-xs text-text-tertiary">运营数据控制面</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto p-3" aria-label="管理端主导航">
          <SidebarNavigation />
        </nav>
        <div className="border-t border-border-subtle p-3">
          <Link to="/registration-portal/start" className="flex min-h-11 items-center justify-between rounded-control px-3 text-sm font-medium text-text-secondary hover:bg-surface-subtle">
            <span>三创赛报名门户</span>
            <ChevronRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </aside>

      <div className="lg:pl-64">
        <div className="sticky top-0 z-30 border-b border-border-subtle bg-surface/95 px-3 py-2 backdrop-blur lg:hidden">
          <nav className="flex gap-1 overflow-x-auto" aria-label="移动宽度管理端导航">
            <SidebarNavigation mobile />
          </nav>
        </div>
        <div className="[&>div>header]:hidden [&>div>main]:pt-6">{children}</div>
      </div>
    </div>
  );
}
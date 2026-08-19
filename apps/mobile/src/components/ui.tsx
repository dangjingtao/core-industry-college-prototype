import type { ButtonHTMLAttributes, ReactNode } from "react";
import { BriefcaseBusiness, ChevronLeft, Home, LayoutGrid, Trophy, UserRound } from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

export { Dialog } from "@core/shared";
export type { DialogProps } from "@core/shared";

export function Button({ className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`min-h-touch rounded-control bg-primary px-4 text-sm font-medium text-on-primary transition active:bg-primary-pressed disabled:cursor-not-allowed disabled:bg-[var(--color-disabled)] disabled:text-[var(--color-text-disabled)] ${className}`} {...props} />;
}

export function SecondaryButton({ className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`min-h-touch rounded-control bg-[var(--color-secondary)] px-4 text-sm font-medium text-text-brand transition active:bg-[var(--color-secondary-hover)] disabled:cursor-not-allowed disabled:bg-[var(--color-disabled)] disabled:text-[var(--color-text-disabled)] ${className}`} {...props} />;
}

export function GhostButton({ className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`min-h-touch rounded-control px-3 text-sm font-medium text-text-brand transition active:bg-surface-pressed disabled:cursor-not-allowed disabled:text-[var(--color-text-disabled)] ${className}`} {...props} />;
}

export function Card({ children, className = "", interactive = false, ...rest }: { children: ReactNode; className?: string; interactive?: boolean } & React.HTMLAttributes<HTMLDivElement>) {
  return <div {...rest} className={`rounded-container bg-surface p-3 ${interactive ? "border border-border-subtle transition hover:bg-surface-subtle" : ""} ${className}`}>{children}</div>;
}

export function Section({ title, subtitle, action, children, className = "" }: { title?: string; subtitle?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`space-y-3 ${className}`}>
      {(title || subtitle || action) && <div className="flex min-h-6 items-center justify-between gap-3"><div><h2 className="text-base font-semibold text-text-primary">{title}</h2>{subtitle && <p className="mt-0.5 text-xs text-text-tertiary">{subtitle}</p>}</div>{action}</div>}
      {children}
    </section>
  );
}

export function StatusTag({ tone = "info", children }: { tone?: "info" | "success" | "warning" | "danger" | "neutral"; children: ReactNode }) {
  const toneClass = tone === "success" ? "bg-success-bg text-success-text" : tone === "warning" ? "bg-warning-bg text-warning-text" : tone === "danger" ? "bg-danger-bg text-danger-text" : tone === "neutral" ? "bg-surface-subtle text-text-secondary" : "bg-info-bg text-info-text";
  return <span className={`inline-flex min-h-6 items-center rounded-full px-2 text-xs font-medium ${toneClass}`}>{children}</span>;
}

export function PageHeader({ title, backTo, right }: { title: string; backTo?: string; subtitle?: string; right?: ReactNode }) {
  const navigate = useNavigate();
  const handleBack = () => {
    const canGoBack = (window.history.state?.idx ?? 0) > 0;
    if (canGoBack) navigate(-1);
    else if (backTo) navigate(backTo);
  };
  return (
    <header className="sticky top-0 z-20 border-b border-border-subtle bg-surface pt-[env(safe-area-inset-top)]">
      <div className="relative mx-auto flex min-h-11 w-full max-w-md items-center justify-center px-14">
        {backTo && <button type="button" aria-label="返回" className="absolute left-1 top-1/2 flex min-h-touch min-w-11 -translate-y-1/2 items-center justify-center rounded-control text-text-primary transition active:bg-surface-pressed" onClick={handleBack}><ChevronLeft aria-hidden="true" size={24} strokeWidth={2} /></button>}
        <div className="min-w-0 text-center">
          <h1 className="truncate text-base font-semibold leading-5 text-text-primary">{title}</h1>
        </div>
        {right && <div className="absolute right-1 top-1/2 -translate-y-1/2">{right}</div>}
      </div>
    </header>
  );
}

const navItems = [
  { label: "首页", to: "/home", icon: Home },
  { label: "赛事", to: "/competitions", icon: Trophy },
  { label: "机会", to: "/opportunities", icon: BriefcaseBusiness },
  { label: "应用中心", to: "/apps", icon: LayoutGrid },
  { label: "我的", to: "/me", icon: UserRound },
];

export function PublicShell({ children, showNavigation = false }: { children: ReactNode; showNavigation?: boolean }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className={`mx-auto w-full max-w-md ${showNavigation ? "pb-24" : "pb-8"}`}>{children}</main>
      {showNavigation && <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto flex min-h-14 max-w-md border-t border-border-subtle bg-surface px-2 pb-[env(safe-area-inset-bottom)]">
        {navItems.map(item => {
          const Icon = item.icon;
          return <NavLink key={item.to} to={item.to} className={({ isActive }) => `flex min-h-touch flex-1 flex-col items-center justify-center gap-1 text-xs font-medium ${isActive ? "text-text-brand" : "text-text-tertiary"}`}><Icon aria-hidden="true" size={22} strokeWidth={2} />{item.label}</NavLink>;
        })}
      </nav>}
    </div>
  );
}

export function StateBlock({ state, onRetry }: { state: "loading" | "empty" | "error"; onRetry?: () => void }) {
  if (state === "loading") return <div className="space-y-3 py-4">{[1,2,3].map(i => <div key={i} className="h-24 animate-pulse rounded-container bg-surface-subtle" />)}</div>;
  if (state === "empty") return <Card className="py-8 text-center"><p className="text-base font-semibold text-text-primary">暂时没有内容</p><p className="mt-2 text-sm text-text-secondary">调整筛选条件，或稍后再看。</p></Card>;
  return <Card className="border border-danger bg-danger-bg py-6 text-center"><p className="text-base font-semibold text-danger-text">加载失败</p><p className="mt-2 text-sm text-danger-text">网络状态异常，请重新加载。</p>{onRetry && <Button className="mt-4" onClick={onRetry}>重新加载</Button>}</Card>;
}

export function ConfirmDialog({ open, title, description, cancelText = "关闭", confirmText = "确认", onCancel, onConfirm }: { open: boolean; title: string; description?: ReactNode; cancelText?: string; confirmText?: string; onCancel: () => void; onConfirm: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 px-6">
      <div className="w-full max-w-xs rounded-container bg-surface p-5 shadow-floating">
        <h3 className="text-center text-base font-semibold text-text-primary">{title}</h3>
        {description && <p className="mt-2 text-center text-sm leading-5 text-text-secondary">{description}</p>}
        <div className="mt-5 flex gap-3">
          <SecondaryButton className="flex-1" onClick={onCancel}>{cancelText}</SecondaryButton>
          <Button className="flex-1" onClick={onConfirm}>{confirmText}</Button>
        </div>
      </div>
    </div>
  );
}

export function PrototypeStateTools() {
  const location = useLocation();
  const navigate = useNavigate();
  const set = (state?: string) => {
    const next = new URLSearchParams(location.search);
    state ? next.set("view", state) : next.delete("view");
    const query = next.toString();
    navigate(`${location.pathname}${query ? `?${query}` : ""}`);
  };
  return <details className="mx-3 ml-auto mt-4 w-fit rounded-control border border-border-subtle bg-surface p-2 text-xs shadow-floating"><summary className="cursor-pointer font-medium text-text-secondary">原型状态</summary><div className="mt-2 grid grid-cols-2 gap-1">{[undefined,"loading","empty","error"].map(v => <button key={v ?? "ready"} className="min-h-8 rounded-control px-2 text-text-brand active:bg-surface-pressed" onClick={() => set(v)}>{v ?? "ready"}</button>)}</div></details>;
}

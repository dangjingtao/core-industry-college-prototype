import { ArrowRight, Gauge, ShieldCheck, SquareTerminal } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

function DevCard({ to, icon, title, description }: { to: string; icon: ReactNode; title: string; description: string }) {
  return (
    <Link to={to} className="group rounded-container border border-border-subtle bg-surface p-5 transition hover:bg-surface-subtle">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-control bg-primary-container text-text-brand">{icon}</div><h2 className="font-semibold">{title}</h2></div>
        <ArrowRight size={16} className="text-text-tertiary transition group-hover:text-text-brand" />
      </div>
      <p className="mt-4 text-sm leading-6 text-text-secondary">{description}</p>
    </Link>
  );
}

export function DevModuleConsole() {
  return (
    <div className="space-y-6" data-testid="pc-dev-module">
      <section className="rounded-container border border-border-subtle bg-surface p-5 lg:p-6">
        <div className="flex items-center gap-2 text-text-brand"><SquareTerminal size={18} aria-hidden="true" /><p className="text-xs font-semibold">开发模块</p></div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">开发</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">面向开发与平台维护：先确认环境是否健康、异常发生在哪一层，再核对关键操作的权限与审计记录。这里不承载老板业务大屏，也不替代既有业务模块。</p>
      </section>
      <section className="grid gap-4 lg:grid-cols-2" aria-label="开发模块入口">
        <DevCard to="/admin/observability" icon={<Gauge size={20} />} title="环境与日志" description="开发 / 测试环境健康状态、服务 / 请求 / 资源 / 同步指标、异常告警与日志证据、最近部署变更。" />
        <DevCard to="/admin/governance" icon={<ShieldCheck size={20} />} title="权限与审计" description="后台操作身份与数据范围、高风险审批、操作审计 / Audit Log，以及跨模块业务链与一致性检查。" />
      </section>
    </div>
  );
}

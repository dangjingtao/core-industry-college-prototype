import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BadgeCheck,
  Boxes,
  Building2,
  ChevronRight,
  Database,
  FileBadge,
  GraduationCap,
  LayoutDashboard,
  Network,
  Settings2,
  ShieldCheck,
  Sparkles,
  Trophy,
  UsersRound,
} from "lucide-react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { StatusTag } from "../components/ui";
import { adminDomains, statusMeta, type AdminDomain, type DataEntity } from "./data";

const domainIcons: Record<string, LucideIcon> = {
  competitions: Trophy,
  organizations: Building2,
  resources: Boxes,
  students: UsersRound,
  assets: FileBadge,
  content: Activity,
  workshop: Sparkles,
};

const kindTone: Record<DataEntity["kind"], "info" | "success" | "warning" | "neutral"> = {
  主数据: "info",
  关系: "neutral",
  运营配置: "warning",
  交易状态: "warning",
  长期资产: "success",
};

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-text-primary">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-border-subtle bg-surface lg:flex lg:flex-col">
        <div className="border-b border-border-subtle px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-control bg-primary text-on-primary"><Database size={20} aria-hidden="true" /></div>
            <div>
              <p className="text-sm font-semibold text-text-primary">核心产业学院</p>
              <p className="mt-0.5 text-xs text-text-tertiary">运营数据控制面 · Skeleton</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto p-3" aria-label="管理端主导航">
          <NavLink to="/admin" end className={({ isActive }) => `mb-1 flex min-h-11 items-center gap-3 rounded-control px-3 text-sm font-medium transition ${isActive ? "bg-surface-subtle text-text-brand" : "text-text-secondary hover:bg-surface-subtle"}`}>
            <LayoutDashboard size={18} aria-hidden="true" />总览
          </NavLink>
          <p className="px-3 pb-2 pt-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-text-tertiary">Data Domains</p>
          {adminDomains.map(domain => {
            const Icon = domainIcons[domain.id] ?? Database;
            return <NavLink key={domain.id} to={`/admin/${domain.id}`} className={({ isActive }) => `mb-1 flex min-h-11 items-center gap-3 rounded-control px-3 text-sm font-medium transition ${isActive ? "bg-surface-subtle text-text-brand" : "text-text-secondary hover:bg-surface-subtle"}`}><Icon size={18} aria-hidden="true" />{domain.label}</NavLink>;
          })}
        </nav>
        <div className="border-t border-border-subtle p-3">
          <Link to="/registration-portal/start" className="flex min-h-11 items-center justify-between rounded-control px-3 text-sm font-medium text-text-secondary hover:bg-surface-subtle">
            <span>三创赛报名门户</span><ChevronRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-border-subtle bg-surface/95 backdrop-blur">
          <div className="mx-auto flex min-h-16 max-w-[1440px] items-center justify-between gap-4 px-5 lg:px-8">
            <div>
              <p className="text-xs font-medium text-text-tertiary">PC 管理端 / dev</p>
              <p className="text-sm font-semibold text-text-primary">人、主体、资源、规则、关系、状态</p>
            </div>
            <StatusTag tone="warning">骨架阶段 · 非后端 Schema</StatusTag>
          </div>
        </header>
        <main className="mx-auto max-w-[1440px] p-5 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

function ArchitectureMap() {
  const truthLayers = [
    { title: "主数据", items: "Account · StudentProfile · Organization · Competition · Resource", icon: Database },
    { title: "关系与规则", items: "ResourceRelation · SchoolScope · EligibilityRule · CompetitionIdentity", icon: Network },
    { title: "运行状态", items: "Registration · Team · Application · Learning · BenefitClaim · WorkshopRun", icon: Settings2 },
    { title: "长期资产", items: "Experience · Result · Certificate · Verification", icon: ShieldCheck },
  ];
  return (
    <section className="rounded-container border border-border-subtle bg-surface p-5 lg:p-6" aria-labelledby="architecture-map-title">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-brand">Data flow map</p>
          <h2 id="architecture-map-title" className="mt-1 text-lg font-semibold text-text-primary">PC 管理端不是桌面版 App，而是手机端的数据控制面</h2>
        </div>
        <StatusTag tone="info">配置 → 事实 → 消费</StatusTag>
      </div>
      <div className="mt-6 grid gap-4 xl:grid-cols-[0.9fr_1.6fr_0.9fr]">
        <div className="rounded-container bg-surface-subtle p-4">
          <p className="text-xs font-semibold text-text-tertiary">写入来源</p>
          <div className="mt-3 space-y-2 text-sm text-text-primary">
            <div className="rounded-control bg-surface p-3"><strong>运营后台</strong><p className="mt-1 text-xs leading-5 text-text-secondary">赛事、企业、资源、规则、内容、活动、证书。</p></div>
            <div className="rounded-control bg-surface p-3"><strong>报名门户</strong><p className="mt-1 text-xs leading-5 text-text-secondary">报名草稿、团队、审核与赛事身份回流。</p></div>
            <div className="rounded-control bg-surface p-3"><strong>业务运行</strong><p className="mt-1 text-xs leading-5 text-text-secondary">投递、学习、领取核销、工坊 Run 等状态。</p></div>
          </div>
        </div>
        <div className="relative rounded-container border border-border-subtle bg-background p-4">
          <div className="absolute -left-2 top-1/2 hidden size-4 -translate-y-1/2 rotate-45 border-b border-l border-border-subtle bg-background xl:block" />
          <p className="text-center text-xs font-semibold text-text-tertiary">共享业务真相 / API 边界</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {truthLayers.map(layer => {
              const Icon = layer.icon;
              return <div key={layer.title} className="rounded-control border border-border-subtle bg-surface p-4"><div className="flex items-center gap-2"><Icon size={18} className="text-text-brand" aria-hidden="true" /><strong className="text-sm text-text-primary">{layer.title}</strong></div><p className="mt-2 text-xs leading-5 text-text-secondary">{layer.items}</p></div>;
            })}
          </div>
          <p className="mt-4 rounded-control bg-info-bg px-3 py-2 text-xs leading-5 text-info-text">手机 `/tasks` 只从这些业务状态派生“下一步”，PC 不新增万能 Task 真相源。</p>
        </div>
        <div className="rounded-container bg-surface-subtle p-4">
          <p className="text-xs font-semibold text-text-tertiary">手机端消费</p>
          <div className="mt-3 grid gap-2 text-sm text-text-primary">
            {["首页 / 任务聚合", "赛事 / Workspace / 工坊", "企业 / 机会 / 投递", "课程 / 权益", "我的 / 长期资产"].map(item => <div key={item} className="flex items-center gap-2 rounded-control bg-surface p-3"><ChevronRight size={15} className="text-text-brand" aria-hidden="true" /><span>{item}</span></div>)}
          </div>
        </div>
      </div>
    </section>
  );
}

function Overview() {
  const missingEntities = adminDomains.flatMap(domain => domain.entities).filter(entity => entity.status === "missing").length;
  const partialEntities = adminDomains.flatMap(domain => domain.entities).filter(entity => entity.status === "partial").length;
  return (
    <div className="space-y-6">
      <section className="grid gap-5 xl:grid-cols-[1.45fr_0.75fr]">
        <div className="rounded-container bg-primary p-6 text-on-primary lg:p-8">
          <p className="text-sm font-medium opacity-80">PC Management Skeleton · v0</p>
          <h1 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight">先让手机端的每一类业务数据，都能回答“谁在 PC 管、从哪里写入、谁是真相源”。</h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 opacity-85">这版不追求 CRUD 完整，不引入后端。先把数据域和责任边界钉住，避免手机原型继续通过 hardcode 各自生长。</p>
          <div className="mt-6 flex flex-wrap gap-2 text-xs">
            {["不复制第二份账号", "不复制第二份赛事身份", "企业作为资源主体", "报名门户保持独立", "工坊保持赛事上下文"].map(item => <span key={item} className="rounded-full bg-white/10 px-3 py-1.5">{item}</span>)}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-container border border-border-subtle bg-surface p-5"><p className="text-3xl font-semibold text-text-primary">{adminDomains.length}</p><p className="mt-1 text-sm text-text-secondary">管理数据域</p></div>
          <div className="rounded-container border border-border-subtle bg-surface p-5"><p className="text-3xl font-semibold text-text-primary">{missingEntities}</p><p className="mt-1 text-sm text-text-secondary">主要仍是手机 mock</p></div>
          <div className="rounded-container border border-border-subtle bg-surface p-5"><p className="text-3xl font-semibold text-text-primary">{partialEntities}</p><p className="mt-1 text-sm text-text-secondary">已有事实但需归一</p></div>
          <div className="rounded-container border border-border-subtle bg-surface p-5"><p className="text-3xl font-semibold text-text-primary">0</p><p className="mt-1 text-sm text-text-secondary">新增全局 Task 真相源</p></div>
        </div>
      </section>
      <ArchitectureMap />
      <section>
        <div className="flex items-end justify-between gap-4">
          <div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-brand">Domain map</p><h2 className="mt-1 text-xl font-semibold text-text-primary">第一阶段管理骨架</h2></div>
          <p className="hidden text-sm text-text-tertiary md:block">点击进入，查看实体 / 关系 / 写入责任</p>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {adminDomains.map(domain => {
            const Icon = domainIcons[domain.id] ?? Database;
            return <Link key={domain.id} to={`/admin/${domain.id}`} className="group rounded-container border border-border-subtle bg-surface p-5 transition hover:-translate-y-0.5 hover:shadow-floating"><div className="flex items-start justify-between gap-3"><div className="flex size-10 items-center justify-center rounded-control bg-surface-subtle text-text-brand"><Icon size={20} aria-hidden="true" /></div><ChevronRight size={18} className="text-text-tertiary transition group-hover:translate-x-0.5" aria-hidden="true" /></div><p className="mt-4 text-xs font-medium text-text-tertiary">{domain.eyebrow}</p><h3 className="mt-1 text-base font-semibold text-text-primary">{domain.label}</h3><p className="mt-2 text-sm leading-6 text-text-secondary">{domain.description}</p><div className="mt-4 flex flex-wrap gap-2"><StatusTag tone="neutral">{domain.entities.length} 类实体</StatusTag><StatusTag tone="neutral">{domain.relations.length} 组关系</StatusTag></div></Link>;
          })}
        </div>
      </section>
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-container border border-border-subtle bg-surface p-5"><GraduationCap size={20} className="text-text-brand" aria-hidden="true" /><h3 className="mt-3 font-semibold text-text-primary">学校老师不是学生 App 角色</h3><p className="mt-2 text-sm leading-6 text-text-secondary">PC 后续可在赛事 + 学校授权范围内提供审核能力，不因此建设独立老师 App。</p></div>
        <div className="rounded-container border border-border-subtle bg-surface p-5"><Building2 size={20} className="text-text-brand" aria-hidden="true" /><h3 className="mt-3 font-semibold text-text-primary">企业不是招聘公司表</h3><p className="mt-2 text-sm leading-6 text-text-secondary">企业/机构用统一 Organization ID 连接赛事、课程、权益、活动和机会。</p></div>
        <div className="rounded-container border border-border-subtle bg-surface p-5"><BadgeCheck size={20} className="text-text-brand" aria-hidden="true" /><h3 className="mt-3 font-semibold text-text-primary">可信事实与展示表达分开</h3><p className="mt-2 text-sm leading-6 text-text-secondary">成绩、证书、身份由可信源写入；简历表达可以编辑，但不能覆盖可信事实。</p></div>
      </section>
    </div>
  );
}

function DomainDetail({ domain }: { domain: AdminDomain }) {
  const Icon = domainIcons[domain.id] ?? Database;
  return (
    <div className="space-y-6">
      <section className="rounded-container border border-border-subtle bg-surface p-6 lg:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-container bg-surface-subtle text-text-brand"><Icon size={24} aria-hidden="true" /></div>
            <div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-brand">{domain.eyebrow}</p><h1 className="mt-1 text-2xl font-semibold text-text-primary">{domain.label}</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">{domain.description}</p></div>
          </div>
          <Link to="/admin" className="text-sm font-medium text-text-brand">返回总览</Link>
        </div>
        <div className="mt-5 rounded-control bg-info-bg px-4 py-3 text-sm leading-6 text-info-text"><strong>责任边界：</strong>{domain.responsibility}</div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.55fr_0.85fr]">
        <div className="rounded-container border border-border-subtle bg-surface">
          <div className="border-b border-border-subtle px-5 py-4"><h2 className="font-semibold text-text-primary">管理实体</h2><p className="mt-1 text-xs text-text-tertiary">这不是数据库字段表，而是必须先形成稳定 ID 和责任归属的业务对象。</p></div>
          <div className="divide-y divide-border-subtle">
            {domain.entities.map(entity => {
              const meta = statusMeta[entity.status];
              return <div key={entity.name} className="p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex flex-wrap items-center gap-2"><strong className="font-mono text-sm text-text-primary">{entity.name}</strong><StatusTag tone={kindTone[entity.kind]}>{entity.kind}</StatusTag></div><p className="mt-2 text-sm leading-6 text-text-secondary">{entity.description}</p></div><StatusTag tone={meta.tone}>{meta.label}</StatusTag></div><div className="mt-4 grid gap-3 text-xs md:grid-cols-2"><div className="rounded-control bg-surface-subtle p-3"><span className="text-text-tertiary">写入责任</span><p className="mt-1 font-medium text-text-primary">{entity.writeBy}</p></div><div className="rounded-control bg-surface-subtle p-3"><span className="text-text-tertiary">手机消费</span><p className="mt-1 font-medium text-text-primary">{entity.mobileConsumers.join(" · ")}</p></div></div></div>;
            })}
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-container border border-border-subtle bg-surface p-5"><div className="flex items-center gap-2"><Network size={18} className="text-text-brand" aria-hidden="true" /><h2 className="font-semibold text-text-primary">关键关系</h2></div><div className="mt-4 space-y-2">{domain.relations.map(relation => <div key={relation} className="rounded-control bg-surface-subtle px-3 py-2.5 text-sm text-text-secondary">{relation}</div>)}</div></div>
          <div className="rounded-container border border-border-subtle bg-surface p-5"><div className="flex items-center gap-2"><Settings2 size={18} className="text-text-brand" aria-hidden="true" /><h2 className="font-semibold text-text-primary">首版最低管理动作</h2></div><div className="mt-4 space-y-3">{domain.minimumActions.map((action, index) => <div key={action} className="flex gap-3 text-sm text-text-secondary"><span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-surface-subtle text-xs font-semibold text-text-brand">{index + 1}</span><span className="pt-0.5">{action}</span></div>)}</div></div>
        </div>
      </section>
    </div>
  );
}

export function AdminConsole() {
  const location = useLocation();
  const section = location.pathname.split("/")[2];
  const selected = adminDomains.find(domain => domain.id === section);
  return <Shell>{selected ? <DomainDetail domain={selected} /> : <Overview />}</Shell>;
}

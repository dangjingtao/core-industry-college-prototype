import type { LucideIcon } from "lucide-react";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRightLeft,
  BadgeCheck,
  Boxes,
  Building2,
  ChevronRight,
  Database,
  FileBadge,
  GraduationCap,
  KeyRound,
  LayoutDashboard,
  MapPinned,
  Network,
  Pencil,
  Route,
  Settings2,
  ShieldCheck,
  Sparkles,
  Trophy,
  UserRoundCog,
  UsersRound,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { StatusTag } from "../components/ui";
import {
  adminDomains,
  appPcDataMap,
  currentOperatorContext,
  sourceMeta,
  stableIdExamples,
  statusMeta,
  type AdminDomain,
  type AdminObjectRecord,
  type DataEntity,
  type DataSource,
} from "./data";

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

function StableId({ field, value }: { field: string; value: string }) {
  return (
    <span className="inline-flex max-w-full items-center gap-1.5 rounded-control bg-surface-subtle px-2.5 py-1 font-mono text-xs text-text-primary">
      <KeyRound size={13} className="shrink-0 text-text-tertiary" aria-hidden="true" />
      <span className="text-text-tertiary">{field}</span>
      <span className="truncate font-semibold">{value}</span>
    </span>
  );
}

function SourceTag({ source }: { source: DataSource }) {
  const meta = sourceMeta[source];
  return <StatusTag tone={meta.tone}>{source}</StatusTag>;
}

function OperatorContext() {
  return (
    <div className="hidden items-center gap-2 xl:flex" aria-label="当前管理角色与数据范围">
      <div className="rounded-control bg-surface-subtle px-3 py-2">
        <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-text-tertiary">Role</p>
        <p className="mt-0.5 text-xs font-semibold text-text-primary">{currentOperatorContext.role}</p>
      </div>
      <div className="rounded-control bg-surface-subtle px-3 py-2">
        <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-text-tertiary">Module</p>
        <p className="mt-0.5 text-xs font-semibold text-text-primary">{currentOperatorContext.modulePermission}</p>
      </div>
      <div className="rounded-control bg-surface-subtle px-3 py-2">
        <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-text-tertiary">Data Scope</p>
        <p className="mt-0.5 text-xs font-semibold text-text-primary">{currentOperatorContext.dataScope}</p>
      </div>
    </div>
  );
}

function GlobalNavigation({ mobile = false }: { mobile?: boolean }) {
  const itemClass = ({ isActive }: { isActive: boolean }) =>
    `${mobile ? "shrink-0" : "mb-1"} flex min-h-11 items-center gap-3 rounded-control px-3 text-sm font-medium transition ${
      isActive ? "bg-surface-subtle text-text-brand" : "text-text-secondary hover:bg-surface-subtle"
    }`;

  return (
    <>
      <NavLink to="/admin" end className={itemClass}>
        <LayoutDashboard size={18} aria-hidden="true" />
        总览
      </NavLink>
      {adminDomains.map(domain => {
        const Icon = domainIcons[domain.id] ?? Database;
        return (
          <NavLink key={domain.id} to={`/admin/${domain.id}`} className={itemClass}>
            <Icon size={18} aria-hidden="true" />
            {domain.label}
          </NavLink>
        );
      })}
    </>
  );
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-text-primary">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-border-subtle bg-surface lg:flex lg:flex-col">
        <div className="border-b border-border-subtle px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-control bg-primary text-on-primary">
              <Database size={20} aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">核心产业学院</p>
              <p className="mt-0.5 text-xs text-text-tertiary">运营数据控制面 · PC01</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto p-3" aria-label="管理端主导航">
          <GlobalNavigation />
        </nav>
        <div className="border-t border-border-subtle p-3">
          <Link to="/registration-portal/start" className="flex min-h-11 items-center justify-between rounded-control px-3 text-sm font-medium text-text-secondary hover:bg-surface-subtle">
            <span>三创赛报名门户</span>
            <ChevronRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-border-subtle bg-surface/95 backdrop-blur">
          <div className="mx-auto flex min-h-16 max-w-[1480px] items-center justify-between gap-4 px-5 lg:px-8">
            <div>
              <p className="text-xs font-medium text-text-tertiary">PC 管理端 / dev</p>
              <p className="text-sm font-semibold text-text-primary">平台控制面 · 人、主体、资源、规则、关系、可信状态</p>
            </div>
            <div className="flex items-center gap-3">
              <OperatorContext />
              <StatusTag tone="info">PC01 控制面底座</StatusTag>
            </div>
          </div>
          <nav className="flex gap-1 overflow-x-auto border-t border-border-subtle px-3 py-2 lg:hidden" aria-label="移动宽度管理端导航">
            <GlobalNavigation mobile />
          </nav>
        </header>
        <main className="mx-auto max-w-[1480px] p-5 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

function ArchitectureMap() {
  const truthLayers = [
    { title: "主数据", items: "Account · StudentProfile · Organization · Competition · Resource", icon: Database },
    { title: "关系与规则", items: "ResourceRelation · SchoolScope · EligibilityRule · CompetitionIdentity", icon: Network },
    { title: "运行状态", items: "Registration · Application · CourseLearning · BenefitRecord · WorkshopRun", icon: Settings2 },
    { title: "长期资产", items: "Experience · Result · Certificate · CourseAchievement · Verification", icon: ShieldCheck },
  ];

  return (
    <section className="rounded-container border border-border-subtle bg-surface p-5 lg:p-6" aria-labelledby="architecture-map-title">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-brand">Truth boundary</p>
          <h2 id="architecture-map-title" className="mt-1 text-lg font-semibold text-text-primary">PC 管理端不是桌面版 App，而是手机端的数据控制面</h2>
        </div>
        <StatusTag tone="info">配置 / 同步 / Runtime → App 消费</StatusTag>
      </div>
      <div className="mt-6 grid gap-4 xl:grid-cols-[0.9fr_1.6fr_0.9fr]">
        <div className="rounded-container bg-surface-subtle p-4">
          <p className="text-xs font-semibold text-text-tertiary">写入与接入</p>
          <div className="mt-3 space-y-2 text-sm text-text-primary">
            <div className="rounded-control bg-surface p-3"><strong>平台运营</strong><p className="mt-1 text-xs leading-5 text-text-secondary">主数据、规则、内容、关系与发布配置。</p></div>
            <div className="rounded-control bg-surface p-3"><strong>外部权威</strong><p className="mt-1 text-xs leading-5 text-text-secondary">API 优先，文件导入兜底；人工覆盖必须可追溯。</p></div>
            <div className="rounded-control bg-surface p-3"><strong>业务 Runtime</strong><p className="mt-1 text-xs leading-5 text-text-secondary">报名、投递、学习、核销、工坊运行等行为事实。</p></div>
          </div>
        </div>
        <div className="rounded-container border border-border-subtle bg-background p-4">
          <p className="text-center text-xs font-semibold text-text-tertiary">共享业务真相 / API 边界</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {truthLayers.map(layer => {
              const Icon = layer.icon;
              return (
                <div key={layer.title} className="rounded-control border border-border-subtle bg-surface p-4">
                  <div className="flex items-center gap-2">
                    <Icon size={18} className="text-text-brand" aria-hidden="true" />
                    <strong className="text-sm text-text-primary">{layer.title}</strong>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-text-secondary">{layer.items}</p>
                </div>
              );
            })}
          </div>
          <p className="mt-4 rounded-control bg-info-bg px-3 py-2 text-xs leading-5 text-info-text">手机 `/tasks` 只派生已有业务的“下一步”；PC01 不新增万能 Task 真相源。</p>
        </div>
        <div className="rounded-container bg-surface-subtle p-4">
          <p className="text-xs font-semibold text-text-tertiary">App 消费</p>
          <div className="mt-3 grid gap-2 text-sm text-text-primary">
            {["首页 / 任务聚合", "赛事 / Workspace / 工坊", "企业 / 机会 / 投递", "课程 / 权益", "我的 / 长期资产"].map(item => (
              <div key={item} className="flex items-center gap-2 rounded-control bg-surface p-3">
                <ChevronRight size={15} className="text-text-brand" aria-hidden="true" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function DataSourceLegend() {
  return (
    <section className="rounded-container border border-border-subtle bg-surface p-5 lg:p-6" aria-labelledby="data-source-title">
      <div className="flex items-start gap-3">
        <Route size={20} className="mt-0.5 text-text-brand" aria-hidden="true" />
        <div>
          <h2 id="data-source-title" className="font-semibold text-text-primary">统一数据来源标签</h2>
          <p className="mt-1 text-sm leading-6 text-text-secondary">PC01 固定五种来源语义。它们描述事实如何进入控制面，不等于谁拥有修改权限。</p>
        </div>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {(Object.entries(sourceMeta) as [DataSource, (typeof sourceMeta)[DataSource]][]).map(([source, meta]) => (
          <div key={source} className="rounded-control bg-surface-subtle p-3">
            <SourceTag source={source} />
            <p className="mt-2 text-xs leading-5 text-text-secondary">{meta.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function StableIdRules() {
  return (
    <section className="rounded-container border border-border-subtle bg-surface p-5 lg:p-6" aria-labelledby="stable-id-title">
      <div className="flex items-start gap-3">
        <KeyRound size={20} className="mt-0.5 text-text-brand" aria-hidden="true" />
        <div>
          <h2 id="stable-id-title" className="font-semibold text-text-primary">Stable ID 统一展示</h2>
          <p className="mt-1 text-sm leading-6 text-text-secondary">跨域关系只认稳定业务 ID，不用中文标题、数组序号或页面路径充当关联键。</p>
        </div>
      </div>
      <div className="mt-4 grid gap-3 xl:grid-cols-3">
        {stableIdExamples.map(example => (
          <div key={example.object} className="rounded-control bg-surface-subtle p-4">
            <div className="flex items-center justify-between gap-2">
              <strong className="font-mono text-sm text-text-primary">{example.object}</strong>
              <StatusTag tone={example.status === "ready" ? "success" : example.status === "mapped" ? "info" : "warning"}>
                {example.status === "ready" ? "已对齐" : example.status === "mapped" ? "字段迁移映射" : "真实缺口"}
              </StatusTag>
            </div>
            <div className="mt-3"><StableId field={example.field} value={example.value} /></div>
            <p className="mt-3 text-xs leading-5 text-text-secondary">{example.note}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function AppPcDataMap() {
  return (
    <section className="rounded-container border border-border-subtle bg-surface" aria-labelledby="app-pc-map-title">
      <div className="border-b border-border-subtle px-5 py-4 lg:px-6">
        <div className="flex items-start gap-3">
          <ArrowRightLeft size={20} className="mt-0.5 text-text-brand" aria-hidden="true" />
          <div>
            <h2 id="app-pc-map-title" className="font-semibold text-text-primary">APP → PC 数据接入地图</h2>
            <p className="mt-1 text-sm leading-6 text-text-secondary">八组 PC01 必查 App 入口，都必须能追到负责域、状态、stable id 与长期保留规则。</p>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-[1120px] w-full border-collapse text-left text-xs">
          <thead className="bg-surface-subtle text-text-secondary">
            <tr>
              {["App route", "App 事实", "PC 负责域", "来源", "当前状态语义", "Stable ID", "保留规则"].map(label => (
                <th key={label} className="border-b border-border-subtle px-4 py-3 font-semibold">{label}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {appPcDataMap.map(row => (
              <tr key={row.route} className="align-top">
                <td className="px-4 py-4 font-mono font-semibold text-text-brand">{row.route}</td>
                <td className="max-w-52 px-4 py-4 leading-5 text-text-primary">{row.appFacts}</td>
                <td className="max-w-48 px-4 py-4 leading-5 text-text-primary">{row.pcDomain}</td>
                <td className="max-w-56 px-4 py-4 leading-5 text-text-secondary">{row.source}</td>
                <td className="max-w-64 px-4 py-4 leading-5 text-text-secondary">{row.states}</td>
                <td className="max-w-64 px-4 py-4 font-mono leading-5 text-text-secondary">{row.stableIds}</td>
                <td className="max-w-64 px-4 py-4 leading-5 text-text-secondary">{row.retention}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Overview() {
  const objectCount = adminDomains.reduce((count, domain) => count + domain.sampleObjects.length, 0);
  return (
    <div className="space-y-6">
      <section className="grid gap-5 xl:grid-cols-[1.45fr_0.75fr]">
        <div className="rounded-container bg-primary p-6 text-on-primary lg:p-8">
          <p className="text-sm font-medium opacity-80">PC Control Plane · PC01</p>
          <h1 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight">把 App 的业务真相接进同一套 PC 控制面，而不是再造一份后台世界。</h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 opacity-85">这一卡先固定总壳、来源标签、stable ID、Role + Scope、列表 / 详情 / 编辑 Pattern 和跨域关系。具体赛事、Organization、课程、权益与学生治理留给 PC02–PC05。</p>
          <div className="mt-6 flex flex-wrap gap-2 text-xs">
            {["7 个既有管理域", "5 类数据来源", "不复制 session / identities / applications", "报名门户保持独立", "不新增全局 Task 真相源"].map(item => (
              <span key={item} className="rounded-full bg-white/10 px-3 py-1.5">{item}</span>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-container border border-border-subtle bg-surface p-5"><p className="text-3xl font-semibold text-text-primary">{adminDomains.length}</p><p className="mt-1 text-sm text-text-secondary">既有管理域</p></div>
          <div className="rounded-container border border-border-subtle bg-surface p-5"><p className="text-3xl font-semibold text-text-primary">{Object.keys(sourceMeta).length}</p><p className="mt-1 text-sm text-text-secondary">统一来源标签</p></div>
          <div className="rounded-container border border-border-subtle bg-surface p-5"><p className="text-3xl font-semibold text-text-primary">{appPcDataMap.length}</p><p className="mt-1 text-sm text-text-secondary">App 接入入口组</p></div>
          <div className="rounded-container border border-border-subtle bg-surface p-5"><p className="text-3xl font-semibold text-text-primary">0</p><p className="mt-1 text-sm text-text-secondary">新增全局 Task 真相源</p></div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <div className="rounded-container border border-border-subtle bg-surface p-5">
          <div className="flex items-center gap-2">
            <UserRoundCog size={19} className="text-text-brand" aria-hidden="true" />
            <h2 className="font-semibold text-text-primary">当前 Role + Module + Data Scope</h2>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-control bg-surface-subtle p-3"><p className="text-xs text-text-tertiary">Role</p><p className="mt-1 text-sm font-semibold text-text-primary">{currentOperatorContext.role}</p></div>
            <div className="rounded-control bg-surface-subtle p-3"><p className="text-xs text-text-tertiary">Module Permission</p><p className="mt-1 text-sm font-semibold text-text-primary">{currentOperatorContext.modulePermission}</p></div>
            <div className="rounded-control bg-surface-subtle p-3"><p className="text-xs text-text-tertiary">Data Scope</p><p className="mt-1 text-sm font-semibold text-text-primary">{currentOperatorContext.dataScope}</p></div>
          </div>
          <p className="mt-3 text-xs leading-5 text-text-secondary">{currentOperatorContext.note}</p>
        </div>
        <div className="rounded-container border border-warning bg-warning-bg p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle size={19} className="mt-0.5 shrink-0 text-warning-text" aria-hidden="true" />
            <div>
              <h2 className="font-semibold text-warning-text">Account stable ID 仍是明确缺口</h2>
              <p className="mt-2 text-sm leading-6 text-warning-text">Mobile 当前 session 只有 `loggedIn / profileComplete`，没有显式 `accountId`。PC01 展示这个缺口，但不会为了后台列表好看而自己生成第二套账号 ID。</p>
            </div>
          </div>
        </div>
      </section>

      <ArchitectureMap />
      <DataSourceLegend />
      <StableIdRules />

      <section>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-brand">Domain map</p>
            <h2 className="mt-1 text-xl font-semibold text-text-primary">7 个管理域继续作为施工骨架</h2>
          </div>
          <p className="hidden text-sm text-text-tertiary md:block">当前 {objectCount} 个真实示例对象用于验证统一 Pattern，不代表完整 CRUD。</p>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {adminDomains.map(domain => {
            const Icon = domainIcons[domain.id] ?? Database;
            return (
              <Link key={domain.id} to={`/admin/${domain.id}`} className="group rounded-container border border-border-subtle bg-surface p-5 transition hover:-translate-y-0.5 hover:shadow-floating">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex size-10 items-center justify-center rounded-control bg-surface-subtle text-text-brand"><Icon size={20} aria-hidden="true" /></div>
                  <ChevronRight size={18} className="text-text-tertiary transition group-hover:translate-x-0.5" aria-hidden="true" />
                </div>
                <p className="mt-4 text-xs font-medium text-text-tertiary">{domain.eyebrow}</p>
                <h3 className="mt-1 text-base font-semibold text-text-primary">{domain.label}</h3>
                <p className="mt-2 text-sm leading-6 text-text-secondary">{domain.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <StatusTag tone="neutral">{domain.entities.length} 类实体</StatusTag>
                  <StatusTag tone="neutral">{domain.sampleObjects.length} 个 Pattern 示例</StatusTag>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <AppPcDataMap />

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-container border border-border-subtle bg-surface p-5"><GraduationCap size={20} className="text-text-brand" aria-hidden="true" /><h3 className="mt-3 font-semibold text-text-primary">学校老师不是学生 App 角色</h3><p className="mt-2 text-sm leading-6 text-text-secondary">后续只在授权赛事 + 授权学校 Scope 内审核，不扩成独立老师 App。</p></div>
        <div className="rounded-container border border-border-subtle bg-surface p-5"><Building2 size={20} className="text-text-brand" aria-hidden="true" /><h3 className="mt-3 font-semibold text-text-primary">Organization 是统一主体</h3><p className="mt-2 text-sm leading-6 text-text-secondary">企业、学校、赛事组织方与合作机构通过稳定 Organization ID 连到赛事和资源。</p></div>
        <div className="rounded-container border border-border-subtle bg-surface p-5"><BadgeCheck size={20} className="text-text-brand" aria-hidden="true" /><h3 className="mt-3 font-semibold text-text-primary">可信事实与展示表达分开</h3><p className="mt-2 text-sm leading-6 text-text-secondary">身份、成绩、证书按权威 / Runtime 事实写入；简历表达不能覆盖这些事实。</p></div>
      </section>
    </div>
  );
}

function EntityCatalog({ domain }: { domain: AdminDomain }) {
  return (
    <section className="rounded-container border border-border-subtle bg-surface">
      <div className="border-b border-border-subtle px-5 py-4">
        <h2 className="font-semibold text-text-primary">实体契约</h2>
        <p className="mt-1 text-xs text-text-tertiary">每类对象先固定 ID、来源、状态、App consumer 与保留规则，再进入后续 CRUD。</p>
      </div>
      <div className="divide-y divide-border-subtle">
        {domain.entities.map(entity => {
          const meta = statusMeta[entity.status];
          return (
            <div key={entity.name} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <strong className="font-mono text-sm text-text-primary">{entity.name}</strong>
                    <StatusTag tone={kindTone[entity.kind]}>{entity.kind}</StatusTag>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-text-secondary">{entity.description}</p>
                </div>
                <StatusTag tone={meta.tone}>{meta.label}</StatusTag>
              </div>
              <div className="mt-4 grid gap-3 text-xs md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-control bg-surface-subtle p-3">
                  <span className="text-text-tertiary">Stable ID</span>
                  <div className="mt-2"><StableId field={entity.idField} value="…" /></div>
                </div>
                <div className="rounded-control bg-surface-subtle p-3">
                  <span className="text-text-tertiary">数据来源</span>
                  <div className="mt-2 flex flex-wrap gap-1.5">{entity.sources.map(source => <SourceTag source={source} key={source} />)}</div>
                </div>
                <div className="rounded-control bg-surface-subtle p-3">
                  <span className="text-text-tertiary">当前状态语义</span>
                  <p className="mt-1 font-medium leading-5 text-text-primary">{entity.states.length ? entity.states.join(" · ") : "不新增独立状态"}</p>
                </div>
                <div className="rounded-control bg-surface-subtle p-3">
                  <span className="text-text-tertiary">保留策略</span>
                  <p className="mt-1 font-medium leading-5 text-text-primary">{entity.retention}</p>
                </div>
              </div>
              <div className="mt-3 grid gap-3 text-xs md:grid-cols-2">
                <div className="rounded-control bg-surface-subtle p-3"><span className="text-text-tertiary">写入责任</span><p className="mt-1 font-medium text-text-primary">{entity.writeBy}</p></div>
                <div className="rounded-control bg-surface-subtle p-3"><span className="text-text-tertiary">App 消费位置</span><p className="mt-1 font-medium text-text-primary">{entity.mobileConsumers.join(" · ")}</p></div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ObjectListPattern({ domain }: { domain: AdminDomain }) {
  return (
    <section className="rounded-container border border-border-subtle bg-surface" aria-labelledby="object-list-title">
      <div className="border-b border-border-subtle px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id="object-list-title" className="font-semibold text-text-primary">统一对象列表 Pattern</h2>
            <p className="mt-1 text-xs text-text-tertiary">不是完整 CRUD；只用当前真实 App 对象验证“ID → 状态 → 来源 → 责任 → consumer → 关系 → 保留”是否能追溯。</p>
          </div>
          <StatusTag tone="neutral">{domain.sampleObjects.length} 个示例</StatusTag>
        </div>
      </div>
      {domain.sampleObjects.length ? (
        <div className="divide-y divide-border-subtle">
          {domain.sampleObjects.map(record => (
            <Link key={record.key} to={`/admin/${domain.id}/objects/${record.key}`} className="block p-5 transition hover:bg-surface-subtle">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <strong className="font-mono text-xs text-text-tertiary">{record.entity}</strong>
                    <SourceTag source={record.source} />
                  </div>
                  <h3 className="mt-2 text-base font-semibold text-text-primary">{record.name}</h3>
                  <div className="mt-2"><StableId field={record.stableIdField} value={record.stableId} /></div>
                </div>
                <ChevronRight size={18} className="text-text-tertiary" aria-hidden="true" />
              </div>
              <div className="mt-4 grid gap-3 text-xs md:grid-cols-3">
                <div className="rounded-control bg-background p-3"><span className="text-text-tertiary">业务状态</span><p className="mt-1 font-medium leading-5 text-text-primary">{record.businessState}</p></div>
                <div className="rounded-control bg-background p-3"><span className="text-text-tertiary">责任人</span><p className="mt-1 font-medium leading-5 text-text-primary">{record.owner}</p></div>
                <div className="rounded-control bg-background p-3"><span className="text-text-tertiary">App consumer</span><p className="mt-1 font-medium leading-5 text-text-primary">{record.mobileConsumers.join(" · ")}</p></div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="p-5">
          <div className="rounded-control bg-surface-subtle p-4">
            <p className="text-sm font-medium text-text-primary">PC01 只固定这个域的统一 Pattern</p>
            <p className="mt-1 text-xs leading-5 text-text-secondary">没有足够的当前 App stable id / 真实对象时不硬造示例；具体对象由后续业务卡接入。</p>
          </div>
        </div>
      )}
    </section>
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
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-brand">{domain.eyebrow}</p>
              <h1 className="mt-1 text-2xl font-semibold text-text-primary">{domain.label}</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">{domain.description}</p>
            </div>
          </div>
          <Link to="/admin" className="text-sm font-medium text-text-brand">返回总览</Link>
        </div>
        <div className="mt-5 rounded-control bg-info-bg px-4 py-3 text-sm leading-6 text-info-text"><strong>责任边界：</strong>{domain.responsibility}</div>
      </section>

      <ObjectListPattern domain={domain} />

      <section className="grid gap-4 xl:grid-cols-[1.55fr_0.85fr]">
        <EntityCatalog domain={domain} />
        <div className="space-y-4">
          <div className="rounded-container border border-border-subtle bg-surface p-5">
            <div className="flex items-center gap-2"><Network size={18} className="text-text-brand" aria-hidden="true" /><h2 className="font-semibold text-text-primary">关键关系</h2></div>
            <div className="mt-4 space-y-2">{domain.relations.map(relation => <div key={relation} className="rounded-control bg-surface-subtle px-3 py-2.5 text-sm text-text-secondary">{relation}</div>)}</div>
          </div>
          <div className="rounded-container border border-border-subtle bg-surface p-5">
            <div className="flex items-center gap-2"><Settings2 size={18} className="text-text-brand" aria-hidden="true" /><h2 className="font-semibold text-text-primary">后续业务卡最低动作</h2></div>
            <div className="mt-4 space-y-3">{domain.minimumActions.map((action, index) => <div key={action} className="flex gap-3 text-sm text-text-secondary"><span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-surface-subtle text-xs font-semibold text-text-brand">{index + 1}</span><span className="pt-0.5">{action}</span></div>)}</div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ObjectDetail({ domain, record }: { domain: AdminDomain; record: AdminObjectRecord }) {
  return (
    <div className="space-y-6">
      <section className="rounded-container border border-border-subtle bg-surface p-6 lg:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link to={`/admin/${domain.id}`} className="inline-flex items-center gap-1 text-sm font-medium text-text-brand"><ArrowLeft size={15} aria-hidden="true" />返回{domain.label}</Link>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-semibold text-text-tertiary">{record.entity}</span>
              <SourceTag source={record.source} />
            </div>
            <h1 className="mt-2 max-w-4xl text-2xl font-semibold leading-8 text-text-primary">{record.name}</h1>
            <div className="mt-3"><StableId field={record.stableIdField} value={record.stableId} /></div>
          </div>
          <Link to={`/admin/${domain.id}/objects/${record.key}/edit`} className="inline-flex min-h-11 items-center gap-2 rounded-control bg-primary-container px-4 text-sm font-semibold text-text-brand">
            <Pencil size={16} aria-hidden="true" />
            编辑 Pattern
          </Link>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-container border border-border-subtle bg-surface p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-tertiary">当前业务状态</p>
          <p className="mt-2 text-sm font-semibold leading-6 text-text-primary">{record.businessState}</p>
          <p className="mt-3 text-xs leading-5 text-text-secondary">只展示 App 已有状态语义；“—”表示该主数据当前没有独立业务状态，不补造一个。</p>
        </div>
        <div className="rounded-container border border-border-subtle bg-surface p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-tertiary">数据来源</p>
          <div className="mt-2"><SourceTag source={record.source} /></div>
          <p className="mt-3 text-xs leading-5 text-text-secondary">{record.sourceDetail}</p>
        </div>
        <div className="rounded-container border border-border-subtle bg-surface p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-tertiary">责任</p>
          <p className="mt-2 text-sm font-semibold text-text-primary">{record.owner}</p>
          <p className="mt-2 text-xs leading-5 text-text-secondary">可修改：{record.editor}</p>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <div className="rounded-container border border-border-subtle bg-surface p-5">
          <div className="flex items-center gap-2"><Route size={18} className="text-text-brand" aria-hidden="true" /><h2 className="font-semibold text-text-primary">App 消费位置</h2></div>
          <div className="mt-4 flex flex-wrap gap-2">{record.mobileConsumers.map(route => <span key={route} className="rounded-control bg-surface-subtle px-3 py-2 font-mono text-xs text-text-primary">{route}</span>)}</div>
        </div>
        <div className="rounded-container border border-border-subtle bg-surface p-5">
          <div className="flex items-center gap-2"><ShieldCheck size={18} className="text-text-brand" aria-hidden="true" /><h2 className="font-semibold text-text-primary">生命周期保留</h2></div>
          <p className="mt-4 text-sm leading-6 text-text-secondary">{record.retention}</p>
        </div>
      </section>

      <section className="rounded-container border border-border-subtle bg-surface p-5">
        <div className="flex items-center gap-2"><MapPinned size={18} className="text-text-brand" aria-hidden="true" /><h2 className="font-semibold text-text-primary">稳定业务关系</h2></div>
        {record.relations.length ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {record.relations.map(relation => (
              <Link key={`${relation.to}:${relation.stableId}`} to={relation.to} className="group rounded-control border border-border-subtle p-4 transition hover:bg-surface-subtle">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-text-primary">{relation.label}</p>
                    <p className="mt-2 font-mono text-xs text-text-tertiary">{relation.stableId}</p>
                  </div>
                  <ChevronRight size={16} className="text-text-tertiary group-hover:text-text-brand" aria-hidden="true" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="mt-4 rounded-control bg-surface-subtle p-4 text-sm text-text-secondary">当前 App 尚无足够稳定关系可展示；PC01 不为页面完整度硬造关系。</p>
        )}
      </section>
    </div>
  );
}

function EditPattern({ domain, record }: { domain: AdminDomain; record: AdminObjectRecord }) {
  const [manualReason, setManualReason] = useState("");
  return (
    <div className="space-y-6">
      <section className="rounded-container border border-border-subtle bg-surface p-6 lg:p-8">
        <Link to={`/admin/${domain.id}/objects/${record.key}`} className="inline-flex items-center gap-1 text-sm font-medium text-text-brand"><ArrowLeft size={15} aria-hidden="true" />返回对象详情</Link>
        <div className="mt-5 flex items-center gap-3">
          <Pencil size={21} className="text-text-brand" aria-hidden="true" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-tertiary">PC01 Pattern only</p>
            <h1 className="mt-1 text-2xl font-semibold text-text-primary">统一编辑 Pattern</h1>
          </div>
        </div>
        <p className="mt-3 max-w-4xl text-sm leading-6 text-text-secondary">PC01 固定编辑页面的治理边界，但不把示例表单接成真实 CRUD。后续业务卡接入保存能力时，stable ID 继续只读，人工修正必须说明原因，并明确影响的 App consumer。</p>
      </section>

      <form className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]" onSubmit={event => event.preventDefault()}>
        <div className="rounded-container border border-border-subtle bg-surface p-5 lg:p-6">
          <h2 className="font-semibold text-text-primary">业务字段区</h2>
          <div className="mt-5 space-y-5">
            <label className="block">
              <span className="text-xs font-medium text-text-secondary">Stable ID · 只读</span>
              <input data-testid="stable-id-readonly" readOnly value={`${record.stableIdField}: ${record.stableId}`} className="mt-2 min-h-11 w-full rounded-control border border-border-subtle bg-surface-subtle px-3 font-mono text-sm text-text-secondary outline-none" />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-text-secondary">展示名称 · Pattern 示例</span>
              <input defaultValue={record.name} className="mt-2 min-h-11 w-full rounded-control border border-border px-3 text-sm text-text-primary outline-none focus:border-primary" />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-text-secondary">数据来源 · 统一枚举</span>
              <select defaultValue={record.source} className="mt-2 min-h-11 w-full rounded-control border border-border bg-surface px-3 text-sm text-text-primary outline-none focus:border-primary">
                {(Object.keys(sourceMeta) as DataSource[]).map(source => <option key={source} value={source}>{source}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-medium text-text-secondary">人工修正原因</span>
              <textarea value={manualReason} onChange={event => setManualReason(event.target.value)} placeholder="仅当数据来源 / 操作为人工修正时必填；后续接入 Audit Log 与审批。" className="mt-2 min-h-28 w-full rounded-control border border-border px-3 py-2 text-sm text-text-primary outline-none focus:border-primary" />
            </label>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-container border border-border-subtle bg-surface p-5">
            <h2 className="font-semibold text-text-primary">影响面</h2>
            <p className="mt-2 text-xs leading-5 text-text-secondary">保存前必须明确哪些 App consumer 会读取这条事实。</p>
            <div className="mt-4 space-y-2">{record.mobileConsumers.map(route => <div key={route} className="rounded-control bg-surface-subtle px-3 py-2 font-mono text-xs text-text-primary">{route}</div>)}</div>
          </div>
          <div className="rounded-container border border-border-subtle bg-surface p-5">
            <h2 className="font-semibold text-text-primary">修改权限</h2>
            <p className="mt-2 text-sm leading-6 text-text-secondary">{record.editor}</p>
            <p className="mt-3 text-xs leading-5 text-text-tertiary">{currentOperatorContext.note}</p>
          </div>
          <button type="submit" disabled className="min-h-11 w-full rounded-control bg-[var(--color-disabled)] px-4 text-sm font-semibold text-[var(--color-text-disabled)]">
            PC01 不写入业务真相 · 由后续业务卡接入
          </button>
        </div>
      </form>
    </div>
  );
}

function MissingObject({ domain }: { domain: AdminDomain }) {
  return (
    <div className="rounded-container border border-border-subtle bg-surface p-8 text-center">
      <h1 className="text-xl font-semibold text-text-primary">对象不存在于 PC01 Pattern 示例</h1>
      <p className="mt-2 text-sm text-text-secondary">没有 stable id 证据的对象不会为了路由完整度被临时造出来。</p>
      <Link to={`/admin/${domain.id}`} className="mt-5 inline-flex min-h-11 items-center rounded-control bg-primary-container px-4 text-sm font-semibold text-text-brand">返回{domain.label}</Link>
    </div>
  );
}

export function AdminConsole() {
  const location = useLocation();
  const parts = location.pathname.split("/").filter(Boolean);
  const domainId = parts[1];
  const selected = adminDomains.find(domain => domain.id === domainId);

  if (!selected) return <Shell><Overview /></Shell>;

  if (parts[2] === "objects" && parts[3]) {
    const record = selected.sampleObjects.find(item => item.key === parts[3]);
    if (!record) return <Shell><MissingObject domain={selected} /></Shell>;
    if (parts[4] === "edit") return <Shell><EditPattern domain={selected} record={record} /></Shell>;
    return <Shell><ObjectDetail domain={selected} record={record} /></Shell>;
  }

  return <Shell><DomainDetail domain={selected} /></Shell>;
}

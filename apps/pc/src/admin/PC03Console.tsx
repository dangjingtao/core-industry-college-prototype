import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  CheckCircle2,
  ChevronRight,
  CircleOff,
  FileText,
  Filter,
  LayoutDashboard,
  Megaphone,
  Newspaper,
  Plus,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
  UsersRound,
} from "lucide-react";
import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { StatusTag } from "../components/ui";

type OrganizationType = "企业" | "学校" | "赛事组织方" | "合作机构";
type OpportunityStatus = "open" | "closed";
type ApplicationStatus = "submitted" | "statusUnknown" | "failed";
type ContentStatus = "draft" | "published" | "unpublished";
type ContentType = "首页 Banner" | "资讯" | "赛友内容" | "活动";
type ScopeType = "全平台" | "赛事" | "学校" | "地区";

type OrganizationRecord = {
  id: string;
  name: string;
  type: OrganizationType;
  summary: string;
  trust: string;
  source: string;
  relations: { kind: string; label: string; stableId: string; to?: string }[];
};

type OpportunityRecord = {
  id: string;
  title: string;
  organizationId: string;
  city: string;
  mode: "实习" | "校招" | "项目实践";
  summary: string;
  status: OpportunityStatus;
};

type ApplicationRecord = {
  key: string;
  opportunityId: string;
  studentLabel: string;
  status: ApplicationStatus;
  source: "Runtime";
};

type ContentRecord = {
  id: string;
  title: string;
  type: ContentType;
  provider: string;
  status: ContentStatus;
  scopeType: ScopeType;
  scopeValue: string;
};

const organizations: OrganizationRecord[] = [
  {
    id: "northstar-beauty",
    name: "北辰美妆",
    type: "企业",
    summary: "参与赛事命题、课程共建、学生权益、活动与实习机会合作的品牌主体。",
    trust: "企业可信资料已映射 Mobile CompanyBusinessInfo；可信字段按来源权限维护。",
    source: "平台配置 + 可信数据源",
    relations: [
      { kind: "赛事", label: "第十六届三创赛 · 美妆电商赛道", stableId: "sanchuang-16", to: "/admin/competitions/objects/sanchuang-16" },
      { kind: "机会", label: "品牌增长实习生", stableId: "intern-1", to: "/admin/opportunities/intern-1" },
      { kind: "课程", label: "品牌电商实战课", stableId: "brand-ecommerce" },
      { kind: "权益", label: "校园体验权益", stableId: "benefit-beauty-sample" },
      { kind: "活动", label: "品牌开放日", stableId: "activity-northstar-open-day" },
    ],
  },
  {
    id: "cloud-retail",
    name: "云栖零售实验室",
    type: "企业",
    summary: "提供零售数据实践、企业课题、课程与学生项目实践机会。",
    trust: "沿用 Mobile companyId=cloud-retail 作为统一 Organization stable value。",
    source: "平台配置",
    relations: [
      { kind: "机会", label: "商业分析实习生", stableId: "intern-2", to: "/admin/opportunities/intern-2" },
      { kind: "课程", label: "商业数据分析基础", stableId: "data-analytics" },
      { kind: "活动", label: "零售数据工作坊", stableId: "activity-retail-lab" },
    ],
  },
  {
    id: "green-chain",
    name: "青禾供应链",
    type: "企业",
    summary: "围绕绿色供应链提供赛事合作、企业实践与岗位机会。",
    trust: "沿用 Mobile companyId=green-chain；Organization 只是统一主体，不复制 Company 表。",
    source: "平台配置",
    relations: [
      { kind: "赛事", label: "绿色商业实践赛", stableId: "green-business-2026" },
      { kind: "机会", label: "供应链项目助理", stableId: "intern-3", to: "/admin/opportunities/intern-3" },
    ],
  },
  {
    id: "org-sanchuang-committee",
    name: "三创赛组委会",
    type: "赛事组织方",
    summary: "作为外部权威赛事组织主体进入统一 Organization，而不是成为后台信息架构中心。",
    trust: "赛事正式资格等权威事实仍由外部赛事来源确认。",
    source: "API 同步 / 平台配置",
    relations: [{ kind: "赛事", label: "第十六届三创赛", stableId: "sanchuang-16", to: "/admin/competitions/objects/sanchuang-16" }],
  },
  {
    id: "school-demo-gz",
    name: "广州示范高校",
    type: "学校",
    summary: "学校作为赛事传播、审核与内容供稿主体进入统一 Organization。",
    trust: "学校老师只在授权赛事 + 授权学校 Scope 内处理数据；首期没有平台直接发布权。",
    source: "平台配置",
    relations: [{ kind: "赛事 Scope", label: "第十六届三创赛 · 本校审核范围", stableId: "school-demo-gz+sanchuang-16" }],
  },
];

const initialOpportunities: OpportunityRecord[] = [
  { id: "intern-1", title: "品牌增长实习生", organizationId: "northstar-beauty", city: "广州", mode: "实习", summary: "参与校园品牌项目、内容投放与活动复盘，适合有赛事 / 项目实践经历的学生。", status: "open" },
  { id: "intern-2", title: "商业分析实习生", organizationId: "cloud-retail", city: "深圳", mode: "实习", summary: "协助零售数据整理、指标分析和项目周报。", status: "open" },
  { id: "intern-3", title: "供应链项目助理", organizationId: "green-chain", city: "佛山", mode: "项目实践", summary: "参与绿色供应链调研与企业项目协同。", status: "open" },
  { id: "closed-1", title: "校园活动运营实习生", organizationId: "northstar-beauty", city: "广州", mode: "实习", summary: "历史机会示例；关闭后保留详情与既有 Application。", status: "closed" },
];

const initialApplications: ApplicationRecord[] = [
  { key: "application-demo-a", opportunityId: "intern-1", studentLabel: "匿名学生 A", status: "submitted", source: "Runtime" },
  { key: "application-demo-b", opportunityId: "intern-1", studentLabel: "匿名学生 B", status: "statusUnknown", source: "Runtime" },
];

const initialContent: ContentRecord[] = [
  { id: "content-home-sanchuang-2026", title: "三创赛报名季", type: "首页 Banner", provider: "核心产业学院", status: "published", scopeType: "赛事", scopeValue: "sanchuang-16" },
  { id: "content-news-brand-practice", title: "品牌企业实践开放周", type: "资讯", provider: "北辰美妆供稿 / 平台发布", status: "published", scopeType: "地区", scopeValue: "广州" },
  { id: "content-story-alumni-01", title: "从校赛项目到真实业务", type: "赛友内容", provider: "学生供稿 / 平台发布", status: "draft", scopeType: "全平台", scopeValue: "全部" },
  { id: "activity-retail-lab", title: "零售数据工作坊", type: "活动", provider: "云栖零售实验室供稿 / 平台发布", status: "unpublished", scopeType: "学校", scopeValue: "广州示范高校" },
];

const targetFields = ["学校", "专业", "地区", "赛事经历", "课程完成", "证书", "比赛成绩"] as const;
const targetPreview = [
  { label: "匿名学生 A", facts: "广州示范高校 · 市场营销 · 三创赛经历", selected: true },
  { label: "匿名学生 B", facts: "广州 · 品牌电商实战课 completed", selected: true },
  { label: "匿名学生 C", facts: "三创赛历史成绩 trusted", selected: false },
];

function Pc03Shell({ children }: { children: ReactNode }) {
  const navClass = ({ isActive }: { isActive: boolean }) => `inline-flex min-h-11 items-center gap-2 rounded-control px-3 text-sm font-medium ${isActive ? "bg-primary-container text-text-brand" : "text-text-secondary hover:bg-surface-subtle"}`;
  return (
    <div className="min-h-screen bg-background text-text-primary">
      <header className="sticky top-0 z-20 border-b border-border-subtle bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1480px] flex-wrap items-center justify-between gap-3 px-5 py-3 lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-text-brand">PC03 · Operations</p>
            <p className="mt-1 text-sm font-semibold">Organization / 机会 / 内容运营</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusTag tone="info">平台运营</StatusTag>
            <StatusTag tone="neutral">不建设招聘 SaaS</StatusTag>
            <Link to="/admin" className="inline-flex min-h-11 items-center gap-2 rounded-control px-3 text-sm font-medium text-text-secondary hover:bg-surface-subtle"><LayoutDashboard size={16} />控制面总览</Link>
          </div>
        </div>
        <nav className="mx-auto flex max-w-[1480px] gap-1 overflow-x-auto px-5 pb-3 lg:px-8" aria-label="PC03 模块导航">
          <NavLink to="/admin/organizations" className={navClass}><Building2 size={17} />Organization</NavLink>
          <NavLink to="/admin/opportunities" className={navClass}><Target size={17} />机会与投递</NavLink>
          <NavLink to="/admin/content" className={navClass}><Newspaper size={17} />内容运营</NavLink>
        </nav>
      </header>
      <main className="mx-auto max-w-[1480px] p-5 lg:p-8">{children}</main>
    </div>
  );
}

function PageIntro({ eyebrow, title, description, right }: { eyebrow: string; title: string; description: string; right?: ReactNode }) {
  return (
    <section className="rounded-container border border-border-subtle bg-surface p-6 lg:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-brand">{eyebrow}</p>
          <h1 className="mt-2 text-2xl font-semibold">{title}</h1>
          <p className="mt-3 text-sm leading-6 text-text-secondary">{description}</p>
        </div>
        {right}
      </div>
    </section>
  );
}

function OrganizationList() {
  return (
    <div className="space-y-6">
      <PageIntro eyebrow="Unified subject master" title="统一 Organization 主体主数据" description="学校、企业、赛事组织方和合作机构使用同一 organizationId。Mobile 现有 companyId stable value 直接映射，不再维护互不相认的企业表 / 学校表 / 合作机构表。" right={<StatusTag tone="success">5 个主体示例</StatusTag>} />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {organizations.map(item => (
          <Link key={item.id} to={`/admin/organizations/${item.id}`} className="group rounded-container border border-border-subtle bg-surface p-5 transition hover:-translate-y-0.5 hover:shadow-floating">
            <div className="flex items-start justify-between gap-3">
              <div className="flex size-10 items-center justify-center rounded-control bg-surface-subtle text-text-brand"><Building2 size={20} /></div>
              <StatusTag tone={item.type === "企业" ? "info" : item.type === "学校" ? "success" : "neutral"}>{item.type}</StatusTag>
            </div>
            <h2 className="mt-4 text-base font-semibold">{item.name}</h2>
            <p className="mt-1 font-mono text-xs text-text-tertiary">organizationId · {item.id}</p>
            <p className="mt-3 text-sm leading-6 text-text-secondary">{item.summary}</p>
            <div className="mt-4 flex items-center justify-between text-xs text-text-tertiary"><span>{item.relations.length} 条资源 / 赛事关系</span><ChevronRight size={16} className="group-hover:text-text-brand" /></div>
          </Link>
        ))}
      </section>
      <section className="rounded-container border border-info bg-info-bg p-5 text-sm leading-6 text-info-text"><strong>边界：</strong>Organization 是后台统一主体，不等于 Mobile D08 `/me/subjects`；企业 / 学校首期都没有平台直接发布权。</section>
    </div>
  );
}

function OrganizationDetail({ id }: { id: string }) {
  const record = organizations.find(item => item.id === id);
  if (!record) return <OrganizationList />;
  return (
    <div className="space-y-6">
      <PageIntro eyebrow={record.type} title={record.name} description={record.summary} right={<Link to="/admin/organizations" className="inline-flex min-h-11 items-center gap-2 rounded-control px-3 text-sm font-medium text-text-brand"><ArrowLeft size={16} />返回主体列表</Link>} />
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-container border border-border-subtle bg-surface p-5"><p className="text-xs text-text-tertiary">Stable ID</p><p className="mt-2 font-mono text-sm font-semibold">organizationId · {record.id}</p><p className="mt-3 text-xs leading-5 text-text-secondary">Mobile Company 使用同一 stable value，不生成第二套 company key。</p></div>
        <div className="rounded-container border border-border-subtle bg-surface p-5"><p className="text-xs text-text-tertiary">来源</p><p className="mt-2 text-sm font-semibold">{record.source}</p><p className="mt-3 text-xs leading-5 text-text-secondary">可信字段按来源权限治理。</p></div>
        <div className="rounded-container border border-border-subtle bg-surface p-5"><p className="text-xs text-text-tertiary">可信边界</p><p className="mt-2 text-sm leading-6">{record.trust}</p></div>
      </section>
      <section className="rounded-container border border-border-subtle bg-surface p-5">
        <div className="flex items-center gap-2"><Sparkles size={18} className="text-text-brand" /><h2 className="font-semibold">该主体提供 / 参与的资源</h2></div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {record.relations.map(rel => {
            const body = <><div className="flex items-center justify-between gap-2"><StatusTag tone="neutral">{rel.kind}</StatusTag>{rel.to && <ChevronRight size={15} />}</div><p className="mt-3 font-semibold">{rel.label}</p><p className="mt-2 font-mono text-xs text-text-tertiary">{rel.stableId}</p></>;
            return rel.to ? <Link key={`${rel.kind}-${rel.stableId}`} to={rel.to} className="rounded-control border border-border-subtle p-4 hover:bg-surface-subtle">{body}</Link> : <div key={`${rel.kind}-${rel.stableId}`} className="rounded-control border border-border-subtle p-4">{body}</div>;
          })}
        </div>
      </section>
    </div>
  );
}

function OpportunityConsole({ selectedId }: { selectedId?: string }) {
  const [items, setItems] = useState(initialOpportunities);
  const [applications, setApplications] = useState(initialApplications);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedTargets, setSelectedTargets] = useState(() => new Set(["匿名学生 A", "匿名学生 B"]));
  const [confirmed, setConfirmed] = useState(false);
  const selected = items.find(item => item.id === selectedId) ?? items[0];
  const relatedApplications = applications.filter(item => item.opportunityId === selected.id);

  function createOpportunity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const id = String(form.get("id") ?? "").trim();
    const title = String(form.get("title") ?? "").trim();
    if (!id || !title || items.some(item => item.id === id)) return;
    setItems(current => [{ id, title, organizationId: String(form.get("organizationId")), city: String(form.get("city")), mode: "实习", summary: "PC03 原型新建机会；正式数据层接入后由 Opportunity API 持久化。", status: "open" }, ...current]);
    setShowCreate(false);
  }

  const toggleTarget = (label: string) => setSelectedTargets(current => {
    const next = new Set(current);
    next.has(label) ? next.delete(label) : next.add(label);
    setConfirmed(false);
    return next;
  });

  return (
    <div className="space-y-6">
      <PageIntro eyebrow="Opportunity distribution" title="机会管理 + App 内投递" description="PC 配置 Opportunity，规则只使用可解释事实圈选；运营确认发送范围。正式投递仍发生在 App，Application 继续是唯一平台投递事实，不建立 CandidateRecord。" right={<button type="button" onClick={() => setShowCreate(value => !value)} className="inline-flex min-h-11 items-center gap-2 rounded-control bg-primary px-4 text-sm font-semibold text-on-primary"><Plus size={16} />新建机会</button>} />
      {showCreate && <form onSubmit={createOpportunity} className="grid gap-3 rounded-container border border-border-subtle bg-surface p-5 md:grid-cols-2 xl:grid-cols-4">
        <label className="text-xs text-text-secondary">opportunityId<input name="id" required className="mt-2 min-h-11 w-full rounded-control border border-border px-3 text-sm" placeholder="例如 campus-ops-2026" /></label>
        <label className="text-xs text-text-secondary">标题<input name="title" required className="mt-2 min-h-11 w-full rounded-control border border-border px-3 text-sm" /></label>
        <label className="text-xs text-text-secondary">来源 Organization<select name="organizationId" className="mt-2 min-h-11 w-full rounded-control border border-border bg-surface px-3 text-sm">{organizations.filter(item => item.type === "企业" || item.type === "合作机构").map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        <label className="text-xs text-text-secondary">地区<input name="city" defaultValue="广州" className="mt-2 min-h-11 w-full rounded-control border border-border px-3 text-sm" /></label>
        <div className="md:col-span-2 xl:col-span-4 flex justify-end"><button type="submit" className="min-h-11 rounded-control bg-primary-container px-4 text-sm font-semibold text-text-brand">创建为 open</button></div>
      </form>}

      <section className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-container border border-border-subtle bg-surface">
          <div className="border-b border-border-subtle p-4"><h2 className="font-semibold">Opportunity</h2><p className="mt-1 text-xs text-text-tertiary">沿用 Mobile stable id 与 open / closed。</p></div>
          <div className="divide-y divide-border-subtle">{items.map(item => <Link key={item.id} to={`/admin/opportunities/${item.id}`} className={`block p-4 ${item.id === selected.id ? "bg-surface-subtle" : "hover:bg-surface-subtle"}`}><div className="flex items-start justify-between gap-2"><div><p className="font-semibold">{item.title}</p><p className="mt-1 font-mono text-xs text-text-tertiary">{item.id} · {item.organizationId}</p></div><StatusTag tone={item.status === "open" ? "success" : "neutral"}>{item.status}</StatusTag></div></Link>)}</div>
        </div>
        <div className="space-y-4">
          <div className="rounded-container border border-border-subtle bg-surface p-5">
            <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-mono text-xs text-text-tertiary">opportunityId · {selected.id}</p><h2 className="mt-2 text-xl font-semibold">{selected.title}</h2><p className="mt-2 text-sm leading-6 text-text-secondary">{selected.summary}</p></div><button data-testid="opportunity-toggle" type="button" onClick={() => setItems(current => current.map(item => item.id === selected.id ? { ...item, status: item.status === "open" ? "closed" : "open" } : item))} className="inline-flex min-h-11 items-center gap-2 rounded-control bg-primary-container px-4 text-sm font-semibold text-text-brand">{selected.status === "open" ? <CircleOff size={16} /> : <CheckCircle2 size={16} />}{selected.status === "open" ? "下架机会" : "重新上架"}</button></div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3 text-xs"><div className="rounded-control bg-surface-subtle p-3"><span className="text-text-tertiary">来源主体</span><p className="mt-1 font-mono font-semibold">{selected.organizationId}</p></div><div className="rounded-control bg-surface-subtle p-3"><span className="text-text-tertiary">地区</span><p className="mt-1 font-semibold">{selected.city}</p></div><div className="rounded-control bg-surface-subtle p-3"><span className="text-text-tertiary">类型</span><p className="mt-1 font-semibold">{selected.mode}</p></div></div>
          </div>

          <div className="rounded-container border border-border-subtle bg-surface p-5">
            <div className="flex items-center gap-2"><Filter size={18} className="text-text-brand" /><h2 className="font-semibold">可解释字段圈选 → 运营确认</h2></div>
            <div className="mt-4 flex flex-wrap gap-2">{targetFields.map(field => <span key={field} className="rounded-full bg-surface-subtle px-3 py-1.5 text-xs font-medium">{field}</span>)}</div>
            <p className="mt-3 text-xs leading-5 text-text-secondary">这里只展示规则命中的临时发送范围，不保存人才评分，也不形成候选人 CRM。</p>
            <div className="mt-4 space-y-2">{targetPreview.map(row => <button type="button" key={row.label} onClick={() => toggleTarget(row.label)} className="flex w-full items-center justify-between gap-3 rounded-control border border-border-subtle p-3 text-left"><div><p className="text-sm font-semibold">{row.label}</p><p className="mt-1 text-xs text-text-secondary">{row.facts}</p></div><StatusTag tone={selectedTargets.has(row.label) ? "success" : "neutral"}>{selectedTargets.has(row.label) ? "发送" : "排除"}</StatusTag></button>)}</div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-text-tertiary">当前临时范围：{selectedTargets.size} 人；允许运营手工增删。</p><button type="button" onClick={() => setConfirmed(true)} className="inline-flex min-h-11 items-center gap-2 rounded-control bg-primary px-4 text-sm font-semibold text-on-primary"><Send size={16} />确认发送范围</button></div>
            {confirmed && <p data-testid="audience-confirmed" className="mt-3 rounded-control bg-success-bg px-3 py-2 text-sm text-success-text">发送范围已由运营确认；正式发送服务接入时只提交名单引用，不生成 CandidateRecord。</p>}
          </div>
        </div>
      </section>

      <section className="rounded-container border border-border-subtle bg-surface">
        <div className="border-b border-border-subtle p-5"><div className="flex items-center gap-2"><UsersRound size={18} className="text-text-brand" /><h2 className="font-semibold">Application 状态回流</h2></div><p className="mt-1 text-xs text-text-tertiary">App 内投递 → Application Runtime → PC 运营维护 → App 回流。这里不创建候选人档案。</p></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-surface-subtle text-xs text-text-secondary"><tr><th className="p-3">投递事实</th><th className="p-3">机会</th><th className="p-3">学生展示</th><th className="p-3">来源</th><th className="p-3">App 对齐状态</th></tr></thead><tbody>{relatedApplications.length ? relatedApplications.map(app => <tr key={app.key} className="border-t border-border-subtle"><td className="p-3 font-mono text-xs">Application</td><td className="p-3 font-mono text-xs">{app.opportunityId}</td><td className="p-3">{app.studentLabel}</td><td className="p-3"><StatusTag tone="neutral">Runtime</StatusTag></td><td className="p-3"><select aria-label={`更新 ${app.studentLabel} Application 状态`} value={app.status} onChange={event => setApplications(current => current.map(item => item.key === app.key ? { ...item, status: event.target.value as ApplicationStatus } : item))} className="min-h-10 rounded-control border border-border bg-surface px-2 text-sm"><option value="submitted">submitted</option><option value="statusUnknown">statusUnknown</option><option value="failed">failed</option></select></td></tr>) : <tr><td colSpan={5} className="p-5 text-text-secondary">当前机会尚无 Application；机会关闭也不会删除历史投递。</td></tr>}</tbody></table></div>
      </section>
    </div>
  );
}

function ContentConsole() {
  const [items, setItems] = useState(initialContent);
  const [showCreate, setShowCreate] = useState(false);
  function createContent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const id = String(form.get("id") ?? "").trim();
    const title = String(form.get("title") ?? "").trim();
    if (!id || !title || items.some(item => item.id === id)) return;
    setItems(current => [{ id, title, type: String(form.get("type")) as ContentType, provider: "核心产业学院运营", status: "draft", scopeType: String(form.get("scopeType")) as ScopeType, scopeValue: String(form.get("scopeValue") || "全部") }, ...current]);
    setShowCreate(false);
  }
  return (
    <div className="space-y-6">
      <PageIntro eyebrow="Platform publishing" title="首页 Banner / 资讯 / 赛友内容 / 活动" description="首期全部由核心产业学院运营正式发布。学校、企业、合作方可以供稿，但没有直接发布权；定向范围只做到赛事、学校、地区，不做复杂标签推荐。" right={<button type="button" onClick={() => setShowCreate(value => !value)} className="inline-flex min-h-11 items-center gap-2 rounded-control bg-primary px-4 text-sm font-semibold text-on-primary"><Plus size={16} />新建内容</button>} />
      {showCreate && <form onSubmit={createContent} className="grid gap-3 rounded-container border border-border-subtle bg-surface p-5 md:grid-cols-2 xl:grid-cols-5"><label className="text-xs text-text-secondary">contentId<input name="id" required className="mt-2 min-h-11 w-full rounded-control border border-border px-3 text-sm" /></label><label className="text-xs text-text-secondary">标题<input name="title" required className="mt-2 min-h-11 w-full rounded-control border border-border px-3 text-sm" /></label><label className="text-xs text-text-secondary">类型<select name="type" className="mt-2 min-h-11 w-full rounded-control border border-border bg-surface px-3 text-sm"><option>首页 Banner</option><option>资讯</option><option>赛友内容</option><option>活动</option></select></label><label className="text-xs text-text-secondary">Scope<select name="scopeType" className="mt-2 min-h-11 w-full rounded-control border border-border bg-surface px-3 text-sm"><option>全平台</option><option>赛事</option><option>学校</option><option>地区</option></select></label><label className="text-xs text-text-secondary">Scope 值<input name="scopeValue" defaultValue="全部" className="mt-2 min-h-11 w-full rounded-control border border-border px-3 text-sm" /></label><div className="md:col-span-2 xl:col-span-5 flex justify-end"><button type="submit" className="min-h-11 rounded-control bg-primary-container px-4 text-sm font-semibold text-text-brand">创建为 draft</button></div></form>}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{items.map(item => <article key={item.id} className="rounded-container border border-border-subtle bg-surface p-5"><div className="flex items-start justify-between gap-2"><div className="flex size-9 items-center justify-center rounded-control bg-surface-subtle text-text-brand">{item.type === "首页 Banner" ? <Megaphone size={18} /> : item.type === "资讯" ? <Newspaper size={18} /> : item.type === "活动" ? <Sparkles size={18} /> : <FileText size={18} />}</div><StatusTag tone={item.status === "published" ? "success" : item.status === "draft" ? "warning" : "neutral"}>{item.status}</StatusTag></div><p className="mt-4 text-xs font-medium text-text-tertiary">{item.type}</p><h2 className="mt-1 font-semibold">{item.title}</h2><p className="mt-2 font-mono text-xs text-text-tertiary">{item.id}</p><div className="mt-4 rounded-control bg-surface-subtle p-3 text-xs"><p className="text-text-tertiary">定向范围</p><p className="mt-1 font-semibold">{item.scopeType} · {item.scopeValue}</p></div><p className="mt-3 text-xs leading-5 text-text-secondary">供稿 / 来源：{item.provider}</p><button type="button" aria-label={`${item.title} ${item.status === "published" ? "下架" : "发布"}`} onClick={() => setItems(current => current.map(row => row.id === item.id ? { ...row, status: row.status === "published" ? "unpublished" : "published" } : row))} className="mt-4 min-h-10 w-full rounded-control bg-primary-container px-3 text-sm font-semibold text-text-brand">{item.status === "published" ? "下架" : "由平台运营发布"}</button></article>)}</section>
      <section className="grid gap-4 lg:grid-cols-2"><div className="rounded-container border border-border-subtle bg-surface p-5"><div className="flex items-center gap-2"><ShieldCheck size={18} className="text-text-brand" /><h2 className="font-semibold">发布权限</h2></div><p className="mt-3 text-sm leading-6 text-text-secondary">企业 / 学校 / 合作方：供稿。核心产业学院运营：编辑、定向、正式发布 / 下架。首期不开放合作方直发。</p></div><div className="rounded-container border border-border-subtle bg-surface p-5"><div className="flex items-center gap-2"><BadgeCheck size={18} className="text-text-brand" /><h2 className="font-semibold">App consumer</h2></div><p className="mt-3 text-sm leading-6 text-text-secondary">首页 Banner → `/home`；资讯 → `/news`；赛友内容 → `/stories`；活动进入首页 / 权益 / 本地运营入口。Placement 只负责展示范围，不复制内容本体。</p></div></section>
    </div>
  );
}

export function PC03Console() {
  const location = useLocation();
  const parts = useMemo(() => location.pathname.split("/").filter(Boolean), [location.pathname]);
  const module = parts[1];
  const objectId = parts[2];
  let body: ReactNode;
  if (module === "organizations") body = objectId ? <OrganizationDetail id={objectId} /> : <OrganizationList />;
  else if (module === "content") body = <ContentConsole />;
  else body = <OpportunityConsole selectedId={objectId} />;
  return <Pc03Shell>{body}</Pc03Shell>;
}

import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  CheckCircle2,
  ChevronRight,
  CircleOff,
  FileText,
  Filter,
  Megaphone,
  Newspaper,
  Plus,
  Send,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { StatusTag } from "../components/ui";
import { sourceMeta, type DataSource } from "./data";
import {
  pc03Organizations,
  usePC03State,
  type ApplicationStatus,
  type OpportunityRecord,
} from "./PC03State";

type ContentStatus = "draft" | "published" | "unpublished";
type ContentType = "首页 Banner" | "资讯" | "赛友内容" | "活动";
type ScopeType = "全平台" | "赛事" | "学校" | "地区";
type ContentScope =
  | { type: "全平台" }
  | { type: "赛事"; competitionId: string; label: string }
  | { type: "学校"; organizationId: string; label: string }
  | { type: "地区"; region: string };

type ContentRecord = {
  id: string;
  title: string;
  type: ContentType;
  provider: string;
  status: ContentStatus;
  scope: ContentScope;
};

const competitionOptions = [
  { id: "sanchuang-16", label: "第十六届三创赛" },
  { id: "innovation-cup-2026", label: "2026 青年品牌创新挑战赛" },
  { id: "green-business-2026", label: "绿色商业实践赛" },
] as const;

const initialContent: ContentRecord[] = [
  { id: "content-home-sanchuang-2026", title: "三创赛报名季", type: "首页 Banner", provider: "核心产业学院", status: "published", scope: { type: "赛事", competitionId: "sanchuang-16", label: "第十六届三创赛" } },
  { id: "content-news-brand-practice", title: "品牌企业实践开放周", type: "资讯", provider: "北辰美妆供稿 / 平台发布", status: "published", scope: { type: "地区", region: "广州" } },
  { id: "content-story-alumni-01", title: "从校赛项目到真实业务", type: "赛友内容", provider: "学生供稿 / 平台发布", status: "draft", scope: { type: "全平台" } },
  { id: "activity-retail-lab", title: "零售数据工作坊", type: "活动", provider: "云栖零售实验室供稿 / 平台发布", status: "unpublished", scope: { type: "学校", organizationId: "school-demo-gz", label: "广州示范高校" } },
];

const targetFields = ["学校", "专业", "地区", "赛事经历", "课程完成", "证书", "比赛成绩"] as const;
const targetPreview = [
  { label: "匿名学生 A", facts: "广州示范高校 · 市场营销 · 三创赛经历" },
  { label: "匿名学生 B", facts: "广州 · 品牌电商实战课 completed" },
  { label: "匿名学生 C", facts: "三创赛历史成绩 trusted" },
];

function SourceTag({ source }: { source: DataSource }) {
  return <StatusTag tone={sourceMeta[source].tone}>{source}</StatusTag>;
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
        {pc03Organizations.map(item => (
          <Link key={item.id} to={`/admin/organizations/${item.id}`} className="group rounded-container border border-border-subtle bg-surface p-5 transition hover:-translate-y-0.5 hover:shadow-floating">
            <div className="flex items-start justify-between gap-3">
              <div className="flex size-10 items-center justify-center rounded-control bg-surface-subtle text-text-brand"><Building2 size={20} /></div>
              <StatusTag tone={item.type === "企业" ? "info" : item.type === "学校" ? "success" : "neutral"}>{item.type}</StatusTag>
            </div>
            <h2 className="mt-4 text-base font-semibold">{item.name}</h2>
            <p className="mt-1 font-mono text-xs text-text-tertiary">organizationId · {item.id}</p>
            <p className="mt-3 text-sm leading-6 text-text-secondary">{item.summary}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">{item.sources.map(source => <SourceTag key={source} source={source} />)}</div>
            <div className="mt-4 flex items-center justify-between text-xs text-text-tertiary"><span>{item.relations.length} 条资源 / 赛事关系</span><ChevronRight size={16} className="group-hover:text-text-brand" /></div>
          </Link>
        ))}
      </section>
      <section className="rounded-container border border-info bg-info-bg p-5 text-sm leading-6 text-info-text"><strong>边界：</strong>Organization 是后台统一主体，不等于 Mobile D08 `/me/subjects`；企业 / 学校首期都没有平台直接发布权。</section>
    </div>
  );
}

function OrganizationDetail({ id }: { id: string }) {
  const record = pc03Organizations.find(item => item.id === id);
  if (!record) return <OrganizationList />;
  return (
    <div className="space-y-6">
      <PageIntro eyebrow={record.type} title={record.name} description={record.summary} right={<Link to="/admin/organizations" className="inline-flex min-h-11 items-center gap-2 rounded-control px-3 text-sm font-medium text-text-brand"><ArrowLeft size={16} />返回主体列表</Link>} />
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-container border border-border-subtle bg-surface p-5"><p className="text-xs text-text-tertiary">Stable ID</p><p className="mt-2 font-mono text-sm font-semibold">organizationId · {record.id}</p><p className="mt-3 text-xs leading-5 text-text-secondary">Mobile Company 使用同一 stable value，不生成第二套 company key。</p></div>
        <div className="rounded-container border border-border-subtle bg-surface p-5"><p className="text-xs text-text-tertiary">来源</p><div className="mt-2 flex flex-wrap gap-1.5">{record.sources.map(source => <SourceTag key={source} source={source} />)}</div><p className="mt-3 text-xs leading-5 text-text-secondary">只使用 PC01 canonical 五类来源；多来源以多个标签表达。</p></div>
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
  const { opportunities, applications, createOpportunity, toggleOpportunityStatus, updateApplicationStatus } = usePC03State();
  const [showCreate, setShowCreate] = useState(false);
  const [selectedTargets, setSelectedTargets] = useState(() => new Set(["匿名学生 A", "匿名学生 B"]));
  const [confirmed, setConfirmed] = useState(false);
  const selected = opportunities.find(item => item.id === selectedId) ?? opportunities[0];
  const relatedApplications = applications.filter(item => item.opportunityId === selected.id);

  function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const id = String(form.get("id") ?? "").trim();
    const title = String(form.get("title") ?? "").trim();
    const skills = String(form.get("skills") ?? "").split(/[,，]/).map(item => item.trim()).filter(Boolean);
    if (!id || !title) return;
    const created = createOpportunity({
      id,
      title,
      organizationId: String(form.get("organizationId")),
      city: String(form.get("city")),
      mode: String(form.get("mode")) as OpportunityRecord["mode"],
      summary: String(form.get("summary")),
      skills,
      status: "open",
    });
    if (created) setShowCreate(false);
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
      {showCreate && <form onSubmit={create} className="grid gap-3 rounded-container border border-border-subtle bg-surface p-5 md:grid-cols-2 xl:grid-cols-4">
        <label className="text-xs text-text-secondary">opportunityId<input name="id" required className="mt-2 min-h-11 w-full rounded-control border border-border px-3 text-sm" placeholder="例如 campus-ops-2026" /></label>
        <label className="text-xs text-text-secondary">标题<input name="title" required className="mt-2 min-h-11 w-full rounded-control border border-border px-3 text-sm" /></label>
        <label className="text-xs text-text-secondary">来源 Organization<select name="organizationId" className="mt-2 min-h-11 w-full rounded-control border border-border bg-surface px-3 text-sm">{pc03Organizations.filter(item => item.type === "企业" || item.type === "合作机构").map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        <label className="text-xs text-text-secondary">地区<input name="city" defaultValue="广州" className="mt-2 min-h-11 w-full rounded-control border border-border px-3 text-sm" /></label>
        <label className="text-xs text-text-secondary">类型<select name="mode" className="mt-2 min-h-11 w-full rounded-control border border-border bg-surface px-3 text-sm"><option>实习</option><option>校招</option><option>项目实践</option></select></label>
        <label className="text-xs text-text-secondary">技能标签 skills[]<input name="skills" defaultValue="沟通, 执行" className="mt-2 min-h-11 w-full rounded-control border border-border px-3 text-sm" placeholder="逗号分隔" /></label>
        <label className="text-xs text-text-secondary md:col-span-2">摘要<input name="summary" defaultValue="PC03 原型新建机会；正式数据层接入后由 Opportunity API 持久化。" className="mt-2 min-h-11 w-full rounded-control border border-border px-3 text-sm" /></label>
        <div className="md:col-span-2 xl:col-span-4 flex justify-end"><button type="submit" className="min-h-11 rounded-control bg-primary-container px-4 text-sm font-semibold text-text-brand">创建为 open</button></div>
      </form>}

      <section className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-container border border-border-subtle bg-surface">
          <div className="border-b border-border-subtle p-4"><h2 className="font-semibold">Opportunity</h2><p className="mt-1 text-xs text-text-tertiary">沿用 Mobile stable id、skills[] 与 open / closed。</p></div>
          <div className="divide-y divide-border-subtle">{opportunities.map(item => <Link key={item.id} to={`/admin/opportunities/${item.id}`} className={`block p-4 ${item.id === selected.id ? "bg-surface-subtle" : "hover:bg-surface-subtle"}`}><div className="flex items-start justify-between gap-2"><div><p className="font-semibold">{item.title}</p><p className="mt-1 font-mono text-xs text-text-tertiary">{item.id} · {item.organizationId}</p><p className="mt-2 text-xs text-text-secondary">{item.skills.join(" · ")}</p></div><StatusTag tone={item.status === "open" ? "success" : "neutral"}>{item.status}</StatusTag></div></Link>)}</div>
        </div>
        <div className="space-y-4">
          <div className="rounded-container border border-border-subtle bg-surface p-5">
            <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-mono text-xs text-text-tertiary">opportunityId · {selected.id}</p><h2 className="mt-2 text-xl font-semibold">{selected.title}</h2><p className="mt-2 text-sm leading-6 text-text-secondary">{selected.summary}</p><div className="mt-3 flex flex-wrap gap-2" aria-label="技能标签">{selected.skills.map(skill => <StatusTag key={skill} tone="neutral">{skill}</StatusTag>)}</div></div><button data-testid="opportunity-toggle" type="button" onClick={() => toggleOpportunityStatus(selected.id)} className="inline-flex min-h-11 items-center gap-2 rounded-control bg-primary-container px-4 text-sm font-semibold text-text-brand">{selected.status === "open" ? <CircleOff size={16} /> : <CheckCircle2 size={16} />}{selected.status === "open" ? "下架机会" : "重新上架"}</button></div>
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
        <div className="border-b border-border-subtle p-5"><div className="flex items-center gap-2"><UsersRound size={18} className="text-text-brand" /><h2 className="font-semibold">Application 状态回流</h2></div><p className="mt-1 text-xs text-text-tertiary">App 内投递 → Application Runtime → PC 运营维护 → App 回流。首期只允许当前 `/applications` consumer 能表达的 submitted / statusUnknown。</p></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-surface-subtle text-xs text-text-secondary"><tr><th className="p-3">投递事实</th><th className="p-3">机会</th><th className="p-3">学生展示</th><th className="p-3">来源</th><th className="p-3">App 对齐状态</th></tr></thead><tbody>{relatedApplications.length ? relatedApplications.map(app => <tr key={app.key} className="border-t border-border-subtle"><td className="p-3 font-mono text-xs">Application</td><td className="p-3 font-mono text-xs">{app.opportunityId}</td><td className="p-3">{app.studentLabel}</td><td className="p-3"><SourceTag source="Runtime" /></td><td className="p-3"><select aria-label={`更新 ${app.studentLabel} Application 状态`} value={app.status} onChange={event => updateApplicationStatus(app.key, event.target.value as ApplicationStatus)} className="min-h-10 rounded-control border border-border bg-surface px-2 text-sm"><option value="submitted">submitted</option><option value="statusUnknown">statusUnknown</option></select></td></tr>) : <tr><td colSpan={5} className="p-5 text-text-secondary">当前机会尚无 Application；机会关闭也不会删除历史投递。</td></tr>}</tbody></table></div>
      </section>
    </div>
  );
}

function renderScope(scope: ContentScope) {
  if (scope.type === "赛事") return <><span>赛事 · {scope.label}</span><span className="font-mono text-text-tertiary">competitionId={scope.competitionId}</span></>;
  if (scope.type === "学校") return <><span>学校 · {scope.label}</span><span className="font-mono text-text-tertiary">organizationId={scope.organizationId}</span></>;
  if (scope.type === "地区") return <span>地区 · {scope.region}</span>;
  return <span>全平台</span>;
}

function ContentConsole() {
  const [items, setItems] = useState(initialContent);
  const [showCreate, setShowCreate] = useState(false);
  const [scopeType, setScopeType] = useState<ScopeType>("全平台");
  const schoolOptions = pc03Organizations.filter(item => item.type === "学校");

  function createContent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const id = String(form.get("id") ?? "").trim();
    const title = String(form.get("title") ?? "").trim();
    if (!id || !title || items.some(item => item.id === id)) return;
    let scope: ContentScope = { type: "全平台" };
    if (scopeType === "赛事") {
      const competitionId = String(form.get("competitionId"));
      const option = competitionOptions.find(item => item.id === competitionId) ?? competitionOptions[0];
      scope = { type: "赛事", competitionId: option.id, label: option.label };
    } else if (scopeType === "学校") {
      const organizationId = String(form.get("organizationId"));
      const option = schoolOptions.find(item => item.id === organizationId) ?? schoolOptions[0];
      scope = { type: "学校", organizationId: option.id, label: option.name };
    } else if (scopeType === "地区") {
      scope = { type: "地区", region: String(form.get("region") || "广州") };
    }
    setItems(current => [{ id, title, type: String(form.get("type")) as ContentType, provider: "核心产业学院运营", status: "draft", scope }, ...current]);
    setShowCreate(false);
    setScopeType("全平台");
  }

  return (
    <div className="space-y-6">
      <PageIntro eyebrow="Platform publishing" title="首页 Banner / 资讯 / 赛友内容 / 活动" description="首期全部由核心产业学院运营正式发布。学校、企业、合作方可以供稿，但没有直接发布权；赛事和学校定向保存 stable id，地区保留明确地区值。" right={<button type="button" onClick={() => setShowCreate(value => !value)} className="inline-flex min-h-11 items-center gap-2 rounded-control bg-primary px-4 text-sm font-semibold text-on-primary"><Plus size={16} />新建内容</button>} />
      {showCreate && <form onSubmit={createContent} className="grid gap-3 rounded-container border border-border-subtle bg-surface p-5 md:grid-cols-2 xl:grid-cols-5">
        <label className="text-xs text-text-secondary">contentId<input name="id" required className="mt-2 min-h-11 w-full rounded-control border border-border px-3 text-sm" /></label>
        <label className="text-xs text-text-secondary">标题<input name="title" required className="mt-2 min-h-11 w-full rounded-control border border-border px-3 text-sm" /></label>
        <label className="text-xs text-text-secondary">类型<select name="type" className="mt-2 min-h-11 w-full rounded-control border border-border bg-surface px-3 text-sm"><option>首页 Banner</option><option>资讯</option><option>赛友内容</option><option>活动</option></select></label>
        <label className="text-xs text-text-secondary">Scope<select aria-label="Scope" value={scopeType} onChange={event => setScopeType(event.target.value as ScopeType)} className="mt-2 min-h-11 w-full rounded-control border border-border bg-surface px-3 text-sm"><option>全平台</option><option>赛事</option><option>学校</option><option>地区</option></select></label>
        {scopeType === "赛事" && <label className="text-xs text-text-secondary">赛事 stable ID<select aria-label="赛事 stable ID" name="competitionId" className="mt-2 min-h-11 w-full rounded-control border border-border bg-surface px-3 text-sm">{competitionOptions.map(item => <option key={item.id} value={item.id}>{item.label} · {item.id}</option>)}</select></label>}
        {scopeType === "学校" && <label className="text-xs text-text-secondary">学校 stable ID<select aria-label="学校 stable ID" name="organizationId" className="mt-2 min-h-11 w-full rounded-control border border-border bg-surface px-3 text-sm">{schoolOptions.map(item => <option key={item.id} value={item.id}>{item.name} · {item.id}</option>)}</select></label>}
        {scopeType === "地区" && <label className="text-xs text-text-secondary">地区<input aria-label="地区" name="region" defaultValue="广州" className="mt-2 min-h-11 w-full rounded-control border border-border px-3 text-sm" /></label>}
        <div className="md:col-span-2 xl:col-span-5 flex justify-end"><button type="submit" className="min-h-11 rounded-control bg-primary-container px-4 text-sm font-semibold text-text-brand">创建为 draft</button></div>
      </form>}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{items.map(item => <article key={item.id} className="rounded-container border border-border-subtle bg-surface p-5"><div className="flex items-start justify-between gap-2"><div className="flex size-9 items-center justify-center rounded-control bg-surface-subtle text-text-brand">{item.type === "首页 Banner" ? <Megaphone size={18} /> : item.type === "资讯" ? <Newspaper size={18} /> : item.type === "活动" ? <Sparkles size={18} /> : <FileText size={18} />}</div><StatusTag tone={item.status === "published" ? "success" : item.status === "draft" ? "warning" : "neutral"}>{item.status}</StatusTag></div><p className="mt-4 text-xs font-medium text-text-tertiary">{item.type}</p><h2 className="mt-1 font-semibold">{item.title}</h2><p className="mt-2 font-mono text-xs text-text-tertiary">{item.id}</p><div className="mt-4 flex min-h-16 flex-col gap-1 rounded-control bg-surface-subtle p-3 text-xs"><p className="text-text-tertiary">定向范围</p>{renderScope(item.scope)}</div><p className="mt-3 text-xs leading-5 text-text-secondary">供稿 / 来源：{item.provider}</p><button type="button" aria-label={`${item.title} ${item.status === "published" ? "下架" : "发布"}`} onClick={() => setItems(current => current.map(row => row.id === item.id ? { ...row, status: row.status === "published" ? "unpublished" : "published" } : row))} className="mt-4 min-h-10 w-full rounded-control bg-primary-container px-3 text-sm font-semibold text-text-brand">{item.status === "published" ? "下架" : "由平台运营发布"}</button></article>)}</section>
      <section className="grid gap-4 lg:grid-cols-2"><div className="rounded-container border border-border-subtle bg-surface p-5"><div className="flex items-center gap-2"><ShieldCheck size={18} className="text-text-brand" /><h2 className="font-semibold">发布权限</h2></div><p className="mt-3 text-sm leading-6 text-text-secondary">企业 / 学校 / 合作方：供稿。核心产业学院运营：编辑、定向、正式发布 / 下架。首期不开放合作方直发。</p></div><div className="rounded-container border border-border-subtle bg-surface p-5"><div className="flex items-center gap-2"><BadgeCheck size={18} className="text-text-brand" /><h2 className="font-semibold">App consumer</h2></div><p className="mt-3 text-sm leading-6 text-text-secondary">首页 Banner → `/home`；资讯 → `/news`；赛友内容 → `/stories`；活动进入首页 / 权益 / 本地运营入口。Placement 只负责展示范围，不复制内容本体。</p></div></section>
    </div>
  );
}

export function PC03Console() {
  const location = useLocation();
  const parts = useMemo(() => location.pathname.split("/").filter(Boolean), [location.pathname]);
  const module = parts[1];
  const objectId = parts[2];
  if (module === "organizations") return objectId ? <OrganizationDetail id={objectId} /> : <OrganizationList />;
  if (module === "content") return <ContentConsole />;
  return <OpportunityConsole selectedId={objectId} />;
}

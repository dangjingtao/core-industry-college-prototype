import { BadgeCheck, FileText, Megaphone, Newspaper, Plus, ShieldCheck, Sparkles } from "lucide-react";
import { useState, type FormEvent } from "react";
import { StatusTag } from "../components/ui";
import { pc03Organizations } from "./PC03State";

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

const statusLabel: Record<ContentStatus, string> = { draft: "草稿", published: "已发布", unpublished: "已下架" };

function contentIcon(type: ContentType) {
  if (type === "首页 Banner") return Megaphone;
  if (type === "资讯") return Newspaper;
  if (type === "活动") return Sparkles;
  return FileText;
}

function scopeLabel(scope: ContentScope) {
  if (scope.type === "赛事") return `赛事 · ${scope.label}`;
  if (scope.type === "学校") return `学校 · ${scope.label}`;
  if (scope.type === "地区") return `地区 · ${scope.region}`;
  return "全平台";
}

function technicalScope(scope: ContentScope) {
  if (scope.type === "赛事") return `competitionId=${scope.competitionId}`;
  if (scope.type === "学校") return `organizationId=${scope.organizationId}`;
  if (scope.type === "地区") return `region=${scope.region}`;
  return "scope=platform";
}

function createInternalId(type: ContentType, index: number) {
  const prefix = type === "活动" ? "activity" : "content";
  return `${prefix}-draft-${String(index).padStart(3, "0")}`;
}

export function PC03HumanContentConsole() {
  const [items, setItems] = useState(initialContent);
  const [showCreate, setShowCreate] = useState(false);
  const [scopeType, setScopeType] = useState<ScopeType>("全平台");
  const schoolOptions = pc03Organizations.filter(item => item.type === "学校");

  function createContent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") ?? "").trim();
    const type = String(form.get("type")) as ContentType;
    if (!title) return;

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

    const record: ContentRecord = {
      id: createInternalId(type, items.length + 1),
      title,
      type,
      provider: "核心产业学院运营",
      status: "draft",
      scope,
    };
    setItems(current => [record, ...current]);
    setShowCreate(false);
    setScopeType("全平台");
  }

  return (
    <div className="space-y-6">
      <section className="rounded-container border border-border-subtle bg-surface p-6 lg:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-brand">内容运营</p>
            <h1 className="mt-2 text-2xl font-semibold">内容与活动</h1>
            <p className="mt-3 text-sm leading-6 text-text-secondary">统一维护首页 Banner、资讯、赛友内容和活动。合作方可以供稿，最终发布与下架由平台运营完成。</p>
          </div>
          <button type="button" onClick={() => setShowCreate(value => !value)} className="inline-flex min-h-11 items-center gap-2 rounded-control bg-primary px-4 text-sm font-semibold text-on-primary"><Plus size={16} />新建内容</button>
        </div>
      </section>

      {showCreate && (
        <form onSubmit={createContent} className="rounded-container border border-border-subtle bg-surface p-5 lg:p-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <label className="text-xs font-medium text-text-secondary">标题<input name="title" required className="mt-2 min-h-11 w-full rounded-control border border-border px-3 text-sm" /></label>
            <label className="text-xs font-medium text-text-secondary">内容类型<select name="type" className="mt-2 min-h-11 w-full rounded-control border border-border bg-surface px-3 text-sm"><option>首页 Banner</option><option>资讯</option><option>赛友内容</option><option>活动</option></select></label>
            <label className="text-xs font-medium text-text-secondary">定向范围<select aria-label="定向范围" value={scopeType} onChange={event => setScopeType(event.target.value as ScopeType)} className="mt-2 min-h-11 w-full rounded-control border border-border bg-surface px-3 text-sm"><option>全平台</option><option>赛事</option><option>学校</option><option>地区</option></select></label>
            {scopeType === "赛事" && <label className="text-xs font-medium text-text-secondary">指定赛事<select aria-label="指定赛事" name="competitionId" className="mt-2 min-h-11 w-full rounded-control border border-border bg-surface px-3 text-sm">{competitionOptions.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>}
            {scopeType === "学校" && <label className="text-xs font-medium text-text-secondary">指定学校<select aria-label="指定学校" name="organizationId" className="mt-2 min-h-11 w-full rounded-control border border-border bg-surface px-3 text-sm">{schoolOptions.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>}
            {scopeType === "地区" && <label className="text-xs font-medium text-text-secondary">指定地区<input aria-label="指定地区" name="region" defaultValue="广州" className="mt-2 min-h-11 w-full rounded-control border border-border px-3 text-sm" /></label>}
          </div>
          <div className="mt-5 flex items-center justify-between gap-3"><p className="text-xs text-text-tertiary">新内容先保存为草稿，确认后再发布。</p><button type="submit" className="min-h-11 rounded-control bg-primary-container px-4 text-sm font-semibold text-text-brand">保存草稿</button></div>
        </form>
      )}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {items.map(item => {
          const Icon = contentIcon(item.type);
          return (
            <article key={item.id} className="rounded-container border border-border-subtle bg-surface p-5">
              <div className="flex items-start justify-between gap-2"><div className="flex size-9 items-center justify-center rounded-control bg-surface-subtle text-text-brand"><Icon size={18} /></div><StatusTag tone={item.status === "published" ? "success" : item.status === "draft" ? "warning" : "neutral"}>{statusLabel[item.status]}</StatusTag></div>
              <p className="mt-4 text-xs font-medium text-text-tertiary">{item.type}</p>
              <h2 className="mt-1 font-semibold">{item.title}</h2>
              <div className="mt-4 rounded-control bg-surface-subtle p-3 text-xs"><p className="text-text-tertiary">展示范围</p><p className="mt-1 font-medium text-text-primary">{scopeLabel(item.scope)}</p><p data-pc05-technical className="mt-2 font-mono text-text-tertiary">{technicalScope(item.scope)}</p></div>
              <p className="mt-3 text-xs leading-5 text-text-secondary">供稿 / 来源：{item.provider}</p>
              <p data-pc05-technical className="mt-2 font-mono text-xs text-text-tertiary">contentId={item.id}</p>
              <button type="button" aria-label={`${item.title} ${item.status === "published" ? "下架" : "发布"}`} onClick={() => setItems(current => current.map(row => row.id === item.id ? { ...row, status: row.status === "published" ? "unpublished" : "published" } : row))} className="mt-4 min-h-10 w-full rounded-control bg-primary-container px-3 text-sm font-semibold text-text-brand">{item.status === "published" ? "下架" : "由平台运营发布"}</button>
            </article>
          );
        })}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-container border border-border-subtle bg-surface p-5"><div className="flex items-center gap-2"><ShieldCheck size={18} className="text-text-brand" /><h2 className="font-semibold">发布权限</h2></div><p className="mt-3 text-sm leading-6 text-text-secondary">企业、学校和合作方可以供稿；核心产业学院运营负责编辑、定向、正式发布与下架。首期不开放合作方直接发布。</p></div>
        <div className="rounded-container border border-border-subtle bg-surface p-5"><div className="flex items-center gap-2"><BadgeCheck size={18} className="text-text-brand" /><h2 className="font-semibold">展示位置</h2></div><p className="mt-3 text-sm leading-6 text-text-secondary">Banner 进入首页，资讯进入资讯入口，赛友内容进入赛友内容，活动进入首页、权益或本地运营入口。</p><p data-pc05-technical className="mt-3 font-mono text-xs text-text-tertiary">/home · /news · /stories · Placement</p></div>
      </section>
    </div>
  );
}

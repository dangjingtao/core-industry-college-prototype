import { ArrowLeft, ArrowRight, Building2, School, ShieldCheck, Sparkles } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { StatusTag } from "../components/ui";
import { sourceMeta } from "./data";
import { pc03Organizations } from "./PC03State";

function relationRoute(kind: string, stableId: string, explicit?: string) {
  if (explicit) return explicit;
  if (kind === "课程") return `/admin/pc04/courses/${stableId}`;
  if (kind === "权益") return `/admin/pc04/benefits/${stableId}`;
  if (kind === "活动") return "/admin/content/operations";
  return undefined;
}

function OrganizationList() {
  return (
    <div className="space-y-6">
      <section className="rounded-container border border-border-subtle bg-surface p-6 lg:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-brand">合作网络</p>
        <h1 className="mt-2 text-2xl font-semibold">合作主体与学校</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-text-secondary">查看企业、学校、赛事组织方和合作机构当前参与了哪些赛事、课程、权益、机会与活动。默认先看业务关系，需要追溯时再展开数据说明。</p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {pc03Organizations.map(item => {
          const Icon = item.type === "学校" ? School : Building2;
          return (
            <Link key={item.id} to={`/admin/organizations/${item.id}`} className="group rounded-container border border-border-subtle bg-surface p-5 transition hover:-translate-y-0.5 hover:shadow-floating">
              <div className="flex items-start justify-between gap-3">
                <div className="flex size-10 items-center justify-center rounded-control bg-surface-subtle text-text-brand"><Icon size={20} /></div>
                <StatusTag tone={item.type === "企业" ? "info" : item.type === "学校" ? "success" : "neutral"}>{item.type}</StatusTag>
              </div>
              <h2 className="mt-4 text-base font-semibold">{item.name}</h2>
              <p className="mt-2 text-sm leading-6 text-text-secondary">{item.summary}</p>
              <div className="mt-4 flex items-center justify-between text-xs text-text-tertiary"><span>{item.relations.length} 项合作关系</span><ArrowRight size={16} className="group-hover:text-text-brand" /></div>
            </Link>
          );
        })}
      </section>
    </div>
  );
}

function OrganizationDetail({ organizationId }: { organizationId: string }) {
  const record = pc03Organizations.find(item => item.id === organizationId);
  if (!record) return <OrganizationList />;
  return (
    <div className="space-y-6">
      <section className="rounded-container border border-border-subtle bg-surface p-6 lg:p-8">
        <Link to="/admin/organizations" className="inline-flex items-center gap-1 text-sm font-medium text-text-brand"><ArrowLeft size={15} />返回合作主体</Link>
        <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-4xl">
            <div className="flex items-center gap-2"><StatusTag tone={record.type === "企业" ? "info" : record.type === "学校" ? "success" : "neutral"}>{record.type}</StatusTag></div>
            <h1 className="mt-3 text-2xl font-semibold">{record.name}</h1>
            <p className="mt-3 text-sm leading-6 text-text-secondary">{record.summary}</p>
          </div>
          <StatusTag tone="success">合作中</StatusTag>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.75fr_1.25fr]">
        <div className="rounded-container border border-border-subtle bg-surface p-5">
          <div className="flex items-center gap-2"><ShieldCheck size={18} className="text-text-brand" /><h2 className="font-semibold">可信信息边界</h2></div>
          <p className="mt-3 text-sm leading-6 text-text-secondary">{record.trust}</p>
        </div>
        <div className="rounded-container border border-border-subtle bg-surface p-5">
          <div className="flex items-center gap-2"><Sparkles size={18} className="text-text-brand" /><h2 className="font-semibold">当前合作资源</h2></div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {record.relations.map(rel => {
              const to = relationRoute(rel.kind, rel.stableId, rel.to);
              const body = <><StatusTag tone="neutral">{rel.kind}</StatusTag><p className="mt-2 font-semibold text-text-primary">{rel.label}</p>{to && <p className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-text-brand">查看业务 <ArrowRight size={13} /></p>}</>;
              return to ? <Link key={`${rel.kind}-${rel.stableId}`} to={to} className="rounded-control border border-border-subtle p-4 hover:bg-surface-subtle">{body}</Link> : <div key={`${rel.kind}-${rel.stableId}`} className="rounded-control border border-border-subtle p-4">{body}</div>;
            })}
          </div>
        </div>
      </section>

      <details className="rounded-container border border-border-subtle bg-surface p-5 text-sm text-text-secondary">
        <summary className="cursor-pointer font-semibold text-text-primary">数据来源与关联标识</summary>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          <div className="rounded-control bg-surface-subtle p-4">
            <p className="text-xs text-text-tertiary">Stable ID</p>
            <p className="mt-2 font-mono text-sm font-semibold">organizationId · {record.id}</p>
            <p className="mt-3 text-xs leading-5">Mobile Company 使用同一 stable value，不生成第二套 company key。</p>
          </div>
          <div className="rounded-control bg-surface-subtle p-4">
            <p className="text-xs text-text-tertiary">来源</p>
            <div className="mt-2 flex flex-wrap gap-1.5">{record.sources.map(source => <StatusTag key={source} tone={sourceMeta[source].tone}>{source}</StatusTag>)}</div>
            <p className="mt-3 text-xs leading-5">只使用 PC01 canonical 五类来源；多来源以多个标签表达。</p>
          </div>
        </div>
      </details>
    </div>
  );
}

export function PC03HumanOrganizationConsole() {
  const { organizationId } = useParams();
  return organizationId ? <OrganizationDetail organizationId={organizationId} /> : <OrganizationList />;
}

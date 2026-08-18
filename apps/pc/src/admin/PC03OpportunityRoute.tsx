import { ArrowLeft, Pencil, Save } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import { StatusTag } from "../components/ui";
import { PC03Console } from "./PC03Console";
import { pc03Organizations, usePC03State, type OpportunityRecord } from "./PC03State";

function OpportunityEditor({ opportunityId }: { opportunityId: string }) {
  const { opportunities, updateOpportunity } = usePC03State();
  const current = opportunities.find(item => item.id === opportunityId);
  const [notice, setNotice] = useState(false);

  if (!current) {
    return (
      <section className="rounded-container border border-border-subtle bg-surface p-8 text-center">
        <h1 className="text-xl font-semibold">机会不存在</h1>
        <Link to="/admin/opportunities" className="mt-5 inline-flex min-h-11 items-center text-sm font-medium text-text-brand">返回机会管理</Link>
      </section>
    );
  }

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const skills = String(form.get("skills") ?? "").split(/[,，]/).map(item => item.trim()).filter(Boolean);
    updateOpportunity(opportunityId, {
      title: String(form.get("title") ?? ""),
      organizationId: String(form.get("organizationId") ?? ""),
      city: String(form.get("city") ?? ""),
      mode: String(form.get("mode")) as OpportunityRecord["mode"],
      summary: String(form.get("summary") ?? ""),
      skills,
    });
    setNotice(true);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-container border border-border-subtle bg-surface p-6 lg:p-8">
        <Link to={`/admin/opportunities/${opportunityId}`} className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-text-brand"><ArrowLeft size={16} />返回机会详情</Link>
        <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-brand">PC03 · Opportunity edit</p>
            <h1 className="mt-2 text-2xl font-semibold">编辑机会</h1>
            <p className="mt-2 text-sm leading-6 text-text-secondary">stable id 保持只读；列表、详情和编辑共用同一份 PC03 Opportunity 原型状态。</p>
          </div>
          <StatusTag tone="info">平台运营</StatusTag>
        </div>
      </section>

      <form onSubmit={save} className="rounded-container border border-border-subtle bg-surface p-5 lg:p-6">
        <div className="grid gap-5 md:grid-cols-2">
          <label className="block text-xs font-medium text-text-secondary">opportunityId · 只读<input readOnly value={opportunityId} className="mt-2 min-h-11 w-full rounded-control border border-border-subtle bg-surface-subtle px-3 font-mono text-sm" /></label>
          <label className="block text-xs font-medium text-text-secondary">来源 Organization<select name="organizationId" defaultValue={current.organizationId} className="mt-2 min-h-11 w-full rounded-control border border-border bg-surface px-3 text-sm">{pc03Organizations.filter(item => item.type === "企业" || item.type === "合作机构").map(item => <option key={item.id} value={item.id}>{item.name} · {item.id}</option>)}</select></label>
          <label className="block text-xs font-medium text-text-secondary">标题<input name="title" defaultValue={current.title} className="mt-2 min-h-11 w-full rounded-control border border-border px-3 text-sm" /></label>
          <label className="block text-xs font-medium text-text-secondary">地区<input name="city" defaultValue={current.city} className="mt-2 min-h-11 w-full rounded-control border border-border px-3 text-sm" /></label>
          <label className="block text-xs font-medium text-text-secondary">类型<select name="mode" defaultValue={current.mode} className="mt-2 min-h-11 w-full rounded-control border border-border bg-surface px-3 text-sm"><option>实习</option><option>校招</option><option>项目实践</option></select></label>
          <label className="block text-xs font-medium text-text-secondary">技能标签 skills[]<input name="skills" defaultValue={current.skills.join(", ")} className="mt-2 min-h-11 w-full rounded-control border border-border px-3 text-sm" placeholder="逗号分隔" /></label>
          <label className="block text-xs font-medium text-text-secondary md:col-span-2">摘要<textarea name="summary" defaultValue={current.summary} className="mt-2 min-h-28 w-full rounded-control border border-border px-3 py-2 text-sm" /></label>
        </div>
        <div className="mt-5 flex justify-end"><button type="submit" className="inline-flex min-h-11 items-center gap-2 rounded-control bg-primary px-4 text-sm font-semibold text-on-primary"><Save size={16} />保存编辑</button></div>
      </form>

      {notice && <section data-testid="opportunity-edit-saved" className="rounded-container border border-success bg-success-bg p-5"><p className="font-semibold text-success-text">编辑已写入共享 PC03 原型态</p><p className="mt-2 text-xs leading-5 text-success-text">返回详情后仍会读取同一 Opportunity；正式后台接入时再把这个 provider 替换为 Opportunity API。</p></section>}
    </div>
  );
}

export function PC03OpportunityRoute() {
  const location = useLocation();
  const parts = useMemo(() => location.pathname.split("/").filter(Boolean), [location.pathname]);
  const opportunityId = parts[2];
  const editing = parts[3] === "edit";

  if (editing && opportunityId) return <OpportunityEditor opportunityId={opportunityId} />;

  return (
    <>
      <PC03Console />
      {opportunityId && <Link to={`/admin/opportunities/${opportunityId}/edit`} className="fixed bottom-5 right-5 z-30 inline-flex min-h-11 items-center gap-2 rounded-control bg-primary px-4 text-sm font-semibold text-on-primary shadow-floating"><Pencil size={16} />编辑机会</Link>}
    </>
  );
}

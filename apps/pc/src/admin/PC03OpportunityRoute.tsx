import { ArrowLeft, Pencil, Save } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import { StatusTag } from "../components/ui";
import { PC03Console } from "./PC03Console";

type OpportunityDraft = {
  id: string;
  title: string;
  organizationId: string;
  city: string;
  mode: "实习" | "校招" | "项目实践";
  summary: string;
};

const drafts: Record<string, OpportunityDraft> = {
  "intern-1": {
    id: "intern-1",
    title: "品牌增长实习生",
    organizationId: "northstar-beauty",
    city: "广州",
    mode: "实习",
    summary: "参与校园品牌项目、内容投放与活动复盘，适合有赛事 / 项目实践经历的学生。",
  },
  "intern-2": {
    id: "intern-2",
    title: "商业分析实习生",
    organizationId: "cloud-retail",
    city: "深圳",
    mode: "实习",
    summary: "协助零售数据整理、指标分析和项目周报。",
  },
  "intern-3": {
    id: "intern-3",
    title: "供应链项目助理",
    organizationId: "green-chain",
    city: "佛山",
    mode: "项目实践",
    summary: "参与绿色供应链调研与企业项目协同。",
  },
  "closed-1": {
    id: "closed-1",
    title: "校园活动运营实习生",
    organizationId: "northstar-beauty",
    city: "广州",
    mode: "实习",
    summary: "历史机会示例；关闭后保留详情与既有 Application。",
  },
};

function OpportunityEditor({ opportunityId }: { opportunityId: string }) {
  const initial = drafts[opportunityId] ?? {
    id: opportunityId,
    title: "新机会",
    organizationId: "northstar-beauty",
    city: "广州",
    mode: "实习" as const,
    summary: "",
  };
  const [saved, setSaved] = useState<OpportunityDraft>(initial);
  const [notice, setNotice] = useState(false);

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSaved({
      id: opportunityId,
      title: String(form.get("title") ?? ""),
      organizationId: String(form.get("organizationId") ?? ""),
      city: String(form.get("city") ?? ""),
      mode: String(form.get("mode")) as OpportunityDraft["mode"],
      summary: String(form.get("summary") ?? ""),
    });
    setNotice(true);
  }

  return (
    <div className="min-h-screen bg-background p-5 text-text-primary lg:p-8">
      <main className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-container border border-border-subtle bg-surface p-6 lg:p-8">
          <Link to={`/admin/opportunities/${opportunityId}`} className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-text-brand"><ArrowLeft size={16} />返回机会详情</Link>
          <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-brand">PC03 · Opportunity edit</p>
              <h1 className="mt-2 text-2xl font-semibold">编辑机会</h1>
              <p className="mt-2 text-sm leading-6 text-text-secondary">stable id 保持只读；编辑的是 Opportunity 主数据，不产生候选人档案。</p>
            </div>
            <StatusTag tone="info">平台运营</StatusTag>
          </div>
        </section>

        <form onSubmit={save} className="rounded-container border border-border-subtle bg-surface p-5 lg:p-6">
          <div className="grid gap-5 md:grid-cols-2">
            <label className="block text-xs font-medium text-text-secondary">opportunityId · 只读<input readOnly value={opportunityId} className="mt-2 min-h-11 w-full rounded-control border border-border-subtle bg-surface-subtle px-3 font-mono text-sm" /></label>
            <label className="block text-xs font-medium text-text-secondary">来源 Organization<input name="organizationId" defaultValue={saved.organizationId} className="mt-2 min-h-11 w-full rounded-control border border-border px-3 text-sm" /></label>
            <label className="block text-xs font-medium text-text-secondary">标题<input name="title" defaultValue={saved.title} className="mt-2 min-h-11 w-full rounded-control border border-border px-3 text-sm" /></label>
            <label className="block text-xs font-medium text-text-secondary">地区<input name="city" defaultValue={saved.city} className="mt-2 min-h-11 w-full rounded-control border border-border px-3 text-sm" /></label>
            <label className="block text-xs font-medium text-text-secondary">类型<select name="mode" defaultValue={saved.mode} className="mt-2 min-h-11 w-full rounded-control border border-border bg-surface px-3 text-sm"><option>实习</option><option>校招</option><option>项目实践</option></select></label>
            <label className="block text-xs font-medium text-text-secondary md:col-span-2">摘要<textarea name="summary" defaultValue={saved.summary} className="mt-2 min-h-28 w-full rounded-control border border-border px-3 py-2 text-sm" /></label>
          </div>
          <div className="mt-5 flex justify-end"><button type="submit" className="inline-flex min-h-11 items-center gap-2 rounded-control bg-primary px-4 text-sm font-semibold text-on-primary"><Save size={16} />保存编辑</button></div>
        </form>

        {notice && <section data-testid="opportunity-edit-saved" className="rounded-container border border-success bg-success-bg p-5"><p className="font-semibold text-success-text">编辑已保存到 PC03 原型态</p><p className="mt-2 text-sm text-success-text">{saved.title} · {saved.city} · {saved.mode} · {saved.organizationId}</p><p className="mt-2 text-xs leading-5 text-success-text">正式后台接入时这里写回 Opportunity API；当前不伪造持久化成功或跨端回流。</p></section>}
      </main>
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

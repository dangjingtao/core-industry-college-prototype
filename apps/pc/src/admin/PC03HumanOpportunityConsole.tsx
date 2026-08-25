import { CheckCircle2, CircleOff, Filter, Plus, Send, UsersRound } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Button, ConfirmDialog, Dialog, SecondaryButton, StatusTag } from "../components/ui";
import { pc03Organizations, usePC03State, type ApplicationStatus, type OpportunityRecord } from "./PC03State";

const targetFields = ["学校", "专业", "地区", "赛事经历", "课程完成", "证书", "比赛成绩"] as const;
const targetPreview = [
  { label: "匿名学生 A", facts: "广州示范高校 · 市场营销 · 三创赛经历" },
  { label: "匿名学生 B", facts: "广州 · 品牌电商实战课已完成" },
  { label: "匿名学生 C", facts: "有三创赛历史成绩" },
];

function createInternalId(index: number) {
  return `opportunity-draft-${String(index).padStart(3, "0")}`;
}

function applicationLabel(status: ApplicationStatus) {
  return status === "submitted" ? "已提交" : "状态待确认";
}

export function PC03HumanOpportunityConsole({ selectedId }: { selectedId?: string }) {
  const { opportunities, applications, createOpportunity, toggleOpportunityStatus, updateApplicationStatus } = usePC03State();
  const [showCreate, setShowCreate] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"status" | "audience" | null>(null);
  const [selectedTargets, setSelectedTargets] = useState(() => new Set(["匿名学生 A", "匿名学生 B"]));
  const [confirmed, setConfirmed] = useState(false);
  const selected = opportunities.find(item => item.id === selectedId) ?? opportunities[0];
  const relatedApplications = applications.filter(item => item.opportunityId === selected.id);
  const organization = pc03Organizations.find(item => item.id === selected.organizationId);

  function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") ?? "").trim();
    const skills = String(form.get("skills") ?? "").split(/[,，]/).map(item => item.trim()).filter(Boolean);
    if (!title) return;
    const record: OpportunityRecord = {
      id: createInternalId(opportunities.length + 1),
      title,
      organizationId: String(form.get("organizationId")),
      city: String(form.get("city") || "广州"),
      mode: String(form.get("mode")) as OpportunityRecord["mode"],
      summary: String(form.get("summary") || "由平台运营创建的学生机会。"),
      skills,
      status: "open",
    };
    if (createOpportunity(record)) setShowCreate(false);
  }

  const toggleTarget = (label: string) => setSelectedTargets(current => {
    const next = new Set(current);
    next.has(label) ? next.delete(label) : next.add(label);
    setConfirmed(false);
    return next;
  });

  return (
    <div className="space-y-6">
      <section className="rounded-container border border-border-subtle bg-surface p-6 lg:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-brand">机会运营</p>
            <h1 className="mt-2 text-2xl font-semibold">机会与投递</h1>
            <p className="mt-3 text-sm leading-6 text-text-secondary">维护实习、校招和项目实践机会，按可解释条件圈选触达人群，并跟进学生真实投递状态。</p>
          </div>
          <button type="button" onClick={() => setShowCreate(value => !value)} className="inline-flex min-h-11 items-center gap-2 rounded-control bg-primary px-4 text-sm font-semibold text-on-primary"><Plus size={16} />新建机会</button>
        </div>
      </section>

      <Dialog
        open={showCreate}
        onOpenChange={setShowCreate}
        title="新建机会"
        description="创建平台机会并开放给学生；后续下架不会删除历史投递。"
        size="lg"
        footer={<><SecondaryButton type="button" onClick={() => setShowCreate(false)}>取消</SecondaryButton><Button type="submit" form="create-opportunity-form">保存并开放</Button></>}
      >
        <form id="create-opportunity-form" onSubmit={create}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-xs font-medium text-text-secondary">机会名称<input name="title" required className="mt-2 min-h-11 w-full rounded-control border border-border px-3 text-sm" /></label>
            <label className="text-xs font-medium text-text-secondary">合作主体<select name="organizationId" className="mt-2 min-h-11 w-full rounded-control border border-border bg-surface px-3 text-sm">{pc03Organizations.filter(item => item.type === "企业" || item.type === "合作机构").map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
            <label className="text-xs font-medium text-text-secondary">地区<input name="city" defaultValue="广州" className="mt-2 min-h-11 w-full rounded-control border border-border px-3 text-sm" /></label>
            <label className="text-xs font-medium text-text-secondary">机会类型<select name="mode" className="mt-2 min-h-11 w-full rounded-control border border-border bg-surface px-3 text-sm"><option>实习</option><option>校招</option><option>项目实践</option></select></label>
            <label className="text-xs font-medium text-text-secondary">技能标签<input name="skills" defaultValue="沟通, 执行" className="mt-2 min-h-11 w-full rounded-control border border-border px-3 text-sm" placeholder="例如：内容运营, 用户研究" /></label>
            <label className="text-xs font-medium text-text-secondary sm:col-span-2">机会说明<input name="summary" defaultValue="参与真实业务项目与团队协作。" className="mt-2 min-h-11 w-full rounded-control border border-border px-3 text-sm" /></label>
          </div>
          <p className="mt-5 text-xs text-text-tertiary">创建后默认开放，可随时下架；历史投递不会因下架被删除。</p>
        </form>
      </Dialog>

      <section className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-container border border-border-subtle bg-surface">
          <div className="border-b border-border-subtle p-4"><h2 className="font-semibold">机会列表</h2><p className="mt-1 text-xs text-text-tertiary">开放和已下架机会都保留，方便追溯历史投递。</p></div>
          <div className="divide-y divide-border-subtle">
            {opportunities.map(item => {
              const org = pc03Organizations.find(row => row.id === item.organizationId);
              return <Link key={item.id} to={`/admin/opportunities/${item.id}`} className={`block p-4 ${item.id === selected.id ? "bg-surface-subtle" : "hover:bg-surface-subtle"}`}><div className="flex items-start justify-between gap-2"><div><p className="font-semibold">{item.title}</p><p className="mt-1 text-xs text-text-secondary">{org?.name ?? "合作主体"} · {item.city} · {item.mode}</p><p className="mt-2 text-xs text-text-secondary">{item.skills.join(" · ")}</p><p data-pc05-technical className="mt-2 font-mono text-xs text-text-tertiary">opportunityId · {item.id} · organizationId={item.organizationId}</p></div><StatusTag tone={item.status === "open" ? "success" : "neutral"}>{item.status === "open" ? "开放中" : "已下架"}</StatusTag></div></Link>;
            })}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-container border border-border-subtle bg-surface p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><h2 className="text-xl font-semibold">{selected.title}</h2><p className="mt-2 text-sm leading-6 text-text-secondary">{selected.summary}</p><div className="mt-3 flex flex-wrap gap-2" aria-label="技能标签">{selected.skills.map(skill => <StatusTag key={skill} tone="neutral">{skill}</StatusTag>)}</div></div>
              <button data-testid="opportunity-toggle" type="button" onClick={() => setConfirmAction("status")} className="inline-flex min-h-11 items-center gap-2 rounded-control bg-primary-container px-4 text-sm font-semibold text-text-brand">{selected.status === "open" ? <CircleOff size={16} /> : <CheckCircle2 size={16} />}{selected.status === "open" ? "下架机会" : "重新开放"}</button>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3 text-xs"><div className="rounded-control bg-surface-subtle p-3"><span className="text-text-tertiary">合作主体</span><p className="mt-1 font-semibold">{organization?.name ?? selected.organizationId}</p></div><div className="rounded-control bg-surface-subtle p-3"><span className="text-text-tertiary">地区</span><p className="mt-1 font-semibold">{selected.city}</p></div><div className="rounded-control bg-surface-subtle p-3"><span className="text-text-tertiary">类型</span><p className="mt-1 font-semibold">{selected.mode}</p></div></div>
            <p data-pc05-technical className="mt-3 font-mono text-xs text-text-tertiary">opportunityId · {selected.id}</p>
          </div>

          <div className="rounded-container border border-border-subtle bg-surface p-5">
            <div className="flex items-center gap-2"><Filter size={18} className="text-text-brand" /><h2 className="font-semibold">发送人群</h2></div>
            <p className="mt-2 text-sm leading-6 text-text-secondary">使用学校、专业、地区、赛事经历、课程与可信空间等可解释条件筛选，运营可以在发送前人工增删。</p>
            <div className="mt-4 flex flex-wrap gap-2">{targetFields.map(field => <span key={field} className="rounded-full bg-surface-subtle px-3 py-1.5 text-xs font-medium">{field}</span>)}</div>
            <div className="mt-4 space-y-2">{targetPreview.map(row => <button type="button" key={row.label} onClick={() => toggleTarget(row.label)} className="flex w-full items-center justify-between gap-3 rounded-control border border-border-subtle p-3 text-left"><div><p className="text-sm font-semibold">{row.label}</p><p className="mt-1 text-xs text-text-secondary">{row.facts}</p></div><StatusTag tone={selectedTargets.has(row.label) ? "success" : "neutral"}>{selectedTargets.has(row.label) ? "发送" : "排除"}</StatusTag></button>)}</div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-text-tertiary">当前范围：{selectedTargets.size} 人</p><button type="button" onClick={() => setConfirmAction("audience")} className="inline-flex min-h-11 items-center gap-2 rounded-control bg-primary px-4 text-sm font-semibold text-on-primary"><Send size={16} />确认发送范围</button></div>
            {confirmed && <div data-testid="audience-confirmed" className="mt-3 rounded-control bg-success-bg px-3 py-2 text-sm text-success-text"><p>发送范围已确认。</p><p data-pc05-technical className="mt-1 font-mono text-xs">只提交名单引用，不生成 CandidateRecord。</p></div>}
          </div>
        </div>
      </section>

      <section className="rounded-container border border-border-subtle bg-surface">
        <div className="border-b border-border-subtle p-5"><div className="flex items-center gap-2"><UsersRound size={18} className="text-text-brand" /><h2 className="font-semibold">学生投递</h2></div><p className="mt-1 text-xs text-text-tertiary">这里只跟进学生已经发起的真实投递，不把人群圈选自动变成投递记录。</p></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-surface-subtle text-xs text-text-secondary"><tr><th className="p-3">学生</th><th className="p-3">机会</th><th className="p-3">当前状态</th><th className="p-3">跟进</th></tr></thead><tbody>{relatedApplications.length ? relatedApplications.map(app => <tr key={app.key} className="border-t border-border-subtle"><td className="p-3">{app.studentLabel}</td><td className="p-3">{selected.title}</td><td className="p-3"><StatusTag tone={app.status === "submitted" ? "success" : "warning"}>{applicationLabel(app.status)}</StatusTag></td><td className="p-3"><select aria-label={`更新 ${app.studentLabel} 投递状态`} value={app.status} onChange={event => updateApplicationStatus(app.key, event.target.value as ApplicationStatus)} className="min-h-10 rounded-control border border-border bg-surface px-2 text-sm"><option value="submitted">已提交</option><option value="statusUnknown">状态待确认</option></select><span data-pc05-technical className="ml-2 font-mono text-xs text-text-tertiary">Application Runtime</span></td></tr>) : <tr><td colSpan={4} className="p-5 text-text-secondary">当前机会还没有学生投递；机会下架也不会删除历史记录。</td></tr>}</tbody></table></div>
      </section>

      <ConfirmDialog
        open={confirmAction === "status"}
        title={selected.status === "open" ? "下架这个机会？" : "重新开放这个机会？"}
        description={selected.status === "open" ? "下架后学生不再看到新的投递入口，但既有 Application 会继续保留。" : "重新开放后，符合范围的学生可以再次看到并投递该机会。"}
        confirmText={selected.status === "open" ? "确认下架" : "确认开放"}
        danger={selected.status === "open"}
        onCancel={() => setConfirmAction(null)}
        onConfirm={() => { toggleOpportunityStatus(selected.id); setConfirmAction(null); }}
      />
      <ConfirmDialog
        open={confirmAction === "audience"}
        title="确认发送范围"
        description={`将向当前选中的 ${selectedTargets.size} 人发送「${selected.title}」。`}
        confirmText="确认范围"
        confirmDisabled={selectedTargets.size === 0}
        onCancel={() => setConfirmAction(null)}
        onConfirm={() => { setConfirmed(true); setConfirmAction(null); }}
      >
        <p className="text-sm leading-6 text-text-secondary">只提交名单引用，不会把圈选结果生成投递记录或 CandidateRecord。</p>
      </ConfirmDialog>
    </div>
  );
}

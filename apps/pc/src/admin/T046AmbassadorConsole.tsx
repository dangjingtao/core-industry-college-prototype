import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Building2,
  ChevronDown,
  Download,
  FileText,
  Plus,
  Trash2,
  UsersRound,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ambassadorApplicationForm,
  ambassadorApplicationSubmittedAt,
  ambassadorCampaignStatus,
  ambassadorTeamDisplayName,
  ambassadorTeamMemberCount,
  deriveAmbassadorMetrics,
  readableAmbassadorTerms,
  resolveAmbassadorAnswerForm,
  type AmbassadorApplicationField,
  type AmbassadorApplicationFieldType,
  type AmbassadorIncentiveStatus,
  type AmbassadorTeamMember,
  type AmbassadorTermsVersion,
  useAmbassadorState,
} from "@core/shared";
import { Button, Dialog, SecondaryButton, StatusTag } from "../components/ui";

const schools: Record<string, string> = {
  "org-huanan-commerce-college": "华南商贸职业学院",
  "org-gdtc": "广东技术职业学院",
};
const statusLabel = { draft: "草稿", upcoming: "未开始", active: "进行中", ended: "已结束" } as const;
const teamLabel = { forming: "待点亮", lit: "已点亮", ended: "已结束" } as const;
const incentiveLabel: Record<AmbassadorIncentiveStatus, string> = { unprocessed: "未处理", processed: "已处理" };
const fieldTypeLabel: Record<AmbassadorApplicationFieldType, string> = {
  text: "单行文本",
  textarea: "长文本",
  "single-choice": "单选",
  "multi-choice": "多选",
};

function downloadSvg(svg: string, filename: string) {
  if (!svg) return;
  const link = document.createElement("a");
  link.href = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  link.download = filename;
  link.click();
}

function SchoolRecruitmentCodeCard({ code, schoolName, campaignName }: { code: string; schoolName: string; campaignName: string }) {
  const mobileSiteUrl = (import.meta.env.VITE_MOBILE_SITE_URL || "https://dev.core-industry-college-mobile.pages.dev").replace(/\/$/, "");
  const payload = `${mobileSiteUrl}/ambassadors?code=${encodeURIComponent(code)}`;
  const [svg, setSvg] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    QRCode.toString(payload, { type: "svg", errorCorrectionLevel: "M", margin: 1, width: 256 }).then(value => {
      if (!cancelled) setSvg(value);
    });
    return () => { cancelled = true; };
  }, [payload]);

  return <>
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="flex w-full items-center gap-3 rounded-control border border-primary/15 bg-primary-container p-3 text-left transition hover:border-primary/35"
      aria-label={`查看 ${schoolName} 学校招募二维码`}
    >
      <div data-testid={`qr-${code}`} data-payload={payload} className="size-16 shrink-0 overflow-hidden rounded-control bg-white p-1" dangerouslySetInnerHTML={{ __html: svg }} />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-text-brand">{campaignName}</p>
        <p className="mt-1 font-semibold">{schoolName} · 校园大使招募</p>
        <p className="mt-1 text-xs text-text-tertiary">点击查看大图并下载</p>
      </div>
      <Download size={16} className="text-text-brand" />
    </button>
    <Dialog
      open={open}
      onOpenChange={setOpen}
      title={`${schoolName} · 校园大使招募二维码`}
      description="用于进入校园大使申请，不用于加入推广团队。"
      size="sm"
      footer={<>
        <SecondaryButton type="button" onClick={() => setOpen(false)}>关闭</SecondaryButton>
        <Button type="button" disabled={!svg} onClick={() => downloadSvg(svg, `${campaignName}-${schoolName}-校园大使招募.svg`)}><Download size={16} className="mr-2" />下载二维码</Button>
      </>}
    >
      <div className="rounded-container bg-primary-container p-5 text-center">
        <p className="text-xs font-semibold text-text-brand">核心大使计划 · 校园招募</p>
        <p className="mt-1 text-lg font-semibold">{schoolName}</p>
        <div className="mx-auto mt-4 size-64 max-w-full overflow-hidden rounded-container bg-white p-3 shadow-sm" data-testid={`qr-preview-${code}`} data-payload={payload} dangerouslySetInnerHTML={{ __html: svg }} />
        <p className="mt-4 text-xs text-text-secondary">扫码进入 Mobile 校园大使申请入口</p>
        <code className="mt-2 block break-all text-[11px] text-text-tertiary">{code}</code>
      </div>
    </Dialog>
  </>;
}

function SchoolMultiSelect({ value, onChange }: { value: string[]; onChange: (value: string[]) => void }) {
  const [open, setOpen] = useState(false);
  const selectedText = value.length === 0 ? "请选择参与学校" : value.length === 1 ? schools[value[0]] ?? value[0] : `已选择 ${value.length} 所学校`;
  return <div className="relative">
    <button type="button" aria-expanded={open} onClick={() => setOpen(current => !current)} className="flex min-h-11 w-full items-center justify-between rounded-control border border-border-subtle bg-surface px-3 text-left text-sm">
      <span>{selectedText}</span><ChevronDown size={16} />
    </button>
    {open && <div className="absolute z-20 mt-1 w-full rounded-control border border-border-subtle bg-surface p-2 shadow-lg">
      {Object.entries(schools).map(([id, label]) => <label key={id} className="flex min-h-10 cursor-pointer items-center gap-2 rounded-control px-2 text-sm hover:bg-surface-subtle">
        <input type="checkbox" checked={value.includes(id)} onChange={event => onChange(event.target.checked ? [...value, id] : value.filter(item => item !== id))} />
        {label}
      </label>)}
      <button type="button" className="mt-1 w-full rounded-control px-2 py-2 text-xs font-semibold text-text-brand hover:bg-surface-subtle" onClick={() => setOpen(false)}>完成选择</button>
    </div>}
  </div>;
}

function ApplicationFormDesigner({ fields, onChange }: { fields: AmbassadorApplicationField[]; onChange: (fields: AmbassadorApplicationField[]) => void }) {
  const patch = (index: number, input: Partial<AmbassadorApplicationField>) => onChange(fields.map((field, fieldIndex) => fieldIndex === index ? { ...field, ...input } : field));
  const remove = (index: number) => onChange(fields.filter((_, fieldIndex) => fieldIndex !== index));
  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= fields.length) return;
    const next = [...fields];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };
  const add = () => onChange([...fields, { id: `field-${Date.now()}`, label: "新字段", type: "text", required: false }]);

  return <div className="space-y-3">
    <div className="flex items-center justify-between"><div><p className="text-sm font-medium">申请表单设计</p><p className="mt-1 text-xs text-text-tertiary">配置会直接供 App 申请页渲染。</p></div><SecondaryButton type="button" onClick={add}><Plus size={15} className="mr-1" />新增字段</SecondaryButton></div>
    {fields.map((field, index) => {
      const choiceField = field.type === "single-choice" || field.type === "multi-choice";
      return <div key={field.id} className="rounded-control border border-border-subtle bg-surface-subtle p-3" data-testid="application-form-field">
        <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_150px_auto]">
          <input aria-label={`字段 ${index + 1} 名称`} value={field.label} onChange={event => patch(index, { label: event.target.value })} className="min-h-10 rounded-control border border-border-subtle bg-surface px-3 text-sm" />
          <select aria-label={`字段 ${index + 1} 类型`} value={field.type} onChange={event => patch(index, { type: event.target.value as AmbassadorApplicationFieldType, options: ["single-choice", "multi-choice"].includes(event.target.value) ? field.options ?? ["选项一", "选项二"] : undefined })} className="min-h-10 rounded-control border border-border-subtle bg-surface px-2 text-sm">
            {Object.entries(fieldTypeLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <div className="flex items-center gap-1">
            <button type="button" aria-label="上移字段" disabled={index === 0} onClick={() => move(index, -1)} className="rounded-control p-2 disabled:opacity-30"><ArrowUp size={15} /></button>
            <button type="button" aria-label="下移字段" disabled={index === fields.length - 1} onClick={() => move(index, 1)} className="rounded-control p-2 disabled:opacity-30"><ArrowDown size={15} /></button>
            <button type="button" aria-label="删除字段" onClick={() => remove(index)} className="rounded-control p-2 text-danger"><Trash2 size={15} /></button>
          </div>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={field.required} onChange={event => patch(index, { required: event.target.checked })} />必填</label>
          {choiceField && <input aria-label={`字段 ${index + 1} 选项`} value={(field.options ?? []).join("、")} onChange={event => patch(index, { options: event.target.value.split(/[、,，]/).map(item => item.trim()).filter(Boolean) })} placeholder="选项一、选项二" className="min-h-9 min-w-64 flex-1 rounded-control border border-border-subtle bg-surface px-3 text-xs" />}
        </div>
      </div>;
    })}
    <div className="rounded-control border border-dashed border-border-subtle p-3">
      <p className="text-xs font-semibold text-text-secondary">表单预览</p>
      <div className="mt-3 grid gap-3 md:grid-cols-2">{fields.map(field => <label key={`preview-${field.id}`} className="text-xs font-medium">{field.label}{field.required && <span className="text-danger"> *</span>}{field.type === "textarea" ? <textarea disabled rows={2} className="mt-1 w-full rounded-control border border-border-subtle bg-surface px-2 py-2" /> : field.type === "text" ? <input disabled className="mt-1 min-h-9 w-full rounded-control border border-border-subtle bg-surface px-2" /> : <span className="mt-2 flex flex-wrap gap-2">{(field.options ?? []).map(option => <span key={option} className="rounded-full bg-surface-subtle px-2 py-1 font-normal">{field.type === "single-choice" ? "○" : "□"} {option}</span>)}</span>}</label>)}</div>
    </div>
  </div>;
}

function RichTextEditor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const editorRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) editorRef.current.innerHTML = value;
  }, [value]);
  const command = (name: string) => {
    editorRef.current?.focus();
    document.execCommand(name);
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };
  return <div className="rounded-control border border-border-subtle">
    <div className="flex gap-1 border-b border-border-subtle bg-surface-subtle p-2">
      <button type="button" onMouseDown={event => event.preventDefault()} onClick={() => command("bold")} className="rounded-control px-2 py-1 text-xs font-bold">B</button>
      <button type="button" onMouseDown={event => event.preventDefault()} onClick={() => command("insertUnorderedList")} className="rounded-control px-2 py-1 text-xs">项目符号</button>
      <button type="button" onMouseDown={event => event.preventDefault()} onClick={() => command("insertOrderedList")} className="rounded-control px-2 py-1 text-xs">编号</button>
    </div>
    <div ref={editorRef} contentEditable role="textbox" aria-multiline="true" aria-label="活动条款正文" onInput={event => onChange(event.currentTarget.innerHTML)} className="min-h-64 p-4 text-sm leading-7 outline-none" />
  </div>;
}

function TermsDraftEditor({ terms, onClose }: { terms: AmbassadorTermsVersion; onClose: () => void }) {
  const { updateAmbassadorTermsDraft, publishAmbassadorTermsVersion } = useAmbassadorState();
  const [title, setTitle] = useState(terms.title);
  const [contentHtml, setContentHtml] = useState(terms.contentHtml);
  const save = () => updateAmbassadorTermsDraft(terms.id, { title: title.trim() || "核心大使计划活动条款", contentHtml });
  return <div className="space-y-3">
    <label className="block text-sm font-medium">条款标题<input value={title} onChange={event => setTitle(event.target.value)} className="mt-2 min-h-10 w-full rounded-control border border-border-subtle px-3" /></label>
    <RichTextEditor value={contentHtml} onChange={setContentHtml} />
    <div className="flex justify-end gap-2"><SecondaryButton type="button" onClick={onClose}>返回列表</SecondaryButton><SecondaryButton type="button" onClick={save}>保存草稿</SecondaryButton><Button type="button" onClick={() => { save(); publishAmbassadorTermsVersion(terms.id); onClose(); }}>发布并冻结</Button></div>
  </div>;
}

function TermsManagerDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { termsVersions, createAmbassadorTermsDraft } = useAmbassadorState();
  const [editingId, setEditingId] = useState<string>();
  const editing = termsVersions.find(item => item.id === editingId && item.status === "draft");
  const latestPublished = [...termsVersions].reverse().find(item => item.status === "published");
  return <Dialog open={open} onOpenChange={next => { onOpenChange(next); if (!next) setEditingId(undefined); }} title="核心大使计划活动条款" description="已发布版本不可覆盖修改；需要调整时从已发布版本创建新草稿。" size="lg">
    {editing ? <TermsDraftEditor key={editing.id} terms={editing} onClose={() => setEditingId(undefined)} /> : <div className="space-y-4">
      <div className="flex justify-end"><Button type="button" onClick={() => createAmbassadorTermsDraft({ title: latestPublished?.title ?? "核心大使计划活动条款", contentHtml: latestPublished?.contentHtml ?? "<p>请输入活动条款。</p>", basedOnId: latestPublished?.id })}><Plus size={16} className="mr-2" />基于当前版本新建</Button></div>
      <div className="divide-y divide-border-subtle rounded-container border border-border-subtle">{termsVersions.map(terms => <div key={terms.id} className="flex flex-wrap items-center gap-3 p-4">
        <FileText size={18} className="text-text-brand" />
        <div className="min-w-0 flex-1"><p className="font-semibold">{readableAmbassadorTerms(terms)}</p><p className="mt-1 text-xs text-text-tertiary">{terms.status === "published" ? `已发布并冻结 · ${terms.publishedAt?.slice(0, 10) ?? ""}` : "草稿 · 可编辑"}</p></div>
        <StatusTag tone={terms.status === "published" ? "success" : "warning"}>{terms.status === "published" ? "已发布" : "草稿"}</StatusTag>
        {terms.status === "draft" && <SecondaryButton type="button" onClick={() => setEditingId(terms.id)}>编辑草稿</SecondaryButton>}
      </div>)}</div>
      {latestPublished && <div className="rounded-container bg-surface-subtle p-4"><p className="text-sm font-semibold">当前已发布内容预览</p><div className="mt-3 max-h-64 overflow-auto text-sm leading-7 text-text-secondary" dangerouslySetInnerHTML={{ __html: latestPublished.contentHtml }} /></div>}
    </div>}
  </Dialog>;
}

function CampaignEditorDialog({ campaignId, onDone }: { campaignId?: string; onDone: () => void }) {
  const { campaigns, termsVersions, createAmbassadorCampaign, updateAmbassadorCampaign } = useAmbassadorState();
  const existing = campaigns.find(item => item.id === campaignId);
  const publishedTerms = termsVersions.filter(item => item.status === "published");
  const [name, setName] = useState(existing?.name ?? "");
  const [startsAt, setStartsAt] = useState(existing?.startsAt.slice(0, 10) ?? "2026-09-01");
  const [endsAt, setEndsAt] = useState(existing?.endsAt.slice(0, 10) ?? "2026-10-31");
  const [schoolIds, setSchoolIds] = useState(existing?.schoolIds ?? ["org-huanan-commerce-college"]);
  const [fields, setFields] = useState<AmbassadorApplicationField[]>(existing ? ambassadorApplicationForm(existing).map(field => ({ ...field, options: field.options ? [...field.options] : undefined })) : [
    { id: "intro", label: "自我介绍", type: "textarea", required: true },
    { id: "channel", label: "校园传播渠道", type: "textarea", required: true },
    { id: "motivation", label: "参与动机", type: "textarea", required: true },
  ]);
  const [termsVersion, setTermsVersion] = useState(existing?.termsVersion ?? publishedTerms.at(-1)?.id ?? "");
  const [error, setError] = useState("");
  const termsLocked = Boolean(existing && ["active", "ended"].includes(ambassadorCampaignStatus(existing)));

  const save = () => {
    const choiceWithoutOptions = fields.some(field => (field.type === "single-choice" || field.type === "multi-choice") && !field.options?.length);
    if (!name.trim() || schoolIds.length === 0 || fields.length === 0 || fields.some(field => !field.label.trim()) || choiceWithoutOptions || !termsVersion) {
      setError("请补齐活动名称、参与学校、申请字段、选项和已发布条款版本。");
      return;
    }
    const input = {
      name: name.trim(),
      startsAt: `${startsAt}T00:00:00+08:00`,
      endsAt: `${endsAt}T23:59:59+08:00`,
      schoolIds,
      applicationFields: fields.map(field => field.label.trim()),
      applicationForm: fields.map(field => ({ ...field, label: field.label.trim(), options: field.options ? [...field.options] : undefined })),
      termsVersion,
    };
    if (existing) updateAmbassadorCampaign(existing.id, input); else createAmbassadorCampaign(input);
    onDone();
  };

  return <Dialog
    open
    onOpenChange={next => { if (!next) onDone(); }}
    title={existing ? "编辑核心大使计划" : "创建核心大使计划"}
    description="活动按开始/结束时间自动进入未开始、进行中和已结束状态。"
    size="lg"
    footer={<><SecondaryButton type="button" onClick={onDone}>取消</SecondaryButton><Button type="button" onClick={save}>{existing ? "保存修改" : "创建活动"}</Button></>}
  >
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-medium">活动名称<input value={name} onChange={event => { setName(event.target.value); setError(""); }} className="mt-2 min-h-11 w-full rounded-control border border-border-subtle px-3" /></label>
        <div><p className="text-sm font-medium">参与学校</p><div className="mt-2"><SchoolMultiSelect value={schoolIds} onChange={value => { setSchoolIds(value); setError(""); }} /></div></div>
        <label className="text-sm font-medium">开始日期<input type="date" value={startsAt} onChange={event => setStartsAt(event.target.value)} className="mt-2 min-h-11 w-full rounded-control border border-border-subtle px-3" /></label>
        <label className="text-sm font-medium">结束日期<input type="date" value={endsAt} onChange={event => setEndsAt(event.target.value)} className="mt-2 min-h-11 w-full rounded-control border border-border-subtle px-3" /></label>
        <label className="text-sm font-medium md:col-span-2">活动条款版本<select value={termsVersion} disabled={termsLocked} onChange={event => setTermsVersion(event.target.value)} className="mt-2 min-h-11 w-full rounded-control border border-border-subtle bg-surface px-3 disabled:bg-surface-subtle">
          {publishedTerms.map(terms => <option key={terms.id} value={terms.id}>{readableAmbassadorTerms(terms)}</option>)}
        </select><span className="mt-1 block text-xs text-text-tertiary">只允许选择已发布版本；活动开始后绑定版本锁定。</span></label>
      </div>
      <ApplicationFormDesigner fields={fields} onChange={setFields} />
      <p className="rounded-control bg-info-bg p-3 text-xs text-info-text">点亮门槛固定为 1 位校园大使 + 3 位校园推荐官，不支持自定义规则。</p>
      {error && <p className="rounded-control bg-danger-bg p-3 text-sm text-danger-text">{error}</p>}
    </div>
  </Dialog>;
}

function CampaignList() {
  const { campaigns, teams, validAcquisitions } = useAmbassadorState();
  const navigate = useNavigate();
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [termsOpen, setTermsOpen] = useState(false);
  return <div className="space-y-6">
    <section className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-brand">运营活动</p><h1 className="mt-2 text-2xl font-semibold">核心大使计划</h1><p className="mt-2 text-sm text-text-secondary">按期管理学校招募、团队点亮与推广成果。</p></div><div className="flex gap-2"><SecondaryButton type="button" onClick={() => setTermsOpen(true)}><FileText size={16} className="mr-2" />活动条款</SecondaryButton><Button type="button" onClick={() => setEditing("new")}><Plus size={16} className="mr-2" />创建活动</Button></div></section>
    <div className="overflow-x-auto rounded-container border border-border-subtle bg-surface"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-surface-subtle text-xs text-text-tertiary"><tr><th className="p-4">活动</th><th>时间</th><th>状态</th><th>覆盖学校</th><th>校园大使</th><th>已点亮团队</th><th>有效新增</th><th /></tr></thead><tbody>{campaigns.map(campaign => { const metrics = deriveAmbassadorMetrics({ campaigns, teams, validAcquisitions, termsVersions: [], schoolRecruitmentCodes: [], teamRecruitmentCodes: [], promotionCodes: [] }, campaign.id); return <tr key={campaign.id} className="border-t border-border-subtle"><td className="p-4"><button className="font-semibold text-text-brand hover:underline" onClick={() => navigate(`/admin/ambassadors/${campaign.id}`)}>{campaign.name}</button><p className="mt-1 font-mono text-xs text-text-tertiary">campaignId={campaign.id}</p></td><td>{campaign.startsAt.slice(0, 10)} ~ {campaign.endsAt.slice(0, 10)}</td><td><StatusTag tone={ambassadorCampaignStatus(campaign) === "active" ? "success" : "neutral"}>{statusLabel[ambassadorCampaignStatus(campaign)]}</StatusTag></td><td>{campaign.schoolIds.length}</td><td>{metrics.coreAmbassadorCount}</td><td>{metrics.litTeamCount}</td><td>{metrics.validAcquisitionCount}</td><td><button type="button" onClick={() => setEditing(campaign.id)} className="text-xs font-semibold text-text-brand">编辑</button></td></tr>; })}</tbody></table></div>
    {editing && <CampaignEditorDialog key={editing} campaignId={editing === "new" ? undefined : editing} onDone={() => setEditing(null)} />}
    <TermsManagerDialog open={termsOpen} onOpenChange={setTermsOpen} />
  </div>;
}

function CampaignDetail({ campaignId }: { campaignId: string }) {
  const { campaigns, schoolRecruitmentCodes, teams, validAcquisitions } = useAmbassadorState();
  const campaign = campaigns.find(item => item.id === campaignId);
  const [filter, setFilter] = useState("all");
  if (!campaign) return <CampaignList />;
  const metrics = deriveAmbassadorMetrics({ campaigns, teams, validAcquisitions, termsVersions: [], schoolRecruitmentCodes, teamRecruitmentCodes: [], promotionCodes: [] }, campaignId);
  const filteredTeams = teams.filter(team => team.campaignId === campaignId && (filter === "all" || team.status === filter));
  return <div className="space-y-6">
    <Link to="/admin/ambassadors" className="inline-flex items-center gap-2 text-sm font-semibold text-text-brand"><ArrowLeft size={16} />返回活动列表</Link>
    <section className="rounded-container border border-border-subtle bg-surface p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs text-text-tertiary">核心大使计划</p><h1 className="mt-2 text-2xl font-semibold">{campaign.name}</h1><p className="mt-2 font-mono text-xs text-text-tertiary">campaignId={campaign.id}</p></div><StatusTag tone="info">{statusLabel[ambassadorCampaignStatus(campaign)]}</StatusTag></div><div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{[["覆盖学校", metrics.schoolCount], ["校园大使", metrics.coreAmbassadorCount], ["已点亮团队", metrics.litTeamCount], ["校园推荐官", metrics.partnerCount], ["有效新增", metrics.validAcquisitionCount]].map(([label, value]) => <div key={label} className="rounded-control bg-surface-subtle p-4"><p className="text-xs text-text-tertiary">{label}</p><p className="mt-2 text-xl font-semibold">{value}</p></div>)}</div></section>
    <section className="grid gap-4 lg:grid-cols-2">{campaign.schoolIds.map(schoolId => <article key={schoolId} className="rounded-container border border-border-subtle bg-surface p-5"><div className="flex items-center gap-2"><Building2 size={18} className="text-text-brand" /><h2 className="font-semibold">{schools[schoolId] ?? schoolId}</h2></div><div className="mt-4">{schoolRecruitmentCodes.filter(code => code.campaignId === campaignId && code.schoolId === schoolId).map(code => <SchoolRecruitmentCodeCard key={code.id} code={code.code} schoolName={schools[schoolId] ?? schoolId} campaignName={campaign.name} />)}</div></article>)}</section>
    <section className="rounded-container border border-border-subtle bg-surface p-5"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-semibold">团队列表</h2><select value={filter} onChange={event => setFilter(event.target.value)} className="min-h-10 rounded-control border border-border-subtle px-3 text-sm"><option value="all">全部状态</option><option value="forming">待点亮</option><option value="lit">已点亮</option><option value="ended">已结束</option></select></div><div className="mt-4 divide-y divide-border-subtle">{filteredTeams.length === 0 ? <p className="py-8 text-center text-sm text-text-tertiary">暂时还没有团队，等待 App 产生校园大使申请。</p> : filteredTeams.map(team => <Link key={team.id} to={`/admin/ambassadors/${campaignId}/teams/${team.id}`} className="flex flex-wrap items-center gap-4 py-4 hover:bg-surface-subtle"><UsersRound size={18} className="text-text-brand" /><span className="min-w-48 font-semibold">{ambassadorTeamDisplayName(team)}</span><span>{schools[team.schoolId] ?? team.schoolId}</span><StatusTag tone={team.status === "lit" ? "success" : team.status === "ended" ? "neutral" : "warning"}>{teamLabel[team.status]}</StatusTag><span>{ambassadorTeamMemberCount(team)} 人</span><span className="ml-auto text-xs">有效新增 {validAcquisitions.filter(item => item.teamId === team.id).length} · 激励 {incentiveLabel[team.incentiveStatus]}</span></Link>)}</div></section>
  </div>;
}

function QuestionnaireAnswerView({
  ambassador,
  campaign,
  teamName,
  schoolName,
}: {
  ambassador: AmbassadorTeamMember;
  campaign: { id: string; name: string; applicationForm?: AmbassadorApplicationField[]; applicationFields: string[]; termsVersion: string };
  teamName: string;
  schoolName: string;
}) {
  const { termsVersions } = useAmbassadorState();
  const { fields, fromSnapshot } = resolveAmbassadorAnswerForm(ambassador, campaign);
  const submittedAt = ambassadorApplicationSubmittedAt(ambassador);
  const termsId = ambassador.application?.termsVersion ?? campaign.termsVersion;
  const terms = termsVersions.find(item => item.id === termsId);
  const applicantName = ambassador.application?.__applicantName ?? ambassador.accountId;

  const renderAnswer = (field: AmbassadorApplicationField) => {
    const raw = ambassador.application?.[field.id] ?? ambassador.application?.[field.label];
    const isUnfilled = !raw || raw.trim().length === 0;

    if (isUnfilled) {
      return <p className="text-sm italic text-text-tertiary">未填写</p>;
    }

    switch (field.type) {
      case "textarea":
        return <p className="whitespace-pre-wrap text-sm leading-7 text-text-primary">{raw}</p>;
      case "single-choice":
        return <div className="flex items-center gap-2"><span className="inline-flex size-4 items-center justify-center rounded-full border border-text-brand"><span className="size-2 rounded-full bg-text-brand" /></span><span className="text-sm">{raw}</span></div>;
      case "multi-choice": {
        const selected = raw.split(/[,，、]/).map(item => item.trim()).filter(Boolean);
        return <div className="flex flex-wrap gap-2">{selected.length === 0 ? <p className="text-sm italic text-text-tertiary">未填写</p> : selected.map(option => <span key={option} className="inline-flex items-center gap-1.5 rounded-full bg-surface-subtle px-3 py-1 text-xs"><span>☑</span>{option}</span>)}</div>;
      }
      case "text":
      default:
        return <p className="text-sm text-text-primary">{raw}</p>;
    }
  };

  return <section className="rounded-container border border-border-subtle bg-surface" data-testid="ambassador-questionnaire-answers">
    <div className="border-b border-border-subtle p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-brand">校园大使申请问卷</p>
          <h2 className="mt-2 text-lg font-semibold">{campaign.name} · 申请答案</h2>
        </div>
        {!fromSnapshot && <StatusTag tone="warning">使用当前表单配置</StatusTag>}
        {fromSnapshot && <StatusTag tone="success">提交时版本</StatusTag>}
      </div>
      <div className="mt-4 grid gap-4 text-sm md:grid-cols-3">
        <div><p className="text-xs text-text-tertiary">所属活动</p><p className="mt-1 font-medium">{campaign.name}</p></div>
        <div><p className="text-xs text-text-tertiary">学校</p><p className="mt-1 font-medium">{schoolName}</p></div>
        <div><p className="text-xs text-text-tertiary">团队</p><p className="mt-1 font-medium">{teamName}</p></div>
        <div><p className="text-xs text-text-tertiary">校园大使</p><p className="mt-1 font-medium">{applicantName}</p></div>
        <div><p className="text-xs text-text-tertiary">提交时间</p><p className="mt-1 font-medium">{submittedAt.slice(0, 19).replace("T", " ")}</p></div>
        <div><p className="text-xs text-text-tertiary">同意条款</p><p className="mt-1 font-medium">{terms ? readableAmbassadorTerms(terms) : termsId}</p></div>
      </div>
      {!fromSnapshot && <p className="mt-4 rounded-control bg-warning-bg p-3 text-xs text-warning-text">提示：该申请提交时未保存表单版本，当前使用活动最新配置展示答案。如后续修改了问卷字段，历史答案可能出现字段错位。</p>}
    </div>
    <div className="divide-y divide-border-subtle">
      {fields.map((field, index) => <div key={field.id} className="p-5" data-testid={`answer-field-${field.id}`}>
        <div className="flex items-baseline gap-2">
          <span className="text-xs font-semibold text-text-tertiary">Q{index + 1}</span>
          <p className="font-medium">{field.label}{field.required && <span className="ml-1 text-danger">*</span>}</p>
          <span className="rounded-full bg-surface-subtle px-2 py-0.5 text-[11px] text-text-tertiary">{fieldTypeLabel[field.type]}</span>
        </div>
        <div className="mt-3 pl-6">
          {renderAnswer(field)}
        </div>
      </div>)}
    </div>
  </section>;
}

function TeamDetail({ campaignId, teamId }: { campaignId: string; teamId: string }) {
  const { campaigns, teams, validAcquisitions, setAmbassadorTeamName, setTeamIncentiveStatus } = useAmbassadorState();
  const campaign = campaigns.find(item => item.id === campaignId);
  const team = teams.find(item => item.id === teamId);
  const resolvedTeamName = team ? ambassadorTeamDisplayName(team) : "";
  const [teamNameDraft, setTeamNameDraft] = useState(resolvedTeamName);
  useEffect(() => setTeamNameDraft(resolvedTeamName), [resolvedTeamName]);
  if (!campaign || !team) return <CampaignDetail campaignId={campaignId} />;
  const acquisitions = validAcquisitions.filter(item => item.teamId === team.id);
  const ambassador = team.members.find(member => member.role === "ambassador");
  const form = ambassadorApplicationForm(campaign);
  return <div className="space-y-6">
    <Link to={`/admin/ambassadors/${campaignId}`} className="inline-flex items-center gap-2 text-sm font-semibold text-text-brand"><ArrowLeft size={16} />返回活动详情</Link>
    <section className="rounded-container border border-border-subtle bg-surface p-6"><p className="text-xs text-text-tertiary">团队详情 · {campaign.name}</p><h1 className="mt-2 text-2xl font-semibold">{resolvedTeamName}</h1><div className="mt-4 flex flex-wrap gap-2"><StatusTag tone={team.status === "lit" ? "success" : team.status === "ended" ? "neutral" : "warning"}>{teamLabel[team.status]}</StatusTag><span className="rounded-control bg-surface-subtle px-3 py-1.5 text-xs">{schools[team.schoolId] ?? team.schoolId}</span><span className="rounded-control bg-surface-subtle px-3 py-1.5 text-xs">{ambassadorTeamMemberCount(team)} 人</span></div><div className="mt-5 rounded-control bg-surface-subtle p-4"><label className="text-sm font-medium">后台团队名<div className="mt-2 flex flex-col gap-2 sm:flex-row"><input value={teamNameDraft} onChange={event => setTeamNameDraft(event.target.value)} placeholder={resolvedTeamName} className="min-h-10 min-w-0 flex-1 rounded-control border border-border-subtle bg-surface px-3 text-sm" /><Button type="button" onClick={() => setAmbassadorTeamName(team.id, teamNameDraft)}>保存团队名</Button></div></label><p className="mt-2 text-xs text-text-tertiary">仅供后台识别、运营分析与后续导出使用；App 暂不展示。清空保存时会恢复稳定兜底名称。</p></div></section>
    {ambassador && ambassador.application && <QuestionnaireAnswerView
      ambassador={ambassador}
      campaign={campaign}
      teamName={resolvedTeamName}
      schoolName={schools[team.schoolId] ?? team.schoolId}
    />}
    <section className="rounded-container border border-border-subtle bg-surface p-5"><h2 className="font-semibold">成员</h2><div className="mt-4 divide-y divide-border-subtle">{team.members.map(member => <div key={member.id} className="flex flex-wrap items-center gap-3 py-3"><span className="font-mono text-sm">{member.accountId}</span><StatusTag tone="neutral">{member.role === "ambassador" ? "校园大使" : "校园推荐官"}</StatusTag><span className="ml-auto text-sm">有效新增 {acquisitions.filter(item => item.promoterAccountId === member.accountId).length}</span></div>)}</div></section>
    <section className="rounded-container border border-border-subtle bg-surface p-5"><h2 className="font-semibold">拉新与运营成果</h2><div className="mt-4 grid gap-3 sm:grid-cols-3"><div className="rounded-control bg-surface-subtle p-4"><p className="text-xs text-text-tertiary">团队有效新增</p><p className="mt-2 text-2xl font-semibold">{acquisitions.length}</p></div><div className="rounded-control bg-surface-subtle p-4"><p className="text-xs text-text-tertiary">校园大使贡献</p><p className="mt-2 text-2xl font-semibold">{acquisitions.filter(item => item.promoterAccountId === ambassador?.accountId).length}</p></div><div className="rounded-control bg-surface-subtle p-4"><p className="text-xs text-text-tertiary">团队激励状态</p><p className="mt-2 text-lg font-semibold">{incentiveLabel[team.incentiveStatus]}</p></div></div><h3 className="mt-6 text-sm font-semibold">推广明细</h3>{acquisitions.length ? <div className="mt-2 space-y-2 text-xs text-text-secondary">{acquisitions.map(item => <p key={item.id}>{item.registeredAt.slice(0, 10)} · {item.promoterAccountId} 带来新用户 {item.newAccountId}</p>)}</div> : <p className="mt-2 text-sm text-text-tertiary">暂无有效新增记录。</p>}<div className="mt-6 flex items-center gap-3"><button type="button" onClick={() => setTeamIncentiveStatus(team.id, team.incentiveStatus === "processed" ? "unprocessed" : "processed")} className="rounded-control border border-border-subtle px-3 py-2 text-xs font-semibold">标记为{team.incentiveStatus === "processed" ? "未处理" : "已处理"}</button></div></section>
  </div>;
}

export function T046AmbassadorConsole() {
  const { campaignId, teamId } = useParams();
  return teamId && campaignId ? <TeamDetail campaignId={campaignId} teamId={teamId} /> : campaignId ? <CampaignDetail campaignId={campaignId} /> : <CampaignList />;
}
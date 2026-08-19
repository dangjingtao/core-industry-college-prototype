import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { AlertTriangle, CheckCircle2, Image as ImageIcon, ListChecks, Share2, Video } from "lucide-react";
import { Button, Card, PageHeader, PublicShell, SecondaryButton, Section, StatusTag } from "../../components/ui";
import { resultById, resultDetailById, taskById, workspaceData } from "./data";
import { T013AResultDetailPage } from "./T013AResultDetailPage";
import { useWorkshopRuntime, type WorkshopResultDraft } from "./runtime";
import { CompetitionContextLine, RequireCompetitionAccess } from "./shared";

const specialResultIds = new Set(["result-s3-copy-kit", "result-s3-visual-kit", "result-s4-weekly-review"]);

const copyBlocks = [
  { label: "标题", title: "小红书 / 短内容标题", body: "岭南植物精粹，先别急着讲成分：这次从宿舍里的真实护肤场景开始。" },
  { label: "详情页文案", title: "商品详情页表达", body: "先讲使用问题和真实体验，再补充植物成分依据；把校园试用反馈放在核心卖点之后，减少只讲概念的距离感。" },
  { label: "短视频脚本", title: "15 秒短视频脚本", body: "0–3 秒展示真实使用困扰；4–9 秒产品近景与使用过程；10–13 秒补充成分依据；14–15 秒给出明确试用动作。" },
  { label: "直播脚本 / 话术", title: "直播开场与转化话术", body: "先问观众最常遇到的肤感问题，再用产品体验回答，不把植物成分当唯一卖点；首购利益点放在体验说明之后。" },
  { label: "客服话术", title: "常见咨询回复", body: "围绕适用场景、使用方式、规格和售后做事实型回答；对成分功效不做超出项目材料的承诺。" },
];

const mediaBlocks = [
  { kind: "image" as const, title: "商品近景主图", body: "产品包装与真实质地为主体，保留品牌标识和商品颜色；示例占位，不代表真实 AI 生图结果。" },
  { kind: "image" as const, title: "校园使用场景图", body: "宿舍 / 校园自然光场景，强调真实使用，不改变包装结构；示例占位。" },
  { kind: "video" as const, title: "15 秒短视频分镜", body: "问题场景 → 产品近景 → 使用动作 → 利益点 → 行动提示；当前仅提供分镜和占位画面说明。" },
  { kind: "video" as const, title: "直播间循环素材", body: "产品卖点、试用反馈和首购提示三段循环；当前不生成真实视频文件。" },
];

type ResultEditorProps = {
  competitionId: string;
  resultId: string;
  accepted: boolean;
  submitted: boolean;
  isCaptain: boolean;
  editing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onSaveAndSubmit: () => void;
  onCancel: () => void;
  onShare: () => void;
  onSubmit: () => void;
  onAccept: () => void;
};

function ResultStatus({ accepted, submitted }: { accepted: boolean; submitted: boolean }) {
  return <StatusTag tone={accepted ? "success" : submitted ? "info" : "neutral"}>{accepted ? "队长已采纳" : submitted ? "已提交队长确认" : "待团队确认"}</StatusTag>;
}

function PendingConfirmation({ isCaptain, submitted, accepted }: { isCaptain: boolean; submitted: boolean; accepted: boolean }) {
  if (!isCaptain || !submitted || accepted) return null;
  return <Card className="border border-info bg-info-bg" data-testid="result-confirmation-pending"><p className="font-medium text-info-text">队员已提交确认</p><p className="mt-2 text-sm leading-5 text-info-text">该成果已进入队长确认状态；队长采纳后 pending 状态会被清除。</p></Card>;
}

function ResultActions(props: ResultEditorProps) {
  const { accepted, submitted, isCaptain, editing } = props;
  return <div className="space-y-2">
    {editing ? <>
      <Button className="w-full" onClick={isCaptain ? props.onSave : props.onSaveAndSubmit}>{isCaptain ? "保存编辑" : "保存编辑并提交确认"}</Button>
      <SecondaryButton className="w-full" onClick={props.onCancel}>取消编辑</SecondaryButton>
    </> : <>
      <div className="grid grid-cols-2 gap-2"><SecondaryButton onClick={props.onEdit}>编辑成果</SecondaryButton><SecondaryButton onClick={props.onShare}><Share2 size={16} aria-hidden="true" className="mr-2 inline-block" />分享成果</SecondaryButton></div>
      {!isCaptain && !accepted && <Button disabled={submitted} className="w-full" onClick={props.onSubmit}>{submitted ? "已提交队长确认" : "提交队长确认"}</Button>}
      {isCaptain && !accepted && <Button className="w-full" onClick={props.onAccept}>队长采纳并用于比赛</Button>}
    </>}
  </div>;
}

function RolePreview({ rolePreview, setRolePreview }: { rolePreview: "default" | "member"; setRolePreview: (role: "default" | "member") => void }) {
  return <details className="rounded-container border border-border-subtle bg-surface p-3 text-xs text-text-secondary"><summary className="cursor-pointer font-medium text-text-brand">成果角色原型</summary><div className="mt-2 flex gap-2"><button type="button" className="min-h-touch rounded-control bg-surface-subtle px-3" onClick={() => setRolePreview("member")}>模拟队员视角</button><button type="button" className="min-h-touch rounded-control bg-surface-subtle px-3" onClick={() => setRolePreview("default")}>恢复队长视角</button></div><p className="mt-2">当前：{rolePreview === "member" ? "队员" : "赛事团队默认角色"}</p></details>;
}

function useResultEditor(competitionId: string, resultId: string, defaultHighlights: string[]) {
  const { getRuntime, updateResultDraft, submitResultForConfirmation, acceptResult } = useWorkshopRuntime();
  const runtime = getRuntime(competitionId);
  const result = resultById(resultId)!;
  const stored = runtime.resultDrafts[resultId] ?? { summary: result.summary, highlights: defaultHighlights, nextSuggestion: result.nextSuggestion };
  const [summary, setSummary] = useState(stored.summary);
  const [highlights, setHighlights] = useState(stored.highlights.length === defaultHighlights.length ? stored.highlights : defaultHighlights);
  const [editing, setEditing] = useState(false);
  const [shared, setShared] = useState(false);
  const [rolePreview, setRolePreview] = useState<"default" | "member">("default");
  const accepted = runtime.acceptedResultIds.includes(resultId);
  const submitted = runtime.resultConfirmationStatus[resultId] === "pending";
  const isCaptain = rolePreview === "member" ? false : workspaceData[competitionId]?.team.role.includes("队长") ?? false;
  const draft = (): WorkshopResultDraft => ({ summary, highlights, nextSuggestion: stored.nextSuggestion });
  const save = () => { updateResultDraft(competitionId, resultId, draft()); setEditing(false); };
  const saveAndSubmit = () => { updateResultDraft(competitionId, resultId, draft()); submitResultForConfirmation(competitionId, resultId); setEditing(false); };
  const cancel = () => { setSummary(stored.summary); setHighlights(stored.highlights.length === defaultHighlights.length ? stored.highlights : defaultHighlights); setEditing(false); };
  return { runtime, result, summary, setSummary, highlights, setHighlights, editing, setEditing, shared, setShared, rolePreview, setRolePreview, accepted, submitted, isCaptain, save, saveAndSubmit, cancel, submit: () => submitResultForConfirmation(competitionId, resultId), accept: () => acceptResult(competitionId, resultId) };
}

function S3CopyResult({ competitionId, resultId }: { competitionId: string; resultId: string }) {
  const editor = useResultEditor(competitionId, resultId, copyBlocks.map(item => item.body));
  return <PublicShell showNavigation={false}><PageHeader title="文案成果详情" backTo={`/competitions/${competitionId}/workspace/workshop/results`} /><RequireCompetitionAccess><div className="space-y-6 px-4 py-5">
    <CompetitionContextLine competitionId={competitionId} />
    <Card><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-medium text-text-brand">S3 · 平台 / 内容运营</p><h1 className="mt-2 text-xl font-semibold leading-7 text-text-primary">{editor.result.title}</h1></div><ResultStatus accepted={editor.accepted} submitted={editor.submitted} /></div>{editor.editing ? <textarea aria-label="成果摘要" value={editor.summary} onChange={event => editor.setSummary(event.target.value)} rows={3} className="mt-4 w-full rounded-control border border-border bg-surface p-3 text-sm text-text-primary" /> : <p className="mt-4 text-sm leading-6 text-text-secondary">{editor.summary}</p>}</Card>
    <PendingConfirmation isCaptain={editor.isCaptain} submitted={editor.submitted} accepted={editor.accepted} />
    <Section title="内容素材卡"><div className="space-y-3">{copyBlocks.map((block, index) => <Card key={block.label} data-testid={`s3-copy-block-${index}`}><StatusTag tone="neutral">{block.label}</StatusTag><h2 className="mt-3 font-semibold text-text-primary">{block.title}</h2>{editor.editing ? <textarea aria-label={block.label} value={editor.highlights[index] ?? ""} onChange={event => editor.setHighlights(current => current.map((value, valueIndex) => valueIndex === index ? event.target.value : value))} rows={4} className="mt-3 w-full rounded-control border border-border bg-surface p-3 text-sm leading-6 text-text-primary" /> : <p className="mt-3 text-sm leading-6 text-text-secondary">{editor.highlights[index]}</p>}</Card>)}</div></Section>
    {editor.shared && <p className="text-center text-xs text-text-secondary">分享内容已准备</p>}
    <ResultActions competitionId={competitionId} resultId={resultId} accepted={editor.accepted} submitted={editor.submitted} isCaptain={editor.isCaptain} editing={editor.editing} onEdit={() => editor.setEditing(true)} onSave={editor.save} onSaveAndSubmit={editor.saveAndSubmit} onCancel={editor.cancel} onShare={() => editor.setShared(true)} onSubmit={editor.submit} onAccept={editor.accept} />
    <RolePreview rolePreview={editor.rolePreview} setRolePreview={editor.setRolePreview} />
  </div></RequireCompetitionAccess></PublicShell>;
}

function MediaPreview({ kind, title }: { kind: "image" | "video"; title: string }) {
  return <div className="flex min-h-36 items-center justify-center rounded-control border border-dashed border-border bg-surface-subtle" aria-label={`${title} 原型占位`}><div className="text-center text-text-tertiary">{kind === "image" ? <ImageIcon size={36} aria-hidden="true" className="mx-auto" /> : <Video size={36} aria-hidden="true" className="mx-auto" />}<p className="mt-2 text-xs">原型示例占位</p></div></div>;
}

function S3VisualResult({ competitionId, resultId }: { competitionId: string; resultId: string }) {
  const editor = useResultEditor(competitionId, resultId, mediaBlocks.map(item => item.body));
  const images = mediaBlocks.map((item, index) => ({ ...item, index })).filter(item => item.kind === "image");
  const videos = mediaBlocks.map((item, index) => ({ ...item, index })).filter(item => item.kind === "video");
  return <PublicShell showNavigation={false}><PageHeader title="图片 / 视频成果" backTo={`/competitions/${competitionId}/workspace/workshop/results`} /><RequireCompetitionAccess><div className="space-y-6 px-4 py-5">
    <CompetitionContextLine competitionId={competitionId} />
    <Card><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-medium text-text-brand">S3 · 图片 / 视频内容生成</p><h1 className="mt-2 text-xl font-semibold leading-7 text-text-primary">{editor.result.title}</h1></div><ResultStatus accepted={editor.accepted} submitted={editor.submitted} /></div>{editor.editing ? <textarea aria-label="成果摘要" value={editor.summary} onChange={event => editor.setSummary(event.target.value)} rows={3} className="mt-4 w-full rounded-control border border-border bg-surface p-3 text-sm text-text-primary" /> : <p className="mt-4 text-sm leading-6 text-text-secondary">{editor.summary}</p>}</Card>
    <PendingConfirmation isCaptain={editor.isCaptain} submitted={editor.submitted} accepted={editor.accepted} />
    <Card className="border border-info bg-info-bg"><p className="font-medium text-info-text">原型示例成果</p><p className="mt-2 text-sm leading-5 text-info-text">以下图片 / 视频均为中保真占位和内容方案，没有调用真实生成服务，也不冒充实际生成文件。</p></Card>
    <Section title="图片素材区域"><div className="space-y-3">{images.map(item => <Card key={item.title} data-testid={`s3-image-asset-${item.index}`}><MediaPreview kind="image" title={item.title} /><h2 className="mt-3 font-semibold text-text-primary">{item.title}</h2>{editor.editing ? <textarea aria-label={item.title} value={editor.highlights[item.index] ?? ""} onChange={event => editor.setHighlights(current => current.map((value, valueIndex) => valueIndex === item.index ? event.target.value : value))} rows={3} className="mt-2 w-full rounded-control border border-border bg-surface p-3 text-sm text-text-primary" /> : <p className="mt-2 text-sm leading-5 text-text-secondary">{editor.highlights[item.index]}</p>}</Card>)}</div></Section>
    <Section title="视频素材区域"><div className="space-y-3">{videos.map(item => <Card key={item.title} data-testid={`s3-video-asset-${item.index}`}><MediaPreview kind="video" title={item.title} /><h2 className="mt-3 font-semibold text-text-primary">{item.title}</h2>{editor.editing ? <textarea aria-label={item.title} value={editor.highlights[item.index] ?? ""} onChange={event => editor.setHighlights(current => current.map((value, valueIndex) => valueIndex === item.index ? event.target.value : value))} rows={3} className="mt-2 w-full rounded-control border border-border bg-surface p-3 text-sm text-text-primary" /> : <p className="mt-2 text-sm leading-5 text-text-secondary">{editor.highlights[item.index]}</p>}</Card>)}</div></Section>
    <ResultActions competitionId={competitionId} resultId={resultId} accepted={editor.accepted} submitted={editor.submitted} isCaptain={editor.isCaptain} editing={editor.editing} onEdit={() => editor.setEditing(true)} onSave={editor.save} onSaveAndSubmit={editor.saveAndSubmit} onCancel={editor.cancel} onShare={() => editor.setShared(true)} onSubmit={editor.submit} onAccept={editor.accept} />
    <RolePreview rolePreview={editor.rolePreview} setRolePreview={editor.setRolePreview} />
  </div></RequireCompetitionAccess></PublicShell>;
}

function S4Result({ competitionId, resultId }: { competitionId: string; resultId: string }) {
  const result = resultById(resultId)!;
  const editor = useResultEditor(competitionId, resultId, result.highlights);
  const detail = resultDetailById(resultId);
  const detailedAnalysis = useMemo(() => "本周曝光增长没有同步转化为成交，漏斗主要损耗集中在详情页到加购阶段。结合首购表现与复购样本，下一轮应先只调整一个关键变量，再观察一周趋势，避免同时扩大投放造成归因失真。", []);
  return <PublicShell showNavigation={false}><PageHeader title="经营周报分析" backTo={`/competitions/${competitionId}/workspace/workshop/results`} /><RequireCompetitionAccess><div className="space-y-6 px-4 py-5">
    <CompetitionContextLine competitionId={competitionId} />
    <Card><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-medium text-text-brand">S4 · 数据复盘</p><h1 className="mt-2 text-xl font-semibold leading-7 text-text-primary">经营周报分析小报告</h1></div><ResultStatus accepted={editor.accepted} submitted={editor.submitted} /></div>{editor.editing ? <textarea aria-label="成果摘要" value={editor.summary} onChange={event => editor.setSummary(event.target.value)} rows={3} className="mt-4 w-full rounded-control border border-border bg-surface p-3 text-sm text-text-primary" /> : <p className="mt-4 text-sm leading-6 text-text-secondary">{editor.summary}</p>}</Card>
    <PendingConfirmation isCaptain={editor.isCaptain} submitted={editor.submitted} accepted={editor.accepted} />
    {detail && <Card className="border border-info bg-info-bg" data-testid="s4-rating"><div className="flex items-start justify-between gap-3"><div className="flex items-center gap-2"><CheckCircle2 size={20} aria-hidden="true" className="text-info-text" /><p className="font-medium text-info-text">报告评级与多维评估</p></div><div className="text-right"><strong className="block text-2xl text-info-text">{detail.score}</strong><span className="text-xs text-info-text">/ 100 · {detail.rating}</span></div></div><div className="mt-4 grid grid-cols-3 gap-2">{detail.dimensions.map(item => <div key={item.label} className="rounded-control bg-surface px-2 py-3 text-center"><strong className="block text-lg text-text-primary">{item.score}</strong><span className="text-xs text-text-secondary">{item.label}</span></div>)}</div></Card>}
    <Section title="核心发现 / 关键结论"><Card>{editor.editing ? <div className="space-y-2">{editor.highlights.map((item, index) => <textarea key={index} aria-label={`关键结论 ${index + 1}`} value={item} onChange={event => editor.setHighlights(current => current.map((value, valueIndex) => valueIndex === index ? event.target.value : value))} rows={2} className="w-full rounded-control border border-border bg-surface p-2 text-sm text-text-primary" />)}</div> : <ul className="space-y-2">{editor.highlights.map(item => <li key={item} className="text-sm leading-5 text-text-primary">· {item}</li>)}</ul>}</Card></Section>
    {detail && <Section title="薄弱环节"><Card><div className="flex items-start gap-3"><AlertTriangle size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-warning-text" /><div><p className="text-sm font-medium text-text-primary">{detail.weakness}</p><ul className="mt-3 space-y-2">{detail.risks.map(item => <li key={item} className="text-sm text-warning-text">· {item}</li>)}</ul></div></div></Card></Section>}
    {detail && <Section title="优先行动清单"><Card><ul className="space-y-3">{detail.actions.map(item => <li key={item} className="flex items-start gap-2 text-sm leading-5 text-text-primary"><ListChecks size={15} aria-hidden="true" className="mt-0.5 shrink-0 text-success-text" />{item}</li>)}</ul></Card></Section>}
    <Section title="详细分析"><Card><p className="text-sm leading-6 text-text-secondary">{detailedAnalysis}</p></Card></Section>
    <ResultActions competitionId={competitionId} resultId={resultId} accepted={editor.accepted} submitted={editor.submitted} isCaptain={editor.isCaptain} editing={editor.editing} onEdit={() => editor.setEditing(true)} onSave={editor.save} onSaveAndSubmit={editor.saveAndSubmit} onCancel={editor.cancel} onShare={() => editor.setShared(true)} onSubmit={editor.submit} onAccept={editor.accept} />
    <RolePreview rolePreview={editor.rolePreview} setRolePreview={editor.setRolePreview} />
  </div></RequireCompetitionAccess></PublicShell>;
}

export function T013BResultDetailPage() {
  const { competitionId, resultId } = useParams();
  const { getRuntime } = useWorkshopRuntime();
  if (!competitionId || !resultId || !specialResultIds.has(resultId)) return <T013AResultDetailPage />;
  const result = resultById(resultId);
  const task = result ? taskById(result.taskId) : undefined;
  const completed = task ? getRuntime(competitionId).taskRuns[task.id]?.status === "completed" : false;
  if (!result || !task || !completed) return <PublicShell showNavigation={false}><PageHeader title="成果详情" backTo={`/competitions/${competitionId}/workspace/workshop/results`} /><RequireCompetitionAccess><div className="px-4 py-6"><Card className="border border-warning bg-warning-bg"><p className="font-medium text-warning-text">该成果尚未生成</p><p className="mt-2 text-sm text-warning-text">请先完成对应的 S3 / S4 Task Runtime 任务。</p></Card></div></RequireCompetitionAccess></PublicShell>;
  if (resultId === "result-s3-copy-kit") return <S3CopyResult competitionId={competitionId} resultId={resultId} />;
  if (resultId === "result-s3-visual-kit") return <S3VisualResult competitionId={competitionId} resultId={resultId} />;
  return <S4Result competitionId={competitionId} resultId={resultId} />;
}

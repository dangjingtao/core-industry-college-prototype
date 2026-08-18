import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AlertTriangle, CheckCircle2, FileText, ListChecks } from "lucide-react";
import { Button, Card, PageHeader, PublicShell, SecondaryButton, Section, StatusTag } from "../../components/ui";
import { resultById, resultDetailById, taskById, workspaceData } from "./data";
import { useWorkshopRuntime, type WorkshopResultDraft } from "./runtime";
import { CompetitionContextLine, RequireCompetitionAccess, TaskScenarioTools } from "./shared";
import { WorkshopResultDetailPage as LegacyWorkshopResultDetailPage } from "./WorkshopPages";

type T013AReportPresentation = {
  title: string;
  analysis: string;
  dimensions: { label: string; score: number }[];
  showRisks: boolean;
};

const reportPresentation: Record<string, T013AReportPresentation> = {
  "result-s1-product-score": {
    title: "选品评分小报告",
    analysis: "当前目标用户、价格带和产品卖点已经形成初步假设。下一轮应把“植物成分 / 头皮修护”等概念转成可观察的用户选择证据，并补足同价位竞品、渠道效率与首单产能信息。AI 建议仅用于团队判断，不替代赛事事实。",
    dimensions: [
      { label: "市场空间", score: 84 },
      { label: "用户需求", score: 82 },
      { label: "竞争差异", score: 72 },
      { label: "产品匹配", score: 80 },
      { label: "渠道机会", score: 76 },
      { label: "落地可行性", score: 70 },
    ],
    showRisks: false,
  },
  "result-s2-market-feasibility": {
    title: "市场可行性分析小报告",
    analysis: "现有回答说明团队已经具备渠道和卖点假设，但市场可行性仍取决于真实流量、转化、复购和竞品数据。建议先补齐缺失证据，再决定扩大投放或调整渠道。AI 诊断不改写团队档案中的可信事实。",
    dimensions: [
      { label: "市场需求", score: 84 },
      { label: "目标用户", score: 82 },
      { label: "竞争位置", score: 76 },
      { label: "商业模式", score: 70 },
      { label: "团队资源", score: 80 },
      { label: "落地风险", score: 74 },
    ],
    showRisks: true,
  },
};

function emptyDraft(result: NonNullable<ReturnType<typeof resultById>>): WorkshopResultDraft {
  return { summary: result.summary, highlights: result.highlights, nextSuggestion: result.nextSuggestion };
}

export function T013AResultDetailPage() {
  const navigate = useNavigate();
  const { competitionId, resultId } = useParams();
  const { getRuntime, updateResultDraft, saveResultVersion, acceptResult } = useWorkshopRuntime();
  const presentation = resultId ? reportPresentation[resultId] : undefined;

  if (!presentation) return <LegacyWorkshopResultDetailPage />;
  if (!competitionId || !resultId) return null;

  const runtime = getRuntime(competitionId);
  const result = resultById(resultId);
  const task = result ? taskById(result.taskId) : undefined;
  const completed = task ? runtime.taskRuns[task.id]?.status === "completed" : false;

  if (!result || !task || !completed) {
    return <PublicShell showNavigation={false}><PageHeader title="成果详情" backTo={`/competitions/${competitionId}/workspace/workshop/results`} /><RequireCompetitionAccess><div className="px-4 py-6"><Card className="border border-warning bg-warning-bg"><p className="font-medium text-warning-text">该成果尚未生成</p><p className="mt-2 text-sm text-warning-text">成果严格绑定当前任务，不复用其它技能结果。</p></Card></div></RequireCompetitionAccess></PublicShell>;
  }

  const detail = resultDetailById(result.id);
  const initialDraft = runtime.resultDrafts[result.id] ?? emptyDraft(result);
  const [draft, setDraft] = useState<WorkshopResultDraft>(initialDraft);
  const [editing, setEditing] = useState(false);
  const [shared, setShared] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const versions = runtime.resultVersions[result.id] ?? [];
  const accepted = runtime.acceptedResultIds.includes(result.id);
  const isCaptain = workspaceData[competitionId]?.team.role.includes("队长") ?? false;

  useEffect(() => {
    setDraft(runtime.resultDrafts[result.id] ?? emptyDraft(result));
    setEditing(false);
    setShared(false);
    setSubmitted(false);
  }, [result.id]);

  const saveDraft = () => {
    updateResultDraft(competitionId, result.id, draft);
    setEditing(false);
  };

  return <PublicShell showNavigation={false}><PageHeader title="成果详情" backTo={`/competitions/${competitionId}/workspace/workshop/results`} /><RequireCompetitionAccess><div className="space-y-6 px-4 py-5">
    <CompetitionContextLine competitionId={competitionId} />
    <Card><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-medium text-text-brand">AI 辅助生成 · {task.skillId.toUpperCase()} · {task.title}</p><h1 className="mt-2 text-xl font-semibold leading-7 text-text-primary">{presentation.title}</h1></div><StatusTag tone={accepted ? "success" : submitted ? "info" : "neutral"}>{accepted ? "队长已采纳" : submitted ? "已提交队长确认" : "待团队确认"}</StatusTag></div>{editing ? <textarea aria-label="成果摘要" value={draft.summary} onChange={event => setDraft(current => ({ ...current, summary: event.target.value }))} rows={4} className="mt-4 w-full rounded-control border border-border bg-surface p-3 text-sm text-text-primary" /> : <p className="mt-4 text-sm leading-6 text-text-secondary">{draft.summary}</p>}</Card>

    {detail && <Card className="border border-info bg-info-bg" data-testid="result-score-hero"><div className="flex items-start justify-between gap-3"><div className="flex items-center gap-2"><div className="rounded-control bg-surface p-2 text-info-text"><CheckCircle2 aria-hidden="true" size={20} strokeWidth={2} /></div><p className="font-medium text-info-text">评分概览</p></div><div className="text-right"><strong className="block text-2xl font-semibold text-info-text" data-testid="result-score-value">{detail.score}</strong><span className="text-xs text-info-text">/ 100 · {detail.rating}</span></div></div></Card>}

    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <Card data-testid="result-quadrant-finding"><div className="flex items-start gap-3"><div className="rounded-control bg-info-bg p-2 text-info-text"><FileText aria-hidden="true" size={18} strokeWidth={2} /></div><div className="min-w-0 flex-1"><p className="text-xs font-medium text-text-brand">关键结论</p><h2 className="mt-1 text-sm font-semibold text-text-primary">核心发现</h2></div></div><ul className="mt-3 space-y-2">{draft.highlights.map((item, index) => <li key={`finding-${index}`}>{editing ? <textarea aria-label={`关键结论 ${index + 1}`} value={item} onChange={event => setDraft(current => ({ ...current, highlights: current.highlights.map((value, valueIndex) => valueIndex === index ? event.target.value : value) }))} rows={2} className="w-full rounded-control border border-border bg-surface p-2 text-sm text-text-primary" /> : <p className="text-sm leading-5 text-text-primary">· {item}</p>}</li>)}</ul></Card>
      {detail && <Card data-testid="result-quadrant-weakness"><div className="flex items-start gap-3"><div className="rounded-control bg-warning-bg p-2 text-warning-text"><AlertTriangle aria-hidden="true" size={18} strokeWidth={2} /></div><div className="min-w-0 flex-1"><p className="text-xs font-medium text-text-brand">{presentation.showRisks ? "薄弱环节与风险" : "薄弱环节"}</p><h2 className="mt-1 text-sm font-semibold text-text-primary">需要补强</h2></div></div><p className="mt-3 text-sm leading-5 text-text-primary">{detail.weakness}</p>{presentation.showRisks && <ul className="mt-3 space-y-2">{detail.risks.map(risk => <li key={risk} className="text-sm leading-5 text-warning-text">· 风险：{risk}</li>)}</ul>}</Card>}
    </div>

    {detail && <Card data-testid="result-quadrant-actions"><div className="flex items-start gap-3"><div className="rounded-control bg-success-bg p-2 text-success-text"><ListChecks aria-hidden="true" size={18} strokeWidth={2} /></div><div className="min-w-0 flex-1"><p className="text-xs font-medium text-text-brand">优先行动清单</p><h2 className="mt-1 text-sm font-semibold text-text-primary">按优先级执行</h2></div></div><ul className="mt-3 space-y-2">{detail.actions.map(action => <li key={action} className="flex items-start gap-2 text-sm leading-5 text-text-primary"><ListChecks aria-hidden="true" size={14} strokeWidth={2} className="mt-1 shrink-0 text-text-tertiary" /><span>{action}</span></li>)}</ul></Card>}

    <Section title="详细分析"><Card><p className="text-sm leading-6 text-text-secondary">{presentation.analysis}</p></Card></Section>

    <Section title="六维项目评估"><div className="space-y-2">{presentation.dimensions.map(dimension => <Card key={dimension.label}><div className="flex items-center gap-3"><span className="w-20 text-sm text-text-secondary">{dimension.label}</span><div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-subtle"><div className="h-full bg-primary" style={{ width: `${dimension.score}%` }} /></div><strong className="w-8 text-right text-sm text-text-primary">{dimension.score}</strong></div></Card>)}</div></Section>

    <Card className="border border-info bg-info-bg"><p className="font-medium text-info-text">团队协作边界</p><p className="mt-2 text-sm leading-5 text-info-text">结果对全队可见；队员可编辑后提交确认，队长可采纳或标记用于比赛。AI 建议不改写赛事可信事实。</p></Card>

    <Card className="border border-info bg-info-bg"><p className="font-medium text-info-text">下一步建议</p>{editing ? <textarea aria-label="下一步建议" value={draft.nextSuggestion} onChange={event => setDraft(current => ({ ...current, nextSuggestion: event.target.value }))} rows={3} className="mt-2 w-full rounded-control border border-border bg-surface p-3 text-sm text-text-primary" /> : <p className="mt-2 text-sm leading-5 text-info-text">{draft.nextSuggestion}</p>}</Card>

    {versions.length > 0 && <Section title="已保存版本"><div className="space-y-2">{versions.map(version => <Card key={version.id}><div className="flex items-center justify-between gap-3"><span className="text-sm font-medium text-text-primary">{version.id}</span><span className="text-xs text-text-secondary">{version.createdAt}</span></div></Card>)}</div></Section>}

    <div className="space-y-2">
      {editing ? <><Button className="w-full" onClick={saveDraft}>保存编辑</Button><SecondaryButton className="w-full" onClick={() => { setDraft(initialDraft); setEditing(false); }}>取消编辑</SecondaryButton></> : <>
        <div className="grid grid-cols-2 gap-2"><SecondaryButton onClick={() => setEditing(true)}>编辑成果</SecondaryButton><SecondaryButton onClick={() => setShared(true)}>{shared ? "已分享" : "分享"}</SecondaryButton></div>
        <SecondaryButton className="w-full" onClick={() => saveResultVersion(competitionId, result.id)}>保存为新版本</SecondaryButton>
        {isCaptain ? !accepted && <Button className="w-full" onClick={() => acceptResult(competitionId, result.id)}>队长采纳并用于比赛</Button> : <Button disabled={submitted} className="w-full" onClick={() => setSubmitted(true)}>{submitted ? "已提交队长确认" : "提交队长确认"}</Button>}
      </>}
      <Button className="w-full" onClick={() => navigate(`/competitions/${competitionId}/workspace/workshop/results`)}>返回历史成果</Button>
    </div>
    <TaskScenarioTools competitionId={competitionId} taskId={task.id} />
  </div></RequireCompetitionAccess></PublicShell>;
}
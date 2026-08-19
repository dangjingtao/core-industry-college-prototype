import { useEffect, useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { Building2, EyeOff, FileText, Presentation, Share2, Users } from "lucide-react";
import { Button, Card, PageHeader, PublicShell, SecondaryButton, Section, StatusTag } from "../../components/ui";
import { companies } from "../public-platform/data";
import { resultById, taskById, workspaceData } from "./data";
import { T013BResultDetailPage } from "./T013BResultPage";
import { useWorkshopRuntime, type WorkshopResultDraft } from "./runtime";
import { CompetitionContextLine, RequireCompetitionAccess } from "./shared";

const specialResultIds = new Set(["result-s5-pitch-ppt", "result-s6-company-match"]);

function defaultDraft(resultId: string) {
  const result = resultById(resultId);
  return result ? { summary: result.summary, highlights: result.highlights, nextSuggestion: result.nextSuggestion } : { summary: "", highlights: [], nextSuggestion: "" };
}

function ResultGate({ competitionId, resultId, children }: { competitionId: string; resultId: string; children: ReactNode }) {
  const { getRuntime } = useWorkshopRuntime();
  const result = resultById(resultId);
  const task = result ? taskById(result.taskId) : undefined;
  const completed = task ? getRuntime(competitionId).taskRuns[task.id]?.status === "completed" : false;
  if (!result || !task || !completed) {
    return <PublicShell showNavigation={false}><PageHeader title="成果详情" backTo={`/competitions/${competitionId}/workspace/workshop/results`} /><RequireCompetitionAccess><div className="px-4 py-6"><Card className="border border-warning bg-warning-bg"><p className="font-medium text-warning-text">该成果尚未生成</p><p className="mt-2 text-sm text-warning-text">请先完成当前赛事下对应的 Task Runtime 任务。</p></Card></div></RequireCompetitionAccess></PublicShell>;
  }
  return <>{children}</>;
}

function TeamResultActions({ competitionId, resultId, draft, setEditing, editing, resetDraft }: {
  competitionId: string;
  resultId: string;
  draft: WorkshopResultDraft;
  setEditing: (value: boolean) => void;
  editing: boolean;
  resetDraft: () => void;
}) {
  const { getRuntime, updateResultDraft, submitResultForConfirmation, acceptResult } = useWorkshopRuntime();
  const runtime = getRuntime(competitionId);
  const [shared, setShared] = useState(false);
  const [rolePreview, setRolePreview] = useState<"default" | "member">("default");
  const accepted = runtime.acceptedResultIds.includes(resultId);
  const submitted = runtime.resultConfirmationStatus[resultId] === "pending";
  const isCaptain = rolePreview === "member" ? false : workspaceData[competitionId]?.team.role.includes("队长") ?? false;

  const save = (submit: boolean) => {
    updateResultDraft(competitionId, resultId, draft);
    if (submit) submitResultForConfirmation(competitionId, resultId);
    setEditing(false);
  };

  return <div className="space-y-3">
    {isCaptain && submitted && !accepted && <Card className="border border-info bg-info-bg" data-testid="result-confirmation-pending"><p className="font-medium text-info-text">队员已提交确认</p><p className="mt-2 text-sm leading-5 text-info-text">队长可采纳并标记为用于比赛的团队成果。</p></Card>}

    <div className="space-y-2">
      {editing ? <>
        <Button className="w-full" onClick={() => save(!isCaptain)}>{isCaptain ? "保存编辑" : "保存编辑并提交确认"}</Button>
        <SecondaryButton className="w-full" onClick={() => { resetDraft(); setEditing(false); }}>取消编辑</SecondaryButton>
      </> : <>
        <div className="grid grid-cols-2 gap-2">
          <SecondaryButton onClick={() => setEditing(true)}>编辑成果</SecondaryButton>
          <SecondaryButton onClick={() => setShared(true)}><Share2 size={16} aria-hidden="true" className="mr-2 inline-block" />{shared ? "已准备分享" : "分享成果"}</SecondaryButton>
        </div>
        {!isCaptain && !accepted && <Button className="w-full" disabled={submitted} onClick={() => submitResultForConfirmation(competitionId, resultId)}>{submitted ? "已提交队长确认" : "提交队长确认"}</Button>}
        {isCaptain && !accepted && <Button className="w-full" onClick={() => acceptResult(competitionId, resultId)}>队长采纳并用于比赛</Button>}
      </>}
    </div>

    <details className="rounded-container border border-border-subtle bg-surface p-3 text-xs text-text-secondary">
      <summary className="cursor-pointer font-medium text-text-brand">成果角色原型</summary>
      <div className="mt-2 flex gap-2"><button type="button" className="min-h-touch rounded-control bg-surface-subtle px-3" onClick={() => setRolePreview("member")}>模拟队员视角</button><button type="button" className="min-h-touch rounded-control bg-surface-subtle px-3" onClick={() => setRolePreview("default")}>恢复队长视角</button></div>
      <p className="mt-2">当前：{rolePreview === "member" ? "队员" : "赛事团队默认角色"}</p>
    </details>
  </div>;
}

const pptSlides = [
  ["01", "项目问题与机会", "用一个明确问题建立路演上下文，不把预测当事实。"],
  ["02", "目标用户", "呈现已经验证的用户画像、访谈与真实需求证据。"],
  ["03", "解决方案", "说明产品 / 服务如何回应问题，并保留当前 MVP 边界。"],
  ["04", "市场与竞争", "用可追溯的市场证据和竞品差异支撑判断。"],
  ["05", "运营验证", "展示渠道、内容、订单或用户反馈中的真实数据。"],
  ["06", "商业模式", "解释价值交换、收入来源与仍待验证的关键假设。"],
  ["07", "增长计划", "明确下一阶段最小验证动作与资源需求。"],
  ["08", "团队与分工", "只使用当前赛事团队档案中的可信信息。"],
  ["09", "结尾与答辩", "收束核心价值，并准备最可能被追问的证据。"],
];

function S5PptResult({ competitionId, resultId }: { competitionId: string; resultId: string }) {
  const { getRuntime } = useWorkshopRuntime();
  const runtime = getRuntime(competitionId);
  const stored = runtime.resultDrafts[resultId] ?? defaultDraft(resultId);
  const [draft, setDraft] = useState<WorkshopResultDraft>(stored);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    setDraft(runtime.resultDrafts[resultId] ?? defaultDraft(resultId));
    setEditing(false);
  }, [competitionId, resultId]);

  const accepted = runtime.acceptedResultIds.includes(resultId);
  const submitted = runtime.resultConfirmationStatus[resultId] === "pending";

  return <PublicShell showNavigation={false}><PageHeader title="PPT 成果详情" backTo={`/competitions/${competitionId}/workspace/workshop/results`} /><RequireCompetitionAccess><div className="space-y-6 px-4 py-5">
    <CompetitionContextLine competitionId={competitionId} />
    <Card>
      <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-medium text-text-brand">S5 · 赛事冲刺</p><h1 className="mt-2 text-xl font-semibold leading-7 text-text-primary">路演 PPT</h1></div><StatusTag tone={accepted ? "success" : submitted ? "info" : "neutral"}>{accepted ? "队长已采纳" : submitted ? "已提交队长确认" : "待团队确认"}</StatusTag></div>
      {editing ? <textarea aria-label="成果摘要" value={draft.summary} onChange={event => setDraft(current => ({ ...current, summary: event.target.value }))} rows={4} className="mt-4 w-full rounded-control border border-border bg-surface p-3 text-sm text-text-primary" /> : <p className="mt-4 text-sm leading-6 text-text-secondary">{draft.summary}</p>}
    </Card>

    <Card className="border border-info bg-info-bg" data-testid="s5-ppt-mock-note"><div className="flex items-start gap-3"><Presentation size={20} aria-hidden="true" className="text-info-text" /><div><p className="font-medium text-info-text">原型 PPT 产物</p><p className="mt-2 text-sm leading-5 text-info-text">以下是可编辑的路演结构 mock，不是真实生成的 .pptx 文件，也不代表已向任何官方赛事系统提交。</p></div></div></Card>

    <Section title="PPT 页面结构"><div className="space-y-3">{pptSlides.map(([index, title, body]) => <Card key={index} data-testid={`s5-slide-${index}`}><div className="flex items-start gap-3"><div className="rounded-control bg-surface-subtle px-3 py-2 text-sm font-semibold text-text-brand">{index}</div><div><h2 className="font-semibold text-text-primary">{title}</h2><p className="mt-2 text-sm leading-5 text-text-secondary">{body}</p></div></div></Card>)}</div></Section>

    <Section title="AI 建议摘要"><Card><div className="space-y-3">{draft.highlights.map((item, index) => editing ? <textarea key={index} aria-label={`PPT 建议 ${index + 1}`} value={item} onChange={event => setDraft(current => ({ ...current, highlights: current.highlights.map((value, valueIndex) => valueIndex === index ? event.target.value : value) }))} rows={2} className="w-full rounded-control border border-border bg-surface p-2 text-sm text-text-primary" /> : <p key={`${item}-${index}`} className="text-sm leading-5 text-text-primary">· {item}</p>)}</div></Card></Section>

    <Card className="border border-info bg-info-bg"><div className="flex items-start gap-3"><Users size={20} aria-hidden="true" className="text-info-text" /><div><p className="font-medium text-info-text">团队协作</p><p className="mt-2 text-sm leading-5 text-info-text">结果对全队可见；队员可编辑后提交确认，队长可采纳并标记用于比赛。</p></div></div></Card>

    <TeamResultActions competitionId={competitionId} resultId={resultId} draft={draft} setEditing={setEditing} editing={editing} resetDraft={() => setDraft(runtime.resultDrafts[resultId] ?? defaultDraft(resultId))} />
  </div></RequireCompetitionAccess></PublicShell>;
}

function S6CompanyResult({ competitionId, resultId }: { competitionId: string; resultId: string }) {
  const { getRuntime } = useWorkshopRuntime();
  const runtime = getRuntime(competitionId);
  const run = runtime.taskRuns["s6-company-match"];
  const result = resultById(resultId);
  const industry = run?.selections?.industry?.join("、") || "未填写";
  const city = run?.selections?.city?.join("、") || "未填写";
  const direction = run?.selections?.direction?.join("、") || "未填写";
  const recommended = companies.filter(company => {
    if (industry.includes("品牌零售")) return company.id === "northstar-beauty";
    if (industry.includes("数据服务") || industry.includes("软件开发 SaaS") || industry.includes("互联网 / 科技")) return ["cloud-retail", "northstar-beauty"].includes(company.id);
    return true;
  }).slice(0, 3);

  return <PublicShell showNavigation={false}><PageHeader title="公司推荐成果" backTo={`/competitions/${competitionId}/workspace/workshop/results`} /><RequireCompetitionAccess><div className="space-y-6 px-4 py-5">
    <CompetitionContextLine competitionId={competitionId} />

    <Card className="border border-info bg-info-bg" data-testid="s6-private-visibility"><div className="flex items-start gap-3"><EyeOff size={20} aria-hidden="true" className="text-info-text" /><div><p className="font-medium text-info-text">生成结果仅自己可见</p><p className="mt-2 text-sm leading-5 text-info-text">这是个人职业探索建议，不进入团队成果确认，也不会写入 StudentProfile、比赛成绩、证书或其它可信事实。</p></div></div></Card>

    <Card>
      <p className="text-xs font-medium text-text-brand">S6 · 职业规划 / 公司推荐</p>
      <h1 className="mt-2 text-xl font-semibold leading-7 text-text-primary">公司推荐小报告</h1>
      <p className="mt-4 text-sm leading-6 text-text-secondary">{result?.summary ?? "结合本人偏好与赛事经历，整理可进一步了解的企业方向。"}</p>
    </Card>

    <Section title="事实输入"><Card data-testid="s6-fact-input"><div className="space-y-3"><div><p className="text-xs text-text-secondary">本人填写 · 行业偏好</p><p className="mt-1 text-sm font-medium text-text-primary">{industry}</p></div><div><p className="text-xs text-text-secondary">本人填写 · 城市偏好</p><p className="mt-1 text-sm font-medium text-text-primary">{city}</p></div><div><p className="text-xs text-text-secondary">本人填写 · 希望发挥的能力</p><p className="mt-1 text-sm font-medium text-text-primary">{direction}</p></div></div></Card></Section>

    <Section title="AI 推荐企业" subtitle="建议，不是人才评分"><div className="space-y-3">{recommended.map(company => <Link key={company.id} to={`/companies/${company.id}`} className="block" data-company-id={company.id}><Card interactive data-testid={`s6-company-${company.id}`}><div className="flex items-start gap-3"><div className="rounded-control bg-info-bg p-2 text-info-text"><Building2 size={20} aria-hidden="true" /></div><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><h2 className="font-semibold text-text-primary">{company.name}</h2><StatusTag tone="info">AI 建议</StatusTag></div><p className="mt-1 text-xs text-text-brand">{company.industry}</p><p className="mt-2 text-sm leading-5 text-text-secondary">{company.summary}</p><p className="mt-3 text-xs font-medium text-text-brand">查看现有企业详情 →</p></div></div></Card></Link>)}</div></Section>

    <Card className="border border-warning bg-warning-bg" data-testid="s6-no-score"><div className="flex items-start gap-3"><FileText size={20} aria-hidden="true" className="text-warning-text" /><div><p className="font-medium text-warning-text">没有“人才总分”</p><p className="mt-2 text-sm leading-5 text-warning-text">推荐只说明匹配理由与探索方向，不把赛事表现转换成不可解释的人才评分。</p></div></div></Card>

    <Button className="w-full" onClick={() => window.history.back()}>返回上一页</Button>
  </div></RequireCompetitionAccess></PublicShell>;
}

export function T013CResultDetailPage() {
  const { competitionId, resultId } = useParams();
  if (!competitionId || !resultId || !specialResultIds.has(resultId)) return <T013BResultDetailPage />;
  return <ResultGate competitionId={competitionId} resultId={resultId}>
    {resultId === "result-s5-pitch-ppt"
      ? <S5PptResult competitionId={competitionId} resultId={resultId} />
      : <S6CompanyResult competitionId={competitionId} resultId={resultId} />}
  </ResultGate>;
}

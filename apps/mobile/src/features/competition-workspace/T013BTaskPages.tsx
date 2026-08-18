import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Battery, FileCheck2, Snowflake, Sparkles, Users } from "lucide-react";
import { Button, Card, PageHeader, PublicShell, SecondaryButton, Section, StatusTag } from "../../components/ui";
import { computePolicyForTask, resultById, taskById } from "./data";
import { TaskAnswerPage, TaskProgressPage, TaskReviewPage } from "./TaskRuntimePages";
import { useWorkshopRuntime } from "./runtime";
import { CompetitionContextLine, RequireCompetitionAccess, TaskScenarioTools } from "./shared";

type DynamicQuestion = {
  id: string;
  label: string;
  type: "single" | "multiple";
  options: string[];
  helper?: string;
};

const t013bQuestions: Record<string, DynamicQuestion[]> = {
  "s3-copy-kit": [
    { id: "platform", label: "本次主要发布平台？", type: "single", options: ["抖音", "小红书", "微信视频号"], helper: "先选一个主要平台，后续内容会按平台语境组织。" },
    { id: "goal", label: "本次内容运营最重要的目标？", type: "single", options: ["品牌认知", "销售转化", "搜索权重", "用户评价"] },
    { id: "sellingPoint", label: "最希望优先表达哪些产品 / 项目信息？", type: "multiple", options: ["真实使用场景", "产品核心卖点", "价格利益", "校园试用反馈", "品牌故事"] },
    { id: "tone", label: "希望内容保持什么表达风格？", type: "single", options: ["真实体验", "专业测评", "轻松种草", "直接转化"] },
  ],
  "s3-visual-kit": [
    { id: "format", label: "这次希望生成哪类图片 / 视频内容？", type: "multiple", options: ["商品主图", "图文笔记", "短视频分镜", "直播间素材"] },
    { id: "scene", label: "内容优先出现哪些使用场景？", type: "multiple", options: ["宿舍", "校园户外", "产品近景", "直播间"] },
    { id: "message", label: "画面最需要传达什么？", type: "single", options: ["真实体验", "成分依据", "年轻活力", "购买利益"] },
    { id: "constraint", label: "哪些元素不能被 AI 随意修改？", type: "multiple", options: ["产品包装", "品牌标识", "商品颜色", "核心卖点文字"] },
  ],
  "s4-weekly-review": [
    { id: "metric", label: "这周最关注哪组经营指标？", type: "single", options: ["GMV / 销售额", "订单量与客单价", "流量与转化率"] },
    { id: "focus", label: "周报最希望优先回答什么问题？", type: "multiple", options: ["同比 / 环比趋势", "异常波动预警", "渠道对比", "转化漏斗变化"] },
    { id: "anomaly", label: "团队目前最想解释的异常是什么？", type: "single", options: ["流量增长但成交没跟上", "客单价下降", "某渠道转化突降", "复购没有增长"] },
    { id: "action", label: "复盘后最希望得到哪类行动建议？", type: "single", options: ["优化内容", "优化详情页", "调整渠道投入", "验证复购"] },
  ],
};

const t013bTaskIds = new Set(Object.keys(t013bQuestions));

function taskBasePath(competitionId: string, taskId: string) {
  return `/competitions/${competitionId}/workspace/workshop/tasks/${taskId}`;
}

function QuestionField({ question, values, onToggle }: { question: DynamicQuestion; values: string[]; onToggle: (option: string) => void }) {
  return <fieldset className="space-y-3">
    <legend className="text-base font-semibold leading-6 text-text-primary">{question.label}</legend>
    {question.helper && <p className="text-xs leading-5 text-text-secondary">{question.helper}</p>}
    <div className="flex flex-wrap gap-2">{question.options.map(option => {
      const selected = values.includes(option);
      return <button key={option} type="button" aria-pressed={selected} onClick={() => onToggle(option)} className={`min-h-touch rounded-control border px-3 text-sm font-medium ${selected ? "border-primary bg-info-bg text-text-brand" : "border-border bg-surface text-text-secondary"}`}>{option}</button>;
    })}</div>
  </fieldset>;
}

function outputName(taskId: string, selections: Record<string, string[]> = {}) {
  if (taskId === "s3-copy-kit") return `${selections.platform?.[0] ?? "平台"}内容文案包`;
  if (taskId === "s3-visual-kit") return "图片 / 视频内容方案";
  if (taskId === "s4-weekly-review") return "经营周报分析小报告";
  return "任务成果";
}

function SpecializedAnswerPage() {
  const navigate = useNavigate();
  const { competitionId, taskId } = useParams();
  const { getRuntime, saveTaskDraft } = useWorkshopRuntime();
  if (!competitionId || !taskId) return null;
  const task = taskById(taskId);
  if (!task) return null;
  const runtime = getRuntime(competitionId);
  const run = runtime.taskRuns[taskId];
  const questions = t013bQuestions[taskId] ?? [];
  const firstUnanswered = Math.max(0, questions.findIndex(question => !(run?.selections?.[question.id]?.length)));
  const [step, setStep] = useState(firstUnanswered < 0 ? Math.max(0, questions.length - 1) : firstUnanswered);
  const [selections, setSelections] = useState<Record<string, string[]>>(run?.selections ?? {});
  const [note, setNote] = useState(run?.note || run?.answer || "");
  const [uploadName, setUploadName] = useState(run?.uploadName ?? "");

  useEffect(() => {
    setSelections(run?.selections ?? {});
    setNote(run?.note || run?.answer || "");
    setUploadName(run?.uploadName ?? "");
  }, [run?.answer, run?.note, run?.selections, run?.uploadName, taskId]);

  const answered = questions.filter(question => (selections[question.id]?.length ?? 0) > 0).length;
  const completeness = questions.length ? Math.round((answered / questions.length) * 100) : 100;
  const question = questions[step];
  const currentAnswered = question ? (selections[question.id]?.length ?? 0) > 0 : true;
  const allAnswered = completeness === 100;

  if (run?.status === "completed") return <PublicShell showNavigation={false}><PageHeader title="任务已完成" backTo={`/competitions/${competitionId}/workspace/workshop`} /><RequireCompetitionAccess><div className="space-y-4 px-4 py-6"><Card><StatusTag tone="success">已完成</StatusTag><h2 className="mt-3 font-semibold text-text-primary">{task.title}</h2><p className="mt-2 text-sm text-text-secondary">成果已进入当前赛事的工坊历史成果。</p></Card><Button className="w-full" onClick={() => navigate(`/competitions/${competitionId}/workspace/workshop/results/${task.resultId}`)}>查看成果</Button></div></RequireCompetitionAccess></PublicShell>;
  if (run && ["queued", "running", "failed"].includes(run.status)) return <TaskProgressPage />;

  const toggle = (option: string) => {
    if (!question) return;
    setSelections(current => {
      const selected = current[question.id] ?? [];
      const next = question.type === "multiple" ? (selected.includes(option) ? selected.filter(value => value !== option) : [...selected, option]) : [option];
      return { ...current, [question.id]: next };
    });
  };

  const submit = () => {
    if (!allAnswered) return;
    saveTaskDraft(competitionId, taskId, { selections, note: note.trim(), uploadName: uploadName || undefined });
    navigate(`${taskBasePath(competitionId, taskId)}/review`);
  };

  const uploadTitle = taskId === "s3-visual-kit" ? "上传商品图 / 品牌素材（选填）" : taskId === "s4-weekly-review" ? "补充经营数据（选填）" : "补充素材（选填）";
  const uploadHint = taskId === "s3-visual-kit" ? "可选择商品图或参考图片；原型只记录文件状态，不调用真实生图服务。" : taskId === "s4-weekly-review" ? "可补 Excel、CSV、截图；不上传也可以继续完成经营周报分析。" : "可补充 PDF、图片或其它项目材料。";

  return <PublicShell showNavigation={false}><PageHeader title="动态答题" backTo={`/competitions/${competitionId}/workspace/workshop/skills/${task.skillId}`} /><RequireCompetitionAccess><div className="space-y-6 px-4 py-5">
    <CompetitionContextLine competitionId={competitionId} />
    <Card><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-medium text-text-brand">{task.skillId.toUpperCase()} · 动态问答</p><h1 className="mt-2 text-lg font-semibold text-text-primary">{task.title}</h1><p className="mt-2 text-sm leading-5 text-text-secondary">{task.summary}</p></div><StatusTag tone="info">{step + 1}/{questions.length}</StatusTag></div></Card>
    {question && <Section title={`问题 ${step + 1}`} subtitle="每次只回答一个问题，AI 会据此准备下一题"><Card data-testid="t013b-dynamic-question"><QuestionField question={question} values={selections[question.id] ?? []} onToggle={toggle} />{currentAnswered && <div className="mt-5 rounded-control bg-info-bg p-3" data-testid="t013b-ai-next-feedback"><div className="flex items-center gap-2 text-sm font-medium text-info-text"><Sparkles size={16} aria-hidden="true" />AI 正在分析回答，准备下一题</div><p className="mt-1 text-xs leading-5 text-info-text">会结合当前平台 / 经营目标和前序回答组织后续内容，不会改写为开放式聊天。</p></div>}</Card></Section>}
    <div className="grid grid-cols-2 gap-2"><SecondaryButton disabled={step === 0} onClick={() => setStep(current => Math.max(0, current - 1))}>上一题</SecondaryButton>{step < questions.length - 1 ? <Button disabled={!currentAnswered} onClick={() => setStep(current => Math.min(questions.length - 1, current + 1))}>继续下一题</Button> : <Button disabled={!allAnswered} onClick={submit}>进入生成确认</Button>}</div>
    <Section title="补充说明（选填）"><textarea value={note} onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setNote(event.target.value)} rows={4} className="w-full rounded-control border border-border bg-surface p-3 text-base leading-6 text-text-primary outline-none focus:border-primary" placeholder="补充团队自己的判断、限制或背景…" /></Section>
    <Section title={uploadTitle}><label className="flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-control border border-dashed border-border bg-surface px-4 text-center"><span className="text-sm font-medium text-text-brand">{uploadName || "点击选择材料"}</span><span className="mt-1 text-xs leading-5 text-text-secondary">{uploadHint}</span><input className="sr-only" type="file" accept=".pdf,.xls,.xlsx,.csv,image/*,video/*" onChange={event => setUploadName(event.target.files?.[0]?.name ?? "")} /></label></Section>
    <Card className="bg-surface-subtle" data-testid="t013b-completeness"><div className="flex items-center justify-between text-sm"><span className="text-text-secondary">作答完善度</span><strong className="text-text-primary">{completeness}%</strong></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-border-subtle"><div className="h-full bg-primary" style={{ width: `${completeness}%` }} /></div></Card>
    <TaskScenarioTools competitionId={competitionId} taskId={taskId} />
  </div></RequireCompetitionAccess></PublicShell>;
}

function SpecializedReviewPage() {
  const navigate = useNavigate();
  const { competitionId, taskId } = useParams();
  const { getRuntime, startTask } = useWorkshopRuntime();
  if (!competitionId || !taskId) return null;
  const task = taskById(taskId);
  if (!task) return null;
  const runtime = getRuntime(competitionId);
  const run = runtime.taskRuns[taskId];
  const policy = computePolicyForTask(taskId);
  const questions = t013bQuestions[taskId] ?? [];
  const answered = questions.filter(question => (run?.selections?.[question.id]?.length ?? 0) > 0).length;
  const completeness = questions.length ? Math.round((answered / questions.length) * 100) : 100;
  const enoughCompute = runtime.computeBalance >= policy.estimateMax;
  const ready = completeness === 100 && enoughCompute;
  const coreFacts = questions.flatMap(question => run?.selections?.[question.id] ?? []).slice(0, 5);
  const confirm = () => {
    if (!ready || !startTask(competitionId, taskId)) return;
    navigate(`${taskBasePath(competitionId, taskId)}/progress`);
  };

  return <PublicShell showNavigation={false}><PageHeader title="生成确认" backTo={`${taskBasePath(competitionId, taskId)}/answer`} /><RequireCompetitionAccess><div className="space-y-6 px-4 py-5">
    <CompetitionContextLine competitionId={competitionId} />
    <Card><p className="text-xs font-medium text-text-brand">{task.skillId.toUpperCase()} · {outputName(taskId, run?.selections)}</p><h1 className="mt-2 text-lg font-semibold text-text-primary">{task.title}</h1><p className="mt-3 text-sm leading-6 text-text-secondary">确认后会按当前问答与项目上下文创建同一 Task Runtime 任务，并按上限冻结算力。</p></Card>
    <Section title="问答摘要"><div className="space-y-2">{questions.map(question => <Card key={question.id}><p className="text-xs text-text-secondary">{question.label}</p><p className="mt-1 text-sm font-medium leading-5 text-text-primary">{run?.selections?.[question.id]?.join("、") || "未回答"}</p></Card>)}</div></Section>
    <Section title="AI 提取核心信息"><Card data-testid="t013b-core-facts"><div className="flex flex-wrap gap-2">{coreFacts.map(value => <StatusTag key={value} tone="neutral">{value}</StatusTag>)}</div><div className="mt-4 flex items-center justify-between border-t border-border-subtle pt-3 text-sm"><span className="text-text-secondary">作答完善度</span><strong className="text-text-primary">{completeness}%</strong></div>{run?.note && <div className="mt-3 border-t border-border-subtle pt-3"><p className="text-xs text-text-secondary">主观补充</p><p className="mt-1 text-sm leading-5 text-text-primary">{run.note}</p></div>}{run?.uploadName && <p className="mt-3 text-xs text-text-brand">已附材料：{run.uploadName}</p>}</Card></Section>
    {taskId === "s3-visual-kit" && <Card className="border border-info bg-info-bg" data-testid="t013b-prototype-media-note"><p className="font-medium text-info-text">原型生成说明</p><p className="mt-2 text-sm leading-5 text-info-text">本次只生成图片 / 视频内容方案和示例占位素材，不调用真实图片或视频生成服务。</p></Card>}
    <Section title="算力与归属"><div className="grid grid-cols-1 gap-3"><Card data-testid="review-card-estimate"><div className="flex items-start gap-3"><div className="rounded-control bg-info-bg p-2 text-info-text"><Battery size={20} aria-hidden="true" /></div><div><p className="text-xs font-medium text-text-brand">算力预估</p><p className="mt-1 text-sm text-text-secondary">当前可用 {runtime.computeBalance}</p><p className="mt-1 text-base font-semibold text-text-primary">预计 {policy.estimateMin}–{policy.estimateMax} 算力</p></div></div></Card><Card data-testid="review-card-freeze"><div className="flex items-start gap-3"><div className="rounded-control bg-info-bg p-2 text-info-text"><Snowflake size={20} aria-hidden="true" /></div><div><p className="text-xs font-medium text-text-brand">冻结上限</p><p className="mt-1 text-sm text-text-secondary">确认生成后先冻结上限，完成后按实际消耗结算并释放差额。</p><p className="mt-1 text-base font-semibold text-text-primary">确认后冻结 {policy.estimateMax} 算力</p></div></div></Card><Card data-testid="review-card-ownership"><div className="flex items-start gap-3"><div className="rounded-control bg-info-bg p-2 text-info-text"><FileCheck2 size={20} aria-hidden="true" /></div><div><p className="text-xs font-medium text-text-brand">成果归属</p><p className="mt-1 text-sm text-text-secondary">当前赛事 / 当前项目 / 当前任务，历史成果不会跨赛事串线。</p></div></div></Card><Card data-testid="review-card-team"><div className="flex items-start gap-3"><div className="rounded-control bg-info-bg p-2 text-info-text"><Users size={20} aria-hidden="true" /></div><div><p className="text-xs font-medium text-text-brand">团队可见</p><p className="mt-1 text-sm leading-5 text-text-secondary">结果对全队可见；队员可编辑后提交确认，队长可采纳并标记用于比赛。</p></div></div></Card></div></Section>
    {!enoughCompute && <Card className="border border-warning bg-warning-bg"><p className="font-medium text-warning-text">算力不足</p><p className="mt-2 text-sm text-warning-text">本次最多需要冻结 {policy.estimateMax}，当前可用 {runtime.computeBalance}。</p></Card>}
    <div className="grid grid-cols-2 gap-2"><SecondaryButton onClick={() => navigate(`${taskBasePath(competitionId, taskId)}/answer`)}>返回修改</SecondaryButton><Button disabled={!ready} onClick={confirm}>确认生成</Button></div>
    <TaskScenarioTools competitionId={competitionId} taskId={taskId} />
  </div></RequireCompetitionAccess></PublicShell>;
}

function SpecializedProgressPage() {
  const navigate = useNavigate();
  const { competitionId, taskId } = useParams();
  const { getRuntime, advanceTask, retryTask } = useWorkshopRuntime();
  if (!competitionId || !taskId) return null;
  const task = taskById(taskId);
  if (!task) return null;
  const runtime = getRuntime(competitionId);
  const run = runtime.taskRuns[taskId];
  const status = run?.status ?? "ready";
  const result = resultById(task.resultId);
  const tone = status === "failed" ? "danger" : status === "completed" ? "success" : "info";
  const label = status === "queued" ? "排队中" : status === "running" ? "运行中" : status === "failed" ? "生成失败" : status === "completed" ? "已完成" : "尚未开始";
  const generationLabel = taskId === "s3-copy-kit" ? `生成${run?.selections?.platform?.[0] ?? "平台"}种草图文 / 脚本` : taskId === "s3-visual-kit" ? "生成图片 / 视频示例素材" : "生成经营周报分析小报告";
  const progress = run?.progress ?? 0;
  const steps = [
    { label: "冻结本次任务算力", done: Boolean(run?.reservedCompute) || progress > 0 },
    { label: "读取当前赛事参赛档案", done: progress >= 16 },
    { label: "检查问答与补充材料", done: progress >= 35 },
    { label: generationLabel, done: progress >= 68 },
    { label: "质量检查并生成可编辑成果", done: progress >= 100 },
  ];

  return <PublicShell showNavigation={false}><PageHeader title="任务进度" backTo={`/competitions/${competitionId}/workspace/workshop`} /><RequireCompetitionAccess><div className="space-y-6 px-4 py-5">
    <CompetitionContextLine competitionId={competitionId} />
    <Card className={status === "failed" ? "border border-danger bg-danger-bg" : "border border-border-subtle"}><div className="flex items-center justify-between gap-3"><StatusTag tone={tone}>{label}</StatusTag><strong className="text-lg text-text-primary">{progress}%</strong></div><h1 className="mt-3 text-lg font-semibold text-text-primary">{generationLabel}</h1><p className="mt-2 text-sm leading-5 text-text-secondary">{status === "failed" ? "本次运行失败，原回答仍保留，可重新排队。" : status === "completed" ? `已生成：${result?.title ?? outputName(taskId, run?.selections)}` : "任务可离开页面，完成后会通过站内消息通知。"}</p>{Boolean(run?.reservedCompute) && <p className="mt-3 text-xs font-medium text-text-brand">已冻结 {run?.reservedCompute} 算力</p>}<div className="mt-4 h-2 overflow-hidden rounded-full bg-border-subtle"><div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} /></div></Card>
    <Section title="处理步骤"><div className="space-y-2">{steps.map(step => <Card key={step.label}><div className="flex items-center justify-between gap-3"><span className="text-sm text-text-primary">{step.label}</span><StatusTag tone={step.done ? "success" : "neutral"}>{step.done ? "已完成" : "等待中"}</StatusTag></div></Card>)}</div></Section>
    <div className="space-y-2">{status === "queued" && <Button className="w-full" onClick={() => advanceTask(competitionId, taskId)}>模拟进入运行</Button>}{status === "running" && <Button className="w-full" onClick={() => advanceTask(competitionId, taskId)}>模拟生成完成</Button>}{status === "failed" && <Button className="w-full" onClick={() => retryTask(competitionId, taskId)}>重新排队</Button>}{status === "completed" && <Button className="w-full" onClick={() => navigate(`/competitions/${competitionId}/workspace/workshop/results/${task.resultId}`)}>查看本任务成果</Button>}{status === "ready" && <SecondaryButton className="w-full" onClick={() => navigate(`${taskBasePath(competitionId, taskId)}/answer`)}>返回动态答题</SecondaryButton>}<SecondaryButton className="w-full" onClick={() => navigate(`/competitions/${competitionId}/workspace/workshop`)}>离开任务，返回工坊</SecondaryButton></div>
    <TaskScenarioTools competitionId={competitionId} taskId={taskId} />
  </div></RequireCompetitionAccess></PublicShell>;
}

export function T013BTaskAnswerPage() {
  const { taskId } = useParams();
  return taskId && t013bTaskIds.has(taskId) ? <SpecializedAnswerPage /> : <TaskAnswerPage />;
}

export function T013BTaskReviewPage() {
  const { taskId } = useParams();
  return taskId && t013bTaskIds.has(taskId) ? <SpecializedReviewPage /> : <TaskReviewPage />;
}

export function T013BTaskProgressPage() {
  const { taskId } = useParams();
  return taskId && t013bTaskIds.has(taskId) ? <SpecializedProgressPage /> : <TaskProgressPage />;
}

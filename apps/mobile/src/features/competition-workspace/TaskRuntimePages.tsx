import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Battery, Snowflake, FileCheck2, Users } from "lucide-react";
import { Button, Card, PageHeader, PublicShell, SecondaryButton, Section, StatusTag } from "../../components/ui";
import { computePolicyForTask, questionsForTask, resultById, taskById, type WorkshopQuestion } from "./data";
import { missingMaterials, taskAvailability, useWorkshopRuntime } from "./runtime";
import { CompetitionContextLine, RequireCompetitionAccess, TaskScenarioTools } from "./shared";

function taskBasePath(competitionId: string, taskId: string) {
  return `/competitions/${competitionId}/workspace/workshop/tasks/${taskId}`;
}

function QuestionField({ question, values, onToggle }: { question: WorkshopQuestion; values: string[]; onToggle: (option: string) => void }) {
  return <fieldset className="space-y-3">
    <legend className="text-sm font-medium leading-5 text-text-primary">{question.label}{question.required && <span className="ml-1 text-danger-text">*</span>}</legend>
    {question.helper && <p className="text-xs leading-5 text-text-secondary">{question.helper}</p>}
    <div className={question.type === "scale" ? "grid grid-cols-5 gap-2" : "flex flex-wrap gap-2"}>
      {question.options.map(option => {
        const selected = values.includes(option);
        return <button
          key={option}
          type="button"
          aria-pressed={selected}
          onClick={() => onToggle(option)}
          className={`min-h-touch rounded-control border px-3 text-sm font-medium ${selected ? "border-primary bg-info-bg text-text-brand" : "border-border bg-surface text-text-secondary"}`}
        >{option}</button>;
      })}
    </div>
  </fieldset>;
}

export function TaskAnswerPage() {
  const navigate = useNavigate();
  const { competitionId, taskId } = useParams();
  const { getRuntime, saveTaskDraft } = useWorkshopRuntime();
  const task = taskById(taskId);
  const runtime = competitionId ? getRuntime(competitionId) : undefined;
  const run = taskId && runtime ? runtime.taskRuns[taskId] : undefined;
  const questions = questionsForTask(taskId);
  const [selections, setSelections] = useState<Record<string, string[]>>(run?.selections ?? {});
  const [note, setNote] = useState(run?.note || run?.answer || "");
  const [uploadName, setUploadName] = useState(run?.uploadName ?? "");

  useEffect(() => {
    setSelections(run?.selections ?? {});
    setNote(run?.note || run?.answer || "");
    setUploadName(run?.uploadName ?? "");
  }, [run?.answer, run?.note, run?.selections, run?.uploadName, taskId]);

  const requiredQuestions = useMemo(() => questions.filter(question => question.required), [questions]);
  const answeredRequired = requiredQuestions.filter(question => (selections[question.id]?.length ?? 0) > 0).length;
  const completeness = requiredQuestions.length ? Math.round((answeredRequired / requiredQuestions.length) * 100) : 100;
  const canContinue = completeness === 100 || Boolean(note.trim());

  if (!competitionId || !taskId || !task || !runtime) return null;
  const availability = taskAvailability(runtime, taskId);
  const missing = missingMaterials(runtime, taskId);

  const toggle = (question: WorkshopQuestion, option: string) => {
    setSelections(current => {
      const selected = current[question.id] ?? [];
      const next = question.type === "multiple"
        ? selected.includes(option) ? selected.filter(value => value !== option) : [...selected, option]
        : [option];
      return { ...current, [question.id]: next };
    });
  };

  const submit = () => {
    if (!canContinue) return;
    saveTaskDraft(competitionId, taskId, { selections, note: note.trim(), uploadName: uploadName || undefined });
    navigate(`${taskBasePath(competitionId, taskId)}/review`);
  };

  if (availability === "completed") return <PublicShell showNavigation={false}><PageHeader title="任务已完成" backTo={`/competitions/${competitionId}/workspace/workshop`} /><RequireCompetitionAccess><div className="space-y-4 px-4 py-6"><Card><StatusTag tone="success">已完成</StatusTag><h2 className="mt-3 font-semibold text-text-primary">{task.title}</h2><p className="mt-2 text-sm text-text-secondary">该任务已经生成独立成果，可继续编辑、保存版本或由队长采纳。</p></Card><Button className="w-full" onClick={() => navigate(`/competitions/${competitionId}/workspace/workshop/results/${task.resultId}`)}>查看正确成果</Button></div></RequireCompetitionAccess></PublicShell>;

  if (availability === "queued" || availability === "running" || availability === "failed") {
    return <PublicShell showNavigation={false}><PageHeader title="任务执行中" backTo={`/competitions/${competitionId}/workspace/workshop`} /><RequireCompetitionAccess><div className="space-y-4 px-4 py-6"><Card><StatusTag tone={availability === "failed" ? "danger" : "info"}>{availability === "failed" ? "生成失败" : "异步运行"}</StatusTag><h2 className="mt-3 font-semibold text-text-primary">{task.title}</h2></Card><Button className="w-full" onClick={() => navigate(`${taskBasePath(competitionId, taskId)}/progress`)}>继续查看运行状态</Button></div></RequireCompetitionAccess></PublicShell>;
  }

  return <PublicShell showNavigation={false}><PageHeader title="动态答题" backTo={`/competitions/${competitionId}/workspace/workshop/skills/${task.skillId}`} /><RequireCompetitionAccess><div className="space-y-6 px-4 py-5">
    <CompetitionContextLine competitionId={competitionId} />
    <Card><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-medium text-text-brand">{task.skillId.toUpperCase()} · AI 会根据结构化答案组织报告</p><h2 className="mt-2 text-lg font-semibold text-text-primary">{task.title}</h2><p className="mt-2 text-sm leading-5 text-text-secondary">{task.summary}</p></div><StatusTag tone={availability === "locked" ? "warning" : "info"}>{availability === "locked" ? "任务锁定" : `${completeness}%`}</StatusTag></div></Card>
    {availability === "locked" ? <Card className="border border-warning bg-warning-bg"><p className="font-medium text-warning-text">当前缺少任务材料</p><p className="mt-2 text-sm text-warning-text">{missing.length ? missing.map(item => item.label).join("、") : "该任务当前被原型状态锁定"}</p><SecondaryButton className="mt-4 w-full" onClick={() => navigate(`/competitions/${competitionId}/workspace/workshop/project`)}>查看项目材料</SecondaryButton></Card> : <>
      <Section title="结构化问答"><div className="space-y-6">{questions.map(question => <QuestionField key={question.id} question={question} values={selections[question.id] ?? []} onToggle={option => toggle(question, option)} />)}</div></Section>
      <Section title="补充说明（选填）"><div><textarea value={note} onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setNote(event.target.value)} rows={5} className="w-full rounded-control border border-border bg-surface p-3 text-base leading-6 text-text-primary outline-none focus:border-primary" placeholder="写下团队当前真实情况…" /><p className="mt-2 text-xs leading-5 text-text-secondary">{task.helper}</p></div></Section>
      <Section title="上传其它数据（选填）"><label className="flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-control border border-dashed border-border bg-surface px-4 text-center"><span className="text-sm font-medium text-text-brand">{uploadName || "点击选择项目材料"}</span><span className="mt-1 text-xs text-text-secondary">支持 PDF、Excel、CSV 或图片；原型只记录文件状态</span><input className="sr-only" type="file" accept=".pdf,.xls,.xlsx,.csv,image/*" onChange={event => setUploadName(event.target.files?.[0]?.name ?? "")} /></label></Section>
      <Card className="bg-surface-subtle"><div className="flex items-center justify-between text-sm"><span className="text-text-secondary">作答完善度</span><strong className="text-text-primary">{completeness}%</strong></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-border-subtle"><div className="h-full bg-primary" style={{ width: `${completeness}%` }} /></div></Card>
    </>}
    <Button disabled={availability === "locked" || !canContinue} className="w-full" onClick={submit}>回答完毕，进入下一步</Button>
    <TaskScenarioTools competitionId={competitionId} taskId={taskId} />
  </div></RequireCompetitionAccess></PublicShell>;
}

export function TaskReviewPage() {
  const navigate = useNavigate();
  const { competitionId, taskId } = useParams();
  const { getRuntime, startTask } = useWorkshopRuntime();
  if (!competitionId || !taskId) return null;
  const runtime = getRuntime(competitionId);
  const task = taskById(taskId);
  if (!task) return null;
  const run = runtime.taskRuns[taskId];
  const policy = computePolicyForTask(taskId);
  const missing = missingMaterials(runtime, taskId);
  const selectedFacts = Object.values(run?.selections ?? {}).flat();
  const hasDraft = selectedFacts.length > 0 || Boolean(run?.note.trim());
  const enoughCompute = runtime.computeBalance >= policy.estimateMax;
  const ready = taskAvailability(runtime, taskId) !== "locked" && hasDraft && enoughCompute;
  const confirm = () => {
    if (!ready || !startTask(competitionId, taskId)) return;
    navigate(`${taskBasePath(competitionId, taskId)}/progress`);
  };

  return <PublicShell showNavigation={false}><PageHeader title="生成确认" backTo={`${taskBasePath(competitionId, taskId)}/answer`} /><RequireCompetitionAccess><div className="space-y-6 px-4 py-5">
    <CompetitionContextLine competitionId={competitionId} />
    <Card><p className="text-xs font-medium text-text-brand">{task.skillId.toUpperCase()} · 为当前子技能生成独立报告</p><h2 className="mt-2 text-lg font-semibold text-text-primary">{task.title}</h2><p className="mt-3 text-sm leading-6 text-text-secondary">确认后按上限冻结算力，完成后按实际消耗结算。</p></Card>
    <Section title="问答摘要"><Card><div className="flex flex-wrap gap-2">{selectedFacts.length ? selectedFacts.map(value => <StatusTag key={value} tone="neutral">{value}</StatusTag>) : <span className="text-sm text-text-secondary">未选择结构化答案</span>}</div>{run?.note && <div className="mt-4 border-t border-border-subtle pt-3"><p className="text-xs text-text-secondary">主观补充</p><p className="mt-1 text-sm leading-5 text-text-primary">{run.note}</p></div>}{run?.uploadName && <p className="mt-3 text-xs text-text-brand">已附材料：{run.uploadName}</p>}</Card></Section>
    <Section title="算力与归属" subtitle="冻结 4 块独立结算说明"><div className="grid grid-cols-1 gap-3">
      <Card data-testid="review-card-estimate"><div className="flex items-start gap-3"><div className="rounded-control bg-info-bg p-2 text-info-text"><Battery aria-hidden="true" size={20} strokeWidth={2} /></div><div className="min-w-0 flex-1"><p className="text-xs font-medium text-text-brand">算力预估</p><p className="mt-1 text-sm leading-5 text-text-secondary">当前可用 <strong className="text-text-primary">{runtime.computeBalance}</strong> · 本次预计消耗</p><p className="mt-1 text-base font-semibold text-text-primary">{policy.estimateMin}–{policy.estimateMax} 算力</p></div></div></Card>
      <Card data-testid="review-card-freeze"><div className="flex items-start gap-3"><div className="rounded-control bg-info-bg p-2 text-info-text"><Snowflake aria-hidden="true" size={20} strokeWidth={2} /></div><div className="min-w-0 flex-1"><p className="text-xs font-medium text-text-brand">冻结上限</p><p className="mt-1 text-sm leading-5 text-text-secondary">确认后将立即按上限冻结，完成后按实际消耗释放差额。</p><p className="mt-1 text-base font-semibold text-text-primary">确认后冻结 {policy.estimateMax} 算力</p></div></div></Card>
      <Card data-testid="review-card-ownership"><div className="flex items-start gap-3"><div className="rounded-control bg-info-bg p-2 text-info-text"><FileCheck2 aria-hidden="true" size={20} strokeWidth={2} /></div><div className="min-w-0 flex-1"><p className="text-xs font-medium text-text-brand">成果归属</p><p className="mt-1 text-sm leading-5 text-text-secondary">成果严格绑定当前 task，不复用其它技能的结果。</p><p className="mt-1 text-base font-semibold text-text-primary">当前赛事 / 当前项目 / 当前任务</p></div></div></Card>
      <Card data-testid="review-card-team"><div className="flex items-start gap-3"><div className="rounded-control bg-info-bg p-2 text-info-text"><Users aria-hidden="true" size={20} strokeWidth={2} /></div><div className="min-w-0 flex-1"><p className="text-xs font-medium text-text-brand">团队可见</p><p className="mt-1 text-sm leading-5 text-text-secondary">结果对全队可见。队员可编辑并保存版本，队长可采纳或标记用于比赛。</p><p className="mt-1 text-base font-semibold text-text-primary">全队可访问 · 事实 / 建议分区</p></div></div></Card>
    </div></Section>
    {!enoughCompute && <Card className="border border-warning bg-warning-bg"><p className="font-medium text-warning-text">算力不足</p><p className="mt-2 text-sm text-warning-text">本次最多需要冻结 {policy.estimateMax}，当前可用 {runtime.computeBalance}。</p></Card>}
    {missing.length > 0 && <Card className="border border-warning bg-warning-bg"><p className="font-medium text-warning-text">缺少任务材料</p><p className="mt-2 text-sm text-warning-text">{missing.map(item => item.label).join("、")}</p></Card>}
    <div className="grid grid-cols-2 gap-2"><SecondaryButton onClick={() => navigate(`${taskBasePath(competitionId, taskId)}/answer`)}>返回修改</SecondaryButton><Button disabled={!ready} onClick={confirm}>确认生成</Button></div>
    <TaskScenarioTools competitionId={competitionId} taskId={taskId} />
  </div></RequireCompetitionAccess></PublicShell>;
}

export function TaskProgressPage() {
  const navigate = useNavigate();
  const { competitionId, taskId } = useParams();
  const { getRuntime, advanceTask, retryTask } = useWorkshopRuntime();
  if (!competitionId || !taskId) return null;
  const runtime = getRuntime(competitionId);
  const task = taskById(taskId);
  if (!task) return null;
  const run = runtime.taskRuns[taskId];
  const status = run?.status ?? "ready";
  const result = resultById(task.resultId);
  const tone = status === "failed" ? "danger" : status === "completed" ? "success" : "info";
  const label = status === "queued" ? "排队中" : status === "running" ? "运行中" : status === "failed" ? "生成失败" : status === "completed" ? "已完成" : "尚未开始";
  const steps = [
    { label: "读取参赛档案", done: (run?.progress ?? 0) >= 16 },
    { label: "检查问答与上传材料", done: (run?.progress ?? 0) >= 35 },
    { label: "生成诊断建议", done: (run?.progress ?? 0) >= 68 },
    { label: "质量检查并生成可编辑成果", done: (run?.progress ?? 0) >= 100 },
  ];

  return <PublicShell showNavigation={false}><PageHeader title="任务进度" backTo={`/competitions/${competitionId}/workspace/workshop`} /><RequireCompetitionAccess><div className="space-y-6 px-4 py-5">
    <CompetitionContextLine competitionId={competitionId} />
    <Card className={status === "failed" ? "border border-danger bg-danger-bg" : "border border-border-subtle"}><div className="flex items-center justify-between gap-3"><StatusTag tone={tone}>{label}</StatusTag><strong className="text-lg text-text-primary">{run?.progress ?? 0}%</strong></div><h2 className="mt-3 text-lg font-semibold text-text-primary">{task.title}</h2><p className="mt-2 text-sm leading-5 text-text-secondary">{status === "failed" ? "本次运行失败，原回答已保留，冻结算力应退回后再重试。" : status === "completed" ? `已生成：${result?.title ?? "任务成果"}` : "任务可离开页面，完成后会通过站内消息通知。"}</p>{Boolean(run?.reservedCompute) && <p className="mt-3 text-xs font-medium text-text-brand">已冻结 {run.reservedCompute} 算力</p>}<div className="mt-4 h-2 overflow-hidden rounded-full bg-border-subtle"><div className="h-full bg-primary transition-all" style={{ width: `${run?.progress ?? 0}%` }} /></div></Card>
    <Section title="处理步骤"><div className="space-y-2">{steps.map(step => <Card key={step.label}><div className="flex items-center justify-between gap-3"><span className="text-sm text-text-primary">{step.label}</span><StatusTag tone={step.done ? "success" : "neutral"}>{step.done ? "已完成" : "等待中"}</StatusTag></div></Card>)}</div></Section>
    <div className="space-y-2">{status === "queued" && <Button className="w-full" onClick={() => advanceTask(competitionId, taskId)}>模拟进入运行</Button>}{status === "running" && <Button className="w-full" onClick={() => advanceTask(competitionId, taskId)}>模拟生成完成</Button>}{status === "failed" && <Button className="w-full" onClick={() => retryTask(competitionId, taskId)}>重新排队</Button>}{status === "completed" && <Button className="w-full" onClick={() => navigate(`/competitions/${competitionId}/workspace/workshop/results/${task.resultId}`)}>查看本任务成果</Button>}{status === "ready" || status === "draft" ? <SecondaryButton className="w-full" onClick={() => navigate(`${taskBasePath(competitionId, taskId)}/answer`)}>返回任务答题</SecondaryButton> : null}<SecondaryButton className="w-full" onClick={() => navigate(`/competitions/${competitionId}/workspace/workshop`)}>返回工作台</SecondaryButton></div>
    <TaskScenarioTools competitionId={competitionId} taskId={taskId} />
  </div></RequireCompetitionAccess></PublicShell>;
}

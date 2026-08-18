import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Card, PageHeader, PublicShell, SecondaryButton, Section, StatusTag } from "../../components/ui";
import { resultById, taskById } from "./data";
import { missingMaterials, taskAvailability, useWorkshopRuntime } from "./runtime";
import { CompetitionContextLine, RequireCompetitionAccess, TaskScenarioTools } from "./shared";
import { flowSpecForTask, type WorkshopQuestion } from "./workshop-flow";

function taskBasePath(competitionId: string, taskId: string) {
  return `/competitions/${competitionId}/workspace/workshop/tasks/${taskId}`;
}

function completionFor(answers: Record<string, string[]>, questionCount: number, focus: string[], note: string) {
  const answered = Object.values(answers).filter(value => value.length > 0).length;
  if (!answered) return 0;
  if (answered < questionCount) return 68;
  if (focus.length && note.trim()) return 100;
  return 88;
}

function AnswerOption({ question, option, selected, onToggle }: { question: WorkshopQuestion; option: string; selected: boolean; onToggle: () => void }) {
  return <button
    type="button"
    aria-pressed={selected}
    onClick={onToggle}
    className={`min-h-touch w-full rounded-control border px-3 py-2 text-left text-sm font-medium transition ${selected ? "border-primary bg-info-bg text-text-brand" : "border-border bg-surface text-text-primary active:bg-surface-pressed"}`}
  >
    <span className="flex items-center justify-between gap-3"><span>{option}</span><span aria-hidden="true" className="text-text-tertiary">{question.type === "multi" ? (selected ? "✓" : "□") : (selected ? "●" : "○")}</span></span>
  </button>;
}

function StructuredAnswerForm({ competitionId, taskId }: { competitionId: string; taskId: string }) {
  const navigate = useNavigate();
  const { getRuntime, saveTaskDraft, setTaskStatus } = useWorkshopRuntime();
  const runtime = getRuntime(competitionId);
  const run = runtime.taskRuns[taskId];
  const task = taskById(taskId)!;
  const spec = flowSpecForTask(taskId)!;
  const [answers, setAnswers] = useState<Record<string, string[]>>(run?.answers ?? {});
  const [focus, setFocus] = useState<string[]>(run?.focus ?? []);
  const [note, setNote] = useState(run?.note ?? "");
  const [files, setFiles] = useState<string[]>(run?.files ?? []);
  const answeredCount = spec.questions.filter(question => (answers[question.id]?.length ?? 0) > 0).length;
  const completeness = completionFor(answers, spec.questions.length, focus, note);
  const canSubmit = answeredCount === spec.questions.length && focus.length > 0;

  useEffect(() => {
    setAnswers(run?.answers ?? {});
    setFocus(run?.focus ?? []);
    setNote(run?.note ?? "");
    setFiles(run?.files ?? []);
  }, [run?.answers, run?.files, run?.focus, run?.note, taskId]);

  const toggleAnswer = (question: WorkshopQuestion, option: string) => {
    setAnswers(current => {
      const existing = current[question.id] ?? [];
      const next = question.type === "single"
        ? [option]
        : existing.includes(option) ? existing.filter(value => value !== option) : [...existing, option];
      return { ...current, [question.id]: next };
    });
  };

  const toggleFocus = (value: string) => setFocus(current => current.includes(value) ? current.filter(item => item !== value) : [...current, value]);
  const onFiles = (event: ChangeEvent<HTMLInputElement>) => setFiles(Array.from(event.target.files ?? []).map(file => file.name));
  const submit = () => {
    if (!canSubmit) return;
    const answer = spec.questions.map(question => `${question.title}：${(answers[question.id] ?? []).join("、")}`).join("；");
    saveTaskDraft(competitionId, taskId, { answer, answers, focus, note, files });
    setTaskStatus(competitionId, taskId, "ready");
    navigate(`${taskBasePath(competitionId, taskId)}/review`);
  };

  return <>
    <Card>
      <StatusTag tone="info">动态答题</StatusTag>
      <h1 className="mt-3 text-lg font-semibold text-text-primary">{spec.instanceTitle}</h1>
      <p className="mt-2 text-sm leading-5 text-text-secondary">{spec.dynamicHint}</p>
      <p className="mt-2 text-xs text-text-tertiary">{spec.skillLabel}</p>
    </Card>

    <div className="space-y-5">
      {spec.questions.map((question, index) => {
        const visible = index === 0 || spec.questions.slice(0, index).every(item => (answers[item.id]?.length ?? 0) > 0);
        if (!visible) return null;
        return <div key={question.id} className="space-y-3">
          {index > 0 && <Card className="border border-info bg-info-bg"><p className="text-sm text-info-text">AI 正在分析您的回答，准备下一题……</p></Card>}
          <Section title={question.title}>
            {question.description && <p className="text-sm text-text-secondary">{question.description}</p>}
            <div className="space-y-2">{question.options.map(option => <AnswerOption key={option} question={question} option={option} selected={(answers[question.id] ?? []).includes(option)} onToggle={() => toggleAnswer(question, option)} />)}</div>
          </Section>
        </div>;
      })}
    </div>

    <Section title="作答完善度">
      <Card><div className="flex items-center justify-between"><span className="text-sm text-text-secondary">当前完善度</span><strong className="text-lg text-text-primary">{completeness}%</strong></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-subtle"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${completeness}%` }} /></div></Card>
    </Section>

    {answeredCount === spec.questions.length && <>
      <Section title="诊断重点 *"><div className="grid grid-cols-2 gap-2">{spec.focusOptions.map(option => <button key={option} type="button" aria-pressed={focus.includes(option)} onClick={() => toggleFocus(option)} className={`min-h-touch rounded-control border px-3 text-sm font-medium ${focus.includes(option) ? "border-primary bg-info-bg text-text-brand" : "border-border bg-surface text-text-primary"}`}>{option}</button>)}</div></Section>
      <Section title="补充说明"><div><p className="mb-2 text-xs text-text-tertiary">选填</p><textarea value={note} onChange={event => setNote(event.target.value)} rows={4} className="w-full rounded-control border border-border bg-surface p-3 text-base leading-6 text-text-primary outline-none focus:border-primary" placeholder={spec.notePlaceholder} /></div></Section>
      <Section title="上传其它数据"><Card><p className="text-sm text-text-primary">选填，可提升诊断深度</p><p className="mt-1 text-xs text-text-secondary">支持 PDF、Excel、CSV 或图片；原型仅记录文件名，不解析真实文件。</p><label className="mt-3 flex min-h-touch cursor-pointer items-center justify-center rounded-control bg-[var(--color-secondary)] px-4 text-sm font-medium text-text-brand"><input className="sr-only" type="file" multiple accept=".pdf,.xls,.xlsx,.csv,image/*" onChange={onFiles} />上传文件</label>{files.length > 0 && <div className="mt-3 space-y-1">{files.map(file => <p key={file} className="truncate text-xs text-text-secondary">{file}</p>)}</div>}</Card></Section>
    </>}

    <Button disabled={!canSubmit} className="w-full" onClick={submit}>回答完毕，进入下一步</Button>
    <TaskScenarioTools competitionId={competitionId} taskId={taskId} />
  </>;
}

function GenericAnswerForm({ competitionId, taskId }: { competitionId: string; taskId: string }) {
  const navigate = useNavigate();
  const { getRuntime, saveAnswer, setTaskStatus } = useWorkshopRuntime();
  const task = taskById(taskId)!;
  const runtime = getRuntime(competitionId);
  const run = runtime.taskRuns[taskId];
  const [answer, setAnswer] = useState(run?.answer ?? "");
  useEffect(() => setAnswer(run?.answer ?? ""), [run?.answer, taskId]);
  const submit = () => {
    const clean = answer.trim();
    if (!clean) return;
    saveAnswer(competitionId, taskId, clean);
    setTaskStatus(competitionId, taskId, "ready");
    navigate(`${taskBasePath(competitionId, taskId)}/review`);
  };
  return <><Card><StatusTag tone="info">任务答题</StatusTag><h1 className="mt-3 text-lg font-semibold text-text-primary">{task.title}</h1><p className="mt-2 text-sm leading-5 text-text-secondary">{task.summary}</p></Card><Section title="回答"><label className="mb-2 block text-sm font-medium text-text-primary">{task.prompt}</label><textarea value={answer} onChange={event => setAnswer(event.target.value)} rows={7} className="w-full rounded-control border border-border bg-surface p-3 text-base leading-6 text-text-primary outline-none focus:border-primary" placeholder="写下团队当前真实情况…" /><p className="mt-2 text-sm leading-5 text-text-secondary">{task.helper}</p></Section><Button disabled={!answer.trim()} className="w-full" onClick={submit}>保存回答并检查生成内容</Button><TaskScenarioTools competitionId={competitionId} taskId={taskId} /></>;
}

export function TaskAnswerPage() {
  const navigate = useNavigate();
  const { competitionId, taskId } = useParams();
  const { getRuntime } = useWorkshopRuntime();
  const task = taskById(taskId);
  const runtime = competitionId ? getRuntime(competitionId) : undefined;
  if (!competitionId || !taskId || !task || !runtime) return null;
  const availability = taskAvailability(runtime, taskId);
  const missing = missingMaterials(runtime, taskId);

  if (availability === "completed") return <PublicShell showNavigation={false}><PageHeader title="任务已完成" backTo={`/competitions/${competitionId}/workspace/workshop`} /><RequireCompetitionAccess><div className="space-y-4 px-4 py-6"><Card><StatusTag tone="success">已完成</StatusTag><h1 className="mt-3 font-semibold text-text-primary">{task.title}</h1><p className="mt-2 text-sm text-text-secondary">该任务已有对应成果，可从历史成果继续查看。</p></Card><Button className="w-full" onClick={() => navigate(`/competitions/${competitionId}/workspace/workshop/results/${task.resultId}`)}>查看成果</Button></div></RequireCompetitionAccess></PublicShell>;
  if (availability === "queued" || availability === "running" || availability === "failed") return <PublicShell showNavigation={false}><PageHeader title="任务执行中" backTo={`/competitions/${competitionId}/workspace/workshop`} /><RequireCompetitionAccess><div className="space-y-4 px-4 py-6"><Card><StatusTag tone={availability === "failed" ? "danger" : "info"}>{availability === "failed" ? "生成失败" : "运行中"}</StatusTag><h1 className="mt-3 font-semibold text-text-primary">{task.title}</h1></Card><Button className="w-full" onClick={() => navigate(`${taskBasePath(competitionId, taskId)}/progress`)}>继续查看运行状态</Button></div></RequireCompetitionAccess></PublicShell>;

  return <PublicShell showNavigation={false}><PageHeader title="动态答题" backTo={`/competitions/${competitionId}/workspace/workshop/skills/${task.skillId}`} /><RequireCompetitionAccess><div className="space-y-6 px-4 py-5"><CompetitionContextLine competitionId={competitionId} />{availability === "locked" ? <Card className="border border-warning bg-warning-bg"><p className="font-medium text-warning-text">当前缺少任务材料</p><p className="mt-2 text-sm text-warning-text">{missing.length ? missing.map(item => item.label).join("、") : "该任务当前被原型状态锁定"}</p><SecondaryButton className="mt-4 w-full" onClick={() => navigate(`/competitions/${competitionId}/workspace/workshop/project`)}>查看项目材料</SecondaryButton></Card> : flowSpecForTask(taskId) ? <StructuredAnswerForm competitionId={competitionId} taskId={taskId} /> : <GenericAnswerForm competitionId={competitionId} taskId={taskId} />}</div></RequireCompetitionAccess></PublicShell>;
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
  const missing = missingMaterials(runtime, taskId);
  const spec = flowSpecForTask(taskId);
  const hasAnswer = Boolean(run?.answer.trim());
  const ready = taskAvailability(runtime, taskId) !== "locked" && hasAnswer;
  const completeness = spec ? completionFor(run?.answers ?? {}, spec.questions.length, run?.focus ?? [], run?.note ?? "") : hasAnswer ? 100 : 0;
  const confirm = () => { if (!ready) return; startTask(competitionId, taskId); navigate(`${taskBasePath(competitionId, taskId)}/progress`); };

  return <PublicShell showNavigation={false}><PageHeader title="生成确认" backTo={`${taskBasePath(competitionId, taskId)}/answer`} /><RequireCompetitionAccess><div className="space-y-6 px-4 py-5"><CompetitionContextLine competitionId={competitionId} />
    <Card><p className="text-xs font-medium text-text-brand">{spec?.skillLabel ?? task.skillId.toUpperCase()}</p><h1 className="mt-2 text-lg font-semibold text-text-primary">{spec?.instanceTitle ?? task.title}</h1><p className="mt-2 text-sm leading-5 text-text-secondary">{task.summary}</p>{task.skillId === "s2" && <div className="mt-3 rounded-control bg-surface-subtle p-3"><p className="text-xs text-text-tertiary">任务目标</p><p className="mt-1 text-sm text-text-primary">从市场、用户、竞争和资源维度分析项目可行性</p></div>}</Card>

    {spec ? <>
      <Section title="问答摘要"><div className="space-y-2">{spec.questions.map(question => <Card key={question.id}><p className="text-xs text-text-secondary">{question.title}</p><p className="mt-1 text-sm font-medium text-text-primary">{(run?.answers[question.id] ?? []).join("、") || "未回答"}</p></Card>)}</div></Section>
      <Section title="AI 已提取的核心信息"><Card><div className="flex flex-wrap gap-2">{spec.extractedInfo.map(item => <StatusTag key={item} tone="neutral">{item}</StatusTag>)}</div></Card></Section>
      <Section title="主观补充"><Card><p className="text-sm text-text-primary">{run?.note.trim() || "未填写补充信息"}</p>{run?.files.length ? <p className="mt-2 text-xs text-text-secondary">已附 {run.files.length} 个文件：{run.files.join("、")}</p> : null}</Card></Section>
      <Card><div className="flex items-center justify-between"><span className="text-sm text-text-secondary">作答完善度</span><strong className="text-lg text-text-primary">{completeness}%</strong></div></Card>
    </> : <Section title="问答摘要"><Card><p className="text-sm leading-6 text-text-primary">{run?.answer || "尚未填写回答"}</p></Card></Section>}

    <Section title="预计算力消耗"><Card><div className="space-y-3 text-sm"><div className="flex justify-between gap-3"><span className="text-text-secondary">预计算力</span><strong className="text-text-primary">{spec?.computeRange ?? task.computeCost}</strong></div>{spec && <><div className="flex justify-between gap-3"><span className="text-text-secondary">当前可用</span><strong className="text-text-primary">{spec.availableCompute}</strong></div><div className="flex justify-between gap-3"><span className="text-text-secondary">本次冻结</span><strong className="text-text-primary">{spec.freezeCompute}</strong></div><p className="text-xs leading-5 text-text-tertiary">确认后先按上限冻结，完成后按实际结算并释放差额。以上均为 Mockplus 原型示例，不代表真实计价规则。</p></>}</div></Card></Section>
    <Card className="border border-info bg-info-bg"><p className="text-sm font-medium text-info-text">结果对全队可见</p><p className="mt-2 text-sm leading-5 text-info-text">队员可编辑后提交确认，队长可采纳或标记用于比赛。事实与 AI 建议严格区分。</p></Card>
    {!ready && <Card className="border border-warning bg-warning-bg"><p className="font-medium text-warning-text">还不能开始生成</p><p className="mt-2 text-sm text-warning-text">请返回补充回答或项目材料。</p></Card>}
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
  const status = runtime.taskRuns[taskId]?.status ?? "ready";
  const result = resultById(task.resultId);
  const spec = flowSpecForTask(taskId);
  const percent = status === "completed" ? 100 : status === "running" ? 68 : status === "queued" ? 28 : 0;
  const stageState = useMemo(() => [
    { label: "已冻结算力", detail: `本次冻结 ${spec?.freezeCompute ?? task.computeCost} 算力`, done: ["queued", "running", "completed"].includes(status) },
    { label: "已读取参赛档案", detail: "6 项参赛资料已带入", done: ["queued", "running", "completed"].includes(status) },
    { label: "已检查问答材料", detail: `等待确认的文件 ${runtime.taskRuns[taskId]?.files.length ?? 0} 个`, done: ["running", "completed"].includes(status) },
    { label: "正在生成诊断建议", detail: "正在识别需求证据和风险", done: status === "completed" },
    { label: "质量检查", detail: "完成后会生成可编辑成果", done: status === "completed" },
  ], [runtime.taskRuns, spec?.freezeCompute, status, task.computeCost, taskId]);

  if (status === "failed") return <PublicShell showNavigation={false}><PageHeader title="任务进度" backTo={`/competitions/${competitionId}/workspace/workshop`} /><RequireCompetitionAccess><div className="space-y-4 px-4 py-6"><Card className="border border-danger bg-danger-bg"><StatusTag tone="danger">生成失败</StatusTag><p className="mt-3 text-sm text-danger-text">本次原型运行失败，回答仍然保留。</p></Card><Button className="w-full" onClick={() => retryTask(competitionId, taskId)}>重新排队</Button></div></RequireCompetitionAccess></PublicShell>;

  return <PublicShell showNavigation={false}><PageHeader title="任务进度" backTo={`/competitions/${competitionId}/workspace/workshop`} /><RequireCompetitionAccess><div className="space-y-6 px-4 py-5"><CompetitionContextLine competitionId={competitionId} />
    <Card><p className="text-sm text-text-secondary">{status === "completed" ? "生成完成" : "你可以离开，完成后会通知你…"}</p><h1 className="mt-2 text-lg font-semibold text-text-primary">{status === "completed" ? `已生成 ${spec?.skillLabel ?? task.skillId.toUpperCase()}小报告` : `正在生成 ${spec?.skillLabel ?? task.skillId.toUpperCase()}小报告`}</h1><div className="mt-4 flex items-end justify-between"><strong className="text-3xl text-text-primary">{percent}%</strong><StatusTag tone={status === "completed" ? "success" : "info"}>{status === "completed" ? "已完成" : "处理中…"}</StatusTag></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-subtle"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${percent}%` }} /></div></Card>
    <Section title="生成进度"><div className="space-y-2">{stageState.map((stage, index) => <Card key={stage.label}><div className="flex items-start gap-3"><span className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${stage.done ? "bg-success-bg text-success-text" : index === 3 && status === "running" ? "bg-info-bg text-info-text" : "bg-surface-subtle text-text-tertiary"}`}>{stage.done ? "✓" : index + 1}</span><div><p className="text-sm font-medium text-text-primary">{stage.label}</p><p className="mt-1 text-xs text-text-secondary">{stage.detail}</p></div></div></Card>)}</div></Section>
    <Card className="border border-info bg-info-bg"><p className="text-sm leading-5 text-info-text">任务可以离开页面，完成后会通过站内消息通知你。返回工坊后，运行状态仍保留在当前赛事 Task Runtime。</p></Card>
    <div className="space-y-2">{status === "queued" && <Button className="w-full" onClick={() => advanceTask(competitionId, taskId)}>模拟开始生成</Button>}{status === "running" && <Button className="w-full" onClick={() => advanceTask(competitionId, taskId)}>模拟完成</Button>}{status === "completed" && <Button className="w-full" onClick={() => navigate(`/competitions/${competitionId}/workspace/workshop/results/${task.resultId}`)}>查看成果详情</Button>}{status === "ready" || status === "draft" ? <SecondaryButton className="w-full" onClick={() => navigate(`${taskBasePath(competitionId, taskId)}/answer`)}>返回动态答题</SecondaryButton> : <SecondaryButton className="w-full" onClick={() => navigate(`/competitions/${competitionId}/workspace/workshop`)}>返回工作台</SecondaryButton>}</div>
    <TaskScenarioTools competitionId={competitionId} taskId={taskId} />
  </div></RequireCompetitionAccess></PublicShell>;
}

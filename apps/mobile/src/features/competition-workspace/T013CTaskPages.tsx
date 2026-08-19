import { useEffect, useState, type ChangeEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Battery, EyeOff, FileCheck2, Snowflake, Sparkles, Users } from "lucide-react";
import { Button, Card, PageHeader, PublicShell, SecondaryButton, Section, StatusTag } from "../../components/ui";
import { computePolicyForTask, taskById } from "./data";
import { T013BTaskAnswerPage, T013BTaskProgressPage, T013BTaskReviewPage } from "./T013BTaskPages";
import { useWorkshopRuntime } from "./runtime";
import { CompetitionContextLine, RequireCompetitionAccess, TaskScenarioTools } from "./shared";

type Question = {
  id: string;
  label: string;
  type: "single" | "multiple";
  options: string[];
  helper?: string;
};

const questions: Record<string, Question[]> = {
  "s5-score-precheck": [
    {
      id: "stage",
      label: "当前项目已经推进到哪个阶段？",
      type: "single",
      options: ["已完成样品 / MVP", "已上线运营并有数据", "已进入校赛 / 省赛", "已进入国赛冲刺"],
    },
    {
      id: "materials",
      label: "目前已经具备哪些比赛材料？",
      type: "multiple",
      options: ["路演 PPT", "经营数据", "用户调研", "知识产权"],
      helper: "只选择已经真实具备的材料，AI 不会把预测当成赛事事实。",
    },
  ],
  "s5-pitch-ppt": [
    {
      id: "duration",
      label: "本次路演预计时长？",
      type: "single",
      options: ["3 分钟", "5 分钟", "8 分钟", "10 分钟及以上"],
    },
    {
      id: "style",
      label: "希望 PPT 使用什么风格？",
      type: "single",
      options: ["商务风", "极简风", "设计风", "轻奢风"],
    },
  ],
  "s6-company-match": [
    {
      id: "industry",
      label: "期望行业",
      type: "multiple",
      options: ["互联网/科技", "金融科技", "软件开发 SaaS", "电子商务", "AI/大数据", "新媒体内容", "物联网", "物流/供应链", "不限"],
    },
    {
      id: "city",
      label: "希望工作城市",
      type: "multiple",
      options: ["北京", "广州", "杭州", "上海", "深圳", "成都", "南京", "武汉", "不限"],
    },
  ],
};

const specializedTaskIds = new Set(Object.keys(questions));
const generatedTaskIds = new Set(["s5-pitch-ppt", "s6-company-match"]);

function taskBasePath(competitionId: string, taskId: string) {
  return `/competitions/${competitionId}/workspace/workshop/tasks/${taskId}`;
}

function QuestionField({ question, values, onToggle }: { question: Question; values: string[]; onToggle: (option: string) => void }) {
  return <fieldset className="space-y-3">
    <legend className="text-base font-semibold leading-6 text-text-primary">{question.label}</legend>
    {question.helper && <p className="text-xs leading-5 text-text-secondary">{question.helper}</p>}
    <div className="flex flex-wrap gap-2">{question.options.map(option => {
      const selected = values.includes(option);
      return <button
        key={option}
        type="button"
        aria-pressed={selected}
        onClick={() => onToggle(option)}
        className={`min-h-touch rounded-control border px-3 text-sm font-medium ${selected ? "border-primary bg-info-bg text-text-brand" : "border-border bg-surface text-text-secondary"}`}
      >{option}</button>;
    })}</div>
  </fieldset>;
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
  const taskQuestions = questions[taskId] ?? [];
  const firstUnanswered = taskQuestions.findIndex(question => !(run?.selections?.[question.id]?.length));
  const [step, setStep] = useState(firstUnanswered < 0 ? Math.max(0, taskQuestions.length - 1) : firstUnanswered);
  const [selections, setSelections] = useState<Record<string, string[]>>(run?.selections ?? {});
  const [note, setNote] = useState(run?.note || run?.answer || "");
  const [uploadName, setUploadName] = useState(run?.uploadName ?? "");

  useEffect(() => {
    setSelections(run?.selections ?? {});
    setNote(run?.note || run?.answer || "");
    setUploadName(run?.uploadName ?? "");
  }, [run?.answer, run?.note, run?.selections, run?.uploadName, taskId]);

  if (run?.status === "completed" && generatedTaskIds.has(taskId)) {
    return <PublicShell showNavigation={false}><PageHeader title="任务已完成" backTo={`/competitions/${competitionId}/workspace/workshop`} /><RequireCompetitionAccess><div className="space-y-4 px-4 py-6"><Card><StatusTag tone="success">已完成</StatusTag><h2 className="mt-3 font-semibold text-text-primary">{task.title}</h2></Card><Button className="w-full" onClick={() => navigate(`/competitions/${competitionId}/workspace/workshop/results/${task.resultId}`)}>查看成果</Button></div></RequireCompetitionAccess></PublicShell>;
  }
  if (run && generatedTaskIds.has(taskId) && ["queued", "running", "failed"].includes(run.status)) return <SpecializedProgressPage />;

  const answered = taskQuestions.filter(question => (selections[question.id]?.length ?? 0) > 0).length;
  const completeness = taskQuestions.length ? Math.round((answered / taskQuestions.length) * 100) : 100;
  const question = taskQuestions[step];
  const currentAnswered = question ? (selections[question.id]?.length ?? 0) > 0 : true;
  const allAnswered = completeness === 100;
  const isS5Precheck = taskId === "s5-score-precheck";
  const isS5Ppt = taskId === "s5-pitch-ppt";
  const isS6 = taskId === "s6-company-match";

  const toggle = (option: string) => {
    if (!question) return;
    setSelections(current => {
      const selected = current[question.id] ?? [];
      const next = question.type === "multiple"
        ? (selected.includes(option) ? selected.filter(value => value !== option) : [...selected, option])
        : [option];
      return { ...current, [question.id]: next };
    });
  };

  const submit = () => {
    if (!allAnswered) return;
    saveTaskDraft(competitionId, taskId, { selections, note: note.trim(), uploadName: uploadName || undefined });
    if (isS5Precheck) {
      navigate(`${taskBasePath(competitionId, "s5-pitch-ppt")}/answer`);
      return;
    }
    navigate(`${taskBasePath(competitionId, taskId)}/review`);
  };

  const title = isS5Precheck ? "赛事评分预检" : isS5Ppt ? "路演 PPT" : "公司推荐";
  const nextLabel = isS5Precheck ? "完成预检，继续 PPT 问答" : "回答完毕，进入下一步";
  const noteTitle = isS5Precheck ? "还有什么要点补充（选填）" : isS5Ppt ? "是否还有要点补充（选填）" : "补充说明（选填）";
  const notePlaceholder = isS5Precheck
    ? "补充评委可能关注的内容、项目限制或其它比赛信息…"
    : isS5Ppt
      ? "补充路演必须保留的事实、叙事重点或限制…"
      : "补充希望避开的行业、工作方式或其它个人偏好…";
  const uploadTitle = isS5Ppt ? "上传其它数据（选填）" : "补充材料（选填）";
  const uploadHint = isS6
    ? "可补充简历、项目材料或图片；原型只记录文件名，不上传真实文件。"
    : "支持 PDF / Excel / CSV / 图片；原型只记录文件名，不上传真实文件。";

  return <PublicShell showNavigation={false}><PageHeader title="动态答题" backTo={`/competitions/${competitionId}/workspace/workshop/skills/${task.skillId}`} /><RequireCompetitionAccess><div className="space-y-6 px-4 py-5">
    <CompetitionContextLine competitionId={competitionId} />
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-text-brand">{task.skillId.toUpperCase()} · 动态问答</p>
          <h1 className="mt-2 text-lg font-semibold text-text-primary">{title}</h1>
          <p className="mt-2 text-sm leading-5 text-text-secondary">{isS5Precheck ? "先按当前项目阶段和真实比赛材料做评分预检，再进入独立的 PPT 问答。" : isS5Ppt ? "这一段与评分预检分开，按路演时长和 PPT 风格整理生成输入。" : "根据你的期望行业和工作城市生成公司推荐小报告。"}</p>
        </div>
        <StatusTag tone="info">{step + 1}/{taskQuestions.length}</StatusTag>
      </div>
    </Card>

    {question && <Section title={`问题 ${step + 1}`} subtitle="按原型逐题回答"><Card data-testid="t013c-dynamic-question">
      <QuestionField question={question} values={selections[question.id] ?? []} onToggle={toggle} />
      {currentAnswered && step < taskQuestions.length - 1 && <div className="mt-5 rounded-control bg-info-bg p-3" data-testid="t013c-ai-next-feedback"><div className="flex items-center gap-2 text-sm font-medium text-info-text"><Sparkles size={16} aria-hidden="true" />AI 正在分析回答，准备下一题</div></div>}
    </Card></Section>}

    <div className="grid grid-cols-2 gap-2">
      <SecondaryButton disabled={step === 0} onClick={() => setStep(current => Math.max(0, current - 1))}>上一题</SecondaryButton>
      {step < taskQuestions.length - 1
        ? <Button disabled={!currentAnswered} onClick={() => setStep(current => Math.min(taskQuestions.length - 1, current + 1))}>继续下一题</Button>
        : <Button disabled={!allAnswered} onClick={submit}>{nextLabel}</Button>}
    </div>

    {allAnswered && <Section title={noteTitle}><textarea value={note} onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setNote(event.target.value)} rows={4} className="w-full rounded-control border border-border bg-surface p-3 text-base leading-6 text-text-primary outline-none focus:border-primary" placeholder={notePlaceholder} /></Section>}

    {allAnswered && <Section title={uploadTitle}><label className="flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-control border border-dashed border-border bg-surface px-4 text-center"><span className="text-sm font-medium text-text-brand">{uploadName || "点击选择补充材料"}</span><span className="mt-1 text-xs leading-5 text-text-secondary">{uploadHint}</span><input className="sr-only" type="file" accept=".pdf,.xls,.xlsx,.csv,image/*" onChange={event => setUploadName(event.target.files?.[0]?.name ?? "")} /></label></Section>}

    <Card className="bg-surface-subtle" data-testid="t013c-completeness"><div className="flex items-center justify-between text-sm"><span className="text-text-secondary">作答完善度</span><strong className="text-text-primary">{completeness}%</strong></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-border-subtle"><div className="h-full bg-primary" style={{ width: `${completeness}%` }} /></div></Card>

    {isS6 && <Card className="border border-info bg-info-bg"><p className="font-medium text-info-text">个人建议边界</p><p className="mt-2 text-sm leading-5 text-info-text">可读取你已有的参赛档案作为事实输入，但不会改写 StudentProfile、比赛成绩或证书。</p></Card>}
    <TaskScenarioTools competitionId={competitionId} taskId={taskId} />
  </div></RequireCompetitionAccess></PublicShell>;
}

function summaryRows(taskId: string, runtime: ReturnType<ReturnType<typeof useWorkshopRuntime>["getRuntime"]>) {
  const ids = taskId === "s5-pitch-ppt" ? ["s5-score-precheck", "s5-pitch-ppt"] : [taskId];
  return ids.flatMap(id => (questions[id] ?? []).map(question => ({
    id: `${id}-${question.id}`,
    label: question.label,
    value: runtime.taskRuns[id]?.selections?.[question.id]?.join("、") || "未回答",
  })));
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
  const precheckRun = runtime.taskRuns["s5-score-precheck"];
  const policy = computePolicyForTask(taskId);
  const rows = summaryRows(taskId, runtime);
  const allAnswered = rows.length > 0 && rows.every(row => row.value !== "未回答");
  const enoughCompute = runtime.computeBalance >= policy.estimateMax;
  const isS6 = taskId === "s6-company-match";
  const ready = allAnswered && enoughCompute;
  const coreFacts = rows.flatMap(row => row.value.split("、")).filter(Boolean).slice(0, 8);
  const supplementalNotes = taskId === "s5-pitch-ppt"
    ? [precheckRun?.note, run?.note].filter((value): value is string => Boolean(value))
    : [run?.note].filter((value): value is string => Boolean(value));
  const supplementalFiles = taskId === "s5-pitch-ppt"
    ? [precheckRun?.uploadName, run?.uploadName].filter((value): value is string => Boolean(value))
    : [run?.uploadName].filter((value): value is string => Boolean(value));

  const confirm = () => {
    if (!ready || !startTask(competitionId, taskId)) return;
    navigate(`${taskBasePath(competitionId, taskId)}/progress`);
  };

  return <PublicShell showNavigation={false}><PageHeader title={isS6 ? "公司推荐生成确认" : "PPT 生成确认"} backTo={`${taskBasePath(competitionId, taskId)}/answer`} /><RequireCompetitionAccess><div className="space-y-6 px-4 py-5">
    <CompetitionContextLine competitionId={competitionId} />
    <Card>
      <p className="text-xs font-medium text-text-brand">{isS6 ? "S6 · 职业规划 / 公司推荐" : "S5 · 赛事冲刺 / 路演 PPT"}</p>
      <h1 className="mt-2 text-lg font-semibold text-text-primary">{isS6 ? "生成公司推荐小报告" : "基于用户方案生成可直接使用的路演 PPT"}</h1>
      <p className="mt-3 text-sm leading-6 text-text-secondary">{isS6 ? "根据本人填写的职业偏好与已有参赛档案生成探索建议；推荐不是能力事实，也不是人才评分。" : "确认后创建当前赛事下的 PPT 生成任务。原型只生成结构化 mock 成果，不伪造真实 PPT 文件或官方提交。"}</p>
    </Card>

    <Section title="问答摘要"><div className="space-y-2">{rows.map(row => <Card key={row.id}><p className="text-xs text-text-secondary">{row.label}</p><p className="mt-1 text-sm font-medium leading-5 text-text-primary">{row.value}</p></Card>)}</div></Section>

    <Section title="AI 提取核心信息"><Card data-testid="t013c-core-facts"><div className="flex flex-wrap gap-2">{coreFacts.map((value, index) => <StatusTag key={`${value}-${index}`} tone="neutral">{value}</StatusTag>)}</div>{supplementalNotes.length > 0 && <div className="mt-4 border-t border-border-subtle pt-3"><p className="text-xs text-text-secondary">主观补充</p>{supplementalNotes.map((note, index) => <p key={`${note}-${index}`} className="mt-1 text-sm leading-5 text-text-primary">{note}</p>)}</div>}{supplementalFiles.length > 0 && <div className="mt-3 border-t border-border-subtle pt-3"><p className="text-xs text-text-secondary">已附材料</p>{supplementalFiles.map((file, index) => <p key={`${file}-${index}`} className="mt-1 text-xs text-text-brand">{file}</p>)}</div>}</Card></Section>

    <div className="grid grid-cols-1 gap-3">
      <Card data-testid="t013c-review-estimate"><div className="flex items-start gap-3"><div className="rounded-control bg-info-bg p-2 text-info-text"><Battery size={20} aria-hidden="true" /></div><div><p className="text-xs font-medium text-text-brand">算力预估</p><p className="mt-1 text-sm text-text-secondary">当前可用 {runtime.computeBalance}</p><p className="mt-1 text-base font-semibold text-text-primary">预计 {policy.estimateMin}–{policy.estimateMax} 算力</p></div></div></Card>
      <Card data-testid="t013c-review-freeze"><div className="flex items-start gap-3"><div className="rounded-control bg-info-bg p-2 text-info-text"><Snowflake size={20} aria-hidden="true" /></div><div><p className="text-xs font-medium text-text-brand">冻结提示</p><p className="mt-1 text-sm text-text-secondary">确认后按原型规则先冻结上限 {policy.estimateMax}；这只是原型表达，不形成真实扣费规则。</p></div></div></Card>
      {isS6
        ? <Card className="border border-info bg-info-bg" data-testid="s6-private-visibility"><div className="flex items-start gap-3"><EyeOff size={20} aria-hidden="true" className="text-info-text" /><div><p className="font-medium text-info-text">生成结果仅自己可见</p><p className="mt-1 text-sm leading-5 text-info-text">本人填写 / 赛事档案属于事实输入；企业匹配和岗位方向均标注为 AI 建议，不写回可信档案。</p></div></div></Card>
        : <Card data-testid="t013c-team-visibility"><div className="flex items-start gap-3"><Users size={20} aria-hidden="true" className="text-info-text" /><div><p className="font-medium text-text-primary">结果对全队可见</p><p className="mt-1 text-sm leading-5 text-text-secondary">队员可编辑后提交确认，队长可采纳并标记用于比赛。</p></div></div></Card>}
      <Card><div className="flex items-start gap-3"><FileCheck2 size={20} aria-hidden="true" className="text-info-text" /><div><p className="font-medium text-text-primary">成果归属</p><p className="mt-1 text-sm leading-5 text-text-secondary">绑定当前 competitionId / workspace / task，不跨赛事复用运行态。</p></div></div></Card>
    </div>

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
  const progress = run?.progress ?? 0;
  const isS6 = taskId === "s6-company-match";
  const output = isS6 ? "公司推荐小报告" : "路演 PPT";
  const steps = [
    { label: "已读取参赛档案", done: progress >= 16 },
    { label: "已检查问答材料", done: progress >= 35 },
    { label: isS6 ? "正在生成公司推荐小报告" : "正在生成路演 PPT", done: progress >= 68 },
    { label: "质量检查", done: progress >= 100 },
  ];
  const tone = status === "failed" ? "danger" : status === "completed" ? "success" : "info";
  const label = status === "queued" ? "排队中" : status === "running" ? "运行中" : status === "failed" ? "生成失败" : status === "completed" ? "已完成" : "尚未开始";

  return <PublicShell showNavigation={false}><PageHeader title="任务进度" backTo={`/competitions/${competitionId}/workspace/workshop`} /><RequireCompetitionAccess><div className="space-y-6 px-4 py-5">
    <CompetitionContextLine competitionId={competitionId} />
    <Card><div className="flex items-center justify-between gap-3"><StatusTag tone={tone}>{label}</StatusTag><strong className="text-lg text-text-primary">{progress}%</strong></div><h1 className="mt-3 text-lg font-semibold text-text-primary">生成{output}</h1><p className="mt-2 text-sm leading-5 text-text-secondary">{status === "completed" ? `已生成：${output}` : "任务可离开页面，完成后会通过站内消息通知。"}</p>{Boolean(run?.reservedCompute) && <p className="mt-3 text-xs font-medium text-text-brand">已冻结 {run?.reservedCompute} 算力</p>}<div className="mt-4 h-2 overflow-hidden rounded-full bg-border-subtle"><div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} /></div></Card>

    <Section title="处理步骤"><div className="space-y-2">{steps.map(step => <Card key={step.label}><div className="flex items-center justify-between gap-3"><span className="text-sm text-text-primary">{step.label}</span><StatusTag tone={step.done ? "success" : "neutral"}>{step.done ? "已完成" : "等待中"}</StatusTag></div></Card>)}</div></Section>

    <div className="space-y-2">
      {status === "queued" && <Button className="w-full" onClick={() => advanceTask(competitionId, taskId)}>模拟进入运行</Button>}
      {status === "running" && <Button className="w-full" onClick={() => advanceTask(competitionId, taskId)}>模拟生成完成</Button>}
      {status === "failed" && <Button className="w-full" onClick={() => retryTask(competitionId, taskId)}>重新排队</Button>}
      {status === "completed" && <Button className="w-full" onClick={() => navigate(`/competitions/${competitionId}/workspace/workshop/results/${task.resultId}`)}>查看本任务成果</Button>}
      {status === "ready" && <SecondaryButton className="w-full" onClick={() => navigate(`${taskBasePath(competitionId, taskId)}/answer`)}>返回任务</SecondaryButton>}
      <SecondaryButton className="w-full" onClick={() => navigate(`/competitions/${competitionId}/workspace/workshop`)}>离开任务，返回工坊</SecondaryButton>
    </div>
    <TaskScenarioTools competitionId={competitionId} taskId={taskId} />
  </div></RequireCompetitionAccess></PublicShell>;
}

export function T013CTaskAnswerPage() {
  const { taskId } = useParams();
  return taskId && specializedTaskIds.has(taskId) ? <SpecializedAnswerPage /> : <T013BTaskAnswerPage />;
}

export function T013CTaskReviewPage() {
  const { taskId } = useParams();
  return taskId && generatedTaskIds.has(taskId) ? <SpecializedReviewPage /> : <T013BTaskReviewPage />;
}

export function T013CTaskProgressPage() {
  const { taskId } = useParams();
  return taskId && generatedTaskIds.has(taskId) ? <SpecializedProgressPage /> : <T013BTaskProgressPage />;
}

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
  ai?: string;
  customPlaceholder?: string;
};

export const CUSTOM_PREFIX = "✎ ";
const unlimitedOptions = new Set(["不限", "不限，看机会"]);

export function pickOptions(values: string[] = []) {
  return values.filter(value => !value.startsWith(CUSTOM_PREFIX));
}

export function customValue(values: string[] = []) {
  return values.find(value => value.startsWith(CUSTOM_PREFIX))?.slice(CUSTOM_PREFIX.length) ?? "";
}

function aiFeedback(question: Question, values: string[]) {
  const picked = pickOptions(values);
  const custom = customValue(values);
  if (!picked.length && !custom) return "还没有收到回答，AI 会等待你完成这一题。";
  const parts = [...picked];
  if (custom) parts.push(`补充「${custom}」`);
  return `已记录你的回答（${parts.join("、")}），AI 正在结合这些信息继续分析，准备下一题。`;
}

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
  "s6-job-recommend": [
    {
      id: "industry",
      label: "你期望从事哪类职业方向？",
      type: "multiple",
      options: ["技术 / 研发", "运营 / 增长", "创意 / 内容", "产品 / 商业", "职能 / 管理", "不限"],
      ai: "先了解一下你期望的职业方向，我会据此筛选企业库。可多选，也可以补充选项之外的描述。",
      customPlaceholder: "还可补充具体方向，如 硬件、测试、供应链…",
    },
    {
      id: "city",
      label: "你希望在哪些城市工作？",
      type: "multiple",
      options: ["一线城市（北上广深）", "新一线城市（杭州、成都等）", "二线城市", "不限，看机会"],
      ai: "选择意向城市后，我会优先匹配当地及同梯队的企业。",
      customPlaceholder: "还可补充具体城市，如 苏州、武汉、西安…",
    },
    {
      id: "skills",
      label: "你掌握哪些技能？",
      type: "multiple",
      options: ["软件开发", "数据分析", "电商运营", "内容创作", "市场营销", "供应链管理", "项目管理", "不限"],
      ai: "说说你掌握或正在学习的技能，这会影响岗位匹配方向。",
      customPlaceholder: "还可补充其它技能，如 英语、视频剪辑、用户调研…",
    },
    {
      id: "salary",
      label: "你期望的首月薪资范围？",
      type: "single",
      options: ["3-5k", "5-8k", "8-12k", "12-18k", "18k 以上", "暂不填写"],
      ai: "你对首月薪资有什么预期？只作为求职探索的参考。",
      customPlaceholder: "也可直接填写具体期望薪资…",
    },
    {
      id: "size",
      label: "你对公司规模有偏好吗？",
      type: "multiple",
      options: ["初创公司（50人以下）", "小型（50-200人）", "中型（200-500人）", "大型（500人以上）", "不限"],
      ai: "对公司的规模阶段有偏好吗？这会影响推荐的确定性。",
      customPlaceholder: "还可补充偏好的公司类型，如 国企、外企、创业团队…",
    },
    {
      id: "growthSupport",
      label: "希望公司提供哪些成长支持？（选填）",
      type: "multiple",
      options: ["导师带教", "系统培训", "轮岗机会", "晋升通道", "项目实战", "不限"],
      ai: "最后，你希望公司提供哪些成长支持？这一项可以留空。",
      customPlaceholder: "还可补充其它成长支持…",
    },
  ],
  "s6-career-advisor": [
    {
      id: "stage",
      label: "你目前处于哪个阶段？",
      type: "single",
      options: ["大一", "大二", "大三", "大四", "研究生", "应届 / 毕业 1-2 年"],
      ai: "先确认你目前所处的阶段，这决定了建议的落点。",
      customPlaceholder: "还可补充当前状态，如 正在求职、准备考研…",
    },
    {
      id: "major",
      label: "你的专业属于哪一类？",
      type: "single",
      options: ["经管商科 / 电商 / 财会", "计算机 / 数据 / 信息技术", "设计传媒 / 文学艺术", "工程制造 / 建筑交通", "教育 / 文旅 / 公共服务", "农林食品 / 医学健康", "法学 / 社科 / 其他"],
      ai: "你的专业属于哪一类？这会影响职业方向的初筛。",
      customPlaceholder: "也可直接填写具体专业，如 物流管理、食品科学…",
    },
    {
      id: "interests",
      label: "你更愿意投入哪些类型的事情？",
      type: "multiple",
      options: ["动手操作、使用工具完成任务", "研究分析、探究问题背后的原理", "创意设计、写作、视频或内容创作", "帮助他人、教学、服务或协作支持", "带领团队、推动项目、争取资源", "整理流程、处理数据、把事情安排有序"],
      ai: "你更愿意投入哪些类型的事情？可多选，也可以补充选项之外的类型。",
      customPlaceholder: "还可补充其它类型，如 动手实验、外出调研…",
    },
    {
      id: "abilities",
      label: "你觉得自己比较强的能力是？",
      type: "multiple",
      options: ["沟通表达", "文案写作", "逻辑思考", "数据分析", "组织协调", "创意设计", "执行细致"],
      ai: "你觉得自己比较强的能力有哪些？我会据此收敛画像标签。",
      customPlaceholder: "还可补充其它能力…",
    },
    {
      id: "city",
      label: "优先考虑在哪个城市发展？",
      type: "single",
      options: ["一线城市（北上广深）", "新一线城市（成都、杭州等）", "二线城市", "三线及以下 / 家乡", "海外", "不限，看机会"],
      ai: "优先考虑在哪个城市发展？",
      customPlaceholder: "还可补充具体城市…",
    },
    {
      id: "industry",
      label: "比较感兴趣的行业",
      type: "multiple",
      options: ["互联网 / 科技", "金融", "制造 / 工程", "教育 / 公共服务", "文旅 / 传媒", "电商 / 消费", "商贸 / 消费", "医疗 / 健康", "咨询 / 专业服务", "不限"],
      ai: "比较感兴趣哪些行业？可多选，也可以补充其它方向。",
      customPlaceholder: "还可补充其它行业，如 新能源、游戏…",
    },
    {
      id: "goal",
      label: "目前的职业目标方向更偏向？",
      type: "single",
      options: ["技术 / 数据方向", "运营 / 增长方向", "创意 / 内容方向", "产品 / 商业方向", "暂时还不确定，想先探索"],
      ai: "目前的职业目标更偏向哪个方向？暂时不确定也没关系，可以选最后一个先探索。",
      customPlaceholder: "也可直接描述你的目标，如 想进互联网做产品…",
    },
  ],
};

const specializedTaskIds = new Set(Object.keys(questions));
const generatedTaskIds = new Set(["s5-pitch-ppt", "s6-job-recommend", "s6-career-advisor"]);

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

  const requiredQuestions = taskQuestions.filter(question => !question.label.includes("（选填）"));
  const answered = requiredQuestions.filter(question => (selections[question.id]?.length ?? 0) > 0).length;
  const completeness = requiredQuestions.length ? Math.round((answered / requiredQuestions.length) * 100) : 100;
  const question = taskQuestions[step];
  const currentAnswered = question ? (selections[question.id]?.length ?? 0) > 0 : true;
  const allAnswered = completeness === 100;
  const isS5Precheck = taskId === "s5-score-precheck";
  const isS5Ppt = taskId === "s5-pitch-ppt";
  const isS6 = taskId === "s6-job-recommend";
  const isCareerAdvisor = taskId === "s6-career-advisor";
  const isPersonal = isS6 || isCareerAdvisor;

  const setCustom = (questionId: string, value: string) => {
    setSelections(current => {
      const existing = current[questionId] ?? [];
      const withoutCustom = existing.filter(item => !item.startsWith(CUSTOM_PREFIX));
      const trimmed = value.trim();
      const next = trimmed ? [...withoutCustom, CUSTOM_PREFIX + trimmed] : withoutCustom;
      return { ...current, [questionId]: next };
    });
  };

  const toggle = (option: string) => {
    if (!question) return;
    setSelections(current => {
      const existing = current[question.id] ?? [];
      const optionsOnly = existing.filter(item => !item.startsWith(CUSTOM_PREFIX));
      const customOnly = existing.filter(item => item.startsWith(CUSTOM_PREFIX));
      let nextOptions: string[];
      if (question.type === "single") {
        nextOptions = [option];
      } else if (unlimitedOptions.has(option)) {
        nextOptions = optionsOnly.includes(option) ? [] : [option];
      } else {
        nextOptions = optionsOnly.includes(option)
          ? optionsOnly.filter(value => value !== option)
          : [...optionsOnly, option].filter(value => !unlimitedOptions.has(value));
      }
      return { ...current, [question.id]: [...nextOptions, ...customOnly] };
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

  const title = isS5Precheck ? "赛事评分预检" : isS5Ppt ? "路演 PPT" : isCareerAdvisor ? "职业顾问" : "岗位推荐";
  const nextLabel = isS5Precheck ? "完成预检，继续 PPT 问答" : "回答完毕，进入下一步";
  const noteTitle = isS5Precheck ? "还有什么要点补充（选填）" : isS5Ppt ? "是否还有要点补充（选填）" : "补充说明（选填）";
  const notePlaceholder = isS5Precheck
    ? "补充评委可能关注的内容、项目限制或其它比赛信息…"
    : isS5Ppt
      ? "补充路演必须保留的事实、叙事重点或限制…"
      : isCareerAdvisor
        ? "补充职业困扰、具体目标、实践经历或其它个人背景…"
        : "补充希望加入的行业、岗位类型、工作偏好或其它信息…";
  const uploadTitle = isS5Ppt ? "上传其它数据（选填）" : "补充材料（选填）";
  const uploadHint = isS6 || isCareerAdvisor
    ? "可补充简历、项目材料或图片；原型只记录文件名，不上传真实文件。"
    : "支持 PDF / Excel / CSV / 图片；原型只记录文件名，不上传真实文件。";

  return <PublicShell showNavigation={false}><PageHeader title="动态答题" backTo={`/competitions/${competitionId}/workspace/workshop/skills/${task.skillId}`} /><RequireCompetitionAccess><div className="space-y-6 px-4 py-5">
    <CompetitionContextLine competitionId={competitionId} />
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-text-brand">{task.skillId.toUpperCase()} · 动态问答</p>
          <h1 className="mt-2 text-lg font-semibold text-text-primary">{title}</h1>
          <p className="mt-2 text-sm leading-5 text-text-secondary">{isS5Precheck ? "先按当前项目阶段和真实比赛材料做评分预检，再进入独立的 PPT 问答。" : isS5Ppt ? "这一段与评分预检分开，按路演时长和 PPT 风格整理生成输入。" : isCareerAdvisor ? "按专业、兴趣、能力与城市行业偏好，生成职业画像与岗位建议。" : "根据职业方向、城市与技能偏好，匹配可探索的企业与热门岗位。"}</p>
        </div>
        <StatusTag tone="info">{step + 1}/{taskQuestions.length}</StatusTag>
      </div>
    </Card>

    {question && <Section title={`问题 ${step + 1}`} subtitle={isPersonal ? "AI 顾问逐题对话" : "按原型逐题回答"}><Card data-testid="t013c-dynamic-question">
      {isPersonal && <div className="mb-4 flex items-start gap-3 rounded-control bg-surface-subtle p-3"><div className="rounded-control bg-info-bg p-2 text-info-text"><Sparkles size={16} aria-hidden="true" /></div><div><p className="text-sm font-medium text-text-primary">AI 顾问 · 第 {step + 1} 题</p><p className="mt-1 text-sm leading-5 text-text-secondary">{question.ai ?? question.label}</p></div></div>}
      <QuestionField question={question} values={selections[question.id] ?? []} onToggle={toggle} />
      {isPersonal && question.customPlaceholder && <textarea
        value={customValue(selections[question.id])}
        onChange={event => setCustom(question.id, event.target.value)}
        rows={2}
        className="mt-4 w-full rounded-control border border-border bg-surface p-3 text-sm leading-5 text-text-primary outline-none focus:border-primary"
        placeholder={`输入框（选填）：${question.customPlaceholder}`}
      />}
      {currentAnswered && (isPersonal
        ? <div className="mt-5 rounded-control bg-info-bg p-3" data-testid="t013c-ai-next-feedback"><div className="flex items-start gap-2 text-sm leading-5 text-info-text"><Sparkles size={16} aria-hidden="true" className="mt-0.5 shrink-0" /><span>{aiFeedback(question, selections[question.id] ?? [])}</span></div></div>
        : step < taskQuestions.length - 1 && <div className="mt-5 rounded-control bg-info-bg p-3" data-testid="t013c-ai-next-feedback"><div className="flex items-center gap-2 text-sm font-medium text-info-text"><Sparkles size={16} aria-hidden="true" />AI 正在分析回答，准备下一题</div></div>)}
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

    {isS6 && <Card className="border border-info bg-info-bg"><p className="font-medium text-info-text">个人建议边界</p><p className="mt-2 text-sm leading-5 text-info-text">企业与岗位仅为 AI 求职探索建议，不构成人才评分，也不会写入可信档案。</p></Card>}
    {isCareerAdvisor && <Card className="border border-info bg-info-bg"><p className="font-medium text-info-text">个人建议边界</p><p className="mt-2 text-sm leading-5 text-info-text">职业画像与岗位仅为 AI 探索建议，不构成人才评分，也不会写入可信档案。</p></Card>}
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
  const isS6 = taskId === "s6-job-recommend";
  const isCareerAdvisor = taskId === "s6-career-advisor";
  const isPersonal = isS6 || isCareerAdvisor;
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

  return <PublicShell showNavigation={false}><PageHeader title={isS6 ? "岗位推荐生成确认" : isCareerAdvisor ? "职业画像生成确认" : "PPT 生成确认"} backTo={`${taskBasePath(competitionId, taskId)}/answer`} /><RequireCompetitionAccess><div className="space-y-6 px-4 py-5">
    <CompetitionContextLine competitionId={competitionId} />
    <Card>
      <p className="text-xs font-medium text-text-brand">{isPersonal ? "S6 · 职业规划 / 个人建议" : "S5 · 赛事冲刺 / 路演 PPT"}</p>
      <h1 className="mt-2 text-lg font-semibold text-text-primary">{isS6 ? "生成企业岗位推荐" : isCareerAdvisor ? "生成职业画像与岗位建议" : "基于用户方案生成可直接使用的路演 PPT"}</h1>
      <p className="mt-3 text-sm leading-6 text-text-secondary">{isS6 ? "根据本人填写的职业方向、城市与技能偏好匹配企业与热门岗位；推荐不是能力事实，也不是人才评分。" : isCareerAdvisor ? "基于专业、兴趣、能力与城市行业偏好生成职业画像与岗位方向；建议不是能力事实，也不是人才评分。" : "确认后创建当前赛事下的 PPT 生成任务。原型只生成结构化 mock 成果，不伪造真实 PPT 文件或官方提交。"}</p>
    </Card>

    <Section title="问答摘要"><div className="space-y-2">{rows.map(row => <Card key={row.id}><p className="text-xs text-text-secondary">{row.label}</p><p className="mt-1 text-sm font-medium leading-5 text-text-primary">{row.value}</p></Card>)}</div></Section>

    <Section title="AI 提取核心信息"><Card data-testid="t013c-core-facts"><div className="flex flex-wrap gap-2">{coreFacts.map((value, index) => <StatusTag key={`${value}-${index}`} tone="neutral">{value}</StatusTag>)}</div>{supplementalNotes.length > 0 && <div className="mt-4 border-t border-border-subtle pt-3"><p className="text-xs text-text-secondary">主观补充</p>{supplementalNotes.map((note, index) => <p key={`${note}-${index}`} className="mt-1 text-sm leading-5 text-text-primary">{note}</p>)}</div>}{supplementalFiles.length > 0 && <div className="mt-3 border-t border-border-subtle pt-3"><p className="text-xs text-text-secondary">已附材料</p>{supplementalFiles.map((file, index) => <p key={`${file}-${index}`} className="mt-1 text-xs text-text-brand">{file}</p>)}</div>}</Card></Section>

    <div className="grid grid-cols-1 gap-3">
      <Card data-testid="t013c-review-estimate"><div className="flex items-start gap-3"><div className="rounded-control bg-info-bg p-2 text-info-text"><Battery size={20} aria-hidden="true" /></div><div><p className="text-xs font-medium text-text-brand">算力预估</p><p className="mt-1 text-sm text-text-secondary">当前可用 {runtime.computeBalance}</p><p className="mt-1 text-base font-semibold text-text-primary">预计 {policy.estimateMin}–{policy.estimateMax} 算力</p></div></div></Card>
      <Card data-testid="t013c-review-freeze"><div className="flex items-start gap-3"><div className="rounded-control bg-info-bg p-2 text-info-text"><Snowflake size={20} aria-hidden="true" /></div><div><p className="text-xs font-medium text-text-brand">冻结提示</p><p className="mt-1 text-sm text-text-secondary">确认后按原型规则先冻结上限 {policy.estimateMax}；这只是原型表达，不形成真实扣费规则。</p></div></div></Card>
      {isPersonal
        ? <Card className="border border-info bg-info-bg" data-testid="s6-private-visibility"><div className="flex items-start gap-3"><EyeOff size={20} aria-hidden="true" className="text-info-text" /><div><p className="font-medium text-info-text">生成结果仅自己可见</p><p className="mt-1 text-sm leading-5 text-info-text">{isS6 ? "本人填写 / 赛事档案属于事实输入；企业与岗位匹配均标注为 AI 建议，不写回可信档案。" : "本人填写 / 赛事档案属于事实输入；职业画像和岗位方向均标注为 AI 建议，不写回可信档案。"}</p></div></div></Card>
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
  const isS6 = taskId === "s6-job-recommend";
  const isCareerAdvisor = taskId === "s6-career-advisor";
  const output = isS6 ? "企业岗位推荐" : isCareerAdvisor ? "职业画像与岗位建议" : "路演 PPT";
  const steps = [
    { label: "已读取参赛档案", done: progress >= 16 },
    { label: "已检查问答材料", done: progress >= 35 },
    { label: isS6 ? "正在生成企业岗位推荐" : isCareerAdvisor ? "正在生成职业画像与岗位建议" : "正在生成路演 PPT", done: progress >= 68 },
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

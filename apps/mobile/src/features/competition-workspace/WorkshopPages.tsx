import { Sparkles, ArrowRight, AlertTriangle, BriefcaseBusiness, CheckCircle2, ClipboardCheck, Compass, FileUser, Gauge, ListChecks, Megaphone, Presentation, Radar, Stethoscope, Target, FileText } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Button, Card, PageHeader, PublicShell, SecondaryButton, Section, StatusTag } from "../../components/ui";
import { computePolicyForTask, materialLabels, resultById, resultDetailById, skillById, taskById, workshopSkills, workshopTasks, workspaceData, type MaterialKey } from "./data";
import { completedResults, isOptionalMaterialTask, missingMaterials, nextReadyTask, taskAvailability, useWorkshopRuntime } from "./runtime";
import { CompetitionContextLine, RequireCompetitionAccess, TaskScenarioTools } from "./shared";

function taskStatusLabel(status: ReturnType<typeof taskAvailability>) {
  if (status === "locked") return ["待补材料", "warning"] as const;
  if (status === "queued") return ["排队中", "info"] as const;
  if (status === "running") return ["运行中", "info"] as const;
  if (status === "failed") return ["生成失败", "danger"] as const;
  if (status === "completed") return ["已完成", "success"] as const;
  return ["可开始", "neutral"] as const;
}

function taskDestination(competitionId: string, taskId: string, status: ReturnType<typeof taskAvailability>) {
  if (status === "queued" || status === "running" || status === "failed") return `/competitions/${competitionId}/workspace/workshop/tasks/${taskId}/progress`;
  if (status === "completed") {
    const task = taskById(taskId);
    return task ? `/competitions/${competitionId}/workspace/workshop/results/${task.resultId}` : `/competitions/${competitionId}/workspace/workshop/results`;
  }
  return `/competitions/${competitionId}/workspace/workshop/tasks/${taskId}/answer`;
}

function nextTaskAfter(runtime: ReturnType<ReturnType<typeof useWorkshopRuntime>["getRuntime"]>, taskId: string) {
  const index = workshopTasks.findIndex(task => task.id === taskId);
  const candidates = index >= 0 ? workshopTasks.slice(index + 1) : workshopTasks;
  return candidates.find(task => taskAvailability(runtime, task.id) === "ready") ?? nextReadyTask(runtime);
}

function skillAggregate(runtime: ReturnType<ReturnType<typeof useWorkshopRuntime>["getRuntime"]>, skillId: string) {
  const skill = workshopSkills.find(item => item.id === skillId);
  if (!skill) return null;
  const states = skill.taskIds.map(id => taskAvailability(runtime, id));
  const total = states.length;
  const completed = states.filter(state => state === "completed").length;
  const running = states.includes("running");
  const queued = states.includes("queued");
  const failed = states.includes("failed");
  const lockedAll = states.length > 0 && states.every(state => state === "locked");
  const lockedSome = states.includes("locked");
  let label: string;
  let tone: "neutral" | "info" | "success" | "warning" | "danger";
  if (running) { label = "运行中"; tone = "info"; }
  else if (queued) { label = "排队中"; tone = "info"; }
  else if (failed) { label = "生成失败"; tone = "danger"; }
  else if (completed === total) { label = "已完成"; tone = "success"; }
  else if (completed > 0) { label = `进行中 ${completed}/${total}`; tone = "info"; }
  else if (lockedAll) { label = "待补材料"; tone = "warning"; }
  else if (lockedSome) { label = `待补 ${states.filter(state => state === "locked").length} 项`; tone = "warning"; }
  else { label = "可开始"; tone = "neutral"; }
  return { skill, total, completed, label, tone };
}

const taskShortcuts: Record<string, { label: string; icon: typeof Compass }> = {
  "s1-product-score": { label: "选品研判", icon: Compass },
  "s2-market-feasibility": { label: "可行性诊断", icon: Stethoscope },
  "s3-copy-kit": { label: "运营文案", icon: Megaphone },
  "s3-visual-kit": { label: "内容方案", icon: Presentation },
  "s4-weekly-review": { label: "经营周报", icon: Gauge },
  "s5-score-precheck": { label: "评分预检", icon: ClipboardCheck },
  "s5-pitch-ppt": { label: "路演 PPT", icon: Presentation },
  "s6-career-advisor": { label: "职业顾问", icon: Compass },
  "s6-job-recommend": { label: "岗位推荐", icon: BriefcaseBusiness },
  "s6-experience-transform": { label: "经历转化", icon: FileUser },
  "s6-quality-test": { label: "素养测评", icon: Radar },
};

function taskShortcut(taskId: string, fallback: string) {
  return taskShortcuts[taskId] ?? { label: fallback, icon: Target };
}

export function WorkshopHomePage() {
  const navigate = useNavigate();
  const { competitionId } = useParams();
  const { getRuntime } = useWorkshopRuntime();
  if (!competitionId) return null;
  const data = workspaceData[competitionId];
  const runtime = getRuntime(competitionId);
  const activeRunTask = workshopTasks.find(task => ["queued", "running", "failed"].includes(runtime.taskRuns[task.id]?.status ?? ""));
  const nextTask = activeRunTask ?? nextReadyTask(runtime);
  const nextStatus = nextTask ? taskAvailability(runtime, nextTask.id) : undefined;
  const nextSkill = nextTask ? skillById(nextTask.skillId) : undefined;
  const allMissing = workshopTasks.flatMap(task => missingMaterials(runtime, task.id)).filter((item, index, list) => list.findIndex(other => other.key === item.key) === index);
  const blockingMissing = nextTask ? missingMaterials(runtime, nextTask.id) : [];
  const completedCount = workshopTasks.filter(task => runtime.taskRuns[task.id]?.status === "completed").length;
  const totalCount = workshopTasks.length;
  const completionPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const results = completedResults(runtime);
  const lastResult = results.length ? results[results.length - 1] : undefined;
  const heroMode: "run" | "ready" | "blocked" | "done" = activeRunTask
    ? "run"
    : nextTask && blockingMissing.length === 0
      ? "ready"
      : nextTask
        ? "blocked"
        : "done";
  const heroTitle = heroMode === "run"
    ? `继续 ${activeRunTask?.skillId.toUpperCase()} · ${activeRunTask?.title}`
    : heroMode === "ready"
      ? `调用 ${nextSkill?.code ?? ""} · ${nextTask?.title}`
      : heroMode === "blocked"
        ? `补齐材料后调用 ${nextSkill?.code ?? ""} · ${nextTask?.title}`
        : "本轮工坊任务已完成";
  const heroSubtitle = heroMode === "run"
    ? "异步任务执行中。任务可离开本页，完成后会通过站内消息通知。"
    : heroMode === "ready"
      ? `${nextSkill?.name ?? ""} · ${nextTask?.summary ?? ""}`
      : heroMode === "blocked"
        ? `当前缺少：${blockingMissing.map(item => item.label).join("、")}`
        : "赛事成果会在比赛结束后 handoff 到长期资产。";
  const heroPrimary = heroMode === "run"
    ? "继续当前任务"
    : heroMode === "ready"
      ? "开始调用技能"
      : heroMode === "blocked"
        ? "去补齐材料"
        : "查看本轮成果";
  const heroPrimaryTo = heroMode === "run" && activeRunTask
    ? taskDestination(competitionId, activeRunTask.id, taskAvailability(runtime, activeRunTask.id))
    : heroMode === "ready" && nextTask && nextStatus
      ? taskDestination(competitionId, nextTask.id, nextStatus)
      : heroMode === "blocked"
        ? `/competitions/${competitionId}/workspace/workshop/project`
        : `/competitions/${competitionId}/workspace/workshop/results`;

  return <PublicShell showNavigation={false}><PageHeader title="创赛工坊" subtitle="三创赛赛事陪跑" backTo={`/competitions/${competitionId}/workspace`} /><RequireCompetitionAccess><div className="space-y-7 px-4 py-5">
    <CompetitionContextLine competitionId={competitionId} />
    <Card className="border border-info bg-info-bg" data-testid="workshop-call-hero">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2"><Sparkles aria-hidden="true" size={18} strokeWidth={2} className="text-info-text" /><StatusTag tone="info">{heroMode === "run" ? "执行中" : heroMode === "ready" ? "可调用" : heroMode === "blocked" ? "待补材料" : "已完成"}</StatusTag>{nextSkill && <StatusTag tone="neutral">{nextSkill.code} · {nextSkill.name}</StatusTag>}</div>
        <span className="text-xs font-medium text-info-text">{completedCount}/{totalCount} · {completionPct}%</span>
      </div>
      <h1 className="mt-3 text-xl font-semibold leading-7 text-info-text">{heroTitle}</h1>
      <p className="mt-2 text-sm leading-5 text-info-text">{heroSubtitle}</p>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--color-surface)]"><div className="h-full bg-primary transition-all" style={{ width: `${completionPct}%` }} /></div>
      <div className="mt-4 grid grid-cols-[1fr_auto] gap-2"><Button className="w-full" onClick={() => navigate(heroPrimaryTo)} data-testid="workshop-call-hero-primary">{heroPrimary}<ArrowRight aria-hidden="true" size={16} strokeWidth={2} className="ml-2 inline-block" /></Button><SecondaryButton onClick={() => navigate(`/competitions/${competitionId}/workspace/workshop/skills`)} data-testid="workshop-call-hero-secondary">查看技能矩阵</SecondaryButton></div>
    </Card>
    {data && <Section title="当前项目 / 阶段"><Card><h2 className="font-semibold text-text-primary">{data.project.name}</h2><p className="mt-1 text-sm text-text-brand">{data.project.currentStage}</p><p className="mt-3 text-sm leading-5 text-text-secondary">{data.project.summary}</p><SecondaryButton className="mt-4 w-full" onClick={() => navigate(`/competitions/${competitionId}/workspace/workshop/project`)}>查看项目与材料</SecondaryButton></Card></Section>}
    {allMissing.length > 0 && <Section title="还缺什么材料"><Card><div className="space-y-2">{allMissing.map(item => <div key={item.key} className="flex items-center justify-between gap-3"><span className="text-sm text-text-primary">{item.label}</span><StatusTag tone="warning">未补齐</StatusTag></div>)}<SecondaryButton className="mt-3 w-full" onClick={() => navigate(`/competitions/${competitionId}/workspace/workshop/project`)}>去补材料</SecondaryButton></div></Card></Section>}
    <Section title="六阶段技能矩阵" subtitle="按赛事阶段挑当前最该用的技能包"><div data-testid="skill-matrix" className="grid grid-cols-2 gap-3">{workshopSkills.map(skill => { const summary = skillAggregate(runtime, skill.id); if (!summary) return null; const destination = `/competitions/${competitionId}/workspace/workshop/skills/${skill.id}`; return <Link key={skill.id} to={destination} className="block" data-skill={skill.id}><Card interactive className="h-full"><div className="flex items-start justify-between gap-2"><p className="text-xs font-semibold tracking-wider text-text-brand">{skill.code}</p><StatusTag tone={summary.tone}>{summary.label}</StatusTag></div><h2 className="mt-2 text-base font-semibold leading-5 text-text-primary">{skill.name}</h2><p className="mt-1 line-clamp-2 text-xs leading-4 text-text-secondary">{skill.summary}</p><p className="mt-3 text-[11px] text-text-tertiary">任务 {summary.completed}/{summary.total}</p></Card></Link>; })}<Link to={`/competitions/${competitionId}/workspace/workshop/skills`} className="col-span-2 block"><Card interactive className="border border-dashed border-border bg-surface-subtle"><p className="text-sm font-medium text-text-primary">查看完整技能矩阵与历史任务</p><p className="mt-1 text-xs text-text-secondary">了解每个技能包的所有能力、任务明细与运行进度。</p></Card></Link></div></Section>
    <Section title="上一次结果"><Card>{lastResult ? <><StatusTag tone="success">已生成</StatusTag><h2 className="mt-3 font-semibold text-text-primary">{lastResult.title}</h2><p className="mt-2 text-sm leading-5 text-text-secondary">{lastResult.summary}</p><SecondaryButton className="mt-4 w-full" onClick={() => navigate(`/competitions/${competitionId}/workspace/workshop/results/${lastResult.id}`)}>查看结果</SecondaryButton></> : <p className="text-sm text-text-secondary">还没有生成成果。</p>}</Card></Section>
    <Section title="工坊支撑"><div className="space-y-2">{[["技能矩阵",`/competitions/${competitionId}/workspace/workshop/skills`],["算力明细",`/competitions/${competitionId}/workspace/workshop/compute`],["历史成果",`/competitions/${competitionId}/workspace/workshop/results`]].map(([label,to]) => <button key={to} className="flex min-h-touch w-full items-center justify-between rounded-control bg-surface px-3 text-left text-sm font-medium text-text-primary active:bg-surface-pressed" onClick={() => navigate(to)}>{label}<span className="text-text-tertiary">›</span></button>)}</div></Section>
  </div></RequireCompetitionAccess></PublicShell>;
}

export function WorkshopProjectPage() {
  const { competitionId } = useParams();
  const { getRuntime, setMaterial } = useWorkshopRuntime();
  if (!competitionId) return null;
  const runtime = getRuntime(competitionId);
  const data = workspaceData[competitionId];
  const materialKeys = Object.keys(materialLabels) as MaterialKey[];
  const materialUsage = materialKeys.map(key => {
    const dependents = workshopTasks.filter(task => task.requiredMaterials.includes(key));
    const blockedTasks = dependents.filter(task => missingMaterials(runtime, task.id).some(item => item.key === key));
    return { key, available: runtime.materials[key], dependents, blockedTasks };
  });
  const readyCount = materialUsage.filter(item => item.available).length;
  const readyPct = materialKeys.length > 0 ? Math.round((readyCount / materialKeys.length) * 100) : 0;
  const blockedTaskIds = new Set(materialUsage.flatMap(item => item.blockedTasks.map(task => task.id)));
  return <PublicShell showNavigation={false}><PageHeader title="当前项目" subtitle="项目与任务材料" backTo={`/competitions/${competitionId}/workspace/workshop`} /><RequireCompetitionAccess><div className="space-y-6 px-4 py-5">
    <CompetitionContextLine competitionId={competitionId} />
    {data && <Card><h1 className="text-lg font-semibold text-text-primary">{data.project.name}</h1><p className="mt-1 text-sm text-text-brand">{data.project.track} · {data.project.currentStage}</p><p className="mt-3 text-sm leading-6 text-text-secondary">{data.project.summary}</p><p className="mt-3 text-xs text-text-tertiary">指导老师：{data.project.mentor}</p></Card>}
    <Card className={blockedTaskIds.size > 0 ? "border border-warning bg-warning-bg" : "border border-border-subtle"} data-testid="workshop-material-summary">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2"><FileText aria-hidden="true" size={16} strokeWidth={2} className={blockedTaskIds.size > 0 ? "text-warning-text" : "text-text-brand"} /><p className={`text-sm font-medium ${blockedTaskIds.size > 0 ? "text-warning-text" : "text-text-primary"}`}>材料齐备度</p></div>
        <span className={`text-xs font-medium ${blockedTaskIds.size > 0 ? "text-warning-text" : "text-text-secondary"}`}>{readyCount}/{materialKeys.length} · {readyPct}%</span>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--color-surface)]"><div className="h-full bg-primary transition-all" style={{ width: `${readyPct}%` }} /></div>
      <p className={`mt-3 text-xs leading-4 ${blockedTaskIds.size > 0 ? "text-warning-text" : "text-text-secondary"}`}>{blockedTaskIds.size > 0 ? `当前有 ${blockedTaskIds.size} 个工坊任务因为材料缺失被锁定，补齐后自动解锁。` : "必需材料已经齐备，工坊任务不会因为材料缺失被锁定。"}</p>
    </Card>
    <Section title="任务材料" subtitle="材料只在当前赛事项目内生效"><div className="space-y-2">{materialUsage.map(item => {
      const tone = item.available ? "success" : item.blockedTasks.length > 0 ? "warning" : "neutral";
      const label = item.available ? "已具备" : item.blockedTasks.length > 0 ? "缺失" : "未提供";
      const helper = item.available
        ? `已进入当前赛事项目材料 · 支撑 ${item.dependents.length} 个任务`
        : item.blockedTasks.length > 0
          ? `缺失将锁定 ${item.blockedTasks.length} 个任务，补齐后自动解锁`
          : `关联 ${item.dependents.length} 个任务 · 缺失时任务按选填继续`;
      return <Card key={item.key} data-material={item.key}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0"><p className="text-sm font-medium text-text-primary">{materialLabels[item.key]}</p><p className="mt-1 text-xs leading-4 text-text-secondary">{helper}</p></div>
          <StatusTag tone={tone}>{label}</StatusTag>
        </div>
        {item.dependents.length > 0 && <ul className="mt-3 space-y-1.5 border-t border-border-subtle pt-3">{item.dependents.map(task => {
          const locked = item.blockedTasks.some(blocked => blocked.id === task.id);
          const Icon = locked ? AlertTriangle : item.available ? CheckCircle2 : ListChecks;
          return <li key={task.id} className="flex items-start gap-2">
            <Icon aria-hidden="true" size={14} strokeWidth={2} className={`mt-0.5 shrink-0 ${locked ? "text-warning-text" : item.available ? "text-success-text" : "text-text-tertiary"}`} />
            <span className={`text-xs leading-4 ${locked ? "text-warning-text" : "text-text-secondary"}`}>{task.skillId.toUpperCase()} · {task.title}</span>
          </li>;
        })}</ul>}
        {!item.available && <SecondaryButton className="mt-3 w-full" onClick={() => setMaterial(competitionId, item.key, true)}>模拟补齐材料</SecondaryButton>}
      </Card>;
    })}</div></Section>
  </div></RequireCompetitionAccess></PublicShell>;
}

export function WorkshopComputePage() {
  const { competitionId } = useParams();
  const { getRuntime } = useWorkshopRuntime();
  if (!competitionId) return null;
  const runtime = getRuntime(competitionId);
  return <PublicShell showNavigation={false}><PageHeader title="算力明细" backTo={`/competitions/${competitionId}/workspace/workshop`} /><RequireCompetitionAccess><div className="space-y-6 px-4 py-5"><CompetitionContextLine competitionId={competitionId} /><Card><p className="text-sm text-text-secondary">由 OPC 提供 AI 算力 · 赛事期间有效</p><p className="mt-2 text-2xl font-semibold text-text-primary">{runtime.computeBalance}</p><p className="mt-1 text-xs text-text-tertiary">团队本阶段可用 · 本周已用 {runtime.computeUsed} · 冻结 {runtime.frozenCompute}</p></Card><Section title="算力流水"><div className="space-y-2">{runtime.computeLedger.map(entry => <Card key={entry.id}><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-medium text-text-primary">{entry.title}</p><p className="mt-1 text-xs text-text-secondary">{entry.occurredAt} · <span data-reason="true" className="font-medium text-text-primary">{entry.reason}</span></p></div><strong className={entry.amount >= 0 ? "text-success-text" : "text-text-primary"}>{entry.amount > 0 ? "+" : ""}{entry.amount}</strong></div></Card>)}</div></Section><Section title="任务预估"><div className="space-y-2">{workshopTasks.map(task => { const policy = computePolicyForTask(task.id); const run = runtime.taskRuns[task.id]; return <Card key={task.id}><div className="flex items-center justify-between gap-3"><div><p className="text-sm font-medium text-text-primary">{task.title}</p><p className="mt-1 text-xs text-text-secondary">{run?.status === "completed" ? `实际消耗 ${run.actualCompute ?? policy.actual}` : `预计 ${policy.estimateMin}–${policy.estimateMax}`}</p></div><StatusTag tone={run?.status === "completed" ? "success" : run?.status === "running" || run?.status === "queued" ? "info" : "neutral"}>{run?.status === "completed" ? "已结算" : run?.status === "running" || run?.status === "queued" ? "冻结中" : "未运行"}</StatusTag></div></Card>; })}</div></Section><Card className="border border-info bg-info-bg"><p className="font-medium text-info-text">结算规则</p><p className="mt-2 text-sm leading-5 text-info-text">创建任务时按上限冻结，完成后按实际消耗结算并释放差额；任务失败或取消时全额退回。</p></Card></div></RequireCompetitionAccess></PublicShell>;
}

export function WorkshopSkillsPage() {
  const { competitionId } = useParams();
  const { getRuntime } = useWorkshopRuntime();
  if (!competitionId) return null;
  const runtime = getRuntime(competitionId);
  return <PublicShell showNavigation={false}><PageHeader title="技能矩阵" subtitle="S1–S6 共用 Task Runtime" backTo={`/competitions/${competitionId}/workspace/workshop`} /><RequireCompetitionAccess><div className="space-y-4 px-4 py-5"><CompetitionContextLine competitionId={competitionId} />{workshopSkills.map(skill => { const taskStates = skill.taskIds.map(id => taskAvailability(runtime,id)); const done = taskStates.every(state => state === "completed"); return <Link key={skill.id} className="block" to={`/competitions/${competitionId}/workspace/workshop/skills/${skill.id}`}><Card interactive><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-medium text-text-brand">{skill.code}</p><h2 className="mt-1 font-semibold text-text-primary">{skill.name}</h2><p className="mt-2 text-sm leading-5 text-text-secondary">{skill.summary}</p></div><StatusTag tone={done ? "success" : "neutral"}>{done ? "已完成" : `${skill.taskIds.length} 个任务`}</StatusTag></div><div className="mt-3 flex flex-wrap gap-2">{skill.capabilities.map(capability => <StatusTag key={capability} tone="neutral">{capability}</StatusTag>)}</div></Card></Link>; })}</div></RequireCompetitionAccess></PublicShell>;
}

export function WorkshopSkillPage() {
  const navigate = useNavigate();
  const { competitionId, skillId } = useParams();
  const { getRuntime } = useWorkshopRuntime();
  if (!competitionId) return null;
  const runtime = getRuntime(competitionId);
  const skill = skillById(skillId);
  if (!skill) return <PublicShell showNavigation={false}><PageHeader title="技能不存在" backTo={`/competitions/${competitionId}/workspace/workshop/skills`} /></PublicShell>;
  const summary = skillAggregate(runtime, skill.id);
  const total = summary?.total ?? skill.taskIds.length;
  const completed = summary?.completed ?? 0;
  const completionPct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const activeTask = skill.taskIds.map(id => taskById(id)).find(task => task && ["queued", "running", "failed"].includes(taskAvailability(runtime, task.id)));
  const readyTask = skill.taskIds.map(id => taskById(id)).find(task => task && taskAvailability(runtime, task.id) === "ready");
  const lockedTask = skill.taskIds.map(id => taskById(id)).find(task => task && taskAvailability(runtime, task.id) === "locked");
  const heroMode: "run" | "ready" | "blocked" | "done" = activeTask ? "run" : readyTask ? "ready" : lockedTask ? "blocked" : "done";
  const focusTask = activeTask ?? readyTask ?? lockedTask;
  const blockingMissing = lockedTask ? missingMaterials(runtime, lockedTask.id) : [];
  const heroTitle = heroMode === "run"
    ? `正在陪你跑：${focusTask?.title ?? ""}`
    : heroMode === "ready"
      ? `教练建议下一步：${focusTask?.title ?? ""}`
      : heroMode === "blocked"
        ? `先补材料，再跑：${focusTask?.title ?? ""}`
        : `${skill.name} 本阶段已跑完`;
  const heroSubtitle = heroMode === "run"
    ? "任务在后台执行，你可以先离开，完成后我会在站内消息里叫你。"
    : heroMode === "ready"
      ? focusTask?.helper ?? skill.summary
      : heroMode === "blocked"
        ? `当前缺少：${blockingMissing.map(item => item.label).join("、")}。补齐后任务会自动解锁。`
        : "成果已经沉淀，赛事结束后会 handoff 到你的长期资产。";
  const heroPrimary = heroMode === "run" ? "继续当前任务" : heroMode === "ready" ? "开始本阶段陪跑" : heroMode === "blocked" ? "去补齐材料" : "查看本技能成果";
  const heroPrimaryTo = heroMode === "blocked"
    ? `/competitions/${competitionId}/workspace/workshop/project`
    : heroMode === "done"
      ? `/competitions/${competitionId}/workspace/workshop/results`
      : focusTask
        ? taskDestination(competitionId, focusTask.id, taskAvailability(runtime, focusTask.id))
        : `/competitions/${competitionId}/workspace/workshop/results`;
  const gridClass = total >= 4 ? "grid-cols-4" : total === 3 ? "grid-cols-3" : "grid-cols-2";
  return <PublicShell showNavigation={false}><PageHeader title={`${skill.code} ${skill.name}`} backTo={`/competitions/${competitionId}/workspace/workshop/skills`} /><RequireCompetitionAccess><div className="space-y-7 px-4 py-5">
    <CompetitionContextLine competitionId={competitionId} />
    <Card className="border border-info bg-info-bg" data-testid="skill-coach-hero">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2"><Sparkles aria-hidden="true" size={18} strokeWidth={2} className="text-info-text" /><StatusTag tone="info">陪跑教练</StatusTag>{summary && <StatusTag tone={summary.tone}>{summary.label}</StatusTag>}</div>
        <span className="text-xs font-medium text-info-text">{completed}/{total} · {completionPct}%</span>
      </div>
      <p className="mt-3 text-lg font-semibold leading-6 text-info-text">{heroTitle}</p>
      <p className="mt-2 text-sm leading-5 text-info-text">{heroSubtitle}</p>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--color-surface)]"><div className="h-full bg-primary transition-all" style={{ width: `${completionPct}%` }} /></div>
      <div className="mt-4 grid grid-cols-[1fr_auto] gap-2"><Button className="w-full" onClick={() => navigate(heroPrimaryTo)} data-testid="skill-coach-hero-primary">{heroPrimary}<ArrowRight aria-hidden="true" size={16} strokeWidth={2} className="ml-2 inline-block" /></Button><SecondaryButton onClick={() => navigate(`/competitions/${competitionId}/workspace/workshop/skills`)}>切换技能包</SecondaryButton></div>
    </Card>
    <Section title="能力入口" subtitle={skill.summary}>
      <div data-testid="skill-quick-grid" className={`grid gap-3 ${gridClass}`}>{skill.taskIds.map(taskId => {
        const task = taskById(taskId);
        if (!task) return null;
        const status = taskAvailability(runtime, taskId);
        const [statusText] = taskStatusLabel(status);
        const shortcut = taskShortcut(taskId, task.title);
        const Icon = shortcut.icon;
        const destination = status === "locked" ? `/competitions/${competitionId}/workspace/workshop/project` : taskDestination(competitionId, taskId, status);
        const iconTone = status === "completed"
          ? "bg-success-bg text-success-text"
          : status === "locked"
            ? "bg-warning-bg text-warning-text"
            : status === "ready"
              ? "bg-primary-container text-text-brand"
              : "bg-info-bg text-info-text";
        const statusTone = status === "completed" ? "text-success-text" : status === "locked" ? "text-warning-text" : status === "ready" ? "text-text-tertiary" : "text-info-text";
        return <Link key={taskId} to={destination} className="block" data-task={taskId} aria-label={`${shortcut.label}：${statusText}`}>
          <Card interactive className="flex min-h-[100px] flex-col items-center justify-center gap-2 p-2 text-center">
            <span className={`flex size-10 shrink-0 items-center justify-center rounded-[14px] ${iconTone}`}><Icon aria-hidden="true" size={20} strokeWidth={2} /></span>
            <span className="text-xs font-medium leading-4 text-text-primary">{shortcut.label}</span>
            <span className={`text-[11px] leading-3 ${statusTone}`}>{statusText}</span>
          </Card>
        </Link>;
      })}</div>
      <div className="flex flex-wrap gap-2">{skill.capabilities.map(item => <StatusTag key={item} tone="neutral">{item}</StatusTag>)}</div>
    </Section>
    <Section title="陪跑路径" subtitle="按顺序推进，状态由工坊运行时实时判定"><div className="space-y-3">{skill.taskIds.map((taskId, index) => {
      const task = taskById(taskId);
      if (!task) return null;
      const status = taskAvailability(runtime, taskId);
      const [label, tone] = taskStatusLabel(status);
      const missing = missingMaterials(runtime, taskId);
      const stepTone = status === "completed" ? "bg-success-bg text-success-text" : status === "locked" ? "bg-warning-bg text-warning-text" : status === "ready" ? "bg-primary-container text-text-brand" : "bg-info-bg text-info-text";
      return <Card key={taskId} data-step={taskId}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <span className={`flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${stepTone}`}>{index + 1}</span>
            <div className="min-w-0"><h2 className="text-sm font-semibold leading-5 text-text-primary">{task.title}</h2><p className="mt-1 text-sm leading-5 text-text-secondary">{task.summary}</p></div>
          </div>
          <StatusTag tone={tone}>{label}</StatusTag>
        </div>
        <p className="mt-3 flex items-start gap-2 rounded-control bg-surface-subtle px-2 py-2 text-xs leading-4 text-text-secondary"><Sparkles aria-hidden="true" size={14} strokeWidth={2} className="mt-0.5 shrink-0 text-text-brand" />教练提示：{task.helper}</p>
        <p className="mt-2 text-[11px] text-text-tertiary">算力消耗 {task.computeCost} · {isOptionalMaterialTask(task.id) ? "选填材料" : "依赖材料"} {task.requiredMaterials.map(key => materialLabels[key]).join("、")}</p>
        {missing.length > 0 && <p className="mt-2 text-xs text-warning-text">缺少：{missing.map(item => item.label).join("、")}</p>}
        <Button disabled={status === "locked"} className="mt-4 w-full" onClick={() => navigate(taskDestination(competitionId, task.id, status))}>{status === "completed" ? "查看成果" : status === "queued" || status === "running" || status === "failed" ? "继续任务" : "开始任务"}</Button>
      </Card>;
    })}</div></Section>
  </div></RequireCompetitionAccess></PublicShell>;
}

type ResultsTab = "generated" | "adopted" | "failed";

function isResultsTab(value: string | null): value is ResultsTab {
  return value === "generated" || value === "adopted" || value === "failed";
}

export function WorkshopResultsPage() {
  const navigate = useNavigate();
  const { competitionId } = useParams();
  const { getRuntime } = useWorkshopRuntime();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const activeTab: ResultsTab = isResultsTab(requestedTab) ? requestedTab : "generated";
  if (!competitionId) return null;
  const runtime = getRuntime(competitionId);
  const results = completedResults(runtime);
  const acceptedIds = runtime.acceptedResultIds;
  const generated = results.filter(result => !acceptedIds.includes(result.id));
  const adopted = results.filter(result => acceptedIds.includes(result.id));
  const failedTasks = workshopTasks.filter(task => runtime.taskRuns[task.id]?.status === "failed");
  const tabEntries: { id: ResultsTab; label: string; count: number; tone: "info" | "success" | "danger" }[] = [
    { id: "generated", label: "已生成", count: generated.length, tone: "info" },
    { id: "adopted", label: "已采纳", count: adopted.length, tone: "success" },
    { id: "failed", label: "失败", count: failedTasks.length, tone: "danger" },
  ];
  const selectTab = (tab: ResultsTab) => {
    const next = new URLSearchParams(searchParams);
    next.set("tab", tab);
    setSearchParams(next, { replace: true });
  };
  return <PublicShell showNavigation={false}><PageHeader title="工坊成果" backTo={`/competitions/${competitionId}/workspace/workshop`} /><RequireCompetitionAccess><div className="space-y-4 px-4 py-5"><CompetitionContextLine competitionId={competitionId} /><div role="tablist" aria-label="工坊成果分组" className="inline-flex w-full rounded-control bg-surface p-1" data-testid="results-tablist">{tabEntries.map(entry => { const selected = activeTab === entry.id; return <button key={entry.id} role="tab" type="button" aria-selected={selected} data-testid={`results-tab-${entry.id}`} onClick={() => selectTab(entry.id)} className={`flex-1 rounded-control px-3 py-2 text-sm font-medium ${selected ? "bg-primary text-text-on-primary" : "text-text-secondary"}`}>{entry.label} <span className={selected ? "text-text-on-primary" : "text-text-tertiary"}>{entry.count}</span></button>; })}</div>{activeTab === "generated" && (generated.length ? <div className="space-y-3" data-testid="results-pane-generated">{generated.map(result => <Link className="block" key={result.id} to={`/competitions/${competitionId}/workspace/workshop/results/${result.id}`}><Card interactive><div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold text-text-primary">{result.title}</h2><p className="mt-2 text-sm leading-5 text-text-secondary">{result.summary}</p></div><StatusTag tone="info">已生成</StatusTag></div></Card></Link>)}</div> : <Card className="py-8 text-center" data-testid="results-pane-generated"><p className="font-semibold text-text-primary">还没有未采纳的成果</p><p className="mt-2 text-sm text-text-secondary">完成任务会自动生成成果，采纳后会进入"已采纳"分组。</p></Card>)}
{activeTab === "adopted" && (adopted.length ? <div className="space-y-3" data-testid="results-pane-adopted">{adopted.map(result => <Link className="block" key={result.id} to={`/competitions/${competitionId}/workspace/workshop/results/${result.id}`}><Card interactive><div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold text-text-primary">{result.title}</h2><p className="mt-2 text-sm leading-5 text-text-secondary">{result.summary}</p></div><StatusTag tone="success">已采纳</StatusTag></div></Card></Link>)}</div> : <Card className="py-8 text-center" data-testid="results-pane-adopted"><p className="font-semibold text-text-primary">还没有被队长采纳的成果</p><p className="mt-2 text-sm text-text-secondary">队长在成果详情页确认后，会进入"已采纳"分组并锁定作为参赛材料。</p></Card>)}
{activeTab === "failed" && (failedTasks.length ? <div className="space-y-3" data-testid="results-pane-failed">{failedTasks.map(task => <Card key={task.id}><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-medium text-text-brand">{task.skillId.toUpperCase()} · {task.title}</p><p className="mt-2 text-sm leading-5 text-text-secondary">{task.summary}</p><p className="mt-2 text-xs text-text-tertiary">失败原因：本次运行未完成，原回答已保留。</p></div><StatusTag tone="danger">生成失败</StatusTag></div><SecondaryButton className="mt-3 w-full" onClick={() => navigate(`/competitions/${competitionId}/workspace/workshop/tasks/${task.id}/progress`)}>查看失败任务</SecondaryButton></Card>)}</div> : <Card className="py-8 text-center" data-testid="results-pane-failed"><p className="font-semibold text-text-primary">本轮没有失败任务</p><p className="mt-2 text-sm text-text-secondary">失败任务会保留草稿和原算力冻结记录，可重试或回到工坊首页。</p></Card>)}
</div></RequireCompetitionAccess></PublicShell>;
}

export function WorkshopResultDetailPage() {
  const navigate = useNavigate();
  const { competitionId, resultId } = useParams();
  const { getRuntime, updateResultDraft, saveResultVersion, acceptResult } = useWorkshopRuntime();
  const currentCompetitionId = competitionId ?? "";
  const runtime = getRuntime(currentCompetitionId);
  const result = resultById(resultId);
  const task = result ? taskById(result.taskId) : undefined;
  const completed = task ? runtime.taskRuns[task.id]?.status === "completed" : false;
  const initialDraft = result ? runtime.resultDrafts[result.id] ?? { summary: result.summary, highlights: result.highlights, nextSuggestion: result.nextSuggestion } : { summary: "", highlights: [], nextSuggestion: "" };
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(initialDraft);
  if (!competitionId) return null;
  if (!result || !task || !completed) return <PublicShell showNavigation={false}><PageHeader title="成果详情" backTo={`/competitions/${competitionId}/workspace/workshop/results`} /><RequireCompetitionAccess><div className="px-4 py-6"><Card className="border border-warning bg-warning-bg"><p className="font-medium text-warning-text">该成果尚未生成</p><p className="mt-2 text-sm text-warning-text">成果严格绑定当前 task，不复用其它技能的错误结果。</p></Card></div></RequireCompetitionAccess></PublicShell>;
  const accepted = runtime.acceptedResultIds.includes(result.id);
  const nextTask = nextTaskAfter(runtime, task.id);
  const detail = resultDetailById(result.id);
  const versions = runtime.resultVersions[result.id] ?? [];
  const saveDraft = () => { updateResultDraft(competitionId, result.id, draft); setEditing(false); };
  return <PublicShell showNavigation={false}><PageHeader title="成果详情" backTo={`/competitions/${competitionId}/workspace/workshop/results`} /><RequireCompetitionAccess><div className="space-y-6 px-4 py-5"><CompetitionContextLine competitionId={competitionId} /><Card><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-medium text-text-brand">AI 辅助生成 · {task.skillId.toUpperCase()} · {task.title}</p><h1 className="mt-2 text-xl font-semibold leading-7 text-text-primary">{result.title}</h1></div><StatusTag tone={accepted ? "success" : "info"}>{accepted ? "队长已采纳" : "待团队确认"}</StatusTag></div><p className="mt-4 text-sm leading-6 text-text-secondary">{editing ? <textarea aria-label="成果摘要" value={draft.summary} onChange={event => setDraft(current => ({ ...current, summary: event.target.value }))} rows={4} className="w-full rounded-control border border-border bg-surface p-3 text-sm text-text-primary" /> : draft.summary}</p></Card>{detail && <Card className="border border-info bg-info-bg" data-testid="result-score-hero"><div className="flex items-start justify-between gap-3"><div className="flex items-center gap-2"><div className="rounded-control bg-surface p-2 text-info-text"><CheckCircle2 aria-hidden="true" size={20} strokeWidth={2} /></div><p className="font-medium text-info-text">评分概览</p></div><div className="text-right"><strong className="block text-2xl font-semibold text-info-text" data-testid="result-score-value">{detail.score}</strong><span className="text-xs text-info-text">/ 100 · {detail.rating}</span></div></div><div className="mt-4 grid grid-cols-3 gap-2">{detail.dimensions.map(item => <div key={item.label} className="rounded-control bg-surface px-2 py-3 text-center"><strong className="block text-lg text-text-primary">{item.score}</strong><span className="text-xs text-text-secondary">{item.label}</span></div>)}</div></Card>}<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
  <Card data-testid="result-quadrant-finding"><div className="flex items-start gap-3"><div className="rounded-control bg-info-bg p-2 text-info-text"><FileText aria-hidden="true" size={18} strokeWidth={2} /></div><div className="min-w-0 flex-1"><p className="text-xs font-medium text-text-brand">关键结论</p><h3 className="mt-1 text-sm font-semibold text-text-primary">事实与判断</h3></div></div><ul className="mt-3 space-y-2">{draft.highlights.map((item, index) => <li key={`finding-${index}`}>{editing ? <textarea aria-label={`关键结论 ${index + 1}`} value={item} onChange={event => setDraft(current => ({ ...current, highlights: current.highlights.map((value, valueIndex) => valueIndex === index ? event.target.value : value) }))} rows={2} className="w-full rounded-control border border-border bg-surface p-2 text-sm text-text-primary" /> : <p className="text-sm leading-5 text-text-primary">· {item}</p>}</li>)}</ul></Card>
  {detail && <Card data-testid="result-quadrant-weakness"><div className="flex items-start gap-3"><div className="rounded-control bg-warning-bg p-2 text-warning-text"><AlertTriangle aria-hidden="true" size={18} strokeWidth={2} /></div><div className="min-w-0 flex-1"><p className="text-xs font-medium text-text-brand">薄弱环节与风险</p><h3 className="mt-1 text-sm font-semibold text-text-primary">需要补强</h3></div></div><p className="mt-3 text-sm leading-5 text-text-primary">{detail.weakness}</p><ul className="mt-3 space-y-2">{detail.risks.map(risk => <li key={risk} className="text-sm leading-5 text-warning-text">· 风险：{risk}</li>)}</ul></Card>}
</div>
{detail && <Card data-testid="result-quadrant-actions"><div className="flex items-start gap-3"><div className="rounded-control bg-success-bg p-2 text-success-text"><ListChecks aria-hidden="true" size={18} strokeWidth={2} /></div><div className="min-w-0 flex-1"><p className="text-xs font-medium text-text-brand">优先行动清单</p><h3 className="mt-1 text-sm font-semibold text-text-primary">按优先级执行</h3></div></div><ul className="mt-3 space-y-2">{detail.actions.map(action => <li key={action} className="flex items-start gap-2 text-sm leading-5 text-text-primary"><ListChecks aria-hidden="true" size={14} strokeWidth={2} className="mt-1 shrink-0 text-text-tertiary" /><span>{action}</span></li>)}</ul></Card>}<Card className="border border-info bg-info-bg"><p className="font-medium text-info-text">下一步建议</p>{editing ? <textarea aria-label="下一步建议" value={draft.nextSuggestion} onChange={event => setDraft(current => ({ ...current, nextSuggestion: event.target.value }))} rows={3} className="mt-2 w-full rounded-control border border-border bg-surface p-3 text-sm text-text-primary" /> : <p className="mt-2 text-sm leading-5 text-info-text">{draft.nextSuggestion}</p>}</Card>{versions.length > 0 && <Section title="已保存版本"><div className="space-y-2">{versions.map(version => <Card key={version.id}><div className="flex items-center justify-between gap-3"><span className="text-sm font-medium text-text-primary">{version.id}</span><span className="text-xs text-text-secondary">{version.createdAt}</span></div></Card>)}</div></Section>}<div className="space-y-2">{editing ? <><Button className="w-full" onClick={saveDraft}>保存编辑</Button><SecondaryButton className="w-full" onClick={() => { setDraft(initialDraft); setEditing(false); }}>取消编辑</SecondaryButton></> : <><SecondaryButton className="w-full" onClick={() => setEditing(true)}>编辑成果</SecondaryButton><SecondaryButton className="w-full" onClick={() => saveResultVersion(competitionId, result.id)}>保存为新版本</SecondaryButton>{!accepted && <Button className="w-full" onClick={() => acceptResult(competitionId, result.id)}>队长采纳并用于比赛</Button>}</>}{nextTask ? <Button className="w-full" onClick={() => navigate(`/competitions/${competitionId}/workspace/workshop/tasks/${nextTask.id}/answer`)}>继续下一步：{nextTask.title}</Button> : <Button className="w-full" onClick={() => navigate(`/competitions/${competitionId}/workspace/workshop`)}>返回工坊</Button>}</div><TaskScenarioTools competitionId={competitionId} taskId={task.id} /></div></RequireCompetitionAccess></PublicShell>;
}

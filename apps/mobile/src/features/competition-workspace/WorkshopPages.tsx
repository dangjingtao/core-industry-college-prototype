import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button, Card, PageHeader, PublicShell, SecondaryButton, Section, StatusTag } from "../../components/ui";
import { materialLabels, resultById, skillById, taskById, workshopSkills, workshopTasks, workspaceData, type MaterialKey } from "./data";
import { completedResults, missingMaterials, taskAvailability, useWorkshopRuntime } from "./runtime";
import { CompetitionContextLine, RequireCompetitionAccess, TaskScenarioTools } from "./shared";
import { computePrototype, flowSpecForTask, reportSpecForResult, skillPresentation } from "./workshop-flow";

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

function activeFrozenCompute(runtime: ReturnType<ReturnType<typeof useWorkshopRuntime>["getRuntime"]>) {
  return workshopTasks.reduce((sum, task) => {
    const status = runtime.taskRuns[task.id]?.status;
    if (status !== "queued" && status !== "running") return sum;
    return sum + (flowSpecForTask(task.id)?.freezeCompute ?? task.computeCost);
  }, computePrototype.frozenBase);
}

export function WorkshopHomePage() {
  const navigate = useNavigate();
  const { competitionId } = useParams();
  const { getRuntime } = useWorkshopRuntime();
  if (!competitionId) return null;
  const data = workspaceData[competitionId];
  const runtime = getRuntime(competitionId);
  const activeRunTask = workshopTasks.find(task => ["queued", "running", "failed"].includes(runtime.taskRuns[task.id]?.status ?? ""));
  const completed = completedResults(runtime);

  return <PublicShell showNavigation={false}><PageHeader title="创赛工坊" backTo={`/competitions/${competitionId}/workspace`} /><RequireCompetitionAccess><div className="space-y-6 px-4 py-5">
    <CompetitionContextLine competitionId={competitionId} />
    {data && <Card><p className="text-xs text-text-tertiary">当前赛事项目</p><h1 className="mt-1 text-lg font-semibold text-text-primary">{data.project.name}</h1><p className="mt-1 text-sm text-text-secondary">{data.project.currentStage}</p><SecondaryButton className="mt-4 w-full" onClick={() => navigate(`/competitions/${competitionId}/workspace/workshop/project`)}>项目详情</SecondaryButton></Card>}

    <Card className="border border-border-subtle"><div className="flex items-start justify-between gap-3"><div><p className="text-xs text-text-tertiary">由 OPC 提供 AI 算力 · 原型示例</p><p className="mt-2 text-3xl font-semibold text-text-primary">{computePrototype.available.toLocaleString()}</p><p className="mt-1 text-sm text-text-secondary">团队本阶段可用算力</p></div><button className="min-h-touch text-sm font-medium text-text-brand" onClick={() => navigate(`/competitions/${competitionId}/workspace/workshop/compute`)}>查看明细</button></div><div className="mt-4 grid grid-cols-2 gap-2"><div className="rounded-control bg-surface-subtle p-3"><p className="text-xs text-text-tertiary">本周已用</p><strong className="mt-1 block text-text-primary">{computePrototype.usedThisWeek.toLocaleString()}</strong></div><div className="rounded-control bg-surface-subtle p-3"><p className="text-xs text-text-tertiary">冻结</p><strong className="mt-1 block text-text-primary">{activeFrozenCompute(runtime)}</strong></div></div></Card>

    {activeRunTask && <Section title="运行中"><Card className="border border-info bg-info-bg"><StatusTag tone="info">运行中</StatusTag><h2 className="mt-3 font-semibold text-info-text">{activeRunTask.title}</h2><p className="mt-2 text-sm text-info-text">任务可以离开页面，完成后通过站内消息通知。</p><Button className="mt-4 w-full" onClick={() => navigate(taskDestination(competitionId, activeRunTask.id, taskAvailability(runtime, activeRunTask.id)))}>查看任务进度</Button></Card></Section>}

    <Section title="技能推荐" action={<Link className="min-h-touch text-sm font-medium text-text-brand" to={`/competitions/${competitionId}/workspace/workshop/skills`}>查看全部</Link>}><div className="grid grid-cols-2 gap-3">{workshopSkills.slice(0, 4).map(skill => <Link key={skill.id} to={`/competitions/${competitionId}/workspace/workshop/skills/${skill.id}`}><Card interactive className="h-full"><p className="text-xs font-medium text-text-brand">{skill.code}</p><h2 className="mt-1 font-semibold text-text-primary">{skill.name}</h2><p className="mt-2 text-xs leading-5 text-text-secondary">{skill.capabilities.slice(0, 2).join(" · ")}</p></Card></Link>)}</div></Section>

    <Section title="最近成果"><Card>{completed.length ? <><h2 className="font-semibold text-text-primary">{completed[completed.length - 1].title}</h2><p className="mt-2 text-sm text-text-secondary">{completed[completed.length - 1].summary}</p><SecondaryButton className="mt-4 w-full" onClick={() => navigate(`/competitions/${competitionId}/workspace/workshop/results`)}>历史成果</SecondaryButton></> : <><p className="text-sm text-text-secondary">当前赛事还没有已生成成果。</p><SecondaryButton className="mt-4 w-full" onClick={() => navigate(`/competitions/${competitionId}/workspace/workshop/results`)}>历史成果</SecondaryButton></>}</Card></Section>
  </div></RequireCompetitionAccess></PublicShell>;
}

export function WorkshopProjectPage() {
  const { competitionId } = useParams();
  const { getRuntime, setMaterial } = useWorkshopRuntime();
  if (!competitionId) return null;
  const runtime = getRuntime(competitionId);
  const data = workspaceData[competitionId];
  const materialKeys = Object.keys(materialLabels) as MaterialKey[];
  return <PublicShell showNavigation={false}><PageHeader title="项目详情" backTo={`/competitions/${competitionId}/workspace/workshop`} /><RequireCompetitionAccess><div className="space-y-6 px-4 py-5"><CompetitionContextLine competitionId={competitionId} />
    {data && <><Card><h1 className="text-lg font-semibold text-text-primary">{data.project.name}</h1><p className="mt-1 text-sm text-text-brand">{data.project.track} · {data.project.currentStage}</p><Section className="mt-4" title="项目摘要"><p className="text-sm leading-6 text-text-secondary">{data.project.summary}</p></Section></Card>
    <Section title="赛事与团队"><Card><div className="space-y-3 text-sm"><div><p className="text-xs text-text-tertiary">团队</p><p className="mt-1 font-medium text-text-primary">{data.team.name}（{data.team.members.length}人）</p></div><div><p className="text-xs text-text-tertiary">指导老师</p><p className="mt-1 font-medium text-text-primary">{data.project.mentor}</p></div><div><p className="text-xs text-text-tertiary">我的角色</p><p className="mt-1 font-medium text-text-primary">{data.team.role}</p></div></div></Card></Section>
    <Section title="团队成员"><div className="space-y-2">{data.team.members.map(member => <Card key={member.name}><div className="flex items-start justify-between gap-3"><div><p className="font-medium text-text-primary">{member.name}</p><p className="mt-1 text-xs text-text-secondary">{member.school}</p></div><StatusTag tone={member.role.includes("队长") ? "info" : "neutral"}>{member.role}</StatusTag></div></Card>)}</div></Section></>}
    <Section title="任务材料"><div className="space-y-2">{materialKeys.map(key => <Card key={key}><div className="flex items-center justify-between gap-3"><div><p className="text-sm font-medium text-text-primary">{materialLabels[key]}</p><p className="mt-1 text-xs text-text-secondary">{runtime.materials[key] ? "已进入当前赛事项目材料" : "缺失时，对应任务会锁定"}</p></div><StatusTag tone={runtime.materials[key] ? "success" : "warning"}>{runtime.materials[key] ? "已具备" : "缺失"}</StatusTag></div></Card>)}</div></Section>
    <details className="rounded-container border border-border-subtle bg-surface p-3 text-xs text-text-secondary"><summary className="cursor-pointer font-medium text-text-brand">原型材料状态</summary><div className="mt-3 space-y-2">{materialKeys.map(key => <button key={key} className="min-h-touch w-full rounded-control bg-surface-subtle px-3 text-left" onClick={() => setMaterial(competitionId, key, !runtime.materials[key])}>{runtime.materials[key] ? "模拟移除" : "模拟补齐"}：{materialLabels[key]}</button>)}</div></details>
  </div></RequireCompetitionAccess></PublicShell>;
}

export function WorkshopComputePage() {
  const { competitionId } = useParams();
  const { getRuntime } = useWorkshopRuntime();
  if (!competitionId) return null;
  const runtime = getRuntime(competitionId);
  const frozen = activeFrozenCompute(runtime);
  return <PublicShell showNavigation={false}><PageHeader title="算力明细" backTo={`/competitions/${competitionId}/workspace/workshop`} /><RequireCompetitionAccess><div className="space-y-6 px-4 py-5"><CompetitionContextLine competitionId={competitionId} />
    <Card><p className="text-xs text-text-tertiary">由 OPC 提供 AI 算力 · 赛事期间有效</p><p className="mt-2 text-3xl font-semibold text-text-primary">{computePrototype.available.toLocaleString()}</p><p className="mt-1 text-sm text-text-secondary">团队本阶段可用算力</p><div className="mt-4 grid grid-cols-2 gap-2"><div className="rounded-control bg-surface-subtle p-3"><p className="text-xs text-text-tertiary">本周已用</p><strong className="mt-1 block text-text-primary">{computePrototype.usedThisWeek.toLocaleString()}</strong></div><div className="rounded-control bg-surface-subtle p-3"><p className="text-xs text-text-tertiary">冻结</p><strong className="mt-1 block text-text-primary">{frozen}</strong></div></div></Card>
    <Section title="算力流水"><div className="space-y-2">{computePrototype.ledger.map((item, index) => <Card key={`${item.label}-${index}`}><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-medium text-text-primary">{item.label}</p><p className="mt-1 text-xs text-text-secondary">{item.meta}</p></div><strong className="text-sm text-text-primary">{item.value}</strong></div></Card>)}</div></Section>
    <Card className="border border-info bg-info-bg"><p className="text-sm font-medium text-info-text">规则说明</p><p className="mt-2 text-sm leading-5 text-info-text">创建任务时按上限冻结算力，完成后按实际消耗结算并释放差额；失败或取消时按原型表达退回。页面数字均为 Mockplus 示例占位，T013A 不决定真实计价规则。</p></Card>
  </div></RequireCompetitionAccess></PublicShell>;
}

export function WorkshopSkillsPage() {
  const { competitionId } = useParams();
  const { getRuntime } = useWorkshopRuntime();
  if (!competitionId) return null;
  const runtime = getRuntime(competitionId);
  return <PublicShell showNavigation={false}><PageHeader title="技能矩阵" backTo={`/competitions/${competitionId}/workspace/workshop`} /><RequireCompetitionAccess><div className="space-y-4 px-4 py-5"><CompetitionContextLine competitionId={competitionId} /><Card><h1 className="font-semibold text-text-primary">六大技能包</h1><p className="mt-2 text-sm leading-5 text-text-secondary">每个技能包都可以在比赛的不同阶段提供支持。</p></Card>{workshopSkills.map(skill => { const presentation = skillPresentation[skill.id]; const taskStates = skill.taskIds.map(id => taskAvailability(runtime, id)); const done = taskStates.length > 0 && taskStates.every(state => state === "completed"); return <Link key={skill.id} className="block" to={`/competitions/${competitionId}/workspace/workshop/skills/${skill.id}`}><Card interactive><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-medium text-text-brand">{skill.code} · {presentation.purpose}</p><h2 className="mt-1 font-semibold text-text-primary">{skill.name}包</h2><p className="mt-2 text-sm leading-5 text-text-secondary">{skill.capabilities.join("、")}</p></div><StatusTag tone={done ? "success" : "neutral"}>{done ? "已完成" : "可使用"}</StatusTag></div><div className="mt-4 space-y-2 rounded-control bg-surface-subtle p-3 text-xs text-text-secondary"><p><strong className="text-text-primary">谁来做：</strong>{presentation.who}</p><p><strong className="text-text-primary">技能包产出：</strong>{presentation.output}</p><p><strong className="text-text-primary">预计消耗算力：</strong>{presentation.compute}</p></div></Card></Link>; })}</div></RequireCompetitionAccess></PublicShell>;
}

export function WorkshopSkillPage() {
  const navigate = useNavigate();
  const { competitionId, skillId } = useParams();
  const { getRuntime } = useWorkshopRuntime();
  if (!competitionId) return null;
  const runtime = getRuntime(competitionId);
  const skill = skillById(skillId);
  if (!skill) return <PublicShell showNavigation={false}><PageHeader title="技能不存在" backTo={`/competitions/${competitionId}/workspace/workshop/skills`} /></PublicShell>;
  const presentation = skillPresentation[skill.id];
  const recentTask = skill.taskIds.map(taskById).find(task => task && runtime.taskRuns[task.id]?.status === "completed");
  return <PublicShell showNavigation={false}><PageHeader title={`${skill.code} ${skill.name}`} backTo={`/competitions/${competitionId}/workspace/workshop/skills`} /><RequireCompetitionAccess><div className="space-y-6 px-4 py-5"><CompetitionContextLine competitionId={competitionId} />
    <Card><h1 className="text-lg font-semibold text-text-primary">{skill.name}包</h1><p className="mt-2 text-sm leading-5 text-text-secondary">{skill.summary}</p><div className="mt-3 flex flex-wrap gap-2">{skill.capabilities.map(item => <StatusTag key={item} tone="neutral">{item}</StatusTag>)}</div><div className="mt-4 rounded-control bg-surface-subtle p-3 text-xs leading-5 text-text-secondary"><p>场景：{presentation.purpose}</p><p>协作：{presentation.who}</p><p>产出：{presentation.output}</p></div></Card>
    {recentTask && <Section title="最近成果"><Card><StatusTag tone="success">已生成</StatusTag><p className="mt-2 font-medium text-text-primary">{resultById(recentTask.resultId)?.title}</p><SecondaryButton className="mt-3 w-full" onClick={() => navigate(`/competitions/${competitionId}/workspace/workshop/results/${recentTask.resultId}`)}>详情</SecondaryButton></Card></Section>}
    <Section title="技能推荐"><div className="space-y-3">{skill.taskIds.map(taskId => { const task = taskById(taskId); if (!task) return null; const status = taskAvailability(runtime, taskId); const [label, tone] = taskStatusLabel(status); const missing = missingMaterials(runtime, taskId); const flow = flowSpecForTask(taskId); return <Card key={taskId}><div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold text-text-primary">{flow?.instanceTitle ?? task.title}</h2><p className="mt-2 text-sm leading-5 text-text-secondary">{task.summary}</p></div><StatusTag tone={tone}>{label}</StatusTag></div>{missing.length > 0 && <p className="mt-3 text-xs text-warning-text">缺少：{missing.map(item => item.label).join("、")}</p>}<Button disabled={status === "locked"} className="mt-4 w-full" onClick={() => navigate(taskDestination(competitionId, task.id, status))}>{status === "completed" ? "查看成果" : status === "queued" || status === "running" || status === "failed" ? "继续任务" : "开始任务"}</Button></Card>; })}</div></Section>
    <SecondaryButton className="w-full" onClick={() => navigate(`/competitions/${competitionId}/workspace/workshop/results`)}>历史成果</SecondaryButton>
  </div></RequireCompetitionAccess></PublicShell>;
}

export function WorkshopResultsPage() {
  const { competitionId } = useParams();
  const { getRuntime } = useWorkshopRuntime();
  if (!competitionId) return null;
  const runtime = getRuntime(competitionId);
  const results = completedResults(runtime);
  const running = workshopTasks.filter(task => ["queued", "running"].includes(runtime.taskRuns[task.id]?.status ?? ""));
  return <PublicShell showNavigation={false}><PageHeader title="历史成果" backTo={`/competitions/${competitionId}/workspace/workshop`} /><RequireCompetitionAccess><div className="space-y-4 px-4 py-5"><CompetitionContextLine competitionId={competitionId} />
    {running.map(task => <Link className="block" key={task.id} to={`/competitions/${competitionId}/workspace/workshop/tasks/${task.id}/progress`}><Card interactive><div className="flex items-start justify-between gap-3"><div><p className="text-xs text-text-secondary">{skillById(task.skillId)?.name}</p><h2 className="mt-1 font-semibold text-text-primary">{flowSpecForTask(task.id)?.instanceTitle ?? task.title}</h2></div><StatusTag tone="info">生成中</StatusTag></div></Card></Link>)}
    {results.length ? results.slice().reverse().map(result => <Link className="block" key={result.id} to={`/competitions/${competitionId}/workspace/workshop/results/${result.id}`}><Card interactive><div className="flex items-start justify-between gap-3"><div><p className="text-xs text-text-secondary">{skillById(taskById(result.taskId)?.skillId)?.name}</p><h2 className="mt-1 font-semibold text-text-primary">{reportSpecForResult(result.id)?.title ?? result.title}</h2><p className="mt-2 text-sm leading-5 text-text-secondary">{reportSpecForResult(result.id)?.finding ?? result.summary}</p></div><StatusTag tone={runtime.acceptedResultIds.includes(result.id) ? "success" : runtime.submittedResultIds.includes(result.id) ? "info" : "neutral"}>{runtime.acceptedResultIds.includes(result.id) ? "已确认" : runtime.submittedResultIds.includes(result.id) ? "待队长确认" : "已生成"}</StatusTag></div></Card></Link>) : !running.length && <Card className="py-8 text-center"><p className="font-semibold text-text-primary">还没有成果</p><p className="mt-2 text-sm text-text-secondary">从技能矩阵开始 S1 / S2，完成后成果会出现在当前赛事历史记录中。</p></Card>}
  </div></RequireCompetitionAccess></PublicShell>;
}

export function WorkshopResultDetailPage() {
  const navigate = useNavigate();
  const { competitionId, resultId } = useParams();
  const { getRuntime, acceptResult, saveResultDraft, shareResult, submitResult } = useWorkshopRuntime();
  const [editing, setEditing] = useState(false);
  if (!competitionId) return null;
  const runtime = getRuntime(competitionId);
  const result = resultById(resultId);
  const task = result ? taskById(result.taskId) : undefined;
  const completed = task ? runtime.taskRuns[task.id]?.status === "completed" : false;
  if (!result || !task || !completed) return <PublicShell showNavigation={false}><PageHeader title="成果详情" backTo={`/competitions/${competitionId}/workspace/workshop/results`} /><RequireCompetitionAccess><div className="px-4 py-6"><Card className="border border-warning bg-warning-bg"><p className="font-medium text-warning-text">该成果尚未生成</p><p className="mt-2 text-sm text-warning-text">成果严格绑定当前任务，不复用其它技能结果。</p></Card></div></RequireCompetitionAccess></PublicShell>;

  const report = reportSpecForResult(result.id);
  const data = workspaceData[competitionId];
  const isCaptain = data?.team.role.includes("队长") ?? false;
  const accepted = runtime.acceptedResultIds.includes(result.id);
  const submitted = runtime.submittedResultIds.includes(result.id);
  const shared = runtime.sharedResultIds.includes(result.id);
  const detailValue = runtime.resultDrafts[result.id] ?? report?.detail ?? result.summary;

  if (!report) return <PublicShell showNavigation={false}><PageHeader title="成果详情" backTo={`/competitions/${competitionId}/workspace/workshop/results`} /><RequireCompetitionAccess><div className="space-y-6 px-4 py-5"><CompetitionContextLine competitionId={competitionId} /><Card><p className="text-xs font-medium text-text-brand">{task.skillId.toUpperCase()} · {task.title}</p><h1 className="mt-2 text-xl font-semibold leading-7 text-text-primary">{result.title}</h1><p className="mt-4 text-sm leading-6 text-text-secondary">{result.summary}</p></Card><Section title="关键结论"><div className="space-y-2">{result.highlights.map(item => <Card key={item}><p className="text-sm leading-5 text-text-primary">{item}</p></Card>)}</div></Section><Card className="border border-info bg-info-bg"><p className="font-medium text-info-text">下一步建议</p><p className="mt-2 text-sm leading-5 text-info-text">{result.nextSuggestion}</p></Card><Button className="w-full" onClick={() => navigate(`/competitions/${competitionId}/workspace/workshop`)}>返回工坊</Button><TaskScenarioTools competitionId={competitionId} taskId={task.id} /></div></RequireCompetitionAccess></PublicShell>;

  return <PublicShell showNavigation={false}><PageHeader title="成果详情" backTo={`/competitions/${competitionId}/workspace/workshop/results`} /><RequireCompetitionAccess><div className="space-y-6 px-4 py-5"><CompetitionContextLine competitionId={competitionId} />
    <Card><div className="flex items-start justify-between gap-3"><div><p className="text-xs text-text-secondary">AI 辅助生成 · {report.skillLabel}</p><h1 className="mt-2 text-xl font-semibold leading-7 text-text-primary">{report.title}</h1></div><StatusTag tone={accepted ? "success" : submitted ? "info" : "neutral"}>{accepted ? "已确认" : submitted ? "待队长确认" : "已生成"}</StatusTag></div></Card>
    <Section title="核心发现"><Card><p className="text-sm font-medium text-text-primary">关键结论</p><p className="mt-2 text-sm leading-6 text-text-secondary">{report.finding}</p></Card></Section>
    <Section title="薄弱环节"><Card><p className="text-sm leading-6 text-text-secondary">{report.weakness}</p></Card></Section>
    {report.risks && <Section title="风险项与缺失证据"><div className="space-y-2">{report.risks.map(item => <Card key={item} className="border border-warning bg-warning-bg"><p className="text-sm leading-5 text-warning-text">{item}</p></Card>)}</div></Section>}
    <Section title="优先行动清单"><div className="space-y-2">{report.actions.map((item, index) => <Card key={item}><div className="flex gap-3"><span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-info-bg text-xs font-semibold text-info-text">{index + 1}</span><p className="text-sm leading-5 text-text-primary">{item}</p></div></Card>)}</div></Section>
    <Section title="详细分析"><Card>{editing ? <><textarea value={detailValue} onChange={event => saveResultDraft(competitionId, result.id, event.target.value)} rows={8} className="w-full rounded-control border border-border bg-surface p-3 text-base leading-6 text-text-primary outline-none focus:border-primary" /><Button className="mt-3 w-full" onClick={() => setEditing(false)}>保存编辑</Button></> : <p className="text-sm leading-6 text-text-secondary">{detailValue}</p>}</Card></Section>
    <Section title={`${report.skillLabel}评估`}><Card><div className="flex items-end justify-between"><div><p className="text-xs text-text-tertiary">综合评分</p><p className="mt-1 text-3xl font-semibold text-text-primary">{report.score}<span className="text-base text-text-secondary"> /100</span></p></div><div className="text-right"><p className="text-xs text-text-tertiary">报告评级</p><p className="mt-1 font-semibold text-text-primary">{report.grade}</p></div></div><p className="mt-3 text-sm leading-5 text-text-secondary">{report.scoreCopy}</p></Card></Section>
    <Section title="六维项目评估"><div className="space-y-2">{report.dimensions.map(dimension => <Card key={dimension.label}><div className="flex items-center gap-3"><span className="w-20 text-sm text-text-secondary">{dimension.label}</span><div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-subtle"><div className="h-full rounded-full bg-primary" style={{ width: `${dimension.score}%` }} /></div><strong className="w-8 text-right text-sm text-text-primary">{dimension.score}</strong></div></Card>)}</div></Section>
    <Card className="border border-info bg-info-bg"><p className="text-sm font-medium text-info-text">团队协作边界</p><p className="mt-2 text-sm leading-5 text-info-text">生成结果对全队可见；队员可编辑并提交确认，队长可采纳或标记用于比赛。AI 建议不改写赛事可信事实。</p></Card>
    <div className="grid grid-cols-2 gap-2"><SecondaryButton onClick={() => setEditing(value => !value)}>{editing ? "取消编辑" : "编辑"}</SecondaryButton><SecondaryButton onClick={() => shareResult(competitionId, result.id)}>{shared ? "已分享" : "分享"}</SecondaryButton></div>
    {isCaptain ? <Button disabled={accepted} className="w-full" onClick={() => acceptResult(competitionId, result.id)}>{accepted ? "队长已确认" : "队长提交确认"}</Button> : <Button disabled={submitted} className="w-full" onClick={() => submitResult(competitionId, result.id)}>{submitted ? "已提交队长确认" : "提交队长确认"}</Button>}
    <TaskScenarioTools competitionId={competitionId} taskId={task.id} />
  </div></RequireCompetitionAccess></PublicShell>;
}

import { EyeOff } from "lucide-react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Card, PageHeader, PublicShell, SecondaryButton, StatusTag } from "../../components/ui";
import { resultById, workshopTasks } from "./data";
import { completedResults, useWorkshopRuntime } from "./runtime";
import { CompetitionContextLine, RequireCompetitionAccess } from "./shared";

type ResultsTab = "generated" | "adopted" | "failed";

function isResultsTab(value: string | null): value is ResultsTab {
  return value === "generated" || value === "adopted" || value === "failed";
}

export function T013CResultsPage() {
  const navigate = useNavigate();
  const { competitionId } = useParams();
  const { getRuntime } = useWorkshopRuntime();
  const [searchParams, setSearchParams] = useSearchParams();
  if (!competitionId) return null;

  const runtime = getRuntime(competitionId);
  const allResults = completedResults(runtime);
  const privateResult = runtime.taskRuns["s6-company-match"]?.status === "completed"
    ? resultById("result-s6-company-match")
    : undefined;
  const teamResults = allResults.filter(result => result.id !== "result-s6-company-match");
  const acceptedIds = runtime.acceptedResultIds;
  const generated = teamResults.filter(result => !acceptedIds.includes(result.id));
  const adopted = teamResults.filter(result => acceptedIds.includes(result.id));
  const failedTasks = workshopTasks.filter(task => runtime.taskRuns[task.id]?.status === "failed");
  const requestedTab = searchParams.get("tab");
  const activeTab: ResultsTab = isResultsTab(requestedTab) ? requestedTab : "generated";
  const tabs = [
    { id: "generated" as const, label: "已生成", count: generated.length },
    { id: "adopted" as const, label: "已采纳", count: adopted.length },
    { id: "failed" as const, label: "失败", count: failedTasks.length },
  ];

  const selectTab = (tab: ResultsTab) => {
    const next = new URLSearchParams(searchParams);
    next.set("tab", tab);
    setSearchParams(next, { replace: true });
  };

  return <PublicShell showNavigation={false}><PageHeader title="工坊成果" backTo={`/competitions/${competitionId}/workspace/workshop`} /><RequireCompetitionAccess><div className="space-y-5 px-4 py-5">
    <CompetitionContextLine competitionId={competitionId} />

    {privateResult && <section aria-label="个人成果" data-testid="s6-private-history">
      <Card className="border border-info bg-info-bg">
        <div className="flex items-start gap-3">
          <EyeOff size={20} aria-hidden="true" className="mt-0.5 shrink-0 text-info-text" />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-medium text-info-text">个人成果 · 仅自己可见</p><h2 className="mt-1 font-semibold text-info-text">{privateResult.title}</h2></div><StatusTag tone="info">私密</StatusTag></div>
            <p className="mt-2 text-sm leading-5 text-info-text">{privateResult.summary}</p>
            <SecondaryButton className="mt-4 w-full" onClick={() => navigate(`/competitions/${competitionId}/workspace/workshop/results/${privateResult.id}`)}>查看公司推荐</SecondaryButton>
          </div>
        </div>
      </Card>
    </section>}

    <div role="tablist" aria-label="团队成果分组" className="inline-flex w-full rounded-control bg-surface p-1" data-testid="results-tablist">
      {tabs.map(tab => {
        const selected = activeTab === tab.id;
        return <button key={tab.id} role="tab" type="button" aria-selected={selected} onClick={() => selectTab(tab.id)} className={`flex-1 rounded-control px-3 py-2 text-sm font-medium ${selected ? "bg-primary text-text-on-primary" : "text-text-secondary"}`}>{tab.label} <span className={selected ? "text-text-on-primary" : "text-text-tertiary"}>{tab.count}</span></button>;
      })}
    </div>

    {activeTab === "generated" && (generated.length
      ? <div className="space-y-3" data-testid="results-pane-generated">{generated.map(result => <Link className="block" key={result.id} to={`/competitions/${competitionId}/workspace/workshop/results/${result.id}`}><Card interactive><div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold text-text-primary">{result.title}</h2><p className="mt-2 text-sm leading-5 text-text-secondary">{result.summary}</p></div><StatusTag tone="info">已生成</StatusTag></div></Card></Link>)}</div>
      : <Card className="py-8 text-center" data-testid="results-pane-generated"><p className="font-semibold text-text-primary">还没有未采纳的团队成果</p><p className="mt-2 text-sm text-text-secondary">S6 个人公司推荐不会进入团队成果分组。</p></Card>)}

    {activeTab === "adopted" && (adopted.length
      ? <div className="space-y-3" data-testid="results-pane-adopted">{adopted.map(result => <Link className="block" key={result.id} to={`/competitions/${competitionId}/workspace/workshop/results/${result.id}`}><Card interactive><div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold text-text-primary">{result.title}</h2><p className="mt-2 text-sm leading-5 text-text-secondary">{result.summary}</p></div><StatusTag tone="success">已采纳</StatusTag></div></Card></Link>)}</div>
      : <Card className="py-8 text-center" data-testid="results-pane-adopted"><p className="font-semibold text-text-primary">还没有被队长采纳的团队成果</p><p className="mt-2 text-sm text-text-secondary">个人职业建议不参与队长采纳。</p></Card>)}

    {activeTab === "failed" && (failedTasks.length
      ? <div className="space-y-3" data-testid="results-pane-failed">{failedTasks.map(task => <Card key={task.id}><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-medium text-text-brand">{task.skillId.toUpperCase()} · {task.title}</p><p className="mt-2 text-sm leading-5 text-text-secondary">{task.summary}</p></div><StatusTag tone="danger">生成失败</StatusTag></div><SecondaryButton className="mt-3 w-full" onClick={() => navigate(`/competitions/${competitionId}/workspace/workshop/tasks/${task.id}/progress`)}>查看失败任务</SecondaryButton></Card>)}</div>
      : <Card className="py-8 text-center" data-testid="results-pane-failed"><p className="font-semibold text-text-primary">本轮没有失败任务</p></Card>)}
  </div></RequireCompetitionAccess></PublicShell>;
}

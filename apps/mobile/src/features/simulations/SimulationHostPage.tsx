import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Store } from "lucide-react";
import { Button, Card, SecondaryButton } from "../../components/ui";
import {
  simulationAssignments,
  simulationModuleManifests,
  simulationProtocol,
  type DemoHostCommand,
  type DemoModuleEvent,
} from "./registry";

type HostState = "unavailable" | "ready" | "running" | "completed" | "error";

const eventTypes: DemoModuleEvent["type"][] = ["MODULE_READY", "DEMO_STARTED", "DEMO_COMPLETED", "DEMO_EXIT_REQUESTED", "MODULE_ERROR"];

function isDemoModuleEvent(value: unknown): value is { source: typeof simulationProtocol.namespace; payload: DemoModuleEvent } {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as { source?: unknown; payload?: unknown };
  if (candidate.source !== simulationProtocol.namespace) return false;
  const payload = candidate.payload as DemoModuleEvent | undefined;
  if (!payload || typeof payload !== "object" || typeof payload.type !== "string") return false;
  return eventTypes.includes(payload.type as DemoModuleEvent["type"]);
}

export function SimulationHostPage() {
  const { assignmentId = "" } = useParams();
  const navigate = useNavigate();
  const assignment = simulationAssignments[assignmentId];
  const manifest = assignment ? simulationModuleManifests[assignment.moduleId] : undefined;
  const enabled = Boolean(assignment?.enabled && manifest);
  const returnTo = assignment?.returnTo ?? "/apps";

  const [state, setState] = useState<HostState>(enabled ? "ready" : "unavailable");
  const [frameKey, setFrameKey] = useState(0);
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  const readyTimerRef = useRef<number | undefined>(undefined);

  const postToModule = useCallback((payload: DemoHostCommand) => {
    const iframe = frameRef.current;
    if (!iframe || !iframe.contentWindow) return;
    iframe.contentWindow.postMessage({ source: simulationProtocol.namespace, payload }, window.location.origin);
  }, []);

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (!isDemoModuleEvent(event.data)) return;
      const payload = event.data.payload;
      if (payload.type === "MODULE_READY") {
        window.clearTimeout(readyTimerRef.current);
        if (assignment) postToModule({ type: "HOST_INIT", activityId: assignment.host.id, locale: "zh-CN" });
      } else if (payload.type === "DEMO_STARTED") {
        window.clearTimeout(readyTimerRef.current);
        setState(prev => (prev === "completed" ? "running" : prev));
      } else if (payload.type === "DEMO_COMPLETED") {
        window.clearTimeout(readyTimerRef.current);
        setState("completed");
      } else if (payload.type === "DEMO_EXIT_REQUESTED") {
        navigate(returnTo);
      } else if (payload.type === "MODULE_ERROR") {
        setState("error");
      }
    },
    [assignment, postToModule, navigate, returnTo],
  );

  useEffect(() => {
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [handleMessage]);

  useEffect(() => {
    if (state !== "running") return;
    window.clearTimeout(readyTimerRef.current);
    readyTimerRef.current = window.setTimeout(() => {
      setState(prev => (prev === "running" ? "error" : prev));
    }, 15000);
    return () => window.clearTimeout(readyTimerRef.current);
  }, [state, frameKey]);

  const handleStart = () => {
    setFrameKey(key => key + 1);
    setState("running");
  };
  const handleReplay = handleStart;
  const handleExit = () => navigate(returnTo);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border-subtle bg-surface pt-[env(safe-area-inset-top)]">
        <div className="relative mx-auto flex min-h-11 w-full max-w-md items-center justify-center px-14">
          <button type="button" aria-label="返回活动" className="absolute left-1 top-1/2 flex min-h-touch min-w-11 -translate-y-1/2 items-center justify-center rounded-control text-text-primary transition active:bg-surface-pressed" onClick={handleExit}><ChevronLeft aria-hidden="true" size={24} strokeWidth={2} /></button>
          <div className="min-w-0 text-center"><h1 className="truncate text-base font-semibold leading-5 text-text-primary">{manifest?.title ?? "模拟体验"}</h1></div>
          {state === "running" && <div className="absolute right-1 top-1/2 -translate-y-1/2"><SecondaryButton className="min-h-8 px-3 text-xs" onClick={handleExit}>退出体验</SecondaryButton></div>}
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col">
        {state === "unavailable" && (
          <Card className="m-4 border border-warning bg-warning-bg py-10 text-center">
            <p className="text-base font-semibold text-warning-text">当前活动未开启</p>
            <p className="mt-2 text-sm text-warning-text">该模拟体验尚未启用，或已经结束开放。</p>
            <Button className="mt-5" onClick={handleExit}>返回活动</Button>
          </Card>
        )}

        {state === "ready" && (
          <Card className="m-4">
            <div className="flex flex-col items-center py-6 text-center">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#e9f6f1] text-[#247456]"><Store size={24} aria-hidden="true" /></span>
              <h2 className="mt-4 text-lg font-semibold text-text-primary">{manifest?.title ?? "模拟体验"}</h2>
              <p className="mt-2 text-sm leading-5 text-text-secondary">{manifest?.description}</p>
              <p className="mt-4 rounded-container bg-surface-subtle px-3 py-2 text-xs leading-5 text-text-tertiary">这是一个轻量互动体验，不记录成绩，也不影响你的赛事、课程或个人档案。</p>
              <Button className="mt-5 w-full" onClick={handleStart}>开始体验</Button>
            </div>
          </Card>
        )}

        {state === "error" && (
          <Card className="m-4 border border-danger bg-danger-bg py-10 text-center">
            <p className="text-base font-semibold text-danger-text">加载失败</p>
            <p className="mt-2 text-sm text-danger-text">模拟模块暂时无法加载，请重试或返回活动。</p>
            <div className="mt-5 flex gap-3">
              <SecondaryButton className="flex-1" onClick={handleStart}>重试</SecondaryButton>
              <Button className="flex-1" onClick={handleExit}>返回活动</Button>
            </div>
          </Card>
        )}

        {(state === "running" || state === "completed") && manifest?.entryKind === "iframe" && (
          <div className="flex min-h-0 flex-1 flex-col">
            <iframe key={frameKey} ref={frameRef} src={manifest.entry} title={manifest.title} sandbox="allow-scripts allow-same-origin" className="min-h-0 w-full flex-1 border-0 bg-surface" />
            {state === "completed" && (
              <div className="border-t border-border-subtle bg-surface px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                <p className="text-sm font-semibold text-text-primary">体验完成</p>
                <p className="mt-1 text-xs leading-5 text-text-secondary">你已经完成了本次经营决策体验。结果仅供互动参考，不代表正式能力评价。</p>
                <div className="mt-3 flex gap-3">
                  <SecondaryButton className="flex-1" onClick={handleReplay}>再试一次</SecondaryButton>
                  <Button className="flex-1" onClick={handleExit}>返回活动</Button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

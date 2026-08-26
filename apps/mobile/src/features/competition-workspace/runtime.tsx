import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { CompetitionIdentityState, TaskRunStatus } from "../../state/model";
import { usePublicPlatform, type IdentityScenario } from "../public-platform/PublicPlatform";
import {
  computePolicyForTask,
  materialLabels,
  resultById,
  resultTemplates,
  taskById,
  workshopTasks,
  type MaterialKey,
  type WorkshopLifecycle,
} from "./data";

export type WorkshopTaskDraft = { selections: Record<string, string[]>; note: string; uploadName?: string };

export type WorkshopTaskRun = WorkshopTaskDraft & {
  status: TaskRunStatus;
  answer: string;
  progress: number;
  reservedCompute: number;
  actualCompute?: number;
};

export type WorkshopComputeEntry = {
  id: string;
  taskId?: string;
  title: string;
  reason: "领取" | "任务冻结" | "任务实际消耗" | "释放冻结差额" | "失败退回";
  amount: number;
  occurredAt: string;
};

export type WorkshopResultDraft = { summary: string; highlights: string[]; nextSuggestion: string };
export type WorkshopResultVersion = WorkshopResultDraft & { id: string; createdAt: string };

export type CompetitionWorkshopRuntime = {
  lifecycle: WorkshopLifecycle;
  permissionDenied: boolean;
  materials: Record<MaterialKey, boolean>;
  taskRuns: Record<string, WorkshopTaskRun>;
  forcedLockedTaskIds: string[];
  acceptedResultIds: string[];
  resultConfirmationStatus: Record<string, "pending">;
  computeBalance: number;
  computeUsed: number;
  frozenCompute: number;
  computeLedger: WorkshopComputeEntry[];
  resultDrafts: Record<string, WorkshopResultDraft>;
  resultVersions: Record<string, WorkshopResultVersion[]>;
};

export type TeamReductionRequest = {
  competitionId: string;
  memberName: string;
  reason: string;
  status: "pending";
  submittedAt: string;
};

type RuntimeStore = Record<string, CompetitionWorkshopRuntime>;
type TeamReductionRequestStore = Record<string, TeamReductionRequest>;

const optionalMaterialTaskIds = new Set(["s3-visual-kit", "s4-weekly-review", "s5-pitch-ppt"]);

type WorkshopRuntimeContextValue = {
  identityFor: (competitionId: string) => CompetitionIdentityState | undefined;
  setIdentityScenario: (competitionId: string, scenario: IdentityScenario) => void;
  getRuntime: (competitionId: string) => CompetitionWorkshopRuntime;
  teamReductionRequestFor: (competitionId: string) => TeamReductionRequest | undefined;
  submitTeamReductionRequest: (request: Omit<TeamReductionRequest, "status" | "submittedAt">) => void;
  setLifecycle: (competitionId: string, lifecycle: WorkshopLifecycle) => void;
  setPermissionDenied: (competitionId: string, denied: boolean) => void;
  setMaterial: (competitionId: string, material: MaterialKey, available: boolean) => void;
  saveTaskDraft: (competitionId: string, taskId: string, draft: WorkshopTaskDraft) => void;
  setTaskStatus: (competitionId: string, taskId: string, status: TaskRunStatus) => void;
  setTaskLocked: (competitionId: string, taskId: string, locked: boolean) => void;
  startTask: (competitionId: string, taskId: string) => boolean;
  advanceTask: (competitionId: string, taskId: string) => void;
  retryTask: (competitionId: string, taskId: string) => void;
  updateResultDraft: (competitionId: string, resultId: string, draft: WorkshopResultDraft) => void;
  saveResultVersion: (competitionId: string, resultId: string) => void;
  submitResultForConfirmation: (competitionId: string, resultId: string) => void;
  acceptResult: (competitionId: string, resultId: string) => void;
  resetCompetition: (competitionId: string) => void;
};

function blankTaskRun(): WorkshopTaskRun {
  return { status: "ready", answer: "", selections: {}, note: "", progress: 0, reservedCompute: 0 };
}

function makeTaskRuns() {
  return Object.fromEntries(workshopTasks.map(task => [task.id, blankTaskRun()]));
}

function makeResultDrafts() {
  return Object.fromEntries(resultTemplates.map(result => [result.id, {
    summary: result.summary,
    highlights: result.highlights,
    nextSuggestion: result.nextSuggestion,
  }]));
}

function initialComputeLedger(): WorkshopComputeEntry[] {
  return [
    { id: "ledger-grant", title: "OPC 赛事赞助发放", reason: "领取", amount: 10000, occurredAt: "3 天前" },
    { id: "ledger-historical", title: "历史工坊任务", reason: "任务实际消耗", amount: -1688, occurredAt: "昨天" },
    { id: "ledger-s1", taskId: "s1-product-score", title: "选品评分小报告", reason: "任务实际消耗", amount: -72, occurredAt: "2 小时前" },
    { id: "ledger-release", title: "评分预检任务差额释放", reason: "释放冻结差额", amount: 28, occurredAt: "今天" },
    { id: "ledger-refund", title: "模拟问答任务失败退回", reason: "失败退回", amount: 60, occurredAt: "今天" },
  ];
}

function makeActiveRuntime(): CompetitionWorkshopRuntime {
  const taskRuns = makeTaskRuns();
  taskRuns["s1-product-score"] = {
    status: "completed",
    answer: "主推岭南植物精粹护肤组合，目标用户是 18–24 岁校园女性；希望验证成分叙事能否转成真实购买理由。",
    note: "希望重点判断校园渠道和同价位竞品差异。",
    selections: { price: ["60–99 元"], advantages: ["成分差异化", "包装颜值"], audience: ["校园女性"], focus: ["市场可行性"] },
    progress: 100,
    reservedCompute: 0,
    actualCompute: 72,
  };
  return {
    lifecycle: "inProgress",
    permissionDenied: false,
    materials: { projectBrief: true, competitorScreens: true, operationData: false, brandAssets: false, pitchDraft: false },
    taskRuns,
    forcedLockedTaskIds: [],
    acceptedResultIds: ["result-s1-product-score"],
    resultConfirmationStatus: {},
    computeBalance: 8240,
    computeUsed: 1760,
    frozenCompute: 0,
    computeLedger: initialComputeLedger(),
    resultDrafts: makeResultDrafts(),
    resultVersions: {},
  };
}

function makeEndedRuntime(): CompetitionWorkshopRuntime {
  const taskRuns = makeTaskRuns();
  for (const task of workshopTasks) {
    const policy = computePolicyForTask(task.id);
    taskRuns[task.id] = { ...blankTaskRun(), status: "completed", answer: "历史赛事任务记录", note: "历史赛事任务记录", progress: 100, actualCompute: policy.actual };
  }
  return {
    lifecycle: "ended",
    permissionDenied: false,
    materials: { projectBrief: true, competitorScreens: true, operationData: true, brandAssets: true, pitchDraft: true },
    taskRuns,
    forcedLockedTaskIds: [],
    acceptedResultIds: workshopTasks.map(task => task.resultId),
    resultConfirmationStatus: {},
    computeBalance: 0,
    computeUsed: 10000,
    frozenCompute: 0,
    computeLedger: initialComputeLedger(),
    resultDrafts: makeResultDrafts(),
    resultVersions: {},
  };
}

function initialRuntime(competitionId: string) {
  return competitionId === "sanchuang-15" ? makeEndedRuntime() : makeActiveRuntime();
}

function updateRuntime(store: RuntimeStore, competitionId: string, updater: (runtime: CompetitionWorkshopRuntime) => CompetitionWorkshopRuntime) {
  const current = store[competitionId] ?? initialRuntime(competitionId);
  return { ...store, [competitionId]: updater(current) };
}

function ledgerEntry(taskId: string, reason: WorkshopComputeEntry["reason"], amount: number): WorkshopComputeEntry {
  return { id: `${taskId}-${reason}-${Date.now()}`, taskId, title: taskById(taskId)?.title ?? taskId, reason, amount, occurredAt: "刚刚" };
}

const WorkshopRuntimeContext = createContext<WorkshopRuntimeContextValue | null>(null);

export function WorkshopRuntimeProvider({ children }: { children: ReactNode }) {
  const { session, identities, setCompetitionIdentityScenario } = usePublicPlatform();
  const [store, setStore] = useState<RuntimeStore>(() => ({ "sanchuang-16": makeActiveRuntime(), "sanchuang-15": makeEndedRuntime() }));
  const [teamReductionRequests, setTeamReductionRequests] = useState<TeamReductionRequestStore>({});

  const value = useMemo<WorkshopRuntimeContextValue>(() => ({
    identityFor: competitionId => session.loggedIn ? identities.find(identity => identity.competitionId === competitionId) : undefined,
    setIdentityScenario: (competitionId, scenario) => setCompetitionIdentityScenario(competitionId, scenario),
    getRuntime: competitionId => store[competitionId] ?? initialRuntime(competitionId),
    teamReductionRequestFor: competitionId => teamReductionRequests[competitionId],
    submitTeamReductionRequest: request => setTeamReductionRequests(current => ({ ...current, [request.competitionId]: { ...request, status: "pending", submittedAt: new Date().toISOString() } })),
    setLifecycle: (competitionId, lifecycle) => setStore(current => updateRuntime(current, competitionId, runtime => ({ ...runtime, lifecycle }))),
    setPermissionDenied: (competitionId, permissionDenied) => setStore(current => updateRuntime(current, competitionId, runtime => ({ ...runtime, permissionDenied }))),
    setMaterial: (competitionId, material, available) => setStore(current => updateRuntime(current, competitionId, runtime => ({ ...runtime, materials: { ...runtime.materials, [material]: available } }))),
    saveTaskDraft: (competitionId, taskId, draft) => setStore(current => updateRuntime(current, competitionId, runtime => {
      const taskRun = runtime.taskRuns[taskId] ?? blankTaskRun();
      return { ...runtime, taskRuns: { ...runtime.taskRuns, [taskId]: { ...taskRun, ...draft, answer: draft.note, status: "ready" } } };
    })),
    setTaskStatus: (competitionId, taskId, status) => setStore(current => updateRuntime(current, competitionId, runtime => ({
      ...runtime,
      taskRuns: { ...runtime.taskRuns, [taskId]: { ...(runtime.taskRuns[taskId] ?? blankTaskRun()), status, progress: status === "completed" ? 100 : status === "running" ? 68 : 0 } },
    }))),
    setTaskLocked: (competitionId, taskId, locked) => setStore(current => updateRuntime(current, competitionId, runtime => ({
      ...runtime,
      forcedLockedTaskIds: locked ? Array.from(new Set([...runtime.forcedLockedTaskIds, taskId])) : runtime.forcedLockedTaskIds.filter(id => id !== taskId),
    }))),
    startTask: (competitionId, taskId) => {
      const runtime = store[competitionId] ?? initialRuntime(competitionId);
      const policy = computePolicyForTask(taskId);
      if (runtime.computeBalance < policy.estimateMax) return false;
      setStore(current => updateRuntime(current, competitionId, currentRuntime => {
        const taskRun = currentRuntime.taskRuns[taskId] ?? blankTaskRun();
        return {
          ...currentRuntime,
          computeBalance: currentRuntime.computeBalance - policy.estimateMax,
          frozenCompute: currentRuntime.frozenCompute + policy.estimateMax,
          computeLedger: [ledgerEntry(taskId, "任务冻结", -policy.estimateMax), ...currentRuntime.computeLedger],
          forcedLockedTaskIds: currentRuntime.forcedLockedTaskIds.filter(id => id !== taskId),
          taskRuns: { ...currentRuntime.taskRuns, [taskId]: { ...taskRun, status: "queued", progress: 16, reservedCompute: policy.estimateMax } },
        };
      }));
      return true;
    },
    advanceTask: (competitionId, taskId) => setStore(current => updateRuntime(current, competitionId, runtime => {
      const taskRun = runtime.taskRuns[taskId] ?? blankTaskRun();
      if (taskRun.status === "queued") return { ...runtime, taskRuns: { ...runtime.taskRuns, [taskId]: { ...taskRun, status: "running", progress: 68 } } };
      if (taskRun.status !== "running") return runtime;
      const policy = computePolicyForTask(taskId);
      const reserved = taskRun.reservedCompute || policy.estimateMax;
      const release = Math.max(0, reserved - policy.actual);
      return {
        ...runtime,
        computeBalance: runtime.computeBalance + release,
        computeUsed: runtime.computeUsed + policy.actual,
        frozenCompute: Math.max(0, runtime.frozenCompute - reserved),
        computeLedger: [ledgerEntry(taskId, "释放冻结差额", release), ledgerEntry(taskId, "任务实际消耗", -policy.actual), ...runtime.computeLedger],
        taskRuns: { ...runtime.taskRuns, [taskId]: { ...taskRun, status: "completed", progress: 100, reservedCompute: 0, actualCompute: policy.actual } },
      };
    })),
    retryTask: (competitionId, taskId) => {
      const runtime = store[competitionId] ?? initialRuntime(competitionId);
      const policy = computePolicyForTask(taskId);
      if (runtime.computeBalance < policy.estimateMax) return;
      setStore(current => updateRuntime(current, competitionId, currentRuntime => {
        const taskRun = currentRuntime.taskRuns[taskId] ?? blankTaskRun();
        return {
          ...currentRuntime,
          computeBalance: currentRuntime.computeBalance - policy.estimateMax,
          frozenCompute: currentRuntime.frozenCompute + policy.estimateMax,
          computeLedger: [ledgerEntry(taskId, "任务冻结", -policy.estimateMax), ...currentRuntime.computeLedger],
          taskRuns: { ...currentRuntime.taskRuns, [taskId]: { ...taskRun, status: "queued", progress: 16, reservedCompute: policy.estimateMax } },
        };
      }));
    },
    updateResultDraft: (competitionId, resultId, draft) => setStore(current => updateRuntime(current, competitionId, runtime => ({ ...runtime, resultDrafts: { ...runtime.resultDrafts, [resultId]: draft } }))),
    saveResultVersion: (competitionId, resultId) => setStore(current => updateRuntime(current, competitionId, runtime => {
      const draft = runtime.resultDrafts[resultId];
      if (!draft) return runtime;
      const version: WorkshopResultVersion = { ...draft, id: `${resultId}-v${(runtime.resultVersions[resultId]?.length ?? 0) + 1}`, createdAt: "刚刚" };
      return { ...runtime, resultVersions: { ...runtime.resultVersions, [resultId]: [...(runtime.resultVersions[resultId] ?? []), version] } };
    })),
    submitResultForConfirmation: (competitionId, resultId) => setStore(current => updateRuntime(current, competitionId, runtime => ({
      ...runtime,
      resultConfirmationStatus: { ...runtime.resultConfirmationStatus, [resultId]: "pending" },
    }))),
    acceptResult: (competitionId, resultId) => setStore(current => updateRuntime(current, competitionId, runtime => {
      const nextConfirmationStatus = { ...runtime.resultConfirmationStatus };
      delete nextConfirmationStatus[resultId];
      return {
        ...runtime,
        acceptedResultIds: runtime.acceptedResultIds.includes(resultId) ? runtime.acceptedResultIds : [...runtime.acceptedResultIds, resultId],
        resultConfirmationStatus: nextConfirmationStatus,
      };
    })),
    resetCompetition: competitionId => {
      setStore(current => ({ ...current, [competitionId]: initialRuntime(competitionId) }));
      setTeamReductionRequests(current => { if (!current[competitionId]) return current; const next = { ...current }; delete next[competitionId]; return next; });
    },
  }), [session.loggedIn, identities, setCompetitionIdentityScenario, store, teamReductionRequests]);

  return <WorkshopRuntimeContext.Provider value={value}>{children}</WorkshopRuntimeContext.Provider>;
}

export function useWorkshopRuntime() {
  const value = useContext(WorkshopRuntimeContext);
  if (!value) throw new Error("WorkshopRuntimeProvider missing");
  return value;
}

export function taskAvailability(runtime: CompetitionWorkshopRuntime, taskId: string) {
  const task = taskById(taskId);
  if (!task || runtime.forcedLockedTaskIds.includes(taskId)) return "locked" as const;
  if (!optionalMaterialTaskIds.has(taskId) && task.requiredMaterials.some(material => !runtime.materials[material])) return "locked" as const;
  return runtime.taskRuns[taskId]?.status ?? "ready";
}

export function isOptionalMaterialTask(taskId: string) {
  return optionalMaterialTaskIds.has(taskId);
}

export function missingMaterials(runtime: CompetitionWorkshopRuntime, taskId: string) {
  const task = taskById(taskId);
  if (!task || optionalMaterialTaskIds.has(taskId)) return [];
  return task.requiredMaterials.filter(material => !runtime.materials[material]).map(material => ({ key: material, label: materialLabels[material] }));
}

export function completedResults(runtime: CompetitionWorkshopRuntime) {
  return workshopTasks.filter(task => runtime.taskRuns[task.id]?.status === "completed").map(task => resultById(task.resultId)).filter((result): result is NonNullable<typeof result> => Boolean(result));
}

export function nextReadyTask(runtime: CompetitionWorkshopRuntime) {
  return workshopTasks.find(task => taskAvailability(runtime, task.id) === "ready");
}

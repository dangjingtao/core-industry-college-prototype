// 徽章 hook：从已有真相源派生事实，由规则引擎判定得到已得 / 未得徽章。

import { useEffect, useMemo, useState } from "react";
import { usePublicPlatform } from "../public-platform/state";
import { useLongTermAssets } from "../long-term-assets/store";
import { badgeCatalog } from "./catalog";
import { evaluateAll, type BadgeEvaluationContext } from "./engine";
import { readEarnRecords, recordEarnedBadges, type BadgeEarnRecords } from "./earnRecord";
import { deriveSimulationMetrics, getSimulationSnapshot } from "../app-center/StartupShopStore";
import { courses } from "../long-term-assets/data";
import { workspaceData } from "../competition-workspace/data";
import { useWorkshopRuntime } from "../competition-workspace/runtime";

// 模拟经营 level 状态读取 helper
function useSimulationMetrics() {
  const [snapshot, setSnapshot] = useState(() => getSimulationSnapshot());
  // 同步跨组件的更新：当 other tab / 同一会话内其他组件修改 storage 时刷新
  useEffect(() => {
    const onStorage = () => setSnapshot(getSimulationSnapshot());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  return { snapshot, ...deriveSimulationMetrics(snapshot.done) };
}

function useCheckInSnapshot() {
  const [state, setState] = useState(() => {
    try {
      const raw = typeof localStorage !== "undefined" ? localStorage.getItem("task-center-checkin") : null;
      const saved = raw ? JSON.parse(raw) as { date: string; streak: number } : null;
      const today = new Date().toLocaleDateString("zh-CN");
      return { checkedIn: saved?.date === today, streak: saved?.streak ?? 0 };
    } catch {
      return { checkedIn: false, streak: 0 };
    }
  });
  useEffect(() => {
    const onStorage = () => {
      try {
        const raw = localStorage.getItem("task-center-checkin");
        const saved = raw ? JSON.parse(raw) as { date: string; streak: number } : null;
        const today = new Date().toLocaleDateString("zh-CN");
        setState({ checkedIn: saved?.date === today, streak: saved?.streak ?? 0 });
      } catch {
        // ignore
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  return state;
}

function useAdWatchedCount() {
  const [count, setCount] = useState(() => {
    try {
      const raw = typeof localStorage !== "undefined" ? localStorage.getItem("ad-watched-count") : null;
      return raw ? Number(JSON.parse(raw).count) || 0 : 0;
    } catch {
      return 0;
    }
  });
  useEffect(() => {
    const onStorage = () => {
      try {
        const raw = localStorage.getItem("ad-watched-count");
        setCount(raw ? Number(JSON.parse(raw).count) || 0 : 0);
      } catch {
        // ignore
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  return count;
}

function useNewbieCompleted() {
  const [completed, setCompleted] = useState(false);
  useEffect(() => {
    const compute = () => {
      try {
        // 新手任务「所有任务都标记为完成」= 把所有 5 个任务 id 写入 rewards 视为完成
        // 这里以更通用的方式：所有 5 个任务都达成（已点击）= 全部完成
        // 我们读取 PublicPlatform session + LongTermAssets 派生：
        // 简化：用 localStorage 标记 `newbie-completed-flag`，在 NewbieTasksPage 全部完成时写入。
        const raw = localStorage.getItem("newbie-completed-flag");
        setCompleted(raw === "1");
      } catch {
        // ignore
      }
    };
    compute();
    const onStorage = () => compute();
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  return completed;
}

function useResumeEdited() {
  const [edited, setEdited] = useState(false);
  useEffect(() => {
    const compute = () => {
      try {
        const raw = localStorage.getItem("resume-first-edit-flag");
        setEdited(raw === "1");
      } catch {
        // ignore
      }
    };
    compute();
    const onStorage = () => compute();
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  return edited;
}

/**
 * 读取所有课程关卡小测的通过状态：
 * courseCheckpointSinglePasses[courseId][checkpointId] = true/false
 * 用于支持单节点徽章判定。
 */
function useCourseCheckpointPasses(): {
  /** 每门课是否所有关卡都通过（粗粒度，兼容旧规则） */
  byCourse: Record<string, boolean>;
  /** 每门课每个关卡是否通过（细粒度，支持单节点徽章） */
  byCheckpoint: Record<string, Record<string, boolean>>;
} {
  const [state, setState] = useState(() => computeCheckpointPasses());
  useEffect(() => {
    const compute = () => setState(computeCheckpointPasses());
    const onStorage = () => compute();
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  return state;
}

function computeCheckpointPasses(): {
  byCourse: Record<string, boolean>;
  byCheckpoint: Record<string, Record<string, boolean>>;
} {
  const byCheckpoint: Record<string, Record<string, boolean>> = {};
  const byCourse: Record<string, boolean> = {};
  for (const course of courses) {
    if (!course.checkpoints || course.checkpoints.length === 0) continue;
    const cpMap: Record<string, boolean> = {};
    let allPassed = true;
    for (const cp of course.checkpoints) {
      try {
        const passed = localStorage.getItem(`checkpoint-passed-${course.id}-${cp.id}`) === "1";
        cpMap[cp.id] = passed;
        if (!passed) allPassed = false;
      } catch {
        cpMap[cp.id] = false;
        allPassed = false;
      }
    }
    byCheckpoint[course.id] = cpMap;
    byCourse[course.id] = allPassed;
  }
  return { byCourse, byCheckpoint };
}

export type BadgeView = {
  entry: (typeof badgeCatalog)[number];
  unlocked: boolean;
  /** 历史获得记录中的获得时间（ISO）；仅在持久层有记录时存在 */
  earnedAt?: string;
};

export function useBadges(): {
  earned: BadgeView[];
  locked: BadgeView[];
  totalCount: number;
  earnedCount: number;
} {
  const ctx = useBadgeEvaluationContext();

  // 当前事实推导出的徽章集合（会随事实回退，例如断签）
  const derivedIds = useMemo(() => evaluateAll(badgeCatalog, ctx), [ctx]);

  // 历史获得记录：只增不减，断签 / 身份回退不删除
  const [records, setRecords] = useState<BadgeEarnRecords>(() => readEarnRecords());

  useEffect(() => {
    // 把新推导出的徽章写入持久层（幂等，已存在保留最早时间）
    const updated = recordEarnedBadges(derivedIds);
    setRecords(prev => {
      const prevKeys = Object.keys(prev);
      const nextKeys = Object.keys(updated);
      if (prevKeys.length !== nextKeys.length) return updated;
      return nextKeys.every(key => prev[key] === updated[key]) ? prev : updated;
    });
  }, [derivedIds]);

  // 跨 tab 同步获得记录
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === "badge-earn-records") setRecords(readEarnRecords());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // 展示集合 = 历史记录 ∪ 当前推导（推导兜底，历史不丢）
  const earnedIds = useMemo(() => {
    const ids = new Set<string>(derivedIds);
    for (const id of Object.keys(records)) ids.add(id);
    return ids;
  }, [derivedIds, records]);

  const earned: BadgeView[] = [];
  const locked: BadgeView[] = [];
  for (const entry of badgeCatalog) {
    const view: BadgeView = { entry, unlocked: earnedIds.has(entry.id), earnedAt: records[entry.id] };
    if (view.unlocked) earned.push(view); else locked.push(view);
  }
  return { earned, locked, totalCount: badgeCatalog.length, earnedCount: earned.length };
}

/** 暴露评估上下文，供徽章详情页计算子条件进度使用 */
export function useBadgeEvaluationContext(): BadgeEvaluationContext {
  const { session, identities } = usePublicPlatform();
  const { learning, welfareParticipations, benefitStatuses } = useLongTermAssets();
  const { getRuntime } = useWorkshopRuntime();
  const checkin = useCheckInSnapshot();
  const adWatched = useAdWatchedCount();
  const sim = useSimulationMetrics();
  const newbieCompleted = useNewbieCompleted();
  const resumeEdited = useResumeEdited();
  const courseCheckpointPasses = useCourseCheckpointPasses();

  // 赛事工作区事实：遍历账号下的赛事身份，从对应 runtime 派生（不持有第二份真相源）
  const workshopFacts = useMemo(() => {
    let teamFormed = false;
    let materialsReady = false;
    let tasksAllCompleted = false;
    let acceptedResultCount = 0;
    for (const identity of identities) {
      const wsData = workspaceData[identity.competitionId];
      if (!wsData) continue;
      // 仅统计已激活或已结束的赛事身份，避免把待审核报名算作工坊进展
      const effective = identity.identityStatus === "active" || identity.competitionStatus === "ended";
      if (!effective) continue;
      const runtime = getRuntime(identity.competitionId);
      if (wsData.team.members.length > 0) teamFormed = true;
      if (Object.values(runtime.materials).every(Boolean)) materialsReady = true;
      if (Object.values(runtime.taskRuns).every(run => run.status === "completed")) tasksAllCompleted = true;
      acceptedResultCount = Math.max(acceptedResultCount, runtime.acceptedResultIds.length);
    }
    return { teamFormed, materialsReady, tasksAllCompleted, acceptedResultCount };
  }, [identities, getRuntime]);

  return useMemo(() => ({
    loggedIn: session.loggedIn,
    profileComplete: session.loggedIn && session.profileComplete,
    learning,
    checkinStreak: checkin.streak,
    checkedInToday: checkin.checkedIn,
    newbieCompleted,
    adWatchedCount: adWatched,
    welfareHelpedCount: welfareParticipations.length,
    benefitClaimedCount: Object.values(benefitStatuses).filter(status => status === "claimed" || status === "used").length,
    resumeFirstEdited: resumeEdited,
    hasCompetitionIdentity: identities.some(identity => ["submitted", "pending", "approved"].includes(identity.registrationStatus) || identity.identityStatus === "active"),
    hasEndedCompetitionIdentity: identities.some(identity => identity.competitionStatus === "ended"),
    workshopTeamFormed: workshopFacts.teamFormed,
    workshopMaterialsReady: workshopFacts.materialsReady,
    workshopTasksAllCompleted: workshopFacts.tasksAllCompleted,
    workshopAcceptedResultCount: workshopFacts.acceptedResultCount,
    simulationLevel: sim.level,
    simulationHasStock: sim.stock > 0,
    simulationHasTraffic: sim.traffic > 0,
    courseCheckpointPasses: courseCheckpointPasses.byCourse,
    courseCheckpointSinglePasses: courseCheckpointPasses.byCheckpoint,
  }), [session, learning, checkin, adWatched, welfareParticipations.length, benefitStatuses, resumeEdited, identities, workshopFacts, sim.level, sim.stock, sim.traffic, newbieCompleted, courseCheckpointPasses.byCourse, courseCheckpointPasses.byCheckpoint]);
}

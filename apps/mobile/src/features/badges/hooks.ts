// 徽章 hook：从已有真相源派生事实，由规则引擎判定得到已得 / 未得徽章。

import { useEffect, useMemo, useState } from "react";
import { usePublicPlatform } from "../public-platform/state";
import { useLongTermAssets } from "../long-term-assets/store";
import { badgeCatalog } from "./catalog";
import { evaluateAll, type BadgeEvaluationContext } from "./engine";
import { deriveSimulationMetrics, getSimulationSnapshot } from "../app-center/StartupShopStore";
import { courses } from "../long-term-assets/data";

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

function useCourseCheckpointPasses(): Record<string, boolean> {
  const [passes, setPasses] = useState<Record<string, boolean>>(() => {
    const out: Record<string, boolean> = {};
    for (const course of courses) {
      if (!course.checkpoints || course.checkpoints.length === 0) continue;
      out[course.id] = course.checkpoints.every(cp => {
        try { return localStorage.getItem(`checkpoint-passed-${course.id}-${cp.id}`) === "1"; } catch { return false; }
      });
    }
    return out;
  });
  useEffect(() => {
    const compute = () => {
      const out: Record<string, boolean> = {};
      for (const course of courses) {
        if (!course.checkpoints || course.checkpoints.length === 0) continue;
        out[course.id] = course.checkpoints.every(cp => {
          try { return localStorage.getItem(`checkpoint-passed-${course.id}-${cp.id}`) === "1"; } catch { return false; }
        });
      }
      setPasses(out);
    };
    const onStorage = () => compute();
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  return passes;
}

export type BadgeView = {
  entry: (typeof badgeCatalog)[number];
  unlocked: boolean;
};

export function useBadges(): {
  earned: BadgeView[];
  locked: BadgeView[];
  totalCount: number;
  earnedCount: number;
} {
  const { session, identities } = usePublicPlatform();
  const { learning, welfareParticipations, benefitStatuses } = useLongTermAssets();
  const checkin = useCheckInSnapshot();
  const adWatched = useAdWatchedCount();
  const sim = useSimulationMetrics();
  const newbieCompleted = useNewbieCompleted();
  const resumeEdited = useResumeEdited();
  const courseCheckpointPasses = useCourseCheckpointPasses();

  const ctx: BadgeEvaluationContext = useMemo(() => ({
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
    simulationLevel: sim.level,
    simulationHasStock: sim.stock > 0,
    simulationHasTraffic: sim.traffic > 0,
    courseCheckpointPasses,
  }), [session, learning, checkin, adWatched, welfareParticipations.length, benefitStatuses, resumeEdited, identities, sim.level, sim.stock, sim.traffic, newbieCompleted, courseCheckpointPasses]);

  const earnedIds = useMemo(() => evaluateAll(badgeCatalog, ctx), [ctx]);

  const earned: BadgeView[] = [];
  const locked: BadgeView[] = [];
  for (const entry of badgeCatalog) {
    const view: BadgeView = { entry, unlocked: earnedIds.has(entry.id) };
    if (view.unlocked) earned.push(view); else locked.push(view);
  }
  return { earned, locked, totalCount: badgeCatalog.length, earnedCount: earned.length };
}

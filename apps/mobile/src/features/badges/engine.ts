// 规则引擎：输入为「事实 / 派生事实」，输出为「应发放的徽章 id 集合」。
// 模型已对齐 PRD 19：徽章使用 sourceType × grade 两维；可信证书独立为可信资产（见 certificates.ts）。
// 本模块不持有第二份 session / identities / 学力值 / 任务真相源，
// 只读取已有 store / hook 中的事实，然后做规则判定。

import { isCourseCompleted } from "@core/shared";
import type { BadgeCatalogEntry, BadgeRule } from "./catalog";

/** 与 long-term-assets/store.tsx 的 LearningRecord 保持形状一致（只需用到的字段） */
export type BadgeLearningRecord = {
  courseId: string;
  progress: number;
  assessment: "idle" | "passed" | "failed";
};

export type BadgeEvaluationContext = {
  // 长期账号 / 学习
  loggedIn: boolean;
  profileComplete: boolean;
  learning: BadgeLearningRecord[];
  // 任务 / 打卡
  checkinStreak: number;
  checkedInToday: boolean;
  newbieCompleted: boolean;
  // 激励视频广告
  adWatchedCount: number;
  // 公益助力
  welfareHelpedCount: number;
  // 权益
  benefitClaimedCount: number;
  // 简历
  resumeFirstEdited: boolean;
  // 赛事
  hasCompetitionIdentity: boolean;
  hasEndedCompetitionIdentity: boolean;
  // 赛事工作区（从 WorkshopRuntime 派生，任意赛事达成即算）
  workshopTeamFormed: boolean;
  workshopMaterialsReady: boolean;
  workshopTasksAllCompleted: boolean;
  workshopAcceptedResultCount: number;
  // 模拟经营
  simulationLevel: number; // 0 表示未开始
  simulationHasStock: boolean;
  simulationHasTraffic: boolean;
  // 课程关卡小测通过：{ [courseId]: 是否所有关卡均通过 }
  courseCheckpointPasses: Record<string, boolean>;
  // 课程关卡小测细粒度：{ [courseId]: { [checkpointId]: 是否通过 } }
  courseCheckpointSinglePasses: Record<string, Record<string, boolean>>;
};

export function evaluateBadge(rule: BadgeRule, ctx: BadgeEvaluationContext): boolean {
  switch (rule.type) {
    case "checkin.streak":
      return ctx.checkinStreak >= rule.min;
    case "checkin.today":
      return ctx.checkedInToday;
    case "newbie.completed":
      return ctx.newbieCompleted;
    case "ad.watched":
      return ctx.adWatchedCount >= rule.min;
    case "welfare.helped":
      return ctx.welfareHelpedCount >= rule.min;
    case "profile.complete":
      return ctx.profileComplete;
    case "resume.firstEdit":
      return ctx.resumeFirstEdited;
    case "course.completed": {
      const target = rule.courseId;
      return ctx.learning.some(record => record.courseId === target && isCourseCompleted(record));
    }
    case "course.completedCount":
      return ctx.learning.filter(record => isCourseCompleted(record)).length >= rule.min;
    case "course.checkpointPassed":
      return ctx.courseCheckpointPasses[rule.courseId] === true;
    case "course.checkpointPassedCount":
      return Object.values(ctx.courseCheckpointPasses).filter(Boolean).length >= rule.min;
    case "course.checkpointSinglePassed":
      return ctx.courseCheckpointSinglePasses[rule.courseId]?.[rule.checkpointId] === true;
    case "competition.registered":
      return ctx.hasCompetitionIdentity;
    case "competition.ended":
      return ctx.hasEndedCompetitionIdentity;
    case "competition.team":
      return ctx.workshopTeamFormed;
    case "competition.materialsReady":
      return ctx.workshopMaterialsReady;
    case "competition.workshopTasksCompleted":
      return ctx.workshopTasksAllCompleted;
    case "competition.resultsAccepted":
      return ctx.workshopAcceptedResultCount >= rule.min;
    case "simulation.level":
      return ctx.simulationLevel >= rule.min;
    case "simulation.stockAndTraffic":
      return ctx.simulationHasStock && ctx.simulationHasTraffic;
    case "benefit.claimed":
      return ctx.benefitClaimedCount >= rule.min;
    case "anyOf":
      return rule.rules.some(sub => evaluateBadge(sub, ctx));
    case "allOf":
      return rule.rules.every(sub => evaluateBadge(sub, ctx));
    default:
      return false;
  }
}

/** 评估全部徽章（可信证书由 certificates.ts 单独判定，不混入本集合） */
export function evaluateAll(catalog: BadgeCatalogEntry[], ctx: BadgeEvaluationContext): Set<string> {
  const result = new Set<string>();
  for (const entry of catalog) {
    if (evaluateBadge(entry.rule, ctx)) result.add(entry.id);
  }
  return result;
}

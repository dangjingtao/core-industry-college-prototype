import type {
  AmbassadorCampaignState,
  AmbassadorValidAcquisition,
  MemberWeekContribution,
  TeamWeekMetrics,
  WeekTrend,
} from "./campus-ambassador";
import {
  ambassadorAcquisitionsInWeek,
  ambassadorNaturalWeek,
  ambassadorPreviousNaturalWeek,
  type AmbassadorNaturalWeek,
} from "./campus-ambassador-week";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function resolvedWeek(reference: Date | string | number): AmbassadorNaturalWeek {
  return ambassadorNaturalWeek(reference);
}

/**
 * Compatibility surface for the original T052 PC week controls.
 *
 * T053 already fixed the product's natural-week boundary to mainland-China
 * business time (UTC+8). T054 keeps the existing PC API names but resolves
 * them through the same UTC+8 helper so PC and Mobile cannot split the same
 * acquisition into different weeks when the browser / CI timezone differs.
 */
export function weekStartOf(date: Date | string): string {
  return new Date(resolvedWeek(date).startMs).toISOString();
}

export function weekEndOf(date: Date | string): string {
  return new Date(resolvedWeek(date).endExclusiveMs - 1).toISOString();
}

export function formatWeekLabel(weekStartIso: string): string {
  const week = resolvedWeek(weekStartIso);
  return `${week.startDate} ~ ${week.endDate}`;
}

export function previousWeek(weekStartIso: string): string {
  return new Date(ambassadorPreviousNaturalWeek(weekStartIso).startMs).toISOString();
}

export function nextWeek(weekStartIso: string): string {
  return new Date(resolvedWeek(weekStartIso).startMs + WEEK_MS).toISOString();
}

function trendFor(currentCount: number, previousCount: number, totalCount: number): { trend: WeekTrend; trendDelta: number } {
  const trendDelta = currentCount - previousCount;
  if (previousCount === 0 && totalCount === currentCount && currentCount > 0) return { trend: "first", trendDelta };
  if (trendDelta > 0) return { trend: "up", trendDelta };
  if (trendDelta < 0) return { trend: "down", trendDelta };
  return { trend: "flat", trendDelta };
}

export function deriveCampaignWeekMetrics(
  state: AmbassadorCampaignState,
  campaignId: string,
  weekStartIso: string,
): TeamWeekMetrics[] {
  const week = resolvedWeek(weekStartIso);
  const previous = ambassadorPreviousNaturalWeek(week.startMs);
  return state.teams
    .filter(team => team.campaignId === campaignId)
    .map(team => {
      const teamAcquisitions = state.validAcquisitions.filter(item => item.teamId === team.id);
      const weekAcquisitions = ambassadorAcquisitionsInWeek(teamAcquisitions, week).length;
      const previousWeekAcquisitions = ambassadorAcquisitionsInWeek(teamAcquisitions, previous).length;
      const totalAcquisitions = teamAcquisitions.length;
      const { trend, trendDelta } = trendFor(weekAcquisitions, previousWeekAcquisitions, totalAcquisitions);
      return {
        teamId: team.id,
        weekStart: new Date(week.startMs).toISOString(),
        weekAcquisitions,
        previousWeekAcquisitions,
        totalAcquisitions,
        trend,
        trendDelta,
      };
    });
}

export function deriveTeamWeekContributions(
  state: AmbassadorCampaignState,
  teamId: string,
  weekStartIso: string,
): MemberWeekContribution[] {
  const team = state.teams.find(item => item.id === teamId);
  if (!team) return [];
  const weekAcquisitions = ambassadorAcquisitionsInWeek(
    state.validAcquisitions.filter(item => item.teamId === teamId),
    resolvedWeek(weekStartIso),
  );
  return team.members.map(member => ({
    accountId: member.accountId,
    role: member.role,
    weekAcquisitions: weekAcquisitions.filter(item => item.promoterAccountId === member.accountId).length,
    totalAcquisitions: state.validAcquisitions.filter(item => item.teamId === teamId && item.promoterAccountId === member.accountId).length,
  }));
}

export function getTeamWeekAcquisitions(
  state: AmbassadorCampaignState,
  teamId: string,
  weekStartIso: string,
): AmbassadorValidAcquisition[] {
  return ambassadorAcquisitionsInWeek(
    state.validAcquisitions.filter(item => item.teamId === teamId),
    resolvedWeek(weekStartIso),
  ).sort((a, b) => Date.parse(a.registeredAt) - Date.parse(b.registeredAt));
}

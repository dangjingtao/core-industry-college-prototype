import type { AmbassadorValidAcquisition } from "./campus-ambassador";

const DAY_MS = 24 * 60 * 60 * 1000;
const BUSINESS_TIMEZONE_OFFSET_MINUTES = 8 * 60;
const BUSINESS_TIMEZONE_OFFSET_MS = BUSINESS_TIMEZONE_OFFSET_MINUTES * 60 * 1000;

export type AmbassadorNaturalWeek = {
  startMs: number;
  endExclusiveMs: number;
  startDate: string;
  endDate: string;
  label: string;
};

export type AmbassadorWeeklyAcquisitionMetrics = {
  currentWeek: AmbassadorNaturalWeek;
  previousWeek: AmbassadorNaturalWeek;
  currentAcquisitions: AmbassadorValidAcquisition[];
  previousAcquisitions: AmbassadorValidAcquisition[];
  currentCount: number;
  previousCount: number;
  delta: number;
  trend: "up" | "flat" | "down";
};

function asDate(value: Date | string | number) {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? new Date(0) : date;
}

function businessDateLabel(timestampMs: number) {
  const shifted = new Date(timestampMs + BUSINESS_TIMEZONE_OFFSET_MS);
  const year = shifted.getUTCFullYear();
  const month = String(shifted.getUTCMonth() + 1).padStart(2, "0");
  const day = String(shifted.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Resolve the Monday-Sunday natural week used by Campus Ambassador operations.
 * The campaign is a mainland-China operation, so week boundaries are fixed to
 * UTC+8 instead of inheriting the browser / CI runner timezone.
 */
export function ambassadorNaturalWeek(reference: Date | string | number = new Date()): AmbassadorNaturalWeek {
  const date = asDate(reference);
  const shifted = new Date(date.getTime() + BUSINESS_TIMEZONE_OFFSET_MS);
  const dayFromMonday = (shifted.getUTCDay() + 6) % 7;
  const localMondayUtc = Date.UTC(
    shifted.getUTCFullYear(),
    shifted.getUTCMonth(),
    shifted.getUTCDate() - dayFromMonday,
  );
  const startMs = localMondayUtc - BUSINESS_TIMEZONE_OFFSET_MS;
  const endExclusiveMs = startMs + 7 * DAY_MS;
  const startDate = businessDateLabel(startMs);
  const endDate = businessDateLabel(endExclusiveMs - DAY_MS);
  return { startMs, endExclusiveMs, startDate, endDate, label: `${startDate} — ${endDate}` };
}

export function ambassadorPreviousNaturalWeek(reference: Date | string | number = new Date()): AmbassadorNaturalWeek {
  const current = ambassadorNaturalWeek(reference);
  return ambassadorNaturalWeek(current.startMs - DAY_MS);
}

export function ambassadorAcquisitionsInWeek(
  acquisitions: AmbassadorValidAcquisition[],
  week: AmbassadorNaturalWeek,
) {
  return acquisitions.filter(item => {
    const timestamp = Date.parse(item.registeredAt);
    return Number.isFinite(timestamp) && timestamp >= week.startMs && timestamp < week.endExclusiveMs;
  });
}

export function deriveAmbassadorWeeklyAcquisitionMetrics(
  acquisitions: AmbassadorValidAcquisition[],
  reference: Date | string | number = new Date(),
): AmbassadorWeeklyAcquisitionMetrics {
  const currentWeek = ambassadorNaturalWeek(reference);
  const previousWeek = ambassadorPreviousNaturalWeek(reference);
  const currentAcquisitions = ambassadorAcquisitionsInWeek(acquisitions, currentWeek);
  const previousAcquisitions = ambassadorAcquisitionsInWeek(acquisitions, previousWeek);
  const currentCount = currentAcquisitions.length;
  const previousCount = previousAcquisitions.length;
  const delta = currentCount - previousCount;
  return {
    currentWeek,
    previousWeek,
    currentAcquisitions,
    previousAcquisitions,
    currentCount,
    previousCount,
    delta,
    trend: delta > 0 ? "up" : delta < 0 ? "down" : "flat",
  };
}

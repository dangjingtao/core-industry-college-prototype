import type { ReactNode } from "react";
import { StatusTag } from "../components/ui";

export type PC05Tone = "success" | "warning" | "danger" | "neutral" | "info";

const stateLabels: Record<string, string> = {
  active: "正常",
  frozen: "已冻结",
  pending: "待处理",
  executed: "已执行",
  trusted: "可信",
  claimed: "已领取",
  completed: "已完成",
  valid: "有效",
  archived: "已归档",
  revoked: "已撤销",
  invalid: "无效",
  registrationOpen: "报名中",
  upcoming: "即将开放",
  ended: "已结束",
  approved: "已通过",
  rejected: "已拒绝",
  confirmed: "官方已确认",
  notRequired: "无需外部确认",
  statusUnknown: "状态待回流",
  PASS: "已通过",
};

export function pc05Tone(state: string): PC05Tone {
  if (["active", "trusted", "claimed", "completed", "valid", "PASS", "executed", "approved", "confirmed"].includes(state)) return "success";
  if (["pending", "statusUnknown", "待独立评审", "archived", "upcoming", "registrationOpen"].includes(state)) return "warning";
  if (["revoked", "frozen", "invalid", "rejected"].includes(state)) return "danger";
  return "neutral";
}

export function pc05StateLabel(state: string) {
  return stateLabels[state] ?? state;
}

export function PC05Fact({ label, children }: { label: string; children: ReactNode }) {
  return <div className="rounded-control bg-surface-subtle p-3"><p className="text-xs text-text-tertiary">{label}</p><div className="mt-1 text-sm font-medium text-text-primary">{children}</div></div>;
}

export function PC05StateTag({ state }: { state: string }) {
  return <StatusTag tone={pc05Tone(state)}>{pc05StateLabel(state)}</StatusTag>;
}

import type { ReactNode } from "react";
import { StatusTag } from "../components/ui";

export type PC05Tone = "success" | "warning" | "danger" | "neutral" | "info";
export function pc05Tone(state: string): PC05Tone {
  if (["active", "trusted", "claimed", "completed", "valid", "PASS", "executed"].includes(state)) return "success";
  if (["pending", "statusUnknown", "待独立评审", "archived"].includes(state)) return "warning";
  if (["revoked", "frozen", "invalid"].includes(state)) return "danger";
  return "neutral";
}

export function PC05Fact({ label, children }: { label: string; children: ReactNode }) {
  return <div className="rounded-control bg-surface-subtle p-3"><p className="text-xs text-text-tertiary">{label}</p><div className="mt-1 text-sm font-medium text-text-primary">{children}</div></div>;
}

export function PC05StateTag({ state }: { state: string }) {
  return <StatusTag tone={pc05Tone(state)}>{state}</StatusTag>;
}

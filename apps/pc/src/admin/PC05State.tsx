import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import {
  permissionRoles,
  studentAccountSeed,
  type AccountStatus,
  type ApprovalKind,
  type ApprovalRequest,
  type AuditLogEntry,
  type OperatorRoleKey,
} from "./pc05-data";

type PC05StateValue = {
  operatorRole: OperatorRoleKey;
  accountStatus: AccountStatus;
  approvals: ApprovalRequest[];
  auditLog: AuditLogEntry[];
  setOperatorRole: (role: OperatorRoleKey) => void;
  requestAccountAction: (action: "freeze" | "unfreeze", reason: string) => boolean;
  executeApproval: (approvalId: string) => boolean;
};

const seedApprovals: ApprovalRequest[] = [
  {
    id: "approval-certificate-batch-001",
    kind: "certificateBatchRevoke",
    title: "批量撤销证书 · 演示申请",
    object: "Certificate batch · 12 items",
    applicant: "课程与证书运营",
    approver: "待超级管理员",
    reason: "签发渠道返回异常，需要按批次撤销并保留历史记录。",
    status: "pending",
    requestedAt: "2026-08-18 11:40",
  },
];

const seedAuditLog: AuditLogEntry[] = [
  {
    id: "audit-001",
    operator: "平台运营",
    time: "2026-08-18 11:18",
    object: "Application · current account × intern-1",
    before: "submitted",
    after: "statusUnknown",
    reason: "等待合作方回流，保留平台投递事实。",
  },
  {
    id: "audit-002",
    operator: "赛事运营",
    time: "2026-08-18 10:36",
    object: "CompetitionIdentity · current account × sanchuang-16",
    before: "pending",
    after: "active",
    reason: "共享 identity 状态回流；平台 registration approved 不直接替代外部官方资格。",
    approvalId: "official-sync-sanchuang-16",
  },
];

const PC05StateContext = createContext<PC05StateValue | null>(null);

function nowLabel() {
  return new Date().toLocaleString("zh-CN", { hour12: false });
}

function approvalKindFor(action: "freeze" | "unfreeze"): ApprovalKind {
  return action === "freeze" ? "accountFreeze" : "accountUnfreeze";
}

export function PC05StateProvider({ children }: { children: ReactNode }) {
  const [operatorRole, setOperatorRole] = useState<OperatorRoleKey>("operator");
  const [accountStatus, setAccountStatus] = useState<AccountStatus>(studentAccountSeed.status);
  const [approvals, setApprovals] = useState<ApprovalRequest[]>(seedApprovals);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>(seedAuditLog);

  const value = useMemo<PC05StateValue>(() => ({
    operatorRole,
    accountStatus,
    approvals,
    auditLog,
    setOperatorRole,
    requestAccountAction: (action, reason) => {
      const normalizedReason = reason.trim();
      if (!normalizedReason) return false;
      if (action === "freeze" && accountStatus === "frozen") return false;
      if (action === "unfreeze" && accountStatus === "active") return false;

      const kind = approvalKindFor(action);
      if (approvals.some(item => item.kind === kind && item.status === "pending")) return false;

      const approvalId = `approval-${kind}-${Date.now()}`;
      const nextApproval: ApprovalRequest = {
        id: approvalId,
        kind,
        title: action === "freeze" ? "学生账号冻结" : "学生账号解冻",
        object: `Account · ${studentAccountSeed.accountId}`,
        applicant: permissionRoles.find(item => item.key === operatorRole)?.label ?? "普通运营",
        approver: "待超级管理员",
        reason: normalizedReason,
        status: "pending",
        requestedAt: nowLabel(),
      };
      setApprovals(current => [nextApproval, ...current]);
      setAuditLog(current => [{
        id: `audit-request-${Date.now()}`,
        operator: permissionRoles.find(item => item.key === operatorRole)?.label ?? "普通运营",
        time: nowLabel(),
        object: nextApproval.object,
        before: accountStatus,
        after: `${accountStatus} · pendingApproval`,
        reason: normalizedReason,
        approvalId,
      }, ...current]);
      return true;
    },
    executeApproval: approvalId => {
      const role = permissionRoles.find(item => item.key === operatorRole);
      if (!role?.canExecuteHighRisk) return false;
      const approval = approvals.find(item => item.id === approvalId);
      if (!approval || approval.status !== "pending") return false;

      let before = "pending";
      let after = "executed";
      if (approval.kind === "accountFreeze") {
        before = accountStatus;
        after = "frozen";
        setAccountStatus("frozen");
      } else if (approval.kind === "accountUnfreeze") {
        before = accountStatus;
        after = "active";
        setAccountStatus("active");
      }

      setApprovals(current => current.map(item => item.id === approvalId
        ? { ...item, status: "executed", approver: role.label }
        : item));
      setAuditLog(current => [{
        id: `audit-execute-${Date.now()}`,
        operator: role.label,
        time: nowLabel(),
        object: approval.object,
        before,
        after,
        reason: approval.reason,
        approvalId,
      }, ...current]);
      return true;
    },
  }), [accountStatus, approvals, auditLog, operatorRole]);

  return <PC05StateContext.Provider value={value}>{children}</PC05StateContext.Provider>;
}

export function usePC05State() {
  const value = useContext(PC05StateContext);
  if (!value) throw new Error("PC05StateProvider missing");
  return value;
}

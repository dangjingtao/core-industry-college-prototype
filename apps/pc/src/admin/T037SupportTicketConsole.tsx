import { AlertTriangle, ArrowRight, Headphones, Paperclip, Send, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, SecondaryButton, StatusTag } from "../components/ui";

export type SupportTicketStatus = "待处理" | "处理中" | "已回复" | "已结束";

type TicketRecord = {
  id: string;
  role: "user" | "agent" | "ai";
  text: string;
  time: string;
};

type SupportTicket = {
  id: string;
  student: string;
  studentAccount: string;
  school: string;
  competitionName: string;
  track: string;
  issueType: string;
  description: string;
  attachments: string[];
  createdAt: string;
  updatedAt: string;
  status: SupportTicketStatus;
  records: TicketRecord[];
};

const ticketSeed: SupportTicket[] = [
  {
    id: "ticket-001",
    student: "李晓彤",
    studentAccount: "138****2043",
    school: "华东财经大学 · 电子商务学院",
    competitionName: "第十六届三创赛",
    track: "创业实践赛道",
    issueType: "证书与成绩",
    description: "省赛证书页面一直显示「生成中」，已经三天了，队友的证书都能下载，只有我的不行。",
    attachments: ["证书页面截图.png"],
    createdAt: "8 月 22 日 10:12",
    updatedAt: "8 月 25 日 10:20",
    status: "已回复",
    records: [
      { id: "r1-0", role: "ai", text: "智能客服已根据会话内容生成工单，自动携带账号、赛事、赛道与问题类型上下文。", time: "8 月 22 日 10:12" },
      { id: "r1-1", role: "user", text: "省赛证书页面一直显示「生成中」，已经三天了。", time: "8 月 22 日 10:12" },
      { id: "r1-2", role: "agent", text: "已核对成绩发布记录，你的证书因学校名称字段待复核被挂起，已提交补发，预计 1 个工作日内可下载。", time: "8 月 25 日 10:20" },
    ],
  },
  {
    id: "ticket-002",
    student: "陈子墨",
    studentAccount: "159****7781",
    school: "西南商贸学院 · 创新创业学院",
    competitionName: "第十六届三创赛",
    track: "创新创意赛道",
    issueType: "权益与卡券",
    description: "企业权益卡券点击兑换后没有到账，权益中心也查不到记录。",
    attachments: [],
    createdAt: "8 月 24 日 16:40",
    updatedAt: "8 月 24 日 16:40",
    status: "处理中",
    records: [
      { id: "r2-0", role: "ai", text: "智能客服已根据会话内容生成工单，自动携带账号、赛事、赛道与问题类型上下文。", time: "8 月 24 日 16:40" },
      { id: "r2-1", role: "user", text: "企业权益卡券点击兑换后没有到账。", time: "8 月 24 日 16:40" },
    ],
  },
  {
    id: "ticket-003",
    student: "王一鸣",
    studentAccount: "186****3312",
    school: "北方工业大学 · 管理学院",
    competitionName: "第十六届三创赛",
    track: "乡村振兴赛道",
    issueType: "赛事身份与团队",
    description: "队长把我移出团队后，我的赛事身份还显示在队，无法重新加入其他队伍。",
    attachments: ["团队页面截图.png", "身份卡截图.png"],
    createdAt: "8 月 25 日 09:05",
    updatedAt: "8 月 25 日 09:05",
    status: "待处理",
    records: [
      { id: "r3-0", role: "ai", text: "智能客服连续两次未匹配到知识库答案，已收集赛事、赛道与问题类型后转人工。", time: "8 月 25 日 09:05" },
      { id: "r3-1", role: "user", text: "队长把我移出团队后，我的赛事身份还显示在队。", time: "8 月 25 日 09:05" },
    ],
  },
  {
    id: "ticket-004",
    student: "赵佳宁",
    studentAccount: "137****5520",
    school: "华东财经大学 · 电子商务学院",
    competitionName: "第十五届三创赛",
    track: "电子商务赛道",
    issueType: "课程与学习记录",
    description: "课程学完了但学习记录没有更新，担心影响赛事材料。",
    attachments: [],
    createdAt: "8 月 18 日 14:22",
    updatedAt: "8 月 20 日 11:03",
    status: "已结束",
    records: [
      { id: "r4-0", role: "ai", text: "智能客服已根据会话内容生成工单。", time: "8 月 18 日 14:22" },
      { id: "r4-1", role: "user", text: "课程学完了但学习记录没有更新。", time: "8 月 18 日 14:22" },
      { id: "r4-2", role: "agent", text: "学习记录同步延迟已修复，请重新进入课程页确认。", time: "8 月 19 日 10:11" },
      { id: "r4-3", role: "user", text: "已经能看到记录了，谢谢。", time: "8 月 20 日 11:03" },
    ],
  },
];

const statusFilters: Array<{ id: "all" | SupportTicketStatus; label: string }> = [
  { id: "all", label: "全部" },
  { id: "待处理", label: "待处理" },
  { id: "处理中", label: "处理中" },
  { id: "已回复", label: "已回复" },
  { id: "已结束", label: "已结束" },
];

function statusTone(status: SupportTicketStatus): "info" | "success" | "warning" | "neutral" {
  if (status === "待处理") return "warning";
  if (status === "处理中") return "info";
  if (status === "已回复") return "success";
  return "neutral";
}

function roleLabel(role: TicketRecord["role"]) {
  if (role === "user") return "学生";
  if (role === "agent") return "人工客服";
  return "智能客服（AI）";
}

function nowLabel() {
  const date = new Date();
  return `${date.getMonth() + 1} 月 ${date.getDate()} 日 ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
}

export function T037SupportTicketConsole() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<SupportTicket[]>(ticketSeed);
  const [statusFilter, setStatusFilter] = useState<"all" | SupportTicketStatus>("all");
  const [reply, setReply] = useState("");

  const visibleTickets = useMemo(
    () => (statusFilter === "all" ? tickets : tickets.filter(item => item.status === statusFilter)),
    [tickets, statusFilter],
  );
  const selected = tickets.find(item => item.id === ticketId) ?? visibleTickets[0] ?? tickets[0];
  const pendingCount = tickets.filter(item => item.status === "待处理").length;

  const select = (id: string) => {
    setReply("");
    navigate(`/admin/support/${id}`);
  };

  const patch = (id: string, updater: (ticket: SupportTicket) => SupportTicket) => {
    setTickets(current => current.map(item => (item.id === id ? updater(item) : item)));
  };

  const submitReply = () => {
    const text = reply.trim();
    if (!selected || !text) return;
    const time = nowLabel();
    patch(selected.id, ticket => ({
      ...ticket,
      status: "已回复",
      updatedAt: time,
      records: [...ticket.records, { id: `${ticket.id}-a-${ticket.records.length}`, role: "agent", text, time }],
    }));
    setReply("");
  };

  const markProcessing = () => {
    if (!selected) return;
    patch(selected.id, ticket => ({ ...ticket, status: "处理中", updatedAt: nowLabel() }));
  };

  const closeTicket = () => {
    if (!selected) return;
    const time = nowLabel();
    patch(selected.id, ticket => ({
      ...ticket,
      status: "已结束",
      updatedAt: time,
      records: [...ticket.records, { id: `${ticket.id}-close-${ticket.records.length}`, role: "agent", text: "人工客服已关闭本工单。如仍有问题可在智能客服中重新提交。", time }],
    }));
  };

  return <div className="space-y-6" data-testid="t037-support-tickets">
    <section className="rounded-container border border-border-subtle bg-surface p-5 lg:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-text-brand"><Headphones size={18} aria-hidden="true" /><p className="text-xs font-semibold">T037 · 客服工单工作台</p></div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">客服工单</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">
            学生侧由智能客服先做知识库分流，无法解决时才生成工单。这里只做「看懂上下文 → 回复 → 推进状态 → 关闭」，不做 SLA 考核、客服绩效与多级客服组织。
          </p>
        </div>
        <div className="flex flex-wrap gap-2" aria-label="工单状态筛选">
          {statusFilters.map(filter => (
            <button
              key={filter.id}
              type="button"
              data-testid={`t037-filter-${filter.id}`}
              aria-pressed={statusFilter === filter.id}
              onClick={() => setStatusFilter(filter.id)}
              className={`min-h-9 rounded-control px-3 text-xs font-semibold ${statusFilter === filter.id ? "bg-primary-container text-text-brand" : "border border-border-subtle text-text-secondary hover:bg-surface-subtle"}`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>
      {pendingCount > 0 && (
        <div className="mt-4 flex items-start gap-2 rounded-control bg-warning-bg p-3 text-xs leading-5 text-warning-text" data-testid="t037-pending-hint">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
          <span>{pendingCount} 个工单仍为「待处理」，学生侧显示为等待人工受理，请先受理再回复。</span>
        </div>
      )}
    </section>

    <section className="rounded-container border border-border-subtle bg-surface" aria-label="工单列表">
      <div className="border-b border-border-subtle p-4">
        <h2 className="font-semibold">工单列表</h2>
        <p className="mt-1 text-xs text-text-tertiary">按用户、赛事、赛道与问题类型定位；点击行进入右侧处理详情。</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-[880px] w-full text-left text-xs">
          <thead className="bg-surface-subtle">
            <tr>{["用户", "赛事", "赛道", "问题类型", "提交时间", "状态", ""].map((label, index) => <th key={label || index} className="p-3">{label}</th>)}</tr>
          </thead>
          <tbody>
            {visibleTickets.map(ticket => (
              <tr
                key={ticket.id}
                data-testid={`t037-row-${ticket.id}`}
                className={`cursor-pointer border-t border-border-subtle hover:bg-surface-subtle ${selected?.id === ticket.id ? "bg-primary-container/40" : ""}`}
                onClick={() => select(ticket.id)}
              >
                <td className="p-3"><p className="font-semibold text-text-primary">{ticket.student}</p><p className="mt-0.5 text-text-tertiary">{ticket.studentAccount}</p></td>
                <td className="p-3">{ticket.competitionName}</td>
                <td className="p-3">{ticket.track}</td>
                <td className="p-3">{ticket.issueType}</td>
                <td className="p-3 text-text-secondary">{ticket.createdAt}</td>
                <td className="p-3"><StatusTag tone={statusTone(ticket.status)}>{ticket.status}</StatusTag></td>
                <td className="p-3 text-text-brand"><ArrowRight size={14} aria-hidden="true" /></td>
              </tr>
            ))}
            {visibleTickets.length === 0 && (
              <tr><td colSpan={7} className="p-6 text-center text-text-secondary" data-testid="t037-empty">该状态下暂无工单。</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>

    {selected && (
      <section className="grid gap-6 xl:grid-cols-[1.05fr_.95fr]" data-testid="t037-detail">
        <div className="space-y-4">
          <div className="rounded-container border border-border-subtle bg-surface">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border-subtle p-4">
              <div>
                <h2 className="font-semibold">{selected.issueType}</h2>
                <p className="mt-1 text-xs text-text-tertiary">{selected.id} · 提交于 {selected.createdAt} · 最近更新 {selected.updatedAt}</p>
              </div>
              <StatusTag tone={statusTone(selected.status)}>{selected.status}</StatusTag>
            </div>
            <dl className="grid gap-3 p-4 text-xs sm:grid-cols-2">
              <div><dt className="text-text-tertiary">用户</dt><dd className="mt-1 font-semibold text-text-primary">{selected.student} · {selected.studentAccount}</dd></div>
              <div><dt className="text-text-tertiary">学校 / 学院</dt><dd className="mt-1 text-text-secondary">{selected.school}</dd></div>
              <div><dt className="text-text-tertiary">赛事</dt><dd className="mt-1 text-text-secondary">{selected.competitionName}</dd></div>
              <div><dt className="text-text-tertiary">赛道</dt><dd className="mt-1 text-text-secondary">{selected.track}</dd></div>
            </dl>
            <div className="border-t border-border-subtle p-4">
              <p className="text-xs font-semibold text-text-tertiary">问题描述</p>
              <p className="mt-2 text-sm leading-6 text-text-secondary">{selected.description}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {selected.attachments.length === 0
                  ? <span className="text-xs text-text-tertiary">未上传截图附件。</span>
                  : selected.attachments.map(name => (
                    <span key={name} className="inline-flex items-center gap-1 rounded-control bg-surface-subtle px-2 py-1 text-xs text-text-secondary">
                      <Paperclip size={12} aria-hidden="true" />{name}
                    </span>
                  ))}
              </div>
            </div>
          </div>

          <div className="rounded-container border border-info bg-info-bg p-4">
            <div className="flex gap-3">
              <ShieldCheck size={18} className="mt-0.5 shrink-0 text-info-text" aria-hidden="true" />
              <p className="text-xs leading-6 text-info-text">
                回复会以「人工客服」身份出现在学生侧工单详情，并复用个人中心消息通知，不新建第二套消息体系。智能客服的自动应答在记录中始终标注为「智能客服（AI）」，不冒充人工。
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-container border border-border-subtle bg-surface">
          <div className="border-b border-border-subtle p-4">
            <h2 className="font-semibold">历史处理记录</h2>
            <p className="mt-1 text-xs text-text-tertiary">与学生侧看到的是同一条时间线。</p>
          </div>
          <div className="divide-y divide-border-subtle">
            {selected.records.map(record => (
              <article key={record.id} className="p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusTag tone={record.role === "agent" ? "success" : record.role === "ai" ? "info" : "neutral"}>{roleLabel(record.role)}</StatusTag>
                  <span className="text-[11px] text-text-tertiary">{record.time}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-text-secondary">{record.text}</p>
              </article>
            ))}
          </div>

          {selected.status === "已结束" ? (
            <div className="border-t border-border-subtle p-4 text-xs leading-6 text-text-secondary" data-testid="t037-closed">
              工单已结束，学生侧不再显示补充入口；如需继续跟进，学生可在智能客服中重新提交工单。
            </div>
          ) : (
            <div className="border-t border-border-subtle p-4">
              <label className="text-xs font-semibold text-text-tertiary" htmlFor="t037-reply">回复学生</label>
              <textarea
                id="t037-reply"
                data-testid="t037-reply"
                value={reply}
                onChange={event => setReply(event.target.value)}
                rows={4}
                placeholder="写明结论与下一步动作，避免只回复「已收到」。"
                className="mt-2 w-full rounded-control border border-border-subtle bg-surface-subtle p-3 text-sm text-text-primary outline-none focus:border-primary"
              />
              <div className="mt-3 flex flex-wrap gap-2">
                <Button data-testid="t037-reply-submit" onClick={submitReply} disabled={reply.trim().length === 0} className="inline-flex items-center gap-1">
                  <Send size={14} aria-hidden="true" />发送回复
                </Button>
                <SecondaryButton data-testid="t037-mark-processing" onClick={markProcessing} disabled={selected.status === "处理中"}>
                  标记处理中
                </SecondaryButton>
                <button
                  type="button"
                  data-testid="t037-close"
                  onClick={closeTicket}
                  className="min-h-touch rounded-control border border-border-subtle px-4 text-sm font-medium text-text-secondary hover:bg-surface-subtle"
                >
                  关闭工单
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    )}
  </div>;
}

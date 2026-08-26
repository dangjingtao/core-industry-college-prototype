import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Bell, ChevronRight, Headphones, ImagePlus, Info, Paperclip, Ticket } from "lucide-react";
import { Button, Card, GhostButton, PageHeader, PublicShell, SecondaryButton, Section, StatusTag } from "../../components/ui";
import { ticketStatusTone, useSupport, type SupportTicket, type SupportTicketStatus } from "./SupportPages";

const filters: Array<{ id: "all" | SupportTicketStatus; label: string }> = [
  { id: "all", label: "全部" },
  { id: "待处理", label: "待处理" },
  { id: "处理中", label: "处理中" },
  { id: "已回复", label: "已回复" },
  { id: "已结束", label: "已结束" },
];

export function SupportTicketsPage() {
  const { tickets, unreadTicketCount } = useSupport();
  const [filter, setFilter] = useState<"all" | SupportTicketStatus>("all");
  const visible = filter === "all" ? tickets : tickets.filter(item => item.status === filter);

  return (
    <PublicShell showNavigation={false}>
      <PageHeader title="客服工单" backTo="/support/chat" right={<Link to="/support/chat" aria-label="返回智能客服" className="flex size-9 items-center justify-center rounded-full text-text-primary"><Headphones size={20} aria-hidden="true" /></Link>} />
      <div className="space-y-4 px-4 py-4" data-testid="support-ticket-list">
        <Card className="flex items-start gap-3 border border-border-subtle">
          <span className="mt-0.5 text-text-brand"><Bell size={18} aria-hidden="true" /></span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-text-primary">人工回复会在消息通知中提醒</p>
            <p className="mt-1 text-xs leading-5 text-text-secondary">
              {unreadTicketCount > 0 ? `当前有 ${unreadTicketCount} 条未读回复，可进入工单查看处理记录并确认是否已解决。` : "工单没有未读回复。人工客服处理后会同步到「我的」消息通知。"}
            </p>
            <Link to="/me/notifications" className="mt-2 inline-flex text-xs font-medium text-text-brand">查看消息通知</Link>
          </div>
        </Card>

        <div className="flex flex-wrap gap-2">
          {filters.map(item => (
            <button key={item.id} data-testid={`support-ticket-filter-${item.id}`} aria-pressed={filter === item.id} onClick={() => setFilter(item.id)} className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${filter === item.id ? "bg-primary text-on-primary" : "bg-surface text-text-secondary"}`}>{item.label}</button>
          ))}
        </div>

        {visible.length === 0 ? (
          <Card className="py-8 text-center">
            <p className="text-base font-semibold text-text-primary">没有该状态的工单</p>
            <p className="mt-2 text-sm text-text-secondary">在智能客服会话中未解决时，可以转人工并生成工单。</p>
            <Button className="mt-4" onClick={() => setFilter("all")}>查看全部工单</Button>
          </Card>
        ) : (
          <Section title="我的工单" subtitle="按最近更新排序">
            {visible.map(ticket => <TicketRow key={ticket.id} ticket={ticket} />)}
          </Section>
        )}
      </div>
    </PublicShell>
  );
}

function TicketRow({ ticket }: { ticket: SupportTicket }) {
  const latest = ticket.records[ticket.records.length - 1];
  return (
    <Link to={`/support/tickets/${ticket.id}`} className="block" data-testid={`support-ticket-row-${ticket.id}`}>
      <Card interactive className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-semibold text-text-primary">{ticket.issueType}</p>
              {ticket.unread && <span aria-label="有未读回复" className="size-2 shrink-0 rounded-full bg-danger" />}
            </div>
            <p className="mt-1 truncate text-xs text-text-tertiary">{ticket.competitionName} · {ticket.track}</p>
          </div>
          <StatusTag tone={ticketStatusTone(ticket.status)}>{ticket.status}</StatusTag>
        </div>
        <p className="line-clamp-2 text-xs leading-5 text-text-secondary">{latest?.text ?? ticket.description}</p>
        <div className="flex items-center justify-between gap-2 text-xs text-text-tertiary">
          <span>{ticket.id} · 更新于 {ticket.updatedAt}</span>
          <ChevronRight size={14} aria-hidden="true" />
        </div>
      </Card>
    </Link>
  );
}

export function SupportTicketDetailPage() {
  const { ticketId } = useParams();
  const { tickets, markTicketRead, simulateTicketReply, addTicketSupplement, confirmTicketResolved } = useSupport();
  const ticket = tickets.find(item => item.id === ticketId);
  const [supplement, setSupplement] = useState("");

  useEffect(() => {
    if (ticket?.unread) markTicketRead(ticket.id);
  }, [ticket?.id, ticket?.unread, markTicketRead]);

  if (!ticket) {
    return (
      <PublicShell showNavigation={false}>
        <PageHeader title="工单详情" backTo="/support/tickets" />
        <div className="px-4 py-6">
          <Card className="py-8 text-center" data-testid="support-ticket-missing">
            <p className="text-base font-semibold text-text-primary">工单不存在或已被清理</p>
            <p className="mt-2 text-sm text-text-secondary">原型内工单不做持久化，刷新后新建工单会丢失。</p>
            <Link to="/support/tickets" className="mt-4 inline-flex"><Button>返回工单列表</Button></Link>
          </Card>
        </div>
      </PublicShell>
    );
  }

  const closed = ticket.status === "已结束";

  return (
    <PublicShell showNavigation={false}>
      <PageHeader title="工单详情" backTo="/support/tickets" />
      <div className="space-y-4 px-4 py-4" data-testid="support-ticket-detail">
        <Card className="space-y-3 border border-border-subtle">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-base font-semibold text-text-primary">{ticket.issueType}</p>
              <p className="mt-1 text-xs text-text-tertiary">{ticket.id} · 提交于 {ticket.createdAt}</p>
            </div>
            <StatusTag tone={ticketStatusTone(ticket.status)}>{ticket.status}</StatusTag>
          </div>
          <dl className="space-y-1.5 text-xs">
            <div className="flex gap-2"><dt className="w-16 shrink-0 text-text-tertiary">赛事</dt><dd className="text-text-primary">{ticket.competitionName}</dd></div>
            <div className="flex gap-2"><dt className="w-16 shrink-0 text-text-tertiary">赛道</dt><dd className="text-text-primary">{ticket.track}</dd></div>
            <div className="flex gap-2"><dt className="w-16 shrink-0 text-text-tertiary">最近更新</dt><dd className="text-text-primary">{ticket.updatedAt}</dd></div>
          </dl>
        </Card>

        <Section title="问题描述">
          <Card className="space-y-3">
            <p className="text-sm leading-6 text-text-primary">{ticket.description}</p>
            {ticket.attachments.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {ticket.attachments.map(file => (
                  <span key={file} className="flex items-center gap-1 rounded-control bg-surface-subtle px-3 py-2 text-xs text-text-secondary"><Paperclip size={12} aria-hidden="true" />{file}</span>
                ))}
              </div>
            )}
          </Card>
        </Section>

        <Section title="处理记录" subtitle="人工客服与你的往来记录">
          <div className="space-y-2">
            {ticket.records.map(record => (
              <Card key={record.id} className={record.role === "user" ? "border border-border-subtle bg-primary-container" : ""}>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-medium text-text-primary">{record.role === "user" ? "我" : record.role === "agent" ? "人工客服" : "智能客服（AI）"}</p>
                  <p className="text-xs text-text-tertiary">{record.time}</p>
                </div>
                <p className="mt-1.5 text-sm leading-6 text-text-secondary">{record.text}</p>
              </Card>
            ))}
          </div>
        </Section>

        {closed ? (
          <Card className="flex items-start gap-3 border border-border-subtle" data-testid="support-ticket-closed">
            <span className="mt-0.5 text-text-brand"><Info size={18} aria-hidden="true" /></span>
            <div>
              <p className="text-sm font-medium text-text-primary">工单已结束</p>
              <p className="mt-1 text-xs leading-5 text-text-secondary">如果问题再次出现，可以回到智能客服重新发起会话并生成新工单。</p>
              <Link to="/support/chat" className="mt-2 inline-flex text-xs font-medium text-text-brand">返回智能客服</Link>
            </div>
          </Card>
        ) : (
          <Section title="补充与确认">
            <Card className="space-y-3">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-text-primary">补充说明</span>
                <textarea value={supplement} onChange={event => setSupplement(event.target.value)} data-testid="support-ticket-supplement" className="min-h-24 w-full rounded-control border border-border bg-surface p-3 text-sm text-text-primary outline-none placeholder:text-text-tertiary focus:border-primary" placeholder="补充截图说明、订单号或复现步骤。" />
              </label>
              <div className="flex items-center gap-2 text-xs text-text-tertiary"><ImagePlus size={14} aria-hidden="true" />原型中截图上传为模拟能力。</div>
              <Button className="w-full" data-testid="support-ticket-supplement-submit" disabled={!supplement.trim()} onClick={() => { addTicketSupplement(ticket.id, supplement); setSupplement(""); }}>提交补充</Button>
              {ticket.status === "已回复" ? (
                <SecondaryButton className="w-full" data-testid="support-ticket-resolve" onClick={() => confirmTicketResolved(ticket.id)}>问题已解决，结束工单</SecondaryButton>
              ) : (
                <GhostButton className="w-full" data-testid="support-ticket-simulate-reply" onClick={() => simulateTicketReply(ticket.id)}>模拟人工回复（原型演示）</GhostButton>
              )}
            </Card>
          </Section>
        )}

        <Link to="/support/chat" className="flex items-center justify-between rounded-container bg-surface px-4 py-3 text-sm text-text-primary">
          <span className="flex items-center gap-2"><Ticket size={16} className="text-text-brand" aria-hidden="true" />回到智能客服继续提问</span>
          <ChevronRight size={16} className="text-text-tertiary" aria-hidden="true" />
        </Link>
      </div>
    </PublicShell>
  );
}

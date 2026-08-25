import { Bell, CheckCircle2, MessageCircle } from "lucide-react";
import { Card, PageHeader, PublicShell, StatusTag } from "../../components/ui";

const messages = [
  {
    id: "ticket-001",
    title: "关于证书下载问题的回复",
    body: "你的证书已经重新生成，请进入证书中心查看。",
    status: "客服已回复",
    time: "今天 10:20",
  },
  {
    id: "ticket-002",
    title: "权益兑换问题",
    body: "客服正在处理中，请耐心等待。",
    status: "处理中",
    time: "昨天 16:40",
  },
];

export function CustomerServiceMessagesPage() {
  return (
    <PublicShell showNavigation={false}>
      <PageHeader title="客服消息" backTo="/me" />
      <div className="space-y-4 px-4 py-5">
        <Card className="flex items-center gap-3 p-4">
          <Bell className="text-text-brand" size={20} />
          <div>
            <p className="font-medium text-text-primary">客服回复会在这里提醒</p>
            <p className="text-sm text-text-secondary">查看工单处理进度和客服消息。</p>
          </div>
        </Card>

        {messages.map((message) => (
          <Card key={message.id} className="space-y-3 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex gap-3">
                <MessageCircle className="mt-1 text-text-brand" size={18} />
                <div>
                  <p className="font-medium text-text-primary">{message.title}</p>
                  <p className="mt-1 text-sm text-text-secondary">{message.body}</p>
                </div>
              </div>
              <StatusTag tone="info">{message.status}</StatusTag>
            </div>
            <div className="flex items-center gap-2 text-xs text-text-tertiary">
              <CheckCircle2 size={14} />
              {message.time}
            </div>
          </Card>
        ))}
      </div>
    </PublicShell>
  );
}

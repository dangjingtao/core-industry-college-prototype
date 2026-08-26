import { MessageCircle } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSupport } from "./SupportPages";

export function CustomerServiceBubble() {
  const navigate = useNavigate();
  const location = useLocation();
  const { unreadTicketCount } = useSupport();
  const unread = unreadTicketCount > 0;
  const hidden = location.pathname.startsWith("/support/chat") || location.pathname.startsWith("/support/tickets");

  if (hidden) return null;

  return (
    <div className="fixed inset-x-0 bottom-20 z-40 mx-auto flex max-w-md justify-end px-4 pointer-events-none">
      <button
        type="button"
        data-testid="support-bubble"
        aria-label={unread ? `联系客服，有 ${unreadTicketCount} 条未读工单回复` : "联系客服"}
        onClick={() => navigate(unread ? "/support/tickets" : "/support/chat")}
        className="pointer-events-auto relative flex size-14 items-center justify-center rounded-full bg-primary text-on-primary shadow-floating transition active:scale-95"
      >
        <MessageCircle size={26} aria-hidden="true" />
        {unread && (
          <span
            aria-hidden="true"
            className="absolute right-0.5 top-0.5 size-3 rounded-full border-2 border-surface bg-danger"
          />
        )}
      </button>
    </div>
  );
}

import { MessageCircle } from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export function CustomerServiceBubble() {
  const navigate = useNavigate();
  const location = useLocation();
  const [unread] = useState(true);
  const hidden = location.pathname.startsWith("/support/chat");

  if (hidden) return null;

  return (
    <div className="fixed inset-x-0 bottom-20 z-40 mx-auto flex max-w-md justify-end px-4 pointer-events-none">
      <button
        type="button"
        aria-label={unread ? "联系客服，有未读客服消息" : "联系客服"}
        onClick={() => navigate("/support/chat")}
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

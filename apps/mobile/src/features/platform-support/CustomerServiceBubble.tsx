import { MessageCircle, X } from "lucide-react";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export function CustomerServiceBubble() {
  const navigate = useNavigate();
  const location = useLocation();
  const [unread] = useState(true);
  const hidden = location.pathname.startsWith("/support/chat");

  if (hidden) return null;

  return (
    <button
      type="button"
      aria-label="联系客服"
      onClick={() => navigate("/support/chat")}
      className="fixed bottom-6 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white shadow-lg"
    >
      <MessageCircle size={24} />
      {unread && <span className="absolute right-0 top-0 h-3 w-3 rounded-full bg-danger" />}
    </button>
  );
}

import { useEffect, useId, useRef, type ReactNode, type RefObject, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import "./Dialog.css";

export type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  initialFocusRef?: RefObject<HTMLElement>;
  className?: string;
};

const focusableSelector = [
  "a[href]",
  "area[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type=hidden])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[contenteditable=true]",
  "[tabindex]:not([tabindex=\"-1\"])",
].join(",");

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = "md",
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  initialFocusRef,
  className = "",
}: DialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    restoreFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTarget = initialFocusRef?.current ?? panelRef.current?.querySelector<HTMLElement>(focusableSelector) ?? panelRef.current;
    focusTarget?.focus({ preventScroll: true });
    return () => {
      document.body.style.overflow = previousOverflow;
      restoreFocusRef.current?.focus({ preventScroll: true });
    };
  }, [initialFocusRef, open]);

  if (!open || typeof document === "undefined") return null;

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape" && closeOnEscape) {
      event.stopPropagation();
      onOpenChange(false);
      return;
    }
    if (event.key !== "Tab" || !panelRef.current) return;
    const focusable = Array.from(panelRef.current.querySelectorAll<HTMLElement>(focusableSelector));
    if (focusable.length === 0) {
      event.preventDefault();
      panelRef.current.focus();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return createPortal(
    <div className="core-dialog-backdrop" role="presentation" onMouseDown={event => {
      if (closeOnOverlayClick && event.target === event.currentTarget) onOpenChange(false);
    }}>
      <div
        ref={panelRef}
        className={`core-dialog-panel core-dialog-panel-${size} ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
      >
        <div className="core-dialog-header">
          <div className="core-dialog-heading">
            <h2 id={titleId} className="core-dialog-title">{title}</h2>
            {description && <p id={descriptionId} className="core-dialog-description">{description}</p>}
          </div>
          {showCloseButton && <button type="button" className="core-dialog-close" aria-label="关闭弹窗" onClick={() => onOpenChange(false)}><X aria-hidden="true" size={20} strokeWidth={2} /></button>}
        </div>
        {children && <div className="core-dialog-content">{children}</div>}
        {footer && <div className="core-dialog-footer">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}

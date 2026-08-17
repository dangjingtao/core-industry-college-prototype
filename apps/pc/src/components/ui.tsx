import type { ButtonHTMLAttributes, ReactNode } from "react";

export function Button({ className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`min-h-touch rounded-control bg-primary px-4 text-sm font-medium text-on-primary transition active:bg-primary-pressed disabled:cursor-not-allowed disabled:bg-[var(--color-disabled)] disabled:text-[var(--color-text-disabled)] ${className}`} {...props} />;
}

export function SecondaryButton({ className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`min-h-touch rounded-control bg-[var(--color-secondary)] px-4 text-sm font-medium text-text-brand transition active:bg-[var(--color-secondary-hover)] disabled:cursor-not-allowed disabled:bg-[var(--color-disabled)] disabled:text-[var(--color-text-disabled)] ${className}`} {...props} />;
}

export function StatusTag({ tone = "info", children }: { tone?: "info" | "success" | "warning" | "danger" | "neutral"; children: ReactNode }) {
  const toneClass = tone === "success" ? "bg-success-bg text-success-text" : tone === "warning" ? "bg-warning-bg text-warning-text" : tone === "danger" ? "bg-danger-bg text-danger-text" : tone === "neutral" ? "bg-surface-subtle text-text-secondary" : "bg-info-bg text-info-text";
  return <span className={`inline-flex min-h-6 items-center rounded-full px-2 text-xs font-medium ${toneClass}`}>{children}</span>;
}

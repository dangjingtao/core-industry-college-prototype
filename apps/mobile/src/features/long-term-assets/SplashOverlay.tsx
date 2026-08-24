import { useEffect, useState } from "react";
import { Megaphone, Sparkles } from "lucide-react";

/**
 * T040 广告位③：开屏广告（欢迎页前置，会话内只出现一次）
 *
 * 体现方式：
 * - 挂载在 `/welcome` 之前，作为全屏开屏覆盖层；
 * - 带「广告」标识 + 倒计时进度 + 可跳过（3s 后可跳，5s 自动进入欢迎页）；
 * - 用 sessionStorage 记录「本会话已看过开屏」，避免原型演示时每次刷新都弹；
 * - 关键动线（注册回流 returnTo / 赛事 handoff / 邀请码 code 等）进入时跳过，不打断用户流程。
 *
 * 素材：静态品牌全屏占位（可替换为真实广告主物料）。
 */

const SPLASH_KEY = "core.splash.seen-session";
const SPLASH_DURATION = 5;
const SPLASH_SKIP_AFTER = 3;

/** 关键动线参数命中时跳过开屏，避免打断登录回流 / handoff / 邀请码认领 */
export function shouldSkipSplash(search: string) {
  const params = new URLSearchParams(search);
  if (params.get("returnTo")) return true;
  if (params.get("handoff")) return true;
  if (params.get("competitionId")) return true;
  if (params.get("code")) return true;
  if (params.get("source")) return true;
  return false;
}

export function useSplashGate(search: string) {
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // SSR / 无 window 环境直接跳过
    if (typeof window === "undefined") return;
    // 关键动线跳过
    if (shouldSkipSplash(search)) {
      setVisible(false);
      setReady(true);
      return;
    }
    // 会话内已看过，直接跳过
    let seen = false;
    try {
      seen = window.sessionStorage.getItem(SPLASH_KEY) === "1";
    } catch {
      seen = false;
    }
    if (seen) {
      setVisible(false);
      setReady(true);
      return;
    }
    try {
      window.sessionStorage.setItem(SPLASH_KEY, "1");
    } catch {
      // 会话存储不可用时仍正常展示，不阻断
    }
    setVisible(true);
    setReady(true);
  }, [search]);

  const dismiss = () => setVisible(false);
  /** 手动重放开屏（欢迎页左下角演示按钮），不受会话记忆与动线跳过限制 */
  const replay = () => setVisible(true);
  return { visible, ready, dismiss, replay };
}

export function SplashOverlay({ onDone }: { onDone: () => void }) {
  const [remaining, setRemaining] = useState(SPLASH_DURATION);

  useEffect(() => {
    setRemaining(SPLASH_DURATION);
    const timer = window.setInterval(() => {
      setRemaining(current => {
        if (current <= 1) {
          window.clearInterval(timer);
          onDone();
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [onDone]);

  const canSkip = remaining <= SPLASH_DURATION - SPLASH_SKIP_AFTER;
  const progress = ((SPLASH_DURATION - remaining) / SPLASH_DURATION) * 100;

  return (
    <div className="fixed inset-0 z-[80] flex flex-col bg-gradient-to-br from-[#6f4bc2] to-[#2b6de0] text-white" role="dialog" aria-modal="true" aria-label="开屏广告">
      <div className="flex items-center justify-between px-4 pt-4">
        <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium">
          <Megaphone size={13} aria-hidden="true" />广告
        </span>
        <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium">
          <Sparkles size={13} aria-hidden="true" />核心产业学院
        </span>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
        <span className="flex size-28 items-center justify-center rounded-[32px] bg-white/15 shadow-lg">
          <Sparkles size={56} aria-hidden="true" />
        </span>
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-white/60">示例品牌 · 开学季</p>
          <h2 className="text-2xl font-semibold leading-8">新学期 · 从一场比赛开始</h2>
          <p className="text-sm leading-5 text-white/75">核心产业学院 · 三创赛与长期成长平台</p>
        </div>
      </div>

      <div className="px-4 pb-8">
        <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-white/20">
          <div className="h-full rounded-full bg-white transition-all duration-1000 ease-linear" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-white/80">{remaining > 0 ? `${remaining}s 后进入` : "即将进入…"}</span>
          <button
            type="button"
            disabled={!canSkip}
            onClick={onDone}
            className="min-h-touch rounded-control bg-white px-5 text-sm font-semibold text-black transition disabled:opacity-40"
          >
            跳过{!canSkip ? ` (${SPLASH_SKIP_AFTER}s)` : ""}
          </button>
        </div>
        <p className="mt-3 text-center text-[11px] leading-4 text-white/40">原型演示开屏广告 · 仅会话内出现一次 · 深链/回流动线自动跳过</p>
      </div>
    </div>
  );
}

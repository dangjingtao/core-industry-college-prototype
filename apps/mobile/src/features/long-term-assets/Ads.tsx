import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Megaphone, Play, X } from "lucide-react";
import { Card, StatusTag } from "../../components/ui";

/**
 * T038 广告位 · 中保真原型
 * 广告位 A：激励视频（领取前置）
 * 广告位 B：权益详情页信息流
 *
 * 约束：
 * - 广告需带明显「广告」标识，不伪装成官方内容或权益；
 * - 可跳过、有时限；跳过即放弃本次领取；
 * - 广告播放失败 / 无填充时提供降级：直接进入领取成功（见 onFallbackClaim）；
 * - 均为原型占位物料，不接入真实广告 SDK。
 */

export type RewardedAdPlacement = {
  id: string;
  advertiser: string;
  title: string;
  tagline: string;
  cta: string;
  /** tailwind 渐变类，用于模拟广告主视觉 */
  accent: string;
};

export const mockRewardedAds: RewardedAdPlacement[] = [
  {
    id: "ad-demo-01",
    advertiser: "示例品牌 · 创业训练营",
    title: "大学生创业训练营 2026 秋季班",
    tagline: "14 天商战模拟 · 导师 1v1 陪跑 · 结营直通赛事项目辅导",
    cta: "立即报名",
    accent: "from-[#6f4bc2] to-[#2b6de0]",
  },
  {
    id: "ad-demo-02",
    advertiser: "示例品牌 · 校园招聘季",
    title: "秋招季 · 名企实习双选会",
    tagline: "本地名企实习专场，简历直达 HR，现场面谈",
    cta: "查看岗位",
    accent: "from-[#e0447c] to-[#f59e0b]",
  },
];

function pickAd(ads: RewardedAdPlacement[], seed: string) {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  return ads[hash % ads.length];
}

/**
 * 广告位 A：激励视频广告（全屏覆盖层）
 * 点击「领取」后弹出，播放（模拟倒计时）完成才发放；跳过则放弃本次领取。
 */
export function RewardedVideoAd({
  open,
  ad,
  durationSec = 5,
  skipAfterSec = 3,
  onComplete,
  onClose,
}: {
  open: boolean;
  ad: RewardedAdPlacement;
  durationSec?: number;
  skipAfterSec?: number;
  onComplete: () => void;
  onClose: () => void;
}) {
  const [remaining, setRemaining] = useState(durationSec);
  const completedRef = useRef(false);

  useEffect(() => {
    if (!open) return;
    setRemaining(durationSec);
    completedRef.current = false;
    const timer = window.setInterval(() => {
      setRemaining(current => {
        if (current <= 1) {
          window.clearInterval(timer);
          if (!completedRef.current) {
            completedRef.current = true;
            onComplete();
          }
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [open, durationSec, onComplete]);

  if (!open) return null;
  const canSkip = remaining <= durationSec - skipAfterSec;
  const progress = ((durationSec - remaining) / durationSec) * 100;

  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-black" role="dialog" aria-modal="true" aria-label="激励视频广告">
      <div className="flex items-center justify-between px-4 pt-4">
        <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium text-white">
          <Megaphone size={13} aria-hidden="true" />广告
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="关闭广告"
          className="flex size-9 items-center justify-center rounded-full bg-white/15 text-white transition active:bg-white/25"
        >
          <X size={18} aria-hidden="true" />
        </button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
        <div className={`flex size-24 items-center justify-center rounded-[28px] bg-gradient-to-br ${ad.accent} text-white shadow-lg`}>
          <Play size={40} fill="currentColor" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-white/60">{ad.advertiser}</p>
          <h2 className="text-xl font-semibold leading-7 text-white">{ad.title}</h2>
          <p className="text-sm leading-5 text-white/70">{ad.tagline}</p>
        </div>
      </div>

      <div className="px-4 pb-8">
        <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-white/15">
          <div className="h-full rounded-full bg-white transition-all duration-1000 ease-linear" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-white/70">{remaining > 0 ? `${remaining}s 后自动领取成功` : "即将领取成功…"}</span>
          <button
            type="button"
            disabled={!canSkip}
            onClick={onClose}
            className="min-h-touch rounded-control bg-white px-5 text-sm font-semibold text-black transition disabled:opacity-40"
          >
            跳过{!canSkip ? ` (${durationSec - skipAfterSec}s)` : ""}
          </button>
        </div>
        <p className="mt-3 text-center text-[11px] leading-4 text-white/40">原型演示广告：看完后展示领取成功；跳过则放弃本次领取。</p>
      </div>
    </div>
  );
}

/**
 * 广告位 B：信息流广告卡片（权益详情页底部）
 */
export function InfoFeedAdCard({ ad, seed }: { ad: RewardedAdPlacement; seed: string }) {
  return (
    <Card className="overflow-hidden border border-border-subtle p-0" data-testid="info-feed-ad">
      <div className="flex items-center gap-1.5 px-4 pt-3">
        <StatusTag tone="neutral">广告</StatusTag>
        <span className="text-xs text-text-tertiary">{ad.advertiser}</span>
      </div>
      <div className="px-4 py-3">
        <div className="flex items-start gap-3">
          <span className={`flex size-11 shrink-0 items-center justify-center rounded-[14px] bg-gradient-to-br ${ad.accent} text-white`}>
            <Megaphone size={20} aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-text-primary">{ad.title}</h3>
            <p className="mt-1 text-xs leading-5 text-text-secondary">{ad.tagline}</p>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => window.open("https://example.com/demo-ad", "_blank", "noopener,noreferrer")}
            className="flex min-h-touch items-center gap-1 rounded-control bg-primary px-4 text-sm font-semibold text-on-primary"
          >
            {ad.cta}
            <ArrowUpRight size={15} aria-hidden="true" />
          </button>
          <span className="text-[11px] text-text-tertiary">种子 {seed.slice(0, 4)}</span>
        </div>
      </div>
    </Card>
  );
}

/** 权益详情页底部信息流：取一条示例物料 */
export function useInfoFeedAd(seed: string) {
  return pickAd(mockRewardedAds, seed);
}

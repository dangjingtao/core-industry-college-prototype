import { ArrowRight, Home, Sparkles, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { PC10AIBeautyCup } from "./admin/PC10AIBeautyCup";

export function AIBeautyCupLanding() {
  return (
    <div className="min-h-screen bg-[#FFF9FC] text-[#38242F]">
      <header className="sticky top-0 z-30 border-b border-[#EBDCE5] bg-white/95 backdrop-blur">
        <div className="mx-auto flex min-h-16 max-w-[1480px] items-center justify-between gap-4 px-5 lg:px-8">
          <Link to="/ai-beauty-cup" className="flex min-w-0 items-center gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#431731] text-white shadow-sm">
              <Sparkles size={19} aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[#38242F] sm:text-base">湾区 AI 美妆新零售核心杯</p>
              <p className="mt-0.5 truncate text-xs font-medium tracking-[0.08em] text-[#A54A78]">AI BEAUTY · NEW RETAIL</p>
            </div>
          </Link>

          <nav className="flex items-center gap-1 sm:gap-2" aria-label="赛事首页导航">
            <a href="#competition-overview" className="hidden min-h-10 items-center rounded-xl px-3 text-sm font-medium text-[#745D69] transition hover:bg-[#FFF1F6] sm:inline-flex">赛事概览</a>
            <a href="#performance" className="hidden min-h-10 items-center rounded-xl px-3 text-sm font-medium text-[#745D69] transition hover:bg-[#FFF1F6] md:inline-flex">营销实绩</a>
            <Link to="/" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#E5CDD9] bg-white px-3 text-sm font-semibold text-[#674050] transition hover:bg-[#FFF5F9]">
              <Home size={15} aria-hidden="true" />核心产业学院
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <div className="border-b border-[#F0E3EA] bg-gradient-to-b from-[#FFF7FB] to-[#FFF9FC]">
          <div className="mx-auto flex max-w-[1480px] flex-wrap items-center justify-between gap-3 px-5 py-3 text-xs lg:px-8">
            <div className="inline-flex items-center gap-2 font-semibold text-[#8D3A66]"><Trophy size={14} />核心产业学院 · 重点赛事专属首页</div>
            <div className="flex items-center gap-2 text-[#927887]"><span className="size-2 rounded-full bg-[#C64E87]" />2026 · 报名中</div>
          </div>
        </div>

        <div id="competition-overview" className="mx-auto max-w-[1480px] px-5 py-6 lg:px-8 lg:py-8">
          <PC10AIBeautyCup />
        </div>

        <section className="border-t border-[#EBDCE5] bg-[#431731] text-white">
          <div className="mx-auto flex max-w-[1480px] flex-col gap-5 px-5 py-8 sm:flex-row sm:items-center sm:justify-between lg:px-8">
            <div>
              <p className="text-sm font-semibold">湾区 AI 美妆新零售核心杯</p>
              <p className="mt-1 text-xs text-white/60">AI 美妆 · 新零售实战 · 学生成长</p>
            </div>
            <Link to="/" className="inline-flex min-h-10 items-center gap-2 self-start rounded-xl bg-white/10 px-4 text-sm font-semibold text-white transition hover:bg-white/15 sm:self-auto">
              返回核心产业学院<ArrowRight size={15} />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

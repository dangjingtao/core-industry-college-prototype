import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Download,
  Radio,
  ShoppingBag,
  Sparkles,
  Trophy,
  UsersRound,
  Video,
} from "lucide-react";
import { Link } from "react-router-dom";

const overviewItems = [
  { label: "报名团队", value: "128 支", detail: "较昨日 +12", icon: UsersRound },
  { label: "当前赛程", value: "区域初赛报名中", detail: "下一节点：材料确认", icon: CalendarDays },
  { label: "营销实绩", value: "¥268,400", detail: "GMV · 实时归集", icon: BarChart3 },
  { label: "排名 / 成绩", value: "待官方公布", detail: "初赛结束后发布", icon: Trophy },
] as const;

const dataEntries = [
  { label: "订单", value: "1,842 笔", icon: ShoppingBag },
  { label: "直播", value: "36 场", icon: Radio },
  { label: "视频", value: "214 条", icon: Video },
] as const;

export function PC10AIBeautyCup() {
  return (
    <div data-testid="pc10-ai-beauty-home" className="space-y-8">
      <style>{`
        .ai-beauty-grid {
          background-image:
            linear-gradient(rgba(122,36,87,.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(118,87,213,.03) 1px, transparent 1px);
          background-size: 30px 30px;
        }
      `}</style>

      <section className="relative overflow-hidden rounded-[28px] border border-[#E9D7E2] bg-[#FFF9FC] shadow-[0_18px_60px_rgba(67,23,49,0.07)]">
        <div className="ai-beauty-grid absolute inset-0" aria-hidden="true" />
        <div className="pointer-events-none absolute -right-24 -top-28 size-[380px] rounded-full bg-[#EEDBFF] blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-28 left-[24%] size-[320px] rounded-full bg-[#FFE3EF] blur-3xl" aria-hidden="true" />

        <div className="relative grid gap-8 p-6 xl:grid-cols-[1.2fr_.8fr] xl:p-8">
          <div className="flex min-h-[290px] flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#E7C6D8] bg-white/80 px-3 py-1.5 text-xs font-semibold text-[#A42E6B]">
                <Sparkles size={14} />重点赛事专区 · 2026
              </div>
              <h1 className="mt-5 max-w-3xl text-3xl font-semibold leading-tight tracking-[-0.03em] text-[#3C2030] lg:text-4xl">
                粤港澳大湾区AI美妆核心杯
              </h1>
              <p className="mt-2 text-sm font-semibold tracking-[0.16em] text-[#B2437B]">AI BEAUTY · NEW RETAIL</p>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-[#715C68]">
                聚焦 AI 美妆与新零售真实业务场景，连接赛事报名、团队协作、院校审核与营销实战数据。
              </p>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link to="/registration-portal/start" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#7A2457] px-5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(122,36,87,.18)] transition hover:bg-[#681C49]">
                立即报名<ArrowRight size={16} />
              </Link>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#8E7182]"><CheckCircle2 size={14} className="text-[#C64E87]" />AI 美妆</span>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#8E7182]"><CheckCircle2 size={14} className="text-[#7657D5]" />新零售实战</span>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#8E7182]"><CheckCircle2 size={14} className="text-[#C64E87]" />营销数据归集</span>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[22px] bg-[#431731] p-6 text-white shadow-[0_20px_50px_rgba(67,23,49,.18)]">
            <div className="pointer-events-none absolute right-[-24px] top-[-24px] size-48 rounded-full border border-white/10" aria-hidden="true" />
            <div className="pointer-events-none absolute bottom-[-45px] right-[-14px] text-[180px] font-black leading-none text-white/[0.035]" aria-hidden="true">AI</div>
            <div className="relative flex h-full min-h-[250px] flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/85">当前赛事</span>
                  <span className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/70">报名中</span>
                </div>
                <p className="mt-8 text-xs font-medium text-white/55">当前阶段</p>
                <h2 className="mt-2 text-2xl font-semibold">区域初赛报名</h2>
                <p className="mt-3 text-sm leading-6 text-white/68">完成团队报名与材料确认后，进入项目诊断与运营验证阶段。</p>
              </div>
              <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
                <div><p className="text-xs text-white/45">下一节点</p><p className="mt-1 text-sm font-semibold">材料确认</p></div>
                <div className="text-right"><p className="text-xs text-white/45">成绩状态</p><p className="mt-1 text-sm font-semibold">待公布</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="competition-summary-title">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-[#A7336F]">赛事概览</p>
            <h2 id="competition-summary-title" className="mt-1 text-xl font-semibold text-[#3E2A35]">赛事进行中</h2>
          </div>
          <p className="hidden text-xs text-[#9B8490] md:block">数据为原型演示</p>
        </div>

        <div className="overflow-hidden rounded-[22px] border border-[#EADCE4] bg-white shadow-[0_12px_40px_rgba(67,23,49,.04)]">
          <div className="grid sm:grid-cols-2 xl:grid-cols-4">
            {overviewItems.map(({ label, value, detail, icon: Icon }, index) => (
              <div key={label} className={`p-5 ${index > 0 ? "border-t border-[#F0E5EB] sm:border-l sm:border-t-0" : ""} ${index === 2 ? "sm:border-t xl:border-t-0" : ""}`}>
                <div className="flex items-center gap-2 text-xs font-medium text-[#947C89]"><Icon size={15} className="text-[#B43E75]" />{label}</div>
                <p className="mt-3 text-lg font-semibold tracking-tight text-[#3E2A35]">{value}</p>
                <p className="mt-1 text-xs text-[#A08D97]">{detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="performance" className="grid gap-5 xl:grid-cols-[.9fr_1.1fr]">
        <article className="rounded-[22px] bg-[#FFF4F8] p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-[#AA3C70]">当前赛程</p>
              <h2 className="mt-2 text-xl font-semibold text-[#3E2A35]">区域初赛报名中</h2>
            </div>
            <span className="grid size-10 place-items-center rounded-full bg-white text-[#B43E75]"><CalendarDays size={18} /></span>
          </div>
          <div className="mt-6 space-y-4 text-sm">
            <div className="flex items-center justify-between gap-4 border-b border-[#ECDDE4] pb-4"><span className="text-[#9A8490]">报名团队</span><strong className="text-[#47333E]">128 支</strong></div>
            <div className="flex items-center justify-between gap-4 border-b border-[#ECDDE4] pb-4"><span className="text-[#9A8490]">下一节点</span><strong className="text-[#47333E]">材料确认</strong></div>
            <div className="flex items-center justify-between gap-4"><span className="text-[#9A8490]">成绩</span><strong className="text-[#47333E]">待官方公布</strong></div>
          </div>
          <Link to="/registration-portal/start" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-[#8E2D62] shadow-sm transition hover:shadow-md">
            查看报名进度<ArrowRight size={15} />
          </Link>
        </article>

        <article className="rounded-[22px] bg-[#F8F5FF] p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-[#7657D5]">营销实战</p>
              <h2 className="mt-2 text-xl font-semibold text-[#3E2A35]">¥268,400 GMV</h2>
              <p className="mt-2 text-xs text-[#8D8195]">订单、直播与视频数据统一归集。</p>
            </div>
            <button type="button" className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-white px-3 text-xs font-semibold text-[#6A50BE] shadow-sm">
              <Download size={15} />导出数据
            </button>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {dataEntries.map(({ label, value, icon: Icon }) => (
              <button key={label} type="button" className="flex min-h-20 items-center gap-3 rounded-2xl bg-white px-4 text-left transition hover:shadow-sm">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#F0EBFF] text-[#7657D5]"><Icon size={17} /></span>
                <span><span className="block text-xs text-[#95899C]">{label}</span><strong className="mt-1 block text-sm text-[#46394D]">{value}</strong></span>
              </button>
            ))}
          </div>

          <button type="button" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#7657D5] px-5 text-sm font-semibold text-white transition hover:bg-[#6547C1]">
            查看营销实绩<ArrowRight size={16} />
          </button>
        </article>
      </section>
    </div>
  );
}

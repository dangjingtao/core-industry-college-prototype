import {
  ArrowRight,
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  FileText,
  Megaphone,
  Sparkles,
  Trophy,
} from "lucide-react";
import { Link } from "react-router-dom";

const stages = [
  { label: "赛事报名", period: "8月—9月", detail: "完成团队报名、参赛资料与院校确认。", status: "current" },
  { label: "区域初赛", period: "10月", detail: "围绕 AI 美妆创新方案与新零售实践进行阶段展示。", status: "upcoming" },
  { label: "实战验证", period: "11月", detail: "进入项目实践、内容传播与经营验证阶段。", status: "upcoming" },
  { label: "总决赛", period: "12月", detail: "完成最终路演、评审与赛事成果发布。", status: "upcoming" },
] as const;

const guideItems = [
  { title: "参赛指南", detail: "报名条件、团队要求与材料说明", icon: BookOpenCheck },
  { title: "赛事规则", detail: "赛程安排、评审方式与注意事项", icon: FileText },
  { title: "赛事动态", detail: "通知、活动安排与重要时间更新", icon: Megaphone },
] as const;

export function PC10AIBeautyCup() {
  return (
    <div data-testid="pc10-ai-beauty-home" className="space-y-12">
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

        <div className="relative grid gap-8 p-6 xl:grid-cols-[1.18fr_.82fr] xl:p-9">
          <div className="flex min-h-[300px] flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#E7C6D8] bg-white/80 px-3 py-1.5 text-xs font-semibold text-[#A42E6B]">
                <Sparkles size={14} />重点赛事专区 · 2026
              </div>
              <h1 className="mt-5 max-w-3xl text-3xl font-semibold leading-tight tracking-[-0.03em] text-[#3C2030] lg:text-5xl">
                粤港澳大湾区AI美妆核心杯
              </h1>
              <p className="mt-3 text-sm font-semibold tracking-[0.16em] text-[#B2437B]">AI BEAUTY · NEW RETAIL</p>
              <p className="mt-6 max-w-2xl text-sm leading-7 text-[#715C68] lg:text-base">
                面向粤港澳大湾区高校创新团队，聚焦 AI 技术与美妆产业融合，围绕产品创新、内容营销与新零售实践展开真实赛事挑战。
              </p>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link to="/registration-portal/start" className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#7A2457] px-6 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(122,36,87,.18)] transition hover:bg-[#681C49]">
                立即报名<ArrowRight size={16} />
              </Link>
              <a href="#schedule" className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-[#DDBDCE] bg-white/80 px-5 text-sm font-semibold text-[#714055] transition hover:bg-white">
                查看赛程<CalendarDays size={16} />
              </a>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[22px] bg-[#431731] p-7 text-white shadow-[0_20px_50px_rgba(67,23,49,.18)]">
            <div className="pointer-events-none absolute right-[-24px] top-[-24px] size-48 rounded-full border border-white/10" aria-hidden="true" />
            <div className="pointer-events-none absolute bottom-[-45px] right-[-14px] text-[180px] font-black leading-none text-white/[0.035]" aria-hidden="true">AI</div>
            <div className="relative flex h-full min-h-[250px] flex-col justify-between">
              <div>
                <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/85">2026 · 报名中</span>
                <p className="mt-8 text-xs font-medium tracking-[0.12em] text-white/50">COMPETITION THEME</p>
                <h2 className="mt-3 text-2xl font-semibold leading-9">让 AI 进入真实美妆场景</h2>
                <p className="mt-3 max-w-md text-sm leading-6 text-white/68">从洞察、产品到内容与零售实践，让创意最终落到真实产业问题中。</p>
              </div>
              <div className="mt-7 flex flex-wrap gap-2 border-t border-white/10 pt-5 text-xs text-white/72">
                <span className="rounded-full bg-white/[0.07] px-3 py-1.5">AI 美妆</span>
                <span className="rounded-full bg-white/[0.07] px-3 py-1.5">品牌创新</span>
                <span className="rounded-full bg-white/[0.07] px-3 py-1.5">新零售实践</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="grid gap-8 lg:grid-cols-[.82fr_1.18fr] lg:items-start">
        <div className="max-w-md">
          <p className="text-xs font-semibold tracking-[0.12em] text-[#A7336F]">ABOUT THE CUP</p>
          <h2 className="mt-3 text-2xl font-semibold leading-tight text-[#3E2A35]">一场连接技术、产业与年轻创意的赛事</h2>
        </div>
        <div className="grid gap-5 text-sm leading-7 text-[#77646E] sm:grid-cols-2">
          <p>赛事以粤港澳大湾区美妆产业与消费市场为真实背景，鼓励参赛团队探索 AI 在产品洞察、用户体验、内容生产和零售经营中的新应用。</p>
          <p>参赛过程强调方案表达与实践验证并重。团队不仅需要提出创意，也需要展示对产业问题、目标用户和商业场景的理解。</p>
        </div>
      </section>

      <section id="schedule" className="border-y border-[#EEDFE7] py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.12em] text-[#A7336F]">SCHEDULE</p>
            <h2 className="mt-2 text-2xl font-semibold text-[#3E2A35]">赛事进程</h2>
          </div>
          <span className="text-xs text-[#9A8490]">具体日期以赛事通知为准</span>
        </div>

        <div className="mt-8 grid gap-0 md:grid-cols-4">
          {stages.map((stage, index) => (
            <div key={stage.label} className="relative border-l border-[#E9DDE3] pb-8 pl-6 last:pb-0 md:border-l-0 md:border-t md:pb-0 md:pl-0 md:pt-6">
              <span className={`absolute left-[-5px] top-0 size-[9px] rounded-full md:left-0 md:top-[-5px] ${stage.status === "current" ? "bg-[#B43E75] ring-4 ring-[#F8E3ED]" : "bg-[#D8C8D0]"}`} />
              <p className="text-xs font-semibold text-[#A38C98]">{String(index + 1).padStart(2, "0")} · {stage.period}</p>
              <h3 className="mt-2 text-base font-semibold text-[#44313B]">{stage.label}</h3>
              <p className="mt-2 max-w-[240px] text-xs leading-5 text-[#8C7782]">{stage.detail}</p>
              {stage.status === "current" && <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#A7336F]"><CheckCircle2 size={13} />当前阶段</span>}
            </div>
          ))}
        </div>
      </section>

      <section id="guide">
        <div className="mb-6">
          <p className="text-xs font-semibold tracking-[0.12em] text-[#A7336F]">INFORMATION</p>
          <h2 className="mt-2 text-2xl font-semibold text-[#3E2A35]">赛事信息</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {guideItems.map(({ title, detail, icon: Icon }) => (
            <button key={title} type="button" className="group flex min-h-32 items-start justify-between gap-5 rounded-[20px] bg-white p-5 text-left shadow-[0_10px_35px_rgba(67,23,49,.045)] ring-1 ring-[#EEE2E8] transition hover:-translate-y-0.5 hover:shadow-[0_14px_40px_rgba(67,23,49,.07)]">
              <div>
                <span className="grid size-10 place-items-center rounded-xl bg-[#FAEAF2] text-[#AA3D71]"><Icon size={18} /></span>
                <h3 className="mt-4 font-semibold text-[#44313B]">{title}</h3>
                <p className="mt-1 text-xs leading-5 text-[#927D88]">{detail}</p>
              </div>
              <ArrowRight size={16} className="mt-1 shrink-0 text-[#BDA8B2] transition group-hover:translate-x-0.5 group-hover:text-[#A7336F]" />
            </button>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-5 rounded-[24px] bg-[#F6EDF2] px-6 py-7 sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#A7336F]"><Trophy size={14} />粤港澳大湾区AI美妆核心杯</div>
          <h2 className="mt-2 text-xl font-semibold text-[#3E2A35]">准备好你的团队和创意</h2>
          <p className="mt-2 text-sm text-[#826E79]">报名开启后，可进入赛事报名门户完成团队与参赛资料提交。</p>
        </div>
        <Link to="/registration-portal/start" className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#7A2457] px-5 text-sm font-semibold text-white">
          进入报名<ArrowRight size={16} />
        </Link>
      </section>
    </div>
  );
}

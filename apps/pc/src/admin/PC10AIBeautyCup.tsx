import type { LucideIcon } from "lucide-react";
import {
  Activity,
  ArrowRight,
  Award,
  BarChart3,
  Bot,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Download,
  PackageCheck,
  Radio,
  ShoppingBag,
  Sparkles,
  Store,
  Trophy,
  UsersRound,
  Video,
} from "lucide-react";
import { Link } from "react-router-dom";

const berry = "#7A2457";
const berryDeep = "#431731";
const rose = "#C64E87";
const violet = "#7657D5";

const capabilityCards: { title: string; detail: string; icon: LucideIcon; tone: string }[] = [
  { title: "赛事服务", detail: "报名、团队、院校审核与赛事过程统一承接。", icon: Trophy, tone: "#FCEBF3" },
  { title: "AI 美妆赛道", detail: "围绕智能选品、内容生成与消费体验验证创新方案。", icon: Bot, tone: "#F0ECFF" },
  { title: "新零售实战", detail: "连接真实渠道、营销动作与第三方经营数据。", icon: Store, tone: "#FFF1F5" },
  { title: "学生成长", detail: "沉淀项目经历、团队角色、成绩与可信成果。", icon: Award, tone: "#F3EFFF" },
];

const metricCards: { label: string; value: string; detail: string; icon: LucideIcon }[] = [
  { label: "报名团队", value: "128 支", detail: "较昨日 +12", icon: UsersRound },
  { label: "当前赛程", value: "区域初赛报名中", detail: "下一节点：材料确认", icon: CalendarDays },
  { label: "营销实绩", value: "GMV ¥268,400", detail: "订单 / 直播 / 视频聚合", icon: BarChart3 },
  { label: "排名 / 成绩", value: "待官方公布", detail: "不从营销数据擅自算分", icon: Trophy },
  { label: "获奖结果", value: "等待回流", detail: "官方结果进入可信结果链", icon: PackageCheck },
];

const performanceEntries: { label: string; detail: string; icon: LucideIcon }[] = [
  { label: "订单数据", detail: "GMV / 退款 / 净额", icon: ShoppingBag },
  { label: "直播数据", detail: "观看 / 成交 / 场次", icon: Radio },
  { label: "视频数据", detail: "播放 / 互动 / 引流", icon: Video },
  { label: "数据导出", detail: "按当前统计口径导出", icon: Download },
];

function MetricCard({ label, value, detail, icon: Icon }: (typeof metricCards)[number]) {
  return (
    <article className="rounded-[18px] border border-[#EBDCE5] bg-white p-4 shadow-[0_8px_30px_rgba(67,23,49,0.04)]">
      <div className="flex items-center gap-2 text-xs font-semibold text-[#8E7182]">
        <span className="grid size-8 place-items-center rounded-xl bg-[#FBEAF3] text-[#A7336F]"><Icon size={16} /></span>
        {label}
      </div>
      <p className="mt-4 text-lg font-semibold tracking-tight text-[#38242F]">{value}</p>
      <p className="mt-1 text-xs leading-5 text-[#907C87]">{detail}</p>
    </article>
  );
}

export function PC10AIBeautyCup() {
  return (
    <div data-testid="pc10-ai-beauty-home" className="space-y-6">
      <style>{`
        .ai-beauty-grid {
          background-image:
            linear-gradient(rgba(122,36,87,.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(118,87,213,.035) 1px, transparent 1px);
          background-size: 28px 28px;
        }
      `}</style>

      <section className="relative overflow-hidden rounded-[28px] border border-[#E9D7E2] bg-[#FFF9FC] shadow-[0_20px_70px_rgba(67,23,49,0.08)]">
        <div className="ai-beauty-grid absolute inset-0" aria-hidden="true" />
        <div className="pointer-events-none absolute -right-24 -top-28 size-[380px] rounded-full bg-[#EEDBFF] blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-28 left-[28%] size-[320px] rounded-full bg-[#FFE3EF] blur-3xl" aria-hidden="true" />

        <div className="relative grid gap-8 p-6 xl:grid-cols-[1.15fr_.85fr] xl:p-8">
          <div className="flex min-h-[300px] flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#E7C6D8] bg-white/80 px-3 py-1.5 text-xs font-semibold text-[#A42E6B]">
                <Sparkles size={14} />重点赛事专区 · 2026
              </div>
              <h1 className="mt-5 max-w-3xl text-3xl font-semibold leading-tight tracking-[-0.03em] text-[#3C2030] lg:text-4xl">
                粤港澳大湾区AI美妆核心杯
              </h1>
              <p className="mt-2 text-sm font-semibold tracking-[0.16em] text-[#B2437B]">AI BEAUTY · NEW RETAIL</p>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-[#715C68]">
                聚焦 AI 美妆与新零售真实业务场景，统一承接报名、团队、院校审核、营销实绩归集与赛事结果；重点赛事体验独立，Competition / Team / Registration 仍复用平台通用真相源。
              </p>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link to="/registration-portal/start" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#7A2457] px-4 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(122,36,87,.2)] transition hover:bg-[#681C49]">
                赛事报名入口<ArrowRight size={16} />
              </Link>
              <Link to="/admin/competitions" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#DDBDCE] bg-white/80 px-4 text-sm font-semibold text-[#714055] transition hover:bg-white">
                通用赛事管理<ChevronRight size={16} />
              </Link>
              <span className="ml-1 inline-flex items-center gap-1.5 text-xs font-medium text-[#8E7182]"><CheckCircle2 size={14} className="text-[#C64E87]" />AI 美妆赛道</span>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#8E7182]"><CheckCircle2 size={14} className="text-[#7657D5]" />新零售实战</span>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[22px] bg-[#431731] p-6 text-white shadow-[0_20px_55px_rgba(67,23,49,.22)]">
            <div className="pointer-events-none absolute right-[-18px] top-[-18px] size-44 rounded-full border border-white/10" aria-hidden="true" />
            <div className="pointer-events-none absolute right-8 top-8 size-28 rounded-full bg-[#C64E87]/20 blur-2xl" aria-hidden="true" />
            <div className="pointer-events-none absolute bottom-[-40px] right-[-12px] text-[180px] font-black leading-none text-white/[0.035]" aria-hidden="true">AI</div>

            <div className="relative">
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/85">当前重点赛事</span>
                <span className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/70">报名中</span>
              </div>
              <div className="mt-7 grid size-14 place-items-center rounded-2xl bg-white/10 text-[#F9B7D5]"><Sparkles size={25} /></div>
              <h2 className="mt-5 text-2xl font-semibold">粤港澳大湾区AI美妆核心杯</h2>
              <p className="mt-3 max-w-lg text-sm leading-6 text-white/70">以 AI 技术驱动美妆产品创新与渠道增长，把真实营销表现作为赛事过程证据之一，但不替代官方评分规则。</p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white/[0.07] p-4"><p className="text-xs text-white/55">赛事服务</p><p className="mt-2 text-sm font-semibold">报名 × 审核 × 工作区</p></div>
                <div className="rounded-2xl bg-white/[0.07] p-4"><p className="text-xs text-white/55">实战证据</p><p className="mt-2 text-sm font-semibold">订单 × 直播 × 视频</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between gap-4">
          <div><p className="text-xs font-semibold text-[#A7336F]">赛事能力</p><h2 className="mt-1 text-xl font-semibold">这场比赛为什么需要独立首页</h2></div>
          <p className="hidden text-xs text-text-tertiary md:block">品牌体验独立 · 平台事实复用</p>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {capabilityCards.map(({ title, detail, icon: Icon, tone }) => (
            <article key={title} className="group rounded-[18px] border border-[#EBDCE5] bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-[0_12px_35px_rgba(67,23,49,.07)]">
              <div className="grid size-10 place-items-center rounded-xl text-[#8E2D62]" style={{ background: tone }}><Icon size={19} /></div>
              <div className="mt-4 flex items-center justify-between gap-3"><h3 className="font-semibold text-[#3E2A35]">{title}</h3><ChevronRight size={16} className="text-[#B99EAD] transition group-hover:translate-x-0.5" /></div>
              <p className="mt-2 text-xs leading-5 text-[#8D7783]">{detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3"><p className="text-xs font-semibold text-[#A7336F]">赛事概览</p><h2 className="mt-1 text-xl font-semibold">今天先看这些</h2></div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {metricCards.map(card => <MetricCard key={card.label} {...card} />)}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.08fr_.92fr]">
        <article className="overflow-hidden rounded-[22px] border border-[#EBDCE5] bg-white">
          <div className="flex items-center justify-between border-b border-[#F0E4EA] px-5 py-4">
            <div><p className="text-xs font-semibold text-[#A7336F]">当前运营对象</p><h2 className="mt-1 text-lg font-semibold text-[#3E2A35]">核心杯 · 赛事对象</h2></div>
            <Activity size={18} className="text-[#C64E87]" />
          </div>
          <div className="grid gap-0 md:grid-cols-2">
            <div className="space-y-4 p-5">
              <div><p className="text-xs text-[#A08B96]">当前赛事</p><p className="mt-1 text-sm font-semibold">粤港澳大湾区AI美妆核心杯 2026</p></div>
              <div><p className="text-xs text-[#A08B96]">当前团队</p><p className="mt-1 text-sm font-semibold">光感智妆实验室</p></div>
              <div><p className="text-xs text-[#A08B96]">赛道</p><p className="mt-1 text-sm font-semibold">AI 美妆 / 新零售实战</p></div>
            </div>
            <div className="space-y-4 border-t border-[#F0E4EA] bg-[#FFFAFC] p-5 md:border-l md:border-t-0">
              <div><p className="text-xs text-[#A08B96]">资格状态</p><p className="mt-1 inline-flex items-center gap-2 text-sm font-semibold"><CheckCircle2 size={15} className="text-[#B43874]" />平台审核通过 / 官方待确认</p></div>
              <div><p className="text-xs text-[#A08B96]">当前阶段</p><p className="mt-1 text-sm font-semibold">项目诊断与运营验证</p></div>
              <div><p className="text-xs text-[#A08B96]">数据口径</p><p className="mt-1 text-sm font-semibold">赛事 × 团队 × 阶段 × 来源</p></div>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#F0E4EA] px-5 py-4">
            <p className="text-xs text-[#8E7783]">首页只呈现关键运营状态，通用配置仍回到赛事基础设施。</p>
            <Link to="/admin/competitions" className="inline-flex min-h-10 items-center gap-1 rounded-xl border border-[#DAB8CA] px-3 text-xs font-semibold text-[#8E2D62]">查看通用赛事<ChevronRight size={14} /></Link>
          </div>
        </article>

        <article className="rounded-[22px] border border-[#E2D8F4] bg-gradient-to-br from-[#FBF8FF] to-white p-5">
          <div className="flex items-start justify-between gap-4">
            <div><p className="text-xs font-semibold text-[#7657D5]">重点运营入口</p><h2 className="mt-1 text-lg font-semibold text-[#3E2A35]">营销实绩归集</h2><p className="mt-2 max-w-xl text-xs leading-5 text-[#85758D]">把第三方订单、直播、视频放进同一统计上下文，保留来源、同步批次与原始证据范围。</p></div>
            <span className="grid size-10 place-items-center rounded-xl bg-[#EEE8FF] text-[#7657D5]"><BarChart3 size={19} /></span>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {performanceEntries.map(({ label, detail, icon: Icon }) => (
              <button key={label} type="button" className="flex min-h-16 items-center gap-3 rounded-2xl border border-[#E7DEF5] bg-white p-3 text-left transition hover:border-[#CFC0EC] hover:shadow-sm">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#F1EDFB] text-[#7657D5]"><Icon size={17} /></span>
                <span><span className="block text-sm font-semibold text-[#45394C]">{label}</span><span className="mt-0.5 block text-[11px] text-[#97899E]">{detail}</span></span>
              </button>
            ))}
          </div>
          <button type="button" className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#7657D5] px-4 text-sm font-semibold text-white transition hover:bg-[#6547C1]">
            进入营销实绩<ArrowRight size={16} />
          </button>
        </article>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-[20px] border border-[#EBDCE5] bg-[#FFF8FB] p-5 md:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4"><span className="grid size-11 place-items-center rounded-2xl bg-[#F9E4EF] text-[#B63873]"><CircleDollarSign size={21} /></span><div><p className="text-xs text-[#9A808E]">今日营销快照</p><p className="mt-1 text-lg font-semibold text-[#3E2A35]">¥268,400 GMV · 1,842 笔订单</p></div></div>
            <div className="flex gap-5 text-right"><div><p className="text-[11px] text-[#A18C97]">直播</p><p className="mt-1 text-sm font-semibold">36 场</p></div><div><p className="text-[11px] text-[#A18C97]">视频</p><p className="mt-1 text-sm font-semibold">214 条</p></div><div><p className="text-[11px] text-[#A18C97]">来源</p><p className="mt-1 text-sm font-semibold">3 个</p></div></div>
          </div>
        </article>
        <article className="rounded-[20px] p-5 text-white" style={{ background: `linear-gradient(135deg, ${berryDeep}, ${berry} 55%, ${violet})` }}>
          <p className="text-xs font-semibold text-white/65">品牌识别</p>
          <p className="mt-2 text-lg font-semibold">莓紫不是“换皮”</p>
          <p className="mt-2 text-xs leading-5 text-white/70">独立视觉只负责识别重点赛事；数据、权限与长期资产继续回归平台统一模型。</p>
        </article>
      </section>
    </div>
  );
}

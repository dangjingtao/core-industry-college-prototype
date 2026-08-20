import { ArrowRight, Award, CalendarDays, ChevronRight, FileText, Megaphone, Trophy, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";
import { SanChuangFrame } from "./SanChuangShell";

const keyFacts = [
  { label: "参赛对象", value: "全国高校在校生" },
  { label: "竞赛设置", value: "常规赛 · 实战赛" },
  { label: "组队规则", value: "3–5 人 · 可跨校" },
  { label: "报名方式", value: "官网在线报名" },
];

const tracks = [
  {
    icon: Trophy,
    name: "常规赛",
    tag: "主题赛道",
    points: ["围绕电子商务主题进行策划与创业实践", "提交项目策划书、运营数据与答辩材料", "按省域组织校级、省级、全国三级选拔"],
  },
  {
    icon: Award,
    name: "实战赛",
    tag: "产教融合",
    points: ["对接真实企业与平台，开展真实商业实战", "以经营结果、过程数据与复盘质量为核心评价", "优秀团队直接获得企业实习与合作机会"],
  },
];

const schedule = [
  { phase: "团队注册报名", range: "2025.10 — 2026.01", note: "队长注册并创建团队，成员完成账号绑定" },
  { phase: "校级选拔赛", range: "2026.03 — 2026.04", note: "由各校组织校内选拔与报名真实性审核" },
  { phase: "省级选拔赛", range: "2026.05 — 2026.06", note: "按省域组织评审，推荐优秀团队晋级国赛" },
  { phase: "全国总决赛", range: "2026.07 — 2026.08", note: "集中答辩与评审，决出全国奖项" },
];

const notices = [
  { date: "2026-01-05", tag: "报名", title: "关于第十六届三创赛团队注册报名延期的说明" },
  { date: "2025-12-20", tag: "通知", title: "第十六届全国总决赛承办单位征集公告" },
  { date: "2025-10-12", tag: "规则", title: "《竞赛规则（2025 年 10 月修订）》正式发布" },
];

function TickerBar() {
  return (
    <div className="border-b border-warning/20 bg-warning-bg text-warning-text">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-x-6 gap-y-1 px-5 py-2.5 text-xs lg:px-6">
        <span className="inline-flex items-center gap-2 font-medium">
          <Megaphone size={13} aria-hidden="true" />
          团队注册报名时间：2025年10月20日 — 2026年1月20日
        </span>
        <span className="opacity-80">校级选拔赛：2026年3月10日 — 4月10日</span>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border-subtle bg-surface">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="s3c-dotgrid absolute inset-0 opacity-[0.03]" />
        <span className="absolute -right-6 top-6 hidden select-none text-[220px] leading-none tracking-tight text-text-primary/[0.04] lg:block">三创</span>
        <div className="absolute -bottom-24 -left-24 size-[360px] rounded-full bg-primary-container blur-3xl" />
        <div className="absolute -right-24 -top-24 size-[320px] rounded-full bg-primary-container blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-[1200px] px-5 pb-14 pt-14 lg:px-6 lg:pb-20 lg:pt-20">
        <p className="s3c-fade inline-flex items-center gap-2 rounded-full border border-border-subtle bg-background px-3.5 py-1.5 text-xs font-semibold text-text-brand">
          <span className="size-1.5 rounded-full bg-primary" />
          第十六届 全国大学生电子商务“创新、创意及创业”挑战赛
        </p>

        <h1 className="s3c-fade mt-7 max-w-4xl text-[44px] font-semibold leading-[1.18] tracking-tight text-text-primary sm:text-6xl lg:text-[72px]" style={{ animationDelay: "90ms" }}>
          创新 · 创意 · 创业
          <span className="mt-1 block text-text-brand">让每一个好点子被看见</span>
        </h1>

        <p className="s3c-fade mt-7 max-w-2xl text-base leading-8 text-text-secondary sm:text-lg" style={{ animationDelay: "180ms" }}>
          面向全国高校学生的电子商务创新实践赛事。从一次真实参赛出发，连接课程、企业资源与长期成长——比赛会结束，但你的经历、成绩与作品会一直留下来。
        </p>

        <div className="s3c-fade mt-9 flex flex-wrap items-center gap-4" style={{ animationDelay: "260ms" }}>
          <Link to="/3chuang/login" className="group inline-flex min-h-12 items-center gap-2.5 rounded-control bg-primary px-6 text-sm font-semibold text-on-primary shadow-floating transition hover:opacity-90">
            <Trophy size={18} aria-hidden="true" />
            报名入口
            <ArrowRight size={16} aria-hidden="true" className="transition group-hover:translate-x-0.5" />
          </Link>
          <a href="#rules" className="inline-flex min-h-12 items-center gap-2 rounded-control border border-border bg-surface px-5 text-sm font-semibold text-text-primary transition hover:bg-surface-subtle hover:text-text-brand">
            <FileText size={17} aria-hidden="true" />
            查看竞赛规则
          </a>
        </div>

        <div className="s3c-fade mt-4 flex items-center gap-2 text-xs text-text-tertiary" style={{ animationDelay: "320ms" }}>
          <span className="inline-flex items-center gap-1.5"><UsersRound size={13} aria-hidden="true" />覆盖全国高校</span>
          <span className="size-1 rounded-full bg-border" />
          <span>常规赛 + 实战赛双线并行</span>
        </div>
      </div>

      <div className="border-t border-border-subtle">
        <div className="mx-auto grid max-w-[1200px] grid-cols-2 gap-y-6 px-5 py-7 sm:grid-cols-4 lg:px-6">
          {keyFacts.map(fact => (
            <div key={fact.label} className="pr-4">
              <p className="text-xs font-medium tracking-[0.14em] text-text-tertiary">{fact.label}</p>
              <p className="mt-1.5 text-[15px] font-semibold text-text-primary">{fact.value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SectionHeading({ index, title, en, desc }: { index: string; title: string; en: string; desc: string }) {
  return (
    <div className="flex flex-col gap-4 border-b border-border-subtle pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex items-start gap-4">
        <span className="text-2xl font-bold leading-none text-text-brand">{index}</span>
        <div>
          <p className="text-[11px] font-medium tracking-[0.22em] text-text-tertiary">{en}</p>
          <h2 className="mt-1.5 text-3xl font-semibold tracking-tight text-text-primary">{title}</h2>
        </div>
      </div>
      <p className="max-w-md text-sm leading-6 text-text-secondary">{desc}</p>
    </div>
  );
}

function RulesSection() {
  return (
    <section id="rules" className="scroll-mt-20 border-b border-border-subtle">
      <div className="mx-auto max-w-[1200px] px-5 py-16 lg:px-6 lg:py-20">
        <SectionHeading
          index="01"
          en="COMPETITION SETUP"
          title="竞赛设置"
          desc="双线并行：既保留经典的策划与创业实践赛道，也引入对接真实平台与企业资源的实战赛道。"
        />
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {tracks.map(({ icon: Icon, name, tag, points }) => (
            <article key={name} className="group rounded-container border border-border-subtle bg-surface p-7 transition hover:-translate-y-1 hover:border-border hover:shadow-floating">
              <div className="flex items-center justify-between">
                <div className="flex size-11 items-center justify-center rounded-control bg-primary-container text-text-brand">
                  <Icon size={20} aria-hidden="true" />
                </div>
                <span className="rounded-full border border-border-subtle px-2.5 py-1 text-[11px] font-medium text-text-secondary">{tag}</span>
              </div>
              <h3 className="mt-5 text-2xl font-semibold text-text-primary">{name}</h3>
              <ul className="mt-4 space-y-2.5">
                {points.map(point => (
                  <li key={point} className="flex gap-2.5 text-sm leading-6 text-text-secondary">
                    <span className="mt-2.5 size-1 shrink-0 rounded-full bg-primary" />
                    {point}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ScheduleSection() {
  return (
    <section id="schedule" className="scroll-mt-20 border-b border-border-subtle bg-surface-subtle">
      <div className="mx-auto max-w-[1200px] px-5 py-16 lg:px-6 lg:py-20">
        <div className="flex flex-col gap-4 border-b border-border-subtle pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="text-2xl font-bold leading-none text-text-brand">02</span>
            <div>
              <p className="text-[11px] font-medium tracking-[0.22em] text-text-tertiary">KEY MILESTONES</p>
              <h2 className="mt-1.5 text-3xl font-semibold tracking-tight text-text-primary">重要节点</h2>
            </div>
          </div>
          <p className="max-w-md text-sm leading-6 text-text-secondary">以官方时间窗口为准。校赛、省赛的具体时间由各承办单位在窗口内自行安排。</p>
        </div>

        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {schedule.map((item, index) => (
            <div key={item.phase} className="relative">
              <div className="flex items-center gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-full border border-text-brand bg-surface text-sm font-bold text-text-brand">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {index < schedule.length - 1 && <span className="hidden h-px flex-1 bg-border-subtle lg:block" />}
              </div>
              <p className="mt-4 text-[11px] font-medium tracking-[0.16em] text-text-tertiary">{item.range}</p>
              <h3 className="mt-1.5 text-xl font-semibold text-text-primary">{item.phase}</h3>
              <p className="mt-2 text-sm leading-6 text-text-secondary">{item.note}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function NoticeSection() {
  return (
    <section id="notice" className="scroll-mt-20 border-b border-border-subtle">
      <div className="mx-auto max-w-[1200px] px-5 py-16 lg:px-6 lg:py-20">
        <SectionHeading
          index="03"
          en="NOTICE BOARD"
          title="通知公告"
          desc="官方动态与规则说明将在此处同步。当前为演示数据，正式信息以组委会发布为准。"
        />
        <div className="mt-8 divide-y divide-border-subtle border-y border-border-subtle">
          {notices.map(item => (
            <a key={item.title} href="#notice" className="group flex flex-col gap-2 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
              <span className="flex min-w-0 items-center gap-3">
                <span className="shrink-0 rounded-control bg-primary-container px-2 py-1 text-[11px] font-semibold text-text-brand">{item.tag}</span>
                <span className="truncate text-sm font-medium text-text-primary transition group-hover:text-text-brand">{item.title}</span>
              </span>
              <span className="flex shrink-0 items-center gap-3 text-xs text-text-tertiary">
                {item.date}
                <ChevronRight size={14} className="transition group-hover:translate-x-0.5 group-hover:text-text-brand" aria-hidden="true" />
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaBand() {
  return (
    <section className="relative overflow-hidden bg-primary text-on-primary">
      <div className="s3c-dotgrid pointer-events-none absolute inset-0 opacity-[0.06]" aria-hidden="true" />
      <div className="relative mx-auto flex max-w-[1200px] flex-col items-start gap-6 px-5 py-14 sm:flex-row sm:items-center sm:justify-between lg:px-6">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.18em] opacity-80">
            <CalendarDays size={14} aria-hidden="true" />REGISTRATION OPEN
          </p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">准备好让你的好点子出发了吗？</h2>
          <p className="mt-3 max-w-xl text-sm leading-6 opacity-85">队长创建团队、队员完成账号绑定，即可开始准备校赛材料。报名入口目前为模拟环境。</p>
        </div>
        <Link to="/3chuang/login" className="group inline-flex min-h-12 shrink-0 items-center gap-2.5 rounded-control bg-surface px-6 text-sm font-bold text-text-brand transition hover:bg-surface-subtle">
          立即报名
          <ArrowRight size={16} aria-hidden="true" className="transition group-hover:translate-x-0.5" />
        </Link>
      </div>
    </section>
  );
}

export function SanChuangOfficialHome() {
  return (
    <SanChuangFrame>
      <TickerBar />
      <Hero />
      <RulesSection />
      <ScheduleSection />
      <NoticeSection />
      <CtaBand />
    </SanChuangFrame>
  );
}

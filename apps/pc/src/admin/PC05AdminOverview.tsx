import { AlertTriangle, ArrowRight, BadgeCheck, BookOpenCheck, Building2, ClipboardCheck, FileBadge2, Gift, ShieldCheck, Target, Trophy, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";
import { StatusTag } from "../components/ui";

type WorkItem = {
  title: string;
  detail: string;
  to: string;
  action: string;
  tone: "warning" | "info" | "success" | "neutral";
};

const workItems: WorkItem[] = [
  {
    title: "第十六届三创赛资格待回流",
    detail: "学校审核与官方参赛资格分开处理；当前重点是确认外部权威资格，不提前开放正式赛事工作区。",
    to: "/admin/competitions/objects/sanchuang-16",
    action: "处理赛事资格",
    tone: "warning",
  },
  {
    title: "机会投递状态待跟进",
    detail: "查看北辰美妆实习机会的投递进展，只更新已有 Application，不建立第二套候选人记录。",
    to: "/admin/opportunities/intern-1",
    action: "查看机会与投递",
    tone: "info",
  },
  {
    title: "课程、权益与证书持续运营",
    detail: "检查课程完成条件、权益履约和可信证书回流；学生个人完成结果仍由 Runtime 产生。",
    to: "/admin/pc04/courses",
    action: "进入资源运营",
    tone: "success",
  },
  {
    title: "账号治理与高风险审批",
    detail: "冻结、解冻、权限提升等操作先进入审批，并保留审计记录与学生长期资产。",
    to: "/admin/governance",
    action: "处理审批与审计",
    tone: "warning",
  },
];

const modules = [
  { title: "赛事运营", detail: "报名、学校审核、官方资格、地方节点与赛事服务。", to: "/admin/competitions", icon: Trophy },
  { title: "主体与学校", detail: "企业、学校、赛事组织方与合作机构统一维护。", to: "/admin/organizations", icon: Building2 },
  { title: "机会与投递", detail: "发布机会、圈选可解释人群、跟进 App 内真实投递。", to: "/admin/opportunities/intern-1", icon: Target },
  { title: "课程与权益", detail: "平台课程、学习完成条件、权益资格与履约。", to: "/admin/pc04/courses", icon: BookOpenCheck },
  { title: "可信证书", detail: "签发规则、外部签发回流、验真与撤销状态。", to: "/admin/pc04/certificates", icon: FileBadge2 },
  { title: "学生与长期资产", detail: "赛事身份、经历、成绩、证书和课程成果长期保留。", to: "/admin/students", icon: UsersRound },
] as const;

export function PC05AdminOverview() {
  return (
    <div className="space-y-6">
      <section className="rounded-container border border-border-subtle bg-surface p-6 lg:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-brand">运营总览</p>
            <h1 className="mt-2 text-3xl font-semibold text-text-primary">今天先处理这些业务</h1>
            <p className="mt-3 text-sm leading-6 text-text-secondary">首页只呈现当前运营动作、风险和入口。数据模型、稳定标识与跨端映射仍然保留，但默认不占据业务人员第一屏。</p>
          </div>
          <StatusTag tone="info">PC05 收口中</StatusTag>
        </div>
      </section>

      <section aria-labelledby="today-work-title">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-text-tertiary">待处理</p>
            <h2 id="today-work-title" className="mt-1 text-xl font-semibold text-text-primary">当前运营任务</h2>
          </div>
          <p className="hidden text-sm text-text-tertiary md:block">先处理异常与待确认，再进入日常配置。</p>
        </div>
        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          {workItems.map(item => (
            <Link key={item.title} to={item.to} className="group rounded-container border border-border-subtle bg-surface p-5 transition hover:-translate-y-0.5 hover:shadow-floating">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <StatusTag tone={item.tone}>{item.tone === "warning" ? "需要关注" : item.tone === "success" ? "持续运营" : "待跟进"}</StatusTag>
                  <h3 className="mt-3 text-base font-semibold text-text-primary">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-text-secondary">{item.detail}</p>
                </div>
                <ArrowRight size={18} className="mt-1 shrink-0 text-text-tertiary transition group-hover:translate-x-0.5 group-hover:text-text-brand" />
              </div>
              <p className="mt-4 text-sm font-semibold text-text-brand">{item.action}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-container border border-border-subtle bg-surface p-5 lg:p-6">
        <div className="flex items-center gap-2">
          <ClipboardCheck size={19} className="text-text-brand" />
          <h2 className="font-semibold text-text-primary">常用业务入口</h2>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {modules.map(item => {
            const Icon = item.icon;
            return (
              <Link key={item.title} to={item.to} className="group rounded-control border border-border-subtle p-4 transition hover:bg-surface-subtle">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-control bg-surface-subtle text-text-brand"><Icon size={18} /></div>
                  <div className="min-w-0"><h3 className="font-semibold text-text-primary">{item.title}</h3><p className="mt-1 text-xs leading-5 text-text-secondary">{item.detail}</p></div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-container border border-warning bg-warning-bg p-5"><AlertTriangle size={20} className="text-warning-text" /><h3 className="mt-3 font-semibold text-warning-text">高风险操作先审批</h3><p className="mt-2 text-sm leading-6 text-warning-text">账号冻结、权限提升、官方资格人工修正、批量证书操作都不能由普通运营直接执行。</p></div>
        <div className="rounded-container border border-border-subtle bg-surface p-5"><BadgeCheck size={20} className="text-text-brand" /><h3 className="mt-3 font-semibold">可信历史不随业务下架消失</h3><p className="mt-2 text-sm leading-6 text-text-secondary">赛事结束、课程下架、企业退出合作后，已产生的经历、成绩、证书和验真记录继续保留。</p></div>
        <div className="rounded-container border border-border-subtle bg-surface p-5"><Gift size={20} className="text-text-brand" /><h3 className="mt-3 font-semibold">平台服务与官方赛事分开</h3><p className="mt-2 text-sm leading-6 text-text-secondary">课程、权益、活动和创赛工坊属于核心产业学院平台服务，不包装成赛事官方能力。</p></div>
      </section>

      <details data-testid="admin-technical-details" className="rounded-container border border-border-subtle bg-surface p-5 text-sm text-text-secondary">
        <summary className="cursor-pointer font-semibold text-text-primary">系统与数据说明</summary>
        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          <div className="rounded-control bg-surface-subtle p-4"><ShieldCheck size={18} className="text-text-brand" /><p className="mt-2 font-semibold text-text-primary">真相源</p><p className="mt-1 text-xs leading-5">不复制 session、CompetitionIdentity、Application、Course Completed 等已有长期事实。</p></div>
          <div className="rounded-control bg-surface-subtle p-4"><BadgeCheck size={18} className="text-text-brand" /><p className="mt-2 font-semibold text-text-primary">稳定关联</p><p className="mt-1 text-xs leading-5">跨域关系继续使用 competitionId、organizationId、courseId 等稳定业务标识。</p></div>
          <div className="rounded-control bg-surface-subtle p-4"><ShieldCheck size={18} className="text-text-brand" /><p className="mt-2 font-semibold text-text-primary">跨端一致性</p><p className="mt-1 text-xs leading-5">平台审核、学生赛事身份与官方资格保持分层；撤销与历史保留状态跨端一致。</p></div>
        </div>
      </details>
    </div>
  );
}

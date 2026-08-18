import { ArrowRight, BookOpenCheck, Boxes, Database, FileBadge2, ShieldCheck, Sparkles, Target, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { StatusTag } from "../components/ui";

type Section = "competitions" | "resources" | "workshop" | "basicData";

const competitionRows = [
  { name: "第十六届三创赛", status: "报名中", attention: "官方资格待回流", to: "/admin/competitions/objects/sanchuang-16", tone: "warning" as const },
  { name: "2026 青年品牌创新挑战赛", status: "未开始", attention: "等待赛事开放", to: "/admin/competitions/objects/innovation-cup-2026", tone: "info" as const },
];

export function PC01OperationsConsole({ section }: { section: Section }) {
  if (section === "competitions") {
    return (
      <div className="space-y-6">
        <section className="rounded-container border border-border-subtle bg-surface p-6 lg:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-brand">赛事运营</p>
          <h1 className="mt-2 text-2xl font-semibold">赛事中心</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-text-secondary">先看赛事当前阶段、待确认事项和下一步动作。数据来源、稳定标识和对象关系放到页面下方的技术说明，不占运营第一屏。</p>
        </section>
        <section className="rounded-container border border-border-subtle bg-surface">
          <div className="border-b border-border-subtle p-4"><h2 className="font-semibold">当前赛事</h2><p className="mt-1 text-xs text-text-tertiary">优先处理待确认和异常状态。</p></div>
          <div className="divide-y divide-border-subtle">
            {competitionRows.map(item => (
              <Link key={item.name} to={item.to} className="group flex flex-wrap items-center justify-between gap-4 p-5 hover:bg-surface-subtle">
                <div><h3 className="font-semibold">{item.name}</h3><p className="mt-1 text-sm text-text-secondary">当前阶段：{item.status}</p></div>
                <div className="flex items-center gap-3"><StatusTag tone={item.tone}>{item.attention}</StatusTag><ArrowRight size={17} className="text-text-tertiary group-hover:text-text-brand" /></div>
              </Link>
            ))}
          </div>
        </section>
        <details className="rounded-container border border-border-subtle bg-surface p-5 text-sm text-text-secondary">
          <summary className="cursor-pointer font-semibold text-text-primary">赛事数据与关系说明</summary>
          <p className="mt-3 leading-6">赛事详情继续区分平台报名流程、学生赛事身份和外部官方资格；外部权威赛事优先 API 同步，文件导入作为兜底，人工修正必须留下原因与审计记录。</p>
        </details>
      </div>
    );
  }

  if (section === "resources") {
    const items = [
      { title: "机会与投递", detail: "发布机会、确认圈选范围、跟进 App 内真实 Application。", to: "/admin/opportunities/intern-1", icon: Target, tone: "info" as const },
      { title: "平台课程", detail: "维护章节、视频、小测试和完成条件。", to: "/admin/pc04/courses", icon: BookOpenCheck, tone: "success" as const },
      { title: "权益", detail: "维护个人资格与履约方式，不直接改个人领取/核销结果。", to: "/admin/pc04/benefits", icon: Boxes, tone: "warning" as const },
      { title: "可信证书", detail: "维护签发规则、签发回流和验真状态。", to: "/admin/pc04/certificates", icon: FileBadge2, tone: "success" as const },
    ];
    return (
      <div className="space-y-6">
        <section className="rounded-container border border-border-subtle bg-surface p-6 lg:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-brand">资源运营</p>
          <h1 className="mt-2 text-2xl font-semibold">资源与服务</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-text-secondary">这里回答“平台现在提供什么、谁能获得、如何履约、结果回到哪里”，而不是先展示资源模型和关系表。</p>
        </section>
        <section className="grid gap-4 md:grid-cols-2">
          {items.map(item => {
            const Icon = item.icon;
            return <Link key={item.title} to={item.to} className="group rounded-container border border-border-subtle bg-surface p-5 transition hover:-translate-y-0.5 hover:shadow-floating"><div className="flex items-start justify-between gap-3"><div className="flex size-10 items-center justify-center rounded-control bg-surface-subtle text-text-brand"><Icon size={20} /></div><StatusTag tone={item.tone}>进入运营</StatusTag></div><h2 className="mt-4 font-semibold">{item.title}</h2><p className="mt-2 text-sm leading-6 text-text-secondary">{item.detail}</p><p className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-text-brand">查看业务 <ArrowRight size={15} /></p></Link>;
          })}
        </section>
        <details className="rounded-container border border-border-subtle bg-surface p-5 text-sm text-text-secondary"><summary className="cursor-pointer font-semibold text-text-primary">资源真相源说明</summary><p className="mt-3 leading-6">平台配置负责课程、权益、机会和证书规则；个人学习、投递、领取、核销等结果继续由对应 Runtime 产生，不另建重复状态。</p></details>
      </div>
    );
  }

  if (section === "basicData") {
    const items = [
      { title: "报名学生基础数据", detail: "学生基础资料聚合入口：查看学校、专业、年级、联系方式和来源记录，具体治理回学生控制台。", to: "/admin/basic-data/students", tone: "info" as const, tag: "学生资料" },
      { title: "参赛学校基础数据", detail: "学校主体资料聚合入口：查看学校基础信息、赛事授权关系和负责人，具体维护回主体与学校。", to: "/admin/basic-data/schools", tone: "success" as const, tag: "学校主体" },
      { title: "赛事 / 赛道字典", detail: "赛事配置索引：按具体赛事查看赛道与阶段，并回赛事中心维护。", to: "/admin/basic-data/dictionaries", tone: "warning" as const, tag: "配置索引" },
      { title: "证书 / 协议模板", detail: "证书、协议、Banner 与权益规则的跨模块索引，分别回所属业务模块维护与发布。", to: "/admin/basic-data/templates", tone: "info" as const, tag: "跨域索引" },
      { title: "管理员与角色", detail: "后台账号、角色、模块权限与数据范围；普通运营不能自建。", to: "/admin/governance", tone: "danger" as const, tag: "高风险" },
      { title: "导入与批处理", detail: "Excel / CSV 兜底导入、批次管理和来源审计。", to: "/admin/basic-data/imports", tone: "neutral" as const, tag: "兜底" },
    ];
    return (
      <div className="space-y-6">
        <section className="rounded-container border border-border-subtle bg-surface p-6 lg:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-brand">基础数据</p>
          <h1 className="mt-2 text-2xl font-semibold">基础数据管理</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-text-secondary">作为跨模块维护工作台，集中找到学生资料、学校主体、赛事配置、模板规则和数据接入记录；真正业务状态继续由所属模块维护。</p>
        </section>
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map(item => (
            <Link key={item.title} to={item.to} className="group rounded-container border border-border-subtle bg-surface p-5 transition hover:-translate-y-0.5 hover:shadow-floating">
              <div className="flex items-start justify-between gap-3">
                <div className="flex size-10 items-center justify-center rounded-control bg-surface-subtle text-text-brand"><Database size={20} /></div>
                <StatusTag tone={item.tone}>{item.tag}</StatusTag>
              </div>
              <h2 className="mt-4 font-semibold">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-text-secondary">{item.detail}</p>
              <p className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-text-brand">进入模块 <ArrowRight size={15} /></p>
            </Link>
          ))}
        </section>
        <section className="rounded-container border border-info bg-info-bg p-5 text-sm text-info-text">
          <h3 className="font-semibold">基础数据管理 · 范围说明</h3>
          <p className="mt-2 leading-6">这里只提供跨模块索引、聚合查看和数据接入治理。学生、学校、赛事、证书、内容、权益和权限仍回各自业务入口维护，不在这里复制第二份业务记录。</p>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-container border border-border-subtle bg-surface p-6 lg:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-brand">赛事服务</p>
        <h1 className="mt-2 text-2xl font-semibold">创赛工坊配置</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-text-secondary">创赛工坊只在具体赛事上下文中开放。这里优先管理启用状态、服务范围和隐私边界，不把它包装成全局 AI 管理台。</p>
      </section>
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-container border border-border-subtle bg-surface p-5"><Trophy size={20} className="text-text-brand" /><h2 className="mt-3 font-semibold">当前赛事</h2><p className="mt-2 text-sm text-text-secondary">第十六届三创赛</p><Link to="/admin/competitions/objects/sanchuang-16" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-text-brand">查看赛事配置 <ArrowRight size={15} /></Link></div>
        <div className="rounded-container border border-border-subtle bg-surface p-5"><Sparkles size={20} className="text-text-brand" /><h2 className="mt-3 font-semibold">能力开放</h2><p className="mt-2 text-sm leading-6 text-text-secondary">按赛事生命周期和正式参赛资格开放，不跨赛事共享运行上下文。</p></div>
        <div className="rounded-container border border-warning bg-warning-bg p-5"><ShieldCheck size={20} className="text-warning-text" /><h2 className="mt-3 font-semibold text-warning-text">隐私边界</h2><p className="mt-2 text-sm leading-6 text-warning-text">学校审核人员默认不能查看学生在工坊里的私人回答和 AI 内容。</p></div>
      </section>
      <details className="rounded-container border border-border-subtle bg-surface p-5 text-sm text-text-secondary"><summary className="cursor-pointer font-semibold text-text-primary">工坊数据说明</summary><p className="mt-3 leading-6">Workshop 继续依附具体 competition scope 和 lifecycle，不建立跨赛事全局运行事实。</p></details>
    </div>
  );
}

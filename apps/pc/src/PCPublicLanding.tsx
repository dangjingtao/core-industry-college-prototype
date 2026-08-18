import {
  ArrowRight,
  BookOpenCheck,
  Building2,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  Trophy,
  UsersRound,
} from "lucide-react";
import { Link } from "react-router-dom";

const highlights = [
  { icon: Trophy, title: "赛事服务", detail: "承接三创赛等创新创业赛事的报名、团队、学校审核与赛事服务。" },
  { icon: BookOpenCheck, title: "产业课程", detail: "围绕真实产业场景提供课程、实践任务与长期学习成果。" },
  { icon: Building2, title: "校企资源", detail: "连接学校、企业、赛事组织方与合作机构，统一沉淀合作资源。" },
  { icon: GraduationCap, title: "学生成长", detail: "让参赛经历、课程成果、证书与实践记录在赛事结束后继续保留。" },
];

export function PCPublicLanding() {
  return (
    <div className="min-h-screen bg-background text-text-primary">
      <header className="border-b border-border-subtle bg-surface/95 backdrop-blur">
        <div className="mx-auto flex min-h-16 max-w-[1240px] items-center justify-between gap-4 px-5 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-control bg-primary text-on-primary shadow-sm">
              <Sparkles size={20} aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold">核心产业学院</p>
              <p className="text-xs text-text-tertiary">产业创新与学生成长服务平台</p>
            </div>
          </Link>
          <Link to="/admin" className="inline-flex min-h-10 items-center gap-2 rounded-control px-3 text-sm font-medium text-text-secondary hover:bg-surface-subtle hover:text-text-primary">
            管理后台
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-border-subtle bg-surface">
          <div className="pointer-events-none absolute inset-0 opacity-80" aria-hidden="true">
            <div className="absolute -right-24 -top-24 size-[420px] rounded-full bg-primary-container blur-3xl" />
            <div className="absolute -bottom-32 left-[12%] size-[360px] rounded-full bg-surface-subtle blur-3xl" />
          </div>
          <div className="relative mx-auto grid max-w-[1240px] gap-10 px-5 py-16 lg:grid-cols-[1.12fr_.88fr] lg:px-8 lg:py-24">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-background px-3 py-1.5 text-xs font-semibold text-text-brand">
                <Sparkles size={14} aria-hidden="true" />
                让赛事、产业与学生成长连接起来
              </div>
              <h1 className="mt-6 text-4xl font-semibold leading-[1.15] tracking-tight sm:text-5xl lg:text-6xl">
                核心产业学院
                <span className="mt-2 block text-text-brand">连接真实产业，沉淀真实成长</span>
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-text-secondary lg:text-lg">
                面向高校学生、学校与产业合作伙伴，承接创新创业赛事、产业课程、实践机会、权益与可信成果，让一次参赛继续连接到长期成长。
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link data-testid="landing-registration" to="/registration-portal/start" className="inline-flex min-h-12 items-center gap-2 rounded-control bg-primary px-5 text-sm font-semibold text-on-primary shadow-sm transition hover:opacity-90">
                  <Trophy size={18} aria-hidden="true" />
                  三创赛报名入口
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
                <Link data-testid="landing-admin" to="/admin" className="inline-flex min-h-12 items-center gap-2 rounded-control border border-border bg-surface px-5 text-sm font-semibold text-text-primary transition hover:bg-surface-subtle">
                  <ShieldCheck size={18} aria-hidden="true" />
                  进入管理后台
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-text-secondary">
                <span className="inline-flex items-center gap-2"><UsersRound size={16} className="text-text-brand" />学生长期成长</span>
                <span className="inline-flex items-center gap-2"><Building2 size={16} className="text-text-brand" />校企资源协同</span>
                <span className="inline-flex items-center gap-2"><ShieldCheck size={16} className="text-text-brand" />可信成果沉淀</span>
              </div>
            </div>

            <div className="self-center">
              <div className="rounded-[28px] border border-border-subtle bg-background/90 p-4 shadow-floating backdrop-blur sm:p-5">
                <div className="rounded-[22px] bg-primary p-6 text-on-primary sm:p-7">
                  <p className="text-xs font-semibold opacity-75">当前重点赛事</p>
                  <h2 className="mt-3 text-2xl font-semibold leading-9">第十六届全国大学生电子商务“创新、创意及创业”挑战赛</h2>
                  <p className="mt-4 text-sm leading-6 opacity-85">报名、团队资料、学校审核与赛事服务统一接入。</p>
                  <Link to="/registration-portal/start" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-control bg-surface px-4 text-sm font-semibold text-text-primary">
                    立即进入报名
                    <ArrowRight size={16} />
                  </Link>
                </div>
                <div className="grid gap-3 pt-4 sm:grid-cols-2">
                  <div className="rounded-container bg-surface p-4">
                    <p className="text-xs text-text-tertiary">平台服务</p>
                    <p className="mt-2 text-lg font-semibold">赛事 × 课程 × 机会</p>
                    <p className="mt-2 text-xs leading-5 text-text-secondary">不是一次性报名系统，而是持续承接学生成长。</p>
                  </div>
                  <div className="rounded-container bg-surface p-4">
                    <p className="text-xs text-text-tertiary">长期沉淀</p>
                    <p className="mt-2 text-lg font-semibold">经历 × 成果 × 证书</p>
                    <p className="mt-2 text-xs leading-5 text-text-secondary">赛事结束后，可信记录仍归属于学生长期账号。</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1240px] px-5 py-14 lg:px-8 lg:py-18">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-brand">平台能力</p>
            <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">不只服务一场比赛</h2>
            <p className="mt-3 text-sm leading-7 text-text-secondary">核心产业学院把赛事作为重要入口，同时连接课程、企业资源、实践机会与长期可信资产。</p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {highlights.map(({ icon: Icon, title, detail }) => (
              <div key={title} className="rounded-container border border-border-subtle bg-surface p-5">
                <div className="flex size-10 items-center justify-center rounded-control bg-primary-container text-text-brand"><Icon size={19} /></div>
                <h3 className="mt-4 font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-text-secondary">{detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-y border-border-subtle bg-surface">
          <div className="mx-auto grid max-w-[1240px] gap-6 px-5 py-10 lg:grid-cols-2 lg:px-8">
            <Link to="/registration-portal/start" className="group rounded-container border border-border-subtle bg-background p-6 transition hover:shadow-floating">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex size-11 items-center justify-center rounded-control bg-primary-container text-text-brand"><Trophy size={20} /></div>
                  <h2 className="mt-4 text-xl font-semibold">我是参赛学生 / 团队</h2>
                  <p className="mt-2 text-sm leading-6 text-text-secondary">进入三创赛响应式报名门户，完成报名、团队信息与后续赛事流程。</p>
                </div>
                <ArrowRight className="mt-1 text-text-tertiary transition group-hover:translate-x-1 group-hover:text-text-brand" />
              </div>
            </Link>
            <Link to="/admin" className="group rounded-container border border-border-subtle bg-background p-6 transition hover:shadow-floating">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex size-11 items-center justify-center rounded-control bg-surface-subtle text-text-brand"><ShieldCheck size={20} /></div>
                  <h2 className="mt-4 text-xl font-semibold">我是平台运营 / 管理人员</h2>
                  <p className="mt-2 text-sm leading-6 text-text-secondary">进入管理后台，处理赛事、主体、课程、权益、机会、学生与可信资产。</p>
                </div>
                <ArrowRight className="mt-1 text-text-tertiary transition group-hover:translate-x-1 group-hover:text-text-brand" />
              </div>
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-background">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-2 px-5 py-8 text-xs text-text-tertiary sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <span>核心产业学院 · 原型平台</span>
          <span>产业创新 · 校企协同 · 学生成长</span>
        </div>
      </footer>
    </div>
  );
}

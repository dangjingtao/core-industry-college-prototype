import { useState, type ReactNode } from "react";
import { Award, Bell, Check, Download, FileText, ShieldCheck, Trophy } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button, SecondaryButton, StatusTag } from "../components/ui";

const portalBase = "/registration-portal";

const navItems = [
  { label: "团队信息", to: `${portalBase}/team` },
  { label: "承诺书", to: `${portalBase}/commitment` },
  { label: "团队业绩报告", to: `${portalBase}/report` },
  { label: "证书下载", to: `${portalBase}/certificates` },
] as const;

function ResultShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex items-center justify-center gap-2 border-b border-warning/20 bg-warning-bg px-4 py-2 text-center text-sm font-medium text-warning-text">
        <Bell className="h-4 w-4" aria-hidden="true" />
        团队注册报名时间：2025年10月20日—2026年1月20日
      </div>

      <header className="border-b border-border-subtle bg-surface">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-4 lg:px-8">
          <Link to={`${portalBase}/start`} className="font-semibold text-text-primary">全国大学生电子商务“创新、创意及创业”挑战赛</Link>
          <span className="text-xs text-text-tertiary">队长 PC 报名入口</span>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1440px] gap-6 px-4 py-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:px-8">
        <aside className="hidden lg:block">
          <div className="overflow-hidden rounded-container border border-border-subtle bg-surface">
            {navItems.map(item => (
              <Link
                key={item.to}
                to={item.to}
                className={`block border-b border-border-subtle px-5 py-4 text-sm font-medium last:border-0 ${location.pathname.startsWith(item.to) ? "bg-primary-container text-text-brand" : "text-text-secondary"}`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </aside>

        <main className="min-w-0">
          <div className="mb-5">
            <h1 className="text-2xl font-semibold text-text-primary">{title}</h1>
            <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>
          </div>

          <div className="mb-5 flex gap-2 overflow-x-auto lg:hidden">
            {navItems.map(item => (
              <Link
                key={item.to}
                to={item.to}
                className={`whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium ${location.pathname.startsWith(item.to) ? "bg-primary-container text-text-brand" : "bg-surface text-text-secondary"}`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {children}
        </main>
      </div>
    </div>
  );
}

function StageCard({
  stage,
  title,
  status,
  tone,
  description,
  action,
}: {
  stage: string;
  title: string;
  status: string;
  tone: "success" | "info" | "warning" | "neutral";
  description: string;
  action?: ReactNode;
}) {
  return (
    <section className="rounded-container border border-border-subtle bg-surface p-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-text-tertiary">{stage}</span>
            <StatusTag tone={tone}>{status}</StatusTag>
          </div>
          <h2 className="mt-2 font-semibold text-text-primary">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-text-secondary">{description}</p>
        </div>
        {action}
      </div>
    </section>
  );
}

export function T031ReportPage() {
  const [claimed, setClaimed] = useState(false);
  const [stage, setStage] = useState<"school" | "province" | "national">("school");

  return (
    <ResultShell title="团队业绩报告" subtitle="报名门户内按赛事阶段领取结果报告">
      <section className="overflow-hidden rounded-container border border-border-subtle bg-surface">
        <div className="flex items-center gap-6 border-b border-border-subtle px-5 pt-4 text-sm font-medium">
          {[
            ["school", "校赛"],
            ["province", "省赛"],
            ["national", "国赛"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setStage(value as "school" | "province" | "national")}
              className={`border-b-2 pb-3 ${stage === value ? "border-primary text-text-brand" : "border-transparent text-text-secondary"}`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {stage === "school" && (
            <div className="space-y-4">
              <StageCard
                stage="校赛"
                title="第十六届三创赛 · 校赛团队业绩报告"
                status={claimed ? "已领取" : "可领取"}
                tone="success"
                description={claimed ? "报告已领取，可继续下载查看。" : "校赛结果已发布（原型示例），当前团队可以领取本阶段业绩报告。"}
                action={claimed ? <SecondaryButton><Download className="mr-2 h-4 w-4" aria-hidden="true" />下载 PDF</SecondaryButton> : <Button onClick={() => setClaimed(true)}>领取报告</Button>}
              />
              <div className="rounded-control bg-info-bg p-4 text-sm leading-6 text-info-text">
                业绩报告是赛事结果领取入口，不在这里填写摘要、上传经营数据或提交附件。
              </div>
            </div>
          )}

          {stage === "province" && (
            <StageCard
              stage="省赛"
              title="省赛团队业绩报告"
              status="待生成"
              tone="warning"
              description="当前阶段结果尚未生成，暂不提供领取操作。"
            />
          )}

          {stage === "national" && (
            <StageCard
              stage="国赛"
              title="国赛团队业绩报告"
              status="未开放"
              tone="neutral"
              description="当前团队尚未进入该阶段。"
            />
          )}
        </div>
      </section>

      <section className="mt-5 rounded-container border border-border-subtle bg-surface p-5">
        <div className="flex items-start gap-3">
          <Trophy className="mt-0.5 h-5 w-5 shrink-0 text-text-brand" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-semibold text-text-primary">晋级结果</h2>
              <StatusTag tone="warning">待公布</StatusTag>
            </div>
            <p className="mt-2 text-sm leading-6 text-text-secondary">晋级结果独立公布。报告可以领取，不代表团队已经晋级下一阶段。</p>
          </div>
        </div>
      </section>
    </ResultShell>
  );
}

export function T031CertificatesPage() {
  const [downloaded, setDownloaded] = useState(false);
  const [stage, setStage] = useState<"school" | "province">("school");

  return (
    <ResultShell title="证书下载" subtitle="报名门户内按赛事阶段查看和下载证书">
      <section className="overflow-hidden rounded-container border border-border-subtle bg-surface">
        <div className="flex items-center justify-between gap-4 border-b border-border-subtle px-5 pt-4">
          <div className="flex items-center gap-6 text-sm font-medium">
            <button
              type="button"
              onClick={() => setStage("school")}
              className={`border-b-2 pb-3 ${stage === "school" ? "border-primary text-text-brand" : "border-transparent text-text-secondary"}`}
            >
              校赛 {downloaded ? 1 : 1}
            </button>
            <button
              type="button"
              onClick={() => setStage("province")}
              className={`border-b-2 pb-3 ${stage === "province" ? "border-primary text-text-brand" : "border-transparent text-text-secondary"}`}
            >
              省赛 0
            </button>
          </div>
          <SecondaryButton className="mb-3">刷新</SecondaryButton>
        </div>

        <div className="p-5">
          {stage === "school" ? (
            <div className="space-y-4">
              <StageCard
                stage="校赛"
                title="第十六届三创赛 · 校赛电子证书"
                status={downloaded ? "已下载" : "可下载"}
                tone="success"
                description="普通电子证书独立于业绩报告和晋级结果展示。"
                action={downloaded ? <SecondaryButton disabled><Check className="mr-2 h-4 w-4" aria-hidden="true" />已下载</SecondaryButton> : <Button onClick={() => setDownloaded(true)}><Download className="mr-2 h-4 w-4" aria-hidden="true" />下载证书</Button>}
              />

              <section className="rounded-container border border-primary/30 bg-primary-container/40 p-5">
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-control bg-primary text-on-primary">
                    <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold text-text-primary">官方可信证书</h2>
                      <StatusTag tone="neutral">当前阶段未开放</StatusTag>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-text-secondary">可信证书只在赛事规定的更高阶段满足资格后出现；当前阶段不提供领取入口。</p>
                  </div>
                </div>
              </section>
            </div>
          ) : (
            <div className="py-14 text-center">
              <Award className="mx-auto h-12 w-12 text-text-tertiary" aria-hidden="true" />
              <p className="mt-4 text-sm text-text-tertiary">当前阶段暂无证书</p>
            </div>
          )}
        </div>
      </section>
    </ResultShell>
  );
}

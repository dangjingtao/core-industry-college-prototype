import { useState, type ReactNode } from "react";
import { Award, Check, Download, FileText, ShieldCheck, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { Button, SecondaryButton, StatusTag } from "../components/ui";

function ResultShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border-subtle bg-surface">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-4 px-4 py-4 lg:px-8">
          <div>
            <p className="text-xs text-text-tertiary">三创赛 · 赛事成果</p>
            <h1 className="mt-1 text-2xl font-semibold text-text-primary">{title}</h1>
            <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>
          </div>
          <Link to="/registration-portal/complete" className="text-sm font-medium text-text-brand">返回报名信息</Link>
        </div>
      </header>
      <main className="mx-auto max-w-[1100px] space-y-5 px-4 py-6 lg:px-8">{children}</main>
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

  return (
    <ResultShell title="团队业绩报告" subtitle="按赛事阶段领取由系统生成的结果报告">
      <section className="rounded-container border border-info/30 bg-info-bg p-5">
        <div className="flex gap-3">
          <FileText className="mt-0.5 h-5 w-5 shrink-0 text-info-text" aria-hidden="true" />
          <div>
            <h2 className="font-semibold text-info-text">这里是报告领取入口，不是数据上传页</h2>
            <p className="mt-1 text-sm leading-6 text-info-text">业绩报告由赛事阶段结果生成。学生不需要在这里填写摘要、上传经营数据或提交报告附件。</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-semibold text-text-primary">阶段报告</h2>
        <div className="space-y-3">
          <StageCard
            stage="校赛"
            title="第十六届三创赛 · 校赛团队业绩报告"
            status={claimed ? "已领取" : "可领取"}
            tone="success"
            description={claimed ? "报告已领取，可继续下载查看；原型示例同时表示已进入长期资产。" : "校赛结果已发布（原型示例），当前团队可以领取本阶段业绩报告。"}
            action={claimed ? <SecondaryButton><Download className="mr-2 h-4 w-4" aria-hidden="true" />下载 PDF</SecondaryButton> : <Button onClick={() => setClaimed(true)}>领取报告</Button>}
          />
          <StageCard
            stage="省赛"
            title="省赛团队业绩报告"
            status="待生成"
            tone="warning"
            description="本阶段结果尚未生成。达到对应赛事阶段后再展示可领取状态。"
          />
          <StageCard
            stage="国赛"
            title="国赛团队业绩报告"
            status="未开放"
            tone="neutral"
            description="当前团队尚未进入该阶段，不展示领取操作。"
          />
        </div>
      </section>

      <section className="rounded-container border border-border-subtle bg-surface p-5">
        <div className="flex items-start gap-3">
          <Trophy className="mt-0.5 h-5 w-5 shrink-0 text-text-brand" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-semibold text-text-primary">晋级结果</h2>
              <StatusTag tone="warning">待公布</StatusTag>
            </div>
            <p className="mt-2 text-sm leading-6 text-text-secondary">晋级结果独立公布。即使校赛业绩报告已经可以领取，也不能据此判断团队已经晋级省赛。</p>
          </div>
        </div>
      </section>
    </ResultShell>
  );
}

export function T031CertificatesPage() {
  const [downloaded, setDownloaded] = useState(false);

  return (
    <ResultShell title="证书下载" subtitle="普通电子证书与官方可信证书分开领取">
      <section>
        <div className="mb-3 flex items-center gap-2">
          <Award className="h-5 w-5 text-text-brand" aria-hidden="true" />
          <h2 className="font-semibold text-text-primary">普通电子证书</h2>
        </div>
        <div className="space-y-3">
          <StageCard
            stage="校赛"
            title="第十六届三创赛 · 校赛电子证书"
            status={downloaded ? "已下载" : "可下载"}
            tone="success"
            description={downloaded ? "证书下载完成（原型示例），可在长期资产中继续查看。" : "本阶段普通电子证书已签发（原型示例）。证书签发与业绩报告、晋级结果分别判断。"}
            action={downloaded ? <SecondaryButton disabled><Check className="mr-2 h-4 w-4" aria-hidden="true" />已下载</SecondaryButton> : <Button onClick={() => setDownloaded(true)}><Download className="mr-2 h-4 w-4" aria-hidden="true" />下载证书</Button>}
          />
          <StageCard
            stage="省赛 / 国赛"
            title="后续阶段电子证书"
            status="未签发"
            tone="neutral"
            description="只有对应阶段实际签发后才出现下载入口，不因为晋级或报告生成而提前显示。"
          />
        </div>
      </section>

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
            <p className="mt-2 text-sm leading-6 text-text-secondary">可信证书属于更高等级凭证，只在赛事规定的高阶段 / 总决赛等满足资格时开放。当前原型阶段不满足资格，因此不提供伪领取按钮。</p>
            <p className="mt-2 text-xs leading-5 text-text-tertiary">满足资格后，再进入可信凭证领取 / 验真服务；本页不提前模拟签发后台。</p>
          </div>
        </div>
      </section>
    </ResultShell>
  );
}

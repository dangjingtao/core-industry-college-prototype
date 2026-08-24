import { FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button, SecondaryButton, StatusTag } from "../components/ui";
import { RegistrationPortalProvider, useRegistrationPortal } from "./model";

function FileCard({
  title,
  description,
  downloadLabel,
  ready,
}: {
  title: string;
  description: string;
  downloadLabel: string;
  ready: boolean;
}) {
  return (
    <section className="rounded-container border border-border-subtle bg-surface p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-control bg-primary-container text-text-brand">
            <FileText className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="font-semibold text-text-primary">{title}</h2>
            <p className="mt-1 text-sm leading-6 text-text-secondary">{description}</p>
          </div>
        </div>
        <StatusTag tone={ready ? "info" : "neutral"}>{ready ? "可下载" : "待生成"}</StatusTag>
      </div>

      <div className="mt-5">
        <SecondaryButton disabled={!ready}>{downloadLabel}</SecondaryButton>
      </div>

      {ready && <p className="mt-3 text-xs leading-5 text-text-tertiary">下载后打印并完成手写签字。签字件无需上传回本系统，按赛事材料要求线下使用即可。</p>}
    </section>
  );
}

function CommitmentContent() {
  const navigate = useNavigate();
  const { commitment, generateCommitment, completeRegistration } = useRegistrationPortal();

  const finish = () => {
    if (!commitment.generated) return;
    completeRegistration();
    navigate("/registration-portal/complete");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border-subtle bg-surface">
        <div className="mx-auto max-w-[1100px] px-4 py-4 lg:px-8">
          <p className="text-xs text-text-tertiary">三创赛报名 · 学校审核通过后</p>
          <h1 className="mt-1 text-2xl font-semibold text-text-primary">承诺书</h1>
        </div>
      </header>

      <main className="mx-auto max-w-[1100px] space-y-5 px-4 py-6 lg:px-8">
        <section className="rounded-container border border-border-subtle bg-surface p-5">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <StatusTag tone="info">线下手写签字</StatusTag>
              <h2 className="mt-3 text-lg font-semibold text-text-primary">两份承诺书都保留，但无需回传系统</h2>
              <p className="mt-2 text-sm leading-6 text-text-secondary">系统根据当前报名项目生成文件。下载打印、完成手写签字后，按赛事材料要求线下使用，不需要重新上传到核心学院。</p>
            </div>
            <Button disabled={commitment.generated} onClick={generateCommitment}>{commitment.generated ? "承诺书已生成" : "生成两份承诺书"}</Button>
          </div>
        </section>

        <section className="rounded-container border border-border-subtle bg-surface p-5">
          <h2 className="font-semibold text-text-primary">项目信息</h2>
          <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div><span className="text-text-tertiary">项目标题</span><p className="mt-1 font-medium text-text-primary">{commitment.projectTitle}</p></div>
            <div><span className="text-text-tertiary">项目摘要</span><p className="mt-1 leading-6 text-text-primary">{commitment.projectSummary}</p></div>
          </div>
          <p className="mt-4 text-xs leading-5 text-text-tertiary">指导老师承诺书复用当前团队与项目信息，不要求老师重新填写一套项目资料。</p>
        </section>

        <div className="grid gap-4 lg:grid-cols-2">
          <FileCard
            title="学生 / 参赛团队承诺书"
            description="由参赛团队确认赛事规则与项目承诺。"
            downloadLabel="下载团队承诺书"
            ready={commitment.generated}
          />
          <FileCard
            title="指导老师承诺书"
            description="下载模板并由指导老师手写签字。指导老师信息可以后置补充。"
            downloadLabel="下载指导老师承诺书模板"
            ready={commitment.generated}
          />
        </div>

        <section className="rounded-container border border-border-subtle bg-surface p-5">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-semibold text-text-primary">承诺书无需在线回传</h2>
              <p className="mt-1 text-sm text-text-secondary">生成两份承诺书后即可继续完成报名；打印、签字属于线下材料环节。</p>
            </div>
            <Button disabled={!commitment.generated} onClick={finish}>完成报名</Button>
          </div>
        </section>
      </main>
    </div>
  );
}

export function T030CommitmentPage() {
  return <RegistrationPortalProvider><CommitmentContent /></RegistrationPortalProvider>;
}

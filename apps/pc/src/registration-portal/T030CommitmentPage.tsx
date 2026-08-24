import { useState } from "react";
import { Check, FileText, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button, SecondaryButton, StatusTag } from "../components/ui";
import { RegistrationPortalProvider, useRegistrationPortal } from "./model";

function FileCard({
  title,
  description,
  downloadLabel,
  ready,
  uploaded,
  onUpload,
}: {
  title: string;
  description: string;
  downloadLabel: string;
  ready: boolean;
  uploaded: boolean;
  onUpload: () => void;
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
        <StatusTag tone={uploaded ? "success" : ready ? "info" : "neutral"}>{uploaded ? "已上传" : ready ? "可下载" : "待生成"}</StatusTag>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <SecondaryButton disabled={!ready}>{downloadLabel}</SecondaryButton>
        <button
          type="button"
          disabled={!ready || uploaded}
          onClick={onUpload}
          className="inline-flex min-h-11 items-center gap-2 rounded-control border border-primary px-4 text-sm font-semibold text-text-brand disabled:cursor-not-allowed disabled:opacity-45"
        >
          {uploaded ? <Check className="h-4 w-4" aria-hidden="true" /> : <Upload className="h-4 w-4" aria-hidden="true" />}
          {uploaded ? "已上传签字文件" : "上传签字后的文件"}
        </button>
      </div>

      {ready && !uploaded && <p className="mt-3 text-xs leading-5 text-text-tertiary">请先下载并打印，完成手写签字后再上传扫描件或照片。</p>}
    </section>
  );
}

function CommitmentContent() {
  const navigate = useNavigate();
  const { commitment, generateCommitment, completeRegistration } = useRegistrationPortal();
  const [teamUploaded, setTeamUploaded] = useState(false);
  const [teacherUploaded, setTeacherUploaded] = useState(false);
  const completed = commitment.generated && teamUploaded && teacherUploaded;

  const finish = () => {
    if (!completed) return;
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
              <h2 className="mt-3 text-lg font-semibold text-text-primary">两份承诺书都需要签字后上传</h2>
              <p className="mt-2 text-sm leading-6 text-text-secondary">系统根据当前报名项目生成文件。下载打印、完成手写签字，再把签字后的文件上传回来。</p>
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
            uploaded={teamUploaded}
            onUpload={() => setTeamUploaded(true)}
          />
          <FileCard
            title="指导老师承诺书"
            description="下载模板并由指导老师手写签字。指导老师信息可以后置补充。"
            downloadLabel="下载指导老师承诺书模板"
            ready={commitment.generated}
            uploaded={teacherUploaded}
            onUpload={() => setTeacherUploaded(true)}
          />
        </div>

        <section className={`rounded-container border p-5 ${completed ? "border-success/30 bg-success-bg" : "border-border-subtle bg-surface"}`}>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className={`font-semibold ${completed ? "text-success-text" : "text-text-primary"}`}>{completed ? "两份签字文件已上传" : "等待承诺书材料完成"}</h2>
              <p className={`mt-1 text-sm ${completed ? "text-success-text" : "text-text-secondary"}`}>{completed ? "承诺书步骤已完成，可以继续完成报名。" : "学生 / 团队承诺书和指导老师承诺书缺一不可。"}</p>
            </div>
            <Button disabled={!completed} onClick={finish}>完成报名</Button>
          </div>
        </section>
      </main>
    </div>
  );
}

export function T030CommitmentPage() {
  return <RegistrationPortalProvider><CommitmentContent /></RegistrationPortalProvider>;
}

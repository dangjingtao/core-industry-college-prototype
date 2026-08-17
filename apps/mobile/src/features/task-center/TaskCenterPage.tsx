import { useMemo, useState, type ReactNode } from "react";
import { BookOpen, BriefcaseBusiness, ChevronRight, Gift, LockKeyhole, Sparkles, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PageHeader, PublicShell, StatusTag } from "../../components/ui";
import { taskById, workshopTasks } from "../competition-workspace/data";
import { nextReadyTask, taskAvailability, useWorkshopRuntime } from "../competition-workspace/runtime";
import { benefits, courses } from "../long-term-assets/data";
import { useLongTermAssets } from "../long-term-assets/store";
import { competitionById, opportunities, opportunityById } from "../public-platform/data";
import { usePublicPlatform } from "../public-platform/PublicPlatform";

type TaskCategory = "competition" | "learning" | "benefit" | "opportunity";
type TaskStatus = "todo" | "inProgress" | "completed" | "locked";
type StatusFilter = "all" | "todo" | "inProgress" | "completed";

type TaskCenterEntry = {
  id: string;
  category: TaskCategory;
  source: string;
  title: string;
  description: string;
  meta: string;
  status: TaskStatus;
  statusLabel: string;
  to: string;
  action: string;
  icon: ReactNode;
  iconClass: string;
};

const categoryOptions: { value: "all" | TaskCategory; label: string }[] = [
  { value: "all", label: "全部" },
  { value: "competition", label: "赛事" },
  { value: "learning", label: "学习" },
  { value: "benefit", label: "权益" },
  { value: "opportunity", label: "机会" },
];

const statusTone = (status: TaskStatus) => status === "completed" ? "success" as const : status === "inProgress" ? "info" as const : status === "locked" ? "neutral" as const : "warning" as const;

function workshopDestination(competitionId: string, taskId: string, status: ReturnType<typeof taskAvailability>) {
  if (status === "queued" || status === "running" || status === "failed") return `/competitions/${competitionId}/workspace/workshop/tasks/${taskId}/progress`;
  if (status === "completed") {
    const task = taskById(taskId);
    return task ? `/competitions/${competitionId}/workspace/workshop/results/${task.resultId}` : `/competitions/${competitionId}/workspace/workshop/results`;
  }
  return `/competitions/${competitionId}/workspace/workshop/tasks/${taskId}/answer`;
}

function TaskEntryCard({ entry }: { entry: TaskCenterEntry }) {
  const navigate = useNavigate();
  return <button type="button" aria-label={`${entry.source}：${entry.title}，${entry.statusLabel}`} className="flex min-h-[118px] w-full items-start gap-3 rounded-container border border-border-subtle bg-surface p-4 text-left transition active:bg-surface-pressed" onClick={() => navigate(entry.to)}>
    <span className={`flex size-10 shrink-0 items-center justify-center rounded-control ${entry.iconClass}`}>{entry.icon}</span>
    <span className="min-w-0 flex-1"><span className="flex items-center gap-2"><span className="text-xs font-medium text-text-secondary">{entry.source}</span><StatusTag tone={statusTone(entry.status)}>{entry.statusLabel}</StatusTag></span><strong className="mt-2 block text-base font-semibold leading-6 text-text-primary">{entry.title}</strong><span className="mt-1 block text-sm leading-5 text-text-secondary">{entry.description}</span><span className="mt-2 block text-xs text-text-tertiary">{entry.meta}</span></span>
    <span className="flex min-h-touch shrink-0 items-center gap-0.5 self-center text-xs font-medium text-text-brand">{entry.action}<ChevronRight size={16} aria-hidden="true" /></span>
  </button>;
}

export function TaskCenterPage() {
  const { session, identities, applications } = usePublicPlatform();
  const { getRuntime } = useWorkshopRuntime();
  const { learning, benefitStatusFor } = useLongTermAssets();
  const [category, setCategory] = useState<"all" | TaskCategory>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const entries = useMemo<TaskCenterEntry[]>(() => {
    if (!session.loggedIn) return [
      { id: "guest-competition", category: "competition", source: "赛事", title: "发现正在报名的赛事", description: "浏览公开赛事，登录后继续报名与身份回流。", meta: "公共平台", status: "todo", statusLabel: "可开始", to: "/competitions", action: "查看", icon: <Trophy size={19} aria-hidden="true" />, iconClass: "bg-[#fff2e8] text-[#c45b1b]" },
      { id: "guest-learning", category: "learning", source: "学习", title: "查看公共课程", description: "先了解课程内容，登录后保存学习进度。", meta: `${courses.length} 门课程`, status: "todo", statusLabel: "可开始", to: "/courses", action: "查看", icon: <BookOpen size={19} aria-hidden="true" />, iconClass: "bg-[#eaf5ff] text-[#2879d0]" },
      { id: "guest-benefit", category: "benefit", source: "权益", title: "查看平台与赛事权益", description: "登录后根据账号与赛事身份判断资格。", meta: "登录查看资格", status: "locked", statusLabel: "待登录", to: "/benefits", action: "查看", icon: <Gift size={19} aria-hidden="true" />, iconClass: "bg-[#fff7df] text-[#946218]" },
      { id: "guest-opportunity", category: "opportunity", source: "机会", title: "发现实习与项目", description: "浏览企业实习、校招与项目实践机会。", meta: `${opportunities.filter(item => item.status === "open").length} 个开放机会`, status: "todo", statusLabel: "可开始", to: "/opportunities", action: "查看", icon: <BriefcaseBusiness size={19} aria-hidden="true" />, iconClass: "bg-[#f3efff] text-[#6f4bc2]" },
    ];

    const result: TaskCenterEntry[] = [];
    const activeIdentity = identities.find(identity => identity.identityStatus === "active");
    const pendingIdentity = identities.find(identity => identity.identityStatus === "pending");
    const endedIdentity = identities.find(identity => identity.competitionStatus === "ended" || identity.identityStatus === "revoked");
    const activeCompetition = competitionById(activeIdentity?.competitionId);

    if (activeCompetition && activeIdentity) {
      result.push({ id: `competition-${activeCompetition.id}`, category: "competition", source: "赛事进度", title: "继续当前赛事", description: activeCompetition.name, meta: "进入赛事工作区查看阶段、团队与资料", status: "inProgress", statusLabel: "进行中", to: `/competitions/${activeCompetition.id}/workspace`, action: "继续", icon: <Trophy size={19} aria-hidden="true" />, iconClass: "bg-[#fff2e8] text-[#c45b1b]" });
      const runtime = getRuntime(activeCompetition.id);
      if (!runtime.permissionDenied && runtime.lifecycle === "inProgress") {
        const runningTask = workshopTasks.find(task => ["queued", "running", "failed"].includes(runtime.taskRuns[task.id]?.status ?? ""));
        const task = runningTask ?? nextReadyTask(runtime);
        if (task) {
          const runtimeStatus = taskAvailability(runtime, task.id);
          const failed = runtimeStatus === "failed";
          const inProgress = runtimeStatus === "queued" || runtimeStatus === "running";
          result.push({ id: `workshop-${task.id}`, category: "competition", source: "创赛工坊", title: task.title, description: task.summary, meta: `${activeCompetition.name} · ${task.skillId.toUpperCase()}`, status: inProgress ? "inProgress" : "todo", statusLabel: failed ? "需要重试" : inProgress ? "执行中" : "待开始", to: workshopDestination(activeCompetition.id, task.id, runtimeStatus), action: inProgress || failed ? "继续" : "开始", icon: <Sparkles size={19} aria-hidden="true" />, iconClass: "bg-[#e9f6f1] text-[#247456]" });
        } else {
          result.push({ id: `workshop-complete-${activeCompetition.id}`, category: "competition", source: "创赛工坊", title: "查看本轮工坊成果", description: "当前没有新的可执行任务，可以查看已经生成的成果。", meta: activeCompetition.name, status: "completed", statusLabel: "已完成", to: `/competitions/${activeCompetition.id}/workspace/workshop/results`, action: "查看", icon: <Sparkles size={19} aria-hidden="true" />, iconClass: "bg-[#e9f6f1] text-[#247456]" });
        }
      }
    } else {
      result.push({ id: "competition-discovery", category: "competition", source: "赛事", title: "选择赛事并完成报名", description: "从公开赛事中选择适合自己的比赛。", meta: "公共赛事发现", status: "todo", statusLabel: "待开始", to: "/competitions", action: "查看", icon: <Trophy size={19} aria-hidden="true" />, iconClass: "bg-[#fff2e8] text-[#c45b1b]" });
    }

    if (pendingIdentity) {
      const pendingCompetition = competitionById(pendingIdentity.competitionId);
      if (pendingCompetition) result.push({ id: `registration-${pendingCompetition.id}`, category: "competition", source: "报名审核", title: "查看赛事报名进度", description: pendingCompetition.name, meta: "等待学校审核真实性", status: "todo", statusLabel: "待审核", to: `/competitions/${pendingCompetition.id}/registration`, action: "查看", icon: <Trophy size={19} aria-hidden="true" />, iconClass: "bg-[#fff2e8] text-[#c45b1b]" });
    }

    if (endedIdentity) {
      const endedCompetition = competitionById(endedIdentity.competitionId);
      if (endedCompetition) result.push({ id: `ended-${endedCompetition.id}`, category: "competition", source: "历史赛事", title: "查看赛后长期成果", description: endedCompetition.name, meta: "经历、成绩与证书继续归长期账号", status: "completed", statusLabel: "已结束", to: `/competitions/${endedCompetition.id}/workspace`, action: "查看", icon: <Trophy size={19} aria-hidden="true" />, iconClass: "bg-[#fff2e8] text-[#c45b1b]" });
    }

    for (const record of learning) {
      const course = courses.find(item => item.id === record.courseId);
      if (!course) continue;
      const completed = record.status === "completed";
      const inProgress = record.status === "inProgress";
      result.push({ id: `learning-${course.id}`, category: "learning", source: "课程学习", title: course.title, description: course.summary, meta: completed ? "学习与考试已完成" : inProgress ? `学习进度 ${record.progress}%` : course.duration, status: completed ? "completed" : inProgress ? "inProgress" : "todo", statusLabel: completed ? "已完成" : inProgress ? `${record.progress}%` : "待开始", to: completed ? `/courses/${course.id}/achievement` : inProgress ? `/courses/${course.id}/learn` : `/courses/${course.id}`, action: completed ? "查看" : inProgress ? "继续" : "开始", icon: <BookOpen size={19} aria-hidden="true" />, iconClass: "bg-[#eaf5ff] text-[#2879d0]" });
    }

    for (const benefit of benefits) {
      const benefitStatus = benefitStatusFor(benefit.id);
      const completed = benefitStatus === "used" || benefitStatus === "expired";
      const inProgress = benefitStatus === "claimed";
      const locked = benefitStatus === "ineligible";
      result.push({ id: `benefit-${benefit.id}`, category: "benefit", source: "权益", title: benefit.title, description: benefit.summary, meta: benefit.expiresAt ? `有效期至 ${benefit.expiresAt}` : benefit.reason, status: completed ? "completed" : inProgress ? "inProgress" : locked ? "locked" : "todo", statusLabel: benefitStatus === "eligible" ? "可领取" : benefitStatus === "claimed" ? "已领取" : benefitStatus === "used" ? "已使用" : benefitStatus === "expired" ? "已过期" : "资格未满足", to: `/benefits/${benefit.id}`, action: completed ? "查看" : inProgress ? "去使用" : locked ? "查看条件" : "去领取", icon: locked ? <LockKeyhole size={18} aria-hidden="true" /> : <Gift size={19} aria-hidden="true" />, iconClass: "bg-[#fff7df] text-[#946218]" });
    }

    if (applications.length) {
      for (const application of applications) {
        const opportunity = opportunityById(application.opportunityId);
        if (!opportunity) continue;
        result.push({ id: `application-${application.opportunityId}`, category: "opportunity", source: "投递进展", title: opportunity.title, description: application.status === "submitted" ? "简历已投递，等待后续状态回流。" : "当前投递状态待外部系统回流。", meta: "长期账号投递记录", status: application.status === "submitted" ? "inProgress" : "todo", statusLabel: application.status === "submitted" ? "已投递" : "待回流", to: "/applications", action: "查看", icon: <BriefcaseBusiness size={19} aria-hidden="true" />, iconClass: "bg-[#f3efff] text-[#6f4bc2]" });
      }
    } else {
      result.push({ id: "opportunity-discovery", category: "opportunity", source: "就业准备", title: "发现实习与项目", description: "根据赛事与项目经历寻找真实实践机会。", meta: `${opportunities.filter(item => item.status === "open").length} 个开放机会`, status: "todo", statusLabel: "可开始", to: "/opportunities", action: "查看", icon: <BriefcaseBusiness size={19} aria-hidden="true" />, iconClass: "bg-[#f3efff] text-[#6f4bc2]" });
    }

    const priority: Record<TaskStatus, number> = { inProgress: 0, todo: 1, locked: 2, completed: 3 };
    return result.sort((a, b) => priority[a.status] - priority[b.status]);
  }, [applications, benefitStatusFor, getRuntime, identities, learning, session.loggedIn]);

  const statusCounts = {
    todo: entries.filter(item => item.status === "todo" || item.status === "locked").length,
    inProgress: entries.filter(item => item.status === "inProgress").length,
    completed: entries.filter(item => item.status === "completed").length,
  };
  const visibleEntries = entries.filter(item => {
    if (category !== "all" && item.category !== category) return false;
    if (statusFilter === "all") return true;
    if (statusFilter === "todo") return item.status === "todo" || item.status === "locked";
    return item.status === statusFilter;
  });

  return <PublicShell showNavigation={false}><PageHeader title="任务中心" subtitle="赛事 · 学习 · 权益 · 机会" backTo="/home" /><div className="space-y-5 px-4 py-5">
    <div className="grid grid-cols-3 overflow-hidden rounded-container border border-border-subtle bg-surface">{[
      { value: "todo" as const, label: "待处理", count: statusCounts.todo },
      { value: "inProgress" as const, label: "进行中", count: statusCounts.inProgress },
      { value: "completed" as const, label: "已完成", count: statusCounts.completed },
    ].map(item => <button key={item.value} type="button" className={`min-h-[82px] border-r border-border-subtle px-2 text-center last:border-r-0 ${statusFilter === item.value ? "bg-primary-container" : "bg-surface"}`} onClick={() => setStatusFilter(statusFilter === item.value ? "all" : item.value)}><strong className={`block text-2xl font-semibold ${statusFilter === item.value ? "text-text-brand" : "text-text-primary"}`}>{item.count}</strong><span className="mt-1 block text-xs text-text-secondary">{item.label}</span></button>)}</div>

    <div className="flex gap-2 overflow-x-auto pb-1">{categoryOptions.map(item => <button key={item.value} type="button" className={`min-h-touch shrink-0 rounded-control px-4 text-sm font-medium ${category === item.value ? "bg-primary-container text-text-brand" : "bg-surface text-text-secondary"}`} onClick={() => setCategory(item.value)}>{item.label}</button>)}</div>

    <div className="space-y-3">{visibleEntries.length ? visibleEntries.map(entry => <TaskEntryCard key={entry.id} entry={entry} />) : <div className="rounded-container border border-border-subtle bg-surface px-4 py-10 text-center"><p className="font-semibold text-text-primary">当前没有对应事项</p><p className="mt-2 text-sm text-text-secondary">切换分类或状态查看其它内容。</p></div>}</div>
  </div></PublicShell>;
}

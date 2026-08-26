import { ChevronRight, HeartHandshake, Play, Target, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { Button, Card, GhostButton, PageHeader, PublicShell, Section, SecondaryButton, StatusTag, StateBlock } from "../../components/ui";
import { useLongTermAssets } from "../long-term-assets/store";
import { usePublicPlatform } from "../public-platform/state";
import { welfareProjectById, welfareProjects, type WelfareProject, type WelfareStatus } from "./data";
import { useBadges } from "../badges/hooks";
import { badgeCatalog } from "../badges/catalog";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("zh-CN", { month: "short", day: "numeric" });
}

function welfareStatusLabel(status: WelfareStatus): [string, "success" | "info" | "neutral" | "warning"] {
  switch (status) {
    case "active": return ["进行中", "success"];
    case "upcoming": return ["即将开始", "warning"];
    case "ended": return ["已结束", "neutral"];
  }
}

function ProgressBar({ current, goal }: { current: number; goal: number }) {
  const percent = goal > 0 ? Math.min(100, Math.round((current / goal) * 100)) : 0;
  return (
    <div className="space-y-1">
      <div className="h-2 w-full overflow-hidden rounded-full bg-surface-subtle">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${percent}%` }} />
      </div>
      <div className="flex items-center justify-between text-xs text-text-secondary">
        <span>已助力 {current.toLocaleString("zh-CN")} 次</span>
        <span>目标 {goal.toLocaleString("zh-CN")} 次 · {percent}%</span>
      </div>
    </div>
  );
}

function WelfareCard({ project, current }: { project: WelfareProject; current: number }) {
  const [label, tone] = welfareStatusLabel(project.status);
  return (
    <Link to={`/welfare/${project.id}`} className="block">
      <Card interactive className="space-y-3 overflow-hidden p-0">
        <div className={`h-24 bg-gradient-to-br ${project.cover} px-4 py-3 text-on-primary`}>
          <div className="flex items-start justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium backdrop-blur-sm">
              <HeartHandshake size={12} aria-hidden="true" />
              公益助力
            </span>
            <StatusTag tone={tone}>{label}</StatusTag>
          </div>
          <h3 className="mt-2 line-clamp-1 text-base font-semibold">{project.title}</h3>
        </div>
        <div className="space-y-3 p-4 pt-1">
          <p className="line-clamp-2 text-sm leading-5 text-text-secondary">{project.summary}</p>
          <ProgressBar current={current} goal={project.goal} />
          <div className="flex items-center justify-between text-xs text-text-tertiary">
            <span>主办方：{project.sponsor.name}</span>
            <span className="flex items-center gap-1"><Users size={12} aria-hidden="true" />{current.toLocaleString("zh-CN")}</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}

export function WelfareListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = new URLSearchParams(location.search).get("returnTo") || undefined;
  const { welfareProjectStats, welfareParticipations } = useLongTermAssets();
  const [tab, setTab] = useState<"active" | "ended" | "mine">("active");
  const { earned } = useBadges();

  const helpedIds = useMemo(() => new Set(welfareParticipations.map(record => record.projectId)), [welfareParticipations]);
  const welfareBadges = badgeCatalog.filter(b => b.source === "welfare");
  const earnedWelfareCount = earned.filter(v => v.entry.source === "welfare").length;

  const filtered = useMemo(() => {
    if (tab === "mine") return welfareProjects.filter(project => helpedIds.has(project.id));
    if (tab === "ended") return welfareProjects.filter(project => project.status === "ended");
    return welfareProjects.filter(project => project.status === "active" || project.status === "upcoming");
  }, [tab, helpedIds]);

  return (
    <PublicShell showNavigation={false}>
      <PageHeader title="公益助力" backTo={returnTo ?? "/home"} />
      <div className="space-y-4 px-4 py-5">
        <p className="text-sm leading-5 text-text-secondary">观看公益倡导视频，为乡村教育、绿色消费等社会议题贡献一次助力。</p>

        {/* 可获得徽章提示 */}
        {welfareBadges.length > 0 && (
          <Card className="border border-primary-container bg-primary-container">
            <div className="flex items-center gap-2">
              <Target size={14} className="text-text-brand" aria-hidden="true" />
              <span className="text-xs font-medium text-text-brand">参与公益可解锁徽章</span>
              <span className="ml-auto text-xs text-text-tertiary">{earnedWelfareCount}/{welfareBadges.length} 已获得</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {welfareBadges.map(badge => (
                <Link key={badge.id} to="/me/badges" className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs ${earnedWelfareCount > 0 ? "bg-success-bg text-success-text" : "bg-surface text-text-secondary"}`}>
                  <span className={`flex size-5 items-center justify-center rounded-full text-[10px] font-bold ${badge.iconColor}`}>{badge.iconKey}</span>
                  <span className="font-medium">{badge.name}</span>
                </Link>
              ))}
            </div>
          </Card>
        )}

        <div className="flex gap-2">
          {[
            { key: "active", label: "进行中" },
            { key: "ended", label: "已结束" },
            { key: "mine", label: "我助力的" },
          ].map(item => (
            <button
              key={item.key}
              type="button"
              onClick={() => setTab(item.key as typeof tab)}
              className={`min-h-touch flex-1 rounded-control text-sm font-medium transition ${tab === item.key ? "bg-primary text-on-primary" : "bg-surface-subtle text-text-secondary"}`}
            >
              {item.label}
            </button>
          ))}
        </div>
        {filtered.length === 0 ? (
          <Card className="py-8 text-center text-sm text-text-secondary">
            {tab === "mine" ? "你还没有助力过任何公益项目" : "该分类下暂无公益项目"}
          </Card>
        ) : (
          <div className="space-y-4">
            {filtered.map(project => (
              <WelfareCard key={project.id} project={project} current={welfareProjectStats[project.id] ?? project.current} />
            ))}
          </div>
        )}
        <div className="pb-4 text-center">
          <GhostButton onClick={() => navigate("/home")}>返回首页</GhostButton>
        </div>
      </div>
    </PublicShell>
  );
}

export function WelfareDetailPage() {
  const { welfareId } = useParams<{ welfareId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = new URLSearchParams(location.search).get("returnTo") || undefined;
  const { session } = usePublicPlatform();
  const { welfareProjectStats, hasHelpedWelfare } = useLongTermAssets();
  const project = welfareId ? welfareProjectById(welfareId) : undefined;

  if (!project) {
    return (
      <PublicShell showNavigation={false}>
        <PageHeader title="公益助力" backTo={returnTo ?? "/welfare"} />
        <div className="px-4 py-6">
          <StateBlock state="empty" />
        </div>
      </PublicShell>
    );
  }

  const [statusLabel, statusTone] = welfareStatusLabel(project.status);
  const current = welfareProjectStats[project.id] ?? project.current;
  const helped = hasHelpedWelfare(project.id);
  const canHelp = session.loggedIn && project.status === "active" && !helped;

  return (
    <PublicShell showNavigation={false}>
      <PageHeader title="公益助力" backTo={returnTo ?? "/welfare"} />
      <div className="space-y-5 px-4 py-5">
        <div className={`overflow-hidden rounded-container bg-gradient-to-br ${project.cover} p-5 text-on-primary`}>
          <div className="flex items-start justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium backdrop-blur-sm">
              <HeartHandshake size={12} aria-hidden="true" />
              公益项目
            </span>
            <StatusTag tone={statusTone}>{statusLabel}</StatusTag>
          </div>
          <h1 className="mt-3 text-xl font-semibold leading-7">{project.title}</h1>
          <p className="mt-2 text-sm opacity-90">{project.summary}</p>
        </div>

        <Card className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">主办方</span>
            <span className="font-medium text-text-primary">{project.sponsor.name}</span>
          </div>
          {project.sponsor.description && (
            <p className="text-xs text-text-tertiary">{project.sponsor.description}</p>
          )}
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">活动时间</span>
            <span className="text-text-primary">{formatDate(project.startAt)} - {formatDate(project.endAt)}</span>
          </div>
        </Card>

        <Section title="项目介绍">
          <p className="text-sm leading-6 text-text-secondary">{project.description}</p>
        </Section>

        <Section title="助力进度">
          <ProgressBar current={current} goal={project.goal} />
        </Section>

        <Section title="助力奖励">
          <Card className="space-y-2">
            <p className="text-sm text-text-secondary">{project.rewardDescription ?? "暂无奖励说明"}</p>
            <p className="text-xs text-text-tertiary">奖励规则与发放以平台最终公告和 F04 学力值模型决策为准。</p>
          </Card>
        </Section>

        <div className="sticky bottom-0 -mx-4 border-t border-border-subtle bg-surface px-4 py-4">
          {!session.loggedIn ? (
            <SecondaryButton className="w-full" onClick={() => navigate(`/auth/login?returnTo=${encodeURIComponent(`/welfare/${project.id}${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`)}`)}>登录后助力</SecondaryButton>
          ) : helped ? (
            <Button className="w-full" disabled>已助力</Button>
          ) : project.status === "ended" ? (
            <Button className="w-full" disabled>项目已结束</Button>
          ) : project.status === "upcoming" ? (
            <Button className="w-full" disabled>即将开始</Button>
          ) : (
            <Button className="w-full" onClick={() => navigate(`/welfare/${project.id}/ad${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`)}>
              <Play size={16} className="mr-1.5" aria-hidden="true" />
              观看广告，完成助力
            </Button>
          )}
        </div>
      </div>
    </PublicShell>
  );
}

export function WelfareAdPage() {
  const { welfareId } = useParams<{ welfareId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = new URLSearchParams(location.search).get("returnTo") || undefined;
  const { helpWelfare, hasHelpedWelfare, welfareProjectStats } = useLongTermAssets();
  const project = welfareId ? welfareProjectById(welfareId) : undefined;

  if (!project) {
    return (
      <PublicShell showNavigation={false}>
        <PageHeader title="公益广告" backTo={returnTo ?? "/welfare"} />
        <div className="px-4 py-6"><StateBlock state="empty" /></div>
      </PublicShell>
    );
  }

  const helped = hasHelpedWelfare(project.id);
  const current = welfareProjectStats[project.id] ?? project.current;
  const detailPath = `/welfare/${project.id}${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`;

  const handleSimulateAdComplete = () => {
    const result = helpWelfare(project.id);
    if (result.success) {
      navigate(detailPath);
    }
  };

  return (
    <PublicShell showNavigation={false}>
      <PageHeader title="观看公益视频" backTo={detailPath} />
      <div className="space-y-6 px-4 py-6">
        <div className={`mx-auto flex size-20 items-center justify-center rounded-full bg-gradient-to-br ${project.cover} text-on-primary shadow-floating`}>
          <Play size={32} aria-hidden="true" />
        </div>
        <div className="text-center">
          <h2 className="text-base font-semibold text-text-primary">{project.title}</h2>
          <p className="mt-2 text-sm text-text-secondary">完整观看激励视频后，即可完成助力。</p>
        </div>

        <Card className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">当前助力进度</span>
            <span className="font-medium text-text-primary">{current.toLocaleString("zh-CN")} / {project.goal.toLocaleString("zh-CN")}</span>
          </div>
          <ProgressBar current={current} goal={project.goal} />
          {helped && <p className="text-center text-xs text-success-text">你已经完成助力，无需再次观看</p>}
        </Card>

        <div className="space-y-3">
          <Button className="w-full" disabled>
            <Play size={16} className="mr-1.5" aria-hidden="true" />
            广告 SDK 待接入
          </Button>
          <p className="text-center text-xs leading-5 text-text-tertiary">
            真实上线后，激励视频广告将由平台接入的 SDK 加载播放；<br />
            观看完成后自动回调完成助力并触发奖励发放逻辑。
          </p>
        </div>

        <div className="border-t border-border-subtle pt-4">
          <p className="mb-2 text-xs text-text-tertiary">原型调试：模拟广告回调</p>
          <GhostButton className="w-full text-xs" onClick={handleSimulateAdComplete} disabled={helped}>
            {helped ? "已助力" : "模拟观看完成"}
          </GhostButton>
        </div>
      </div>
    </PublicShell>
  );
}

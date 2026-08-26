import { useState } from "react";
import { Check, ChevronRight, ExternalLink, Lock, Target } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { PageHeader, PublicShell, Section, StatusTag } from "../../components/ui";
import { badgeCatalog, type BadgeCatalogEntry, type BadgeRule, type BadgeTier } from "./catalog";
import { useBadges, useBadgeEvaluationContext, type BadgeView } from "./hooks";
import { evaluateBadge } from "./engine";
import { courseById } from "../long-term-assets/data";

type BadgeDemoOverride = "all" | "none" | "mixed";

const tierLabel: Record<BadgeTier, string> = {
  low: "低级徽章",
  high: "高级徽章",
  cert: "可信证书",
};

/** GitHub 风格的徽章卡：圆形色块 + 名称 + 描述；未得变灰带锁。 */
function BadgeCard({ view, to }: { view: BadgeView; to: string }) {
  const { entry, unlocked } = view;
  return (
    <Link
      to={to}
      className={`group flex flex-col items-center gap-2 rounded-container border p-3 text-center transition active:scale-[0.99] ${unlocked ? "border-border-subtle bg-surface" : "border-dashed border-border-subtle bg-surface-subtle/40"}`}
    >
      <span
        className={`flex size-14 shrink-0 items-center justify-center rounded-full text-lg font-semibold ${unlocked ? entry.iconColor : "bg-surface-subtle text-text-tertiary"}`}
      >
        {unlocked ? entry.iconKey : <Lock size={20} aria-hidden="true" />}
      </span>
      <strong className={`line-clamp-1 text-xs font-semibold ${unlocked ? "text-text-primary" : "text-text-tertiary"}`}>{entry.name}</strong>
      <p className={`line-clamp-2 text-[11px] leading-4 ${unlocked ? "text-text-tertiary" : "text-text-tertiary/80"}`}>{entry.description}</p>
    </Link>
  );
}

function BadgeSummary({ earned, total }: { earned: number; total: number }) {
  return (
    <div className="flex items-center justify-between px-1">
      <div>
        <p className="text-xs font-medium text-text-brand">徽章</p>
        <h2 className="mt-0.5 text-base font-semibold text-text-primary">
          已得 <span className="text-text-primary">{earned}</span>
          <span className="ml-1 text-sm font-normal text-text-tertiary">/ {total}</span>
        </h2>
      </div>
      <StatusTag tone="neutral">{earned} 枚</StatusTag>
    </div>
  );
}

export function BadgesPage() {
  const { earned, locked, totalCount } = useBadges();
  const [demoOverride, setDemoOverride] = useState<BadgeDemoOverride | undefined>(undefined);

  // 原型演示覆盖：all / none / mixed
  const overriddenViews: BadgeView[] = (() => {
    if (demoOverride === "all") return badgeCatalog.map(entry => ({ entry, unlocked: true }));
    if (demoOverride === "none") return badgeCatalog.map(entry => ({ entry, unlocked: false }));
    if (demoOverride === "mixed") {
      // 一半已得，一半未得
      return badgeCatalog.map((entry, index) => ({ entry, unlocked: index % 2 === 0 }));
    }
    return [...earned, ...locked];
  })();
  const overriddenEarnedCount = overriddenViews.filter(view => view.unlocked).length;

  // 按 tier 分组
  const tiers: BadgeTier[] = ["high", "low", "cert"];
  const byTier: Record<BadgeTier, BadgeView[]> = { high: [], low: [], cert: [] };
  for (const view of overriddenViews) byTier[view.entry.tier].push(view);

  // 高级徽章进一步拆分：通用成就 vs 按课程分组的课程成就
  const highGeneral = byTier.high.filter(view => !view.entry.courseId);
  const highByCourse: Record<string, BadgeView[]> = {};
  for (const view of byTier.high) {
    if (!view.entry.courseId) continue;
    const cid = view.entry.courseId;
    if (!highByCourse[cid]) highByCourse[cid] = [];
    highByCourse[cid].push(view);
  }
  // 课程内按 courseOrder 排序
  for (const cid of Object.keys(highByCourse)) {
    highByCourse[cid].sort((a, b) => (a.entry.courseOrder ?? 0) - (b.entry.courseOrder ?? 0));
  }

  return (
    <PublicShell showNavigation={false}>
      <PageHeader title="徽章墙" subtitle="长期成就，可作为可信能力证据" backTo="/me" />
      <div className="space-y-5 px-4 py-5">
        <BadgeSummary earned={overriddenEarnedCount} total={totalCount} />

        {/* 高级徽章：通用成就 */}
        {highGeneral.length > 0 && (
          <Section title="高级徽章 · 通用成就" subtitle="代表真实能力，长期有效">
            <div className="grid grid-cols-3 gap-3">
              {highGeneral.map(view => (
                <BadgeCard key={view.entry.id} view={view} to={`/me/badges/${view.entry.id}`} />
              ))}
            </div>
          </Section>
        )}

        {/* 高级徽章：按课程分组 */}
        {Object.keys(highByCourse).length > 0 && (
          <Section title="高级徽章 · 课程节点" subtitle="每通过一个学习节点获得一枚">
            <div className="space-y-4">
              {Object.entries(highByCourse).map(([courseId, badges]) => {
                const course = courseById(courseId);
                const earnedInCourse = badges.filter(b => b.unlocked).length;
                return (
                  <div key={courseId} className="rounded-container border border-border-subtle bg-surface p-3">
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-text-primary">{course?.title ?? courseId}</h4>
                        <p className="mt-0.5 text-xs text-text-tertiary">
                          已获得 {earnedInCourse} / {badges.length} 枚
                        </p>
                      </div>
                      <Link to={`/courses/${courseId}`} className="flex items-center gap-0.5 text-xs text-text-brand">
                        去学习 <ChevronRight size={12} aria-hidden="true" />
                      </Link>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {badges.map(view => (
                        <BadgeCard key={view.entry.id} view={view} to={`/me/badges/${view.entry.id}`} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>
        )}

        {/* 低级徽章 */}
        {byTier.low.length > 0 && (
          <Section title="低级徽章" subtitle="高频行为与日常小任务">
            <div className="grid grid-cols-3 gap-3">
              {byTier.low.map(view => (
                <BadgeCard key={view.entry.id} view={view} to={`/me/badges/${view.entry.id}`} />
              ))}
            </div>
          </Section>
        )}

        {/* 可信证书 */}
        {byTier.cert.length > 0 && (
          <Section title="可信证书" subtitle="由多张徽章与必修课程组成">
            <div className="grid grid-cols-3 gap-3">
              {byTier.cert.map(view => (
                <BadgeCard key={view.entry.id} view={view} to={`/me/badges/${view.entry.id}`} />
              ))}
            </div>
          </Section>
        )}

        <details className="ml-auto w-fit rounded-control border border-border-subtle bg-surface p-2 text-xs shadow-floating">
          <summary className="cursor-pointer font-medium text-text-secondary">原型状态（演示用）</summary>
          <div className="mt-2 grid grid-cols-1 gap-1">
            {[
              { key: undefined, label: "真实状态" },
              { key: "all" as const, label: "全部已获得" },
              { key: "mixed" as const, label: "一半已获得" },
              { key: "none" as const, label: "全部未获得" },
            ].map(option => (
              <button
                key={option.label}
                type="button"
                className={`min-h-8 whitespace-nowrap rounded-control px-2 text-left active:bg-surface-pressed ${demoOverride === option.key ? "bg-primary-container text-text-brand" : "text-text-brand"}`}
                onClick={() => setDemoOverride(option.key)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </details>
      </div>
    </PublicShell>
  );
}

function BadgeDetailPage() {
  const navigate = useNavigate();
  const { badgeId } = useParams<{ badgeId: string }>();
  const { earned, locked } = useBadges();
  const ctx = useBadgeEvaluationContext();
  const view: BadgeView | undefined = [...earned, ...locked].find(item => item.entry.id === badgeId);

  if (!view) {
    return (
      <PublicShell showNavigation={false}>
        <PageHeader title="徽章详情" backTo="/me/badges" />
        <div className="px-4 py-6"><p className="text-sm text-text-secondary">徽章不存在或已下架。</p></div>
      </PublicShell>
    );
  }

  const { entry, unlocked } = view;

  // 统计各 tier 已获得徽章数量（用于 cert 徽章的兑换进度展示）
  const allViews = [...earned, ...locked];
  const tierCounts = {
    high: allViews.filter(v => v.unlocked && v.entry.tier === "high").length,
    low: allViews.filter(v => v.unlocked && v.entry.tier === "low").length,
  };

  const subConditions = flattenConditions(entry.rule, ctx, tierCounts);
  const completedCount = subConditions.filter(c => c.met).length;
  const progress = subConditions.length > 0 ? Math.round((completedCount / subConditions.length) * 100) : (unlocked ? 100 : 0);
  const actionInfo = getActionInfo(entry);

  return (
    <PublicShell showNavigation={false}>
      <PageHeader title={entry.name} backTo="/me/badges" />
      <div className="space-y-5 px-4 py-5">
        {/* 徽章主视觉 */}
        <div className="flex flex-col items-center text-center">
          <div className={`relative flex size-24 items-center justify-center rounded-full text-3xl font-bold shadow-lg ${unlocked ? entry.iconColor : "bg-surface-subtle text-text-tertiary"}`}>
            {unlocked ? entry.iconKey : <Lock size={36} aria-hidden="true" />}
            {unlocked && (
              <span className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full bg-success text-white shadow-md">
                <Check size={16} aria-hidden="true" />
              </span>
            )}
          </div>
          <h2 className="mt-5 text-xl font-semibold text-text-primary">{entry.name}</h2>
          <p className="mt-2 text-sm leading-6 text-text-secondary">{entry.description}</p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <StatusTag tone={entry.tier === "high" ? "success" : entry.tier === "cert" ? "warning" : "neutral"}>{tierLabel[entry.tier]}</StatusTag>
            <StatusTag tone="info">来源 · {sourceLabel(entry.source)}</StatusTag>
          </div>
        </div>

        {/* 进度条 */}
        <div className="rounded-container border border-border-subtle bg-surface p-4">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-text-primary">
              <Target size={16} className="text-text-brand" aria-hidden="true" />
              达成进度
            </h3>
            <span className="text-sm font-semibold text-text-brand">
              {unlocked ? "已获得" : `${completedCount}/${subConditions.length} 项`}
            </span>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-surface-subtle">
            <div
              className={`h-full rounded-full transition-all ${unlocked ? "bg-success" : "bg-primary"}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* 条件明细 */}
        <div className="rounded-container border border-border-subtle bg-surface">
          <h3 className="px-4 pt-4 text-sm font-semibold text-text-primary">达成条件</h3>
          <div className="mt-2 divide-y divide-border-subtle">
            {subConditions.map((cond, index) => (
              <div key={index} className="flex items-start gap-3 px-4 py-3">
                <span className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${cond.met ? "bg-success-bg text-success-text" : "bg-surface-subtle text-text-tertiary"}`}>
                  {cond.met ? <Check size={12} aria-hidden="true" /> : index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm leading-6 ${cond.met ? "text-text-primary" : "text-text-secondary"}`}>{cond.label}</p>
                  {cond.detail && <p className="mt-0.5 text-xs text-text-tertiary">{cond.detail}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 状态卡片 */}
        <div className={`rounded-container border p-4 ${unlocked ? "border-success/30 bg-success-bg" : "border-border-subtle bg-surface"}`}>
          <h3 className="text-sm font-semibold text-text-primary">{unlocked ? "已获得" : "尚未获得"}</h3>
          <p className="mt-2 text-sm text-text-secondary">
            {unlocked
              ? "按你当前的事实记录，这枚徽章已经达成，可在简历与可信证书中作为能力证明。"
              : "继续按上方条件完成，达成后徽章会自动解锁。"}
          </p>
        </div>

        {/* 行动入口 */}
        {!unlocked && actionInfo && (
          <button
            type="button"
            onClick={() => navigate(actionInfo.to)}
            className="flex min-h-touch w-full items-center justify-between rounded-control bg-primary-container px-4 text-sm font-medium text-text-brand active:bg-primary-container/80"
          >
            <span>{actionInfo.label}</span>
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        )}

        {unlocked && entry.source === "course" && actionInfo && (
          <button
            type="button"
            onClick={() => navigate(actionInfo.to)}
            className="flex min-h-touch w-full items-center justify-between rounded-control border border-border-subtle bg-surface px-4 text-sm font-medium text-text-primary active:bg-surface-pressed"
          >
            <span>查看关联课程</span>
            <ExternalLink size={16} className="text-text-tertiary" aria-hidden="true" />
          </button>
        )}

        <Link to="/me/badges" className="flex min-h-touch items-center justify-center gap-1 text-sm text-text-brand active:opacity-70">
          <ChevronRight size={16} aria-hidden="true" className="rotate-180" />
          <span>返回徽章墙</span>
        </Link>
      </div>
    </PublicShell>
  );
}

type SubCondition = { label: string; detail?: string; met: boolean };

function flattenConditions(
  rule: BadgeRule,
  ctx: ReturnType<typeof useBadgeEvaluationContext>,
  tierCounts: { high: number; low: number },
): SubCondition[] {
  const ctxWithTier = { ...ctx, badgeTierCounts: tierCounts };
  switch (rule.type) {
    case "allOf":
      return rule.rules.flatMap(sub => flattenConditions(sub, ctxWithTier, tierCounts));
    case "anyOf":
      return [{
        label: rule.rules.map(r => describeRuleSimple(r)).join(" 或 "),
        detail: "满足其中任一条件即可",
        met: evaluateBadge(rule, ctxWithTier),
      }];
    default:
      return [{
        label: describeRuleSimple(rule),
        detail: progressDetail(rule, ctx, tierCounts),
        met: evaluateBadge(rule, ctxWithTier),
      }];
  }
}

function describeRuleSimple(r: BadgeRule): string {
  switch (r.type) {
    case "checkin.today": return "完成今日打卡";
    case "checkin.streak": return `连续打卡 ${r.min} 天`;
    case "newbie.completed": return "完成全部新手任务";
    case "ad.watched": return `观看 ${r.min} 次激励视频广告`;
    case "welfare.helped": return `完成 ${r.min} 次公益助力`;
    case "profile.complete": return "完善学生基础资料";
    case "resume.firstEdit": return "首次编辑长期简历";
    case "course.completed": {
      const course = courseById(r.courseId);
      return `完成课程「${course?.title ?? r.courseId}」（含结业考试）`;
    }
    case "course.completedCount": return `累计完成 ${r.min} 门课程`;
    case "course.checkpointPassed": {
      const course = courseById(r.courseId);
      return `通过「${course?.title ?? r.courseId}」所有关卡小测`;
    }
    case "course.checkpointPassedCount": return `累计 ${r.min} 门课程关卡全通过`;
    case "competition.registered": return "报名一场赛事";
    case "competition.ended": return "经历一场赛事至结束";
    case "simulation.level": return `小店等级达到 Lv.${r.min}`;
    case "simulation.stockAndTraffic": return "同时完成进货与拉客";
    case "benefit.claimed": return `领取 ${r.min} 份创赛福利`;
    case "badge.tierCount": return `获得 ${r.min} 枚${r.tier === "high" ? "高级" : "低级"}徽章`;
    case "anyOf": return "满足任一条件";
    case "allOf": return "满足全部条件";
    default: return "按规则自动判定";
  }
}

function progressDetail(r: BadgeRule, ctx: ReturnType<typeof useBadgeEvaluationContext>, tierCounts: { high: number; low: number }): string | undefined {
  switch (r.type) {
    case "checkin.streak": return `当前连续 ${ctx.checkinStreak} 天`;
    case "ad.watched": return `当前累计 ${ctx.adWatchedCount} 次`;
    case "welfare.helped": return `当前累计 ${ctx.welfareHelpedCount} 次`;
    case "benefit.claimed": return `当前已领 ${ctx.benefitClaimedCount} 份`;
    case "course.completedCount": return `当前已完成 ${ctx.learning.filter(rec => rec.progress >= 100 && rec.assessment === "passed").length} 门`;
    case "course.checkpointPassedCount": return `当前通过 ${Object.values(ctx.courseCheckpointPasses).filter(Boolean).length} 门`;
    case "simulation.level": return ctx.simulationLevel > 0 ? `当前 Lv.${ctx.simulationLevel}` : "尚未开始";
    case "badge.tierCount": return `当前已获得 ${tierCounts[r.tier as "high" | "low"]} 枚`;
    default: return undefined;
  }
}

function sourceLabel(source: string): string {
  const map: Record<string, string> = {
    "app-behavior": "APP 行为",
    "checkin": "每日打卡",
    "newbie": "新手任务",
    "ad-watch": "激励视频",
    "course": "课程学习",
    "competition": "赛事参与",
    "simulation": "模拟经营",
    "benefit": "创赛福利",
    "welfare": "公益助力",
    "profile": "学生资料",
    "resume": "长期简历",
  };
  return map[source] ?? source;
}

function getActionInfo(entry: BadgeCatalogEntry): { label: string; to: string } | null {
  switch (entry.source) {
    case "course": {
      // 找到规则中的第一个 courseId
      const courseId = findCourseId(entry.rule);
      if (courseId) return { label: "去学习这门课", to: `/courses/${courseId}` };
      return { label: "去课程中心看看", to: "/courses/center" };
    }
    case "checkin":
      return { label: "去任务中心打卡", to: "/tasks" };
    case "newbie":
      return { label: "去完成新手任务", to: "/me/newbie" };
    case "competition":
      return { label: "去查看赛事", to: "/competitions" };
    case "simulation":
      return { label: "去我的创业小店", to: "/app-center/startup-shop" };
    case "benefit":
      return { label: "去领创赛福利", to: "/benefits" };
    case "welfare":
      return { label: "去参与公益助力", to: "/welfare" };
    case "resume":
      return { label: "去编辑长期简历", to: "/me/resume" };
    case "profile":
      return { label: "去完善资料", to: "/me/profile" };
    default:
      return null;
  }
}

function findCourseId(rule: BadgeRule): string | null {
  if ("courseId" in rule) return rule.courseId;
  if ("rules" in rule) {
    for (const sub of rule.rules) {
      const found = findCourseId(sub);
      if (found) return found;
    }
  }
  return null;
}

export { BadgeDetailPage };

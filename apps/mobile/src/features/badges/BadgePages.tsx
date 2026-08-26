import { useState } from "react";
import { Award, Check, ChevronRight, ExternalLink, Lock, Target } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { PageHeader, PublicShell, Section, StatusTag } from "../../components/ui";
import { badgeCatalog, isHighGrade, type BadgeCatalogEntry, type BadgeGrade, type BadgeRule, type BadgeSourceType } from "./catalog";
import { useBadges, useBadgeEvaluationContext, type BadgeView } from "./hooks";
import { evaluateBadge } from "./engine";
import { formatEarnedAt } from "./earnRecord";
import { courseById } from "../long-term-assets/data";
import { certificateByCourseId, type CertificateProgress } from "./certificates";

type BadgeDemoOverride = "all" | "none" | "mixed";

const gradeLabel: Record<BadgeGrade, string> = {
  G1: "G1",
  G2: "G2",
  G3: "G3",
  G4: "G4",
};

const gradeFullLabel: Record<BadgeGrade, string> = {
  G1: "G1 · 入门",
  G2: "G2 · 基础",
  G3: "G3 · 进阶",
  G4: "G4 · 高阶",
};

const sourceTypeLabel: Record<BadgeSourceType, string> = {
  "app-behavior": "App 行为",
  "learning": "课程学习",
  "assessment": "考核认证",
  "competition": "赛事身份",
  "progress": "项目进度",
  "operation": "运营活动",
};

function gradeTone(grade: BadgeGrade): "success" | "warning" | "info" | "neutral" {
  if (grade === "G4") return "success";
  if (grade === "G3") return "warning";
  if (grade === "G2") return "info";
  return "neutral";
}

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
      <span className={`text-[10px] font-medium ${unlocked ? "text-text-brand" : "text-text-tertiary"}`}>
        {gradeLabel[entry.grade]}
      </span>
    </Link>
  );
}

/** 可信证书卡 */
function CertificateCard({ progress, to }: { progress: CertificateProgress; to: string }) {
  const { definition, eligible } = progress;
  return (
    <Link
      to={to}
      className={`group flex flex-col items-center gap-2 rounded-container border p-3 text-center transition active:scale-[0.99] ${eligible ? "border-border-subtle bg-surface" : "border-dashed border-border-subtle bg-surface-subtle/40"}`}
    >
      <span
        className={`flex size-14 shrink-0 items-center justify-center rounded-full text-lg font-semibold ${eligible ? definition.iconColor : "bg-surface-subtle text-text-tertiary"}`}
      >
        {eligible ? <Award size={24} aria-hidden="true" /> : <Lock size={20} aria-hidden="true" />}
      </span>
      <strong className={`line-clamp-1 text-xs font-semibold ${eligible ? "text-text-primary" : "text-text-tertiary"}`}>{definition.name}</strong>
      <p className={`line-clamp-2 text-[11px] leading-4 ${eligible ? "text-text-tertiary" : "text-text-tertiary/80"}`}>{definition.description}</p>
      <StatusTag tone={eligible ? "success" : "neutral"}>{eligible ? "可领取" : "未达成"}</StatusTag>
    </Link>
  );
}

function BadgeSummary({ earned, total, highGrade, lowGrade }: { earned: number; total: number; highGrade: number; lowGrade: number }) {
  return (
    <div className="flex items-center justify-between px-1">
      <div>
        <p className="text-xs font-medium text-text-brand">徽章</p>
        <h2 className="mt-0.5 text-base font-semibold text-text-primary">
          已得 <span className="text-text-primary">{earned}</span>
          <span className="ml-1 text-sm font-normal text-text-tertiary">/ {total}</span>
        </h2>
        <p className="mt-1 text-[11px] text-text-tertiary">
          高品相 {highGrade} · 低品相 {lowGrade}
        </p>
      </div>
      <StatusTag tone="neutral">{earned} 枚</StatusTag>
    </div>
  );
}

export function BadgesPage() {
  const { earned, locked, totalCount, highGradeCount, lowGradeCount, certificates } = useBadges();
  const [demoOverride, setDemoOverride] = useState<BadgeDemoOverride | undefined>(undefined);

  // 原型演示覆盖：all / none / mixed
  const overriddenViews: BadgeView[] = (() => {
    if (demoOverride === "all") return badgeCatalog.map(entry => ({ entry, unlocked: true }));
    if (demoOverride === "none") return badgeCatalog.map(entry => ({ entry, unlocked: false }));
    if (demoOverride === "mixed") {
      return badgeCatalog.map((entry, index) => ({ entry, unlocked: index % 2 === 0 }));
    }
    return [...earned, ...locked];
  })();
  const overriddenEarnedCount = overriddenViews.filter(view => view.unlocked).length;
  const overriddenHighCount = overriddenViews.filter(v => v.unlocked && isHighGrade(v.entry.grade)).length;
  const overriddenLowCount = overriddenViews.filter(v => v.unlocked && !isHighGrade(v.entry.grade)).length;

  // 按品相分组（G4 → G1，高品相在前）
  const grades: BadgeGrade[] = ["G4", "G3", "G2", "G1"];
  const byGrade: Record<BadgeGrade, BadgeView[]> = { G1: [], G2: [], G3: [], G4: [] };
  for (const view of overriddenViews) byGrade[view.entry.grade].push(view);

  // 高品相进一步拆分：通用成就 vs 按课程分组的课程成就
  const highGeneral = [...byGrade.G4, ...byGrade.G3].filter(view => !view.entry.courseId);
  const highByCourse: Record<string, BadgeView[]> = {};
  for (const view of [...byGrade.G4, ...byGrade.G3]) {
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
        <BadgeSummary
          earned={overriddenEarnedCount}
          total={totalCount}
          highGrade={overriddenHighCount}
          lowGrade={overriddenLowCount}
        />

        {/* 高品相徽章：通用成就 */}
        {highGeneral.length > 0 && (
          <Section title="高品相徽章 · 通用成就" subtitle="G3 / G4，代表深度投入与可验证成就">
            <div className="grid grid-cols-3 gap-3">
              {highGeneral.map(view => (
                <BadgeCard key={view.entry.id} view={view} to={`/me/badges/${view.entry.id}`} />
              ))}
            </div>
          </Section>
        )}

        {/* 高品相徽章：按课程分组 */}
        {Object.keys(highByCourse).length > 0 && (
          <Section title="高品相徽章 · 课程节点" subtitle="每通过一个学习节点获得一枚">
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

        {/* 低品相徽章：G2 + G1 合并展示 */}
        {(byGrade.G2.length > 0 || byGrade.G1.length > 0) && (
          <Section title="低品相徽章" subtitle="G1 / G2，日常行为与运营活动">
            <div className="grid grid-cols-3 gap-3">
              {[...byGrade.G2, ...byGrade.G1].map(view => (
                <BadgeCard key={view.entry.id} view={view} to={`/me/badges/${view.entry.id}`} />
              ))}
            </div>
          </Section>
        )}

        {/* 可信证书（独立资产，不在徽章目录中） */}
        {certificates.length > 0 && (
          <Section title="可信证书" subtitle="可信课程 + 品相徽章组合，可作为能力证明">
            <div className="grid grid-cols-3 gap-3">
              {certificates.map(progress => (
                <CertificateCard
                  key={progress.definition.id}
                  progress={progress}
                  to={`/me/certificates/${progress.definition.id}`}
                />
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

  const subConditions = flattenConditions(entry.rule, ctx);
  const completedCount = subConditions.filter(c => c.met).length;
  const progress = subConditions.length > 0 ? Math.round((completedCount / subConditions.length) * 100) : (unlocked ? 100 : 0);
  const actionInfo = getActionInfo(entry);

  // 当前事实是否仍满足徽章规则（徽章可由历史记录保留，事实已回退时不影响已获得状态）
  const stillDerived = evaluateBadge(entry.rule, ctx);

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
            <StatusTag tone={gradeTone(entry.grade)}>{gradeFullLabel[entry.grade]}</StatusTag>
            <StatusTag tone="info">来源 · {sourceTypeLabel[entry.sourceType]}</StatusTag>
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
          {unlocked && view.earnedAt && (
            <p className="mt-1 text-xs font-medium text-success-text">获得于 {formatEarnedAt(view.earnedAt)}</p>
          )}
          <p className="mt-2 text-sm text-text-secondary">
            {unlocked
              ? stillDerived
                ? "按你当前的事实记录，这枚徽章已经达成，可在简历与可信证书中作为能力证明。"
                : "这枚徽章获得后长期保留。当前对应的行为记录已重置，重新开始可以冲击更高目标。"
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

        {unlocked && entry.sourceType === "assessment" && actionInfo && (
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

/** 可信证书详情页 */
function CertificateDetailPage() {
  const navigate = useNavigate();
  const { certId } = useParams<{ certId: string }>();
  const { certificates, highGradeCount, lowGradeCount } = useBadges();
  const progress = certificates.find(c => c.definition.id === certId);

  if (!progress) {
    return (
      <PublicShell showNavigation={false}>
        <PageHeader title="证书详情" backTo="/me/badges" />
        <div className="px-4 py-6"><p className="text-sm text-text-secondary">证书不存在或已下架。</p></div>
      </PublicShell>
    );
  }

  const { definition, courseCompleted, highGradeCount: certHighCount, lowGradeCount: certLowCount, eligible } = progress;
  const course = courseById(definition.courseId);

  const conditions = [
    {
      label: `完成可信课程「${course?.title ?? definition.courseId}」（含结业考核）`,
      detail: courseCompleted ? "已完成" : "尚未完成",
      met: courseCompleted,
    },
    {
      label: `获得 ${definition.highGradeBadgeCount} 枚高品相徽章（G3 / G4）`,
      detail: `当前 ${highGradeCount} / ${definition.highGradeBadgeCount} 枚`,
      met: highGradeCount >= definition.highGradeBadgeCount,
    },
    {
      label: `获得 ${definition.lowGradeBadgeCount} 枚低品相徽章（G1 / G2）`,
      detail: `当前 ${lowGradeCount} / ${definition.lowGradeBadgeCount} 枚`,
      met: lowGradeCount >= definition.lowGradeBadgeCount,
    },
  ];
  const completedCount = conditions.filter(c => c.met).length;
  const prog = Math.round((completedCount / conditions.length) * 100);

  // 避免未使用变量警告（certHighCount / certLowCount 来自 progress，与 hooks 级计数一致，此处以 hooks 为准）
  void certHighCount;
  void certLowCount;

  return (
    <PublicShell showNavigation={false}>
      <PageHeader title={definition.name} backTo="/me/badges" />
      <div className="space-y-5 px-4 py-5">
        {/* 证书主视觉 */}
        <div className="flex flex-col items-center text-center">
          <div className={`relative flex size-24 items-center justify-center rounded-full text-3xl font-bold shadow-lg ${eligible ? definition.iconColor : "bg-surface-subtle text-text-tertiary"}`}>
            {eligible ? <Award size={36} aria-hidden="true" /> : <Lock size={36} aria-hidden="true" />}
            {eligible && (
              <span className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full bg-success text-white shadow-md">
                <Check size={16} aria-hidden="true" />
              </span>
            )}
          </div>
          <h2 className="mt-5 text-xl font-semibold text-text-primary">{definition.name}</h2>
          <p className="mt-2 text-sm leading-6 text-text-secondary">{definition.description}</p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <StatusTag tone={eligible ? "success" : "warning"}>{eligible ? "资格已达成" : "资格未达成"}</StatusTag>
            <StatusTag tone="info">可信证书</StatusTag>
          </div>
        </div>

        {/* 进度条 */}
        <div className="rounded-container border border-border-subtle bg-surface p-4">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-text-primary">
              <Target size={16} className="text-text-brand" aria-hidden="true" />
              资格进度
            </h3>
            <span className="text-sm font-semibold text-text-brand">
              {eligible ? "已达成" : `${completedCount}/${conditions.length} 项`}
            </span>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-surface-subtle">
            <div
              className={`h-full rounded-full transition-all ${eligible ? "bg-success" : "bg-primary"}`}
              style={{ width: `${prog}%` }}
            />
          </div>
        </div>

        {/* 条件明细 */}
        <div className="rounded-container border border-border-subtle bg-surface">
          <h3 className="px-4 pt-4 text-sm font-semibold text-text-primary">资格条件</h3>
          <div className="mt-2 divide-y divide-border-subtle">
            {conditions.map((cond, index) => (
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
        <div className={`rounded-container border p-4 ${eligible ? "border-success/30 bg-success-bg" : "border-border-subtle bg-surface"}`}>
          <h3 className="text-sm font-semibold text-text-primary">{eligible ? "资格已达成" : "尚未达成"}</h3>
          <p className="mt-2 text-sm text-text-secondary">
            {eligible
              ? "你已满足该可信证书的全部资格条件，可前往证书中心领取正式证书（功能开发中）。"
              : "继续完成上方条件，全部达成后即可领取可信证书。"}
          </p>
        </div>

        {/* 行动入口 */}
        {!courseCompleted && (
          <button
            type="button"
            onClick={() => navigate(`/courses/${definition.courseId}`)}
            className="flex min-h-touch w-full items-center justify-between rounded-control bg-primary-container px-4 text-sm font-medium text-text-brand active:bg-primary-container/80"
          >
            <span>去学习可信课程</span>
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        )}

        {!eligible && courseCompleted && (
          <button
            type="button"
            onClick={() => navigate("/me/badges")}
            className="flex min-h-touch w-full items-center justify-between rounded-control bg-primary-container px-4 text-sm font-medium text-text-brand active:bg-primary-container/80"
          >
            <span>去收集更多徽章</span>
            <ChevronRight size={18} aria-hidden="true" />
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
): SubCondition[] {
  switch (rule.type) {
    case "allOf":
      return rule.rules.flatMap(sub => flattenConditions(sub, ctx));
    case "anyOf":
      return [{
        label: rule.rules.map(r => describeRuleSimple(r)).join(" 或 "),
        detail: "满足其中任一条件即可",
        met: evaluateBadge(rule, ctx),
      }];
    default:
      return [{
        label: describeRuleSimple(rule),
        detail: progressDetail(rule, ctx),
        met: evaluateBadge(rule, ctx),
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
    case "course.checkpointSinglePassed": {
      const course = courseById(r.courseId);
      return `通过「${course?.title ?? r.courseId}」关卡小测`;
    }
    case "competition.registered": return "报名一场赛事";
    case "competition.ended": return "经历一场赛事至结束";
    case "competition.team": return "在一场赛事中组建或加入完整团队";
    case "competition.materialsReady": return "备齐一场赛事的全部项目材料";
    case "competition.workshopTasksCompleted": return "完成一场赛事的创赛工坊全部任务";
    case "competition.resultsAccepted": return `接受并归档 ${r.min} 份工坊成果`;
    case "simulation.level": return `小店等级达到 Lv.${r.min}`;
    case "simulation.stockAndTraffic": return "同时完成进货与拉客";
    case "benefit.claimed": return `领取 ${r.min} 份创赛福利`;
    case "anyOf": return "满足任一条件";
    case "allOf": return "满足全部条件";
    default: return "按规则自动判定";
  }
}

function progressDetail(r: BadgeRule, ctx: ReturnType<typeof useBadgeEvaluationContext>): string | undefined {
  switch (r.type) {
    case "checkin.streak": return `当前连续 ${ctx.checkinStreak} 天`;
    case "ad.watched": return `当前累计 ${ctx.adWatchedCount} 次`;
    case "welfare.helped": return `当前累计 ${ctx.welfareHelpedCount} 次`;
    case "benefit.claimed": return `当前已领 ${ctx.benefitClaimedCount} 份`;
    case "course.completedCount": return `当前已完成 ${ctx.learning.filter(rec => rec.progress >= 100 && rec.assessment === "passed").length} 门`;
    case "course.checkpointPassedCount": return `当前通过 ${Object.values(ctx.courseCheckpointPasses).filter(Boolean).length} 门`;
    case "simulation.level": return ctx.simulationLevel > 0 ? `当前 Lv.${ctx.simulationLevel}` : "尚未开始";
    case "competition.resultsAccepted": return `当前已归档 ${ctx.workshopAcceptedResultCount} 份成果`;
    default: return undefined;
  }
}

function getActionInfo(entry: BadgeCatalogEntry): { label: string; to: string } | null {
  switch (entry.sourceType) {
    case "assessment":
    case "learning": {
      const courseId = findCourseId(entry.rule);
      if (courseId) return { label: "去学习这门课", to: `/courses/${courseId}` };
      return { label: "去课程中心看看", to: "/courses/center" };
    }
    case "app-behavior": {
      // 区分打卡 / 模拟经营 / 资料 / 简历
      const ruleType = entry.rule.type;
      if (ruleType.startsWith("checkin")) return { label: "去任务中心打卡", to: "/tasks" };
      if (ruleType.startsWith("simulation")) return { label: "去我的创业小店", to: "/app-center/startup-shop" };
      if (ruleType === "profile.complete") return { label: "去完善资料", to: "/me/profile" };
      if (ruleType === "resume.firstEdit") return { label: "去编辑长期简历", to: "/me/resume" };
      if (ruleType === "newbie.completed") return { label: "去完成新手任务", to: "/me/newbie" };
      if (ruleType === "benefit.claimed") return { label: "去领创赛福利", to: "/benefits" };
      return null;
    }
    case "competition":
    case "progress":
      return { label: "去查看赛事", to: "/competitions" };
    case "operation": {
      if (entry.rule.type === "ad.watched") return { label: "去观看激励视频", to: "/app-center" };
      if (entry.rule.type === "welfare.helped") return { label: "去参与公益助力", to: "/welfare" };
      return null;
    }
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

export { BadgeDetailPage, CertificateDetailPage, certificateByCourseId };

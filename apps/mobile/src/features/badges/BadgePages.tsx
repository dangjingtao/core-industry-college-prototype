import { useState } from "react";
import { ChevronRight, Lock } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Card, PageHeader, PublicShell, Section, StatusTag } from "../../components/ui";
import { badgeCatalog, type BadgeCatalogEntry, type BadgeTier } from "./catalog";
import { useBadges, type BadgeView } from "./hooks";

type BadgeDemoOverride = "all" | "none" | "mixed";

const tierLabel: Record<BadgeTier, string> = {
  low: "低级徽章",
  high: "高级徽章",
  cert: "可信证书",
};

function BadgeCard({ view, to }: { view: BadgeView; to: string }) {
  const { entry, unlocked } = view;
  return (
    <Link
      to={to}
      className={`flex min-h-[124px] flex-col rounded-container border p-3 transition active:scale-[0.99] ${unlocked ? "border-border-subtle bg-surface" : "border-dashed border-border-subtle bg-surface-subtle/40"}`}
    >
      <div className="flex items-start gap-2">
        <span className={`flex size-10 shrink-0 items-center justify-center rounded-control text-sm font-semibold ${unlocked ? entry.iconColor : "bg-surface-subtle text-text-tertiary"}`}>
          {unlocked ? entry.iconKey : <Lock size={16} aria-hidden="true" />}
        </span>
        <span className="min-w-0 flex-1">
          <strong className={`block text-sm font-semibold ${unlocked ? "text-text-primary" : "text-text-tertiary"}`}>{entry.name}</strong>
          <span className="mt-0.5 block text-[11px] text-text-tertiary">{tierLabel[entry.tier]} · 奖励 {entry.rewardHint}</span>
        </span>
      </div>
      <p className={`mt-2 line-clamp-2 text-xs leading-5 ${unlocked ? "text-text-secondary" : "text-text-tertiary"}`}>{entry.description}</p>
    </Link>
  );
}

function BadgeSummary({ earned, total }: { earned: number; total: number }) {
  const percent = total === 0 ? 0 : Math.round((earned / total) * 100);
  return (
    <Card className="overflow-hidden">
      <div className="-mx-4 -mt-4 h-20 bg-gradient-to-br from-primary to-primary-pressed" />
      <div className="px-1">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-medium text-text-brand">我的徽章</p>
            <h2 className="mt-1 text-xl font-semibold text-text-primary">{earned}<span className="ml-1 text-sm font-normal text-text-tertiary">/ {total}</span></h2>
          </div>
          <StatusTag tone="info">完成度 {percent}%</StatusTag>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-subtle">
          <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${percent}%` }} />
        </div>
        <p className="mt-3 text-xs text-text-secondary">徽章来自课程、赛事、APP 行为、模拟经营等场景；达成规则透明可解释，奖励待 F04 决策确认。</p>
      </div>
    </Card>
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

  return (
    <PublicShell showNavigation={false}>
      <PageHeader title="我的徽章" subtitle="长期成就，可作为可信能力证据" backTo="/me" />
      <div className="space-y-5 px-4 py-5">
        <BadgeSummary earned={overriddenEarnedCount} total={totalCount} />

        {tiers.map(tier => byTier[tier].length > 0 && (
          <Section key={tier} title={tier === "high" ? "高级徽章" : tier === "low" ? "低级徽章" : "可信证书"} subtitle={tier === "high" ? "代表真实能力，长期有效" : tier === "low" ? "高频行为与日常小任务" : "由多张徽章与必修课程组成"}>
            <div className="grid grid-cols-2 gap-3">
              {byTier[tier].map(view => (
                <BadgeCard key={view.entry.id} view={view} to={`/me/badges/${view.entry.id}`} />
              ))}
            </div>
          </Section>
        ))}

        <p className="text-center text-[11px] text-text-tertiary">共 {badgeCatalog.length} 枚徽章 · 已获得 {overriddenEarnedCount} 枚</p>

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
  const { badgeId } = useParams<{ badgeId: string }>();
  const { earned, locked } = useBadges();
  const view: BadgeView | undefined = [...earned, ...locked].find(item => item.entry.id === badgeId);
  if (!view) {
    return (
      <PublicShell showNavigation={false}>
        <PageHeader title="徽章详情" backTo="/me/badges" />
        <div className="px-4 py-6"><Card><p className="text-sm text-text-secondary">徽章不存在或已下架。</p></Card></div>
      </PublicShell>
    );
  }
  const { entry, unlocked } = view;
  return (
    <PublicShell showNavigation={false}>
      <PageHeader title={entry.name} backTo="/me/badges" />
      <div className="space-y-4 px-4 py-5">
        <Card className="flex flex-col items-center text-center">
          <span className={`flex size-20 items-center justify-center rounded-full text-2xl font-semibold ${unlocked ? entry.iconColor : "bg-surface-subtle text-text-tertiary"}`}>
            {unlocked ? entry.iconKey : <Lock size={28} aria-hidden="true" />}
          </span>
          <h2 className="mt-4 text-lg font-semibold text-text-primary">{entry.name}</h2>
          <p className="mt-1 text-sm text-text-secondary">{entry.description}</p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <StatusTag tone={entry.tier === "high" ? "success" : entry.tier === "cert" ? "warning" : "neutral"}>{tierLabel[entry.tier]}</StatusTag>
            <StatusTag tone="info">来源 · {entry.source}</StatusTag>
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold text-text-primary">达成条件</h3>
          <p className="mt-2 text-sm leading-6 text-text-secondary">{ruleDescription(entry)}</p>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold text-text-primary">奖励</h3>
          <p className="mt-2 text-sm text-text-secondary">{entry.rewardHint}</p>
          <p className="mt-2 text-[11px] text-text-tertiary">具体发放与额度需等 F04 Decision A（学力值经济）确认。</p>
        </Card>

        <Card className={unlocked ? "border-success/30 bg-success-bg" : ""}>
          <h3 className="text-sm font-semibold text-text-primary">{unlocked ? "已获得" : "未获得"}</h3>
          <p className="mt-2 text-sm text-text-secondary">{unlocked ? "恭喜！按你当前的事实记录，这枚徽章已经达成。" : "继续按上方条件努力，获得后会自动出现在这里。"}</p>
        </Card>

        <Link to="/me/badges" className="flex min-h-touch items-center justify-center gap-1 text-sm text-text-brand active:opacity-70"><ChevronRight size={16} aria-hidden="true" className="rotate-180" /><span>返回徽章墙</span></Link>
      </div>
    </PublicShell>
  );
}

function ruleDescription(entry: BadgeCatalogEntry): string {
  return describeRule(entry.rule, entry);
}

function describeRule(r: BadgeCatalogEntry["rule"], _entry: BadgeCatalogEntry): string {
  switch (r.type) {
    case "checkin.today":
      return "完成一次每日打卡（任务中心）";
    case "checkin.streak":
      return `连续打卡 ${r.min} 天`;
    case "newbie.completed":
      return "完成全部新手任务";
    case "ad.watched":
      return `累计观看 ${r.min} 次激励视频广告`;
    case "welfare.helped":
      return `完成 ${r.min} 次公益助力`;
    case "profile.complete":
      return "完善学生基础资料";
    case "resume.firstEdit":
      return "完成长期简历首次编辑";
    case "course.completed":
      return `完成指定课程 ${r.courseId}（含考试通过）`;
    case "course.completedCount":
      return `累计完成 ${r.min} 门课程（含考试通过）`;
    case "competition.registered":
      return "成功报名一场赛事";
    case "competition.ended":
      return "经历至少一场赛事至结束";
    case "simulation.level":
      return `应用中心「我的创业小店」等级达到 Lv.${r.min}`;
    case "simulation.stockAndTraffic":
      return "小店同时完成进货与拉客";
    case "benefit.claimed":
      return `领取 ${r.min} 份创赛福利`;
    case "anyOf":
      return r.rules.map(subRule => describeRule(subRule, _entry)).join(" / 或 ");
    default:
      return "按规则引擎自动判定";
  }
}

export { BadgeDetailPage };

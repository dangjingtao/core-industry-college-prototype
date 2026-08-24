import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, ShieldCheck, Trophy } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button, Card, PageHeader, PublicShell, SecondaryButton, StatusTag } from "../../components/ui";

type Scenario = "unclaimed" | "existing" | "disputed" | "confirmed";

function scenarioFromSearch(search: string): Scenario {
  const value = new URLSearchParams(search).get("case");
  if (value === "existing" || value === "disputed" || value === "confirmed") return value;
  return "unclaimed";
}

const competitionName = "第十六届全国大学生三创赛";
const teamName = "号外号外爆卖爆卖";

function ScenarioSwitch({ current }: { current: Scenario }) {
  const items: Array<{ value: Scenario; label: string }> = [
    { value: "unclaimed", label: "待激活账号" },
    { value: "existing", label: "已有账号新增身份" },
    { value: "confirmed", label: "已确认" },
    { value: "disputed", label: "身份异议" },
  ];
  return (
    <div className="rounded-control border border-dashed border-border p-3">
      <p className="text-xs font-medium text-text-tertiary">T028 原型状态切换</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.map(item => (
          <Link
            key={item.value}
            to={`/auth/competition-account?case=${item.value}`}
            className={`rounded-full px-3 py-2 text-xs font-medium ${current === item.value ? "bg-primary-container text-text-brand" : "bg-surface-subtle text-text-secondary"}`}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

function CompetitionFactCard() {
  return (
    <Card className="border border-border-subtle">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-control bg-primary-container text-text-brand">
          <Trophy size={20} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-xs text-text-tertiary">学校审核通过的赛事报名</p>
          <h2 className="mt-1 font-semibold text-text-primary">{competitionName}</h2>
          <p className="mt-1 text-sm text-text-secondary">团队：{teamName} · 身份：成员</p>
        </div>
      </div>
    </Card>
  );
}

export function CompetitionAccountPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const scenario = scenarioFromSearch(location.search);
  const [accepted, setAccepted] = useState(false);
  const [activated, setActivated] = useState(false);
  const [confirmed, setConfirmed] = useState(scenario === "confirmed");
  const [disputed, setDisputed] = useState(scenario === "disputed");

  const displayScenario = useMemo<Scenario>(() => {
    if (disputed) return "disputed";
    if (confirmed) return "confirmed";
    return scenario;
  }, [confirmed, disputed, scenario]);

  if (displayScenario === "unclaimed") {
    return (
      <PublicShell showNavigation={false}>
        <PageHeader title="激活核心学院账号" backTo="/welcome" />
        <div className="space-y-5 px-4 py-6">
          <Card className="border border-success/30 bg-success-bg">
            <StatusTag tone="success">学校审核已通过</StatusTag>
            <h1 className="mt-3 text-lg font-semibold text-text-primary">赛事报名已为你创建待激活账号</h1>
            <p className="mt-2 text-sm leading-6 text-text-secondary">该账号由学校审核通过的团队报名触发。你尚未完成长期平台激活，验证并确认后才进入完整核心学院服务。</p>
          </Card>
          <CompetitionFactCard />
          <Card>
            <div className="flex items-start gap-3">
              <ShieldCheck size={20} className="mt-0.5 shrink-0 text-text-brand" aria-hidden="true" />
              <div>
                <h2 className="font-semibold text-text-primary">激活前我们只保留赛事必要信息</h2>
                <p className="mt-2 text-sm leading-6 text-text-secondary">当前手机号、赛事团队关系和学校审核结果用于赛事服务。未激活前，不默认开启课程推荐、就业画像或营销订阅。</p>
              </div>
            </div>
          </Card>
          <label className="flex items-start gap-3 rounded-control border border-border bg-surface p-4 text-sm leading-6 text-text-secondary">
            <input type="checkbox" checked={accepted} onChange={event => setAccepted(event.target.checked)} className="mt-1" />
            <span>我已阅读并同意 <Link to="/legal/user-agreement" className="font-medium text-text-brand">用户协议</Link> 和 <Link to="/legal/privacy" className="font-medium text-text-brand">隐私政策</Link>，激活核心学院长期账号。</span>
          </label>
          {activated ? (
            <Card className="border border-success/30 bg-success-bg">
              <div className="flex items-start gap-3"><CheckCircle2 size={20} className="mt-0.5 text-success-text" aria-hidden="true" /><div><h2 className="font-semibold text-success-text">账号已激活</h2><p className="mt-1 text-sm leading-6 text-success-text">继续使用同一个手机号和 userId，本次赛事身份已经保留，不会重新创建第二个账号。</p></div></div>
              <Button className="mt-4 w-full" onClick={() => navigate("/home")}>进入核心学院</Button>
            </Card>
          ) : (
            <div className="space-y-3">
              <Button className="w-full" disabled={!accepted} onClick={() => setActivated(true)}>确认并激活账号</Button>
              <SecondaryButton className="w-full" onClick={() => navigate("/welcome")}>稍后处理</SecondaryButton>
            </div>
          )}
          <ScenarioSwitch current={displayScenario} />
        </div>
      </PublicShell>
    );
  }

  if (displayScenario === "disputed") {
    return (
      <PublicShell showNavigation={false}>
        <PageHeader title="赛事身份核对" backTo="/home" />
        <div className="space-y-5 px-4 py-6">
          <Card className="border border-warning/30 bg-warning-bg">
            <div className="flex items-start gap-3"><AlertTriangle size={20} className="mt-0.5 text-warning-text" aria-hidden="true" /><div><StatusTag tone="warning">身份核对中</StatusTag><h1 className="mt-3 text-lg font-semibold text-warning-text">已记录“这不是我的参赛信息”</h1><p className="mt-2 text-sm leading-6 text-warning-text">该赛事身份进入 disputed 状态。核对期间不会影响你使用其它赛事、课程、权益和长期账号。</p></div></div>
          </Card>
          <CompetitionFactCard />
          <Card><h2 className="font-semibold text-text-primary">核对期间暂停的操作</h2><p className="mt-2 text-sm leading-6 text-text-secondary">暂不允许以该赛事身份提交新材料、领取高价值赛事专属权益或生成新的可信赛事证明。学校 / 赛事运营确认后会更新结果。</p></Card>
          <Button className="w-full" onClick={() => navigate("/support/chat")}>联系人工客服</Button>
          <ScenarioSwitch current={displayScenario} />
        </div>
      </PublicShell>
    );
  }

  return (
    <PublicShell showNavigation={false}>
      <PageHeader title="新的赛事身份" backTo="/home" />
      <div className="space-y-5 px-4 py-6">
        <Card className="border border-primary/30 bg-primary-container/40">
          <StatusTag tone={displayScenario === "confirmed" ? "success" : "info"}>{displayScenario === "confirmed" ? "已确认" : "待你确认"}</StatusTag>
          <h1 className="mt-3 text-lg font-semibold text-text-primary">你的账号已关联新的赛事身份</h1>
          <p className="mt-2 text-sm leading-6 text-text-secondary">该关联来自学校已经审核通过的团队报名。系统复用了你当前的长期账号，没有创建新的赛事账号。</p>
        </Card>
        <CompetitionFactCard />
        {displayScenario === "confirmed" ? (
          <Card className="border border-success/30 bg-success-bg"><div className="flex items-start gap-3"><CheckCircle2 size={20} className="mt-0.5 text-success-text" aria-hidden="true" /><div><h2 className="font-semibold text-success-text">赛事身份已确认</h2><p className="mt-1 text-sm leading-6 text-success-text">后续赛事状态、任务和通知会继续同步到当前账号。</p></div></div></Card>
        ) : (
          <div className="space-y-3">
            <Button className="w-full" onClick={() => setConfirmed(true)}>确认是我的参赛信息</Button>
            <SecondaryButton className="w-full" onClick={() => setDisputed(true)}>这不是我的参赛信息</SecondaryButton>
          </div>
        )}
        <ScenarioSwitch current={displayScenario} />
      </div>
    </PublicShell>
  );
}

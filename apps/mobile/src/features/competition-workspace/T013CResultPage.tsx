import { useEffect, useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { Building2, Compass, EyeOff, FileText, Presentation, Share2, Sparkles, TrendingUp, Users } from "lucide-react";
import { Button, Card, PageHeader, PublicShell, SecondaryButton, Section, StatusTag } from "../../components/ui";
import { resultById, taskById, workspaceData } from "./data";
import { T013BResultDetailPage } from "./T013BResultPage";
import { useWorkshopRuntime, type WorkshopResultDraft } from "./runtime";
import { CompetitionContextLine, RequireCompetitionAccess } from "./shared";
import { pickOptions } from "./T013CTaskPages";

const specialResultIds = new Set(["result-s5-pitch-ppt", "result-s6-job-recommend", "result-s6-career-advisor", "result-s6-experience-transform", "result-s6-quality-test"]);

function defaultDraft(resultId: string) {
  const result = resultById(resultId);
  return result ? { summary: result.summary, highlights: result.highlights, nextSuggestion: result.nextSuggestion } : { summary: "", highlights: [], nextSuggestion: "" };
}

function ResultGate({ competitionId, resultId, children }: { competitionId: string; resultId: string; children: ReactNode }) {
  const { getRuntime } = useWorkshopRuntime();
  const result = resultById(resultId);
  const task = result ? taskById(result.taskId) : undefined;
  const completed = task ? getRuntime(competitionId).taskRuns[task.id]?.status === "completed" : false;
  if (!result || !task || !completed) {
    return <PublicShell showNavigation={false}><PageHeader title="成果详情" backTo={`/competitions/${competitionId}/workspace/workshop/results`} /><RequireCompetitionAccess><div className="px-4 py-6"><Card className="border border-warning bg-warning-bg"><p className="font-medium text-warning-text">该成果尚未生成</p><p className="mt-2 text-sm text-warning-text">请先完成当前赛事下对应的 Task Runtime 任务。</p></Card></div></RequireCompetitionAccess></PublicShell>;
  }
  return <>{children}</>;
}

function TeamResultActions({ competitionId, resultId, draft, setEditing, editing, resetDraft }: {
  competitionId: string;
  resultId: string;
  draft: WorkshopResultDraft;
  setEditing: (value: boolean) => void;
  editing: boolean;
  resetDraft: () => void;
}) {
  const { getRuntime, updateResultDraft, submitResultForConfirmation, acceptResult } = useWorkshopRuntime();
  const runtime = getRuntime(competitionId);
  const [shared, setShared] = useState(false);
  const [rolePreview, setRolePreview] = useState<"default" | "member">("default");
  const accepted = runtime.acceptedResultIds.includes(resultId);
  const submitted = runtime.resultConfirmationStatus[resultId] === "pending";
  const isCaptain = rolePreview === "member" ? false : workspaceData[competitionId]?.team.role.includes("队长") ?? false;

  const save = (submit: boolean) => {
    updateResultDraft(competitionId, resultId, draft);
    if (submit) submitResultForConfirmation(competitionId, resultId);
    setEditing(false);
  };

  return <div className="space-y-3">
    {isCaptain && submitted && !accepted && <Card className="border border-info bg-info-bg" data-testid="result-confirmation-pending"><p className="font-medium text-info-text">队员已提交确认</p><p className="mt-2 text-sm leading-5 text-info-text">队长可采纳并标记为用于比赛的团队成果。</p></Card>}

    <div className="space-y-2">
      {editing ? <>
        <Button className="w-full" onClick={() => save(!isCaptain)}>{isCaptain ? "保存编辑" : "保存编辑并提交确认"}</Button>
        <SecondaryButton className="w-full" onClick={() => { resetDraft(); setEditing(false); }}>取消编辑</SecondaryButton>
      </> : <>
        <div className="grid grid-cols-2 gap-2">
          <SecondaryButton onClick={() => setEditing(true)}>编辑成果</SecondaryButton>
          <SecondaryButton onClick={() => setShared(true)}><Share2 size={16} aria-hidden="true" className="mr-2 inline-block" />{shared ? "已准备分享" : "分享成果"}</SecondaryButton>
        </div>
        {!isCaptain && !accepted && <Button className="w-full" disabled={submitted} onClick={() => submitResultForConfirmation(competitionId, resultId)}>{submitted ? "已提交队长确认" : "提交队长确认"}</Button>}
        {isCaptain && !accepted && <Button className="w-full" onClick={() => acceptResult(competitionId, resultId)}>队长采纳并用于比赛</Button>}
      </>}
    </div>

    <details className="rounded-container border border-border-subtle bg-surface p-3 text-xs text-text-secondary">
      <summary className="cursor-pointer font-medium text-text-brand">成果角色原型</summary>
      <div className="mt-2 flex gap-2"><button type="button" className="min-h-touch rounded-control bg-surface-subtle px-3" onClick={() => setRolePreview("member")}>模拟队员视角</button><button type="button" className="min-h-touch rounded-control bg-surface-subtle px-3" onClick={() => setRolePreview("default")}>恢复队长视角</button></div>
      <p className="mt-2">当前：{rolePreview === "member" ? "队员" : "赛事团队默认角色"}</p>
    </details>
  </div>;
}

const pptSlides = [
  ["01", "项目问题与机会", "用一个明确问题建立路演上下文，不把预测当事实。"],
  ["02", "目标用户", "呈现已经验证的用户画像、访谈与真实需求证据。"],
  ["03", "解决方案", "说明产品 / 服务如何回应问题，并保留当前 MVP 边界。"],
  ["04", "市场与竞争", "用可追溯的市场证据和竞品差异支撑判断。"],
  ["05", "运营验证", "展示渠道、内容、订单或用户反馈中的真实数据。"],
  ["06", "商业模式", "解释价值交换、收入来源与仍待验证的关键假设。"],
  ["07", "增长计划", "明确下一阶段最小验证动作与资源需求。"],
  ["08", "团队与分工", "只使用当前赛事团队档案中的可信信息。"],
  ["09", "结尾与答辩", "收束核心价值，并准备最可能被追问的证据。"],
];

function S5PptResult({ competitionId, resultId }: { competitionId: string; resultId: string }) {
  const { getRuntime } = useWorkshopRuntime();
  const runtime = getRuntime(competitionId);
  const stored = runtime.resultDrafts[resultId] ?? defaultDraft(resultId);
  const [draft, setDraft] = useState<WorkshopResultDraft>(stored);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    setDraft(runtime.resultDrafts[resultId] ?? defaultDraft(resultId));
    setEditing(false);
  }, [competitionId, resultId]);

  const accepted = runtime.acceptedResultIds.includes(resultId);
  const submitted = runtime.resultConfirmationStatus[resultId] === "pending";

  return <PublicShell showNavigation={false}><PageHeader title="PPT 成果详情" backTo={`/competitions/${competitionId}/workspace/workshop/results`} /><RequireCompetitionAccess><div className="space-y-6 px-4 py-5">
    <CompetitionContextLine competitionId={competitionId} />
    <Card>
      <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-medium text-text-brand">S5 · 赛事冲刺</p><h1 className="mt-2 text-xl font-semibold leading-7 text-text-primary">路演 PPT</h1></div><StatusTag tone={accepted ? "success" : submitted ? "info" : "neutral"}>{accepted ? "队长已采纳" : submitted ? "已提交队长确认" : "待团队确认"}</StatusTag></div>
      {editing ? <textarea aria-label="成果摘要" value={draft.summary} onChange={event => setDraft(current => ({ ...current, summary: event.target.value }))} rows={4} className="mt-4 w-full rounded-control border border-border bg-surface p-3 text-sm text-text-primary" /> : <p className="mt-4 text-sm leading-6 text-text-secondary">{draft.summary}</p>}
    </Card>

    <Card className="border border-info bg-info-bg" data-testid="s5-ppt-mock-note"><div className="flex items-start gap-3"><Presentation size={20} aria-hidden="true" className="text-info-text" /><div><p className="font-medium text-info-text">原型 PPT 产物</p><p className="mt-2 text-sm leading-5 text-info-text">以下是可编辑的路演结构 mock，不是真实生成的 .pptx 文件，也不代表已向任何官方赛事系统提交。</p></div></div></Card>

    <Section title="PPT 页面结构"><div className="space-y-3">{pptSlides.map(([index, title, body]) => <Card key={index} data-testid={`s5-slide-${index}`}><div className="flex items-start gap-3"><div className="rounded-control bg-surface-subtle px-3 py-2 text-sm font-semibold text-text-brand">{index}</div><div><h2 className="font-semibold text-text-primary">{title}</h2><p className="mt-2 text-sm leading-5 text-text-secondary">{body}</p></div></div></Card>)}</div></Section>

    <Section title="AI 建议摘要"><Card><div className="space-y-3">{draft.highlights.map((item, index) => editing ? <textarea key={index} aria-label={`PPT 建议 ${index + 1}`} value={item} onChange={event => setDraft(current => ({ ...current, highlights: current.highlights.map((value, valueIndex) => valueIndex === index ? event.target.value : value) }))} rows={2} className="w-full rounded-control border border-border bg-surface p-2 text-sm text-text-primary" /> : <p key={`${item}-${index}`} className="text-sm leading-5 text-text-primary">· {item}</p>)}</div></Card></Section>

    <Card className="border border-info bg-info-bg"><div className="flex items-start gap-3"><Users size={20} aria-hidden="true" className="text-info-text" /><div><p className="font-medium text-info-text">团队协作</p><p className="mt-2 text-sm leading-5 text-info-text">结果对全队可见；队员可编辑后提交确认，队长可采纳并标记用于比赛。</p></div></div></Card>

    <TeamResultActions competitionId={competitionId} resultId={resultId} draft={draft} setEditing={setEditing} editing={editing} resetDraft={() => setDraft(runtime.resultDrafts[resultId] ?? defaultDraft(resultId))} />
  </div></RequireCompetitionAccess></PublicShell>;
}

function S6JobRecommendResult({ competitionId, resultId }: { competitionId: string; resultId: string }) {
  const { getRuntime } = useWorkshopRuntime();
  const runtime = getRuntime(competitionId);
  const run = runtime.taskRuns["s6-job-recommend"];
  const result = resultById(resultId);
  const selections = run?.selections ?? {};
  const directions = selections.industry ?? [];
  const cities = selections.city ?? [];
  const skills = selections.skills ?? [];
  const salary = selections.salary?.[0] ?? "暂不填写";
  const sizes = selections.size ?? [];
  const pref = { directions: pickOptions(directions), cities: pickOptions(cities), skills: pickOptions(skills), sizes: pickOptions(sizes) };

  const recommended = recommendCompanies
    .map(company => ({ ...company, score: matchCompanyScore(company, pref) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return <PublicShell showNavigation={false}><PageHeader title="岗位推荐成果" backTo={`/competitions/${competitionId}/workspace/workshop/results`} /><RequireCompetitionAccess><div className="space-y-6 px-4 py-5">
    <CompetitionContextLine competitionId={competitionId} />

    <Card className="border border-info bg-info-bg" data-testid="s6-job-private-visibility"><div className="flex items-start gap-3"><EyeOff size={20} aria-hidden="true" className="text-info-text" /><div><p className="font-medium text-info-text">生成结果仅自己可见</p><p className="mt-2 text-sm leading-5 text-info-text">这是个人求职探索建议，不进入团队成果确认，也不会写入 StudentProfile、比赛成绩、证书或其它可信事实。</p></div></div></Card>

    <Card>
      <p className="text-xs font-medium text-text-brand">S6 · 职业发展 / 岗位推荐</p>
      <h1 className="mt-2 text-xl font-semibold leading-7 text-text-primary">企业岗位推荐</h1>
      <p className="mt-4 text-sm leading-6 text-text-secondary">{result?.summary ?? "结合职业方向、城市与技能偏好，匹配可探索的企业与热门岗位。"}</p>
    </Card>

    <Section title="事实输入"><Card data-testid="s6-job-fact-input"><div className="space-y-3"><div><p className="text-xs text-text-secondary">职业方向</p><p className="mt-1 text-sm font-medium text-text-primary">{directions.length ? directions.join("、") : "未填写"}</p></div><div><p className="text-xs text-text-secondary">期望城市</p><p className="mt-1 text-sm font-medium text-text-primary">{cities.length ? cities.join("、") : "未填写"}</p></div><div><p className="text-xs text-text-secondary">掌握技能</p><p className="mt-1 text-sm font-medium text-text-primary">{skills.length ? skills.join("、") : "未填写"}</p></div><div className="grid grid-cols-2 gap-3"><div><p className="text-xs text-text-secondary">期望薪资</p><p className="mt-1 text-sm font-medium text-text-primary">{salary}</p></div><div><p className="text-xs text-text-secondary">公司规模</p><p className="mt-1 text-sm font-medium text-text-primary">{sizes.length ? sizes.join("、") : "不限"}</p></div></div></div></Card></Section>

    <Section title="AI 推荐企业" subtitle="建议，不是人才评分"><div className="space-y-3">{recommended.map(company => <RecommendCompanyCard key={company.name} company={company} pref={pref} />)}</div></Section>

    <Card className="border border-warning bg-warning-bg" data-testid="s6-job-no-score"><div className="flex items-start gap-3"><FileText size={20} aria-hidden="true" className="text-warning-text" /><div><p className="font-medium text-warning-text">没有“人才总分”</p><p className="mt-2 text-sm leading-5 text-warning-text">匹配度与岗位信息为原型模拟数据，不把个人偏好转换成不可解释的人才评分，也不构成真实录用承诺。</p></div></div></Card>

    <Button className="w-full" onClick={() => window.history.back()}>返回上一页</Button>
  </div></RequireCompetitionAccess></PublicShell>;
}

type RecommendCompany = {
  name: string;
  industry: string;
  subField: string;
  size: string;
  city: string;
  desc: string;
  directions: string[];
  skills: string[];
  jobs: { title: string; salary: string; requirement: string }[];
};

const recommendCompanies: RecommendCompany[] = [
  { name: "云澜电商", industry: "电子商务", subField: "平台电商", size: "中型（200-500人）", city: "杭州", desc: "国内领先的电商 SaaS 平台，为中小商家提供全链路数字化解决方案。", directions: ["运营 / 增长", "技术 / 研发"], skills: ["电商运营", "数据分析"], jobs: [{ title: "电商运营专员", salary: "6-10K", requirement: "熟悉主流电商平台运营玩法，具备数据分析能力。" }, { title: "数据分析师", salary: "9-16K", requirement: "熟练使用 SQL 完成取数与分析，能独立输出业务结论。" }] },
  { name: "跨境蜂", industry: "电子商务", subField: "跨境电商", size: "小型（50-200人）", city: "深圳", desc: "专注东南亚市场的跨境电商平台，年 GMV 突破 50 亿。", directions: ["运营 / 增长", "技术 / 研发"], skills: ["电商运营", "软件开发"], jobs: [{ title: "电商运营专员", salary: "6-10K", requirement: "熟悉跨境电商选品、上架与活动运营。" }, { title: "后端开发工程师", salary: "9-16K", requirement: "熟悉 Python/Django 或 Java 及主流 Web 框架。" }] },
  { name: "融慧金科", industry: "金融科技", subField: "风控科技", size: "中型（200-500人）", city: "上海", desc: "金融风控科技公司，为银行和消费金融公司提供智能风控解决方案。", directions: ["技术 / 研发", "产品 / 商业"], skills: ["数据分析", "软件开发"], jobs: [{ title: "数据分析师", salary: "9-16K", requirement: "熟悉 SQL 与常用分析工具，能独立完成经营分析报告。" }, { title: "风控算法工程师", salary: "12-20K", requirement: "熟悉机器学习算法，了解信贷风控评分卡或反欺诈模型。" }] },
  { name: "智链支付", industry: "金融科技", subField: "支付科技", size: "中型（200-500人）", city: "杭州", desc: "新一代聚合支付平台，支持全球 200+ 支付方式。", directions: ["技术 / 研发", "产品 / 商业"], skills: ["软件开发", "项目管理"], jobs: [{ title: "后端开发工程师", salary: "10-18K", requirement: "熟悉 Java/Go 及分布式框架，具备金融级高可用意识。" }, { title: "产品经理", salary: "9-15K", requirement: "能独立完成需求分析与 PRD，具备跨团队推进能力。" }] },
  { name: "深算智能", industry: "人工智能", subField: "AI 平台", size: "中型（200-500人）", city: "北京", desc: "企业级 AI 平台，提供从数据标注到模型部署的全流程解决方案。", directions: ["技术 / 研发"], skills: ["软件开发", "数据分析"], jobs: [{ title: "算法工程师", salary: "13-22K", requirement: "熟悉 Python 与深度学习框架，掌握常见模型训练方法。" }, { title: "AI 平台开发工程师", salary: "11-19K", requirement: "熟悉 Go/Java 及容器化部署，有平台开发经验者优先。" }] },
  { name: "数衍科技", industry: "人工智能", subField: "大数据分析", size: "中型（200-500人）", city: "杭州", desc: "大数据分析平台，为企业提供数据中台和 BI 解决方案。", directions: ["技术 / 研发"], skills: ["数据分析", "软件开发"], jobs: [{ title: "数据分析师", salary: "9-16K", requirement: "熟练使用 SQL 与 Python，能独立输出分析结论。" }, { title: "数据产品经理", salary: "9-16K", requirement: "理解数据产品与指标体系建设，能撰写 PRD。" }] },
  { name: "码峰科技", industry: "软件开发", subField: "企业 SaaS", size: "中型（200-500人）", city: "北京", desc: "企业级 SaaS 软件公司，提供 CRM、ERP 和协同办公解决方案。", directions: ["技术 / 研发"], skills: ["软件开发", "项目管理"], jobs: [{ title: "后端开发工程师", salary: "10-18K", requirement: "熟悉 Java/Spring 与主流数据库，了解高并发系统。" }, { title: "前端开发工程师", salary: "9-16K", requirement: "熟悉 React/Vue 与前端工程化，注重体验与性能。" }] },
  { name: "灵犀传媒", industry: "新媒体", subField: "短视频 MCN", size: "小型（50-200人）", city: "北京", desc: "头部 MCN 机构，旗下签约达人 500+，覆盖美食、美妆、旅行等领域。", directions: ["创意 / 内容", "运营 / 增长"], skills: ["内容创作", "市场营销"], jobs: [{ title: "内容运营专员", salary: "6-11K", requirement: "熟悉短视频平台内容生态，具备选题与排期能力。" }, { title: "短视频编导", salary: "7-12K", requirement: "能独立完成脚本、拍摄与剪辑，有作品者优先。" }] },
  { name: "声浪互娱", industry: "新媒体", subField: "直播电商", size: "小型（50-200人）", city: "杭州", desc: "直播电商服务商，提供直播运营、供应链和数据分析服务。", directions: ["运营 / 增长", "创意 / 内容"], skills: ["电商运营", "内容创作", "市场营销"], jobs: [{ title: "直播运营专员", salary: "6-10K", requirement: "熟悉直播带货流程，具备直播场控与复盘能力。" }, { title: "用户运营专员", salary: "6-10K", requirement: "具备社群与私域运营经验，能设计用户增长动作。" }] },
  { name: "物联云", industry: "物联网", subField: "IoT 平台", size: "中型（200-500人）", city: "杭州", desc: "一站式物联网云平台，提供设备管理、数据分析和应用开发。", directions: ["技术 / 研发"], skills: ["软件开发"], jobs: [{ title: "后端开发工程师", salary: "10-18K", requirement: "熟悉 Go/Java 与消息队列，了解设备接入协议。" }, { title: "IoT 平台开发工程师", salary: "11-19K", requirement: "熟悉 MQTT 等物联网协议，有设备平台经验者优先。" }] },
  { name: "速达智链", industry: "物流供应链", subField: "智慧物流", size: "中型（200-500人）", city: "上海", desc: "智慧物流平台，利用 AI 优化路径规划和运力调度。", directions: ["运营 / 增长", "技术 / 研发"], skills: ["供应链管理", "数据分析", "项目管理"], jobs: [{ title: "物流运营专员", salary: "6-10K", requirement: "熟悉仓储与配送流程，具备流程优化意识。" }, { title: "供应链算法工程师", salary: "11-19K", requirement: "熟悉 Python 与运筹优化，有路径规划项目经验者优先。" }] },
  { name: "知新教育", industry: "教育科技", subField: "在线教育", size: "中型（200-500人）", city: "北京", desc: "在线教育平台，覆盖 K12、考研、考公和职业技能培训。", directions: ["产品 / 商业", "创意 / 内容"], skills: ["内容创作", "市场营销", "项目管理"], jobs: [{ title: "产品经理", salary: "8-14K", requirement: "能独立完成需求分析与 PRD，具备跨团队推进能力。" }, { title: "内容运营专员", salary: "6-11K", requirement: "熟悉课程内容策划与用户运营，能持续产出内容。" }] },
];

function companyCityTier(city: string) {
  if (["北京", "上海", "广州", "深圳"].includes(city)) return "一线城市（北上广深）";
  if (["杭州", "成都", "南京", "武汉", "西安", "苏州", "重庆", "长沙"].includes(city)) return "新一线城市（杭州、成都等）";
  return "二线城市";
}

function matchCompanyScore(company: RecommendCompany, pref: { directions: string[]; cities: string[]; skills: string[]; sizes: string[] }) {
  let score = 0;
  if (pref.directions.length === 0 || pref.directions.includes("不限")) score += 30;
  else score += company.directions.some(direction => pref.directions.includes(direction)) ? 30 : 6;
  if (pref.cities.length === 0 || pref.cities.includes("不限，看机会")) score += 20;
  else score += pref.cities.includes(companyCityTier(company.city)) ? 20 : 4;
  if (pref.skills.length === 0 || pref.skills.includes("不限")) score += 20;
  else score += company.skills.some(skill => pref.skills.includes(skill)) ? 20 : 4;
  if (pref.sizes.length === 0 || pref.sizes.includes("不限")) score += 15;
  else score += pref.sizes.includes(company.size) ? 15 : 3;
  return Math.min(100, Math.max(35, score));
}

function recommendReason(company: RecommendCompany, pref: { directions: string[]; cities: string[]; skills: string[] }) {
  const parts: string[] = [];
  const directionHits = company.directions.filter(direction => pref.directions.includes(direction));
  if (directionHits.length) parts.push(`职业方向「${directionHits.join("、")}」匹配`);
  if (pref.cities.length && !pref.cities.includes("不限，看机会") && pref.cities.includes(companyCityTier(company.city))) parts.push(`城市「${company.city}」符合期望`);
  const skillHits = company.skills.filter(skill => pref.skills.includes(skill));
  if (skillHits.length) parts.push(`技能「${skillHits.join("、")}」对口`);
  if (!parts.length) parts.push("行业领域与你的探索方向相关");
  return parts.join("；") + "。";
}

function RecommendCompanyCard({ company, pref }: { company: RecommendCompany & { score: number }; pref: { directions: string[]; cities: string[]; skills: string[]; sizes: string[] } }) {
  const [submitted, setSubmitted] = useState(false);
  const [toggled, setToggled] = useState(false);
  const level = company.score >= 80 ? { label: `匹配度 ${company.score}%`, tone: "success" as const } : company.score >= 60 ? { label: `匹配度 ${company.score}%`, tone: "info" as const } : { label: `匹配度 ${company.score}%`, tone: "neutral" as const };
  return <Card data-testid={`s6-job-company-${company.name}`}>
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-2"><Building2 size={18} aria-hidden="true" className="text-info-text" /><h2 className="font-semibold text-text-primary">{company.name}</h2></div>
      <StatusTag tone={level.tone}>{level.label}</StatusTag>
    </div>
    <div className="mt-3 flex flex-wrap gap-2">{([company.industry, company.subField, company.size, company.city]).map(item => <StatusTag key={item} tone="neutral">{item}</StatusTag>)}</div>
    <p className="mt-3 text-sm leading-5 text-text-secondary">{company.desc}</p>
    <div className="mt-3 rounded-control bg-surface-subtle p-3"><p className="text-xs font-medium text-text-brand">热门岗位</p><div className="mt-2 space-y-2">{company.jobs.map(job => <div key={job.title}><div className="flex items-center justify-between gap-2"><span className="text-sm font-medium text-text-primary">{job.title}</span><span className="text-xs font-semibold text-info-text">参考月薪 {job.salary}</span></div><p className="mt-1 text-xs leading-5 text-text-secondary">{job.requirement}</p></div>)}</div></div>
    <div className="mt-3 rounded-control bg-warning-bg p-3"><p className="text-xs font-medium text-warning-text">推荐理由</p><p className="mt-1 text-sm leading-5 text-text-primary">{recommendReason(company, pref)}</p></div>
    <div className="mt-3 flex items-center gap-2">
      <Button className="flex-1" disabled={submitted} onClick={() => setSubmitted(true)}>{submitted ? "已投递（模拟）" : "一键投递（模拟）"}</Button>
      <SecondaryButton onClick={() => setToggled(current => !current)}>{toggled ? "收起说明" : "查看说明"}</SecondaryButton>
    </div>
    {toggled && <div className="mt-3 rounded-control border border-border-subtle bg-surface p-3"><p className="text-xs text-text-secondary">原型说明：投递为模拟操作，不会真实发送简历；岗位与薪资信息为模拟数据，不构成真实录用承诺。</p></div>}
  </Card>;
}

const careerJobs = [
  { title: "数据分析师", cat: "技术 / 数据", abilities: ["数据分析", "逻辑思考"], interests: ["研究分析、探究问题背后的原理", "整理流程、处理数据、把事情安排有序"], summary: "面向运营与业务结果做指标拆解、归因分析与数据口径梳理。" },
  { title: "运营助理 / 电商运营", cat: "运营 / 增长", abilities: ["数据分析", "执行细致", "组织协调"], interests: ["整理流程、处理数据、把事情安排有序", "带领团队、推动项目、争取资源"], summary: "围绕店铺 / 账号做选品、活动、内容与复盘，用数据验证增长假设。" },
  { title: "新媒体运营", cat: "创意 / 内容", abilities: ["文案写作", "创意设计", "沟通表达"], interests: ["创意设计、写作、视频或内容创作"], summary: "负责账号定位、内容选题与发布节奏，用内容带动关注与转化。" },
  { title: "产品助理", cat: "产品 / 商业", abilities: ["逻辑思考", "沟通表达"], interests: ["研究分析、探究问题背后的原理", "帮助他人、教学、服务或协作支持"], summary: "参与需求收集、原型梳理与跨团队协作，推动功能落地。" },
  { title: "内容编辑", cat: "创意 / 内容", abilities: ["文案写作", "执行细致"], interests: ["创意设计、写作、视频或内容创作"], summary: "围绕专题完成选题、撰写与排版，沉淀可复用内容资产。" },
  { title: "社群运营", cat: "运营 / 增长", abilities: ["沟通表达", "文案写作", "组织协调"], interests: ["帮助他人、教学、服务或协作支持", "带领团队、推动项目、争取资源"], summary: "负责社群氛围、活动组织与用户沟通，提升活跃与复购。" },
  { title: "UI 设计助理", cat: "创意 / 内容", abilities: ["创意设计", "逻辑思考"], interests: ["创意设计、写作、视频或内容创作"], summary: "参与界面视觉、组件与设计规范，把需求转成可交付稿。" },
  { title: "市场调研助理", cat: "产品 / 商业", abilities: ["数据分析", "逻辑思考", "沟通表达"], interests: ["研究分析、探究问题背后的原理"], summary: "负责用户访谈、问卷与竞品信息收集，输出可落地的调研结论。" },
];

function buildProfileTags(interests: string[], abilities: string[], goal: string) {
  const tags: string[] = [];
  const all = [...interests, ...abilities];
  if (goal && goal !== "暂时还不确定，想先探索") tags.push(goal);
  if (all.some(value => value.includes("研究分析") || value === "数据分析" || value === "逻辑思考")) tags.push("数据驱动型");
  if (all.some(value => value.includes("创意设计") || value === "文案写作" || value === "创意设计")) tags.push("内容创作型");
  if (all.some(value => value === "沟通表达" || value === "组织协调" || value.includes("帮助他人"))) tags.push("协作沟通型");
  if (all.some(value => value === "执行细致" || value.includes("整理流程"))) tags.push("执行落地型");
  if (all.some(value => value.includes("带领团队") || value === "组织协调")) tags.push("项目推动型");
  if (tags.length === 0) tags.push("方向探索型");
  return tags.slice(0, 3);
}

function matchCareerJobs(interests: string[], abilities: string[], goal: string) {
  return careerJobs
    .map(job => {
      const abilityScore = job.abilities.filter(ability => abilities.includes(ability)).length;
      const interestScore = job.interests.filter(interest => interests.includes(interest)).length;
      const goalScore = goal === "技术 / 数据方向" && job.cat === "技术 / 数据" ? 1 : goal === "运营 / 增长方向" && job.cat === "运营 / 增长" ? 1 : goal === "创意 / 内容方向" && job.cat === "创意 / 内容" ? 1 : goal === "产品 / 商业方向" && job.cat === "产品 / 商业" ? 1 : 0;
      return { ...job, score: abilityScore * 2 + interestScore + goalScore };
    })
    .sort((a, b) => b.score - a.score);
}

function matchLevel(score: number) {
  if (score >= 3) return { label: "高匹配", tone: "success" as const };
  if (score >= 1) return { label: "中匹配", tone: "warning" as const };
  return { label: "探索方向", tone: "neutral" as const };
}

function S6CareerAdvisorResult({ competitionId, resultId }: { competitionId: string; resultId: string }) {
  const { getRuntime } = useWorkshopRuntime();
  const runtime = getRuntime(competitionId);
  const run = runtime.taskRuns["s6-career-advisor"];
  const result = resultById(resultId);
  const selections = run?.selections ?? {};
  const stage = selections.stage?.[0] ?? "未填写";
  const major = selections.major?.[0] ?? "未填写";
  const interests = selections.interests ?? [];
  const abilities = selections.abilities ?? [];
  const city = selections.city?.[0] ?? "未填写";
  const industries = selections.industry ?? [];
  const goal = selections.goal?.[0] ?? "未填写";
  const profileTags = buildProfileTags(pickOptions(interests), pickOptions(abilities), goal);
  const recommended = matchCareerJobs(pickOptions(interests), pickOptions(abilities), goal).slice(0, 3);
  const profileSummary = `${stage} · ${major}。方向偏好：${goal}；重点关注${city}${industries.length ? " 与 " + industries.join("、") : ""}。基于兴趣与能力的交集生成画像标签与岗位方向，仅作为职业探索建议。`;
  const pathSteps = [
    { period: "近期 · 0-6 个月", text: "围绕推荐岗位补齐 1-2 项核心能力，用赛事与课程经历补一段可验证的项目描述。" },
    { period: "中期 · 6-18 个月", text: "进入目标行业实习或项目实践，积累可量化成果，验证画像与岗位方向的匹配度。" },
    { period: "长期 · 2-3 年", text: "形成“能力 - 作品 - 结果”三件套表达，结合岗位推荐结果收敛求职目标。" },
  ];

  return <PublicShell showNavigation={false}><PageHeader title="职业画像成果" backTo={`/competitions/${competitionId}/workspace/workshop/results`} /><RequireCompetitionAccess><div className="space-y-6 px-4 py-5">
    <CompetitionContextLine competitionId={competitionId} />

    <Card className="border border-info bg-info-bg" data-testid="s6-career-private-visibility"><div className="flex items-start gap-3"><EyeOff size={20} aria-hidden="true" className="text-info-text" /><div><p className="font-medium text-info-text">生成结果仅自己可见</p><p className="mt-2 text-sm leading-5 text-info-text">这是个人职业探索建议，不进入团队成果确认，也不会写入 StudentProfile、比赛成绩、证书或其它可信事实。</p></div></div></Card>

    <Card>
      <p className="text-xs font-medium text-text-brand">S6 · 职业发展 / 职业顾问</p>
      <h1 className="mt-2 text-xl font-semibold leading-7 text-text-primary">职业画像与岗位建议</h1>
      <p className="mt-4 text-sm leading-6 text-text-secondary">{result?.summary ?? "结合专业、兴趣、能力与城市行业偏好，形成可进一步验证的职业探索方向。"}</p>
    </Card>

    <Section title="职业画像"><Card data-testid="s6-career-profile"><div className="flex flex-wrap gap-2">{profileTags.map(tag => <StatusTag key={tag} tone="info">{tag}</StatusTag>)}</div><p className="mt-3 text-sm leading-6 text-text-primary">{profileSummary}</p></Card></Section>

    <Section title="事实输入"><Card data-testid="s6-career-fact-input"><div className="grid grid-cols-2 gap-3"><div><p className="text-xs text-text-secondary">所在阶段</p><p className="mt-1 text-sm font-medium text-text-primary">{stage}</p></div><div><p className="text-xs text-text-secondary">专业类别</p><p className="mt-1 text-sm font-medium text-text-primary">{major}</p></div><div><p className="text-xs text-text-secondary">理想城市</p><p className="mt-1 text-sm font-medium text-text-primary">{city}</p></div><div><p className="text-xs text-text-secondary">职业目标</p><p className="mt-1 text-sm font-medium text-text-primary">{goal}</p></div></div>{industries.length > 0 && <p className="mt-3 border-t border-border-subtle pt-3 text-xs text-text-secondary">行业偏好：<span className="font-medium text-text-primary">{industries.join("、")}</span></p>}</Card></Section>

    <Section title="AI 推荐岗位" subtitle="建议，不是人才评分"><div className="space-y-3">{recommended.map(job => { const level = matchLevel(job.score); return <Card key={job.title} data-testid={`s6-career-job-${job.title}`}><div className="flex items-start gap-3"><div className="rounded-control bg-info-bg p-2 text-info-text"><Sparkles size={20} aria-hidden="true" /></div><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><h2 className="font-semibold text-text-primary">{job.title}</h2><StatusTag tone={level.tone}>{level.label}</StatusTag></div><p className="mt-1 text-xs text-text-brand">{job.cat}</p><p className="mt-2 text-sm leading-5 text-text-secondary">{job.summary}</p></div></div></Card>; })}</div></Section>

    <Section title="发展路径"><div className="space-y-3">{pathSteps.map(step => <Card key={step.period} data-testid={`s6-career-path-${step.period}`}><div className="flex items-start gap-3"><div className="rounded-control bg-info-bg p-2 text-info-text"><TrendingUp size={18} aria-hidden="true" /></div><div className="min-w-0 flex-1"><h2 className="text-sm font-semibold text-text-primary">{step.period}</h2><p className="mt-1 text-sm leading-5 text-text-secondary">{step.text}</p></div></div></Card>)}</div></Section>

    <Card className="border border-warning bg-warning-bg" data-testid="s6-career-no-score"><div className="flex items-start gap-3"><FileText size={20} aria-hidden="true" className="text-warning-text" /><div><p className="font-medium text-warning-text">没有“人才总分”</p><p className="mt-2 text-sm leading-5 text-warning-text">画像与岗位只说明探索方向与匹配理由，不把赛事表现或个人自评转换成不可解释的人才评分。</p></div></div></Card>

    <Button className="w-full" onClick={() => window.history.back()}>返回上一页</Button>
  </div></RequireCompetitionAccess></PublicShell>;
}

function S6ExperienceTransformResult({ competitionId, resultId }: { competitionId: string; resultId: string }) {
  const { getRuntime } = useWorkshopRuntime();
  const runtime = getRuntime(competitionId);
  const run = runtime.taskRuns["s6-experience-transform"];
  const result = resultById(resultId);
  const s = run?.selections ?? {};
  const level = s.level?.[0] ?? "未填写";
  const role = s.role?.[0] ?? "未填写";
  const resultText = s.result?.[0] ?? "未填写";
  const projectDuty = s.projectDuty?.[0] ?? "";
  const skills = pickOptions(s.skills ?? []);
  const ach = s.ach?.[0] ?? "";
  const skillText = skills.length ? skills.join("、") : "团队协作";
  const dutyBrief = projectDuty || "在比赛中承担团队角色并推进项目落地";

  const resumes = [
    { title: "版本一 · 量化成果版", body: `以${role}身份参与${level}赛事并取得${resultText}，${dutyBrief}。通过 ${skillText} 等能力推动项目从方案到落地，为团队贡献关键成果。` },
    { title: "版本二 · 精炼概述版", body: `${level}赛事参与者，担任${role}，擅长${skillText}，在项目推进中负责核心执行并取得${resultText}。` },
    { title: "版本三 · 岗位导向版", body: `具备${skillText}等与目标岗位强相关的经历：在${level}赛事中承担${role}，${dutyBrief}，最终取得${resultText}。` },
  ];
  const interviews = [
    { q: "请先做一个自我介绍。", a: `我来自${role}背景，在${level}赛事中负责项目推进，重点积累了 ${skillText} 相关经验，希望把这些能力带入目标岗位。` },
    { q: "你在团队中具体负责什么？", a: `我担任${role}，${dutyBrief}，通过${skillText}支撑团队达成目标。` },
    { q: "讲一个你遇到的最大挑战及解决过程。", a: ach ? `比赛中最有挑战的是${ach}，我通过拆解问题、联动队友逐步解决，最终稳定交付。` : `比赛中最大的挑战是资源有限，我通过拆解目标和复用已有素材，在期限内完成关键交付。` },
    { q: "你是怎么和团队协作的？", a: `我习惯先对齐目标再分工，定期同步进度，遇到分歧用数据和实验说话，保证团队朝同一方向推进。` },
    { q: "这段经历给你带来什么收获？", a: `除了${skillText}的能力提升，我更理解如何把想法变成结果，也明确了自己在团队中最适合的发力位置。` },
  ];
  const suggestions = [
    `用「动词开头 + 数据佐证」的句式写简历，例如"主导…提升了 30%"，比罗列职责更有冲击力。`,
    `把与目标岗位强相关的 ${skillText.split("、")[0] ?? "能力"} 等 2-3 个能力标签放在简历最显眼位置。`,
    ach ? `把这段关键成就写进面试的"最大挑战"回答：先说结论、再讲过程、最后落到结果。` : `补充一段用 STAR 法则写的关键成就，面试官最想听到你如何解决问题、带来结果。`,
  ];

  return <PublicShell showNavigation={false}><PageHeader title="经历转化成果" backTo={`/competitions/${competitionId}/workspace/workshop/results`} /><RequireCompetitionAccess><div className="space-y-6 px-4 py-5">
    <CompetitionContextLine competitionId={competitionId} />
    <Card className="border border-info bg-info-bg" data-testid="s6-exp-private-visibility"><div className="flex items-start gap-3"><EyeOff size={20} aria-hidden="true" className="text-info-text" /><div><p className="font-medium text-info-text">生成结果仅自己可见</p><p className="mt-2 text-sm leading-5 text-info-text">这是个人求职表达建议，不进入团队成果确认，也不会写入 StudentProfile、比赛成绩、证书或其它可信事实。</p></div></div></Card>
    <Card><p className="text-xs font-medium text-text-brand">S6 · 职业发展 / 经历转化</p><h1 className="mt-2 text-xl font-semibold leading-7 text-text-primary">简历与面试表达</h1><p className="mt-4 text-sm leading-6 text-text-secondary">{result?.summary ?? "把比赛经历按 STAR 法则转成简历语言、面试话术与作品集证明。"}</p></Card>
    <Section title="事实输入"><Card data-testid="s6-exp-fact-input"><div className="grid grid-cols-2 gap-3"><div><p className="text-xs text-text-secondary">赛事级别</p><p className="mt-1 text-sm font-medium text-text-primary">{level}</p></div><div><p className="text-xs text-text-secondary">队伍角色</p><p className="mt-1 text-sm font-medium text-text-primary">{role}</p></div><div><p className="text-xs text-text-secondary">比赛成果</p><p className="mt-1 text-sm font-medium text-text-primary">{resultText}</p></div><div><p className="text-xs text-text-secondary">锻炼能力</p><p className="mt-1 text-sm font-medium text-text-primary">{skillText}</p></div></div>{projectDuty && <p className="mt-3 border-t border-border-subtle pt-3 text-xs text-text-secondary">项目与职责：<span className="font-medium text-text-primary">{projectDuty}</span></p>}{ach && <p className="mt-2 border-t border-border-subtle pt-3 text-xs text-text-secondary">关键成就：<span className="font-medium text-text-primary">{ach}</span></p>}</Card></Section>
    <Section title="简历语言" subtitle="STAR 法则生成三版本"><div className="space-y-3">{resumes.map(item => <Card key={item.title} data-testid={`s6-exp-resume-${item.title.slice(3, 5)}`}><h2 className="font-semibold text-text-primary">{item.title}</h2><p className="mt-2 text-sm leading-5 text-text-secondary">{item.body}</p></Card>)}</div></Section>
    <Section title="面试话术示例"><div className="space-y-3">{interviews.map(item => <Card key={item.q}><p className="text-sm font-semibold text-text-primary">Q：{item.q}</p><p className="mt-2 text-sm leading-5 text-text-secondary">A：{item.a}</p></Card>)}</div></Section>
    <Section title="作品集证明"><Card data-testid="s6-exp-proof"><div className="flex flex-wrap gap-2">{skills.length ? skills.map(skill => <StatusTag key={skill} tone="info">{skill}</StatusTag>) : <StatusTag tone="neutral">团队协作</StatusTag>}</div><p className="mt-3 text-sm leading-5 text-text-secondary">以上能力标签基于赛事经历生成，可配合获奖证书、项目截图与作品链接作为求职证明素材；获奖信息需本人核验。</p></Card></Section>
    <Section title="优化建议"><Card data-testid="s6-exp-suggest"><div className="space-y-2">{suggestions.map((text, index) => <p key={`${text}-${index}`} className="text-sm leading-5 text-text-primary">· {text}</p>)}</div></Card></Section>
    <Card className="border border-warning bg-warning-bg" data-testid="s6-exp-no-score"><div className="flex items-start gap-3"><FileText size={20} aria-hidden="true" className="text-warning-text" /><div><p className="font-medium text-warning-text">不是人才评分</p><p className="mt-2 text-sm leading-5 text-warning-text">简历与面试表达为原型模拟文本，不把赛事表现转换成不可解释的人才评分，获奖信息请以官方证书为准。</p></div></div></Card>
    <Button className="w-full" onClick={() => window.history.back()}>返回上一页</Button>
  </div></RequireCompetitionAccess></PublicShell>;
}

const qualityDims = [
  { key: "interest", name: "兴趣倾向", ids: ["interest1", "interest2", "interest3", "interest4"] },
  { key: "personality", name: "性格特质", ids: ["personality1", "personality2", "personality3", "personality4"] },
  { key: "ability", name: "能力优势", ids: ["ability1", "ability2", "ability3", "ability4"] },
  { key: "value", name: "价值取向", ids: ["value1", "value2", "value3", "value4"] },
] as const;

function qualityTendency(top: string) {
  if (top === "interest") return { title: "兴趣驱动型", text: "你更容易从「喜欢做什么」出发选择方向，适合从创意、内容、探索类岗位切入。" };
  if (top === "personality") return { title: "特质驱动型", text: "你的性格优势更突出，适合从协作、管理、执行类岗位切入，靠稳定与条理建立信任。" };
  if (top === "ability") return { title: "能力驱动型", text: "你的能力长板更明显，适合从技术、数据、表达类岗位切入，用可量化的能力说话。" };
  return { title: "价值驱动型", text: "你更看重工作带来的意义与回报，适合选择与个人价值观契合的行业与团队。" };
}

function S6QualityTestResult({ competitionId, resultId }: { competitionId: string; resultId: string }) {
  const { getRuntime } = useWorkshopRuntime();
  const runtime = getRuntime(competitionId);
  const run = runtime.taskRuns["s6-quality-test"];
  const result = resultById(resultId);
  const s = run?.selections ?? {};
  const scores = qualityDims.map(dim => {
    const raw = dim.ids.reduce((sum, id) => sum + Number(s[id]?.[0] ?? 3), 0);
    return { ...dim, raw, pct: Math.round(((raw - 4) / 16) * 100) };
  });
  const top = [...scores].sort((a, b) => b.raw - a.raw)[0];
  const tendency = qualityTendency(top.key);
  const weak = [...scores].sort((a, b) => a.raw - b.raw)[0];
  const advices = [
    `你的优势维度是「${top.name}」（得分 ${top.raw}/20），求职表达里优先放大这一面。`,
    `相对薄弱的是「${weak.name}」（得分 ${weak.raw}/20），可结合赛事与项目经历刻意补强 1-2 项相关能力。`,
    "雷达图与职业倾向仅用于自我探索，不构成能力评分，也不要据此否定自己。",
  ];

  return <PublicShell showNavigation={false}><PageHeader title="素养画像成果" backTo={`/competitions/${competitionId}/workspace/workshop/results`} /><RequireCompetitionAccess><div className="space-y-6 px-4 py-5">
    <CompetitionContextLine competitionId={competitionId} />
    <Card className="border border-info bg-info-bg" data-testid="s6-quality-private-visibility"><div className="flex items-start gap-3"><EyeOff size={20} aria-hidden="true" className="text-info-text" /><div><p className="font-medium text-info-text">生成结果仅自己可见</p><p className="mt-2 text-sm leading-5 text-info-text">这是个人自我探索建议，不进入团队成果确认，也不会写入 StudentProfile、比赛成绩、证书或其它可信事实。</p></div></div></Card>
    <Card><p className="text-xs font-medium text-text-brand">S6 · 职业发展 / 素养测评</p><h1 className="mt-2 text-xl font-semibold leading-7 text-text-primary">职业素养画像</h1><p className="mt-4 text-sm leading-6 text-text-secondary">{result?.summary ?? "从兴趣、性格、能力与价值取向四维自评，生成能力雷达与职业倾向。"}</p></Card>
    <Section title="能力雷达图" subtitle="四维得分（满分 20）"><Card data-testid="s6-quality-radar"><div className="space-y-4">{scores.map(dim => <div key={dim.key}><div className="flex items-center justify-between text-sm"><span className="text-text-secondary">{dim.name}</span><strong className="text-text-primary">{dim.raw}/20</strong></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-border-subtle"><div className="h-full bg-primary" style={{ width: `${dim.pct}%` }} /></div></div>)}</div></Card></Section>
    <Section title="职业倾向推荐"><Card data-testid="s6-quality-tendency"><div className="flex items-start gap-3"><Compass size={20} aria-hidden="true" className="text-info-text" /><div><h2 className="font-semibold text-text-primary">{tendency.title}</h2><p className="mt-1 text-sm leading-5 text-text-secondary">{tendency.text}</p></div></div></Card></Section>
    <Section title="AI 个性化解读"><Card data-testid="s6-quality-ai"><div className="flex items-start gap-3"><Sparkles size={20} aria-hidden="true" className="text-info-text" /><div className="space-y-2">{advices.map((text, index) => <p key={`${text}-${index}`} className="text-sm leading-5 text-text-primary">· {text}</p>)}</div></div></Card></Section>
    <Section title="提升建议"><Card data-testid="s6-quality-advice"><div className="space-y-2"><p className="text-sm leading-5 text-text-primary">· 围绕优势维度「{top.name}」找 1-2 个可验证的项目或比赛经历，把自评变成可展示的成果。</p><p className="text-sm leading-5 text-text-primary">· 针对薄弱维度「{weak.name}」制定一个小目标，例如通过课程、实践或协作场景刻意练习。</p><p className="text-sm leading-5 text-text-primary">· 可结合职业顾问与岗位推荐，把素养画像收敛成具体岗位方向。</p></div></Card></Section>
    <Card className="border border-warning bg-warning-bg" data-testid="s6-quality-no-score"><div className="flex items-start gap-3"><FileText size={20} aria-hidden="true" className="text-warning-text" /><div><p className="font-medium text-warning-text">不是能力评分</p><p className="mt-2 text-sm leading-5 text-warning-text">四维得分来自本人自评，仅供自我探索参考，不构成能力评分，也不代表任何录取或比赛结论。</p></div></div></Card>
    <Button className="w-full" onClick={() => window.history.back()}>返回上一页</Button>
  </div></RequireCompetitionAccess></PublicShell>;
}

export function T013CResultDetailPage() {
  const { competitionId, resultId } = useParams();
  if (!competitionId || !resultId || !specialResultIds.has(resultId)) return <T013BResultDetailPage />;
  return <ResultGate competitionId={competitionId} resultId={resultId}>
    {resultId === "result-s5-pitch-ppt"
      ? <S5PptResult competitionId={competitionId} resultId={resultId} />
      : resultId === "result-s6-job-recommend"
        ? <S6JobRecommendResult competitionId={competitionId} resultId={resultId} />
        : resultId === "result-s6-experience-transform"
          ? <S6ExperienceTransformResult competitionId={competitionId} resultId={resultId} />
          : resultId === "result-s6-quality-test"
            ? <S6QualityTestResult competitionId={competitionId} resultId={resultId} />
            : <S6CareerAdvisorResult competitionId={competitionId} resultId={resultId} />}
  </ResultGate>;
}

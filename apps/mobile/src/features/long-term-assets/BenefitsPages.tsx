import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { ChevronRight, Coins, Info, Phone, Search, ShoppingBag, Sparkles, TrendingUp, Wallet } from "lucide-react";
import { Dialog } from "@core/shared";
import { Button, Card, GhostButton, PageHeader, PublicShell, SecondaryButton, Section, StatusTag } from "../../components/ui";
import { benefitById, benefits, exchangeItemById, exchangeItems, learningCreditRecords, type BenefitStatus } from "./data";
import { InfoFeedAdCard, mockRewardedAds, RewardedVideoAd, useInfoFeedAd } from "./Ads";
import { SourceLine, useAccountAction, useAccountLoggedIn } from "./shared";
import { useLongTermAssets } from "./store";

const benefitLabel: Record<BenefitStatus, string> = {
  eligible: "可领取",
  ineligible: "无资格",
  claimed: "待使用",
  used: "已使用",
  expired: "已失效",
};

const benefitTone = (status: BenefitStatus) => status === "eligible" ? "success" : status === "claimed" ? "info" : status === "ineligible" ? "warning" : "neutral";

function useBenefitSourceContext() {
  const location = useLocation();
  const competitionId = new URLSearchParams(location.search).get("competition");
  const query = competitionId ? `?competition=${encodeURIComponent(competitionId)}` : "";
  return { competitionId, query, backTo: competitionId ? `/competitions/${competitionId}/workspace` : undefined };
}

function PhoneBindingBanner({ returnTo }: { returnTo: string }) {
  const { profile } = useLongTermAssets();
  const bound = Boolean(profile.phone && profile.phoneVerified === "verified");
  const maskedPhone = profile.phone ? `${profile.phone.slice(0, 3)} **** ${profile.phone.slice(7)}` : "";
  return (
    <Card className={`flex items-center gap-3 ${bound ? "border border-success bg-success-bg" : "border border-warning bg-warning-bg"}`}>
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-container text-text-brand">
        <Phone size={18} aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-medium ${bound ? "text-success-text" : "text-warning-text"}`}>
          {bound ? `已绑定手机号 ${maskedPhone}` : "未绑定手机号"}
        </p>
        <p className={`text-xs ${bound ? "text-success-text/80" : "text-warning-text/80"}`}>
          {bound ? "领取打车券等权益时无需重复输入" : "部分权益（如打车券）需绑定手机号后领取"}
        </p>
      </div>
      {!bound && (
        <Link to={`/me/profile?returnTo=${encodeURIComponent(returnTo)}`} className="shrink-0 text-sm font-medium text-text-brand">
          去绑定
        </Link>
      )}
    </Card>
  );
}

const currentCredits = 1280;

function CreditCard() {
  return <Card className="relative overflow-hidden bg-gradient-to-br from-primary to-[#7569ff] p-5 text-on-primary">
    <div className="relative z-10">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm font-medium opacity-90"><Coins size={18} aria-hidden="true" />我的学力值</span>
        <Link to="/benefits/credits" className="flex items-center gap-1 text-xs font-medium opacity-90">查看明细<ChevronRight size={14} aria-hidden="true" /></Link>
      </div>
      <p className="mt-3 text-4xl font-bold tracking-tight">{currentCredits}</p>
      <p className="mt-1 text-xs opacity-75">数据为原型占位，学力值经济模型待 F04 决策</p>
      <div className="mt-4 flex gap-2">
        <Link to="/benefits/free" className="min-h-touch flex flex-1 items-center justify-center rounded-control bg-white/15 px-3 py-2 text-center text-sm font-medium">免费福利</Link>
        <Link to="/benefits/exchange" className="min-h-touch flex flex-1 items-center justify-center rounded-control bg-white px-3 py-2 text-center text-sm font-semibold text-text-brand">兑换中心</Link>
      </div>
    </div>
    <Sparkles className="absolute bottom-3 right-3 opacity-10" size={80} aria-hidden="true" />
  </Card>;
}

function BenefitListItem({ item, status }: { item: typeof benefits[number]; status?: BenefitStatus }) {
  return <Link to={`/benefits/${item.id}`} className="block"><Card interactive className="space-y-3"><SourceLine source={item.source} /><div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold text-text-primary">{item.title}</h2><p className="mt-1 text-sm leading-5 text-text-secondary">{item.summary}</p></div>{status ? <StatusTag tone={benefitTone(status)}>{benefitLabel[status]}</StatusTag> : <StatusTag tone="neutral">登录查看资格</StatusTag>}</div>{item.expiresAt && <p className="text-xs text-text-tertiary">有效期至 {item.expiresAt}</p>}</Card></Link>;
}

export function BenefitsPage() {
  const loggedIn = useAccountLoggedIn();
  const { benefitStatusFor } = useLongTermAssets();
  const { competitionId, query, backTo } = useBenefitSourceContext();
  const eligibleBenefits = useMemo(() => benefits.filter(item => {
    if (competitionId && (item.source.type !== "competition" || item.source.competitionId !== competitionId)) return false;
    return loggedIn ? ["eligible", "claimed"].includes(benefitStatusFor(item.id)) : true;
  }).slice(0, 2), [benefitStatusFor, competitionId, loggedIn]);
  const recommendedExchange = exchangeItems.filter(item => item.status !== "outOfStock").slice(0, 2);
  return <PublicShell><PageHeader title={competitionId ? "赛事福利" : "创赛福利"} subtitle="学力值、免费福利与兑换中心" backTo={backTo ?? "/home"} /><div className="space-y-5 px-4 py-5">{loggedIn && <PhoneBindingBanner returnTo={`/benefits${query}`} />}<CreditCard />
    <Section title="推荐免费福利" action={<Link to="/benefits/free" className="text-sm font-medium text-text-brand">查看全部</Link>}><div className="space-y-3">{eligibleBenefits.length ? eligibleBenefits.map(item => <BenefitListItem key={item.id} item={item} status={loggedIn ? benefitStatusFor(item.id) : undefined} />) : <Card><p className="text-sm text-text-secondary">当前没有可领取的免费福利。</p></Card>}</div></Section>
    <Section title="推荐兑换" action={<Link to="/benefits/exchange" className="text-sm font-medium text-text-brand">兑换中心</Link>}><div className="grid grid-cols-2 gap-3">{recommendedExchange.map(item => <Link key={item.id} to={`/benefits/exchange/${item.id}`} className="block"><Card interactive className="flex h-full flex-col"><div className="flex size-9 items-center justify-center rounded-[14px] bg-primary-container text-text-brand"><ShoppingBag size={18} aria-hidden="true" /></div><h3 className="mt-3 line-clamp-2 text-sm font-semibold text-text-primary">{item.title}</h3><p className="mt-1 line-clamp-2 text-xs text-text-secondary">{item.summary}</p><div className="mt-auto flex items-center gap-1 pt-3 text-sm font-semibold text-text-brand"><Coins size={14} aria-hidden="true" />{item.cost}</div></Card></Link>)}</div></Section>
    <Card className="border border-border-subtle"><p className="text-sm leading-5 text-text-secondary">福利板块展示平台、赛事、企业与活动来源的权益与兑换内容。学力值数额与经济规则为原型占位，正式规则由 F04 产品决策后替换。</p></Card>
  </div></PublicShell>;
}

export function FreeBenefitsPage() {
  const loggedIn = useAccountLoggedIn();
  const { benefitStatusFor } = useLongTermAssets();
  const { competitionId, query } = useBenefitSourceContext();
  const [filter, setFilter] = useState<"all" | "available" | "history">("available");
  const visible = useMemo(() => benefits.filter(item => {
    if (competitionId && (item.source.type !== "competition" || item.source.competitionId !== competitionId)) return false;
    if (!loggedIn) return filter === "all";
    const status = benefitStatusFor(item.id);
    return filter === "all" || (filter === "available" ? ["eligible", "claimed"].includes(status) : ["used", "expired"].includes(status));
  }), [benefitStatusFor, competitionId, filter, loggedIn]);
  return <PublicShell><PageHeader title="全部免费福利" subtitle="平台、赛事、企业与活动来源的权益" backTo="/benefits" /><div className="space-y-5 px-4 py-5">{loggedIn && <PhoneBindingBanner returnTo={`/benefits/free${query}`} />}{loggedIn && <div className="flex gap-2">{(["all","available","history"] as const).map(value => <button key={value} onClick={() => setFilter(value)} className={`min-h-touch rounded-control px-3 text-sm font-medium ${filter === value ? "bg-primary-container text-text-brand" : "bg-surface text-text-secondary"}`}>{value === "all" ? "全部" : value === "available" ? "可领取 / 待使用" : "历史"}</button>)}</div>}<div className="space-y-3">{visible.length ? visible.map(item => <BenefitListItem key={item.id} item={item} status={loggedIn ? benefitStatusFor(item.id) : undefined} />) : <Card><p className="text-sm text-text-secondary">当前条件下没有可展示的免费福利。</p></Card>}</div></div></PublicShell>;
}

const categoryTabs = [
  { value: "all" as const, label: "全部" },
  { value: "course" as const, label: "课程" },
  { value: "ticket" as const, label: "入场券" },
  { value: "virtual" as const, label: "会员权益" },
];

const filterTabs = [
  { value: "default" as const, label: "默认" },
  { value: "claimed" as const, label: "销量" },
  { value: "costAsc" as const, label: "学力值" },
] as const;

export function ExchangeCenterPage() {
  const [category, setCategory] = useState<typeof categoryTabs[number]["value"]>("all");
  const [filter, setFilter] = useState<typeof filterTabs[number]["value"]>("default");
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    let list = exchangeItems.filter(item => category === "all" || item.category === category);
    if (query.trim()) list = list.filter(item => item.title.includes(query.trim()) || item.summary.includes(query.trim()));
    if (filter === "costAsc") list.sort((a, b) => a.cost - b.cost);
    if (filter === "claimed") list.sort((a, b) => b.claimedCount - a.claimedCount);
    return list;
  }, [category, filter, query]);
  return <PublicShell><PageHeader title="兑换中心" subtitle="搜索并使用学力值兑换" backTo="/benefits" />
    <div className="flex h-[calc(100dvh-104px)] flex-col">
      <div className="shrink-0 border-b border-border-subtle bg-surface px-4 py-3">
        <div className="flex items-center gap-2 rounded-control bg-surface px-3 py-2">
          <Search size={18} className="text-text-tertiary" aria-hidden="true" />
          <input value={query} onChange={event => setQuery(event.target.value)} placeholder="搜索可兑换项目" className="flex-1 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-tertiary" />
        </div>
      </div>
      <div className="flex min-h-0 flex-1">
        <nav className="w-20 shrink-0 overflow-y-auto border-r border-border-subtle bg-surface py-2">
          {categoryTabs.map(tab => <button key={tab.value} onClick={() => setCategory(tab.value)} className={`block w-full px-2 py-3 text-center text-xs font-medium transition ${category === tab.value ? "bg-primary-container text-text-brand" : "text-text-secondary"}`}>{tab.label}</button>)}
        </nav>
        <div className="min-w-0 flex-1 overflow-y-auto bg-background p-3">
          <div className="flex gap-2 overflow-x-auto pb-2">{filterTabs.map(tab => <button key={tab.value} onClick={() => setFilter(tab.value)} className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${filter === tab.value ? "bg-primary text-on-primary" : "bg-surface text-text-secondary"}`}>{tab.label}</button>)}</div>
          <div className="grid grid-cols-2 gap-3 pt-1">{filtered.map(item => <Link key={item.id} to={`/benefits/exchange/${item.id}`} className="block"><Card interactive className="flex h-full flex-col"><div className="flex items-start justify-between"><span className="flex size-9 items-center justify-center rounded-[14px] bg-primary-container text-text-brand"><ShoppingBag size={18} aria-hidden="true" /></span>{item.status === "outOfStock" && <StatusTag tone="neutral">已兑完</StatusTag>}</div><h3 className="mt-3 line-clamp-2 text-sm font-semibold text-text-primary">{item.title}</h3><p className="mt-1 line-clamp-2 text-xs text-text-secondary">{item.summary}</p><div className="mt-auto flex items-center justify-between pt-3"><span className="flex items-center gap-1 text-sm font-semibold text-text-brand"><Coins size={14} aria-hidden="true" />{item.cost}</span><span className="text-xs text-text-tertiary">{item.claimedCount} 人已兑</span></div></Card></Link>)}</div>
          {filtered.length === 0 && <Card><p className="py-4 text-center text-sm text-text-secondary">当前分类下没有可兑换项目</p></Card>}
          <p className="mt-4 text-center text-xs text-text-tertiary">兑换内容与学力值消耗为原型占位，正式规则待 F04 决策。</p>
        </div>
      </div>
    </div>
  </PublicShell>;
}

export function ExchangeDetailPage() {
  const navigate = useNavigate();
  const { exchangeId } = useParams();
  const item = exchangeItemById(exchangeId);
  const [exchanged, setExchanged] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  if (!item) return <PublicShell showNavigation={false}><PageHeader title="兑换项不存在" backTo="/benefits/exchange" /></PublicShell>;
  const detailUrl = item.category === "course" && item.courseId ? `/courses/${item.courseId}` : "/benefits/wallet";
  const handleExchange = () => { setExchanged(true); setShowSuccessDialog(true); };
  return <PublicShell showNavigation={false}><PageHeader title="兑换详情" backTo="/benefits/exchange" /><div className="space-y-6 px-4 py-5"><Card className="flex flex-col items-center p-6 text-center"><span className="flex size-16 items-center justify-center rounded-[20px] bg-primary-container text-text-brand"><ShoppingBag size={32} aria-hidden="true" /></span><h1 className="mt-4 text-xl font-semibold text-text-primary">{item.title}</h1><p className="mt-2 text-sm text-text-secondary">{item.summary}</p><div className="mt-4 flex items-center gap-1 text-2xl font-bold text-text-brand"><Coins size={24} aria-hidden="true" />{item.cost}</div></Card>
    <Card className="space-y-3"><div className="flex items-center justify-between text-sm"><span className="text-text-secondary">已兑换人数</span><span className="font-medium text-text-primary">{item.claimedCount}</span></div><div className="flex items-center justify-between text-sm"><span className="text-text-secondary">当前库存</span><span className="font-medium text-text-primary">{item.status === "outOfStock" ? "已兑完" : "充足"}</span></div><div className="flex items-center justify-between text-sm"><span className="text-text-secondary">我的学力值</span><span className="font-medium text-text-primary">{currentCredits}</span></div></Card>
    {exchanged ? <Card className="border border-success bg-success-bg"><p className="font-semibold text-success-text">兑换申请已提交</p><p className="mt-2 text-sm text-success-text">正式环境需由权益服务确认库存并发放；本原型仅验证交互流程。</p></Card> : item.status === "outOfStock" ? <Button className="w-full" disabled>已兑完</Button> : <Button className="w-full" onClick={handleExchange}>确认兑换</Button>}
    <SecondaryButton className="w-full" onClick={() => navigate("/benefits/exchange")}>返回兑换中心</SecondaryButton>
  </div>
    <Dialog
      open={showSuccessDialog}
      onOpenChange={setShowSuccessDialog}
      title="兑换成功"
      description={`恭喜你成功兑换「${item.title}」，可前往对应页面查看。`}
      size="sm"
      footer={
        <div className="flex w-full flex-col gap-3">
          <Button className="w-full" onClick={() => { setShowSuccessDialog(false); navigate(detailUrl); }}>点击查看</Button>
          <SecondaryButton className="w-full" onClick={() => setShowSuccessDialog(false)}>关闭</SecondaryButton>
        </div>
      }
    />
  </PublicShell>;
}

export function CreditDetailsPage() {
  const totalIncome = learningCreditRecords.filter(r => r.type === "income").reduce((sum, r) => sum + r.amount, 0);
  const totalExpense = Math.abs(learningCreditRecords.filter(r => r.type === "expense").reduce((sum, r) => sum + r.amount, 0));
  return <PublicShell showNavigation={false}><PageHeader title="学力值明细" backTo="/benefits" /><div className="space-y-5 px-4 py-5"><Card className="bg-gradient-to-br from-primary to-[#7569ff] p-5 text-on-primary"><p className="text-sm opacity-90">当前学力值余额</p><p className="mt-2 text-4xl font-bold">{currentCredits}</p><div className="mt-4 flex gap-4 text-sm"><span className="flex items-center gap-1"><TrendingUp size={16} aria-hidden="true" />收入 {totalIncome}</span><span className="flex items-center gap-1"><Wallet size={16} aria-hidden="true" />支出 {totalExpense}</span></div></Card>
    <Section title="收支明细"><div className="space-y-3">{learningCreditRecords.map(record => <Card key={record.id} className="flex items-center justify-between gap-3"><div><p className="font-medium text-text-primary">{record.title}</p><p className="mt-1 text-xs text-text-tertiary">{record.time}</p></div><span className={`shrink-0 text-sm font-semibold ${record.type === "income" ? "text-success-text" : "text-danger-text"}`}>{record.type === "income" ? "+" : ""}{record.amount}</span></Card>)}</div></Section>
    <Card className="border border-border-subtle"><p className="text-sm leading-5 text-text-secondary">本明细为原型占位数据。学力值到底是积分、成长分还是其他形态，以及收入/消耗规则，均待 F04 产品决策。</p></Card>
  </div></PublicShell>;
}

export function BenefitDetailPage() {
  const navigate = useNavigate();
  const loggedIn = useAccountLoggedIn();
  const accountAction = useAccountAction();
  const { benefitId } = useParams();
  const { query } = useBenefitSourceContext();
  const item = benefitById(benefitId);
  const [phone, setPhone] = useState("");
  const [showClaimedDialog, setShowClaimedDialog] = useState(false);
  const [adOpen, setAdOpen] = useState(false);
  const { benefitStatusFor, claimBenefit, useBenefit, profile } = useLongTermAssets();
  if (!item) return <PublicShell showNavigation={false}><PageHeader title="权益不存在" backTo={`/benefits${query}`} /></PublicShell>;
  const status = loggedIn ? benefitStatusFor(item.id) : undefined;
  const claim = () => accountAction(() => { claimBenefit(item.id); setShowClaimedDialog(true); });
  const use = () => accountAction(() => useBenefit(item.id));
  const currentAd = mockRewardedAds[item.id.length % mockRewardedAds.length];
  const infoFeedAd = useInfoFeedAd(item.id);
  const startAdClaim = () => { setAdOpen(true); };
  const handleAdComplete = () => { setAdOpen(false); claim(); };
  const handleAdClose = () => { setAdOpen(false); };
  const maskedPhone = profile.phone ? `${profile.phone.slice(0, 3)} **** ${profile.phone.slice(7)}` : "未绑定手机号";
  const phoneReady = Boolean(profile.phone && profile.phoneVerified === "verified");
  const profileReturnTo = `/benefits/${item.id}${query}`;
  return <PublicShell showNavigation={false}><PageHeader title="权益详情" backTo={`/benefits${query}`} /><div className="space-y-6 px-4 py-5"><SourceLine source={item.source} /><div><div className="flex items-start justify-between gap-3"><h1 className="text-2xl font-semibold leading-8 text-text-primary">{item.title}</h1>{status ? <StatusTag tone={benefitTone(status)}>{benefitLabel[status]}</StatusTag> : <StatusTag tone="neutral">登录查看资格</StatusTag>}</div><p className="mt-3 text-sm leading-6 text-text-secondary">{item.summary}</p></div><Card><h2 className="font-semibold text-text-primary">资格与来源</h2><p className="mt-2 text-sm leading-6 text-text-primary">{loggedIn ? item.reason : "登录后由长期账号状态与共享赛事身份判断当前资格。"}</p>{item.expiresAt && <p className="mt-3 text-xs text-text-secondary">有效期至 {item.expiresAt}</p>}</Card>{!loggedIn && <Button className="w-full" onClick={() => accountAction(() => undefined)}>登录后查看并领取</Button>}{status === "eligible" && (item.externalUrl ? (
        <div className="space-y-4">
          {item.bindPhone && !phoneReady ? (
            <Card className="border border-warning bg-warning-bg">
              <div className="flex items-start gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-container text-text-brand">
                  <Phone size={18} aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-warning-text">领取前请绑定手机号</p>
                  <p className="mt-1 text-sm leading-5 text-warning-text">该权益由平台自动发放到已验证手机号，绑定后无需重复输入。</p>
                  <Link to={`/me/profile?returnTo=${encodeURIComponent(profileReturnTo)}`} className="mt-3 inline-block text-sm font-medium text-text-brand">去绑定手机号</Link>
                </div>
              </div>
            </Card>
          ) : (
            <>
              <Card className="border border-info bg-info-bg">
                <p className="text-sm leading-5 text-info-text">{item.claimHint ?? "请在 H5 页面输入手机号领取。"}</p>
              </Card>
              {item.bindPhone ? (
                <Card className="flex items-center gap-3 bg-surface">
                  <span className="flex size-9 items-center justify-center rounded-full bg-primary-container text-text-brand">
                    <Phone size={18} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-text-primary">{maskedPhone}</p>
                    <p className="text-xs text-text-tertiary">后台已绑定手机号，领取时无需重复输入</p>
                  </div>
                </Card>
              ) : (
                <label className="block">
                  <span className="text-sm font-medium text-text-primary">手机号</span>
                  <input type="tel" value={phone} onChange={event => setPhone(event.target.value)} placeholder="请输入领取手机号" className="mt-1 w-full rounded-control border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-primary" />
                </label>
              )}
              <Button className="w-full" onClick={startAdClaim}>看广告领{item.id === "benefit-tencent-map-ride" ? "打车券" : item.id === "benefit-taobao-flash-takeout" ? "外卖券" : "权益"}</Button>
              {item.externalUrl && !item.apiIssued && (
                <a href={item.externalUrl} target="_blank" rel="noreferrer" className="block text-center text-sm font-medium text-text-brand">直接去合作方页面领取</a>
              )}
            </>
          )}
          {(item.couponValidityDays || item.dailyClaimLimit || item.apiIssued) && (
            <Card className="border border-border-subtle">
              <div className="flex items-center gap-2">
                <Info size={16} className="text-text-tertiary" aria-hidden="true" />
                <span className="text-sm font-semibold text-text-primary">领取详情</span>
              </div>
              <ul className="mt-3 space-y-2 text-sm text-text-secondary">
                {item.couponValidityDays && <li>券有效期：领取后 {item.couponValidityDays} 天内有效</li>}
                {item.dailyClaimLimit && <li>领取限制：同一手机号每天限领 {item.dailyClaimLimit} 次</li>}
                {item.bindPhone && <li>发放方式：后台自动绑定已验证手机号，无需重复输入</li>}
                {item.apiIssued && item.useInApp && <li>使用方式：请打开「{item.useInApp}」App，使用相同手机号登录后查看/使用</li>}
              </ul>
            </Card>
          )}
        </div>
      ) : <Button className="w-full" onClick={startAdClaim}>看广告领权益</Button>)}{status === "claimed" && <Button className="w-full" onClick={use}>模拟兑换 / 核销</Button>}{status === "used" && <Card className="border border-success bg-success-bg"><p className="font-semibold text-success-text">已完成使用 / 核销</p><p className="mt-1 text-sm text-success-text">记录会保留在账号长期权益中。</p></Card>}{status === "ineligible" && <Card className="border border-warning bg-warning-bg"><p className="font-semibold text-warning-text">当前不满足资格</p><p className="mt-1 text-sm text-warning-text">赛事身份相关资格直接读取共享 identities[]；无有效身份时不能新领取。</p></Card>}{status === "expired" && <Card><p className="font-semibold text-text-primary">权益已失效</p><p className="mt-1 text-sm text-text-secondary">历史来源与领取记录仍保留，但不能再次使用。</p></Card>}{loggedIn && <GhostButton className="w-full" onClick={() => navigate("/benefits/wallet")}>查看我的卡券</GhostButton>}<InfoFeedAdCard ad={infoFeedAd} seed={item.id} /></div>
      <Dialog
        open={showClaimedDialog}
        onOpenChange={setShowClaimedDialog}
        title="领取成功"
        description={`「${item.title}」已标记为待使用，可前往卡券查看或跳转使用。`}
        size="sm"
        footer={
          <div className="flex w-full flex-col gap-3">
            <Button className="w-full" onClick={() => { setShowClaimedDialog(false); navigate("/benefits/wallet"); }}>查看我的卡券</Button>
            {item.apiIssued && item.useInApp ? (
              <p className="text-center text-sm leading-5 text-text-secondary">请打开「{item.useInApp}」App，使用相同手机号登录后查看/使用</p>
            ) : (
              <SecondaryButton className="w-full" onClick={() => { setShowClaimedDialog(false); window.open(item.externalUrl, "_blank", "noopener,noreferrer"); }}>去使用</SecondaryButton>
            )}
          </div>
        }
      />
      <RewardedVideoAd open={adOpen} ad={currentAd} onComplete={handleAdComplete} onClose={handleAdClose} />
  </PublicShell>;
}

export function BenefitsWalletPage() {
  const navigate = useNavigate();
  const { benefitStatusFor } = useLongTermAssets();
  const grouped = benefits.map(item => ({ item, status: benefitStatusFor(item.id) }));
  return <PublicShell showNavigation={false}><PageHeader title="我的卡券" backTo="/me" /><div className="space-y-6 px-4 py-5"><div><h2 className="text-base font-semibold text-text-primary">可使用</h2><div className="mt-3 space-y-3">{grouped.filter(entry => entry.status === "claimed").length ? grouped.filter(entry => entry.status === "claimed").map(({ item, status }) => <Link key={item.id} to={`/benefits/${item.id}`} className="block"><Card interactive><div className="flex items-center justify-between gap-3"><div><h3 className="font-semibold text-text-primary">{item.title}</h3><p className="mt-1 text-xs text-text-secondary">{item.source.label}</p></div><StatusTag tone="info">{benefitLabel[status]}</StatusTag></div></Card></Link>) : <Card><p className="text-sm text-text-secondary">当前没有待使用权益。</p></Card>}</div></div><div><h2 className="text-base font-semibold text-text-primary">历史记录</h2><div className="mt-3 space-y-3">{grouped.filter(entry => ["used","expired"].includes(entry.status)).map(({ item, status }) => <Card key={item.id}><div className="flex items-center justify-between gap-3"><div><h3 className="font-medium text-text-primary">{item.title}</h3><p className="mt-1 text-xs text-text-secondary">{item.source.label}</p></div><StatusTag tone="neutral">{benefitLabel[status]}</StatusTag></div></Card>)}</div></div><SecondaryButton className="w-full" onClick={() => navigate("/benefits")}>返回权益中心</SecondaryButton></div></PublicShell>;
}

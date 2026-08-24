import { useMemo, useState } from "react";
import { BookOpen, CheckCircle2, ChevronRight, Coins, Gift, Phone, Search, ShieldCheck, ShoppingBag, Ticket } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Dialog } from "@core/shared";
import { Button, Card, PageHeader, PublicShell, SecondaryButton, StatusTag } from "../../components/ui";
import { courseById, courses, exchangeItemById, exchangeItems, type ExchangeCategory } from "./data";
import { useAccountLoggedIn } from "./shared";
import { useLongTermAssets } from "./store";

type ProductCategory = Exclude<ExchangeCategory, "all">;
type ExchangeProduct = {
  id: string;
  title: string;
  summary: string;
  category: ProductCategory;
  cost: number;
  claimedCount?: number;
  status: "available" | "outOfStock" | "exchanged";
  kind: "course" | "exchange";
  courseId?: string;
};

const categoryTabs: Array<{ value: "all" | ProductCategory; label: string }> = [
  { value: "all", label: "全部" },
  { value: "course", label: "课程" },
  { value: "ticket", label: "入场券" },
  { value: "virtual", label: "线上权益" },
];

const trustedCourseIds = new Set(["ai-ecommerce-agent"]);
const SPENT_KEY = "t035:prototype-non-course-spent";
const EXCHANGED_PREFIX = "t035:exchanged:";

function readPrototypeSpent() {
  if (typeof window === "undefined") return 0;
  const value = Number(window.sessionStorage.getItem(SPENT_KEY) ?? "0");
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

function writePrototypeSpent(value: number) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(SPENT_KEY, String(Math.max(0, value)));
}

function wasPrototypeExchanged(id: string) {
  if (typeof window === "undefined") return false;
  return window.sessionStorage.getItem(`${EXCHANGED_PREFIX}${id}`) === "1";
}

function markPrototypeExchanged(id: string) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(`${EXCHANGED_PREFIX}${id}`, "1");
}

function paidCourseProducts(): ExchangeProduct[] {
  return courses
    .filter(course => course.entitlement === "creditRequired")
    .map(course => ({
      id: `course-${course.id}`,
      title: course.title,
      summary: course.summary,
      category: "course" as const,
      cost: course.cost,
      status: "available" as const,
      kind: "course" as const,
      courseId: course.id,
    }));
}

function nonCourseProducts(): ExchangeProduct[] {
  return exchangeItems
    .filter(item => item.category !== "course")
    .map(item => ({
      id: item.id,
      title: item.title,
      summary: item.summary,
      category: item.category,
      cost: item.cost,
      claimedCount: item.claimedCount,
      status: item.status,
      kind: "exchange" as const,
    }));
}

function allProducts() {
  return [...paidCourseProducts(), ...nonCourseProducts()];
}

function resolveProduct(id?: string): ExchangeProduct | undefined {
  if (!id) return undefined;
  const current = allProducts().find(item => item.id === id);
  if (current) return current;

  // 兼容旧入口：旧兑换中心里曾把部分免费课程也包装成“课程商品”。
  const legacy = exchangeItemById(id);
  if (!legacy) return undefined;
  if (legacy.category !== "course" || !legacy.courseId) {
    return {
      id: legacy.id,
      title: legacy.title,
      summary: legacy.summary,
      category: legacy.category,
      cost: legacy.cost,
      claimedCount: legacy.claimedCount,
      status: legacy.status,
      kind: "exchange",
    };
  }
  const course = courseById(legacy.courseId);
  if (!course) return undefined;
  return {
    id: legacy.id,
    title: course.title,
    summary: course.summary,
    category: "course",
    cost: course.entitlement === "creditRequired" ? course.cost : 0,
    status: "available",
    kind: "course",
    courseId: course.id,
  };
}

function ProductIcon({ category }: { category: ProductCategory }) {
  const Icon = category === "course" ? BookOpen : category === "ticket" ? Ticket : Gift;
  return <span className="grid size-10 shrink-0 place-items-center rounded-[14px] bg-primary-container text-text-brand"><Icon size={20} aria-hidden="true" /></span>;
}

function maskedPhone(phone: string) {
  return /^1\d{10}$/.test(phone) ? `${phone.slice(0, 3)} **** ${phone.slice(7)}` : "未绑定";
}

export function T035ExchangeCenterPage() {
  const { creditBalance, enrolledFor } = useLongTermAssets();
  const [category, setCategory] = useState<"all" | ProductCategory>("all");
  const [query, setQuery] = useState("");
  const availableCredits = Math.max(0, creditBalance - readPrototypeSpent());

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return allProducts().filter(item => {
      if (category !== "all" && item.category !== category) return false;
      if (!keyword) return true;
      return `${item.title}${item.summary}`.toLowerCase().includes(keyword);
    });
  }, [category, query]);

  return <PublicShell showNavigation={false}>
    <PageHeader title="兑换中心" backTo="/benefits" />
    <div className="space-y-5 px-4 py-5">
      <Card className="bg-primary-container/45 p-4">
        <div className="flex items-center justify-between gap-3">
          <div><p className="text-xs text-text-secondary">当前可用学力值</p><p className="mt-1 flex items-center gap-1 text-2xl font-semibold text-text-primary"><Coins size={20} className="text-text-brand" aria-hidden="true" />{availableCredits}</p></div>
          <span className="text-xs text-text-tertiary">兑换前先看详情</span>
        </div>
      </Card>

      <div className="flex items-center gap-2 rounded-control border border-border-subtle bg-surface px-3">
        <Search size={18} className="text-text-tertiary" aria-hidden="true" />
        <input value={query} onChange={event => setQuery(event.target.value)} placeholder="搜索课程或权益" className="min-h-touch flex-1 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-tertiary" />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {categoryTabs.map(tab => <button key={tab.value} type="button" onClick={() => setCategory(tab.value)} className={`shrink-0 rounded-full px-3 py-2 text-xs font-medium ${category === tab.value ? "bg-primary text-on-primary" : "bg-surface text-text-secondary"}`}>{tab.label}</button>)}
      </div>

      <div className="space-y-3">
        {filtered.map(item => {
          const course = item.courseId ? courseById(item.courseId) : undefined;
          const exchanged = item.kind === "course" && item.courseId ? enrolledFor(item.courseId) : wasPrototypeExchanged(item.id);
          const trusted = Boolean(item.courseId && trustedCourseIds.has(item.courseId));
          return <Link key={item.id} to={`/benefits/exchange/${item.id}`} className="block">
            <Card interactive className="flex gap-3 p-4">
              <ProductIcon category={item.category} />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2"><h2 className="font-semibold text-text-primary">{item.title}</h2>{exchanged ? <StatusTag tone="success">已兑换</StatusTag> : item.status === "outOfStock" ? <StatusTag tone="neutral">已兑完</StatusTag> : null}</div>
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-text-secondary">{item.summary}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-text-brand"><Coins size={14} aria-hidden="true" />{item.cost}</span>
                  {trusted && <span className="inline-flex items-center gap-1 rounded-full bg-warning-bg px-2 py-1 text-[11px] font-medium text-warning-text"><ShieldCheck size={12} aria-hidden="true" />可信证书课程</span>}
                  {course?.entitlement === "creditRequired" && <StatusTag tone="info">可试看</StatusTag>}
                </div>
              </div>
              <ChevronRight size={18} className="mt-2 shrink-0 text-text-tertiary" aria-hidden="true" />
            </Card>
          </Link>;
        })}
        {filtered.length === 0 && <Card><p className="py-6 text-center text-sm text-text-secondary">当前没有匹配的兑换内容。</p></Card>}
      </div>
    </div>
  </PublicShell>;
}

export function T035ExchangeDetailPage() {
  const { exchangeId } = useParams();
  const navigate = useNavigate();
  const loggedIn = useAccountLoggedIn();
  const { creditBalance, profile, enrollCourse, enrolledFor } = useLongTermAssets();
  const item = resolveProduct(exchangeId);
  const [prototypeSpent, setPrototypeSpent] = useState(readPrototypeSpent);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [exchanged, setExchanged] = useState(() => item ? wasPrototypeExchanged(item.id) : false);

  if (!item) return <PublicShell showNavigation={false}><PageHeader title="兑换项不存在" backTo="/benefits/exchange" /></PublicShell>;

  const course = item.courseId ? courseById(item.courseId) : undefined;
  const courseAlreadyOwned = Boolean(item.courseId && enrolledFor(item.courseId));
  const done = exchanged || courseAlreadyOwned;
  const phoneRequired = item.kind === "exchange" && item.category === "virtual";
  const phoneBound = Boolean(profile.phone && profile.phoneVerified === "verified");
  const availableCredits = Math.max(0, creditBalance - prototypeSpent);
  const balanceAfter = Math.max(0, availableCredits - item.cost);
  const insufficient = availableCredits < item.cost;
  const unavailable = item.status === "outOfStock";
  const deliveryText = item.kind === "course"
    ? "兑换后直接进入你的课程账户"
    : phoneRequired
      ? `发放至当前登录手机号 ${maskedPhone(profile.phone)}`
      : "兑换后进入当前账号的权益记录";

  const openConfirm = () => {
    if (!loggedIn) { navigate(`/auth/login?returnTo=${encodeURIComponent(`/benefits/exchange/${item.id}`)}`); return; }
    setError("");
    if (unavailable) { setError("当前已兑完，暂时不能兑换。"); return; }
    if (insufficient) { setError(`学力值不足，当前可用 ${availableCredits}，需要 ${item.cost}。`); return; }
    if (phoneRequired && !phoneBound) { setError("该线上权益需要先绑定并验证当前登录手机号。"); return; }
    setShowConfirm(true);
  };

  const confirmExchange = () => {
    setShowConfirm(false);
    setError("");
    if (item.kind === "course" && item.courseId) {
      const result = enrollCourse(item.courseId);
      if (!result.success) { setError(result.reason); return; }
      setExchanged(true);
      return;
    }
    if (!wasPrototypeExchanged(item.id)) {
      const nextSpent = prototypeSpent + item.cost;
      writePrototypeSpent(nextSpent);
      setPrototypeSpent(nextSpent);
      markPrototypeExchanged(item.id);
    }
    setExchanged(true);
  };

  return <PublicShell showNavigation={false}>
    <PageHeader title="兑换详情" backTo="/benefits/exchange" />
    <div className="space-y-5 px-4 py-5">
      <Card className="p-5">
        <div className="flex items-start gap-4"><ProductIcon category={item.category} /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h1 className="text-lg font-semibold text-text-primary">{item.title}</h1>{item.courseId && trustedCourseIds.has(item.courseId) && <StatusTag tone="warning">可信证书课程</StatusTag>}</div><p className="mt-2 text-sm leading-6 text-text-secondary">{item.summary}</p></div></div>
        <div className="mt-5 flex items-end justify-between border-t border-border-subtle pt-4"><span className="text-sm text-text-secondary">兑换需要</span><span className="flex items-center gap-1 text-2xl font-semibold text-text-brand"><Coins size={20} aria-hidden="true" />{item.cost}</span></div>
      </Card>

      {course && item.cost === 0 && <Card className="border border-info bg-info-bg"><p className="font-semibold text-info-text">这门课程现在无需学力值兑换</p><p className="mt-1 text-sm leading-5 text-info-text">这是旧兑换入口的兼容页。当前课程已调整为免费学习，直接进入课程即可。</p></Card>}

      <Card className="space-y-4">
        <div><p className="text-xs text-text-tertiary">到账方式</p><p className="mt-1 text-sm font-medium text-text-primary">{deliveryText}</p></div>
        {phoneRequired && <div className="flex items-start gap-3 rounded-control bg-surface-subtle p-3"><Phone size={18} className="mt-0.5 shrink-0 text-text-brand" aria-hidden="true" /><div><p className="text-sm font-medium text-text-primary">线上权益默认绑定当前登录手机号</p><p className="mt-1 text-xs leading-5 text-text-secondary">兑换页不临时填写另一个手机号，避免券和账号归属混乱。</p>{!phoneBound && <Link to="/me/profile" className="mt-2 inline-block text-xs font-medium text-text-brand">先去绑定手机号 →</Link>}</div></div>}
        <div className="grid grid-cols-2 gap-3 border-t border-border-subtle pt-4 text-sm"><div><p className="text-text-tertiary">当前可用</p><p className="mt-1 font-semibold text-text-primary">{availableCredits}</p></div><div><p className="text-text-tertiary">兑换后</p><p className="mt-1 font-semibold text-text-primary">{balanceAfter}</p></div></div>
      </Card>

      {error && <Card className="border border-danger bg-danger-bg"><p className="text-sm text-danger-text">{error}</p></Card>}

      {done ? <Card className="border border-success bg-success-bg p-5 text-center"><CheckCircle2 size={30} className="mx-auto text-success-text" aria-hidden="true" /><h2 className="mt-3 font-semibold text-success-text">兑换完成</h2><p className="mt-2 text-sm leading-5 text-success-text">{item.kind === "course" ? "课程已经进入你的学习账户，可以直接开始学习。" : phoneRequired ? `该权益按原型规则记到 ${maskedPhone(profile.phone)}。` : "该权益已记入当前账号。"}</p>{item.kind === "course" && item.courseId ? <Button className="mt-4 w-full" onClick={() => navigate(`/courses/${item.courseId}`)}>进入课程</Button> : <SecondaryButton className="mt-4 w-full" onClick={() => navigate("/benefits/exchange")}>继续逛兑换中心</SecondaryButton>}</Card> : item.cost === 0 && course ? <Button className="w-full" onClick={() => navigate(`/courses/${course.id}`)}>直接进入课程</Button> : <Button className="w-full" disabled={unavailable} onClick={openConfirm}>{unavailable ? "已兑完" : "确认兑换"}</Button>}
    </div>

    <Dialog
      open={showConfirm}
      onOpenChange={setShowConfirm}
      title="确认兑换"
      description={`兑换「${item.title}」将消耗 ${item.cost} 学力值，预计剩余 ${balanceAfter}。${phoneRequired ? ` 到账手机号：${maskedPhone(profile.phone)}。` : ""}`}
      size="sm"
      footer={<div className="flex w-full gap-3"><SecondaryButton className="flex-1" onClick={() => setShowConfirm(false)}>再想想</SecondaryButton><Button className="flex-1" onClick={confirmExchange}>确认消耗</Button></div>}
    />
  </PublicShell>;
}

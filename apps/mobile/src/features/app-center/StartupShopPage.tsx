import { useMemo, useState } from "react";
import { BookOpen, Box, Check, ChevronLeft, ClipboardCheck, PackagePlus, Sparkles, Store, UserPlus, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button, Card, StatusTag } from "../../components/ui";

type ShopActionId = "checkin" | "quiz" | "course" | "invite";

type ShopAction = {
  id: ShopActionId;
  title: string;
  note: string;
  gain: string;
  icon: typeof Box;
};

const actions: ShopAction[] = [
  { id: "checkin", title: "今日签到", note: "先把门打开", gain: "进货 +1 箱", icon: ClipboardCheck },
  { id: "quiz", title: "答一道题", note: "脑子也能进货", gain: "进货 +1 箱", icon: PackagePlus },
  { id: "course", title: "上一节课", note: "学点真东西", gain: "进货 +2 箱", icon: BookOpen },
  { id: "invite", title: "喊同学来逛", note: "给店里带点人气", gain: "客流 +3", icon: UserPlus },
];

function ShopScene({ stock, traffic, level }: { stock: number; traffic: number; level: number }) {
  const shelfRows = Math.min(3, Math.max(1, Math.ceil(stock / 2)));
  const people = Math.min(5, traffic);
  return (
    <div className="relative overflow-hidden rounded-[24px] border border-border-subtle bg-primary-container/35 px-4 pb-4 pt-5">
      <div className="absolute right-4 top-4"><StatusTag tone="info">Lv.{level}</StatusTag></div>
      <div className="mb-4 pr-16">
        <p className="text-xs font-medium text-text-brand">今日营业中</p>
        <h2 className="mt-1 text-xl font-semibold text-text-primary">{level >= 3 ? "人气小店" : level >= 2 ? "亮灯小店" : "刚开张的小铺"}</h2>
        <p className="mt-1 text-sm text-text-secondary">货越多、客越多，店就越像回事。</p>
      </div>

      <div className="relative mx-auto max-w-[320px] pt-5">
        <div className="absolute left-1/2 top-0 h-8 w-[82%] -translate-x-1/2 rounded-t-[18px] border border-border-subtle bg-surface" />
        <div className="relative rounded-[20px] border border-border-subtle bg-surface p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between border-b border-border-subtle pb-3">
            <div className="flex items-center gap-2"><Store size={18} className="text-text-brand" aria-hidden="true" /><span className="text-sm font-semibold text-text-primary">创业小店</span></div>
            <span className="rounded-full bg-success-bg px-2 py-1 text-[10px] font-medium text-success-text">OPEN</span>
          </div>
          <div className="grid grid-cols-[1.4fr_0.8fr] gap-3">
            <div className="space-y-2">
              {Array.from({ length: shelfRows }).map((_, row) => (
                <div key={row} className="rounded-control bg-surface-subtle p-2">
                  <div className="flex gap-1.5">
                    {Array.from({ length: Math.min(4, Math.max(1, stock - row * 2)) }).map((__, item) => <span key={item} className="h-5 flex-1 rounded-[6px] bg-primary-container" />)}
                  </div>
                </div>
              ))}
              {stock === 0 && <div className="rounded-control border border-dashed border-border px-3 py-5 text-center text-xs text-text-tertiary">货架空空的</div>}
            </div>
            <div className="flex flex-col justify-between rounded-control bg-surface-subtle p-2.5">
              <div><p className="text-[10px] text-text-tertiary">今日客流</p><p className="mt-1 text-xl font-semibold text-text-primary">{traffic}</p></div>
              <div className="mt-4 flex -space-x-1">
                {Array.from({ length: people }).map((_, index) => <span key={index} className="grid size-7 place-items-center rounded-full border-2 border-surface bg-primary-container text-[10px] font-semibold text-text-brand">{String.fromCharCode(65 + index)}</span>)}
                {!people && <span className="text-[10px] text-text-tertiary">还没人来</span>}
              </div>
            </div>
          </div>
        </div>
        {level >= 2 && <div className="absolute -right-2 top-8 rounded-full bg-warning-bg px-2.5 py-1 text-[10px] font-semibold text-warning-text shadow-sm">✨ 新招牌</div>}
        {traffic >= 3 && <div className="absolute -left-2 bottom-5 rounded-full bg-info-bg px-2.5 py-1 text-[10px] font-semibold text-info-text shadow-sm">门口有人啦</div>}
      </div>
    </div>
  );
}

export function StartupShopPage() {
  const navigate = useNavigate();
  const [done, setDone] = useState<ShopActionId[]>([]);

  const stock = (done.includes("checkin") ? 1 : 0) + (done.includes("quiz") ? 1 : 0) + (done.includes("course") ? 2 : 0);
  const traffic = done.includes("invite") ? 3 : 0;
  const growth = stock * 16 + traffic * 9;
  const level = growth >= 70 ? 3 : growth >= 35 ? 2 : 1;
  const allDone = done.length === actions.length;

  const shopMessage = useMemo(() => {
    if (allDone) return "今天的店已经被你盘活了。明天再回来看看，会不会更热闹。";
    if (traffic > 0 && stock === 0) return "客人已经来了，但货架还是空的——老板，先去进货。";
    if (stock >= 2 && traffic === 0) return "货都摆好了，就差有人推门进来。";
    if (stock > 0) return "有点样子了。再做一件事，让店继续长。";
    return "今天还没开张。随便做一件小事，店里就会有变化。";
  }, [allDone, stock, traffic]);

  const doAction = (id: ShopActionId) => setDone(current => current.includes(id) ? current : [...current, id]);

  return (
    <div className="min-h-screen bg-background pb-8 text-foreground">
      <header className="sticky top-0 z-20 border-b border-border-subtle bg-surface/95 pt-[env(safe-area-inset-top)] backdrop-blur">
        <div className="relative mx-auto flex min-h-12 w-full max-w-md items-center justify-center px-14">
          <button type="button" aria-label="返回应用中心" onClick={() => navigate("/apps")} className="absolute left-1 top-1/2 flex min-h-touch min-w-11 -translate-y-1/2 items-center justify-center rounded-control text-text-primary active:bg-surface-pressed"><ChevronLeft size={24} aria-hidden="true" /></button>
          <div className="text-center"><h1 className="text-base font-semibold text-text-primary">我的创业小店</h1><p className="text-[10px] text-text-tertiary">可玩概念原型</p></div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-md space-y-5 px-4 py-5">
        <ShopScene stock={stock} traffic={traffic} level={level} />

        <Card className="p-4">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-[14px] bg-primary-container text-text-brand"><Sparkles size={20} aria-hidden="true" /></span>
            <div className="min-w-0"><p className="text-sm font-semibold text-text-primary">店长播报</p><p className="mt-1 text-sm leading-5 text-text-secondary">{shopMessage}</p></div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs"><span className="text-text-secondary">今日成长</span><span className="font-semibold text-text-primary">{Math.min(growth, 100)}%</span></div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-subtle"><div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${Math.min(growth, 100)}%` }} /></div>
            <p className="mt-2 text-[11px] text-text-tertiary">等级成长未来可关联权益折扣；当前只做玩法示意。</p>
          </div>
        </Card>

        <section>
          <div className="mb-3 flex items-end justify-between"><div><h2 className="font-semibold text-text-primary">今天做点什么</h2><p className="mt-0.5 text-xs text-text-secondary">不是任务清单，是给你的店添点东西。</p></div><span className="text-xs font-medium text-text-brand">{done.length}/{actions.length}</span></div>
          <div className="grid grid-cols-2 gap-3">
            {actions.map(action => {
              const completed = done.includes(action.id);
              const Icon = action.icon;
              return <button key={action.id} type="button" disabled={completed} onClick={() => doAction(action.id)} className={`min-h-[132px] rounded-container border p-4 text-left transition active:scale-[0.98] ${completed ? "border-success/25 bg-success-bg" : "border-border-subtle bg-surface"}`}>
                <div className="flex items-start justify-between gap-2"><span className={`grid size-10 place-items-center rounded-[14px] ${completed ? "bg-success text-on-primary" : "bg-primary-container text-text-brand"}`}>{completed ? <Check size={19} aria-hidden="true" /> : <Icon size={19} aria-hidden="true" />}</span><span className={`text-[10px] font-medium ${completed ? "text-success-text" : "text-text-brand"}`}>{completed ? "搞定" : action.gain}</span></div>
                <p className="mt-3 text-sm font-semibold text-text-primary">{action.title}</p><p className="mt-1 text-xs leading-5 text-text-secondary">{completed ? "店里已经发生变化" : action.note}</p>
              </button>;
            })}
          </div>
        </section>

        {allDone && <Card className="border border-success/25 bg-success-bg p-5 text-center"><div className="mx-auto grid size-12 place-items-center rounded-full bg-success text-on-primary"><Users size={22} aria-hidden="true" /></div><h2 className="mt-3 text-base font-semibold text-success-text">今天生意不错</h2><p className="mt-1 text-sm leading-5 text-success-text">货架有货，门口有人，你的小店升到了 Lv.{level}。</p><Button className="mt-4 w-full" onClick={() => navigate("/apps")}>收工，回应用中心</Button></Card>}
      </main>
    </div>
  );
}

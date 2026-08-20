import { ArrowLeft, Home } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

const frameStyle = `
.s3c-fade { opacity: 0; animation: s3cRise 0.7s cubic-bezier(0.2, 0.7, 0.3, 1) forwards; }
@keyframes s3cRise { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
.s3c-dotgrid { background-image: radial-gradient(rgba(23,27,42,0.5) 1px, transparent 1px); background-size: 22px 22px; }
@media (prefers-reduced-motion: reduce) {
  .s3c-fade { animation: none; opacity: 1; }
}
`;

function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-border-subtle bg-surface/95 backdrop-blur">
      <div className="mx-auto flex min-h-16 max-w-[1200px] items-center justify-between gap-4 px-5 lg:px-6">
        <Link to="/3chuang" className="flex min-w-0 items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-control bg-primary text-lg font-bold text-on-primary">三</span>
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-[15px] font-semibold tracking-tight text-text-primary">全国大学生电子商务三创赛</span>
            <span className="mt-0.5 block text-[10px] font-medium tracking-[0.22em] text-text-tertiary">E-COMMERCE CHALLENGE</span>
          </span>
        </Link>
        <nav className="flex items-center gap-0.5 sm:gap-1" aria-label="官网导航">
          <Link to="/3chuang" className="hidden min-h-10 items-center rounded-control px-3 text-sm font-medium text-text-secondary transition hover:bg-surface-subtle hover:text-text-brand sm:inline-flex">首页</Link>
          <a href="#rules" className="hidden min-h-10 items-center rounded-control px-3 text-sm font-medium text-text-secondary transition hover:bg-surface-subtle hover:text-text-brand md:inline-flex">竞赛设置</a>
          <a href="#schedule" className="hidden min-h-10 items-center rounded-control px-3 text-sm font-medium text-text-secondary transition hover:bg-surface-subtle hover:text-text-brand lg:inline-flex">重要节点</a>
          <a href="#notice" className="hidden min-h-10 items-center rounded-control px-3 text-sm font-medium text-text-secondary transition hover:bg-surface-subtle hover:text-text-brand xl:inline-flex">通知公告</a>
          <Link to="/3chuang/login" className="inline-flex min-h-10 items-center rounded-control bg-primary px-4 text-sm font-semibold text-on-primary transition hover:opacity-90">报名登录</Link>
          <Link to="/" className="inline-flex min-h-10 items-center gap-1.5 rounded-control border border-border bg-surface px-3 text-sm font-medium text-text-secondary transition hover:bg-surface-subtle hover:text-text-primary">
            <Home size={14} aria-hidden="true" />核心产业学院
          </Link>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border-subtle bg-surface">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-5 px-5 py-9 sm:flex-row sm:items-center sm:justify-between lg:px-6">
        <div>
          <p className="text-sm font-medium text-text-primary">全国大学生电子商务“创新、创意及创业”挑战赛 · 模拟官网</p>
          <p className="mt-1.5 text-xs leading-5 text-text-tertiary">原型环境 · 页面内容为演示数据，不代表组委会真实信息与时间安排。</p>
        </div>
        <Link to="/" className="inline-flex min-h-10 items-center gap-1.5 self-start rounded-control border border-border px-3 text-xs font-medium text-text-secondary transition hover:bg-surface-subtle hover:text-text-primary sm:self-auto">
          <ArrowLeft size={14} aria-hidden="true" />返回核心产业学院
        </Link>
      </div>
    </footer>
  );
}

export function SanChuangFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <style>{frameStyle}</style>
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
}

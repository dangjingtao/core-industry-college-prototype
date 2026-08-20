import { ArrowRight, BookOpenCheck, Building2, Check, ChevronDown, ChevronLeft, Download, Eye, EyeOff, GraduationCap, ListChecks, Lock, Mail, Phone, ShieldCheck, Smartphone, Sparkles, Trophy, User, UsersRound } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { SanChuangFrame } from "./SanChuangShell";

type Tab = "login" | "register";
type AccountType = "team" | "admin";

function MockSuccess({ mode, reset }: { mode: Tab; reset: () => void }) {
  return (
    <div className="s3c-fade py-4 text-center">
      <div className="mx-auto grid size-16 place-items-center rounded-full bg-success-bg text-success-text">
        <Check size={30} aria-hidden="true" />
      </div>
      <h2 className="mt-5 text-2xl font-semibold text-text-primary">{mode === "login" ? "登录成功（模拟）" : "注册成功（模拟）"}</h2>
      <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-text-secondary">
        当前为模拟官网原型环境，本次操作不会真实提交数据。正式环境将在此处接入真实账号体系与报名表单。
      </p>
      <div className="mx-auto mt-7 grid max-w-sm gap-3">
        <Link to="/registration-portal/start" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-control bg-primary text-sm font-semibold text-on-primary transition hover:opacity-90">
          <Trophy size={17} aria-hidden="true" />进入完整报名门户（原型）
        </Link>
        <button type="button" onClick={reset} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-control border border-border text-sm font-semibold text-text-primary transition hover:bg-surface-subtle hover:text-text-brand">
          返回登录 / 注册
        </button>
      </div>
    </div>
  );
}

function Field({ icon: Icon, rightSlot, ...props }: { icon: typeof User; rightSlot?: ReactNode } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="group flex items-center gap-3 rounded-control border border-border bg-surface px-4 transition focus-within:border-primary">
      <Icon size={16} className="shrink-0 text-text-tertiary transition group-focus-within:text-text-brand" aria-hidden="true" />
      <input className="min-h-12 w-full bg-transparent text-sm text-text-primary outline-none placeholder:text-[var(--color-text-placeholder)]" {...props} />
      {rightSlot}
    </label>
  );
}

function LoginForm({ onSuccess, onGoRegister }: { onSuccess: () => void; onGoRegister: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const valid = username.trim().length > 0 && password.length > 0;
  return (
    <form
      className="s3c-fade mt-7 space-y-4"
      onSubmit={event => {
        event.preventDefault();
        if (valid) onSuccess();
      }}
    >
      <Field icon={User} type="text" value={username} onChange={event => setUsername(event.target.value)} placeholder="登录名" autoComplete="username" />
      <Field
        icon={Lock}
        type={showPwd ? "text" : "password"}
        value={password}
        onChange={event => setPassword(event.target.value)}
        placeholder="密码"
        autoComplete="current-password"
        rightSlot={
          <button type="button" onClick={() => setShowPwd(value => !value)} className="text-text-tertiary transition hover:text-text-primary" aria-label={showPwd ? "隐藏密码" : "显示密码"}>
            {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        }
      />
      <div className="flex justify-end">
        <button type="button" className="text-xs text-text-secondary transition hover:text-text-brand">忘记密码</button>
      </div>
      <button type="submit" disabled={!valid} className="min-h-12 w-full rounded-control bg-primary text-sm font-semibold text-on-primary transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-[var(--color-disabled)] disabled:text-[var(--color-text-disabled)]">
        立即登录
      </button>
      <button type="button" onClick={onGoRegister} className="w-full text-center text-xs text-text-secondary transition hover:text-text-brand">
        没有注册？去注册
      </button>
    </form>
  );
}

function AccountTypeStep({ onChoose, onGoLogin }: { onChoose: (type: AccountType) => void; onGoLogin: () => void }) {
  return (
    <div className="s3c-fade mt-7">
      <h3 className="text-base font-semibold text-text-primary">选择注册的账号类型</h3>
      <p className="mt-1.5 text-xs leading-5 text-text-secondary">不同账号类型权益不同，请根据自己的需要进行注册。</p>
      <div className="mt-4 grid gap-3">
        <button type="button" onClick={() => onChoose("team")} className="rounded-container border border-border p-4 text-left transition hover:-translate-y-0.5 hover:border-primary hover:shadow-floating">
          <div className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-control bg-primary-container text-text-brand"><Trophy size={18} aria-hidden="true" /></span>
            <div>
              <p className="text-sm font-semibold text-text-primary">注册团队</p>
              <p className="mt-0.5 text-xs leading-5 text-text-secondary">学生团队注册报名，需选择学校与赛道并填写团队名称</p>
            </div>
          </div>
        </button>
        <button type="button" onClick={() => onChoose("admin")} className="rounded-container border border-border p-4 text-left transition hover:-translate-y-0.5 hover:border-primary hover:shadow-floating">
          <div className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-control bg-surface-subtle text-text-brand"><GraduationCap size={18} aria-hidden="true" /></span>
            <div>
              <p className="text-sm font-semibold text-text-primary">注册校管理员</p>
              <p className="mt-0.5 text-xs leading-5 text-text-secondary">学校赛务负责人注册，用于管理本校团队报名</p>
            </div>
          </div>
        </button>
      </div>
      <button type="button" onClick={onGoLogin} className="mt-5 w-full text-center text-xs text-text-secondary transition hover:text-text-brand">
        已有账号？去登录
      </button>
    </div>
  );
}

function AccountRegisterForm({ type, onSuccess, onBack, onGoLogin }: { type: AccountType; onSuccess: () => void; onBack: () => void; onGoLogin: () => void }) {
  const [school, setSchool] = useState("");
  const [track, setTrack] = useState("");
  const [teamName, setTeamName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agree, setAgree] = useState(false);

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const valid =
    school.trim().length > 0 &&
    (type === "admin" || (track.length > 0 && teamName.trim().length > 0)) &&
    username.trim().length > 0 &&
    phone.trim().length > 0 &&
    emailOk &&
    password.length > 0 &&
    password === confirm &&
    agree;

  return (
    <form
      className="s3c-fade mt-7 space-y-4"
      onSubmit={event => {
        event.preventDefault();
        if (valid) onSuccess();
      }}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-text-secondary">{type === "team" ? "注册团队" : "注册校管理员"}</p>
        <button type="button" onClick={onBack} className="text-xs text-text-brand transition hover:underline">返回选择账号类型</button>
      </div>

      <Field icon={GraduationCap} type="text" value={school} onChange={event => setSchool(event.target.value)} placeholder="输入学校名称搜索" />

      {type === "team" && (
        <>
          <label className="flex items-center gap-3 rounded-control border border-border bg-surface px-4 transition focus-within:border-primary">
            <ListChecks size={16} className="shrink-0 text-text-tertiary" aria-hidden="true" />
            <select
              value={track}
              onChange={event => setTrack(event.target.value)}
              disabled={!school.trim()}
              className="min-h-12 w-full bg-transparent text-sm text-text-primary outline-none disabled:text-text-tertiary"
            >
              <option value="">{school.trim() ? "请选择赛道" : "请先选择学校"}</option>
              <option value="regular">常规赛 · 主题赛</option>
              <option value="practical">实战赛 · 产教融合</option>
            </select>
            <ChevronDown size={16} className="shrink-0 text-text-tertiary" aria-hidden="true" />
          </label>
          <Field
            icon={UsersRound}
            type="text"
            value={teamName}
            maxLength={16}
            onChange={event => setTeamName(event.target.value)}
            placeholder="团队名称"
            rightSlot={<span className="shrink-0 text-xs text-text-tertiary">{teamName.length} / 16</span>}
          />
        </>
      )}

      <Field icon={User} type="text" value={username} onChange={event => setUsername(event.target.value)} placeholder="登录名" autoComplete="username" />
      <Field
        icon={Phone}
        type="tel"
        value={phone}
        maxLength={20}
        onChange={event => setPhone(event.target.value)}
        placeholder="联系电话"
        autoComplete="tel"
        rightSlot={<span className="shrink-0 text-xs text-text-tertiary">{phone.length} / 20</span>}
      />
      <Field icon={Mail} type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="邮箱" autoComplete="email" />
      <Field icon={Lock} type="password" value={password} onChange={event => setPassword(event.target.value)} placeholder="密码" autoComplete="new-password" />
      <Field icon={Lock} type="password" value={confirm} onChange={event => setConfirm(event.target.value)} placeholder="确认密码" autoComplete="new-password" />

      <label className="flex items-start gap-2 text-xs leading-5 text-text-secondary">
        <input type="checkbox" checked={agree} onChange={event => setAgree(event.target.checked)} className="mt-0.5 accent-[var(--color-primary)]" />
        <span>我已阅读并同意《三创赛竞赛规则》</span>
      </label>

      <button type="submit" disabled={!valid} className="min-h-12 w-full rounded-control bg-primary text-sm font-semibold text-on-primary transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-[var(--color-disabled)] disabled:text-[var(--color-text-disabled)]">
        注册
      </button>
      <p className="text-center text-[11px] leading-5 text-text-tertiary">官方注册时间：2025年10月20日—2026年1月20日 · 原型演示模式可继续填写</p>
      <button type="button" onClick={onGoLogin} className="w-full text-center text-xs text-text-secondary transition hover:text-text-brand">
        已有账号？去登录
      </button>
    </form>
  );
}

function RegisterForm({ onSuccess, onGoLogin }: { onSuccess: () => void; onGoLogin: () => void }) {
  const [accountType, setAccountType] = useState<AccountType | null>(null);
  if (accountType === null) {
    return <AccountTypeStep onChoose={setAccountType} onGoLogin={onGoLogin} />;
  }
  return <AccountRegisterForm type={accountType} onSuccess={onSuccess} onBack={() => setAccountType(null)} onGoLogin={onGoLogin} />;
}

const appFeatures = [
  { icon: Trophy, label: "三创赛报名 · 赛事身份" },
  { icon: Sparkles, label: "创赛工坊 · AI 陪跑" },
  { icon: BookOpenCheck, label: "课程与权益" },
  { icon: Building2, label: "企业实习机会" },
  { icon: ShieldCheck, label: "长期简历 · 可信成果" },
];

function PhoneMockup() {
  return (
    <div className="mx-auto w-[160px] shrink-0">
      <div className="aspect-[9/19] rounded-[36px] bg-[#0B0E18] p-[7px] shadow-[0_24px_48px_-20px_rgba(0,0,0,0.55)]">
        <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[27px] bg-background">
          <div className="pointer-events-none absolute left-1/2 top-2 z-10 h-[14px] w-[52px] -translate-x-1/2 rounded-full bg-[#0B0E18]" aria-hidden="true" />
          <div className="flex items-center justify-between px-4 pb-1 pt-3 text-[9px] font-semibold text-text-tertiary">
            <span>9:41</span>
            <span className="flex items-center gap-1">
              <span aria-hidden="true">●●●●●</span>
              <span className="grid h-2.5 w-[18px] place-items-center rounded-[3px] border border-text-tertiary text-[6px] leading-none">▮</span>
            </span>
          </div>
          <div className="flex flex-1 flex-col px-2.5 pb-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-text-primary">核心产业学院</span>
              <span className="grid size-4 place-items-center rounded bg-primary text-[7px] font-bold text-on-primary">三</span>
            </div>
            <div className="mt-2 rounded-md bg-primary p-2 text-on-primary">
              <p className="text-[8px] font-bold">三创赛 · 报名中</p>
              <p className="mt-0.5 text-[6px] opacity-80">第十六届 · 团队注册报名</p>
            </div>
            <div className="mt-2 grid flex-1 grid-cols-2 gap-1.5">
              <div className="rounded-md bg-surface-subtle px-2 py-1.5">
                <p className="text-[8px] font-semibold text-text-primary">创赛工坊</p>
                <p className="mt-0.5 text-[6px] text-text-tertiary">AI 陪跑</p>
              </div>
              <div className="rounded-md bg-surface-subtle px-2 py-1.5">
                <p className="text-[8px] font-semibold text-text-primary">机会</p>
                <p className="mt-0.5 text-[6px] text-text-tertiary">实习 · 项目</p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-around border-t border-border-subtle bg-surface px-1 py-1.5 text-[7px] font-medium text-text-tertiary">
            <span className="text-text-brand">首页</span><span>赛事</span><span>机会</span><span>我的</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function AppAdPanel() {
  return (
    <aside className="s3c-fade relative h-full min-h-0 w-full overflow-hidden rounded-container bg-primary text-on-primary shadow-floating">
      <div className="s3c-dotgrid pointer-events-none absolute inset-0 opacity-[0.08]" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-24 -left-16 size-64 rounded-full bg-white/5 blur-3xl" aria-hidden="true" />
      <div className="relative grid h-full gap-8 p-7 sm:p-9 lg:grid-cols-[minmax(0,1fr)_168px] lg:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
            <Smartphone size={14} aria-hidden="true" />
            手机端 App
          </div>
          <h2 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl">核心产业学院</h2>
          <p className="mt-2 text-sm font-medium text-on-primary/90">参赛 · 就业实习 · 长期成长</p>
          <p className="mt-3 max-w-sm text-sm leading-6 text-on-primary/80">
            从一次真实参赛开始，连接课程、企业资源与长期成长——比赛会结束，你的经历与成果会一直留下。
          </p>
          <ul className="mt-5 space-y-2">
            {appFeatures.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2.5 text-sm font-medium">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-white/15">
                  <Icon size={13} aria-hidden="true" />
                </span>
                {label}
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button type="button" className="inline-flex min-h-11 items-center gap-2 rounded-control bg-surface px-4 text-sm font-bold text-text-brand transition hover:bg-white">
              <Download size={16} aria-hidden="true" />下载 App
            </button>
            <Link to="/" className="inline-flex min-h-11 items-center gap-1.5 rounded-control px-2 text-sm font-semibold text-on-primary transition hover:bg-white/10">
              了解核心产业学院 <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
          <p className="mt-4 text-[11px] text-on-primary/70">原型环境 · 下载按钮为占位入口，正式版接入应用商店</p>
        </div>
        <PhoneMockup />
      </div>
    </aside>
  );
}

export function SanChuangMockLogin() {
  const [tab, setTab] = useState<Tab>("login");
  const [submitted, setSubmitted] = useState(false);

  return (
    <SanChuangFrame>
      <div className="relative overflow-hidden bg-background">
        <div className="s3c-dotgrid pointer-events-none absolute inset-0 opacity-[0.03]" aria-hidden="true" />
        <div className="relative mx-auto flex min-h-[calc(100vh-240px)] w-full max-w-[1200px] flex-col px-5 py-8 lg:h-[calc(100vh-190px)] lg:min-h-0 lg:px-6 lg:py-10">
          <Link to="/3chuang" className="inline-flex min-h-10 shrink-0 items-center gap-1.5 self-start rounded-control px-2 text-xs font-medium text-text-secondary transition hover:bg-surface-subtle hover:text-text-brand">
            <ChevronLeft size={14} aria-hidden="true" />返回官网首页
          </Link>

          <div className="mt-6 grid min-h-0 flex-1 gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-12 lg:items-stretch">
            <AppAdPanel />

            <div className="w-full max-w-[420px] justify-self-center lg:h-full lg:min-h-0 lg:justify-self-auto">
              <div className="s3c-fade flex h-full min-h-0 flex-col overflow-hidden rounded-container border border-border-subtle bg-surface shadow-floating">
                <div className="shrink-0 border-b border-border-subtle px-7 pb-5 pt-7 sm:px-8 sm:pt-8">
                  <div className="flex items-center gap-3">
                    <span className="grid size-11 place-items-center rounded-control bg-primary text-lg font-bold text-on-primary">三</span>
                    <div>
                      <p className="text-sm font-bold text-text-primary">三创赛报名系统</p>
                      <p className="mt-0.5 text-[11px] tracking-[0.14em] text-text-tertiary">全国大学生电子商务三创赛</p>
                    </div>
                  </div>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-7 pb-6 pt-5 sm:px-8 sm:pb-8">
                  {submitted ? (
                    <MockSuccess mode={tab} reset={() => setSubmitted(false)} />
                  ) : (
                    <>
                      <div className="grid grid-cols-2 rounded-control border border-border-subtle bg-surface p-1">
                        {(["login", "register"] as const).map(item => (
                          <button
                            key={item}
                            type="button"
                            onClick={() => setTab(item)}
                            className={`min-h-10 rounded px-2 text-sm font-semibold transition ${
                              tab === item ? "bg-primary text-on-primary" : "text-text-secondary hover:text-text-brand"
                            }`}
                          >
                            {item === "login" ? "登 录" : "注 册"}
                          </button>
                        ))}
                      </div>

                      {tab === "login" ? (
                        <LoginForm onSuccess={() => setSubmitted(true)} onGoRegister={() => setTab("register")} />
                      ) : (
                        <RegisterForm onSuccess={() => setSubmitted(true)} onGoLogin={() => setTab("login")} />
                      )}

                      <p className="mt-6 border-t border-border-subtle pt-4 text-center text-[11px] leading-5 text-text-tertiary">
                        模拟官网原型环境 · 本页面不会真实提交任何数据
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SanChuangFrame>
  );
}

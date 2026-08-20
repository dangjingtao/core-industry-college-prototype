import { Check, ChevronLeft, Eye, EyeOff, Lock, Phone, ShieldCheck, Trophy, User } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { SanChuangFrame } from "./SanChuangShell";

type Tab = "login" | "register";

function useCountdown() {
  const [countdown, setCountdown] = useState(0);
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = window.setTimeout(() => setCountdown(value => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [countdown]);
  return [countdown, setCountdown] as const;
}

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

function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const valid = identifier.trim().length > 0 && password.length > 0;
  return (
    <form
      className="s3c-fade mt-7 space-y-4"
      onSubmit={event => {
        event.preventDefault();
        if (valid) onSuccess();
      }}
    >
      <Field icon={User} type="text" value={identifier} onChange={event => setIdentifier(event.target.value)} placeholder="登录名 / 手机号 / 邮箱" autoComplete="username" />
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
      <div className="flex items-center justify-between text-xs text-text-secondary">
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" defaultChecked className="accent-[var(--color-primary)]" />
          记住登录状态
        </label>
        <button type="button" className="transition hover:text-text-brand">忘记密码？</button>
      </div>
      <button type="submit" disabled={!valid} className="min-h-12 w-full rounded-control bg-primary text-sm font-semibold text-on-primary transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-[var(--color-disabled)] disabled:text-[var(--color-text-disabled)]">
        登 录
      </button>
    </form>
  );
}

function RegisterForm({ onSuccess }: { onSuccess: () => void }) {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agree, setAgree] = useState(false);
  const [countdown, setCountdown] = useCountdown();

  const sendCode = () => {
    if (!/^1\d{10}$/.test(phone)) return;
    setCountdown(60);
  };

  const valid = /^1\d{10}$/.test(phone) && code.trim().length >= 4 && password.length >= 6 && password === confirm && agree;

  return (
    <form
      className="s3c-fade mt-7 space-y-4"
      onSubmit={event => {
        event.preventDefault();
        if (valid) onSuccess();
      }}
    >
      <Field icon={Phone} type="tel" value={phone} onChange={event => setPhone(event.target.value)} placeholder="手机号" autoComplete="tel" />
      <div className="flex gap-3">
        <Field icon={ShieldCheck} type="text" value={code} onChange={event => setCode(event.target.value)} placeholder="短信验证码" className="min-w-0" />
        <button
          type="button"
          onClick={sendCode}
          disabled={!/^1\d{10}$/.test(phone) || countdown > 0}
          className="min-h-12 shrink-0 rounded-control border border-border px-4 text-xs font-semibold text-text-brand transition hover:bg-primary-container disabled:cursor-not-allowed disabled:border-border-subtle disabled:text-text-tertiary"
        >
          {countdown > 0 ? `${countdown}s 后重发` : "获取验证码"}
        </button>
      </div>
      <Field icon={Lock} type="password" value={password} onChange={event => setPassword(event.target.value)} placeholder="设置密码（不少于 6 位）" autoComplete="new-password" />
      <Field icon={Lock} type="password" value={confirm} onChange={event => setConfirm(event.target.value)} placeholder="确认密码" autoComplete="new-password" />
      <label className="flex items-start gap-2 text-xs leading-5 text-text-secondary">
        <input type="checkbox" checked={agree} onChange={event => setAgree(event.target.checked)} className="mt-0.5 accent-[var(--color-primary)]" />
        <span>我已阅读并同意《竞赛规则》与《报名须知》</span>
      </label>
      <button type="submit" disabled={!valid} className="min-h-12 w-full rounded-control bg-primary text-sm font-semibold text-on-primary transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-[var(--color-disabled)] disabled:text-[var(--color-text-disabled)]">
        注册并登录
      </button>
    </form>
  );
}

export function SanChuangMockLogin() {
  const [tab, setTab] = useState<Tab>("login");
  const [submitted, setSubmitted] = useState(false);

  return (
    <SanChuangFrame>
      <div className="relative overflow-hidden bg-background">
        <div className="s3c-dotgrid pointer-events-none absolute inset-0 opacity-[0.03]" aria-hidden="true" />
        <div className="relative mx-auto flex min-h-[calc(100vh-240px)] max-w-[1200px] flex-col items-center px-5 py-12 lg:px-6 lg:py-16">
          <Link to="/3chuang" className="inline-flex min-h-10 items-center gap-1.5 self-start rounded-control px-2 text-xs font-medium text-text-secondary transition hover:bg-surface-subtle hover:text-text-brand">
            <ChevronLeft size={14} aria-hidden="true" />返回官网首页
          </Link>

          <div className="s3c-fade mt-8 w-full max-w-[420px] rounded-container border border-border-subtle bg-surface p-7 shadow-floating sm:p-8">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-control bg-primary text-lg font-bold text-on-primary">三</span>
              <div>
                <p className="text-sm font-bold text-text-primary">三创赛报名系统</p>
                <p className="mt-0.5 text-[11px] tracking-[0.14em] text-text-tertiary">全国大学生电子商务三创赛</p>
              </div>
            </div>

            {submitted ? (
              <MockSuccess mode={tab} reset={() => setSubmitted(false)} />
            ) : (
              <>
                <div className="mt-7 grid grid-cols-2 rounded-control border border-border-subtle bg-surface p-1">
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
                  <LoginForm onSuccess={() => setSubmitted(true)} />
                ) : (
                  <RegisterForm onSuccess={() => setSubmitted(true)} />
                )}

                <p className="mt-6 border-t border-border-subtle pt-4 text-center text-[11px] leading-5 text-text-tertiary">
                  模拟官网原型环境 · 本页面不会真实提交任何数据
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </SanChuangFrame>
  );
}

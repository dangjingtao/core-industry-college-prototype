import { useState, type FormEvent, type ReactNode } from "react";
import { Eye, EyeOff, KeyRound, MessageCircle, ShieldCheck, Sparkles, Trophy, UserRound } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button, Card, PageHeader, PublicShell, SecondaryButton, StatusTag } from "../../components/ui";
import { useLongTermAssets } from "../long-term-assets/store";
import { usePublicPlatform } from "../public-platform/PublicPlatform";

type AuthMethod = "password" | "code";

const phonePattern = /^1\d{10}$/;
const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

function safeReturnTo(search: string, fallback = "/home") {
  const value = new URLSearchParams(search).get("returnTo");
  return value?.startsWith("/") && !value.startsWith("//") ? value : fallback;
}

function AuthField({ label, value, onChange, type = "text", placeholder, autoComplete, suffix }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  suffix?: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-text-primary">{label}</span>
      <span className="relative mt-2 block">
        <input
          type={type}
          value={value}
          onChange={event => onChange(event.target.value.trimStart())}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`min-h-touch w-full rounded-control border border-border bg-surface px-3 text-sm text-text-primary outline-none focus:border-primary ${suffix ? "pr-12" : ""}`}
        />
        {suffix && <span className="absolute inset-y-0 right-1 flex items-center">{suffix}</span>}
      </span>
    </label>
  );
}

function PasswordField({ label, value, onChange, autoComplete }: { label: string; value: string; onChange: (value: string) => void; autoComplete: string }) {
  const [visible, setVisible] = useState(false);
  return <AuthField label={label} value={value} onChange={onChange} type={visible ? "text" : "password"} autoComplete={autoComplete} placeholder="至少 8 位，包含字母和数字" suffix={<button type="button" aria-label={visible ? "隐藏密码" : "显示密码"} onClick={() => setVisible(current => !current)} className="flex size-10 items-center justify-center rounded-control text-text-secondary active:bg-surface-pressed">{visible ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}</button>} />;
}

function VerificationFields({ account, sent, code, onSent, onCode }: { account: string; sent: boolean; code: string; onSent: () => void; onCode: (value: string) => void }) {
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button type="button" disabled={!phonePattern.test(account)} onClick={onSent} className="min-h-touch flex-1 rounded-control border border-border bg-surface px-3 text-sm font-medium text-text-primary disabled:opacity-40">{sent ? "重新发送验证码" : "发送验证码"}</button>
        <div className="flex min-h-touch flex-1 items-center justify-center rounded-control bg-surface-subtle px-3 text-center text-xs text-text-secondary">{sent ? "原型验证码：123456" : "发送至手机号"}</div>
      </div>
      {sent && <AuthField label="验证码" value={code} onChange={value => onCode(value.replace(/\D/g, "").slice(0, 6))} placeholder="输入 6 位验证码" autoComplete="one-time-code" />}
    </div>
  );
}

function AuthIntro() {
  return <Card className="border border-border-subtle"><div className="flex items-start gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-control bg-primary-container text-text-brand"><ShieldCheck size={20} aria-hidden="true" /></span><div><h2 className="font-semibold text-text-primary">原型账号验证</h2><p className="mt-1 text-sm leading-5 text-text-secondary">不发送真实短信或邮件，不接入后端鉴权；用于验证表单、状态和业务返回路径。</p></div></div></Card>;
}

export function WelcomePage() {
  const navigate = useNavigate();
  const highlights = [
    { icon: Trophy, title: "参赛", description: "发现赛事，持续推进报名、团队和比赛成果" },
    { icon: UserRound, title: "就业与实习", description: "用长期简历连接企业机会与真实项目实践" },
    { icon: Sparkles, title: "长期成长", description: "课程、证书和参赛经历跟随账号长期保留" },
  ];
  return <PublicShell showNavigation={false}><div className="space-y-8 px-5 pb-8 pt-[calc(env(safe-area-inset-top)+40px)]"><div><p className="text-sm font-medium text-text-brand">核心产业学院</p><h1 className="mt-3 text-3xl font-semibold leading-10 text-text-primary">从一次比赛，走向更长的成长路径</h1><p className="mt-3 text-base leading-7 text-text-secondary">参赛、实习与长期可信空间，都归属于同一个学生账号。</p></div><div className="space-y-3">{highlights.map(({ icon: Icon, title, description }) => <div key={title} className="flex items-start gap-3 rounded-container bg-surface p-4"><span className="flex size-10 shrink-0 items-center justify-center rounded-control bg-primary-container text-text-brand"><Icon size={20} aria-hidden="true" /></span><div><h2 className="font-semibold text-text-primary">{title}</h2><p className="mt-1 text-sm leading-5 text-text-secondary">{description}</p></div></div>)}</div><Button className="w-full" onClick={() => navigate("/auth/login")}>登录 / 注册</Button></div></PublicShell>;
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = usePublicPlatform();
  const returnTo = safeReturnTo(location.search);
  const [method, setMethod] = useState<AuthMethod>("password");
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const valid = phonePattern.test(account) && (method === "password" ? passwordPattern.test(password) : sent && code === "123456");
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!valid) {
      setError(method === "password" ? "请输入 11 位手机号，并使用至少 8 位且包含字母和数字的密码。" : "请输入 11 位手机号及原型验证码 123456。");
      return;
    }
    login();
    navigate(returnTo, { replace: true });
  };
  const wechatExtra = location.search.includes("wechatAccount=existing") ? "&wechatAccount=existing" : "";
  const wechatTarget = `/auth/wechat/authorize?returnTo=${encodeURIComponent(returnTo)}${wechatExtra}`;
  return <PublicShell showNavigation={false}><PageHeader title="登录" backTo="/welcome" /><form onSubmit={submit} className="space-y-5 px-4 py-6"><AuthIntro /><div className="grid grid-cols-2 gap-2 rounded-control bg-surface-subtle p-1">{(["password", "code"] as const).map(value => <button key={value} type="button" onClick={() => { setMethod(value); setError(""); }} className={`min-h-touch rounded-control text-sm font-medium ${method === value ? "bg-surface text-text-brand shadow-sm" : "text-text-secondary"}`}>{value === "password" ? "密码登录" : "验证码登录"}</button>)}</div><AuthField label="手机号" value={account} onChange={value => { setAccount(value.replace(/\D/g, "").slice(0, 11)); setSent(false); setCode(""); setError(""); }} placeholder="请输入 11 位手机号" autoComplete="tel" />{method === "password" ? <PasswordField label="密码" value={password} onChange={value => { setPassword(value); setError(""); }} autoComplete="current-password" /> : <VerificationFields account={account} sent={sent} code={code} onSent={() => { setSent(true); setCode(""); setError(""); }} onCode={value => { setCode(value); setError(""); }} />}{error && <p className="rounded-control bg-danger-bg px-3 py-2 text-sm text-danger-text">{error}</p>}<Button type="submit" className="w-full" disabled={!valid}>登录</Button><div className="flex items-center justify-between text-sm"><Link className="min-h-touch py-3 font-medium text-text-brand" to={`/auth/register?returnTo=${encodeURIComponent(returnTo)}`}>注册新账号</Link><Link className="min-h-touch py-3 font-medium text-text-brand" to="/auth/forgot-password">忘记密码</Link></div><div className="space-y-3 border-t border-border-subtle pt-4"><Link to={wechatTarget} className="flex min-h-touch w-full items-center justify-center gap-2 rounded-control border border-border bg-surface text-sm font-medium text-text-primary active:bg-surface-pressed"><MessageCircle size={18} aria-hidden="true" />微信登录</Link><p className="text-center text-xs leading-5 text-text-tertiary">新用户通过微信授权后，需用绑定手机号完成注册。</p></div></form></PublicShell>;
}

export function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { registerAccount } = usePublicPlatform();
  const { initializeNewAccount } = useLongTermAssets();
  const returnTo = safeReturnTo(location.search);
  const [account, setAccount] = useState("");
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const valid = /^1\d{10}$/.test(account) && sent && code === "123456";
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!valid) {
      setError("请输入 11 位手机号并输入原型验证码 123456。");
      return;
    }
    registerAccount();
    initializeNewAccount(account);
    navigate(`/onboarding/profile?returnTo=${encodeURIComponent(returnTo)}`, { replace: true });
  };
  return <PublicShell showNavigation={false}><PageHeader title="注册新账号" backTo={`/auth/login?returnTo=${encodeURIComponent(returnTo)}`} /><form onSubmit={submit} className="space-y-5 px-4 py-6"><AuthIntro /><AuthField label="手机号" value={account} onChange={value => { setAccount(value.replace(/\D/g, "").slice(0, 11)); setSent(false); setCode(""); setError(""); }} placeholder="仅支持 11 位手机号注册" autoComplete="tel" /><VerificationFields account={account} sent={sent} code={code} onSent={() => { setSent(true); setCode(""); setError(""); }} onCode={value => { setCode(value); setError(""); }} />{error && <p className="rounded-control bg-danger-bg px-3 py-2 text-sm text-danger-text">{error}</p>}<Button type="submit" className="w-full" disabled={!valid}>注册并自动登录</Button><p className="text-center text-xs leading-5 text-text-tertiary">注册即视为同意 <Link className="font-medium text-text-brand" to="/legal/user-agreement">用户协议</Link> 和 <Link className="font-medium text-text-brand" to="/legal/privacy">隐私政策</Link>。</p></form></PublicShell>;
}


export function WechatAuthorizePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = safeReturnTo(location.search, "/home");
  const authorize = () => navigate(`/auth/wechat/phone?returnTo=${encodeURIComponent(returnTo)}${location.search.includes("wechatAccount=existing") ? "&wechatAccount=existing" : ""}`);
  return <PublicShell showNavigation={false}><PageHeader title="微信身份授权" backTo={`/auth/login?returnTo=${encodeURIComponent(returnTo)}`} /><div className="space-y-5 px-4 py-6"><Card><div className="flex items-start gap-3"><span className="flex size-12 shrink-0 items-center justify-center rounded-control bg-primary-container text-text-brand"><MessageCircle size={22} aria-hidden="true" /></span><div><StatusTag tone="info">微信登录</StatusTag><h1 className="mt-2 text-lg font-semibold text-text-primary">使用微信身份继续</h1><p className="mt-2 text-sm leading-6 text-text-secondary">原型不会调用真实微信接口。点击同意后，微信会要求你授权获取绑定手机号；新用户需要通过手机号完成长期账号注册。</p></div></div></Card><Card className="border border-border-subtle"><h2 className="font-semibold text-text-primary">授权用途</h2><ul className="mt-3 space-y-2 text-sm leading-6 text-text-secondary"><li>· 用于识别是否已存在长期账号</li><li>· 新用户将通过微信绑定的手机号建立长期账号</li><li>· 不会基于微信身份建立第二份 Profile 真相源</li></ul></Card><Button type="button" className="w-full" onClick={authorize}>同意微信授权</Button><SecondaryButton type="button" className="w-full" onClick={() => navigate(`/auth/login?returnTo=${encodeURIComponent(returnTo)}`)}>取消</SecondaryButton></div></PublicShell>;
}

export function WechatPhonePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, registerAccount } = usePublicPlatform();
  const { initializeNewAccount } = useLongTermAssets();
  const returnTo = safeReturnTo(location.search, "/home");
  const existingAccount = new URLSearchParams(location.search).get("wechatAccount") === "existing";
  // mock：原型用固定 mock 号码；真实环境会通过微信 openId 拿到绑定手机号
  const phone = existingAccount ? "13800138000" : "13900139000";
  const masked = `${phone.slice(0, 3)} **** ${phone.slice(7)}`;
  const confirm = () => {
    if (existingAccount) {
      login();
      navigate(returnTo, { replace: true });
      return;
    }
    registerAccount();
    initializeNewAccount(phone);
    navigate(`/onboarding/profile?returnTo=${encodeURIComponent(returnTo)}`, { replace: true });
  };
  return <PublicShell showNavigation={false}><PageHeader title="获取手机号" backTo={`/auth/wechat/authorize?returnTo=${encodeURIComponent(returnTo)}${existingAccount ? "&wechatAccount=existing" : ""}`} /><div className="space-y-5 px-4 py-6"><Card><div className="flex items-start gap-3"><span className="flex size-12 shrink-0 items-center justify-center rounded-control bg-primary-container text-text-brand"><MessageCircle size={22} aria-hidden="true" /></span><div><StatusTag tone="warning">微信绑定手机号</StatusTag><h1 className="mt-2 text-lg font-semibold text-text-primary">允许获取你的手机号</h1><p className="mt-2 text-sm leading-6 text-text-secondary">用于识别是否已有长期账号。新用户将以此手机号建立长期账号并继续完善基础资料。</p></div></div></Card><Card className="border border-border-subtle"><p className="text-xs font-medium text-text-tertiary">原型返回的手机号</p><p className="mt-2 text-2xl font-semibold tracking-widest text-text-primary">{masked}</p><p className="mt-2 text-xs leading-5 text-text-secondary">真实环境会展示微信返回的绑定号码，这里仅做 mock 占位。</p></Card>{existingAccount ? <p className="rounded-control bg-success-bg px-3 py-2 text-sm text-success-text">该手机号已注册，确认后将直接登录。</p> : <p className="rounded-control bg-surface-subtle px-3 py-2 text-sm text-text-secondary">该手机号尚未注册，确认后将创建新账号并进入资料完善。</p>}<Button type="button" className="w-full" onClick={confirm}>允许获取手机号</Button><SecondaryButton type="button" className="w-full" onClick={() => navigate(`/auth/login?returnTo=${encodeURIComponent(returnTo)}`)}>暂不授权</SecondaryButton></div></PublicShell>;
}

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [account, setAccount] = useState("");
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [completed, setCompleted] = useState(false);
  const valid = phonePattern.test(account) && sent && code === "123456" && passwordPattern.test(password) && password === confirmPassword;
  const submit = (event: FormEvent) => { event.preventDefault(); if (valid) setCompleted(true); };
  if (completed) return <PublicShell showNavigation={false}><PageHeader title="重置密码" /><div className="space-y-5 px-4 py-8"><Card className="border border-success bg-success-bg text-center"><span className="mx-auto flex size-12 items-center justify-center rounded-full bg-surface text-success-text"><KeyRound size={22} aria-hidden="true" /></span><h1 className="mt-4 text-lg font-semibold text-success-text">密码已重置</h1><p className="mt-2 text-sm text-success-text">原型不会向真实账号写入密码；当前流程只验证完整交互状态。</p></Card><Button className="w-full" onClick={() => navigate("/auth/login", { replace: true })}>返回登录</Button></div></PublicShell>;
  return <PublicShell showNavigation={false}><PageHeader title="找回密码" backTo="/auth/login" /><form onSubmit={submit} className="space-y-5 px-4 py-6"><AuthIntro /><AuthField label="手机号" value={account} onChange={value => { setAccount(value.replace(/\D/g, "").slice(0, 11)); setSent(false); setCode(""); }} placeholder="输入注册时使用的手机号" autoComplete="tel" /><VerificationFields account={account} sent={sent} code={code} onSent={() => { setSent(true); setCode(""); }} onCode={setCode} /><PasswordField label="新密码" value={password} onChange={setPassword} autoComplete="new-password" /><PasswordField label="确认新密码" value={confirmPassword} onChange={setConfirmPassword} autoComplete="new-password" />{confirmPassword && password !== confirmPassword && <p className="rounded-control bg-danger-bg px-3 py-2 text-sm text-danger-text">两次输入的密码不一致。</p>}<Button type="submit" className="w-full" disabled={!valid}>确认重置</Button></form></PublicShell>;
}

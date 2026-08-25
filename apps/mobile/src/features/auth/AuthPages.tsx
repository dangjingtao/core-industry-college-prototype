import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Eye, EyeOff, KeyRound, MessageCircle, ShieldCheck, Sparkles, Trophy, UserRound } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button, Card, PageHeader, PublicShell, SecondaryButton, StatusTag } from "../../components/ui";
import { useLongTermAssets } from "../long-term-assets/store";
import { usePublicPlatform } from "../public-platform/PublicPlatform";

type AuthMethod = "password" | "code";
type RecognitionCase = "default" | "history" | "preaccount" | "conflict";

const phonePattern = /^1\d{10}$/;
const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

function safeReturnTo(search: string, fallback = "/home") {
  const value = new URLSearchParams(search).get("returnTo");
  return value?.startsWith("/") && !value.startsWith("//") ? value : fallback;
}

function recognitionCase(search: string): RecognitionCase {
  const params = new URLSearchParams(search);
  const value = params.get("accountCase");
  if (value === "history" || value === "preaccount" || value === "conflict") return value;
  if (params.get("wechatAccount") === "existing") return "history";
  return "default";
}

function recognitionMockPhone(value: RecognitionCase) {
  return value === "history" ? "13800138000" : value === "preaccount" ? "13700137000" : value === "conflict" ? "13600136000" : "";
}

function recognitionQuery(search: string) {
  const params = new URLSearchParams(search);
  const values: string[] = [];
  if (params.get("wechatAccount") === "existing") values.push("wechatAccount=existing");
  const accountCase = params.get("accountCase");
  if (accountCase === "history" || accountCase === "preaccount" || accountCase === "conflict") values.push(`accountCase=${accountCase}`);
  return values.length ? `&${values.join("&")}` : "";
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

function RecognitionNotice({ value }: { value: RecognitionCase }) {
  if (value === "default") {
    return <Card className="border border-border-subtle"><div className="flex items-start gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-control bg-surface-subtle text-text-secondary"><UserRound size={20} aria-hidden="true" /></span><div><StatusTag tone="neutral">T028 账号识别</StatusTag><p className="mt-2 text-sm leading-6 text-text-secondary">当前原型先用手机号验证账号命中；邮箱继续作为赛事通知字段。最终唯一身份锚点仍待产品确认。</p></div></div></Card>;
  }
  if (value === "history") {
    return <Card className="border border-primary/30 bg-primary-container/40"><StatusTag tone="info">已命中历史账号</StatusTag><h2 className="mt-3 font-semibold text-text-primary">发现已有三创赛 / 核心学院账号</h2><p className="mt-2 text-sm leading-6 text-text-secondary">验证手机号后继续使用同一个长期账号，不重新创建赛事账号。历史账号具体合并规则仍由产品确认。</p></Card>;
  }
  if (value === "preaccount") {
    return <Card className="border border-warning/30 bg-warning-bg"><StatusTag tone="warning">待认领账号</StatusTag><h2 className="mt-3 font-semibold text-text-primary">发现队长代录的待认领队员信息</h2><p className="mt-2 text-sm leading-6 text-text-secondary">验证手机号后认领现有记录，不重新注册第二个账号。队员首次认领后需要补哪些资料仍待确认。</p></Card>;
  }
  return <Card className="border border-danger/30 bg-danger-bg"><StatusTag tone="danger">账号冲突</StatusTag><h2 className="mt-3 font-semibold text-text-primary">该手机号已关联其他长期账号</h2><p className="mt-2 text-sm leading-6 text-text-secondary">原型明确停止自动合并，避免覆盖既有参赛经历和长期资产。冲突账号的人工核验与资产迁移规则待产品确认。</p></Card>;
}

function RecognitionScenarioLinks({ returnTo, current }: { returnTo: string; current: RecognitionCase }) {
  const cases: Array<{ value: RecognitionCase; label: string }> = [
    { value: "default", label: "普通登录" },
    { value: "history", label: "历史账号" },
    { value: "preaccount", label: "待认领队员" },
    { value: "conflict", label: "账号冲突" },
  ];
  return <div className="rounded-control border border-dashed border-border px-3 py-3"><p className="text-xs font-medium text-text-tertiary">原型场景切换</p><div className="mt-2 flex flex-wrap gap-2">{cases.map(item => <Link key={item.value} to={`/auth/login?returnTo=${encodeURIComponent(returnTo)}${item.value === "default" ? "" : `&accountCase=${item.value}`}`} className={`rounded-full px-3 py-2 text-xs font-medium ${current === item.value ? "bg-primary-container text-text-brand" : "bg-surface-subtle text-text-secondary"}`}>{item.label}</Link>)}</div></div>;
}

export function WelcomePage({ replayButton }: { replayButton?: ReactNode }) {
  const navigate = useNavigate();
  const highlights = [
    { icon: Trophy, title: "参赛", description: "发现赛事，持续推进报名、团队和比赛成果" },
    { icon: UserRound, title: "就业与实习", description: "用长期简历连接企业机会与真实项目实践" },
    { icon: Sparkles, title: "长期成长", description: "课程、证书和参赛经历跟随账号长期保留" },
  ];
  return <PublicShell showNavigation={false}><div className="space-y-8 px-5 pb-8 pt-[calc(env(safe-area-inset-top)+40px)]"><div><p className="text-sm font-medium text-text-brand">核心产业学院</p><h1 className="mt-3 text-3xl font-semibold leading-10 text-text-primary">从一次比赛，走向更长的成长路径</h1><p className="mt-3 text-base leading-7 text-text-secondary">参赛、实习与长期可信空间，都归属于同一个学生账号。</p></div><div className="space-y-3">{highlights.map(({ icon: Icon, title, description }) => <div key={title} className="flex items-start gap-3 rounded-container bg-surface p-4"><span className="flex size-10 shrink-0 items-center justify-center rounded-control bg-primary-container text-text-brand"><Icon size={20} aria-hidden="true" /></span><div><h2 className="font-semibold text-text-primary">{title}</h2><p className="mt-1 text-sm leading-5 text-text-secondary">{description}</p></div></div>)}</div><div><Button className="w-full" onClick={() => navigate("/auth/login")}>登录 / 注册</Button>{replayButton}</div></div></PublicShell>;
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = usePublicPlatform();
  const returnTo = safeReturnTo(location.search);
  const accountCase = recognitionCase(location.search);
  const [method, setMethod] = useState<AuthMethod>(accountCase === "default" ? "password" : "code");
  const [account, setAccount] = useState(recognitionMockPhone(accountCase));
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setMethod(accountCase === "default" ? "password" : "code");
    setAccount(recognitionMockPhone(accountCase));
    setPassword("");
    setCode("");
    setSent(false);
    setError("");
  }, [accountCase]);

  const valid = phonePattern.test(account) && (method === "password" ? passwordPattern.test(password) : sent && code === "123456");
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!valid) {
      setError(method === "password" ? "请输入 11 位手机号，并使用至少 8 位且包含字母和数字的密码。" : "请输入 11 位手机号及原型验证码 123456。");
      return;
    }
    if (accountCase === "conflict") {
      setError("该手机号命中多个账号事实，当前原型不会自动合并。请先完成人工核验，再决定账号归并与资产迁移。");
      return;
    }
    login();
    navigate(returnTo, { replace: true });
  };
  const wechatTarget = `/auth/wechat/authorize?returnTo=${encodeURIComponent(returnTo)}${recognitionQuery(location.search)}`;
  return <PublicShell showNavigation={false}><PageHeader title="登录" backTo="/welcome" /><form onSubmit={submit} className="space-y-5 px-4 py-6"><AuthIntro /><RecognitionNotice value={accountCase} /><div className="grid grid-cols-2 gap-2 rounded-control bg-surface-subtle p-1">{(["password", "code"] as const).map(value => <button key={value} type="button" onClick={() => { setMethod(value); setError(""); }} className={`min-h-touch rounded-control text-sm font-medium ${method === value ? "bg-surface text-text-brand shadow-sm" : "text-text-secondary"}`}>{value === "password" ? "密码登录" : "验证码登录"}</button>)}</div><AuthField label="手机号" value={account} onChange={value => { setAccount(value.replace(/\D/g, "").slice(0, 11)); setSent(false); setCode(""); setError(""); }} placeholder="请输入 11 位手机号" autoComplete="tel" />{method === "password" ? <PasswordField label="密码" value={password} onChange={value => { setPassword(value); setError(""); }} autoComplete="current-password" /> : <VerificationFields account={account} sent={sent} code={code} onSent={() => { setSent(true); setCode(""); setError(""); }} onCode={value => { setCode(value); setError(""); }} />}{error && <p className="rounded-control bg-danger-bg px-3 py-2 text-sm text-danger-text">{error}</p>}<Button type="submit" className="w-full" disabled={!valid}>{accountCase === "preaccount" ? "验证并认领账号" : accountCase === "history" ? "验证并继续" : "登录"}</Button><div className="flex items-center justify-between text-sm"><Link className="min-h-touch py-3 font-medium text-text-brand" to={`/auth/register?returnTo=${encodeURIComponent(returnTo)}`}>注册新账号</Link><Link className="min-h-touch py-3 font-medium text-text-brand" to="/auth/forgot-password">忘记密码</Link></div><div className="space-y-3 border-t border-border-subtle pt-4"><Link to={wechatTarget} className="flex min-h-touch w-full items-center justify-center gap-2 rounded-control border border-border bg-surface text-sm font-medium text-text-primary active:bg-surface-pressed"><MessageCircle size={18} aria-hidden="true" />微信登录</Link><p className="text-center text-xs leading-5 text-text-tertiary">微信只作为登录 / 授权入口，最终仍落到同一个长期学生账号。</p></div><RecognitionScenarioLinks returnTo={returnTo} current={accountCase} /></form></PublicShell>;
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
  const extra = recognitionQuery(location.search);
  const authorize = () => navigate(`/auth/wechat/phone?returnTo=${encodeURIComponent(returnTo)}${extra}`);
  return <PublicShell showNavigation={false}><PageHeader title="微信身份授权" backTo={`/auth/login?returnTo=${encodeURIComponent(returnTo)}`} /><div className="space-y-5 px-4 py-6"><Card><div className="flex items-start gap-3"><span className="flex size-12 shrink-0 items-center justify-center rounded-control bg-primary-container text-text-brand"><MessageCircle size={22} aria-hidden="true" /></span><div><StatusTag tone="info">微信登录</StatusTag><h1 className="mt-2 text-lg font-semibold text-text-primary">使用微信身份继续</h1><p className="mt-2 text-sm leading-6 text-text-secondary">原型不会调用真实微信接口。点击同意后，微信会要求你授权获取绑定手机号；手机号用于匹配已有长期账号或继续新用户注册。</p></div></div></Card><Card className="border border-border-subtle"><h2 className="font-semibold text-text-primary">授权用途</h2><ul className="mt-3 space-y-2 text-sm leading-6 text-text-secondary"><li>· 用于识别是否已存在长期账号</li><li>· 可识别历史账号或队长代录的待认领账号</li><li>· 不会基于微信身份建立第二份 Profile 真相源</li></ul></Card><Button type="button" className="w-full" onClick={authorize}>同意微信授权</Button><SecondaryButton type="button" className="w-full" onClick={() => navigate(`/auth/login?returnTo=${encodeURIComponent(returnTo)}`)}>取消</SecondaryButton></div></PublicShell>;
}

export function WechatPhonePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, registerAccount } = usePublicPlatform();
  const { initializeNewAccount } = useLongTermAssets();
  const returnTo = safeReturnTo(location.search, "/home");
  const accountCase = recognitionCase(location.search);
  const existingAccount = accountCase === "history";
  const preaccount = accountCase === "preaccount";
  const conflict = accountCase === "conflict";
  const phone = accountCase === "default" ? "13900139000" : recognitionMockPhone(accountCase);
  const masked = `${phone.slice(0, 3)} **** ${phone.slice(7)}`;
  const confirm = () => {
    if (conflict) {
      navigate(`/auth/login?returnTo=${encodeURIComponent(returnTo)}&accountCase=conflict`, { replace: true });
      return;
    }
    if (existingAccount || preaccount) {
      login();
      navigate(returnTo, { replace: true });
      return;
    }
    registerAccount();
    initializeNewAccount(phone);
    navigate(`/onboarding/profile?returnTo=${encodeURIComponent(returnTo)}`, { replace: true });
  };
  return <PublicShell showNavigation={false}><PageHeader title="获取手机号" backTo={`/auth/wechat/authorize?returnTo=${encodeURIComponent(returnTo)}${recognitionQuery(location.search)}`} /><div className="space-y-5 px-4 py-6"><Card><div className="flex items-start gap-3"><span className="flex size-12 shrink-0 items-center justify-center rounded-control bg-primary-container text-text-brand"><MessageCircle size={22} aria-hidden="true" /></span><div><StatusTag tone={conflict ? "danger" : preaccount ? "warning" : "info"}>微信绑定手机号</StatusTag><h1 className="mt-2 text-lg font-semibold text-text-primary">允许获取你的手机号</h1><p className="mt-2 text-sm leading-6 text-text-secondary">用于识别是否已有长期账号、历史账号或待认领队员记录；不会因为微信登录创建第二套账号。</p></div></div></Card><Card className="border border-border-subtle"><p className="text-xs font-medium text-text-tertiary">原型返回的手机号</p><p className="mt-2 text-2xl font-semibold tracking-widest text-text-primary">{masked}</p><p className="mt-2 text-xs leading-5 text-text-secondary">真实环境会展示微信返回的绑定号码，这里仅做 mock 占位。</p></Card>{existingAccount ? <p className="rounded-control bg-success-bg px-3 py-2 text-sm text-success-text">该手机号已命中长期账号，确认后直接登录，不重复注册。</p> : preaccount ? <p className="rounded-control bg-warning-bg px-3 py-2 text-sm text-warning-text">该手机号命中队长代录的待认领账号，确认后完成认领并继续。</p> : conflict ? <p className="rounded-control bg-danger-bg px-3 py-2 text-sm text-danger-text">该手机号存在账号冲突，当前原型不会自动合并。确认后返回账号核验流程。</p> : <p className="rounded-control bg-surface-subtle px-3 py-2 text-sm text-text-secondary">该手机号尚未注册，确认后将创建新账号并进入资料完善。</p>}<Button type="button" className="w-full" onClick={confirm}>{existingAccount ? "确认并登录" : preaccount ? "确认并认领" : conflict ? "进入账号核验" : "允许获取手机号"}</Button><SecondaryButton type="button" className="w-full" onClick={() => navigate(`/auth/login?returnTo=${encodeURIComponent(returnTo)}`)}>暂不授权</SecondaryButton></div></PublicShell>;
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

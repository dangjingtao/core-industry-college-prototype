import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button, Card, PageHeader, PublicShell, SecondaryButton, StatusTag } from "../../components/ui";
import { useLongTermAssets } from "../long-term-assets/store";
import { usePublicPlatform } from "../public-platform/PublicPlatform";

const phonePattern = /^1\d{10}$/;
const prototypeCode = "123456";
const conflictPhone = "13600136000";

type RebindStage = "eligibility" | "verifyOld" | "verifyNew" | "conflict" | "manual" | "completed";

function maskedPhone(phone: string) {
  return phonePattern.test(phone) ? `${phone.slice(0, 3)} **** ${phone.slice(7)}` : "未绑定";
}

export function PhoneBindingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { identities } = usePublicPlatform();
  const { profile, updateProfile } = useLongTermAssets();
  const params = new URLSearchParams(location.search);
  const forcedWindow = params.get("window");
  const currentPhone = profile.phone || "13800138000";
  const hasActiveCompetition = identities.some(identity => identity.identityStatus === "active" || identity.identityStatus === "pending");
  const blockedByCompetition = forcedWindow === "active" ? true : forcedWindow === "outside" ? false : hasActiveCompetition;
  const [stage, setStage] = useState<RebindStage>("eligibility");
  const [oldCode, setOldCode] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newCode, setNewCode] = useState("");
  const [error, setError] = useState("");

  const activeCompetitionCount = useMemo(() => identities.filter(identity => identity.identityStatus === "active" || identity.identityStatus === "pending").length, [identities]);

  const verifyOld = () => {
    if (oldCode !== prototypeCode) {
      setError(`请输入原型验证码 ${prototypeCode}`);
      return;
    }
    setError("");
    setStage("verifyNew");
  };

  const verifyNew = () => {
    if (!phonePattern.test(newPhone)) {
      setError("请输入 11 位新手机号。");
      return;
    }
    if (newPhone === currentPhone) {
      setError("新手机号不能与当前手机号相同。");
      return;
    }
    if (newPhone === conflictPhone) {
      setError("");
      setStage("conflict");
      return;
    }
    if (newCode !== prototypeCode) {
      setError(`请输入新手机号收到的原型验证码 ${prototypeCode}`);
      return;
    }
    updateProfile({ phone: newPhone, phoneVerified: "verified" });
    setError("");
    setStage("completed");
  };

  if (stage === "manual") {
    return <PublicShell showNavigation={false}><PageHeader title="无法使用原手机号" backTo="/me/accounts/phone" /><div className="space-y-5 px-4 py-6"><Card className="border border-warning/30 bg-warning-bg"><StatusTag tone="warning">人工高风险恢复</StatusTag><h1 className="mt-3 text-lg font-semibold text-text-primary">需要先确认账号归属</h1><p className="mt-2 text-sm leading-6 text-text-secondary">原手机号无法收取验证码时，系统不能直接允许换绑。可结合已绑定微信、赛事实名信息、学校 / 学号、已验证邮箱等进行人工核验；最终核验材料仍待业务确认。</p></Card><Link to="/support/chat" className="flex min-h-touch items-center justify-center rounded-control bg-primary px-4 text-sm font-semibold text-on-primary">联系人工客服</Link><SecondaryButton className="w-full" onClick={() => navigate("/me/accounts/phone")}>返回手机号设置</SecondaryButton></div></PublicShell>;
  }

  if (stage === "conflict") {
    return <PublicShell showNavigation={false}><PageHeader title="更换手机号" backTo="/me/accounts/phone?window=outside" /><div className="space-y-5 px-4 py-6"><Card className="border border-danger/30 bg-danger-bg"><StatusTag tone="danger">手机号已被占用</StatusTag><h1 className="mt-3 text-lg font-semibold text-text-primary">不能自动合并两个长期账号</h1><p className="mt-2 text-sm leading-6 text-text-secondary">新手机号 {maskedPhone(newPhone)} 已关联其它 userId。当前账号、赛事身份、证书、课程与简历保持不变，不执行自动资产迁移。</p></Card><Link to="/support/chat" className="flex min-h-touch items-center justify-center rounded-control bg-primary px-4 text-sm font-semibold text-on-primary">申请人工核验</Link><SecondaryButton className="w-full" onClick={() => { setNewPhone(""); setNewCode(""); setError(""); setStage("verifyNew"); }}>换一个手机号</SecondaryButton></div></PublicShell>;
  }

  if (stage === "completed") {
    return <PublicShell showNavigation={false}><PageHeader title="更换手机号" /><div className="space-y-5 px-4 py-8"><Card className="border border-success/30 bg-success-bg text-center"><StatusTag tone="success">换绑完成</StatusTag><h1 className="mt-3 text-lg font-semibold text-success-text">手机号已更新为 {maskedPhone(newPhone)}</h1><p className="mt-2 text-sm leading-6 text-success-text">长期 userId、赛事身份、课程、权益、证书和简历均保持原归属。正式产品应同时通知旧手机号与新手机号，并使其它设备会话失效。</p></Card><Button className="w-full" onClick={() => navigate("/me/accounts", { replace: true })}>返回账号与安全</Button></div></PublicShell>;
  }

  return <PublicShell showNavigation={false}><PageHeader title="更换手机号" backTo="/me/accounts" /><div className="space-y-5 px-4 py-6">
    <Card><p className="text-xs font-medium text-text-tertiary">当前绑定手机号</p><p className="mt-2 text-xl font-semibold tracking-wide text-text-primary">{maskedPhone(currentPhone)}</p><p className="mt-2 text-sm leading-6 text-text-secondary">手机号是可更换的登录凭证，长期账号由稳定 userId 识别。换绑不会创建新账号。</p></Card>

    <div className="flex gap-2 rounded-control border border-dashed border-border p-2 text-xs"><Link className={`flex-1 rounded-control px-3 py-2 text-center font-medium ${blockedByCompetition ? "bg-primary-container text-text-brand" : "bg-surface-subtle text-text-secondary"}`} to="/me/accounts/phone?window=active">赛事进行中</Link><Link className={`flex-1 rounded-control px-3 py-2 text-center font-medium ${!blockedByCompetition ? "bg-primary-container text-text-brand" : "bg-surface-subtle text-text-secondary"}`} to="/me/accounts/phone?window=outside">赛事时间之外</Link></div>

    {stage === "eligibility" && blockedByCompetition && <Card className="border border-warning/30 bg-warning-bg"><StatusTag tone="warning">暂不可自助换绑</StatusTag><h2 className="mt-3 font-semibold text-text-primary">当前存在 {Math.max(1, activeCompetitionCount)} 个活跃赛事身份</h2><p className="mt-2 text-sm leading-6 text-text-secondary">为了避免报名、审核和正赛期间手机号变化造成身份争议，普通自助换绑暂时关闭。App 其它功能仍可正常使用；确有需要可走人工高风险换绑。</p><div className="mt-4 flex flex-col gap-2 sm:flex-row"><SecondaryButton className="flex-1" onClick={() => setStage("manual")}>原手机号不可用 / 紧急换绑</SecondaryButton><Link className="flex min-h-touch flex-1 items-center justify-center rounded-control border border-border bg-surface px-4 text-sm font-medium text-text-primary" to="/me/accounts/phone?window=outside">查看赛外流程</Link></div></Card>}

    {stage === "eligibility" && !blockedByCompetition && <Card className="border border-success/30 bg-success-bg"><StatusTag tone="success">允许自助换绑</StatusTag><h2 className="mt-3 font-semibold text-text-primary">当前没有活跃赛事身份</h2><p className="mt-2 text-sm leading-6 text-text-secondary">先验证当前手机号，再验证新手机号。更换的是登录凭证，不迁移 userId 或长期资产。</p><Button className="mt-4 w-full" onClick={() => setStage("verifyOld")}>开始更换手机号</Button></Card>}

    {stage === "verifyOld" && <Card><StatusTag tone="info">第 1 步 / 2</StatusTag><h2 className="mt-3 font-semibold text-text-primary">验证当前手机号</h2><p className="mt-2 text-sm text-text-secondary">验证码将发送至 {maskedPhone(currentPhone)}。原型统一使用 {prototypeCode}。</p><input aria-label="当前手机号验证码" value={oldCode} onChange={event => { setOldCode(event.target.value.replace(/\D/g, "").slice(0, 6)); setError(""); }} className="mt-4 min-h-touch w-full rounded-control border border-border bg-surface px-3 text-sm outline-none focus:border-primary" placeholder="输入 6 位验证码" />{error && <p className="mt-3 rounded-control bg-danger-bg px-3 py-2 text-sm text-danger-text">{error}</p>}<Button className="mt-4 w-full" onClick={verifyOld}>验证当前手机号</Button><button className="mt-4 w-full text-center text-sm font-medium text-text-brand" onClick={() => setStage("manual")}>无法使用当前手机号</button></Card>}

    {stage === "verifyNew" && <Card><StatusTag tone="info">第 2 步 / 2</StatusTag><h2 className="mt-3 font-semibold text-text-primary">绑定新的手机号</h2><p className="mt-2 text-sm leading-6 text-text-secondary">先检查号码是否已属于其它长期账号，再验证新号码。原型冲突号码：{conflictPhone}。</p><input aria-label="新手机号" value={newPhone} onChange={event => { setNewPhone(event.target.value.replace(/\D/g, "").slice(0, 11)); setNewCode(""); setError(""); }} className="mt-4 min-h-touch w-full rounded-control border border-border bg-surface px-3 text-sm outline-none focus:border-primary" placeholder="输入新的 11 位手机号" /><div className="mt-3 flex gap-2"><button type="button" disabled={!phonePattern.test(newPhone)} className="min-h-touch flex-1 rounded-control border border-border bg-surface px-3 text-sm font-medium text-text-primary disabled:opacity-40">发送验证码</button><div className="flex min-h-touch flex-1 items-center justify-center rounded-control bg-surface-subtle px-3 text-center text-xs text-text-secondary">原型验证码：{prototypeCode}</div></div><input aria-label="新手机号验证码" value={newCode} onChange={event => { setNewCode(event.target.value.replace(/\D/g, "").slice(0, 6)); setError(""); }} className="mt-3 min-h-touch w-full rounded-control border border-border bg-surface px-3 text-sm outline-none focus:border-primary" placeholder="输入新手机号验证码" />{error && <p className="mt-3 rounded-control bg-danger-bg px-3 py-2 text-sm text-danger-text">{error}</p>}<Button className="mt-4 w-full" onClick={verifyNew}>确认更换手机号</Button></Card>}
  </div></PublicShell>;
}

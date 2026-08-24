import { ChevronRight, MessageCircle, ShieldCheck, Smartphone, Store } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, PageHeader, PublicShell, StatusTag } from "../../components/ui";
import { useLongTermAssets } from "../long-term-assets/store";
import { usePublicPlatform } from "../public-platform/PublicPlatform";

function maskedPhone(phone: string) {
  return /^1\d{10}$/.test(phone) ? `${phone.slice(0, 3)} **** ${phone.slice(7)}` : "未绑定";
}

export function AccountSecurityPage() {
  const { profile } = useLongTermAssets();
  const { identities } = usePublicPlatform();
  const activeCompetitionCount = identities.filter(identity => identity.identityStatus === "active" || identity.identityStatus === "pending").length;
  const phone = profile.phone || "13800138000";

  return <PublicShell showNavigation={false}>
    <PageHeader title="账号与安全" backTo="/me" />
    <div className="space-y-5 px-4 py-5">
      <Card className="border border-primary/20 bg-primary-container/40">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-control bg-surface text-text-brand"><ShieldCheck size={20} aria-hidden="true" /></span>
          <div>
            <StatusTag tone="info">长期账号</StatusTag>
            <h1 className="mt-2 font-semibold text-text-primary">登录方式可以变化，账号和资产不会跟着变化</h1>
            <p className="mt-2 text-sm leading-6 text-text-secondary">手机号、微信等都是登录 / 验证凭证；参赛身份、课程、证书、权益与简历继续归属于同一个稳定账号。</p>
          </div>
        </div>
      </Card>

      <section className="overflow-hidden rounded-container border border-border-subtle bg-surface">
        <Link to="/me/accounts/phone" className="flex min-h-[72px] items-center gap-3 border-b border-border-subtle px-4 py-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-control bg-primary-container text-text-brand"><Smartphone size={20} aria-hidden="true" /></span>
          <div className="min-w-0 flex-1"><h2 className="font-semibold text-text-primary">登录手机号</h2><p className="mt-1 text-xs text-text-secondary">{maskedPhone(phone)} · {activeCompetitionCount > 0 ? `当前有 ${activeCompetitionCount} 个活跃赛事身份` : "当前可进入赛外自助换绑流程"}</p></div>
          <ChevronRight size={18} className="text-text-tertiary" aria-hidden="true" />
        </Link>
        <div className="flex min-h-[72px] items-center gap-3 border-b border-border-subtle px-4 py-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-control bg-success-bg text-success-text"><MessageCircle size={20} aria-hidden="true" /></span>
          <div className="min-w-0 flex-1"><div className="flex items-center gap-2"><h2 className="font-semibold text-text-primary">微信</h2><StatusTag tone="success">已授权示例</StatusTag></div><p className="mt-1 text-xs text-text-secondary">作为登录与账号恢复凭证，不建立第二份学生 Profile。</p></div>
        </div>
        <Link to="/me/accounts/platforms" className="flex min-h-[72px] items-center gap-3 px-4 py-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-control bg-surface-subtle text-text-secondary"><Store size={20} aria-hidden="true" /></span>
          <div className="min-w-0 flex-1"><h2 className="font-semibold text-text-primary">业务平台账号</h2><p className="mt-1 text-xs text-text-secondary">抖音、快团团、三创好物等业务账号绑定。</p></div>
          <ChevronRight size={18} className="text-text-tertiary" aria-hidden="true" />
        </Link>
      </section>

      <Card className="border border-border-subtle"><h2 className="font-semibold text-text-primary">赛事身份不会被手机号“带走”</h2><p className="mt-2 text-sm leading-6 text-text-secondary">赛事期减员只改变对应赛事的团队关系与工作区权限；赛外手机号换绑只改变登录凭证。两者都不会注销长期账号或清空其它赛事与长期资产。</p></Card>
    </div>
  </PublicShell>;
}

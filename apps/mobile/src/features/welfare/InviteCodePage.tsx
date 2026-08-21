import { useState } from "react";
import { Gift, QrCode } from "lucide-react";
import { Card, PageHeader, PublicShell, Section } from "../../components/ui";

export function InviteCodePage() {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");

  return (
    <PublicShell showNavigation={true}>
      <PageHeader title="邀请码 / 福利码" subtitle="领取新用户福利与线下活动权益" />
      <div className="space-y-5 px-4 py-5">
        <Section title="填写福利码" subtitle="输入活动获得的邀请码或福利码">
          <Card className="space-y-4 p-5">
            <div className="flex items-center gap-3 rounded-2xl bg-[#fff7df] p-4 text-[#946218]">
              <Gift size={24} />
              <div>
                <div className="font-medium">新用户专属福利</div>
                <div className="text-sm">线下活动、赛事现场可使用扫码或填码领取</div>
              </div>
            </div>
            <input
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="请输入邀请码 / 福利码"
              className="w-full rounded-xl border px-4 py-3"
            />
            <button
              className="rounded-xl bg-[#247456] px-4 py-3 text-white"
              onClick={() => setMessage(code ? "福利码已提交，正在核验" : "请输入福利码")}
            >
              领取权益
            </button>
            {message && <p className="text-sm text-text-secondary">{message}</p>}
          </Card>
        </Section>
        <Section title="线下扫码" subtitle="活动现场扫码进入领取流程">
          <Card className="flex items-center gap-3 p-5">
            <QrCode size={28} />
            <span>支持活动二维码、企业邀请二维码等入口</span>
          </Card>
        </Section>
      </div>
    </PublicShell>
  );
}

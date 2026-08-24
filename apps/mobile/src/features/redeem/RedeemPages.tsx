import { ScanLine } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Card, PageHeader, PublicShell, SecondaryButton, StatusTag } from "../../components/ui";
import { useLongTermAssets } from "../long-term-assets/store";
import { redeemCodeWithBackend, type CodeRedemptionRecord } from "./data";

function formatDate(iso: string) {
  const date = new Date(iso);
  return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
}

export function RedeemCodePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { codeRedemptions, redeemCode, simulateScanRedeem } = useLongTermAssets();
  const initialCode = new URLSearchParams(location.search).get("code") ?? "";
  const [code, setCode] = useState(initialCode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setCode(initialCode);
  }, [initialCode]);

  const recentRecords = useMemo(() => {
    return [...codeRedemptions].sort((a, b) => new Date(b.redeemedAt).getTime() - new Date(a.redeemedAt).getTime()).slice(0, 10);
  }, [codeRedemptions]);

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    const result = await redeemCodeWithBackend(code, { source: "manual" });
    setLoading(false);
    if (result.status === "valid") {
      const ok = redeemCode(code, result, "manual");
      if (ok) {
        navigate(`/redeem/result?code=${encodeURIComponent(code)}`);
      } else {
        setError("你已经兑换过该码");
      }
      return;
    }
    if (result.status === "alreadyRedeemed") {
      setError("你已经兑换过该码");
      return;
    }
    setError(result.reason);
  };

  return (
    <PublicShell showNavigation={false}>
      <PageHeader title="活动邀请码" backTo="/apps" />
      <div className="space-y-6 px-4 py-5">
        <Card>
          <p className="text-sm text-text-secondary">输入运营活动邀请码或线下福利码，领取对应活动权益。</p>
          <input
            value={code}
            onChange={event => setCode(event.target.value)}
            onKeyDown={event => { if (event.key === "Enter") void handleSubmit(); }}
            placeholder="请输入活动邀请码"
            className="mt-4 min-h-touch w-full rounded-control border border-border bg-surface px-3 text-sm uppercase outline-none focus:border-primary"
          />
          {error && <p className="mt-3 text-sm text-text-danger">{error}</p>}
          <Button className="mt-4 w-full" disabled={!code.trim() || loading} onClick={() => void handleSubmit()}>
            {loading ? "校验中…" : "领取活动权益"}
          </Button>
          <SecondaryButton className="mt-3 w-full" onClick={() => {
            const result = simulateScanRedeem();
            if (result) navigate(`/redeem/result?code=${encodeURIComponent(result.code)}`);
          }}>
            <ScanLine size={16} className="mr-1.5" aria-hidden="true" />
            扫一扫
          </SecondaryButton>
        </Card>

        {recentRecords.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-base font-semibold text-text-primary">最近领取</h2>
            {recentRecords.map(record => (
              <RecordRow key={record.id} record={record} />
            ))}
          </div>
        )}
      </div>
    </PublicShell>
  );
}

function RecordRow({ record }: { record: CodeRedemptionRecord }) {
  return (
    <Card className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-text-primary">{record.code}</p>
        <p className="mt-0.5 text-xs text-text-tertiary">{formatDate(record.redeemedAt)} · {record.source === "scan" ? "扫码" : "输入邀请码"}</p>
      </div>
      <span className="text-sm font-semibold text-text-brand">+{record.amount}</span>
    </Card>
  );
}

export function RedeemResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { codeRedemptions, creditBalance } = useLongTermAssets();
  const code = new URLSearchParams(location.search).get("code") ?? "";
  const record = useMemo(() => codeRedemptions.find(item => item.code === code), [codeRedemptions, code]);

  if (!record) {
    return (
      <PublicShell showNavigation={false}>
        <PageHeader title="领取结果" backTo="/redeem" />
        <div className="px-4 py-6">
          <Card className="text-center">
            <p className="text-sm text-text-secondary">未找到领取记录，请重新输入邀请码。</p>
            <Button className="mt-4 w-full" onClick={() => navigate("/redeem")}>重新输入</Button>
          </Card>
        </div>
      </PublicShell>
    );
  }

  return (
    <PublicShell showNavigation={false}>
      <PageHeader title="领取结果" backTo="/redeem" />
      <div className="space-y-6 px-4 py-5">
        <Card className="text-center">
          <div className="mx-auto flex size-16 align-items-center justify-center rounded-full bg-success-bg text-success-text">
            <span className="text-2xl font-bold">+{record.amount}</span>
          </div>
          <h2 className="mt-4 text-lg font-semibold text-text-primary">恭喜获得 {record.amount} 学力值</h2>
          <p className="mt-1 text-sm text-text-secondary">邀请码：{record.code}</p>
          <p className="mt-1 text-xs text-text-tertiary">当前学力值余额：{creditBalance}</p>
        </Card>
      </div>
    </PublicShell>
  );
}

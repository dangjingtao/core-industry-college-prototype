import { ScanLine } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Card, PageHeader, PublicShell, SecondaryButton } from "../../components/ui";
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
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => setCode(initialCode), [initialCode]);
  const records = useMemo(() => [...codeRedemptions].slice(0, 10), [codeRedemptions]);

  async function submit() {
    setLoading(true);
    setError(null);
    const result = await redeemCodeWithBackend(code, { source: "manual" });
    setLoading(false);
    if (result.status === "valid") {
      const ok = redeemCode(code, result, "manual");
      if (ok) {
        navigate(`/redeem/result?code=${encodeURIComponent(code)}`);
        return;
      }
      setError("你已经领取过该活动权益");
      return;
    }
    if (result.status === "alreadyRedeemed") {
      setError("该邀请码已经领取过");
      return;
    }
    setError("reason" in result ? result.reason : "邀请码无效");
  }

  return <PublicShell showNavigation={false}><PageHeader title="活动邀请码" backTo="/apps" /><div className="space-y-6 px-4 py-5"><Card><p className="text-sm text-text-secondary">输入运营活动邀请码或线下福利码，领取对应活动权益。</p><input value={code} onChange={e => setCode(e.target.value)} placeholder="请输入活动邀请码" className="mt-4 min-h-touch w-full rounded-control border border-border bg-surface px-3 text-sm uppercase outline-none" />{error && <p className="mt-3 text-sm text-text-danger">{error}</p>}<Button className="mt-4 w-full" disabled={!code.trim() || loading} onClick={() => void submit()}>{loading ? "校验中…" : "领取活动权益"}</Button><SecondaryButton className="mt-3 w-full" onClick={() => { const result = simulateScanRedeem(); if (result) navigate(`/redeem/result?code=${encodeURIComponent(result.code)}`); }}><ScanLine size={16} className="mr-1.5" />扫一扫</SecondaryButton></Card>{records.length > 0 && <div className="space-y-3"><h2 className="text-base font-semibold">最近领取</h2>{records.map(record => <RecordRow key={record.id} record={record} />)}</div>}</div></PublicShell>;
}

function RecordRow({ record }: { record: CodeRedemptionRecord }) {
  return <Card className="flex items-center justify-between"><div><p className="text-sm font-medium">{record.code}</p><p className="text-xs text-text-tertiary">{formatDate(record.redeemedAt)}</p></div><span className="text-sm font-semibold text-text-brand">+{record.amount}</span></Card>;
}

export function RedeemResultPage() {
  const navigate = useNavigate();
  const code = new URLSearchParams(useLocation().search).get("code") ?? "";
  const { codeRedemptions, creditBalance } = useLongTermAssets();
  const record = codeRedemptions.find(item => item.code === code);
  return <PublicShell showNavigation={false}><PageHeader title="领取结果" backTo="/redeem" /><div className="px-4 py-5"><Card className="text-center">{record ? <><h2 className="text-lg font-semibold">恭喜获得 {record.amount} 学力值</h2><p className="mt-2 text-sm text-text-secondary">邀请码：{record.code}</p><p className="mt-2 text-xs text-text-tertiary">当前学力值：{creditBalance}</p></> : <p>未找到领取记录。</p>}<Button className="mt-5 w-full" onClick={() => navigate("/redeem")}>继续</Button></Card></div></PublicShell>;
}

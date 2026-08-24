import { QrCode, ScanLine } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button, Card, PageHeader, PublicShell, SecondaryButton, StatusTag } from "../../components/ui";
import { useLongTermAssets } from "../long-term-assets/store";
import { redeemCodeWithBackend, type CodeRedemptionRecord } from "./data";

function formatDate(iso: string) {
  const date = new Date(iso);
  return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
}

function ScanButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label="扫一扫"
      onClick={onClick}
      className="flex min-h-touch min-w-11 items-center justify-center rounded-control text-text-primary transition active:bg-surface-pressed"
    >
      <ScanLine size={22} aria-hidden="true" />
    </button>
  );
}

export function RedeemCodePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { codeRedemptions, redeemCode } = useLongTermAssets();
  const initialCode = new URLSearchParams(location.search).get("code") ?? "";
  const [code, setCode] = useState(initialCode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanOpen, setScanOpen] = useState(false);

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
      <PageHeader title="兑换码" backTo="/apps" right={<ScanButton onClick={() => setScanOpen(true)} />} />
      <div className="space-y-6 px-4 py-5">
        <Card>
          <p className="text-sm text-text-secondary">输入邀请码或线下活动福利码，领取学力值奖励。</p>
          <input
            value={code}
            onChange={event => setCode(event.target.value)}
            onKeyDown={event => { if (event.key === "Enter") void handleSubmit(); }}
            placeholder="请输入兑换码"
            className="mt-4 min-h-touch w-full rounded-control border border-border bg-surface px-3 text-sm uppercase outline-none focus:border-primary"
          />
          {error && <p className="mt-3 text-sm text-text-danger">{error}</p>}
          <Button className="mt-4 w-full" disabled={!code.trim() || loading} onClick={() => void handleSubmit()}>
            {loading ? "校验中…" : "确认兑换"}
          </Button>
          <SecondaryButton className="mt-3 w-full" onClick={() => setScanOpen(true)}>
            <ScanLine size={16} className="mr-1.5" aria-hidden="true" />
            扫一扫
          </SecondaryButton>
        </Card>

        {recentRecords.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-base font-semibold text-text-primary">最近兑换</h2>
            {recentRecords.map(record => (
              <RecordRow key={record.id} record={record} />
            ))}
          </div>
        )}
      </div>

      {scanOpen && (
        <ScanPlaceholderDialog onClose={() => setScanOpen(false)} onCode={scanned => {
          setCode(scanned);
          setScanOpen(false);
        }} />
      )}
    </PublicShell>
  );
}

function RecordRow({ record }: { record: CodeRedemptionRecord }) {
  return (
    <Card className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-text-primary">{record.code}</p>
        <p className="mt-0.5 text-xs text-text-tertiary">{formatDate(record.redeemedAt)} · {record.source === "scan" ? "扫码" : "手动输入"}</p>
      </div>
      <span className="text-sm font-semibold text-text-brand">+{record.amount}</span>
    </Card>
  );
}

function ScanPlaceholderDialog({ onClose, onCode }: { onClose: () => void; onCode: (code: string) => void }) {
  const [value, setValue] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6" onClick={onClose}>
      <div className="w-full max-w-sm rounded-container bg-surface p-5" onClick={event => event.stopPropagation()}>
        <div className="flex flex-col items-center">
          <div className="flex size-32 items-center justify-center rounded-[20px] border-2 border-dashed border-border bg-surface-subtle">
            <QrCode size={48} className="text-text-tertiary" aria-hidden="true" />
          </div>
          <p className="mt-4 text-sm text-text-secondary text-center">扫一扫功能需接入设备摄像头 SDK。<br />原型中可先模拟输入测试码。</p>
        </div>
        <input
          value={value}
          onChange={event => setValue(event.target.value)}
          placeholder="粘贴模拟扫码结果"
          className="mt-4 min-h-touch w-full rounded-control border border-border bg-surface px-3 text-sm outline-none focus:border-primary"
        />
        <div className="mt-4 grid grid-cols-2 gap-3">
          <SecondaryButton onClick={onClose}>取消</SecondaryButton>
          <Button onClick={() => { onCode(value); }} disabled={!value.trim()}>确认</Button>
        </div>
      </div>
    </div>
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
        <PageHeader title="兑换结果" backTo="/redeem" />
        <div className="px-4 py-6">
          <Card className="text-center">
            <p className="text-sm text-text-secondary">未找到兑换记录，请重新输入兑换码。</p>
            <Button className="mt-4 w-full" onClick={() => navigate("/redeem")}>去兑换</Button>
          </Card>
        </div>
      </PublicShell>
    );
  }

  return (
    <PublicShell showNavigation={false}>
      <PageHeader title="兑换结果" backTo="/redeem" />
      <div className="space-y-6 px-4 py-5">
        <Card className="text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-success-bg text-success-text">
            <span className="text-2xl font-bold">+{record.amount}</span>
          </div>
          <h2 className="mt-4 text-lg font-semibold text-text-primary">恭喜获得 {record.amount} 学力值</h2>
          <p className="mt-1 text-sm text-text-secondary">兑换码：{record.code}</p>
          <p className="mt-1 text-xs text-text-tertiary">当前学力值余额：{creditBalance}</p>
          <div className="mt-5 space-y-3">
            <Button className="w-full" onClick={() => navigate("/growth/score")}>查看学力值</Button>
            <SecondaryButton className="w-full" onClick={() => navigate("/redeem")}>再兑换一个</SecondaryButton>
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-medium text-text-primary">说明</h3>
          <p className="mt-2 text-xs leading-5 text-text-secondary">
            当前奖励为原型示意，真实奖励数值需等 F04 Decision A 明确学力值经济模型后，由后端接口下发。
          </p>
        </Card>
      </div>
    </PublicShell>
  );
}

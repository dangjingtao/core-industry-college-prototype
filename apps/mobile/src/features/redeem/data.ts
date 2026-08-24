export type CodeType = "invite" | "welfare" | "unknown";

export type RedemptionOutcome =
  | { status: "valid"; code: string; type: CodeType; amount: number; message: string }
  | { status: "alreadyRedeemed"; code: string }
  | { status: "invalid" | "expired" | "exhausted"; code: string; reason: string };

export type CodeRedemptionRecord = {
  id: string;
  code: string;
  type: CodeType;
  amount: number;
  redeemedAt: string;
  source: "manual" | "scan";
};

/**
 * 模拟后端核销接口。
 * 真实实现中应替换为服务端请求：由后端判断码的有效性、类型、奖励与使用次数。
 */
export async function redeemCodeWithBackend(
  code: string,
  _context: { source: "manual" | "scan" },
): Promise<RedemptionOutcome> {
  await new Promise(resolve => setTimeout(resolve, 600));
  const normalized = code.trim().toUpperCase();
  if (!normalized) {
    return { status: "invalid", code, reason: "兑换码不能为空" };
  }
  if (normalized.length < 4) {
    return { status: "invalid", code, reason: "兑换码格式不正确" };
  }
  if (normalized.startsWith("BAD-")) {
    return { status: "invalid", code, reason: "无效的兑换码" };
  }
  if (normalized.startsWith("EXP-")) {
    return { status: "expired", code, reason: "该兑换码已过期" };
  }
  if (normalized.startsWith("OUT-")) {
    return { status: "exhausted", code, reason: "该批次兑换码已领完" };
  }
  if (normalized.startsWith("INV-")) {
    return { status: "valid", code, type: "invite", amount: 20, message: "恭喜获得 20 学力值" };
  }
  if (normalized.startsWith("EVT-")) {
    return { status: "valid", code, type: "welfare", amount: 50, message: "恭喜获得 50 学力值" };
  }
  // 默认视为通用邀请/福利码，金额 10 学力值，仅用于原型演示
  return { status: "valid", code, type: "unknown", amount: 10, message: "恭喜获得 10 学力值" };
}

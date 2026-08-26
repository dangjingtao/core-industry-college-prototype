// 徽章获得记录：单向持久层（只增不减）。
// 设计决策（T042 9.7）：徽章一旦获得就是长期资产，永不因事实回退而消失。
// 典型场景：连续打卡 30 天徽章到手后断签，徽章保留；更高天数的徽章需要一条新的完整连续记录。
// 同理：赛事身份被撤销时，靠身份推导获得的徽章也保留为历史事实。
//
// 存储形状：{ [badgeId]: 获得时间 ISO 字符串 }
// 说明：本模块只保存「获得时间」，不复制徽章对象本身，徽章定义仍以 catalog 为唯一真相源。

const STORAGE_KEY = "badge-earn-records";

export type BadgeEarnRecords = Record<string, string>;

function safeParse(raw: string | null): BadgeEarnRecords {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed as BadgeEarnRecords;
    return {};
  } catch {
    return {};
  }
}

export function readEarnRecords(): BadgeEarnRecords {
  if (typeof localStorage === "undefined") return {};
  return safeParse(localStorage.getItem(STORAGE_KEY));
}

function writeEarnRecords(records: BadgeEarnRecords): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    // 存储失败时静默：徽章推导仍可兜底，不阻塞主流程
  }
}

/**
 * 把新获得的徽章写入记录。已存在的徽章保留最早获得时间（幂等）。
 * 返回写入后的完整记录。
 */
export function recordEarnedBadges(badgeIds: Iterable<string>): BadgeEarnRecords {
  const records = readEarnRecords();
  const now = new Date().toISOString();
  let changed = false;
  for (const id of badgeIds) {
    if (!records[id]) {
      records[id] = now;
      changed = true;
    }
  }
  if (changed) writeEarnRecords(records);
  return records;
}

/** 单条读取：该徽章的获得时间（未记录返回 undefined） */
export function earnRecordFor(badgeId: string): string | undefined {
  return readEarnRecords()[badgeId];
}

/** 展示用：把 ISO 时间转成简短中文日期 */
export function formatEarnedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" });
}

/** 原型演示工具：清空获得记录（仅用于演示重置，产品不暴露） */
export function clearEarnRecords(): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

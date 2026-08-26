// 模拟经营（应用中心「我的创业小店」）状态存储
// 不持有第二份 session / identities / 学力值真相源，
// 只记录用户在「我的创业小店」页的当日完成动作。

const STORAGE_KEY = "startup-shop-state-v1";

export type SimulationActionId = "checkin" | "quiz" | "course" | "invite";

export type SimulationState = {
  date: string;
  done: SimulationActionId[];
};

const today = () => new Date().toLocaleDateString("zh-CN");

function loadState(): SimulationState {
  try {
    const raw = typeof localStorage !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (raw) {
      const parsed = JSON.parse(raw) as SimulationState;
      if (parsed && typeof parsed.date === "string") {
        return parsed.date === today() ? parsed : { date: today(), done: [] };
      }
    }
  } catch {
    // ignore
  }
  return { date: today(), done: [] };
}

function persist(state: SimulationState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function getSimulationSnapshot(): SimulationState {
  return loadState();
}

export function recordSimulationAction(action: SimulationActionId): SimulationState {
  const current = loadState();
  if (current.done.includes(action)) return current;
  const next: SimulationState = { date: current.date, done: [...current.done, action] };
  persist(next);
  return next;
}

export function resetSimulation(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

// 由 done 计算 stock / traffic / level（与 StartupShopPage 展示一致）
export function deriveSimulationMetrics(done: SimulationActionId[]) {
  const stock = (done.includes("checkin") ? 1 : 0) + (done.includes("quiz") ? 1 : 0) + (done.includes("course") ? 2 : 0);
  const traffic = done.includes("invite") ? 3 : 0;
  const growth = stock * 16 + traffic * 9;
  const level = growth >= 70 ? 3 : growth >= 35 ? 2 : 1;
  return { stock, traffic, growth, level };
}

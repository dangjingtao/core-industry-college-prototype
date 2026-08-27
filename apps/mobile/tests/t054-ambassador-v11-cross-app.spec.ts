import { expect, test } from "@playwright/test";

const storageKey = "core.ambassador.demo-state.v2";
const campaignId = "campus-ambassador-demo-active";
const teamId = "amb-demo-team";
const BUSINESS_OFFSET_MS = 8 * 60 * 60 * 1000;

function shanghaiMondayStart(reference = new Date()) {
  const shifted = new Date(reference.getTime() + BUSINESS_OFFSET_MS);
  const dayFromMonday = (shifted.getUTCDay() + 6) % 7;
  const localMondayUtc = Date.UTC(
    shifted.getUTCFullYear(),
    shifted.getUTCMonth(),
    shifted.getUTCDate() - dayFromMonday,
  );
  return localMondayUtc - BUSINESS_OFFSET_MS;
}

test("T054 PC and Mobile share the same UTC+8 week while partner results stay private", async ({ browser }) => {
  const context = await browser.newContext({ timezoneId: "UTC", viewport: { width: 1280, height: 900 } });
  const pc = await context.newPage();
  const weekStartMs = shanghaiMondayStart();

  await pc.goto(`http://127.0.0.1:5174/admin/ambassadors/${campaignId}`);
  await expect.poll(async () => pc.evaluate(key => Boolean(window.localStorage.getItem(key)), storageKey)).toBe(true);
  await pc.evaluate(({ key, targetTeamId, startMs }) => {
    const raw = window.localStorage.getItem(key);
    if (!raw) throw new Error("ambassador demo state missing");
    const state = JSON.parse(raw);
    state.validAcquisitions = state.validAcquisitions.filter((item: { teamId: string }) => item.teamId !== targetTeamId);
    state.validAcquisitions.push(
      {
        id: "t054-handoff-boundary",
        campaignId: "campus-ambassador-demo-active",
        teamId: targetTeamId,
        promotionCodeId: "amb-demo-promo-1",
        promoterAccountId: "account-demo-ambassador",
        newAccountId: "t054-handoff-new-boundary",
        registeredAt: new Date(startMs + 30 * 60 * 1000).toISOString(),
      },
      {
        id: "t054-handoff-normal",
        campaignId: "campus-ambassador-demo-active",
        teamId: targetTeamId,
        promotionCodeId: "amb-demo-promo-2",
        promoterAccountId: "account-demo-partner-1",
        newAccountId: "t054-handoff-new-normal",
        registeredAt: new Date(startMs + 12 * 60 * 60 * 1000).toISOString(),
      },
    );
    window.localStorage.setItem(key, JSON.stringify(state));
  }, { key: storageKey, targetTeamId: teamId, startMs: weekStartMs });
  await pc.reload();

  const teamRow = pc.getByRole("row").filter({ hasText: "华南商贸 · 校园大使 01" });
  await expect(teamRow).toBeVisible();
  await expect(teamRow.locator("td").nth(5)).toHaveText("2");

  const popupPromise = pc.waitForEvent("popup");
  await pc.getByTestId("ambassador-demo-bridge-launcher").click();
  const mobile = await popupPromise;
  await mobile.waitForLoadState("domcontentloaded");
  await expect(pc.getByTestId("ambassador-demo-bridge-launcher")).toContainText("PC ↔ Mobile 已连接");

  await mobile.goto(`http://127.0.0.1:5173/ambassadors/team/${teamId}?accountId=account-demo-ambassador&ambassadorBridge=1`);
  const operations = mobile.getByTestId("ambassador-operations-overview");
  await expect(operations).toBeVisible();
  await expect(mobile.getByTestId("t053-weekly-count")).toHaveText("2");
  await expect(mobile.getByTestId("t053-total-count")).toHaveText("2");
  await expect(operations).toContainText("本周经营概览");

  // The same team viewed as a recommendation partner must never expose any
  // weekly, cumulative, member-contribution or recent-acquisition numbers.
  await mobile.goto(`http://127.0.0.1:5173/ambassadors/team/${teamId}?accountId=account-demo-partner-1&ambassadorBridge=1`);
  await expect(mobile.getByTestId("ambassador-operations-overview")).toHaveCount(0);
  await expect(mobile.getByTestId("t053-weekly-count")).toHaveCount(0);
  await expect(mobile.getByText("成员本周贡献", { exact: true })).toHaveCount(0);
  await expect(mobile.getByText("最近拉新", { exact: true })).toHaveCount(0);
  await expect(mobile.getByTestId("personal-promotion-code")).toBeVisible();

  await context.close();
});

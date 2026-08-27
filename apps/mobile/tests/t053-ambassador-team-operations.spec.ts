import { expect, test, type Page } from "@playwright/test";

const storageKey = "core.ambassador.demo-state.v2";
const campaignId = "campus-ambassador-demo-active";
const teamId = "amb-demo-team";

async function writeActiveWeekFixtures(page: Page) {
  await page.evaluate(({ key, targetTeamId, targetCampaignId }) => {
    const raw = window.localStorage.getItem(key);
    if (!raw) throw new Error("ambassador demo state missing");
    const state = JSON.parse(raw);
    const now = new Date();
    const offsetMs = 8 * 60 * 60 * 1000;
    const shifted = new Date(now.getTime() + offsetMs);
    const dayFromMonday = (shifted.getUTCDay() + 6) % 7;
    const currentWeekStart = Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate() - dayFromMonday) - offsetMs;
    const dayMs = 24 * 60 * 60 * 1000;
    const at = (weekOffset: number, dayOffset: number, hour: number) => new Date(currentWeekStart + weekOffset * 7 * dayMs + dayOffset * dayMs + hour * 60 * 60 * 1000).toISOString();
    const base = { campaignId: targetCampaignId, teamId: targetTeamId };
    state.validAcquisitions = [
      { id: "t053-current-1", ...base, promotionCodeId: "amb-demo-promo-1", promoterAccountId: "account-demo-ambassador", newAccountId: "t053-user-1", registeredAt: at(0, 0, 10) },
      { id: "t053-current-2", ...base, promotionCodeId: "amb-demo-promo-1", promoterAccountId: "account-demo-ambassador", newAccountId: "t053-user-2", registeredAt: at(0, 1, 11) },
      { id: "t053-current-3", ...base, promotionCodeId: "amb-demo-promo-2", promoterAccountId: "account-demo-partner-1", newAccountId: "t053-user-3", registeredAt: at(0, 2, 13) },
      { id: "t053-previous-1", ...base, promotionCodeId: "amb-demo-promo-3", promoterAccountId: "account-demo-partner-2", newAccountId: "t053-user-4", registeredAt: at(-1, 1, 9) },
      { id: "t053-previous-2", ...base, promotionCodeId: "amb-demo-promo-3", promoterAccountId: "account-demo-partner-2", newAccountId: "t053-user-5", registeredAt: at(-1, 3, 16) },
      { id: "t053-older-1", ...base, promotionCodeId: "amb-demo-promo-4", promoterAccountId: "account-demo-partner-3", newAccountId: "t053-user-6", registeredAt: at(-2, 2, 15) },
    ];
    window.localStorage.setItem(key, JSON.stringify(state));
  }, { key: storageKey, targetTeamId: teamId, targetCampaignId: campaignId });
}

test("T053 ambassador sees weekly operations directly on My Team", async ({ page }) => {
  await page.goto(`/ambassadors/team/${teamId}?accountId=account-demo-ambassador`);
  await writeActiveWeekFixtures(page);
  await page.reload();

  await expect(page.getByTestId("ambassador-operations-overview")).toBeVisible();
  await expect(page.getByText("本周经营概览", { exact: true })).toBeVisible();
  await expect(page.getByTestId("t053-weekly-count")).toHaveText("3");
  await expect(page.getByTestId("t053-total-count")).toHaveText("6");
  await expect(page.getByTestId("t053-previous-count")).toHaveText("2");
  await expect(page.getByTestId("t053-member-count")).toHaveText("4");
  await expect(page.getByText("较上周 +1", { exact: true })).toBeVisible();

  const contributions = page.getByTestId("t053-member-contribution");
  await expect(contributions).toHaveCount(4);
  await expect(contributions.filter({ hasText: "林大使" })).toContainText("2 个");
  await expect(contributions.filter({ hasText: "校园推荐官 1" })).toContainText("1 个");
  await expect(contributions.filter({ hasText: "校园推荐官 2" })).toContainText("0 个");

  await expect(page.getByTestId("ambassador-recent-acquisitions")).toBeVisible();
  await expect(page.getByTestId("t053-recent-acquisition")).toHaveCount(5);
  await expect(page.getByTestId("t053-recent-acquisition").first()).toContainText("+1 有效新增");
  await expect(page.getByTestId("team-recruitment-code")).toBeVisible();
  await expect(page.getByTestId("personal-promotion-code")).toBeVisible();
  await expect(page.getByRole("button", { name: "查看团队推广成果" })).toBeVisible();
  await expect(page.getByText("华南商贸 · 校园大使 01", { exact: true })).toHaveCount(0);
});

test("T053 partner cannot see any operations results", async ({ page }) => {
  await page.goto(`/ambassadors/team/${teamId}?accountId=account-demo-partner-1`);

  await expect(page.getByTestId("personal-promotion-code")).toBeVisible();
  await expect(page.getByTestId("team-recruitment-code")).toHaveCount(0);
  await expect(page.getByTestId("ambassador-operations-overview")).toHaveCount(0);
  await expect(page.getByTestId("ambassador-member-contributions")).toHaveCount(0);
  await expect(page.getByTestId("ambassador-recent-acquisitions")).toHaveCount(0);
  await expect(page.getByText("本周有效新增", { exact: true })).toHaveCount(0);
  await expect(page.getByText("累计有效新增", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "查看团队推广成果" })).toHaveCount(0);
  await expect(page.getByText("华南商贸 · 校园大使 01", { exact: true })).toHaveCount(0);
});

test("T053 forming team stays focused on recruitment without fake operations data", async ({ page }) => {
  await page.goto(`/ambassadors/team/${teamId}?accountId=account-demo-ambassador`);
  await page.evaluate(({ key, targetTeamId }) => {
    const raw = window.localStorage.getItem(key);
    if (!raw) throw new Error("ambassador demo state missing");
    const state = JSON.parse(raw);
    const team = state.teams.find((item: { id: string }) => item.id === targetTeamId);
    team.members = team.members.filter((member: { role: string }) => member.role === "ambassador");
    team.status = "forming";
    window.localStorage.setItem(key, JSON.stringify(state));
  }, { key: storageKey, targetTeamId: teamId });
  await page.reload();

  await expect(page.getByText("待点亮", { exact: true })).toBeVisible();
  await expect(page.getByText("还需 3 位校园推荐官", { exact: true })).toBeVisible();
  await expect(page.getByTestId("team-recruitment-code")).toBeVisible();
  await expect(page.getByText("团队点亮后开放专属推广码", { exact: true })).toBeVisible();
  await expect(page.getByTestId("ambassador-operations-overview")).toHaveCount(0);
  await expect(page.getByTestId("ambassador-member-contributions")).toHaveCount(0);
  await expect(page.getByTestId("ambassador-recent-acquisitions")).toHaveCount(0);
  await expect(page.getByTestId("personal-promotion-code")).toHaveCount(0);
});

test("T053 ended campaign keeps historical operations and disables new business", async ({ page }) => {
  await page.goto(`/ambassadors/team/${teamId}?accountId=account-demo-ambassador`);
  await page.evaluate(({ key, targetCampaignId }) => {
    const raw = window.localStorage.getItem(key);
    if (!raw) throw new Error("ambassador demo state missing");
    const state = JSON.parse(raw);
    const campaign = state.campaigns.find((item: { id: string }) => item.id === targetCampaignId);
    campaign.endsAt = "2026-08-12T23:59:59+08:00";
    window.localStorage.setItem(key, JSON.stringify(state));
  }, { key: storageKey, targetCampaignId: campaignId });
  await page.reload();

  await expect(page.getByTestId("ambassador-history-state")).toBeVisible();
  await expect(page.getByText("往期经营概览", { exact: true })).toBeVisible();
  await expect(page.getByTestId("t053-weekly-count")).toHaveText("2");
  await expect(page.getByTestId("t053-total-count")).toHaveText("2");
  await expect(page.getByTestId("team-recruitment-code")).toHaveCount(0);
  await expect(page.getByTestId("personal-promotion-code")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "查看团队推广成果" })).toBeVisible();
});

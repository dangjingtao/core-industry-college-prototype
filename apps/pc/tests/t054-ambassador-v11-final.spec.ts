import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";

const storageKey = "core.ambassador.demo-state.v2";
const campaignId = "campus-ambassador-demo-active";
const teamId = "amb-demo-team";
const originalTeamName = "华南商贸 · 校园大使 01";
const renamedTeam = "T054 周界团队";
const BUSINESS_OFFSET_MS = 8 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

function shanghaiWeek(reference = new Date()) {
  const shifted = new Date(reference.getTime() + BUSINESS_OFFSET_MS);
  const dayFromMonday = (shifted.getUTCDay() + 6) % 7;
  const localMondayUtc = Date.UTC(
    shifted.getUTCFullYear(),
    shifted.getUTCMonth(),
    shifted.getUTCDate() - dayFromMonday,
  );
  const startMs = localMondayUtc - BUSINESS_OFFSET_MS;
  const labelDate = (timestampMs: number) => {
    const d = new Date(timestampMs + BUSINESS_OFFSET_MS);
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
  };
  return {
    startMs,
    previousStartMs: startMs - 7 * DAY_MS,
    label: `${labelDate(startMs)} ~ ${labelDate(startMs + 6 * DAY_MS)}`,
  };
}

async function downloadText(page: import("@playwright/test").Page, buttonName: string) {
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: buttonName }).click(),
  ]);
  const path = await download.path();
  if (!path) throw new Error(`download ${buttonName} has no local path`);
  return readFile(path, "utf8");
}

test("T054 PC uses UTC+8 natural week and keeps V1.1 questionnaire, team name and exports consistent", async ({ browser }) => {
  // Force a non-China browser timezone. The product result must still use the
  // UTC+8 business week shared with Mobile.
  const context = await browser.newContext({ timezoneId: "UTC", viewport: { width: 1280, height: 900 }, acceptDownloads: true });
  const page = await context.newPage();
  const week = shanghaiWeek();

  await page.goto(`http://127.0.0.1:4174/admin/ambassadors/${campaignId}`);
  await expect.poll(async () => page.evaluate(key => Boolean(window.localStorage.getItem(key)), storageKey)).toBe(true);

  await page.evaluate(({ key, targetTeamId, startMs, previousStartMs }) => {
    const raw = window.localStorage.getItem(key);
    if (!raw) throw new Error("ambassador demo state missing");
    const state = JSON.parse(raw);
    state.validAcquisitions = state.validAcquisitions.filter((item: { teamId: string }) => item.teamId !== targetTeamId);
    state.validAcquisitions.push(
      {
        id: "t054-current-boundary",
        campaignId: "campus-ambassador-demo-active",
        teamId: targetTeamId,
        promotionCodeId: "amb-demo-promo-1",
        promoterAccountId: "account-demo-ambassador",
        newAccountId: "t054-new-boundary",
        // Monday 00:30 in Shanghai is still Sunday 16:30 UTC. This is the
        // boundary that the old PC browser-local implementation misclassified.
        registeredAt: new Date(startMs + 30 * 60 * 1000).toISOString(),
      },
      {
        id: "t054-current-normal",
        campaignId: "campus-ambassador-demo-active",
        teamId: targetTeamId,
        promotionCodeId: "amb-demo-promo-2",
        promoterAccountId: "account-demo-partner-1",
        newAccountId: "t054-new-normal",
        registeredAt: new Date(startMs + 12 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "t054-previous",
        campaignId: "campus-ambassador-demo-active",
        teamId: targetTeamId,
        promotionCodeId: "amb-demo-promo-3",
        promoterAccountId: "account-demo-partner-2",
        newAccountId: "t054-new-previous",
        registeredAt: new Date(previousStartMs + 12 * 60 * 60 * 1000).toISOString(),
      },
    );
    window.localStorage.setItem(key, JSON.stringify(state));
  }, { key: storageKey, targetTeamId: teamId, startMs: week.startMs, previousStartMs: week.previousStartMs });

  await page.reload();
  await expect(page.getByText(week.label, { exact: true })).toBeVisible();

  const teamRow = page.getByRole("row").filter({ hasText: originalTeamName });
  await expect(teamRow).toBeVisible();
  const cells = teamRow.locator("td");
  await expect(cells.nth(5)).toHaveText("2");
  await expect(cells.nth(7)).toHaveText("3");

  await teamRow.getByRole("link", { name: originalTeamName }).click();
  await expect(page.getByTestId("ambassador-questionnaire-answers")).toBeVisible();
  await expect(page.getByTestId("ambassador-questionnaire-answers").getByText("提交时版本", { exact: true })).toBeVisible();
  await expect(page.getByTestId("ambassador-questionnaire-answers").getByText("校园大使计划活动条款 · v1.0", { exact: true })).toBeVisible();
  await expect(page.getByText(/核心大使计划/)).toHaveCount(0);

  const weekSection = page.getByText("周度运营", { exact: true }).locator("xpath=ancestor::section[1]");
  await expect(weekSection.getByText(week.label, { exact: true })).toBeVisible();
  await expect(weekSection.getByText("本周有效新增", { exact: true })).toBeVisible();
  await expect(weekSection).toContainText("2");
  await expect(weekSection).toContainText("校园大使");
  await expect(weekSection).toContainText("校园推荐官");

  await page.getByLabel("后台团队名").fill(renamedTeam);
  await page.getByRole("button", { name: "保存团队名" }).click();
  await expect(page.getByRole("heading", { name: renamedTeam })).toBeVisible();

  const teamCsv = await downloadText(page, "导出本团队");
  expect(teamCsv).toContain(renamedTeam);
  expect(teamCsv).toContain(week.label);
  expect(teamCsv).toContain("校园大使");
  expect(teamCsv).toContain("校园推荐官");
  expect(teamCsv).toContain("t054-new-boundary");
  expect(teamCsv).not.toContain("promotionCodeId");
  expect(teamCsv).not.toContain("applicationFormSnapshot");

  await page.getByRole("link", { name: "返回活动详情" }).click();
  const renamedRow = page.getByRole("row").filter({ hasText: renamedTeam });
  await expect(renamedRow).toBeVisible();
  await expect(renamedRow.locator("td").nth(5)).toHaveText("2");

  const allCsv = await downloadText(page, "导出全部团队");
  expect(allCsv).toContain(renamedTeam);
  expect(allCsv).toContain(week.label);
  expect(allCsv).toContain("t054-new-boundary");
  expect(allCsv).not.toContain("promotionCodeId");

  await context.close();
});

import { expect, test } from "@playwright/test";
import { defaultPerformancePeriodIdFor, performancePeriodsForCompetition, sanChuangProfileByCompetitionId } from "../src/admin/pc09-data";

test.use({ viewport: { width: 1440, height: 1000 } });

test("PC09 exposes an independent Sanchuang operations entry and explicit edition context", async ({ page }) => {
  await page.goto("/admin/sanchuang");

  await expect(page).toHaveURL(/\/admin\/sanchuang\/sanchuang-16$/);
  await expect(page.getByTestId("pc09-primary-nav").first()).toBeVisible();
  await expect(page.getByTestId("pc09-hero")).toBeVisible();
  await expect(page.getByTestId("pc09-edition-select")).toHaveValue("sanchuang-16");
  await expect(page.getByTestId("pc09-hero").getByRole("heading", { name: "第十六届三创赛" })).toBeVisible();
  await expect(page.getByTestId("pc09-overview")).toContainText("山城新零售队");
  await expect(page.getByTestId("pc09-overview")).toContainText("未接评分规则");
});

test("PC09 performance workspace consumes its edition profile default period and scoped periods", async ({ page }) => {
  const competitionId = "sanchuang-16";
  const profile = sanChuangProfileByCompetitionId(competitionId);
  expect(profile).toBeDefined();
  expect(defaultPerformancePeriodIdFor(competitionId)).toBe(profile?.defaultPerformancePeriodId);

  await page.goto(`/admin/sanchuang/${competitionId}/performance`);

  const workspace = page.getByTestId("pc09-performance");
  await expect(workspace).toHaveAttribute("data-competition-id", competitionId);
  await expect(workspace).toHaveAttribute("data-default-period-id", profile?.defaultPerformancePeriodId ?? "");
  await expect(page.getByTestId("pc09-period-filter")).toHaveValue(defaultPerformancePeriodIdFor(competitionId));
  const periodValues = await page.getByTestId("pc09-period-filter").locator("option").evaluateAll(options => options.map(option => (option as HTMLOptionElement).value));
  expect(periodValues).toEqual(performancePeriodsForCompetition(competitionId).map(period => period.id));
});

test("PC09 aggregates order, live and video performance from Douyin and Sanchuang Goods on one page", async ({ page }) => {
  await page.goto("/admin/sanchuang/sanchuang-16/performance");

  await expect(page.getByTestId("pc09-performance")).toBeVisible();
  await expect(page.getByTestId("pc09-source-douyin")).toContainText("抖音");
  await expect(page.getByTestId("pc09-source-sanchuangGoods")).toContainText("三创好物");
  await expect(page.getByTestId("pc09-summary")).toContainText("GMV / 成交额");
  await expect(page.getByTestId("pc09-summary")).toContainText("订单量");
  await expect(page.getByTestId("pc09-summary")).toContainText("直播");
  await expect(page.getByTestId("pc09-summary")).toContainText("视频");
  await expect(page.getByText("当前数据仅归集，不自动计入比赛评分。", { exact: false })).toBeVisible();
});

test("PC09 aggregate metrics drill into batch-backed evidence and filters stay in the same workspace", async ({ page }) => {
  await page.goto("/admin/sanchuang/sanchuang-16/performance");

  await page.getByTestId("pc09-metric-live").click();
  await expect(page.getByTestId("pc09-evidence-live")).toBeVisible();
  await expect(page.getByTestId("pc09-evidence-live")).toContainText("batch-dy-20260818-a");

  await page.getByTestId("pc09-metric-video").click();
  await expect(page.getByTestId("pc09-evidence-videos")).toBeVisible();
  await expect(page.getByTestId("pc09-evidence-videos")).toContainText("dy-video-5001");

  await page.getByTestId("pc09-source-filter").selectOption("douyin");
  await page.getByTestId("pc09-metric-gmv").click();
  await expect(page.getByTestId("pc09-evidence-orders")).toContainText("dy-order-1001");
  await expect(page.getByTestId("pc09-evidence-orders")).not.toContainText("sc-order-2001");
  await expect(page.getByTestId("pc09-batches")).toContainText("失败");
});

test("PC09 export is a prototype action over the current filtered evidence", async ({ page }) => {
  await page.goto("/admin/sanchuang/sanchuang-16/performance");

  const download = page.waitForEvent("download");
  await page.getByTestId("pc09-export").click();
  await download;
  await expect(page.getByTestId("pc09-export-message")).toContainText("已导出当前筛选");
});

test("ordinary competitions do not gain a Sanchuang-specific operations workspace", async ({ page }) => {
  await page.goto("/admin/competitions/objects/innovation-cup-2026");
  await expect(page.getByTestId("pc09-hero")).toHaveCount(0);
  await expect(page.getByText("当前数据仅归集，不自动计入比赛评分。", { exact: false })).toHaveCount(0);

  await page.goto("/admin/sanchuang/innovation-cup-2026");
  await expect(page.getByText("这个 Competition 没有三创赛运营 Profile", { exact: true })).toBeVisible();
});

import { expect, test } from "@playwright/test";

test.use({ viewport: { width: 1440, height: 1000 } });

test("PC08 adds stage infrastructure to the existing Sanchuang Competition detail", async ({ page }) => {
  await page.goto("/admin/competitions/objects/sanchuang-16");

  await expect(page.getByTestId("pc08-infrastructure-nav")).toBeVisible();
  await expect(page.getByTestId("pc08-stage-list")).toBeVisible();
  await expect(page.locator('[data-testid^="pc08-stage-stage-s16-"]')).toHaveCount(4);
  await expect(page.getByText("Category ≠ Track / 赛道：", { exact: false })).toBeVisible();
  await expect(page.getByText("外部权威赛事：官方 API / 官方数据优先", { exact: false })).toBeVisible();
});

test("PC08 reuses the same stage model for an ordinary partner competition", async ({ page }) => {
  await page.goto("/admin/competitions/objects/innovation-cup-2026");

  await expect(page.getByTestId("pc08-stage-list")).toBeVisible();
  await expect(page.locator('[data-testid^="pc08-stage-stage-brand-"]')).toHaveCount(3);
  await expect(page.getByText("合作赛事", { exact: true })).toBeVisible();
  await expect(page.getByText("平台配置赛事：由平台赛事运营维护", { exact: false })).toBeVisible();
});

test("PC08 category dictionary can reorder and enable or disable first-level categories", async ({ page }) => {
  await page.goto("/admin/competitions/categories");

  const innovation = page.getByTestId("pc08-category-row-category-innovation");
  await expect(innovation).toContainText("创新创业");
  await innovation.getByRole("button", { name: "下移 创新创业" }).click();
  await expect(page.getByTestId("pc08-category-list").locator('> div').nth(1)).toContainText("创新创业");

  const industry = page.getByTestId("pc08-category-row-category-industry");
  await industry.getByRole("button", { name: "停用" }).click();
  await expect(industry).toContainText("停用");
});

test("PC08 registration projection drills into the existing Competition detail", async ({ page }) => {
  await page.goto("/admin/competitions/registrations");

  const row = page.getByTestId("pc08-registration-sanchuang-16");
  await expect(row).toContainText("山城新零售队");
  await expect(row).toContainText("源报名事实未记录时间");
  await expect(row).toContainText("Team / qualification 既有事实投影");
  await row.getByRole("link", { name: "赛事详情" }).click();
  await expect(page).toHaveURL(/\/admin\/competitions\/objects\/sanchuang-16$/);
  await expect(page.getByTestId("pc08-stage-list")).toBeVisible();
});

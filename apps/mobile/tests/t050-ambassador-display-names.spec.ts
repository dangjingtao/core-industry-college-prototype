import { expect, test } from "@playwright/test";

test("T050 Mobile uses campus identity labels without exposing the operations team name", async ({ page }) => {
  await page.goto("/ambassadors/team/amb-demo-team?accountId=account-demo-ambassador");

  await expect(page.getByRole("heading", { name: "我的推广团队" })).toBeVisible();
  await expect(page.getByText("核心大使计划 · 演示活动", { exact: true })).toBeVisible();
  await expect(page.getByText("校园大使", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("校园推荐官", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("核心大使", { exact: true })).toHaveCount(0);
  await expect(page.getByText("推广伙伴", { exact: true })).toHaveCount(0);
  await expect(page.getByText("华南商贸 · 校园大使 01", { exact: true })).toHaveCount(0);
});

test("T050 published terms use the new identity wording while retaining the campaign name", async ({ page }) => {
  await page.goto("/ambassadors?code=CA-DEMO-HN-2026");
  await expect(page).toHaveURL(/\/ambassadors\/apply/);

  await page.getByRole("button", { name: "核心大使计划活动条款" }).click();
  const terms = page.getByTestId("ambassador-terms-content");
  await expect(terms).toContainText("校园大使");
  await expect(terms).toContainText("校园推荐官");
  await expect(terms).not.toContainText("推广伙伴");
  await expect(page.getByText(/核心大使计划活动条款 · v1.0/)).toBeVisible();
});

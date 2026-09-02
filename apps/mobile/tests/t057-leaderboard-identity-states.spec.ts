import { expect, test } from "@playwright/test";

test.describe("T057 leaderboard identity badges and states", () => {
  test("reuses formal role badges and composes identity with self and rank states", async ({ page }) => {
    await page.goto("/courses");

    const preview = page.locator('section[aria-labelledby="learning-leaderboard-title"]');
    const ambassadorPreview = preview.locator('[data-leaderboard-role="校园大使"]');
    const recommenderPreview = preview.locator('[data-leaderboard-role="推荐官"]');
    await expect(ambassadorPreview).toHaveCount(1);
    await expect(recommenderPreview).toHaveCount(1);
    await expect(ambassadorPreview.locator("svg")).toHaveCount(1);
    await expect(recommenderPreview.locator("svg")).toHaveCount(1);

    await page.goto("/courses/leaderboard");

    const schoolList = page.getByTestId("leaderboard-list");
    await expect(schoolList.locator('[data-entry-id="s1"] [data-leaderboard-role="校园大使"]')).toBeVisible();
    await expect(schoolList.locator('[data-entry-id="s2"] [data-leaderboard-role="推荐官"]')).toBeVisible();
    await expect(schoolList.locator('[data-entry-id="s3"] [data-leaderboard-role]')).toHaveCount(0);

    const schoolSelf = page.locator('section[aria-labelledby="my-ranking-title"] [data-self="true"]');
    await expect(schoolSelf.locator('[data-leaderboard-state="self"]')).toBeVisible();
    await expect(schoolSelf.locator('[data-leaderboard-role="推荐官"]')).toBeVisible();
    await expect(schoolSelf.getByText("12", { exact: true })).toBeVisible();

    await page.getByRole("button", { name: "全国榜" }).click();

    const nationalSelf = page.getByTestId("leaderboard-list").locator('[data-entry-id="me"]');
    await expect(nationalSelf.locator('[data-leaderboard-state="self"]')).toBeVisible();
    await expect(nationalSelf.locator('[data-leaderboard-role="推荐官"]')).toBeVisible();
    await expect(nationalSelf.getByText("8", { exact: true })).toBeVisible();
    await expect(nationalSelf.getByText("广东财经大学")).toBeVisible();
  });
});

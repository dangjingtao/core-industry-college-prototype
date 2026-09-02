import { expect, test } from "@playwright/test";

test.describe("T056 learning leaderboard detail", () => {
  test("switches school and national Top 10 while preserving the correct self ranking state", async ({ page }) => {
    await page.goto("/courses/leaderboard");

    await expect(page.getByRole("heading", { name: "本周学习排行榜" })).toBeVisible();
    await expect(page.getByRole("button", { name: "本校榜" })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("heading", { name: "本校 Top 10" })).toBeVisible();

    const list = page.getByTestId("leaderboard-list");
    await expect(list.getByTestId("leaderboard-row")).toHaveCount(10);
    await expect(page.getByRole("heading", { name: "我的排名" })).toBeVisible();
    await expect(page.getByRole("region", { name: "我的排名" }).getByText("12", { exact: true })).toBeVisible();
    await expect(page.getByText("未进入 Top 10 也会保留")).toBeVisible();

    await page.getByRole("button", { name: "全国榜" }).click();

    await expect(page.getByRole("button", { name: "全国榜" })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("heading", { name: "全国 Top 10" })).toBeVisible();
    await expect(list.getByTestId("leaderboard-row")).toHaveCount(10);
    await expect(page.getByText("华南理工大学")).toBeVisible();
    await expect(page.getByText("深圳大学")).toBeVisible();

    const selfRow = list.locator('[data-self="true"]');
    await expect(selfRow).toHaveCount(1);
    await expect(selfRow.getByText("新芽同学")).toBeVisible();
    await expect(selfRow.getByText("8", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "我的排名" })).toHaveCount(0);

    await expect(page.getByText("托管")).toHaveCount(0);
    await expect(page.getByText("模拟")).toHaveCount(0);
    await expect(page.getByText("仅按本周课程学习时长排名，点赞不参与排名。")).toBeVisible();
  });
});

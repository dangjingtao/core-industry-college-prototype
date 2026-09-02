import { expect, test } from "@playwright/test";

test.describe("T055 course home learning leaderboard", () => {
  test("shows the compact weekly ranking summary and opens the full leaderboard", async ({ page }) => {
    await page.goto("/courses");

    const preview = page.locator('section[aria-labelledby="learning-leaderboard-title"]');
    await expect(preview.getByRole("heading", { name: "学习排行榜" })).toBeVisible();
    await expect(preview.getByText("我的本校排名")).toBeVisible();
    await expect(preview.getByText("本周学习时长")).toBeVisible();
    await expect(preview.getByText(/每周一更新/)).toBeVisible();
    await expect(preview.getByRole("heading", { name: "本校 Top 3" })).toBeVisible();
    await expect(preview.getByText("周榜")).toBeVisible();
    await expect(preview.getByText("NO.1")).toBeVisible();
    await expect(preview.getByText("NO.2")).toBeVisible();
    await expect(preview.getByText("NO.3")).toBeVisible();
    await expect(preview.getByLabel("校园大使")).toBeVisible();
    await expect(preview.getByLabel("推荐官")).toBeVisible();
    await expect(preview.getByText("林知夏")).toBeVisible();
    await expect(preview.getByText("周可昕")).toBeVisible();
    await expect(preview.getByText("陈一舟")).toBeVisible();
    await expect(preview.getByRole("link", { name: "进入完整排行榜" })).toBeVisible();

    await preview.getByRole("link", { name: "进入完整排行榜" }).click();
    await expect(page).toHaveURL(/\/courses\/leaderboard$/);
    await expect(page.getByRole("heading", { name: "本校学习排行榜" })).toBeVisible();
  });
});

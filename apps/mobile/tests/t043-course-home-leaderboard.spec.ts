import { expect, test } from "@playwright/test";

test.describe("T043 course home learning leaderboard", () => {
  test("shows weekly school ranking preview and opens the detail route", async ({ page }) => {
    await page.goto("/courses");

    await expect(page.getByRole("heading", { name: "学习排行榜" })).toBeVisible();
    await expect(page.getByText("我的本校排名")).toBeVisible();
    await expect(page.getByText("本周课程学习时长")).toBeVisible();
    await expect(page.getByRole("heading", { name: "本校 Top 3" })).toBeVisible();
    await expect(page.getByText("校园大使")).toBeVisible();
    await expect(page.getByText("推荐官")).toBeVisible();
    await expect(page.getByText("每周更新")).toBeVisible();

    const topThree = page.locator('section[aria-labelledby="learning-leaderboard-title"]');
    await expect(topThree.getByText("林知夏")).toBeVisible();
    await expect(topThree.getByText("周可昕")).toBeVisible();
    await expect(topThree.getByText("陈一舟")).toBeVisible();

    await page.getByRole("link", { name: "查看完整排行榜" }).click();
    await expect(page).toHaveURL(/\/courses\/leaderboard$/);
    await expect(page.getByRole("heading", { name: "本周学习排行榜" })).toBeVisible();
  });
});

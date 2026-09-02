import { expect, test } from "@playwright/test";

test.describe("T058 leaderboard like interaction", () => {
  test("likes, cancels and re-likes without changing rank, and keeps the same weekly state across scopes", async ({ page }) => {
    await page.goto("/courses/leaderboard");
    await page.evaluate(() => {
      for (const key of Object.keys(localStorage)) {
        if (key.startsWith("core.learning-leaderboard.likes.")) localStorage.removeItem(key);
      }
    });
    await page.reload();

    const schoolRow = page.locator('[data-entry-id="s1"]');
    await expect(schoolRow.getByText("1", { exact: true })).toBeVisible();

    const likeButton = schoolRow.getByTestId("leaderboard-like");
    await expect(likeButton).toHaveAttribute("aria-pressed", "false");
    await expect(likeButton.getByTestId("like-count")).toHaveText("38");

    await likeButton.click();
    await expect(likeButton).toHaveAttribute("aria-pressed", "true");
    await expect(likeButton.getByTestId("like-count")).toHaveText("39");
    await expect(schoolRow.getByText("1", { exact: true })).toBeVisible();

    await likeButton.click();
    await expect(likeButton).toHaveAttribute("aria-pressed", "false");
    await expect(likeButton.getByTestId("like-count")).toHaveText("38");

    await likeButton.click();
    await expect(likeButton).toHaveAttribute("aria-pressed", "true");
    await expect(likeButton.getByTestId("like-count")).toHaveText("39");

    const currentWeekKey = await page.getByTestId("leaderboard-list").getAttribute("data-week-key");
    expect(currentWeekKey).toBeTruthy();
    const stored = await page.evaluate(() => {
      const key = Object.keys(localStorage).find(item => item.startsWith("core.learning-leaderboard.likes."));
      return key ? { key, value: localStorage.getItem(key) } : null;
    });
    expect(stored?.key).toBe(`core.learning-leaderboard.likes.${currentWeekKey}`);
    expect(JSON.parse(stored?.value ?? "[]")).toContain("lin-zhixia");

    await page.getByRole("button", { name: "全国榜" }).click();
    const nationalSamePerson = page.locator('[data-entry-id="n3"]');
    const nationalLikeButton = nationalSamePerson.getByTestId("leaderboard-like");
    await expect(nationalLikeButton).toHaveAttribute("aria-pressed", "true");
    await expect(nationalLikeButton.getByTestId("like-count")).toHaveText("39");
    await expect(nationalSamePerson.getByText("3", { exact: true })).toBeVisible();

    const selfRow = page.locator('[data-entry-id="me"]');
    const selfLikeButton = selfRow.getByTestId("leaderboard-like");
    await expect(selfLikeButton).toBeDisabled();
    await expect(selfLikeButton).toHaveAttribute("aria-label", /不能给自己点赞/);
    await expect(selfLikeButton.getByTestId("like-count")).toHaveText("21");
  });

  test("ignores a previous-week like state when the current week has no active like", async ({ page }) => {
    await page.goto("/courses/leaderboard");
    const currentWeekKey = await page.getByTestId("leaderboard-list").getAttribute("data-week-key");
    expect(currentWeekKey).toBeTruthy();

    await page.evaluate((weekKey) => {
      for (const key of Object.keys(localStorage)) {
        if (key.startsWith("core.learning-leaderboard.likes.")) localStorage.removeItem(key);
      }
      localStorage.setItem("core.learning-leaderboard.likes.2000-01-03", JSON.stringify(["lin-zhixia"]));
      localStorage.removeItem(`core.learning-leaderboard.likes.${weekKey}`);
    }, currentWeekKey);
    await page.reload();

    const likeButton = page.locator('[data-entry-id="s1"]').getByTestId("leaderboard-like");
    await expect(likeButton).toHaveAttribute("aria-pressed", "false");
    await expect(likeButton.getByTestId("like-count")).toHaveText("38");
    await expect(page.getByText("点赞按周记录；取消后可以重新点赞，新一周会进入新的点赞周期。")).toBeVisible();
  });
});

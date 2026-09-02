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

    const stored = await page.evaluate(() => {
      const key = Object.keys(localStorage).find(item => item.startsWith("core.learning-leaderboard.likes."));
      return key ? { key, value: localStorage.getItem(key) } : null;
    });
    expect(stored?.key).toMatch(/^core\.learning-leaderboard\.likes\.\d{4}-\d{2}-\d{2}$/);
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

  test("ignores previous-week like state when the current week has no active like", async ({ page }) => {
    await page.goto("/courses/leaderboard");
    await page.evaluate(() => {
      for (const key of Object.keys(localStorage)) {
        if (key.startsWith("core.learning-leaderboard.likes.")) localStorage.removeItem(key);
      }
      localStorage.setItem("core.learning-leaderboard.likes.2000-01-03", JSON.stringify(["lin-zhixia"]));
    });
    await page.reload();

    const likeButton = page.locator('[data-entry-id="s1"]').getByTestId("leaderboard-like");
    await expect(likeButton).toHaveAttribute("aria-pressed", "false");
    await expect(likeButton.getByTestId("like-count")).toHaveText("38");

    await page.getByRole("button", { name: "规则说明" }).click();
    await expect(page.getByText("· 点赞按周记录，可取消后重新点赞，但不参与排名。")).toBeVisible();
  });
});

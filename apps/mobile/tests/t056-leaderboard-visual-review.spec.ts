import { expect, test } from "@playwright/test";
import { mkdir } from "node:fs/promises";

async function expectLeaderboardMaterialsLoaded(page: import("@playwright/test").Page) {
  const materials = page.locator('img[src*="/assets/learning-leaderboard/"]');
  await expect.poll(async () => materials.count()).toBeGreaterThan(3);
  await expect.poll(async () => materials.evaluateAll(images => images.every(image => {
    const element = image as HTMLImageElement;
    return element.complete && element.naturalWidth > 0 && element.naturalHeight > 0;
  }))).toBe(true);
}

test.describe("T056 leaderboard visual review evidence", () => {
  test("captures school and national boards with all WebP materials loaded", async ({ page }) => {
    await mkdir("visual-artifacts", { recursive: true });
    await page.goto("/courses/leaderboard");
    await expect(page.getByRole("heading", { name: "本校学习排行榜" })).toBeVisible();
    await expectLeaderboardMaterialsLoaded(page);
    await page.screenshot({ path: "visual-artifacts/leaderboard-school.png", fullPage: true });

    await page.getByRole("button", { name: "全国榜" }).click();
    await expect(page.getByRole("heading", { name: "全国学习排行榜" })).toBeVisible();
    await expectLeaderboardMaterialsLoaded(page);
    await page.screenshot({ path: "visual-artifacts/leaderboard-national.png", fullPage: true });
  });
});

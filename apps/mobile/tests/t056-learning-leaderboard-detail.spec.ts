import { expect, test } from "@playwright/test";

test.describe("T056 learning leaderboard detail", () => {
  test("renders the material-backed leaderboard structure and preserves ranking states", async ({ page }) => {
    await page.goto("/courses/leaderboard");

    await expect(page.getByRole("button", { name: "本校榜" })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("heading", { name: "本校学习排行榜" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "本周课程学习时长排名" })).toBeVisible();

    const bannerImage = page.getByTestId("weekly-material-banner").locator("img");
    await expect(bannerImage).toHaveAttribute("src", /weekly-banner\.webp$/);
    await expect(page.getByTestId("rank-material-1")).toBeVisible();
    await expect(page.getByTestId("rank-material-2")).toBeVisible();
    await expect(page.getByTestId("rank-material-3")).toBeVisible();
    await expect(page.locator('[data-leaderboard-role="校园大使"]').first()).toBeVisible();
    await expect(page.locator('[data-leaderboard-role="推荐官"]').first()).toBeVisible();

    const list = page.getByTestId("leaderboard-list");
    await expect(list.getByTestId("leaderboard-row")).toHaveCount(10);
    await expect(page.getByRole("heading", { name: "我的排名" })).toBeVisible();
    await expect(page.getByRole("region", { name: "我的排名" }).getByText("12", { exact: true })).toBeVisible();
    await expect(page.getByText("未进入 Top10？别着急，你的排名也在不断上升中。")).toBeVisible();

    await page.getByRole("button", { name: "全国榜" }).click();

    await expect(page.getByRole("button", { name: "全国榜" })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("heading", { name: "全国学习排行榜" })).toBeVisible();
    await expect(list.getByTestId("leaderboard-row")).toHaveCount(10);
    await expect(page.getByText("华南理工大学")).toBeVisible();
    await expect(page.getByText("深圳大学")).toBeVisible();
    await expect(page.getByRole("heading", { name: "本周课程学习时长排名" })).toBeVisible();

    const selfRow = list.locator('[data-self="true"]');
    await expect(selfRow).toHaveCount(1);
    await expect(selfRow.getByText("新芽同学")).toBeVisible();
    await expect(selfRow.getByText("8", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "我的排名" })).toHaveCount(0);

    await expect(page.getByText("托管")).toHaveCount(0);
    await expect(page.getByText("模拟")).toHaveCount(0);

    const rulesTrigger = page.getByRole("button", { name: "规则说明" });
    await expect(rulesTrigger).toHaveAttribute("aria-haspopup", "dialog");
    await rulesTrigger.click();

    const dialog = page.getByRole("dialog", { name: "排行榜规则" });
    await expect(dialog).toBeVisible();
    await expect(page.getByTestId("leaderboard-rules-dialog")).toBeVisible();
    await expect(dialog.getByText("仅按本周课程学习时长排名，每周一进入新周期。")).toBeVisible();
    await expect(dialog.getByText("点赞按周记录，可取消后重新点赞，但不参与排名。")).toBeVisible();
    await expect(dialog.getByText("全国榜展示学校；校园大使 / 推荐官仅作身份识别。")).toBeVisible();

    await dialog.getByRole("button", { name: "关闭弹窗" }).click();
    await expect(dialog).toHaveCount(0);
  });
});
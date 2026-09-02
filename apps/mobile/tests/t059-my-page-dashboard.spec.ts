import { expect, test } from "@playwright/test";

const learningLinks = [
  ["我的课程", "/courses/center"],
  ["学习记录", "/assets/learning"],
  ["我的证书", "/assets/certificates"],
  ["赛事成绩", "/assets/results"],
] as const;

const serviceLinks = [
  ["长期资产", "/assets"],
  ["我的卡券", "/benefits/wallet"],
  ["消息通知", "/me/notifications"],
  ["比赛团队", "/me/teams"],
  ["我的简历", "/me/resume"],
  ["账号绑定", "/me/accounts"],
  ["帮助客服", "/support"],
  ["设置中心", "/me/settings"],
  ["授权管理", "/me/authorization"],
  ["用户协议", "/legal/user-agreement"],
  ["隐私政策", "/legal/privacy"],
  ["关于我们", "/about"],
] as const;

test.describe("T059 my page dashboard", () => {
  test("keeps every existing entrance while reorganizing the page as a dashboard", async ({ page }) => {
    await page.goto("/me");

    await expect(page.getByTestId("t059-my-dashboard")).toBeVisible();
    await expect(page.getByRole("heading", { name: "我的", exact: true })).toHaveCount(0);

    await expect(page.locator('section[aria-label="个人资料"] a[href="/me/profile"]')).toBeVisible();
    await expect(page.getByRole("button", { name: "扫一扫" })).toBeVisible();
    await expect(page.getByRole("link", { name: "设置", exact: true })).toHaveAttribute("href", "/me/settings");

    const reading = page.getByTestId("reading-center-entry");
    await expect(reading.getByText("阅读中心")).toBeVisible();
    await expect(reading.getByRole("button", { name: /进入阅读/ })).toBeDisabled();

    const learningGrid = page.getByTestId("my-learning-grid");
    for (const [label, href] of learningLinks) {
      await expect(learningGrid.getByRole("link", { name: label, exact: true })).toHaveAttribute("href", href);
    }

    await expect(page.getByTestId("learning-leaderboard-entry")).toHaveAttribute("href", "/courses/leaderboard");

    const serviceGrid = page.getByTestId("more-services-grid");
    for (const [label, href] of serviceLinks) {
      await expect(serviceGrid.getByRole("link", { name: label, exact: true })).toHaveAttribute("href", href);
    }

    const ambassadorTeam = page.getByTestId("ambassador-team-entry");
    if (await ambassadorTeam.count()) await expect(ambassadorTeam).toHaveAttribute("href", /\/ambassadors\/team\//);

    await page.getByRole("button", { name: "退出登录" }).click();
    await expect(page.getByRole("button", { name: "确认退出" })).toBeVisible();
    await expect(page.getByText(/只会清除当前登录 session/)).toBeVisible();
  });

  test("has no horizontal overflow at common mobile widths", async ({ page }) => {
    for (const width of [375, 390, 430]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/me");
      await expect(page.getByTestId("t059-my-dashboard")).toBeVisible();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      expect(overflow, `${width}px viewport should not scroll horizontally`).toBe(false);
    }
  });

  test("scan simulator remains reachable", async ({ page }) => {
    await page.goto("/me");
    await page.getByRole("button", { name: "扫一扫" }).click();
    await expect(page.getByTestId("ambassador-scan-simulator")).toBeVisible();
    await expect(page.getByText("学校招募码")).toBeVisible();
    await expect(page.getByText("团队招募码")).toBeVisible();
    await expect(page.getByText("福利 / 兑换码")).toBeVisible();
  });
});

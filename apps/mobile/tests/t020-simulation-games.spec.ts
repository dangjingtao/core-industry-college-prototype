import { expect, test } from "@playwright/test";

const games = [
  { title: "经营决策体验", href: "/modules/simulations/activity-business-decision-2026" },
  { title: "本地生活券运营体验", href: "/modules/simulations/activity-local-life-coupon" },
  { title: "校园饮品店经营体验", href: "/modules/simulations/activity-campus-drinks" },
  { title: "直播间运营体验", href: "/modules/simulations/activity-live-commerce" },
  { title: "跨境小铺选品体验", href: "/modules/simulations/activity-cross-border-selection" },
];

test("T020 应用中心展示 5 个模拟游戏入口", async ({ page }) => {
  await page.goto("/apps");
  await expect(page.getByRole("heading", { name: "互动体验", exact: true })).toBeVisible();
  for (const game of games) {
    await expect(page.getByRole("link", { name: new RegExp("^" + game.title + "："), exact: false })).toHaveAttribute("href", game.href);
  }
});

test("T020 各新游戏宿主页展示预启动说明", async ({ page }) => {
  for (const game of games.slice(1)) {
    await page.goto(game.href);
    await expect(page.locator("h1")).toHaveText(game.title);
    await expect(page.getByText("这是一个轻量互动体验，不记录成绩，也不影响你的赛事、课程或个人档案。", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "开始体验" })).toBeVisible();
  }
});

test("T020 直播间运营完整通关：三轮决策、结果、排名与返回", async ({ page }) => {
  await page.goto("/modules/simulations/activity-live-commerce");
  await page.getByRole("button", { name: "开始体验" }).click();
  const frame = page.frameLocator('iframe[title="直播间运营体验"]');
  await expect(frame.getByRole("heading", { name: "第 1 轮 · 选品排品" })).toBeVisible();
  await frame.getByRole("button", { name: /引流款在前/ }).click();
  await expect(frame.getByRole("heading", { name: "第 2 轮 · 投流预算" })).toBeVisible();
  await frame.getByRole("button", { name: /付费投流/ }).click();
  await expect(frame.getByRole("heading", { name: "第 3 轮 · 转化节奏" })).toBeVisible();
  await frame.getByRole("button", { name: /憋单促单/ }).click();
  await expect(frame.getByText("本次经营结果", { exact: true })).toBeVisible();
  await expect(frame.getByText("本场排名", { exact: true })).toBeVisible();
  await expect(frame.locator(".rank-item")).toHaveCount(6);
  await expect(frame.locator(".rank-item.is-me")).toContainText("你（本场）");
  await expect(page.getByText("体验完成", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "返回活动", exact: true }).last().click();
  await expect(page).toHaveURL(/\/apps$/);
});

test("T020 新游戏深层刷新不 404", async ({ page }) => {
  await page.goto("/modules/simulations/activity-campus-drinks");
  await page.reload();
  await expect(page.locator("h1")).toHaveText("校园饮品店经营体验");
});

import { expect, test } from "@playwright/test";

const groupTitles = ["学习成长", "福利权益", "工具与服务", "消息与我的"];

const entries: [string, string][] = [
  ["课程学习", "/courses"],
  ["学力值", "/growth/score"],
  ["可信空间", "/assets"],
  ["创赛福利", "/benefits"],
  ["我的卡券", "/benefits/wallet"],
  ["兑换中心", "/benefits/exchange"],
  ["任务中心", "/tasks"],
  ["投递记录", "/applications"],
  ["快速验真", "/assets/verification"],
  ["公告资讯", "/news"],
  ["三创同学会", "/stories"],
  ["合作企业", "/companies"],
  ["帮助与客服", "/support"],
  ["我的比赛团队", "/me/teams"],
  ["账号绑定", "/me/accounts"],
  ["消息通知", "/me/notifications"],
];

test("T018 应用中心 shows 4 grouped sections and 16 real route entries", async ({ page }) => {
  await page.goto("/apps");
  for (const title of groupTitles) {
    await expect(page.getByRole("heading", { name: title, exact: true })).toBeVisible();
  }
  for (const [label, href] of entries) {
    await expect(page.getByRole("link", { name: new RegExp(`^${label}：`), exact: false })).toHaveAttribute("href", href);
  }
});

test("T018 创赛工坊 entry locates active competition workshop and navigates in", async ({ page }) => {
  await page.goto("/apps");
  const workshop = page.getByRole("link", { name: /^创赛工坊：/ });
  await expect(workshop).toHaveAttribute("href", "/competitions/sanchuang-16/workspace/workshop");
  await workshop.click();
  await expect(page).toHaveURL(/\/competitions\/sanchuang-16\/workspace\/workshop$/);
  await expect(page.getByRole("heading", { name: "创赛工坊", exact: true })).toBeVisible();
  await expect(page.getByTestId("skill-matrix")).toBeVisible();
});

test("T018 tabbar exposes 应用中心 between 赛事 and 机会", async ({ page }) => {
  await page.goto("/home");
  const nav = page.locator("nav");
  const links = nav.getByRole("link");
  await expect(links).toHaveCount(5);
  await expect(links.nth(0)).toHaveText("首页");
  await expect(links.nth(1)).toHaveText("赛事");
  await expect(links.nth(2)).toHaveText("应用中心");
  await expect(links.nth(3)).toHaveText("机会");
  await expect(links.nth(4)).toHaveText("我的");
  await links.nth(2).click();
  await expect(page).toHaveURL(/\/apps$/);
});

test("T018 entry click navigates to real page and back works", async ({ page }) => {
  await page.goto("/apps");
  await page.getByRole("link", { name: /^课程学习：/ }).click();
  await expect(page).toHaveURL(/\/courses$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/apps$/);

  await page.getByRole("link", { name: /^快速验真：/ }).click();
  await expect(page).toHaveURL(/\/assets\/verification$/);
});

test("T018 学力值 entry opens credit placeholder page", async ({ page }) => {
  await page.goto("/apps");
  await page.getByRole("link", { name: /^学力值：/ }).click();
  await expect(page).toHaveURL(/\/growth\/score$/);
  await expect(page.getByRole("heading", { name: "学力值", exact: true })).toBeVisible();
  await expect(page.getByText("我的学力值", { exact: true })).toBeVisible();
});

test("T018 deep link /apps refresh does not 404", async ({ page }) => {
  await page.goto("/apps");
  await page.reload();
  await expect(page.getByRole("heading", { name: "应用中心", exact: true })).toBeVisible();
});

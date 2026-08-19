import { expect, test } from "@playwright/test";

const hostUrl = "/modules/simulations/activity-business-decision-2026";

test("T019 应用中心展示互动体验入口并进入宿主页", async ({ page }) => {
  await page.goto("/apps");
  await expect(page.getByRole("heading", { name: "互动体验", exact: true })).toBeVisible();
  const entry = page.getByRole("link", { name: /^经营决策体验：/ });
  await expect(entry).toHaveAttribute("href", hostUrl);
  await entry.click();
  await expect(page).toHaveURL(new RegExp(hostUrl.replace("/", "\\/") + "$"));
  await expect(page.locator("h1")).toHaveText("经营决策体验");
  await expect(page.getByText("这是一个轻量互动体验，不记录成绩，也不影响你的赛事、课程或个人档案。", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "开始体验" })).toBeVisible();
});

test("T019 完整体验：三周决策、结果展示、完成与返回活动", async ({ page }) => {
  await page.goto(hostUrl);
  await page.getByRole("button", { name: "开始体验" }).click();
  const frame = page.frameLocator('iframe[title="经营决策体验"]');
  await expect(frame.getByRole("heading", { name: "第 1 周 · 主推商品" })).toBeVisible();
  await frame.getByRole("button", { name: /平价蔬菜包/ }).click();
  await expect(frame.getByRole("heading", { name: "第 2 周 · 周末促销" })).toBeVisible();
  await frame.getByRole("button", { name: /爆品直降/ }).click();
  await expect(frame.getByRole("heading", { name: "第 3 周 · 履约方式" })).toBeVisible();
  await frame.getByRole("button", { name: /集中自提/ }).click();
  await expect(frame.getByText("本次经营结果", { exact: true })).toBeVisible();
  await expect(frame.getByText("周订单量", { exact: true })).toBeVisible();
  await expect(frame.getByText("本场排名", { exact: true })).toBeVisible();
  await expect(frame.locator(".rank-item")).toHaveCount(6);
  await expect(frame.locator(".rank-item.is-me")).toContainText("你（本场）");
  await expect(page.getByText("体验完成", { exact: true })).toBeVisible();
  await expect(page.getByText("结果仅供互动参考，不代表正式能力评价。", { exact: false })).toBeVisible();
  await page.getByRole("button", { name: "返回活动", exact: true }).last().click();
  await expect(page).toHaveURL(/\/apps$/);
});

test("T019 再试一次重新开始，H5 结束体验可返回", async ({ page }) => {
  await page.goto(hostUrl);
  await page.getByRole("button", { name: "开始体验" }).click();
  const frame = page.frameLocator('iframe[title="经营决策体验"]');
  await frame.getByRole("button", { name: /平价蔬菜包/ }).click();
  await frame.getByRole("button", { name: /爆品直降/ }).click();
  await frame.getByRole("button", { name: /集中自提/ }).click();
  await expect(frame.getByText("本次经营结果", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "再试一次" }).click();
  await expect(frame.getByRole("heading", { name: "第 1 周 · 主推商品" })).toBeVisible();
  await frame.getByRole("button", { name: /本地水果礼盒/ }).click();
  await frame.getByRole("button", { name: /会员专享价/ }).click();
  await frame.getByRole("button", { name: /混合模式/ }).click();
  await expect(frame.getByText("本次经营结果", { exact: true })).toBeVisible();
  await expect(frame.getByText("本场排名", { exact: true })).toBeVisible();
  await frame.getByRole("button", { name: "结束体验并返回" }).click();
  await expect(page).toHaveURL(/\/apps$/);
});

test("T019 深层刷新不 404，未知 assignment 降级提示", async ({ page }) => {
  await page.goto(hostUrl);
  await page.reload();
  await expect(page.locator("h1")).toHaveText("经营决策体验");

  await page.goto("/modules/simulations/unknown-assignment");
  await expect(page.getByText("当前活动未开启", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "返回活动", exact: true }).last().click();
  await expect(page).toHaveURL(/\/apps$/);
});

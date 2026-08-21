import { expect, test } from "@playwright/test";

const rideBenefitUrl = "/benefits/benefit-tencent-map-ride";
const rideExternalUrl = "https://map.qq.com/?_wv=1027&coupon=student-ride";

test("T019 福利首页展示已绑定手机号状态", async ({ page }) => {
  await page.goto("/benefits");
  await expect(page.getByText("已绑定手机号")).toBeVisible();
  await expect(page.getByText("138****0000")).toBeVisible();
  await expect(page.getByText("领取打车券等权益时无需重复输入")).toBeVisible();
});

test("T019 全部免费福利页展示已绑定手机号状态", async ({ page }) => {
  await page.goto("/benefits/free");
  await expect(page.getByText("已绑定手机号")).toBeVisible();
  await expect(page.getByText("138****0000")).toBeVisible();
});

test("T019 打车券详情页展示绑定手机号与领取主按钮", async ({ page }) => {
  await page.goto(rideBenefitUrl);
  await expect(page.getByText("后台已绑定手机号，领取时无需重复输入")).toBeVisible();
  const claimLink = page.getByRole("link", { name: "领取打车券" });
  await expect(claimLink).toBeVisible();
  await expect(claimLink).toHaveAttribute("href", rideExternalUrl);
  await expect(claimLink).toHaveAttribute("target", "_blank");
});

test("T019 打车券领取后弹出成功弹窗并提供查看卡券/去使用出口", async ({ page }) => {
  await page.goto(rideBenefitUrl);
  await page.getByRole("button", { name: "我已领取，标记状态" }).click();
  await expect(page.getByText("领取成功")).toBeVisible();
  await expect(page.getByText("「腾讯地图出行打车券」已标记为待使用，可前往卡券查看或跳转使用。")).toBeVisible();

  // 查看我的卡券
  await page.getByRole("button", { name: "查看我的卡券" }).click();
  await expect(page).toHaveURL(/\/benefits\/wallet$/);
});

test("T019 未登录时详情页提示登录后查看", async ({ page }) => {
  await page.goto("/me");
  await page.getByRole("button", { name: "退出登录" }).click();
  await page.getByRole("button", { name: "确认退出" }).click();

  await page.goto(rideBenefitUrl);
  await expect(page.getByText("登录查看资格")).toBeVisible();
  await expect(page.getByRole("button", { name: "登录后查看并领取" })).toBeVisible();
});

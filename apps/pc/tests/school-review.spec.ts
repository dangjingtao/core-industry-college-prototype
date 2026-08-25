import { expect, test, type Page } from "@playwright/test";

test.use({ viewport: { width: 1440, height: 1000 } });

async function enterReview(page: Page) {
  await page.goto("/review/login");
  await expect(page.getByRole("heading", { name: "教师登录", level: 1 })).toBeVisible();
  await page.getByRole("button", { name: "登录审核工作台" }).click();
  await expect(page.getByRole("heading", { name: "报名审核", level: 1 })).toBeVisible();
}

test("school review approval requires an explicit confirmation dialog", async ({ page }) => {
  await enterReview(page);
  await page.getByRole("row", { name: /号外号外爆卖爆卖/ }).getByRole("button", { name: "审核" }).click();
  await expect(page.getByRole("heading", { name: "号外号外爆卖爆卖", level: 1 })).toBeVisible();

  await page.getByTestId("review-approve").click();
  const dialog = page.getByRole("dialog", { name: "确认审核通过？" });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText("不等于外部官方参赛资格");
  await dialog.getByRole("button", { name: "确认通过" }).click();

  await expect(page.getByRole("heading", { name: "报名审核", level: 1 })).toBeVisible();
  await page.getByRole("button", { name: "已通过" }).click();
  await expect(page.getByRole("row", { name: /号外号外爆卖爆卖/ })).toContainText("已通过");
});

test("school review rejection collects its reason inside the dialog", async ({ page }) => {
  await enterReview(page);
  await page.getByRole("row", { name: /号外号外爆卖爆卖/ }).getByRole("button", { name: "审核" }).click();

  await page.getByTestId("review-reject-toggle").click();
  const dialog = page.getByRole("dialog", { name: "驳回团队报名" });
  await expect(dialog).toBeVisible();
  await expect(page.getByTestId("review-reject-submit")).toBeDisabled();
  await page.getByTestId("review-reject-reason").fill("成员学校信息需要补充");
  await page.getByTestId("review-reject-submit").click();

  await page.getByRole("button", { name: "已驳回" }).click();
  await expect(page.getByRole("row", { name: /号外号外爆卖爆卖/ })).toContainText("已驳回");
});

test("school review overview filters by review status", async ({ page }) => {
  await enterReview(page);
  await page.getByRole("button", { name: "已驳回" }).click();
  await expect(page.getByRole("row", { name: /潮品速递站/ })).toBeVisible();
  await expect(page.getByRole("row", { name: /号外号外爆卖爆卖/ })).toHaveCount(0);

  await page.getByRole("button", { name: "已通过" }).click();
  await expect(page.getByRole("row", { name: /校园美妆增长实验室/ })).toBeVisible();
});

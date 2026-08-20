import { expect, test } from "@playwright/test";

test("school review teacher sees authorized school teams and approves a pending one", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/review/login");
  await expect(page.getByRole("heading", { name: "学校报名审核 · 身份入口", level: 1 })).toBeVisible();
  await page.getByRole("button", { name: "进入审核控制台" }).click();

  await expect(page.getByRole("heading", { name: "审核总览", level: 1 })).toBeVisible();
  await expect(page.getByText("广东技术师范大学", { exact: true }).first()).toBeVisible();
  await expect(page.getByTestId("review-team-row-review-team-16192192")).toBeVisible();

  await page.getByTestId("review-open-review-team-16192192").click();
  await expect(page.getByRole("heading", { name: "号外号外爆卖爆卖", level: 1 })).toBeVisible();
  await expect(page.getByText("张三", { exact: true })).toBeVisible();

  await page.getByTestId("review-approve").click();
  await expect(page.getByText(/该团队已审核通过/)).toBeVisible();

  await page.getByRole("link", { name: /返回审核总览/ }).click();
  await expect(page.getByRole("heading", { name: "审核总览", level: 1 })).toBeVisible();
  await expect(page.getByText("已通过", { exact: true }).first()).toBeVisible();
});

test("school review rejects a pending team with reason and can reopen it", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/review/login");
  await page.getByRole("button", { name: "进入审核控制台" }).click();

  await page.getByTestId("review-open-review-team-16192192").click();
  await page.getByTestId("review-reject-toggle").click();
  await page.getByTestId("review-reject-reason").fill("成员学校信息需要补充");
  await page.getByTestId("review-reject-submit").click();
  await expect(page.getByText(/该团队已驳回/)).toBeVisible();

  await page.getByTestId("review-reopen").click();
  await expect(page.getByText(/等待学校审核真实性/)).toBeVisible();
});

test("school review overview filters by review status", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/review/login");
  await page.getByRole("button", { name: "进入审核控制台" }).click();

  await page.getByTestId("review-filter-rejected").click();
  await expect(page.getByTestId("review-team-row-review-team-16192076")).toBeVisible();
  await expect(page.getByTestId("review-team-row-review-team-16192192")).toHaveCount(0);

  await page.getByTestId("review-filter-approved").click();
  await expect(page.getByTestId("review-team-row-review-team-16192088")).toBeVisible();
});

import { expect, test } from "@playwright/test";

test("PC root opens the management data-control skeleton", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole("heading", { name: /先让手机端的每一类业务数据/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: "PC 管理端不是桌面版 App，而是手机端的数据控制面" })).toBeVisible();
  await expect(page.getByText("0").last()).toBeVisible();
  await expect(page.getByText("新增全局 Task 真相源", { exact: true })).toBeVisible();
});

test("admin domains expose data ownership rather than copied mobile pages", async ({ page }) => {
  await page.goto("/admin/resources");
  await expect(page.getByRole("heading", { name: "资源运营", exact: true })).toBeVisible();
  await expect(page.getByText("ResourceRelation", { exact: true })).toBeVisible();
  await expect(page.getByText("EligibilityRule", { exact: true })).toBeVisible();
  await expect(page.getByText("企业资源关系", { exact: true })).toBeVisible();

  await page.goto("/admin/students");
  await expect(page.getByText("CompetitionIdentity", { exact: true })).toBeVisible();
  await expect(page.getByText("Account ↔ CompetitionIdentity[]", { exact: true })).toBeVisible();
});

test("registration portal remains an independent PC business entry", async ({ page }) => {
  await page.goto("/admin");
  const portalLink = page.getByRole("link", { name: "三创赛报名门户" });
  await expect(portalLink).toHaveAttribute("href", "/registration-portal/start");
  await portalLink.click();
  await expect(page.getByRole("heading", { name: "三创赛报名", level: 1 })).toBeVisible();
});

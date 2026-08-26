import { test, expect } from "@playwright/test";

test("T046 ambassador operations flow", async ({ page }) => {
  await page.goto("/admin/ambassadors");
  await expect(page.getByRole("heading", { name: "核心大使计划" })).toBeVisible();
  await expect(page.getByTestId("t046-primary-nav").first()).toHaveClass(/text-text-brand/);
  await page.getByRole("button", { name: /演示活动/ }).click();
  await expect(page.getByRole("heading", { name: /演示活动/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: "华南商贸职业学院" })).toBeVisible();
  const qr = page.getByTestId("qr-CA-DEMO-HN-2026");
  await expect(qr).toBeVisible();
  await expect.poll(async () => qr.innerHTML()).toContain("path");
  await expect(page.getByText("account-demo-ambassador")).toBeVisible();
});

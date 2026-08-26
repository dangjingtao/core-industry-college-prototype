import { test, expect } from "@playwright/test";

test("T046 ambassador operations flow", async ({ page }) => {
  await page.goto("/admin/ambassadors");
  await expect(page.getByRole("heading", { name: "核心大使计划" })).toBeVisible();
  await expect(page.getByTestId("t046-primary-nav").first()).toHaveClass(/text-text-brand/);
  await page.getByRole("button", { name: /2026 核心大使计划/ }).click();
  await expect(page.getByRole("heading", { name: /2026 核心大使计划/ })).toBeVisible();
  await expect(page.getByText("华南商贸职业学院")).toBeVisible();
  await expect(page.getByText("暂时还没有团队")).toBeVisible();
});

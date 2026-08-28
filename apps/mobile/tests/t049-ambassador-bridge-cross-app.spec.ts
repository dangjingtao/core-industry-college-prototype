import { expect, test } from "@playwright/test";

test("T049 PC campaign state hydrates Mobile and Mobile application returns to PC", async ({ page }) => {
  await page.goto("http://127.0.0.1:5174/admin/ambassadors");
  await page.getByRole("button", { name: "创建活动" }).click();

  const dialog = page.getByRole("dialog", { name: "创建校园大使计划" });
  await dialog.getByLabel("活动名称").fill("T049 联动活动");
  await dialog.getByLabel("开始日期").fill("2026-08-26");
  await dialog.getByLabel("结束日期").fill("2026-12-31");
  await dialog.getByRole("button", { name: "创建活动" }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole("row").filter({ hasText: "T049 联动活动" })).toBeVisible();

  const popupPromise = page.waitForEvent("popup");
  await page.getByTestId("ambassador-demo-bridge-launcher").click();
  const mobile = await popupPromise;
  await mobile.waitForLoadState("domcontentloaded");
  await expect(mobile).toHaveURL(/127\.0\.0\.1:5173\/me\?ambassadorBridge=1/);
  await expect(page.getByTestId("ambassador-demo-bridge-launcher")).toContainText("PC ↔ Mobile 已连接");

  await mobile.getByRole("button", { name: "扫一扫" }).click();
  const scanner = mobile.getByTestId("ambassador-scan-simulator");
  await expect(scanner).toBeVisible();
  const recruitment = scanner.getByRole("button").filter({ hasText: "T049 联动活动" });
  await expect(recruitment).toHaveCount(1);
  await recruitment.click();

  await expect(mobile).toHaveURL(/\/ambassadors\/apply/);
  await expect(mobile.getByText("T049 联动活动", { exact: true })).toBeVisible();
  await mobile.getByLabel("自我介绍").fill("T049 联动预演学生");
  await mobile.getByLabel("校园传播渠道").fill("班级群与学生组织");
  await mobile.getByLabel("参与动机").fill("验证前后台联动闭环");
  await mobile.getByLabel("同意活动条款").check();
  await mobile.getByRole("button", { name: "提交申请，获得团队招募码" }).click();
  await expect(mobile.getByRole("heading", { name: "我的推广团队" })).toBeVisible();

  await page.getByRole("button", { name: "T049 联动活动" }).click();
  await expect(page.getByText(/林晓团队 · [0-9A-Z]+/)).toBeVisible();
  await expect(page.getByText("待点亮", { exact: true })).toBeVisible();
});

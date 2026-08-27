import { expect, test } from "@playwright/test";

test("T047 creates campaigns through the shared dialog with structured form config", async ({ page }) => {
  await page.goto("/admin/ambassadors");
  await page.getByRole("button", { name: "创建活动" }).click();

  const dialog = page.getByRole("dialog", { name: "创建核心大使计划" });
  await expect(dialog).toBeVisible();
  await expect(page.getByRole("heading", { name: "核心大使计划", exact: true })).toBeVisible();

  await dialog.getByLabel("活动名称").fill("T047 验收活动");
  await dialog.getByRole("button", { name: "华南商贸职业学院" }).click();
  await dialog.getByLabel("广东技术职业学院").check();
  await dialog.getByRole("button", { name: "完成选择" }).click();

  await expect(dialog.getByTestId("application-form-field")).toHaveCount(3);
  await dialog.getByRole("button", { name: "新增字段" }).click();
  await expect(dialog.getByTestId("application-form-field")).toHaveCount(4);
  await dialog.getByLabel("字段 4 名称").fill("是否担任学生干部");
  await dialog.getByLabel("字段 4 类型").selectOption("single-choice");
  await dialog.getByLabel("字段 4 选项").fill("是、否");
  await expect(dialog.getByLabel("活动条款版本")).toHaveValue("campus-ambassador-terms-v1");
  await expect(dialog.getByLabel("活动条款版本").locator("option:checked")).toHaveText("核心大使计划活动条款 · v1.0");

  await dialog.getByRole("button", { name: "创建活动" }).click();
  await expect(dialog).toHaveCount(0);
  const row = page.getByRole("row").filter({ hasText: "T047 验收活动" });
  await expect(row).toBeVisible();
  await expect(row).toContainText("2");
});

test("T047 maintains published terms as frozen versions", async ({ page }) => {
  await page.goto("/admin/ambassadors");
  await page.getByRole("button", { name: "活动条款" }).click();

  const dialog = page.getByRole("dialog", { name: "核心大使计划活动条款" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText("核心大使计划活动条款 · v1.0", { exact: true })).toBeVisible();
  await expect(dialog.getByText(/已发布并冻结/)).toBeVisible();
  await expect(dialog.getByRole("button", { name: "编辑草稿" })).toHaveCount(0);

  await dialog.getByRole("button", { name: "基于当前版本新建" }).click();
  const draft = dialog.locator("div").filter({ hasText: "核心大使计划活动条款 · v2.0" }).filter({ hasText: "草稿 · 可编辑" }).first();
  await expect(draft).toBeVisible();
  await draft.getByRole("button", { name: "编辑草稿" }).click();
  await dialog.getByLabel("条款标题").fill("核心大使计划活动条款");
  await dialog.getByRole("button", { name: "发布并冻结" }).click();

  await expect(dialog.getByText("核心大使计划活动条款 · v2.0", { exact: true })).toBeVisible();
  await expect(dialog.getByText(/已发布并冻结/)).toHaveCount(2);
});

test("T047 previews school recruitment QR in a branded dialog", async ({ page }) => {
  await page.goto("/admin/ambassadors");
  await page.getByRole("button", { name: /演示活动/ }).click();

  const qr = page.getByTestId("qr-CA-DEMO-HN-2026");
  await expect(qr).toBeVisible();
  await expect(qr).toHaveAttribute("data-payload", /\/ambassadors\?code=CA-DEMO-HN-2026$/);
  await expect.poll(async () => qr.innerHTML()).toContain("path");

  await page.getByRole("button", { name: "查看 华南商贸职业学院 学校招募二维码" }).click();
  const dialog = page.getByRole("dialog", { name: "华南商贸职业学院 · 校园大使招募二维码" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText("核心大使计划 · 校园招募", { exact: true })).toBeVisible();
  const preview = dialog.getByTestId("qr-preview-CA-DEMO-HN-2026");
  await expect(preview).toHaveAttribute("data-payload", /\/ambassadors\?code=CA-DEMO-HN-2026$/);
  await expect.poll(async () => preview.innerHTML()).toContain("path");
  await expect(dialog.getByRole("button", { name: "下载二维码" })).toBeEnabled();
});

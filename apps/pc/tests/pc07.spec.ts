import { expect, test } from "@playwright/test";

test.use({ viewport: { width: 1360, height: 940 } });

test("PC07 exposes system settings, masks credentials and filters SMS delivery evidence", async ({ page }) => {
  await page.goto("/admin/settings/sms");

  await expect(page.getByRole("heading", { name: "短信管理", level: 1 })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "管理端主导航" }).getByRole("link", { name: "系统设置" })).toBeVisible();
  await expect(page.getByTestId("sms-access-key")).toHaveValue("LTAI••••••••MOCK");
  await expect(page.getByTestId("sms-secret-key")).toHaveValue("••••••••••••••••");
  await expect(page.getByText("真实 Secret 不下发到页面；原型不包含真实凭据")).toBeVisible();

  await page.getByTestId("sms-record-status-filter").selectOption("failed");
  await expect(page.getByTestId("sms-records")).toContainText("186****7719");
  await expect(page.getByTestId("sms-records")).toContainText("短信签名未通过服务商校验（Mock）");
  await expect(page.getByTestId("sms-records")).not.toContainText("138****5201");

  await page.getByTestId("sms-record-business-filter").selectOption("审核结果通知");
  await expect(page.getByTestId("sms-records")).toContainText("SMS_MOCK_REVIEW_001");

  await page.getByTestId("sms-record-date-filter").fill("2026-08-18");
  await expect(page.getByTestId("sms-records")).toContainText("当前筛选条件下没有发送记录");

  await page.getByTestId("sms-record-date-filter").fill("");
  await page.getByRole("button", { name: "发送测试短信" }).click();
  await expect(page.getByTestId("sms-test-feedback")).toContainText("测试短信已进入模拟发送");
});

test("PC07 replaces SMS credentials without exposing old or newly saved values", async ({ page }) => {
  await page.goto("/admin/settings/sms");

  await page.getByRole("button", { name: "编辑配置" }).click();
  await expect(page.getByTestId("sms-access-key")).toHaveCount(0);
  await expect(page.getByTestId("sms-secret-key")).toHaveCount(0);
  await expect(page.getByTestId("sms-access-key-replacement")).toHaveValue("");
  await expect(page.getByTestId("sms-secret-key-replacement")).toHaveValue("");

  await page.getByTestId("sms-access-key-replacement").fill("LTAI_REPLACEMENT_MOCK");
  await page.getByTestId("sms-secret-key-replacement").fill("SECRET_REPLACEMENT_MOCK");
  await page.getByRole("button", { name: "保存配置" }).click();

  await expect(page.getByTestId("sms-access-key-replacement")).toHaveCount(0);
  await expect(page.getByTestId("sms-secret-key-replacement")).toHaveCount(0);
  await expect(page.getByTestId("sms-access-key")).toHaveValue("LTAI••••••••MOCK");
  await expect(page.getByTestId("sms-secret-key")).toHaveValue("••••••••••••••••");
  await expect(page.getByTestId("sms-config-feedback")).toContainText("Access Key / Secret Key 已替换并重新掩码");
  await expect(page.getByText("SECRET_REPLACEMENT_MOCK", { exact: false })).toHaveCount(0);
});

test("PC07 keeps provider SMS templates separate from editable platform content templates", async ({ page }) => {
  await page.goto("/admin/settings/content-templates");

  await expect(page.getByRole("heading", { name: "内容模板", level: 1 })).toBeVisible();
  await expect(page.getByTestId("content-template-user-agreement")).toContainText("legal.user-agreement");
  await expect(page.getByTestId("content-template-privacy-policy")).toContainText("隐私政策");
  await expect(page.getByTestId("content-template-user-message")).toContainText("用户消息模板");
  await expect(page.getByTestId("content-template-system-notice")).toContainText("系统通知模板");
  await expect(page.getByText("SMS_MOCK_REVIEW_001")).toHaveCount(0);

  await page.getByRole("button", { name: "编辑用户协议" }).click();
  await expect(page.getByTestId("content-template-editor")).toBeVisible();
  await expect(page.getByRole("textbox", { name: "模板正文编辑器" })).toHaveValue(/核心产业学院用户协议/);

  await page.getByRole("button", { name: "发布模板" }).click();
  await expect(page.getByTestId("content-template-feedback")).toContainText("模板已发布到原型状态");
});

test("PC07 saving a published content template as draft changes its status to draft", async ({ page }) => {
  await page.goto("/admin/settings/content-templates");

  const userAgreement = page.getByTestId("content-template-user-agreement");
  await expect(userAgreement).toContainText("已发布");
  await page.getByRole("button", { name: "编辑用户协议" }).click();
  await page.getByRole("textbox", { name: "模板正文编辑器" }).fill("## 核心产业学院用户协议\n\n这是一次草稿修订。");
  await page.getByRole("button", { name: "保存草稿" }).click();

  await expect(page.getByTestId("content-template-feedback")).toContainText("模板草稿已保存到原型状态");
  await expect(userAgreement).toContainText("草稿");
  await expect(userAgreement).not.toContainText("已发布");
});

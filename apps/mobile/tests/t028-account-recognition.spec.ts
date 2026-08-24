import { expect, test } from "@playwright/test";

test("T028 historical account reuses the existing long-term account", async ({ page }) => {
  await page.goto("/auth/login?accountCase=history&returnTo=%2Fme%2Fnotifications");

  await expect(page.getByText("已命中历史账号", { exact: true })).toBeVisible();
  await expect(page.getByLabel("手机号")).toHaveValue("13800138000");
  await page.getByRole("button", { name: "发送验证码" }).click();
  await page.getByLabel("验证码").fill("123456");
  await page.getByRole("button", { name: "验证并继续" }).click();

  await expect(page).toHaveURL(/\/me\/notifications$/);
});

test("T028 captain-entered pre-account can be claimed without creating a second account", async ({ page }) => {
  await page.goto("/auth/login?accountCase=preaccount&returnTo=%2Fcompetitions%2Fmine");

  await expect(page.getByText("待认领账号", { exact: true })).toBeVisible();
  await expect(page.getByLabel("手机号")).toHaveValue("13700137000");
  await page.getByRole("button", { name: "发送验证码" }).click();
  await page.getByLabel("验证码").fill("123456");
  await page.getByRole("button", { name: "验证并认领账号" }).click();

  await expect(page).toHaveURL(/\/competitions\/mine$/);
});

test("T028 conflicting phone stops automatic account merge", async ({ page }) => {
  await page.goto("/auth/login?accountCase=conflict");

  await expect(page.getByText("账号冲突", { exact: true })).toBeVisible();
  await expect(page.getByLabel("手机号")).toHaveValue("13600136000");
  await page.getByRole("button", { name: "发送验证码" }).click();
  await page.getByLabel("验证码").fill("123456");
  await page.getByRole("button", { name: "登录", exact: true }).click();

  await expect(page.getByText(/当前原型不会自动合并/)).toBeVisible();
  await expect(page).toHaveURL(/\/auth\/login/);
});

test("T028 WeChat can recognize a captain-entered pre-account", async ({ page }) => {
  await page.goto("/auth/login?accountCase=preaccount&returnTo=%2Fhome");
  await page.getByRole("link", { name: "微信登录" }).click();
  await page.getByRole("button", { name: "同意微信授权" }).click();

  await expect(page.getByText(/队长代录的待认领账号/)).toBeVisible();
  await expect(page.getByText("7000")).toBeVisible();
  await page.getByRole("button", { name: "确认并认领" }).click();

  await expect(page).toHaveURL(/\/home$/);
});

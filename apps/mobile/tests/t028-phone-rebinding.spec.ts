import { expect, test } from "@playwright/test";

test("account security hub separates login credentials from long-term assets", async ({ page }) => {
  await page.goto("/me/accounts");
  await expect(page.getByRole("heading", { name: "账号与安全" })).toBeVisible();
  await expect(page.getByText(/登录方式可以变化，账号和资产不会跟着变化/)).toBeVisible();
  await expect(page.getByRole("link", { name: /登录手机号/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /业务平台账号/ })).toHaveAttribute("href", "/me/accounts/platforms");
});

test("active competition blocks ordinary self-service phone rebinding", async ({ page }) => {
  await page.goto("/me/accounts/phone?window=active");
  await expect(page.getByText("暂不可自助换绑", { exact: true })).toBeVisible();
  await expect(page.getByText(/App 其它功能仍可正常使用/)).toBeVisible();
  await expect(page.getByRole("button", { name: "原手机号不可用 / 紧急换绑" })).toBeVisible();
});

test("outside competition window can rebind phone without creating a new account", async ({ page }) => {
  await page.goto("/me/accounts/phone?window=outside");
  await expect(page.getByText("允许自助换绑", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "开始更换手机号" }).click();

  await page.getByLabel("当前手机号验证码").fill("123456");
  await page.getByRole("button", { name: "验证当前手机号" }).click();

  await page.getByLabel("新手机号").fill("13500135000");
  await page.getByRole("button", { name: "发送验证码" }).click();
  await page.getByLabel("新手机号验证码").fill("123456");
  await page.getByRole("button", { name: "确认更换手机号" }).click();

  await expect(page.getByText(/手机号已更新为 135 \*\*\*\* 5000/)).toBeVisible();
  await expect(page.getByText(/长期 userId、赛事身份、课程、权益、证书和简历均保持原归属/)).toBeVisible();
});

test("new phone already occupied never auto-merges long-term accounts", async ({ page }) => {
  await page.goto("/me/accounts/phone?window=outside");
  await page.getByRole("button", { name: "开始更换手机号" }).click();
  await page.getByLabel("当前手机号验证码").fill("123456");
  await page.getByRole("button", { name: "验证当前手机号" }).click();
  await page.getByLabel("新手机号").fill("13600136000");
  await page.getByLabel("新手机号验证码").fill("123456");
  await page.getByRole("button", { name: "确认更换手机号" }).click();

  await expect(page.getByText("不能自动合并两个长期账号", { exact: true })).toBeVisible();
  await expect(page.getByText(/当前账号、赛事身份、证书、课程与简历保持不变/)).toBeVisible();
  await expect(page.getByRole("link", { name: "申请人工核验" })).toBeVisible();
});

test("lost old phone falls back to manual account recovery", async ({ page }) => {
  await page.goto("/me/accounts/phone?window=outside");
  await page.getByRole("button", { name: "开始更换手机号" }).click();
  await page.getByRole("button", { name: "无法使用当前手机号" }).click();

  await expect(page.getByText("需要先确认账号归属", { exact: true })).toBeVisible();
  await expect(page.getByText(/已绑定微信、赛事实名信息、学校 \/ 学号、已验证邮箱/)).toBeVisible();
  await expect(page.getByRole("link", { name: "联系人工客服" })).toHaveAttribute("href", "/support/chat");
});

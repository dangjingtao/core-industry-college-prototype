import { expect, test } from "@playwright/test";

test("T015 welcome only exposes account entry", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/welcome$/);
  await expect(page.getByRole("heading", { name: "从一次比赛，走向更长的成长路径" })).toBeVisible();

  await page.getByRole("button", { name: "登录 / 注册" }).click();
  await page.getByLabel("手机号或邮箱").fill("student@example.com");
  await page.getByLabel("密码", { exact: true }).fill("prototype123");
  await page.getByRole("button", { name: "登录", exact: true }).click();
  await expect(page).toHaveURL(/\/home$/);

  await page.goto("/welcome");
  await expect(page.getByText(/游客/)).toHaveCount(0);
});

test("T015 phone + code registration auto-logs in and preserves returnTo", async ({ page }) => {
  await page.goto("/auth/register?returnTo=%2Fopportunities%2Fintern-1");
  await expect(page.getByRole("heading", { name: "原型账号验证" })).toBeVisible();
  await page.getByLabel("手机号").fill("13900139000");
  await page.getByRole("button", { name: "发送验证码" }).click();
  await page.getByLabel("验证码").fill("123456");
  await page.getByRole("button", { name: "注册并自动登录" }).click();

  await expect(page.getByRole("heading", { name: "完善基础资料", exact: true })).toBeVisible();
  await expect(page.getByLabel("手机号")).toHaveValue("13900139000");
  await page.getByLabel("昵称").fill("新同学");
  await page.getByLabel("学校").fill("华南商贸学院");
  await page.getByLabel("专业").fill("电子商务");
  await page.getByLabel("所在地区").fill("广州");
  await page.getByLabel("身份类型").selectOption("undergraduate");
  await page.getByRole("button", { name: "保存并继续" }).click();
  await page.getByRole("button", { name: "暂时跳过" }).click();
  await expect(page.getByText("新同学，先从比赛或机会开始", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "继续之前的操作" }).click();

  await expect(page).toHaveURL(/\/opportunities\/intern-1$/);
  await page.evaluate(() => {
    window.history.pushState({}, "", "/assets/experiences");
    window.dispatchEvent(new PopStateEvent("popstate"));
  });
  await expect(page.getByText("当前账号还没有赛事经历。", { exact: true })).toBeVisible();
});

test("T015 supports code login, password reset, and logout handoff", async ({ page }) => {
  await page.goto("/auth/login?returnTo=%2Fme%2Fnotifications");
  await page.getByRole("button", { name: "验证码登录" }).click();
  await page.getByLabel("手机号或邮箱").fill("13800138000");
  await page.getByRole("button", { name: "发送验证码" }).click();
  await page.getByLabel("验证码").fill("123456");
  await page.getByRole("button", { name: "登录", exact: true }).click();
  await expect(page).toHaveURL(/\/me\/notifications$/);

  await page.goto("/auth/forgot-password");
  await page.getByLabel("手机号或邮箱").fill("student@example.com");
  await page.getByRole("button", { name: "发送验证码" }).click();
  await page.getByLabel("验证码").fill("123456");
  await page.getByLabel("新密码", { exact: true }).fill("resetpass123");
  await page.getByLabel("确认新密码", { exact: true }).fill("resetpass123");
  await page.getByRole("button", { name: "确认重置" }).click();
  await expect(page.getByText("密码已重置", { exact: true })).toBeVisible();

  await page.goto("/me");
  await page.getByRole("button", { name: "退出登录" }).click();
  await page.getByRole("button", { name: "确认退出" }).click();
  await expect(page).toHaveURL(/\/auth\/login$/);
});

test("T015 new WeChat user walks full authorize -> phone flow before onboarding", async ({ page }) => {
  await page.goto("/auth/login?returnTo=%2Fopportunities%2Fintern-1");
  await page.getByRole("link", { name: "微信登录" }).click();
  await expect(page).toHaveURL(/\/auth\/wechat\/authorize/);
  await expect(page.getByRole("heading", { name: "使用微信身份继续" })).toBeVisible();

  await page.getByRole("button", { name: "同意微信授权" }).click();
  await expect(page).toHaveURL(/\/auth\/wechat\/phone/);
  await expect(page.getByRole("heading", { name: "允许获取你的手机号" })).toBeVisible();
  await expect(page.getByText("9000")).toBeVisible();
  await expect(page.getByText("尚未注册")).toBeVisible();

  await page.getByRole("button", { name: "允许获取手机号" }).click();
  await expect(page).toHaveURL(/\/onboarding\/profile/);
  await expect(page.getByLabel("手机号")).toHaveValue("13900139000");
});

test("T015 existing WeChat account logs in and returns to requested page", async ({ page }) => {
  await page.goto("/auth/login?wechatAccount=existing&returnTo=%2Fme%2Fnotifications");
  await page.getByRole("link", { name: "微信登录" }).click();
  await expect(page).toHaveURL(/\/auth\/wechat\/authorize\?/);

  await page.getByRole("button", { name: "同意微信授权" }).click();
  await expect(page).toHaveURL(/\/auth\/wechat\/phone/);
  await expect(page.getByText("8000")).toBeVisible();
  await expect(page.getByText("已注册")).toBeVisible();

  await page.getByRole("button", { name: "允许获取手机号" }).click();
  await expect(page).toHaveURL(/\/me\/notifications$/);
});

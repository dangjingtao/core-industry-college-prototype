import { expect, test } from "@playwright/test";

test("T014 我的页 exposes legacy service entries and new prototype routes", async ({ page }) => {
  await page.goto("/me");
  await expect(page.getByRole("link", { name: /我的卡包/ })).toHaveAttribute("href", "/benefits/wallet");
  await expect(page.getByRole("link", { name: /比赛团队/ })).toHaveAttribute("href", "/me/teams");
  await expect(page.getByRole("link", { name: /设置中心/ })).toHaveAttribute("href", "/me/settings");

  await page.goto("/me/teams");
  await expect(page.getByRole("heading", { name: "比赛团队", exact: true })).toBeVisible();
  await expect(page.getByText("山城新零售队", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: /山城新零售队/ }).click();
  await expect(page).toHaveURL(/\/me\/teams\/sanchuang-16$/);
  await expect(page.getByText("团队成员", { exact: true })).toBeVisible();

  await page.goto("/me/settings");
  await page.getByRole("button", { name: "保存设置" }).click();
  await expect(page.getByText("原型设置已保存", { exact: true })).toBeVisible();

  await page.goto("/me/feedback");
  await page.getByPlaceholder("请描述你的建议或遇到的问题").fill("希望能更快看到赛事审核进度。");
  await page.getByRole("button", { name: "提交反馈" }).click();
  await expect(page.getByText("反馈已提交，感谢你的建议。", { exact: true })).toBeVisible();
});

test("T014 我的页 已精简为入口列表 + 摘要行，移除 3 个杂碎 Section", async ({ page }) => {
  await page.goto("/me");

  const summary = page.getByRole("link", { name: /段经历 · .* 张证书 · .* 份投递 · 关注 .* 家企业/ });
  await expect(summary).toBeVisible();
  await expect(summary).toHaveAttribute("href", "/assets");

  const entries = [
    ["长期资产", "/assets"],
    ["我的卡包", "/benefits/wallet"],
    ["消息通知", "/me/notifications"],
    ["比赛团队", "/me/teams"],
    ["账号绑定", "/me/accounts"],
    ["设置中心", "/me/settings"],
    ["帮助与客服", "/support"],
  ];
  for (const [label, href] of entries) {
    await expect(page.getByRole("link", { name: new RegExp("^" + label + "$"), exact: true })).toHaveAttribute("href", href);
  }

  await expect(page.getByText("这个账号已经沉淀了什么")).toHaveCount(0);
  await expect(page.getByText("继续使用", { exact: true })).toHaveCount(0);
  await expect(page.getByText("长期关系", { exact: true })).toHaveCount(0);

  await expect(page.getByRole("button", { name: "退出登录" })).toBeVisible();

  await summary.click();
  await expect(page).toHaveURL(/\/assets$/);
  await expect(page.getByRole("heading", { name: "长期资产", exact: true })).toBeVisible();
});
  await expect(summary).toBeVisible();
  await expect(summary).toHaveAttribute("href", "/assets");

  const serviceLinks = page.getByRole("link", { name: /^(长期资产|我的卡包|消息通知|比赛团队|账号绑定|设置中心|帮助与客服)$/ });
  await expect(serviceLinks).toHaveCount(7);
  await expect(page.getByRole("link", { name: "长期资产", exact: true })).toHaveAttribute("href", "/assets");

  await expect(page.getByText("这个账号已经沉淀了什么")).toHaveCount(0);
  await expect(page.getByText("继续使用", { exact: true })).toHaveCount(0);
  await expect(page.getByText("长期关系", { exact: true })).toHaveCount(0);

  await expect(page.getByRole("button", { name: "退出登录" })).toBeVisible();

  await summary.click();
  await expect(page).toHaveURL(/\/assets$/);
  await expect(page.getByRole("heading", { name: "长期资产", exact: true })).toBeVisible();
});

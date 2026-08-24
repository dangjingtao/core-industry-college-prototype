import { expect, test } from "@playwright/test";

test("T028 school review gates ordinary member account creation", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/registration-portal/start");

  await page.getByRole("button", { name: "我是队长，开始报名" }).click();
  await page.getByRole("button", { name: "登录并继续报名" }).click();
  await page.getByRole("button", { name: /B\. 学校审核团队通过后/ }).click();
  await page.getByRole("button", { name: "提交答题" }).click();
  await page.getByRole("button", { name: "进入团队报名" }).click();

  await page.getByRole("button", { name: "录入成员" }).click();
  const addSample = page.getByRole("button", { name: "加入此状态样例" });
  await addSample.nth(0).click();
  await addSample.nth(0).click();
  await page.getByRole("button", { name: "保存成员并返回" }).click();

  await expect(page.getByText(/已有账号 · 审核通过后绑定/)).toBeVisible();
  await expect(page.getByText(/未注册 · 审核通过后创建/)).toBeVisible();
  await page.getByRole("button", { name: "提交团队进入学校审核" }).click();

  await expect(page.getByText("当前账号写操作：0 个新账号、0 个赛事身份绑定。", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "模拟审核通过" }).click();

  await expect(page.getByText(/已创建 1 个待激活账号/)).toBeVisible();
  await expect(page.getByText(/已为 1 个已有账号绑定本次赛事身份/)).toBeVisible();
});

test("T028 account-resolution anomaly does not invalidate school review", async ({ page }) => {
  await page.goto("/registration-portal/start");
  await page.getByText("报名原型状态").click();
  await page.getByRole("button", { name: "队长草稿" }).click();
  await page.getByRole("button", { name: "录入成员" }).click();

  const addSample = page.getByRole("button", { name: "加入此状态样例" });
  await addSample.nth(2).click();
  await page.getByRole("button", { name: "保存成员并返回" }).click();

  await expect(page.getByText(/账号解析异常样例/)).toBeVisible();
  await expect(page.getByRole("button", { name: "提交团队进入学校审核" })).toBeEnabled();
  await page.getByRole("button", { name: "提交团队进入学校审核" }).click();
  await page.getByRole("button", { name: "模拟审核通过" }).click();

  await expect(page.getByText(/进入人工账号补偿/)).toBeVisible();
  await expect(page.getByText(/团队审核结论不因此失效/)).toBeVisible();
});

test("T028 removal language keeps long-lived app account independent", async ({ page }) => {
  await page.goto("/registration-portal/start");
  await page.getByText("报名原型状态").click();
  await page.getByRole("button", { name: "待审核" }).click();

  await expect(page.getByText(/减员审核通过后只回收本赛事团队 \/ 工作区权限/)).toBeVisible();
  await expect(page.getByText(/长期账号、手机号绑定、其它赛事身份与长期资产继续保留/)).toBeVisible();
});

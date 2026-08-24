import { expect, test } from "@playwright/test";

test("member accounts stay unresolved until school approval", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/registration-portal/start");
  await expect(page.getByRole("heading", { name: "三创赛报名", level: 1 })).toBeVisible();

  await page.getByRole("button", { name: "我是队长，开始报名" }).click();
  await page.getByRole("button", { name: "登录并继续报名" }).click();
  await page.getByRole("button", { name: /B\./ }).click();
  await page.getByRole("button", { name: "提交答题" }).click();
  await page.getByRole("button", { name: "进入团队报名" }).click();

  await page.getByRole("button", { name: "录入成员" }).click();
  const sampleButtons = page.getByRole("button", { name: "加入此状态样例" });
  await sampleButtons.nth(0).click();
  await sampleButtons.nth(0).click();
  await page.getByRole("button", { name: "保存成员并返回" }).click();

  await expect(page.getByText(/已有账号/).first()).toBeVisible();
  await expect(page.getByText(/未注册/).first()).toBeVisible();
  await page.getByRole("button", { name: /提交/ }).last().click();

  await expect(page.getByText("团队已提交，等待学校审核真实性", { exact: true })).toBeVisible();
  await expect(page.getByText(/0 名未注册队员已预开通核心学院账号/)).toBeVisible();
  await expect(page.getByText(/0 名成员已关联本次赛事身份/)).toBeVisible();

  await page.getByRole("button", { name: "模拟审核通过" }).click();
  await page.getByRole("button", { name: "填写承诺书" }).click();
  await expect(page.getByRole("heading", { name: "承诺书", level: 1 })).toBeVisible();

  await page.goto("/registration-portal/team");
  await expect(page.getByText("账号已开通，待本人认领", { exact: true })).toBeVisible();
  await expect(page.getByText("已有账号，赛事身份已绑定", { exact: true })).toBeVisible();
});

test("account lookup anomaly does not silently bind an existing account", async ({ page }) => {
  await page.goto("/registration-portal/start");
  await page.getByText("报名原型状态").click();
  await page.getByRole("button", { name: "队长草稿" }).click();
  await page.getByRole("button", { name: "录入成员" }).click();

  const sampleButtons = page.getByRole("button", { name: "加入此状态样例" });
  await sampleButtons.nth(2).click();
  await page.getByRole("button", { name: "保存成员并返回" }).click();

  await expect(page.getByText(/冲突|核验/).first()).toBeVisible();
});

test("team removal keeps long-lived app account independent", async ({ page }) => {
  await page.goto("/registration-portal/start");
  await page.getByText("报名原型状态").click();
  await page.getByRole("button", { name: "待审核" }).click();

  await expect(page.getByText("减员只改变本赛事团队关系", { exact: true })).toBeVisible();
  await expect(page.getByText(/核心学院账号、手机号绑定、其它赛事身份与长期资产继续保留/)).toBeVisible();
});

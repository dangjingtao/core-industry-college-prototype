import { expect, test } from "@playwright/test";

test("leader submits team and member accounts are resolved automatically", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/registration-portal/start");
  await expect(page.getByRole("heading", { name: "三创赛报名", level: 1 })).toBeVisible();

  await page.getByRole("button", { name: "我是队长，开始报名" }).click();
  await expect(page.getByRole("heading", { name: "队长账号", level: 1 })).toBeVisible();
  await page.getByRole("button", { name: "登录并继续报名" }).click();

  await expect(page.getByRole("heading", { name: "赛事规则确认", level: 1 })).toBeVisible();
  await page.getByRole("button", { name: /B\. 未注册自动预开通/ }).click();
  await page.getByRole("button", { name: "提交答题" }).click();

  await expect(page.getByRole("heading", { name: "队长账号已就绪", level: 1 })).toBeVisible();
  await page.getByRole("button", { name: "进入团队报名" }).click();
  await expect(page.getByRole("heading", { name: "团队信息", level: 1 })).toBeVisible();

  await page.getByRole("button", { name: "录入成员" }).click();
  await expect(page.getByRole("heading", { name: "录入团队成员", level: 1 })).toBeVisible();
  const sampleButtons = page.getByRole("button", { name: "加入此状态样例" });
  await sampleButtons.nth(0).click();
  await sampleButtons.nth(1).click();
  await page.getByRole("button", { name: "保存成员并返回" }).click();

  await expect(page.getByText("已有账号，提交后绑定赛事身份", { exact: true })).toBeVisible();
  await expect(page.getByText("未注册，提交后自动开通", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "提交团队并处理成员账号" }).click();

  await expect(page.getByText(/未注册队员已预开通核心学院账号/)).toBeVisible();
  await expect(page.getByText(/成员已关联本次赛事身份/)).toBeVisible();
  await page.getByRole("button", { name: "模拟审核通过" }).click();
  await expect(page.getByText(/成员长期账号继续独立存在/)).toBeVisible();
  await page.getByRole("button", { name: "填写承诺书" }).click();

  await expect(page.getByRole("heading", { name: "承诺书", level: 1 })).toBeVisible();
  await page.getByRole("button", { name: "生成承诺书" }).click();
  await page.getByRole("button", { name: "确认承诺书并完成报名" }).click();
  await expect(page.getByText(/队员的核心学院账号属于长期账号/)).toBeVisible();
});

test("phone and identity conflict blocks silent competition binding", async ({ page }) => {
  await page.goto("/registration-portal/start");
  await page.getByText("报名原型状态").click();
  await page.getByRole("button", { name: "队长草稿" }).click();
  await page.getByRole("button", { name: "录入成员" }).click();

  const sampleButtons = page.getByRole("button", { name: "加入此状态样例" });
  await sampleButtons.nth(2).click();
  await page.getByRole("button", { name: "保存成员并返回" }).click();

  await expect(page.getByText("身份冲突，需核验", { exact: true })).toBeVisible();
  await expect(page.getByText(/系统不会仅凭手机号把赛事身份绑定给可能错误的账号/)).toBeVisible();
  await expect(page.getByRole("button", { name: "提交团队并处理成员账号" })).toBeDisabled();
});

test("team removal copy keeps long-lived app account independent", async ({ page }) => {
  await page.goto("/registration-portal/start");
  await page.getByText("报名原型状态").click();
  await page.getByRole("button", { name: "待审核" }).click();

  await expect(page.getByText("减员只改变本赛事团队关系", { exact: true })).toBeVisible();
  await expect(page.getByText(/核心学院账号、手机号绑定、其它赛事身份与长期资产继续保留/)).toBeVisible();
});

test("mobile handoff preserves competition context with leader PC flow", async ({ page }) => {
  const returnTo = "https://mobile.example.test/competitions/sanchuang-16/registration";
  const query = new URLSearchParams({
    competitionId: "sanchuang-16",
    returnTo,
    source: "mobile-app",
    accountContext: "current-student-prototype-session",
  });
  await page.goto(`/registration-portal/start?${query.toString()}`);
  await expect(page.getByRole("button", { name: "返回 App / 赛事" })).toBeVisible();

  await page.getByText("报名原型状态").click();
  await page.getByRole("button", { name: "待审核" }).click();

  await page.route("https://mobile.example.test/**", route => route.abort());
  const callbackRequest = page.waitForRequest(request => request.url().startsWith(returnTo));
  await page.getByRole("button", { name: "返回 App / 赛事" }).click();
  const request = await callbackRequest;
  const callbackUrl = new URL(request.url());
  expect(callbackUrl.searchParams.get("handoff")).toBe("registration-portal");
  expect(callbackUrl.searchParams.get("registrationCompetitionId")).toBe("sanchuang-16");
  expect(callbackUrl.searchParams.get("registrationStatus")).toBe("pending");
  expect(callbackUrl.searchParams.get("registrationSource")).toBe("pc-registration-portal");
});

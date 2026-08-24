import { expect, test } from "@playwright/test";

const snapshotKey = "core.mobile.registration-handoff.account-snapshot";

test("T029 Mobile fallback enters captain PC registration and returns pending state", async ({ page }) => {
  await page.goto("/home");
  await page.getByRole("button", { name: /原型账号：多赛事身份/ }).click();
  await expect(page.getByRole("button", { name: /原型账号：无赛事身份/ })).toBeVisible();

  await page.getByRole("button", { name: "发现比赛" }).click();
  await page.getByRole("link", { name: /第十六届全国大学生电子商务/ }).click();
  await page.getByRole("button", { name: "进入报名" }).click();

  await expect(page.getByText(/PC 主报名/)).toBeVisible();
  await expect(page.getByText(/不再维护第二套原生报名长表单/)).toBeVisible();

  await Promise.all([
    page.waitForURL(url => url.origin === "http://127.0.0.1:5174" && url.pathname === "/registration-portal/start"),
    page.getByRole("button", { name: "打开响应式报名门户" }).click(),
  ]);

  expect(page.url()).toContain("competitionId=sanchuang-16");
  await page.getByRole("button", { name: "我是队长，开始报名" }).click();
  await expect(page.getByRole("heading", { name: "队长账号", level: 1 })).toBeVisible();
  await page.getByRole("button", { name: "登录并继续报名" }).click();

  await expect(page.getByRole("heading", { name: "赛事规则确认", level: 1 })).toBeVisible();
  await page.getByRole("button", { name: /B\. 学校审核团队通过后/ }).click();
  await page.getByRole("button", { name: "提交答题" }).click();

  await page.getByRole("button", { name: "进入团队报名" }).click();
  await page.getByRole("button", { name: "录入成员" }).click();
  await page.getByRole("button", { name: "加入此状态样例" }).first().click();
  await page.getByRole("button", { name: "保存成员并返回" }).click();
  await page.getByRole("button", { name: "提交团队进入学校审核" }).click();
  await expect(page.getByText(/当前账号写操作：0 个新账号、0 个赛事身份绑定/)).toBeVisible();

  await Promise.all([
    page.waitForURL(url => url.origin === "http://127.0.0.1:5173" && url.pathname === "/competitions/sanchuang-16/registration"),
    page.getByTestId("return-to-app").click(),
  ]);

  await expect(page.getByText(/团队已提交，等待学校审核/).first()).toBeVisible();
  await expect.poll(() => new URL(page.url()).searchParams.has("registrationStatus")).toBe(false);
  await expect.poll(() => page.evaluate(key => window.sessionStorage.getItem(key), snapshotKey)).toBeNull();

  await page.evaluate(() => {
    window.history.pushState({}, "", "/competitions/mine");
    window.dispatchEvent(new PopStateEvent("popstate"));
  });
  await expect(page.getByRole("heading", { name: "我的赛事", exact: true })).toBeVisible();
  await expect(page.getByText(/第十六届全国大学生电子商务/)).toBeVisible();
  await expect(page.getByText("pending", { exact: true })).toBeVisible();
});

test("T029 school approval locks roster but keeps formal competition identity pending", async ({ page }) => {
  await page.goto("/home");
  await page.getByRole("button", { name: /原型账号：多赛事身份/ }).click();
  await expect(page.getByRole("button", { name: /原型账号：无赛事身份/ })).toBeVisible();

  await page.evaluate(() => {
    window.history.pushState({}, "", "/competitions/sanchuang-16/registration?handoff=registration-portal&registrationCompetitionId=sanchuang-16&registrationStatus=approved&registrationSource=pc-registration-portal");
    window.dispatchEvent(new PopStateEvent("popstate"));
  });

  await expect(page.getByText("学校审核通过，等待外部官方资格确认", { exact: true })).toBeVisible();
  await expect(page.getByText(/正式 CompetitionIdentity 仍为 pending/)).toBeVisible();

  await page.getByRole("button", { name: "验证工作区仍受限" }).click();
  await expect(page.getByText("学校审核已通过，等待赛事资格确认", { exact: true })).toBeVisible();
  await expect(page.getByText(/正式赛事工作区不会提前开放/)).toBeVisible();
});

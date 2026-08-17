import { expect, test } from "@playwright/test";

const snapshotKey = "core.mobile.registration-handoff.account-snapshot";

test("F00 real Mobile -> PC -> Mobile handoff preserves the no-identity account snapshot", async ({ page }) => {
  await page.goto("/home");
  await page.getByRole("button", { name: /原型账号：多赛事身份/ }).click();
  await expect(page.getByRole("button", { name: /原型账号：无赛事身份/ })).toBeVisible();

  await page.getByRole("button", { name: "发现比赛" }).click();
  await page.getByRole("link", { name: /第十六届全国大学生电子商务/ }).click();
  await page.getByRole("button", { name: "进入报名" }).click();

  await Promise.all([
    page.waitForURL(url => url.origin === "http://127.0.0.1:5174" && url.pathname === "/registration-portal/start"),
    page.getByRole("button", { name: "打开响应式报名门户" }).click(),
  ]);

  expect(page.url()).toContain("competitionId=sanchuang-16");
  await page.getByRole("button", { name: /我是队员/ }).click();
  await expect(page.getByRole("heading", { name: "三创队员注册", level: 1 })).toBeVisible();
  await page.getByRole("button", { name: "注册并进入答题" }).click();
  await page.getByRole("button", { name: /B\. 等待审核结果/ }).click();
  await page.getByRole("button", { name: "提交答题" }).click();
  await expect(page.getByText("注册成功，请等待队长绑定团队信息", { exact: true })).toBeVisible();

  await Promise.all([
    page.waitForURL(url => url.origin === "http://127.0.0.1:5173" && url.pathname === "/competitions/sanchuang-16/registration"),
    page.getByTestId("return-to-app").click(),
  ]);

  await expect(page.getByText("报名已提交，等待学校审核真实性", { exact: true })).toBeVisible();
  await expect.poll(() => new URL(page.url()).searchParams.has("registrationStatus")).toBe(false);
  await expect.poll(() => page.evaluate(key => window.sessionStorage.getItem(key), snapshotKey)).toBeNull();

  await page.getByRole("button", { name: "返回赛事详情" }).click();
  await page.getByRole("button", { name: "查看我的赛事" }).click();
  await expect(page.getByRole("heading", { name: "我的赛事", exact: true })).toBeVisible();
  await expect(page.getByText(/第十六届全国大学生电子商务/)).toBeVisible();
  await expect(page.getByText("pending", { exact: true })).toBeVisible();
  await expect(page.getByText("2026 青年品牌创新挑战赛", { exact: true })).toHaveCount(0);
  await expect(page.getByText("第十五届三创赛", { exact: true })).toHaveCount(0);
});

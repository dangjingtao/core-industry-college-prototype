import { expect, test } from "@playwright/test";

test("T028 unclaimed competition account requires explicit activation", async ({ page }) => {
  await page.goto("/auth/competition-account?case=unclaimed");

  await expect(page.getByRole("heading", { name: "赛事报名已为你创建待激活账号" })).toBeVisible();
  await expect(page.getByText(/未激活前，不默认开启课程推荐、就业画像或营销订阅/)).toBeVisible();
  await expect(page.getByRole("button", { name: "确认并激活账号" })).toBeDisabled();

  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "确认并激活账号" }).click();
  await expect(page.getByText("账号已激活", { exact: true })).toBeVisible();
  await expect(page.getByText(/同一个手机号和 userId/)).toBeVisible();
});

test("T028 existing account can confirm a newly attached competition identity", async ({ page }) => {
  await page.goto("/auth/competition-account?case=existing");

  await expect(page.getByRole("heading", { name: "你的账号已关联新的赛事身份" })).toBeVisible();
  await expect(page.getByText(/学校已经审核通过的团队报名/)).toBeVisible();
  await page.getByRole("button", { name: "确认是我的参赛信息" }).click();
  await expect(page.getByText("赛事身份已确认", { exact: true })).toBeVisible();
});

test("T028 wrong competition identity enters disputed state without disabling other app abilities", async ({ page }) => {
  await page.goto("/auth/competition-account?case=existing");
  await page.getByRole("button", { name: "这不是我的参赛信息" }).click();

  await expect(page.getByRole("heading", { name: "已记录“这不是我的参赛信息”" })).toBeVisible();
  await expect(page.getByText(/不会影响你使用其它赛事、课程、权益和长期账号/)).toBeVisible();
  await expect(page.getByText(/暂不允许以该赛事身份提交新材料/)).toBeVisible();
});

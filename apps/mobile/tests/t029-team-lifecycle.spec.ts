import { expect, test } from "@playwright/test";

test("T029 competition workspace exposes reduction only, without add replace or proof upload", async ({ page }) => {
  await page.goto("/competitions/sanchuang-16/workspace/team");

  await expect(page.getByRole("heading", { name: "我的团队", exact: true })).toBeVisible();
  await expect(page.getByText("赛事期团队维护", { exact: true })).toBeVisible();
  await expect(page.getByLabel("涉及成员")).toBeVisible();
  await expect(page.getByLabel("申请原因")).toBeVisible();
  await expect(page.getByRole("button", { name: "提交减员申请" })).toBeVisible();

  await expect(page.getByRole("button", { name: /添加成员|增员|替换成员/ })).toHaveCount(0);
  await expect(page.locator('input[type="file"]')).toHaveCount(0);
  await expect(page.getByText(/上传.*申请|上传.*证明/)).toHaveCount(0);
});

test("T029 pending reduction does not mutate the current team fact", async ({ page }) => {
  await page.goto("/competitions/sanchuang-16/workspace/team");

  await page.getByLabel("涉及成员").selectOption({ label: "陈语 · 内容运营" });
  await page.getByLabel("申请原因").fill("成员后续无法继续参赛，申请按赛事规则办理减员。");
  await page.getByRole("button", { name: "提交减员申请" }).click();

  await expect(page.getByText("待老师 / 运营审核", { exact: true })).toBeVisible();
  await expect(page.getByText(/审核通过前不会直接改动团队成员/)).toBeVisible();
  await expect(page.getByText("陈语", { exact: true }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "提交减员申请" })).toHaveCount(0);
});

test("T029 ended competition does not expose a new reduction form", async ({ page }) => {
  await page.goto("/competitions/sanchuang-15/workspace/team");

  await expect(page.getByRole("button", { name: "提交减员申请" })).toHaveCount(0);
  await expect(page.getByLabel("申请原因")).toHaveCount(0);
});

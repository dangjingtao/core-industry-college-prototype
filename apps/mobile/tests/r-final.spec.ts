import { expect, test } from "@playwright/test";

test("R-Final revoked competition keeps long-term asset handoff", async ({ page }) => {
  await page.goto("/competitions/sanchuang-16");
  await page.getByText("T03 生命周期状态", { exact: true }).click();
  await page.getByRole("button", { name: "revoked", exact: true }).click();
  await page.goto("/competitions/sanchuang-16/workspace");
  await expect(page.getByText("赛事期权限已回收", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "查看参赛经历" })).toBeVisible();
  await expect(page.getByRole("button", { name: "查看成绩与证书" })).toBeVisible();
});

test("R-Final permissionDenied blocks workspace without revoking identity", async ({ page }) => {
  await page.goto("/competitions/sanchuang-16");
  await page.getByText("T03 生命周期状态", { exact: true }).click();
  await page.getByRole("button", { name: "permissionDenied: false", exact: true }).click();
  await page.getByRole("button", { name: "进入赛事工作区" }).click();
  await expect(page.getByText("当前赛事权限不足", { exact: true })).toBeVisible();
  await expect(page.getByText(/账号拥有赛事身份/)).toBeVisible();
});

test("R-Final company business tab keeps the trusted entity layer complete", async ({ page }) => {
  await page.goto("/companies/northstar-beauty?tab=business");
  await expect(page.getByRole("heading", { name: "企业详情", exact: true })).toBeVisible();
  await expect(page.getByText("工商登记信息", { exact: true })).toBeVisible();
  for (const label of [
    "法定代表人",
    "注册资本",
    "经营状态",
    "成立日期",
    "企业类型",
    "所属行业",
    "所属地区",
    "统一社会信用代码",
    "注册地址",
    "经营范围",
  ]) {
    await expect(page.getByText(label, { exact: true })).toBeVisible();
  }
  await expect(page.getByText(/当前内容为原型 Mock 数据/)).toBeVisible();
});

test("R-Final D08 remains explicitly blocked instead of inventing subject management", async ({ page }) => {
  await page.goto("/me/subjects");
  await expect(page.getByRole("heading", { name: "主体管理", exact: true })).toBeVisible();
  await expect(page.getByText("待产品决策 · D08", { exact: true })).toBeVisible();
  await expect(page.getByText("暂不实现产品交互", { exact: true })).toBeVisible();
});

import { expect, test } from "@playwright/test";

test("F003 logout requires confirmation and returns to login", async ({ page }) => {
  await page.goto("/me");
  await page.getByRole("button", { name: "退出登录" }).click();
  await expect(page.getByRole("heading", { name: "退出登录", exact: true })).toBeVisible();
  await expect(page.getByText(/长期账号资产不会被删除/)).toBeVisible();
  await page.getByRole("button", { name: "确认退出" }).click();
  await expect(page).toHaveURL(/\/auth\/login$/);
  await expect(page.getByRole("heading", { name: "登录", exact: true })).toBeVisible();
});

test("F003 resume keeps structured education and opportunity returnTo", async ({ page }) => {
  await page.goto("/me/resume/education?returnTo=%2Fopportunities%2Fintern-1");
  await page.getByLabel("入学时间").fill("2022-09");
  await page.getByLabel("结束时间").fill("2026-06");
  await page.getByLabel("毕业时间").fill("2026-06");
  await page.getByLabel("主修课程").fill("消费者行为学、数据分析、供应链管理");
  await page.getByLabel("在校经历").fill("参与创新创业赛事和企业实践，负责用户调研与运营复盘。");
  await page.getByRole("button", { name: "保存教育经历" }).click();
  await expect(page.getByRole("heading", { name: "长期简历", exact: true })).toBeVisible();
  await expect(page.getByText("2022-09 至 2026-06 · 预计毕业 2026-06", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "返回机会继续投递" })).toBeVisible();
});

test("F003 competition-period team reduction persists pending without mutating members", async ({ page }) => {
  await page.goto("/competitions/sanchuang-16/workspace/team");
  await page.getByLabel("涉及成员").selectOption({ label: "陈语 · 内容运营" });
  await page.getByLabel("申请原因").fill("成员实习时间冲突，申请按赛事规则办理减员。");
  await page.getByRole("button", { name: "提交减员申请" }).click();
  await expect(page.getByText("待老师 / 运营审核", { exact: true })).toBeVisible();
  await expect(page.getByText(/审核通过前不会直接改动团队成员/)).toBeVisible();
  await expect(page.getByText("陈语", { exact: true }).first()).toBeVisible();

  await page.getByRole("button", { name: "返回" }).click();
  await expect(page.getByRole("heading", { name: "赛事工作区", exact: true })).toBeVisible();
  await page.getByRole("button", { name: /山城新零售队/ }).click();
  await expect(page.getByRole("heading", { name: "我的团队", exact: true })).toBeVisible();
  await expect(page.getByText("待老师 / 运营审核", { exact: true })).toBeVisible();
  await expect(page.getByText(/涉及成员：陈语/)).toBeVisible();
  await expect(page.getByText("陈语", { exact: true }).first()).toBeVisible();
});

test("F003 resource local save creates a browser download", async ({ page }) => {
  await page.goto("/competitions/sanchuang-16/workspace/resources/rules-2026");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "保存到本地" }).click();
  const download = await downloadPromise;
  expect(await download.suggestedFilename()).toContain("第十六届三创赛参赛规则");
  await expect(page.getByText("本地文件已生成", { exact: true })).toBeVisible();
});

test("F003 external content support and course sharing expose real handoffs", async ({ page }) => {
  await page.goto("/stories/wechat-story");
  await expect(page).toHaveURL(/\/stories\/wechat-story$/);
  await expect(page.getByText("404 / dead-link", { exact: true })).toHaveCount(0);

  await page.goto("/support/chat");
  await page.getByRole("button", { name: "请求人工客服" }).click();
  await expect(page.getByText(/人工渠道：企业微信福利官/).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /打开企业微信入口/ }).first()).toHaveAttribute("href", /work\.weixin\.qq\.com/);

  await page.addInitScript(() => {
    Object.defineProperty(navigator, "share", { configurable: true, value: async () => undefined });
  });
  await page.goto("/courses/data-analytics");
  await page.getByRole("button", { name: "分享" }).click();
  await expect(page.getByText(/已调起系统分享/).first()).toBeVisible();
});

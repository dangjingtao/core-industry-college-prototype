import { expect, test } from "@playwright/test";

test.use({ viewport: { width: 1280, height: 900 } });

test("PC03 work routes stay inside the existing admin sidebar IA", async ({ page }) => {
  await page.goto("/admin/content");
  const adminNav = page.getByRole("navigation", { name: "管理端主导航" });
  await expect(adminNav.getByRole("link", { name: "内容与活动", exact: true })).toBeVisible();
  const contentOperations = adminNav.getByRole("link", { name: "内容运营", exact: true });
  await expect(contentOperations).toHaveAttribute("href", "/admin/content/operations");

  await contentOperations.click();
  await expect(page).toHaveURL(/\/admin\/content\/operations$/);
  await expect(page.getByRole("heading", { name: "首页 Banner / 资讯 / 赛友内容 / 活动" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "管理端主导航" })).toBeVisible();

  await page.goto("/admin/opportunities/intern-1");
  await expect(adminNav.getByRole("link", { name: "机会与投递", exact: true })).toBeVisible();
  await page.goto("/admin/organizations");
  await expect(adminNav.getByRole("link", { name: "Organization 主数据", exact: true })).toBeVisible();
});

test("PC03 unifies Organization while preserving Mobile company stable values", async ({ page }) => {
  await page.goto("/admin/organizations");
  await expect(page.getByRole("heading", { name: "统一 Organization 主体主数据" })).toBeVisible();
  await expect(page.getByText("学校、企业、赛事组织方和合作机构使用同一 organizationId。", { exact: false })).toBeVisible();

  await page.getByRole("link", { name: /北辰美妆/ }).click();
  await expect(page).toHaveURL(/\/admin\/organizations\/northstar-beauty$/);
  await expect(page.getByText("organizationId · northstar-beauty", { exact: true })).toBeVisible();
  await expect(page.getByText(/Mobile Company 使用同一 stable value/)).toBeVisible();
  await expect(page.getByRole("heading", { name: "该主体提供 / 参与的资源" })).toBeVisible();
  await expect(page.getByText("品牌增长实习生", { exact: true })).toBeVisible();
  await expect(page.getByText("品牌电商实战课", { exact: true })).toBeVisible();
});

test("PC03 opportunity flow supports create, edit, lifecycle, explainable targeting and Application truth", async ({ page }) => {
  await page.goto("/admin/opportunities/intern-1");
  await expect(page.getByRole("heading", { name: "机会管理 + App 内投递" })).toBeVisible();
  await expect(page.getByText("opportunityId · intern-1", { exact: true })).toBeVisible();
  await expect(page.getByText(/不建立 CandidateRecord/).first()).toBeVisible();

  await page.getByRole("link", { name: "编辑机会" }).click();
  await expect(page).toHaveURL(/\/admin\/opportunities\/intern-1\/edit$/);
  await expect(page.getByRole("heading", { name: "编辑机会" })).toBeVisible();
  await page.getByLabel("标题").fill("品牌增长实习生（校园）");
  await page.getByLabel("地区").fill("广州 / 深圳");
  await page.getByRole("button", { name: "保存编辑" }).click();
  await expect(page.getByTestId("opportunity-edit-saved")).toContainText("品牌增长实习生（校园） · 广州 / 深圳");
  await page.getByRole("link", { name: "返回机会详情" }).click();

  await page.getByTestId("opportunity-toggle").click();
  await expect(page.getByTestId("opportunity-toggle")).toContainText("重新上架");
  await page.getByTestId("opportunity-toggle").click();
  await expect(page.getByTestId("opportunity-toggle")).toContainText("下架机会");

  await page.getByRole("button", { name: /匿名学生 C/ }).click();
  await page.getByRole("button", { name: "确认发送范围" }).click();
  await expect(page.getByTestId("audience-confirmed")).toContainText("不生成 CandidateRecord");

  const applicationStatus = page.getByLabel("更新 匿名学生 B Application 状态");
  await expect(applicationStatus).toHaveValue("statusUnknown");
  await applicationStatus.selectOption("submitted");
  await expect(applicationStatus).toHaveValue("submitted");

  await page.getByRole("button", { name: "新建机会" }).click();
  await page.getByLabel("opportunityId").fill("campus-ops-2026");
  await page.getByLabel("标题").fill("校园运营项目实践");
  await page.getByRole("button", { name: "创建为 open" }).click();
  await expect(page.getByText("校园运营项目实践", { exact: true })).toBeVisible();
  await expect(page.getByText(/campus-ops-2026/)).toBeVisible();
});

test("PC03 content is platform-published and only targets competition school or region scopes", async ({ page }) => {
  await page.goto("/admin/content");
  await expect(page.getByRole("heading", { name: "首页 Banner / 资讯 / 赛友内容 / 活动" })).toBeVisible();
  await expect(page.getByText(/学校、企业、合作方可以供稿，但没有直接发布权/)).toBeVisible();
  await expect(page.getByText("赛事 · sanchuang-16", { exact: true })).toBeVisible();
  await expect(page.getByText("地区 · 广州", { exact: true })).toBeVisible();
  await expect(page.getByText("学校 · 广州示范高校", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "三创赛报名季 下架" }).click();
  await expect(page.getByRole("button", { name: "三创赛报名季 发布" })).toBeVisible();

  await page.getByRole("button", { name: "新建内容" }).click();
  await page.getByLabel("contentId").fill("content-news-campus-01");
  await page.getByLabel("标题").fill("校园创新开放日");
  await page.getByLabel("Scope").selectOption({ label: "地区" });
  await page.getByLabel("Scope 值").fill("深圳");
  await page.getByRole("button", { name: "创建为 draft" }).click();
  await expect(page.getByText("校园创新开放日", { exact: true })).toBeVisible();
  await expect(page.getByText("地区 · 深圳", { exact: true })).toBeVisible();
});
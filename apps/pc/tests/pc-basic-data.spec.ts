import { expect, test, type Page } from "@playwright/test";

test.use({ viewport: { width: 1280, height: 900 } });

async function showTechnical(page: Page) {
  const toggle = page.getByTestId("technical-mode-toggle");
  if ((await toggle.textContent())?.includes("显示技术信息")) await toggle.click();
}

test("basic-data 保留现有入口与 5 个子页面，默认先讲业务", async ({ page }) => {
  await page.goto("/admin/basic-data");

  await expect(page.getByRole("navigation", { name: "管理端主导航" })).toBeVisible();
  await expect(page.getByRole("link", { name: "基础数据管理", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /报名学生基础数据/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /参赛学校基础数据/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /赛事 \/ 赛道字典/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /证书 \/ 协议模板/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /导入与批处理/ })).toBeVisible();

  await expect(page.getByRole("heading", { name: "报名学生基础数据", exact: true })).toBeVisible();
  await expect(page.getByText("学生资料列表", { exact: true })).toBeVisible();
  await expect(page.getByText(/当前原型复用学生控制台的林晓样例/)).toBeVisible();
  await expect(page.getByText("林晓", { exact: true })).toBeVisible();
  await expect(page.getByText("账号 ID 待真实账号层接入", { exact: true })).not.toBeVisible();
  await expect(page.locator("body")).not.toContainText("studentId");
});

test("学生详情与 PC05 复用同一林晓样例，不再出现无提示切人", async ({ page }) => {
  await page.goto("/admin/basic-data/students/current");

  await expect(page.getByRole("heading", { name: "林晓 · 学生基础资料", exact: true })).toBeVisible();
  await expect(page.getByText(/当前 PC05 只提供这一位学生的治理样例/)).toBeVisible();
  await expect(page.getByText(/当前 PC05 学生控制台复用同一位“林晓”治理样例/)).toBeVisible();
  await expect(page.getByTestId("student-account-anchor")).not.toBeVisible();

  await showTechnical(page);
  await expect(page.getByTestId("student-account-anchor")).toHaveText("账号 ID 待真实账号层接入");
  await expect(page.getByText(/Truth source: Account \/ StudentProfile/)).toBeVisible();

  await page.getByRole("link", { name: "进入学生与赛事身份控制台", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/students$/);
  await expect(page.getByText("林晓", { exact: true })).toBeVisible();
});

test("学校默认讲业务，技术模式再展示 organizationId 与 canonical type", async ({ page }) => {
  await page.goto("/admin/basic-data/schools/org-lingnan-tech-college");

  await expect(page.getByRole("heading", { name: "岭南科技学院", exact: true })).toBeVisible();
  await expect(page.getByText("学校", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("organizationId · org-lingnan-tech-college", { exact: true })).not.toBeVisible();
  await expect(page.getByText("Organization(type=学校)", { exact: true })).not.toBeVisible();
  await expect(page.locator("body")).not.toContainText("已认证");
  await expect(page.locator("body")).not.toContainText("待认证");

  await showTechnical(page);
  await expect(page.getByText("organizationId · org-lingnan-tech-college", { exact: true })).toBeVisible();
  await expect(page.getByText("Organization(type=学校)", { exact: true })).toBeVisible();

  const maintainSchool = page.getByRole("link", { name: /编辑学校主体/ });
  await expect(maintainSchool).toHaveAttribute("href", "/admin/organizations/org-lingnan-tech-college");
});

test("基础配置索引默认展示业务归属，技术模式再展示 CompetitionTrack / Lifecycle 与 Scope", async ({ page }) => {
  await page.goto("/admin/basic-data/dictionaries");

  await expect(page.getByRole("heading", { name: "赛事 / 赛道字典", exact: true })).toBeVisible();
  await expect(page.getByText("基础配置索引", { exact: true })).toBeVisible();
  await expect(page.getByText("赛事中心", { exact: true }).first()).toBeVisible();
  await expect(page.getByText(/跟随所属模块维护并生效/).first()).toBeVisible();
  await expect(page.getByText("CompetitionTrack", { exact: true }).first()).not.toBeVisible();
  await expect(page.getByText("trackId · track-ecommerce", { exact: true })).not.toBeVisible();
  await expect(page.getByText("CompetitionLifecycle", { exact: true })).not.toBeVisible();
  await expect(page.getByText("competitionId=sanchuang-16", { exact: true }).first()).not.toBeVisible();

  await showTechnical(page);
  await expect(page.getByText("CompetitionTrack", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("trackId · track-ecommerce", { exact: true })).toBeVisible();
  await expect(page.getByText("CompetitionLifecycle", { exact: true })).toBeVisible();
  await expect(page.getByText("competitionId=sanchuang-16", { exact: true }).first()).toBeVisible();
});

test("模板页默认只讲归属模块，canonical object 与版本细节进入技术模式", async ({ page }) => {
  await page.goto("/admin/basic-data/templates");

  await expect(page.getByRole("heading", { name: "证书 / 协议模板", exact: true })).toBeVisible();
  await expect(page.getByText("可信证书", { exact: true })).toBeVisible();
  await expect(page.getByText("赛事中心 / 报名业务", { exact: true })).toBeVisible();
  await expect(page.getByText("内容运营", { exact: true })).toBeVisible();
  await expect(page.getByText("权益运营", { exact: true })).toBeVisible();
  await expect(page.getByText("Certificate / 签发规则", { exact: true })).not.toBeVisible();
  await expect(page.getByText("Placement / ContentItem", { exact: true })).not.toBeVisible();
  await expect(page.locator("body")).not.toContainText("统一从这里发布");

  await showTechnical(page);
  await expect(page.getByText("Certificate / 签发规则", { exact: true })).toBeVisible();
  await expect(page.getByText("Placement / ContentItem", { exact: true })).toBeVisible();
});

test("导入页默认展示批次治理，五类 canonical DataSource 与真实写回对象只在技术模式展示", async ({ page }) => {
  await page.goto("/admin/basic-data/imports");

  await expect(page.getByRole("heading", { name: "导入与批处理", exact: true })).toBeVisible();
  await expect(page.getByText("数据接入批次", { exact: true })).toBeVisible();
  await expect(page.getByText("students-2026-fall.csv", { exact: true })).toBeVisible();
  await expect(page.getByText("→ 学生资料", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("→ 学校主体资料", { exact: true })).toBeVisible();
  await expect(page.getByText("→ 证书与成绩记录", { exact: true })).toBeVisible();
  await expect(page.getByText("缺少学校列；批次已退回", { exact: true })).toBeVisible();
  await expect(page.getByText(/不会静默覆盖权威事实/)).toBeVisible();
  await expect(page.getByTestId("canonical-data-sources")).not.toBeVisible();
  await expect(page.getByText("Account / StudentProfile", { exact: true }).first()).not.toBeVisible();

  await showTechnical(page);
  const sources = page.getByTestId("canonical-data-sources");
  await expect(sources).toContainText("平台配置");
  await expect(sources).toContainText("API 同步");
  await expect(sources).toContainText("文件导入");
  await expect(sources).toContainText("人工修正");
  await expect(sources).toContainText("Runtime");
  await expect(page.getByText("Account / StudentProfile", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Organization(type=School)", { exact: true })).toBeVisible();
  await expect(page.getByText("Certificate / Result", { exact: true })).toBeVisible();
});

test("PC02 的学校审核与官方资格继续分层：学校审核通过时官方资格仍可待确认且 Workspace 不开放", async ({ page }) => {
  await page.goto("/admin/competitions/objects/sanchuang-16");

  await page.getByRole("button", { name: "学校审核通过", exact: true }).click();
  await expect(page.getByTestId("platform-review-status")).toHaveText("学校审核已通过");
  await expect(page.getByTestId("official-qualification-status")).toHaveText("官方资格待确认");
  await expect(page.getByTestId("workspace-gate")).toContainText("赛事工作区：暂未开放");
});

test("registration portal 与 PC03 / PC04 / PC05 关键路由仍可访问", async ({ page }) => {
  await page.goto("/registration-portal/start");
  await expect(page.getByRole("heading", { name: "三创赛报名", level: 1 })).toBeVisible();

  await page.goto("/admin/organizations/org-huanan-commerce-college");
  await expect(page.getByRole("heading", { name: "华南商贸学院", exact: true })).toBeVisible();

  await page.goto("/admin/pc04/certificates");
  await expect(page.getByRole("navigation", { name: "管理端主导航" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "没有找到这个后台页面" })).toHaveCount(0);

  for (const route of ["/admin/students", "/admin/assets", "/admin/governance"]) {
    await page.goto(route);
    await expect(page.getByRole("navigation", { name: "管理端主导航" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "没有找到这个后台页面" })).toHaveCount(0);
  }
});

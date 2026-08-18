import { expect, test } from "@playwright/test";

test.use({ viewport: { width: 1280, height: 900 } });

test("basic-data 保留现有入口与 5 个子页面，并明确自己只是跨域维护工作台", async ({ page }) => {
  await page.goto("/admin/basic-data");

  await expect(page.getByRole("navigation", { name: "管理端主导航" })).toBeVisible();
  await expect(page.getByRole("link", { name: "基础数据管理", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /报名学生基础数据/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /参赛学校基础数据/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /赛事 \/ 赛道字典/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /证书 \/ 协议模板/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /导入与批处理/ })).toBeVisible();

  await expect(page.getByRole("heading", { name: "报名学生基础数据", exact: true })).toBeVisible();
  await expect(page.getByText(/Account \/ StudentProfile 的聚合视图/)).toBeVisible();
  await expect(page.getByText("账号 ID 待真实账号层接入", { exact: true }).first()).toBeVisible();
  await expect(page.locator("body")).not.toContainText("studentId");
});

test("学生详情只呈现 Account / StudentProfile 语义，不再锁定 studentId、可信状态或 Profile 状态机", async ({ page }) => {
  await page.goto("/admin/basic-data/students/chenyu");

  await expect(page.getByRole("heading", { name: "陈语 · StudentProfile", exact: true })).toBeVisible();
  await expect(page.getByTestId("student-account-anchor")).toHaveText("账号 ID 待真实账号层接入");
  await expect(page.getByText("无独立业务状态", { exact: true })).toBeVisible();
  await expect(page.getByText("真相源：Account / StudentProfile", { exact: true })).toBeVisible();
  await expect(page.locator("body")).not.toContainText("studentId");
  await expect(page.locator("body")).not.toContainText("已通过可信校验");
});

test("学校详情直接复用 Organization(type=School)，保留 organizationId 且没有自造认证状态机", async ({ page }) => {
  await page.goto("/admin/basic-data/schools/org-lingnan-tech-college");

  await expect(page.getByRole("heading", { name: "岭南科技学院", exact: true })).toBeVisible();
  await expect(page.getByText("organizationId · org-lingnan-tech-college", { exact: true })).toBeVisible();
  await expect(page.getByText("Organization(type=学校)", { exact: true })).toBeVisible();
  await expect(page.getByText(/赛事 Scope 在赛事中心维护/)).toBeVisible();
  await expect(page.locator("body")).not.toContainText("已认证");
  await expect(page.locator("body")).not.toContainText("待认证");

  const maintainSchool = page.getByRole("link", { name: /编辑学校主体/ });
  await expect(maintainSchool).toHaveAttribute("href", "/admin/organizations/org-lingnan-tech-college");
  await maintainSchool.click();
  await expect(page).toHaveURL(/\/admin\/organizations\/org-lingnan-tech-college$/);
});

test("基础配置索引把赛道与阶段归回具体 Competition，并把证书配置指向 PC04", async ({ page }) => {
  await page.goto("/admin/basic-data/dictionaries");

  await expect(page.getByRole("heading", { name: "赛事 / 赛道字典", exact: true })).toBeVisible();
  await expect(page.getByText("CompetitionTrack", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("trackId · track-ecommerce", { exact: true })).toBeVisible();
  await expect(page.getByText("CompetitionLifecycle", { exact: true })).toBeVisible();
  await expect(page.getByText("competitionId=sanchuang-16", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("PC04 可信证书", { exact: true })).toBeVisible();
  await expect(page.getByText(/本页只提供归属与跳转，不直接生效/)).toBeVisible();
});

test("模板页只是跨域索引：证书、协议、Banner、权益规则分别回到既有业务域", async ({ page }) => {
  await page.goto("/admin/basic-data/templates");

  await expect(page.getByRole("heading", { name: "证书 / 协议模板", exact: true })).toBeVisible();
  await expect(page.getByText("PC04 可信证书", { exact: true })).toBeVisible();
  await expect(page.getByText("赛事中心 / 报名业务", { exact: true })).toBeVisible();
  await expect(page.getByText("Content 运营", { exact: true })).toBeVisible();
  await expect(page.getByText("PC04 权益", { exact: true })).toBeVisible();
  await expect(page.getByText(/basic-data 不保存第二份发布状态/)).toBeVisible();
  await expect(page.locator("body")).not.toContainText("统一从这里发布");
});

test("导入与批处理只记录数据接入治理，沿用五类 DataSource 并显式展示写回目标与冲突", async ({ page }) => {
  await page.goto("/admin/basic-data/imports");

  await expect(page.getByRole("heading", { name: "导入与批处理", exact: true })).toBeVisible();
  const sources = page.getByTestId("canonical-data-sources");
  await expect(sources).toContainText("平台配置");
  await expect(sources).toContainText("API 同步");
  await expect(sources).toContainText("文件导入");
  await expect(sources).toContainText("人工修正");
  await expect(sources).toContainText("Runtime");

  await expect(page.getByText("students-2026-fall.csv", { exact: true })).toBeVisible();
  await expect(page.getByText("→ Account / StudentProfile", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("→ Organization(type=School)", { exact: true })).toBeVisible();
  await expect(page.getByText("→ Certificate / Result", { exact: true })).toBeVisible();
  await expect(page.getByText("缺少学校列；批次已退回", { exact: true })).toBeVisible();
  await expect(page.getByText(/不会静默覆盖权威事实/)).toBeVisible();
  await expect(page.getByText(/batch state 不等于学生 \/ 学校 \/ 证书业务状态/)).toBeVisible();
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

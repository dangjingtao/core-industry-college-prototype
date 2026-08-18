import { expect, test } from "@playwright/test";

test.use({ viewport: { width: 1280, height: 900 } });

test("PC root is a public Core Industry College landing with registration and admin entries", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { name: "核心产业学院" })).toBeVisible();
  await expect(page.getByText("连接真实产业，沉淀真实成长", { exact: true })).toBeVisible();
  await expect(page.getByTestId("landing-registration")).toHaveAttribute("href", "/registration-portal/start");
  await expect(page.getByTestId("landing-admin")).toHaveAttribute("href", "/admin");
  await expect(page.getByText("赛事服务", { exact: true })).toBeVisible();
  await expect(page.getByText("产业课程", { exact: true })).toBeVisible();
  await expect(page.getByText("校企资源", { exact: true })).toBeVisible();
  await expect(page.getByText("学生成长", { exact: true })).toBeVisible();

  await page.getByTestId("landing-admin").click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole("heading", { name: "今天先处理这些业务" })).toBeVisible();
});

test("PC01 top-level domains lead with business work, not entity contracts", async ({ page }) => {
  await page.goto("/admin/competitions");
  await expect(page.getByRole("heading", { name: "赛事中心" })).toBeVisible();
  await expect(page.getByText("官方资格待回流", { exact: true })).toBeVisible();
  await expect(page.getByText("统一对象列表 Pattern", { exact: true })).not.toBeVisible();
  await expect(page.getByText("实体契约", { exact: true })).not.toBeVisible();

  await page.goto("/admin/resources");
  await expect(page.getByRole("heading", { name: "资源与服务" })).toBeVisible();
  await expect(page.getByText("机会与投递", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("平台课程", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("可信证书", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("ResourceRelation", { exact: true })).not.toBeVisible();

  await page.goto("/admin/workshop");
  await expect(page.getByRole("heading", { name: "创赛工坊配置" })).toBeVisible();
  await expect(page.getByText("隐私边界", { exact: true })).toBeVisible();
  await expect(page.getByText("全局 AI", { exact: false })).toBeVisible();
});

test("legacy admin object routes cannot escape back into AdminConsole", async ({ page }) => {
  await page.goto("/admin/resources/objects/opportunity-intern-1");
  await expect(page).toHaveURL(/\/admin\/opportunities\/intern-1$/);
  await expect(page.getByRole("heading", { name: "机会与投递" })).toBeVisible();
  await expect(page.getByText("统一对象列表 Pattern", { exact: true })).not.toBeVisible();
  await expect(page.getByText("PC01 Pattern only", { exact: false })).not.toBeVisible();
  await expect(page.getByText("Truth boundary", { exact: false })).not.toBeVisible();

  await page.goto("/admin/legacy-route-that-no-longer-exists");
  await expect(page.getByRole("heading", { name: "没有找到这个后台页面" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "管理端主导航" })).toBeVisible();
  await expect(page.getByText("统一对象列表 Pattern", { exact: true })).not.toBeVisible();
});

test("technical identifiers are secondary across specialized admin pages", async ({ page }) => {
  await page.goto("/admin/competitions/objects/sanchuang-16");
  await expect(page.getByRole("heading", { name: /第十六届.*挑战赛/ })).toBeVisible();
  await expect(page.getByText(/competitionId=sanchuang-16/).first()).not.toBeVisible();
  await page.getByTestId("technical-mode-toggle").click();
  await expect(page.getByText(/competitionId=sanchuang-16/).first()).toBeVisible();

  await page.goto("/admin/organizations/northstar-beauty");
  await expect(page.getByRole("heading", { name: "北辰美妆" })).toBeVisible();
  await expect(page.getByText("organizationId · northstar-beauty", { exact: true })).not.toBeVisible();
  await page.getByTestId("technical-mode-toggle").click();
  await expect(page.getByText("organizationId · northstar-beauty", { exact: true })).not.toBeVisible();
  await page.getByText("数据来源与关联标识", { exact: true }).click();
  await expect(page.getByText("organizationId · northstar-beauty", { exact: true })).toBeVisible();

  await page.goto("/admin/pc04/courses/brand-ecommerce");
  await expect(page.getByRole("heading", { name: "品牌电商实战课", exact: true })).toBeVisible();
  await expect(page.getByText("courseId", { exact: true })).not.toBeVisible();
  await page.getByTestId("technical-mode-toggle").click();
  await expect(page.getByText("courseId", { exact: true }).first()).toBeVisible();
});

test("PC02 defaults to business language while keeping school review separate from official qualification", async ({ page }) => {
  await page.goto("/admin/competitions/objects/sanchuang-16");
  await expect(page.getByText("报名中", { exact: true })).toBeVisible();
  await expect(page.getByTestId("platform-review-status")).toHaveText("待学校审核");
  await expect(page.getByTestId("official-qualification-status")).toHaveText("官方资格待确认");
  await expect(page.getByTestId("workspace-gate")).toContainText("赛事工作区：暂未开放");

  for (const raw of ["registrationOpen", "CompetitionIdentity", "SchoolScope", "notRequired"]) {
    await expect(page.getByText(raw, { exact: false }).first()).not.toBeVisible();
  }

  await page.getByRole("button", { name: "学校审核通过" }).click();
  await expect(page.getByTestId("platform-review-status")).toHaveText("学校审核已通过");
  await expect(page.getByTestId("official-qualification-status")).toHaveText("官方资格待确认");
  await expect(page.getByTestId("workspace-gate")).toContainText("暂未开放");
  await page.getByRole("button", { name: "模拟官方资格确认" }).click();
  await expect(page.getByTestId("official-qualification-status")).toHaveText("官方资格已确认");
  await expect(page.getByTestId("workspace-gate")).toContainText("可进入");

  await page.getByTestId("technical-mode-toggle").click();
  await expect(page.getByText(/status=registrationOpen/).first()).toBeVisible();
  await expect(page.getByText(/CompetitionIdentity/).first()).toBeVisible();
  await expect(page.getByText(/SchoolScope/).first()).toBeVisible();
});

test("PC02 applies captain-school review and protects workshop private content in business language", async ({ page }) => {
  await page.goto("/admin/competitions/objects/sanchuang-16");
  await expect(page.getByText("跨校团队由队长所在学校统一审核整个团队", { exact: true })).toBeVisible();
  await expect(page.getByText("陈语", { exact: true })).toBeVisible();
  await expect(page.getByText("岭南科技学院", { exact: true })).toBeVisible();
  await expect(page.getByText(/统一归队长学校：华南商贸学院/).first()).toBeVisible();
  await expect(page.getByText("创赛工坊私人回答 / AI 内容", { exact: true }).last()).toBeVisible();
});

test("PC02 platform-configured partner event avoids raw notRequired and SchoolScope by default", async ({ page }) => {
  await page.goto("/admin/competitions/objects/innovation-cup-2026");
  await expect(page.getByRole("heading", { name: "2026 青年品牌创新挑战赛" })).toBeVisible();
  await expect(page.getByTestId("official-qualification-status")).toHaveText("本赛事无需外部资格确认");
  await expect(page.getByTestId("workspace-gate")).toContainText("赛事工作区：暂未开放");
  await expect(page.getByTestId("workspace-gate")).toContainText("赛事尚未进入开放阶段");
  await expect(page.getByText("当前授权学校", { exact: true })).toBeVisible();
  await expect(page.getByText("notRequired", { exact: false }).first()).not.toBeVisible();
  await expect(page.getByText("SchoolScope", { exact: false }).first()).not.toBeVisible();

  await page.getByTestId("technical-mode-toggle").click();
  await expect(page.getByText(/officialQualification=notRequired/).first()).toBeVisible();
  await expect(page.getByText(/SchoolScope/).first()).toBeVisible();
});

test("registration portal remains an independent PC business entry", async ({ page }) => {
  await page.goto("/admin");
  const portalLink = page.getByRole("link", { name: "三创赛报名门户" });
  await expect(portalLink).toHaveAttribute("href", "/registration-portal/start");
  await portalLink.click();
  await expect(page.getByRole("heading", { name: "三创赛报名", level: 1 })).toBeVisible();
});

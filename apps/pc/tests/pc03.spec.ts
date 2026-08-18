import { expect, test } from "@playwright/test";

test.use({ viewport: { width: 1280, height: 900 } });

test("PC03 stays inside the full PC01 control-plane navigation and operator context", async ({ page }) => {
  for (const route of ["/admin/organizations", "/admin/opportunities/intern-1", "/admin/content/operations"]) {
    await page.goto(route);
    const adminNav = page.getByRole("navigation", { name: "管理端主导航" });
    await expect(adminNav).toBeVisible();
    for (const label of ["赛事中心", "主体与学校", "资源运营", "学生与赛事身份", "资产与可信凭证", "内容与活动", "创赛工坊配置"]) {
      await expect(adminNav.getByRole("link", { name: label, exact: true })).toBeVisible();
    }
    const operator = page.getByLabel("当前管理角色与数据范围");
    await expect(operator).toContainText("Role");
    await expect(operator).toContainText("平台运营");
    await expect(operator).toContainText("Module");
    await expect(operator).toContainText("Data Scope");
  }

  await page.goto("/admin/content");
  const contentOperations = page.getByRole("navigation", { name: "管理端主导航" }).getByRole("link", { name: "内容运营", exact: true });
  await expect(contentOperations).toHaveAttribute("href", "/admin/content/operations");
});

test("PC03 Organization preserves stable ids and only uses PC01 canonical source tags", async ({ page }) => {
  await page.goto("/admin/organizations/northstar-beauty");
  await expect(page.getByRole("heading", { name: "北辰美妆" })).toBeVisible();
  await expect(page.getByText("organizationId · northstar-beauty", { exact: true })).toBeVisible();
  await expect(page.getByText(/Mobile Company 使用同一 stable value/)).toBeVisible();
  await expect(page.getByText("平台配置", { exact: true })).toBeVisible();
  await expect(page.getByText("API 同步", { exact: true })).toBeVisible();
  await expect(page.getByText("可信数据源", { exact: true })).toHaveCount(0);
  await expect(page.getByText(/只使用 PC01 canonical 五类来源/)).toBeVisible();
});

test("PC03 Opportunity edit persists to detail, includes skills and keeps Application consumer-aligned", async ({ page }) => {
  await page.goto("/admin/opportunities/intern-1");
  await expect(page.getByRole("heading", { name: "机会管理 + App 内投递" })).toBeVisible();
  await expect(page.getByText("opportunityId · intern-1", { exact: true })).toBeVisible();
  await expect(page.getByLabel("技能标签")).toContainText("内容运营");
  await expect(page.getByLabel("技能标签")).toContainText("数据复盘");

  await page.getByRole("link", { name: "编辑机会" }).click();
  await expect(page).toHaveURL(/\/admin\/opportunities\/intern-1\/edit$/);
  await expect(page.getByLabel("opportunityId · 只读")).toHaveValue("intern-1");
  await page.getByLabel("标题").fill("品牌增长实习生（校园）");
  await page.getByLabel("地区").fill("广州 / 深圳");
  await page.getByLabel("技能标签 skills[]").fill("内容运营, 用户研究, 项目执行");
  await page.getByRole("button", { name: "保存编辑" }).click();
  await expect(page.getByTestId("opportunity-edit-saved")).toContainText("共享 PC03 原型态");
  await page.getByRole("link", { name: "返回机会详情" }).click();

  await expect(page).toHaveURL(/\/admin\/opportunities\/intern-1$/);
  await expect(page.getByRole("heading", { name: "品牌增长实习生（校园）" })).toBeVisible();
  await expect(page.getByText("广州 / 深圳", { exact: true })).toBeVisible();
  await expect(page.getByLabel("技能标签")).toContainText("用户研究");

  const applicationStatus = page.getByLabel("更新 匿名学生 B Application 状态");
  await expect(applicationStatus).toHaveValue("statusUnknown");
  await expect(applicationStatus.locator('option[value="failed"]')).toHaveCount(0);
  await applicationStatus.selectOption("submitted");
  await expect(applicationStatus).toHaveValue("submitted");
});

test("PC03 Opportunity create carries Mobile skills[] and targeting remains explainable", async ({ page }) => {
  await page.goto("/admin/opportunities/intern-1");
  await page.getByRole("button", { name: "新建机会" }).click();
  await page.getByLabel("opportunityId").fill("campus-ops-2026");
  await page.getByLabel("标题").fill("校园运营项目实践");
  await page.getByLabel("技能标签 skills[]").fill("活动运营, 用户研究");
  await page.getByRole("button", { name: "创建为 open" }).click();
  await page.getByRole("link", { name: /校园运营项目实践/ }).click();
  await expect(page.getByText("opportunityId · campus-ops-2026", { exact: true })).toBeVisible();
  await expect(page.getByLabel("技能标签")).toContainText("活动运营");
  await expect(page.getByLabel("技能标签")).toContainText("用户研究");

  await expect(page.getByText("学校", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("专业", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("赛事经历", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("课程完成", { exact: true }).first()).toBeVisible();
  await page.getByRole("button", { name: /匿名学生 C/ }).click();
  await page.getByRole("button", { name: "确认发送范围" }).click();
  await expect(page.getByTestId("audience-confirmed")).toContainText("不生成 CandidateRecord");
});

test("PC03 content scopes store competitionId or school organizationId instead of display names", async ({ page }) => {
  await page.goto("/admin/content/operations");
  await expect(page.getByRole("heading", { name: "首页 Banner / 资讯 / 赛友内容 / 活动" })).toBeVisible();
  await expect(page.getByText("competitionId=sanchuang-16", { exact: true })).toBeVisible();
  await expect(page.getByText("organizationId=school-demo-gz", { exact: true })).toBeVisible();
  await expect(page.getByText("地区 · 广州", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "新建内容" }).click();
  await page.getByLabel("contentId").fill("content-school-open-day");
  await page.getByLabel("标题").fill("校园创新开放日");
  await page.getByLabel("Scope").selectOption("学校");
  await page.getByLabel("学校 stable ID").selectOption("school-demo-gz");
  await page.getByRole("button", { name: "创建为 draft" }).click();
  await expect(page.getByText("校园创新开放日", { exact: true })).toBeVisible();
  await expect(page.getByText("organizationId=school-demo-gz", { exact: true }).last()).toBeVisible();

  await page.getByRole("button", { name: "新建内容" }).click();
  await page.getByLabel("contentId").fill("content-competition-brief");
  await page.getByLabel("标题").fill("赛事节点提醒");
  await page.getByLabel("Scope").selectOption("赛事");
  await page.getByLabel("赛事 stable ID").selectOption("innovation-cup-2026");
  await page.getByRole("button", { name: "创建为 draft" }).click();
  await expect(page.getByText("competitionId=innovation-cup-2026", { exact: true })).toBeVisible();
});

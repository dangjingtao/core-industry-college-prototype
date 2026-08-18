import { expect, test, type Page } from "@playwright/test";

test.use({ viewport: { width: 1280, height: 900 } });

async function showTechnical(page: Page) {
  const button = page.getByTestId("technical-mode-toggle");
  if ((await button.textContent())?.includes("显示技术信息")) await button.click();
}

test("PC03 stays inside the shared admin shell while permission metadata is secondary", async ({ page }) => {
  for (const route of ["/admin/organizations", "/admin/opportunities/intern-1", "/admin/content/operations"]) {
    await page.goto(route);
    const adminNav = page.getByRole("navigation", { name: "管理端主导航" });
    await expect(adminNav).toBeVisible();
    for (const label of ["赛事中心", "主体与学校", "资源运营", "学生与赛事身份", "资产与可信凭证", "内容与活动", "创赛工坊配置"]) {
      await expect(adminNav.getByRole("link", { name: label, exact: true })).toBeVisible();
    }
    const operator = page.getByLabel("当前管理角色与数据范围");
    await expect(operator).toBeVisible();
    await expect(operator).not.toHaveAttribute("open", "");
    await operator.locator("summary").click();
    await expect(operator).toContainText("Role");
    await expect(operator).toContainText("平台运营");
    await expect(operator).toContainText("Module");
    await expect(operator).toContainText("Data Scope");
  }

  await page.goto("/admin/content");
  const contentOperations = page.getByRole("navigation", { name: "管理端主导航" }).getByRole("link", { name: "内容运营", exact: true });
  await expect(contentOperations).toHaveAttribute("href", "/admin/content/operations");
});

test("PC03 Organization keeps business relations first and stable ids in explicit trace details", async ({ page }) => {
  await page.goto("/admin/organizations/northstar-beauty");
  await expect(page.getByRole("heading", { name: "北辰美妆" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "当前合作资源" })).toBeVisible();
  await expect(page.getByText("organizationId · northstar-beauty", { exact: true })).not.toBeVisible();
  await showTechnical(page);
  await expect(page.getByText("organizationId · northstar-beauty", { exact: true })).not.toBeVisible();
  await page.getByText("数据来源与关联标识", { exact: true }).click();
  await expect(page.getByText("organizationId · northstar-beauty", { exact: true })).toBeVisible();
  await expect(page.getByText(/Mobile Company 使用同一 stable value/)).toBeVisible();
  await expect(page.getByText("平台配置", { exact: true })).toBeVisible();
  await expect(page.getByText("API 同步", { exact: true })).toBeVisible();
  await expect(page.getByText("可信数据源", { exact: true })).toHaveCount(0);
  await expect(page.getByText(/只使用 PC01 canonical 五类来源/)).toBeVisible();
});

test("PC03 opportunity edit persists while technical identifiers stay secondary", async ({ page }) => {
  await page.goto("/admin/opportunities/intern-1");
  await expect(page.getByRole("heading", { name: "机会与投递" })).toBeVisible();
  await expect(page.getByText("opportunityId · intern-1", { exact: true })).not.toBeVisible();
  await showTechnical(page);
  await expect(page.getByText("opportunityId · intern-1", { exact: true })).toBeVisible();
  await expect(page.getByLabel("技能标签")).toContainText("内容运营");
  await expect(page.getByLabel("技能标签")).toContainText("数据复盘");

  await page.getByRole("link", { name: "编辑机会" }).click();
  await expect(page).toHaveURL(/\/admin\/opportunities\/intern-1\/edit$/);
  // Technical mode may persist across prototype navigation; verify the value once visible.
  await showTechnical(page);
  await expect(page.getByLabel("机会标识 · 只读")).toHaveValue("intern-1");
  await page.getByLabel("标题").fill("品牌增长实习生（校园）");
  await page.getByLabel("地区").fill("广州 / 深圳");
  await page.getByLabel("技能标签", { exact: true }).fill("内容运营, 用户研究, 项目执行");
  await page.getByRole("button", { name: "保存编辑" }).click();
  await expect(page.getByTestId("opportunity-edit-saved")).toContainText("机会信息已保存");
  await page.getByRole("link", { name: "返回机会详情" }).click();

  await expect(page).toHaveURL(/\/admin\/opportunities\/intern-1$/);
  await expect(page.getByRole("heading", { name: "品牌增长实习生（校园）" })).toBeVisible();
  await expect(page.getByText("广州 / 深圳", { exact: true })).toBeVisible();
  await expect(page.getByLabel("技能标签")).toContainText("用户研究");

  const applicationStatus = page.getByLabel("更新 匿名学生 B 投递状态");
  await expect(applicationStatus).toHaveValue("statusUnknown");
  await expect(applicationStatus.locator('option[value="failed"]')).toHaveCount(0);
  await applicationStatus.selectOption("submitted");
  await expect(applicationStatus).toHaveValue("submitted");
});

test("PC03 opportunity creation uses business fields and keeps targeting explainable", async ({ page }) => {
  await page.goto("/admin/opportunities/intern-1");
  await showTechnical(page);
  await page.getByRole("button", { name: "新建机会" }).click();
  await expect(page.getByLabel("opportunityId")).toHaveCount(0);
  await page.getByLabel("机会名称").fill("校园运营项目实践");
  await page.getByRole("textbox", { name: "技能标签", exact: true }).fill("活动运营, 用户研究");
  await page.getByRole("button", { name: "保存并开放" }).click();
  await page.getByRole("link", { name: /校园运营项目实践/ }).click();
  await expect(page.getByText("opportunityId · opportunity-draft-005", { exact: true })).toBeVisible();
  await expect(page.getByLabel("技能标签")).toContainText("活动运营");
  await expect(page.getByLabel("技能标签")).toContainText("用户研究");

  await expect(page.getByText("学校", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("专业", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("赛事经历", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("课程完成", { exact: true }).first()).toBeVisible();
  await page.getByRole("button", { name: /匿名学生 C/ }).click();
  await page.getByRole("button", { name: "确认发送范围" }).click();
  await expect(page.getByTestId("audience-confirmed")).toContainText("发送范围已确认");
  await expect(page.getByTestId("audience-confirmed")).toContainText("不生成 CandidateRecord");
});

test("PC03 content creation uses business targeting while technical references remain available", async ({ page }) => {
  await page.goto("/admin/content/operations");
  await expect(page.getByRole("heading", { name: "内容与活动" })).toBeVisible();
  await expect(page.getByText("competitionId=sanchuang-16", { exact: true })).not.toBeVisible();
  await expect(page.getByText("contentId=content-home-sanchuang-2026", { exact: true })).not.toBeVisible();
  await showTechnical(page);
  await expect(page.getByText("competitionId=sanchuang-16", { exact: true })).toBeVisible();
  await expect(page.getByText("organizationId=school-demo-gz", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "新建内容" }).click();
  await page.getByLabel("标题").fill("校园创新开放日");
  await page.getByLabel("定向范围").selectOption("学校");
  await page.getByLabel("指定学校").selectOption("school-demo-gz");
  await page.getByRole("button", { name: "保存草稿" }).click();
  await expect(page.getByText("校园创新开放日", { exact: true })).toBeVisible();
  await expect(page.getByText("学校 · 广州示范高校", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("organizationId=school-demo-gz", { exact: true }).last()).toBeVisible();

  await page.getByRole("button", { name: "新建内容" }).click();
  await page.getByLabel("标题").fill("赛事节点提醒");
  await page.getByLabel("定向范围").selectOption("赛事");
  await page.getByLabel("指定赛事").selectOption("innovation-cup-2026");
  await page.getByRole("button", { name: "保存草稿" }).click();
  await expect(page.getByText("赛事 · 2026 青年品牌创新挑战赛", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("competitionId=innovation-cup-2026", { exact: true }).first()).toBeVisible();
});

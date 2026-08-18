import { expect, test } from "@playwright/test";

test.use({ viewport: { width: 1360, height: 940 } });

test("PC05 human gate covers the whole admin surface, not only PC05 pages", async ({ page }) => {
  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: "今天先处理这些业务" })).toBeVisible();
  await expect(page.getByText("Truth boundary", { exact: false })).not.toBeVisible();
  await expect(page.getByText("Stable ID 统一展示", { exact: true })).not.toBeVisible();
  await expect(page.getByText("Role", { exact: true })).not.toBeVisible();

  for (const [route, businessText, technicalText] of [
    ["/admin/competitions", "赛事中心", "统一对象列表 Pattern"],
    ["/admin/competitions/objects/sanchuang-16", "第十六届三创赛", "外部权威赛事事实"],
    ["/admin/resources", "资源与服务", "ResourceRelation"],
    ["/admin/organizations/northstar-beauty", "北辰美妆", "organizationId · northstar-beauty"],
    ["/admin/opportunities/intern-1", "机会与投递", "opportunityId · intern-1"],
    ["/admin/content/operations", "内容与活动", "contentId=content-home-sanchuang-2026"],
    ["/admin/pc04/courses/brand-ecommerce", "品牌电商实战课", "真相源边界"],
    ["/admin/students", "学生长期服务与平台治理", "Mobile session 尚未显式接入"],
  ] as const) {
    await page.goto(route);
    await expect(page.getByText(businessText, { exact: false }).first()).toBeVisible();
    await expect(page.getByText(technicalText, { exact: false }).first()).not.toBeVisible();
  }

  await page.goto("/admin/pc04/courses/brand-ecommerce");
  await expect(page.getByText("真相源边界", { exact: true })).not.toBeVisible();
  await page.getByTestId("technical-mode-toggle").click();
  await expect(page.getByText("真相源边界", { exact: true })).toBeVisible();
  await expect(page.getByText("courseId", { exact: true }).first()).toBeVisible();
});

test("PC05 student console keeps business tasks first while preserving App identity semantics", async ({ page }) => {
  await page.goto("/admin/students");
  await expect(page.getByRole("navigation", { name: "管理端主导航" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "学生长期服务与平台治理" })).toBeVisible();
  await expect(page.getByText("林晓", { exact: true })).toBeVisible();
  await expect(page.getByText("Mobile session 尚未显式接入", { exact: false })).not.toBeVisible();

  const activeRow = page.getByRole("row").filter({ hasText: "sanchuang-16" });
  await expect(activeRow).toContainText("第十六届三创赛");
  await expect(activeRow).toContainText("报名中");
  await expect(activeRow).toContainText("正常");
  await expect(activeRow).toContainText("已通过");
  await expect(activeRow).toContainText("等待官方资格回流");

  const endedRow = page.getByRole("row").filter({ hasText: "sanchuang-15" });
  await expect(endedRow).toContainText("已结束");
  await expect(endedRow).toContainText("已撤销");
  await expect(page.getByTestId("retention-proof")).toContainText("赛事工作区保持关闭");

  await page.getByText("数据与关系", { exact: true }).click();
  await expect(page.getByText("Mobile session 尚未显式接入", { exact: false })).toBeVisible();
  await page.getByText("技术追溯信息", { exact: true }).click();
  await expect(page.getByTestId("retention-proof")).toContainText("独立 experienceId 尚未接入");
});

test("PC05 freeze is approval-gated and execution writes audit without deleting assets", async ({ page }) => {
  await page.goto("/admin/students");
  await expect(page.getByTestId("account-status")).toContainText("正常");
  await page.getByTestId("account-governance-reason").fill("异常登录，需要暂时限制访问并保留全部历史事实。");
  await page.getByRole("button", { name: "提交冻结审批" }).click();
  await expect(page.getByTestId("governance-notice")).toContainText("不会在普通运营提交时直接改变");
  await expect(page.getByTestId("account-status")).toContainText("正常");

  await page.getByRole("link", { name: "权限与审批" }).click();
  await expect(page.getByTestId("execute-accountFreeze")).toBeDisabled();
  await page.getByTestId("operator-role").selectOption("superAdmin");
  await expect(page.getByTestId("execute-accountFreeze")).toBeEnabled();
  await page.getByTestId("execute-accountFreeze").click();
  await expect(page.getByTestId("approval-action-notice")).toContainText("审批已执行");
  await expect(page.getByText("异常登录，需要暂时限制访问并保留全部历史事实。", { exact: true })).toBeVisible();

  await page.getByRole("link", { name: "学生", exact: true }).click();
  await expect(page.getByTestId("account-status")).toContainText("已冻结");
  await page.getByRole("link", { name: "长期资产" }).click();
  for (const kind of ["Experience", "Result", "Certificate", "CourseAchievement", "VerificationRecord"]) {
    await expect(page.getByTestId(`asset-${kind}`)).toBeVisible();
  }
});

test("PC05 long-term assets keep technical metadata secondary without inventing parallel IDs", async ({ page }) => {
  await page.goto("/admin/assets");
  await expect(page.getByRole("heading", { name: "比赛结束了，可信成果仍然在" })).toBeVisible();
  await expect(page.getByText("competition-result-sanchuang-15", { exact: false })).not.toBeVisible();

  const experience = page.getByTestId("asset-Experience");
  await experience.getByText("数据来源与关系", { exact: true }).click();
  await expect(experience).toContainText("competitionId=sanchuang-15");
  await expect(experience).toContainText("独立 experienceId 尚未接入");

  for (const [kind, id] of [["Result", "competition-result-sanchuang-15"], ["Certificate", "cert-sanchuang-15"], ["CourseAchievement", "courseId=data-analytics"], ["VerificationRecord", "SC15-TOMZ-24001"]] as const) {
    const card = page.getByTestId(`asset-${kind}`);
    await card.getByText("数据来源与关系", { exact: true }).click();
    await expect(card).toContainText(id);
  }
  await expect(page.getByText(/不靠“删除”解决异常/)).toBeVisible();
});

test("PC05 governance closes PC01-PC04 with explicit mappings, scoped approval and cross-domain links", async ({ page }) => {
  await page.goto("/admin/governance");
  await expect(page.getByRole("heading", { name: "高风险操作需要审批" })).toBeVisible();
  await expect(page.getByTestId("pc-app-consistency")).toContainText("学生赛事身份");
  await expect(page.getByTestId("pc-app-consistency")).toContainText("不得把它等同 active / 官方资格");
  await expect(page.getByTestId("pc-app-consistency")).toContainText("不创建 CandidateRecord");
  await expect(page.getByTestId("pc-app-consistency")).toContainText("不建立“培训通过”第二状态");
  await expect(page.getByTestId("pc-app-consistency")).toContainText("revoked 保留历史对象");

  await page.getByText("PC01–PC05 回归状态", { exact: true }).click();
  for (const label of ["PC01", "PC02", "PC03", "PC04", "PC05"]) {
    await expect(page.getByText(label, { exact: true })).toBeVisible();
  }
  await expect(page.getByText("待独立评审", { exact: true }).last()).toBeVisible();
  await expect(page.getByRole("link", { name: "赛事 · sanchuang-16" })).toHaveAttribute("href", "/admin/competitions/objects/sanchuang-16");
  await expect(page.getByRole("link", { name: "合作主体 · northstar-beauty" })).toHaveAttribute("href", "/admin/organizations/northstar-beauty");
  await expect(page.getByRole("link", { name: "课程 · brand-ecommerce" })).toHaveAttribute("href", "/admin/pc04/courses/brand-ecommerce");
  await expect(page.getByRole("link", { name: "权益 · benefit-beauty-sample" })).toHaveAttribute("href", "/admin/pc04/benefits/benefit-beauty-sample");
  await expect(page.getByRole("link", { name: "机会 · intern-1" })).toHaveAttribute("href", "/admin/opportunities/intern-1");
});

import { expect, test } from "@playwright/test";

test.use({ viewport: { width: 1360, height: 940 } });

test("PC05 student console preserves App identity semantics and the explicit accountId gap", async ({ page }) => {
  await page.goto("/admin/students");
  await expect(page.getByRole("navigation", { name: "管理端主导航" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "学生 / 长期资产 + 权限治理 + PC 总回归" })).toBeVisible();
  await expect(page.getByText("Mobile session 尚未显式接入", { exact: false })).toBeVisible();
  await expect(page.getByText("林晓", { exact: true })).toBeVisible();

  const activeRow = page.getByRole("row").filter({ hasText: "sanchuang-16" });
  await expect(activeRow).toContainText("registrationOpen");
  await expect(activeRow).toContainText("active");
  await expect(activeRow).toContainText("approved");

  const endedRow = page.getByRole("row").filter({ hasText: "sanchuang-15" });
  await expect(endedRow).toContainText("ended");
  await expect(endedRow).toContainText("revoked");
  await expect(page.getByTestId("retention-proof")).toContainText("赛事期能力关闭");
  await expect(page.getByTestId("retention-proof")).toContainText("独立 experienceId 尚未接入");
});

test("PC05 freeze is approval-gated and execution writes audit without deleting assets", async ({ page }) => {
  await page.goto("/admin/students");
  await expect(page.getByTestId("account-status")).toContainText("active");
  await page.getByTestId("account-governance-reason").fill("异常登录，需要暂时限制访问并保留全部历史事实。");
  await page.getByRole("button", { name: "提交冻结审批" }).click();
  await expect(page.getByTestId("governance-notice")).toContainText("不会在普通运营提交时直接改变");
  await expect(page.getByTestId("account-status")).toContainText("active");

  await page.getByRole("link", { name: "权限 / 审计 / 审批" }).click();
  await expect(page.getByTestId("execute-accountFreeze")).toBeDisabled();
  await page.getByTestId("operator-role").selectOption("superAdmin");
  await expect(page.getByTestId("execute-accountFreeze")).toBeEnabled();
  await page.getByTestId("execute-accountFreeze").click();
  await expect(page.getByTestId("approval-action-notice")).toContainText("审批已执行");
  await expect(page.getByText("异常登录，需要暂时限制访问并保留全部历史事实。", { exact: true })).toBeVisible();

  await page.getByRole("link", { name: "学生控制台" }).click();
  await expect(page.getByTestId("account-status")).toContainText("frozen");
  await page.getByRole("link", { name: "长期资产" }).click();
  for (const kind of ["Experience", "Result", "Certificate", "CourseAchievement", "VerificationRecord"]) {
    await expect(page.getByTestId(`asset-${kind}`)).toBeVisible();
  }
});

test("PC05 long-term assets reuse current App keys instead of inventing parallel IDs", async ({ page }) => {
  await page.goto("/admin/assets");
  await expect(page.getByTestId("asset-Experience")).toContainText("competitionId=sanchuang-15");
  await expect(page.getByTestId("asset-Experience")).toContainText("独立 experienceId 尚未接入");
  await expect(page.getByTestId("asset-Result")).toContainText("competition-result-sanchuang-15");
  await expect(page.getByTestId("asset-Certificate")).toContainText("cert-sanchuang-15");
  await expect(page.getByTestId("asset-CourseAchievement")).toContainText("courseId=data-analytics");
  await expect(page.getByTestId("asset-VerificationRecord")).toContainText("SC15-TOMZ-24001");
  await expect(page.getByText(/不通过“删除记录”表达/)).toBeVisible();
});

test("PC05 governance closes PC01-PC04 with explicit PC-App mappings and cross-domain links", async ({ page }) => {
  await page.goto("/admin/governance");
  await expect(page.getByTestId("pc-app-consistency")).toContainText("CompetitionIdentity");
  await expect(page.getByTestId("pc-app-consistency")).toContainText("不得把它等同 active / 官方资格");
  await expect(page.getByTestId("pc-app-consistency")).toContainText("不创建 CandidateRecord");
  await expect(page.getByTestId("pc-app-consistency")).toContainText("不建立“培训通过”第二状态");
  await expect(page.getByTestId("pc-app-consistency")).toContainText("revoked 保留历史对象");

  for (const label of ["PC01", "PC02", "PC03", "PC04", "PC05"]) {
    await expect(page.getByText(label, { exact: true })).toBeVisible();
  }
  await expect(page.getByText("待独立评审", { exact: true }).last()).toBeVisible();
  await expect(page.getByRole("link", { name: /赛事 · sanchuang-16/ })).toHaveAttribute("href", "/admin/competitions/objects/sanchuang-16");
  await expect(page.getByRole("link", { name: /Organization · northstar-beauty/ })).toHaveAttribute("href", "/admin/organizations/northstar-beauty");
  await expect(page.getByRole("link", { name: /课程 · brand-ecommerce/ })).toHaveAttribute("href", "/admin/pc04/courses/brand-ecommerce");
  await expect(page.getByRole("link", { name: /权益 · benefit-beauty-sample/ })).toHaveAttribute("href", "/admin/pc04/benefits/benefit-beauty-sample");
  await expect(page.getByRole("link", { name: /机会 · intern-1/ })).toHaveAttribute("href", "/admin/opportunities/intern-1");
});

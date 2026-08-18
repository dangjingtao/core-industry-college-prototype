import { expect, test, type Page } from "@playwright/test";

test.use({ viewport: { width: 1280, height: 900 } });

async function showTechnical(page: Page) {
  const button = page.getByTestId("technical-mode-toggle");
  if ((await button.textContent())?.includes("显示技术信息")) await button.click();
}

test("PC04 stays inside the shared admin shell and presents derived course completion in business language", async ({ page }) => {
  await page.goto("/admin/pc04/courses/brand-ecommerce");
  await expect(page.getByRole("navigation", { name: "管理端主导航" })).toBeVisible();
  const permission = page.getByLabel("当前管理角色与数据范围");
  await expect(permission).toBeVisible();
  await expect(permission).not.toHaveAttribute("open", "");
  await permission.locator("summary").click();
  await expect(permission).toContainText("平台运营");
  await expect(permission).toContainText("PC01 全域查看 · 编辑按域授权");
  await expect(permission).toContainText("全平台（dev 原型）");
  await expect(page.getByRole("link", { name: "资源运营", exact: true })).toHaveClass(/text-text-brand/);
  await expect(page.getByTestId("course-completed-derived")).toContainText("未完成");

  await page.goto("/admin/pc04/courses/data-analytics");
  await expect(page.getByTestId("course-completed-derived")).toContainText("已完成");
});

test("PC04 course relations resolve by business names while stable ids stay technical", async ({ page }) => {
  await page.goto("/admin/pc04/courses/retail-project-lab");
  await page.getByRole("link", { name: /云栖零售项目课学习资格/ }).click();
  await expect(page).toHaveURL(/\/admin\/pc04\/benefits\/benefit-cloud-lab$/);
  await expect(page.getByRole("heading", { name: "云栖零售项目课学习资格", exact: true })).toBeVisible();
  await expect(page.getByText("权益 不存在")).toHaveCount(0);

  await page.goto("/admin/pc04/courses/brand-ecommerce");
  await expect(page.getByText("Certificate · cert-course-brand-ecommerce", { exact: true })).not.toBeVisible();
  await page.getByRole("link", { name: /品牌电商实战课课程证书/ }).click();
  await expect(page).toHaveURL(/\/admin\/pc04\/certificates\/cert-course-brand-ecommerce$/);
  await expect(page.getByRole("heading", { name: "品牌电商实战课课程证书", exact: true })).toBeVisible();
  await expect(page.getByText("证书 不存在")).toHaveCount(0);
});

test("PC04 course edits persist across list and detail navigation", async ({ page }) => {
  await page.goto("/admin/pc04/courses/brand-ecommerce/edit");
  await page.getByTestId("course-title").fill("品牌电商实战课 · 修订");
  await page.getByTestId("quiz-pass-score").fill("85");
  await page.getByRole("button", { name: "保存课程配置" }).click();
  await expect(page.getByTestId("course-saved")).toContainText("课程配置已保存");
  await page.getByRole("link", { name: "返回课程详情" }).click();
  await expect(page.getByRole("heading", { name: "品牌电商实战课 · 修订", exact: true })).toBeVisible();
  await expect(page.getByText("小测试配置及格线：85 分。", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: /课程列表/ }).click();
  await expect(page.getByRole("heading", { name: "品牌电商实战课 · 修订", exact: true })).toBeVisible();
});

test("PC04 benefit fulfillment save persists and rewrites the matching fulfillment detail", async ({ page }) => {
  await page.goto("/admin/pc04/benefits/benefit-beauty-sample/edit");
  await page.getByTestId("fulfillment-select").selectOption("code");
  await page.getByRole("button", { name: "保存权益配置" }).click();
  await expect(page.getByTestId("benefit-saved")).toContainText("权益配置已保存");
  await page.getByRole("link", { name: "返回权益详情" }).click();
  await expect(page.getByTestId("benefit-fulfillment-label")).toHaveText("兑换码 / 卡码");
  await expect(page.getByTestId("benefit-fulfillment-detail")).toContainText("兑换码 / 卡码");
  await expect(page.getByTestId("benefit-fulfillment-detail")).not.toContainText("线下工作人员核销");
});

test("PC04 benefits and certificates show human status labels by default and raw values only in technical mode", async ({ page }) => {
  await page.goto("/admin/pc04/benefits");
  await expect(page.getByText("benefit-campus-video", { exact: true })).not.toBeVisible();
  await expect(page.getByText("Runtime", { exact: false }).first()).not.toBeVisible();
  await expect(page.getByText("可领取", { exact: true }).first()).toBeVisible();
  await showTechnical(page);
  for (const id of [
    "benefit-campus-video",
    "benefit-beauty-sample",
    "benefit-cloud-lab",
    "benefit-sanchuang-course",
    "benefit-activity-ride",
    "benefit-history",
  ]) {
    await expect(page.getByText(id, { exact: true })).toBeVisible();
  }
  await expect(page.getByText(/Benefit · Runtime=/).first()).toBeVisible();

  await page.goto("/admin/pc04/certificates/cert-course-data-analytics");
  await expect(page.getByTestId("issuance-status")).toHaveText("已签发");
  await expect(page.getByTestId("claim-status")).toHaveText("待领取");
  await expect(page.getByText("issuanceStatus", { exact: false }).first()).not.toBeVisible();
  await expect(page.getByText("claimStatus", { exact: false }).first()).not.toBeVisible();
  await expect(page.getByText(/COURSE-DA-26001/)).not.toBeVisible();
  await showTechnical(page);
  await expect(page.getByTestId("certificate-status-raw")).toContainText("issuanceStatus=issued");
  await expect(page.getByTestId("certificate-status-raw")).toContainText("claimStatus=claimable");
  await expect(page.getByText(/COURSE-DA-26001/)).toBeVisible();

  await page.goto("/admin/pc04/certificates/cert-course-brand-ecommerce");
  await expect(page.getByTestId("issuance-status")).toHaveText("未触发");
  await expect(page.getByTestId("claim-status")).toHaveText("尚未生成领取记录");
  await expect(page.getByText("notTriggered", { exact: false }).first()).not.toBeVisible();
  await showTechnical(page);
  await expect(page.getByTestId("certificate-status-raw")).toContainText("issuanceStatus=notTriggered");
});

test("PC04 course default view is business language and technical mode restores raw model terms", async ({ page }) => {
  await page.goto("/admin/pc04/courses/brand-ecommerce");
  await expect(page.getByText("课程完成条件", { exact: true })).toBeVisible();
  await expect(page.getByText("学习进度：", { exact: false }).first()).toBeVisible();
  await expect(page.getByText("考试结果：", { exact: false }).first()).toBeVisible();
  for (const raw of ["Runtime", "Course Completed", "assessment=", "Organization ·", "Competition ·"]) {
    await expect(page.getByText(raw, { exact: false }).first()).not.toBeVisible();
  }

  await showTechnical(page);
  await expect(page.getByText("Course Completed", { exact: false }).first()).toBeVisible();
  await expect(page.getByText("assessment=", { exact: false }).first()).toBeVisible();
  await expect(page.getByText("Organization · northstar-beauty", { exact: false }).first()).toBeVisible();
  await expect(page.getByText("Competition · sanchuang-16", { exact: false }).first()).toBeVisible();
});

test("PC04 course chapter labels stay aligned with the current App course source", async ({ page }) => {
  await page.goto("/admin/pc04/courses/data-analytics");
  await expect(page.getByText("练习与考试", { exact: true })).toBeVisible();
  await expect(page.getByText("成果确认", { exact: true })).toBeVisible();
  await expect(page.getByText("练习与考试准备", { exact: true })).toHaveCount(0);
  await expect(page.getByText("成果确认测试", { exact: true })).toHaveCount(0);
});

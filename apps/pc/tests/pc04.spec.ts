import { expect, test } from "@playwright/test";

test.use({ viewport: { width: 1280, height: 900 } });

test("PC04 stays inside the canonical PC01 shell and derives Course Completed from progress plus passed assessment", async ({ page }) => {
  await page.goto("/admin/pc04/courses/brand-ecommerce");
  await expect(page.getByRole("navigation", { name: "管理端主导航" })).toBeVisible();
  await expect(page.getByLabel("当前管理角色与数据范围")).toContainText("平台运营");
  await expect(page.getByLabel("当前管理角色与数据范围")).toContainText("PC01 全域查看 · 编辑按域授权");
  await expect(page.getByLabel("当前管理角色与数据范围")).toContainText("全平台（dev 原型）");
  await expect(page.getByRole("link", { name: "资源运营", exact: true })).toHaveClass(/text-text-brand/);
  await expect(page.getByTestId("course-completed-derived")).toContainText("false");

  await page.goto("/admin/pc04/courses/data-analytics");
  await expect(page.getByTestId("course-completed-derived")).toContainText("true");
});

test("PC04 stable course relations resolve to real benefit and certificate objects", async ({ page }) => {
  await page.goto("/admin/pc04/courses/retail-project-lab");
  await page.getByRole("link", { name: "Benefit · benefit-cloud-lab" }).click();
  await expect(page).toHaveURL(/\/admin\/pc04\/benefits\/benefit-cloud-lab$/);
  await expect(page.getByRole("heading", { name: "云栖零售项目课学习资格", exact: true })).toBeVisible();
  await expect(page.getByText("权益 不存在")).toHaveCount(0);

  await page.goto("/admin/pc04/courses/brand-ecommerce");
  await page.getByRole("link", { name: "Certificate · cert-course-brand-ecommerce" }).click();
  await expect(page).toHaveURL(/\/admin\/pc04\/certificates\/cert-course-brand-ecommerce$/);
  await expect(page.getByRole("heading", { name: "品牌电商实战课课程证书", exact: true })).toBeVisible();
  await expect(page.getByText("证书 不存在")).toHaveCount(0);
});

test("PC04 course edits persist across list and detail navigation", async ({ page }) => {
  await page.goto("/admin/pc04/courses/brand-ecommerce/edit");
  await page.getByTestId("course-title").fill("品牌电商实战课 · 修订");
  await page.getByTestId("quiz-pass-score").fill("85");
  await page.getByRole("button", { name: "保存课程配置" }).click();
  await expect(page.getByTestId("course-saved")).toContainText("写入 PC04 会话状态");
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
  await expect(page.getByTestId("benefit-saved")).toContainText("写入 PC04 会话状态");
  await page.getByRole("link", { name: "返回权益详情" }).click();
  await expect(page.getByTestId("benefit-fulfillment-label")).toHaveText("兑换码 / 卡码");
  await expect(page.getByTestId("benefit-fulfillment-detail")).toContainText("兑换码 / 卡码");
  await expect(page.getByTestId("benefit-fulfillment-detail")).not.toContainText("线下工作人员核销");
});

test("PC04 covers all current App benefits and separates certificate issuance from claim state", async ({ page }) => {
  await page.goto("/admin/pc04/benefits");
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

  await page.goto("/admin/pc04/certificates/cert-course-data-analytics");
  await expect(page.getByTestId("issuance-status")).toContainText("issued");
  await expect(page.getByTestId("claim-status")).toContainText("claimable");
  await expect(page.getByText(/COURSE-DA-26001/)).toBeVisible();
  await expect(page.getByText("未签发", { exact: true })).toHaveCount(0);

  await page.goto("/admin/pc04/certificates/cert-course-brand-ecommerce");
  await expect(page.getByTestId("issuance-status")).toContainText("notTriggered");
  await expect(page.getByTestId("claim-status")).toContainText("尚未生成个人记录");
  await expect(page.getByText("未生成", { exact: true })).toHaveCount(3);
});

test("PC04 course chapter labels stay aligned with the current App course source", async ({ page }) => {
  await page.goto("/admin/pc04/courses/data-analytics");
  await expect(page.getByText("练习与考试", { exact: true })).toBeVisible();
  await expect(page.getByText("成果确认", { exact: true })).toBeVisible();
  await expect(page.getByText("练习与考试准备", { exact: true })).toHaveCount(0);
  await expect(page.getByText("成果确认测试", { exact: true })).toHaveCount(0);
});

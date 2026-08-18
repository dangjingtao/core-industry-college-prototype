import { expect, test } from "@playwright/test";

test.use({ viewport: { width: 1280, height: 900 } });

test("PC04 course control plane configures completion rules without rewriting CourseLearning", async ({ page }) => {
  await page.goto("/admin/resources");
  await page.getByRole("link", { name: /品牌电商实战课/ }).click();
  await expect(page).toHaveURL(/\/admin\/pc04\/courses\/brand-ecommerce$/);
  await expect(page.getByText("courseId", { exact: true })).toBeVisible();
  await expect(page.getByText("brand-ecommerce", { exact: true }).first()).toBeVisible();
  await expect(page.getByText(/视频学习进度 ≥ 100%/)).toBeVisible();
  await expect(page.getByText(/progress:/).first()).toContainText("38%");
  await expect(page.getByText(/assessment:/).first()).toContainText("idle");
  await expect(page.getByText(/默认不阻断官方赛事报名或 Workspace/)).toBeVisible();

  await page.getByRole("link", { name: "编辑课程配置" }).click();
  await page.getByTestId("quiz-pass-score").fill("85");
  await page.getByRole("button", { name: "保存课程配置" }).click();
  await expect(page.getByTestId("course-saved")).toContainText("没有改写个人 CourseLearning");
  await expect(page.getByText(/account × courseId/)).toBeVisible();
});

test("PC04 benefits expose exactly three fulfillment modes and explicit eligibility facts", async ({ page }) => {
  await page.goto("/admin/pc04/benefits");
  await expect(page.getByText("兑换码 / 卡码", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("外部领取链接", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("线下核销 / 人工履约", { exact: true }).first()).toBeVisible();

  await page.getByRole("link", { name: /北辰美妆校园体验权益/ }).click();
  await expect(page.getByText(/第十六届三创赛身份为 active/)).toBeVisible();
  await expect(page.getByText(/status:/).first()).toContainText("claimed");
  await page.getByRole("link", { name: "编辑权益配置" }).click();
  await expect(page.getByTestId("fulfillment-select").locator("option")).toHaveCount(3);
  await page.getByRole("button", { name: "保存权益配置" }).click();
  await expect(page.getByTestId("benefit-saved")).toContainText("个人领取/核销状态没有被改写");
});

test("PC04 certificates keep real issuer, verification and request-return trail traceable", async ({ page }) => {
  await page.goto("/admin/assets");
  await page.getByRole("link", { name: /第十五届三创赛参赛与项目成果证书/ }).click();
  await expect(page).toHaveURL(/\/admin\/pc04\/certificates\/cert-sanchuang-15$/);
  await expect(page.getByText("三创赛组委会", { exact: true })).toBeVisible();
  await expect(page.getByText(/SC15-TOMZ-24001/)).toBeVisible();
  await expect(page.getByRole("heading", { name: "申请 / 回流记录" })).toBeVisible();
  await expect(page.getByText(/不会把平台自有记录包装成外部权威签发/)).toBeVisible();

  await page.goto("/admin/pc04/certificates/cert-course-data-analytics");
  await expect(page.getByText(/条件满足后自动触发/)).toBeVisible();
  await expect(page.getByText(/不要求运营逐张点击发证/)).toBeVisible();
  await expect(page.getByText(/COURSE-DA-26001/)).toBeVisible();
});

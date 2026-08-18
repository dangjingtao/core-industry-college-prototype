import { expect, test } from "@playwright/test";

test.use({ viewport: { width: 1280, height: 900 } });

test("PC root exposes the PC01 control-plane foundation", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole("heading", { name: /把 App 的业务真相接进同一套 PC 控制面/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: "PC 管理端不是桌面版 App，而是手机端的数据控制面" })).toBeVisible();

  await expect(page.getByText("平台配置", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("API 同步", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("文件导入", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("人工修正", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Runtime", { exact: true }).first()).toBeVisible();

  await expect(page.getByRole("heading", { name: "Stable ID 统一展示" })).toBeVisible();
  await expect(page.getByText("Account stable ID 仍是明确缺口")).toBeVisible();
  await expect(page.getByText("新增全局 Task 真相源", { exact: true })).toBeVisible();

  await expect(page.getByRole("heading", { name: "APP → PC 数据接入地图" })).toBeVisible();
  await expect(page.getByText("/tasks", { exact: true })).toBeVisible();
  await expect(page.getByText("跨域派生 · 不建立独立管理域", { exact: true })).toBeVisible();
});

test("PC01 list detail and edit patterns keep stable ids and business relations traceable", async ({ page }) => {
  await page.goto("/admin/competitions");
  await expect(page.getByRole("heading", { name: "统一对象列表 Pattern" })).toBeVisible();

  await page.getByRole("link", { name: /第十六届全国大学生电子商务/ }).click();
  await expect(page).toHaveURL(/\/admin\/competitions\/objects\/sanchuang-16$/);
  await expect(page.getByText("competitionId", { exact: true })).toBeVisible();
  await expect(page.getByText("sanchuang-16", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("registrationOpen", { exact: true })).toBeVisible();
  await expect(page.getByText("API 同步", { exact: true }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "App 消费位置" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "稳定业务关系" })).toBeVisible();

  await page.getByRole("link", { name: /北辰美妆/ }).click();
  await expect(page).toHaveURL(/\/admin\/organizations\/objects\/northstar-beauty$/);
  await expect(page.getByText("organizationId", { exact: true })).toBeVisible();
  await expect(page.getByText("northstar-beauty", { exact: true }).first()).toBeVisible();
  await expect(page.getByText(/当前 Mobile 使用 companyId=northstar-beauty/)).toBeVisible();

  await page.getByRole("link", { name: "编辑 Pattern" }).click();
  await expect(page.getByRole("heading", { name: "统一编辑 Pattern" })).toBeVisible();
  await expect(page.getByTestId("stable-id-readonly")).toHaveValue("organizationId: northstar-beauty");
  await expect(page.getByText("人工修正原因", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /PC01 不写入业务真相/ })).toBeDisabled();
});

test("admin domains expose existing truth ownership instead of copied mobile stores", async ({ page }) => {
  await page.goto("/admin/resources");
  await expect(page.getByRole("heading", { name: "资源运营", exact: true })).toBeVisible();
  await expect(page.getByText("ResourceRelation", { exact: true })).toBeVisible();
  await expect(page.getByText("EligibilityRule", { exact: true })).toBeVisible();

  await page.goto("/admin/students");
  await expect(page.getByText("CompetitionIdentity", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Account ↔ CompetitionIdentity[]", { exact: true })).toBeVisible();
  await expect(page.getByText("accountId 未接入 × sanchuang-16", { exact: true })).toBeVisible();

  await page.getByRole("link", { name: /当前账号 × 第十六届三创赛/ }).click();
  await expect(page).toHaveURL(/\/admin\/students\/objects\/identity-sanchuang-16$/);
  await expect(page.getByText(/PC01 不复制这份数组/)).toBeVisible();
});

test("PC02 keeps platform school review separate from external official qualification", async ({ page }) => {
  await page.goto("/admin/competitions/objects/sanchuang-16");
  await expect(page.getByText("外部权威赛事事实", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("平台承接报名流程", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("核心产业学院叠加服务", { exact: true }).first()).toBeVisible();

  await expect(page.getByTestId("platform-review-status")).toHaveText("pending");
  await expect(page.getByTestId("official-qualification-status")).toHaveText("pending");
  await expect(page.getByTestId("workspace-gate")).toContainText("保持锁定");

  await page.getByRole("button", { name: "学校审核通过" }).click();
  await expect(page.getByTestId("platform-review-status")).toHaveText("approved");
  await expect(page.getByTestId("official-qualification-status")).toHaveText("pending");
  await expect(page.getByTestId("workspace-gate")).toContainText("保持锁定");

  await page.getByRole("button", { name: "模拟 API 回流：官方确认" }).click();
  await expect(page.getByTestId("official-qualification-status")).toHaveText("confirmed");
  await expect(page.getByTestId("workspace-gate")).toContainText("可进入");
});

test("PC02 applies captain-school review and hides workshop private content from school scope", async ({ page }) => {
  await page.goto("/admin/competitions/objects/sanchuang-16");
  await expect(page.getByText("跨校团队由队长所在学校统一审核整个团队", { exact: true })).toBeVisible();
  await expect(page.getByText("陈语", { exact: true })).toBeVisible();
  await expect(page.getByText("岭南科技学院", { exact: true })).toBeVisible();
  await expect(page.getByText(/统一归队长学校：华南商贸学院/).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Workshop 配置与赛事 scope" })).toBeVisible();
  await expect(page.getByText("Workshop 私人回答 / AI 内容", { exact: true }).last()).toBeVisible();
});

test("PC02 uses the same Competition console for a platform-configured partner event", async ({ page }) => {
  await page.goto("/admin/competitions/objects/innovation-cup-2026");
  await expect(page.getByRole("heading", { name: "2026 青年品牌创新挑战赛" })).toBeVisible();
  await expect(page.getByText("平台配置", { exact: true }).first()).toBeVisible();
  await expect(page.getByTestId("official-qualification-status")).toHaveText("notRequired");
  await expect(page.getByTestId("workspace-gate")).toContainText("可进入");
  await expect(page.getByText("同一 SchoolScope 模型适用于普通合作赛事，不建立三创赛专属学校权限表。", { exact: true })).toBeVisible();
});

test("registration portal remains an independent PC business entry", async ({ page }) => {
  await page.goto("/admin");
  const portalLink = page.getByRole("link", { name: "三创赛报名门户" });
  await expect(portalLink).toHaveAttribute("href", "/registration-portal/start");
  await portalLink.click();
  await expect(page.getByRole("heading", { name: "三创赛报名", level: 1 })).toBeVisible();
});
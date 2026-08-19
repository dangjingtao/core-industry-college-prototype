import { expect, test } from "@playwright/test";

test.use({ viewport: { width: 1360, height: 940 } });

test("PC06 switches environments and drills an alert into related log evidence", async ({ page }) => {
  await page.goto("/admin/observability");

  await expect(page.getByRole("heading", { name: "环境与日志" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "管理端主导航" }).getByRole("link", { name: "环境与日志" })).toBeVisible();
  await expect(page.getByTestId("environment-health")).toContainText("开发环境 · 正常");
  await expect(page.getByTestId("service-api")).toContainText("正常");
  await expect(page.getByTestId("log-filter-system")).toHaveAttribute("aria-pressed", "true");

  await page.getByTestId("environment-test").click();
  await expect(page.getByTestId("environment-health")).toContainText("测试环境 · 有警告");
  await expect(page.getByTestId("service-api")).toContainText("有警告");

  const syncAlert = page.getByTestId("alert-test-sync-alert");
  await expect(syncAlert).toContainText("三创赛数据同步失败 · 已持续 12 分钟");
  await expect(syncAlert).toContainText("未恢复");
  await syncAlert.getByRole("button", { name: "查看关联日志" }).click();

  await expect(page.getByTestId("log-filter-sync")).toHaveAttribute("aria-pressed", "true");
  const relatedLog = page.getByTestId("log-test-sync-timeout-1041");
  await expect(relatedLog).toContainText("三创赛数据同步连续失败");
  await expect(relatedLog).toContainText("外部报名数据源连续 4 次超时");
  await expect(page.getByText("connection timeout after 10000ms", { exact: false })).not.toBeVisible();
});

test("PC06 keeps operation audit in the existing governance surface", async ({ page }) => {
  await page.goto("/admin/observability");
  await page.getByRole("link", { name: "前往权限与审计 / Audit Log" }).click();
  await expect(page).toHaveURL(/\/admin\/governance$/);
  await expect(page.getByText("操作审计", { exact: true })).toBeVisible();
});

test("environment logs and permission audit are grouped under the 开发 module", async ({ page }) => {
  await page.goto("/admin/dev");
  await expect(page.getByRole("heading", { name: "开发" })).toBeVisible();
  await expect(page.getByTestId("pc-dev-module").getByRole("link", { name: "环境与日志" })).toBeVisible();
  await expect(page.getByTestId("pc-dev-module").getByRole("link", { name: "权限与审计" })).toBeVisible();

  const nav = page.getByRole("navigation", { name: "管理端主导航" });
  await expect(nav.getByRole("link", { name: "开发" })).toBeVisible();
  await expect(nav.getByRole("link", { name: "环境与日志" })).toBeVisible();
  await expect(nav.getByRole("link", { name: "权限与审计" })).toBeVisible();

  await nav.getByRole("link", { name: "环境与日志" }).click();
  await expect(page).toHaveURL(/\/admin\/observability$/);
  await expect(page.getByRole("heading", { name: "环境与日志" })).toBeVisible();

  await nav.getByRole("link", { name: "权限与审计" }).click();
  await expect(page).toHaveURL(/\/admin\/governance$/);
  await expect(page.getByText("操作审计", { exact: true })).toBeVisible();
});

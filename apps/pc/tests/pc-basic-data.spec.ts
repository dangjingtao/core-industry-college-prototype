import { expect, test } from "@playwright/test";

test.use({ viewport: { width: 1280, height: 900 } });

test("PC basic-data 侧栏菜单与路由都指向 /admin/basic-data 并显示学生 / 学校两个入口", async ({ page }) => {
  await page.goto("/admin/basic-data");

  await expect(page.getByRole("navigation", { name: "管理端主导航" })).toBeVisible();
  await expect(page.getByRole("link", { name: "基础数据管理", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /报名学生基础数据/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /参赛学校基础数据/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /赛事 \/ 赛道字典/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /证书 \/ 协议模板/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /导入与批处理/ })).toBeVisible();

  await expect(page.getByRole("heading", { name: "报名学生基础数据", exact: true })).toBeVisible();
  await expect(page.getByTestId("student-id-student-2024-chenyu")).toBeVisible();
});

test("学生 Profile 详情页能正确呈现 stable studentId 并链接回列表", async ({ page }) => {
  await page.goto("/admin/basic-data/students/student-2024-chenyu");
  await expect(page.getByRole("heading", { name: /陈语 · Profile/ })).toBeVisible();
  await expect(page.getByText("studentId · student-2024-chenyu", { exact: true })).toBeVisible();
  await expect(page.getByText("已通过可信校验", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "返回学生列表" }).click();
  await expect(page).toHaveURL(/\/admin\/basic-data\/students$/);
});

test("学校主数据详情页能正确呈现 stable organizationId 并区分主数据 vs 赛事范围", async ({ page }) => {
  await page.goto("/admin/basic-data/schools/org-lingnan-tech");
  await expect(page.getByRole("heading", { name: "岭南科技学院", exact: true })).toBeVisible();
  await expect(page.getByText("organizationId · org-lingnan-tech", { exact: true })).toBeVisible();
  await expect(page.getByText("赛事范围由赛事中心维护，不在学校主数据里直接编辑。", { exact: true })).toBeVisible();
});

test("字典与模板子菜单能进入对应页且带状态标签", async ({ page }) => {
  await page.goto("/admin/basic-data/dictionaries");
  await expect(page.getByRole("heading", { name: "赛事 / 赛道字典", exact: true })).toBeVisible();
  await expect(page.getByText("数字化运营实战", { exact: true })).toBeVisible();

  await page.goto("/admin/basic-data/templates");
  await expect(page.getByRole("heading", { name: "证书 / 协议模板", exact: true })).toBeVisible();
  await expect(page.getByText("课程完成证书模板", { exact: true })).toBeVisible();
});

test("导入与批处理能展示批次并显示成功 / 失败原因", async ({ page }) => {
  await page.goto("/admin/basic-data/imports");
  await expect(page.getByRole("heading", { name: "导入与批处理", exact: true })).toBeVisible();
  await expect(page.getByText("students-2026-fall.csv", { exact: true })).toBeVisible();
  await expect(page.getByText("缺少学校列；批次已退回", { exact: true })).toBeVisible();
});

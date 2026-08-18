import { expect, test } from "@playwright/test";

test("T013 structured task runs through freeze, async progress and result adoption", async ({ page }) => {
  await page.goto("/competitions/sanchuang-16/workspace/workshop/tasks/s2-market-feasibility/answer");
  await expect(page.getByRole("heading", { name: "动态答题", exact: true })).toBeVisible();

  await page.getByRole("button", { name: "抖音小店", exact: true }).click();
  await page.getByRole("button", { name: "头皮修护", exact: true }).click();
  await page.getByRole("button", { name: "用户访谈", exact: true }).click();
  await page.getByRole("button", { name: "3", exact: true }).click();
  await page.getByPlaceholder("写下团队当前真实情况…").fill("已有真实用户反馈和竞品截图，当前重点验证校园渠道的购买转化。");
  await page.getByRole("button", { name: "回答完毕，进入下一步", exact: true }).click();

  await expect(page.getByRole("heading", { name: "生成确认", exact: true })).toBeVisible();
  await expect(page.getByText(/预计算力消耗/)).toBeVisible();
  await expect(page.getByText(/结果对全队可见/)).toBeVisible();
  await page.getByRole("button", { name: "确认生成", exact: true }).click();

  await expect(page.getByRole("heading", { name: "任务进度", exact: true })).toBeVisible();
  await expect(page.getByText("已冻结 100 算力", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "模拟进入运行", exact: true }).click();
  await expect(page.getByText("68%", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "模拟生成完成", exact: true }).click();
  await page.getByRole("button", { name: "查看本任务成果", exact: true }).click();

  await expect(page.getByRole("heading", { name: "成果详情", exact: true })).toBeVisible();
  await expect(page.getByText(/评分概览/)).toBeVisible();
  await page.getByRole("button", { name: "编辑成果", exact: true }).click();
  await page.getByLabel("成果摘要").fill("已根据团队补充事实完成市场可行性分析，并保留待验证风险。");
  await page.getByRole("button", { name: "保存编辑", exact: true }).click();
  await page.getByRole("button", { name: "保存为新版本", exact: true }).click();
  await expect(page.getByText(/s2-market-feasibility-v1/)).toBeVisible();
  await page.getByRole("button", { name: "队长采纳并用于比赛", exact: true }).click();
  await expect(page.getByText("队长已采纳", { exact: true })).toBeVisible();
});

test("T013 compute ledger exposes historical spend and task settlement", async ({ page }) => {
  await page.goto("/competitions/sanchuang-16/workspace/workshop/compute");
  await expect(page.getByRole("heading", { name: "算力明细", exact: true })).toBeVisible();
  await expect(page.getByText("8240", { exact: true })).toBeVisible();
  await expect(page.getByText(/本周已用 1760/)).toBeVisible();
  await expect(page.getByText("OPC 赛事赞助发放", { exact: true })).toBeVisible();
  const reasons = page.locator("[data-reason]");
  await expect(reasons).toHaveCount(5);
  await expect(reasons.nth(0)).toHaveText("领取");
  await expect(reasons.nth(1)).toHaveText("任务实际消耗");
  await expect(reasons.nth(2)).toHaveText("任务实际消耗");
  await expect(reasons.nth(3)).toHaveText("释放冻结差额");
  await expect(reasons.nth(4)).toHaveText("失败退回");
  await expect(page.getByText(/创建任务时按上限冻结/)).toBeVisible();
});

test("T013 missing material keeps a task locked inside the competition", async ({ page }) => {
  await page.goto("/competitions/sanchuang-16/workspace/workshop/tasks/s4-weekly-review/answer");
  await expect(page.getByText("当前缺少任务材料", { exact: true })).toBeVisible();
  await expect(page.getByText("近 7 天经营数据", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "查看项目材料", exact: true })).toBeVisible();
});

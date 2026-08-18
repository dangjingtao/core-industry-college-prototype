import { expect, test } from "@playwright/test";

const workshop = "/competitions/sanchuang-16/workspace/workshop";

test("T013A S1 dynamic answer adapts, generates and keeps the correct report", async ({ page }) => {
  await page.goto(`${workshop}/results/result-s1-product-score`);
  const runtimeTools = page.getByText("Task Runtime 状态：completed", { exact: true });
  await runtimeTools.click();
  await page.getByRole("button", { name: "ready", exact: true }).click();

  await page.getByRole("button", { name: "返回", exact: true }).click();
  await expect(page.getByRole("heading", { name: "历史成果", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "返回", exact: true }).click();
  await expect(page.getByRole("heading", { name: "创赛工坊", exact: true })).toBeVisible();
  await page.getByRole("link", { name: "查看全部", exact: true }).click();
  await page.getByRole("link", { name: /项目洞察包/ }).click();
  await page.getByRole("button", { name: "开始任务", exact: true }).click();
  await expect(page.getByRole("heading", { name: "动态答题", exact: true })).toBeVisible();
  await expect(page.getByText("你的选品比较突出的优势是？", { exact: true })).toHaveCount(0);

  await page.getByRole("button", { name: /60-99元/ }).click();
  await expect(page.getByText("AI 正在分析您的回答，准备下一题……", { exact: true })).toBeVisible();
  await expect(page.getByText("你的选品比较突出的优势是？", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /成分差异化/ }).click();
  await page.getByRole("button", { name: "竞争分析", exact: true }).click();
  await page.getByRole("button", { name: "回答完毕，进入下一步", exact: true }).click();

  await expect(page.getByRole("heading", { name: "生成确认", exact: true })).toBeVisible();
  await expect(page.getByText("选品评分", { exact: true })).toBeVisible();
  await expect(page.getByText("作答完善度", { exact: true })).toBeVisible();
  await expect(page.getByText("本次冻结", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "确认生成", exact: true }).click();

  await expect(page.getByRole("heading", { name: "任务进度", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "模拟开始生成", exact: true }).click();
  await page.getByRole("button", { name: "模拟完成", exact: true }).click();
  await page.getByRole("button", { name: "查看成果详情", exact: true }).click();

  await expect(page.getByRole("heading", { name: "成果详情", exact: true })).toBeVisible();
  await expect(page.getByText("选品评分小报告", { exact: true })).toBeVisible();
  await expect(page.getByText("六维项目评估", { exact: true })).toBeVisible();
  await expect(page.getByText("风险项与缺失证据", { exact: true })).toHaveCount(0);
});

test("T013A S2 survives leaving the progress page and supports result actions", async ({ page }) => {
  await page.goto(`${workshop}/skills/s2`);
  await page.getByRole("button", { name: "开始任务", exact: true }).click();

  await page.getByRole("button", { name: /抖音小店/ }).click();
  await page.getByRole("button", { name: /植物萃取\/无硅油/ }).click();
  await page.getByRole("button", { name: "市场可行性", exact: true }).click();
  await page.getByRole("button", { name: "回答完毕，进入下一步", exact: true }).click();

  await expect(page.getByText("当前可用", { exact: true })).toBeVisible();
  await expect(page.getByText("820", { exact: true })).toBeVisible();
  await expect(page.getByText("100", { exact: true })).toBeVisible();
  await expect(page.getByText("结果对全队可见", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "确认生成", exact: true }).click();

  await expect(page.getByText("你可以离开，完成后会通知你…", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "返回工作台", exact: true }).click();
  await expect(page.getByRole("heading", { name: "创赛工坊", exact: true })).toBeVisible();
  await expect(page.getByText("运行中", { exact: true }).first()).toBeVisible();
  await page.getByRole("button", { name: "查看任务进度", exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`${workshop}/tasks/s2-market-feasibility/progress$`));

  await page.getByRole("button", { name: "模拟开始生成", exact: true }).click();
  await page.getByRole("button", { name: "模拟完成", exact: true }).click();
  await page.getByRole("button", { name: "查看成果详情", exact: true }).click();

  await expect(page.getByText("市场可行性分析小报告", { exact: true })).toBeVisible();
  await expect(page.getByText("风险项与缺失证据", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "编辑", exact: true }).click();
  const detail = page.locator("textarea");
  await detail.fill("团队补充：先验证投放数据与竞品定价，再决定是否扩大预算。");
  await page.getByRole("button", { name: "保存编辑", exact: true }).click();
  await expect(page.getByText("团队补充：先验证投放数据与竞品定价，再决定是否扩大预算。", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "分享", exact: true }).click();
  await expect(page.getByRole("button", { name: "已分享", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "队长提交确认", exact: true }).click();
  await expect(page.getByRole("button", { name: "队长已确认", exact: true })).toBeVisible();

  await page.getByRole("button", { name: "返回", exact: true }).click();
  await expect(page.getByRole("heading", { name: "历史成果", exact: true })).toBeVisible();
  await expect(page.getByText("市场可行性分析小报告", { exact: true })).toBeVisible();
});

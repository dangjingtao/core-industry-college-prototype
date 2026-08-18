import { expect, test } from "@playwright/test";

const workshop = "/competitions/sanchuang-16/workspace/workshop";

async function navigateInsideSpa(page: import("@playwright/test").Page, path: string) {
  await page.evaluate(nextPath => {
    window.history.pushState({}, "", nextPath);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }, path);
}

test("T013A S1 reveals questions progressively and keeps the Mockplus report shape", async ({ page }) => {
  await page.goto(`${workshop}/results/result-s1-product-score`);
  await page.getByText("Task Runtime 状态：completed", { exact: true }).click();
  await page.getByRole("button", { name: "ready", exact: true }).click();
  await navigateInsideSpa(page, `${workshop}/tasks/s1-product-score/answer`);

  await expect(page.getByRole("heading", { name: "动态答题", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "选品评分", exact: true })).toBeVisible();
  await expect(page.getByText("选品比较突出的优势是？", { exact: false })).toHaveCount(0);

  await page.getByRole("button", { name: "60–99 元", exact: true }).click();
  await expect(page.getByTestId("dynamic-next-question")).toBeVisible();
  await expect(page.getByText("AI 正在分析您的回答，准备下一题……", { exact: true })).toBeVisible();
  await expect(page.getByText("选品比较突出的优势是？", { exact: false })).toBeVisible();
  await page.getByRole("button", { name: "成分差异化", exact: true }).click();
  await page.getByRole("button", { name: "校园女性", exact: true }).click();
  await page.getByRole("button", { name: "竞争分析", exact: true }).click();

  await expect(page.getByText("100%", { exact: true }).first()).toBeVisible();
  await page.getByPlaceholder("写下团队当前真实情况…").fill("希望重点验证同价位竞品与首单产能。");
  await page.getByRole("button", { name: "回答完毕，进入下一步", exact: true }).click();

  await expect(page.getByRole("heading", { name: "生成确认", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "选品评分", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "AI 已提取的核心信息", exact: true })).toBeVisible();
  await expect(page.getByText("作答完善度", { exact: true })).toBeVisible();
  await expect(page.getByText("确认后冻结 100 算力", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "确认生成", exact: true }).click();

  await expect(page.getByRole("heading", { name: "任务进度", exact: true })).toBeVisible();
  await expect(page.getByText("已冻结 100 算力", { exact: true })).toBeVisible();
  await expect(page.getByText("已冻结算力", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "模拟进入运行", exact: true }).click();
  await page.getByRole("button", { name: "模拟生成完成", exact: true }).click();
  await page.getByRole("button", { name: "查看本任务成果", exact: true }).click();

  await expect(page.getByRole("heading", { name: "选品评分小报告", exact: true })).toBeVisible();
  await expect(page.getByText("薄弱环节", { exact: true })).toBeVisible();
  await expect(page.getByText(/· 风险：/)).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "详细分析", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "六维项目评估", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "分享", exact: true }).click();
  await expect(page.getByRole("button", { name: "已分享", exact: true })).toBeVisible();
});

test("T013A S2 survives leaving progress and persists member confirmation for captain adoption", async ({ page }) => {
  await page.goto(`${workshop}/tasks/s2-market-feasibility/answer`);
  await expect(page.getByText("产品的核心卖点是什么？", { exact: false })).toHaveCount(0);

  await page.getByRole("button", { name: "抖音小店", exact: true }).click();
  await expect(page.getByText("产品的核心卖点是什么？", { exact: false })).toBeVisible();
  await page.getByRole("button", { name: "头皮修护", exact: true }).click();
  await page.getByRole("button", { name: "用户访谈", exact: true }).click();
  await page.getByRole("button", { name: "3", exact: true }).click();
  await page.getByPlaceholder("写下团队当前真实情况…").fill("已有用户访谈与竞品截图，重点验证校园渠道转化。");
  await page.getByRole("button", { name: "回答完毕，进入下一步", exact: true }).click();

  await expect(page.getByRole("heading", { name: "市场可行性分析", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "AI 已提取的核心信息", exact: true })).toBeVisible();
  await expect(page.getByTestId("review-card-team").getByText(/队员可编辑后提交确认/)).toBeVisible();
  await page.getByRole("button", { name: "确认生成", exact: true }).click();

  await expect(page.getByText("任务可离开页面，完成后会通过站内消息通知。", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "返回工作台", exact: true }).click();
  await expect(page.getByRole("heading", { name: "创赛工坊", exact: true })).toBeVisible();
  await page.getByTestId("workshop-call-hero-primary").click();
  await expect(page).toHaveURL(new RegExp(`${workshop}/tasks/s2-market-feasibility/progress$`));
  await expect(page.getByText("已冻结 100 算力", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "模拟进入运行", exact: true }).click();
  await page.getByRole("button", { name: "模拟生成完成", exact: true }).click();
  await page.getByRole("button", { name: "查看本任务成果", exact: true }).click();

  const resultPath = `${workshop}/results/result-s2-market-feasibility`;
  await expect(page.getByRole("heading", { name: "市场可行性分析小报告", exact: true })).toBeVisible();
  await expect(page.getByText("薄弱环节与风险", { exact: true })).toBeVisible();
  await expect(page.getByText(/· 风险：/).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "详细分析", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "编辑成果", exact: true }).click();
  await page.getByLabel("成果摘要").fill("团队补充：先验证投放数据与竞品定价，再决定是否扩大预算。");
  await page.getByRole("button", { name: "保存编辑", exact: true }).click();
  await expect(page.getByText("团队补充：先验证投放数据与竞品定价，再决定是否扩大预算。", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "分享", exact: true }).click();
  await expect(page.getByRole("button", { name: "已分享", exact: true })).toBeVisible();

  await navigateInsideSpa(page, `${resultPath}?prototypeRole=member`);
  await page.getByRole("button", { name: "提交队长确认", exact: true }).click();
  await expect(page.getByText("已提交队长确认", { exact: true }).first()).toBeVisible();

  await navigateInsideSpa(page, `${workshop}/results`);
  await expect(page.getByRole("heading", { name: "历史成果", exact: true })).toBeVisible();
  await navigateInsideSpa(page, `${resultPath}?prototypeRole=member`);
  await expect(page.getByText("已提交队长确认", { exact: true }).first()).toBeVisible();

  await navigateInsideSpa(page, resultPath);
  await expect(page.getByTestId("result-confirmation-pending")).toBeVisible();
  await expect(page.getByText("队员已提交确认", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "队长采纳并用于比赛", exact: true }).click();
  await expect(page.getByText("队长已采纳", { exact: true })).toBeVisible();
});

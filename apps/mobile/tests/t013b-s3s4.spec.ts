import { expect, test } from "@playwright/test";

async function next(page: Parameters<typeof test>[0] extends never ? never : any) {
  await page.getByRole("button", { name: "继续下一题", exact: true }).click();
}

test("T013B S3 copy flow keeps dynamic Q&A, shared runtime and copy result cards", async ({ page }) => {
  await page.goto("/competitions/sanchuang-16/workspace/workshop/tasks/s3-copy-kit/answer");
  await expect(page.getByRole("heading", { name: "动态答题", exact: true })).toBeVisible();
  await expect(page.getByTestId("t013b-dynamic-question")).toContainText("本次主要发布平台");

  await page.getByRole("button", { name: "小红书", exact: true }).click();
  await expect(page.getByTestId("t013b-ai-next-feedback")).toContainText("AI 正在分析回答，准备下一题");
  await next(page);
  await page.getByRole("button", { name: "销售转化", exact: true }).click();
  await next(page);
  await page.getByRole("button", { name: "产品核心卖点", exact: true }).click();
  await next(page);
  await page.getByRole("button", { name: "轻松种草", exact: true }).click();
  await expect(page.getByTestId("t013b-completeness")).toContainText("100%");
  await page.getByRole("button", { name: "进入生成确认", exact: true }).click();

  await expect(page.getByRole("heading", { name: "生成确认", exact: true })).toBeVisible();
  await expect(page.getByText("AI 提取核心信息", { exact: true })).toBeVisible();
  await expect(page.getByTestId("review-card-team")).toContainText("队员可编辑后提交确认");
  await page.getByRole("button", { name: "确认生成", exact: true }).click();

  await expect(page.getByRole("heading", { name: "任务进度", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "生成小红书种草图文 / 脚本", exact: true })).toBeVisible();
  await expect(page.getByText("已冻结 80 算力", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "模拟进入运行", exact: true }).click();
  await page.getByRole("button", { name: "模拟生成完成", exact: true }).click();
  await page.getByRole("button", { name: "查看本任务成果", exact: true }).click();

  await expect(page.getByRole("heading", { name: "文案成果详情", exact: true })).toBeVisible();
  for (const label of ["标题", "详情页文案", "短视频脚本", "直播脚本 / 话术", "客服话术"]) {
    await expect(page.getByText(label, { exact: true })).toBeVisible();
  }
  await expect(page.getByRole("button", { name: "编辑成果", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "分享成果", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "队长采纳并用于比赛", exact: true })).toBeVisible();

  await page.goto("/competitions/sanchuang-16/workspace/workshop/results");
  await expect(page.getByText("平台运营文案包", { exact: true })).toBeVisible();
  await page.getByTestId("results-tab-adopted").click();
  await expect(page.getByText("选品评分与方向研判", { exact: true })).toBeVisible();
});

test("T013B S3 visual flow stays independent and labels mock image/video assets", async ({ page }) => {
  await page.goto("/competitions/sanchuang-16/workspace/workshop/tasks/s3-visual-kit/answer");
  await page.getByRole("button", { name: "商品主图", exact: true }).click();
  await page.getByRole("button", { name: "短视频分镜", exact: true }).click();
  await next(page);
  await page.getByRole("button", { name: "宿舍", exact: true }).click();
  await next(page);
  await page.getByRole("button", { name: "真实体验", exact: true }).click();
  await next(page);
  await page.getByRole("button", { name: "产品包装", exact: true }).click();
  await page.getByRole("button", { name: "进入生成确认", exact: true }).click();

  await expect(page.getByTestId("t013b-prototype-media-note")).toContainText("不调用真实图片或视频生成服务");
  await page.getByRole("button", { name: "确认生成", exact: true }).click();
  await expect(page.getByText("生成图片 / 视频示例素材", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "模拟进入运行", exact: true }).click();
  await page.getByRole("button", { name: "模拟生成完成", exact: true }).click();
  await page.getByRole("button", { name: "查看本任务成果", exact: true }).click();

  await expect(page.getByRole("heading", { name: "图片 / 视频成果", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "图片素材区域", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "视频素材区域", exact: true })).toBeVisible();
  await expect(page.getByText("原型示例成果", { exact: true })).toBeVisible();
  await expect(page.getByText(/没有调用真实生成服务/)).toBeVisible();
});

test("T013B S4 enters by dynamic Q&A without forcing Excel and produces weekly report", async ({ page }) => {
  await page.goto("/competitions/sanchuang-16/workspace/workshop/tasks/s4-weekly-review/answer");
  await expect(page.getByRole("heading", { name: "动态答题", exact: true })).toBeVisible();
  await expect(page.getByText(/不上传也可以继续完成经营周报分析/)).toBeVisible();

  await page.getByRole("button", { name: "GMV / 销售额", exact: true }).click();
  await next(page);
  await page.getByRole("button", { name: "同比 / 环比趋势", exact: true }).click();
  await page.getByRole("button", { name: "异常波动预警", exact: true }).click();
  await next(page);
  await page.getByRole("button", { name: "流量增长但成交没跟上", exact: true }).click();
  await next(page);
  await page.getByRole("button", { name: "调整渠道投入", exact: true }).click();
  await page.getByRole("button", { name: "进入生成确认", exact: true }).click();

  await expect(page.getByText("经营周报分析小报告", { exact: true })).toBeVisible();
  await expect(page.getByTestId("t013b-core-facts")).toContainText("GMV / 销售额");
  await page.getByRole("button", { name: "确认生成", exact: true }).click();
  await expect(page.getByText("生成经营周报分析小报告", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "模拟进入运行", exact: true }).click();
  await page.getByRole("button", { name: "模拟生成完成", exact: true }).click();
  await page.getByRole("button", { name: "查看本任务成果", exact: true }).click();

  await expect(page.getByRole("heading", { name: "经营周报分析", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "核心发现 / 关键结论", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "薄弱环节", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "优先行动清单", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "详细分析", exact: true })).toBeVisible();
  await expect(page.getByTestId("s4-rating")).toContainText("报告评级与多维评估");
});

import { expect, test, type Page } from "@playwright/test";

const workshop = "/competitions/sanchuang-16/workspace/workshop";

async function navigateInsideSpa(page: Page, path: string) {
  await page.evaluate(nextPath => {
    window.history.pushState({}, "", nextPath);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }, path);
}

async function completeS3Context(page: Page) {
  await page.goto(`${workshop}/tasks/s3-copy-kit/answer`);
  await expect(page.getByTestId("t013b-dynamic-question")).toContainText("本次主要发布平台");
  await page.getByRole("button", { name: "小红书", exact: true }).click();
  await expect(page.getByTestId("t013b-ai-next-feedback")).toContainText("AI 正在分析回答，准备下一题");
  await page.getByRole("button", { name: "继续下一题", exact: true }).click();
  await expect(page.getByTestId("t013b-dynamic-question")).toContainText("本次内容运营最重要的目标");
  await page.getByRole("button", { name: "销售转化", exact: true }).click();
  await expect(page.getByTestId("t013b-completeness")).toContainText("100%");
  await page.getByRole("button", { name: "进入生成确认", exact: true }).click();
}

test("T013B S3 follows Mockplus 108 with only platform and goal before copy generation", async ({ page }) => {
  await page.goto(`${workshop}/tasks/s3-copy-kit/answer`);
  await expect(page.getByRole("heading", { name: "动态答题", exact: true })).toBeVisible();
  await expect(page.getByText("最希望优先表达哪些产品 / 项目信息？", { exact: true })).toHaveCount(0);
  await expect(page.getByText("希望内容保持什么表达风格？", { exact: true })).toHaveCount(0);

  await page.getByRole("button", { name: "小红书", exact: true }).click();
  await page.getByRole("button", { name: "继续下一题", exact: true }).click();
  await page.getByRole("button", { name: "销售转化", exact: true }).click();

  await expect(page.getByTestId("t013b-completeness")).toContainText("100%");
  await expect(page.getByRole("heading", { name: "补充说明（选填）", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "补充素材（选填）", exact: true })).toBeVisible();
  await page.getByPlaceholder("补充团队自己的判断、限制或背景…").fill("优先验证校园内容转化，不额外增加问卷字段。");
  await page.getByRole("button", { name: "进入生成确认", exact: true }).click();

  await expect(page.getByRole("heading", { name: "生成确认", exact: true })).toBeVisible();
  await expect(page.getByTestId("t013b-core-facts")).toContainText("小红书");
  await expect(page.getByTestId("t013b-core-facts")).toContainText("销售转化");
  await expect(page.getByRole("button", { name: "改为图片 / 视频内容生成", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "确认生成", exact: true }).click();

  await expect(page.getByRole("heading", { name: "生成小红书种草图文 / 脚本", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "模拟进入运行", exact: true }).click();
  await page.getByRole("button", { name: "模拟生成完成", exact: true }).click();
  await page.getByRole("button", { name: "查看本任务成果", exact: true }).click();

  await expect(page.getByRole("heading", { name: "文案成果详情", exact: true })).toBeVisible();
  for (const label of ["标题", "详情页文案", "短视频脚本", "直播脚本 / 话术", "客服话术"]) {
    await expect(page.getByText(label, { exact: true })).toBeVisible();
  }
});

test("T013B S3 visual uses the same S3 context and enters Mockplus 110 directly", async ({ page }) => {
  await completeS3Context(page);
  await page.getByRole("button", { name: "改为图片 / 视频内容生成", exact: true }).click();

  await expect(page.getByRole("heading", { name: "图片 / 视频生成确认", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "图片 / 视频内容生成", exact: true })).toBeVisible();
  await expect(page.getByText(/直接复用同一轮 S3 的平台、运营目标/)).toBeVisible();
  await expect(page.getByTestId("t013b-core-facts")).toContainText("小红书");
  await expect(page.getByTestId("t013b-core-facts")).toContainText("销售转化");
  for (const invented of ["这次希望生成哪类图片 / 视频内容？", "内容优先出现哪些使用场景？", "画面最需要传达什么？", "哪些元素不能被 AI 随意修改？"]) {
    await expect(page.getByText(invented, { exact: true })).toHaveCount(0);
  }
  await expect(page.getByTestId("t013b-prototype-media-note")).toContainText("不调用真实图片或视频生成服务");

  await page.getByRole("button", { name: "确认生成", exact: true }).click();
  await expect(page.getByRole("heading", { name: "生成图片 / 视频示例素材", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "模拟进入运行", exact: true }).click();
  await page.getByRole("button", { name: "模拟生成完成", exact: true }).click();
  await page.getByRole("button", { name: "查看本任务成果", exact: true }).click();

  await expect(page.getByRole("heading", { name: "图片 / 视频成果", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "图片素材区域", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "视频素材区域", exact: true })).toBeVisible();
  await expect(page.getByText(/没有调用真实生成服务/)).toBeVisible();
});

test("T013B S4 follows Mockplus 123 two questions and persists member pending confirmation", async ({ page }) => {
  await page.goto(`${workshop}/tasks/s4-weekly-review/answer`);
  await expect(page.getByRole("heading", { name: "动态答题", exact: true })).toBeVisible();
  await expect(page.getByText("团队目前最想解释的异常是什么？", { exact: true })).toHaveCount(0);
  await expect(page.getByText("复盘后最希望得到哪类行动建议？", { exact: true })).toHaveCount(0);

  await page.getByRole("button", { name: "GMV / 销售额", exact: true }).click();
  await page.getByRole("button", { name: "继续下一题", exact: true }).click();
  await expect(page.getByRole("button", { name: "下阶段目标", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "复购与留存", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "转化漏斗变化", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "同比 / 环比趋势", exact: true }).click();
  await page.getByRole("button", { name: "异常波动预警", exact: true }).click();
  await expect(page.getByTestId("t013b-completeness")).toContainText("100%");
  await expect(page.getByText(/不上传也可以继续完成经营周报分析/)).toBeVisible();
  await page.getByRole("button", { name: "进入生成确认", exact: true }).click();

  await expect(page.getByTestId("t013b-core-facts")).toContainText("GMV / 销售额");
  await page.getByRole("button", { name: "确认生成", exact: true }).click();
  await expect(page.getByRole("heading", { name: "生成经营周报分析小报告", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "模拟进入运行", exact: true }).click();
  await page.getByRole("button", { name: "模拟生成完成", exact: true }).click();
  await page.getByRole("button", { name: "查看本任务成果", exact: true }).click();

  await expect(page.getByRole("heading", { name: "经营周报分析", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "核心发现 / 关键结论", exact: true })).toBeVisible();
  await expect(page.getByTestId("s4-rating")).toContainText("报告评级与多维评估");

  await page.getByText("成果角色原型", { exact: true }).click();
  await page.getByRole("button", { name: "模拟队员视角", exact: true }).click();
  await page.getByRole("button", { name: "编辑成果", exact: true }).click();
  await page.getByLabel("成果摘要").fill("队员修订：本周先验证详情页到加购的转化损耗。");
  await page.getByRole("button", { name: "保存编辑并提交确认", exact: true }).click();
  await expect(page.getByText("已提交队长确认", { exact: true }).first()).toBeVisible();

  await navigateInsideSpa(page, `${workshop}/results`);
  await expect(page.getByRole("heading", { name: "工坊成果", exact: true })).toBeVisible();
  await navigateInsideSpa(page, `${workshop}/results/result-s4-weekly-review`);
  await expect(page.getByTestId("result-confirmation-pending")).toBeVisible();
  await expect(page.getByText("队员已提交确认", { exact: true })).toBeVisible();
  await expect(page.getByText("队员修订：本周先验证详情页到加购的转化损耗。", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "队长采纳并用于比赛", exact: true }).click();
  await expect(page.getByText("队长已采纳", { exact: true })).toBeVisible();
  await expect(page.getByTestId("result-confirmation-pending")).toHaveCount(0);
});

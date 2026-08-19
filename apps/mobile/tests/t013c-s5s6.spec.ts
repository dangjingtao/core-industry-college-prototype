import { expect, test } from "@playwright/test";

const workshop = "/competitions/sanchuang-16/workspace/workshop";

async function answerCurrent(page: import("@playwright/test").Page, option: string) {
  await page.getByRole("button", { name: option, exact: true }).click();
}

test("T013C S5 keeps precheck and PPT as two separate dynamic questionnaires", async ({ page }) => {
  await page.goto(`${workshop}/tasks/s5-score-precheck/answer`);

  await expect(page.getByRole("heading", { name: "赛事评分预检", exact: true })).toBeVisible();
  await expect(page.getByTestId("t013c-dynamic-question")).toContainText("当前项目已经推进到哪个阶段");
  await answerCurrent(page, "已上线运营并有数据");
  await expect(page.getByTestId("t013c-ai-next-feedback")).toContainText("AI 正在分析回答，准备下一题");
  await page.getByRole("button", { name: "继续下一题", exact: true }).click();

  await expect(page.getByTestId("t013c-dynamic-question")).toContainText("目前已经具备哪些比赛材料");
  await answerCurrent(page, "路演 PPT");
  await answerCurrent(page, "经营数据");
  await answerCurrent(page, "用户调研");
  await expect(page.getByTestId("t013c-completeness")).toContainText("100%");
  await page.getByRole("button", { name: "完成预检，继续 PPT 问答", exact: true }).click();

  await expect(page.getByRole("heading", { name: "路演 PPT", exact: true })).toBeVisible();
  await expect(page.getByTestId("t013c-dynamic-question")).toContainText("本次路演预计时长");
  await answerCurrent(page, "8 分钟");
  await page.getByRole("button", { name: "继续下一题", exact: true }).click();
  await answerCurrent(page, "市场证据");
  await answerCurrent(page, "经营数据");
  await page.getByRole("button", { name: "继续下一题", exact: true }).click();
  await expect(page.getByTestId("t013c-dynamic-question")).toContainText("是否还有要点需要补充");
  await answerCurrent(page, "还有补充");
  await expect(page.getByRole("heading", { name: "上传其它数据（选填）", exact: true })).toBeVisible();
  await page.getByPlaceholder("补充路演必须保留的事实、叙事重点或限制…").fill("真实经营数据必须保留来源说明。");
  await page.getByRole("button", { name: "回答完毕，进入下一步", exact: true }).click();

  await expect(page.getByRole("heading", { name: "PPT 生成确认", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "基于用户方案生成可直接使用的路演 PPT", exact: true })).toBeVisible();
  await expect(page.getByTestId("t013c-core-facts")).toContainText("已上线运营并有数据");
  await expect(page.getByTestId("t013c-team-visibility")).toContainText("结果对全队可见");
  await expect(page.getByTestId("t013c-review-freeze")).toContainText("原型规则");
  await page.getByRole("button", { name: "确认生成", exact: true }).click();

  await expect(page.getByRole("heading", { name: "生成路演 PPT", exact: true })).toBeVisible();
  await expect(page.getByText("任务可离开页面，完成后会通过站内消息通知。", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "模拟进入运行", exact: true }).click();
  await page.getByRole("button", { name: "模拟生成完成", exact: true }).click();
  await page.getByRole("button", { name: "查看本任务成果", exact: true }).click();

  await expect(page.getByRole("heading", { name: "PPT 成果详情", exact: true })).toBeVisible();
  await expect(page.getByTestId("s5-ppt-mock-note")).toContainText("不是真实生成的 .pptx 文件");
  await expect(page.getByTestId("s5-ppt-mock-note")).toContainText("不代表已向任何官方赛事系统提交");
  await expect(page.getByTestId("s5-slide-09")).toContainText("结尾与答辩");
  await expect(page.getByRole("button", { name: "编辑成果", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "分享成果", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "队长采纳并用于比赛", exact: true })).toBeVisible();
});

test("T013C S6 company recommendation is private, explainable and reuses stable company routes", async ({ page }) => {
  await page.goto(`${workshop}/tasks/s6-company-match/answer`);

  await expect(page.getByRole("heading", { name: "公司推荐", exact: true })).toBeVisible();
  await answerCurrent(page, "互联网 / 科技");
  await answerCurrent(page, "数据服务");
  await page.getByRole("button", { name: "继续下一题", exact: true }).click();
  await answerCurrent(page, "深圳");
  await page.getByRole("button", { name: "继续下一题", exact: true }).click();
  await answerCurrent(page, "数据分析");
  await expect(page.getByTestId("t013c-completeness")).toContainText("100%");
  await page.getByRole("button", { name: "回答完毕，进入下一步", exact: true }).click();

  await expect(page.getByRole("heading", { name: "公司推荐生成确认", exact: true })).toBeVisible();
  await expect(page.getByTestId("s6-private-visibility")).toContainText("生成结果仅自己可见");
  await expect(page.getByTestId("s6-private-visibility")).toContainText("AI 建议");
  await expect(page.getByText("结果对全队可见", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "确认生成", exact: true }).click();

  await expect(page.getByRole("heading", { name: "生成公司推荐小报告", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "模拟进入运行", exact: true }).click();
  await page.getByRole("button", { name: "模拟生成完成", exact: true }).click();
  await page.getByRole("button", { name: "查看本任务成果", exact: true }).click();

  await expect(page.getByRole("heading", { name: "公司推荐小报告", exact: true })).toBeVisible();
  await expect(page.getByTestId("s6-private-visibility")).toContainText("不会写入 StudentProfile");
  await expect(page.getByTestId("s6-no-score")).toContainText("没有“人才总分”");
  await expect(page.getByTestId("s6-company-cloud-retail")).toBeVisible();
  await expect(page.locator('[data-company-id="cloud-retail"]')).toHaveAttribute("href", "/companies/cloud-retail");
  await expect(page.getByText("队长采纳并用于比赛", { exact: true })).toHaveCount(0);
});

test("T013C six-stage matrix exposes S1 through S6 without collapsing them into one page", async ({ page }) => {
  await page.goto(workshop);
  for (const skill of ["s1", "s2", "s3", "s4", "s5", "s6"]) {
    await expect(page.locator(`[data-skill="${skill}"]`)).toBeVisible();
  }
  await expect(page.getByRole("heading", { name: "创赛工坊", exact: true })).toBeVisible();
  await expect(page.getByText("六阶段技能矩阵", { exact: true })).toBeVisible();
});

test("T013C ended competition cannot expose active competition S6 private output or create new workshop facts", async ({ page }) => {
  await page.goto("/competitions/sanchuang-15/workspace/workshop/tasks/s6-company-match/answer");
  await expect(page.getByText("赛事已经结束", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "公司推荐", exact: true })).toHaveCount(0);

  await page.goto("/competitions/sanchuang-15/workspace/workshop/results/result-s6-company-match");
  await expect(page.getByText("赛事已经结束", { exact: true })).toBeVisible();
  await expect(page.getByText("生成结果仅自己可见", { exact: true })).toHaveCount(0);
});

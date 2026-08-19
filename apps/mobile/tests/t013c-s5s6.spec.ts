import { expect, test } from "@playwright/test";

const workshop = "/competitions/sanchuang-16/workspace/workshop";

async function answerCurrent(page: import("@playwright/test").Page, option: string) {
  await page.getByRole("button", { name: option, exact: true }).click();
}

test("T013C S5 follows Mockplus 114 and 115 before PPT generation", async ({ page }) => {
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
  await expect(page.getByRole("heading", { name: "还有什么要点补充（选填）", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "补充材料（选填）", exact: true })).toBeVisible();
  await page.getByPlaceholder("补充评委可能关注的内容、项目限制或其它比赛信息…").fill("真实性证据需要保留来源。");
  await page.getByRole("button", { name: "完成预检，继续 PPT 问答", exact: true }).click();

  await expect(page.getByRole("heading", { name: "路演 PPT", exact: true })).toBeVisible();
  await expect(page.getByTestId("t013c-dynamic-question")).toContainText("本次路演预计时长");
  for (const duration of ["3 分钟", "5 分钟", "8 分钟", "10 分钟及以上"]) {
    await expect(page.getByRole("button", { name: duration, exact: true })).toBeVisible();
  }
  await expect(page.getByRole("button", { name: "15 分钟", exact: true })).toHaveCount(0);
  await answerCurrent(page, "8 分钟");
  await page.getByRole("button", { name: "继续下一题", exact: true }).click();

  await expect(page.getByTestId("t013c-dynamic-question")).toContainText("希望 PPT 使用什么风格");
  for (const style of ["商务风", "极简风", "设计风", "轻奢风"]) {
    await expect(page.getByRole("button", { name: style, exact: true })).toBeVisible();
  }
  await expect(page.getByText("PPT 最需要强化哪些要点？", { exact: true })).toHaveCount(0);
  await expect(page.getByText("是否还有要点需要补充？", { exact: true })).toHaveCount(0);
  await answerCurrent(page, "极简风");

  await expect(page.getByTestId("t013c-completeness")).toContainText("100%");
  await expect(page.getByRole("heading", { name: "是否还有要点补充（选填）", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "上传其它数据（选填）", exact: true })).toBeVisible();
  await page.getByPlaceholder("补充路演必须保留的事实、叙事重点或限制…").fill("真实经营数据必须保留来源说明。");
  await page.getByRole("button", { name: "回答完毕，进入下一步", exact: true }).click();

  await expect(page.getByRole("heading", { name: "PPT 生成确认", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "基于用户方案生成可直接使用的路演 PPT", exact: true })).toBeVisible();
  await expect(page.getByTestId("t013c-core-facts")).toContainText("已上线运营并有数据");
  await expect(page.getByTestId("t013c-core-facts")).toContainText("极简风");
  await expect(page.getByTestId("t013c-core-facts")).toContainText("真实性证据需要保留来源");
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

test("T013C S5 pitch task is not hard-locked by optional pitch draft material", async ({ page }) => {
  await page.goto(`${workshop}/skills/s5`);
  await expect(page.getByRole("heading", { name: "S5 项目冲刺", exact: true })).toBeVisible();
  await expect(page.getByText("缺少：现有路演稿", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "开始任务", exact: true })).toHaveCount(2);
});

test("T013C S6 follows Mockplus 131 two-question company recommendation flow", async ({ page }) => {
  await page.goto(`${workshop}/tasks/s6-company-match/answer`);

  await expect(page.getByRole("heading", { name: "公司推荐", exact: true })).toBeVisible();
  await expect(page.getByTestId("t013c-dynamic-question")).toContainText("期望行业");
  for (const industry of ["互联网/科技", "金融科技", "软件开发 SaaS", "电子商务", "AI/大数据", "新媒体内容", "物联网", "物流/供应链", "不限"]) {
    await expect(page.getByRole("button", { name: industry, exact: true })).toBeVisible();
  }
  await expect(page.getByRole("button", { name: "品牌零售", exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "数据服务", exact: true })).toHaveCount(0);
  await answerCurrent(page, "互联网/科技");
  await answerCurrent(page, "AI/大数据");
  await page.getByRole("button", { name: "继续下一题", exact: true }).click();

  await expect(page.getByTestId("t013c-dynamic-question")).toContainText("希望工作城市");
  for (const city of ["北京", "广州", "杭州", "上海", "深圳", "成都", "南京", "武汉", "不限"]) {
    await expect(page.getByRole("button", { name: city, exact: true })).toBeVisible();
  }
  await answerCurrent(page, "深圳");
  await expect(page.getByText("更希望继续发挥哪类能力？", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "数据分析", exact: true })).toHaveCount(0);
  await expect(page.getByTestId("t013c-completeness")).toContainText("100%");
  await expect(page.getByRole("heading", { name: "补充说明（选填）", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "补充材料（选填）", exact: true })).toBeVisible();
  await page.getByPlaceholder("补充希望避开的行业、工作方式或其它个人偏好…").fill("优先考虑有真实项目实践机会的企业。");
  await page.getByRole("button", { name: "回答完毕，进入下一步", exact: true }).click();

  await expect(page.getByRole("heading", { name: "公司推荐生成确认", exact: true })).toBeVisible();
  await expect(page.getByTestId("t013c-core-facts")).toContainText("AI/大数据");
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
  await expect(page.getByText("本人填写 · 希望发挥的能力", { exact: true })).toHaveCount(0);
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

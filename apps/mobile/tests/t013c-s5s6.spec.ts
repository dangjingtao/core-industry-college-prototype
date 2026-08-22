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

test("T013C S6 job recommend follows preference questionnaire flow", async ({ page }) => {
  await page.goto(`${workshop}/tasks/s6-job-recommend/answer`);

  await expect(page.getByRole("heading", { name: "岗位推荐", exact: true })).toBeVisible();
  await expect(page.getByTestId("t013c-dynamic-question")).toContainText("你期望从事哪类职业方向");
  await answerCurrent(page, "技术 / 研发");
  await page.getByRole("button", { name: "继续下一题", exact: true }).click();

  await expect(page.getByTestId("t013c-dynamic-question")).toContainText("你希望在哪些城市工作");
  await answerCurrent(page, "新一线城市（杭州、成都等）");
  await page.getByRole("button", { name: "继续下一题", exact: true }).click();

  await expect(page.getByTestId("t013c-dynamic-question")).toContainText("你掌握哪些技能");
  await answerCurrent(page, "软件开发");
  await page.getByRole("button", { name: "继续下一题", exact: true }).click();

  await expect(page.getByTestId("t013c-dynamic-question")).toContainText("你期望的首月薪资范围");
  await answerCurrent(page, "8-12k");
  await page.getByRole("button", { name: "继续下一题", exact: true }).click();

  await expect(page.getByTestId("t013c-dynamic-question")).toContainText("你对公司规模有偏好吗");
  await answerCurrent(page, "初创公司（50人以下）");
  await answerCurrent(page, "不限");
  await expect(page.getByRole("button", { name: "初创公司（50人以下）", exact: true })).toHaveAttribute("aria-pressed", "false");
  await answerCurrent(page, "初创公司（50人以下）");
  await expect(page.getByRole("button", { name: "不限", exact: true })).toHaveAttribute("aria-pressed", "false");
  await page.getByRole("button", { name: "继续下一题", exact: true }).click();

  await expect(page.getByTestId("t013c-dynamic-question")).toContainText("希望公司提供哪些成长支持");
  await answerCurrent(page, "项目实战");
  await expect(page.getByPlaceholder(/输入框（选填）/)).toBeVisible();
  await page.getByPlaceholder(/输入框（选填）/).fill("补充一个选项之外的成长支持");
  await expect(page.getByTestId("t013c-ai-next-feedback")).toContainText("已记录你的回答");
  await expect(page.getByTestId("t013c-completeness")).toContainText("100%");
  await page.getByPlaceholder("补充希望加入的行业、岗位类型、工作偏好或其它信息…").fill("希望进入互联网行业做技术岗位。");
  await page.getByRole("button", { name: "回答完毕，进入下一步", exact: true }).click();

  await expect(page.getByRole("heading", { name: "岗位推荐生成确认", exact: true })).toBeVisible();
  await expect(page.getByTestId("s6-private-visibility")).toContainText("生成结果仅自己可见");
  await page.getByRole("button", { name: "确认生成", exact: true }).click();

  await expect(page.getByRole("heading", { name: "生成企业岗位推荐", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "模拟进入运行", exact: true }).click();
  await page.getByRole("button", { name: "模拟生成完成", exact: true }).click();
  await page.getByRole("button", { name: "查看本任务成果", exact: true }).click();

  await expect(page.getByRole("heading", { name: "企业岗位推荐", exact: true })).toBeVisible();
  await expect(page.getByTestId("s6-job-private-visibility")).toContainText("生成结果仅自己可见");
  await expect(page.getByTestId("s6-job-no-score")).toContainText("没有“人才总分”");
  await expect(page.getByRole("button", { name: "一键投递（模拟）", exact: true }).first()).toBeVisible();
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
  await page.goto("/competitions/sanchuang-15/workspace/workshop/tasks/s6-job-recommend/answer");
  await expect(page.getByRole("heading", { name: "赛事期权限已回收", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "岗位推荐", exact: true })).toHaveCount(0);

  await page.goto("/competitions/sanchuang-15/workspace/workshop/results/result-s6-job-recommend");
  await expect(page.getByRole("heading", { name: "赛事期权限已回收", exact: true })).toBeVisible();
  await expect(page.getByText("生成结果仅自己可见", { exact: true })).toHaveCount(0);
});

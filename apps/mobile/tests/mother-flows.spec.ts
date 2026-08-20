import { expect, test } from "@playwright/test";

test("A login returns to the requested registration", async ({ page }) => {
  await page.goto("/auth/login?returnTo=%2Fcompetitions%2Fsanchuang-16%2Fregistration");
  await expect(page.getByRole("heading", { name: "登录", exact: true })).toBeVisible();
  await page.getByLabel("手机号或邮箱").fill("13800138000");
  await page.getByRole("textbox", { name: /^密码/ }).fill("prototype123");
  await page.getByRole("button", { name: "登录", exact: true }).click();
  await expect(page.getByRole("heading", { name: "赛事报名", exact: true })).toBeVisible();
});

test("home task zone keeps the featured workshop action in its competition context", async ({ page }) => {
  await page.goto("/home");
  await expect(page.getByRole("heading", { name: "任务专区", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /赛事：赛事进度/ })).toBeVisible();
  await page.getByRole("button", { name: /创赛工坊：继续赛事内任务/ }).click();
  await expect(page.getByRole("heading", { name: "创赛工坊", exact: true })).toBeVisible();
  await expect(page).toHaveURL(/\/competitions\/sanchuang-16\/workspace\/workshop$/);
});

test("task center derives status from existing competition, learning and benefit stores", async ({ page }) => {
  await page.goto("/home");
  await page.getByLabel("任务专区").getByRole("link", { name: "查看全部" }).click();
  await expect(page.getByRole("heading", { name: "任务中心", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /创赛工坊：完成市场可行性诊断/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /课程学习：品牌电商实战课，38%/ })).toBeVisible();
  await page.getByRole("button", { name: "权益", exact: true }).click();
  await expect(page.getByRole("button", { name: /权益：校园视频会员月卡，可领取/ })).toBeVisible();
  await page.getByRole("button", { name: "赛事", exact: true }).click();
  await page.getByRole("button", { name: /创赛工坊：完成市场可行性诊断/ }).click();
  await expect(page.getByRole("heading", { name: "动态答题", exact: true })).toBeVisible();
  await expect(page).toHaveURL(/\/competitions\/sanchuang-16\/workspace\/workshop\/tasks\/s2-market-feasibility\/answer$/);
});

test("B registration handoff carries context and callbacks share one competition identity", async ({ page }) => {
  await page.goto("/home");
  await page.getByRole("button", { name: /原型账号：多赛事身份/ }).click();
  await expect(page.getByRole("button", { name: /原型账号：无赛事身份/ })).toBeVisible();
  await page.getByRole("button", { name: "发现比赛" }).click();
  await page.getByRole("link", { name: /第十六届全国大学生电子商务/ }).click();
  await page.getByRole("button", { name: "进入报名" }).click();

  const portalButton = page.getByRole("button", { name: "打开响应式报名门户" });
  await expect(portalButton).toBeVisible();
  const portalUrlValue = await portalButton.getAttribute("data-portal-url");
  expect(portalUrlValue).toBeTruthy();
  const portalUrl = new URL(portalUrlValue!);
  expect(portalUrl.pathname).toBe("/registration-portal/start");
  expect(portalUrl.searchParams.get("competitionId")).toBe("sanchuang-16");
  expect(portalUrl.searchParams.get("source")).toBe("mobile-app");
  expect(portalUrl.searchParams.get("accountContext")).toBe("current-student-prototype-session");
  const returnTo = new URL(portalUrl.searchParams.get("returnTo")!);
  expect(returnTo.pathname).toBe("/competitions/sanchuang-16/registration");

  const callback = async (status: "pending" | "rejected" | "approved") => {
    await page.evaluate(({ status }) => {
      const url = new URL(window.location.href);
      url.searchParams.set("handoff", "registration-portal");
      url.searchParams.set("registrationCompetitionId", "sanchuang-16");
      url.searchParams.set("registrationStatus", status);
      url.searchParams.set("registrationSource", "pc-registration-portal");
      window.history.pushState({}, "", `${url.pathname}${url.search}`);
      window.dispatchEvent(new PopStateEvent("popstate"));
    }, { status });
    await expect.poll(() => new URL(page.url()).searchParams.has("registrationStatus")).toBe(false);
  };

  await callback("pending");
  await expect(page.getByText(/报名已提交.*学校审核/).first()).toBeVisible();
  await callback("rejected");
  await expect(page.getByText(/审核未通过/).first()).toBeVisible();
  await callback("pending");
  await expect(page.getByText(/报名已提交.*学校审核/).first()).toBeVisible();
  await callback("approved");
  await expect(page.getByText(/审核通过.*赛事身份/).first()).toBeVisible();
  await page.getByRole("button", { name: "进入赛事工作区" }).click();
  await expect(page.getByRole("heading", { name: "赛事工作区", exact: true })).toBeVisible();
  await expect(page.getByText("身份：active · 团队：山城新零售队", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /赛事权益/ }).click();
  await expect(page.getByRole("heading", { name: "赛事权益", exact: true })).toBeVisible();
  await expect(page.getByText("赛道路演课学习资格", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "返回" }).click();
  await expect(page.getByRole("heading", { name: "赛事工作区", exact: true })).toBeVisible();
});

test("C workshop task keeps task identity through answer, generation and result", async ({ page }) => {
  await page.goto("/home");
  await page.getByRole("button", { name: "进入当前赛事" }).click();
  await expect(page.getByRole("heading", { name: "赛事工作区", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "继续下一步" }).click();
  await expect(page.getByRole("heading", { name: "动态答题", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "抖音小店", exact: true }).click();
  await page.getByRole("button", { name: "头皮修护", exact: true }).click();
  await page.getByRole("button", { name: "用户访谈", exact: true }).click();
  await page.getByRole("button", { name: "3", exact: true }).click();
  await page.getByPlaceholder("写下团队当前真实情况…").fill("已有真实用户反馈和竞品截图，当前重点验证校园渠道的购买转化。");
  await page.getByRole("button", { name: "回答完毕，进入下一步", exact: true }).click();
  await expect(page.getByRole("heading", { name: "生成确认", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "确认生成", exact: true }).click();
  await expect(page.getByRole("heading", { name: "任务进度", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "模拟进入运行", exact: true }).click();
  await page.getByRole("button", { name: "模拟生成完成", exact: true }).click();
  await page.getByRole("button", { name: "查看本任务成果", exact: true }).click();
  await expect(page.getByRole("heading", { name: "成果详情", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "市场可行性分析小报告", exact: true })).toBeVisible();
  await expect(page.getByText(/S2 · 完成市场可行性诊断/)).toBeVisible();
});

test("D opportunity-company-resume-returnTo-application stays continuous", async ({ page }) => {
  await page.goto("/opportunities/intern-1");
  await expect(page.getByRole("heading", { name: "机会详情", exact: true })).toBeVisible();
  await page.getByRole("button", { name: /北辰美妆 · 查看企业/ }).click();
  await expect(page.getByRole("heading", { name: "企业详情", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "返回" }).click();
  await expect(page.getByRole("heading", { name: "机会详情", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "使用长期简历投递" }).click();
  await page.getByRole("button", { name: "查看长期简历" }).click();
  await expect(page.getByRole("heading", { name: "长期简历", exact: true })).toBeVisible();
  await page.getByRole("link", { name: "编辑表达" }).first().click();
  await expect(page.getByRole("heading", { name: "个人优势", exact: true })).toBeVisible();
  await page.locator("textarea").fill("有真实赛事项目协作、用户验证和数据复盘经历，能把结论落到可验证行动。");
  await page.getByRole("button", { name: "保存表达" }).click();
  await page.getByRole("button", { name: "返回机会继续投递" }).click();
  await expect(page.getByRole("heading", { name: "机会详情", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "使用长期简历投递" }).click();
  await page.getByRole("button", { name: "确认投递" }).click();
  await expect(page.getByRole("heading", { name: "投递记录", exact: true })).toBeVisible();
  await expect(page.getByText("已投递", { exact: true })).toBeVisible();
});

test("E ended competition hands off to long-term experience and trusted result", async ({ page }) => {
  await page.goto("/competitions/sanchuang-15/workspace");
  await expect(page.getByText("赛事期权限已回收", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "查看参赛经历" }).click();
  await expect(page.getByRole("heading", { name: "赛事经历", exact: true })).toBeVisible();
  await page.getByRole("link", { name: /第十五届三创赛/ }).click();
  await expect(page.getByRole("heading", { name: "参赛经历", exact: true })).toBeVisible();
  await page.getByRole("link", { name: /成绩 \/ 成果/ }).click();
  await expect(page.getByRole("heading", { name: "成绩与可信空间", exact: true })).toBeVisible();
  await expect(page.getByText("校赛一等奖", { exact: true })).toBeVisible();
});

test("competition list filter survives detail-return navigation", async ({ page }) => {
  await page.goto("/competitions");
  await page.getByRole("button", { name: /筛选/ }).click();
  await page.getByRole("dialog").getByRole("button", { name: "报名中" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "确定" }).click();
  await expect(page.getByRole("link", { name: /第十五届三创赛/ })).toHaveCount(0);
  await page.getByRole("link", { name: /第十六届全国大学生电子商务/ }).click();
  await page.getByRole("button", { name: "返回" }).click();
  await expect(page.getByRole("heading", { name: "赛事", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /第十五届三创赛/ })).toHaveCount(0);
  await expect(page.getByRole("link", { name: /第十六届全国大学生电子商务/ })).toBeVisible();
});

test("unknown path is exposed as an explicit dead-link", async ({ page }) => {
  await page.goto("/definitely-not-a-route");
  await expect(page.getByText("404 / dead-link", { exact: true })).toBeVisible();
  await expect(page.getByText("/definitely-not-a-route", { exact: true })).toBeVisible();
});

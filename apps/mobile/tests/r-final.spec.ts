import { expect, test } from "@playwright/test";

test("R-Final revoked competition keeps long-term asset handoff", async ({ page }) => {
  await page.goto("/competitions/sanchuang-16");
  await page.getByText("T03 生命周期状态", { exact: true }).click();
  await page.getByRole("button", { name: "revoked", exact: true }).click();
  await page.getByRole("button", { name: "查看赛后出口" }).click();
  await expect(page.getByText("赛事期权限已回收", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "查看参赛经历" })).toBeVisible();
  await expect(page.getByRole("button", { name: "查看成绩与证书" })).toBeVisible();
});

test("R-Final permissionDenied blocks workspace without revoking identity", async ({ page }) => {
  await page.goto("/competitions/sanchuang-16");
  await page.getByText("T03 生命周期状态", { exact: true }).click();
  await page.getByRole("button", { name: "permissionDenied: false", exact: true }).click();
  await page.getByRole("button", { name: "进入赛事工作区" }).click();
  await expect(page.getByText("当前赛事权限不足", { exact: true })).toBeVisible();
  await expect(page.getByText(/账号拥有赛事身份/)).toBeVisible();
});

test("R-Final company business tab keeps the trusted entity layer complete", async ({ page }) => {
  await page.goto("/companies/northstar-beauty?tab=business");
  await expect(page.getByRole("heading", { name: "企业详情", exact: true })).toBeVisible();
  await expect(page.getByText("工商登记信息", { exact: true })).toBeVisible();
  for (const label of [
    "法定代表人",
    "注册资本",
    "经营状态",
    "成立日期",
    "企业类型",
    "所属行业",
    "所属地区",
    "统一社会信用代码",
    "注册地址",
    "经营范围",
  ]) {
    await expect(page.getByText(label, { exact: true })).toBeVisible();
  }
  await expect(page.getByText(/当前内容为原型 Mock 数据/)).toBeVisible();
});

test("R-Final D08 remains explicitly blocked instead of inventing subject management", async ({ page }) => {
  await page.goto("/me/subjects");
  await expect(page.getByRole("heading", { name: "主体管理", exact: true })).toBeVisible();
  await expect(page.getByText("待产品决策 · D08", { exact: true })).toBeVisible();
  await expect(page.getByText("暂不实现产品交互", { exact: true })).toBeVisible();
});

test("R-Final GrowthScore no longer reuses learning-point semantics", async ({ page }) => {
  await page.goto("/growth/score");
  await expect(page.getByRole("heading", { name: "成长概览", exact: true })).toBeVisible();
  await expect(page.getByText("学力值")).toHaveCount(0);
});

test("R-Final account bindings no longer masquerade as third-party business accounts", async ({ page }) => {
  await page.goto("/me/accounts");
  await expect(page.getByRole("heading", { name: "账号绑定", exact: true })).toBeVisible();
  await expect(page.getByText("第三方账号")).toHaveCount(0);
  for (const label of ["邮箱", "企业微信", "微信"]) {
    await expect(page.getByRole("heading", { name: label, exact: true })).toBeVisible();
  }
});

test("R-Final home notification control reaches the account notification center", async ({ page }) => {
  await page.goto("/home");
  await page.getByRole("button", { name: "消息通知" }).click();
  await expect(page).toHaveURL(/\/me\/notifications$/);
  await expect(page.getByRole("heading", { name: "通知中心", exact: true })).toBeVisible();

  await page.goto("/auth/login?returnTo=%2Fme%2Fnotifications");
  await expect(page.getByRole("heading", { name: "登录", exact: true })).toBeVisible();
  await page.getByLabel("手机号或邮箱").fill("13800138000");
  await page.getByRole("textbox", { name: /^密码/ }).fill("prototype123");
  await page.getByRole("button", { name: "登录", exact: true }).click();
  await expect(page).toHaveURL(/\/me\/notifications$/);
});

test("R-Final account and support routes have visible entries from My and App Center", async ({ page }) => {
  await page.goto("/me");
  const entries = [
    ["消息通知", "/me/notifications"],
    ["用户协议", "/legal/user-agreement"],
    ["隐私政策", "/legal/privacy"],
    ["关于", "/about"],
  ] as const;

  for (const [name, href] of entries) {
    await expect(page.getByRole("link", { name: new RegExp(name) })).toHaveAttribute("href", href);
  }

  await page.goto("/apps");
  for (const [name, href] of [
    ["账号绑定", "/me/accounts"],
    ["帮助与客服", "/support"],
  ] as const) {
    await expect(page.getByRole("link", { name: new RegExp(`^${name}：`) })).toHaveAttribute("href", href);
  }
  await page.getByRole("link", { name: /帮助与客服/ }).click();
  await expect(page.getByRole("heading", { name: "帮助中心", exact: true })).toBeVisible();
  const chatEntry = page.getByRole("link", { name: /联系人工客服/ });
  await expect(chatEntry).toBeVisible();
  await expect(chatEntry).toHaveAttribute("href", /\/support\/chat/);
});

test("R-Final course completion waits for passed assessment", async ({ page }) => {
  await page.goto("/courses/brand-ecommerce/learn");
  await page.getByRole("button", { name: "完成课程并考试" }).click();
  await page.getByRole("button", { name: "先扩大投放" }).click();
  await page.getByRole("button", { name: "提交答案" }).click();
  await expect(page.getByText("本次未通过，可重新作答", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "返回" }).click();
  await page.getByRole("button", { name: "返回" }).click();
  await expect(page.getByText("学习中", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "继续学习" })).toBeVisible();

  await page.getByRole("button", { name: "继续学习" }).click();
  await page.getByRole("button", { name: "进入课程考试" }).click();
  await page.getByRole("button", { name: "先确认目标、口径与真实数据" }).click();
  await page.getByRole("button", { name: "提交答案" }).click();
  await expect(page.getByText("考试通过，课程成果已写入长期学习记录", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "返回" }).click();
  await page.getByRole("button", { name: "返回" }).click();
  await expect(page.getByText("已完成", { exact: true })).toBeVisible();
});

test("R-Final low-progress assessment pass does not create a course certificate", async ({ page }) => {
  await page.goto("/courses/brand-ecommerce/assessment");
  await page.getByRole("button", { name: "先确认目标、口径与真实数据" }).click();
  await page.getByRole("button", { name: "提交答案" }).click();
  await expect(page.getByText("考试通过，课程成果已写入长期学习记录", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "查看成绩与证书" }).click();
  await expect(page.getByText(/课程进度 38%/)).toBeVisible();
  await expect(page.getByText("完成课程并通过考试后，证书会进入统一证书记录。", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "领取证书" })).toHaveCount(0);
});

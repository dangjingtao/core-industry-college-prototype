import { expect, test, type Page } from "@playwright/test";

const storageKey = "core.ambassador.demo-state.v2";
const campaignId = "campus-ambassador-2026-一期";
const teamId = `amb-team-${campaignId}-account-demo`;
const teamCode = `TEAM-account-demo-${teamId}`;

async function navigateInApp(page: Page, path: string) {
  await page.evaluate((target) => {
    window.history.pushState({}, "", target);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }, path);
}

async function applyAsAmbassador(page: Page, accountId = "account-demo") {
  await page.goto(`/ambassadors?code=CA-HN-2026&accountId=${encodeURIComponent(accountId)}`);
  await expect(page).toHaveURL(/\/ambassadors\/apply/);
  await page.getByLabel("自我介绍").fill("校园社团负责人");
  await page.getByLabel("校园传播渠道").fill("社团和班级群");
  await page.getByLabel("参与动机").fill("帮助同学发现赛事与实习机会");
  await page.getByLabel("同意活动条款").check();
  await page.getByRole("button", { name: "提交申请，获得团队招募码" }).click();
  await expect(page.getByRole("heading", { name: "我的推广团队" })).toBeVisible();
}

async function joinTeam(page: Page, accountId: string) {
  await navigateInApp(page, `/ambassadors/join?code=${encodeURIComponent(teamCode)}&accountId=${encodeURIComponent(accountId)}`);
  await expect(page.getByRole("button", { name: "确认加入" })).toBeVisible();
  await page.getByRole("button", { name: "确认加入" }).click();
  await expect(page.getByRole("heading", { name: "我的推广团队" })).toBeVisible();
}

async function lightTeam(page: Page) {
  await applyAsAmbassador(page);
  for (const accountId of ["partner-1", "partner-2", "partner-3"]) await joinTeam(page, accountId);
  await navigateInApp(page, `/ambassadors/team/${encodeURIComponent(teamId)}?accountId=account-demo`);
  await expect(page.getByText("已点亮", { exact: true })).toBeVisible();
}

test("T049 universal scanner keeps the existing welfare redemption flow", async ({ page }) => {
  await page.goto("/me");
  await page.getByRole("button", { name: "扫一扫" }).click();
  await expect(page.getByTestId("ambassador-scan-simulator")).toBeVisible();
  await page.getByRole("button", { name: /模拟扫描福利兑换码/ }).click();
  await expect(page).toHaveURL(/\/redeem\/result\?code=/);
});

test("T049 existing campaign members cannot submit a second ambassador application", async ({ page }) => {
  await applyAsAmbassador(page);
  await joinTeam(page, "partner-1");

  await page.goto("/ambassadors?code=CA-HN-2026&accountId=partner-1");
  await expect(page).toHaveURL(/\/ambassadors\/apply/);
  await expect(page.getByText("你已加入本期推广团队", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "提交申请，获得团队招募码" })).toHaveCount(0);
  await page.getByRole("button", { name: "查看我的团队" }).click();
  await expect(page).toHaveURL(new RegExp(`/ambassadors/team/${encodeURIComponent(teamId)}\\?accountId=partner-1`));
});

test("T049 ended campaign disables all codes, keeps history and allows a later campaign", async ({ page }) => {
  await lightTeam(page);
  const promotionCode = (await page.getByTestId("personal-promotion-code").locator("code").textContent())?.trim() ?? "";
  expect(promotionCode).not.toBe("");

  await page.evaluate(({ key, currentCampaignId }) => {
    const raw = window.localStorage.getItem(key);
    if (!raw) throw new Error("ambassador demo state missing");
    const state = JSON.parse(raw);
    const campaign = state.campaigns.find((item: { id: string }) => item.id === currentCampaignId);
    campaign.endsAt = "2026-08-25T23:59:59+08:00";
    window.localStorage.setItem(key, JSON.stringify(state));
  }, { key: storageKey, currentCampaignId: campaignId });

  await page.reload();
  await expect(page.getByTestId("ambassador-history-state")).toBeVisible();
  await expect(page.getByTestId("team-recruitment-qr")).toHaveCount(0);
  await expect(page.getByTestId("personal-promotion-code")).toHaveCount(0);

  await navigateInApp(page, `/ambassadors/promote/${encodeURIComponent(promotionCode)}`);
  await expect(page.getByText("活动已结束，推广码已失效", { exact: true })).toBeVisible();

  await page.evaluate(({ key, currentCampaignId }) => {
    const raw = window.localStorage.getItem(key);
    if (!raw) throw new Error("ambassador demo state missing");
    const state = JSON.parse(raw);
    const previous = state.campaigns.find((item: { id: string }) => item.id === currentCampaignId);
    state.campaigns.push({
      id: "campus-ambassador-next",
      name: "2026 核心大使计划 · 二期",
      startsAt: "2026-08-26T00:00:00+08:00",
      endsAt: "2026-12-31T23:59:59+08:00",
      schoolIds: ["org-huanan-commerce-college"],
      applicationFields: [...previous.applicationFields],
      applicationForm: previous.applicationForm.map((field: object) => ({ ...field })),
      termsVersion: previous.termsVersion,
      status: "upcoming",
    });
    state.schoolRecruitmentCodes.push({
      id: "amb-recruit-next-huanan",
      campaignId: "campus-ambassador-next",
      schoolId: "org-huanan-commerce-college",
      code: "CA-NEXT-HN-2026",
      active: true,
    });
    window.localStorage.setItem(key, JSON.stringify(state));
  }, { key: storageKey, currentCampaignId: campaignId });

  await page.goto("/ambassadors?code=CA-NEXT-HN-2026&accountId=account-demo");
  await expect(page).toHaveURL(/\/ambassadors\/apply/);
  await expect(page.getByText("2026 核心大使计划 · 二期", { exact: true })).toBeVisible();
  await expect(page.getByText("你已加入本期推广团队")).toHaveCount(0);
});

test("T049 campaign-wide member rejection is readable, reversible and never increments results", async ({ page }) => {
  await lightTeam(page);
  const promotionCode = (await page.getByTestId("personal-promotion-code").locator("code").textContent())?.trim() ?? "";

  await applyAsAmbassador(page, "other-amb");
  await navigateInApp(page, `/ambassadors/promote/${encodeURIComponent(promotionCode)}`);
  await page.getByLabel("模拟注册账号").fill("other-amb");
  const submit = page.getByRole("button", { name: "模拟新用户注册成功" });
  await submit.click();
  await expect(page.getByTestId("promotion-message")).toHaveText("该账号已参与本期核心大使团队，不计入有效新增");
  await expect(submit).toBeEnabled();

  await navigateInApp(page, `/ambassadors/team/${encodeURIComponent(teamId)}/results?accountId=account-demo`);
  await expect(page.getByTestId("result-total")).toHaveText("0");
});

test("T049 private team routes reject outsiders and logged-out sessions", async ({ page }) => {
  await applyAsAmbassador(page);

  await navigateInApp(page, `/ambassadors/team/${encodeURIComponent(teamId)}?accountId=outsider`);
  await expect(page.getByText("无法查看该团队", { exact: true })).toBeVisible();
  await expect(page.getByTestId("team-recruitment-code")).toHaveCount(0);

  await navigateInApp(page, "/me");
  await page.getByRole("button", { name: "退出登录" }).click();
  await page.getByRole("button", { name: "确认退出" }).click();
  await expect(page).toHaveURL(/\/auth\/login/);

  await navigateInApp(page, `/ambassadors/team/${encodeURIComponent(teamId)}?accountId=account-demo`);
  await expect(page).toHaveURL(/\/auth\/login\?returnTo=/);
});

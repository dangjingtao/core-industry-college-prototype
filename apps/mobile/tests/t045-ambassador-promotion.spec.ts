import { expect, test, type Page } from "@playwright/test";

const campaignId = "campus-ambassador-2026-一期";
const teamId = `amb-team-${campaignId}-account-demo`;
const teamCode = `TEAM-account-demo-${teamId}`;

async function navigateInApp(page: Page, path: string) {
  await page.evaluate((target) => {
    window.history.pushState({}, "", target);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }, path);
}

async function createTeam(page: Page) {
  await page.goto(`/ambassadors/apply?campaignId=${encodeURIComponent(campaignId)}&schoolId=org-huanan-commerce-college`);
  await page.getByLabel("自我介绍").fill("校园社团负责人");
  await page.getByLabel("校园传播渠道").fill("社团和班级群");
  await page.getByLabel("参与动机").fill("帮助同学发现赛事与实习机会");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "提交申请，获得团队招募码" }).click();
  await expect(page.getByRole("heading", { name: "我的推广团队" })).toBeVisible();
}

async function joinTeam(page: Page, accountId: string) {
  await navigateInApp(page, `/ambassadors/join?accountId=${encodeURIComponent(accountId)}`);
  await expect(page.getByRole("heading", { name: "加入推广团队" })).toBeVisible();
  await page.getByLabel("团队招募码").fill(teamCode);
  await page.getByRole("button", { name: "加入团队" }).click();
  await expect(page.getByRole("heading", { name: "我的推广团队" })).toBeVisible();
}

async function personalCode(page: Page, accountId: string) {
  await navigateInApp(page, `/ambassadors/team/${encodeURIComponent(teamId)}?accountId=${encodeURIComponent(accountId)}`);
  await expect(page.getByRole("heading", { name: "我的推广团队" })).toBeVisible();
  return (await page.getByTestId("personal-promotion-code").locator("code").textContent())?.trim() ?? "";
}

test("T045 issues unique promotion codes only after the team is lit", async ({ page }) => {
  await createTeam(page);
  await expect(page.getByTestId("personal-promotion-code")).toHaveCount(0);
  await expect(page.getByText("团队点亮后开放专属推广码", { exact: true })).toBeVisible();

  await joinTeam(page, "partner-1");
  await joinTeam(page, "partner-2");
  await expect(page.getByTestId("personal-promotion-code")).toHaveCount(0);
  await joinTeam(page, "partner-3");
  await expect(page.getByText("已点亮", { exact: true })).toBeVisible();

  const codes = [];
  for (const accountId of ["account-demo", "partner-1", "partner-2", "partner-3"]) {
    codes.push(await personalCode(page, accountId));
  }
  expect(codes.every(Boolean)).toBeTruthy();
  expect(new Set(codes).size).toBe(4);

  await joinTeam(page, "partner-4");
  const laterPartnerCode = await personalCode(page, "partner-4");
  expect(laterPartnerCode).toContain("PROMO-partner-4-");
  expect(codes).not.toContain(laterPartnerCode);
});

test("T045 attributes one new registration and rejects duplicate or existing users", async ({ page }) => {
  await createTeam(page);
  for (const accountId of ["partner-1", "partner-2", "partner-3"]) await joinTeam(page, accountId);
  const promoterCode = await personalCode(page, "partner-1");

  await navigateInApp(page, `/ambassadors/promote/${encodeURIComponent(promoterCode)}`);
  await expect(page.getByRole("heading", { name: "核心大使专属邀请" })).toBeVisible();
  await page.getByLabel("模拟注册账号").fill("new-user-001");
  await page.getByRole("button", { name: "模拟新用户注册成功" }).click();
  await expect(page.getByTestId("promotion-message")).toHaveText("注册成功，已形成 1 个有效新增");

  await page.getByRole("button", { name: "模拟新用户注册成功" }).click();
  await expect(page.getByTestId("promotion-message")).toHaveText("该用户已在本期计入，有效新增不重复增加");
  await page.getByLabel("模拟注册账号").fill("partner-2");
  await page.getByRole("button", { name: "模拟已注册用户继续" }).click();
  await expect(page.getByTestId("promotion-message")).toHaveText("已注册用户继续访问，不计入有效新增");

  await navigateInApp(page, `/ambassadors/team/${encodeURIComponent(teamId)}/results?accountId=account-demo`);
  await expect(page.getByRole("heading", { name: "团队推广成果" })).toBeVisible();
  await expect(page.getByTestId("result-total")).toHaveText("1");
  const partnerResult = page.getByTestId("member-result").filter({ hasText: "账号 partner-1" });
  await expect(partnerResult).toContainText("1 个有效新增");
  await expect(page.getByText("新用户 new-user-001", { exact: true })).toBeVisible();
});

test("T045 keeps promotion results hidden from partners", async ({ page }) => {
  await createTeam(page);
  for (const accountId of ["partner-1", "partner-2", "partner-3"]) await joinTeam(page, accountId);

  await navigateInApp(page, `/ambassadors/team/${encodeURIComponent(teamId)}?accountId=partner-1`);
  await expect(page.getByTestId("personal-promotion-code")).toBeVisible();
  await expect(page.getByRole("button", { name: "查看团队推广成果" })).toHaveCount(0);
  await expect(page.getByTestId("ambassador-member")).toHaveCount(0);
  await expect(page.getByText(/有效新增/)).toHaveCount(0);

  await navigateInApp(page, `/ambassadors/team/${encodeURIComponent(teamId)}/results?accountId=partner-1`);
  await expect(page.getByText("仅核心大使可查看团队推广成果", { exact: true })).toBeVisible();
  await expect(page.getByTestId("result-total")).toHaveCount(0);
  await expect(page.getByTestId("member-result")).toHaveCount(0);
  await expect(page.getByText(/个有效新增/)).toHaveCount(0);
});

import { expect, test, type Page } from "@playwright/test";

const campaignId = "campus-ambassador-2026-一期";
const teamId = `amb-team-${campaignId}-account-demo`;
const teamCode = `TEAM-account-demo-${teamId}`;
const encodedTeamPath = `/ambassadors/team/${encodeURIComponent(teamId)}`;

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
  await page.getByLabel("同意活动条款").check();
  await page.getByRole("button", { name: "提交申请，获得团队招募码" }).click();
  await expect(page).toHaveURL(new RegExp(encodedTeamPath));
}

async function joinTeam(page: Page, accountId: string) {
  await navigateInApp(page, `/ambassadors/join?code=${encodeURIComponent(teamCode)}&accountId=${encodeURIComponent(accountId)}`);
  await expect(page.getByRole("heading", { name: "加入推广团队" })).toBeVisible();
  await expect(page.getByText("邀请你加入推广团队")).toBeVisible();
  await page.getByRole("button", { name: "确认加入" }).click();
  await expect(page).toHaveURL(new RegExp(encodedTeamPath));
}

test("T044 school code routes directly into application and creates a team recruitment QR", async ({ page }) => {
  await page.goto("/ambassadors?code=CA-HN-2026");
  await expect(page).toHaveURL(/\/ambassadors\/apply/);
  await expect(page.getByLabel("学校大使招募码")).toHaveCount(0);
  await page.getByLabel("自我介绍").fill("校园社团负责人");
  await page.getByLabel("校园传播渠道").fill("社团和班级群");
  await page.getByLabel("参与动机").fill("帮助同学发现赛事与实习机会");
  await page.getByLabel("同意活动条款").check();
  await page.getByRole("button", { name: "提交申请，获得团队招募码" }).click();

  await expect(page).toHaveURL(new RegExp(encodedTeamPath));
  await expect(page.getByText("待点亮", { exact: true })).toBeVisible();
  await expect(page.getByText("还需 3 位校园推荐官", { exact: true })).toBeVisible();
  const qr = page.getByTestId("team-recruitment-qr");
  await expect(qr).toHaveAttribute("data-payload", new RegExp(`/ambassadors/join\\?code=${encodeURIComponent(teamCode)}$`));
  await expect.poll(async () => qr.innerHTML()).toContain("path");
});

test("T044 third partner lights team and fourth/fifth can still join", async ({ page }) => {
  await createTeam(page);
  for (const accountId of ["partner-1", "partner-2", "partner-3", "partner-4", "partner-5"]) {
    await joinTeam(page, accountId);
    await expect(page.getByRole("heading", { name: "我的推广团队" })).toBeVisible();
  }
  await expect(page.getByText("已点亮", { exact: true })).toBeVisible();
  await expect(page.getByText("6 人", { exact: true })).toBeVisible();
  await navigateInApp(page, `/ambassadors/team/${encodeURIComponent(teamId)}?accountId=account-demo`);
  await expect(page.getByRole("heading", { name: "我的推广团队" })).toBeVisible();
  await expect(page.getByTestId("ambassador-member")).toHaveCount(6);
  await expect(page.getByText("退出团队")).toHaveCount(0);
  await expect(page.getByText("更换团队")).toHaveCount(0);
});

test("T044 an account already bound in the campaign cannot join again", async ({ page }) => {
  await createTeam(page);
  await joinTeam(page, "partner-1");
  await navigateInApp(page, `/ambassadors/join?accountId=partner-1&code=${encodeURIComponent(teamCode)}`);
  await expect(page.getByText("你已加入本期推广团队", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "确认加入" })).toHaveCount(0);
});

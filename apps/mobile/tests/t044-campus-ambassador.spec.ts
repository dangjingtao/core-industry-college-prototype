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
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "提交申请，获得团队招募码" }).click();
  await expect(page).toHaveURL(new RegExp(encodedTeamPath));
}

test("T044 school code enters application and creates a unique team code", async ({ page }) => {
  await page.goto("/ambassadors");
  await page.getByLabel("学校大使招募码").fill("CA-HN-2026");
  await page.getByRole("button", { name: "进入申请" }).click();
  await expect(page).toHaveURL(/\/ambassadors\/apply/);
  await page.getByLabel("自我介绍").fill("校园社团负责人");
  await page.getByLabel("校园传播渠道").fill("社团和班级群");
  await page.getByLabel("参与动机").fill("帮助同学发现赛事与实习机会");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "提交申请，获得团队招募码" }).click();

  await expect(page).toHaveURL(new RegExp(encodedTeamPath));
  await expect(page.getByText("待点亮", { exact: true })).toBeVisible();
  await expect(page.getByText(teamCode, { exact: true })).toBeVisible();
  await expect(page.getByText("还需 3 位推广伙伴", { exact: true })).toBeVisible();
});

test("T044 third partner lights team and fourth/fifth can still join", async ({ page }) => {
  await createTeam(page);
  for (const accountId of ["partner-1", "partner-2", "partner-3", "partner-4", "partner-5"]) {
    await navigateInApp(page, `/ambassadors/join?accountId=${accountId}`);
    await expect(page.getByRole("heading", { name: "加入推广团队" })).toBeVisible();
    await page.getByLabel("团队招募码").fill(teamCode);
    await page.getByRole("button", { name: "加入团队" }).click();
    await expect(page).toHaveURL(new RegExp(encodedTeamPath));
    await expect(page.getByRole("heading", { name: "我的推广团队" })).toBeVisible();
  }
  await expect(page.getByText("已点亮", { exact: true })).toBeVisible();
  await expect(page.getByText("6 人", { exact: true })).toBeVisible();
  await expect(page.getByTestId("ambassador-member")).toHaveCount(6);
  await expect(page.getByText("退出团队")).toHaveCount(0);
  await expect(page.getByText("更换团队")).toHaveCount(0);
});

test("T044 an account already bound in the campaign cannot join again", async ({ page }) => {
  await createTeam(page);
  await navigateInApp(page, "/ambassadors/join?accountId=partner-1");
  await page.getByLabel("团队招募码").fill(teamCode);
  await page.getByRole("button", { name: "加入团队" }).click();
  await expect(page).toHaveURL(new RegExp(encodedTeamPath));

  await navigateInApp(page, `/ambassadors/join?accountId=partner-1&code=${encodeURIComponent(teamCode)}`);
  await page.getByRole("button", { name: "加入团队" }).click();
  await expect(page.getByText("你已绑定本期其它团队，不能重复加入", { exact: true })).toBeVisible();
});

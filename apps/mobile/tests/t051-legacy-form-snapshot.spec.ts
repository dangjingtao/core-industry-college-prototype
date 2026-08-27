import { expect, test, type Page } from "@playwright/test";

const storageKey = "core.ambassador.demo-state.v2";
const campaignId = "campus-ambassador-t051-legacy";
const accountId = "t051-legacy-user";

async function seedLegacyCampaign(page: Page) {
  await page.goto("/welcome");
  await expect.poll(async () => page.evaluate(key => Boolean(window.localStorage.getItem(key)), storageKey)).toBe(true);

  await page.evaluate(({ key, targetCampaignId }) => {
    const raw = window.localStorage.getItem(key);
    if (!raw) throw new Error("ambassador demo state missing");
    const state = JSON.parse(raw);
    state.campaigns.push({
      id: targetCampaignId,
      name: "T051 Legacy 问卷活动",
      startsAt: "2026-08-01T00:00:00+08:00",
      endsAt: "2026-12-31T23:59:59+08:00",
      schoolIds: ["org-huanan-commerce-college"],
      applicationFields: ["旧版自我介绍", "旧版参与动机"],
      termsVersion: "campus-ambassador-terms-v1",
      status: "active",
    });
    state.schoolRecruitmentCodes.push({
      id: "t051-legacy-school-code",
      campaignId: targetCampaignId,
      schoolId: "org-huanan-commerce-college",
      code: "T051-LEGACY",
      active: true,
    });
    window.localStorage.setItem(key, JSON.stringify(state));
  }, { key: storageKey, targetCampaignId: campaignId });
}

test("T051 legacy applicationFields campaign snapshots the resolved submission schema", async ({ page }) => {
  await seedLegacyCampaign(page);
  await page.goto(`/ambassadors?code=T051-LEGACY&accountId=${accountId}`);
  await expect(page).toHaveURL(/\/ambassadors\/apply/);

  await page.getByLabel("旧版自我介绍").fill("这是旧活动的新申请，提交时必须冻结字段语义");
  await page.getByLabel("旧版参与动机").fill("验证 legacy applicationFields 也生成 snapshot");
  await page.getByLabel("同意活动条款").check();
  await page.getByRole("button", { name: "提交申请，获得团队招募码" }).click();
  await expect(page.getByRole("heading", { name: "我的推广团队" })).toBeVisible();

  const snapshot = await page.evaluate(({ key, targetCampaignId, targetAccountId }) => {
    const raw = window.localStorage.getItem(key);
    if (!raw) throw new Error("ambassador demo state missing after submit");
    const state = JSON.parse(raw);
    const team = state.teams.find((item: { campaignId: string; coreAmbassadorAccountId: string }) => item.campaignId === targetCampaignId && item.coreAmbassadorAccountId === targetAccountId);
    const member = team?.members.find((item: { accountId: string }) => item.accountId === targetAccountId);
    return member?.applicationFormSnapshot ?? null;
  }, { key: storageKey, targetCampaignId: campaignId, targetAccountId: accountId });

  expect(snapshot).toEqual([
    { id: "legacy-0", label: "旧版自我介绍", type: "textarea", required: true },
    { id: "legacy-1", label: "旧版参与动机", type: "textarea", required: true },
  ]);
});

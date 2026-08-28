import { expect, test, type Page } from "@playwright/test";

const storageKey = "core.ambassador.demo-state.v2";
const campaignId = "campus-ambassador-demo-active";
const teamId = "amb-demo-team";

async function ensureSeededState(page: Page) {
  await page.goto(`/admin/ambassadors/${campaignId}/teams/${teamId}`);
  await expect.poll(async () => page.evaluate(key => Boolean(window.localStorage.getItem(key)), storageKey)).toBe(true);
}

test("T051 questionnaire keeps submission-time schema after the current campaign form changes", async ({ page }) => {
  await ensureSeededState(page);

  await page.evaluate(({ key, targetCampaignId, targetTeamId }) => {
    const raw = window.localStorage.getItem(key);
    if (!raw) throw new Error("ambassador demo state missing");
    const state = JSON.parse(raw);
    const campaign = state.campaigns.find((item: { id: string }) => item.id === targetCampaignId);
    const team = state.teams.find((item: { id: string }) => item.id === targetTeamId);
    const ambassador = team?.members.find((item: { role: string }) => item.role === "ambassador");
    if (!campaign || !ambassador) throw new Error("T051 seed facts missing");

    ambassador.application = {
      intro: "提交时长文本第一行\n第二行仍需完整显示",
      channel: "社群传播",
      motivation: "成长、连接同学",
      "optional-note": "",
      termsVersion: "campus-ambassador-terms-v1",
      __applicantName: "林大使",
    };
    ambassador.applicationSubmittedAt = "2026-08-12T10:20:30+08:00";
    ambassador.applicationFormSnapshot = [
      { id: "intro", label: "提交时长文本", type: "textarea", required: true },
      { id: "channel", label: "提交时单选", type: "single-choice", required: true, options: ["社群传播", "线下活动"] },
      { id: "motivation", label: "提交时多选", type: "multi-choice", required: true, options: ["成长", "连接同学", "赛事实践"] },
      { id: "optional-note", label: "提交时可选备注", type: "text", required: false },
    ];

    campaign.applicationForm = [
      { id: "replacement", label: "运营后来改成的新问题", type: "text", required: true },
    ];
    campaign.applicationFields = ["运营后来改成的新问题"];
    window.localStorage.setItem(key, JSON.stringify(state));
  }, { key: storageKey, targetCampaignId: campaignId, targetTeamId: teamId });

  await page.reload();
  const questionnaire = page.getByTestId("ambassador-questionnaire-answers");
  await expect(questionnaire).toBeVisible();
  await expect(questionnaire.getByText("提交时版本", { exact: true })).toBeVisible();
  await expect(questionnaire.getByText("提交时长文本", { exact: true })).toBeVisible();
  await expect(questionnaire.getByText("提交时单选", { exact: true })).toBeVisible();
  await expect(questionnaire.getByText("提交时多选", { exact: true })).toBeVisible();
  await expect(questionnaire.getByText("提交时可选备注", { exact: true })).toBeVisible();
  await expect(questionnaire.getByText("运营后来改成的新问题", { exact: true })).toHaveCount(0);

  await expect(questionnaire.getByText("提交时长文本第一行")).toBeVisible();
  await expect(questionnaire.getByText("第二行仍需完整显示")).toBeVisible();
  await expect(questionnaire.getByText("社群传播", { exact: true })).toBeVisible();
  await expect(questionnaire.getByText("成长", { exact: true })).toBeVisible();
  await expect(questionnaire.getByText("连接同学", { exact: true })).toBeVisible();
  await expect(questionnaire.getByText("未填写", { exact: true })).toBeVisible();
  await expect(questionnaire.getByText("校园大使计划活动条款 · v1.0", { exact: true })).toBeVisible();
  await expect(questionnaire.getByText(/核心大使计划/)).toHaveCount(0);
  await expect(questionnaire.getByText("2026-08-12 10:20:30", { exact: true })).toBeVisible();
});

test("T051 legacy record without snapshot shows an explicit fallback warning", async ({ page }) => {
  await ensureSeededState(page);

  await page.evaluate(({ key, targetCampaignId, targetTeamId }) => {
    const raw = window.localStorage.getItem(key);
    if (!raw) throw new Error("ambassador demo state missing");
    const state = JSON.parse(raw);
    const campaign = state.campaigns.find((item: { id: string }) => item.id === targetCampaignId);
    const team = state.teams.find((item: { id: string }) => item.id === targetTeamId);
    const ambassador = team?.members.find((item: { role: string }) => item.role === "ambassador");
    if (!campaign || !ambassador) throw new Error("T051 seed facts missing");

    delete ambassador.applicationFormSnapshot;
    ambassador.application = {
      "legacy-0": "旧版活动答案仍可读取",
      termsVersion: "campus-ambassador-terms-v1",
      __applicantName: "林大使",
    };
    delete campaign.applicationForm;
    campaign.applicationFields = ["旧版活动问题"];
    window.localStorage.setItem(key, JSON.stringify(state));
  }, { key: storageKey, targetCampaignId: campaignId, targetTeamId: teamId });

  await page.reload();
  const questionnaire = page.getByTestId("ambassador-questionnaire-answers");
  await expect(questionnaire.getByText("使用当前表单配置", { exact: true })).toBeVisible();
  await expect(questionnaire).toContainText("该申请提交时未保存表单版本");
  await expect(questionnaire.getByText("旧版活动问题", { exact: true })).toBeVisible();
  await expect(questionnaire.getByText("旧版活动答案仍可读取", { exact: true })).toBeVisible();
  await expect(questionnaire.getByText("校园大使计划活动条款 · v1.0", { exact: true })).toBeVisible();
  await expect(questionnaire.getByText(/核心大使计划/)).toHaveCount(0);
});

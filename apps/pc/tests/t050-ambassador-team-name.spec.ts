import { expect, test, type Page } from "@playwright/test";

const storageKey = "core.ambassador.demo-state.v2";
const campaignId = "campus-ambassador-demo-active";
const teamId = "amb-demo-team";
const recruitmentCode = "TEAM-DEMO-2026";

async function storedTeamSnapshot(page: Page) {
  return page.evaluate(({ key, targetTeamId }) => {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const state = JSON.parse(raw);
    const team = state.teams.find((item: { id: string }) => item.id === targetTeamId);
    const code = state.teamRecruitmentCodes.find((item: { teamId: string }) => item.teamId === targetTeamId);
    return team ? { teamName: team.teamName, code: code?.code } : null;
  }, { key: storageKey, targetTeamId: teamId });
}

test("T050 PC edits and persists the operations team name without changing the recruitment code", async ({ page }) => {
  await page.goto(`/admin/ambassadors/${campaignId}/teams/${teamId}`);

  await expect(page.getByRole("heading", { name: "华南商贸 · 校园大使 01" })).toBeVisible();
  await expect(page.getByText("校园大使", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("校园推荐官", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("核心大使", { exact: true })).toHaveCount(0);
  await expect(page.getByText("推广伙伴", { exact: true })).toHaveCount(0);

  await page.getByLabel("后台团队名").fill("T050 华南校园增长队");
  await page.getByRole("button", { name: "保存团队名" }).click();
  await expect(page.getByRole("heading", { name: "T050 华南校园增长队" })).toBeVisible();

  await expect.poll(async () => storedTeamSnapshot(page)).toEqual({
    teamName: "T050 华南校园增长队",
    code: recruitmentCode,
  });

  await page.reload();
  await expect(page.getByRole("heading", { name: "T050 华南校园增长队" })).toBeVisible();
  await expect.poll(async () => storedTeamSnapshot(page)).toEqual({
    teamName: "T050 华南校园增长队",
    code: recruitmentCode,
  });
});

test("T050 legacy team state without teamName receives a stable readable fallback", async ({ page }) => {
  await page.goto(`/admin/ambassadors/${campaignId}/teams/${teamId}`);
  await expect.poll(async () => page.evaluate(key => Boolean(window.localStorage.getItem(key)), storageKey)).toBe(true);

  await page.evaluate(({ key, targetTeamId }) => {
    const raw = window.localStorage.getItem(key);
    if (!raw) throw new Error("ambassador demo state missing");
    const state = JSON.parse(raw);
    const team = state.teams.find((item: { id: string }) => item.id === targetTeamId);
    if (!team) throw new Error("ambassador demo team missing");
    delete team.teamName;
    window.localStorage.setItem(key, JSON.stringify(state));
  }, { key: storageKey, targetTeamId: teamId });

  await page.reload();
  const heading = page.getByRole("heading", { level: 1 });
  await expect(heading).toHaveText(/^校园大使团队 · [0-9A-Z]{4}$/);
  const fallbackName = (await heading.textContent())?.trim() || "";
  expect(fallbackName).not.toContain("account-demo");

  await expect.poll(async () => storedTeamSnapshot(page)).toEqual({
    teamName: fallbackName,
    code: recruitmentCode,
  });

  await page.reload();
  await expect(page.getByRole("heading", { name: fallbackName })).toBeVisible();
  await expect.poll(async () => storedTeamSnapshot(page)).toEqual({
    teamName: fallbackName,
    code: recruitmentCode,
  });
});

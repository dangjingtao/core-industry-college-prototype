import { expect, test } from "@playwright/test";

const storageKey = "core.ambassador.demo-state.v2";

test("T050 Mobile uses campus display naming without exposing legacy labels or operations team name", async ({ page }) => {
  await page.goto("/ambassadors/team/amb-demo-team?accountId=account-demo-ambassador");

  await expect(page.getByRole("heading", { name: "我的推广团队" })).toBeVisible();
  await expect(page.getByText("校园大使计划 · 演示活动", { exact: true })).toBeVisible();
  await expect(page.getByText("校园大使", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("校园推荐官", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("核心大使", { exact: true })).toHaveCount(0);
  await expect(page.getByText("推广伙伴", { exact: true })).toHaveCount(0);
  await expect(page.getByText(/核心大使计划/)).toHaveCount(0);
  await expect(page.getByText("华南商贸 · 校园大使 01", { exact: true })).toHaveCount(0);
});

test("T050 published terms use campus ambassador plan and identity wording", async ({ page }) => {
  await page.goto("/ambassadors?code=CA-DEMO-HN-2026");
  await expect(page).toHaveURL(/\/ambassadors\/apply/);

  await page.getByRole("button", { name: "校园大使计划活动条款" }).click();
  const terms = page.getByTestId("ambassador-terms-content");
  await expect(terms).toContainText("校园大使计划");
  await expect(terms).toContainText("校园大使");
  await expect(terms).toContainText("校园推荐官");
  await expect(terms).not.toContainText("核心大使计划");
  await expect(terms).not.toContainText("推广伙伴");
  await expect(page.getByText(/校园大使计划活动条款 · v1.0/)).toBeVisible();
});

test("T050 persisted legacy display copy is migrated without changing technical state keys", async ({ page }) => {
  await page.goto("/ambassadors/team/amb-demo-team?accountId=account-demo-ambassador");
  await expect.poll(async () => page.evaluate(key => Boolean(window.localStorage.getItem(key)), storageKey)).toBe(true);

  await page.evaluate(key => {
    const raw = window.localStorage.getItem(key);
    if (!raw) throw new Error("ambassador demo state missing");
    const state = JSON.parse(raw);
    state.campaigns = state.campaigns.map((campaign: { name: string }) => ({
      ...campaign,
      name: campaign.name.replaceAll("校园大使计划", "核心大使计划"),
    }));
    state.termsVersions = state.termsVersions.map((terms: { title: string; contentHtml: string }) => ({
      ...terms,
      title: terms.title.replaceAll("校园大使计划", "核心大使计划"),
      contentHtml: terms.contentHtml.replaceAll("校园大使计划", "核心大使计划"),
    }));
    window.localStorage.setItem(key, JSON.stringify(state));
  }, storageKey);

  await page.reload();
  await expect(page.getByText("校园大使计划 · 演示活动", { exact: true })).toBeVisible();
  await expect(page.getByText(/核心大使计划/)).toHaveCount(0);
  await expect.poll(async () => page.evaluate(key => {
    const raw = window.localStorage.getItem(key) || "";
    return raw.includes("核心大使计划");
  }, storageKey)).toBe(false);
});

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

async function applyAsAmbassador(page: Page) {
  await page.goto("/ambassadors?code=CA-HN-2026");
  await expect(page).toHaveURL(/\/ambassadors\/apply/);
  await page.getByLabel("自我介绍").fill("校园社团负责人");
  await page.getByLabel("校园传播渠道").fill("社团和班级群");
  await page.getByLabel("参与动机").fill("帮助同学发现赛事与实习机会");
  await page.getByLabel("同意活动条款").check();
  await page.getByRole("button", { name: "提交申请，获得团队招募码" }).click();
  await expect(page.getByRole("heading", { name: "我的推广团队" })).toBeVisible();
}

test("T048 school QR routes directly to application and official terms are readable", async ({ page }) => {
  await page.goto("/ambassadors?code=CA-HN-2026");
  await expect(page).toHaveURL(/\/ambassadors\/apply/);
  await expect(page.getByText("使用学校招募码")).toHaveCount(0);
  await expect(page.getByText("campus-ambassador-terms-v1")).toHaveCount(0);
  await page.getByRole("button", { name: "核心大使计划活动条款" }).click();
  await expect(page.getByTestId("ambassador-terms-content")).toContainText("同一账号在同一期活动中只能加入一个团队");
  await expect(page.getByText(/核心大使计划活动条款 · v1.0/)).toBeVisible();
});

test("T048 application adds ambassador identity and My Team entry, scanner can switch prototype users", async ({ page }) => {
  await applyAsAmbassador(page);
  await navigateInApp(page, "/me");
  await expect(page.getByTestId("core-ambassador-badge")).toHaveText("核心大使");
  await expect(page.getByRole("link", { name: "我的团队" })).toBeVisible();

  await page.getByRole("button", { name: "扫一扫" }).click();
  await expect(page.getByTestId("ambassador-scan-simulator")).toBeVisible();
  await page.getByLabel("模拟扫码身份").selectOption("partner-1");
  await expect(page.getByLabel("模拟扫码身份").locator("option")).toHaveCount(5);
  await page.getByRole("button", { name: /林晓 的推广团队/ }).click();

  await expect(page.getByRole("heading", { name: "加入推广团队" })).toBeVisible();
  await expect(page.getByText("林晓 邀请你加入推广团队", { exact: true })).toBeVisible();
  await expect(page.getByLabel("团队招募码")).toHaveCount(0);
  await expect(page.getByText(teamCode, { exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "确认加入" })).toBeVisible();
  await expect(page.getByRole("button", { name: "取消" })).toBeVisible();
});

test("T048 team recruitment code is a real QR and partner confirmation joins without exposing raw code", async ({ page }) => {
  await applyAsAmbassador(page);
  const qr = page.getByTestId("team-recruitment-qr");
  await expect(qr).toHaveAttribute("data-payload", new RegExp(`/ambassadors/join\\?code=${encodeURIComponent(teamCode)}$`));
  await expect.poll(async () => qr.innerHTML()).toContain("path");
  await qr.click();
  const large = page.getByTestId("team-recruitment-qr-large");
  await expect(large).toBeVisible();
  await expect(large).toHaveAttribute("data-payload", new RegExp(`/ambassadors/join\\?code=${encodeURIComponent(teamCode)}$`));
  await expect(page.getByText("长按二维码可保存到手机", { exact: true })).toBeVisible();

  await navigateInApp(page, `/ambassadors/join?code=${encodeURIComponent(teamCode)}&accountId=partner-1`);
  await expect(page.getByText("林晓 邀请你加入推广团队", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "确认加入" }).click();
  await expect(page.getByRole("heading", { name: "我的推广团队" })).toBeVisible();
  await expect(page.getByTestId("team-recruitment-qr")).toHaveCount(0);
});

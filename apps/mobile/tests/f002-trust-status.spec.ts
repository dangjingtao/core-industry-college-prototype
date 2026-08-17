import { expect, test } from "@playwright/test";

test("F002 gates trust actions until a credential is claimed", async ({ page }) => {
  await page.goto("/assets/verification");
  await page.getByLabel("证书验真码").fill("COURSE-DA-26001");
  await page.getByRole("button", { name: "验证", exact: true }).click();
  await expect(page.getByText("尚未签发", { exact: true })).toBeVisible();
  await expect(page.getByText("验证通过", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "请先验证已签发凭证" })).toBeDisabled();

  await page.goto("/assets/certificates/cert-course-data-analytics");
  await expect(page.getByRole("button", { name: "领取证书" })).toBeVisible();
  await expect(page.getByRole("button", { name: "保存证书" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "下载证书" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "进入三种方式验真" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "前往官方验真平台" })).toHaveCount(0);

  await page.getByRole("button", { name: "领取证书" }).click();
  await expect(page.getByText("已领取", { exact: true }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "保存证书" })).toBeVisible();
  await expect(page.getByRole("button", { name: "下载证书" })).toBeVisible();
  await expect(page.getByRole("button", { name: "进入三种方式验真" })).toBeVisible();
  await expect(page.getByRole("button", { name: "前往官方验真平台" })).toBeVisible();

  await page.getByRole("button", { name: "进入三种方式验真" }).click();
  await page.getByRole("button", { name: "验证", exact: true }).click();
  await expect(page.getByText("验证通过", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "打开官方验真平台（原型）" })).toBeEnabled();

  await page.goto("/assets/results/competition-result-sanchuang-16");
  await expect(page.getByRole("button", { name: "成绩报告处理中" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "下载成绩报告" })).toHaveCount(0);
  await expect(page.getByText(/不能下载为正式可信成绩报告/)).toBeVisible();
});

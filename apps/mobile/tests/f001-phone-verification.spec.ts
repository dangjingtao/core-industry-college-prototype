import { expect, test } from "@playwright/test";

test("F001 phone verification gates save and persists the verified number", async ({ page }) => {
  await page.goto("/me/profile");

  const phone = page.getByLabel("手机号");
  const save = page.getByRole("button", { name: "保存资料" });
  const originalPhone = await phone.inputValue();
  const newPhone = "13900139000";

  // Returning to the original verified number must restore the same parent save gate.
  await phone.fill(newPhone);
  await expect(save).toBeDisabled();
  await phone.fill(originalPhone);
  await expect(save).toBeEnabled();

  await phone.fill(newPhone);
  await expect(save).toBeDisabled();
  await page.getByRole("button", { name: "发送验证码" }).click();

  const code = page.getByPlaceholder("输入 6 位验证码");
  await code.fill("654321");
  await page.getByRole("button", { name: "验证", exact: true }).click();
  await expect(save).toBeDisabled();
  await expect(page.getByText("手机号已验证", { exact: true })).toHaveCount(0);

  await code.fill("123456");
  await page.getByRole("button", { name: "验证", exact: true }).click();
  await expect(page.getByText("手机号已验证", { exact: true })).toBeVisible();
  await expect(save).toBeEnabled();

  await save.click();
  await expect(page).toHaveURL(/\/me$/);

  await page.goto("/me/profile");
  await expect(page.getByLabel("手机号")).toHaveValue(newPhone);
  await expect(page.getByText("手机号已验证", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "保存资料" })).toBeEnabled();
});

import { expect, test } from "@playwright/test";

test("browse, filter and open a vehicle", async ({ page }) => {
  await page.goto("/cars");
  await expect(page.getByRole("heading", { name: "Khám phá bộ sưu tập xe" })).toBeVisible();
  await page.getByLabel("Tìm theo tên xe").fill("S 450");
  await expect(page.getByText("S 450 L", { exact: true })).toBeVisible();
  await expect(page).toHaveURL(/search=S(%20|\+)450/);
  await page.getByRole("link", { name: /Xem chi tiết/ }).first().click();
  await expect(page.getByRole("heading", { name: /Mercedes-Benz/ })).toBeVisible();
});

test("compare vehicles and calculate finance", async ({ page }) => {
  await page.goto("/compare");
  await expect(page.getByText("3 xe được chọn")).toBeVisible();
  await expect(page.getByText("Công suất", { exact: true })).toBeVisible();
  await page.goto("/finance");
  await expect(page.getByText("Số tiền trả hàng tháng")).toBeVisible();
  await page.getByLabel("Lãi suất dự kiến (%)").fill("7.5");
  await expect(page.getByText("Kết quả dự kiến")).toBeVisible();
});

test("lead form validates required fields", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Đặt lịch lái thử" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: /Gửi yêu cầu tư vấn/ }).click();
  await expect(page.getByLabel("Họ và tên *")).toBeFocused();
});

test("admin login screen is protected", async ({ page }) => {
  await page.goto("/admin/dashboard");
  await expect(page).toHaveURL(/\/admin\/login/, { timeout: 15_000 });
  await expect(page.getByRole("heading", { name: "Chào mừng trở lại." })).toBeVisible();
});

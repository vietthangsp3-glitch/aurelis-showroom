import { expect, test } from "@playwright/test";

test("browse, filter and open a vehicle", async ({ page }) => {
  await page.goto("/cars", { waitUntil: "domcontentloaded" });
  await expect(
    page.getByRole("heading", { name: "Khám phá bộ sưu tập xe" }),
  ).toBeVisible();
  await page.getByLabel("Tìm theo tên xe").fill("S 450");
  await expect(page.getByText("S 450 L", { exact: true })).toBeVisible();
  await expect(page).toHaveURL(/search=S(%20|\+)450/);
  await page
    .getByRole("link", { name: /Xem chi tiết/ })
    .first()
    .click();
  await expect(
    page.getByRole("heading", { name: /Mercedes-Benz/ }),
  ).toBeVisible();
});

test("compare vehicles and calculate finance", async ({ page }) => {
  await page.goto("/compare", { waitUntil: "domcontentloaded" });
  await expect(page.getByText("3 xe được chọn")).toBeVisible();
  await expect(page.getByText("Công suất", { exact: true })).toBeVisible();
  await page.goto("/finance", { waitUntil: "domcontentloaded" });
  await expect(page.getByText("Số tiền trả hàng tháng")).toBeVisible();
  await page.getByLabel("Lãi suất dự kiến (%)").fill("7.5");
  await expect(page.getByText("Kết quả dự kiến")).toBeVisible();
});

test("test-drive flow is reachable and validates required fields", async ({
  page,
}) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.getByRole("link", { name: "Đặt lịch lái thử" }).click();
  await expect(page).toHaveURL(/\/test-drive/);
  await expect(
    page.getByRole("heading", { name: "Đặt lịch lái thử" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Đặt lịch lái thử" }).click();
  await expect(page.getByLabel("Họ và tên *")).toBeFocused();
});

test("admin login screen is protected", async ({ page }) => {
  await page.goto("/admin/dashboard", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/admin\/login/, { timeout: 15_000 });
  await expect(
    page.getByRole("heading", { name: "Chào mừng trở lại." }),
  ).toBeVisible();
});

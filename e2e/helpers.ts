import { expect, type Page } from "@playwright/test";

export const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? "admin@memberbee.local";
export const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? "Admin-Pass-2026";

export function uniqueEmail(prefix = "user") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
}

export async function register(page: Page, email: string, password = "Secret-pass-123") {
  await page.goto("/register");
  await page.getByLabel("שם פרטי").fill("דנה");
  await page.getByLabel("שם משפחה").fill("כהן");
  await page.getByLabel("אימייל", { exact: true }).fill(email);
  await page.getByLabel("סיסמה", { exact: true }).fill(password);
  await page.getByLabel(/קראתי ואני מסכים/).check();
  await page.getByRole("button", { name: "יצירת חשבון" }).click();
  await expect(page).toHaveURL(/\/account\/profile/);
}

export async function login(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("אימייל", { exact: true }).fill(email);
  await page.getByLabel("סיסמה", { exact: true }).fill(password);
  await page.getByRole("button", { name: "התחברות" }).click();
}

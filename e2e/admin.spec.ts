import { expect, test } from "@playwright/test";
import { ADMIN_EMAIL, ADMIN_PASSWORD, login } from "./helpers";

test("admin creates a club with a benefit and it appears publicly", async ({ page }) => {
  const slug = `e2e-club-${Date.now()}`;
  await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
  await expect(page).toHaveURL(/\/account/);

  await page.goto("/admin/clubs/new");
  await page.getByLabel("שם המועדון").fill("מועדון בדיקה");
  await page.getByLabel("כתובת (slug)").fill(slug);
  await page.getByLabel("קטגוריה").selectOption({ label: "ספורט ופנאי" });
  await page.getByLabel("משפט מפתח").fill("מועדון שנוצר בבדיקה אוטומטית");
  await page.getByLabel("תיאור").fill("תיאור המועדון");
  await page.getByRole("button", { name: "יצירת מועדון" }).click();

  await expect(page.getByText("המועדון נוצר")).toBeVisible();
  await page.getByLabel("כותרת").fill("20% הנחה לבודקים");
  await page.getByRole("button", { name: "הוספת הטבה" }).click();
  await expect(page.getByText("ההטבה נוספה")).toBeVisible();

  await page.goto(`/clubs/${slug}`);
  await expect(page.getByRole("heading", { level: 1, name: "מועדון בדיקה" })).toBeVisible();
  await expect(page.getByText("20% הנחה לבודקים")).toBeVisible();

  // Clean up so repeated runs don't pile up test clubs.
  await page.goto("/admin/clubs");
  await page.getByRole("link", { name: "מועדון בדיקה" }).first().click();
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "מחיקה לצמיתות" }).click();
  await expect(page).toHaveURL(/\/admin\/clubs$/);
});

test("admin dashboard shows stats", async ({ page }) => {
  await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
  await page.waitForURL(/\/account/);
  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: "לוח בקרה" })).toBeVisible();
  await expect(page.getByText("מועדונים פעילים")).toBeVisible();
});

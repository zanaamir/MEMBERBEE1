import { expect, test } from "@playwright/test";

test("home page shows hero and featured clubs", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("כל מועדוני הלקוחות שלך");
  await expect(page.getByRole("heading", { name: "מועדונים פופולריים" })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
});

test("catalog search and category filter", async ({ page }) => {
  await page.goto("/clubs");
  await page.getByRole("searchbox", { name: "חיפוש מועדון" }).fill("ראן");
  await page.getByRole("button", { name: "חיפוש" }).click();
  await expect(page).toHaveURL(/q=/);
  await expect(page.getByRole("link", { name: /ראן פיט/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /סופר השכונה/ })).toHaveCount(0);

  await page.goto("/clubs?category=food");
  await expect(page.getByRole("link", { name: /סופר השכונה/ })).toBeVisible();
});

test("club page lists benefits and asks visitors to sign up", async ({ page }) => {
  await page.goto("/clubs/super-hashchuna");
  await expect(page.getByRole("heading", { level: 1, name: "סופר השכונה" })).toBeVisible();
  await expect(page.getByText("5% הנחה קבועה")).toBeVisible();
  await expect(page.getByRole("link", { name: "הרשמה והצטרפות" })).toBeVisible();
});

test("unknown pages return 404", async ({ page }) => {
  const res = await page.goto("/clubs/does-not-exist");
  expect(res?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "העמוד לא נמצא" })).toBeVisible();
});

test("protected pages redirect to login", async ({ page }) => {
  await page.goto("/account");
  await expect(page).toHaveURL(/\/login\?next=%2Faccount/);
});

test("health endpoint reports ok", async ({ request }) => {
  const res = await request.get("/api/health");
  expect(res.ok()).toBeTruthy();
  expect(await res.json()).toMatchObject({ status: "ok" });
});

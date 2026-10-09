import { expect, test } from "@playwright/test";
import { login, register, uniqueEmail } from "./helpers";

test("register, complete profile, join and leave a club", async ({ page }) => {
  const email = uniqueEmail();
  await register(page, email);
  await expect(page.getByText("החשבון נוצר בהצלחה")).toBeVisible();

  // The club requires phone + date of birth, which a new profile doesn't have yet.
  await page.goto("/clubs/super-hashchuna");
  await expect(page.getByText("כדי להצטרף צריך להשלים כמה פרטים בפרופיל")).toBeVisible();
  await page.getByRole("link", { name: "להשלמת הפרופיל" }).click();

  await page.getByLabel("טלפון נייד").fill("052-1234567");
  await page.getByLabel("תאריך לידה").fill("1990-05-17");
  await page.getByRole("button", { name: "שמירת הפרטים" }).click();

  // Saving with ?next= returns to the club page.
  await expect(page).toHaveURL(/\/clubs\/super-hashchuna/);
  await page.getByRole("button", { name: "הצטרפות בלחיצה" }).click();
  await expect(page.getByRole("heading", { name: "כרטיס החבר שלך" })).toBeVisible();
  await expect(page.getByText(/^MB-\d{4}-\d{4}$/)).toBeVisible();

  await page.goto("/account");
  await expect(page.getByRole("link", { name: /סופר השכונה/ })).toBeVisible();

  await page.goto("/clubs/super-hashchuna");
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "עזיבת המועדון" }).click();
  await expect(page.getByRole("button", { name: "הצטרפות בלחיצה" })).toBeVisible();
});

test("profile validation keeps typed values and shows errors", async ({ page }) => {
  await register(page, uniqueEmail());
  await page.getByLabel("טלפון נייד").fill("123");
  await page.getByLabel("כתובת", { exact: true }).fill("הרצל 1");
  await page.getByRole("button", { name: "שמירת הפרטים" }).click();
  await expect(page.getByText("מספר טלפון לא תקין")).toBeVisible();
  await expect(page.getByLabel("כתובת", { exact: true })).toHaveValue("הרצל 1");
});

test("add and remove a child", async ({ page }) => {
  await register(page, uniqueEmail());
  await page.goto("/account/family");
  await page.getByLabel("שם פרטי").fill("נועה");
  await page.getByLabel("תאריך לידה").fill("2019-03-02");
  await page.getByRole("button", { name: "הוספה" }).click();
  await expect(page.getByText("נועה")).toBeVisible();

  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "הסרה" }).click();
  await expect(page.getByText("עדיין לא נוספו ילדים")).toBeVisible();
});

test("duplicate registration and wrong password are rejected", async ({ page, browser }) => {
  const email = uniqueEmail();
  await register(page, email);

  const other = await browser.newPage();
  await other.goto("/register");
  await other.getByLabel("שם פרטי").fill("א");
  await other.getByLabel("שם משפחה").fill("ב");
  await other.getByLabel("אימייל", { exact: true }).fill(email);
  await other.getByLabel("סיסמה", { exact: true }).fill("Secret-pass-123");
  await other.getByLabel(/קראתי ואני מסכים/).check();
  await other.getByRole("button", { name: "יצירת חשבון" }).click();
  await expect(other.getByText("כתובת האימייל כבר רשומה")).toBeVisible();

  await login(other, email, "wrong-password-1");
  await expect(other.getByText("האימייל או הסיסמה שגויים")).toBeVisible();
  await other.close();
});

test("logout ends the session", async ({ page }) => {
  await register(page, uniqueEmail());
  await page.getByRole("button", { name: "התנתקות" }).first().click();
  await expect(page).toHaveURL("/");
  await page.goto("/account");
  await expect(page).toHaveURL(/\/login/);
});

test("non-admins cannot open the admin area", async ({ page }) => {
  await register(page, uniqueEmail());
  await page.goto("/admin");
  await expect(page).toHaveURL("/");
});

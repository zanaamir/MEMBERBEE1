import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ActionForm, CheckboxField, SubmitButton, TextField } from "@/components/forms";
import { getCurrentUser } from "@/lib/auth";
import { safeRedirectPath } from "@/lib/validation";
import { registerAction } from "../actions";

export const metadata: Metadata = { title: "הרשמה" };

export default async function RegisterPage({ searchParams }: PageProps<"/register">) {
  const { next } = await searchParams;
  if (await getCurrentUser()) redirect("/account");

  return (
    <>
      <h1 className="text-2xl font-extrabold">פותחים חשבון אחד לכל המועדונים</h1>
      <p className="mt-1 mb-6 text-muted">לוקח פחות מדקה. את שאר הפרטים אפשר להשלים אחר כך.</p>
      <ActionForm action={registerAction}>
        {next && <input type="hidden" name="next" value={safeRedirectPath(next)} />}
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField name="firstName" label="שם פרטי" autoComplete="given-name" required />
          <TextField name="lastName" label="שם משפחה" autoComplete="family-name" required />
        </div>
        <TextField name="email" label="אימייל" type="email" autoComplete="email" dir="ltr" required />
        <TextField
          name="password"
          label="סיסמה"
          type="password"
          autoComplete="new-password"
          dir="ltr"
          hint="לפחות 10 תווים, כולל אותיות ומספרים"
          required
        />
        <CheckboxField
          name="acceptTerms"
          label={
            <>
              קראתי ואני מסכים/ה ל
              <Link href="/terms" className="font-semibold text-honey-700 underline" target="_blank">
                תנאי השימוש
              </Link>{" "}
              ול
              <Link href="/privacy" className="font-semibold text-honey-700 underline" target="_blank">
                מדיניות הפרטיות
              </Link>
            </>
          }
        />
        <CheckboxField name="marketingOptIn" label="אשמח לקבל עדכונים על הטבות חדשות באימייל (אפשר לבטל בכל עת)" />
        <SubmitButton className="w-full" pendingLabel="יוצר חשבון…">
          יצירת חשבון
        </SubmitButton>
      </ActionForm>
      <p className="mt-6 text-center text-sm text-muted">
        כבר רשומים?{" "}
        <Link href="/login" className="font-semibold text-honey-700 hover:underline">
          להתחברות
        </Link>
      </p>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ActionForm, SubmitButton, TextField } from "@/components/forms";
import { getCurrentUser } from "@/lib/auth";
import { safeRedirectPath } from "@/lib/validation";
import { loginAction } from "../actions";

export const metadata: Metadata = { title: "התחברות" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next } = await searchParams;
  const nextPath = safeRedirectPath(next);
  if (await getCurrentUser()) redirect(nextPath);

  return (
    <>
      <h1 className="text-2xl font-extrabold">ברוכים השבים</h1>
      <p className="mt-1 mb-6 text-muted">התחברו כדי לנהל את המועדונים וההטבות שלכם.</p>
      <ActionForm action={loginAction}>
        <input type="hidden" name="next" value={nextPath} />
        <TextField name="email" label="אימייל" type="email" autoComplete="email" dir="ltr" required />
        <TextField name="password" label="סיסמה" type="password" autoComplete="current-password" dir="ltr" required />
        <SubmitButton className="w-full" pendingLabel="מתחבר…">
          התחברות
        </SubmitButton>
      </ActionForm>
      <p className="mt-6 text-center text-sm text-muted">
        עדיין אין לך חשבון?{" "}
        <Link
          href={`/register${next ? `?next=${encodeURIComponent(nextPath)}` : ""}`}
          className="font-semibold text-honey-700 hover:underline"
        >
          להרשמה חינם
        </Link>
      </p>
    </>
  );
}

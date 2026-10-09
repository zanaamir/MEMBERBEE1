import type { Metadata } from "next";
import { ActionForm, SubmitButton, TextField } from "@/components/forms";
import { Card, PageHeader } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/dates";
import { db } from "@/lib/db";
import { changePasswordAction, deleteAccountAction } from "../actions";

export const metadata: Metadata = { title: "אבטחה וחשבון" };

export default async function SecurityPage() {
  const user = await requireUser("/account/security");
  const { createdAt } = await db.user.findUniqueOrThrow({ where: { id: user.id }, select: { createdAt: true } });

  return (
    <>
      <PageHeader title="אבטחה וחשבון" description={`חשבון ${user.email} · נוצר ב-${formatDate(createdAt)}`} />
      <div className="space-y-6">
        <Card>
          <h2 className="mb-4 text-lg font-bold">שינוי סיסמה</h2>
          <ActionForm action={changePasswordAction} resetOnSuccess className="max-w-md space-y-4">
            <TextField name="currentPassword" label="סיסמה נוכחית" type="password" autoComplete="current-password" dir="ltr" />
            <TextField
              name="newPassword"
              label="סיסמה חדשה"
              type="password"
              autoComplete="new-password"
              dir="ltr"
              hint="לפחות 10 תווים, כולל אותיות ומספרים"
            />
            <TextField name="confirmPassword" label="אימות סיסמה חדשה" type="password" autoComplete="new-password" dir="ltr" />
            <SubmitButton pendingLabel="מעדכן…">עדכון סיסמה</SubmitButton>
          </ActionForm>
        </Card>
        <Card className="border-red-200">
          <h2 className="text-lg font-bold text-red-700">מחיקת החשבון</h2>
          <p className="mt-1 mb-4 text-sm text-muted">
            מחיקה תסיר לצמיתות את הפרופיל, פרטי המשפחה וכל החברויות במועדונים. לא ניתן לבטל פעולה זו.
          </p>
          <ActionForm action={deleteAccountAction} className="max-w-md space-y-4">
            <TextField name="password" label="לאישור, הזינו את הסיסמה" type="password" autoComplete="current-password" dir="ltr" />
            <SubmitButton variant="danger" pendingLabel="מוחק…">
              מחיקת החשבון לצמיתות
            </SubmitButton>
          </ActionForm>
        </Card>
      </div>
    </>
  );
}

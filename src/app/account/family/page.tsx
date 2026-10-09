import type { Metadata } from "next";
import { ActionForm, ConfirmButton, SelectField, SubmitButton, TextField } from "@/components/forms";
import { buttonClass, Card, PageHeader } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { ageInYears, formatDate } from "@/lib/dates";
import { db } from "@/lib/db";
import { genderLabels } from "@/lib/labels";
import { addChildAction, removeChildAction } from "../actions";

export const metadata: Metadata = { title: "המשפחה שלי" };

export default async function FamilyPage() {
  const user = await requireUser("/account/family");
  const children = await db.child.findMany({ where: { userId: user.id }, orderBy: { dateOfBirth: "asc" } });

  return (
    <>
      <PageHeader title="המשפחה שלי" description="מועדונים רבים מעניקים הטבות לימי הולדת של ילדים. הוסיפו אותם פעם אחת." />
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-lg font-bold">הילדים שלי</h2>
          {children.length === 0 ? (
            <p className="text-muted">עדיין לא נוספו ילדים.</p>
          ) : (
            <ul className="divide-y divide-line">
              {children.map((c) => (
                <li key={c.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-semibold">{c.firstName}</p>
                    <p className="text-sm text-muted">
                      {formatDate(c.dateOfBirth)} · בן/בת {ageInYears(c.dateOfBirth)}
                      {c.gender ? ` · ${genderLabels[c.gender]}` : ""}
                    </p>
                  </div>
                  <form action={removeChildAction}>
                    <input type="hidden" name="id" value={c.id} />
                    <ConfirmButton message={`להסיר את ${c.firstName}?`} className={`${buttonClass("ghost", "sm")} text-red-700`}>
                      הסרה
                    </ConfirmButton>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card>
          <h2 className="mb-4 text-lg font-bold">הוספת ילד/ה</h2>
          <ActionForm action={addChildAction} resetOnSuccess>
            <TextField name="firstName" label="שם פרטי" required />
            <TextField name="dateOfBirth" label="תאריך לידה" type="date" required />
            <SelectField
              name="gender"
              label="מגדר"
              placeholder="לא צוין"
              options={Object.entries(genderLabels).map(([value, label]) => ({ value, label }))}
            />
            <SubmitButton pendingLabel="מוסיף…">הוספה</SubmitButton>
          </ActionForm>
        </Card>
      </div>
    </>
  );
}

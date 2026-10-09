import type { Metadata } from "next";
import { ActionForm, CheckboxField, CheckboxGroup, SelectField, SubmitButton, TextField } from "@/components/forms";
import { Alert, Card, PageHeader } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { toDateInput } from "@/lib/dates";
import { db } from "@/lib/db";
import { genderLabels } from "@/lib/labels";
import { safeRedirectPath } from "@/lib/validation";
import { updateProfileAction } from "../actions";

export const metadata: Metadata = { title: "פרטים אישיים" };

export default async function ProfilePage({ searchParams }: PageProps<"/account/profile">) {
  const sessionUser = await requireUser("/account/profile");
  const { welcome, next } = await searchParams;
  const [user, cities, categories] = await Promise.all([
    db.user.findUniqueOrThrow({ where: { id: sessionUser.id }, include: { interests: { select: { id: true } } } }),
    db.city.findMany({ orderBy: { name: "asc" } }),
    db.category.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
  ]);

  return (
    <>
      <PageHeader title="פרטים אישיים" description="הפרטים נשמרים פעם אחת ומשמשים להצטרפות מהירה לכל מועדון." />
      {welcome && (
        <div className="mb-6">
          <Alert tone="success">החשבון נוצר בהצלחה! כדאי להשלים את הפרטים כדי להצטרף למועדונים בלחיצה.</Alert>
        </div>
      )}
      <Card>
        <ActionForm action={updateProfileAction} className="space-y-6">
          {typeof next === "string" && <input type="hidden" name="next" value={safeRedirectPath(next)} />}
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField name="firstName" label="שם פרטי" defaultValue={user.firstName} autoComplete="given-name" required />
            <TextField name="lastName" label="שם משפחה" defaultValue={user.lastName} autoComplete="family-name" required />
            <TextField name="email" label="אימייל" defaultValue={user.email} dir="ltr" disabled hint="לשינוי כתובת האימייל פנו אלינו" />
            <TextField
              name="phone"
              label="טלפון נייד"
              type="tel"
              defaultValue={user.phone ?? ""}
              autoComplete="tel"
              dir="ltr"
              placeholder="050-1234567"
            />
            <TextField name="dateOfBirth" label="תאריך לידה" type="date" defaultValue={toDateInput(user.dateOfBirth)} autoComplete="bday" />
            <SelectField
              name="gender"
              label="מגדר"
              placeholder="לא צוין"
              defaultValue={user.gender ?? ""}
              options={Object.entries(genderLabels).map(([value, label]) => ({ value, label }))}
            />
            <SelectField
              name="cityId"
              label="עיר מגורים"
              placeholder="בחירת עיר"
              defaultValue={user.cityId?.toString() ?? ""}
              options={cities.map((c) => ({ value: String(c.id), label: c.name }))}
            />
            <TextField name="address" label="כתובת" defaultValue={user.address ?? ""} autoComplete="street-address" />
            <TextField
              name="anniversaryDate"
              label="תאריך נישואין"
              type="date"
              defaultValue={toDateInput(user.anniversaryDate)}
              hint="יש מועדונים שנותנים הטבה ביום הנישואין"
            />
          </div>
          <CheckboxGroup
            name="interests"
            legend="תחומי עניין – נמליץ לך על מועדונים מתאימים"
            options={categories.map((c) => ({ value: String(c.id), label: c.name }))}
            defaultValues={user.interests.map((i) => String(i.id))}
          />
          <CheckboxField name="marketingOptIn" label="אשמח לקבל עדכונים על הטבות חדשות באימייל" defaultChecked={user.marketingOptIn} />
          <SubmitButton pendingLabel="שומר…">שמירת הפרטים</SubmitButton>
        </ActionForm>
      </Card>
    </>
  );
}

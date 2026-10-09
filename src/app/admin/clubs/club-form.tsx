import type { Club } from "@prisma/client";
import { ActionForm, CheckboxField, CheckboxGroup, SelectField, SubmitButton, TextAreaField, TextField } from "@/components/forms";
import type { FormState } from "@/lib/form";
import { profileFieldLabels } from "@/lib/labels";

export function ClubForm({
  action,
  categories,
  club,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  categories: { id: number; name: string }[];
  club?: Club;
}) {
  return (
    <ActionForm action={action} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField name="name" label="שם המועדון" defaultValue={club?.name} required />
        <TextField
          name="slug"
          label="כתובת (slug)"
          defaultValue={club?.slug}
          dir="ltr"
          hint="לדוגמה: super-shchuna → /clubs/super-shchuna"
          required
        />
        <SelectField
          name="categoryId"
          label="קטגוריה"
          placeholder="בחירת קטגוריה"
          defaultValue={club?.categoryId.toString()}
          options={categories.map((c) => ({ value: String(c.id), label: c.name }))}
        />
        <TextField
          name="brandColor"
          label="צבע מותג"
          type="color"
          defaultValue={club?.brandColor ?? "#f59e0b"}
          className="h-11 w-full cursor-pointer rounded-xl border border-line bg-white p-1"
        />
        <TextField
          name="websiteUrl"
          label="אתר המועדון"
          type="url"
          defaultValue={club?.websiteUrl ?? ""}
          dir="ltr"
          placeholder="https://"
        />
        <TextField
          name="logoUrl"
          label="כתובת לוגו"
          type="url"
          defaultValue={club?.logoUrl ?? ""}
          dir="ltr"
          placeholder="https://"
          hint="אופציונלי – אחרת תוצג האות הראשונה"
        />
      </div>
      <TextField name="tagline" label="משפט מפתח" defaultValue={club?.tagline} required />
      <TextAreaField name="description" label="תיאור" defaultValue={club?.description} rows={5} required />
      <TextAreaField name="terms" label="תקנון" defaultValue={club?.terms} rows={5} />
      <CheckboxGroup
        name="requiredFields"
        legend="פרטים נדרשים להצטרפות"
        options={Object.entries(profileFieldLabels).map(([value, label]) => ({ value, label }))}
        defaultValues={club?.requiredFields ?? []}
      />
      <CheckboxField name="isActive" label="המועדון פעיל ומוצג באתר" defaultChecked={club?.isActive ?? true} />
      <SubmitButton pendingLabel="שומר…">{club ? "שמירת שינויים" : "יצירת מועדון"}</SubmitButton>
    </ActionForm>
  );
}

import type { Metadata } from "next";
import { ActionForm, SubmitButton, TextAreaField, TextField } from "@/components/forms";
import { Card, Container, PageHeader } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { contactAction } from "./actions";

export const metadata: Metadata = { title: "צור קשר", description: "שאלה, הצעה או מועדון שתרצו שנוסיף? נשמח לשמוע." };

export default async function ContactPage() {
  const user = await getCurrentUser();
  return (
    <Container className="max-w-2xl py-12">
      <PageHeader title="צור קשר" description="שאלה, הצעה, או מועדון שתרצו שנוסיף? כתבו לנו ונחזור אליכם." />
      <Card>
        <ActionForm action={contactAction} resetOnSuccess>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              name="name"
              label="שם מלא"
              defaultValue={user ? `${user.firstName} ${user.lastName}` : undefined}
              autoComplete="name"
              required
            />
            <TextField name="email" label="אימייל" type="email" defaultValue={user?.email} autoComplete="email" dir="ltr" required />
          </div>
          <TextField name="subject" label="נושא" required />
          <TextAreaField name="message" label="ההודעה" rows={6} required />
          <div className="hidden" aria-hidden>
            <label>
              Website <input name="website" tabIndex={-1} autoComplete="off" />
            </label>
          </div>
          <SubmitButton pendingLabel="שולח…">שליחה</SubmitButton>
        </ActionForm>
      </Card>
    </Container>
  );
}

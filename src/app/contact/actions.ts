"use server";

import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { fieldErrors, formValues, type FormState } from "@/lib/form";
import { parseForm } from "@/lib/parse-form";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request";
import { contactSchema } from "@/lib/validation";

export async function contactAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = formValues(formData);
  // Honeypot: real users never see or fill this field.
  if (formData.get("website")) return { ok: true, message: "תודה! קיבלנו את הפנייה ונחזור אליך בהקדם." };

  const parsed = parseForm(contactSchema, formData);
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values };

  const limit = await rateLimit(`contact:ip:${await getClientIp()}`, 5, 60 * 60);
  if (!limit.ok) return { message: "שלחת כבר כמה פניות. אפשר לנסות שוב בעוד שעה.", values };

  const user = await getCurrentUser();
  await db.contactMessage.create({ data: { ...parsed.data, userId: user?.id ?? null } });
  return { ok: true, message: "תודה! קיבלנו את הפנייה ונחזור אליך בהקדם." };
}

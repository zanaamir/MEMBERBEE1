"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { fieldErrors, formValues, type FormState } from "@/lib/form";
import { logger } from "@/lib/logger";
import { parseForm } from "@/lib/parse-form";
import { hashPassword, verifyPassword } from "@/lib/password";
import { rateLimit } from "@/lib/rate-limit";
import { deleteCurrentSession, deleteOtherSessions } from "@/lib/session";
import { changePasswordSchema, childSchema, profileSchema, safeRedirectPath } from "@/lib/validation";

export async function updateProfileAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const values = formValues(formData);
  const parsed = parseForm(profileSchema, formData, ["interests"]);
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values, message: "יש לתקן את השדות המסומנים." };

  const { interests, cityId, ...data } = parsed.data;
  if (cityId && !(await db.city.findUnique({ where: { id: cityId }, select: { id: true } }))) {
    return { errors: { cityId: ["עיר לא תקינה"] }, values };
  }
  const validInterests = await db.category.findMany({ where: { id: { in: interests } }, select: { id: true } });

  await db.user.update({
    where: { id: user.id },
    data: {
      ...data,
      phone: data.phone ?? null,
      dateOfBirth: data.dateOfBirth ?? null,
      gender: data.gender ?? null,
      address: data.address ?? null,
      anniversaryDate: data.anniversaryDate ?? null,
      city: cityId ? { connect: { id: cityId } } : { disconnect: true },
      interests: { set: validInterests },
    },
  });
  revalidatePath("/", "layout");

  const next = formData.get("next");
  if (typeof next === "string" && next) redirect(safeRedirectPath(next));
  return { ok: true, message: "הפרטים נשמרו בהצלחה." };
}

export async function addChildAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const values = formValues(formData);
  const parsed = parseForm(childSchema, formData);
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values };

  const count = await db.child.count({ where: { userId: user.id } });
  if (count >= 15) return { message: "הגעת למספר הילדים המרבי.", values };

  await db.child.create({ data: { ...parsed.data, gender: parsed.data.gender ?? null, userId: user.id } });
  revalidatePath("/account/family");
  return { ok: true, message: "הילד/ה נוספו." };
}

export async function removeChildAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  // Scoped by userId so one user can never delete another user's records.
  await db.child.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/account/family");
}

export async function changePasswordAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = parseForm(changePasswordSchema, formData);
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  const limit = await rateLimit(`password:${user.id}`, 10, 15 * 60);
  if (!limit.ok) return { message: "יותר מדי ניסיונות. נסו שוב מאוחר יותר." };

  const { passwordHash } = await db.user.findUniqueOrThrow({ where: { id: user.id }, select: { passwordHash: true } });
  if (!(await verifyPassword(parsed.data.currentPassword, passwordHash))) {
    return { errors: { currentPassword: ["הסיסמה הנוכחית שגויה"] } };
  }
  await db.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(parsed.data.newPassword) } });
  // A password change signs out every other device.
  await deleteOtherSessions(user.id);
  logger.info("password changed", { userId: user.id });
  return { ok: true, message: "הסיסמה עודכנה. התנתקת מכל שאר המכשירים." };
}

export async function deleteAccountAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const password = String(formData.get("password") ?? "");
  const { passwordHash } = await db.user.findUniqueOrThrow({ where: { id: user.id }, select: { passwordHash: true } });
  if (!(await verifyPassword(password, passwordHash))) {
    return { errors: { password: ["הסיסמה שגויה"] } };
  }
  if (user.role === "ADMIN" && (await db.user.count({ where: { role: "ADMIN" } })) <= 1) {
    return { message: "לא ניתן למחוק את מנהל המערכת האחרון." };
  }
  await deleteCurrentSession();
  // Cascades remove sessions, children, memberships and interests.
  await db.user.delete({ where: { id: user.id } });
  logger.info("account deleted", { userId: user.id });
  redirect("/?deleted=1");
}

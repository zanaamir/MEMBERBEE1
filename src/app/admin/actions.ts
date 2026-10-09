"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { fieldErrors, formValues, type FormState } from "@/lib/form";
import { logger } from "@/lib/logger";
import { parseForm } from "@/lib/parse-form";
import { benefitSchema, clubSchema } from "@/lib/validation";

function revalidateClubs(slug?: string) {
  revalidatePath("/");
  revalidatePath("/clubs");
  if (slug) revalidatePath(`/clubs/${slug}`);
  revalidatePath("/admin/clubs");
}

function isUniqueViolation(err: unknown) {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002";
}

export async function createClubAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const values = formValues(formData);
  const parsed = parseForm(clubSchema, formData, ["requiredFields"]);
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values, message: "יש לתקן את השדות המסומנים." };

  let id: string;
  try {
    ({ id } = await db.club.create({ data: parsed.data, select: { id: true } }));
  } catch (err) {
    if (isUniqueViolation(err)) return { errors: { slug: ["הכתובת כבר בשימוש"] }, values };
    throw err;
  }
  logger.info("club created", { adminId: admin.id, clubId: id });
  revalidateClubs(parsed.data.slug);
  redirect(`/admin/clubs/${id}?created=1`);
}

export async function updateClubAction(clubId: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const values = formValues(formData);
  const parsed = parseForm(clubSchema, formData, ["requiredFields"]);
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values, message: "יש לתקן את השדות המסומנים." };

  const previous = await db.club.findUnique({ where: { id: clubId }, select: { slug: true } });
  if (!previous) return { message: "המועדון לא נמצא." };
  try {
    await db.club.update({ where: { id: clubId }, data: parsed.data });
  } catch (err) {
    if (isUniqueViolation(err)) return { errors: { slug: ["הכתובת כבר בשימוש"] }, values };
    throw err;
  }
  logger.info("club updated", { adminId: admin.id, clubId });
  revalidateClubs(previous.slug);
  revalidateClubs(parsed.data.slug);
  revalidatePath(`/admin/clubs/${clubId}`);
  return { ok: true, message: "השינויים נשמרו." };
}

export async function deleteClubAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const club = await db.club.delete({ where: { id }, select: { slug: true } }).catch(() => null);
  if (club) {
    logger.warn("club deleted", { adminId: admin.id, clubId: id });
    revalidateClubs(club.slug);
  }
  redirect("/admin/clubs");
}

export async function addBenefitAction(clubId: string, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const values = formValues(formData);
  const parsed = parseForm(benefitSchema, formData);
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values };

  const club = await db.club.findUnique({ where: { id: clubId }, select: { slug: true } });
  if (!club) return { message: "המועדון לא נמצא." };
  await db.benefit.create({ data: { ...parsed.data, clubId } });
  revalidateClubs(club.slug);
  revalidatePath(`/admin/clubs/${clubId}`);
  return { ok: true, message: "ההטבה נוספה." };
}

export async function toggleBenefitAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const benefit = await db.benefit.findUnique({
    where: { id },
    select: { isActive: true, clubId: true, club: { select: { slug: true } } },
  });
  if (!benefit) return;
  await db.benefit.update({ where: { id }, data: { isActive: !benefit.isActive } });
  revalidateClubs(benefit.club.slug);
  revalidatePath(`/admin/clubs/${benefit.clubId}`);
}

export async function deleteBenefitAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const benefit = await db.benefit.delete({ where: { id }, select: { clubId: true, club: { select: { slug: true } } } }).catch(() => null);
  if (!benefit) return;
  revalidateClubs(benefit.club.slug);
  revalidatePath(`/admin/clubs/${benefit.clubId}`);
}

export async function toggleMessageHandledAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const msg = await db.contactMessage.findUnique({ where: { id }, select: { handled: true } });
  if (!msg) return;
  await db.contactMessage.update({ where: { id }, data: { handled: !msg.handled } });
  revalidatePath("/admin/messages");
  revalidatePath("/admin");
}

export async function setUserRoleAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const role = formData.get("role") === "ADMIN" ? "ADMIN" : "USER";
  // Admins can't demote themselves, so the system always keeps at least one admin.
  if (id === admin.id) return;
  await db.user.update({ where: { id }, data: { role } }).catch(() => null);
  logger.warn("user role changed", { adminId: admin.id, userId: id, role });
  revalidatePath("/admin/users");
}

"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import type { FormState } from "@/lib/form";
import { profileFieldLabels } from "@/lib/labels";
import { logger } from "@/lib/logger";
import { generateMemberNumber, missingRequiredFields } from "@/lib/membership";

export async function joinClubAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const clubId = String(formData.get("clubId") ?? "");
  const user = await requireUser();

  const club = await db.club.findFirst({
    where: { id: clubId, isActive: true },
    select: { id: true, slug: true, name: true, requiredFields: true },
  });
  if (!club) return { message: "המועדון לא נמצא או שאינו פעיל." };

  const profile = await db.user.findUniqueOrThrow({
    where: { id: user.id },
    select: {
      phone: true,
      dateOfBirth: true,
      gender: true,
      cityId: true,
      address: true,
      anniversaryDate: true,
      _count: { select: { children: true } },
    },
  });
  const missing = missingRequiredFields(club.requiredFields, { ...profile, childrenCount: profile._count.children });
  if (missing.length > 0) {
    return { message: `כדי להצטרף ל${club.name} יש להשלים בפרופיל: ${missing.map((f) => profileFieldLabels[f]).join(", ")}.` };
  }

  // Retry on the (very unlikely) member-number collision.
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      await db.membership.create({ data: { userId: user.id, clubId: club.id, memberNumber: generateMemberNumber() } });
      logger.info("club joined", { userId: user.id, clubId: club.id });
      break;
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        const target = String(err.meta?.target ?? "");
        if (target.includes("memberNumber")) continue;
        return { ok: true, message: `את/ה כבר חבר/ה ב${club.name}.` };
      }
      throw err;
    }
  }

  revalidatePath(`/clubs/${club.slug}`);
  revalidatePath("/account");
  return { ok: true, message: `ברוך/ה הבא/ה ל${club.name}! 🎉` };
}

export async function leaveClubAction(formData: FormData): Promise<void> {
  const clubId = String(formData.get("clubId") ?? "");
  const user = await requireUser();
  const membership = await db.membership.findUnique({
    where: { userId_clubId: { userId: user.id, clubId } },
    select: { id: true, club: { select: { slug: true } } },
  });
  if (!membership) return;
  await db.membership.delete({ where: { id: membership.id } });
  logger.info("club left", { userId: user.id, clubId });
  revalidatePath(`/clubs/${membership.club.slug}`);
  revalidatePath("/account");
}

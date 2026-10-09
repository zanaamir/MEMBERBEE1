import "server-only";
import type { Prisma } from "@prisma/client";
import { db } from "./db";

export const clubCardSelect = {
  id: true,
  slug: true,
  name: true,
  tagline: true,
  logoUrl: true,
  brandColor: true,
  category: { select: { name: true, slug: true } },
  _count: { select: { benefits: { where: { isActive: true } } } },
} satisfies Prisma.ClubSelect;

export async function listActiveClubs({ q, category }: { q?: string; category?: string }) {
  const query = q?.trim().slice(0, 100);
  return db.club.findMany({
    where: {
      isActive: true,
      ...(category ? { category: { slug: category } } : {}),
      ...(query
        ? {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { tagline: { contains: query, mode: "insensitive" } },
              { description: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: [{ memberships: { _count: "desc" } }, { name: "asc" }],
    select: clubCardSelect,
  });
}

export function listCategories() {
  return db.category.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] });
}

export async function getMemberClubIds(userId: string): Promise<Set<string>> {
  const rows = await db.membership.findMany({ where: { userId }, select: { clubId: true } });
  return new Set(rows.map((r) => r.clubId));
}

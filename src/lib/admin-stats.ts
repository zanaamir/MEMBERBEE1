import "server-only";
import { db } from "./db";

export async function getAdminStats() {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [users, newUsers, clubs, activeClubs, memberships, newMemberships, openMessages, topClubs] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { createdAt: { gte: weekAgo } } }),
    db.club.count(),
    db.club.count({ where: { isActive: true } }),
    db.membership.count(),
    db.membership.count({ where: { joinedAt: { gte: weekAgo } } }),
    db.contactMessage.count({ where: { handled: false } }),
    db.club.findMany({
      take: 5,
      orderBy: { memberships: { _count: "desc" } },
      select: { id: true, name: true, _count: { select: { memberships: true } } },
    }),
  ]);
  return { users, newUsers, clubs, activeClubs, memberships, newMemberships, openMessages, topClubs };
}

import type { Metadata } from "next";
import Link from "next/link";
import { ClubLogo } from "@/components/club-logo";
import { Badge, EmptyState, LinkButton, PageHeader } from "@/components/ui";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "מועדונים" };

export default async function AdminClubsPage() {
  const clubs = await db.club.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      logoUrl: true,
      brandColor: true,
      isActive: true,
      category: { select: { name: true } },
      _count: { select: { memberships: true, benefits: true } },
    },
  });

  return (
    <>
      <PageHeader title="מועדונים" actions={<LinkButton href="/admin/clubs/new">+ מועדון חדש</LinkButton>} />
      {clubs.length === 0 ? (
        <EmptyState title="אין עדיין מועדונים" action={<LinkButton href="/admin/clubs/new">יצירת המועדון הראשון</LinkButton>} />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-white">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 text-start text-xs text-muted">
              <tr>
                <th className="px-4 py-3 text-start font-semibold">מועדון</th>
                <th className="px-4 py-3 text-start font-semibold">קטגוריה</th>
                <th className="px-4 py-3 text-start font-semibold">חברים</th>
                <th className="px-4 py-3 text-start font-semibold">הטבות</th>
                <th className="px-4 py-3 text-start font-semibold">סטטוס</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {clubs.map((c) => (
                <tr key={c.id} className="hover:bg-stone-50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/clubs/${c.id}`} className="flex items-center gap-3 font-semibold hover:underline">
                      <ClubLogo name={c.name} logoUrl={c.logoUrl} brandColor={c.brandColor} size="sm" />
                      {c.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{c.category.name}</td>
                  <td className="px-4 py-3 tabular-nums">{c._count.memberships}</td>
                  <td className="px-4 py-3 tabular-nums">{c._count.benefits}</td>
                  <td className="px-4 py-3">{c.isActive ? <Badge tone="green">פעיל</Badge> : <Badge>מוסתר</Badge>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

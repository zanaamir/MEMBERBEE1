import type { Metadata } from "next";
import Link from "next/link";
import { ClubLogo } from "@/components/club-logo";
import { EmptyState, LinkButton, PageHeader } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/dates";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "המועדונים שלי" };

export default async function MyClubsPage() {
  const user = await requireUser("/account");
  const memberships = await db.membership.findMany({
    where: { userId: user.id },
    orderBy: { joinedAt: "desc" },
    include: {
      club: {
        select: {
          slug: true,
          name: true,
          logoUrl: true,
          brandColor: true,
          isActive: true,
          _count: { select: { benefits: { where: { isActive: true } } } },
        },
      },
    },
  });

  return (
    <>
      <PageHeader
        title="המועדונים שלי"
        description="כל כרטיסי החבר שלך במקום אחד. מציגים את מספר החבר בקופה ונהנים מההטבות."
        actions={
          <LinkButton href="/clubs" variant="secondary" size="sm">
            + הצטרפות למועדון
          </LinkButton>
        }
      />
      {memberships.length === 0 ? (
        <EmptyState
          title="עדיין לא הצטרפת לאף מועדון"
          description="עוברים לקטלוג, בוחרים מועדון ומצטרפים בלחיצה אחת."
          action={<LinkButton href="/clubs">לקטלוג המועדונים</LinkButton>}
        />
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2">
          {memberships.map((m) => (
            <li key={m.id}>
              <Link
                href={`/clubs/${m.club.slug}`}
                className="block overflow-hidden rounded-3xl text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
                style={{ backgroundColor: m.club.brandColor }}
              >
                <div className="flex items-center gap-3 p-5">
                  <ClubLogo name={m.club.name} logoUrl={m.club.logoUrl} brandColor="rgba(0,0,0,.15)" size="sm" />
                  <div>
                    <p className="text-lg font-bold">{m.club.name}</p>
                    <p className="text-xs opacity-80">
                      {m.club.isActive ? `${m.club._count.benefits} הטבות פעילות` : "המועדון אינו פעיל כרגע"}
                    </p>
                  </div>
                </div>
                <div className="flex items-end justify-between bg-black/15 px-5 py-4">
                  <div>
                    <p className="text-xs opacity-80">מספר חבר</p>
                    <p className="font-mono text-xl font-bold tracking-wider" dir="ltr">
                      {m.memberNumber}
                    </p>
                  </div>
                  <p className="text-xs opacity-80">מאז {formatDate(m.joinedAt)}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { ClubLogo } from "@/components/club-logo";
import { ActionForm, ConfirmButton, SubmitButton } from "@/components/forms";
import { Alert, Badge, buttonClass, Card, Container, LinkButton } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { formatDate, startOfTodayUtc } from "@/lib/dates";
import { db } from "@/lib/db";
import { benefitTypeIcons, benefitTypeLabels, profileFieldLabels } from "@/lib/labels";
import { missingRequiredFields } from "@/lib/membership";
import { joinClubAction, leaveClubAction } from "../actions";

const getClub = cache((slug: string) =>
  db.club.findFirst({
    where: { slug, isActive: true },
    include: {
      category: true,
      benefits: {
        where: { isActive: true, OR: [{ validUntil: null }, { validUntil: { gte: startOfTodayUtc() } }] },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      },
      _count: { select: { memberships: true } },
    },
  }),
);

export async function generateMetadata({ params }: PageProps<"/clubs/[slug]">): Promise<Metadata> {
  const club = await getClub((await params).slug);
  if (!club) return { title: "מועדון לא נמצא" };
  return { title: club.name, description: club.tagline };
}

export default async function ClubPage({ params }: PageProps<"/clubs/[slug]">) {
  const { slug } = await params;
  const [club, user] = await Promise.all([getClub(slug), getCurrentUser()]);
  if (!club) notFound();

  const [membership, profile] = user
    ? await Promise.all([
        db.membership.findUnique({ where: { userId_clubId: { userId: user.id, clubId: club.id } } }),
        db.user.findUniqueOrThrow({
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
        }),
      ])
    : [null, null];
  const missing = profile ? missingRequiredFields(club.requiredFields, { ...profile, childrenCount: profile._count.children }) : [];

  return (
    <>
      <section className="border-b border-line" style={{ background: `linear-gradient(180deg, ${club.brandColor}1f, transparent)` }}>
        <Container className="py-12">
          <nav aria-label="פירורי לחם" className="mb-6 text-sm text-muted">
            <Link href="/clubs" className="hover:text-ink">
              מועדונים
            </Link>{" "}
            / <span className="text-ink-soft">{club.name}</span>
          </nav>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <ClubLogo name={club.name} logoUrl={club.logoUrl} brandColor={club.brandColor} size="lg" />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-3xl font-black sm:text-4xl">{club.name}</h1>
                <Badge>{club.category.name}</Badge>
                {membership && <Badge tone="green">את/ה חבר/ה במועדון</Badge>}
              </div>
              <p className="mt-2 text-lg text-ink-soft">{club.tagline}</p>
              {club._count.memberships > 0 && (
                <p className="mt-1 text-sm text-muted">{club._count.memberships.toLocaleString("he-IL")} חברים ב-MemberBee</p>
              )}
            </div>
          </div>
        </Container>
      </section>

      <Container className="grid gap-8 py-10 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <section>
            <h2 className="mb-4 text-2xl font-extrabold">ההטבות במועדון</h2>
            {club.benefits.length === 0 ? (
              <p className="text-muted">עדיין לא פורסמו הטבות למועדון זה.</p>
            ) : (
              <ul className="grid gap-4 sm:grid-cols-2">
                {club.benefits.map((b) => (
                  <li key={b.id} className="flex gap-4 rounded-2xl border border-line bg-white p-5 shadow-sm">
                    <span
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-black text-white"
                      style={{ backgroundColor: club.brandColor }}
                      aria-hidden
                    >
                      {benefitTypeIcons[b.type]}
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-muted">{benefitTypeLabels[b.type]}</p>
                      <h3 className="font-bold">{b.title}</h3>
                      {b.description && <p className="mt-1 text-sm text-ink-soft">{b.description}</p>}
                      {b.validUntil && <p className="mt-2 text-xs text-muted">בתוקף עד {formatDate(b.validUntil)}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-extrabold">על המועדון</h2>
            <div className="whitespace-pre-line leading-relaxed text-ink-soft">{club.description}</div>
            {club.websiteUrl && (
              <a
                href={club.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block font-semibold text-honey-700 hover:underline"
              >
                לאתר המועדון ↗
              </a>
            )}
          </section>

          {club.terms && (
            <section>
              <details className="rounded-2xl border border-line bg-white p-5">
                <summary className="cursor-pointer font-bold">תקנון המועדון</summary>
                <div className="mt-4 whitespace-pre-line text-sm leading-relaxed text-ink-soft">{club.terms}</div>
              </details>
            </section>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Card className="space-y-4">
            {!user ? (
              <>
                <h2 className="text-xl font-bold">מצטרפים ל{club.name}</h2>
                <p className="text-sm text-muted">יוצרים חשבון MemberBee אחד – ומצטרפים לכל המועדונים בלחיצה.</p>
                <LinkButton href={`/register?next=/clubs/${club.slug}`} className="w-full">
                  הרשמה והצטרפות
                </LinkButton>
                <LinkButton href={`/login?next=/clubs/${club.slug}`} variant="secondary" className="w-full">
                  כבר רשום/ה? התחברות
                </LinkButton>
              </>
            ) : membership ? (
              <>
                <h2 className="text-xl font-bold">כרטיס החבר שלך</h2>
                <div className="rounded-2xl p-5 text-white shadow-inner" style={{ backgroundColor: club.brandColor }}>
                  <p className="text-sm opacity-80">{club.name}</p>
                  <p className="mt-3 font-mono text-2xl font-bold tracking-wider" dir="ltr">
                    {membership.memberNumber}
                  </p>
                  <p className="mt-3 text-xs opacity-80">חבר/ה מאז {formatDate(membership.joinedAt)}</p>
                </div>
                <form action={leaveClubAction}>
                  <input type="hidden" name="clubId" value={club.id} />
                  <ConfirmButton
                    message={`לעזוב את ${club.name}? ההטבות לא יהיו זמינות יותר.`}
                    className={`${buttonClass("ghost", "sm")} w-full text-red-700`}
                  >
                    עזיבת המועדון
                  </ConfirmButton>
                </form>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold">הצטרפות למועדון</h2>
                {club.requiredFields.length > 0 && (
                  <div className="text-sm">
                    <p className="mb-2 text-muted">המועדון מבקש את הפרטים הבאים:</p>
                    <ul className="space-y-1">
                      {club.requiredFields.map((f) => (
                        <li key={f} className="flex items-center gap-2">
                          <span aria-hidden className={missing.includes(f) ? "text-red-600" : "text-emerald-600"}>
                            {missing.includes(f) ? "✕" : "✓"}
                          </span>
                          {profileFieldLabels[f]}
                          <span className="sr-only">{missing.includes(f) ? "(חסר)" : "(קיים)"}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {missing.length > 0 ? (
                  <>
                    <Alert tone="warning">כדי להצטרף צריך להשלים כמה פרטים בפרופיל.</Alert>
                    <LinkButton href={`/account/profile?next=/clubs/${club.slug}`} className="w-full">
                      להשלמת הפרופיל
                    </LinkButton>
                  </>
                ) : (
                  <ActionForm action={joinClubAction} className="space-y-3">
                    <input type="hidden" name="clubId" value={club.id} />
                    <SubmitButton className="w-full" pendingLabel="מצטרף…">
                      הצטרפות בלחיצה
                    </SubmitButton>
                    <p className="text-xs text-muted">בהצטרפות את/ה מאשר/ת את תקנון המועדון ואת העברת הפרטים הנדרשים אליו.</p>
                  </ActionForm>
                )}
              </>
            )}
          </Card>
        </aside>
      </Container>
    </>
  );
}

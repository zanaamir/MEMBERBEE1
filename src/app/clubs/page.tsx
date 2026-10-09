import type { Metadata } from "next";
import Link from "next/link";
import { ClubCard } from "@/components/club-card";
import { Container, EmptyState, PageHeader } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { getMemberClubIds, listActiveClubs, listCategories } from "@/lib/clubs";

export const metadata: Metadata = {
  title: "קטלוג מועדונים",
  description: "כל מועדוני הלקוחות וההטבות שלהם – חיפוש לפי שם או קטגוריה.",
};

export default async function ClubsPage({ searchParams }: PageProps<"/clubs">) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : undefined;
  const category = typeof sp.category === "string" ? sp.category : undefined;

  const [user, clubs, categories] = await Promise.all([getCurrentUser(), listActiveClubs({ q, category }), listCategories()]);
  const memberOf = user ? await getMemberClubIds(user.id) : new Set<string>();

  const chip = (active: boolean) =>
    `rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
      active ? "border-ink bg-ink text-white" : "border-line bg-white text-ink-soft hover:border-honey-400"
    }`;
  const hrefFor = (slug?: string) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (slug) params.set("category", slug);
    const s = params.toString();
    return s ? `/clubs?${s}` : "/clubs";
  };

  return (
    <Container className="py-12">
      <PageHeader title="קטלוג המועדונים" description="מוצאים מועדון, רואים את ההטבות ומצטרפים בלחיצה." />

      <form role="search" action="/clubs" className="mb-6 flex gap-2">
        {category && <input type="hidden" name="category" value={category} />}
        <label htmlFor="club-search" className="sr-only">
          חיפוש מועדון
        </label>
        <input
          id="club-search"
          name="q"
          type="search"
          defaultValue={q}
          placeholder="חיפוש לפי שם מועדון או הטבה…"
          className="h-12 flex-1 rounded-xl border border-line bg-white px-4 shadow-sm focus:border-honey-500 focus:outline-none focus:ring-2 focus:ring-honey-200"
        />
        <button type="submit" className="h-12 rounded-xl bg-ink px-6 font-semibold text-white hover:bg-ink-soft">
          חיפוש
        </button>
      </form>

      <nav aria-label="קטגוריות" className="mb-10 flex flex-wrap gap-2">
        <Link href={hrefFor()} className={chip(!category)} aria-current={!category ? "page" : undefined}>
          הכל
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={hrefFor(c.slug)}
            className={chip(category === c.slug)}
            aria-current={category === c.slug ? "page" : undefined}
          >
            {c.name}
          </Link>
        ))}
      </nav>

      {clubs.length === 0 ? (
        <EmptyState
          title="לא מצאנו מועדונים מתאימים"
          description="נסו מילת חיפוש אחרת או קטגוריה אחרת."
          action={
            <Link href="/clubs" className="font-semibold text-honey-700 hover:underline">
              ניקוי הסינון
            </Link>
          }
        />
      ) : (
        <>
          <p className="mb-4 text-sm text-muted" aria-live="polite">
            {clubs.length} מועדונים
          </p>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {clubs.map((club) => (
              <ClubCard key={club.id} club={club} isMember={memberOf.has(club.id)} />
            ))}
          </div>
        </>
      )}
    </Container>
  );
}

import { ClubCard } from "@/components/club-card";
import { Container, LinkButton } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { clubCardSelect } from "@/lib/clubs";
import { db } from "@/lib/db";

const steps = [
  { title: "נרשמים פעם אחת", text: "ממלאים פרופיל אחד – שם, טלפון, תאריך לידה וילדים – ולא מקלידים אותו שוב אף פעם." },
  { title: "מצטרפים בלחיצה", text: "בוחרים מועדון מהקטלוג, והפרטים שהמועדון צריך כבר אצלו. בלי טפסים, בלי תורים בקופה." },
  { title: "נהנים מכל ההטבות", text: "כל המועדונים, מספרי החבר וההטבות שלכם – מסודרים במקום אחד, בלי כרטיסים בארנק." },
];

export default async function HomePage() {
  const [user, featured, stats] = await Promise.all([
    getCurrentUser(),
    db.club.findMany({ where: { isActive: true }, take: 6, orderBy: { memberships: { _count: "desc" } }, select: clubCardSelect }),
    Promise.all([db.club.count({ where: { isActive: true } }), db.benefit.count({ where: { isActive: true, club: { isActive: true } } })]),
  ]);
  const [clubCount, benefitCount] = stats;

  return (
    <>
      <section className="honeycomb border-b border-line bg-gradient-to-b from-honey-50 to-canvas">
        <Container className="grid items-center gap-12 py-20 lg:grid-cols-2 lg:py-28">
          <div>
            <p className="mb-4 inline-flex rounded-full bg-honey-100 px-3 py-1 text-sm font-semibold text-honey-800">
              {clubCount} מועדונים · {benefitCount} הטבות פעילות
            </p>
            <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              כל מועדוני הלקוחות שלך.
              <br />
              <span className="text-honey-600">במקום אחד.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-ink-soft">
              MemberBee חוסך לכם את הטפסים, הכרטיסים והבלגן. נרשמים פעם אחת, מצטרפים לכל מועדון בלחיצה – ולא מפספסים אף הטבה.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {user ? (
                <LinkButton href="/account" size="lg">
                  למועדונים שלי
                </LinkButton>
              ) : (
                <LinkButton href="/register" size="lg">
                  מצטרפים חינם
                </LinkButton>
              )}
              <LinkButton href="/clubs" variant="secondary" size="lg">
                לקטלוג המועדונים
              </LinkButton>
            </div>
          </div>
          <div className="relative hidden lg:block" aria-hidden>
            <div className="absolute -inset-6 rounded-[3rem] bg-honey-200/40 blur-2xl" />
            <div className="relative grid grid-cols-2 gap-4">
              {featured.slice(0, 4).map((club, i) => (
                <div key={club.id} className={`rounded-3xl border border-line bg-white p-5 shadow-lg ${i % 2 ? "translate-y-8" : ""}`}>
                  <div className="mb-3 h-10 w-10 rounded-xl" style={{ backgroundColor: club.brandColor }} />
                  <p className="font-bold">{club.name}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-muted">{club.tagline}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section id="how" className="scroll-mt-20 py-20">
        <Container>
          <h2 className="text-center text-3xl font-extrabold">איך זה עובד?</h2>
          <ol className="mt-12 grid gap-6 md:grid-cols-3">
            {steps.map((s, i) => (
              <li key={s.title} className="rounded-3xl border border-line bg-white p-8 shadow-sm">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-ink text-lg font-black text-honey-400">
                  {i + 1}
                </span>
                <h3 className="mt-5 text-xl font-bold">{s.title}</h3>
                <p className="mt-2 text-ink-soft">{s.text}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {featured.length > 0 && (
        <section className="pb-8">
          <Container>
            <div className="mb-8 flex items-end justify-between">
              <h2 className="text-3xl font-extrabold">מועדונים פופולריים</h2>
              <LinkButton href="/clubs" variant="ghost" size="sm">
                לכל המועדונים ←
              </LinkButton>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((club) => (
                <ClubCard key={club.id} club={club} />
              ))}
            </div>
          </Container>
        </section>
      )}
    </>
  );
}

import Link from "next/link";
import { logoutAction } from "@/app/(auth)/actions";
import { getCurrentUser } from "@/lib/auth";
import { Logo } from "./logo";
import { buttonClass, Container } from "./ui";

const navLinks = [
  { href: "/clubs", label: "מועדונים" },
  { href: "/#how", label: "איך זה עובד" },
  { href: "/contact", label: "צור קשר" },
];

export async function SiteHeader() {
  const user = await getCurrentUser();

  const accountLinks = user
    ? [
        { href: "/account", label: "המועדונים שלי" },
        { href: "/account/profile", label: "הפרופיל שלי" },
        ...(user.role === "ADMIN" ? [{ href: "/admin", label: "ניהול" }] : []),
      ]
    : [];

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-white/90 backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Logo />
          <nav aria-label="ראשי" className="hidden md:block">
            <ul className="flex gap-6 text-sm font-medium text-ink-soft">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-ink">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              {accountLinks.map((l) => (
                <Link key={l.href} href={l.href} className={buttonClass("ghost", "sm")}>
                  {l.label}
                </Link>
              ))}
              <form action={logoutAction}>
                <button type="submit" className={buttonClass("secondary", "sm")}>
                  התנתקות
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className={buttonClass("ghost", "sm")}>
                התחברות
              </Link>
              <Link href="/register" className={buttonClass("primary", "sm")}>
                הרשמה חינם
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu: <details> works without JavaScript. */}
        <details className="group relative md:hidden">
          <summary className={`${buttonClass("secondary", "sm")} list-none [&::-webkit-details-marker]:hidden`} aria-label="תפריט">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </summary>
          <div className="absolute left-0 mt-2 w-60 rounded-2xl border border-line bg-white p-2 shadow-lg">
            <ul className="space-y-1 text-sm">
              {[...navLinks, ...accountLinks].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="block rounded-lg px-3 py-2 hover:bg-stone-100">
                    {l.label}
                  </Link>
                </li>
              ))}
              <li className="border-t border-line pt-1">
                {user ? (
                  <form action={logoutAction}>
                    <button type="submit" className="block w-full rounded-lg px-3 py-2 text-start hover:bg-stone-100">
                      התנתקות
                    </button>
                  </form>
                ) : (
                  <>
                    <Link href="/login" className="block rounded-lg px-3 py-2 hover:bg-stone-100">
                      התחברות
                    </Link>
                    <Link href="/register" className="block rounded-lg px-3 py-2 font-semibold text-honey-700 hover:bg-stone-100">
                      הרשמה חינם
                    </Link>
                  </>
                )}
              </li>
            </ul>
          </div>
        </details>
      </Container>
    </header>
  );
}

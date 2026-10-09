import Link from "next/link";
import { Logo } from "./logo";
import { Container } from "./ui";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-line bg-white">
      <Container className="flex flex-col gap-6 py-10 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Logo />
          <p>כל מועדוני הלקוחות שלך, במקום אחד.</p>
        </div>
        <nav aria-label="משני">
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            <li>
              <Link href="/clubs" className="hover:text-ink">
                מועדונים
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-ink">
                צור קשר
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-ink">
                תנאי שימוש
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-ink">
                מדיניות פרטיות
              </Link>
            </li>
          </ul>
        </nav>
      </Container>
      <Container className="border-t border-line py-4 text-xs text-muted">© {new Date().getFullYear()} MemberBee</Container>
    </footer>
  );
}

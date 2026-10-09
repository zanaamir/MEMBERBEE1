"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/account", label: "המועדונים שלי" },
  { href: "/account/profile", label: "פרטים אישיים" },
  { href: "/account/family", label: "המשפחה שלי" },
  { href: "/account/security", label: "אבטחה וחשבון" },
];

export function AccountNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="אזור אישי">
      <ul className="flex gap-1 overflow-x-auto lg:flex-col">
        {links.map((l) => {
          const active = pathname === l.href;
          return (
            <li key={l.href}>
              <Link
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`block whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                  active ? "bg-ink text-white" : "text-ink-soft hover:bg-stone-100"
                }`}
              >
                {l.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

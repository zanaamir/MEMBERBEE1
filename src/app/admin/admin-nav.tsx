"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "לוח בקרה" },
  { href: "/admin/clubs", label: "מועדונים" },
  { href: "/admin/users", label: "משתמשים" },
  { href: "/admin/messages", label: "פניות" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="ניהול">
      <ul className="flex gap-1 overflow-x-auto rounded-xl border border-line bg-white p-1">
        {links.map((l) => {
          const active = l.href === "/admin" ? pathname === l.href : pathname.startsWith(l.href);
          return (
            <li key={l.href}>
              <Link
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`block whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium ${active ? "bg-ink text-white" : "text-ink-soft hover:bg-stone-100"}`}
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

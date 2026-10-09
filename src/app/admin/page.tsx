import Link from "next/link";
import { Card, PageHeader } from "@/components/ui";
import { getAdminStats } from "@/lib/admin-stats";

export default async function AdminDashboard() {
  const { users, newUsers, clubs, activeClubs, memberships, newMemberships, openMessages, topClubs } = await getAdminStats();

  const stats = [
    { label: "משתמשים", value: users, sub: `+${newUsers} השבוע` },
    { label: "מועדונים פעילים", value: activeClubs, sub: `מתוך ${clubs}` },
    { label: "חברויות", value: memberships, sub: `+${newMemberships} השבוע` },
    { label: "פניות פתוחות", value: openMessages, sub: "ממתינות לטיפול", href: "/admin/messages" },
  ];
  const max = Math.max(1, ...topClubs.map((c) => c._count.memberships));

  return (
    <>
      <PageHeader title="לוח בקרה" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const body = (
            <Card className="h-full">
              <p className="text-sm text-muted">{s.label}</p>
              <p className="mt-2 text-3xl font-black">{s.value.toLocaleString("he-IL")}</p>
              <p className="mt-1 text-xs text-muted">{s.sub}</p>
            </Card>
          );
          return s.href ? (
            <Link key={s.label} href={s.href} className="block transition hover:-translate-y-0.5">
              {body}
            </Link>
          ) : (
            <div key={s.label}>{body}</div>
          );
        })}
      </div>
      <Card className="mt-6">
        <h2 className="mb-4 text-lg font-bold">המועדונים המובילים</h2>
        {topClubs.length === 0 ? (
          <p className="text-muted">אין עדיין מועדונים.</p>
        ) : (
          <ul className="space-y-3">
            {topClubs.map((c) => (
              <li key={c.id} className="grid grid-cols-[8rem_1fr_3rem] items-center gap-3 text-sm">
                <Link href={`/admin/clubs/${c.id}`} className="truncate font-medium hover:underline">
                  {c.name}
                </Link>
                <div className="h-2.5 overflow-hidden rounded-full bg-stone-100">
                  <div className="h-full rounded-full bg-honey-500" style={{ width: `${(c._count.memberships / max) * 100}%` }} />
                </div>
                <span className="text-start tabular-nums text-muted">{c._count.memberships}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}

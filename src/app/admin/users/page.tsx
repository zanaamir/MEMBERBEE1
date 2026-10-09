import type { Metadata } from "next";
import { Badge, buttonClass, PageHeader } from "@/components/ui";
import { ConfirmButton } from "@/components/forms";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/dates";
import { db } from "@/lib/db";
import { setUserRoleAction } from "../actions";

export const metadata: Metadata = { title: "משתמשים" };

const PAGE_SIZE = 50;

export default async function AdminUsersPage({ searchParams }: PageProps<"/admin/users">) {
  const admin = await requireAdmin();
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim().slice(0, 100) : "";
  const page = Math.max(1, Number(sp.page) || 1);

  const where = q
    ? {
        OR: [
          { email: { contains: q, mode: "insensitive" as const } },
          { firstName: { contains: q, mode: "insensitive" as const } },
          { lastName: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : {};
  const [users, total] = await Promise.all([
    db.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        _count: { select: { memberships: true } },
      },
    }),
    db.user.count({ where }),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pageHref = (p: number) => `/admin/users?${new URLSearchParams({ ...(q ? { q } : {}), page: String(p) })}`;

  return (
    <>
      <PageHeader title="משתמשים" description={`${total.toLocaleString("he-IL")} משתמשים`} />
      <form action="/admin/users" className="mb-4 flex max-w-md gap-2">
        <label htmlFor="user-search" className="sr-only">
          חיפוש משתמש
        </label>
        <input
          id="user-search"
          name="q"
          type="search"
          defaultValue={q}
          placeholder="חיפוש לפי שם או אימייל"
          className="h-10 flex-1 rounded-xl border border-line bg-white px-3 focus:border-honey-500 focus:outline-none focus:ring-2 focus:ring-honey-200"
        />
        <button type="submit" className={buttonClass("primary", "sm")}>
          חיפוש
        </button>
      </form>
      <div className="overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-xs text-muted">
            <tr>
              <th className="px-4 py-3 text-start font-semibold">שם</th>
              <th className="px-4 py-3 text-start font-semibold">אימייל</th>
              <th className="px-4 py-3 text-start font-semibold">מועדונים</th>
              <th className="px-4 py-3 text-start font-semibold">נרשם</th>
              <th className="px-4 py-3 text-start font-semibold">הרשאה</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3 font-medium">
                  {u.firstName} {u.lastName}
                </td>
                <td className="px-4 py-3 text-ink-soft" dir="ltr">
                  {u.email}
                </td>
                <td className="px-4 py-3 tabular-nums">{u._count.memberships}</td>
                <td className="px-4 py-3 text-ink-soft">{formatDate(u.createdAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {u.role === "ADMIN" ? <Badge tone="honey">מנהל</Badge> : <Badge>משתמש</Badge>}
                    {u.id !== admin.id && (
                      <form action={setUserRoleAction}>
                        <input type="hidden" name="id" value={u.id} />
                        <input type="hidden" name="role" value={u.role === "ADMIN" ? "USER" : "ADMIN"} />
                        <ConfirmButton
                          message={u.role === "ADMIN" ? `להסיר הרשאת ניהול מ-${u.email}?` : `להעניק הרשאת ניהול ל-${u.email}?`}
                          className="text-xs font-semibold text-honey-700 hover:underline"
                        >
                          {u.role === "ADMIN" ? "הסרת ניהול" : "הפיכה למנהל"}
                        </ConfirmButton>
                      </form>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pages > 1 && (
        <nav aria-label="דפדוף" className="mt-4 flex items-center justify-center gap-2 text-sm">
          {page > 1 && (
            <a href={pageHref(page - 1)} className={buttonClass("secondary", "sm")}>
              הקודם
            </a>
          )}
          <span className="text-muted">
            עמוד {page} מתוך {pages}
          </span>
          {page < pages && (
            <a href={pageHref(page + 1)} className={buttonClass("secondary", "sm")}>
              הבא
            </a>
          )}
        </nav>
      )}
    </>
  );
}

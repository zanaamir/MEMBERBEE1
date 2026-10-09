import type { Metadata } from "next";
import { Badge, buttonClass, EmptyState, PageHeader } from "@/components/ui";
import { formatDateTime } from "@/lib/dates";
import { db } from "@/lib/db";
import { toggleMessageHandledAction } from "../actions";

export const metadata: Metadata = { title: "פניות" };

export default async function AdminMessagesPage() {
  const messages = await db.contactMessage.findMany({ orderBy: [{ handled: "asc" }, { createdAt: "desc" }], take: 200 });
  return (
    <>
      <PageHeader title="פניות" description="הודעות שנשלחו מטופס צור קשר." />
      {messages.length === 0 ? (
        <EmptyState title="אין פניות" />
      ) : (
        <ul className="space-y-4">
          {messages.map((m) => (
            <li key={m.id} className={`rounded-2xl border bg-white p-5 ${m.handled ? "border-line opacity-70" : "border-honey-300"}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-bold">{m.subject}</p>
                  <p className="text-sm text-muted">
                    {m.name} ·{" "}
                    <a href={`mailto:${m.email}`} className="hover:underline" dir="ltr">
                      {m.email}
                    </a>{" "}
                    · {formatDateTime(m.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {m.handled ? <Badge tone="green">טופל</Badge> : <Badge tone="honey">חדש</Badge>}
                  <form action={toggleMessageHandledAction}>
                    <input type="hidden" name="id" value={m.id} />
                    <button type="submit" className={buttonClass("secondary", "sm")}>
                      {m.handled ? "סימון כלא טופל" : "סימון כטופל"}
                    </button>
                  </form>
                </div>
              </div>
              <p className="mt-3 whitespace-pre-line text-sm text-ink-soft">{m.message}</p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

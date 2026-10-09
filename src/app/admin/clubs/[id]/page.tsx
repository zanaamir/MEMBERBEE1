import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionForm, ConfirmButton, SelectField, SubmitButton, TextField } from "@/components/forms";
import { Alert, Badge, buttonClass, Card, PageHeader } from "@/components/ui";
import { formatDate } from "@/lib/dates";
import { db } from "@/lib/db";
import { benefitTypeLabels } from "@/lib/labels";
import { addBenefitAction, deleteBenefitAction, deleteClubAction, toggleBenefitAction, updateClubAction } from "../../actions";
import { ClubForm } from "../club-form";

export const metadata: Metadata = { title: "עריכת מועדון" };

export default async function EditClubPage({ params, searchParams }: PageProps<"/admin/clubs/[id]">) {
  const { id } = await params;
  const { created } = await searchParams;
  const [club, categories] = await Promise.all([
    db.club.findUnique({
      where: { id },
      include: { benefits: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] }, _count: { select: { memberships: true } } },
    }),
    db.category.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
  ]);
  if (!club) notFound();

  return (
    <>
      <PageHeader
        title={club.name}
        description={`${club._count.memberships} חברים`}
        actions={
          <Link href={`/clubs/${club.slug}`} className={buttonClass("secondary", "sm")} target="_blank">
            צפייה באתר ↗
          </Link>
        }
      />
      {created && (
        <div className="mb-6">
          <Alert tone="success">המועדון נוצר. עכשיו אפשר להוסיף לו הטבות.</Alert>
        </div>
      )}
      <div className="grid gap-6 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <h2 className="mb-4 text-lg font-bold">פרטי המועדון</h2>
          <ClubForm action={updateClubAction.bind(null, club.id)} categories={categories} club={club} />
        </Card>

        <div className="space-y-6 xl:col-span-2">
          <Card>
            <h2 className="mb-4 text-lg font-bold">הטבות ({club.benefits.length})</h2>
            {club.benefits.length === 0 ? (
              <p className="text-sm text-muted">אין עדיין הטבות.</p>
            ) : (
              <ul className="divide-y divide-line">
                {club.benefits.map((b) => (
                  <li key={b.id} className="py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold">{b.title}</p>
                        <p className="text-xs text-muted">
                          {benefitTypeLabels[b.type]}
                          {b.validUntil ? ` · עד ${formatDate(b.validUntil)}` : ""}
                        </p>
                      </div>
                      {b.isActive ? <Badge tone="green">פעילה</Badge> : <Badge>מושבתת</Badge>}
                    </div>
                    <div className="mt-2 flex gap-1">
                      <form action={toggleBenefitAction}>
                        <input type="hidden" name="id" value={b.id} />
                        <button type="submit" className={buttonClass("ghost", "sm")}>
                          {b.isActive ? "השבתה" : "הפעלה"}
                        </button>
                      </form>
                      <form action={deleteBenefitAction}>
                        <input type="hidden" name="id" value={b.id} />
                        <ConfirmButton message="למחוק את ההטבה?" className={`${buttonClass("ghost", "sm")} text-red-700`}>
                          מחיקה
                        </ConfirmButton>
                      </form>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <h2 className="mb-4 text-lg font-bold">הוספת הטבה</h2>
            <ActionForm action={addBenefitAction.bind(null, club.id)} resetOnSuccess className="space-y-4">
              <SelectField
                name="type"
                label="סוג"
                defaultValue="DISCOUNT"
                options={Object.entries(benefitTypeLabels).map(([value, label]) => ({ value, label }))}
              />
              <TextField name="title" label="כותרת" required />
              <TextField name="description" label="פירוט" />
              <div className="grid grid-cols-2 gap-3">
                <TextField name="validUntil" label="בתוקף עד" type="date" />
                <TextField name="sortOrder" label="סדר" type="number" min={0} defaultValue="0" />
              </div>
              <SubmitButton pendingLabel="מוסיף…">הוספת הטבה</SubmitButton>
            </ActionForm>
          </Card>

          <Card className="border-red-200">
            <h2 className="text-lg font-bold text-red-700">מחיקת המועדון</h2>
            <p className="mt-1 mb-4 text-sm text-muted">מוחק גם את כל ההטבות והחברויות. עדיף להסתיר את המועדון במקום.</p>
            <form action={deleteClubAction}>
              <input type="hidden" name="id" value={club.id} />
              <ConfirmButton
                message={`למחוק לצמיתות את ${club.name} ואת ${club._count.memberships} החברויות בו?`}
                className={buttonClass("danger", "sm")}
              >
                מחיקה לצמיתות
              </ConfirmButton>
            </form>
          </Card>
        </div>
      </div>
    </>
  );
}

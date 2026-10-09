import type { Metadata } from "next";
import { Card, PageHeader } from "@/components/ui";
import { db } from "@/lib/db";
import { createClubAction } from "../../actions";
import { ClubForm } from "../club-form";

export const metadata: Metadata = { title: "מועדון חדש" };

export default async function NewClubPage() {
  const categories = await db.category.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] });
  return (
    <>
      <PageHeader title="מועדון חדש" />
      <Card>
        <ClubForm action={createClubAction} categories={categories} />
      </Card>
    </>
  );
}

import type { Metadata } from "next";
import { Container } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { AdminNav } from "./admin-nav";

export const metadata: Metadata = { title: { default: "ניהול", template: "%s | ניהול MemberBee" }, robots: { index: false } };

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  await requireAdmin();
  return (
    <Container className="py-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-semibold tracking-wide text-honey-700">ממשק ניהול</p>
        <AdminNav />
      </div>
      {children}
    </Container>
  );
}

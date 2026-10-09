import { AccountNav } from "./account-nav";
import { Container } from "@/components/ui";
import { requireUser } from "@/lib/auth";

export default async function AccountLayout({ children }: LayoutProps<"/account">) {
  const user = await requireUser("/account");
  return (
    <Container className="py-10">
      <p className="mb-6 text-muted">
        שלום, <span className="font-semibold text-ink">{user.firstName}</span> 👋
      </p>
      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <AccountNav />
        <div className="min-w-0">{children}</div>
      </div>
    </Container>
  );
}

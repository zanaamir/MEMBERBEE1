import Link from "next/link";
import { Badge } from "./ui";
import { ClubLogo } from "./club-logo";

export type ClubCardData = {
  slug: string;
  name: string;
  tagline: string;
  logoUrl: string | null;
  brandColor: string;
  category: { name: string };
  _count: { benefits: number };
};

export function ClubCard({ club, isMember = false }: { club: ClubCardData; isMember?: boolean }) {
  return (
    <Link
      href={`/clubs/${club.slug}`}
      className="group flex h-full flex-col rounded-2xl border border-line bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-honey-300 hover:shadow-md"
    >
      <div className="flex items-start gap-4">
        <ClubLogo name={club.name} logoUrl={club.logoUrl} brandColor={club.brandColor} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-bold group-hover:text-honey-700">{club.name}</h3>
          <p className="text-xs text-muted">{club.category.name}</p>
        </div>
        {isMember && <Badge tone="green">חבר/ה</Badge>}
      </div>
      <p className="mt-4 line-clamp-2 flex-1 text-sm text-ink-soft">{club.tagline}</p>
      <p className="mt-4 text-sm font-semibold text-honey-700">{club._count.benefits > 0 ? `${club._count.benefits} הטבות` : "לפרטים"} ←</p>
    </Link>
  );
}

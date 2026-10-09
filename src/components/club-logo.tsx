export function ClubLogo({
  name,
  logoUrl,
  brandColor,
  size = "md",
}: {
  name: string;
  logoUrl: string | null;
  brandColor: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = { sm: "h-10 w-10 text-base", md: "h-14 w-14 text-xl", lg: "h-20 w-20 text-3xl" };
  if (logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- admin-provided logos come from arbitrary hosts
      <img
        src={logoUrl}
        alt={`הלוגו של ${name}`}
        className={`${sizes[size]} shrink-0 rounded-2xl border border-line bg-white object-contain p-1`}
        loading="lazy"
        referrerPolicy="no-referrer"
      />
    );
  }
  return (
    <div
      className={`${sizes[size]} flex shrink-0 items-center justify-center rounded-2xl font-black text-white shadow-inner`}
      style={{ backgroundColor: brandColor }}
      aria-hidden
    >
      {name.trim().charAt(0)}
    </div>
  );
}

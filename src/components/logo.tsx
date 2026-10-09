import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 text-xl font-black tracking-tight" aria-label="MemberBee – דף הבית">
      <svg viewBox="0 0 64 64" className="h-8 w-8" aria-hidden>
        <path fill="#f59e0b" d="M32 3l25 14.5v29L32 61 7 46.5v-29z" />
        <path fill="#1c1917" d="M22 26h20v4H22zm0 8h20v4H22z" />
        <circle cx="32" cy="18" r="4" fill="#1c1917" />
      </svg>
      <span dir="ltr">
        Member<span className="text-honey-600">Bee</span>
      </span>
    </Link>
  );
}

import type { Metadata, Viewport } from "next";
import { Heebo } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const heebo = Heebo({ subsets: ["hebrew", "latin"], variable: "--font-heebo", display: "swap" });

const appUrl = process.env.APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: { default: "MemberBee – כל מועדוני הלקוחות במקום אחד", template: "%s | MemberBee" },
  description: "נרשמים פעם אחת, מצטרפים לכל מועדוני הלקוחות בלחיצה, ומקבלים את כל ההטבות במקום אחד.",
  applicationName: "MemberBee",
  openGraph: { type: "website", locale: "he_IL", siteName: "MemberBee" },
};

export const viewport: Viewport = { themeColor: "#f59e0b" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="he" dir="rtl" className={`${heebo.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:right-3 focus:z-50 focus:rounded-lg focus:bg-ink focus:px-4 focus:py-2 focus:text-white"
        >
          דילוג לתוכן הראשי
        </a>
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}

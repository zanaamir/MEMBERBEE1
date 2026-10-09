"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="he" dir="rtl">
      <body style={{ fontFamily: "system-ui, sans-serif", textAlign: "center", padding: "6rem 1rem" }}>
        <h1>משהו השתבש</h1>
        <p>אירעה שגיאה בלתי צפויה.</p>
        <button onClick={reset} style={{ marginTop: "1rem", padding: ".6rem 1.2rem" }}>
          לנסות שוב
        </button>
      </body>
    </html>
  );
}

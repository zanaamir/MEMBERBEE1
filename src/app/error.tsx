"use client";

import { useEffect } from "react";
import { Button, Container } from "@/components/ui";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container className="py-24 text-center">
      <h1 className="text-3xl font-extrabold">משהו השתבש</h1>
      <p className="mt-2 text-muted">אירעה שגיאה בלתי צפויה. אנחנו כבר בודקים את זה.</p>
      {error.digest && (
        <p className="mt-2 font-mono text-xs text-muted" dir="ltr">
          ref: {error.digest}
        </p>
      )}
      <Button className="mt-8" onClick={reset}>
        לנסות שוב
      </Button>
    </Container>
  );
}

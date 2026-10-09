import { Container, LinkButton } from "@/components/ui";

export default function NotFound() {
  return (
    <Container className="py-24 text-center">
      <p className="text-6xl" aria-hidden>
        🐝
      </p>
      <h1 className="mt-6 text-3xl font-extrabold">העמוד לא נמצא</h1>
      <p className="mt-2 text-muted">ייתכן שהקישור שגוי או שהעמוד הוסר.</p>
      <div className="mt-8 flex justify-center gap-3">
        <LinkButton href="/">לדף הבית</LinkButton>
        <LinkButton href="/clubs" variant="secondary">
          לקטלוג המועדונים
        </LinkButton>
      </div>
    </Container>
  );
}

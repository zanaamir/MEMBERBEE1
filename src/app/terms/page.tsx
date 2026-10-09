import type { Metadata } from "next";
import { Container } from "@/components/ui";

export const metadata: Metadata = { title: "תנאי שימוש" };

// NOTE: template text. Have it reviewed by a lawyer before going live.
export default function TermsPage() {
  return (
    <Container className="max-w-3xl py-12">
      <article className="space-y-4 leading-relaxed text-ink-soft [&_h1]:text-3xl [&_h1]:font-extrabold [&_h1]:text-ink [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-ink">
        <h1>תנאי שימוש</h1>
        <p>ברוכים הבאים ל-MemberBee. השימוש באתר ובשירותים כפוף לתנאים המפורטים להלן.</p>
        <h2>1. השירות</h2>
        <p>
          MemberBee מאפשרת לנהל פרופיל אישי אחד ולהצטרף באמצעותו למועדוני לקוחות של עסקים שונים. ההטבות עצמן ניתנות על ידי המועדונים, בהתאם
          לתקנון של כל מועדון, ו-MemberBee אינה אחראית למימושן.
        </p>
        <h2>2. החשבון שלך</h2>
        <p>עליך למסור פרטים נכונים ועדכניים ולשמור על סודיות הסיסמה. את/ה אחראי/ת לכל פעולה שנעשית בחשבונך.</p>
        <h2>3. הצטרפות למועדונים</h2>
        <p>בעת הצטרפות למועדון, הפרטים שהמועדון מבקש יועברו אליו. ניתן לעזוב מועדון בכל עת מהאזור האישי.</p>
        <h2>4. סיום שימוש</h2>
        <p>ניתן למחוק את החשבון בכל עת מעמוד &quot;אבטחה וחשבון&quot;. אנו רשאים להשעות חשבון שנעשה בו שימוש לרעה.</p>
        <h2>5. יצירת קשר</h2>
        <p>לשאלות בנוגע לתנאים אלה ניתן לפנות דרך עמוד צור קשר.</p>
      </article>
    </Container>
  );
}

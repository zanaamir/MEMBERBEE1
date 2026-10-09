import type { Metadata } from "next";
import { Container } from "@/components/ui";

export const metadata: Metadata = { title: "מדיניות פרטיות" };

// NOTE: template text. Have it reviewed against the Israeli Privacy Protection Law
// (including Amendment 13) before going live.
export default function PrivacyPage() {
  return (
    <Container className="max-w-3xl py-12">
      <article className="space-y-4 leading-relaxed text-ink-soft [&_h1]:text-3xl [&_h1]:font-extrabold [&_h1]:text-ink [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-ink [&_ul]:list-disc [&_ul]:ps-6">
        <h1>מדיניות פרטיות</h1>
        <p>הפרטיות שלך חשובה לנו. מסמך זה מסביר איזה מידע אנו אוספים, למה, ומה הזכויות שלך.</p>
        <h2>איזה מידע נאסף</h2>
        <ul>
          <li>פרטי חשבון: שם, אימייל וסיסמה (נשמרת מוצפנת בגיבוב חד-כיווני בלבד).</li>
          <li>פרטי פרופיל שבחרת למסור: טלפון, תאריך לידה, מגדר, עיר, כתובת, תאריך נישואין ופרטי ילדים.</li>
          <li>המועדונים שהצטרפת אליהם ותחומי העניין שבחרת.</li>
        </ul>
        <h2>שימוש במידע</h2>
        <p>
          המידע משמש להפעלת החשבון ולהצטרפות למועדונים לבקשתך. בעת הצטרפות למועדון יועברו אליו רק הפרטים שהמועדון מבקש. לא נשלח דיוור שיווקי
          ללא הסכמתך.
        </p>
        <h2>אבטחת מידע</h2>
        <p>המידע מוגן בהצפנה בתעבורה (HTTPS), סיסמאות נשמרות בגיבוב scrypt, והגישה למידע מוגבלת להרשאות מינימליות.</p>
        <h2>הזכויות שלך</h2>
        <p>ניתן לעיין בפרטים ולעדכן אותם באזור האישי בכל עת, ולמחוק את החשבון וכל המידע הקשור אליו מעמוד &quot;אבטחה וחשבון&quot;.</p>
        <h2>עוגיות</h2>
        <p>אנו משתמשים בעוגייה חיונית אחת בלבד לשמירת ההתחברות. אין שימוש בעוגיות פרסום או מעקב.</p>
      </article>
    </Container>
  );
}

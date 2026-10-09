# MemberBee 🐝

**כל מועדוני הלקוחות שלך, במקום אחד.** נרשמים פעם אחת, מצטרפים לכל מועדון בלחיצה, ורואים את כל כרטיסי החבר וההטבות במקום אחד.

זוהי כתיבה מחדש, ברמת ייצור, של פרויקט MemberBee המקורי (ASP.NET Web API, 2018).

## יכולות

**צד הצרכן**

- הרשמה והתחברות מאובטחות (סיסמאות בגיבוב scrypt, סשנים בצד השרת, הגבלת ניסיונות)
- פרופיל אחד: טלפון, תאריך לידה, מגדר, עיר, כתובת, תאריך נישואין ותחומי עניין
- ניהול ילדים, לטובת הטבות יום הולדת
- קטלוג מועדונים עם חיפוש וסינון לפי קטגוריה
- עמוד מועדון עם הטבות, תקנון והצטרפות בלחיצה. המערכת בודקת שהפרופיל כולל את השדות שהמועדון דורש
- "המועדונים שלי": כרטיסי חבר דיגיטליים עם מספר חבר
- שינוי סיסמה (מנתק את כל שאר המכשירים) ומחיקת חשבון עצמאית
- טופס צור קשר עם הגנה מספאם

**ממשק ניהול** (`/admin`)

- לוח בקרה עם נתונים
- יצירה ועריכה של מועדונים: פרטים, צבע מותג, לוגו, שדות חובה להצטרפות, הסתרה ומחיקה
- ניהול הטבות: הוספה, השבתה ומחיקה
- רשימת משתמשים עם חיפוש ודפדוף, והענקה או הסרה של הרשאות ניהול
- טיפול בפניות מטופס צור קשר

## טכנולוגיות

| שכבה       | טכנולוגיה                                                  |
| ---------- | ---------------------------------------------------------- |
| Framework  | Next.js 16 (App Router, Server Components, Server Actions) |
| שפה        | TypeScript (strict)                                        |
| מסד נתונים | PostgreSQL 16 + Prisma ORM                                 |
| עיצוב      | Tailwind CSS 4, RTL מלא, פונט Heebo                        |
| ולידציה    | Zod                                                        |
| בדיקות     | Vitest (יחידה ואינטגרציה) + Playwright (E2E)               |
| CI         | GitHub Actions                                             |
| פריסה      | Docker (standalone image), או כל פלטפורמת Node             |

## הרצה מקומית

דרישות: Node.js 22 ומעלה, ו-PostgreSQL 16 (מקומי או `docker compose up -d db`).

```bash
cp .env.example .env              # לעדכן את DATABASE_URL במידת הצורך
npm install
npx prisma migrate deploy         # יצירת הטבלאות
ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='a-strong-password' npm run db:seed
npm run dev                       # http://localhost:3000
```

ה-seed יוצר קטגוריות וערים. בסביבת פיתוח הוא יוצר גם 6 מועדוני דמו **בדיוניים**.

## סקריפטים

| פקודה                                  | תיאור                                           |
| -------------------------------------- | ----------------------------------------------- |
| `npm run dev`                          | שרת פיתוח                                       |
| `npm run build` / `npm start`          | בנייה והרצה לייצור                              |
| `npm run lint` / `npm run typecheck`   | ESLint / TypeScript                             |
| `npm run format`                       | Prettier                                        |
| `npm test`                             | בדיקות יחידה ואינטגרציה (Vitest)                |
| `npm run test:e2e`                     | בדיקות קצה לקצה (Playwright, דורש build)        |
| `npm run db:migrate`                   | הרצת מיגרציות (`prisma migrate deploy`)         |
| `npm run db:migrate:dev -- --name xyz` | יצירת מיגרציה חדשה אחרי שינוי סכמה              |
| `npm run db:seed`                      | נתוני בסיס ויצירת מנהל                          |
| `npm run maintenance`                  | ניקוי סשנים ומונים שפגו (להריץ פעם ביום ב-cron) |

## משתני סביבה

| משתנה                           | חובה | תיאור                                                         |
| ------------------------------- | ---- | ------------------------------------------------------------- |
| `DATABASE_URL`                  | ✓    | מחרוזת חיבור ל-PostgreSQL                                     |
| `APP_URL`                       | ✓    | כתובת האתר הציבורית (`https://...` בייצור)                    |
| `LOG_LEVEL`                     |      | `debug` / `info` / `warn` / `error`                           |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` |      | ל-seed בלבד: יצירה או עדכון של מנהל (סיסמה של 12 תווים ומעלה) |
| `SEED_DEMO`                     |      | `true` מוסיף מועדוני דמו גם בייצור                            |

## פריסה

### Docker

```bash
docker build --target runner -t memberbee .
docker build --target migrate -t memberbee-migrate .

# לפני כל גרסה חדשה: מיגרציות ו-seed
docker run --rm -e DATABASE_URL=... -e ADMIN_EMAIL=... -e ADMIN_PASSWORD=... memberbee-migrate
# הרצת האפליקציה
docker run -d -p 3000:3000 -e DATABASE_URL=... -e APP_URL=https://memberbee.co.il memberbee
```

אפשר גם להריץ הכול עם `docker compose` (ההוראות בראש `docker-compose.yml`).

### פלטפורמות מנוהלות (Vercel, Railway, Render, Fly.io)

1. מחברים מסד PostgreSQL מנוהל (Neon, Supabase, RDS, Railway).
2. מגדירים את `DATABASE_URL` ואת `APP_URL`.
3. Build command: `npx prisma migrate deploy && npm run build`.
4. מריצים פעם אחת `npm run db:seed` עם `ADMIN_EMAIL` ו-`ADMIN_PASSWORD`.

בדיקת בריאות זמינה בכתובת `GET /api/health` (מחזירה 200 או 503, כולל בדיקת חיבור למסד).

## אבטחה

- **סיסמאות:** scrypt (N=2¹⁵) עם salt ייחודי. השוואה ב-timing-safe, ובדיקת סיסמה גם כשהמשתמש לא קיים, כדי שזמן התגובה לא יחשוף אילו אימיילים רשומים.
- **סשנים:** טוקן אקראי של 256 ביט בעוגיית `httpOnly`, `Secure`, `SameSite=Lax`. במסד נשמר רק גיבוב SHA-256 שלו. הסשן מתחדש אוטומטית, והתנתקות מוחקת אותו בשרת.
- **הרשאות:** כל עמוד, פעולה ושאילתה עוברים דרך שכבת גישה לנתונים (`src/lib/auth.ts`). שאילתות מוגבלות ל-`userId` של המשתמש המחובר.
- **הגבלת ניסיונות:** התחברות, הרשמה, שינוי סיסמה וצור קשר. המונים ב-Postgres, כך שההגבלה עובדת גם כשרצים כמה שרתים.
- **CSP** עם nonce לכל בקשה, ובנוסף HSTS, `X-Frame-Options`, `Referrer-Policy` ו-`Permissions-Policy`.
- **CSRF:** Server Actions של Next.js בודקים Origin, ובנוסף העוגיות מוגדרות `SameSite=Lax`.
- **ולידציה:** כל קלט עובר Zod בצד השרת. מותרות רק כתובות URL מסוג http/https, והפניות אחרי התחברות מוגבלות לנתיבים פנימיים.

## מבנה הפרויקט

```
prisma/            סכמה, מיגרציות, seed
src/proxy.ts       CSP ובדיקת התחברות ראשונית
src/lib/           שכבת נתונים, אימות, סשנים, ולידציה, לוגים
src/components/    רכיבי UI וטפסים
src/app/           עמודים ו-Server Actions
  (auth)/          התחברות והרשמה
  account/         אזור אישי
  clubs/           קטלוג ועמודי מועדון
  admin/           ממשק ניהול
tests/             בדיקות Vitest
e2e/               בדיקות Playwright
```

## לפני עלייה לאוויר

- [ ] **סקירה משפטית** של `/terms` ו-`/privacy` (חוק הגנת הפרטיות ותיקון 13). כרגע אלה טקסטים לדוגמה.
- [ ] דומיין ו-HTTPS, ועדכון `APP_URL`.
- [ ] גיבויים אוטומטיים למסד הנתונים.
- [ ] ניטור שגיאות (למשל Sentry) ו-uptime על `/api/health`.
- [ ] Cron יומי ל-`npm run maintenance`.
- [ ] **איפוס סיסמה ואימות אימייל.** דורשים ספק שליחת מיילים (Resend, SES, SendGrid). זה השלב המומלץ הבא.
- [ ] העלאת לוגו לאחסון קבצים (S3/R2). כרגע הלוגו מוזן ככתובת URL.

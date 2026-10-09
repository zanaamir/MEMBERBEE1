/**
 * Seeds reference data (categories, cities) and, outside production, demo clubs.
 * Safe to run repeatedly: every write is an upsert.
 *
 *   ADMIN_EMAIL=... ADMIN_PASSWORD=... npm run db:seed   # also creates/updates an admin
 */
import { PrismaClient, type BenefitType, type ProfileField } from "@prisma/client";
import { hashPassword } from "../src/lib/password";

const db = new PrismaClient();

const categories = [
  { slug: "food", name: "מזון וסופרמרקטים" },
  { slug: "fashion", name: "אופנה" },
  { slug: "sport", name: "ספורט ופנאי" },
  { slug: "home", name: "בית ועיצוב" },
  { slug: "kids", name: "ילדים ותינוקות" },
  { slug: "beauty", name: "טיפוח ופארם" },
  { slug: "electronics", name: "אלקטרוניקה" },
  { slug: "restaurants", name: "מסעדות ובתי קפה" },
];

const cities = [
  "אילת",
  "אשדוד",
  "אשקלון",
  "באר שבע",
  "בית שמש",
  "בני ברק",
  "בת ים",
  "גבעתיים",
  "הוד השרון",
  "הרצליה",
  "חדרה",
  "חולון",
  "חיפה",
  "טבריה",
  "יבנה",
  "ירושלים",
  "כפר סבא",
  "כרמיאל",
  "לוד",
  "מודיעין-מכבים-רעות",
  "נהריה",
  "נס ציונה",
  "נצרת",
  "נתניה",
  "עכו",
  "עפולה",
  "פתח תקווה",
  "קריית אתא",
  "קריית גת",
  "ראש העין",
  "ראשון לציון",
  "רחובות",
  "רמלה",
  "רמת גן",
  "רעננה",
  "תל אביב-יפו",
];

// Fictional demo clubs for development and staging.
const demoClubs: {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  brandColor: string;
  requiredFields: ProfileField[];
  benefits: { type: BenefitType; title: string; description?: string }[];
}[] = [
  {
    slug: "super-hashchuna",
    name: "סופר השכונה",
    tagline: "הסופר של כולנו – עם הנחה קבועה על כל קנייה",
    description: "מועדון הלקוחות של רשת סופר השכונה. צוברים נקודות בכל קנייה, מקבלים מבצעים אישיים ונהנים מהנחת יום הולדת.",
    category: "food",
    brandColor: "#16a34a",
    requiredFields: ["PHONE", "DATE_OF_BIRTH"],
    benefits: [
      { type: "DISCOUNT", title: "5% הנחה קבועה", description: "על כל הקנייה, למעט מוצרי פיקדון ומבצעים" },
      { type: "POINTS", title: "נקודה על כל 10 ₪", description: "100 נקודות = שובר 10 ₪" },
      { type: "BIRTHDAY", title: "עוגה במתנה ביום ההולדת", description: "בקנייה מעל 150 ₪ בחודש יום ההולדת" },
      { type: "ONE_PLUS_ONE", title: "1+1 על מוצרי המאפייה", description: "בימי שלישי" },
    ],
  },
  {
    slug: "urban-style",
    name: "אורבן סטייל",
    tagline: "אופנה עירונית במחירי חברי מועדון",
    description: "מועדון האופנה של אורבן סטייל: הנחות לחברים, גישה מוקדמת לקולקציות וייעוץ סטיילינג אישי.",
    category: "fashion",
    brandColor: "#7c3aed",
    requiredFields: ["PHONE", "DATE_OF_BIRTH", "GENDER"],
    benefits: [
      { type: "DISCOUNT", title: "10% הנחה בהצטרפות", description: "על הקנייה הראשונה" },
      { type: "BIRTHDAY", title: "50 ₪ מתנה ליום ההולדת" },
      { type: "FREE_SHIPPING", title: "משלוח חינם באתר" },
    ],
  },
  {
    slug: "run-fit",
    name: "ראן פיט",
    tagline: "ציוד ספורט לכל רמה – וקהילה שרצה יחד",
    description: "חנויות ראן פיט מציעות ציוד ריצה, כושר ויוגה. חברי המועדון מוזמנים לאימוני ריצה קבוצתיים בחינם.",
    category: "sport",
    brandColor: "#0284c7",
    requiredFields: ["PHONE"],
    benefits: [
      { type: "DISCOUNT", title: "15% הנחה על נעלי ריצה" },
      { type: "GIFT", title: "אימון ריצה קבוצתי חינם", description: "בכל יום שישי בבוקר" },
      { type: "POINTS", title: "החזר 3% לכל קנייה" },
    ],
  },
  {
    slug: "beit-vaod",
    name: "בית ועוד",
    tagline: "כל מה שהבית צריך, עם הטבות לכל המשפחה",
    description: "רשת בית ועוד – כלי בית, טקסטיל ועיצוב. מועדון משפחתי עם הטבות ימי הולדת לילדים.",
    category: "home",
    brandColor: "#ea580c",
    requiredFields: ["PHONE", "CITY", "CHILDREN"],
    benefits: [
      { type: "DISCOUNT", title: "8% הנחה קבועה" },
      { type: "BIRTHDAY", title: "מתנה ליום ההולדת של הילדים" },
      { type: "ONE_PLUS_ONE", title: "1+1 על טקסטיל לבית", description: "פעם בחודש" },
    ],
  },
  {
    slug: "little-ones",
    name: "קטנטנים",
    tagline: "הכל לתינוקות ולילדים – מהיום הראשון",
    description: "מועדון קטנטנים מלווה הורים מההריון ועד גיל 10, עם הנחות על מוצרי תינוקות, צעצועים וביגוד.",
    category: "kids",
    brandColor: "#db2777",
    requiredFields: ["PHONE", "CHILDREN"],
    benefits: [
      { type: "GIFT", title: "ערכת לידה במתנה" },
      { type: "DISCOUNT", title: "10% על חיתולים ומזון תינוקות" },
    ],
  },
  {
    slug: "glow-pharm",
    name: "גלואו פארם",
    tagline: "טיפוח, בריאות ויופי – עם נקודות בכל קנייה",
    description: "רשת הפארם גלואו: צבירת נקודות, ימי הטבה לחברים והנחה על מותג הבית.",
    category: "beauty",
    brandColor: "#0d9488",
    requiredFields: ["PHONE", "DATE_OF_BIRTH"],
    benefits: [
      { type: "POINTS", title: "5% צבירה בכל קנייה" },
      { type: "ONE_PLUS_ONE", title: "1+1 על מותג הבית" },
      { type: "BIRTHDAY", title: "20% הנחה בחודש יום ההולדת" },
    ],
  },
];

async function main() {
  for (const [i, c] of categories.entries()) {
    await db.category.upsert({ where: { slug: c.slug }, update: { name: c.name, sortOrder: i }, create: { ...c, sortOrder: i } });
  }
  for (const name of cities) {
    await db.city.upsert({ where: { name }, update: {}, create: { name } });
  }
  console.log(`✓ ${categories.length} categories, ${cities.length} cities`);

  if (process.env.NODE_ENV !== "production" || process.env.SEED_DEMO === "true") {
    for (const { benefits, category, ...club } of demoClubs) {
      const { id: categoryId } = await db.category.findUniqueOrThrow({ where: { slug: category } });
      const terms = "תקנון לדוגמה. החברות במועדון ללא עלות. ההטבות אינן כפל מבצעים ומותנות בהצגת מספר חבר.";
      const saved = await db.club.upsert({
        where: { slug: club.slug },
        update: { ...club, categoryId },
        create: { ...club, categoryId, terms },
      });
      await db.benefit.deleteMany({ where: { clubId: saved.id } });
      await db.benefit.createMany({ data: benefits.map((b, sortOrder) => ({ ...b, sortOrder, clubId: saved.id })) });
    }
    console.log(`✓ ${demoClubs.length} demo clubs`);
  }

  const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (ADMIN_EMAIL && ADMIN_PASSWORD) {
    if (ADMIN_PASSWORD.length < 12) throw new Error("ADMIN_PASSWORD must be at least 12 characters");
    const email = ADMIN_EMAIL.trim().toLowerCase();
    const passwordHash = await hashPassword(ADMIN_PASSWORD);
    await db.user.upsert({
      where: { email },
      update: { role: "ADMIN", passwordHash },
      create: { email, passwordHash, role: "ADMIN", firstName: "מנהל", lastName: "מערכת" },
    });
    console.log(`✓ admin ${email}`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());

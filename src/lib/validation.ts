import { z } from "zod";

// Form fields arrive as strings; empty strings mean "not provided".
const emptyToUndefined = (v: unknown) => (typeof v === "string" && v.trim() === "" ? undefined : v);

const trimmed = (max: number, message = "שדה חובה") => z.string().trim().min(1, message).max(max, `עד ${max} תווים`);

export const emailSchema = z.string().trim().toLowerCase().pipe(z.email("כתובת אימייל לא תקינה").max(254));

export const passwordSchema = z
  .string()
  .min(10, "הסיסמה חייבת להכיל לפחות 10 תווים")
  .max(128, "הסיסמה ארוכה מדי")
  .refine((v) => /[A-Za-z֐-׿]/.test(v) && /\d/.test(v), "הסיסמה חייבת לכלול אותיות ומספרים");

/** Israeli phone numbers; normalized to digits only, e.g. 0521234567. */
export const phoneSchema = z
  .string()
  .transform((v) => v.replace(/[\s\-()]/g, "").replace(/^\+972/, "0"))
  .pipe(z.string().regex(/^0(?:5\d|7\d|[23489])\d{7}$/, "מספר טלפון לא תקין"));

const pastDate = (message: string) =>
  z.iso
    .date(message)
    .transform((v) => new Date(`${v}T00:00:00.000Z`))
    .refine((d) => d.getTime() <= Date.now(), "התאריך לא יכול להיות בעתיד")
    .refine((d) => d.getUTCFullYear() >= 1900, "תאריך לא תקין");

const optional = <T extends z.ZodType>(schema: T) => z.preprocess(emptyToUndefined, schema.optional());

export const genderSchema = z.enum(["FEMALE", "MALE", "OTHER"], "יש לבחור מגדר");

export const registerSchema = z.object({
  firstName: trimmed(50),
  lastName: trimmed(50),
  email: emailSchema,
  password: passwordSchema,
  acceptTerms: z.literal("on", "יש לאשר את תנאי השימוש ומדיניות הפרטיות"),
  marketingOptIn: z.preprocess((v) => v === "on", z.boolean()),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "יש להזין סיסמה").max(128),
});

export const profileSchema = z.object({
  firstName: trimmed(50),
  lastName: trimmed(50),
  phone: optional(phoneSchema),
  dateOfBirth: optional(pastDate("תאריך לא תקין")),
  gender: optional(genderSchema),
  cityId: optional(z.coerce.number().int().positive()),
  address: optional(z.string().trim().max(200, "עד 200 תווים")),
  anniversaryDate: optional(pastDate("תאריך לא תקין")),
  marketingOptIn: z.preprocess((v) => v === "on", z.boolean()),
  interests: z.array(z.coerce.number().int().positive()).max(50).default([]),
});

export const childSchema = z.object({
  firstName: trimmed(50),
  dateOfBirth: pastDate("יש להזין תאריך לידה"),
  gender: optional(genderSchema),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "יש להזין את הסיסמה הנוכחית"),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "הסיסמאות אינן תואמות",
  });

export const contactSchema = z.object({
  name: trimmed(100),
  email: emailSchema,
  subject: trimmed(150),
  message: z.string().trim().min(10, "ההודעה קצרה מדי").max(5000, "ההודעה ארוכה מדי"),
});

const profileFieldSchema = z.enum(["PHONE", "DATE_OF_BIRTH", "GENDER", "CITY", "ADDRESS", "ANNIVERSARY_DATE", "CHILDREN"]);

const httpUrl = z.url({ protocol: /^https?$/, message: "כתובת לא תקינה (http/https)" }).max(500);

export const clubSchema = z.object({
  name: trimmed(100),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "אותיות באנגלית קטנות, ספרות ומקפים בלבד")
    .max(60),
  tagline: trimmed(160),
  description: trimmed(5000),
  terms: z.string().trim().max(20000).default(""),
  websiteUrl: optional(httpUrl),
  logoUrl: optional(httpUrl),
  brandColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "צבע לא תקין"),
  categoryId: z.coerce.number().int().positive("יש לבחור קטגוריה"),
  requiredFields: z.array(profileFieldSchema).default([]),
  isActive: z.preprocess((v) => v === "on", z.boolean()),
});

export const benefitSchema = z.object({
  type: z.enum(["DISCOUNT", "POINTS", "BIRTHDAY", "GIFT", "ONE_PLUS_ONE", "FREE_SHIPPING", "OTHER"]),
  title: trimmed(120),
  description: z.string().trim().max(1000).default(""),
  validUntil: optional(z.iso.date("תאריך לא תקין").transform((v) => new Date(`${v}T00:00:00.000Z`))),
  sortOrder: z.preprocess(emptyToUndefined, z.coerce.number().int().min(0).max(1000).default(0)),
});

/** Only allow same-site relative redirects after login. */
export function safeRedirectPath(value: unknown, fallback = "/account"): string {
  if (typeof value !== "string") return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return fallback;
  return value;
}

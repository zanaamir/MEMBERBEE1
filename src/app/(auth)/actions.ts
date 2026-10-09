"use server";

import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { fieldErrors, formValues, type FormState } from "@/lib/form";
import { logger } from "@/lib/logger";
import { parseForm } from "@/lib/parse-form";
import { getDummyHash, hashPassword, verifyPassword } from "@/lib/password";
import { rateLimit, resetRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request";
import { createSession, deleteCurrentSession } from "@/lib/session";
import { loginSchema, registerSchema, safeRedirectPath } from "@/lib/validation";

const tooMany = (seconds: number): FormState => ({
  message: `יותר מדי ניסיונות. אפשר לנסות שוב בעוד ${Math.ceil(seconds / 60)} דקות.`,
});

export async function registerAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = formValues(formData, ["password"]);
  const parsed = parseForm(registerSchema, formData);
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values };

  const ip = await getClientIp();
  const limit = await rateLimit(`register:ip:${ip}`, 10, 60 * 60);
  if (!limit.ok) return { ...tooMany(limit.retryAfterSeconds), values };

  const { firstName, lastName, email, password, marketingOptIn } = parsed.data;
  try {
    const user = await db.user.create({
      data: { firstName, lastName, email, marketingOptIn, passwordHash: await hashPassword(password) },
      select: { id: true },
    });
    await createSession(user.id);
    logger.info("user registered", { userId: user.id });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return { errors: { email: ["כתובת האימייל כבר רשומה. אפשר להתחבר במקום."] }, values };
    }
    throw err;
  }
  redirect(safeRedirectPath(formData.get("next"), "/account/profile?welcome=1"));
}

export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = formValues(formData, ["password"]);
  const parsed = parseForm(loginSchema, formData);
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values };
  const { email, password } = parsed.data;

  const ip = await getClientIp();
  const [byIp, byEmail] = await Promise.all([rateLimit(`login:ip:${ip}`, 30, 15 * 60), rateLimit(`login:email:${email}`, 8, 15 * 60)]);
  if (!byIp.ok) return { ...tooMany(byIp.retryAfterSeconds), values };
  if (!byEmail.ok) return { ...tooMany(byEmail.retryAfterSeconds), values };

  const user = await db.user.findUnique({ where: { email }, select: { id: true, passwordHash: true } });
  // Always run a hash comparison so response time doesn't reveal whether the email exists.
  const valid = await verifyPassword(password, user?.passwordHash ?? (await getDummyHash()));
  if (!user || !valid) {
    logger.warn("failed login", { ip });
    return { message: "האימייל או הסיסמה שגויים.", values };
  }

  await resetRateLimit(`login:email:${email}`);
  await createSession(user.id);
  redirect(safeRedirectPath(formData.get("next")));
}

export async function logoutAction(): Promise<void> {
  await deleteCurrentSession();
  redirect("/");
}

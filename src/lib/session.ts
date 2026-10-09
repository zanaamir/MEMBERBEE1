import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { db } from "./db";

export const SESSION_COOKIE = "mb_session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
// Sessions are extended on use once less than half their lifetime remains.
const RENEW_THRESHOLD_MS = SESSION_TTL_MS / 2;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

async function setCookie(token: string, expiresAt: Date) {
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function createSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await db.session.create({ data: { id: hashToken(token), userId, expiresAt } });
  await setCookie(token, expiresAt);
}

export async function getSessionUserId(): Promise<string | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const id = hashToken(token);
  const session = await db.session.findUnique({ where: { id }, select: { userId: true, expiresAt: true } });
  if (!session) return null;

  const remaining = session.expiresAt.getTime() - Date.now();
  if (remaining <= 0) {
    await db.session.delete({ where: { id } }).catch(() => {});
    return null;
  }
  if (remaining < RENEW_THRESHOLD_MS) {
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
    await db.session.update({ where: { id }, data: { expiresAt } });
    // Cookies can only be written from actions and route handlers; during a page
    // render the DB extension still applies and the cookie catches up next action.
    await setCookie(token, expiresAt).catch(() => {});
  }
  return session.userId;
}

export async function deleteCurrentSession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) await db.session.deleteMany({ where: { id: hashToken(token) } });
  store.delete(SESSION_COOKIE);
}

export async function deleteOtherSessions(userId: string): Promise<void> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  await db.session.deleteMany({
    where: { userId, ...(token ? { NOT: { id: hashToken(token) } } : {}) },
  });
}

export async function purgeExpiredSessions(): Promise<number> {
  const { count } = await db.session.deleteMany({ where: { expiresAt: { lt: new Date() } } });
  return count;
}

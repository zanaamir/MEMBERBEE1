/**
 * Housekeeping: removes expired sessions and rate-limit windows.
 * Schedule it daily (cron, Kubernetes CronJob, etc.):  npm run maintenance
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const now = new Date();
  const sessions = await db.session.deleteMany({ where: { expiresAt: { lt: now } } });
  const limits = await db.rateLimit.deleteMany({ where: { resetAt: { lt: now } } });
  console.log(JSON.stringify({ msg: "maintenance done", expiredSessions: sessions.count, expiredRateLimits: limits.count }));
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());

import { PrismaClient } from "@prisma/client";

// Repeated local runs register many users from one IP; clear throttling counters
// so the real rate limits stay in place for production.
export default async function globalSetup() {
  if (!process.env.DATABASE_URL) return;
  const db = new PrismaClient();
  try {
    await db.rateLimit.deleteMany({});
  } finally {
    await db.$disconnect();
  }
}

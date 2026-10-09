import { afterAll, describe, expect, it } from "vitest";

// Integration test: needs a migrated database (skipped when DATABASE_URL is absent).
const hasDb = !!process.env.DATABASE_URL;

describe.skipIf(!hasDb)("rateLimit (postgres)", async () => {
  const { rateLimit, resetRateLimit } = await import("@/lib/rate-limit");
  const { db } = await import("@/lib/db");
  const key = `test:${Date.now()}:${Math.random()}`;

  afterAll(async () => {
    await resetRateLimit(key);
    await db.$disconnect();
  });

  it("allows up to the limit, then blocks with a retry hint", async () => {
    for (let i = 0; i < 3; i++) expect((await rateLimit(key, 3, 60)).ok).toBe(true);
    const blocked = await rateLimit(key, 3, 60);
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("counts concurrent hits atomically", async () => {
    const k = `${key}:concurrent`;
    const results = await Promise.all(Array.from({ length: 10 }, () => rateLimit(k, 5, 60)));
    expect(results.filter((r) => r.ok)).toHaveLength(5);
    await resetRateLimit(k);
  });
});

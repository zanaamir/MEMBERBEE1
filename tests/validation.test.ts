import { describe, expect, it } from "vitest";
import { clubSchema, emailSchema, passwordSchema, phoneSchema, profileSchema, registerSchema, safeRedirectPath } from "@/lib/validation";
import { formToObject } from "@/lib/parse-form";

describe("emailSchema", () => {
  it("normalizes case and whitespace", () => {
    expect(emailSchema.parse("  Dana@Example.COM ")).toBe("dana@example.com");
  });
  it("rejects invalid addresses", () => {
    expect(emailSchema.safeParse("not-an-email").success).toBe(false);
  });
});

describe("passwordSchema", () => {
  it("requires length, letters and digits", () => {
    expect(passwordSchema.safeParse("short1").success).toBe(false);
    expect(passwordSchema.safeParse("onlyletterslong").success).toBe(false);
    expect(passwordSchema.safeParse("1234567890123").success).toBe(false);
    expect(passwordSchema.safeParse("goodpassword1").success).toBe(true);
    expect(passwordSchema.safeParse("סיסמהטובה12").success).toBe(true);
  });
});

describe("phoneSchema", () => {
  it.each([
    ["052-123-4567", "0521234567"],
    ["+972521234567", "0521234567"],
    ["03 1234567", "031234567"],
    ["(077) 1234567", "0771234567"],
  ])("normalizes %s", (input, expected) => {
    expect(phoneSchema.parse(input)).toBe(expected);
  });
  it.each(["123", "0001234567", "05212345678", "abc"])("rejects %s", (input) => {
    expect(phoneSchema.safeParse(input).success).toBe(false);
  });
});

describe("registerSchema", () => {
  const base = { firstName: "דנה", lastName: "כהן", email: "d@example.com", password: "goodpassword1" };
  it("requires accepting the terms", () => {
    expect(registerSchema.safeParse(base).success).toBe(false);
    const ok = registerSchema.parse({ ...base, acceptTerms: "on" });
    expect(ok.marketingOptIn).toBe(false);
  });
});

describe("profileSchema", () => {
  it("treats empty strings as missing and parses dates as UTC", () => {
    const fd = new FormData();
    fd.set("firstName", "דנה");
    fd.set("lastName", "כהן");
    fd.set("phone", "");
    fd.set("dateOfBirth", "1990-05-17");
    fd.set("cityId", "");
    fd.append("interests", "1");
    fd.append("interests", "3");
    const parsed = profileSchema.parse(formToObject(fd, ["interests"]));
    expect(parsed.phone).toBeUndefined();
    expect(parsed.cityId).toBeUndefined();
    expect(parsed.dateOfBirth?.toISOString()).toBe("1990-05-17T00:00:00.000Z");
    expect(parsed.interests).toEqual([1, 3]);
  });

  it("rejects future birth dates", () => {
    const result = profileSchema.safeParse({ firstName: "a", lastName: "b", dateOfBirth: "2999-01-01" });
    expect(result.success).toBe(false);
  });
});

describe("clubSchema", () => {
  const base = {
    name: "מועדון",
    slug: "My-Club",
    tagline: "t",
    description: "d",
    brandColor: "#112233",
    categoryId: "2",
  };
  it("lowercases slugs and defaults optional fields", () => {
    const club = clubSchema.parse(base);
    expect(club.slug).toBe("my-club");
    expect(club.requiredFields).toEqual([]);
    expect(club.isActive).toBe(false);
    expect(club.categoryId).toBe(2);
  });
  it("rejects javascript: URLs and bad slugs", () => {
    expect(clubSchema.safeParse({ ...base, websiteUrl: "javascript:alert(1)" }).success).toBe(false);
    expect(clubSchema.safeParse({ ...base, slug: "רע" }).success).toBe(false);
  });
});

describe("safeRedirectPath", () => {
  it.each([
    ["/clubs/x", "/clubs/x"],
    ["//evil.com", "/account"],
    ["/\\evil.com", "/account"],
    ["https://evil.com", "/account"],
    [null, "/account"],
  ])("%s → %s", (input, expected) => {
    expect(safeRedirectPath(input)).toBe(expected);
  });
});

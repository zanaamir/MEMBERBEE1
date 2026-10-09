import { describe, expect, it } from "vitest";
import { generateMemberNumber, missingRequiredFields, type ProfileForRequirements } from "@/lib/membership";
import { ageInYears, formatDate, startOfTodayUtc, toDateInput } from "@/lib/dates";

const empty: ProfileForRequirements = {
  phone: null,
  dateOfBirth: null,
  gender: null,
  cityId: null,
  address: null,
  anniversaryDate: null,
  childrenCount: 0,
};

describe("missingRequiredFields", () => {
  it("lists only the unfilled required fields", () => {
    expect(missingRequiredFields(["PHONE", "CHILDREN"], empty)).toEqual(["PHONE", "CHILDREN"]);
    expect(missingRequiredFields(["PHONE", "CHILDREN"], { ...empty, phone: "0521234567", childrenCount: 2 })).toEqual([]);
    expect(missingRequiredFields([], empty)).toEqual([]);
  });
});

describe("generateMemberNumber", () => {
  it("has the MB-XXXX-XXXX format", () => {
    expect(generateMemberNumber()).toMatch(/^MB-\d{4}-\d{4}$/);
    let i = 0;
    expect(generateMemberNumber(() => i++ % 10)).toBe("MB-0123-4567");
  });
});

describe("dates", () => {
  it("computes age with birthdays not yet reached this year", () => {
    const now = new Date("2026-05-16T12:00:00Z");
    expect(ageInYears(new Date("1990-05-17T00:00:00Z"), now)).toBe(35);
    expect(ageInYears(new Date("1990-05-16T00:00:00Z"), now)).toBe(36);
  });
  it("formats date-only values without time-zone drift", () => {
    const d = new Date("2020-01-01T00:00:00Z");
    expect(toDateInput(d)).toBe("2020-01-01");
    expect(formatDate(d)).toContain("2020");
    expect(startOfTodayUtc(new Date("2026-10-09T23:30:00Z")).toISOString()).toBe("2026-10-09T00:00:00.000Z");
  });
});

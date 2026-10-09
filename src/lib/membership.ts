import { randomInt } from "node:crypto";
import type { ProfileField } from "@prisma/client";

export type ProfileForRequirements = {
  phone: string | null;
  dateOfBirth: Date | null;
  gender: string | null;
  cityId: number | null;
  address: string | null;
  anniversaryDate: Date | null;
  childrenCount: number;
};

const isFilled: Record<ProfileField, (p: ProfileForRequirements) => boolean> = {
  PHONE: (p) => !!p.phone,
  DATE_OF_BIRTH: (p) => !!p.dateOfBirth,
  GENDER: (p) => !!p.gender,
  CITY: (p) => p.cityId != null,
  ADDRESS: (p) => !!p.address,
  ANNIVERSARY_DATE: (p) => !!p.anniversaryDate,
  CHILDREN: (p) => p.childrenCount > 0,
};

/** Profile fields a club requires that the member hasn't filled in yet. */
export function missingRequiredFields(required: ProfileField[], profile: ProfileForRequirements): ProfileField[] {
  return required.filter((field) => !isFilled[field](profile));
}

/** Human-friendly member number, e.g. "MB-4821-7730". */
export function generateMemberNumber(randomDigit: () => number = () => randomInt(10)): string {
  const digits = Array.from({ length: 8 }, randomDigit).join("");
  return `MB-${digits.slice(0, 4)}-${digits.slice(4)}`;
}

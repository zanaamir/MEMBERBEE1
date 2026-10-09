import type { BenefitType, Gender, ProfileField } from "@prisma/client";

export const genderLabels: Record<Gender, string> = {
  FEMALE: "נקבה",
  MALE: "זכר",
  OTHER: "אחר",
};

export const profileFieldLabels: Record<ProfileField, string> = {
  PHONE: "טלפון נייד",
  DATE_OF_BIRTH: "תאריך לידה",
  GENDER: "מגדר",
  CITY: "עיר מגורים",
  ADDRESS: "כתובת",
  ANNIVERSARY_DATE: "תאריך נישואין",
  CHILDREN: "פרטי ילדים",
};

export const benefitTypeLabels: Record<BenefitType, string> = {
  DISCOUNT: "הנחה",
  POINTS: "צבירת נקודות",
  BIRTHDAY: "הטבת יום הולדת",
  GIFT: "מתנה",
  ONE_PLUS_ONE: "1+1",
  FREE_SHIPPING: "משלוח חינם",
  OTHER: "הטבה",
};

export const benefitTypeIcons: Record<BenefitType, string> = {
  DISCOUNT: "%",
  POINTS: "★",
  BIRTHDAY: "🎂",
  GIFT: "🎁",
  ONE_PLUS_ONE: "1+1",
  FREE_SHIPPING: "🚚",
  OTHER: "✓",
};

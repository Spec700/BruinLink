import { categories, type ClubCategory } from "@/lib/clubs";

export type ClubRegistrationStatus = "pending" | "approved" | "rejected";

export type ClubVisibilityState = "visible" | "hidden";

export type ClubRegistrationInput = {
  requesterName: string;
  requesterEmail: string;
  clubName: string;
  category: ClubCategory | "";
  shortDescription: string;
  about: string;
  meetingTime: string;
  meetingLocation: string;
  publicContactEmail: string;
};

export type ClubRegistrationRequest = Omit<ClubRegistrationInput, "category"> & {
  id: string;
  category: ClubCategory;
  status: ClubRegistrationStatus;
  createdAt: string;
  reviewedAt?: string;
  adminNote?: string;
};

export type ManagedClub = {
  slug: string;
  name: string;
  category: ClubCategory;
  contactInfo: string;
  meetingTime: string;
  location: string;
  visibilityState: ClubVisibilityState;
};

export type RegistrationErrors = Partial<
  Record<keyof ClubRegistrationInput, string>
>;

export type ValidatedClubRegistrationInput = Omit<
  ClubRegistrationInput,
  "category"
> & {
  category: ClubCategory;
  slug: string;
};

export type RegistrationValidationResult =
  | {
      ok: true;
      data: ValidatedClubRegistrationInput;
      errors: RegistrationErrors;
    }
  | {
      ok: false;
      data: null;
      errors: RegistrationErrors;
    };

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const editCodeAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const editCodePattern = /^BL-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

export const initialRegistrationInput: ClubRegistrationInput = {
  requesterName: "",
  requesterEmail: "",
  clubName: "",
  category: "",
  shortDescription: "",
  about: "",
  meetingTime: "",
  meetingLocation: "",
  publicContactEmail: "",
};

export const registrationFieldLabels: Record<
  keyof ClubRegistrationInput,
  string
> = {
  requesterName: "Responsible contact name",
  requesterEmail: "Responsible contact email",
  clubName: "Club name",
  category: "Category",
  shortDescription: "Short description",
  about: "About",
  meetingTime: "Meeting time",
  meetingLocation: "Meeting location",
  publicContactEmail: "Public contact email",
};

export function isClubCategory(value: string): value is ClubCategory {
  return categories.some((category) => category === value);
}

export function slugifyClubName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function isValidEmail(email: string) {
  return emailPattern.test(email.trim());
}

export function normalizeRegistrationInput(
  input: ClubRegistrationInput,
): ClubRegistrationInput {
  return {
    requesterName: input.requesterName.trim(),
    requesterEmail: input.requesterEmail.trim(),
    clubName: input.clubName.trim(),
    category: input.category,
    shortDescription: input.shortDescription.trim(),
    about: input.about.trim(),
    meetingTime: input.meetingTime.trim(),
    meetingLocation: input.meetingLocation.trim(),
    publicContactEmail: input.publicContactEmail.trim(),
  };
}

export function validateRegistrationInput(
  input: ClubRegistrationInput,
): RegistrationValidationResult {
  const data = normalizeRegistrationInput(input);
  const errors: RegistrationErrors = {};

  for (const field of [
    "requesterName",
    "requesterEmail",
    "clubName",
    "shortDescription",
    "about",
    "meetingTime",
    "meetingLocation",
    "publicContactEmail",
  ] satisfies Array<keyof ClubRegistrationInput>) {
    if (!data[field]) {
      errors[field] = `${registrationFieldLabels[field]} is required.`;
    }
  }

  if (!data.category || !isClubCategory(data.category)) {
    errors.category = "Choose one of the approved BruinLink categories.";
  }

  if (data.requesterEmail && !isValidEmail(data.requesterEmail)) {
    errors.requesterEmail = "Enter a valid email for the responsible contact.";
  }

  if (data.publicContactEmail && !isValidEmail(data.publicContactEmail)) {
    errors.publicContactEmail = "Enter a valid public contact email.";
  }

  const slug = slugifyClubName(data.clubName);

  if (data.clubName && !slug) {
    errors.clubName = "Club name must include letters or numbers.";
  }

  if (Object.keys(errors).length > 0 || !isClubCategory(data.category)) {
    return {
      ok: false,
      data: null,
      errors,
    };
  }

  return {
    ok: true,
    data: {
      ...data,
      category: data.category,
      slug,
    },
    errors: {},
  };
}

export function isEditCodeFormat(value: string) {
  return editCodePattern.test(value);
}

export function generateEditCode() {
  return `BL-${generateEditCodeSegment()}-${generateEditCodeSegment()}`;
}

export async function hashEditCode(editCode: string) {
  const normalizedCode = editCode.trim().toUpperCase();

  if (!isEditCodeFormat(normalizedCode)) {
    throw new Error("Edit code must use BL-XXXX-XXXX format.");
  }

  const digest = await globalThis.crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(normalizedCode),
  );

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function generateEditCodeSegment() {
  let segment = "";

  for (let index = 0; index < 4; index += 1) {
    segment += editCodeAlphabet[getSecureRandomIndex(editCodeAlphabet.length)];
  }

  return segment;
}

function getSecureRandomIndex(maxExclusive: number) {
  const limit = 256 - (256 % maxExclusive);
  const bytes = new Uint8Array(1);

  do {
    globalThis.crypto.getRandomValues(bytes);
  } while (bytes[0] >= limit);

  return bytes[0] % maxExclusive;
}

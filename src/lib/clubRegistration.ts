import { categories, type ClubCategory, type ClubStatus } from "@/lib/clubs";


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
  meetingLocation: LocationData;
  profileImage: File | null;
  publicContactEmail: string;
  members: number
};

export type LocationData = {
  name: string;
  city?: string;
  state?: string;
  country?: string;
  room?: number;
};

export type ClubRegistrationRequest = Omit<ClubRegistrationInput, "category" | "profileImage"> & {
  id: string;
  slug: string;
  category: ClubCategory;
  status: ClubRegistrationStatus;
  createdAt: string;
  reviewedAt?: string;
  adminNote?: string;
  profileImagePath?: string | null;
  members: number;
  profileImageUrl?: string | null;
};


export type ManagedClub = {
  id: string;
  slug: string;
  profileImage: string | null;
  name: string;
  category: ClubCategory;
  contactInfo: string;
  meetingTime: string;
  location: string;
  status: ClubStatus;
  visibilityState: ClubVisibilityState;
  lastEditedAt: string;
  profileImageUrl?: string | null;
};

export type AdminReviewData = {
  requests: ClubRegistrationRequest[];
  clubs: ManagedClub[];
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
export type FieldName = keyof ClubRegistrationInput;




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
  profileImage: null,
  category: "",
  shortDescription: "",
  about: "",
  meetingTime: "",
  meetingLocation: {name: ""},
  publicContactEmail: "",
  members: 0,
};


export const registrationFieldLabels: Record<
  keyof ClubRegistrationInput,
  string
> = {
  requesterName: "Responsible contact name",
  requesterEmail: "Responsible contact email",
  clubName: "Club name",
  profileImage: "Club Profile Image (optional)",
  category: "Category",
  shortDescription: "Short description",
  about: "About",
  meetingTime: "Meeting time",
  meetingLocation: "Meeting location",
  publicContactEmail: "Public contact email",
  members: "Number of members"
};

export function isClubCategory(value: string): value is ClubCategory {
  return categories.some((category) => category === value);
}

export function isValidMemberCount(count: number){
    return count > 0;
}

export function serializeLocation(location: LocationData): LocationData {
  return location;
}

export function parseLocation(
  value: string | Record<string, unknown> | null | undefined,
): LocationData {
  if (!value) {
    return { name: "" };
  }

  if (typeof value === "object") {
    return normalizeParsedLocation(value);
  }

  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === "object") {
      return normalizeParsedLocation(parsed as Record<string, unknown>);
    }
  } catch {
    // still need?
  }

  return { name: value };
}

function normalizeParsedLocation(value: Record<string, unknown>): LocationData {
  return {
    name: typeof value.name === "string" ? value.name : "",
    city: typeof value.city === "string" ? value.city : undefined,
    state: typeof value.state === "string" ? value.state : undefined,
    country: typeof value.country === "string" ? value.country : undefined,
    room: typeof value.room === "number" ? value.room : undefined,
  };
}

export function formatLocation(location: LocationData): string {
  return [
    location.room ? `Room ${location.room}` : undefined,
    location.name,
    location.city,
    location.state,
    location.country,
  ]
    .filter((part) => typeof part === "string" && part.trim() !== "")
    .join(", ");
}

export function isValidLocation(location: LocationData | null | undefined){
    if(!location){
      console.log(`no location found`);
      return false;
    }
    const requiredFields: (keyof LocationData)[] = ["name", "city", "state", "country", "room"];
    for(const field of requiredFields){
      const value = location[field];
      if (value === undefined || value === null || (typeof value === "string" && value.trim() === "")){
        console.log(`${field} is missing or empty in ${JSON.stringify(location)}`)
        return false;
      }
    }
    return true;

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
    meetingLocation: {
      ...input.meetingLocation,
      name: input.meetingLocation.name.trim(),
      city: input.meetingLocation.city?.trim(),
      state: input.meetingLocation.state?.trim(),
      country: input.meetingLocation.country?.trim(),
      room: input.meetingLocation.room
    },
    publicContactEmail: input.publicContactEmail.trim(),
    profileImage: input.profileImage,
    members: input.members
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
    "members"
  ] satisfies Array<keyof ClubRegistrationInput>) {
    if (!data[field]) {
      errors[field] = `${registrationFieldLabels[field]} is required.`;
    }
  }
  if(!isValidLocation(data.meetingLocation)){
    errors.meetingLocation = "Meeting Location is required.";
  }

  if(!isValidMemberCount(data.members)){
    errors.members = "Enter a valid number of members (0 or more).";
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

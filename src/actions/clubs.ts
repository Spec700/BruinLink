"use server";

import { cookies } from "next/headers";
import { updateClub, type Club } from "@/lib/clubs";
import { revalidatePath } from "next/cache";

type EditableFields = Partial<
  Pick<
    Club,
    | "about"
    | "upcomingEvents"
    | "announcements"
    | "contactInfo"
    | "meetingTime"
    | "location"
    | "shortDescription"
  >
>;

export async function saveClubEdits(
  slug: string,
  fields: EditableFields
): Promise<{ ok: boolean; error?: string }> {
  const cookieStore = await cookies();
  const sessionSlug = cookieStore.get("club_session")?.value;

  if (!sessionSlug || sessionSlug !== slug) {
    return { ok: false, error: "Not authorized to edit this club." };
  }

  const success = await updateClub(slug, fields);

  if (!success) {
    return { ok: false, error: "Failed to save changes." };
  }

  revalidatePath(`/clubs/${slug}`);
  revalidatePath("/");

  return { ok: true };
}

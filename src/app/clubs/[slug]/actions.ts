"use server";

import { revalidatePath } from "next/cache";
import {
  clubSelectColumns,
  rowToClub,
  type Club,
  type ClubRow,
} from "@/lib/clubs";
import { isValidEmail } from "@/lib/clubRegistration";
import {
  clearClubEditSession,
  requireClubEditSession,
  setClubEditSession,
} from "@/lib/clubEditAuth";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";

type ClubEditAccessResult =
  | {
      ok: true;
      redirectTo: string;
    }
  | {
      ok: false;
      message: string;
    };

export type ClubEditMutationResult =
  | {
      ok: true;
      message: string;
      club: Club;
    }
  | {
      ok: false;
      message: string;
      fieldErrors?: Record<string, string>;
    };

type ProfileInput = {
  shortDescription: string;
  about: string;
};

type DetailsInput = {
  meetingTime: string;
  location: string;
  members: string;
  contactInfo: string;
};

type ContentField = "upcomingEvents" | "announcements";

export async function verifyClubEditCodeAction(
  slug: string,
  editCode: string,
): Promise<ClubEditAccessResult> {
  try {
    const result = await setClubEditSession(slug, editCode);

    if (!result.ok) {
      return result;
    }

    return {
      ok: true,
      redirectTo: `/clubs/${slug}/edit`,
    };
  } catch (error) {
    return toAccessError(error);
  }
}

export async function exitClubEditModeAction(slug: string) {
  await clearClubEditSession(slug);
}

export async function updateClubProfileAction(
  slug: string,
  input: ProfileInput,
): Promise<ClubEditMutationResult> {
  try {
    await requireClubEditSession(slug);

    const shortDescription = input.shortDescription.trim();
    const about = input.about.trim();
    const fieldErrors: Record<string, string> = {};

    if (!shortDescription) {
      fieldErrors.shortDescription = "Short description is required.";
    }

    if (!about) {
      fieldErrors.about = "About is required.";
    }

    if (Object.keys(fieldErrors).length > 0) {
      return {
        ok: false,
        message: "Check the highlighted fields and save again.",
        fieldErrors,
      };
    }

    const club = await updateVisibleClub(slug, {
      short_description: shortDescription,
      about,
    });

    return {
      ok: true,
      message: "Profile copy saved.",
      club,
    };
  } catch (error) {
    return toMutationError(error);
  }
}

export async function updateClubDetailsAction(
  slug: string,
  input: DetailsInput,
): Promise<ClubEditMutationResult> {
  try {
    await requireClubEditSession(slug);

    const meetingTime = input.meetingTime.trim();
    const location = input.location.trim();
    const contactInfo = input.contactInfo.trim();
    const members = input.members.trim();
    const fieldErrors: Record<string, string> = {};

    if (!meetingTime) {
      fieldErrors.meetingTime = "Meeting time is required.";
    }

    if (!location) {
      fieldErrors.location = "Meeting location is required.";
    }

    if (!members || !/^\d+$/.test(members)) {
      fieldErrors.members = "Listed members must be 0 or a positive whole number.";
    }

    if (!contactInfo) {
      fieldErrors.contactInfo = "Public contact email is required.";
    } else if (!isValidEmail(contactInfo)) {
      fieldErrors.contactInfo = "Enter a valid public contact email.";
    }

    if (Object.keys(fieldErrors).length > 0) {
      return {
        ok: false,
        message: "Check the highlighted fields and save again.",
        fieldErrors,
      };
    }

    const club = await updateVisibleClub(slug, {
      meeting_time: meetingTime,
      location,
      members: Number.parseInt(members, 10),
      contact_info: contactInfo,
    });

    return {
      ok: true,
      message: "Listing details saved.",
      club,
    };
  } catch (error) {
    return toMutationError(error);
  }
}

export async function updateClubContentAction(
  slug: string,
  field: ContentField,
  value: string,
): Promise<ClubEditMutationResult> {
  try {
    await requireClubEditSession(slug);

    const column = field === "upcomingEvents" ? "upcoming_events" : "announcements";
    const club = await updateVisibleClub(slug, {
      [column]: value.trim(),
    });

    return {
      ok: true,
      message:
        field === "upcomingEvents"
          ? "Upcoming events saved."
          : "Announcements saved.",
      club,
    };
  } catch (error) {
    return toMutationError(error);
  }
}

async function updateVisibleClub(
  slug: string,
  values: Record<string, string | number>,
) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("clubs")
    .update({
      ...values,
      status: "fresh",
      last_edited_at: new Date().toISOString(),
    })
    .eq("slug", slug)
    .eq("visibility_state", "visible")
    .select(clubSelectColumns)
    .single();

  if (error) {
    throw new Error(`Failed to save club listing: ${error.message}`);
  }

  revalidatePath("/");
  revalidatePath(`/clubs/${slug}`);
  revalidatePath(`/clubs/${slug}/edit`);

  return rowToClub(data as unknown as ClubRow);
}

function toAccessError(error: unknown): ClubEditAccessResult {
  return {
    ok: false,
    message:
      error instanceof Error ? error.message : "Could not verify edit code.",
  };
}

function toMutationError(error: unknown): ClubEditMutationResult {
  return {
    ok: false,
    message:
      error instanceof Error ? error.message : "Could not save club listing.",
  };
}

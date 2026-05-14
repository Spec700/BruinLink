import "server-only";

import { revalidatePath } from "next/cache";
import {
  clubSelectColumns,
  rowToClub,
  type ClubRow,
} from "@/lib/clubs";
import {
  generateEditCode,
  hashEditCode,
  type AdminReviewData,
  type ClubRegistrationRequest,
  type ValidatedClubRegistrationInput,
} from "@/lib/clubRegistration";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";

type RegistrationRequestRow = {
  id: string;
  requester_name: string;
  requester_email: string;
  club_name: string;
  club_slug: string;
  category: ClubRegistrationRequest["category"];
  short_description: string;
  about: string;
  meeting_time: string;
  meeting_location: string;
  public_contact_email: string;
  status: ClubRegistrationRequest["status"];
  admin_note: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
};

const registrationRequestColumns = [
  "id",
  "requester_name",
  "requester_email",
  "club_name",
  "club_slug",
  "category",
  "short_description",
  "about",
  "meeting_time",
  "meeting_location",
  "public_contact_email",
  "status",
  "admin_note",
  "reviewed_at",
  "created_at",
  "updated_at",
].join(", ");

export async function fetchAdminReviewData(): Promise<AdminReviewData> {
  const supabase = createSupabaseAdminClient();

  const [requestResult, clubResult] = await Promise.all([
    supabase
      .from("club_registration_requests")
      .select(registrationRequestColumns)
      .eq("status", "pending")
      .order("created_at", { ascending: true }),
    supabase.from("clubs").select(clubSelectColumns).order("name"),
  ]);

  if (requestResult.error) {
    throw new Error(
      `Failed to fetch registration requests: ${requestResult.error.message}`,
    );
  }

  if (clubResult.error) {
    throw new Error(`Failed to fetch clubs: ${clubResult.error.message}`);
  }

  return {
    requests: ((requestResult.data ?? []) as unknown as RegistrationRequestRow[])
      .map(rowToRegistrationRequest),
    clubs: ((clubResult.data ?? []) as unknown as ClubRow[]).map((row) => {
      const club = rowToClub(row);
      return {
        id: club.id,
        slug: club.slug,
        name: club.name,
        category: club.category,
        contactInfo: club.contactInfo,
        meetingTime: club.meetingTime,
        location: club.location,
        visibilityState: club.visibilityState,
      };
    }),
  };
}

export async function createRegistrationRequest(
  input: ValidatedClubRegistrationInput,
) {
  const supabase = createSupabaseAdminClient();

  const { data: existingClub, error: existingClubError } = await supabase
    .from("clubs")
    .select("slug")
    .eq("slug", input.slug)
    .maybeSingle();

  if (existingClubError) {
    throw new Error(`Failed to check existing clubs: ${existingClubError.message}`);
  }

  if (existingClub) {
    return {
      ok: false as const,
      message: "A club with this name is already listed.",
    };
  }

  const { data: existingRequest, error: existingRequestError } = await supabase
    .from("club_registration_requests")
    .select("id")
    .eq("club_slug", input.slug)
    .in("status", ["pending", "approved"])
    .maybeSingle();

  if (existingRequestError) {
    throw new Error(
      `Failed to check existing registration requests: ${existingRequestError.message}`,
    );
  }

  if (existingRequest) {
    return {
      ok: false as const,
      message: "A pending or approved request already uses this club name.",
    };
  }

  const { data, error } = await supabase
    .from("club_registration_requests")
    .insert({
      requester_name: input.requesterName,
      requester_email: input.requesterEmail,
      club_name: input.clubName,
      club_slug: input.slug,
      category: input.category,
      short_description: input.shortDescription,
      about: input.about,
      meeting_time: input.meetingTime,
      meeting_location: input.meetingLocation,
      public_contact_email: input.publicContactEmail,
      status: "pending",
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(`Failed to submit registration request: ${error.message}`);
  }

  revalidatePath("/admin");

  return {
    ok: true as const,
    id: data.id as string,
  };
}

export async function approveRegistrationRequest(
  requestId: string,
  adminNote: string,
) {
  const supabase = createSupabaseAdminClient();
  const editCode = await generateUniqueEditCodeHash();

  const { data, error } = await supabase.rpc(
    "approve_club_registration_request",
    {
      target_request_id: requestId,
      generated_edit_code_hash: editCode.hash,
      approval_note: adminNote,
    },
  );

  if (error) {
    throw new Error(`Failed to approve request: ${error.message}`);
  }

  revalidatePath("/");
  revalidatePath("/admin");

  const approved = Array.isArray(data) ? data[0] : data;

  if (approved?.approved_club_slug) {
    revalidatePath(`/clubs/${approved.approved_club_slug}`);
  }

  return {
    editCode: editCode.plaintext,
    clubName: approved?.approved_club_name ?? "Club",
  };
}

export async function rejectRegistrationRequest(
  requestId: string,
  adminNote: string,
) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("club_registration_requests")
    .update({
      status: "rejected",
      admin_note: adminNote.trim() || null,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", requestId)
    .eq("status", "pending");

  if (error) {
    throw new Error(`Failed to reject request: ${error.message}`);
  }

  revalidatePath("/admin");
}

export async function hideClub(slug: string) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("clubs")
    .update({
      visibility_state: "hidden",
    })
    .eq("slug", slug);

  if (error) {
    throw new Error(`Failed to hide club: ${error.message}`);
  }

  revalidatePath("/");
  revalidatePath(`/clubs/${slug}`);
  revalidatePath("/admin");
}

export async function unhideClub(slug: string) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("clubs")
    .update({
      visibility_state: "visible",
    })
    .eq("slug", slug);

  if (error) {
    throw new Error(`Failed to unhide club: ${error.message}`);
  }

  revalidatePath("/");
  revalidatePath(`/clubs/${slug}`);
  revalidatePath("/admin");
}

export async function regenerateClubEditCode(slug: string) {
  const supabase = createSupabaseAdminClient();
  const editCode = await generateUniqueEditCodeHash();

  const { data, error } = await supabase
    .from("clubs")
    .update({
      edit_code_hash: editCode.hash,
    })
    .eq("slug", slug)
    .select("name")
    .single();

  if (error) {
    throw new Error(`Failed to regenerate edit code: ${error.message}`);
  }

  revalidatePath(`/clubs/${slug}`);
  revalidatePath("/admin");

  return {
    editCode: editCode.plaintext,
    clubName: data.name as string,
  };
}

export async function deleteClub(slug: string) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("clubs").delete().eq("slug", slug);

  if (error) {
    throw new Error(`Failed to delete club: ${error.message}`);
  }

  revalidatePath("/");
  revalidatePath(`/clubs/${slug}`);
  revalidatePath("/admin");
}

function rowToRegistrationRequest(
  row: RegistrationRequestRow,
): ClubRegistrationRequest {
  return {
    id: row.id,
    slug: row.club_slug,
    requesterName: row.requester_name,
    requesterEmail: row.requester_email,
    clubName: row.club_name,
    category: row.category,
    shortDescription: row.short_description,
    about: row.about,
    meetingTime: row.meeting_time,
    meetingLocation: row.meeting_location,
    publicContactEmail: row.public_contact_email,
    status: row.status,
    createdAt: row.created_at,
    reviewedAt: row.reviewed_at ?? undefined,
    adminNote: row.admin_note ?? undefined,
  };
}

async function generateUniqueEditCodeHash() {
  const supabase = createSupabaseAdminClient();

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const plaintext = generateEditCode();
    const hash = await hashEditCode(plaintext);
    const { data, error } = await supabase
      .from("clubs")
      .select("id")
      .eq("edit_code_hash", hash)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to check edit code uniqueness: ${error.message}`);
    }

    if (!data) {
      return { plaintext, hash };
    }
  }

  throw new Error("Could not generate a unique edit code.");
}

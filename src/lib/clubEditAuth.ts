import "server-only";

import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import {
  hashEditCode,
  isEditCodeFormat,
} from "@/lib/clubRegistration";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";

const sessionMaxAgeSeconds = 60 * 60 * 4;

type ClubEditHashRecord = {
  edit_code_hash: string;
};

export async function setClubEditSession(slug: string, editCode: string) {
  const normalizedCode = editCode.trim().toUpperCase();

  if (!isEditCodeFormat(normalizedCode)) {
    return {
      ok: false as const,
      message: "Enter an edit code in BL-XXXX-XXXX format.",
    };
  }

  const editCodeHash = await fetchVisibleClubEditHash(slug);

  if (!editCodeHash) {
    return {
      ok: false as const,
      message: "This club listing is not available for editing.",
    };
  }

  const submittedHash = await hashEditCode(normalizedCode);

  if (!secureCompare(submittedHash, editCodeHash)) {
    return {
      ok: false as const,
      message: "That edit code does not match this club.",
    };
  }

  const cookieStore = await cookies();
  cookieStore.set(getClubEditCookieName(slug), createClubSessionToken(slug, editCodeHash), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: getClubCookiePath(slug),
    maxAge: sessionMaxAgeSeconds,
  });

  return {
    ok: true as const,
  };
}

export async function hasClubEditSession(slug: string) {
  const editCodeHash = await fetchVisibleClubEditHash(slug);

  if (!editCodeHash) {
    return false;
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(getClubEditCookieName(slug))?.value;
  const expectedToken = createClubSessionToken(slug, editCodeHash);

  return Boolean(token && secureCompare(token, expectedToken));
}

export async function requireClubEditSession(slug: string) {
  if (!(await hasClubEditSession(slug))) {
    throw new Error("Club edit access is required.");
  }
}

export async function clearClubEditSession(slug: string) {
  const cookieStore = await cookies();
  cookieStore.set(getClubEditCookieName(slug), "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: getClubCookiePath(slug),
    maxAge: 0,
  });
}

async function fetchVisibleClubEditHash(slug: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("clubs")
    .select("edit_code_hash")
    .eq("slug", slug)
    .eq("visibility_state", "visible")
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to verify club edit access: ${error.message}`);
  }

  return data
    ? (data as unknown as ClubEditHashRecord).edit_code_hash
    : null;
}

function getClubEditCookieName(slug: string) {
  return `bruinlink_club_edit_${slug}`;
}

function getClubCookiePath(slug: string) {
  return `/clubs/${slug}`;
}

function createClubSessionToken(slug: string, editCodeHash: string) {
  return createHash("sha256")
    .update(`bruinlink-club-edit-session:${slug}:${editCodeHash}`)
    .digest("hex");
}

function secureCompare(candidate: string, expected: string) {
  const candidateBuffer = Buffer.from(candidate);
  const expectedBuffer = Buffer.from(expected);

  if (candidateBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(candidateBuffer, expectedBuffer);
}

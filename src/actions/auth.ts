"use server";

import { cookies } from "next/headers";
import { verifyClubPin } from "@/lib/clubs";

export async function signIn(
  slug: string,
  pin: string
): Promise<{ ok: boolean; clubName: string | null; error?: string }> {
  if (!/^\d{4}$/.test(pin)) {
    return { ok: false, clubName: null, error: "PIN must be exactly 4 digits." };
  }

  const { valid, clubName } = await verifyClubPin(slug, pin);

  if (!valid) {
    return { ok: false, clubName: null, error: "Invalid club or PIN." };
  }

  const cookieStore = await cookies();
  cookieStore.set("club_session", slug, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 4, // 4 hours
  });

  return { ok: true, clubName };
}

export async function signOut(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("club_session");
}

export async function getSession(): Promise<{
  signedIn: boolean;
  slug: string | null;
}> {
  const cookieStore = await cookies();
  const slug = cookieStore.get("club_session")?.value ?? null;
  return { signedIn: slug !== null, slug };
}

import "server-only";

import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const adminSessionCookie = "bruinlink_admin_session";
const sessionMaxAgeSeconds = 60 * 60 * 4;

export async function setAdminSession(password: string) {
  if (!isAdminPassword(password)) {
    return false;
  }

  const cookieStore = await cookies();
  cookieStore.set(adminSessionCookie, createAdminSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: sessionMaxAgeSeconds,
  });

  return true;
}

export async function hasAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(adminSessionCookie)?.value;

  return Boolean(token && secureCompare(token, createAdminSessionToken()));
}

export async function requireAdminSession() {
  if (!(await hasAdminSession())) {
    throw new Error("Admin access is required.");
  }
}

function isAdminPassword(candidate: string) {
  const configuredPassword = process.env.BRUINLINK_ADMIN_PASSWORD;

  if (!configuredPassword) {
    return false;
  }

  return secureCompare(candidate, configuredPassword);
}

function createAdminSessionToken() {
  const configuredPassword = process.env.BRUINLINK_ADMIN_PASSWORD;

  if (!configuredPassword) {
    return "";
  }

  return createHash("sha256")
    .update(`bruinlink-admin-session:${configuredPassword}`)
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

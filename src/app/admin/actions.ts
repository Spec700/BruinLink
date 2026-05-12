"use server";

import { timingSafeEqual } from "node:crypto";

type AdminPasswordResult =
  | {
      ok: true;
    }
  | {
      ok: false;
      message: string;
    };

export async function verifyAdminPassword(
  password: string,
): Promise<AdminPasswordResult> {
  const configuredPassword = process.env.BRUINLINK_ADMIN_PASSWORD;

  if (!configuredPassword) {
    return {
      ok: false,
      message: "Admin password is not configured.",
    };
  }

  if (secureCompare(password, configuredPassword)) {
    return {
      ok: true,
    };
  }

  return {
    ok: false,
    message: "Incorrect admin password.",
  };
}

function secureCompare(candidate: string, expected: string) {
  const candidateBuffer = Buffer.from(candidate);
  const expectedBuffer = Buffer.from(expected);

  if (candidateBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(candidateBuffer, expectedBuffer);
}

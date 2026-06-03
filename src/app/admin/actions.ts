"use server";

import { hasAdminSession, requireAdminSession, setAdminSession } from "@/lib/adminAuth";
import {
  approveRegistrationRequest,
  deleteClub,
  fetchAdminReviewData,
  hideClub,
  regenerateClubEditCode,
  rejectRegistrationRequest,
  unhideClub,
} from "@/lib/adminReviewData";
import type { AdminReviewData } from "@/lib/clubRegistration";

export type AdminSessionState =
  | {
      authorized: true;
      data: AdminReviewData;
    }
  | {
      authorized: false;
      message?: string;
    };

export type AdminMutationResult =
  | {
      ok: true;
      data: AdminReviewData;
      message: string;
      editCode?: string;
    }
  | {
      ok: false;
      message: string;
    };

export async function getAdminSessionState(): Promise<AdminSessionState> {
  if (!(await hasAdminSession())) {
    return {
      authorized: false,
    };
  }

  return {
    authorized: true,
    data: await fetchAdminReviewData(),
  };
}

export async function verifyAdminPassword(
  password: string,
): Promise<AdminSessionState> {
  if (!(await setAdminSession(password))) {
    return {
      authorized: false,
      message: process.env.BRUINLINK_ADMIN_PASSWORD
        ? "Incorrect admin password."
        : "Admin password is not configured.",
    };
  }

  return {
    authorized: true,
    data: await fetchAdminReviewData(),
  };
}

export async function approveRegistrationRequestAction(
  requestId: string,
  adminNote: string,
): Promise<AdminMutationResult> {
  console.log("im being called");
  try {
    
    await requireAdminSession();
    const approved = await approveRegistrationRequest(requestId, adminNote);

    return {
      ok: true,
      data: await fetchAdminReviewData(),
      message: `${approved.clubName} approved. Share this edit code with the responsible contact.`,
      editCode: approved.editCode,
    };
  } catch (error) {
    return toMutationError(error);
  }
}

export async function rejectRegistrationRequestAction(
  requestId: string,
  adminNote: string,
): Promise<AdminMutationResult> {
  try {
    await requireAdminSession();
    await rejectRegistrationRequest(requestId, adminNote);

    return {
      ok: true,
      data: await fetchAdminReviewData(),
      message: "The request was rejected and remains unpublished.",
    };
  } catch (error) {
    return toMutationError(error);
  }
}

export async function hideClubAction(slug: string): Promise<AdminMutationResult> {
  try {
    await requireAdminSession();
    await hideClub(slug);

    return {
      ok: true,
      data: await fetchAdminReviewData(),
      message: "The club is now hidden from public views.",
    };
  } catch (error) {
    return toMutationError(error);
  }
}

export async function unhideClubAction(
  slug: string,
): Promise<AdminMutationResult> {
  try {
    await requireAdminSession();
    await unhideClub(slug);

    return {
      ok: true,
      data: await fetchAdminReviewData(),
      message: "The club is visible in public views again.",
    };
  } catch (error) {
    return toMutationError(error);
  }
}

export async function regenerateClubEditCodeAction(
  slug: string,
): Promise<AdminMutationResult> {
  try {
    await requireAdminSession();
    const regenerated = await regenerateClubEditCode(slug);

    return {
      ok: true,
      data: await fetchAdminReviewData(),
      message: `${regenerated.clubName} has a new edit code. Share it with the responsible contact.`,
      editCode: regenerated.editCode,
    };
  } catch (error) {
    return toMutationError(error);
  }
}

export async function deleteClubAction(
  slug: string,
): Promise<AdminMutationResult> {
  try {
    await requireAdminSession();
    await deleteClub(slug);

    return {
      ok: true,
      data: await fetchAdminReviewData(),
      message: "The club was permanently deleted.",
    };
  } catch (error) {
    return toMutationError(error);
  }
}

function toMutationError(error: unknown): AdminMutationResult {
  return {
    ok: false,
    message: error instanceof Error ? error.message : "Admin action failed.",
  };
}

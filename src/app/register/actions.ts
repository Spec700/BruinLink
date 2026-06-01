"use server";

import {
  createRegistrationRequest,
} from "@/lib/adminReviewData";
import { categoryLabels } from "@/lib/clubs";
import {
  validateRegistrationInput,
  type ClubRegistrationInput,
  type RegistrationErrors,
} from "@/lib/clubRegistration";
import { SupabaseClient } from "@supabase/supabase-js";

export type RegistrationSubmitResult =
  | {
      ok: true;
      clubName: string;
      category: string;
      requestId: string;
    }
  | {
      ok: false;
      message: string;
      errors?: RegistrationErrors;
    };

export async function submitClubRegistration(
  input: ClubRegistrationInput,
): Promise<RegistrationSubmitResult> {
  const validation = validateRegistrationInput(input);

  if (!validation.ok) {
    return {
      ok: false,
      message: "Some fields need attention.",
      errors: validation.errors,
    };
  }

 

  try {
    const result = await createRegistrationRequest(
        validation.data, 
        input.profileImage );

    if (!result.ok) {
      return {
        ok: false,
        message: result.message,
        errors: {
          clubName: result.message,
        },
      };
    }

    return {
      ok: true,
      clubName: validation.data.clubName,
      category: categoryLabels[validation.data.category],
      requestId: result.id,
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Could not submit the registration request.",
    };
  }
}

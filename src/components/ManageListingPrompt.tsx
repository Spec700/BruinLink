"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { KeyRound, ShieldCheck, XCircle } from "lucide-react";
import { useState, useTransition } from "react";
import { verifyClubEditCodeAction } from "@/app/clubs/[slug]/actions";

type ManageListingPromptProps = {
  slug: string;
  clubName: string;
  isAuthorized: boolean;
};

export function ManageListingPrompt({
  slug,
  clubName,
  isAuthorized,
}: ManageListingPromptProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [editCode, setEditCode] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function submitCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    startTransition(async () => {
      const result = await verifyClubEditCodeAction(slug, editCode);

      if (!result.ok) {
        setError(result.message);
        return;
      }

      router.push(result.redirectTo);
      router.refresh();
    });
  }

  if (isAuthorized) {
    return (
      <Link
        href={`/clubs/${slug}/edit`}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[var(--ucla-blue)] px-4 text-sm font-bold text-[var(--ucla-yellow)] transition hover:bg-[var(--ucla-blue-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--ucla-blue)] focus:ring-offset-2"
      >
        <ShieldCheck aria-hidden="true" className="h-4 w-4" />
        Edit listing
      </Link>
    );
  }

  return (
    <div className="relative flex flex-col items-end gap-2">
      <button
        type="button"
        data-manage-listing-button
        onClick={() => {
          setIsOpen((current) => !current);
          setError("");
        }}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--background)] px-4 text-sm font-bold text-[var(--foreground)] transition hover:border-[var(--ucla-blue)] hover:text-[var(--ucla-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--ucla-blue)] focus:ring-offset-2"
      >
        <KeyRound aria-hidden="true" className="h-4 w-4" />
        Manage listing
      </button>

      {isOpen ? (
        <form
          onSubmit={submitCode}
          className="z-10 w-full min-w-[280px] rounded-lg border border-[var(--line)] bg-[var(--surface)] p-3 shadow-[0_14px_40px_oklch(0.2_0.03_260_/_0.12)] sm:absolute sm:right-0 sm:top-12 sm:w-80"
        >
          <label
            htmlFor={`${slug}-edit-code`}
            className="text-sm font-bold text-[var(--foreground)]"
          >
            Club edit code
          </label>
          <div
            className={`mt-2 flex h-11 items-center gap-2 rounded-lg border bg-[var(--background)] px-3 transition focus-within:border-[var(--ucla-blue)] ${
              error ? "border-[var(--danger)]" : "border-[var(--line)]"
            }`}
          >
            <KeyRound
              aria-hidden="true"
              className="h-4 w-4 shrink-0 text-[var(--ucla-blue)]"
            />
            <input
              id={`${slug}-edit-code`}
              data-club-edit-code-input
              type="text"
              value={editCode}
              onChange={(event) =>
                setEditCode(event.target.value.toUpperCase())
              }
              placeholder="BL-XXXX-XXXX"
              className="h-full min-w-0 flex-1 bg-transparent text-sm font-bold tracking-normal text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]"
              aria-label={`Edit code for ${clubName}`}
            />
          </div>

          {error ? (
            <p className="mt-2 flex items-start gap-2 text-sm font-bold leading-5 text-[var(--danger)]">
              <XCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </p>
          ) : null}

          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setError("");
              }}
              className="inline-flex h-9 items-center rounded-lg px-3 text-xs font-bold text-[var(--muted)] transition hover:text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ucla-blue)] focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-[var(--ucla-blue)] px-3 text-xs font-bold text-[var(--ucla-yellow)] transition hover:bg-[var(--ucla-blue-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--ucla-blue)] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <ShieldCheck aria-hidden="true" className="h-4 w-4" />
              {isPending ? "Checking" : "Enter edit mode"}
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}

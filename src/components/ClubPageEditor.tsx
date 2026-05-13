"use client";

import { useState, useTransition } from "react";
import { Pencil, Save, X } from "lucide-react";
import type { Club } from "@/lib/clubs";
import { saveClubEdits } from "@/actions/clubs";
import { useRouter } from "next/navigation";

type Props = {
  club: Club;
  isOwner: boolean;
};

type EditableFields = {
  about: string;
  upcomingEvents: string;
  announcements: string;
  contactInfo: string;
};

export function ClubPageEditor({ club, isOwner }: Props) {
  const [editing, setEditing] = useState(false);
  const [fields, setFields] = useState<EditableFields>({
    about: club.about,
    upcomingEvents: club.upcomingEvents,
    announcements: club.announcements,
    contactInfo: club.contactInfo,
  });
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleChange(field: keyof EditableFields, value: string) {
    setFields((prev) => ({ ...prev, [field]: value }));
  }

  function handleCancel() {
    setFields({
      about: club.about,
      upcomingEvents: club.upcomingEvents,
      announcements: club.announcements,
      contactInfo: club.contactInfo,
    });
    setError(null);
    setEditing(false);
  }

  function handleSave() {
    setError(null);
    startTransition(async () => {
      const result = await saveClubEdits(club.slug, fields);
      if (result.ok) {
        setEditing(false);
        router.refresh();
      } else {
        setError(result.error ?? "Save failed.");
      }
    });
  }

  return (
    <div className="grid gap-4">
      {isOwner && (
        <div className="flex items-center justify-between rounded-lg border border-[var(--ucla-blue)] bg-[var(--ucla-blue-soft)] px-4 py-3">
          <p className="text-sm font-bold text-[var(--ucla-blue-strong)]">
            You are signed in as this club.
          </p>
          {editing ? (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isPending}
                className="flex h-9 items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--background)] px-3 text-sm font-bold text-[var(--foreground)] transition hover:border-[var(--danger)] hover:text-[var(--danger)] disabled:opacity-50"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isPending}
                className="flex h-9 items-center gap-2 rounded-lg bg-[var(--ucla-blue)] px-3 text-sm font-bold text-[var(--ucla-yellow)] transition hover:opacity-90 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {isPending ? "Saving..." : "Save Changes"}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="flex h-9 items-center gap-2 rounded-lg bg-[var(--ucla-blue)] px-3 text-sm font-bold text-[var(--ucla-yellow)] transition hover:opacity-90"
            >
              <Pencil className="h-4 w-4" />
              Edit Page
            </button>
          )}
        </div>
      )}

      {error && (
        <p className="rounded-lg bg-[oklch(0.94_0.045_35)] px-4 py-2 text-sm font-bold text-[var(--danger)]">
          {error}
        </p>
      )}

      <article className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-[var(--muted)]">Profile</p>
            <h2 className="mt-1 font-display text-2xl font-extrabold text-[var(--foreground)]">
              About
            </h2>
          </div>
          {!isOwner && (
            <Pencil
              aria-hidden="true"
              className="h-5 w-5 text-[var(--ucla-blue)]"
            />
          )}
        </div>
        {editing ? (
          <textarea
            value={fields.about}
            onChange={(e) => handleChange("about", e.target.value)}
            rows={4}
            className="mt-4 w-full rounded-lg border border-[var(--line)] bg-[var(--background)] p-3 text-base leading-8 text-[var(--foreground)] outline-none focus:border-[var(--ucla-blue)]"
          />
        ) : (
          <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--muted)]">
            {club.about}
          </p>
        )}
      </article>

      <div className="grid gap-4 md:grid-cols-2">
        <article className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-5">
          <p className="text-sm font-bold text-[var(--muted)]">Section</p>
          <h2 className="mt-1 font-display text-2xl font-extrabold text-[var(--foreground)]">
            Upcoming Events
          </h2>
          {editing ? (
            <textarea
              value={fields.upcomingEvents}
              onChange={(e) => handleChange("upcomingEvents", e.target.value)}
              rows={3}
              className="mt-4 w-full rounded-lg border border-[var(--line)] bg-[var(--background)] p-3 text-base leading-8 text-[var(--foreground)] outline-none focus:border-[var(--ucla-blue)]"
            />
          ) : (
            <p className="mt-4 text-base leading-8 text-[var(--muted)]">
              {club.upcomingEvents}
            </p>
          )}
        </article>

        <article className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-5">
          <p className="text-sm font-bold text-[var(--muted)]">Section</p>
          <h2 className="mt-1 font-display text-2xl font-extrabold text-[var(--foreground)]">
            Announcements
          </h2>
          {editing ? (
            <textarea
              value={fields.announcements}
              onChange={(e) => handleChange("announcements", e.target.value)}
              rows={3}
              className="mt-4 w-full rounded-lg border border-[var(--line)] bg-[var(--background)] p-3 text-base leading-8 text-[var(--foreground)] outline-none focus:border-[var(--ucla-blue)]"
            />
          ) : (
            <p className="mt-4 text-base leading-8 text-[var(--muted)]">
              {club.announcements}
            </p>
          )}
        </article>
      </div>

      <article className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-5">
        <p className="text-sm font-bold text-[var(--muted)]">Public page</p>
        <h2 className="mt-1 font-display text-2xl font-extrabold text-[var(--foreground)]">
          Contact Information
        </h2>
        {editing ? (
          <input
            value={fields.contactInfo}
            onChange={(e) => handleChange("contactInfo", e.target.value)}
            className="mt-4 h-12 w-full rounded-lg border border-[var(--line)] bg-[var(--background)] px-3 text-base leading-8 text-[var(--foreground)] outline-none focus:border-[var(--ucla-blue)]"
          />
        ) : (
          <p className="mt-4 text-base leading-8 text-[var(--muted)]">
            {club.contactInfo}
          </p>
        )}
      </article>
    </div>
  );
}

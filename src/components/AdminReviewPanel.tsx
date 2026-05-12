"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  EyeOff,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
  Trash2,
  XCircle,
} from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { verifyAdminPassword } from "@/app/admin/actions";
import { categoryLabels } from "@/lib/clubs";
import {
  getSampleManagedClubs,
  sampleRegistrationRequests,
} from "@/lib/adminSamples";
import {
  generateEditCode,
  slugifyClubName,
  type ClubRegistrationRequest,
  type ManagedClub,
} from "@/lib/clubRegistration";

type ReviewNotice = {
  tone: "success" | "warning";
  title: string;
  body: string;
  code?: string;
};

export function AdminReviewPanel() {
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [requests, setRequests] = useState<ClubRegistrationRequest[]>(
    sampleRegistrationRequests,
  );
  const [managedClubs, setManagedClubs] = useState<ManagedClub[]>(
    getSampleManagedClubs,
  );
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});
  const [issuedCodes, setIssuedCodes] = useState<string[]>([]);
  const [deleteCandidateSlug, setDeleteCandidateSlug] = useState<string | null>(
    null,
  );
  const [notice, setNotice] = useState<ReviewNotice | null>(null);

  const pendingRequests = useMemo(
    () => requests.filter((request) => request.status === "pending"),
    [requests],
  );

  const visibleClubCount = useMemo(
    () =>
      managedClubs.filter((club) => club.visibilityState === "visible").length,
    [managedClubs],
  );

  function submitPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordError("");

    startTransition(async () => {
      const result = await verifyAdminPassword(password);

      if (!result.ok) {
        setPasswordError(result.message);
        return;
      }

      setIsAuthorized(true);
      setPassword("");
    });
  }

  function approveRequest(request: ClubRegistrationRequest) {
    const editCode = generateUniqueEditCode(issuedCodes);
    const reviewedAt = new Date().toISOString();

    setIssuedCodes((current) => [...current, editCode]);
    setRequests((current) =>
      current.map((candidate) =>
        candidate.id === request.id
          ? {
              ...candidate,
              status: "approved",
              reviewedAt,
              adminNote: adminNotes[request.id]?.trim() || undefined,
            }
          : candidate,
      ),
    );
    setManagedClubs((current) => [
      {
        slug: slugFromRequest(request),
        name: request.clubName,
        category: request.category,
        contactInfo: request.publicContactEmail,
        meetingTime: request.meetingTime,
        location: request.meetingLocation,
        visibilityState: "visible",
      },
      ...current,
    ]);
    setNotice({
      tone: "success",
      title: `${request.clubName} approved`,
      body: `Share this edit code with ${request.requesterName}. It is shown once in this admin session.`,
      code: editCode,
    });
  }

  function rejectRequest(request: ClubRegistrationRequest) {
    setRequests((current) =>
      current.map((candidate) =>
        candidate.id === request.id
          ? {
              ...candidate,
              status: "rejected",
              reviewedAt: new Date().toISOString(),
              adminNote: adminNotes[request.id]?.trim() || undefined,
            }
          : candidate,
      ),
    );
    setNotice({
      tone: "warning",
      title: `${request.clubName} rejected`,
      body: "The request remains unpublished.",
    });
  }

  function hideClub(club: ManagedClub) {
    setManagedClubs((current) =>
      current.map((candidate) =>
        candidate.slug === club.slug
          ? {
              ...candidate,
              visibilityState: "hidden",
            }
          : candidate,
      ),
    );
    setNotice({
      tone: "warning",
      title: `${club.name} hidden`,
      body: "Hidden clubs stay in the admin list but are removed from public views.",
    });
  }

  function deleteClub(club: ManagedClub) {
    if (deleteCandidateSlug !== club.slug) {
      setDeleteCandidateSlug(club.slug);
      setNotice({
        tone: "warning",
        title: `Confirm deletion for ${club.name}`,
        body: "Click Confirm delete to permanently remove this club from the admin list.",
      });
      return;
    }

    setManagedClubs((current) =>
      current.filter((candidate) => candidate.slug !== club.slug),
    );
    setDeleteCandidateSlug(null);
    setNotice({
      tone: "warning",
      title: `${club.name} deleted`,
      body: "The club was removed from the admin list.",
    });
  }

  if (!isAuthorized) {
    return (
      <main className="min-h-screen bg-[var(--background)]">
        <section className="border-b border-[var(--line)] bg-[var(--surface)]">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-7 sm:px-6 lg:px-8">
            <Link
              href="/"
              className="inline-flex w-fit items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--background)] px-3 py-2 text-sm font-bold text-[var(--foreground)] transition hover:border-[var(--ucla-blue)] hover:text-[var(--ucla-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--ucla-blue)]"
            >
              <ArrowLeft aria-hidden="true" className="h-4 w-4" />
              Directory
            </Link>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
              <div className="max-w-4xl">
                <p className="mb-3 inline-flex rounded-full bg-[var(--ucla-yellow-soft)] px-3 py-1 text-sm font-bold text-[oklch(0.35_0.1_73)]">
                  Admin
                </p>
                <h1 className="font-display text-4xl font-extrabold leading-tight text-[var(--foreground)] sm:text-5xl">
                  Review club requests.
                </h1>
                <p className="mt-4 max-w-3xl text-lg leading-8 text-[var(--muted)]">
                  Approve new listings, distribute generated edit codes, and
                  manage public club visibility.
                </p>
              </div>

              <form
                onSubmit={submitPassword}
                className="rounded-lg border border-[var(--line)] bg-[var(--surface-strong)] p-4"
              >
                <label
                  htmlFor="admin-password"
                  className="text-sm font-bold text-[var(--foreground)]"
                >
                  Admin password
                </label>
                <div
                  className={`mt-2 flex h-12 items-center gap-3 rounded-lg border bg-[var(--background)] px-3 transition focus-within:border-[var(--ucla-blue)] ${
                    passwordError ? "border-[var(--danger)]" : "border-[var(--line)]"
                  }`}
                >
                  <LockKeyhole
                    aria-hidden="true"
                    className="h-4 w-4 text-[var(--ucla-blue)]"
                  />
                  <input
                    id="admin-password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="h-full min-w-0 flex-1 bg-transparent text-base text-[var(--foreground)] outline-none"
                  />
                </div>
                {passwordError ? (
                  <p className="mt-2 text-sm font-bold text-[var(--danger)]">
                    {passwordError}
                  </p>
                ) : null}
                <button
                  type="submit"
                  disabled={isPending}
                  className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[var(--ucla-blue)] px-4 text-sm font-bold text-[var(--ucla-yellow)] transition hover:bg-[var(--ucla-blue-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--ucla-blue)] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <ShieldCheck aria-hidden="true" className="h-4 w-4" />
                  {isPending ? "Checking" : "Enter admin"}
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <section className="border-b border-[var(--line)] bg-[var(--surface)]">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-7 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex w-fit items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--background)] px-3 py-2 text-sm font-bold text-[var(--foreground)] transition hover:border-[var(--ucla-blue)] hover:text-[var(--ucla-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--ucla-blue)]"
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            Directory
          </Link>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
            <div className="max-w-4xl">
              <p className="mb-3 inline-flex rounded-full bg-[var(--ucla-yellow-soft)] px-3 py-1 text-sm font-bold text-[oklch(0.35_0.1_73)]">
                Admin review
              </p>
              <h1 className="font-display text-4xl font-extrabold leading-tight text-[var(--foreground)] sm:text-5xl">
                Keep BruinLink listings controlled.
              </h1>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Metric label="Pending" value={pendingRequests.length} />
              <Metric label="Visible" value={visibleClubCount} />
              <Metric label="Total" value={managedClubs.length} />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:px-8">
        <div className="grid gap-4">
          {notice ? <Notice notice={notice} onDismiss={() => setNotice(null)} /> : null}

          <section className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-[var(--muted)]">
                  Pending queue
                </p>
                <h2 className="mt-1 font-display text-2xl font-extrabold text-[var(--foreground)]">
                  Club requests
                </h2>
              </div>
              <span className="rounded-full border border-[var(--line)] bg-[var(--background)] px-3 py-1 text-sm font-bold text-[var(--muted)]">
                {pendingRequests.length} pending
              </span>
            </div>

            <div className="mt-5 grid gap-4">
              {pendingRequests.length > 0 ? (
                pendingRequests.map((request) => (
                  <RequestCard
                    key={request.id}
                    request={request}
                    note={adminNotes[request.id] ?? ""}
                    onNoteChange={(value) =>
                      setAdminNotes((current) => ({
                        ...current,
                        [request.id]: value,
                      }))
                    }
                    onApprove={() => approveRequest(request)}
                    onReject={() => rejectRequest(request)}
                  />
                ))
              ) : (
                <div className="rounded-lg bg-[var(--surface-strong)] p-5 text-center">
                  <p className="font-display text-xl font-extrabold text-[var(--foreground)]">
                    No pending requests
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                    Approved or rejected requests leave this queue.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>

        <aside className="grid self-start gap-4 lg:sticky lg:top-6">
          <section className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-[var(--muted)]">
                  Existing clubs
                </p>
                <h2 className="mt-1 font-display text-2xl font-extrabold text-[var(--foreground)]">
                  Visibility
                </h2>
              </div>
              <ShieldCheck
                aria-hidden="true"
                className="h-6 w-6 text-[var(--ucla-blue)]"
              />
            </div>

            <div className="mt-4 grid max-h-[720px] gap-3 overflow-auto pr-1">
              {managedClubs.map((club) => (
                <div
                  key={club.slug}
                  className="rounded-lg border border-[var(--line)] bg-[var(--background)] p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="line-clamp-2 font-bold text-[var(--foreground)]">
                        {club.name}
                      </p>
                      <p className="mt-1 text-sm font-bold text-[var(--ucla-blue)]">
                        {categoryLabels[club.category]}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-1 text-xs font-bold ${
                        club.visibilityState === "visible"
                          ? "bg-[oklch(0.96_0.035_155)] text-[oklch(0.31_0.1_155)]"
                          : "bg-[oklch(0.94_0.045_35)] text-[var(--danger)]"
                      }`}
                    >
                      {club.visibilityState}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                    {club.meetingTime} at {club.location}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      data-hide-club={club.slug}
                      onClick={() => hideClub(club)}
                      disabled={club.visibilityState === "hidden"}
                      className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 text-xs font-bold text-[var(--foreground)] transition hover:border-[var(--ucla-blue)] hover:text-[var(--ucla-blue)] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <EyeOff aria-hidden="true" className="h-4 w-4" />
                      Hide
                    </button>
                    <button
                      type="button"
                      data-delete-club={club.slug}
                      onClick={() => deleteClub(club)}
                      className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-lg border border-[oklch(0.8_0.08_25)] bg-[oklch(0.96_0.035_25)] px-3 text-xs font-bold text-[var(--danger)] transition hover:bg-[oklch(0.94_0.05_25)]"
                    >
                      <Trash2 aria-hidden="true" className="h-4 w-4" />
                      {deleteCandidateSlug === club.slug
                        ? "Confirm delete"
                        : "Delete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-[var(--line)] bg-[var(--surface-strong)] p-4">
      <p className="text-sm font-bold text-[var(--muted)]">{label}</p>
      <p className="mt-1 font-display text-3xl font-extrabold text-[var(--ucla-blue-strong)]">
        {value}
      </p>
    </div>
  );
}

function RequestCard({
  request,
  note,
  onNoteChange,
  onApprove,
  onReject,
}: {
  request: ClubRegistrationRequest;
  note: string;
  onNoteChange: (value: string) => void;
  onApprove: () => void;
  onReject: () => void;
}) {
  return (
    <article className="rounded-lg border border-[var(--line)] bg-[var(--background)] p-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-bold text-[var(--muted)]">
            {formatDate(request.createdAt)}
          </p>
          <h3 className="mt-1 font-display text-2xl font-extrabold text-[var(--foreground)]">
            {request.clubName}
          </h3>
          <p className="mt-1 text-sm font-bold text-[var(--ucla-blue)]">
            {categoryLabels[request.category]}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <span className="rounded-full bg-[var(--ucla-yellow-soft)] px-3 py-1 text-sm font-bold text-[oklch(0.35_0.1_73)]">
            pending
          </span>
          <button
            type="button"
            data-approve-request={request.id}
            onClick={onApprove}
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-[var(--ucla-blue)] px-3 text-xs font-bold text-[var(--ucla-yellow)] transition hover:bg-[var(--ucla-blue-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--ucla-blue)] focus:ring-offset-2"
          >
            <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
            Approve
          </button>
          <button
            type="button"
            data-reject-request={request.id}
            onClick={onReject}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-[oklch(0.8_0.08_25)] bg-[oklch(0.96_0.035_25)] px-3 text-xs font-bold text-[var(--danger)] transition hover:bg-[oklch(0.94_0.05_25)] focus:outline-none focus:ring-2 focus:ring-[var(--danger)] focus:ring-offset-2"
          >
            <XCircle aria-hidden="true" className="h-4 w-4" />
            Reject
          </button>
        </div>
      </div>

      <p className="mt-4 text-base leading-7 text-[var(--muted)]">
        {request.shortDescription}
      </p>
      <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
        {request.about}
      </p>

      <div className="mt-4 grid gap-3 rounded-lg bg-[var(--surface-strong)] p-3 text-sm text-[var(--muted)] md:grid-cols-2">
        <p>
          <span className="font-bold text-[var(--foreground)]">Contact:</span>{" "}
          {request.requesterName}, {request.requesterEmail}
        </p>
        <p>
          <span className="font-bold text-[var(--foreground)]">Public:</span>{" "}
          {request.publicContactEmail}
        </p>
        <p>
          <span className="font-bold text-[var(--foreground)]">Meets:</span>{" "}
          {request.meetingTime}
        </p>
        <p>
          <span className="font-bold text-[var(--foreground)]">Location:</span>{" "}
          {request.meetingLocation}
        </p>
      </div>

      <label
        htmlFor={`${request.id}-note`}
        className="mt-4 block text-sm font-bold text-[var(--foreground)]"
      >
        Rejection note
      </label>
      <textarea
        id={`${request.id}-note`}
        value={note}
        onChange={(event) => onNoteChange(event.target.value)}
        rows={3}
        className="mt-2 w-full resize-y rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-3 text-sm leading-6 text-[var(--foreground)] outline-none transition focus:border-[var(--ucla-blue)]"
      />

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onApprove}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-[var(--ucla-blue)] px-4 text-sm font-bold text-[var(--ucla-yellow)] transition hover:bg-[var(--ucla-blue-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--ucla-blue)] focus:ring-offset-2"
        >
          <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
          Approve
        </button>
        <button
          type="button"
          onClick={onReject}
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-[oklch(0.8_0.08_25)] bg-[oklch(0.96_0.035_25)] px-4 text-sm font-bold text-[var(--danger)] transition hover:bg-[oklch(0.94_0.05_25)] focus:outline-none focus:ring-2 focus:ring-[var(--danger)] focus:ring-offset-2"
        >
          <XCircle aria-hidden="true" className="h-4 w-4" />
          Reject
        </button>
      </div>
    </article>
  );
}

function Notice({
  notice,
  onDismiss,
}: {
  notice: ReviewNotice;
  onDismiss: () => void;
}) {
  const isSuccess = notice.tone === "success";

  return (
    <section
      className={`rounded-lg border p-4 ${
        isSuccess
          ? "border-[oklch(0.78_0.09_155)] bg-[oklch(0.96_0.035_155)] text-[oklch(0.31_0.1_155)]"
          : "border-[oklch(0.8_0.08_25)] bg-[oklch(0.96_0.035_25)] text-[var(--danger)]"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 font-bold">
            {isSuccess ? (
              <CheckCircle2 aria-hidden="true" className="h-5 w-5" />
            ) : (
              <XCircle aria-hidden="true" className="h-5 w-5" />
            )}
            {notice.title}
          </p>
          <p className="mt-1 text-sm leading-6">{notice.body}</p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-lg px-2 py-1 text-xs font-bold transition hover:bg-[oklch(1_0_0_/_0.4)]"
        >
          Dismiss
        </button>
      </div>

      {notice.code ? (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg bg-[oklch(1_0_0_/_0.52)] p-3">
          <KeyRound aria-hidden="true" className="h-5 w-5" />
          <code className="font-display text-2xl font-extrabold tracking-normal">
            {notice.code}
          </code>
        </div>
      ) : null}
    </section>
  );
}

function generateUniqueEditCode(existingCodes: string[]) {
  let code = generateEditCode();

  while (existingCodes.includes(code)) {
    code = generateEditCode();
  }

  return code;
}

function slugFromRequest(request: ClubRegistrationRequest) {
  return slugifyClubName(request.clubName);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

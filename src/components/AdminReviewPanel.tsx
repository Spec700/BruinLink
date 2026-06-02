"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  Search,
  ShieldCheck,
  Trash2,
  XCircle,
} from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import {
  approveRegistrationRequestAction,
  deleteClubAction,
  hideClubAction,
  regenerateClubEditCodeAction,
  rejectRegistrationRequestAction,
  unhideClubAction,
  verifyAdminPassword,
  type AdminMutationResult,
  type AdminSessionState,
} from "@/app/admin/actions";
import { categoryLabels, type ClubStatus } from "@/lib/clubs";
import {
  clubStatusLabels,
  formatLastUpdated,
} from "@/lib/clubFreshness";
import { formatLocation } from "@/lib/clubRegistration";
import type {
  AdminReviewData,
  ClubRegistrationRequest,
  ManagedClub,
} from "@/lib/clubRegistration";
import initials from "./ClubDirectory";

type ReviewNotice = {
  tone: "success" | "warning";
  title: string;
  body: string;
  code?: string;
};

type AdminReviewPanelProps = {
  initialState: AdminSessionState;
};

type ClubVisibilityFilter = "all" | "visible" | "hidden";
type ClubFreshnessFilter = "all" | ClubStatus;

const emptyData: AdminReviewData = {
  requests: [],
  clubs: [],
};

const clubVisibilityFilters: Array<{
  value: ClubVisibilityFilter;
  label: string;
}> = [
  { value: "all", label: "All" },
  { value: "visible", label: "Visible" },
  { value: "hidden", label: "Hidden" },
];

const clubFreshnessFilters: Array<{
  value: ClubFreshnessFilter;
  label: string;
}> = [
  { value: "all", label: "All" },
  { value: "fresh", label: "Fresh" },
  { value: "steady", label: "Current" },
  { value: "needs update", label: "Needs update" },
];

export function AdminReviewPanel({ initialState }: AdminReviewPanelProps) {
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState(
    initialState.authorized ? "" : (initialState.message ?? ""),
  );
  const [isAuthorized, setIsAuthorized] = useState(initialState.authorized);
  const [data, setData] = useState<AdminReviewData>(
    initialState.authorized ? initialState.data : emptyData,
  );
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});
  const [deleteCandidateSlug, setDeleteCandidateSlug] = useState<string | null>(
    null,
  );
  const [clubSearchQuery, setClubSearchQuery] = useState("");
  const [clubVisibilityFilter, setClubVisibilityFilter] =
    useState<ClubVisibilityFilter>("all");
  const [clubFreshnessFilter, setClubFreshnessFilter] =
    useState<ClubFreshnessFilter>("all");
  const [notice, setNotice] = useState<ReviewNotice | null>(null);
  const [isPending, startTransition] = useTransition();

  const pendingRequests = data.requests;

  const visibleClubCount = useMemo(
    () => data.clubs.filter((club) => club.visibilityState === "visible").length,
    [data.clubs],
  );

  const hiddenClubCount = useMemo(
    () => data.clubs.filter((club) => club.visibilityState === "hidden").length,
    [data.clubs],
  );

  const visibilityFilterCounts: Record<ClubVisibilityFilter, number> = {
    all: data.clubs.length,
    visible: visibleClubCount,
    hidden: hiddenClubCount,
  };

  const freshnessFilterCounts: Record<ClubFreshnessFilter, number> = {
    all: data.clubs.length,
    fresh: data.clubs.filter((club) => club.status === "fresh").length,
    steady: data.clubs.filter((club) => club.status === "steady").length,
    "needs update": data.clubs.filter(
      (club) => club.status === "needs update",
    ).length,
  };

  const filteredManagedClubs = useMemo(() => {
    const normalizedQuery = clubSearchQuery.trim().toLowerCase();

    return data.clubs.filter((club) => {
      const matchesVisibility =
        clubVisibilityFilter === "all" ||
        club.visibilityState === clubVisibilityFilter;
      const matchesFreshness =
        clubFreshnessFilter === "all" || club.status === clubFreshnessFilter;

      const searchableText = [
        club.name,
        club.category,
        categoryLabels[club.category],
        club.contactInfo,
        club.meetingTime,
        club.location,
        clubStatusLabels[club.status],
        club.status,
        club.visibilityState,
      ]
        .join(" ")
        .toLowerCase();

      return (
        matchesVisibility &&
        matchesFreshness &&
        (!normalizedQuery || searchableText.includes(normalizedQuery))
      );
    });
  }, [clubFreshnessFilter, clubSearchQuery, clubVisibilityFilter, data.clubs]);

  function submitPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordError("");

    startTransition(async () => {
      const result = await verifyAdminPassword(password);

      if (!result.authorized) {
        setPasswordError(result.message ?? "Could not enter admin review.");
        return;
      }

      setIsAuthorized(true);
      setData(result.data);
      setPassword("");
      setNotice(null);
    });
  }

  function approveRequest(request: ClubRegistrationRequest) {
    const note = adminNotes[request.id] ?? "";

    runAdminMutation(
      () => approveRegistrationRequestAction(request.id, note),
      (result) => ({
        tone: "success",
        title: `${request.clubName} approved`,
        body: result.message,
        code: result.editCode,
      }),
    );
  }

  function rejectRequest(request: ClubRegistrationRequest) {
    const note = adminNotes[request.id] ?? "";

    runAdminMutation(
      () => rejectRegistrationRequestAction(request.id, note),
      (result) => ({
        tone: "warning",
        title: `${request.clubName} rejected`,
        body: result.message,
      }),
    );
  }

  function hideClub(club: ManagedClub) {
    runAdminMutation(
      () => hideClubAction(club.slug),
      (result) => ({
        tone: "warning",
        title: `${club.name} hidden`,
        body: result.message,
      }),
    );
  }

  function unhideClub(club: ManagedClub) {
    runAdminMutation(
      () => unhideClubAction(club.slug),
      (result) => ({
        tone: "success",
        title: `${club.name} unhidden`,
        body: result.message,
      }),
    );
  }

  function regenerateClubCode(club: ManagedClub) {
    runAdminMutation(
      () => regenerateClubEditCodeAction(club.slug),
      (result) => ({
        tone: "success",
        title: `${club.name} code regenerated`,
        body: result.message,
        code: result.editCode,
      }),
    );
  }

  function deleteClub(club: ManagedClub) {
    if (deleteCandidateSlug !== club.slug) {
      setDeleteCandidateSlug(club.slug);
      setNotice({
        tone: "warning",
        title: `Confirm deletion for ${club.name}`,
        body: "Click Confirm delete to permanently remove this club.",
      });
      return;
    }

    runAdminMutation(
      () => deleteClubAction(club.slug),
      (result) => ({
        tone: "warning",
        title: `${club.name} deleted`,
        body: result.message,
      }),
    );
    setDeleteCandidateSlug(null);
  }

  function runAdminMutation(
    action: () => Promise<AdminMutationResult>,
    createNotice: (result: Extract<AdminMutationResult, { ok: true }>) => ReviewNotice,
  ) {
    startTransition(async () => {
      const result = await action();

      if (!result.ok) {
        setNotice({
          tone: "warning",
          title: "Admin action failed",
          body: result.message,
        });
        return;
      }

      setDeleteCandidateSlug(null);
      setData(result.data);
      setNotice(createNotice(result));
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
              <Metric label="Total" value={data.clubs.length} />
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
                    isPending={isPending}
                    onNoteChange={(value) =>
                      setAdminNotes((current) => ({
                        ...current,
                        [request.id]: value,
                      }))
                    }
                    onApprove={() => approveRequest(request)}
                    onReject={() => rejectRequest(request)}
                  />
                )))
               : (
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

            <div className="mt-4 grid gap-3">
              <label
                htmlFor="admin-club-search"
                className="text-sm font-bold text-[var(--foreground)]"
              >
                Search clubs
              </label>
              <div className="flex h-11 items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--background)] px-3 transition focus-within:border-[var(--ucla-blue)]">
                <Search
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0 text-[var(--ucla-blue)]"
                />
                <input
                  id="admin-club-search"
                  data-admin-club-search
                  type="search"
                  value={clubSearchQuery}
                  onChange={(event) => setClubSearchQuery(event.target.value)}
                  placeholder="Name, category, email, location"
                  className="h-full min-w-0 flex-1 bg-transparent text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]"
                />
              </div>

              <div
                className="grid grid-cols-3 gap-2"
                aria-label="Filter existing clubs by visibility"
              >
                {clubVisibilityFilters.map((filter) => {
                  const isSelected = clubVisibilityFilter === filter.value;

                  return (
                    <button
                      key={filter.value}
                      type="button"
                      data-admin-club-filter={filter.value}
                      onClick={() => setClubVisibilityFilter(filter.value)}
                      className={`inline-flex min-h-10 items-center justify-center gap-1 rounded-lg border px-2 text-xs font-bold transition focus:outline-none focus:ring-2 focus:ring-[var(--ucla-blue)] focus:ring-offset-2 ${
                        isSelected
                          ? "border-[var(--ucla-blue)] bg-[var(--ucla-blue)] text-[var(--ucla-yellow)]"
                          : "border-[var(--line)] bg-[var(--background)] text-[var(--muted)] hover:border-[var(--ucla-blue)] hover:text-[var(--ucla-blue)]"
                      }`}
                    >
                      <span>{filter.label}</span>
                      <span aria-label={`${visibilityFilterCounts[filter.value]} clubs`}>
                        {visibilityFilterCounts[filter.value]}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div
                className="grid grid-cols-2 gap-2"
                aria-label="Filter existing clubs by freshness"
              >
                {clubFreshnessFilters.map((filter) => {
                  const isSelected = clubFreshnessFilter === filter.value;

                  return (
                    <button
                      key={filter.value}
                      type="button"
                      data-admin-club-freshness-filter={filter.value}
                      onClick={() => setClubFreshnessFilter(filter.value)}
                      className={`inline-flex min-h-10 items-center justify-center gap-1 rounded-lg border px-2 text-xs font-bold transition focus:outline-none focus:ring-2 focus:ring-[var(--ucla-blue)] focus:ring-offset-2 ${
                        isSelected
                          ? "border-[var(--ucla-blue)] bg-[var(--ucla-blue)] text-[var(--ucla-yellow)]"
                          : "border-[var(--line)] bg-[var(--background)] text-[var(--muted)] hover:border-[var(--ucla-blue)] hover:text-[var(--ucla-blue)]"
                      }`}
                    >
                      <span>{filter.label}</span>
                      <span aria-label={`${freshnessFilterCounts[filter.value]} clubs`}>
                        {freshnessFilterCounts[filter.value]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 grid max-h-[720px] gap-3 overflow-auto pr-1">
              {data.clubs.length === 0 ? (
                <div className="rounded-lg bg-[var(--surface-strong)] p-4 text-sm font-bold text-[var(--muted)]">
                  No clubs have been created yet.
                </div>
              ) : filteredManagedClubs.length > 0 ? (
                filteredManagedClubs.map((club) => (
                  <ManagedClubCard
                    key={club.slug}
                    club={club}
                    deleteCandidateSlug={deleteCandidateSlug}
                    isPending={isPending}
                    onHide={() => hideClub(club)}
                    onUnhide={() => unhideClub(club)}
                    onRegenerateCode={() => regenerateClubCode(club)}
                    onDelete={() => deleteClub(club)}
                  />
                ))
              ) : (
                <div className="rounded-lg bg-[var(--surface-strong)] p-4 text-sm font-bold text-[var(--muted)]">
                  No clubs match the current search and filters.
                </div>
              )}
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
  isPending,
  onNoteChange,
  onApprove,
  onReject,
}: {
  request: ClubRegistrationRequest;
  note: string;
  isPending: boolean;
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
          <p className="mt-2 text-sm font-bold text-[var(--ucla-blue)]">
            {categoryLabels[request.category]}
          </p>
          <div className="mt-2">
            {request.profileImageUrl ? (
              <img
                src={request.profileImageUrl}
                alt={`${request.clubName} profile image`}
                className="h-16 w-16 rounded-lg object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[var(--ucla-blue-soft)] font-display text-base font-extrabold text-[var(--ucla-blue-strong)]">
                {initials(request.clubName)}
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <span className="rounded-full bg-[var(--ucla-yellow-soft)] px-3 py-1 text-sm font-bold text-[oklch(0.35_0.1_73)]">
            pending
          </span>
          <button
            type="button"
            data-approve-request={request.id}
            onClick={onApprove}
            disabled={isPending}
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-[var(--ucla-blue)] px-3 text-xs font-bold text-[var(--ucla-yellow)] transition hover:bg-[var(--ucla-blue-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--ucla-blue)] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
            Approve
          </button>
          <button
            type="button"
            data-reject-request={request.id}
            onClick={onReject}
            disabled={isPending}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-[oklch(0.8_0.08_25)] bg-[oklch(0.96_0.035_25)] px-3 text-xs font-bold text-[var(--danger)] transition hover:bg-[oklch(0.94_0.05_25)] focus:outline-none focus:ring-2 focus:ring-[var(--danger)] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
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
          {formatLocation(request.meetingLocation)}
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
          disabled={isPending}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-[var(--ucla-blue)] px-4 text-sm font-bold text-[var(--ucla-yellow)] transition hover:bg-[var(--ucla-blue-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--ucla-blue)] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
          Approve
        </button>
        <button
          type="button"
          onClick={onReject}
          disabled={isPending}
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-[oklch(0.8_0.08_25)] bg-[oklch(0.96_0.035_25)] px-4 text-sm font-bold text-[var(--danger)] transition hover:bg-[oklch(0.94_0.05_25)] focus:outline-none focus:ring-2 focus:ring-[var(--danger)] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <XCircle aria-hidden="true" className="h-4 w-4" />
          Reject
        </button>
      </div>
    </article>
  );
}

function ManagedClubCard({
  club,
  deleteCandidateSlug,
  isPending,
  onHide,
  onUnhide,
  onRegenerateCode,
  onDelete,
}: {
  club: ManagedClub;
  deleteCandidateSlug: string | null;
  isPending: boolean;
  onHide: () => void;
  onUnhide: () => void;
  onRegenerateCode: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="rounded-lg border border-[var(--line)] bg-[var(--background)] p-3">
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
      <p className="truncate text-xs leading-5 text-[var(--muted)]">
        {club.contactInfo}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-[var(--surface-strong)] px-2 py-1 text-xs font-bold text-[var(--foreground)]">
          {clubStatusLabels[club.status]}
        </span>
        <span className="text-xs font-bold text-[var(--muted)]">
          {formatLastUpdated(club.lastEditedAt)}
        </span>
      </div>
      <div className="mt-3 grid gap-2">
        <button
          type="button"
          data-regenerate-club-code={club.slug}
          onClick={onRegenerateCode}
          disabled={isPending}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 text-xs font-bold text-[var(--foreground)] transition hover:border-[var(--ucla-blue)] hover:text-[var(--ucla-blue)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <KeyRound aria-hidden="true" className="h-4 w-4" />
          Regenerate code
        </button>
        <div className="flex gap-2">
          {club.visibilityState === "visible" ? (
            <button
              type="button"
              data-hide-club={club.slug}
              onClick={onHide}
              disabled={isPending}
              className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 text-xs font-bold text-[var(--foreground)] transition hover:border-[var(--ucla-blue)] hover:text-[var(--ucla-blue)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <EyeOff aria-hidden="true" className="h-4 w-4" />
              Hide
            </button>
          ) : (
            <button
              type="button"
              data-unhide-club={club.slug}
              onClick={onUnhide}
              disabled={isPending}
              className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-lg border border-[oklch(0.78_0.09_155)] bg-[oklch(0.96_0.035_155)] px-3 text-xs font-bold text-[oklch(0.31_0.1_155)] transition hover:bg-[oklch(0.94_0.045_155)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Eye aria-hidden="true" className="h-4 w-4" />
              Unhide
            </button>
          )}
          <button
            type="button"
            data-delete-club={club.slug}
            onClick={onDelete}
            disabled={isPending}
            className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-lg border border-[oklch(0.8_0.08_25)] bg-[oklch(0.96_0.035_25)] px-3 text-xs font-bold text-[var(--danger)] transition hover:bg-[oklch(0.94_0.05_25)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Trash2 aria-hidden="true" className="h-4 w-4" />
            {deleteCandidateSlug === club.slug ? "Confirm delete" : "Delete"}
          </button>
        </div>
      </div>
    </div>
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

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Building2,
  CalendarDays,
  MapPin,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  categories,
  categoryLabels,
  type Club,
  type ClubCategory,
} from "@/lib/clubs";
import {
  clubStatusLabels,
  formatLastUpdated,
} from "@/lib/clubFreshness";

type Filter = "all" | ClubCategory;

const statusTone: Record<Club["status"], string> = {
  fresh: "bg-[var(--ucla-blue-soft)] text-[var(--ucla-blue-strong)]",
  steady: "bg-[var(--ucla-yellow-soft)] text-[oklch(0.36_0.09_74)]",
  "needs update": "bg-[oklch(0.94_0.045_35)] text-[var(--danger)]",
};

export default function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

type ClubDirectoryProps = {
  clubs: Club[];
};

export function ClubDirectory({ clubs }: ClubDirectoryProps) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<Filter>("all");

  function categoryCount(filter: Filter) {
    if (filter === "all") {
      return clubs.length;
    }

    return clubs.filter((club) => club.category === filter).length;
  }

  const filteredClubs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return clubs
      .filter((club) => {
        const matchesCategory =
          activeCategory === "all" || club.category === activeCategory;
        const matchesQuery =
          normalizedQuery.length === 0 ||
          club.name.toLowerCase().includes(normalizedQuery);

        return matchesCategory && matchesQuery;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [activeCategory, query, clubs]);

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <section className="border-b border-[var(--line)] bg-[var(--surface)]">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_340px] lg:px-8 lg:py-10">
          <div className="flex flex-col justify-between gap-8">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--ucla-blue)] font-display text-lg font-extrabold text-[var(--ucla-yellow)]">
                BL
              </div>
              <div>
                <p className="font-display text-2xl font-bold text-[var(--foreground)]">
                  BruinLink
                </p>
                <p className="text-sm text-[var(--muted)]">
                  UCLA club discovery dashboard
                </p>
              </div>
            </div>

              <div className="max-w-3xl">
                <p className="mb-3 inline-flex rounded-full bg-[var(--ucla-yellow-soft)] px-3 py-1 text-sm font-bold text-[oklch(0.35_0.1_73)]">
                  Spring club directory
                </p>
                <h1 className="font-display text-4xl font-extrabold leading-tight text-[var(--foreground)] sm:text-5xl">
                  Find the right student organization before the next meeting.
                </h1>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href="/register"
                    className="inline-flex h-11 items-center gap-2 rounded-lg bg-[var(--ucla-blue)] px-4 text-sm font-bold !text-[var(--ucla-yellow)] transition hover:bg-[var(--ucla-blue-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--ucla-blue)] focus:ring-offset-2"
                  >
                    <Building2 aria-hidden="true" className="h-4 w-4" />
                    Register a club
                  </Link>
                  <Link
                    href="/admin"
                    className="inline-flex h-11 items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--background)] px-4 text-sm font-bold text-[var(--foreground)] transition hover:border-[var(--ucla-blue)] hover:text-[var(--ucla-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--ucla-blue)] focus:ring-offset-2"
                  >
                    <ShieldCheck aria-hidden="true" className="h-4 w-4" />
                    Admin
                  </Link>
                </div>
              </div>
            </div>

          <div className="grid grid-cols-3 gap-3 lg:grid-cols-1">
            <div className="rounded-lg border border-[var(--line)] bg-[var(--surface-strong)] p-4">
              <p className="text-sm font-bold text-[var(--muted)]">Clubs</p>
              <p className="mt-1 font-display text-3xl font-extrabold text-[var(--ucla-blue-strong)]">
                {clubs.length}
              </p>
            </div>
            <div className="rounded-lg border border-[var(--line)] bg-[var(--surface-strong)] p-4">
              <p className="text-sm font-bold text-[var(--muted)]">Categories</p>
              <p className="mt-1 font-display text-3xl font-extrabold text-[var(--ucla-blue-strong)]">
                {categories.length}
              </p>
            </div>
            <div className="rounded-lg border border-[var(--line)] bg-[var(--surface-strong)] p-4">
              <p className="text-sm font-bold text-[var(--muted)]">Showing</p>
              <p className="mt-1 font-display text-3xl font-extrabold text-[var(--ucla-blue-strong)]">
                {filteredClubs.length}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
          <aside className="self-start rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4 lg:sticky lg:top-6">
            <label
              htmlFor="club-search"
              className="text-sm font-bold text-[var(--foreground)]"
            >
              Search
            </label>
            <div className="mt-2 flex h-12 items-center gap-3 rounded-lg border border-[var(--line)] bg-[var(--background)] px-3 focus-within:border-[var(--ucla-blue)]">
              <Search aria-hidden="true" className="h-5 w-5 text-[var(--muted)]" />
              <input
                id="club-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Club name"
                className="h-full min-w-0 flex-1 bg-transparent text-base text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]"
              />
            </div>

            <div className="mt-6">
              <p className="text-sm font-bold text-[var(--foreground)]">
                Category
              </p>
              <div className="mt-3 grid gap-2">
                <button
                  type="button"
                  onClick={() => setActiveCategory("all")}
                  className={`flex h-11 items-center justify-between rounded-lg border px-3 text-left text-sm font-bold transition ${
                    activeCategory === "all"
                      ? "border-[var(--ucla-blue)] bg-[var(--ucla-blue)] text-[var(--ucla-yellow)]"
                      : "border-[var(--line)] bg-[var(--background)] text-[var(--foreground)] hover:border-[var(--ucla-blue)]"
                  }`}
                >
                  <span>All</span>
                  <span>{categoryCount("all")}</span>
                </button>

                {categories.map((category) => (
                  <button
                    type="button"
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`flex h-11 items-center justify-between rounded-lg border px-3 text-left text-sm font-bold transition ${
                      activeCategory === category
                        ? "border-[var(--ucla-blue)] bg-[var(--ucla-blue)] text-[var(--ucla-yellow)]"
                        : "border-[var(--line)] bg-[var(--background)] text-[var(--foreground)] hover:border-[var(--ucla-blue)]"
                    }`}
                  >
                    <span>{categoryLabels[category]}</span>
                    <span>{categoryCount(category)}</span>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <div className="grid gap-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-[var(--muted)]">
                  {activeCategory === "all"
                    ? "All categories"
                    : categoryLabels[activeCategory]}
                </p>
                <h2 className="font-display text-2xl font-extrabold text-[var(--foreground)]">
                  {filteredClubs.length === 1
                    ? "1 club"
                    : `${filteredClubs.length} clubs`}
                </h2>
              </div>
              <p className="rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-1 text-sm font-bold text-[var(--muted)]">
                A to Z
              </p>
            </div>

            {filteredClubs.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {filteredClubs.map((club) => (
                  <Link
                    key={club.slug}
                    href={`/clubs/${club.slug}`}
                    className="group flex min-h-[292px] flex-col justify-between rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4 transition hover:-translate-y-0.5 hover:border-[var(--ucla-blue)] hover:shadow-[0_18px_42px_oklch(0.35_0.09_252_/_0.14)] focus:outline-none focus:ring-2 focus:ring-[var(--ucla-blue)]"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[var(--ucla-blue-soft)] font-display text-base font-extrabold text-[var(--ucla-blue-strong)]">
                            {initials(club.name)}
                          </div>
                          <div className="min-w-0">
                            <p className="line-clamp-2 font-display text-xl font-extrabold leading-snug text-[var(--foreground)]">
                              {club.name}
                            </p>
                            <p className="mt-1 text-sm font-bold text-[var(--ucla-blue)]">
                              {categoryLabels[club.category]}
                            </p>
                          </div>
                        </div>
                        <ArrowUpRight
                          aria-hidden="true"
                          className="h-5 w-5 shrink-0 text-[var(--muted)] transition group-hover:text-[var(--ucla-blue)]"
                        />
                      </div>

                      <p className="mt-4 line-clamp-3 text-base leading-7 text-[var(--muted)]">
                        {club.shortDescription}
                      </p>
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-3">
                      <div className="flex min-w-0 items-center gap-2 text-sm text-[var(--muted)]">
                        <CalendarDays
                          aria-hidden="true"
                          className="h-4 w-4 shrink-0 text-[var(--ucla-blue)]"
                        />
                        <span className="min-w-0 truncate">{club.meetingTime}</span>
                      </div>
                      <div className="flex min-w-0 items-center gap-2 text-sm text-[var(--muted)]">
                        <MapPin
                          aria-hidden="true"
                          className="h-4 w-4 shrink-0 text-[var(--ucla-blue)]"
                        />
                        <span className="min-w-0 truncate">{club.location}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2 pt-2">
                        <div className="min-w-0">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${statusTone[club.status]}`}
                          >
                            {clubStatusLabels[club.status]}
                          </span>
                          <p className="mt-2 truncate text-xs font-bold text-[var(--muted)]">
                            {formatLastUpdated(club.lastEditedAt)}
                          </p>
                        </div>
                        <span className="flex items-center gap-1 text-sm font-bold text-[var(--foreground)]">
                          <Users
                            aria-hidden="true"
                            className="h-4 w-4 text-[var(--ucla-blue)]"
                          />
                          {club.members}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-8 text-center">
                <p className="font-display text-2xl font-extrabold text-[var(--foreground)]">
                  No clubs found
                </p>
                <p className="mx-auto mt-2 max-w-md text-base leading-7 text-[var(--muted)]">
                  Try a different name or category.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

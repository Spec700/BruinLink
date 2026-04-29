import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Mail,
  MapPin,
  Pencil,
  Users,
} from "lucide-react";
import { categories, categoryLabels, clubs, getClubBySlug } from "@/lib/clubs";

type ClubPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const statusCopy = {
  fresh: "Recently updated",
  steady: "Current",
  "needs update": "Needs attention",
};

export function generateStaticParams() {
  return clubs.map((club) => ({
    slug: club.slug,
  }));
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default async function ClubDashboardPage({ params }: ClubPageProps) {
  const { slug } = await params;
  const club = getClubBySlug(slug);

  if (!club) {
    notFound();
  }

  const siblingClubs = clubs
    .filter((candidate) => candidate.category === club.category)
    .filter((candidate) => candidate.slug !== club.slug)
    .slice(0, 3);

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

          <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
            <div className="flex flex-col gap-5">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-[var(--ucla-blue)] font-display text-2xl font-extrabold text-[var(--ucla-yellow)]">
                  {initials(club.name)}
                </div>
                <div>
                  <p className="mb-2 inline-flex rounded-full bg-[var(--ucla-yellow-soft)] px-3 py-1 text-sm font-bold text-[oklch(0.35_0.1_73)]">
                    {categoryLabels[club.category]}
                  </p>
                  <h1 className="font-display text-4xl font-extrabold leading-tight text-[var(--foreground)] sm:text-5xl">
                    {club.name}
                  </h1>
                </div>
              </div>
              <p className="max-w-3xl text-lg leading-8 text-[var(--muted)]">
                {club.shortDescription}
              </p>
            </div>

            <div className="rounded-lg border border-[var(--line)] bg-[var(--surface-strong)] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-[var(--muted)]">
                    Dashboard status
                  </p>
                  <p className="mt-1 font-display text-2xl font-extrabold text-[var(--ucla-blue-strong)]">
                    {statusCopy[club.status]}
                  </p>
                </div>
                <CheckCircle2
                  aria-hidden="true"
                  className="h-8 w-8 text-[var(--success)]"
                />
              </div>
              <div className="mt-5 grid gap-3 text-sm text-[var(--muted)]">
                <div className="flex items-center gap-2">
                  <CalendarDays
                    aria-hidden="true"
                    className="h-4 w-4 text-[var(--ucla-blue)]"
                  />
                  <span>{club.meetingTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin
                    aria-hidden="true"
                    className="h-4 w-4 text-[var(--ucla-blue)]"
                  />
                  <span>{club.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users
                    aria-hidden="true"
                    className="h-4 w-4 text-[var(--ucla-blue)]"
                  />
                  <span>{club.members} listed members</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail
                    aria-hidden="true"
                    className="h-4 w-4 text-[var(--ucla-blue)]"
                  />
                  <span className="min-w-0 truncate">{club.contactInfo}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:px-8">
        <div className="grid gap-4">
          <article className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-[var(--muted)]">Profile</p>
                <h2 className="mt-1 font-display text-2xl font-extrabold text-[var(--foreground)]">
                  About
                </h2>
              </div>
              <Pencil aria-hidden="true" className="h-5 w-5 text-[var(--ucla-blue)]" />
            </div>
            <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--muted)]">
              {club.about}
            </p>
          </article>

          <div className="grid gap-4 md:grid-cols-2">
            <article className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-5">
              <p className="text-sm font-bold text-[var(--muted)]">Section</p>
              <h2 className="mt-1 font-display text-2xl font-extrabold text-[var(--foreground)]">
                Upcoming Events
              </h2>
              <p className="mt-4 text-base leading-8 text-[var(--muted)]">
                {club.upcomingEvents}
              </p>
            </article>

            <article className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-5">
              <p className="text-sm font-bold text-[var(--muted)]">Section</p>
              <h2 className="mt-1 font-display text-2xl font-extrabold text-[var(--foreground)]">
                Announcements
              </h2>
              <p className="mt-4 text-base leading-8 text-[var(--muted)]">
                {club.announcements}
              </p>
            </article>
          </div>

          <article className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-5">
            <p className="text-sm font-bold text-[var(--muted)]">Public page</p>
            <h2 className="mt-1 font-display text-2xl font-extrabold text-[var(--foreground)]">
              Contact Information
            </h2>
            <p className="mt-4 text-base leading-8 text-[var(--muted)]">
              {club.contactInfo}
            </p>
          </article>
        </div>

        <aside className="grid self-start gap-4 lg:sticky lg:top-6">
          <section className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-5">
            <p className="text-sm font-bold text-[var(--muted)]">
              Category index
            </p>
            <div className="mt-4 grid gap-2">
              {categories.map((category) => (
                <div
                  key={category}
                  className={`flex h-10 items-center justify-between rounded-lg px-3 text-sm font-bold ${
                    category === club.category
                      ? "bg-[var(--ucla-blue)] text-[var(--ucla-yellow)]"
                      : "bg-[var(--surface-strong)] text-[var(--muted)]"
                  }`}
                >
                  <span>{categoryLabels[category]}</span>
                  <span>
                    {
                      clubs.filter((candidate) => candidate.category === category)
                        .length
                    }
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-5">
            <p className="text-sm font-bold text-[var(--muted)]">
              Same category
            </p>
            <div className="mt-4 grid gap-3">
              {siblingClubs.map((sibling) => (
                <Link
                  key={sibling.slug}
                  href={`/clubs/${sibling.slug}`}
                  className="rounded-lg bg-[var(--surface-strong)] p-3 transition hover:bg-[var(--ucla-blue-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--ucla-blue)]"
                >
                  <p className="font-bold text-[var(--foreground)]">
                    {sibling.name}
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm leading-6 text-[var(--muted)]">
                    {sibling.shortDescription}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}

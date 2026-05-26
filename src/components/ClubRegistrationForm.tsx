"use client";

import  initials  from "./ClubDirectory"

import Link from "next/link";
import {
  ArrowUpRight,
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  Mail,
  MapPin,
  Send,
  UserRound,
} from "lucide-react";
import { use, useEffect, useMemo, useState, useTransition } from "react";
import { submitClubRegistration } from "@/app/register/actions";
import { categories, categoryLabels, type ClubCategory } from "@/lib/clubs";

import {
  initialRegistrationInput,
  registrationFieldLabels,
  validateRegistrationInput,
  type ClubRegistrationInput,
  type RegistrationErrors,
  type LocationData
} from "@/lib/clubRegistration";

type FieldName = keyof ClubRegistrationInput;

type ClubPreview = {
  name: string;
  category: ClubCategory | "";
  shortDescription: string;
  meetingTime: string;
  location: LocationData | null;
  members: number;
  status: string;
  lastEditedAt: string;
  profileImage: File | null;
};

type ModalProps = { 
  previewClub: ClubPreview | null;
  isPending: boolean;
  onClose: () => void;
  onConfirm: () => void;
};


type SubmittedRequest = {
  clubName: string;
  category: string;
};

export function ClubRegistrationForm() {
  const [form, setForm] = useState<ClubRegistrationInput>(
    initialRegistrationInput,
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<RegistrationErrors>({});
  const [submittedRequest, setSubmittedRequest] =
    useState<SubmittedRequest | null>(null);
  const [submitMessage, setSubmitMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const [previewClub, setPreviewClub] = useState<ClubPreview | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const hasErrors = useMemo(() => Object.keys(errors).length > 0, [errors]);


  function updateField(field: FieldName, value: any) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
    setSubmitMessage("");

    setErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const nextErrors = { ...current };
      delete nextErrors[field];
      return nextErrors;
    });
  }

  function resetForm(){
    setForm(initialRegistrationInput);
    setPreviewUrl(null);
    setErrors({});
    setSubmitMessage("");
    setPreviewClub(null);
  }

  function processRegistration() {
    const result = validateRegistrationInput(form);

    if (!result.ok) {
      setSubmittedRequest(null);
      setErrors(result.errors);
      setSubmitMessage("Check the highlighted fields and submit again.");
      return;
    }
    setErrors({});
    setSubmitMessage("");
    setPreviewClub({
      name: form.clubName,
      category: form.category,
      shortDescription: form.shortDescription,
      meetingTime: form.meetingTime,
      location: form.meetingLocation,
      members: Number(form.memberCount || 0),
      status: "preview",
      lastEditedAt: new Date().toISOString(),
      profileImage: form.profileImage,
    });

    setShowPreview(true)
  }

  function handleConfirmSubmit(){
    startTransition(async () => {
      const submitResult = await submitClubRegistration(form);
      if (!submitResult.ok) {
        setErrors(submitResult.errors ?? {});
        setSubmitMessage(submitResult.message);
        setShowPreview(false); // drop back to form with errors visible
        return;
      }
      setSubmittedRequest({
        clubName: form.clubName,
        category: form.category,
      });
      setShowPreview(false);
      resetForm();
    });
  }

  return (
    <main className="min-h-screen bg-[var(--background)]">
      {showPreview && (
        <Modal
          previewClub={previewClub}
          isPending={isPending}
          onClose={() => setShowPreview(false)}
          onConfirm={handleConfirmSubmit}
        />
      )}
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
                Club registration
              </p>
              <h1 className="font-display text-4xl font-extrabold leading-tight text-[var(--foreground)] sm:text-5xl">
                Request a new BruinLink listing.
              </h1>
              <p className="mt-4 max-w-3xl text-lg leading-8 text-[var(--muted)]">
                Submitted clubs enter admin review before they appear in the
                public directory.
              </p>
            </div>

            <div className="rounded-lg border border-[var(--line)] bg-[var(--surface-strong)] p-4">
              <p className="text-sm font-bold text-[var(--muted)]">Review path</p>
              <div className="mt-4 grid gap-3 text-sm font-bold text-[var(--foreground)]">
                <div className="flex items-center gap-2">
                  <Building2
                    aria-hidden="true"
                    className="h-4 w-4 text-[var(--ucla-blue)]"
                  />
                  Pending request
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2
                    aria-hidden="true"
                    className="h-4 w-4 text-[var(--success)]"
                  />
                  Admin approval
                </div>
                <div className="flex items-center gap-2">
                  <Mail
                    aria-hidden="true"
                    className="h-4 w-4 text-[var(--ucla-blue)]"
                  />
                  Edit code distribution
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:px-8">
        <form
          onSubmit={handleConfirmSubmit}
          className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-5"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-[var(--muted)]">
                Required information
              </p>
              <h2 className="mt-1 font-display text-2xl font-extrabold text-[var(--foreground)]">
                Club request
              </h2>
            </div>
          </div>

          <div className="mt-6 grid gap-5">
            <fieldset className="grid gap-4">
              <legend className="flex items-center gap-2 font-display text-xl font-extrabold text-[var(--foreground)]">
                <UserRound
                  aria-hidden="true"
                  className="h-5 w-5 text-[var(--ucla-blue)]"
                />
                Responsible contact
              </legend>
              <div className="grid gap-4 md:grid-cols-2">
                <TextInput
                  name="requesterName"
                  value={form.requesterName}
                  error={errors.requesterName}
                  onChange={updateField}
                />
                <TextInput
                  name="requesterEmail"
                  value={form.requesterEmail}
                  error={errors.requesterEmail}
                  onChange={updateField}
                  type="email"
                />
              </div>
            </fieldset>

            <fieldset className="grid gap-4 border-t border-[var(--line)] pt-5">
              <legend className="flex items-center gap-2 font-display text-xl font-extrabold text-[var(--foreground)]">
                <Building2
                  aria-hidden="true"
                  className="h-5 w-5 text-[var(--ucla-blue)]"
                />
                Public club profile
              </legend>

              <div className="grid gap-6 md:grid-cols-2">
            
              <div className="flex flex-col gap-5">
                <TextInput
                  name="clubName"
                  value={form.clubName}
                  error={errors.clubName}
                  onChange={updateField}
                />

              
              <ImageUpload
                name="profileImage"
                value = {form.profileImage}
                error={errors.profileImage}
                onChange={(file) => {
                  setForm((current) => ({
                    ...current,
                    profileImage: file,
                  }));

                  if (!file) {
                    setPreviewUrl(null);
                    return;
                  }

                  setPreviewUrl(URL.createObjectURL(file));
                }}
              />


   
              <div className="flex items-center gap-3">
                <div className="relative h-12 w-12 overflow-hidden rounded-lg">
                  {!previewUrl ? (
                    <div className="flex h-full w-full items-center justify-center bg-[var(--ucla-blue-soft)] font-display text-base font-extrabold text-[var(--ucla-blue-strong)]">
                      {initials(form.clubName || "Club")}
                    </div>
                  ) : (
                    <img
                      src={previewUrl}
                      alt="Club profile preview"
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>

              <div>
                <p className="text-sm font-bold text-[var(--foreground)]">
                  Profile preview
                </p>
                <p className="text-xs text-[var(--muted)]">
                  This is how your club icon will appear.
                </p>
              </div>
            </div>
          </div>


          <div className="flex flex-col gap-3">
            <p className="text-sm font-bold text-[var(--foreground)]">
              {registrationFieldLabels.category}
            </p>

            <div className="grid grid-cols-2 gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  data-category={category}
                  onClick={() => updateField("category", category)}
                  className={`h-11 rounded-lg border px-3 text-left text-sm font-bold transition focus:outline-none focus:ring-2 focus:ring-[var(--ucla-blue)] ${
                    form.category === category
                      ? "border-[var(--ucla-blue)] bg-[var(--ucla-blue)] text-[var(--ucla-yellow)]"
                      : "border-[var(--line)] bg-[var(--background)] text-[var(--foreground)] hover:border-[var(--ucla-blue)]"
                  }`}
                >
                  {categoryLabels[category]}
                </button>
              ))}
            </div>

            <FieldError message={errors.category} />
             <TextInput
                name="memberCount"
                value={form.memberCount}
                error={errors.memberCount}
                onChange={updateField}
          />
          </div>
        </div>

              <TextInput
                name="shortDescription"
                value={form.shortDescription}
                error={errors.shortDescription}
                onChange={updateField}
              />

              <Textarea
                name="about"
                value={form.about}
                error={errors.about}
                onChange={updateField}
              />
            </fieldset>

            <fieldset className="grid gap-4 border-t border-[var(--line)] pt-5">
              <legend className="flex items-center gap-2 font-display text-xl font-extrabold text-[var(--foreground)]">
                <CalendarDays
                  aria-hidden="true"
                  className="h-5 w-5 text-[var(--ucla-blue)]"
                />
                Meeting details
              </legend>
              <div className="grid gap-4 md:grid-cols-2">
                <TextInput
                  name="meetingTime"
                  value={form.meetingTime}
                  error={errors.meetingTime}
                  onChange={updateField}
                  icon={<CalendarDays aria-hidden="true" className="h-4 w-4" />}
                />
                <LocationAutocomplete
                  name="meetingLocation"
                  value={form.meetingLocation}
                  error={errors.meetingLocation}
                  onChange={updateField}
                  icon={<MapPin aria-hidden="true" className="h-4 w-4" />}
                />
              </div>
              <TextInput
                name="publicContactEmail"
                value={form.publicContactEmail}
                error={errors.publicContactEmail}
                onChange={updateField}
                type="email"
                icon={<Mail aria-hidden="true" className="h-4 w-4" />}
              />
            </fieldset>

            <div className="grid gap-4 border-t border-[var(--line)] pt-5">
              {submittedRequest ? 
              (
                <div className="rounded-lg border border-[oklch(0.78_0.09_155)] bg-[oklch(0.96_0.035_155)] p-4 text-[oklch(0.31_0.1_155)]">
                  <p className="flex items-center gap-2 font-bold">
                    <CheckCircle2 aria-hidden="true" className="h-5 w-5" />
                    {submittedRequest.clubName} is ready for admin review.
                  </p>
                  <p className="mt-2 text-sm leading-6">
                    Category: {submittedRequest.category}. The listing remains
                    unpublished until an admin approves it.
                  </p>
                </div>
              ) : null}

              {hasErrors ? (
                <div className="rounded-lg border border-[oklch(0.8_0.08_25)] bg-[oklch(0.96_0.035_25)] p-4 text-[var(--danger)]">
                  <p className="font-bold">Some fields need attention.</p>
                  <p className="mt-1 text-sm leading-6">
                    {submitMessage ||
                      "Check the highlighted fields and submit again."}
                  </p>
                </div>
              ) : null}

              {submitMessage && !hasErrors ? (
                <div className="rounded-lg border border-[oklch(0.8_0.08_25)] bg-[oklch(0.96_0.035_25)] p-4 text-[var(--danger)]">
                  <p className="font-bold">Could not submit request.</p>
                  <p className="mt-1 text-sm leading-6">{submitMessage}</p>
                </div>
              ) : null}

              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="max-w-md text-sm leading-6 text-[var(--muted)]">
                  Approved requests receive a generated edit code from an admin.
                </p>
                <button
                  type="button"
                  data-submit-registration-bottom="true"
                  onClick={processRegistration}
                  disabled={isPending}
                  className="inline-flex h-11 items-center gap-2 rounded-lg bg-[var(--ucla-blue)] px-4 text-sm font-bold text-[var(--ucla-yellow)] transition hover:bg-[var(--ucla-blue-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--ucla-blue)] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Send aria-hidden="true" className="h-4 w-4" />
                  {isPending ? "Submitting" : "Submit request"}
                </button>
              </div>
            </div>
          </div>
        </form>

        <aside className="grid self-start gap-4 lg:sticky lg:top-6">
          <section className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-5">
            <p className="text-sm font-bold text-[var(--muted)]">Admin review</p>
            <h2 className="mt-1 font-display text-2xl font-extrabold text-[var(--foreground)]">
              What happens next
            </h2>
            <div className="mt-4 grid gap-3 text-sm leading-6 text-[var(--muted)]">
              <p>
                Requests stay hidden from the public directory until an admin
                approves them.
              </p>
              <p>
                Approved clubs receive a unique edit code that admins can share
                with the responsible contact.
              </p>
            </div>
          </section>

          <section className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-5">
            <p className="text-sm font-bold text-[var(--muted)]">Categories</p>
            <div className="mt-4 grid gap-2">
              {categories.map((category) => (
                <div
                  key={category}
                  className="rounded-lg bg-[var(--surface-strong)] px-3 py-2 text-sm font-bold text-[var(--foreground)]"
                >
                  {categoryLabels[category]}
                </div>
              ))}
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}

function ImageUpload({
  name,
  value,
  error,
  onChange,
}: {
  name: FieldName;
  value: File | null;
  error?: string;
  onChange: (file: File | null) => void;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="text-sm font-bold text-[var(--foreground)]"
      >
        {registrationFieldLabels.profileImage}
      </label>

      <input
        id={name}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={(event) => {
          const file = event.target.files?.[0] ?? null;
          onChange(file);
        }}
        className="mt-2 block w-full text-sm"
      />

      <FieldError message={error} />
    </div>
  );
}



function LocationAutocomplete({
  name,
  value,
  error,
  onChange,
  icon,
  }: {
    name: FieldName;
    value: LocationData | null;
    error?: string;
    icon?: React.ReactNode;
    onChange: (
      name: FieldName,
      value: LocationData | null
    ) => void;
  }) {
  /* The query is what */
  const [query, setQuery] = useState(
      value
        ? [value.name, value.city, value.state, value.country]
            .filter(Boolean)
            .join(", ")
        : ""
    );
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  

  useEffect(() => {
    if (query.length < 3) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setLoading(true);

        const res = await fetch(
          `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5`
        );

        const data = await res.json();
        setResults(data.features || []);
       
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  const handleSelect = (feature: any) => {
  const props = feature.properties;

  const location: LocationData = {
    name: props.name,
    city: props.city,
    state: props.state,
    country: props.country,
  };

  const label = [
    location.name,
    location.city,
    location.state,
    location.country,
  ]
    .filter(Boolean)
    .join(", ");

  setQuery(label);
  setResults([]);

  onChange(name, location);
};

  return (
    <div>
      <label 
        htmlFor={name}
        className="text-sm font-bold text-[var(--foreground)]">
        {registrationFieldLabels.meetingLocation}
      </label>
      <div style={{ position: "relative" }} className={`mt-2 flex h-12 items-center gap-3 rounded-lg border bg-[var(--background)] px-3 transition focus-within:border-[var(--ucla-blue)] ${
          error ? "border-[var(--danger)]" : "border-[var(--line)]"
        }`}>
        {icon ? (
          <span className="text-[var(--ucla-blue)]">{icon}</span>
        ) : null}

        <input
          type="text"
          name={name}
          value={query}
          onChange={(e) => {
          setQuery(e.target.value);
          onChange(name, null);
        }}
          className="h-full min-w-0 flex-1 bg-transparent text-base text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]"
        />
      </div>

      

      {results.length > 0 && (
        <div
          style={{
            background: "white",
            border: "1px solid #ddd",
            borderTop: "none",
            fontFamily: "Freeman, sans-serif",
            zIndex: 1000,
            maxHeight: 250,
            overflowY: "auto",
            position: "absolute",
          }}
          className="flex-1"
        >
          {results.map((feature, index) => {
            const props = feature.properties;

            const label = [props.name, props.city, props.state, props.country]
              .filter(Boolean)
              .join(", ");

            return (
              <div
                key={index}
                onClick={() => handleSelect(feature)}
                style={{
                  padding: "12px",
                  cursor: "pointer",
                  borderBottom: "1px solid #eee",
                  color: "#3A5186",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#3A5186";
                  e.currentTarget.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "white";
                  e.currentTarget.style.color = "#3A5186";
                }}
              >
                {label}
              </div>
            );
          })}
        </div>
      )}

      {loading && <div style={{ marginTop: 8 }}>Searching...</div>}
      <FieldError message={error} />
    </div>
  );
}

function TextInput({
  name,
  value,
  error,
  onChange,
  type = "text",
  icon,
}: {
  name: FieldName;
  value: string;
  error?: string;
  onChange: (name: FieldName, value: string) => void;
  type?: "email" | "text";
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="text-sm font-bold text-[var(--foreground)]"
      >
        {registrationFieldLabels[name]}
      </label>
      <div
        className={`mt-2 flex h-12 items-center gap-3 rounded-lg border bg-[var(--background)] px-3 transition focus-within:border-[var(--ucla-blue)] ${
          error ? "border-[var(--danger)]" : "border-[var(--line)]"
        }`}
      >
        {icon ? (
          <span className="text-[var(--ucla-blue)]">{icon}</span>
        ) : null}
        <input
          id={name}
          type={type}
          value={value}
          onChange={(event) => onChange(name, event.target.value)}
          className="h-full min-w-0 flex-1 bg-transparent text-base text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]"
        />
      </div>
      <FieldError message={error} />
    </div>
  );
}

function Textarea({
  name,
  value,
  error,
  onChange,
}: {
  name: FieldName;
  value: string;
  error?: string;
  onChange: (name: FieldName, value: string) => void;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="text-sm font-bold text-[var(--foreground)]"
      >
        {registrationFieldLabels[name]}
      </label>
      <textarea
        id={name}
        value={value}
        onChange={(event) => onChange(name, event.target.value)}
        rows={5}
        className={`mt-2 w-full resize-y rounded-lg border bg-[var(--background)] px-3 py-3 text-base leading-7 text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--ucla-blue)] ${
          error ? "border-[var(--danger)]" : "border-[var(--line)]"
        }`}
      />
      <FieldError message={error} />
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-2 text-sm font-bold text-[var(--danger)]">{message}</p>;
}

function Modal({
  previewClub,
  isPending,
  onClose,
  onConfirm,
}: ModalProps) {
  if (!previewClub) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-xl rounded-lg bg-[var(--surface)] p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-extrabold text-[var(--foreground)]">
            Preview your listing
          </h2>
          <button onClick={onClose} className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]">
            ✕
          </button>
        </div>

        <ClubCardPreview club={previewClub} />

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-[var(--line)] px-4 py-2 text-sm font-bold text-[var(--foreground)] hover:border-[var(--ucla-blue)]"
          >
            Continue editing
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-[var(--ucla-blue)] px-4 text-sm font-bold text-[var(--ucla-yellow)] hover:bg-[var(--ucla-blue-strong)] disabled:opacity-60"
          >
            <Send className="h-4 w-4" aria-hidden />
            {isPending ? "Submitting…" : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}
  

function ClubCardPreview({ club }: {club: ClubPreview | null}) {
  if(!club){
    return(
      <div>Unable to produce card</div>
    );
  }const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!club?.profileImage) { setObjectUrl(null); return; }
    const url = URL.createObjectURL(club.profileImage);
    setObjectUrl(url);
    return () => URL.revokeObjectURL(url); // cleaned up on unmount
  }, [club?.profileImage]);

  if (!club) return <div>Unable to produce card</div>;

  return (
    <div className="flex min-h-[292px] flex-col justify-between rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4">
      <div className="flex items-start gap-3">
        {objectUrl ? (
          <img src={objectUrl} className="h-12 w-12 rounded-lg object-cover" alt="" />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--ucla-blue-soft)] font-extrabold text-[var(--ucla-blue-strong)]">
            {initials(club.name)}
          </div>
        )}
        <div>
          <p className="font-display text-xl font-extrabold">{club.name}</p>
          <p className="text-sm font-bold text-[var(--ucla-blue)]">
            {categoryLabels[club.category as ClubCategory] ?? club.category}
          </p>
        </div>
        <ArrowUpRight
            aria-hidden="true"
            className="h-5 w-5 shrink-0 text-[var(--muted)] transition group-hover:text-[var(--ucla-blue)]"
        />
      </div>
      <p className="mt-4 text-[var(--muted)]">{club.shortDescription}</p>
      <div className="mt-5 text-sm text-[var(--muted)]">
        {club.meetingTime} •{" "}
        {club.location
          ? [club.location.name, club.location.city, club.location.state].filter(Boolean).join(", ")
          : "No location"}
      </div>
    </div>
  );
}
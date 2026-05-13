"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { useAuth } from "./AuthProvider";

type ClubOption = { slug: string; name: string };

export function SignInModal({
  clubs,
  onClose,
}: {
  clubs: ClubOption[];
  onClose: () => void;
}) {
  const { signIn } = useAuth();
  const [selectedSlug, setSelectedSlug] = useState(clubs[0]?.slug ?? "");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    pinRef.current?.focus();
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn(selectedSlug, pin);

    setLoading(false);

    if (result.ok) {
      onClose();
      window.location.reload();
    } else {
      setError(result.error ?? "Sign-in failed.");
    }
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[oklch(0.15_0.03_255_/_0.55)] backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="relative mx-4 w-full max-w-md rounded-xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-[var(--muted)] transition hover:text-[var(--foreground)]"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="font-display text-2xl font-extrabold text-[var(--foreground)]">
          Club Sign In
        </h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Select your club and enter your 4-digit PIN.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-5">
          <div>
            <label
              htmlFor="club-select"
              className="text-sm font-bold text-[var(--foreground)]"
            >
              Club
            </label>
            <select
              id="club-select"
              value={selectedSlug}
              onChange={(e) => setSelectedSlug(e.target.value)}
              className="mt-2 h-12 w-full rounded-lg border border-[var(--line)] bg-[var(--background)] px-3 text-base text-[var(--foreground)] outline-none focus:border-[var(--ucla-blue)]"
            >
              {clubs.map((club) => (
                <option key={club.slug} value={club.slug}>
                  {club.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="pin-input"
              className="text-sm font-bold text-[var(--foreground)]"
            >
              4-Digit PIN
            </label>
            <input
              ref={pinRef}
              id="pin-input"
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, "").slice(0, 4);
                setPin(digits);
              }}
              placeholder="0000"
              className="mt-2 h-12 w-full rounded-lg border border-[var(--line)] bg-[var(--background)] px-3 text-center font-display text-2xl tracking-[0.3em] text-[var(--foreground)] outline-none focus:border-[var(--ucla-blue)] placeholder:text-[var(--muted)] placeholder:tracking-[0.3em]"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-[oklch(0.94_0.045_35)] px-3 py-2 text-sm font-bold text-[var(--danger)]">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || pin.length < 4}
            className="flex h-12 items-center justify-center rounded-lg bg-[var(--ucla-blue)] font-display text-base font-bold text-[var(--ucla-yellow)] transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

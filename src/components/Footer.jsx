import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-15 border-t border-[var(--line)] bg-[var(--surface)]">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-center gap-4 px-6 py-8 text-center">
        
        <div className="max-w-xl">

          <h2 className="font-display text-3xl font-black leading-tight text-[var(--foreground)] md:text-3xl">
            Interested in registering your club?
          </h2>

          <p className="mt-3 text-base text-[var(--muted)]">
            Start the application process today.
          </p>
        </div>

        <Link
          href="/register-club"
          className="
            rounded-2xl
            bg-[var(--ucla-blue)]
            px-7
            py-4
            font-semibold
            !text-white
            shadow-sm
            transition-all
            duration-200
            hover:-translate-y-0.5
            hover:bg-[var(--ucla-blue-strong)]
            hover:shadow-md
            "
        >
          Start Here →
        </Link>
      </div>
    </footer>
  );
}
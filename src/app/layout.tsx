import type { Metadata } from "next";
import { Atkinson_Hyperlegible, Saira } from "next/font/google";
import { cookies } from "next/headers";
import { AuthProvider } from "@/components/AuthProvider";
import { fetchClubBySlug } from "@/lib/clubs";
import "./globals.css";

const display = Saira({
  variable: "--font-saira",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const body = Atkinson_Hyperlegible({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "BruinLink",
  description: "A UCLA club discovery and dashboard prototype.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const sessionSlug = cookieStore.get("club_session")?.value ?? null;

  let clubName: string | null = null;
  if (sessionSlug) {
    const club = await fetchClubBySlug(sessionSlug);
    clubName = club?.name ?? null;
  }

  return (
    <html lang="en" className={`${display.variable} ${body.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        <AuthProvider initialSlug={sessionSlug} initialClubName={clubName}>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

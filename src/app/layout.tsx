import type { Metadata } from "next";
import { Atkinson_Hyperlegible, Saira } from "next/font/google";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} h-full`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

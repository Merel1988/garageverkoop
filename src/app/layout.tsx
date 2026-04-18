import type { Metadata } from "next";
import Link from "next/link";
import { Inter } from "next/font/google";
import "./globals.css";
import { registrationsOpen } from "@/lib/event";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Garageverkoop Sambeek",
  description:
    "Meld je huis aan voor de garageverkoop in Sambeek en ontdek welke garages op de kaart staan.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const showAanmelden = registrationsOpen();
  return (
    <html lang="nl" className={inter.variable}>
      <body className="min-h-screen flex flex-col">
        <header className="sticky top-0 z-50 bg-brand-800 text-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
            <Link
              href="/"
              className="text-white no-underline hover:no-underline flex items-center gap-3 font-bold text-lg sm:text-xl"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.svg"
                alt=""
                width={36}
                height={36}
                className="rounded-lg shrink-0"
              />
              <span>
                Garageverkoop{" "}
                <span className="text-accent-300">Sambeek</span>
              </span>
            </Link>
            <nav className="flex gap-4 sm:gap-6 text-sm font-semibold">
              <Link href="/" className="text-white no-underline hover:text-accent-300">
                Home
              </Link>
              {showAanmelden && (
                <Link
                  href="/aanmelden"
                  className="text-white no-underline hover:text-accent-300"
                >
                  Aanmelden
                </Link>
              )}
              <Link href="/kaart" className="text-white no-underline hover:text-accent-300">
                Kaart
              </Link>
            </nav>
          </div>
          <div className="h-[3px] bg-accent-400" />
        </header>
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {children}
        </main>
        <footer className="mt-12 bg-brand-900 text-white/80">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 text-xs flex flex-wrap gap-x-4 gap-y-2 justify-between">
            <span>© {new Date().getFullYear()} Garageverkoop Sambeek</span>
            <span className="flex flex-wrap gap-x-4 gap-y-1">
              {process.env.NEXT_PUBLIC_CONTACT_EMAIL && (
                <a
                  href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL}`}
                  className="text-accent-300 no-underline hover:underline"
                >
                  Vragen? {process.env.NEXT_PUBLIC_CONTACT_EMAIL}
                </a>
              )}
              <a
                href="https://www.openstreetmap.org/copyright"
                target="_blank"
                rel="noopener"
                className="text-accent-300 no-underline hover:underline"
              >
                © OpenStreetMap
              </a>
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { registrationsOpen } from "@/lib/event";

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
    <html lang="nl">
      <body className="min-h-screen flex flex-col">
        <header className="bg-brand-700 text-white">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between flex-wrap gap-3">
            <Link
              href="/"
              className="text-xl font-bold text-white no-underline hover:no-underline"
            >
              Garageverkoop <span className="text-accent-400">Sambeek</span>
            </Link>
            <nav className="flex gap-5 text-sm font-medium">
              <Link href="/" className="text-white no-underline hover:underline">
                Home
              </Link>
              {showAanmelden && (
                <Link href="/aanmelden" className="text-white no-underline hover:underline">
                  Aanmelden
                </Link>
              )}
              <Link href="/kaart" className="text-white no-underline hover:underline">
                Kaart
              </Link>
            </nav>
          </div>
          <div className="h-1 bg-accent-400" />
        </header>
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8">{children}</main>
        <footer className="border-t-4 border-accent-400 bg-brand-800 text-white/90">
          <div className="max-w-5xl mx-auto px-4 py-6 text-xs flex flex-wrap gap-4 justify-between">
            <span>© {new Date().getFullYear()} Garageverkoop Sambeek</span>
            <span>
              Kaartgegevens:{" "}
              <a
                href="https://www.openstreetmap.org/copyright"
                target="_blank"
                rel="noopener"
                className="text-accent-200"
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

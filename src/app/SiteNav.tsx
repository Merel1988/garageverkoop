"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

type Item = { href: string; label: string };

export function SiteNav({ showAanmelden }: { showAanmelden: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const items: Item[] = [
    { href: "/", label: "Home" },
    ...(showAanmelden ? [{ href: "/aanmelden", label: "Aanmelden" }] : []),
    { href: "/kaart", label: "Kaart" },
  ];

  return (
    <>
      <nav className="hidden sm:flex gap-6 text-sm font-semibold">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="text-white no-underline hover:text-accent-300"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="sm:hidden text-white p-2 -mr-2 rounded-md hover:bg-brand-700"
        aria-label={open ? "Sluit menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-nav"
      >
        {open ? (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <line x1="6" y1="6" x2="18" y2="18" />
            <line x1="18" y1="6" x2="6" y2="18" />
          </svg>
        ) : (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <line x1="4" y1="7" x2="20" y2="7" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="17" x2="20" y2="17" />
          </svg>
        )}
      </button>

      {open && (
        <div
          id="mobile-nav"
          className="sm:hidden absolute top-full inset-x-0 bg-brand-800 border-t border-brand-700 shadow-lg"
        >
          <nav className="flex flex-col py-2">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="text-white no-underline hover:bg-brand-700 px-5 py-3.5 font-semibold text-base"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}

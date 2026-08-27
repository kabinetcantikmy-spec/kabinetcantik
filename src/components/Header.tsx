"use client";
import Link from "next/link";
import { useState } from "react";
import Logo from "./Logo";

const NAV = [
  { href: "/portfolio", label: "Portfolio" },
  { href: "/perkhidmatan", label: "Perkhidmatan" },
  { href: "/bahan", label: "Bahan" },
  { href: "/blog", label: "Blog" },
  { href: "/hubungi", label: "Hubungi" },
];

export default function Header({ brand, minimal = false }: { brand?: { nama: string; logoUrl: string }; minimal?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper/90 backdrop-blur">
      <div className="container-c flex items-center gap-4 py-3">
        <Link href={minimal ? "/sebut-harga" : "/"} className="flex items-center gap-3">
          <Logo src={brand?.logoUrl} alt={brand?.nama} className="h-11 w-11" />
          <span className="font-display text-lg font-semibold tracking-[0.15em] text-ink">
            {brand?.nama || "KabinetCantik"}
          </span>
        </Link>

        {!minimal && (
          <>
            <nav className="ml-auto hidden items-center gap-7 md:flex">
              {NAV.map((n) => (
                <Link key={n.href} href={n.href} className="font-sans text-sm text-ink/80 transition hover:text-brass">
                  {n.label}
                </Link>
              ))}
              <Link href="/sebut-harga" className="btn-brass !px-5 !py-2.5 text-sm">
                Sebut Harga Percuma
              </Link>
            </nav>

            <button className="ml-auto md:hidden" aria-label="Menu" onClick={() => setOpen((v) => !v)}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0B1320" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </>
        )}
      </div>

      {!minimal && open && (
        <div className="border-t border-ink/10 bg-paper md:hidden">
          <div className="container-c flex flex-col gap-1 py-3">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className="py-2 font-sans text-ink/80">
                {n.label}
              </Link>
            ))}
            <Link href="/sebut-harga" onClick={() => setOpen(false)} className="btn-brass mt-2 text-sm">
              Sebut Harga Percuma
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

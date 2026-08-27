import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Perundangan — KabinetCantik OS",
  robots: { index: true },
};

const LINKS = [
  { href: "/legal/terma-perkhidmatan", label: "Terma Perkhidmatan" },
  { href: "/legal/privasi", label: "Dasar Privasi" },
  { href: "/legal/bayaran-balik", label: "Bayaran Balik & Pembatalan" },
  { href: "/legal/penghantaran", label: "Dasar Penghantaran" },
];

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-ink/10 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4">
          <Link href="/" className="font-display text-lg font-semibold tracking-wide text-ink">
            KabinetCantik<span className="text-brass"> OS</span>
          </Link>
          <nav className="hidden gap-5 text-sm text-ink/60 sm:flex">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-brass">{l.label}</Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-5 py-10">{children}</main>
      <footer className="border-t border-ink/10 bg-white">
        <div className="mx-auto max-w-4xl px-5 py-6 text-xs text-ink/50">
          <div className="flex flex-wrap gap-4">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-brass">{l.label}</Link>
            ))}
          </div>
          <p className="mt-3">© 2026 KabinetCantik OS. Hak cipta terpelihara.</p>
        </div>
      </footer>
    </div>
  );
}

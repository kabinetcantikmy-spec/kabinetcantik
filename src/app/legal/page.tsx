import Link from "next/link";

export default function LegalIndex() {
  const items = [
    { href: "/legal/terma-perkhidmatan", label: "Terma Perkhidmatan", desc: "Syarat penggunaan platform & langganan." },
    { href: "/legal/privasi", label: "Dasar Privasi", desc: "Cara kami kumpul, guna & lindungi data (PDPA 2010)." },
    { href: "/legal/bayaran-balik", label: "Dasar Bayaran Balik & Pembatalan", desc: "Terma langganan, pembatalan & bayaran balik." },
  ];
  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-ink">Perundangan</h1>
      <p className="mt-2 text-ink/60">Dokumen rasmi KabinetCantik OS.</p>
      <div className="mt-8 grid gap-4">
        {items.map((i) => (
          <Link key={i.href} href={i.href} className="rounded-xl border border-ink/10 bg-white p-5 transition hover:border-brass">
            <div className="font-display text-lg font-semibold text-ink">{i.label}</div>
            <div className="mt-1 text-sm text-ink/60">{i.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

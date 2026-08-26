import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { SERVICES } from "@/data/services";
import { BLUR } from "@/lib/img";

export const metadata: Metadata = {
  title: "Perkhidmatan — Kabinet Dapur, Wardrobe & Lain-lain",
  description: "Perkhidmatan reka bentuk & fabrikasi kabinet kustom KabinetCantik: dapur, wardrobe, TV cabinet, wall panelling di Klang Valley.",
};

export default function PerkhidmatanPage() {
  return (
    <section className="container-c pb-10 pt-28">
      <p className="eyebrow">Perkhidmatan</p>
      <h1 className="mt-2 h-display text-4xl">Apa yang kami reka</h1>
      <p className="mt-3 max-w-xl text-ink/60">Setiap projek direka khas, difabrikasi di workshop sendiri, dan dipasang oleh pasukan kami.</p>

      <div className="mt-10 space-y-6">
        {SERVICES.map((s, i) => (
          <Link key={s.slug} href={`/perkhidmatan/${s.slug}`} className="group grid overflow-hidden rounded-2xl border border-ink/10 bg-white md:grid-cols-2">
            <div className={`relative aspect-[16/10] md:aspect-auto ${i % 2 ? "md:order-2" : ""}`}>
              <Image src={s.img} alt={s.nama} fill sizes="(max-width:768px) 100vw, 50vw" placeholder="blur" blurDataURL={BLUR} className="object-cover transition duration-500 group-hover:scale-105" />
            </div>
            <div className="flex flex-col justify-center p-8">
              <h2 className="font-display text-2xl font-semibold text-ink">{s.nama}</h2>
              <p className="mt-2 text-ink/60">{s.ringkas}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {s.ciri.map((c) => <span key={c} className="rounded-full bg-brass/10 px-3 py-1 text-xs text-gold-shadow">{c}</span>)}
              </div>
              <span className="mt-5 text-sm font-semibold text-brass">Lihat lanjut →</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

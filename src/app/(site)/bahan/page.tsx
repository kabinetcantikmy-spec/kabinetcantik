import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { BLUR } from "@/lib/img";

export const metadata: Metadata = {
  title: "Bahan & Kemasan | KabinetCantik",
  description: "Pilihan bahan & kemasan kabinet KabinetCantik — laminat, acrylic, 4G/5G glass, sintered stone, veneer dan lebih.",
};

const SWATCHES = [
  { nama: "Laminat E0", nota: "Nilai terbaik, tahan lama", img: "https://images.unsplash.com/photo-1615873968403-89e068629265?w=600&q=80" },
  { nama: "Acrylic", nota: "Kilat moden", img: "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=600&q=80" },
  { nama: "4G / 5G Glass", nota: "Kemasan premium", img: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=600&q=80" },
  { nama: "Sintered Stone", nota: "Countertop tahan haba", img: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&q=80" },
  { nama: "Wood Veneer", nota: "Rupa kayu semula jadi", img: "https://images.unsplash.com/photo-1622372738946-62e02505feb3?w=600&q=80" },
  { nama: "Quartz", nota: "Kukuh & elegan", img: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600&q=80" },
  { nama: "Fluted Panel", nota: "Tekstur berkarakter", img: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&q=80" },
  { nama: "Aluminium", nota: "Tahan air, sesuai wet kitchen", img: "https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=600&q=80" },
];

export default function BahanPage() {
  return (
    <section className="container-c pb-10 pt-28">
      <p className="eyebrow">Bahan & Kemasan</p>
      <h1 className="mt-2 h-display text-4xl">Kualiti & pilihan tanpa kompromi</h1>
      <p className="mt-3 max-w-xl text-ink/60">Kami bantu anda pilih bahan yang sesuai dengan gaya, penggunaan & bajet — dari ekonomi hingga premium.</p>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {SWATCHES.map((s) => (
          <div key={s.nama} className="overflow-hidden rounded-xl border border-ink/10 bg-white">
            <div className="relative aspect-square">
              <Image src={s.img} alt={s.nama} fill sizes="(max-width:640px) 50vw, 25vw" placeholder="blur" blurDataURL={BLUR} className="object-cover" />
            </div>
            <div className="p-4">
              <div className="font-display font-semibold text-ink">{s.nama}</div>
              <div className="text-xs text-ink/50">{s.nota}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-2xl bg-ink p-8 text-center text-off-white">
        <h2 className="font-display text-2xl text-tan">Tak pasti bahan mana sesuai?</h2>
        <p className="mt-2 text-white/70">Kami akan cadangkan pilihan terbaik semasa ukur tapak percuma.</p>
        <Link href="/sebut-harga" className="btn-brass mt-5">Dapatkan Sebut Harga</Link>
      </div>
    </section>
  );
}

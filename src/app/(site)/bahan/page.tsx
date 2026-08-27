import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { BLUR } from "@/lib/img";
import { currentOrg } from "@/lib/tenant";
import { loadMaterials } from "@/lib/siteContentServer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bahan & Kemasan",
  description: "Pilihan bahan & kemasan kabinet — laminat, acrylic, 4G/5G glass, sintered stone, veneer dan lebih.",
};

export default async function BahanPage() {
  const { orgId } = await currentOrg();
  const m = await loadMaterials(orgId);
  return (
    <section className="container-c pb-10 pt-28">
      <p className="eyebrow">{m.eyebrow}</p>
      <h1 className="mt-2 h-display text-4xl">{m.title}</h1>
      <p className="mt-3 max-w-xl text-ink/60">{m.intro}</p>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {m.items.map((s) => (
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
        <h2 className="font-display text-2xl text-tan">{m.ctaTitle}</h2>
        <p className="mt-2 text-white/70">{m.ctaText}</p>
        <Link href="/sebut-harga" className="btn-brass mt-5">Dapatkan Sebut Harga</Link>
      </div>
    </section>
  );
}

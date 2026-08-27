import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { marketingOff } from "@/lib/siteMode";
import Link from "next/link";
import Image from "next/image";
import { BLUR } from "@/lib/img";
import { currentOrg } from "@/lib/tenant";
import { loadServices } from "@/lib/siteContentServer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Perkhidmatan — Kabinet Dapur, Wardrobe & Lain-lain",
  description: "Perkhidmatan reka bentuk & fabrikasi kabinet kustom: dapur, wardrobe, TV cabinet, wall panelling.",
};

export default async function PerkhidmatanPage() {
  if (await marketingOff()) redirect("/sebut-harga");
  const { orgId } = await currentOrg();
  const cfg = await loadServices(orgId);
  return (
    <section className="container-c pb-10 pt-28">
      <p className="eyebrow">{cfg.eyebrow}</p>
      <h1 className="mt-2 h-display text-4xl">{cfg.title}</h1>
      <p className="mt-3 max-w-xl text-ink/60">{cfg.intro}</p>

      <div className="mt-10 space-y-6">
        {cfg.items.map((s, i) => (
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

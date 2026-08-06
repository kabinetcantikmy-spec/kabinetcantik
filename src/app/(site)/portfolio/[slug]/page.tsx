import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getProjectBySlug } from "@/lib/portfolioDb";
import { CATEGORY_LABELS } from "@/data/portfolio";
import { BLUR } from "@/lib/img";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const params = await props.params;
  const p = await getProjectBySlug(params.slug);
  if (!p) return { title: "Projek tidak dijumpai | KabinetCantik" };
  return {
    title: `${p.tajuk} — ${CATEGORY_LABELS[p.kategori]} | KabinetCantik`,
    description: p.keterangan || `Projek ${CATEGORY_LABELS[p.kategori]} di ${p.kawasan}.`,
    openGraph: { title: p.tajuk, description: p.keterangan, images: p.cover ? [p.cover] : undefined },
  };
}

export default async function CaseStudy(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const p = await getProjectBySlug(params.slug);
  if (!p) notFound();
  const gallery = p.images.length ? p.images : p.cover ? [p.cover] : [];

  return (
    <article className="pb-16 pt-24">
      {/* Hero image */}
      <div className="relative h-[52vh] w-full">
        {p.cover && (
          <Image src={p.cover} alt={p.tajuk} fill priority sizes="100vw" placeholder="blur" blurDataURL={BLUR} className="object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />
        <div className="container-c absolute inset-x-0 bottom-0 pb-8">
          <p className="eyebrow text-brass-lite">{CATEGORY_LABELS[p.kategori]} · {p.kawasan}</p>
          <h1 className="mt-2 font-display text-4xl font-semibold text-off-white">{p.tajuk}</h1>
        </div>
      </div>

      <div className="container-c mt-10 grid gap-10 lg:grid-cols-[1fr_300px]">
        <div>
          {p.keterangan && <p className="font-serif text-xl leading-relaxed text-ink/80">{p.keterangan}</p>}

          {gallery.length > 1 && (
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {gallery.slice(1).map((src, i) => (
                <div key={i} className="relative aspect-[4/3] overflow-hidden rounded-xl">
                  <Image src={src} alt={`${p.tajuk} ${i + 2}`} fill loading="lazy" sizes="(max-width:640px) 100vw, 50vw" placeholder="blur" blurDataURL={BLUR} className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Meta */}
        <aside className="h-fit rounded-2xl border border-ink/10 bg-white p-6 lg:sticky lg:top-24">
          <Meta label="Kategori" value={CATEGORY_LABELS[p.kategori]} />
          <Meta label="Kawasan" value={p.kawasan || "—"} />
          {p.gaya.length > 0 && <Meta label="Gaya" value={p.gaya.join(", ")} />}
          {p.bahan.length > 0 && (
            <div className="mt-4">
              <div className="text-xs uppercase tracking-wider text-ink/40">Bahan digunakan</div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {p.bahan.map((b) => (
                  <span key={b} className="rounded-full bg-brass/10 px-2.5 py-1 text-xs text-gold-shadow">{b}</span>
                ))}
              </div>
            </div>
          )}
          <Link href={`/sebut-harga?kategori=${p.kategori}`} className="btn-brass mt-6 w-full text-sm">
            Saya nak yang macam ni →
          </Link>
        </aside>
      </div>

      <div className="container-c mt-12">
        <Link href="/portfolio" className="text-sm text-ink/50 hover:text-brass">← Semua projek</Link>
      </div>
    </article>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-ink/5 py-2">
      <div className="text-xs uppercase tracking-wider text-ink/40">{label}</div>
      <div className="mt-0.5 text-sm text-ink/80">{value}</div>
    </div>
  );
}

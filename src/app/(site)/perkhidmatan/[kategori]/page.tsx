import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { SERVICES } from "@/data/services";
import { PortfolioCategory } from "@/data/portfolio";
import { getPublishedProjects } from "@/lib/portfolioDb";
import { currentOrg } from "@/lib/tenant";
import ProjectCard from "@/components/ProjectCard";
import { BLUR } from "@/lib/img";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: { params: Promise<{ kategori: string }> }): Promise<Metadata> {
  const params = await props.params;
  const s = SERVICES.find((x) => x.slug === params.kategori);
  if (!s) return { title: "Perkhidmatan" };
  return { title: `${s.nama} Kustom Klang Valley`, description: s.ringkas };
}

export default async function ServiceCategory(props: { params: Promise<{ kategori: string }> }) {
  const params = await props.params;
  const s = SERVICES.find((x) => x.slug === params.kategori);
  if (!s) notFound();
  const { orgId, isDefault } = await currentOrg();
  const projects = (await getPublishedProjects(orgId, isDefault)).filter((p) => p.kategori === (s.slug as PortfolioCategory)).slice(0, 3);

  return (
    <article className="pb-16 pt-24">
      <div className="relative h-[46vh] w-full">
        <Image src={s.img} alt={s.nama} fill priority sizes="100vw" placeholder="blur" blurDataURL={BLUR} className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-ink/20" />
        <div className="container-c absolute inset-x-0 bottom-0 pb-8">
          <p className="eyebrow text-brass-lite">Perkhidmatan</p>
          <h1 className="mt-2 font-display text-4xl font-semibold text-off-white">{s.nama}</h1>
        </div>
      </div>

      <div className="container-c mt-10 max-w-3xl">
        <p className="font-serif text-xl leading-relaxed text-ink/80">{s.penuh}</p>
        <div className="mt-6 flex flex-wrap gap-2">
          {s.ciri.map((c) => <span key={c} className="rounded-full border border-ink/15 bg-white px-4 py-2 text-sm text-ink/70">{c}</span>)}
        </div>
        <Link href={`/sebut-harga?kategori=${s.slug}`} className="btn-brass mt-8">Dapatkan Sebut Harga</Link>
      </div>

      {projects.length > 0 && (
        <div className="container-c mt-14">
          <h2 className="h-display text-2xl">Projek {s.nama}</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => <ProjectCard key={p.slug} p={p} />)}
          </div>
        </div>
      )}

      <div className="container-c mt-12">
        <Link href="/perkhidmatan" className="text-sm text-ink/50 hover:text-brass">← Semua perkhidmatan</Link>
      </div>
    </article>
  );
}

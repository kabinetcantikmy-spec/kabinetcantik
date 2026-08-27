import type { Metadata } from "next";
import Link from "next/link";
import QuoteWizard from "@/components/QuoteWizard";
import ProjectCard, { CardProject } from "@/components/ProjectCard";
import { loadPricingConfig } from "@/lib/pricingServer";
import { headers } from "next/headers";
import { resolveOrgId, currentOrg } from "@/lib/tenant";
import { marketingOff } from "@/lib/siteMode";
import { getPublishedProjects } from "@/lib/portfolioDb";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sebut Harga Percuma — Anggaran dalam 2 Minit",
  description: "Jawab beberapa soalan ringkas dan dapatkan anggaran harga kabinet kustom anda serta-merta.",
};

export default async function SebutHargaPage(
  props: {
    searchParams: Promise<{ kategori?: string }>;
  }
) {
  const searchParams = await props.searchParams;
  const host = (await headers()).get("host");
  const orgId = await resolveOrgId(host);
  const config = await loadPricingConfig(orgId);

  // Galeri portfolio (showcase) — hanya untuk subdomain tenant (landing = borang ini).
  const showcase = await marketingOff();
  let cards: CardProject[] = [];
  if (showcase) {
    const { isDefault } = await currentOrg();
    const projects = await getPublishedProjects(orgId, isDefault);
    cards = projects
      .filter((p) => p.cover)
      .slice(0, 6)
      .map((p) => ({
        slug: p.slug,
        tajuk: p.tajuk,
        kategori: p.kategori,
        cover: p.cover,
        kawasan: p.kawasan || "",
        bahan: p.bahan || [],
      }));
  }

  return (
    <section className="container-c pb-10 pt-28">
      <p className="eyebrow">Sebut Harga</p>
      <h1 className="mt-2 h-display text-4xl">Anggaran harga dalam 2 minit</h1>
      <p className="mt-3 max-w-xl text-ink/60">
        Tiada komitmen. Dapat julat harga serta-merta, lepas tu kami hubungi untuk ukur tapak percuma.
      </p>
      <div className="mt-10">
        <QuoteWizard initialKategori={searchParams?.kategori} config={config} />
      </div>

      {cards.length > 0 && (
        <div className="mt-20">
          <p className="eyebrow">Hasil Kerja Kami</p>
          <h2 className="mt-2 h-display text-3xl">Lihat sebahagian projek kami</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((p) => <ProjectCard key={p.slug} p={p} />)}
          </div>
          <div className="mt-6">
            <Link href="/portfolio" className="text-sm font-semibold text-brass hover:underline">
              Lihat semua projek →
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}

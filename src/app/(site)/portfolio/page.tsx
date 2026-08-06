import type { Metadata } from "next";
import PortfolioGrid from "@/components/PortfolioGrid";
import { PortfolioCategory } from "@/data/portfolio";
import { getPublishedProjects } from "@/lib/portfolioDb";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Portfolio — Projek Kabinet Kustom | KabinetCantik",
  description: "Lihat koleksi projek kabinet dapur, wardrobe, TV cabinet dan wall panelling kami di Klang Valley.",
};

const VALID = ["dapur", "wardrobe", "tv", "panel"];

export default async function PortfolioPage(
  props: {
    searchParams: Promise<{ kategori?: string }>;
  }
) {
  const searchParams = await props.searchParams;
  const k = searchParams?.kategori;
  const initial = (k && VALID.includes(k) ? (k as PortfolioCategory) : "all") as
    | "all"
    | PortfolioCategory;
  const projects = await getPublishedProjects();

  return (
    <section className="container-c pb-10 pt-28">
      <p className="eyebrow">Portfolio</p>
      <h1 className="mt-2 h-display text-4xl">Karya kami</h1>
      <p className="mt-3 max-w-xl text-ink/60">
        Setiap projek direka & difabrikasi khas. Tekan mana-mana untuk mula sebut harga dengan gaya yang sama.
      </p>
      <div className="mt-10">
        <PortfolioGrid projects={projects} initial={initial} />
      </div>
    </section>
  );
}

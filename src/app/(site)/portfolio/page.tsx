import type { Metadata } from "next";
import PortfolioGrid from "@/components/PortfolioGrid";
import { PortfolioCategory } from "@/data/portfolio";
import { getPublishedProjects } from "@/lib/portfolioDb";
import { currentOrg } from "@/lib/tenant";
import { loadPortfolioPage } from "@/lib/siteContentServer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Portfolio — Projek Kabinet Kustom",
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
  const { orgId, isDefault } = await currentOrg();
  const projects = await getPublishedProjects(orgId, isDefault);
  const pp = await loadPortfolioPage(orgId);

  return (
    <section className="container-c pb-10 pt-28">
      <p className="eyebrow">{pp.eyebrow}</p>
      <h1 className="mt-2 h-display text-4xl">{pp.title}</h1>
      <p className="mt-3 max-w-xl text-ink/60">{pp.intro}</p>
      <div className="mt-10">
        <PortfolioGrid projects={projects} initial={initial} />
      </div>
    </section>
  );
}

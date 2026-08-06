import { createServiceClient, supabaseReady } from "@/lib/supabase";
import { PROJECTS, PortfolioCategory, CATEGORY_LABELS } from "@/data/portfolio";

export interface PublicProject {
  slug: string;
  tajuk: string;
  kategori: PortfolioCategory;
  gaya: string[];
  cover: string;
  kawasan: string;
  bahan: string[];
  keterangan: string;
  images: string[];
  featured: boolean;
}

function fromStatic(): PublicProject[] {
  return PROJECTS.map((p) => ({
    slug: p.slug,
    tajuk: p.tajuk,
    kategori: p.kategori,
    gaya: p.gaya,
    cover: p.cover,
    kawasan: p.kawasan,
    bahan: p.bahan,
    keterangan: `Projek ${CATEGORY_LABELS[p.kategori]} di ${p.kawasan}, direka & difabrikasi khas oleh KabinetCantik.`,
    images: [p.cover],
    featured: Boolean(p.featured),
  }));
}

interface DbRow {
  slug: string;
  tajuk: string;
  kategori: string;
  gaya: string[] | null;
  cover_url: string | null;
  kawasan: string | null;
  bahan: string[] | null;
  keterangan: string | null;
  featured: boolean | null;
}

export async function getPublishedProjects(): Promise<PublicProject[]> {
  if (!supabaseReady()) return fromStatic();
  try {
    const sb = createServiceClient();
    const { data } = await sb
      .from("portfolio")
      .select("slug, tajuk, kategori, gaya, cover_url, kawasan, bahan, keterangan, featured")
      .eq("diterbitkan", true)
      .order("created_at", { ascending: false });
    const rows = (data || []) as DbRow[];
    if (!rows.length) return fromStatic();
    return rows.map((r) => ({
      slug: r.slug,
      tajuk: r.tajuk,
      kategori: (r.kategori as PortfolioCategory) || "dapur",
      gaya: r.gaya || [],
      cover: r.cover_url || "",
      kawasan: r.kawasan || "",
      bahan: r.bahan || [],
      keterangan: r.keterangan || "",
      images: [],
      featured: Boolean(r.featured),
    }));
  } catch {
    return fromStatic();
  }
}

export async function getProjectBySlug(slug: string): Promise<PublicProject | null> {
  if (!supabaseReady()) return fromStatic().find((p) => p.slug === slug) || null;
  try {
    const sb = createServiceClient();
    const { data: r } = await sb
      .from("portfolio")
      .select("id, slug, tajuk, kategori, gaya, cover_url, kawasan, bahan, keterangan, featured")
      .eq("slug", slug)
      .eq("diterbitkan", true)
      .single();
    if (!r) return fromStatic().find((p) => p.slug === slug) || null;
    const row = r as DbRow & { id: string };
    const { data: imgs } = await sb.from("portfolio_images").select("url").eq("portfolio_id", row.id).order("urutan");
    const images = (imgs || []).map((i: { url: string }) => i.url);
    return {
      slug: row.slug,
      tajuk: row.tajuk,
      kategori: (row.kategori as PortfolioCategory) || "dapur",
      gaya: row.gaya || [],
      cover: row.cover_url || "",
      kawasan: row.kawasan || "",
      bahan: row.bahan || [],
      keterangan: row.keterangan || "",
      images: images.length ? images : row.cover_url ? [row.cover_url] : [],
      featured: Boolean(row.featured),
    };
  } catch {
    return fromStatic().find((p) => p.slug === slug) || null;
  }
}

export async function getFeaturedProjects(): Promise<PublicProject[]> {
  const all = await getPublishedProjects();
  const feat = all.filter((p) => p.featured);
  return feat.length ? feat : all.slice(0, 4);
}

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

export async function getPublishedProjects(orgId?: string | null, allowStatic = false): Promise<PublicProject[]> {
  if (!supabaseReady()) return allowStatic ? fromStatic() : [];
  try {
    const sb = createServiceClient();
    let q = sb
      .from("portfolio")
      .select("slug, tajuk, kategori, gaya, cover_url, kawasan, bahan, keterangan, featured")
      .eq("diterbitkan", true);
    if (orgId) q = q.eq("org_id", orgId);
    const { data } = await q.order("created_at", { ascending: false });
    const rows = (data || []) as DbRow[];
    if (!rows.length) return allowStatic ? fromStatic() : [];
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
    return allowStatic ? fromStatic() : [];
  }
}

export async function getProjectBySlug(slug: string, orgId?: string | null, allowStatic = false): Promise<PublicProject | null> {
  if (!supabaseReady()) return allowStatic ? (fromStatic().find((p) => p.slug === slug) || null) : null;
  try {
    const sb = createServiceClient();
    let q = sb
      .from("portfolio")
      .select("id, slug, tajuk, kategori, gaya, cover_url, kawasan, bahan, keterangan, featured")
      .eq("slug", slug)
      .eq("diterbitkan", true);
    if (orgId) q = q.eq("org_id", orgId);
    const { data: r } = await q.single();
    if (!r) return allowStatic ? (fromStatic().find((p) => p.slug === slug) || null) : null;
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
    return allowStatic ? (fromStatic().find((p) => p.slug === slug) || null) : null;
  }
}

export async function getFeaturedProjects(orgId?: string | null, allowStatic = false): Promise<PublicProject[]> {
  const all = await getPublishedProjects(orgId, allowStatic);
  const feat = all.filter((p) => p.featured);
  return feat.length ? feat : all.slice(0, 4);
}

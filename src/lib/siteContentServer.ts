import { supabaseReady, createServiceClient } from "@/lib/supabase";
import { createSupabaseServer } from "@/lib/supabaseServer";
import {
  ServicesConfig, DEFAULT_SERVICES,
  MaterialsConfig, DEFAULT_MATERIALS,
  PortfolioPageConfig, DEFAULT_PORTFOLIO_PAGE,
  BlogPageConfig, DEFAULT_BLOG_PAGE,
  ContactPageConfig, DEFAULT_CONTACT_PAGE,
} from "@/lib/siteContent";

async function readSetting(key: string, orgId?: string | null): Promise<unknown> {
  if (!supabaseReady()) return undefined;
  try {
    const sb = orgId ? createServiceClient() : createSupabaseServer();
    let q = sb.from("settings").select("value").eq("key", key);
    if (orgId) q = q.eq("org_id", orgId);
    const { data } = await q.limit(1).maybeSingle();
    const v = data?.value;
    return v && typeof v === "object" ? v : undefined;
  } catch {
    return undefined;
  }
}

/** Perkhidmatan — slug kekal tetap (routing), medan lain tenant boleh override. */
export async function loadServices(orgId?: string | null): Promise<ServicesConfig> {
  const base = DEFAULT_SERVICES;
  const cfg = await readSetting("services", orgId) as Partial<ServicesConfig> | undefined;
  if (!cfg) return base;
  const dbItems = Array.isArray(cfg.items) ? cfg.items : [];
  return {
    eyebrow: (cfg.eyebrow as string) || base.eyebrow,
    title: (cfg.title as string) || base.title,
    intro: (cfg.intro as string) || base.intro,
    items: base.items.map((d) => {
      const o = dbItems.find((x) => x?.slug === d.slug);
      if (!o) return d;
      return {
        slug: d.slug,
        nama: o.nama || d.nama,
        ringkas: o.ringkas || d.ringkas,
        penuh: o.penuh || d.penuh,
        ciri: Array.isArray(o.ciri) && o.ciri.length ? o.ciri.map((c) => String(c)).filter(Boolean) : d.ciri,
        img: o.img || d.img,
      };
    }),
  };
}

/** Bahan — senarai bebas (tenant boleh tambah/buang swatch). */
export async function loadMaterials(orgId?: string | null): Promise<MaterialsConfig> {
  const base = DEFAULT_MATERIALS;
  const cfg = await readSetting("materials", orgId) as Partial<MaterialsConfig> | undefined;
  if (!cfg) return base;
  const dbItems = Array.isArray(cfg.items) ? cfg.items : [];
  const items = dbItems
    .map((x) => ({ nama: String(x?.nama || ""), nota: String(x?.nota || ""), img: String(x?.img || "") }))
    .filter((x) => x.nama || x.img);
  return {
    eyebrow: (cfg.eyebrow as string) || base.eyebrow,
    title: (cfg.title as string) || base.title,
    intro: (cfg.intro as string) || base.intro,
    ctaTitle: (cfg.ctaTitle as string) || base.ctaTitle,
    ctaText: (cfg.ctaText as string) || base.ctaText,
    items: items.length ? items : base.items,
  };
}

/** Halaman Portfolio — heading sahaja (projek datang dari DB portfolioDb). */
export async function loadPortfolioPage(orgId?: string | null): Promise<PortfolioPageConfig> {
  const base = DEFAULT_PORTFOLIO_PAGE;
  const cfg = await readSetting("portfolio_page", orgId) as Partial<PortfolioPageConfig> | undefined;
  if (!cfg) return base;
  return {
    eyebrow: (cfg.eyebrow as string) || base.eyebrow,
    title: (cfg.title as string) || base.title,
    intro: (cfg.intro as string) || base.intro,
  };
}

/** Halaman Blog — heading sahaja (artikel dari blog_posts). */
export async function loadBlogPage(orgId?: string | null): Promise<BlogPageConfig> {
  const base = DEFAULT_BLOG_PAGE;
  const cfg = await readSetting("blog_page", orgId) as Partial<BlogPageConfig> | undefined;
  if (!cfg) return base;
  return {
    eyebrow: (cfg.eyebrow as string) || base.eyebrow,
    title: (cfg.title as string) || base.title,
    intro: (cfg.intro as string) || base.intro,
    emptyText: (cfg.emptyText as string) || base.emptyText,
  };
}

/** Halaman Hubungi — teks tetap (data WA/kawasan/showroom dari homepage config). */
export async function loadContactPage(orgId?: string | null): Promise<ContactPageConfig> {
  const base = DEFAULT_CONTACT_PAGE;
  const cfg = await readSetting("contact_page", orgId) as Partial<ContactPageConfig> | undefined;
  if (!cfg) return base;
  return {
    eyebrow: (cfg.eyebrow as string) || base.eyebrow,
    title: (cfg.title as string) || base.title,
    intro: (cfg.intro as string) || base.intro,
    waButton: (cfg.waButton as string) || base.waButton,
    areaLabel: (cfg.areaLabel as string) || base.areaLabel,
    showroomLabel: (cfg.showroomLabel as string) || base.showroomLabel,
    quoteLink: (cfg.quoteLink as string) || base.quoteLink,
  };
}

import type { MetadataRoute } from "next";
import { createServiceClient, supabaseReady } from "@/lib/supabase";
import { PROJECTS } from "@/data/portfolio";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL || "https://kabinetcantik.com";

  const staticPaths = ["", "/portfolio", "/perkhidmatan", "/bahan", "/sebut-harga", "/hubungi", "/ulasan", "/blog", "/tentang"];
  const entries: MetadataRoute.Sitemap = staticPaths.map((p) => ({
    url: `${base}${p}`,
    changeFrequency: "weekly",
    priority: p === "" ? 1 : 0.7,
  }));

  // Portfolio (data statik)
  for (const proj of PROJECTS) {
    entries.push({ url: `${base}/portfolio/${proj.slug}`, changeFrequency: "monthly", priority: 0.6 });
  }

  // Blog (dari DB)
  if (supabaseReady()) {
    try {
      const sb = createServiceClient();
      const { data } = await sb.from("blog_posts").select("slug, created_at").eq("diterbitkan", true);
      for (const post of (data || []) as { slug: string; created_at: string }[]) {
        entries.push({ url: `${base}/blog/${post.slug}`, lastModified: new Date(post.created_at), changeFrequency: "monthly", priority: 0.6 });
      }
    } catch {
      /* abaikan */
    }
  }

  return entries;
}

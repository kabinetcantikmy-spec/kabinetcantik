import type { PlanFeatures, Plan } from "@/lib/plan";

export interface NavItem { href: string; label: string; exact?: boolean }

/**
 * Nav admin. Fasa percuma ("launch") = fokus lead + jualan; sorok ciri kompleks
 * (Kalendar, Bahan & Harga, Pelanggan, Pembekal, Ulasan, Blog, Tetapan/Laman Awam).
 * Butang yang disorok HILANG terus — tiada skrin upsell. Buka balik bila plan naik.
 */
export function adminNavItems(features: PlanFeatures, plan?: Plan): NavItem[] {
  const items: NavItem[] = [
    { href: "/admin", label: "Dashboard", exact: true },
    { href: "/admin/leads-pasaran", label: "Leads Pasaran" },
    { href: "/admin/leads", label: "Leads / Pipeline" },
    { href: "/admin/sebutharga", label: "Sebut Harga" },
    { href: "/admin/projek", label: "Projek" },
    { href: "/admin/portfolio", label: "Portfolio" },
    { href: "/admin/kalendar", label: "Kalendar" },
    { href: "/admin/bahan", label: "Bahan & Harga" },
    { href: "/admin/pelanggan", label: "Pelanggan" },
    { href: "/admin/pembekal", label: "Pembekal" },
    { href: "/admin/ulasan", label: "Ulasan" },
  ];
  if (features.blog) items.push({ href: "/admin/blog", label: "Blog" });
  items.push({ href: "/admin/tetapan", label: "Tetapan" });

  if (plan === "launch") {
    const hide = new Set([
      "/admin/kalendar",
      "/admin/bahan",
      "/admin/pelanggan",
      "/admin/pembekal",
      "/admin/ulasan",
      "/admin/blog",
      "/admin/tetapan",
    ]);
    return items.filter((i) => !hide.has(i.href));
  }
  return items;
}

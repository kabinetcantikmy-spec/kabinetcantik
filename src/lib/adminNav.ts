import type { PlanFeatures } from "@/lib/plan";

export interface NavItem { href: string; label: string; exact?: boolean }

/**
 * Senarai nav admin ikut ciri pakej. Fasa percuma = semua terbuka KECUALI Blog
 * (Blog dikawal features.blogReviews → freemium sorok, muncul bila dibuka).
 * Butang yang tak layak HILANG terus — tiada skrin "upgrade" / kunci.
 */
export function adminNavItems(features: PlanFeatures): NavItem[] {
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
  return items;
}

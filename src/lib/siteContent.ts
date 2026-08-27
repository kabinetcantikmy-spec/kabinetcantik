// Konfigurasi kandungan halaman Perkhidmatan & Bahan (per-tenant, boleh edit).
import { PortfolioCategory } from "@/data/portfolio";
import { SERVICES } from "@/data/services";

// ---------- Perkhidmatan ----------
export interface ServiceItem {
  slug: PortfolioCategory; // tetap: dapur | wardrobe | tv | panel (routing bergantung)
  nama: string;
  ringkas: string;
  penuh: string;
  ciri: string[];
  img: string;
}
export interface ServicesConfig {
  eyebrow: string;
  title: string;
  intro: string;
  items: ServiceItem[];
}
export const DEFAULT_SERVICES: ServicesConfig = {
  eyebrow: "Perkhidmatan",
  title: "Apa yang kami reka",
  intro: "Setiap projek direka khas, difabrikasi di workshop sendiri, dan dipasang oleh pasukan kami.",
  items: SERVICES,
};

// ---------- Bahan & Kemasan ----------
export interface MaterialItem {
  nama: string;
  nota: string;
  img: string;
}
export interface MaterialsConfig {
  eyebrow: string;
  title: string;
  intro: string;
  ctaTitle: string;
  ctaText: string;
  items: MaterialItem[];
}
export const DEFAULT_MATERIALS: MaterialsConfig = {
  eyebrow: "Bahan & Kemasan",
  title: "Kualiti & pilihan tanpa kompromi",
  intro: "Kami bantu anda pilih bahan yang sesuai dengan gaya, penggunaan & bajet — dari ekonomi hingga premium.",
  ctaTitle: "Tak pasti bahan mana sesuai?",
  ctaText: "Kami akan cadangkan pilihan terbaik semasa ukur tapak percuma.",
  items: [
    { nama: "Laminat E0", nota: "Nilai terbaik, tahan lama", img: "https://images.unsplash.com/photo-1615873968403-89e068629265?w=600&q=80" },
    { nama: "Acrylic", nota: "Kilat moden", img: "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=600&q=80" },
    { nama: "4G / 5G Glass", nota: "Kemasan premium", img: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=600&q=80" },
    { nama: "Sintered Stone", nota: "Countertop tahan haba", img: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&q=80" },
    { nama: "Wood Veneer", nota: "Rupa kayu semula jadi", img: "https://images.unsplash.com/photo-1622372738946-62e02505feb3?w=600&q=80" },
    { nama: "Quartz", nota: "Kukuh & elegan", img: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600&q=80" },
    { nama: "Fluted Panel", nota: "Tekstur berkarakter", img: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&q=80" },
    { nama: "Aluminium", nota: "Tahan air, sesuai wet kitchen", img: "https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=600&q=80" },
  ],
};

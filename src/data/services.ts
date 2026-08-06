import { PortfolioCategory } from "@/data/portfolio";

export interface Service {
  slug: PortfolioCategory;
  nama: string;
  ringkas: string;
  penuh: string;
  ciri: string[];
  img: string;
}

export const SERVICES: Service[] = [
  {
    slug: "dapur",
    nama: "Kabinet Dapur",
    ringkas: "Dry & wet kitchen direka khas untuk aliran kerja & gaya rumah anda.",
    penuh:
      "Dari dry kitchen moden hingga wet kitchen yang tahan lasak, kami reka kabinet dapur mengikut ruang, tabiat memasak dan bajet anda. Pilihan bahan luas — laminat E0, acrylic, 4G/5G glass hingga sintered stone — semua dipasang kemas dengan hardware Blum.",
    ciri: ["Dry & wet kitchen", "Island & peninsula", "Hardware Blum", "Sintered stone / quartz"],
    img: "https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=1200&q=80",
  },
  {
    slug: "wardrobe",
    nama: "Wardrobe",
    ringkas: "Built-in & walk-in wardrobe dengan susun atur pintar.",
    penuh:
      "Wardrobe built-in atau walk-in yang memaksimumkan setiap inci ruang. Sliding atau swing door, laci soft-close, rak boleh laras, dan pencahayaan LED untuk sentuhan mewah.",
    ciri: ["Built-in & walk-in", "Sliding / swing door", "LED profile", "Laci soft-close"],
    img: "https://images.unsplash.com/photo-1558997519-83ea9252edf8?w=1200&q=80",
  },
  {
    slug: "tv",
    nama: "TV Cabinet & Feature Wall",
    ringkas: "Ruang tamu yang jadi pusat perhatian.",
    penuh:
      "TV cabinet dan feature wall yang menyatukan storan tersembunyi dengan reka bentuk berseni — fluted panel, laminat kayu, pencahayaan tersembunyi dan susun atur yang kemas.",
    ciri: ["Feature wall", "Storan tersembunyi", "Fluted panel", "Ambient lighting"],
    img: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200&q=80",
  },
  {
    slug: "panel",
    nama: "Wall Panelling",
    ringkas: "Dinding berkarakter untuk mana-mana ruang.",
    penuh:
      "Wall panelling menaikkan seri ruang tamu, bilik tidur atau lobi. Pilihan MDF bercat duco, fluted, atau kombinasi bahan untuk tekstur & kedalaman.",
    ciri: ["MDF / duco", "Fluted design", "Accent wall", "Kombinasi bahan"],
    img: "https://images.unsplash.com/photo-1615529182904-14819c35db37?w=1200&q=80",
  },
];

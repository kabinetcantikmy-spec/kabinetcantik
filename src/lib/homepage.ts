// Konfigurasi homepage per-tenant (medan teras yang tenant boleh edit sendiri).
export interface HomepageStat {
  n: string; // cth "10+"
  l: string; // cth "Tahun pengalaman"
}

export interface HomepageConfig {
  heroEyebrow: string;
  heroTitle: string;
  heroTagline: string;
  heroImage: string;   // latar hero
  beforeImage: string; // transformasi — sebelum
  afterImage: string;  // transformasi — selepas
  stats: HomepageStat[]; // 3 keping
  whatsapp: string; // nombor MY; "" = tiada butang WA
  serviceArea: string;
  showroomAddress: string;
  serviceImages: { dapur: string; wardrobe: string; tv: string; panel: string }; // gambar 4 tile perkhidmatan
  materialChips: string[]; // senarai bahan (chip) di homepage
}

export const DEFAULT_HOMEPAGE: HomepageConfig = {
  heroEyebrow: "Kabinet Kustom · Klang Valley",
  heroTitle: "Dapur impian, direka khas untuk anda",
  heroTagline: "Built to Fit. Styled to Last.",
  heroImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1900&q=80",
  beforeImage: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&q=80",
  afterImage: "https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=800&q=80",
  stats: [
    { n: "10+", l: "Tahun pengalaman" },
    { n: "500+", l: "Projek disiapkan" },
    { n: "5 Tahun", l: "Waranti" },
  ],
  whatsapp: "",
  serviceArea: "Klang Valley",
  showroomAddress: "",
  serviceImages: {
    dapur: "https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=800&q=80",
    wardrobe: "https://images.unsplash.com/photo-1558997519-83ea9252edf8?w=800&q=80",
    tv: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80",
    panel: "https://images.unsplash.com/photo-1615529182904-14819c35db37?w=800&q=80",
  },
  materialChips: ["Laminat E0", "Acrylic", "4G / 5G Glass", "Sintered Stone", "Veneer", "Quartz", "Fluted Panel", "Aluminium"],
};

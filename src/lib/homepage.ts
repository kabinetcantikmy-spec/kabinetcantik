// Konfigurasi homepage per-tenant (medan teras yang tenant boleh edit sendiri).
export interface HomepageStat {
  n: string; // cth "10+"
  l: string; // cth "Tahun pengalaman"
}

export interface HomepageConfig {
  heroEyebrow: string;
  heroTitle: string;
  heroTagline: string;
  stats: HomepageStat[]; // 3 keping
  whatsapp: string; // nombor MY; "" = tiada butang WA
  serviceArea: string;
  showroomAddress: string;
}

export const DEFAULT_HOMEPAGE: HomepageConfig = {
  heroEyebrow: "Kabinet Kustom · Klang Valley",
  heroTitle: "Dapur impian, direka khas untuk anda",
  heroTagline: "Built to Fit. Styled to Last.",
  stats: [
    { n: "10+", l: "Tahun pengalaman" },
    { n: "500+", l: "Projek disiapkan" },
    { n: "5 Tahun", l: "Waranti" },
  ],
  whatsapp: "",
  serviceArea: "Klang Valley",
  showroomAddress: "",
};

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

// ---------- Halaman Portfolio (heading sahaja; projek dari DB) ----------
export interface PortfolioPageConfig {
  eyebrow: string;
  title: string;
  intro: string;
}
export const DEFAULT_PORTFOLIO_PAGE: PortfolioPageConfig = {
  eyebrow: "Portfolio",
  title: "Karya kami",
  intro: "Setiap projek direka & difabrikasi khas. Tekan mana-mana untuk mula sebut harga dengan gaya yang sama.",
};

// ---------- Halaman Blog (heading sahaja; artikel dari DB) ----------
export interface BlogPageConfig {
  eyebrow: string;
  title: string;
  intro: string;
  emptyText: string;
}
export const DEFAULT_BLOG_PAGE: BlogPageConfig = {
  eyebrow: "Blog",
  title: "Idea & panduan",
  intro: "Inspirasi reka bentuk & tip praktikal untuk projek kabinet anda.",
  emptyText: "Belum ada artikel. Nantikan idea reka bentuk terbaru dari kami.",
};

// ---------- Halaman Hubungi (Contact) ----------
export interface ContactPageConfig {
  eyebrow: string;
  title: string;
  intro: string;
  waButton: string;
  areaLabel: string;
  showroomLabel: string;
  quoteLink: string;
}
export const DEFAULT_CONTACT_PAGE: ContactPageConfig = {
  eyebrow: "Hubungi",
  title: "Mari berbual",
  intro: "Ada soalan atau nak mula projek? Hubungi kami — biasanya kami balas dalam masa sejam pada waktu bekerja.",
  waButton: "WhatsApp Kami",
  areaLabel: "Kawasan servis",
  showroomLabel: "Showroom",
  quoteLink: "Atau isi sebut harga pantas",
};

// ---------- Halaman Privasi ----------
export interface PrivacyPageConfig {
  title: string;
  body: string; // guna {{brand}} untuk auto-isi nama syarikat; baris kosong = perenggan baru
}
export const DEFAULT_PRIVACY_PAGE: PrivacyPageConfig = {
  title: "Dasar Privasi",
  body: [
    "{{brand}} menghormati privasi anda. Maklumat yang anda berikan (nama, nombor telefon, emel dan butiran projek) dikumpul semata-mata untuk memproses pertanyaan, sebut harga dan projek anda.",
    "Kami tidak menjual atau menyewakan data peribadi anda kepada pihak ketiga. Data disimpan dengan selamat dan hanya diakses oleh pasukan {{brand}} yang berkaitan.",
    "Anda boleh meminta untuk melihat, membetulkan atau memadam data peribadi anda pada bila-bila masa dengan menghubungi kami.",
    "Dengan menggunakan laman ini, anda bersetuju dengan pengumpulan dan penggunaan maklumat seperti yang dinyatakan di atas.",
  ].join("\n\n"),
};

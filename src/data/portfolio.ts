// Data portfolio placeholder — ganti dengan projek sebenar dari Supabase `portfolio`.
// Gambar guna Unsplash sementara; tukar ke image CDN bila set gambar sedia.

export type PortfolioCategory = "dapur" | "wardrobe" | "tv" | "panel";

export interface Project {
  slug: string;
  tajuk: string;
  kategori: PortfolioCategory;
  gaya: string[];
  cover: string;
  kawasan: string;
  bahan: string[];
  featured?: boolean;
}

export const CATEGORY_LABELS: Record<PortfolioCategory, string> = {
  dapur: "Kabinet Dapur",
  wardrobe: "Wardrobe",
  tv: "TV Cabinet",
  panel: "Wall Panelling",
};

export const PROJECTS: Project[] = [
  {
    slug: "dapur-moden-monokrom-damansara",
    tajuk: "Dapur Moden Monokrom",
    kategori: "dapur",
    gaya: ["moden", "minimalis"],
    cover: "https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=1200&q=80",
    kawasan: "Damansara",
    bahan: ["Laminat E0", "Sintered stone", "4G glass"],
    featured: true,
  },
  {
    slug: "dapur-klasik-kayu-hangat-shah-alam",
    tajuk: "Dapur Klasik Kayu Hangat",
    kategori: "dapur",
    gaya: ["klasik", "luxury"],
    cover: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80",
    kawasan: "Shah Alam",
    bahan: ["Veneer", "Quartz"],
    featured: true,
  },
  {
    slug: "walk-in-wardrobe-mewah-mont-kiara",
    tajuk: "Walk-in Wardrobe Mewah",
    kategori: "wardrobe",
    gaya: ["luxury", "moden"],
    cover: "https://images.unsplash.com/photo-1558997519-83ea9252edf8?w=1200&q=80",
    kawasan: "Mont Kiara",
    bahan: ["Acrylic", "LED profile"],
    featured: true,
  },
  {
    slug: "tv-cabinet-feature-wall-cheras",
    tajuk: "TV Cabinet & Feature Wall",
    kategori: "tv",
    gaya: ["moden"],
    cover: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200&q=80",
    kawasan: "Cheras",
    bahan: ["Fluted panel", "Laminat"],
    featured: true,
  },
  {
    slug: "wall-panelling-ruang-tamu-puchong",
    tajuk: "Wall Panelling Ruang Tamu",
    kategori: "panel",
    gaya: ["klasik", "minimalis"],
    cover: "https://images.unsplash.com/photo-1615529182904-14819c35db37?w=1200&q=80",
    kawasan: "Puchong",
    bahan: ["MDF panel", "Cat duco"],
  },
  {
    slug: "dapur-basah-kemas-subang",
    tajuk: "Dapur Basah Kemas",
    kategori: "dapur",
    gaya: ["moden", "minimalis"],
    cover: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200&q=80",
    kawasan: "Subang Jaya",
    bahan: ["Aluminium", "Tempered glass"],
  },
];

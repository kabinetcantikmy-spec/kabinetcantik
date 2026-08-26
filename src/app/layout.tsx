import type { Metadata } from "next";
import { headers } from "next/headers";
import { hostBrand } from "@/lib/branding";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const brand = await hostBrand((await headers()).get("host"));
  const nama = brand.nama;
  return {
    title: { default: `${nama} — Kabinet Dapur, Wardrobe & Kabinet Kustom`, template: `%s | ${nama}` },
    description:
      "Reka bentuk & fabrikasi kabinet dapur, wardrobe, TV cabinet dan wall panelling kustom. Dapatkan sebut harga percuma dalam 2 minit.",
    openGraph: {
      title: `${nama} — Dapur impian, direka khas untuk anda`,
      description: "Kabinet kustom premium untuk rumah anda.",
      type: "website",
    },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ms">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600&family=Cormorant+Garamond:ital,wght@0,500;1,500&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans">{children}</body>
    </html>
  );
}

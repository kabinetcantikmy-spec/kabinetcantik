// Suntik structured data (schema.org) — untuk SEO.
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function localBusinessLd(nama = "KabinetCantik", area = "Klang Valley") {
  const base = process.env.NEXT_PUBLIC_APP_URL || "https://kabinetcantik.com";
  return {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    name: nama,
    description: "Reka bentuk & fabrikasi kabinet dapur, wardrobe, TV cabinet dan wall panelling kustom.",
    url: base,
    areaServed: area,
    priceRange: "RM3,000 - RM60,000+",
  };
}

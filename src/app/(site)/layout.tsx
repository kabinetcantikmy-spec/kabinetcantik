import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { hostBrand } from "@/lib/branding";
import { currentOrg } from "@/lib/tenant";
import { loadHomepageConfig } from "@/lib/homepageServer";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import JsonLd, { localBusinessLd } from "@/components/JsonLd";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const host = (await headers()).get("host");
  const brand = await hostBrand(host);
  const { orgId, isDefault } = await currentOrg();
  // Subdomain tak berdaftar → 404 (elak papar kandungan semua tenant).
  if (!isDefault && !orgId) notFound();
  const hp = await loadHomepageConfig(orgId, isDefault);
  return (
    <>
      <JsonLd data={localBusinessLd(brand.nama, hp.serviceArea)} />
      <Header brand={brand} />
      <main>{children}</main>
      <Footer brand={brand} area={hp.serviceArea} address={hp.showroomAddress} tagline={hp.heroTagline} />
      <WhatsAppButton phone={hp.whatsapp} brandName={brand.nama} />
    </>
  );
}

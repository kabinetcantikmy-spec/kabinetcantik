import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { hostBrand } from "@/lib/branding";
import { currentOrg } from "@/lib/tenant";
import { loadHomepageConfig } from "@/lib/homepageServer";
import { planForOrg } from "@/lib/planServer";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { marketingOff } from "@/lib/siteMode";
import { createServiceClient, supabaseReady } from "@/lib/supabase";
import WhatsAppButton from "@/components/WhatsAppButton";
import JsonLd, { localBusinessLd } from "@/components/JsonLd";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const host = (await headers()).get("host");
  const brand = await hostBrand(host);
  const { orgId, isDefault } = await currentOrg();
  // Subdomain tak berdaftar → 404 (elak papar kandungan semua tenant).
  if (!isDefault && !orgId) notFound();
  const hp = await loadHomepageConfig(orgId, isDefault);
  const { features } = await planForOrg(orgId);
  const minimal = await marketingOff();
  let tenantPhone = "";
  if (minimal && orgId && supabaseReady()) {
    try {
      const sb = createServiceClient();
      const { data } = await sb.from("settings").select("value").eq("org_id", orgId).eq("key", "business").maybeSingle();
      const v = data?.value as { telefon?: string } | undefined;
      tenantPhone = v?.telefon || "";
    } catch { /* ignore */ }
  }
  return (
    <>
      <JsonLd data={localBusinessLd(brand.nama, hp.serviceArea)} />
      <Header brand={brand} minimal={minimal} />
      <main>{children}</main>
      <Footer brand={brand} area={hp.serviceArea} address={hp.showroomAddress} tagline={hp.heroTagline} showPoweredBy={!features.removeBadge} minimal={minimal} phone={tenantPhone} suppliers={features.suppliers} operator={isDefault ? { nama: "RENORUMAH SDN. BHD.", ssm: "202301005235 (1499154-X)" } : undefined} />
      <WhatsAppButton phone={hp.whatsapp} brandName={brand.nama} />
    </>
  );
}

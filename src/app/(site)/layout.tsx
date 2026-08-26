import { headers } from "next/headers";
import { hostBrand } from "@/lib/branding";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import JsonLd, { localBusinessLd } from "@/components/JsonLd";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const brand = await hostBrand((await headers()).get("host"));
  return (
    <>
      <JsonLd data={localBusinessLd()} />
      <Header brand={brand} />
      <main>{children}</main>
      <Footer brand={brand} />
      <WhatsAppButton />
    </>
  );
}

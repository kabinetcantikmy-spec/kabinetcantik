import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { waLink } from "@/lib/wa";
import { hostBrand } from "@/lib/branding";
import { currentOrg } from "@/lib/tenant";
import { loadHomepageConfig } from "@/lib/homepageServer";
import { loadContactPage } from "@/lib/siteContentServer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Hubungi Kami",
  description: "Hubungi kami untuk pertanyaan kabinet kustom.",
};

export default async function HubungiPage() {
  const host = (await headers()).get("host");
  const brand = await hostBrand(host);
  const { orgId, isDefault } = await currentOrg();
  const hp = await loadHomepageConfig(orgId, isDefault);
  const cp = await loadContactPage(orgId);
  const area = hp.serviceArea;
  const address = hp.showroomAddress;
  const wa = hp.whatsapp ? waLink(hp.whatsapp, `Hai ${brand.nama}, saya ada pertanyaan.`) : "";

  return (
    <section className="container-c grid gap-12 pb-10 pt-28 lg:grid-cols-2">
      <div>
        <p className="eyebrow">{cp.eyebrow}</p>
        <h1 className="mt-2 h-display text-4xl">{cp.title}</h1>
        <p className="mt-3 max-w-md text-ink/65">{cp.intro}</p>

        <div className="mt-8 space-y-4">
          {wa ? (
            <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-brass">
              {cp.waButton}
            </a>
          ) : (
            <Link href="/sebut-harga" className="btn-brass">Dapatkan Sebut Harga</Link>
          )}
          <div className="text-sm text-ink/70">
            <div className="font-semibold text-ink">{cp.areaLabel}</div>
            <div>{area}</div>
          </div>
          {address && (
            <div className="text-sm text-ink/70">
              <div className="font-semibold text-ink">{cp.showroomLabel}</div>
              <div>{address}</div>
            </div>
          )}
          <div className="pt-2">
            <Link href="/sebut-harga" className="text-sm font-semibold text-brass hover:underline">
              {cp.quoteLink} →
            </Link>
          </div>
        </div>
      </div>

      {/* Peta kawasan servis */}
      <div className="min-h-[320px] overflow-hidden rounded-2xl border border-ink/10 bg-white">
        <iframe
          title="Peta kawasan servis"
          className="h-full min-h-[320px] w-full"
          loading="lazy"
          src={`https://www.google.com/maps?q=${encodeURIComponent(area + " Malaysia")}&output=embed`}
        />
      </div>
    </section>
  );
}

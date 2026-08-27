import type { Metadata } from "next";
import { headers } from "next/headers";
import { hostBrand } from "@/lib/branding";
import { currentOrg } from "@/lib/tenant";
import { loadPrivacyPage } from "@/lib/siteContentServer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Dasar Privasi" };

export default async function PrivasiPage() {
  const host = (await headers()).get("host");
  const brand = await hostBrand(host);
  const { orgId } = await currentOrg();
  const pv = await loadPrivacyPage(orgId);
  const body = pv.body.replaceAll("{{brand}}", brand.nama);
  const paras = body.split(/\n{2,}/).map((x) => x.trim()).filter(Boolean);

  return (
    <section className="container-c max-w-3xl pb-10 pt-28">
      <h1 className="h-display text-3xl">{pv.title}</h1>
      <div className="mt-4 space-y-4 text-ink/70">
        {paras.map((para, i) => (
          <p key={i} className="whitespace-pre-line">{para}</p>
        ))}
      </div>
    </section>
  );
}

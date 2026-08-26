import type { Metadata } from "next";
import QuoteWizard from "@/components/QuoteWizard";
import { loadPricingConfig } from "@/lib/pricingServer";
import { headers } from "next/headers";
import { resolveOrgId } from "@/lib/tenant";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sebut Harga Percuma — Anggaran dalam 2 Minit | KabinetCantik",
  description: "Jawab beberapa soalan ringkas dan dapatkan anggaran harga kabinet kustom anda serta-merta.",
};

export default async function SebutHargaPage(
  props: {
    searchParams: Promise<{ kategori?: string }>;
  }
) {
  const searchParams = await props.searchParams;
  const host = (await headers()).get("host");
  const orgId = await resolveOrgId(host);
  const config = await loadPricingConfig(orgId);
  return (
    <section className="container-c pb-10 pt-28">
      <p className="eyebrow">Sebut Harga</p>
      <h1 className="mt-2 h-display text-4xl">Anggaran harga dalam 2 minit</h1>
      <p className="mt-3 max-w-xl text-ink/60">
        Tiada komitmen. Dapat julat harga serta-merta, lepas tu kami hubungi untuk ukur tapak percuma.
      </p>
      <div className="mt-10">
        <QuoteWizard initialKategori={searchParams?.kategori} config={config} />
      </div>
    </section>
  );
}

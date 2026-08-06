import type { Metadata } from "next";
import Link from "next/link";
import { waSalesLink } from "@/lib/wa";

export const metadata: Metadata = {
  title: "Hubungi Kami | KabinetCantik",
  description: "Hubungi KabinetCantik untuk pertanyaan kabinet kustom di Klang Valley.",
};

export default function HubungiPage() {
  const area = process.env.NEXT_PUBLIC_SERVICE_AREA || "Klang Valley";
  const address = process.env.NEXT_PUBLIC_SHOWROOM_ADDRESS || "";
  const wa = waSalesLink("Hai KabinetCantik, saya ada pertanyaan.");

  return (
    <section className="container-c grid gap-12 pb-10 pt-28 lg:grid-cols-2">
      <div>
        <p className="eyebrow">Hubungi</p>
        <h1 className="mt-2 h-display text-4xl">Mari berbual</h1>
        <p className="mt-3 max-w-md text-ink/65">
          Ada soalan atau nak mula projek? WhatsApp kami — biasanya kami balas dalam masa sejam pada waktu bekerja.
        </p>

        <div className="mt-8 space-y-4">
          <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-brass">
            WhatsApp Kami
          </a>
          <div className="text-sm text-ink/70">
            <div className="font-semibold text-ink">Kawasan servis</div>
            <div>{area}</div>
          </div>
          {address && (
            <div className="text-sm text-ink/70">
              <div className="font-semibold text-ink">Showroom</div>
              <div>{address}</div>
            </div>
          )}
          <div className="pt-2">
            <Link href="/sebut-harga" className="text-sm font-semibold text-brass hover:underline">
              Atau isi sebut harga pantas →
            </Link>
          </div>
        </div>
      </div>

      {/* Peta placeholder — ganti dengan Google Maps embed showroom */}
      <div className="min-h-[320px] overflow-hidden rounded-2xl border border-ink/10 bg-white">
        <iframe
          title="Peta kawasan servis"
          className="h-full min-h-[320px] w-full"
          loading="lazy"
          src="https://www.google.com/maps?q=Klang+Valley+Malaysia&output=embed"
        />
      </div>
    </section>
  );
}

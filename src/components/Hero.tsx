import Link from "next/link";
import Image from "next/image";
import { BLUR } from "@/lib/img";

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      {/* Latar hero — ganti dengan gambar dapur sebenar via image CDN */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1900&q=80"
          alt="Dapur kustom KabinetCantik"
          fill
          priority
          sizes="100vw"
          placeholder="blur"
          blurDataURL={BLUR}
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/30" />
      </div>

      <div className="container-c flex min-h-[86vh] flex-col justify-end pb-16 pt-28">
        <div className="fade-up max-w-2xl">
          <p className="eyebrow text-brass-lite">Kabinet Kustom · Klang Valley</p>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-tight text-off-white sm:text-6xl">
            Dapur impian,<br />direka khas untuk anda
          </h1>
          <p className="mt-5 max-w-lg font-serif text-xl italic text-tan">
            Built to Fit. Styled to Last.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/sebut-harga" className="btn-brass">Dapatkan Sebut Harga Percuma</Link>
            <Link href="/portfolio" className="btn-ghost-light">Lihat Portfolio</Link>
          </div>
        </div>

        {/* Trust strip */}
        <div className="mt-14 grid max-w-2xl grid-cols-3 gap-6 border-t border-white/15 pt-6">
          {[
            { n: "10+", l: "Tahun pengalaman" },
            { n: "500+", l: "Projek disiapkan" },
            { n: "5 Tahun", l: "Waranti" },
          ].map((s) => (
            <div key={s.l}>
              <div className="font-display text-2xl font-semibold text-tan">{s.n}</div>
              <div className="mt-1 text-xs uppercase tracking-wider text-white/60">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

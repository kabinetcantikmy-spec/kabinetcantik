import Link from "next/link";
import Image from "next/image";
import { BLUR } from "@/lib/img";
import { HomepageConfig, DEFAULT_HOMEPAGE } from "@/lib/homepage";

export default function Hero({ hp = DEFAULT_HOMEPAGE }: { hp?: HomepageConfig }) {
  const stats = hp.stats?.length ? hp.stats.slice(0, 3) : DEFAULT_HOMEPAGE.stats;
  return (
    <section className="relative isolate overflow-hidden">
      {/* Latar hero */}
      <div className="absolute inset-0 -z-10">
        <Image
          src={hp.heroImage || DEFAULT_HOMEPAGE.heroImage}
          alt="Dapur kustom"
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
          {hp.heroEyebrow && <p className="eyebrow text-brass-lite">{hp.heroEyebrow}</p>}
          <h1 className="mt-4 font-display text-4xl font-semibold leading-tight text-off-white sm:text-6xl">
            {hp.heroTitle}
          </h1>
          {hp.heroTagline && (
            <p className="mt-5 max-w-lg font-serif text-xl italic text-tan">{hp.heroTagline}</p>
          )}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/sebut-harga" className="btn-brass">{hp.heroCta1 || DEFAULT_HOMEPAGE.heroCta1}</Link>
            <Link href="/portfolio" className="btn-ghost-light">{hp.heroCta2 || DEFAULT_HOMEPAGE.heroCta2}</Link>
          </div>
        </div>

        {/* Trust strip */}
        <div className="mt-14 grid max-w-2xl grid-cols-3 gap-6 border-t border-white/15 pt-6">
          {stats.map((s, i) => (
            <div key={i}>
              <div className="font-display text-2xl font-semibold text-tan">{s.n}</div>
              <div className="mt-1 text-xs uppercase tracking-wider text-white/60">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { BLUR } from "@/lib/img";

export const metadata: Metadata = {
  title: "Tentang Kami | KabinetCantik",
  description: "KabinetCantik — studio reka bentuk & workshop kabinet kustom di Klang Valley. Kenali kisah & proses kami.",
};

const STEPS = [
  { t: "Enquiry", d: "Kongsi idea & bajet anda." },
  { t: "Ukur Tapak", d: "Kami datang ukur & bincang reka bentuk." },
  { t: "Reka & Sebut Harga", d: "Design + harga tepat." },
  { t: "Fabrikasi & Pasang", d: "Dibuat di workshop, dipasang kemas." },
];

export default function TentangPage() {
  return (
    <section className="pb-16 pt-24">
      <div className="relative h-[42vh] w-full">
        <Image src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=80" alt="Workshop KabinetCantik" fill priority sizes="100vw" placeholder="blur" blurDataURL={BLUR} className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-ink/20" />
        <div className="container-c absolute inset-x-0 bottom-0 pb-8">
          <p className="eyebrow text-brass-lite">Tentang Kami</p>
          <h1 className="mt-2 font-display text-4xl font-semibold text-off-white">Kami jual reka bentuk, bukan sekadar kabinet</h1>
        </div>
      </div>

      <div className="container-c mt-10 max-w-3xl">
        <p className="font-serif text-xl leading-relaxed text-ink/80">
          KabinetCantik ialah studio reka bentuk & workshop kabinet kustom yang berpangkalan di Klang Valley. Kami
          percaya setiap rumah unik — jadi setiap kabinet kami direka khas, difabrikasi dengan teliti, dan dipasang
          oleh pasukan sendiri untuk hasil yang kemas & tahan lama.
        </p>
        <p className="mt-4 text-ink/70">
          Dari dapur impian hingga wardrobe walk-in, matlamat kami mudah: <em>Built to Fit. Styled to Last.</em>
        </p>
      </div>

      <div className="container-c mt-12">
        <h2 className="h-display text-2xl">Cara kami bekerja</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-4">
          {STEPS.map((s, i) => (
            <div key={s.t} className="rounded-xl border border-ink/10 bg-white p-5">
              <div className="font-serif text-3xl italic text-brass">0{i + 1}</div>
              <h3 className="mt-2 font-display font-semibold text-ink">{s.t}</h3>
              <p className="mt-1 text-sm text-ink/60">{s.d}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="container-c mt-12 grid gap-6 sm:grid-cols-3">
        {[
          { n: "10+", l: "Tahun pengalaman" },
          { n: "500+", l: "Projek disiapkan" },
          { n: "5 Tahun", l: "Waranti" },
        ].map((x) => (
          <div key={x.l} className="rounded-xl bg-paper p-6 text-center">
            <div className="font-display text-3xl font-semibold text-ink">{x.n}</div>
            <div className="mt-1 text-sm text-ink/50">{x.l}</div>
          </div>
        ))}
      </div>

      <div className="container-c mt-12 text-center">
        <Link href="/sebut-harga" className="btn-brass">Mula Projek Anda</Link>
      </div>
    </section>
  );
}

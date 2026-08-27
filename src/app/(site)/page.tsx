import Link from "next/link";
import Hero from "@/components/Hero";
import CategoryTiles from "@/components/CategoryTiles";
import ProjectCard from "@/components/ProjectCard";
import BeforeAfter from "@/components/BeforeAfter";
import { getFeaturedProjects } from "@/lib/portfolioDb";
import { createServiceClient, supabaseReady } from "@/lib/supabase";
import { currentOrg } from "@/lib/tenant";
import { loadHomepageConfig } from "@/lib/homepageServer";

export const dynamic = "force-dynamic";

const TESTIMONIALS = [
  { name: "Puan Aina", area: "Damansara", text: "Kabinet dapur kami nampak mewah tapi harga berpatutan. Pemasangan kemas & tepat masa." },
  { name: "Encik Faiz", area: "Shah Alam", text: "Dari design sampai siap semua smooth. Wardrobe walk-in memang jadi macam gambar." },
  { name: "Puan Mei", area: "Mont Kiara", text: "Team responsive di WhatsApp, quotation pun jelas. Recommended!" },
];

interface HomeReview { nama: string; rating: number; ulasan: string | null; avatar_url: string | null; projek_url: string | null }

export default async function HomePage() {
  const { orgId, isDefault } = await currentOrg();
  const hp = await loadHomepageConfig(orgId, isDefault);
  const featured = (await getFeaturedProjects(orgId, isDefault)).slice(0, 6);

  let testimonials: { name: string; text: string; rating: number; area?: string; avatar?: string; projek?: string }[] = (isDefault ? TESTIMONIALS : []).map((t) => ({
    name: t.name,
    text: t.text,
    rating: 5,
    area: t.area,
  }));
  if (supabaseReady()) {
    const sb = createServiceClient();
    let rq = sb.from("reviews").select("nama, rating, ulasan, avatar_url, projek_url").eq("diterbitkan", true);
    if (orgId) rq = rq.eq("org_id", orgId);
    const { data } = await rq.order("created_at", { ascending: false }).limit(3);
    const rows = (data || []) as HomeReview[];
    if (rows.length) {
      testimonials = rows.map((r) => ({ name: r.nama, text: r.ulasan || "", rating: r.rating, avatar: r.avatar_url || undefined, projek: r.projek_url || undefined }));
    }
  }

  return (
    <>
      <Hero hp={hp} />
      <CategoryTiles images={hp.serviceImages} eyebrow={hp.svcEyebrow} title={hp.svcTitle} labels={hp.svcLabels} />

      {/* Featured portfolio */}
      <section className="container-c py-8">
        <div className="flex items-end justify-between">
          <div>
            <p className="eyebrow">{hp.portEyebrow}</p>
            <h2 className="mt-2 h-display text-3xl">{hp.portTitle}</h2>
          </div>
          <Link href="/portfolio" className="hidden text-sm font-semibold text-brass hover:underline sm:block">
            {hp.portMore} →
          </Link>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => <ProjectCard key={p.slug} p={p} />)}
        </div>
        <div className="mt-6 sm:hidden">
          <Link href="/portfolio" className="text-sm font-semibold text-brass">{hp.portMore} →</Link>
        </div>
      </section>

      {/* How it works */}
      <section className="mt-12 bg-ink py-20 text-off-white">
        <div className="container-c">
          <p className="eyebrow text-brass-lite">{hp.stepsEyebrow}</p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-tan">{hp.stepsTitle}</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-4">
            {hp.processSteps.map((s, i) => (
              <div key={i}>
                <div className="font-serif text-4xl italic text-brass">{String(i + 1).padStart(2, "0")}</div>
                <h3 className="mt-2 font-display text-lg font-semibold text-off-white">{s.t}</h3>
                <p className="mt-2 text-sm text-white/65">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Materials */}
      <section id="bahan" className="container-c py-20">
        <p className="eyebrow">{hp.matEyebrow}</p>
        <h2 className="mt-2 h-display text-3xl">{hp.matTitle}</h2>
        <div className="mt-8 flex flex-wrap gap-3">
          {hp.materialChips.filter(Boolean).map((m) => (
            <span key={m} className="rounded-full border border-ink/15 bg-white px-5 py-2.5 text-sm text-ink/80">
              {m}
            </span>
          ))}
        </div>
        <Link href="/bahan" className="mt-6 inline-block text-sm font-semibold text-brass hover:underline">{hp.matMore} →</Link>
      </section>

      {/* Before / after */}
      <section className="container-c py-8">
        <p className="eyebrow">{hp.baEyebrow}</p>
        <h2 className="mt-2 h-display text-3xl">{hp.baTitle}</h2>
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <BeforeAfter
            before={hp.beforeImage}
            after={hp.afterImage}
            alt="Dapur"
          />
          <div className="flex flex-col justify-center">
            <p className="font-serif text-xl leading-relaxed text-ink/75">
              {hp.baText}
            </p>
            <Link href="/portfolio" className="mt-4 text-sm font-semibold text-brass hover:underline">{hp.baMore} →</Link>
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="bg-white py-20">
        <div className="container-c">
          <p className="eyebrow">{hp.revEyebrow}</p>
          <h2 className="mt-2 h-display text-3xl">{hp.revTitle}</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <figure key={i} className="overflow-hidden rounded-xl border border-ink/10 bg-paper">
                {t.projek && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={t.projek} alt={`Projek ${t.name}`} className="aspect-[16/10] w-full object-cover" />
                )}
                <div className="p-6">
                  <div className="text-brass">{"★".repeat(t.rating)}</div>
                  <blockquote className="mt-3 font-serif text-lg italic text-ink/85">“{t.text}”</blockquote>
                  <figcaption className="mt-4 flex items-center gap-3">
                    {t.avatar && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={t.avatar} alt={t.name} className="h-10 w-10 rounded-full border border-ink/10 object-cover" />
                    )}
                    <span className="text-sm font-semibold text-ink">
                      {t.name}
                      {t.area ? <span className="font-normal text-ink/50"> · {t.area}</span> : null}
                    </span>
                  </figcaption>
                </div>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="bg-brass">
        <div className="container-c flex flex-col items-center gap-6 py-16 text-center">
          <h2 className="max-w-2xl font-display text-3xl font-semibold text-ink">
            {hp.ctaTitle}
          </h2>
          <p className="max-w-lg text-ink/75">
            {hp.ctaText}
          </p>
          <Link href="/sebut-harga" className="rounded-lg bg-ink px-8 py-4 font-semibold text-off-white transition hover:bg-ink-soft">
            {hp.ctaButton} →
          </Link>
        </div>
      </section>
    </>
  );
}

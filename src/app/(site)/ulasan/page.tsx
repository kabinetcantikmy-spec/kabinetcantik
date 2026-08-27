import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { marketingOff } from "@/lib/siteMode";
import { createServiceClient, supabaseReady } from "@/lib/supabase";
import { currentOrg } from "@/lib/tenant";
import { tenantBrand } from "@/lib/branding";
import JsonLd from "@/components/JsonLd";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ulasan Pelanggan",
  description: "Apa kata pelanggan KabinetCantik tentang projek kabinet dapur & wardrobe mereka.",
};

interface Review {
  id: string;
  nama: string;
  rating: number;
  ulasan: string | null;
  avatar_url: string | null;
  projek_url: string | null;
}

export default async function UlasanPage() {
  if (await marketingOff()) redirect("/sebut-harga");
  const { orgId } = await currentOrg();
  const brand = await tenantBrand(orgId);
  let reviews: Review[] = [];
  if (supabaseReady()) {
    const sb = createServiceClient();
    let q = sb.from("reviews").select("id, nama, rating, ulasan, avatar_url, projek_url").eq("diterbitkan", true);
    if (orgId) q = q.eq("org_id", orgId);
    const { data } = await q.order("created_at", { ascending: false });
    reviews = (data || []) as Review[];
  }

  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const ratingLd = reviews.length
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: `Kabinet Kustom ${brand.nama}`,
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: avg.toFixed(1),
          reviewCount: reviews.length,
          bestRating: 5,
        },
      }
    : null;

  return (
    <section className="container-c pb-10 pt-28">
      {ratingLd && <JsonLd data={ratingLd} />}
      <p className="eyebrow">Ulasan Pelanggan</p>
      <h1 className="mt-2 h-display text-4xl">Apa kata mereka</h1>

      {reviews.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-ink/20 bg-white p-8 text-center text-ink/50">
          Ulasan akan dipaparkan di sini tidak lama lagi.
        </div>
      ) : (
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((r) => (
            <figure key={r.id} className="overflow-hidden rounded-xl border border-ink/10 bg-white">
              {r.projek_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={r.projek_url} alt={`Projek ${r.nama}`} className="aspect-[16/10] w-full object-cover" />
              )}
              <div className="p-6">
                <div className="text-brass">{"★".repeat(r.rating)}</div>
                {r.ulasan && <blockquote className="mt-3 font-serif text-lg italic text-ink/85">“{r.ulasan}”</blockquote>}
                <figcaption className="mt-4 flex items-center gap-3">
                  {r.avatar_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={r.avatar_url} alt={r.nama} className="h-10 w-10 rounded-full border border-ink/10 object-cover" />
                  )}
                  <span className="text-sm font-semibold text-ink">{r.nama}</span>
                </figcaption>
              </div>
            </figure>
          ))}
        </div>
      )}
    </section>
  );
}

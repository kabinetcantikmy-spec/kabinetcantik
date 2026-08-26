import type { Metadata } from "next";
import { createServiceClient, supabaseReady } from "@/lib/supabase";
import { currentOrg } from "@/lib/tenant";
import JsonLd from "@/components/JsonLd";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ulasan Pelanggan | KabinetCantik",
  description: "Apa kata pelanggan KabinetCantik tentang projek kabinet dapur & wardrobe mereka.",
};

interface Review {
  id: string;
  nama: string;
  rating: number;
  ulasan: string | null;
}

export default async function UlasanPage() {
  const { orgId } = await currentOrg();
  let reviews: Review[] = [];
  if (supabaseReady()) {
    const sb = createServiceClient();
    let q = sb.from("reviews").select("id, nama, rating, ulasan").eq("diterbitkan", true);
    if (orgId) q = q.eq("org_id", orgId);
    const { data } = await q.order("created_at", { ascending: false });
    reviews = (data || []) as Review[];
  }

  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const ratingLd = reviews.length
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: "Kabinet Kustom KabinetCantik",
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
            <figure key={r.id} className="rounded-xl border border-ink/10 bg-white p-6">
              <div className="text-brass">{"★".repeat(r.rating)}</div>
              {r.ulasan && <blockquote className="mt-3 font-serif text-lg italic text-ink/85">“{r.ulasan}”</blockquote>}
              <figcaption className="mt-4 text-sm font-semibold text-ink">{r.nama}</figcaption>
            </figure>
          ))}
        </div>
      )}
    </section>
  );
}

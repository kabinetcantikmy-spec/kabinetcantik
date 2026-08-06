import { createServiceClient, supabaseReady } from "@/lib/supabase";
import PublicReviewForm from "@/components/PublicReviewForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Tulis Ulasan | KabinetCantik", robots: { index: false } };

export default async function TulisUlasan(props: { params: Promise<{ token: string }> }) {
  const params = await props.params;
  let valid = false;
  let done = false;
  if (supabaseReady()) {
    const sb = createServiceClient();
    const { data } = await sb.from("projects").select("id, review_done").eq("review_token", params.token).single();
    valid = Boolean(data);
    done = Boolean(data?.review_done);
  }

  return (
    <section className="container-c max-w-lg pb-16 pt-28">
      <p className="eyebrow">Ulasan</p>
      <h1 className="mt-2 h-display text-3xl">Kongsi pengalaman anda</h1>
      <p className="mt-2 text-ink/60">Maklum balas anda membantu kami & bakal pelanggan lain.</p>

      <div className="mt-8">
        {!supabaseReady() || !valid ? (
          <div className="rounded-xl border border-dashed border-ink/20 bg-white p-8 text-center text-ink/50">
            Pautan tidak sah atau telah tamat tempoh.
          </div>
        ) : done ? (
          <div className="rounded-xl border border-ink/10 bg-white p-8 text-center text-ink/60">
            Ulasan telah dihantar untuk projek ini. Terima kasih!
          </div>
        ) : (
          <PublicReviewForm token={params.token} />
        )}
      </div>
    </section>
  );
}

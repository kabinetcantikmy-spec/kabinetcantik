import { notFound } from "next/navigation";
import { createServiceClient, supabaseReady } from "@/lib/supabase";
import { Quotation, QuotationItem } from "@/lib/crm";
import { rm2 } from "@/lib/format";
import { fmtDate } from "@/lib/format";
import Logo from "@/components/Logo";
import AcceptQuote from "@/components/AcceptQuote";
import { markQuoteViewed } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sebut Harga | KabinetCantik", robots: { index: false } };

export default async function PublicQuote(props: { params: Promise<{ token: string }> }) {
  const params = await props.params;
  if (!supabaseReady()) return <div className="container-c pt-28 text-center text-ink/50">Sistem tidak tersedia.</div>;
  const sb = createServiceClient();
  const { data: quote } = await sb.from("quotations").select("*, leads(nama, telefon)").eq("share_token", params.token).single();
  if (!quote) notFound();
  const q = quote as Quotation & { leads?: { nama: string; telefon: string } | null };

  await markQuoteViewed(params.token);

  const { data: items } = await sb.from("quotation_items").select("*").eq("quotation_id", q.id).order("urutan");
  const list = (items || []) as QuotationItem[];
  const deposit = (q.jumlah * q.deposit_pct) / 100;

  return (
    <section className="container-c max-w-3xl pb-16 pt-28">
      <div className="rounded-2xl border border-ink/10 bg-white p-6 sm:p-8">
        <div className="flex items-start justify-between border-b-2 border-brass pb-5">
          <div className="flex items-center gap-3">
            <Logo className="h-12 w-12" />
            <div>
              <div className="font-display font-semibold tracking-widest text-ink">KABINET CANTIK</div>
              <div className="font-serif text-sm italic text-gold-shadow">Built to Fit. Styled to Last.</div>
            </div>
          </div>
          <div className="text-right text-sm">
            <div className="font-display font-semibold">SEBUT HARGA</div>
            <div className="text-ink/70">{q.no_quote}</div>
            <div className="text-xs text-ink/50">{fmtDate(q.created_at)}</div>
          </div>
        </div>

        <div className="mt-4 text-sm">
          <span className="text-ink/50">Untuk:</span> <span className="font-semibold text-ink">{q.leads?.nama || "—"}</span>
        </div>

        <table className="mt-4 w-full border-collapse text-sm">
          <thead>
            <tr className="border-y border-ink/20 text-left text-xs uppercase tracking-wider text-ink/50">
              <th className="py-2">Keterangan</th>
              <th className="py-2 text-right">Kuantiti</th>
              <th className="py-2 text-right">Harga/unit</th>
              <th className="py-2 text-right">Jumlah</th>
            </tr>
          </thead>
          <tbody>
            {list.map((it) => (
              <tr key={it.id} className="border-b border-ink/10">
                <td className="py-2">{it.keterangan}{it.material_tier ? <span className="text-ink/40"> · {it.material_tier}</span> : ""}</td>
                <td className="py-2 text-right">{it.kuantiti} {it.unit || ""}</td>
                <td className="py-2 text-right">{rm2(it.harga_unit)}</td>
                <td className="py-2 text-right font-medium">{rm2(it.jumlah)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 ml-auto w-64 text-sm">
          <div className="flex justify-between py-1"><span className="text-ink/60">Subtotal</span><span>{rm2(q.subtotal)}</span></div>
          {q.diskaun > 0 && <div className="flex justify-between py-1"><span className="text-ink/60">Diskaun</span><span>- {rm2(q.diskaun)}</span></div>}
          {q.cukai > 0 && <div className="flex justify-between py-1"><span className="text-ink/60">SST</span><span>{rm2(q.cukai)}</span></div>}
          <div className="my-1 border-t border-ink/20" />
          <div className="flex justify-between py-1 font-display text-base font-semibold"><span>JUMLAH</span><span>{rm2(q.jumlah)}</span></div>
          <div className="mt-1 flex justify-between rounded bg-brass/10 px-2 py-1"><span className="text-ink/70">Deposit ({q.deposit_pct}%)</span><span className="font-semibold text-gold-shadow">{rm2(deposit)}</span></div>
        </div>

        {q.nota && <p className="mt-6 whitespace-pre-line border-t border-ink/10 pt-4 text-sm text-ink/70">{q.nota}</p>}

        <div className="mt-8">
          <AcceptQuote token={params.token} accepted={q.status === "accepted"} />
          <p className="mt-3 text-center text-xs text-ink/40">Harga sah 30 hari. Deposit {q.deposit_pct}% diperlukan untuk memulakan fabrikasi.</p>
        </div>
      </div>
    </section>
  );
}

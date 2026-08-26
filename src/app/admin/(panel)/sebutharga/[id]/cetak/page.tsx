import { notFound } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabaseServer";
import { supabaseReady } from "@/lib/supabase";
import { Quotation, QuotationItem } from "@/lib/crm";
import { rm2 } from "@/lib/format";
import { fmtDate } from "@/lib/format";
import Logo from "@/components/Logo";
import PrintButton from "@/components/admin/PrintButton";

export const dynamic = "force-dynamic";

export default async function QuotePrint(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  if (!supabaseReady()) return <div className="p-8 text-center text-ink/50">Supabase belum dikonfigurasi.</div>;
  const sb = createSupabaseServer();
  const { data: quote } = await sb
    .from("quotations")
    .select("*, leads(nama, telefon, emel)")
    .eq("id", params.id)
    .single();
  if (!quote) notFound();
  const q = quote as Quotation & { leads?: { nama: string; telefon: string; emel: string | null } | null };
  const { data: items } = await sb.from("quotation_items").select("*").eq("quotation_id", params.id).order("urutan");
  const list = (items || []) as QuotationItem[];
  const deposit = (q.jumlah * q.deposit_pct) / 100;
  const area = process.env.NEXT_PUBLIC_SERVICE_AREA || "Klang Valley";

  return (
    <div className="mx-auto max-w-3xl bg-white p-8 text-ink print:p-0">
      <div className="mb-6 flex justify-end print:mb-2">
        <PrintButton />
      </div>

      {/* Header */}
      <div className="flex items-start justify-between border-b-2 border-brass pb-5">
        <div className="flex items-center gap-3">
          <Logo className="h-14 w-14" />
          <div>
            <div className="font-display text-xl font-semibold tracking-widest text-ink">KABINET CANTIK</div>
            <div className="font-serif text-sm italic text-gold-shadow">Built to Fit. Styled to Last.</div>
            <div className="mt-1 text-xs text-ink/50">Kawasan servis: {area}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="font-display text-lg font-semibold">SEBUT HARGA</div>
          <div className="text-sm text-ink/70">{q.no_quote}</div>
          <div className="text-xs text-ink/50">Tarikh: {fmtDate(q.created_at)}</div>
        </div>
      </div>

      {/* Customer */}
      <div className="mt-5 text-sm">
        <div className="text-xs uppercase tracking-wider text-ink/40">Kepada</div>
        <div className="font-semibold text-ink">{q.leads?.nama || "—"}</div>
        <div className="text-ink/60">{q.leads?.telefon}{q.leads?.emel ? ` · ${q.leads.emel}` : ""}</div>
      </div>

      {/* Items */}
      <table className="mt-5 w-full border-collapse text-sm">
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
              <td className="py-2">
                {it.keterangan}
                {it.material_tier ? <span className="text-ink/40"> · {it.material_tier}</span> : ""}
              </td>
              <td className="py-2 text-right">{it.kuantiti} {it.unit || ""}</td>
              <td className="py-2 text-right">{rm2(it.harga_unit)}</td>
              <td className="py-2 text-right font-medium">{rm2(it.jumlah)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="mt-4 ml-auto w-64 text-sm">
        <Row label="Subtotal" value={rm2(q.subtotal)} />
        {q.diskaun > 0 && <Row label="Diskaun" value={`- ${rm2(q.diskaun)}`} />}
        {q.cukai > 0 && <Row label="SST" value={rm2(q.cukai)} />}
        <div className="my-1 border-t border-ink/20" />
        <Row label="JUMLAH" value={rm2(q.jumlah)} bold />
        <div className="mt-1 rounded bg-brass/10 px-2 py-1">
          <Row label={`Deposit (${q.deposit_pct}%)`} value={rm2(deposit)} accent />
        </div>
      </div>

      {/* Notes / terms */}
      {q.nota && (
        <div className="mt-6 text-sm">
          <div className="text-xs uppercase tracking-wider text-ink/40">Nota</div>
          <p className="mt-1 whitespace-pre-line text-ink/70">{q.nota}</p>
        </div>
      )}
      <div className="mt-8 border-t border-ink/10 pt-4 text-xs text-ink/50">
        Harga adalah anggaran berdasarkan maklumat semasa; harga muktamad selepas ukur tapak. Sebut harga ini sah selama 30 hari.
        Deposit {q.deposit_pct}% diperlukan untuk memulakan fabrikasi.
      </div>
    </div>
  );
}

function Row({ label, value, bold, accent }: { label: string; value: string; bold?: boolean; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-ink/60">{label}</span>
      <span className={`${bold ? "font-display text-base font-semibold" : ""} ${accent ? "text-gold-shadow font-semibold" : "text-ink"}`}>{value}</span>
    </div>
  );
}

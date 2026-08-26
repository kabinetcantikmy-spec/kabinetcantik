import { notFound } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabaseServer";
import { supabaseReady } from "@/lib/supabase";
import { Quotation, QuotationItem } from "@/lib/crm";
import QuoteBuilder, { MaterialOpt } from "@/components/admin/QuoteBuilder";

export const dynamic = "force-dynamic";

export default async function QuoteBuilderPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  if (!supabaseReady()) {
    return <div className="rounded-xl border border-dashed border-ink/20 bg-white p-8 text-center text-ink/50">Supabase belum dikonfigurasi.</div>;
  }
  const sb = createSupabaseServer();
  const { data: quote } = await sb.from("quotations").select("*, leads(nama)").eq("id", params.id).single();
  if (!quote) notFound();

  const { data: items } = await sb
    .from("quotation_items")
    .select("*")
    .eq("quotation_id", params.id)
    .order("urutan", { ascending: true });

  const { data: materials } = await sb
    .from("materials")
    .select("id, kategori, nama, tier, unit, harga_unit")
    .eq("aktif", true)
    .order("kategori");

  const q = quote as Quotation & { leads?: { nama: string } | null };

  return (
    <QuoteBuilder
      quote={q}
      items={(items || []) as QuotationItem[]}
      materials={(materials || []) as MaterialOpt[]}
      leadNama={q.leads?.nama || "—"}
    />
  );
}

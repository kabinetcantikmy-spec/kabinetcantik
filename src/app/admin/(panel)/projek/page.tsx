import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabaseServer";
import { supabaseReady } from "@/lib/supabase";
import { rm } from "@/lib/format";
import { fmtDate } from "@/lib/format";
import ProjectCreate, { QuoteOpt } from "@/components/admin/ProjectCreate";

export const dynamic = "force-dynamic";

interface ProjRow {
  id: string;
  tajuk: string;
  status: string;
  nilai_kontrak: number;
  created_at: string;
  customers?: { nama: string } | null;
}

export default async function ProjekPage() {
  let projects: ProjRow[] = [];
  let quotes: QuoteOpt[] = [];
  if (supabaseReady()) {
    const sb = createSupabaseServer();
    const { data: pr } = await sb.from("projects").select("id, tajuk, status, nilai_kontrak, created_at, customers(nama)").order("created_at", { ascending: false });
    projects = (pr || []) as unknown as ProjRow[];

    // Sebut harga diterima yang belum jadi projek
    const { data: accepted } = await sb.from("quotations").select("id, no_quote, leads(nama)").eq("status", "accepted");
    const usedQ = new Set(projects.map((p) => p.id)); // placeholder; filter by quotation_id below
    const { data: withProj } = await sb.from("projects").select("quotation_id");
    const usedQuoteIds = new Set((withProj || []).map((p: { quotation_id: string | null }) => p.quotation_id).filter(Boolean));
    void usedQ;
    quotes = ((accepted || []) as unknown as { id: string; no_quote: string; leads?: { nama: string } | null }[])
      .filter((q) => !usedQuoteIds.has(q.id))
      .map((q) => ({ id: q.id, no_quote: q.no_quote, nama: q.leads?.nama || "—" }));
  }

  return (
    <div>
      <h1 className="h-display text-2xl">Projek</h1>
      <p className="mt-1 text-sm text-ink/50">Fabrikasi → pemasangan → siap → warranti.</p>

      {supabaseReady() && (
        <div className="mt-4 rounded-xl border border-ink/10 bg-white p-4">
          <div className="text-xs uppercase tracking-wider text-ink/50">Cipta projek dari sebut harga diterima</div>
          <div className="mt-2"><ProjectCreate quotes={quotes} /></div>
        </div>
      )}

      {!supabaseReady() ? (
        <div className="mt-6 rounded-xl border border-dashed border-ink/20 bg-white p-8 text-center text-ink/50">Supabase belum dikonfigurasi.</div>
      ) : projects.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-ink/20 bg-white p-8 text-center text-ink/50">Belum ada projek.</div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-ink/10 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-ink/[0.03] text-left text-xs uppercase tracking-wider text-ink/50">
              <tr><th className="px-4 py-3">Projek</th><th className="px-4 py-3">Pelanggan</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Kontrak</th><th className="px-4 py-3">Tarikh</th></tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id} className="border-t border-ink/5 hover:bg-paper">
                  <td className="px-4 py-3"><Link href={`/admin/projek/${p.id}`} className="font-semibold text-brass hover:underline">{p.tajuk}</Link></td>
                  <td className="px-4 py-3 text-ink/80">{p.customers?.nama || "—"}</td>
                  <td className="px-4 py-3"><span className="rounded-full bg-ink/5 px-2.5 py-1 text-xs text-ink/70">{p.status}</span></td>
                  <td className="px-4 py-3 text-right font-semibold text-ink">{rm(p.nilai_kontrak)}</td>
                  <td className="px-4 py-3 text-ink/50">{fmtDate(p.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

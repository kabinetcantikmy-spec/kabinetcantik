import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabaseServer";
import { supabaseReady } from "@/lib/supabase";
import { Quotation } from "@/lib/crm";
import { rm } from "@/lib/format";
import { fmtDate } from "@/lib/format";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  draft: "Draf",
  sent: "Dihantar",
  accepted: "Diterima",
  rejected: "Ditolak",
};

export default async function QuotationsPage() {
  let quotes: (Quotation & { leads?: { nama: string } | null })[] = [];
  if (supabaseReady()) {
    const sb = createSupabaseServer();
    const { data } = await sb
      .from("quotations")
      .select("*, leads(nama)")
      .order("created_at", { ascending: false });
    quotes = (data || []) as typeof quotes;
  }

  return (
    <div>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="h-display text-2xl">Sebut Harga</h1>
          <p className="mt-1 text-sm text-ink/50">Cipta sebut harga dari halaman lead (butang “Bina Sebut Harga”).</p>
        </div>
        <a href="/api/export/quotations" className="text-sm text-brass hover:underline">Export CSV</a>
      </div>

      {!supabaseReady() ? (
        <div className="mt-6 rounded-xl border border-dashed border-ink/20 bg-white p-8 text-center text-ink/50">
          Supabase belum dikonfigurasi.
        </div>
      ) : quotes.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-ink/20 bg-white p-8 text-center text-ink/50">
          Belum ada sebut harga.
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-ink/10 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-ink/[0.03] text-left text-xs uppercase tracking-wider text-ink/50">
              <tr>
                <th className="px-4 py-3">No.</th>
                <th className="px-4 py-3">Pelanggan</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Jumlah</th>
                <th className="px-4 py-3">Tarikh</th>
              </tr>
            </thead>
            <tbody>
              {quotes.map((q) => (
                <tr key={q.id} className="border-t border-ink/5 hover:bg-paper">
                  <td className="px-4 py-3">
                    <Link href={`/admin/sebutharga/${q.id}`} className="font-semibold text-brass hover:underline">
                      {q.no_quote}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink/80">{q.leads?.nama || "—"}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-ink/5 px-2.5 py-1 text-xs text-ink/70">
                      {STATUS_LABEL[q.status] || q.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-ink">{rm(q.jumlah)}</td>
                  <td className="px-4 py-3 text-ink/50">{fmtDate(q.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

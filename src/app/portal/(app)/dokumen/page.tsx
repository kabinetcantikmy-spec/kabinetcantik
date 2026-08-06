import { requireCustomer } from "@/lib/supabaseServer";
import { createServiceClient, supabaseReady } from "@/lib/supabase";
import { rm } from "@/lib/format";
import { fmtDate } from "@/lib/format";

export const dynamic = "force-dynamic";

interface InvoiceRow {
  id: string;
  no_invois: string;
  jumlah: number;
  status: string;
  pdf_url: string | null;
  created_at: string;
  projects?: { tajuk: string } | null;
}

export default async function DokumenPage() {
  const cust = await requireCustomer();
  let invoices: InvoiceRow[] = [];
  if (supabaseReady()) {
    const sb = createServiceClient();
    const { data: projects } = await sb.from("projects").select("id").eq("customer_id", cust.customerId);
    const ids = (projects || []).map((p: { id: string }) => p.id);
    if (ids.length) {
      const { data } = await sb.from("invoices").select("*, projects(tajuk)").in("project_id", ids).order("created_at", { ascending: false });
      invoices = (data || []) as InvoiceRow[];
    }
  }

  return (
    <div>
      <h1 className="h-display text-2xl">Dokumen</h1>
      <p className="mt-1 text-sm text-ink/50">Invois, resit & dokumen warranti anda.</p>
      {invoices.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-ink/20 bg-white p-8 text-center text-ink/50">
          Belum ada dokumen. Invois akan muncul di sini bila dijana.
        </div>
      ) : (
        <div className="mt-6 divide-y divide-ink/5 rounded-xl border border-ink/10 bg-white">
          {invoices.map((inv) => (
            <div key={inv.id} className="flex items-center gap-3 px-4 py-3 text-sm">
              <div>
                <div className="font-semibold text-ink">{inv.no_invois}</div>
                <div className="text-xs text-ink/50">{inv.projects?.tajuk} · {fmtDate(inv.created_at)}</div>
              </div>
              <div className="ml-auto text-right">
                <div className="font-semibold text-ink">{rm(inv.jumlah)}</div>
                <div className={`text-xs ${inv.status === "paid" ? "text-green-600" : "text-amber-600"}`}>
                  {inv.status === "paid" ? "Dibayar" : "Belum dibayar"}
                </div>
              </div>
              {inv.pdf_url && (
                <a href={`/api/dokumen/${inv.id}`} target="_blank" rel="noopener noreferrer" className="ml-3 text-brass hover:underline">
                  PDF
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

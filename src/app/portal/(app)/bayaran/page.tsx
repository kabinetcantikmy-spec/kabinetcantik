import { requireCustomer } from "@/lib/supabaseServer";
import { createServiceClient, supabaseReady } from "@/lib/supabase";
import { Payment } from "@/lib/portal";
import { rm2 } from "@/lib/format";
import { fmtDate } from "@/lib/format";
import PayButton from "@/components/portal/PayButton";

export const dynamic = "force-dynamic";

const JENIS_LABEL: Record<string, string> = { deposit: "Deposit", progress: "Bayaran Progres", final: "Bayaran Akhir" };

export default async function BayaranPage(props: { searchParams: Promise<{ status?: string }> }) {
  const searchParams = await props.searchParams;
  const cust = await requireCustomer();
  let payments: (Payment & { projects?: { tajuk: string } | null })[] = [];
  if (supabaseReady()) {
    const sb = createServiceClient();
    const { data: projects } = await sb.from("projects").select("id").eq("customer_id", cust.customerId);
    const ids = (projects || []).map((p: { id: string }) => p.id);
    if (ids.length) {
      const { data } = await sb
        .from("payments")
        .select("*, projects(tajuk)")
        .in("project_id", ids)
        .order("created_at", { ascending: true });
      payments = (data || []) as typeof payments;
    }
  }

  return (
    <div>
      <h1 className="h-display text-2xl">Bayaran</h1>
      <p className="mt-1 text-sm text-ink/50">Bayar milestone secara selamat melalui CHIP (FPX / kad).</p>

      {searchParams?.status === "berjaya" && (
        <div className="mt-4 rounded-lg bg-green-100 px-4 py-3 text-sm text-green-700">Bayaran berjaya diterima. Terima kasih!</div>
      )}
      {searchParams?.status === "gagal" && (
        <div className="mt-4 rounded-lg bg-red-100 px-4 py-3 text-sm text-red-600">Bayaran tidak berjaya. Sila cuba lagi.</div>
      )}

      {payments.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-ink/20 bg-white p-8 text-center text-ink/50">
          Belum ada invois bayaran.
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-ink/10 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-ink/[0.03] text-left text-xs uppercase tracking-wider text-ink/50">
              <tr>
                <th className="px-4 py-3">Projek</th>
                <th className="px-4 py-3">Jenis</th>
                <th className="px-4 py-3 text-right">Jumlah</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-t border-ink/5">
                  <td className="px-4 py-3 text-ink/80">{p.projects?.tajuk || "—"}</td>
                  <td className="px-4 py-3">{JENIS_LABEL[p.jenis]}</td>
                  <td className="px-4 py-3 text-right font-semibold text-ink">{rm2(p.jumlah)}</td>
                  <td className="px-4 py-3">
                    {p.status === "paid" ? (
                      <span className="text-green-600">Dibayar · {fmtDate(p.dibayar_pada)}</span>
                    ) : (
                      <span className="text-amber-600">Belum dibayar</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {p.status === "paid" ? (
                      <a href={`/portal/bayaran/${p.id}/resit`} className="text-sm text-brass hover:underline" target="_blank">
                        Resit
                      </a>
                    ) : (
                      <PayButton paymentId={p.id} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

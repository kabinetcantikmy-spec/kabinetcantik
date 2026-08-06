import { requireSupplier } from "@/lib/supabaseServer";
import { createServiceClient, supabaseReady } from "@/lib/supabase";
import { rm2 } from "@/lib/format";
import { fmtDate } from "@/lib/format";
import ClaimForm from "@/components/ClaimForm";

export const dynamic = "force-dynamic";

const CLAIM_STATUS: Record<string, { label: string; cls: string }> = {
  baru: { label: "Baru", cls: "bg-amber-100 text-amber-700" },
  diluluskan: { label: "Diluluskan", cls: "bg-blue-100 text-blue-700" },
  ditolak: { label: "Ditolak", cls: "bg-red-100 text-red-600" },
  dibayar: { label: "Dibayar", cls: "bg-green-100 text-green-700" },
};

interface Claim { id: string; no_tuntutan: string; butiran: string | null; jumlah: number; status: string; created_at: string }
interface Voucher { id: string; no_baucer: string; jumlah: number; status: string; dibayar_pada: string | null }

export default async function SupplierDashboard() {
  const ctx = await requireSupplier();
  let status = "pending";
  let claims: Claim[] = [];
  let vouchers: Voucher[] = [];
  if (supabaseReady()) {
    const sb = createServiceClient();
    const { data: sup } = await sb.from("suppliers").select("status").eq("id", ctx.supplierId).single();
    status = sup?.status || "pending";
    const [{ data: c }, { data: v }] = await Promise.all([
      sb.from("supplier_claims").select("id, no_tuntutan, butiran, jumlah, status, created_at").eq("supplier_id", ctx.supplierId).order("created_at", { ascending: false }),
      sb.from("vouchers").select("id, no_baucer, jumlah, status, dibayar_pada").eq("supplier_id", ctx.supplierId).order("created_at", { ascending: false }),
    ]);
    claims = (c || []) as Claim[];
    vouchers = (v || []) as Voucher[];
  }

  const approved = status === "diluluskan";

  return (
    <div>
      <h1 className="h-display text-2xl">Selamat datang, {ctx.nama.split(" ")[0]}</h1>

      {/* Status banner */}
      <div className={`mt-4 rounded-xl p-4 text-sm ${approved ? "bg-green-100 text-green-700" : status === "ditolak" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-700"}`}>
        {approved ? "✓ Akaun anda telah diluluskan. Anda boleh hantar tuntutan." : status === "ditolak" ? "Maaf, permohonan anda tidak diluluskan. Sila hubungi kami." : "Akaun anda sedang disemak. Anda boleh hantar tuntutan selepas diluluskan."}
      </div>

      {approved && (
        <div className="mt-6">
          <ClaimForm />
        </div>
      )}

      {/* Claims */}
      <h2 className="mt-8 font-display text-lg font-semibold text-ink">Tuntutan anda</h2>
      <div className="mt-3 overflow-x-auto rounded-xl border border-ink/10 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-ink/[0.03] text-left text-xs uppercase tracking-wider text-ink/50">
            <tr><th className="px-4 py-3">No.</th><th className="px-4 py-3">Butiran</th><th className="px-4 py-3 text-right">Jumlah</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Tarikh</th></tr>
          </thead>
          <tbody>
            {claims.map((c) => {
              const st = CLAIM_STATUS[c.status] || CLAIM_STATUS.baru;
              return (
                <tr key={c.id} className="border-t border-ink/5">
                  <td className="px-4 py-3 font-medium text-ink">{c.no_tuntutan}</td>
                  <td className="px-4 py-3 text-ink/70">{c.butiran}</td>
                  <td className="px-4 py-3 text-right font-semibold text-ink">{rm2(c.jumlah)}</td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs ${st.cls}`}>{st.label}</span></td>
                  <td className="px-4 py-3 text-ink/50">{fmtDate(c.created_at)}</td>
                </tr>
              );
            })}
            {claims.length === 0 && <tr><td colSpan={5} className="px-4 py-6 text-center text-ink/40">Belum ada tuntutan.</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Vouchers */}
      {vouchers.length > 0 && (
        <>
          <h2 className="mt-8 font-display text-lg font-semibold text-ink">Baucer bayaran</h2>
          <div className="mt-3 space-y-2">
            {vouchers.map((v) => (
              <div key={v.id} className="flex items-center justify-between rounded-xl border border-ink/10 bg-white p-4 text-sm">
                <div>
                  <div className="font-medium text-ink">{v.no_baucer}</div>
                  <div className="text-xs text-ink/50">{v.status === "dibayar" ? `Dibayar ${fmtDate(v.dibayar_pada)}` : "Menunggu pembayaran"}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-ink">{rm2(v.jumlah)}</div>
                  <div className={`text-xs ${v.status === "dibayar" ? "text-green-600" : "text-amber-600"}`}>{v.status === "dibayar" ? "Dibayar" : "Pending"}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

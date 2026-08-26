import { createSupabaseServer, requireRole } from "@/lib/supabaseServer";
import { supabaseReady } from "@/lib/supabase";
import SupplierAdmin, { SupplierRow, ClaimRow, VoucherRow } from "@/components/admin/SupplierAdmin";

export const dynamic = "force-dynamic";

export default async function PembekalAdminPage() {
  await requireRole(["admin", "finance"]);
  let suppliers: SupplierRow[] = [];
  let claims: ClaimRow[] = [];
  let vouchers: VoucherRow[] = [];
  if (supabaseReady()) {
    const sb = createSupabaseServer();
    const [{ data: s }, { data: c }, { data: v }] = await Promise.all([
      sb.from("suppliers").select("*").order("created_at", { ascending: false }),
      sb.from("supplier_claims").select("id, no_tuntutan, butiran, jumlah, status, created_at, suppliers(nama)").order("created_at", { ascending: false }),
      sb.from("vouchers").select("id, no_baucer, jumlah, status, suppliers(nama)").order("created_at", { ascending: false }),
    ]);
    suppliers = (s || []) as SupplierRow[];
    claims = (c || []) as unknown as ClaimRow[];
    vouchers = (v || []) as unknown as VoucherRow[];
  }

  return (
    <div>
      <h1 className="h-display text-2xl">Pembekal & Tuntutan</h1>
      <p className="mt-1 text-sm text-ink/50">Kelulusan pembekal, tuntutan → baucer bayaran (Admin & Finance sahaja).</p>
      {!supabaseReady() ? (
        <div className="mt-6 rounded-xl border border-dashed border-ink/20 bg-white p-8 text-center text-ink/50">Supabase belum dikonfigurasi.</div>
      ) : (
        <div className="mt-6"><SupplierAdmin suppliers={suppliers} claims={claims} vouchers={vouchers} /></div>
      )}
    </div>
  );
}

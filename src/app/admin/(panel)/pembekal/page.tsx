import Link from "next/link";
import { createSupabaseServer, requireRole, requireStaff } from "@/lib/supabaseServer";
import { supabaseReady } from "@/lib/supabase";
import { planForOrg } from "@/lib/planServer";
import SupplierAdmin, { SupplierRow, ClaimRow, VoucherRow } from "@/components/admin/SupplierAdmin";

export const dynamic = "force-dynamic";

export default async function PembekalAdminPage() {
  await requireRole(["admin", "finance"]);
  const staff = await requireStaff();
  const { features } = await planForOrg(staff.orgId);
  if (!features.suppliers) {
    return (
      <div>
        <h1 className="h-display text-2xl">Pembekal & Tuntutan</h1>
        <div className="mt-6 rounded-2xl border border-brass/40 bg-brass/5 p-8 text-center">
          <div className="text-3xl">🔒</div>
          <h2 className="mt-3 font-display text-xl font-semibold text-ink">Ciri Pakej Pro</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink/60">
            Portal Pembekal &amp; Installer — urus rangkaian pembekal, tuntutan &amp; baucer bayaran — hanya untuk pakej <b>Pro</b>.
          </p>
          <Link href="/admin/tetapan" className="btn-brass mt-5 inline-block text-sm">Naik taraf ke Pro</Link>
        </div>
      </div>
    );
  }
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
    // Jana signed URL untuk dokumen KYB (bucket privat) — sah 1 jam, admin sahaja.
    suppliers = await Promise.all(((s || []) as Record<string, unknown>[]).map(async (row) => {
      const out = { ...row } as unknown as SupplierRow;
      const ssmPath = row.dok_ssm_url as string | null;
      const bankPath = row.dok_bank_url as string | null;
      if (ssmPath) { const { data: d } = await sb.storage.from("supplier-docs").createSignedUrl(ssmPath, 3600); out.dok_ssm_signed = d?.signedUrl || null; }
      if (bankPath) { const { data: d } = await sb.storage.from("supplier-docs").createSignedUrl(bankPath, 3600); out.dok_bank_signed = d?.signedUrl || null; }
      return out;
    }));
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

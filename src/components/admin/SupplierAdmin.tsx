"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { rm2 } from "@/lib/format";
import { fmtDate } from "@/lib/format";
import { setSupplierStatus, approveClaim, rejectClaim, markVoucherPaid } from "@/app/admin/(panel)/pembekal/actions";

export interface SupplierRow { id: string; nama: string; syarikat: string | null; jenis: string; status: string; telefon: string | null; emel: string | null; no_ssm: string | null; bank: string | null; no_akaun: string | null }
export interface ClaimRow { id: string; no_tuntutan: string; butiran: string | null; jumlah: number; status: string; created_at: string; suppliers?: { nama: string } | null }
export interface VoucherRow { id: string; no_baucer: string; jumlah: number; status: string; suppliers?: { nama: string } | null }

const SS: Record<string, string> = { pending: "bg-amber-100 text-amber-700", diluluskan: "bg-green-100 text-green-700", ditolak: "bg-red-100 text-red-600" };
const CS: Record<string, string> = { baru: "bg-amber-100 text-amber-700", diluluskan: "bg-blue-100 text-blue-700", ditolak: "bg-red-100 text-red-600", dibayar: "bg-green-100 text-green-700" };

export default function SupplierAdmin({ suppliers, claims, vouchers }: { suppliers: SupplierRow[]; claims: ClaimRow[]; vouchers: VoucherRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) =>
    startTransition(async () => { const r = await fn(); if (!r.ok) alert(r.error); else router.refresh(); });

  return (
    <div className="space-y-10">
      {/* Suppliers */}
      <section>
        <h2 className="font-display text-lg font-semibold text-ink">Pembekal / Installer</h2>
        <div className="mt-3 overflow-x-auto rounded-xl border border-ink/10 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-ink/[0.03] text-left text-xs uppercase tracking-wider text-ink/50">
              <tr><th className="px-4 py-3">Nama</th><th className="px-4 py-3">Jenis</th><th className="px-4 py-3">SSM / Bank</th><th className="px-4 py-3">Status</th><th className="px-4 py-3"></th></tr>
            </thead>
            <tbody>
              {suppliers.map((s) => (
                <tr key={s.id} className="border-t border-ink/5">
                  <td className="px-4 py-3">
                    <div className="font-medium text-ink">{s.nama}</div>
                    <div className="text-xs text-ink/50">{s.syarikat || "—"} · {s.telefon || ""}</div>
                  </td>
                  <td className="px-4 py-3 capitalize text-ink/70">{s.jenis}</td>
                  <td className="px-4 py-3 text-xs text-ink/60">{s.no_ssm || "—"}<br />{s.bank ? `${s.bank} ${s.no_akaun || ""}` : ""}</td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs ${SS[s.status]}`}>{s.status}</span></td>
                  <td className="px-4 py-3 text-right">
                    {s.status === "pending" && (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => run(() => setSupplierStatus(s.id, "diluluskan"))} disabled={pending} className="text-xs font-semibold text-green-600 hover:underline">Lulus</button>
                        <button onClick={() => run(() => setSupplierStatus(s.id, "ditolak"))} disabled={pending} className="text-xs text-red-500 hover:underline">Tolak</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {suppliers.length === 0 && <tr><td colSpan={5} className="px-4 py-6 text-center text-ink/40">Belum ada pembekal.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      {/* Claims */}
      <section>
        <h2 className="font-display text-lg font-semibold text-ink">Tuntutan</h2>
        <div className="mt-3 overflow-x-auto rounded-xl border border-ink/10 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-ink/[0.03] text-left text-xs uppercase tracking-wider text-ink/50">
              <tr><th className="px-4 py-3">No.</th><th className="px-4 py-3">Pembekal</th><th className="px-4 py-3">Butiran</th><th className="px-4 py-3 text-right">Jumlah</th><th className="px-4 py-3">Status</th><th className="px-4 py-3"></th></tr>
            </thead>
            <tbody>
              {claims.map((c) => (
                <tr key={c.id} className="border-t border-ink/5">
                  <td className="px-4 py-3 font-medium text-ink">{c.no_tuntutan}</td>
                  <td className="px-4 py-3 text-ink/70">{c.suppliers?.nama || "—"}</td>
                  <td className="px-4 py-3 max-w-xs truncate text-ink/60">{c.butiran}</td>
                  <td className="px-4 py-3 text-right font-semibold text-ink">{rm2(c.jumlah)}</td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs ${CS[c.status]}`}>{c.status}</span></td>
                  <td className="px-4 py-3 text-right">
                    {c.status === "baru" && (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => run(() => approveClaim(c.id))} disabled={pending} className="text-xs font-semibold text-green-600 hover:underline">Lulus → Baucer</button>
                        <button onClick={() => run(() => rejectClaim(c.id))} disabled={pending} className="text-xs text-red-500 hover:underline">Tolak</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {claims.length === 0 && <tr><td colSpan={6} className="px-4 py-6 text-center text-ink/40">Belum ada tuntutan.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      {/* Vouchers */}
      <section>
        <h2 className="font-display text-lg font-semibold text-ink">Baucer Bayaran</h2>
        <div className="mt-3 overflow-x-auto rounded-xl border border-ink/10 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-ink/[0.03] text-left text-xs uppercase tracking-wider text-ink/50">
              <tr><th className="px-4 py-3">No.</th><th className="px-4 py-3">Pembekal</th><th className="px-4 py-3 text-right">Jumlah</th><th className="px-4 py-3">Status</th><th className="px-4 py-3"></th></tr>
            </thead>
            <tbody>
              {vouchers.map((v) => (
                <tr key={v.id} className="border-t border-ink/5">
                  <td className="px-4 py-3 font-medium text-ink">{v.no_baucer}</td>
                  <td className="px-4 py-3 text-ink/70">{v.suppliers?.nama || "—"}</td>
                  <td className="px-4 py-3 text-right font-semibold text-ink">{rm2(v.jumlah)}</td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs ${v.status === "dibayar" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>{v.status}</span></td>
                  <td className="px-4 py-3 text-right">
                    {v.status === "pending" && (
                      <button onClick={() => run(() => markVoucherPaid(v.id))} disabled={pending} className="text-xs font-semibold text-brass hover:underline">Tanda Dibayar</button>
                    )}
                  </td>
                </tr>
              ))}
              {vouchers.length === 0 && <tr><td colSpan={5} className="px-4 py-6 text-center text-ink/40">Belum ada baucer.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

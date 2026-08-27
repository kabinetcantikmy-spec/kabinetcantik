"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { rm2 } from "@/lib/format";
import { fmtDate } from "@/lib/format";
import { setSupplierStatus, approveClaim, rejectClaim, markVoucherPaid } from "@/app/admin/(panel)/pembekal/actions";

export interface SupplierRow { id: string; nama: string; syarikat: string | null; jenis: string; status: string; telefon: string | null; emel: string | null; no_ssm: string | null; bank: string | null; no_akaun: string | null; jenis_entiti?: string | null; alamat?: string | null; pemilik?: string | null; no_ic?: string | null; profil_lengkap?: boolean; dok_ssm_signed?: string | null; dok_bank_signed?: string | null }
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
        <p className="mt-1 text-xs text-ink/50">Semak butiran KYB &amp; dokumen sebelum luluskan. Kelulusan dibuka hanya bila profil lengkap.</p>
        <div className="mt-3 space-y-3">
          {suppliers.map((s) => (
            <div key={s.id} className="rounded-xl border border-ink/10 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-medium text-ink">
                    {s.nama} <span className="ml-1 text-xs capitalize text-ink/40">· {s.jenis}</span>
                  </div>
                  <div className="text-xs text-ink/50">{s.emel} {s.telefon ? `· ${s.telefon}` : ""}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${s.profil_lengkap ? "bg-emerald-100 text-emerald-700" : "bg-ink/5 text-ink/50"}`}>{s.profil_lengkap ? "Profil lengkap" : "Profil belum lengkap"}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs ${SS[s.status]}`}>{s.status}</span>
                </div>
              </div>

              {/* Butiran KYB */}
              <div className="mt-3 grid gap-x-6 gap-y-1 text-xs text-ink/70 sm:grid-cols-2">
                <div><span className="text-ink/40">Syarikat:</span> {s.syarikat || "—"} {s.jenis_entiti ? `(${s.jenis_entiti})` : ""}</div>
                <div><span className="text-ink/40">No. SSM:</span> {s.no_ssm || "—"}</div>
                <div><span className="text-ink/40">Pemilik:</span> {s.pemilik || "—"} {s.no_ic ? `· ${s.no_ic}` : ""}</div>
                <div><span className="text-ink/40">Bank:</span> {s.bank ? `${s.bank} ${s.no_akaun || ""}` : "—"}</div>
                <div className="sm:col-span-2"><span className="text-ink/40">Alamat:</span> {s.alamat || "—"}</div>
              </div>

              {/* Dokumen KYB (signed URL) */}
              <div className="mt-3 flex flex-wrap gap-2">
                {s.dok_ssm_signed
                  ? <a href={s.dok_ssm_signed} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-ink/15 px-3 py-1.5 text-xs text-brass hover:bg-paper">📄 Sijil SSM ↗</a>
                  : <span className="rounded-lg border border-dashed border-ink/15 px-3 py-1.5 text-xs text-ink/40">Sijil SSM: tiada</span>}
                {s.dok_bank_signed
                  ? <a href={s.dok_bank_signed} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-ink/15 px-3 py-1.5 text-xs text-brass hover:bg-paper">📄 Bukti bank ↗</a>
                  : <span className="rounded-lg border border-dashed border-ink/15 px-3 py-1.5 text-xs text-ink/40">Bukti bank: tiada</span>}
              </div>

              {/* Tindakan */}
              {s.status === "pending" && (
                <div className="mt-3 flex items-center gap-3 border-t border-ink/5 pt-3">
                  {s.profil_lengkap ? (
                    <>
                      <button onClick={() => run(() => setSupplierStatus(s.id, "diluluskan"))} disabled={pending} className="rounded-lg bg-green-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-60">Luluskan</button>
                      <button onClick={() => run(() => setSupplierStatus(s.id, "ditolak"))} disabled={pending} className="text-xs text-red-500 hover:underline">Tolak</button>
                    </>
                  ) : (
                    <span className="text-xs text-ink/40">Menunggu pembekal lengkapkan profil KYB sebelum boleh diluluskan.</span>
                  )}
                </div>
              )}
            </div>
          ))}
          {suppliers.length === 0 && <div className="rounded-xl border border-ink/10 bg-white px-4 py-6 text-center text-sm text-ink/40">Belum ada pembekal.</div>}
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

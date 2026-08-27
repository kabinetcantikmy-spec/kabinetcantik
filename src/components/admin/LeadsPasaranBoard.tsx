"use client";
import { useMemo, useState, useTransition } from "react";
import { claimMarketplaceLead } from "@/app/admin/(panel)/leads-pasaran/actions";
import type { BoardLead, LeadUsage } from "@/lib/marketplaceServer";

interface Revealed { nama: string; telefon: string; emel: string | null }

export default function LeadsPasaranBoard({ leads, usage }: { leads: BoardLead[]; usage: LeadUsage }) {
  const [used, setUsed] = useState(usage.used);
  const [revealed, setRevealed] = useState<Record<string, Revealed>>({});
  const [gone, setGone] = useState<Set<string>>(new Set());
  const [q, setQ] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const [flash, setFlash] = useState("");

  const left = Math.max(0, usage.limit - used);
  const habis = left <= 0;

  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    return leads.filter((l) => {
      if (gone.has(l.id) && !revealed[l.id]) return false;
      if (!s) return true;
      return (l.poskod || "").toLowerCase().includes(s) || (l.kawasan || "").toLowerCase().includes(s);
    });
  }, [leads, q, gone, revealed]);

  function buka(id: string) {
    if (habis || pendingId) return;
    setFlash("");
    setPendingId(id);
    startTransition(async () => {
      const r = await claimMarketplaceLead(id);
      setPendingId(null);
      if (r.ok && r.lead) {
        setRevealed((m) => ({ ...m, [id]: { nama: r.lead!.nama, telefon: r.lead!.telefon, emel: r.lead!.emel } }));
        setUsed((u) => u + 1);
      } else if (r.taken) {
        setGone((g) => new Set(g).add(id));
        setFlash("Lead itu baru sahaja dibuka kontraktor lain. Ia dah dibuang dari papan.");
      } else if (r.quotaHabis) {
        setFlash("Kuota lead bulan ini sudah habis.");
      } else {
        setFlash(r.error || "Gagal membuka lead. Cuba lagi.");
      }
    });
  }

  const pct = usage.limit > 0 ? Math.min(100, Math.round((used / usage.limit) * 100)) : 0;

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="h-display text-2xl">Leads Pasaran</h1>
          <p className="mt-1 text-sm text-ink/60">Lead baru dari KabinetCantik. Buka satu = eksklusif untuk anda &amp; terus masuk Sales/CRM.</p>
        </div>
        <div className="min-w-[200px] sm:text-right">
          <div className="h-2 overflow-hidden rounded-full bg-ink/10">
            <div className="h-full rounded-full bg-brass transition-all" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-1.5 text-xs text-ink/60">Lead bulan ini: <b className="text-ink">{used} / {usage.limit}</b> dibuka</p>
        </div>
      </div>

      {/* Tapis kawasan */}
      <div className="mt-4">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Tapis ikut poskod atau kawasan… (cth 40150 / Shah Alam)"
          className="w-full max-w-sm rounded-lg border border-ink/15 bg-white px-4 py-2.5 text-sm"
        />
      </div>

      {habis && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Kuota lead bulan ini sudah habis. Papan masih boleh dilihat — kuota akan reset awal bulan depan.
        </div>
      )}
      {flash && <div className="mt-4 rounded-xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink/70">{flash}</div>}

      {shown.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-ink/15 bg-white p-10 text-center text-ink/50">
          Belum ada lead tersedia buat masa ini. Lead baru akan muncul di sini.
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {shown.map((l) => {
            const rev = revealed[l.id];
            return (
              <div key={l.id} className={`rounded-2xl border p-5 ${rev ? "border-emerald-300 bg-emerald-50/40" : "border-ink/10 bg-white"}`}>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-ink">{rev ? rev.nama : l.namaMasked}</span>
                  {rev
                    ? <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">Dibuka</span>
                    : <span className="rounded-full bg-emerald-600/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">Baru</span>}
                </div>

                <div className="mt-3 grid grid-cols-2 gap-1.5 text-[13px] text-ink/70">
                  <div><span className="text-ink/40">Poskod:</span> {l.poskod || "—"}{l.kawasan ? ` · ${l.kawasan}` : ""}</div>
                  <div><span className="text-ink/40">Jenis:</span> {l.kategori || "—"}</div>
                  <div><span className="text-ink/40">Bajet:</span> {l.bajet || "—"}</div>
                  <div><span className="text-ink/40">Mula:</span> {l.timeline || "—"}</div>
                </div>
                {l.keterangan && <p className="mt-2 text-[13px] italic text-ink/60">&ldquo;{l.keterangan}&rdquo;</p>}

                <div className="mt-3 border-t border-ink/10 pt-3">
                  {rev ? (
                    <div>
                      <p className="text-sm font-semibold text-emerald-700">📞 {rev.telefon}{rev.emel ? ` · ✉ ${rev.emel}` : ""}</p>
                      <p className="mt-1 text-xs font-medium text-emerald-700/80">✓ Sudah masuk Sales / CRM anda</p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => buka(l.id)}
                        disabled={habis || pendingId === l.id}
                        className="btn-brass disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {pendingId === l.id ? "Membuka…" : "Buka lead ni"}
                      </button>
                      <span className="text-xs text-ink/45">🔒 Telefon disorok · Percuma</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

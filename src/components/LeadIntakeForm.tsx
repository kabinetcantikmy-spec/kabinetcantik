"use client";
import { useState, useTransition } from "react";
import { submitMarketplaceLead } from "@/app/(site)/cari-kontraktor/actions";

const KATEGORI = ["Kabinet dapur", "Wardrobe / almari", "Kabinet TV / feature wall", "Table top / island", "Kabinet lain"];
const BAJET = ["Bawah RM5k", "RM5k – RM10k", "RM10k – RM20k", "RM20k – RM40k", "Lebih RM40k", "Belum pasti"];
const TIMELINE = ["Secepat mungkin", "Dalam 1 bulan", "1 – 3 bulan", "Sekadar tinjau harga"];

const inputCls = "w-full rounded-lg border border-ink/15 bg-paper px-4 py-3";

export default function LeadIntakeForm() {
  const [f, setF] = useState({ nama: "", telefon: "", emel: "", poskod: "", kawasan: "", kategori: "", bajet: "", timeline: "", keterangan: "" });
  const [consent, setConsent] = useState(false);
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setF((s) => ({ ...s, [k]: e.target.value }));

  if (done) {
    return (
      <div className="rounded-2xl border border-ink/10 bg-white p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brass/15 text-2xl text-brass">✓</div>
        <h2 className="mt-4 font-display text-xl font-semibold text-ink">Terima kasih!</h2>
        <p className="mt-2 text-ink/60">Permintaan anda dah kami terima. Kontraktor kabinet berdaftar akan hubungi anda tak lama lagi.</p>
      </div>
    );
  }

  function submit() {
    setErr("");
    if (!f.nama.trim() || !f.telefon.trim()) { setErr("Sila isi nama & nombor telefon."); return; }
    if (!/^\d{5}$/.test(f.poskod.trim())) { setErr("Poskod perlu 5 digit. Cth: 40150."); return; }
    if (!f.kategori) { setErr("Sila pilih jenis kerja."); return; }
    if (!consent) { setErr("Sila tanda kotak persetujuan di bawah."); return; }
    startTransition(async () => {
      const r = await submitMarketplaceLead({ ...f, consent });
      if (r.ok) setDone(true);
      else setErr(r.error || "Gagal menghantar. Cuba lagi.");
    });
  }

  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-6">
      <div className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <input value={f.nama} onChange={set("nama")} placeholder="Nama anda *" className={inputCls} />
          <input value={f.telefon} onChange={set("telefon")} placeholder="No. telefon (WhatsApp) *" className={inputCls} />
        </div>
        <input type="email" value={f.emel} onChange={set("emel")} placeholder="Emel (pilihan)" className={inputCls} />
        <div className="grid gap-3 sm:grid-cols-2">
          <input value={f.poskod} onChange={set("poskod")} inputMode="numeric" maxLength={5} placeholder="Poskod * (cth 40150)" className={inputCls} />
          <input value={f.kawasan} onChange={set("kawasan")} placeholder="Kawasan (cth Shah Alam)" className={inputCls} />
        </div>
        <select value={f.kategori} onChange={set("kategori")} className={inputCls + (f.kategori ? "" : " text-ink/45")}>
          <option value="">Jenis kerja *</option>
          {KATEGORI.map((k) => <option key={k} value={k} className="text-ink">{k}</option>)}
        </select>
        <div className="grid gap-3 sm:grid-cols-2">
          <select value={f.bajet} onChange={set("bajet")} className={inputCls + (f.bajet ? "" : " text-ink/45")}>
            <option value="">Anggaran bajet</option>
            {BAJET.map((k) => <option key={k} value={k} className="text-ink">{k}</option>)}
          </select>
          <select value={f.timeline} onChange={set("timeline")} className={inputCls + (f.timeline ? "" : " text-ink/45")}>
            <option value="">Bila nak mula</option>
            {TIMELINE.map((k) => <option key={k} value={k} className="text-ink">{k}</option>)}
          </select>
        </div>
        <textarea value={f.keterangan} onChange={set("keterangan")} placeholder="Cerita sikit projek anda (pilihan)" className="h-20 w-full rounded-lg border border-ink/15 bg-paper px-4 py-3" />

        <label className="flex items-start gap-2 text-xs text-ink/55">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5" />
          <span>Saya setuju maklumat ini dikongsi dengan <b>satu</b> kontraktor kabinet berdaftar KabinetCantik untuk menghubungi saya. (PDPA)</span>
        </label>

        {err && <p className="text-sm text-red-600">{err}</p>}
        <button onClick={submit} disabled={pending} className="btn-brass w-full">
          {pending ? "Menghantar…" : "Hantar & dapatkan sebut harga"}
        </button>
        <p className="text-center text-[11px] text-ink/40">Percuma. Tiada bayaran dikenakan kepada anda.</p>
      </div>
    </div>
  );
}

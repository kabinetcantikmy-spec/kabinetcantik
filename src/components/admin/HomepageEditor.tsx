"use client";
import { useState } from "react";
import { saveHomepageConfig } from "@/app/admin/(panel)/tetapan/actions";
import { HomepageConfig } from "@/lib/homepage";

export default function HomepageEditor({ initial }: { initial: HomepageConfig }) {
  const [c, setC] = useState<HomepageConfig>(initial);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  function setField<K extends keyof HomepageConfig>(k: K, v: HomepageConfig[K]) {
    setC((prev) => ({ ...prev, [k]: v }));
  }
  function setStat(i: number, key: "n" | "l", v: string) {
    setC((prev) => {
      const stats = prev.stats.slice();
      stats[i] = { ...stats[i], [key]: v };
      return { ...prev, stats };
    });
  }

  async function save() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await saveHomepageConfig(c);
      setMsg(res.ok ? { ok: true, text: "Disimpan. Laman awam dikemas kini." } : { ok: false, text: res.error || "Gagal simpan." });
    } catch {
      setMsg({ ok: false, text: "Ada masalah. Cuba lagi." });
    } finally {
      setBusy(false);
    }
  }

  const input = "mt-1 w-full rounded-lg border border-ink/15 bg-paper px-3 py-2 text-sm";
  const label = "text-xs font-medium text-ink/60";

  return (
    <div className="rounded-xl border border-ink/10 bg-white p-5">
      <h2 className="font-display text-lg font-semibold">Laman Awam (Homepage)</h2>
      <p className="mt-1 text-sm text-ink/50">Teks & maklumat yang dipapar di laman utama syarikat anda.</p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={label}>Eyebrow (baris kecil atas tajuk)</label>
          <input className={input} value={c.heroEyebrow} onChange={(e) => setField("heroEyebrow", e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label className={label}>Tajuk utama (hero)</label>
          <input className={input} value={c.heroTitle} onChange={(e) => setField("heroTitle", e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label className={label}>Tagline</label>
          <input className={input} value={c.heroTagline} onChange={(e) => setField("heroTagline", e.target.value)} />
        </div>
      </div>

      <div className="mt-5">
        <div className={label}>3 Statistik</div>
        <div className="mt-2 grid gap-3 sm:grid-cols-3">
          {c.stats.map((s, i) => (
            <div key={i} className="space-y-2 rounded-lg border border-ink/10 p-3">
              <input className={input} placeholder="cth: 10+" value={s.n} onChange={(e) => setStat(i, "n", e.target.value)} />
              <input className={input} placeholder="cth: Tahun pengalaman" value={s.l} onChange={(e) => setStat(i, "l", e.target.value)} />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label}>Nombor WhatsApp</label>
          <input className={input} placeholder="cth: 60123456789" value={c.whatsapp} onChange={(e) => setField("whatsapp", e.target.value)} />
          <p className="mt-1 text-xs text-ink/40">Kosong = butang WhatsApp disembunyikan.</p>
        </div>
        <div>
          <label className={label}>Kawasan servis</label>
          <input className={input} placeholder="cth: Klang Valley" value={c.serviceArea} onChange={(e) => setField("serviceArea", e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label className={label}>Alamat showroom (pilihan)</label>
          <input className={input} value={c.showroomAddress} onChange={(e) => setField("showroomAddress", e.target.value)} />
        </div>
      </div>

      {msg && (
        <p className={`mt-4 rounded-lg px-3 py-2 text-sm ${msg.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{msg.text}</p>
      )}
      <button onClick={save} disabled={busy} className="btn-brass mt-4 text-sm disabled:opacity-60">
        {busy ? "Menyimpan…" : "Simpan Laman"}
      </button>
    </div>
  );
}

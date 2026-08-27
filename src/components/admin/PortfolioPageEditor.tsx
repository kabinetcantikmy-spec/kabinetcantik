"use client";
import { useState } from "react";
import { savePortfolioPage } from "@/app/admin/(panel)/tetapan/actions";
import { PortfolioPageConfig } from "@/lib/siteContent";

export default function PortfolioPageEditor({ initial }: { initial: PortfolioPageConfig }) {
  const [c, setC] = useState<PortfolioPageConfig>(initial);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  function setTop<K extends keyof PortfolioPageConfig>(k: K, v: PortfolioPageConfig[K]) {
    setC((p) => ({ ...p, [k]: v }));
  }

  async function save() {
    setBusy(true); setMsg(null);
    try {
      const res = await savePortfolioPage(c);
      setMsg(res.ok ? { ok: true, text: "Disimpan. Halaman Portfolio dikemas kini." } : { ok: false, text: res.error || "Gagal simpan." });
    } catch {
      setMsg({ ok: false, text: "Ada masalah. Cuba lagi." });
    } finally { setBusy(false); }
  }

  const input = "mt-1 w-full rounded-lg border border-ink/15 bg-paper px-3 py-2 text-sm";
  const label = "text-xs font-medium text-ink/60";

  return (
    <div className="rounded-xl border border-ink/10 bg-white p-5">
      <h2 className="font-display text-lg font-semibold">Halaman Portfolio</h2>
      <p className="mt-1 text-sm text-ink/50">Tajuk & intro halaman. Projek datang automatik dari senarai projek anda.</p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label}>Eyebrow</label>
          <input className={input} value={c.eyebrow} onChange={(e) => setTop("eyebrow", e.target.value)} />
        </div>
        <div>
          <label className={label}>Tajuk halaman</label>
          <input className={input} value={c.title} onChange={(e) => setTop("title", e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label className={label}>Perenggan intro</label>
          <textarea className={input + " h-16"} value={c.intro} onChange={(e) => setTop("intro", e.target.value)} />
        </div>
      </div>

      {msg && (
        <p className={`mt-4 rounded-lg px-3 py-2 text-sm ${msg.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{msg.text}</p>
      )}
      <button onClick={save} disabled={busy} className="btn-brass mt-4 text-sm disabled:opacity-60">
        {busy ? "Menyimpan…" : "Simpan Portfolio"}
      </button>
    </div>
  );
}

"use client";
import { useState } from "react";
import { savePrivacyPage } from "@/app/admin/(panel)/tetapan/actions";
import { PrivacyPageConfig } from "@/lib/siteContent";

export default function PrivacyPageEditor({ initial }: { initial: PrivacyPageConfig }) {
  const [c, setC] = useState<PrivacyPageConfig>(initial);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  function setTop<K extends keyof PrivacyPageConfig>(k: K, v: PrivacyPageConfig[K]) {
    setC((p) => ({ ...p, [k]: v }));
  }
  async function save() {
    setBusy(true); setMsg(null);
    try {
      const res = await savePrivacyPage(c);
      setMsg(res.ok ? { ok: true, text: "Disimpan. Halaman Privasi dikemas kini." } : { ok: false, text: res.error || "Gagal simpan." });
    } catch {
      setMsg({ ok: false, text: "Ada masalah. Cuba lagi." });
    } finally { setBusy(false); }
  }

  const input = "mt-1 w-full rounded-lg border border-ink/15 bg-paper px-3 py-2 text-sm";
  const label = "text-xs font-medium text-ink/60";

  return (
    <div className="rounded-xl border border-ink/10 bg-white p-5">
      <h2 className="font-display text-lg font-semibold">Halaman Dasar Privasi</h2>
      <p className="mt-1 text-sm text-ink/50">
        Tulis dasar privasi anda. Guna <code className="rounded bg-paper px-1">{"{{brand}}"}</code> di mana-mana untuk auto-isi nama syarikat anda. Baris kosong = perenggan baru.
      </p>

      <div className="mt-4 grid gap-4">
        <div>
          <label className={label}>Tajuk halaman</label>
          <input className={input} value={c.title} onChange={(e) => setTop("title", e.target.value)} />
        </div>
        <div>
          <label className={label}>Kandungan dasar privasi</label>
          <textarea className={input + " h-64 font-mono"} value={c.body} onChange={(e) => setTop("body", e.target.value)} />
        </div>
      </div>

      {msg && (
        <p className={`mt-4 rounded-lg px-3 py-2 text-sm ${msg.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{msg.text}</p>
      )}
      <button onClick={save} disabled={busy} className="btn-brass mt-4 text-sm disabled:opacity-60">
        {busy ? "Menyimpan…" : "Simpan Privasi"}
      </button>
    </div>
  );
}

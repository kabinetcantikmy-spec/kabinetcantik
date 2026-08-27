"use client";
import { useState } from "react";
import { saveContactPage } from "@/app/admin/(panel)/tetapan/actions";
import { ContactPageConfig } from "@/lib/siteContent";

export default function ContactPageEditor({ initial }: { initial: ContactPageConfig }) {
  const [c, setC] = useState<ContactPageConfig>(initial);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  function setTop<K extends keyof ContactPageConfig>(k: K, v: ContactPageConfig[K]) {
    setC((p) => ({ ...p, [k]: v }));
  }
  async function save() {
    setBusy(true); setMsg(null);
    try {
      const res = await saveContactPage(c);
      setMsg(res.ok ? { ok: true, text: "Disimpan. Halaman Hubungi dikemas kini." } : { ok: false, text: res.error || "Gagal simpan." });
    } catch {
      setMsg({ ok: false, text: "Ada masalah. Cuba lagi." });
    } finally { setBusy(false); }
  }

  const input = "mt-1 w-full rounded-lg border border-ink/15 bg-paper px-3 py-2 text-sm";
  const label = "text-xs font-medium text-ink/60";

  return (
    <div className="rounded-xl border border-ink/10 bg-white p-5">
      <h2 className="font-display text-lg font-semibold">Halaman Hubungi (Contact)</h2>
      <p className="mt-1 text-sm text-ink/50">Teks halaman. Nombor WhatsApp, kawasan servis & alamat showroom diambil dari editor Homepage.</p>

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
        <div>
          <label className={label}>Teks butang WhatsApp</label>
          <input className={input} value={c.waButton} onChange={(e) => setTop("waButton", e.target.value)} />
        </div>
        <div>
          <label className={label}>Label &quot;Kawasan servis&quot;</label>
          <input className={input} value={c.areaLabel} onChange={(e) => setTop("areaLabel", e.target.value)} />
        </div>
        <div>
          <label className={label}>Label &quot;Showroom&quot;</label>
          <input className={input} value={c.showroomLabel} onChange={(e) => setTop("showroomLabel", e.target.value)} />
        </div>
        <div>
          <label className={label}>Teks pautan sebut harga</label>
          <input className={input} value={c.quoteLink} onChange={(e) => setTop("quoteLink", e.target.value)} />
        </div>
      </div>

      {msg && (
        <p className={`mt-4 rounded-lg px-3 py-2 text-sm ${msg.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{msg.text}</p>
      )}
      <button onClick={save} disabled={busy} className="btn-brass mt-4 text-sm disabled:opacity-60">
        {busy ? "Menyimpan…" : "Simpan Hubungi"}
      </button>
    </div>
  );
}

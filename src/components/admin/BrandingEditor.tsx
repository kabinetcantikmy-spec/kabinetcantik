"use client";
import { useState } from "react";
import { saveBranding, uploadBrandingLogo } from "@/app/admin/(panel)/tetapan/actions";

export default function BrandingEditor({
  initial,
  orgId,
}: {
  initial: { nama: string; logoUrl: string };
  orgId: string;
}) {
  const [nama, setNama] = useState(initial.nama);
  const [logoUrl, setLogoUrl] = useState(initial.logoUrl);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true);
    setMsg(null);
    try {
      const fd = new FormData();
      fd.append("file", f);
      const res = await uploadBrandingLogo(fd);
      if (!res.ok || !res.url) throw new Error(res.error || "gagal");
      setLogoUrl(res.url);
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : "Muat naik logo gagal. Cuba imej lain (PNG/JPG)." });
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await saveBranding({ nama, logoUrl });
      setMsg(res.ok ? { ok: true, text: "Jenama disimpan. Laman & panel dikemas kini." } : { ok: false, text: res.error || "Gagal simpan." });
    } catch {
      setMsg({ ok: false, text: "Ada masalah. Cuba lagi." });
    } finally {
      setBusy(false);
    }
  }

  const input = "mt-1 w-full rounded-lg border border-ink/15 bg-paper px-3 py-2 text-sm";
  const label = "text-xs font-medium text-ink/60";

  return (
    <div className="rounded-xl border border-ink/10 bg-white p-5" data-org={orgId}>
      <h2 className="font-display text-lg font-semibold">Jenama (Logo & Nama)</h2>
      <p className="mt-1 text-sm text-ink/50">Logo & nama syarikat yang dipapar di laman, panel & emel.</p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label}>Nama syarikat</label>
          <input className={input} value={nama} onChange={(e) => setNama(e.target.value)} />
        </div>
        <div>
          <label className={label}>Logo</label>
          <div className="mt-1 flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoUrl || "/logo-mark.png"} alt="Logo" className="h-12 w-12 rounded border border-ink/10 bg-paper object-contain" />
            <label className="cursor-pointer rounded-lg border border-ink/15 px-3 py-2 text-sm hover:bg-paper">
              {uploading ? "Memuat naik…" : "Tukar logo"}
              <input type="file" accept="image/*" className="hidden" onChange={onFile} disabled={uploading} />
            </label>
          </div>
          <p className="mt-1 text-xs text-ink/40">PNG/JPG. Latar telus (PNG) paling kemas.</p>
        </div>
      </div>

      {msg && (
        <p className={`mt-4 rounded-lg px-3 py-2 text-sm ${msg.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{msg.text}</p>
      )}
      <button onClick={save} disabled={busy || uploading} className="btn-brass mt-4 text-sm disabled:opacity-60">
        {busy ? "Menyimpan…" : "Simpan Jenama"}
      </button>
    </div>
  );
}

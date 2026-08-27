"use client";
import { useState } from "react";
import { saveServices, uploadHomepageImage } from "@/app/admin/(panel)/tetapan/actions";
import { ServicesConfig } from "@/lib/siteContent";

async function downscaleImage(file: File, maxDim = 1600, quality = 0.85): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  try {
    const url = URL.createObjectURL(file);
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = () => rej(new Error("Gagal muat imej."));
      i.src = url;
    });
    const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
    if (scale >= 1 && file.size < 1_200_000) { URL.revokeObjectURL(url); return file; }
    const w = Math.max(1, Math.round(img.width * scale));
    const h = Math.max(1, Math.round(img.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) { URL.revokeObjectURL(url); return file; }
    ctx.drawImage(img, 0, 0, w, h);
    URL.revokeObjectURL(url);
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/jpeg", quality));
    return blob ? new File([blob], "gambar.jpg", { type: "image/jpeg" }) : file;
  } catch {
    return file;
  }
}

export default function ServicesEditor({ initial }: { initial: ServicesConfig }) {
  const [c, setC] = useState<ServicesConfig>(initial);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  function setTop<K extends keyof ServicesConfig>(k: K, v: ServicesConfig[K]) {
    setC((p) => ({ ...p, [k]: v }));
  }
  function setItem(i: number, key: "nama" | "ringkas" | "penuh" | "img", v: string) {
    setC((p) => { const items = p.items.slice(); items[i] = { ...items[i], [key]: v }; return { ...p, items }; });
  }
  function setCiri(i: number, text: string) {
    const ciri = text.split(/\n/).map((x) => x.trim()).filter(Boolean);
    setC((p) => { const items = p.items.slice(); items[i] = { ...items[i], ciri }; return { ...p, items }; });
  }

  async function onImg(e: React.ChangeEvent<HTMLInputElement>, i: number, slug: string) {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading("svc-detail-" + slug);
    setMsg(null);
    try {
      const blob = await downscaleImage(f);
      const fd = new FormData();
      fd.append("file", blob);
      fd.append("slot", "svc-detail-" + slug);
      const res = await uploadHomepageImage(fd);
      if (!res.ok || !res.url) throw new Error(res.error || "gagal");
      setItem(i, "img", res.url);
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : "Muat naik imej gagal." });
    } finally {
      setUploading(null);
    }
  }

  async function save() {
    setBusy(true); setMsg(null);
    try {
      const res = await saveServices(c);
      setMsg(res.ok ? { ok: true, text: "Disimpan. Halaman Perkhidmatan dikemas kini." } : { ok: false, text: res.error || "Gagal simpan." });
    } catch {
      setMsg({ ok: false, text: "Ada masalah. Cuba lagi." });
    } finally { setBusy(false); }
  }

  const input = "mt-1 w-full rounded-lg border border-ink/15 bg-paper px-3 py-2 text-sm";
  const label = "text-xs font-medium text-ink/60";

  return (
    <div className="rounded-xl border border-ink/10 bg-white p-5">
      <h2 className="font-display text-lg font-semibold">Halaman Perkhidmatan</h2>
      <p className="mt-1 text-sm text-ink/50">Tajuk halaman & 4 perkhidmatan (nama, penerangan, ciri, gambar).</p>

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

      <div className="mt-5 space-y-4">
        {c.items.map((s, i) => (
          <div key={s.slug} className="rounded-lg border border-ink/10 p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-brass">{s.slug}</div>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              <div>
                <label className={label}>Nama</label>
                <input className={input} value={s.nama} onChange={(e) => setItem(i, "nama", e.target.value)} />
              </div>
              <div>
                <label className={label}>Ringkas (untuk kad)</label>
                <input className={input} value={s.ringkas} onChange={(e) => setItem(i, "ringkas", e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <label className={label}>Penerangan penuh</label>
                <textarea className={input + " h-24"} value={s.penuh} onChange={(e) => setItem(i, "penuh", e.target.value)} />
              </div>
              <div>
                <label className={label}>Ciri (satu per baris)</label>
                <textarea className={input + " h-24"} value={s.ciri.join("\n")} onChange={(e) => setCiri(i, e.target.value)} />
              </div>
              <div>
                <label className={label}>Gambar</label>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.img} alt={s.nama} className="mt-1 aspect-video w-full rounded border border-ink/10 object-cover" />
                <label className="mt-2 block cursor-pointer rounded-lg border border-ink/15 px-3 py-2 text-center text-xs hover:bg-paper">
                  {uploading === "svc-detail-" + s.slug ? "Memuat naik…" : "Tukar gambar"}
                  <input type="file" accept="image/*" className="hidden" disabled={uploading !== null} onChange={(e) => onImg(e, i, s.slug)} />
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>

      {msg && (
        <p className={`mt-4 rounded-lg px-3 py-2 text-sm ${msg.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{msg.text}</p>
      )}
      <button onClick={save} disabled={busy} className="btn-brass mt-4 text-sm disabled:opacity-60">
        {busy ? "Menyimpan…" : "Simpan Perkhidmatan"}
      </button>
    </div>
  );
}

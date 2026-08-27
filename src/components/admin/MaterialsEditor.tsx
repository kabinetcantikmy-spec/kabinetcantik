"use client";
import { useState } from "react";
import { saveMaterials, uploadHomepageImage } from "@/app/admin/(panel)/tetapan/actions";
import { MaterialsConfig } from "@/lib/siteContent";

async function downscaleImage(file: File, maxDim = 1000, quality = 0.85): Promise<File> {
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
    if (scale >= 1 && file.size < 800_000) { URL.revokeObjectURL(url); return file; }
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

export default function MaterialsEditor({ initial }: { initial: MaterialsConfig }) {
  const [c, setC] = useState<MaterialsConfig>(initial);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState<number | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  function setTop<K extends keyof MaterialsConfig>(k: K, v: MaterialsConfig[K]) {
    setC((p) => ({ ...p, [k]: v }));
  }
  function setItem(i: number, key: "nama" | "nota" | "img", v: string) {
    setC((p) => { const items = p.items.slice(); items[i] = { ...items[i], [key]: v }; return { ...p, items }; });
  }
  function addItem() {
    setC((p) => ({ ...p, items: [...p.items, { nama: "", nota: "", img: "" }] }));
  }
  function removeItem(i: number) {
    setC((p) => ({ ...p, items: p.items.filter((_, idx) => idx !== i) }));
  }

  async function onImg(e: React.ChangeEvent<HTMLInputElement>, i: number) {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(i);
    setMsg(null);
    try {
      const blob = await downscaleImage(f);
      const fd = new FormData();
      fd.append("file", blob);
      fd.append("slot", "mat-" + i);
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
      const items = c.items.filter((x) => (x.nama || "").trim() || (x.img || "").trim());
      const res = await saveMaterials({ ...c, items });
      setMsg(res.ok ? { ok: true, text: "Disimpan. Halaman Bahan dikemas kini." } : { ok: false, text: res.error || "Gagal simpan." });
    } catch {
      setMsg({ ok: false, text: "Ada masalah. Cuba lagi." });
    } finally { setBusy(false); }
  }

  const input = "mt-1 w-full rounded-lg border border-ink/15 bg-paper px-3 py-2 text-sm";
  const label = "text-xs font-medium text-ink/60";

  return (
    <div className="rounded-xl border border-ink/10 bg-white p-5">
      <h2 className="font-display text-lg font-semibold">Halaman Bahan &amp; Kemasan</h2>
      <p className="mt-1 text-sm text-ink/50">Tajuk halaman, teks CTA & senarai swatch bahan (boleh tambah/buang).</p>

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
          <label className={label}>Tajuk CTA (kotak bawah)</label>
          <input className={input} value={c.ctaTitle} onChange={(e) => setTop("ctaTitle", e.target.value)} />
        </div>
        <div>
          <label className={label}>Teks CTA</label>
          <input className={input} value={c.ctaText} onChange={(e) => setTop("ctaText", e.target.value)} />
        </div>
      </div>

      <div className="mt-5">
        <div className={label}>Swatch bahan</div>
        <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {c.items.map((s, i) => (
            <div key={i} className="space-y-2 rounded-lg border border-ink/10 p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.img || "https://placehold.co/300x300?text=Gambar"} alt={s.nama} className="aspect-square w-full rounded border border-ink/10 object-cover" />
              <label className="block cursor-pointer rounded-lg border border-ink/15 px-3 py-1.5 text-center text-xs hover:bg-paper">
                {uploading === i ? "Memuat naik…" : "Tukar gambar"}
                <input type="file" accept="image/*" className="hidden" disabled={uploading !== null} onChange={(e) => onImg(e, i)} />
              </label>
              <input className={input} placeholder="Nama bahan" value={s.nama} onChange={(e) => setItem(i, "nama", e.target.value)} />
              <input className={input} placeholder="Nota ringkas" value={s.nota} onChange={(e) => setItem(i, "nota", e.target.value)} />
              <button type="button" onClick={() => removeItem(i)} className="w-full rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50">
                Buang
              </button>
            </div>
          ))}
        </div>
        <button type="button" onClick={addItem} className="mt-3 rounded-lg border border-ink/15 px-4 py-2 text-sm hover:bg-paper">
          + Tambah bahan
        </button>
      </div>

      {msg && (
        <p className={`mt-4 rounded-lg px-3 py-2 text-sm ${msg.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{msg.text}</p>
      )}
      <button onClick={save} disabled={busy} className="btn-brass mt-4 text-sm disabled:opacity-60">
        {busy ? "Menyimpan…" : "Simpan Bahan"}
      </button>
    </div>
  );
}

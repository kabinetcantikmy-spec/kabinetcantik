"use client";
import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createPortfolio, updatePortfolio, deletePortfolio, addPortfolioImage, removePortfolioImage } from "@/app/admin/(panel)/portfolio/actions";
import { uploadHomepageImage } from "@/app/admin/(panel)/tetapan/actions";

export interface PortfolioRow {
  id: string;
  slug: string;
  tajuk: string;
  kategori: string;
  gaya: string[] | null;
  cover_url: string | null;
  kawasan: string | null;
  bahan: string[] | null;
  keterangan: string | null;
  featured: boolean;
  diterbitkan: boolean;
  portfolio_images?: { id: string; url: string }[] | null;
}

interface FormState {
  tajuk: string; slug: string; kategori: string; kawasan: string;
  gaya: string; bahan: string; cover_url: string; keterangan: string;
  featured: boolean; diterbitkan: boolean;
}

const CATS = ["dapur", "wardrobe", "tv", "panel"];

// Kecilkan imej di client sebelum upload (elak had memori Worker + laman laju).
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

async function uploadFile(file: File, slot: string): Promise<string> {
  const blob = await downscaleImage(file);
  const fd = new FormData();
  fd.append("file", blob);
  fd.append("slot", slot);
  const res = await uploadHomepageImage(fd);
  if (!res.ok || !res.url) throw new Error(res.error || "Muat naik gagal.");
  return res.url;
}

export default function PortfolioEditor({ items }: { items: PortfolioRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [openId, setOpenId] = useState<string | null>(null);
  const [loadedId, setLoadedId] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [topMsg, setTopMsg] = useState("");
  const [uploading, setUploading] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({ tajuk: "", slug: "", kategori: "dapur", kawasan: "", gaya: "", bahan: "", cover_url: "", keterangan: "", featured: false, diterbitkan: false });
  const refresh = () => router.refresh();
  const csv = (v: string) => v.split(",").map((s) => s.trim()).filter(Boolean);

  useEffect(() => {
    if (openId && loadedId !== openId) {
      const p = items.find((x) => x.id === openId);
      if (p) {
        setForm({
          tajuk: p.tajuk, slug: p.slug, kategori: p.kategori, kawasan: p.kawasan || "",
          gaya: (p.gaya || []).join(", "), bahan: (p.bahan || []).join(", "),
          cover_url: p.cover_url || "", keterangan: p.keterangan || "",
          featured: p.featured, diterbitkan: p.diterbitkan,
        });
        setLoadedId(openId);
        setMsg("");
      }
    }
  }, [openId, loadedId, items]);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));

  function createNew() {
    setTopMsg("");
    startTransition(async () => {
      try {
        const r = await createPortfolio();
        if (r.ok) { setLoadedId(null); setOpenId(r.id || null); refresh(); }
        else setTopMsg(r.error || "Gagal cipta projek.");
      } catch {
        setTopMsg("Server sibuk (503). Projek mungkin dah tercipta — refresh halaman untuk semak.");
        refresh();
      }
    });
  }

  function del(id: string) {
    if (!confirm("Padam projek ini?")) return;
    setTopMsg("");
    startTransition(async () => {
      try {
        const r = await deletePortfolio(id);
        if (!r.ok) { setTopMsg(r.error || "Gagal padam."); return; }
        if (openId === id) setOpenId(null);
        refresh();
      } catch {
        setTopMsg("Server sibuk (503). Cuba lagi / refresh halaman.");
        refresh();
      }
    });
  }

  function save(id: string) {
    setMsg("");
    startTransition(async () => {
      try {
        const r = await updatePortfolio(id, {
          tajuk: form.tajuk, slug: form.slug, kategori: form.kategori, kawasan: form.kawasan,
          gaya: csv(form.gaya), bahan: csv(form.bahan), cover_url: form.cover_url,
          keterangan: form.keterangan, featured: form.featured, diterbitkan: form.diterbitkan,
        });
        if (!r.ok) setMsg(r.error || "Gagal simpan.");
        else { setMsg("Disimpan ✓"); refresh(); }
      } catch {
        setMsg("Server sibuk (503). Cuba simpan semula.");
      }
    });
  }

  async function onCoverFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading("cover");
    setMsg("");
    try {
      const url = await uploadFile(f, "portfolio-cover");
      set("cover_url", url);
      setMsg("Gambar cover dimuat naik — tekan Simpan Projek.");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Muat naik gagal.");
    } finally {
      setUploading(null);
    }
  }

  async function onGalleryFile(e: React.ChangeEvent<HTMLInputElement>, id: string) {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading("gallery");
    setMsg("");
    try {
      const url = await uploadFile(f, "portfolio-galeri");
      const r = await addPortfolioImage(id, url);
      if (!r.ok) throw new Error(r.error || "Gagal tambah gambar.");
      refresh();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Muat naik gagal.");
    } finally {
      setUploading(null);
    }
  }

  const inp = "rounded-lg border border-ink/15 bg-paper px-3 py-2";

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={createNew} disabled={pending} className="btn-brass !px-4 !py-2 text-sm disabled:opacity-60">
          {pending ? "Sila tunggu…" : "+ Projek Baru"}
        </button>
        {topMsg && <span className="text-sm text-red-600">{topMsg}</span>}
      </div>

      <div className="mt-4 space-y-2">
        {items.map((p) => (
          <div key={p.id} className="rounded-xl border border-ink/10 bg-white">
            <div className="flex items-center gap-3 p-4">
              <button onClick={() => { setMsg(""); setOpenId(openId === p.id ? null : p.id); }} className="flex-1 text-left">
                <span className="font-semibold text-ink">{p.tajuk}</span>
                <span className="ml-2 text-xs text-ink/40">/{p.slug} · {p.kategori}</span>
              </button>
              {p.featured && <span className="rounded-full bg-brass/10 px-2 py-0.5 text-xs text-gold-shadow">Pilihan</span>}
              <span className={`rounded-full px-2 py-0.5 text-xs ${p.diterbitkan ? "bg-green-100 text-green-700" : "bg-ink/5 text-ink/50"}`}>{p.diterbitkan ? "Terbit" : "Draf"}</span>
              <button onClick={() => del(p.id)} className="text-red-400 hover:text-red-600">✕</button>
            </div>

            {openId === p.id && (
              <div className="space-y-2 border-t border-ink/5 p-4 text-sm">
                <div className="grid gap-2 sm:grid-cols-2">
                  <input value={form.tajuk} onChange={(e) => set("tajuk", e.target.value)} placeholder="Tajuk" className={inp} />
                  <input value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="slug" className={inp} />
                  <select value={form.kategori} onChange={(e) => set("kategori", e.target.value)} className={inp}>
                    {CATS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <input value={form.kawasan} onChange={(e) => set("kawasan", e.target.value)} placeholder="Kawasan" className={inp} />
                  <input value={form.gaya} onChange={(e) => set("gaya", e.target.value)} placeholder="Gaya (pisah koma)" className={inp} />
                  <input value={form.bahan} onChange={(e) => set("bahan", e.target.value)} placeholder="Bahan (pisah koma)" className={inp} />
                </div>

                {/* Cover image — upload atau pautan */}
                <div className="rounded-lg bg-paper p-2">
                  <div className="text-xs uppercase tracking-wider text-ink/50">Gambar cover</div>
                  <div className="mt-2 flex items-center gap-3">
                    {form.cover_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={form.cover_url} alt="cover" className="h-16 w-24 rounded border border-ink/10 object-cover" />
                    ) : (
                      <div className="flex h-16 w-24 items-center justify-center rounded border border-dashed border-ink/20 text-[10px] text-ink/40">Tiada</div>
                    )}
                    <label className="cursor-pointer rounded-lg border border-ink/15 bg-white px-3 py-2 text-xs hover:bg-paper">
                      {uploading === "cover" ? "Memuat naik…" : "Upload gambar"}
                      <input type="file" accept="image/*" className="hidden" disabled={uploading !== null} onChange={(e) => onCoverFile(e)} />
                    </label>
                  </div>
                  <input value={form.cover_url} onChange={(e) => set("cover_url", e.target.value)} placeholder="…atau tampal pautan gambar" className={`mt-2 w-full ${inp}`} />
                </div>

                <textarea value={form.keterangan} onChange={(e) => set("keterangan", e.target.value)} placeholder="Keterangan / skop projek" className={`h-24 w-full ${inp}`} />

                {/* Galeri gambar — upload atau pautan */}
                <div className="rounded-lg bg-paper p-2">
                  <div className="text-xs uppercase tracking-wider text-ink/50">Galeri gambar</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(p.portfolio_images || []).map((im) => (
                      <span key={im.id} className="flex items-center gap-1 rounded bg-white px-1 py-1 text-xs">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={im.url} alt="" className="h-10 w-10 rounded object-cover" />
                        <button onClick={() => startTransition(async () => { try { await removePortfolioImage(im.id); refresh(); } catch { setMsg("Server sibuk (503). Cuba lagi."); } })} className="pr-1 text-red-400">✕</button>
                      </span>
                    ))}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <label className="cursor-pointer rounded-lg border border-ink/15 bg-white px-3 py-2 text-xs hover:bg-paper">
                      {uploading === "gallery" ? "Memuat naik…" : "+ Upload gambar"}
                      <input type="file" accept="image/*" className="hidden" disabled={uploading !== null} onChange={(e) => onGalleryFile(e, p.id)} />
                    </label>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <label className="flex items-center gap-2 text-ink/70"><input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} /> Pilihan (home)</label>
                  <label className="flex items-center gap-2 text-ink/70"><input type="checkbox" checked={form.diterbitkan} onChange={(e) => set("diterbitkan", e.target.checked)} /> Terbitkan</label>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <button onClick={() => save(p.id)} disabled={pending} className="btn-brass !px-4 !py-2 text-sm disabled:opacity-60">
                    {pending ? "Menyimpan…" : "Simpan Projek"}
                  </button>
                  {msg && <span className={`text-sm ${msg.includes("✓") ? "text-emerald-600" : msg.includes("naik") ? "text-ink/60" : "text-red-600"}`}>{msg}</span>}
                </div>
              </div>
            )}
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-ink/40">Belum ada projek. Gallery awam guna data placeholder sehingga anda tambah projek sebenar.</p>}
      </div>
    </div>
  );
}

"use client";
import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createPortfolio, updatePortfolio, deletePortfolio, addPortfolioImage, removePortfolioImage } from "@/app/admin/(panel)/portfolio/actions";

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

export default function PortfolioEditor({ items }: { items: PortfolioRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [openId, setOpenId] = useState<string | null>(null);
  const [loadedId, setLoadedId] = useState<string | null>(null);
  const [imgUrl, setImgUrl] = useState("");
  const [msg, setMsg] = useState("");
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

  function save(id: string) {
    setMsg("");
    startTransition(async () => {
      const r = await updatePortfolio(id, {
        tajuk: form.tajuk, slug: form.slug, kategori: form.kategori, kawasan: form.kawasan,
        gaya: csv(form.gaya), bahan: csv(form.bahan), cover_url: form.cover_url,
        keterangan: form.keterangan, featured: form.featured, diterbitkan: form.diterbitkan,
      });
      if (!r.ok) setMsg(r.error || "Gagal simpan.");
      else { setMsg("Disimpan ✓"); refresh(); }
    });
  }

  const inp = "rounded-lg border border-ink/15 bg-paper px-3 py-2";

  return (
    <div>
      <button onClick={() => startTransition(async () => { const r = await createPortfolio(); if (r.ok) { setLoadedId(null); setOpenId(r.id || null); refresh(); } })} disabled={pending} className="btn-brass !px-4 !py-2 text-sm">
        + Projek Baru
      </button>

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
              <button onClick={() => { if (confirm("Padam projek ini?")) startTransition(async () => { await deletePortfolio(p.id); if (openId === p.id) setOpenId(null); refresh(); }); }} className="text-red-400 hover:text-red-600">✕</button>
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
                <input value={form.cover_url} onChange={(e) => set("cover_url", e.target.value)} placeholder="Pautan gambar cover" className={`w-full ${inp}`} />
                <textarea value={form.keterangan} onChange={(e) => set("keterangan", e.target.value)} placeholder="Keterangan / skop projek" className={`h-24 w-full ${inp}`} />

                {/* Images */}
                <div className="rounded-lg bg-paper p-2">
                  <div className="text-xs uppercase tracking-wider text-ink/50">Galeri gambar</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(p.portfolio_images || []).map((im) => (
                      <span key={im.id} className="flex items-center gap-1 rounded bg-white px-2 py-1 text-xs">
                        <span className="max-w-[140px] truncate">{im.url}</span>
                        <button onClick={() => startTransition(async () => { await removePortfolioImage(im.id); refresh(); })} className="text-red-400">✕</button>
                      </span>
                    ))}
                  </div>
                  <div className="mt-2 flex gap-2">
                    <input value={imgUrl} onChange={(e) => setImgUrl(e.target.value)} placeholder="Pautan gambar…" className="flex-1 rounded border border-ink/15 bg-white px-2 py-1 text-xs" />
                    <button onClick={() => startTransition(async () => { const r = await addPortfolioImage(p.id, imgUrl); if (r.ok) { setImgUrl(""); refresh(); } else alert(r.error); })} className="btn-ghost !px-3 !py-1 text-xs">Tambah</button>
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
                  {msg && <span className={`text-sm ${msg.includes("✓") ? "text-emerald-600" : "text-red-600"}`}>{msg}</span>}
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

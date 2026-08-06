"use client";
import { useState, useTransition } from "react";
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

const CATS = ["dapur", "wardrobe", "tv", "panel"];

export default function PortfolioEditor({ items }: { items: PortfolioRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [openId, setOpenId] = useState<string | null>(null);
  const [imgUrl, setImgUrl] = useState("");
  const refresh = () => router.refresh();

  function save(id: string, patch: Record<string, unknown>) {
    startTransition(async () => { const r = await updatePortfolio(id, patch); if (!r.ok) alert(r.error); else refresh(); });
  }
  const csv = (v: string) => v.split(",").map((s) => s.trim()).filter(Boolean);

  return (
    <div>
      <button onClick={() => startTransition(async () => { const r = await createPortfolio(); if (r.ok) { setOpenId(r.id || null); refresh(); } })} disabled={pending} className="btn-brass !px-4 !py-2 text-sm">
        + Projek Baru
      </button>

      <div className="mt-4 space-y-2">
        {items.map((p) => (
          <div key={p.id} className="rounded-xl border border-ink/10 bg-white">
            <div className="flex items-center gap-3 p-4">
              <button onClick={() => setOpenId(openId === p.id ? null : p.id)} className="flex-1 text-left">
                <span className="font-semibold text-ink">{p.tajuk}</span>
                <span className="ml-2 text-xs text-ink/40">/{p.slug} · {p.kategori}</span>
              </button>
              {p.featured && <span className="rounded-full bg-brass/10 px-2 py-0.5 text-xs text-gold-shadow">Pilihan</span>}
              <span className={`rounded-full px-2 py-0.5 text-xs ${p.diterbitkan ? "bg-green-100 text-green-700" : "bg-ink/5 text-ink/50"}`}>{p.diterbitkan ? "Terbit" : "Draf"}</span>
              <button onClick={() => startTransition(async () => { await deletePortfolio(p.id); refresh(); })} className="text-red-400 hover:text-red-600">✕</button>
            </div>

            {openId === p.id && (
              <div className="space-y-2 border-t border-ink/5 p-4 text-sm">
                <div className="grid gap-2 sm:grid-cols-2">
                  <input defaultValue={p.tajuk} onBlur={(e) => e.target.value !== p.tajuk && save(p.id, { tajuk: e.target.value })} placeholder="Tajuk" className="rounded-lg border border-ink/15 bg-paper px-3 py-2" />
                  <input defaultValue={p.slug} onBlur={(e) => e.target.value !== p.slug && save(p.id, { slug: e.target.value })} placeholder="slug" className="rounded-lg border border-ink/15 bg-paper px-3 py-2" />
                  <select defaultValue={p.kategori} onChange={(e) => save(p.id, { kategori: e.target.value })} className="rounded-lg border border-ink/15 bg-paper px-3 py-2">
                    {CATS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <input defaultValue={p.kawasan || ""} onBlur={(e) => e.target.value !== (p.kawasan || "") && save(p.id, { kawasan: e.target.value })} placeholder="Kawasan" className="rounded-lg border border-ink/15 bg-paper px-3 py-2" />
                  <input defaultValue={(p.gaya || []).join(", ")} onBlur={(e) => save(p.id, { gaya: csv(e.target.value) })} placeholder="Gaya (comma)" className="rounded-lg border border-ink/15 bg-paper px-3 py-2" />
                  <input defaultValue={(p.bahan || []).join(", ")} onBlur={(e) => save(p.id, { bahan: csv(e.target.value) })} placeholder="Bahan (comma)" className="rounded-lg border border-ink/15 bg-paper px-3 py-2" />
                </div>
                <input defaultValue={p.cover_url || ""} onBlur={(e) => e.target.value !== (p.cover_url || "") && save(p.id, { cover_url: e.target.value })} placeholder="Pautan gambar cover" className="w-full rounded-lg border border-ink/15 bg-paper px-3 py-2" />
                <textarea defaultValue={p.keterangan || ""} onBlur={(e) => e.target.value !== (p.keterangan || "") && save(p.id, { keterangan: e.target.value })} placeholder="Keterangan / skop projek" className="h-24 w-full rounded-lg border border-ink/15 bg-paper px-3 py-2" />

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

                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-ink/70"><input type="checkbox" defaultChecked={p.featured} onChange={(e) => save(p.id, { featured: e.target.checked })} /> Pilihan (home)</label>
                  <label className="flex items-center gap-2 text-ink/70"><input type="checkbox" defaultChecked={p.diterbitkan} onChange={(e) => save(p.id, { diterbitkan: e.target.checked })} /> Terbitkan</label>
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

"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addReview, togglePublishReview, deleteReview } from "@/app/admin/(panel)/ulasan/actions";
import { uploadHomepageImage } from "@/app/admin/(panel)/tetapan/actions";

export interface Review {
  id: string;
  nama: string;
  rating: number;
  ulasan: string | null;
  diterbitkan: boolean;
  avatar_url?: string | null;
  projek_url?: string | null;
}

async function downscaleImage(file: File, maxDim = 1200, quality = 0.85): Promise<File> {
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

async function uploadFile(file: File, slot: string): Promise<string> {
  const blob = await downscaleImage(file);
  const fd = new FormData();
  fd.append("file", blob);
  fd.append("slot", slot);
  const res = await uploadHomepageImage(fd);
  if (!res.ok || !res.url) throw new Error(res.error || "Muat naik gagal.");
  return res.url;
}

export default function ReviewsEditor({ reviews }: { reviews: Review[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const refresh = () => router.refresh();
  const [nama, setNama] = useState("");
  const [rating, setRating] = useState(5);
  const [ulasan, setUlasan] = useState("");
  const [avatar, setAvatar] = useState("");
  const [projek, setProjek] = useState("");
  const [uploading, setUploading] = useState<string | null>(null);
  const [err, setErr] = useState("");

  async function onFile(e: React.ChangeEvent<HTMLInputElement>, which: "avatar" | "projek") {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(which);
    setErr("");
    try {
      const url = await uploadFile(f, "review-" + which);
      if (which === "avatar") setAvatar(url); else setProjek(url);
    } catch (er) {
      setErr(er instanceof Error ? er.message : "Muat naik gagal.");
    } finally {
      setUploading(null);
    }
  }

  function submit() {
    setErr("");
    startTransition(async () => {
      const r = await addReview(nama, rating, ulasan, avatar, projek);
      if (r.ok) { setNama(""); setUlasan(""); setAvatar(""); setProjek(""); setRating(5); refresh(); }
      else setErr(r.error || "Gagal tambah.");
    });
  }

  return (
    <div>
      <div className="rounded-xl border border-ink/10 bg-white p-4">
        <h3 className="font-display font-semibold text-ink">Tambah ulasan</h3>
        <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_auto]">
          <input value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Nama pelanggan" className="rounded-lg border border-ink/15 bg-paper px-3 py-2 text-sm" />
          <select value={rating} onChange={(e) => setRating(Number(e.target.value))} className="rounded-lg border border-ink/15 bg-paper px-3 py-2 text-sm">
            {[5, 4, 3, 2, 1].map((r) => <option key={r} value={r}>{r} ★</option>)}
          </select>
        </div>
        <textarea value={ulasan} onChange={(e) => setUlasan(e.target.value)} placeholder="Ulasan…" className="mt-2 h-20 w-full rounded-lg border border-ink/15 bg-paper px-3 py-2 text-sm" />

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-lg bg-paper p-2">
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatar} alt="owner" className="h-12 w-12 rounded-full border border-ink/10 object-cover" />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-dashed border-ink/20 text-[9px] text-ink/40">Owner</div>
            )}
            <label className="cursor-pointer rounded-lg border border-ink/15 bg-white px-3 py-2 text-xs hover:bg-paper">
              {uploading === "avatar" ? "Memuat naik…" : "Gambar owner"}
              <input type="file" accept="image/*" className="hidden" disabled={uploading !== null} onChange={(e) => onFile(e, "avatar")} />
            </label>
          </div>
          <div className="flex items-center gap-3 rounded-lg bg-paper p-2">
            {projek ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={projek} alt="projek" className="h-12 w-16 rounded border border-ink/10 object-cover" />
            ) : (
              <div className="flex h-12 w-16 items-center justify-center rounded border border-dashed border-ink/20 text-[9px] text-ink/40">Projek</div>
            )}
            <label className="cursor-pointer rounded-lg border border-ink/15 bg-white px-3 py-2 text-xs hover:bg-paper">
              {uploading === "projek" ? "Memuat naik…" : "Gambar projek"}
              <input type="file" accept="image/*" className="hidden" disabled={uploading !== null} onChange={(e) => onFile(e, "projek")} />
            </label>
          </div>
        </div>

        <div className="mt-2 flex items-center gap-3">
          <button onClick={submit} disabled={pending || uploading !== null} className="btn-brass !px-4 !py-2 text-sm disabled:opacity-60">Tambah</button>
          {err && <span className="text-sm text-red-600">{err}</span>}
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {reviews.map((r) => (
          <div key={r.id} className="flex items-start gap-3 rounded-xl border border-ink/10 bg-white p-4 text-sm">
            {r.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={r.avatar_url} alt={r.nama} className="h-10 w-10 shrink-0 rounded-full border border-ink/10 object-cover" />
            ) : null}
            <div className="flex-1">
              <div className="font-semibold text-ink">{r.nama} <span className="text-brass">{"★".repeat(r.rating)}</span></div>
              {r.ulasan && <p className="mt-1 text-ink/70">{r.ulasan}</p>}
              {r.projek_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={r.projek_url} alt="projek" className="mt-2 h-20 w-32 rounded border border-ink/10 object-cover" />
              )}
            </div>
            <label className="flex items-center gap-1 text-xs text-ink/60">
              <input type="checkbox" checked={r.diterbitkan} onChange={(e) => startTransition(async () => { await togglePublishReview(r.id, e.target.checked); refresh(); })} />
              Terbit
            </label>
            <button onClick={() => { if (confirm("Padam ulasan ini?")) startTransition(async () => { await deleteReview(r.id); refresh(); }); }} className="text-red-400 hover:text-red-600">✕</button>
          </div>
        ))}
        {reviews.length === 0 && <p className="text-sm text-ink/40">Belum ada ulasan.</p>}
      </div>
    </div>
  );
}

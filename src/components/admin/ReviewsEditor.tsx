"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addReview, togglePublishReview, deleteReview } from "@/app/admin/(panel)/ulasan/actions";

export interface Review {
  id: string;
  nama: string;
  rating: number;
  ulasan: string | null;
  diterbitkan: boolean;
}

export default function ReviewsEditor({ reviews }: { reviews: Review[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const refresh = () => router.refresh();
  const [nama, setNama] = useState("");
  const [rating, setRating] = useState(5);
  const [ulasan, setUlasan] = useState("");

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
        <button onClick={() => startTransition(async () => { const r = await addReview(nama, rating, ulasan); if (r.ok) { setNama(""); setUlasan(""); refresh(); } else alert(r.error); })} disabled={pending} className="btn-brass mt-2 !px-4 !py-2 text-sm">Tambah</button>
      </div>

      <div className="mt-4 space-y-2">
        {reviews.map((r) => (
          <div key={r.id} className="flex items-start gap-3 rounded-xl border border-ink/10 bg-white p-4 text-sm">
            <div className="flex-1">
              <div className="font-semibold text-ink">{r.nama} <span className="text-brass">{"★".repeat(r.rating)}</span></div>
              {r.ulasan && <p className="mt-1 text-ink/70">{r.ulasan}</p>}
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

"use client";
import { useState, useTransition } from "react";
import { submitPublicReview } from "@/app/(site)/ulasan/baru/[token]/actions";

export default function PublicReviewForm({ token }: { token: string }) {
  const [nama, setNama] = useState("");
  const [rating, setRating] = useState(5);
  const [ulasan, setUlasan] = useState("");
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <div className="rounded-2xl border border-ink/10 bg-white p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brass/15 text-2xl text-brass">★</div>
        <h2 className="mt-4 font-display text-xl font-semibold text-ink">Terima kasih!</h2>
        <p className="mt-2 text-ink/60">Ulasan anda dihantar dan akan dipaparkan selepas disemak.</p>
      </div>
    );
  }

  function submit() {
    setErr("");
    if (!nama.trim()) { setErr("Sila isi nama."); return; }
    startTransition(async () => {
      const r = await submitPublicReview(token, nama, rating, ulasan);
      if (r.ok) setDone(true);
      else setErr(r.error || "Gagal.");
    });
  }

  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-6">
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-ink/80">Nama anda</label>
          <input value={nama} onChange={(e) => setNama(e.target.value)} className="mt-1 w-full rounded-lg border border-ink/15 bg-paper px-4 py-3" />
        </div>
        <div>
          <label className="text-sm font-medium text-ink/80">Rating</label>
          <div className="mt-1 flex gap-1 text-2xl">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" onClick={() => setRating(n)} className={n <= rating ? "text-brass" : "text-ink/20"}>
                ★
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-ink/80">Ulasan</label>
          <textarea value={ulasan} onChange={(e) => setUlasan(e.target.value)} placeholder="Kongsi pengalaman anda…" className="mt-1 h-28 w-full rounded-lg border border-ink/15 bg-paper px-4 py-3" />
        </div>
        {err && <p className="text-sm text-red-600">{err}</p>}
        <button onClick={submit} disabled={pending} className="btn-brass w-full">
          {pending ? "Menghantar…" : "Hantar Ulasan"}
        </button>
      </div>
    </div>
  );
}

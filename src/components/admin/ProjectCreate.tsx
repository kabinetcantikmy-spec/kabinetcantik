"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createProjectFromQuote } from "@/app/admin/(panel)/projek/actions";

export interface QuoteOpt {
  id: string;
  no_quote: string;
  nama: string;
}

export default function ProjectCreate({ quotes }: { quotes: QuoteOpt[] }) {
  const router = useRouter();
  const [id, setId] = useState("");
  const [pending, startTransition] = useTransition();

  if (quotes.length === 0) {
    return <p className="text-sm text-ink/50">Tiada sebut harga <b>diterima</b> yang belum jadi projek.</p>;
  }

  function create() {
    if (!id) return;
    startTransition(async () => {
      const res = await createProjectFromQuote(id);
      if (res.ok && res.id) router.push(`/admin/projek/${res.id}`);
      else alert(res.error || "Gagal.");
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select value={id} onChange={(e) => setId(e.target.value)} className="rounded-lg border border-ink/15 bg-paper px-3 py-2 text-sm">
        <option value="">— Pilih sebut harga diterima —</option>
        {quotes.map((q) => <option key={q.id} value={q.id}>{q.no_quote} · {q.nama}</option>)}
      </select>
      <button onClick={create} disabled={pending} className="btn-brass !px-4 !py-2 text-sm">Cipta Projek</button>
    </div>
  );
}

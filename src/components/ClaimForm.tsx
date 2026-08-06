"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitClaim } from "@/app/pembekal/(app)/actions";

export default function ClaimForm() {
  const router = useRouter();
  const [butiran, setButiran] = useState("");
  const [jumlah, setJumlah] = useState("");
  const [url, setUrl] = useState("");
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState("");

  function submit() {
    setErr("");
    if (!butiran.trim() || !Number(jumlah)) { setErr("Butiran & jumlah wajib."); return; }
    startTransition(async () => {
      const r = await submitClaim({ butiran, jumlah: Number(jumlah), url_dokumen: url || undefined });
      if (r.ok) { setButiran(""); setJumlah(""); setUrl(""); router.refresh(); }
      else setErr(r.error || "Gagal.");
    });
  }

  return (
    <div className="rounded-xl border border-ink/10 bg-white p-4">
      <h3 className="font-display font-semibold text-ink">Hantar tuntutan baru</h3>
      <div className="mt-3 space-y-2">
        <textarea value={butiran} onChange={(e) => setButiran(e.target.value)} placeholder="Butiran kerja / bekalan…" className="h-20 w-full rounded-lg border border-ink/15 bg-paper px-3 py-2 text-sm" />
        <div className="grid gap-2 sm:grid-cols-2">
          <input type="number" value={jumlah} onChange={(e) => setJumlah(e.target.value)} placeholder="Jumlah (RM)" className="rounded-lg border border-ink/15 bg-paper px-3 py-2 text-sm" />
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Pautan invois/dokumen (pilihan)" className="rounded-lg border border-ink/15 bg-paper px-3 py-2 text-sm" />
        </div>
        {err && <p className="text-sm text-red-600">{err}</p>}
        <button onClick={submit} disabled={pending} className="btn-brass !px-4 !py-2 text-sm">{pending ? "Menghantar…" : "Hantar Tuntutan"}</button>
      </div>
    </div>
  );
}

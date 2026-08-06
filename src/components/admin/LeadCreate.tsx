"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createLead } from "@/app/admin/(panel)/leads/actions";

export default function LeadCreate() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [nama, setNama] = useState("");
  const [telefon, setTelefon] = useState("");
  const [emel, setEmel] = useState("");
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState("");

  function submit() {
    setErr("");
    if (!nama.trim() || !telefon.trim()) { setErr("Nama & telefon wajib."); return; }
    startTransition(async () => {
      const r = await createLead({ nama, telefon, emel });
      if (!r.ok) setErr(r.error || "Gagal.");
      else { setNama(""); setTelefon(""); setEmel(""); setOpen(false); router.refresh(); }
    });
  }

  if (!open) {
    return <button onClick={() => setOpen(true)} className="btn-ghost !px-4 !py-2 text-sm">+ Tambah Lead</button>;
  }

  return (
    <div className="rounded-xl border border-ink/10 bg-white p-4">
      <div className="grid gap-2 sm:grid-cols-3">
        <input value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Nama *" className="rounded-lg border border-ink/15 bg-paper px-3 py-2 text-sm" />
        <input value={telefon} onChange={(e) => setTelefon(e.target.value)} placeholder="Telefon *" className="rounded-lg border border-ink/15 bg-paper px-3 py-2 text-sm" />
        <input value={emel} onChange={(e) => setEmel(e.target.value)} placeholder="Emel" className="rounded-lg border border-ink/15 bg-paper px-3 py-2 text-sm" />
      </div>
      {err && <p className="mt-2 text-sm text-red-600">{err}</p>}
      <div className="mt-3 flex gap-2">
        <button onClick={submit} disabled={pending} className="btn-brass !px-4 !py-2 text-sm">{pending ? "…" : "Simpan"}</button>
        <button onClick={() => setOpen(false)} className="text-sm text-ink/50">Batal</button>
      </div>
    </div>
  );
}

"use client";
import { useState, useTransition } from "react";
import { bookSiteVisit } from "@/app/(site)/tempah-ukur/actions";

export default function BookVisitForm() {
  const [nama, setNama] = useState("");
  const [telefon, setTelefon] = useState("");
  const [emel, setEmel] = useState("");
  const [tarikh, setTarikh] = useState("");
  const [masa, setMasa] = useState("");
  const [alamat, setAlamat] = useState("");
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <div className="rounded-2xl border border-ink/10 bg-white p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brass/15 text-2xl text-brass">✓</div>
        <h2 className="mt-4 font-display text-xl font-semibold text-ink">Permohonan diterima!</h2>
        <p className="mt-2 text-ink/60">Kami akan hubungi anda untuk sahkan tarikh ukur tapak.</p>
      </div>
    );
  }

  function submit() {
    setErr("");
    if (!nama.trim() || !telefon.trim() || !tarikh) { setErr("Sila isi nama, telefon & tarikh."); return; }
    startTransition(async () => {
      const r = await bookSiteVisit({ nama, telefon, emel, tarikh, masa, alamat });
      if (r.ok) setDone(true);
      else setErr(r.error || "Gagal.");
    });
  }

  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-6">
      <div className="space-y-3">
        <input value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Nama penuh *" className="w-full rounded-lg border border-ink/15 bg-paper px-4 py-3" />
        <input value={telefon} onChange={(e) => setTelefon(e.target.value)} placeholder="Nombor telefon (WhatsApp) *" className="w-full rounded-lg border border-ink/15 bg-paper px-4 py-3" />
        <input value={emel} onChange={(e) => setEmel(e.target.value)} placeholder="Emel (pilihan)" className="w-full rounded-lg border border-ink/15 bg-paper px-4 py-3" />
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm text-ink/60">Tarikh pilihan
            <input type="date" value={tarikh} onChange={(e) => setTarikh(e.target.value)} className="mt-1 w-full rounded-lg border border-ink/15 bg-paper px-3 py-2.5" />
          </label>
          <label className="text-sm text-ink/60">Masa pilihan
            <input type="time" value={masa} onChange={(e) => setMasa(e.target.value)} className="mt-1 w-full rounded-lg border border-ink/15 bg-paper px-3 py-2.5" />
          </label>
        </div>
        <textarea value={alamat} onChange={(e) => setAlamat(e.target.value)} placeholder="Alamat / kawasan (untuk ukur tapak)" className="h-20 w-full rounded-lg border border-ink/15 bg-paper px-4 py-3" />
        {err && <p className="text-sm text-red-600">{err}</p>}
        <button onClick={submit} disabled={pending} className="btn-brass w-full">
          {pending ? "Menghantar…" : "Tempah Ukur Tapak Percuma"}
        </button>
      </div>
    </div>
  );
}

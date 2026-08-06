"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitWarranty } from "@/app/portal/(app)/actions";

export interface ProjectOpt {
  id: string;
  tajuk: string;
}

export default function WarrantyForm({ projects }: { projects: ProjectOpt[] }) {
  const router = useRouter();
  const [projectId, setProjectId] = useState(projects[0]?.id || "");
  const [keterangan, setKeterangan] = useState("");
  const [url, setUrl] = useState("");
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);

  function submit() {
    setErr("");
    if (!projectId) { setErr("Pilih projek."); return; }
    if (!keterangan.trim()) { setErr("Terangkan masalah."); return; }
    startTransition(async () => {
      const res = await submitWarranty(projectId, keterangan, url || undefined);
      if (!res.ok) setErr(res.error || "Gagal.");
      else { setKeterangan(""); setUrl(""); setDone(true); router.refresh(); }
    });
  }

  if (projects.length === 0) {
    return <p className="text-sm text-ink/50">Anda perlukan projek yang telah siap untuk membuat tuntutan warranti.</p>;
  }

  return (
    <div className="rounded-xl border border-ink/10 bg-white p-4">
      {done && <div className="mb-3 rounded-lg bg-green-100 px-3 py-2 text-sm text-green-700">Tuntutan dihantar. Kami akan hubungi anda.</div>}
      <div className="space-y-3 text-sm">
        <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className="w-full rounded-lg border border-ink/15 bg-paper px-3 py-2">
          {projects.map((p) => <option key={p.id} value={p.id}>{p.tajuk}</option>)}
        </select>
        <textarea value={keterangan} onChange={(e) => setKeterangan(e.target.value)} placeholder="Terangkan masalah…" className="h-24 w-full rounded-lg border border-ink/15 bg-paper px-3 py-2" />
        <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Pautan gambar (pilihan)" className="w-full rounded-lg border border-ink/15 bg-paper px-3 py-2" />
        {err && <p className="text-sm text-red-600">{err}</p>}
        <button onClick={submit} disabled={pending} className="btn-brass text-sm">
          {pending ? "Menghantar…" : "Hantar Tuntutan"}
        </button>
      </div>
    </div>
  );
}

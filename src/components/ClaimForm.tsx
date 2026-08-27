"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitClaim, uploadClaimDoc } from "@/app/pembekal/(app)/actions";

export default function ClaimForm({ jenis = "pembekal" }: { jenis?: string }) {
  const router = useRouter();
  const isInstaller = jenis === "installer";
  const [butiran, setButiran] = useState("");
  const [jumlah, setJumlah] = useState("");
  const [invoisPath, setInvoisPath] = useState("");
  const [invoisName, setInvoisName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState("");

  async function onInvois(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    setUploading(true);
    setErr("");
    try {
      const fd = new FormData();
      fd.append("file", f);
      const r = await uploadClaimDoc(fd);
      if (!r.ok || !r.path) throw new Error(r.error || "gagal");
      setInvoisPath(r.path);
      setInvoisName(f.name);
    } catch (er) {
      setErr(er instanceof Error ? er.message : "Muat naik invois gagal.");
    } finally {
      setUploading(false);
    }
  }

  function submit() {
    setErr("");
    if (!butiran.trim() || !Number(jumlah)) { setErr(isInstaller ? "Laporan progres & jumlah wajib." : "Butiran & jumlah wajib."); return; }
    if (isInstaller && !invoisPath) { setErr("Sila muat naik invois."); return; }
    startTransition(async () => {
      const r = await submitClaim({ butiran, jumlah: Number(jumlah), url_dokumen: invoisPath || undefined });
      if (r.ok) { setButiran(""); setJumlah(""); setInvoisPath(""); setInvoisName(""); router.refresh(); }
      else setErr(r.error || "Gagal.");
    });
  }

  return (
    <div className="rounded-xl border border-ink/10 bg-white p-4">
      <h3 className="font-display font-semibold text-ink">{isInstaller ? "Hantar tuntutan progress" : "Hantar tuntutan baru"}</h3>
      {isInstaller && <p className="mt-1 text-xs text-ink/50">Lapor progres kerja anda & lampirkan invois untuk buat tuntutan.</p>}
      <div className="mt-3 space-y-2">
        <textarea value={butiran} onChange={(e) => setButiran(e.target.value)} placeholder={isInstaller ? "Laporan progres kerja (apa yang siap, peratus, catatan)…" : "Butiran kerja / bekalan…"} className="h-24 w-full rounded-lg border border-ink/15 bg-paper px-3 py-2 text-sm" />
        <input type="number" value={jumlah} onChange={(e) => setJumlah(e.target.value)} placeholder="Jumlah (RM)" className="w-full rounded-lg border border-ink/15 bg-paper px-3 py-2 text-sm" />

        <div className="rounded-lg bg-paper p-2">
          <div className="text-xs font-medium text-ink/60">{isInstaller ? "Invois *" : "Invois (pilihan)"}</div>
          <div className="mt-1 flex items-center gap-2">
            <span className={`text-xs ${invoisName ? "text-emerald-600" : "text-ink/40"}`}>{invoisName ? `${invoisName} ✓` : "Belum ada"}</span>
            <label className="ml-auto cursor-pointer rounded-lg border border-ink/15 bg-white px-3 py-1.5 text-xs hover:bg-paper">
              {uploading ? "Memuat naik…" : invoisName ? "Ganti" : "Muat naik invois"}
              <input type="file" accept="image/*,application/pdf" className="hidden" disabled={uploading} onChange={onInvois} />
            </label>
          </div>
        </div>

        {err && <p className="text-sm text-red-600">{err}</p>}
        <button onClick={submit} disabled={pending || uploading} className="btn-brass !px-4 !py-2 text-sm disabled:opacity-60">{pending ? "Menghantar…" : "Hantar Tuntutan"}</button>
      </div>
    </div>
  );
}

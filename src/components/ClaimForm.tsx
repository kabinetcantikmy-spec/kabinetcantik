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
  const [doPath, setDoPath] = useState("");
  const [doName, setDoName] = useState("");
  const [uploading, setUploading] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState("");

  async function onDoc(e: React.ChangeEvent<HTMLInputElement>, which: "invois" | "do") {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    setUploading(which);
    setErr("");
    try {
      const fd = new FormData();
      fd.append("file", f);
      const r = await uploadClaimDoc(fd);
      if (!r.ok || !r.path) throw new Error(r.error || "gagal");
      if (which === "invois") { setInvoisPath(r.path); setInvoisName(f.name); }
      else { setDoPath(r.path); setDoName(f.name); }
    } catch (er) {
      setErr(er instanceof Error ? er.message : "Muat naik gagal.");
    } finally {
      setUploading(null);
    }
  }

  function submit() {
    setErr("");
    if (!butiran.trim() || !Number(jumlah)) { setErr(isInstaller ? "Laporan progres & jumlah wajib." : "Butiran & jumlah wajib."); return; }
    if (!isInstaller && !doPath) { setErr("Sila muat naik Nota Penghantaran (DO)."); return; }
    if (!invoisPath) { setErr("Sila muat naik invois."); return; }
    startTransition(async () => {
      const r = await submitClaim({ butiran, jumlah: Number(jumlah), url_dokumen: invoisPath || undefined, url_do: doPath || undefined });
      if (r.ok) { setButiran(""); setJumlah(""); setInvoisPath(""); setInvoisName(""); setDoPath(""); setDoName(""); router.refresh(); }
      else setErr(r.error || "Gagal.");
    });
  }

  const docBox = (label: string, name: string, which: "invois" | "do") => (
    <div className="rounded-lg bg-paper p-2">
      <div className="text-xs font-medium text-ink/60">{label}</div>
      <div className="mt-1 flex items-center gap-2">
        <span className={`text-xs ${name ? "text-emerald-600" : "text-ink/40"}`}>{name ? `${name} ✓` : "Belum ada"}</span>
        <label className="ml-auto cursor-pointer rounded-lg border border-ink/15 bg-white px-3 py-1.5 text-xs hover:bg-paper">
          {uploading === which ? "Memuat naik…" : name ? "Ganti" : "Muat naik"}
          <input type="file" accept="image/*,application/pdf" className="hidden" disabled={uploading !== null} onChange={(e) => onDoc(e, which)} />
        </label>
      </div>
    </div>
  );

  return (
    <div className="rounded-xl border border-ink/10 bg-white p-4">
      <h3 className="font-display font-semibold text-ink">{isInstaller ? "Hantar tuntutan progress" : "Hantar tuntutan"}</h3>
      <p className="mt-1 text-xs text-ink/50">{isInstaller ? "Lapor progres kerja & lampirkan invois." : "Nyatakan bekalan, lampirkan Nota Penghantaran (DO) & invois."}</p>
      <div className="mt-3 space-y-2">
        <textarea value={butiran} onChange={(e) => setButiran(e.target.value)} placeholder={isInstaller ? "Laporan progres kerja (apa yang siap, peratus, catatan)…" : "Butiran bekalan (apa yang dibekalkan)…"} className="h-24 w-full rounded-lg border border-ink/15 bg-paper px-3 py-2 text-sm" />
        <input type="number" value={jumlah} onChange={(e) => setJumlah(e.target.value)} placeholder="Jumlah (RM)" className="w-full rounded-lg border border-ink/15 bg-paper px-3 py-2 text-sm" />

        {!isInstaller && docBox("Nota Penghantaran / DO *", doName, "do")}
        {docBox("Invois *", invoisName, "invois")}

        {err && <p className="text-sm text-red-600">{err}</p>}
        <button onClick={submit} disabled={pending || uploading !== null} className="btn-brass !px-4 !py-2 text-sm disabled:opacity-60">{pending ? "Menghantar…" : "Hantar Tuntutan"}</button>
      </div>
    </div>
  );
}

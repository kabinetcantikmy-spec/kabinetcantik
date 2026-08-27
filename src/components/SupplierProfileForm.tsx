"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateSupplierProfile, uploadSupplierDoc } from "@/app/pembekal/(app)/actions";

export interface SupplierProfile {
  syarikat: string | null;
  jenis_entiti: string | null;
  no_ssm: string | null;
  telefon: string | null;
  alamat: string | null;
  pemilik: string | null;
  no_ic: string | null;
  bank: string | null;
  no_akaun: string | null;
  dok_ssm_url: string | null;
  dok_bank_url: string | null;
}

export default function SupplierProfileForm({ initial, jenis = "pembekal" }: { initial: SupplierProfile; jenis?: string }) {
  const isInstaller = jenis === "installer";
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [f, setF] = useState({
    syarikat: initial.syarikat || "",
    jenis_entiti: initial.jenis_entiti || "Sdn Bhd",
    no_ssm: initial.no_ssm || "",
    telefon: initial.telefon || "",
    alamat: initial.alamat || "",
    pemilik: initial.pemilik || "",
    no_ic: initial.no_ic || "",
    bank: initial.bank || "",
    no_akaun: initial.no_akaun || "",
  });
  const [ssmDone, setSsmDone] = useState(!!initial.dok_ssm_url);
  const [bankDone, setBankDone] = useState(!!initial.dok_bank_url);
  const [uploading, setUploading] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const set = (k: keyof typeof f, v: string) => setF((p) => ({ ...p, [k]: v }));

  async function onDoc(e: React.ChangeEvent<HTMLInputElement>, jenis: "ssm" | "bank") {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(jenis);
    setMsg(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("jenis", jenis);
      const r = await uploadSupplierDoc(fd);
      if (!r.ok) throw new Error(r.error || "gagal");
      if (jenis === "ssm") setSsmDone(true); else setBankDone(true);
      router.refresh();
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : "Muat naik gagal." });
    } finally {
      setUploading(null);
    }
  }

  function save() {
    setMsg(null);
    startTransition(async () => {
      const r = await updateSupplierProfile(f);
      if (!r.ok) { setMsg({ ok: false, text: r.error || "Gagal simpan." }); return; }
      setMsg({ ok: true, text: r.lengkap ? "Profil KYB lengkap ✓ — menunggu kelulusan admin." : "Disimpan. Lengkapkan medan & dokumen yang tinggal." });
      router.refresh();
    });
  }

  const inp = "mt-1 w-full rounded-lg border border-ink/15 bg-paper px-3 py-2 text-sm";
  const label = "text-xs font-medium text-ink/60";

  return (
    <div className="rounded-xl border border-ink/10 bg-white p-5">
      <h2 className="font-display text-lg font-semibold text-ink">Profil KYB (Know-Your-Business)</h2>
      <p className="mt-1 text-sm text-ink/50">Lengkapkan butiran & muat naik dokumen untuk pengesahan. Dokumen disimpan sulit — hanya admin boleh lihat.{isInstaller ? " (Installer individu: guna salinan IC ganti Sijil SSM.)" : ""}</p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={label}>{isInstaller ? "Nama perniagaan / trading (jika ada)" : "Nama syarikat berdaftar *"}</label>
          <input className={inp} value={f.syarikat} onChange={(e) => set("syarikat", e.target.value)} />
        </div>
        <div>
          <label className={label}>Jenis entiti{isInstaller ? "" : " *"}</label>
          <select className={inp} value={f.jenis_entiti} onChange={(e) => set("jenis_entiti", e.target.value)}>
            <option>Individu</option>
            <option>Sdn Bhd</option>
            <option>Enterprise</option>
            <option>Milikan Tunggal</option>
            <option>Perkongsian</option>
          </select>
        </div>
        <div>
          <label className={label}>{isInstaller ? "No. SSM (jika ada)" : "No. Pendaftaran SSM *"}</label>
          <input className={inp} value={f.no_ssm} onChange={(e) => set("no_ssm", e.target.value)} />
        </div>
        <div>
          <label className={label}>Telefon perniagaan</label>
          <input className={inp} value={f.telefon} onChange={(e) => set("telefon", e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label className={label}>Alamat perniagaan *</label>
          <textarea className={inp + " h-16"} value={f.alamat} onChange={(e) => set("alamat", e.target.value)} />
        </div>
        <div>
          <label className={label}>Nama pemilik / wakil *</label>
          <input className={inp} value={f.pemilik} onChange={(e) => set("pemilik", e.target.value)} />
        </div>
        <div>
          <label className={label}>No. IC pemilik *</label>
          <input className={inp} value={f.no_ic} onChange={(e) => set("no_ic", e.target.value)} />
        </div>
        <div>
          <label className={label}>Bank *</label>
          <input className={inp} value={f.bank} onChange={(e) => set("bank", e.target.value)} />
        </div>
        <div>
          <label className={label}>No. akaun bank *</label>
          <input className={inp} value={f.no_akaun} onChange={(e) => set("no_akaun", e.target.value)} />
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-ink/10 p-3">
          <div className={label}>{isInstaller ? "Salinan IC * (gambar / PDF)" : "Sijil SSM * (gambar / PDF)"}</div>
          <div className="mt-2 flex items-center gap-2">
            <span className={`text-xs ${ssmDone ? "text-emerald-600" : "text-ink/40"}`}>{ssmDone ? "Dimuat naik ✓" : "Belum ada"}</span>
            <label className="ml-auto cursor-pointer rounded-lg border border-ink/15 px-3 py-1.5 text-xs hover:bg-paper">
              {uploading === "ssm" ? "Memuat naik…" : ssmDone ? "Ganti" : "Muat naik"}
              <input type="file" accept="image/*,application/pdf" className="hidden" disabled={uploading !== null} onChange={(e) => onDoc(e, "ssm")} />
            </label>
          </div>
        </div>
        <div className="rounded-lg border border-ink/10 p-3">
          <div className={label}>Bukti akaun bank * (penyata / gambar)</div>
          <div className="mt-2 flex items-center gap-2">
            <span className={`text-xs ${bankDone ? "text-emerald-600" : "text-ink/40"}`}>{bankDone ? "Dimuat naik ✓" : "Belum ada"}</span>
            <label className="ml-auto cursor-pointer rounded-lg border border-ink/15 px-3 py-1.5 text-xs hover:bg-paper">
              {uploading === "bank" ? "Memuat naik…" : bankDone ? "Ganti" : "Muat naik"}
              <input type="file" accept="image/*,application/pdf" className="hidden" disabled={uploading !== null} onChange={(e) => onDoc(e, "bank")} />
            </label>
          </div>
        </div>
      </div>

      {msg && <p className={`mt-4 rounded-lg px-3 py-2 text-sm ${msg.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{msg.text}</p>}
      <button onClick={save} disabled={pending || uploading !== null} className="btn-brass mt-4 text-sm disabled:opacity-60">
        {pending ? "Menyimpan…" : "Simpan Profil"}
      </button>
    </div>
  );
}
